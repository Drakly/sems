package com.sems.expense.adapter.out.persistence;

import com.sems.expense.adapter.out.persistence.entity.ExpenseCategoryEntity;
import com.sems.expense.adapter.out.persistence.entity.ExpenseEntity;
import com.sems.expense.adapter.out.persistence.entity.ExpenseStatusEntity;
import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class ExpenseMapper {

    public ExpenseEntity toEntity(Expense domain) {
        if (domain == null) {
            return null;
        }

        ExpenseCategoryEntity category;
        if (domain.getCategory() != null) {
            category = mapCategoryNameToEntity(domain.getCategory().getName());
        } else {
            category = ExpenseCategoryEntity.MISCELLANEOUS;
        }

        return ExpenseEntity.builder()
                .id(domain.getId())
                .title(domain.getTitle())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .currencyCode(domain.getCurrency() != null ? domain.getCurrency().name() : "USD")
                .category(category)
                .expenseDate(domain.getExpenseDate())
                .status(mapStatusToEntity(domain.getStatus()))
                .submittedBy(domain.getUserId())
                .approvedBy(domain.getApprovedBy())
                .rejectionReason(domain.getRejectionReason())
                .receiptAttached(domain.isRequiresReceipt())
                .departmentId(domain.getDepartmentId())
                .projectId(domain.getProjectId())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .currentApprovalLevel(domain.getCurrentApprovalLevel())
                .flaggedForReview(domain.isFlaggedForReview())
                .reviewComments(domain.getReviewComments())
                .requiresReceipt(domain.isRequiresReceipt())
                .build();
    }
    
    public Expense toDomain(ExpenseEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return Expense.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .categoryId(UUID.randomUUID()) // Placeholder - this would need proper conversion
                .expenseDate(entity.getExpenseDate())
                .status(mapStatusToDomain(entity.getStatus()))
                .userId(entity.getSubmittedBy())
                .approvedBy(entity.getApprovedBy())
                .rejectionReason(entity.getRejectionReason())
                .requiresReceipt(entity.getRequiresReceipt() != null ? entity.getRequiresReceipt() : false)
                .departmentId(entity.getDepartmentId())
                .projectId(entity.getProjectId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .currentApprovalLevel(entity.getCurrentApprovalLevel())
                .flaggedForReview(entity.getFlaggedForReview() != null ? entity.getFlaggedForReview() : false)
                .reviewComments(entity.getReviewComments())
                .build();
    }
    
    private ExpenseStatusEntity mapStatusToEntity(ExpenseStatus status) {
        if (status == null) {
            return ExpenseStatusEntity.DRAFT;
        }
        
        try {
            return ExpenseStatusEntity.valueOf(status.name());
        } catch (IllegalArgumentException e) {
            return ExpenseStatusEntity.DRAFT;
        }
    }
    
    private ExpenseStatus mapStatusToDomain(ExpenseStatusEntity statusEntity) {
        if (statusEntity == null) {
            return ExpenseStatus.DRAFT;
        }
        
        try {
            return ExpenseStatus.valueOf(statusEntity.name());
        } catch (IllegalArgumentException e) {
            return ExpenseStatus.DRAFT;
        }
    }
    
    private ExpenseCategoryEntity mapCategoryNameToEntity(String categoryName) {
        if (categoryName == null) {
            return ExpenseCategoryEntity.MISCELLANEOUS;
        }
        
        try {
            return ExpenseCategoryEntity.valueOf(categoryName.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ExpenseCategoryEntity.MISCELLANEOUS;
        }
    }
} 