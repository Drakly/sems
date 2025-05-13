package com.sems.expense.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalWorkflowStats {
    private int approvalLevel;
    private String levelName;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private int flaggedCount;
    private BigDecimal totalPendingAmount;
    private BigDecimal averageProcessingTimeInHours;
} 