package com.sems.reporting.domain.model;

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
public class Report {
    private UUID id;
    private String name;
    private ReportType type;
    private ReportStatus status;
    private UUID userId;
    private String parameters;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private String generatedFilePath;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
} 