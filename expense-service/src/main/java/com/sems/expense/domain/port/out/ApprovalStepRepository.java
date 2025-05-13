package com.sems.expense.domain.port.out;

import com.sems.expense.domain.model.ApprovalStep;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApprovalStepRepository {
    ApprovalStep save(ApprovalStep approvalStep);
    Optional<ApprovalStep> findById(UUID id);
    void delete(ApprovalStep approvalStep);
    List<ApprovalStep> findAll();
    List<ApprovalStep> findByExpenseId(UUID expenseId);
    List<ApprovalStep> findByApproverId(UUID approverId);
    Optional<ApprovalStep> findLatestByExpenseId(UUID expenseId);
    List<ApprovalStep> findByExpenseIdAndLevel(UUID expenseId, Integer level);
    long countByExpenseIdAndLevel(UUID expenseId, Integer level);
} 