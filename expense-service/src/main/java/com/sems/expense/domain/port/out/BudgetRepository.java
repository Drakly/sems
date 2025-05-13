package com.sems.expense.domain.port.out;

import com.sems.expense.domain.model.Budget;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BudgetRepository {
    Budget save(Budget budget);
    Optional<Budget> findById(UUID id);
    void delete(Budget budget);
    List<Budget> findAll();
    List<Budget> findByActiveTrue();
    List<Budget> findByDepartmentId(UUID departmentId);
    List<Budget> findByProjectId(UUID projectId);
    List<Budget> findByDepartmentIdAndActiveTrue(UUID departmentId);
    List<Budget> findByProjectIdAndActiveTrue(UUID projectId);
    List<Budget> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date, LocalDate sameDate);
} 