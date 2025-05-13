package com.sems.expense.adapter.out.persistence.repository;

import com.sems.expense.adapter.out.persistence.entity.ExpenseEntity;
import com.sems.expense.adapter.out.persistence.entity.ExpenseStatusEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaExpenseRepository extends JpaRepository<ExpenseEntity, UUID> {
    List<ExpenseEntity> findBySubmittedBy(UUID userId);
    List<ExpenseEntity> findByStatus(ExpenseStatusEntity status);
    List<ExpenseEntity> findByStatusAndSubmittedBy(ExpenseStatusEntity status, UUID userId);
    List<ExpenseEntity> findByDepartmentId(UUID departmentId);
    List<ExpenseEntity> findByProjectId(UUID projectId);
    List<ExpenseEntity> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    List<ExpenseEntity> findBySubmittedByAndExpenseDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM ExpenseEntity e WHERE e.currentApprovalLevel = :level AND e.status IN :statuses")
    List<ExpenseEntity> findByCurrentApprovalLevelAndStatusIn(@Param("level") Integer level, @Param("statuses") Collection<ExpenseStatusEntity> statuses);
    
    @Query("SELECT COUNT(e) FROM ExpenseEntity e WHERE e.currentApprovalLevel = :level AND e.status IN :statuses")
    long countByCurrentApprovalLevelAndStatusIn(@Param("level") Integer level, @Param("statuses") Collection<ExpenseStatusEntity> statuses);
    
    @Query("SELECT SUM(e.amount) FROM ExpenseEntity e WHERE e.currentApprovalLevel = :level AND e.status IN :statuses")
    BigDecimal sumAmountByCurrentApprovalLevelAndStatusIn(@Param("level") Integer level, @Param("statuses") Collection<ExpenseStatusEntity> statuses);
    
    List<ExpenseEntity> findByStatusAndAmountLessThanEqual(ExpenseStatusEntity status, BigDecimal amount);
} 