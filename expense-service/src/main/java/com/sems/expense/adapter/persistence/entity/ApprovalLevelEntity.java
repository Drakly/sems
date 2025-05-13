package com.sems.expense.adapter.persistence.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "approval_levels")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLevelEntity {
    
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "level", nullable = false)
    private Integer level;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "department_id")
    private UUID departmentId;
    
    @Column(name = "role_id")
    private UUID roleId;
    
    @Column(name = "min_amount_threshold", nullable = false)
    private BigDecimal minAmountThreshold;
    
    @Column(name = "max_amount_threshold")
    private BigDecimal maxAmountThreshold;
    
    @Column(name = "requires_receipt")
    private boolean requiresReceipt;
    
    @Column(name = "is_active", nullable = false)
    private boolean isActive;
    
    @Column(name = "required_approvers")
    private Integer requiredApprovers;
} 