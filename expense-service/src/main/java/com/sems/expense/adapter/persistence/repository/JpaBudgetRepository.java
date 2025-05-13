package com.sems.expense.adapter.persistence.repository;

import com.sems.expense.adapter.out.persistence.entity.BudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface JpaBudgetRepository extends JpaRepository<BudgetEntity, UUID> {
    
    List<BudgetEntity> findByActiveTrue();
    
    List<BudgetEntity> findByDepartmentId(UUID departmentId);
    
    List<BudgetEntity> findByProjectId(UUID projectId);
    
    List<BudgetEntity> findByDepartmentIdAndActiveTrue(UUID departmentId);
    
    List<BudgetEntity> findByProjectIdAndActiveTrue(UUID projectId);
    
    List<BudgetEntity> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date, LocalDate sameDate);
} 