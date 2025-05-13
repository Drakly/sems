package com.sems.expense.domain.model;

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
public class ApprovalStep {
    private UUID id;
    private Integer level;
    private UUID approverId;
    private String approverName;
    private String approverRole;
    private UUID expenseId;
    private ApprovalAction action;
    private String comments;
    private LocalDateTime actionDate;
    
    public enum ApprovalAction {
        APPROVED,
        REJECTED,
        REQUESTED_CHANGES,
        ESCALATED,
        DELEGATED
    }
} 