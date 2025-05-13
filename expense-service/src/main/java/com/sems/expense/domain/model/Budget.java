package com.sems.expense.domain.model;

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
public class Budget {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal remaining;
    private String currencyCode;
    private UUID userId;
    private UUID departmentId;
    private UUID projectId;
    private List<UUID> categoryIds;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 