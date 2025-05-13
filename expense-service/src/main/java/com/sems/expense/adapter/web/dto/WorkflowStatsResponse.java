package com.sems.expense.adapter.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStatsResponse {
    private Integer approvalLevel;
    private String levelName;
    private long pendingCount;
    private long approvedCount;
    private long rejectedCount;
    private BigDecimal totalPendingAmount;
    private BigDecimal averageProcessingTimeInHours;
} 