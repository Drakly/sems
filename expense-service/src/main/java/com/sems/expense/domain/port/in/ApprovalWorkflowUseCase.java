package com.sems.expense.domain.port.in;

import com.sems.expense.domain.model.ApprovalStep;
import com.sems.expense.domain.model.ApprovalWorkflowStats;
import com.sems.expense.domain.model.Expense;

import java.util.List;
import java.util.UUID;

public interface ApprovalWorkflowUseCase {
    /**
     * Submit an expense for approval
     */
    Expense submitForApproval(UUID expenseId);
    
    /**
     * Approve an expense at the current approval level
     */
    Expense approveExpense(UUID expenseId, UUID approverId, String comments);
    
    /**
     * Reject an expense at any approval level
     */
    Expense rejectExpense(UUID expenseId, UUID rejecterId, String reason);
    
    /**
     * Request changes to an expense during approval
     */
    Expense requestChanges(UUID expenseId, UUID reviewerId, String changes);
    
    /**
     * Escalate an expense to a higher approval level
     */
    Expense escalateExpense(UUID expenseId, UUID escalatorId, String reason);
    
    /**
     * Delegate expense approval to another approver
     */
    Expense delegateApproval(UUID expenseId, UUID delegatorId, UUID delegateId, String reason);
    
    /**
     * Mark an expense as paid after final approval
     */
    Expense markAsPaid(UUID expenseId, UUID financePerson);
    
    /**
     * Get the approval history for an expense
     */
    List<ApprovalStep> getApprovalHistory(UUID expenseId);
    
    /**
     * Get all expenses pending approval for a specific approver
     */
    List<Expense> getPendingExpensesForApprover(UUID approverId);
    
    /**
     * Get count of pending approvals for each level
     */
    List<ApprovalWorkflowStats> getApprovalWorkflowStatistics();
    
    /**
     * Auto-approve expenses below a certain threshold
     */
    int processLowValueExpensesForAutoApproval();
} 