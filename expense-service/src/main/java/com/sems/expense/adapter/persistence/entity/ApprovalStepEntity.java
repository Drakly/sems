package com.sems.expense.adapter.persistence.entity;

import com.sems.expense.domain.model.ApprovalStep;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "approval_steps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStepEntity {
    
    @Id
    @Column(name = "id")
    private UUID id;
    
    @Column(name = "level")
    private Integer level;
    
    @Column(name = "approver_id")
    private UUID approverId;
    
    @Column(name = "approver_name")
    private String approverName;
    
    @Column(name = "approver_role")
    private String approverRole;
    
    @Column(name = "expense_id", nullable = false)
    private UUID expenseId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false)
    private ApprovalStep.ApprovalAction action;
    
    @Column(name = "comments", length = 1000)
    private String comments;
    
    @Column(name = "action_date", nullable = false)
    private LocalDateTime actionDate;
} 