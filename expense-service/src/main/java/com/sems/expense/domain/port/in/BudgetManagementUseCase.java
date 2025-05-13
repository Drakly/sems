package com.sems.expense.domain.port.in;

import com.sems.expense.domain.model.Budget;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetManagementUseCase {
    Budget createBudget(Budget budget);
    Budget updateBudget(UUID id, Budget budget);
    void deleteBudget(UUID id);
    Optional<Budget> getBudgetById(UUID id);
    List<Budget> getAllBudgets();
    List<Budget> getActiveBudgets();
    List<Budget> getBudgetsByDepartment(UUID departmentId);
    List<Budget> getBudgetsByProject(UUID projectId);
    List<Budget> getActiveBudgetsByDepartment(UUID departmentId);
    List<Budget> getActiveBudgetsByProject(UUID projectId);
    List<Budget> getBudgetsForDate(LocalDate date);
    Budget updateBudgetAmount(UUID id, BigDecimal newAmount);
    Budget activateBudget(UUID id);
    Budget deactivateBudget(UUID id);
    Budget allocateExpenseToBudget(UUID budgetId, BigDecimal amount);
} 