package com.sems.notification.adapter.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseEvent {
    private UUID id;
    private UUID userId;
    private String userEmail;
    private String title;
    private String description;
    private BigDecimal amount;
    private String currency;
    private String status;
    private UUID approvedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 