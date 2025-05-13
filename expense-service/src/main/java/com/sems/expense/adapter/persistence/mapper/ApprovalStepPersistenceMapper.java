package com.sems.expense.adapter.persistence.mapper;

import com.sems.expense.adapter.persistence.entity.ApprovalStepEntity;
import com.sems.expense.domain.model.ApprovalStep;
import org.springframework.stereotype.Component;

@Component
public class ApprovalStepPersistenceMapper {

    public ApprovalStepEntity toEntity(ApprovalStep domain) {
        if (domain == null) {
            return null;
        }
        
        return ApprovalStepEntity.builder()
                .id(domain.getId())
                .level(domain.getLevel())
                .approverId(domain.getApproverId())
                .approverName(domain.getApproverName())
                .approverRole(domain.getApproverRole())
                .expenseId(domain.getExpenseId())
                .action(domain.getAction())
                .comments(domain.getComments())
                .actionDate(domain.getActionDate())
                .build();
    }
    
    public ApprovalStep toDomain(ApprovalStepEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return ApprovalStep.builder()
                .id(entity.getId())
                .level(entity.getLevel())
                .approverId(entity.getApproverId())
                .approverName(entity.getApproverName())
                .approverRole(entity.getApproverRole())
                .expenseId(entity.getExpenseId())
                .action(entity.getAction())
                .comments(entity.getComments())
                .actionDate(entity.getActionDate())
                .build();
    }
} 