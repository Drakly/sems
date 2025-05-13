package com.sems.reporting.adapter.web.dto;

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
public class ReportResponse {
    private UUID id;
    private String name;
    private String type;
    private String status;
    private UUID userId;
    private String parameters;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private String generatedFilePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
} 