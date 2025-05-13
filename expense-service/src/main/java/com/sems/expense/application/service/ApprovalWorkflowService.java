package com.sems.expense.application.service;

import com.sems.expense.domain.model.*;
import com.sems.expense.domain.port.ExpenseRepository;
import com.sems.expense.domain.port.in.ApprovalWorkflowUseCase;
import com.sems.expense.domain.port.out.ApprovalLevelRepository;
import com.sems.expense.domain.port.out.ApprovalStepRepository;
import com.sems.expense.application.exception.ResourceNotFoundException;
import com.sems.expense.application.exception.WorkflowException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalWorkflowService implements ApprovalWorkflowUseCase {

    private final ExpenseRepository expenseRepository;
    private final ApprovalLevelRepository approvalLevelRepository;
    private final ApprovalStepRepository approvalStepRepository;
    private final UserValidationService userValidationService;
    
    // Configuration property for auto-approval threshold
    private static final BigDecimal AUTO_APPROVAL_THRESHOLD = new BigDecimal("50.00");

    @Override
    @Transactional
    public Expense submitForApproval(UUID expenseId) {
        Expense expense = getExpenseById(expenseId);
        
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new WorkflowException("Only expenses in DRAFT status can be submitted for approval");
        }
        
        // Validate expense has all required data before submission
        validateExpenseForSubmission(expense);
        
        // Determine initial approval level based on expense amount and department
        List<ApprovalLevel> applicableLevels = determineApprovalLevels(expense);
        
        if (applicableLevels.isEmpty()) {
            throw new WorkflowException("No approval workflow defined for this expense amount and department");
        }
        
        // Set expense to submitted status and update approval level
        expense.setStatus(ExpenseStatus.SUBMITTED);
        expense.setCurrentApprovalLevel(applicableLevels.get(0).getLevel());
        expense.setUpdatedAt(LocalDateTime.now());
        
        // Check if it's eligible for auto-approval
        if (isEligibleForAutoApproval(expense)) {
            expense.setStatus(ExpenseStatus.APPROVED);
            expense.setApprovedAt(LocalDateTime.now());
            
            // Create auto-approval step
            createApprovalStep(
                expense.getId(),
                null, // No approver for auto-approval
                "Auto-approved based on amount threshold",
                expense.getCurrentApprovalLevel(),
                ApprovalStep.ApprovalAction.APPROVED
            );
            
            log.info("Expense {} was auto-approved", expenseId);
        }
        
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public Expense approveExpense(UUID expenseId, UUID approverId, String comments) {
        Expense expense = getExpenseById(expenseId);
        validateUserCanApprove(approverId, expense);
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && 
            expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new WorkflowException("Expense must be in SUBMITTED or UNDER_REVIEW status to be approved");
        }
        
        // Get current approval level
        Integer currentLevel = expense.getCurrentApprovalLevel();
        if (currentLevel == null) {
            throw new WorkflowException("Expense has no approval level assigned");
        }
        
        // Create approval step record
        createApprovalStep(
            expenseId,
            approverId,
            comments,
            currentLevel,
            ApprovalStep.ApprovalAction.APPROVED
        );
        
        // Check if we need to move to next approval level
        List<ApprovalLevel> levels = approvalLevelRepository.findByAmountBetweenThresholds(expense.getAmount())
            .stream()
            .filter(ApprovalLevel::isActive)
            .sorted(Comparator.comparing(ApprovalLevel::getLevel))
            .collect(Collectors.toList());
        
        // Find current level in the sorted list
        int currentLevelIndex = -1;
        for (int i = 0; i < levels.size(); i++) {
            if (levels.get(i).getLevel().equals(currentLevel)) {
                currentLevelIndex = i;
                break;
            }
        }
        
        // No more approval levels, set to final approved
        if (currentLevelIndex == levels.size() - 1) {
            expense.setStatus(ExpenseStatus.APPROVED);
            expense.setApprovedAt(LocalDateTime.now());
            expense.setApprovedBy(approverId);
        } 
        // Move to the next level
        else if (currentLevelIndex >= 0 && currentLevelIndex < levels.size() - 1) {
            Integer nextLevel = levels.get(currentLevelIndex + 1).getLevel();
            expense.setCurrentApprovalLevel(nextLevel);
            
            // Keep under review status for next level
            expense.setStatus(ExpenseStatus.UNDER_REVIEW);
        }
        
        expense.setUpdatedAt(LocalDateTime.now());
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public Expense rejectExpense(UUID expenseId, UUID rejecterId, String reason) {
        Expense expense = getExpenseById(expenseId);
        validateUserCanApprove(rejecterId, expense);
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && 
            expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new WorkflowException("Expense must be in an approval status to be rejected");
        }
        
        // Create rejection step
        createApprovalStep(
            expenseId,
            rejecterId,
            reason,
            expense.getCurrentApprovalLevel(),
            ApprovalStep.ApprovalAction.REJECTED
        );
        
        // Update expense
        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setRejectionReason(reason);
        expense.setUpdatedAt(LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public Expense requestChanges(UUID expenseId, UUID reviewerId, String changes) {
        Expense expense = getExpenseById(expenseId);
        validateUserCanApprove(reviewerId, expense);
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && 
            expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new WorkflowException("Expense must be in SUBMITTED or UNDER_REVIEW status to request changes");
        }
        
        // Create change request step
        createApprovalStep(
            expenseId,
            reviewerId,
            changes,
            expense.getCurrentApprovalLevel(),
            ApprovalStep.ApprovalAction.REQUESTED_CHANGES
        );
        
        // Update expense
        expense.setStatus(ExpenseStatus.CHANGES_REQUESTED);
        expense.setReviewComments(changes);
        expense.setUpdatedAt(LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public Expense escalateExpense(UUID expenseId, UUID escalatorId, String reason) {
        Expense expense = getExpenseById(expenseId);
        validateUserCanApprove(escalatorId, expense);
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && 
            expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new WorkflowException("Expense must be in SUBMITTED or UNDER_REVIEW status to be escalated");
        }
        
        // Find all applicable levels
        List<ApprovalLevel> levels = approvalLevelRepository.findByAmountBetweenThresholds(expense.getAmount())
            .stream()
            .filter(ApprovalLevel::isActive)
            .sorted(Comparator.comparing(ApprovalLevel::getLevel))
            .collect(Collectors.toList());
        
        // Find the highest level
        if (levels.isEmpty()) {
            throw new WorkflowException("No approval levels defined");
        }
        
        ApprovalLevel highestLevel = levels.get(levels.size() - 1);
        
        // Create escalation step
        createApprovalStep(
            expenseId,
            escalatorId,
            reason,
            expense.getCurrentApprovalLevel(),
            ApprovalStep.ApprovalAction.ESCALATED
        );
        
        // Update expense to the highest approval level
        expense.setCurrentApprovalLevel(highestLevel.getLevel());
        expense.setStatus(ExpenseStatus.UNDER_REVIEW);
        expense.setFlaggedForReview(true);
        expense.setReviewComments(reason);
        expense.setUpdatedAt(LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public Expense delegateApproval(UUID expenseId, UUID delegatorId, UUID delegateId, String reason) {
        Expense expense = getExpenseById(expenseId);
        validateUserCanApprove(delegatorId, expense);
        
        // Validate the delegate user exists
        if (!userValidationService.validateUserExists(delegateId)) {
            throw new ResourceNotFoundException("Delegate user not found");
        }
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && 
            expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new WorkflowException("Expense must be in SUBMITTED or UNDER_REVIEW status to delegate approval");
        }
        
        // Create delegation step
        createApprovalStep(
            expenseId,
            delegatorId,
            "Delegated to " + delegateId + ": " + reason,
            expense.getCurrentApprovalLevel(),
            ApprovalStep.ApprovalAction.DELEGATED
        );
        
        // No need to change expense status, just record the delegation
        expense.setUpdatedAt(LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional
    public Expense markAsPaid(UUID expenseId, UUID financePerson) {
        Expense expense = getExpenseById(expenseId);
        
        if (expense.getStatus() != ExpenseStatus.APPROVED) {
            throw new WorkflowException("Only approved expenses can be marked as paid");
        }
        
        // Update expense
        expense.setStatus(ExpenseStatus.PAID);
        expense.setUpdatedAt(LocalDateTime.now());
        
        return expenseRepository.save(expense);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalStep> getApprovalHistory(UUID expenseId) {
        // Check if expense exists
        if (!expenseRepository.existsById(expenseId)) {
            throw new ResourceNotFoundException("Expense not found with id: " + expenseId);
        }
        
        return approvalStepRepository.findByExpenseId(expenseId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Expense> getPendingExpensesForApprover(UUID approverId) {
        // Validate approver exists
        if (!userValidationService.validateUserExists(approverId)) {
            throw new ResourceNotFoundException("Approver not found with id: " + approverId);
        }
        
        // Get the roles of the approver to determine which expenses they can approve
        Set<UUID> approverRoles = getUserRoles(approverId);
        
        // Find levels this approver can approve
        List<ApprovalLevel> approverLevels = approvalLevelRepository.findAll().stream()
            .filter(level -> level.isActive() && approverRoles.contains(level.getRoleId()))
            .collect(Collectors.toList());
        
        if (approverLevels.isEmpty()) {
            return Collections.emptyList();
        }
        
        // Get all the level numbers this approver can approve
        Set<Integer> approverLevelNumbers = approverLevels.stream()
            .map(ApprovalLevel::getLevel)
            .collect(Collectors.toSet());
        
        // Get expenses pending at these levels
        Collection<ExpenseStatus> pendingStatuses = Arrays.asList(ExpenseStatus.SUBMITTED, ExpenseStatus.UNDER_REVIEW);
        
        List<Expense> pendingExpenses = new ArrayList<>();
        
        for (Integer level : approverLevelNumbers) {
            List<Expense> levelExpenses = expenseRepository.findByCurrentApprovalLevelAndStatusIn(level, pendingStatuses);
            pendingExpenses.addAll(levelExpenses);
        }
        
        return pendingExpenses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ApprovalWorkflowStats> getApprovalWorkflowStatistics() {
        // Get all active approval levels
        List<ApprovalLevel> levels = approvalLevelRepository.findByActive(true);
        
        List<ApprovalWorkflowStats> stats = new ArrayList<>();
        
        for (ApprovalLevel level : levels) {
            ApprovalWorkflowStats levelStats = ApprovalWorkflowStats.builder()
                .approvalLevel(level.getLevel())
                .levelName(level.getName())
                .build();
            
            // Count expenses by status at this level
            long pendingCount = expenseRepository.countByCurrentApprovalLevelAndStatusIn(
                level.getLevel(),
                Arrays.asList(
                    ExpenseStatus.SUBMITTED,
                    ExpenseStatus.UNDER_REVIEW
                )
            );
            levelStats.setPendingCount(pendingCount);
            
            // Get sum of pending amounts
            BigDecimal totalPendingAmount = expenseRepository.sumAmountByCurrentApprovalLevelAndStatusIn(
                level.getLevel(),
                Arrays.asList(
                    ExpenseStatus.SUBMITTED,
                    ExpenseStatus.UNDER_REVIEW
                )
            );
            levelStats.setTotalPendingAmount(totalPendingAmount != null ? totalPendingAmount : BigDecimal.ZERO);
            
            // Calculate average processing time for this level
            List<ApprovalStep> approvedSteps = approvalStepRepository.findByExpenseIdAndLevel(null, level.getLevel())
                .stream()
                .filter(step -> step.getAction() == ApprovalStep.ApprovalAction.APPROVED)
                .collect(Collectors.toList());
            
            if (!approvedSteps.isEmpty()) {
                // Get all expenses with completed approval at this level
                Set<UUID> expenseIds = approvedSteps.stream()
                    .map(ApprovalStep::getExpenseId)
                    .collect(Collectors.toSet());
                
                List<Expense> completedExpenses = expenseRepository.findAllById(new ArrayList<>(expenseIds));
                
                // Calculate average time between submission and approval
                BigDecimal totalHours = BigDecimal.ZERO;
                int count = 0;
                
                for (Expense expense : completedExpenses) {
                    List<ApprovalStep> steps = approvalStepRepository.findByExpenseId(expense.getId());
                    
                    Optional<ApprovalStep> submissionStep = steps.stream()
                        .min(Comparator.comparing(ApprovalStep::getActionDate));
                    
                    Optional<ApprovalStep> approvalStep = steps.stream()
                        .filter(step -> step.getLevel().equals(level.getLevel()) && 
                            step.getAction() == ApprovalStep.ApprovalAction.APPROVED)
                        .findFirst();
                    
                    if (submissionStep.isPresent() && approvalStep.isPresent()) {
                        Duration duration = Duration.between(
                            submissionStep.get().getActionDate(), 
                            approvalStep.get().getActionDate());
                        
                        totalHours = totalHours.add(
                            BigDecimal.valueOf(duration.toSeconds())
                                .divide(BigDecimal.valueOf(3600), 2, RoundingMode.HALF_UP)
                        );
                        count++;
                    }
                }
                
                if (count > 0) {
                    BigDecimal averageHours = totalHours.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
                    levelStats.setAverageProcessingTimeInHours(averageHours);
                }
            }
            
            stats.add(levelStats);
        }
        
        return stats;
    }

    @Override
    @Transactional
    public int processLowValueExpensesForAutoApproval() {
        int count = 0;
        List<Expense> lowValueExpenses = expenseRepository.findByStatusAndAmountLessThanEqual(
            ExpenseStatus.SUBMITTED, 
            AUTO_APPROVAL_THRESHOLD
        );
        
        for (Expense expense : lowValueExpenses) {
            if (isEligibleForAutoApproval(expense)) {
                expense.setStatus(ExpenseStatus.APPROVED);
                expense.setApprovedAt(LocalDateTime.now());
                expense.setUpdatedAt(LocalDateTime.now());
                
                // Create auto-approval step
                createApprovalStep(
                    expense.getId(),
                    null,
                    "Auto-approved based on amount threshold",
                    expense.getCurrentApprovalLevel(),
                    ApprovalStep.ApprovalAction.APPROVED
                );
                
                expenseRepository.save(expense);
                count++;
            }
        }
        
        return count;
    }
    
    // Helper methods
    
    private Expense getExpenseById(UUID expenseId) {
        return expenseRepository.findById(expenseId)
            .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + expenseId));
    }
    
    private void validateExpenseForSubmission(Expense expense) {
        if (expense.getUserId() == null) {
            throw new WorkflowException("Expense must have a user assigned");
        }
        
        if (expense.getAmount() == null || expense.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new WorkflowException("Expense must have a valid amount");
        }
        
        if (expense.getCategory() == null) {
            throw new WorkflowException("Expense must have a category assigned");
        }
        
        if (expense.getExpenseDate() == null) {
            throw new WorkflowException("Expense must have a date");
        }
        
        // Check if receipt is required but missing
        if (expense.isRequiresReceipt() && (expense.getReceiptUrl() == null || expense.getReceiptUrl().isEmpty())) {
            throw new WorkflowException("This expense requires a receipt");
        }
    }
    
    private List<ApprovalLevel> determineApprovalLevels(Expense expense) {
        BigDecimal amount = expense.getAmount();
        UUID departmentId = expense.getDepartmentId();
        
        List<ApprovalLevel> allLevels = approvalLevelRepository.findByAmountBetweenThresholds(amount);
        
        // First filter by department if available
        if (departmentId != null) {
            List<ApprovalLevel> departmentLevels = allLevels.stream()
                .filter(level -> departmentId.equals(level.getDepartmentId()))
                .filter(ApprovalLevel::isActive)
                .sorted(Comparator.comparing(ApprovalLevel::getLevel))
                .collect(Collectors.toList());
            
            if (!departmentLevels.isEmpty()) {
                return departmentLevels;
            }
        }
        
        // If no department-specific levels, use general levels
        return allLevels.stream()
            .filter(level -> level.getDepartmentId() == null)
            .filter(ApprovalLevel::isActive)
            .sorted(Comparator.comparing(ApprovalLevel::getLevel))
            .collect(Collectors.toList());
    }
    
    private boolean isEligibleForAutoApproval(Expense expense) {
        // Auto-approve only for small amounts and with receipts if required
        return expense.getAmount().compareTo(AUTO_APPROVAL_THRESHOLD) <= 0 &&
               (!expense.isRequiresReceipt() || 
                (expense.getReceiptUrl() != null && !expense.getReceiptUrl().isEmpty()));
    }
    
    private ApprovalStep createApprovalStep(
        UUID expenseId, 
        UUID approverId, 
        String comments, 
        Integer level,
        ApprovalStep.ApprovalAction action
    ) {
        ApprovalStep step = ApprovalStep.builder()
            .id(UUID.randomUUID())
            .expenseId(expenseId)
            .approverId(approverId)
            .level(level)
            .action(action)
            .comments(comments)
            .actionDate(LocalDateTime.now())
            .build();
        
        return approvalStepRepository.save(step);
    }
    
    private void validateUserCanApprove(UUID approverId, Expense expense) {
        // Check if user exists
        if (!userValidationService.validateUserExists(approverId)) {
            throw new ResourceNotFoundException("Approver not found with id: " + approverId);
        }
        
        // Get the role IDs for this user
        Set<UUID> userRoleIds = getUserRoles(approverId);
        
        // Get all approval levels for the current expense level and check if user's role is included
        Optional<ApprovalLevel> currentLevel = approvalLevelRepository.findByLevelAndDepartmentId(
            expense.getCurrentApprovalLevel(),
            expense.getDepartmentId()
        );
        
        if (currentLevel.isPresent() && !userRoleIds.contains(currentLevel.get().getRoleId())) {
            throw new WorkflowException("User is not authorized to approve this expense at the current level");
        }
    }
    
    private Set<UUID> getUserRoles(UUID userId) {
        // This would typically call a user/identity service to get roles
        // For now, we'll simulate by returning a mocked set
        // In a real implementation, this would use a user service client
        Set<UUID> roles = new HashSet<>();
        roles.add(UUID.fromString("11111111-1111-1111-1111-111111111111")); // MANAGER
        roles.add(UUID.fromString("22222222-2222-2222-2222-222222222222")); // FINANCE
        
        return roles;
    }
} 