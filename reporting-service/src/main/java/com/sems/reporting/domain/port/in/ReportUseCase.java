package com.sems.reporting.domain.port.in;

import com.sems.reporting.domain.model.Report;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReportUseCase {
    
    Report createReport(String name, 
                        String type, 
                        UUID userId, 
                        String parameters, 
                        LocalDateTime dateFrom, 
                        LocalDateTime dateTo);
    
    Report getReportById(UUID reportId);
    
    List<Report> getUserReports(UUID userId);
    
    void generateReport(UUID reportId);
    
    List<Report> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    void deleteReport(UUID reportId);
} 