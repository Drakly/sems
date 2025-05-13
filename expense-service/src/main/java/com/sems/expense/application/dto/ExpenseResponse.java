package com.sems.expense.application.dto;

import com.sems.expense.domain.model.Category;
import com.sems.expense.domain.model.Currency;
import com.sems.expense.domain.model.ExpenseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private BigDecimal amount;
    private Currency currency;
    private Category category;
    private ExpenseStatus status;
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID approvedBy;
    private LocalDateTime approvedAt;
    private String receiptUrl;
} 