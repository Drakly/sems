package com.sems.expense.adapter.persistence.mapper;

import com.sems.expense.adapter.persistence.entity.ApprovalLevelEntity;
import com.sems.expense.domain.model.ApprovalLevel;
import org.springframework.stereotype.Component;

@Component
public class ApprovalLevelPersistenceMapper {

    public ApprovalLevelEntity toEntity(ApprovalLevel domain) {
        if (domain == null) {
            return null;
        }
        
        return ApprovalLevelEntity.builder()
                .id(domain.getId())
                .level(domain.getLevel())
                .name(domain.getName())
                .description(domain.getDescription())
                .departmentId(domain.getDepartmentId())
                .roleId(domain.getRoleId())
                .minAmountThreshold(domain.getMinAmountThreshold())
                .maxAmountThreshold(domain.getMaxAmountThreshold())
                .requiresReceipt(domain.isRequiresReceipt())
                .isActive(domain.isActive())
                .requiredApprovers(domain.getRequiredApprovers())
                .build();
    }
    
    public ApprovalLevel toDomain(ApprovalLevelEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return ApprovalLevel.builder()
                .id(entity.getId())
                .level(entity.getLevel())
                .name(entity.getName())
                .description(entity.getDescription())
                .departmentId(entity.getDepartmentId())
                .roleId(entity.getRoleId())
                .minAmountThreshold(entity.getMinAmountThreshold())
                .maxAmountThreshold(entity.getMaxAmountThreshold())
                .requiresReceipt(entity.isRequiresReceipt())
                .isActive(entity.isActive())
                .requiredApprovers(entity.getRequiredApprovers())
                .build();
    }
} 