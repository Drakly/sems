package com.sems.notification.adapter.messaging;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String amount;
    private String currency;
    private String category;
    private String status;
    private String expenseDate;
} 