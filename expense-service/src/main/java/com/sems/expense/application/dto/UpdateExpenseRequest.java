package com.sems.expense.application.dto;

import com.sems.expense.domain.model.Category;
import com.sems.expense.domain.model.Currency;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {
    private String title;
    private String description;
    
    @DecimalMin(value = "0.01", message = "Amount must be greater than zero")
    private BigDecimal amount;
    
    private Currency currency;
    private Category category;
    
    @PastOrPresent(message = "Expense date cannot be in the future")
    private LocalDate expenseDate;
    
    private String receiptUrl;
} 