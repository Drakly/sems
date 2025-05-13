package com.sems.reporting.adapter.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateReportRequest {
    
    @NotBlank(message = "Report name is required")
    private String name;
    
    @NotBlank(message = "Report type is required")
    private String type;
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    private String parameters;
    
    @NotNull(message = "Start date is required")
    private LocalDateTime dateFrom;
    
    @NotNull(message = "End date is required")
    private LocalDateTime dateTo;
} 