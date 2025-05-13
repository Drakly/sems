package com.sems.expense.adapter.web;

import com.sems.expense.adapter.web.dto.BudgetCreateRequest;
import com.sems.expense.adapter.web.dto.BudgetResponse;
import com.sems.expense.adapter.web.dto.BudgetUpdateRequest;
import com.sems.expense.application.service.BudgetService;
import com.sems.expense.domain.model.Budget;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class BudgetMapper {

    private final BudgetService budgetService;
    
    public BudgetMapper(BudgetService budgetService) {
        this.budgetService = budgetService;
    }
    
    public Budget toBudgetEntity(BudgetCreateRequest request) {
        return Budget.builder()
                .id(UUID.randomUUID())
                .name(request.getName())
                .userId(request.getUserId())
                .amount(request.getAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .categoryIds(request.getCategoryIds())
                .departmentId(request.getDepartmentId())
                .projectId(request.getProjectId())
                .active(request.getActive())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    public Budget toBudgetEntity(BudgetUpdateRequest request) {
        return Budget.builder()
                .name(request.getName())
                .amount(request.getAmount())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .categoryIds(request.getCategoryIds())
                .departmentId(request.getDepartmentId())
                .projectId(request.getProjectId())
                .active(request.getActive() != null ? request.getActive() : true)
                .updatedAt(LocalDateTime.now())
                .build();
    }
    
    public BudgetResponse toBudgetResponse(Budget budget) {
        BigDecimal utilizationPercentage = budgetService.calculateBudgetUtilization(budget);
        BigDecimal spentAmount = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
        BigDecimal remainingAmount = budget.getAmount().subtract(spentAmount);
        
        return BudgetResponse.builder()
                .id(budget.getId())
                .name(budget.getName())
                .userId(budget.getUserId())
                .amount(budget.getAmount())
                .spentAmount(spentAmount)
                .remainingAmount(remainingAmount)
                .startDate(budget.getStartDate())
                .endDate(budget.getEndDate())
                .categoryIds(budget.getCategoryIds())
                .departmentId(budget.getDepartmentId())
                .projectId(budget.getProjectId())
                .active(budget.isActive())
                .createdAt(budget.getCreatedAt())
                .updatedAt(budget.getUpdatedAt())
                .utilizationPercentage(utilizationPercentage)
                .build();
    }
} 