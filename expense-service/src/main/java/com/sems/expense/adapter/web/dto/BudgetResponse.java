package com.sems.expense.adapter.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private UUID id;
    private String name;
    private UUID userId;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<UUID> categoryIds;
    private UUID departmentId;
    private UUID projectId;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private BigDecimal utilizationPercentage;
} 