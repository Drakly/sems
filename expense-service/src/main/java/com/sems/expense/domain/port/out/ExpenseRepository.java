package com.sems.expense.domain.port.out;

import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository {
    Expense save(Expense expense);
    Optional<Expense> findById(UUID id);
    List<Expense> findAll();
    List<Expense> findBySubmittedBy(UUID userId);
    List<Expense> findByStatus(ExpenseStatus status);
    List<Expense> findByStatusAndSubmittedBy(ExpenseStatus status, UUID userId);
    List<Expense> findByDepartmentId(UUID departmentId);
    List<Expense> findByProjectId(UUID projectId);
    List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate);
    List<Expense> findByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate);
    void deleteById(UUID id);
    boolean existsById(UUID id);
} 