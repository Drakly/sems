package com.sems.expense.adapter.out.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currencyCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseCategoryEntity category;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExpenseStatusEntity status;

    @Column(nullable = false, columnDefinition = "BINARY(16)")
    private UUID submittedBy;

    @Column(columnDefinition = "BINARY(16)")
    private UUID approvedBy;

    private String rejectionReason;

    private Boolean receiptAttached;

    @ElementCollection
    @CollectionTable(name = "expense_documents", joinColumns = @JoinColumn(name = "expense_id"))
    @Column(name = "document_id", columnDefinition = "BINARY(16)")
    private List<UUID> documentIds = new ArrayList<>();

    @Column(columnDefinition = "BINARY(16)")
    private UUID departmentId;

    @Column(columnDefinition = "BINARY(16)")
    private UUID projectId;
    
    // Approval workflow fields
    private Integer currentApprovalLevel;
    
    private Boolean flaggedForReview;
    
    @Column(columnDefinition = "TEXT")
    private String reviewComments;
    
    private Boolean requiresReceipt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
} 