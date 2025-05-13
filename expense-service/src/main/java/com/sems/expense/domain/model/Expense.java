package com.sems.expense.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Expense {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private BigDecimal amount;
    private Currency currency;
    private Category category;
    private UUID categoryId;
    private ExpenseStatus status;
    private LocalDate expenseDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private UUID approvedBy;
    private LocalDateTime approvedAt;
    private String receiptUrl;
    
    // Enhanced workflow fields
    private UUID departmentId;
    private UUID projectId;
    private List<ApprovalStep> approvalHistory = new ArrayList<>();
    private Integer currentApprovalLevel;
    private String rejectionReason;
    private boolean requiresReceipt;
    private boolean flaggedForReview;
    private String reviewComments;
} 