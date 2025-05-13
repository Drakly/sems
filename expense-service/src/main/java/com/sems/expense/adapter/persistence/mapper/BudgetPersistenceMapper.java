package com.sems.expense.adapter.persistence.mapper;

import com.sems.expense.adapter.out.persistence.entity.BudgetEntity;
import com.sems.expense.domain.model.Budget;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class BudgetPersistenceMapper {

    public BudgetEntity toEntity(Budget domain) {
        if (domain == null) {
            return null;
        }
        
        return BudgetEntity.builder()
                .id(domain.getId())
                .name(domain.getName())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .spent(domain.getSpentAmount())
                .remaining(domain.getAmount().subtract(domain.getSpentAmount() != null ? domain.getSpentAmount() : domain.getAmount()))
                .currencyCode(domain.getCurrencyCode() != null ? domain.getCurrencyCode() : "USD")
                .startDate(domain.getStartDate())
                .endDate(domain.getEndDate())
                .departmentId(domain.getDepartmentId())
                .projectId(domain.getProjectId())
                .active(domain.isActive())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
    
    public Budget toDomain(BudgetEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return Budget.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .spentAmount(entity.getSpent())
                .currencyCode(entity.getCurrencyCode())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .departmentId(entity.getDepartmentId())
                .projectId(entity.getProjectId())
                .active(entity.isActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
} 