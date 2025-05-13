package com.sems.expense.domain.port.in;

import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseManagementUseCase {
    Expense createExpense(Expense expense);
    Expense updateExpense(UUID id, Expense expense);
    void deleteExpense(UUID id);
    Optional<Expense> getExpenseById(UUID id);
    List<Expense> getAllExpenses();
    List<Expense> getExpensesByUser(UUID userId);
    List<Expense> getExpensesByStatus(ExpenseStatus status);
    List<Expense> getExpensesByUserAndStatus(UUID userId, ExpenseStatus status);
    List<Expense> getExpensesByDepartment(UUID departmentId);
    List<Expense> getExpensesByProject(UUID projectId);
    List<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate);
    Expense submitExpense(UUID id);
    Expense approveExpense(UUID id, UUID approverId);
    Expense rejectExpense(UUID id, String reason);
    Expense markAsPaid(UUID id);
    Expense cancelExpense(UUID id);
} 