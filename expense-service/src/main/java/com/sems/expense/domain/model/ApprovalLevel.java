package com.sems.expense.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLevel {
    private UUID id;
    private Integer level;
    private String name;
    private String description;
    private UUID departmentId;
    private UUID roleId;
    private BigDecimal minAmountThreshold;
    private BigDecimal maxAmountThreshold;
    private boolean requiresReceipt;
    private boolean isActive;
    private Integer requiredApprovers;
} 