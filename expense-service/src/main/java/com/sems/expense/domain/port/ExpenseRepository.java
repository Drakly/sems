package com.sems.expense.domain.port;

import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository {
    Expense save(Expense expense);
    Optional<Expense> findById(UUID id);
    List<Expense> findByUserId(UUID userId);
    List<Expense> findByUserIdAndStatus(UUID userId, ExpenseStatus status);
    List<Expense> findByStatus(ExpenseStatus status);
    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    List<Expense> findByUserIdAndExpenseDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
    List<Expense> findAll();
    void deleteById(UUID id);
    
    // Added methods for workflow
    boolean existsById(UUID id);
    List<Expense> findAllById(Collection<UUID> ids);
    List<Expense> findByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses);
    long countByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses);
    BigDecimal sumAmountByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses);
    List<Expense> findByStatusAndAmountLessThanEqual(ExpenseStatus status, BigDecimal amount);
} 