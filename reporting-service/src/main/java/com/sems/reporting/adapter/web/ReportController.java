package com.sems.reporting.adapter.web;

import com.sems.reporting.adapter.web.dto.CreateReportRequest;
import com.sems.reporting.adapter.web.dto.ReportResponse;
import com.sems.reporting.adapter.web.mapper.ReportDtoMapper;
import com.sems.reporting.domain.port.in.ReportUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Report generation and management API")
public class ReportController {
    
    private final ReportUseCase reportUseCase;
    private final ReportDtoMapper mapper;
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new report")
    public ReportResponse createReport(@Valid @RequestBody CreateReportRequest request) {
        var report = reportUseCase.createReport(
                request.getName(),
                request.getType(),
                request.getUserId(),
                request.getParameters(),
                request.getDateFrom(),
                request.getDateTo()
        );
        return mapper.toResponse(report);
    }
    
    @GetMapping("/{reportId}")
    @Operation(summary = "Get a report by ID")
    public ReportResponse getReportById(@PathVariable UUID reportId) {
        var report = reportUseCase.getReportById(reportId);
        return mapper.toResponse(report);
    }
    
    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all reports for a user")
    public List<ReportResponse> getUserReports(@PathVariable UUID userId) {
        return reportUseCase.getUserReports(userId).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @PostMapping("/{reportId}/generate")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Generate a report by ID")
    public ResponseEntity<Void> generateReport(@PathVariable UUID reportId) {
        reportUseCase.generateReport(reportId);
        return ResponseEntity.accepted().build();
    }
    
    @GetMapping
    @Operation(summary = "Get reports by date range")
    public List<ReportResponse> getReportsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return reportUseCase.getReportsByDateRange(startDate, endDate).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @DeleteMapping("/{reportId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a report")
    public ResponseEntity<Void> deleteReport(@PathVariable UUID reportId) {
        reportUseCase.deleteReport(reportId);
        return ResponseEntity.noContent().build();
    }
} 