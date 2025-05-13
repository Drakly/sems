package com.sems.expense.adapter.persistence.mapper;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.sems.expense.adapter.persistence.entity.ExpenseEntity;
import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.CategoryType;

@Component
public class ExpensePersistenceMapper {

    /**
     * Maps a domain Expense to an ExpenseEntity
     */
    public ExpenseEntity toEntity(Expense expense) {
        if (expense == null) {
            return null;
        }
        
        CategoryType categoryType = null;
        // Derive CategoryType from categoryId if possible
        if (expense.getCategoryId() != null) {
            // Since we don't have direct access to the category type, 
            // we could either inject a service to fetch it or use a default value
            // For now, using a null value which should be overridden by the service layer
            categoryType = null;
        }
        
        return ExpenseEntity.builder()
                .id(expense.getId().toString())
                .title(expense.getTitle())
                .description(expense.getDescription())
                .amount(expense.getAmount())
                .date(expense.getExpenseDate())
                .category(categoryType)
                .status(expense.getStatus())
                .userId(expense.getUserId().toString())
                .approverId(expense.getApprovedBy() != null ? expense.getApprovedBy().toString() : null)
                .receiptId(expense.getReceiptUrl())
                .createdAt(expense.getCreatedAt())
                .updatedAt(expense.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps an ExpenseEntity to a domain Expense
     */
    public Expense toDomain(ExpenseEntity entity) {
        if (entity == null) {
            return null;
        }
        
        return Expense.builder()
                .id(UUID.fromString(entity.getId()))
                .title(entity.getTitle())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .expenseDate(entity.getDate())
                .categoryId(entity.getCategory() != null ? UUID.randomUUID() : null)  // Using placeholder ID
                .status(entity.getStatus())
                .userId(UUID.fromString(entity.getUserId()))
                .approvedBy(entity.getApproverId() != null ? UUID.fromString(entity.getApproverId()) : null)
                .receiptUrl(entity.getReceiptId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
    
    /**
     * Maps a list of ExpenseEntity to a list of domain Expenses
     */
    public List<Expense> toDomainList(List<ExpenseEntity> entities) {
        if (entities == null) {
            return List.of();
        }
        
        return entities.stream()
                .map(this::toDomain)
                .collect(Collectors.toList());
    }
} 