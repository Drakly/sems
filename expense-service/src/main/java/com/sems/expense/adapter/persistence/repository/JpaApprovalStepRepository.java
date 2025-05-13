package com.sems.expense.adapter.persistence.repository;

import com.sems.expense.adapter.persistence.entity.ApprovalStepEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaApprovalStepRepository extends JpaRepository<ApprovalStepEntity, UUID> {
    
    List<ApprovalStepEntity> findByExpenseId(UUID expenseId);
    
    List<ApprovalStepEntity> findByApproverId(UUID approverId);
    
    @Query("SELECT s FROM ApprovalStepEntity s WHERE s.expenseId = :expenseId ORDER BY s.actionDate DESC")
    List<ApprovalStepEntity> findByExpenseIdOrderByActionDateDesc(@Param("expenseId") UUID expenseId);
    
    default Optional<ApprovalStepEntity> findLatestByExpenseId(UUID expenseId) {
        List<ApprovalStepEntity> steps = findByExpenseIdOrderByActionDateDesc(expenseId);
        return steps.isEmpty() ? Optional.empty() : Optional.of(steps.get(0));
    }
    
    List<ApprovalStepEntity> findByExpenseIdAndLevel(UUID expenseId, Integer level);
    
    long countByExpenseIdAndLevel(UUID expenseId, Integer level);
} 