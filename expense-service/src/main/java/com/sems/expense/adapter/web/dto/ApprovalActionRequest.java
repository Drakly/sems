package com.sems.expense.adapter.web.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalActionRequest {
    
    @NotNull(message = "Actor ID is required")
    private UUID actorId;
    
    private UUID delegateId;
    
    private String comments;
} 