package com.sems.expense.application.service;

import com.sems.expense.application.exception.ResourceNotFoundException;
import com.sems.expense.application.exception.WorkflowException;
import com.sems.expense.domain.model.*;
import com.sems.expense.domain.port.ExpenseRepository;
import com.sems.expense.domain.port.out.ApprovalLevelRepository;
import com.sems.expense.domain.port.out.ApprovalStepRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApprovalWorkflowServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private ApprovalLevelRepository approvalLevelRepository;

    @Mock
    private ApprovalStepRepository approvalStepRepository;

    @Mock
    private UserValidationService userValidationService;

    @InjectMocks
    private ApprovalWorkflowService workflowService;

    @Captor
    private ArgumentCaptor<Expense> expenseCaptor;

    @Captor
    private ArgumentCaptor<ApprovalStep> approvalStepCaptor;

    private UUID expenseId;
    private UUID userId;
    private UUID approverId;
    private UUID departmentId;
    private Expense testExpense;
    private ApprovalLevel level1;
    private ApprovalLevel level2;

    @BeforeEach
    void setUp() {
        expenseId = UUID.randomUUID();
        userId = UUID.randomUUID();
        approverId = UUID.randomUUID();
        departmentId = UUID.randomUUID();

        // Create test expense
        testExpense = Expense.builder()
                .id(expenseId)
                .userId(userId)
                .departmentId(departmentId)
                .title("Test Expense")
                .amount(new BigDecimal("500.00"))
                .status(ExpenseStatus.DRAFT)
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Create approval levels
        level1 = ApprovalLevel.builder()
                .id(UUID.randomUUID())
                .level(1)
                .name("Manager Approval")
                .description("First level approval by department manager")
                .minAmountThreshold(BigDecimal.ZERO)
                .maxAmountThreshold(new BigDecimal("1000.00"))
                .roleId(UUID.fromString("11111111-1111-1111-1111-111111111111")) // MANAGER role
                .isActive(true)
                .build();

        level2 = ApprovalLevel.builder()
                .id(UUID.randomUUID())
                .level(2)
                .name("Finance Approval")
                .description("Second level approval by finance department")
                .minAmountThreshold(BigDecimal.ZERO)
                .maxAmountThreshold(new BigDecimal("5000.00"))
                .roleId(UUID.fromString("22222222-2222-2222-2222-222222222222")) // FINANCE role
                .isActive(true)
                .build();
    }

    @Test
    void submitForApproval_ShouldSetStatusToSubmitted() {
        // Given
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(Collections.singletonList(level1));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Expense result = workflowService.submitForApproval(expenseId);

        // Then
        assertEquals(ExpenseStatus.SUBMITTED, result.getStatus());
        assertEquals(level1.getLevel(), result.getCurrentApprovalLevel());
        verify(expenseRepository).save(expenseCaptor.capture());
        assertNotNull(expenseCaptor.getValue().getUpdatedAt());
    }

    @Test
    void submitForApproval_WithLowValueExpense_ShouldAutoApprove() {
        // Given
        testExpense.setAmount(new BigDecimal("49.99")); // Below auto-approval threshold
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(Collections.singletonList(level1));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Expense result = workflowService.submitForApproval(expenseId);

        // Then
        assertEquals(ExpenseStatus.APPROVED, result.getStatus());
        assertNotNull(result.getApprovedAt());
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.APPROVED, approvalStepCaptor.getValue().getAction());
    }

    @Test
    void submitForApproval_WithInvalidStatus_ShouldThrowException() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED); // Already submitted
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));

        // When/Then
        WorkflowException exception = assertThrows(WorkflowException.class, () -> {
            workflowService.submitForApproval(expenseId);
        });
        
        assertTrue(exception.getMessage().contains("Only expenses in DRAFT status"));
    }

    @Test
    void submitForApproval_WithMissingData_ShouldThrowException() {
        // Given
        testExpense.setCategory(null); // Missing category
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));

        // When/Then
        WorkflowException exception = assertThrows(WorkflowException.class, () -> {
            workflowService.submitForApproval(expenseId);
        });
        
        assertTrue(exception.getMessage().contains("must have a category"));
    }

    @Test
    void approveExpense_FirstLevel_ShouldMoveToNextLevel() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);
        
        List<ApprovalLevel> levels = Arrays.asList(level1, level2);
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(levels);
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Expense result = workflowService.approveExpense(expenseId, approverId, "Approved");

        // Then
        assertEquals(ExpenseStatus.UNDER_REVIEW, result.getStatus());
        assertEquals(2, result.getCurrentApprovalLevel());
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.APPROVED, approvalStepCaptor.getValue().getAction());
        assertEquals(approverId, approvalStepCaptor.getValue().getApproverId());
    }

    @Test
    void approveExpense_FinalLevel_ShouldSetApproved() {
        // Given
        testExpense.setStatus(ExpenseStatus.UNDER_REVIEW);
        testExpense.setCurrentApprovalLevel(2); // Final level
        
        List<ApprovalLevel> levels = Arrays.asList(level1, level2);
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(levels);
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Expense result = workflowService.approveExpense(expenseId, approverId, "Final approval");

        // Then
        assertEquals(ExpenseStatus.APPROVED, result.getStatus());
        assertNotNull(result.getApprovedAt());
        assertEquals(approverId, result.getApprovedBy());
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.APPROVED, approvalStepCaptor.getValue().getAction());
    }

    @Test
    void rejectExpense_ShouldSetRejectedStatusAndReason() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        String rejectionReason = "Missing receipts";
        
        // When
        Expense result = workflowService.rejectExpense(expenseId, approverId, rejectionReason);

        // Then
        assertEquals(ExpenseStatus.REJECTED, result.getStatus());
        assertEquals(rejectionReason, result.getRejectionReason());
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.REJECTED, approvalStepCaptor.getValue().getAction());
    }

    @Test
    void requestChanges_ShouldSetChangesRequestedStatus() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        String changes = "Please add detailed breakdown of expenses";
        
        // When
        Expense result = workflowService.requestChanges(expenseId, approverId, changes);

        // Then
        assertEquals(ExpenseStatus.CHANGES_REQUESTED, result.getStatus());
        assertEquals(changes, result.getReviewComments());
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.REQUESTED_CHANGES, approvalStepCaptor.getValue().getAction());
    }

    @Test
    void escalateExpense_ShouldMoveToHighestLevel() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);
        
        List<ApprovalLevel> levels = Arrays.asList(level1, level2);
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(levels);
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Expense result = workflowService.escalateExpense(expenseId, approverId, "Needs executive review");

        // Then
        assertEquals(ExpenseStatus.UNDER_REVIEW, result.getStatus());
        assertEquals(2, result.getCurrentApprovalLevel()); // Moved to highest level
        assertTrue(result.isFlaggedForReview());
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.ESCALATED, approvalStepCaptor.getValue().getAction());
    }

    @Test
    void delegateApproval_ShouldRecordDelegation() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);
        
        UUID delegateId = UUID.randomUUID();
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(userValidationService.validateUserExists(delegateId)).thenReturn(true);
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        Expense result = workflowService.delegateApproval(expenseId, approverId, delegateId, "I'm on vacation");

        // Then
        assertEquals(ExpenseStatus.SUBMITTED, result.getStatus()); // Status doesn't change
        verify(approvalStepRepository).save(approvalStepCaptor.capture());
        assertEquals(ApprovalStep.ApprovalAction.DELEGATED, approvalStepCaptor.getValue().getAction());
        assertTrue(approvalStepCaptor.getValue().getComments().contains(delegateId.toString()));
    }

    @Test
    void markAsPaid_ShouldSetPaidStatus() {
        // Given
        testExpense.setStatus(ExpenseStatus.APPROVED);
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        UUID financePersonId = UUID.randomUUID();
        
        // When
        Expense result = workflowService.markAsPaid(expenseId, financePersonId);

        // Then
        assertEquals(ExpenseStatus.PAID, result.getStatus());
    }

    @Test
    void markAsPaid_WithInvalidStatus_ShouldThrowException() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED); // Not approved yet
        
        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        
        UUID financePersonId = UUID.randomUUID();
        
        // When/Then
        WorkflowException exception = assertThrows(WorkflowException.class, () -> {
            workflowService.markAsPaid(expenseId, financePersonId);
        });
        
        assertTrue(exception.getMessage().contains("Only approved expenses"));
    }

    @Test
    void getApprovalHistory_ShouldReturnHistoryFromRepository() {
        // Given
        ApprovalStep step1 = ApprovalStep.builder()
                .id(UUID.randomUUID())
                .expenseId(expenseId)
                .level(1)
                .approverId(approverId)
                .action(ApprovalStep.ApprovalAction.APPROVED)
                .actionDate(LocalDateTime.now().minusDays(1))
                .build();
        
        when(expenseRepository.existsById(expenseId)).thenReturn(true);
        when(approvalStepRepository.findByExpenseId(expenseId)).thenReturn(Collections.singletonList(step1));
        
        // When
        List<ApprovalStep> result = workflowService.getApprovalHistory(expenseId);

        // Then
        assertEquals(1, result.size());
        assertEquals(step1.getId(), result.get(0).getId());
    }

    @Test
    void getApprovalHistory_WithNonExistentExpense_ShouldThrowException() {
        // Given
        when(expenseRepository.existsById(expenseId)).thenReturn(false);
        
        // When/Then
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            workflowService.getApprovalHistory(expenseId);
        });
        
        assertTrue(exception.getMessage().contains("Expense not found"));
    }

    @Test
    void getPendingExpensesForApprover_ShouldReturnExpensesForApproval() {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);
        
        when(userValidationService.validateUserExists(approverId)).thenReturn(true);
        when(approvalLevelRepository.findByRoleId(any(UUID.class))).thenReturn(Collections.singletonList(level1));
        when(expenseRepository.findByCurrentApprovalLevelAndStatusIn(eq(1), anyList()))
                .thenReturn(Collections.singletonList(testExpense));
        
        // When
        List<Expense> result = workflowService.getPendingExpensesForApprover(approverId);

        // Then
        assertEquals(1, result.size());
        assertEquals(expenseId, result.get(0).getId());
    }

    @Test
    void processLowValueExpensesForAutoApproval_ShouldAutoApproveEligibleExpenses() {
        // Given
        Expense lowValueExpense1 = Expense.builder()
                .id(UUID.randomUUID())
                .status(ExpenseStatus.SUBMITTED)
                .amount(new BigDecimal("45.00"))
                .currentApprovalLevel(1)
                .build();
        
        Expense lowValueExpense2 = Expense.builder()
                .id(UUID.randomUUID())
                .status(ExpenseStatus.SUBMITTED)
                .amount(new BigDecimal("25.00"))
                .currentApprovalLevel(1)
                .requiresReceipt(true) // Requires receipt but has none, should not be auto-approved
                .build();
        
        List<Expense> lowValueExpenses = Arrays.asList(lowValueExpense1, lowValueExpense2);
        
        when(expenseRepository.findByStatusAndAmountLessThanEqual(
                eq(ExpenseStatus.SUBMITTED), 
                any(BigDecimal.class)
        )).thenReturn(lowValueExpenses);
        
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        int count = workflowService.processLowValueExpensesForAutoApproval();

        // Then
        assertEquals(1, count); // Only one expense should be auto-approved
        verify(expenseRepository, times(1)).save(any(Expense.class));
        verify(approvalStepRepository, times(1)).save(any(ApprovalStep.class));
    }
} 