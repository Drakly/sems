package com.sems.expense.adapter.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistoryResponse {
    private UUID id;
    private UUID expenseId;
    private UUID approverId;
    private String approverName;
    private String approverRole;
    private Integer level;
    private String action;
    private String comments;
    private LocalDateTime actionDate;
} 