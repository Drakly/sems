package com.sems.expense.adapter.persistence.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.sems.expense.domain.model.ExpenseStatus;
import com.sems.expense.domain.model.CategoryType;

@Entity
@Table(name = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseEntity {
    
    @Id
    private String id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "amount", nullable = false)
    private BigDecimal amount;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private CategoryType category;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ExpenseStatus status;
    
    @Column(name = "user_id", nullable = false)
    private String userId;
    
    @Column(name = "approver_id")
    private String approverId;
    
    @Column(name = "receipt_id")
    private String receiptId;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
} 