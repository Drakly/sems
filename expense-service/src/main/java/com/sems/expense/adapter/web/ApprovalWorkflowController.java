package com.sems.expense.adapter.web;

import com.sems.expense.adapter.web.dto.ApprovalActionRequest;
import com.sems.expense.adapter.web.dto.ApprovalHistoryResponse;
import com.sems.expense.adapter.web.dto.WorkflowStatsResponse;
import com.sems.expense.application.dto.ExpenseResponse;
import com.sems.expense.application.service.ApprovalWorkflowService;
import com.sems.expense.application.service.ExpenseMapper;
import com.sems.expense.domain.model.ApprovalStep;
import com.sems.expense.domain.model.ApprovalWorkflowStats;
import com.sems.expense.domain.model.Expense;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/expenses/workflow")
@Tag(name = "Expense Approval Workflow", description = "APIs for expense approval workflow management")
@RequiredArgsConstructor
public class ApprovalWorkflowController {

    private final ApprovalWorkflowService workflowService;
    private final ExpenseMapper expenseMapper;

    @PostMapping("/{expenseId}/submit")
    @Operation(summary = "Submit an expense for approval")
    public ResponseEntity<ExpenseResponse> submitForApproval(@PathVariable UUID expenseId) {
        log.info("Submitting expense {} for approval", expenseId);
        Expense submittedExpense = workflowService.submitForApproval(expenseId);
        return ResponseEntity.ok(expenseMapper.toResponse(submittedExpense));
    }

    @PostMapping("/{expenseId}/approve")
    @Operation(summary = "Approve an expense at the current level")
    public ResponseEntity<ExpenseResponse> approveExpense(
            @PathVariable UUID expenseId,
            @Valid @RequestBody ApprovalActionRequest request) {
        
        log.info("Approving expense {} by user {}", expenseId, request.getActorId());
        Expense approvedExpense = workflowService.approveExpense(
                expenseId,
                request.getActorId(),
                request.getComments()
        );
        
        return ResponseEntity.ok(expenseMapper.toResponse(approvedExpense));
    }

    @PostMapping("/{expenseId}/reject")
    @Operation(summary = "Reject an expense")
    public ResponseEntity<ExpenseResponse> rejectExpense(
            @PathVariable UUID expenseId,
            @Valid @RequestBody ApprovalActionRequest request) {
        
        log.info("Rejecting expense {} by user {}", expenseId, request.getActorId());
        Expense rejectedExpense = workflowService.rejectExpense(
                expenseId,
                request.getActorId(),
                request.getComments()
        );
        
        return ResponseEntity.ok(expenseMapper.toResponse(rejectedExpense));
    }

    @PostMapping("/{expenseId}/request-changes")
    @Operation(summary = "Request changes to an expense")
    public ResponseEntity<ExpenseResponse> requestChanges(
            @PathVariable UUID expenseId,
            @Valid @RequestBody ApprovalActionRequest request) {
        
        log.info("Requesting changes for expense {} by user {}", expenseId, request.getActorId());
        Expense updatedExpense = workflowService.requestChanges(
                expenseId,
                request.getActorId(),
                request.getComments()
        );
        
        return ResponseEntity.ok(expenseMapper.toResponse(updatedExpense));
    }

    @PostMapping("/{expenseId}/escalate")
    @Operation(summary = "Escalate an expense to higher level")
    public ResponseEntity<ExpenseResponse> escalateExpense(
            @PathVariable UUID expenseId,
            @Valid @RequestBody ApprovalActionRequest request) {
        
        log.info("Escalating expense {} by user {}", expenseId, request.getActorId());
        Expense escalatedExpense = workflowService.escalateExpense(
                expenseId,
                request.getActorId(),
                request.getComments()
        );
        
        return ResponseEntity.ok(expenseMapper.toResponse(escalatedExpense));
    }

    @PostMapping("/{expenseId}/delegate")
    @Operation(summary = "Delegate expense approval to another user")
    public ResponseEntity<ExpenseResponse> delegateApproval(
            @PathVariable UUID expenseId,
            @Valid @RequestBody ApprovalActionRequest request) {
        
        if (request.getDelegateId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        log.info("Delegating expense {} approval from user {} to user {}", 
                expenseId, request.getActorId(), request.getDelegateId());
        
        Expense delegatedExpense = workflowService.delegateApproval(
                expenseId,
                request.getActorId(),
                request.getDelegateId(),
                request.getComments()
        );
        
        return ResponseEntity.ok(expenseMapper.toResponse(delegatedExpense));
    }

    @PostMapping("/{expenseId}/mark-paid")
    @Operation(summary = "Mark an expense as paid")
    public ResponseEntity<ExpenseResponse> markAsPaid(
            @PathVariable UUID expenseId,
            @RequestParam UUID financePerson) {
        
        log.info("Marking expense {} as paid by finance person {}", expenseId, financePerson);
        Expense paidExpense = workflowService.markAsPaid(expenseId, financePerson);
        
        return ResponseEntity.ok(expenseMapper.toResponse(paidExpense));
    }

    @GetMapping("/{expenseId}/history")
    @Operation(summary = "Get expense approval history")
    public ResponseEntity<List<ApprovalHistoryResponse>> getApprovalHistory(@PathVariable UUID expenseId) {
        log.info("Getting approval history for expense {}", expenseId);
        List<ApprovalStep> approvalSteps = workflowService.getApprovalHistory(expenseId);
        
        List<ApprovalHistoryResponse> historyResponses = approvalSteps.stream()
                .map(step -> ApprovalHistoryResponse.builder()
                        .id(step.getId())
                        .expenseId(step.getExpenseId())
                        .approverId(step.getApproverId())
                        .approverName(step.getApproverName())
                        .approverRole(step.getApproverRole())
                        .level(step.getLevel())
                        .action(step.getAction().name())
                        .comments(step.getComments())
                        .actionDate(step.getActionDate())
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(historyResponses);
    }

    @GetMapping("/pending")
    @Operation(summary = "Get expenses pending approval for an approver")
    public ResponseEntity<List<ExpenseResponse>> getPendingExpenses(@RequestParam UUID approverId) {
        log.info("Getting pending expenses for approver {}", approverId);
        List<Expense> pendingExpenses = workflowService.getPendingExpensesForApprover(approverId);
        
        List<ExpenseResponse> responseList = pendingExpenses.stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/stats")
    @Operation(summary = "Get approval workflow statistics")
    public ResponseEntity<List<WorkflowStatsResponse>> getWorkflowStats() {
        log.info("Getting approval workflow statistics");
        List<ApprovalWorkflowStats> stats = workflowService.getApprovalWorkflowStatistics();
        
        List<WorkflowStatsResponse> response = stats.stream()
                .map(stat -> WorkflowStatsResponse.builder()
                        .approvalLevel(stat.getApprovalLevel())
                        .levelName(stat.getLevelName())
                        .pendingCount(stat.getPendingCount())
                        .approvedCount(stat.getApprovedCount())
                        .rejectedCount(stat.getRejectedCount())
                        .totalPendingAmount(stat.getTotalPendingAmount())
                        .averageProcessingTimeInHours(stat.getAverageProcessingTimeInHours())
                        .build())
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auto-approve/process")
    @ResponseStatus(HttpStatus.OK)
    @Operation(summary = "Process eligible expenses for auto-approval")
    public ResponseEntity<Integer> processAutoApprovals() {
        log.info("Processing auto-approvals for low value expenses");
        int count = workflowService.processLowValueExpensesForAutoApproval();
        
        return ResponseEntity.ok(count);
    }
} 