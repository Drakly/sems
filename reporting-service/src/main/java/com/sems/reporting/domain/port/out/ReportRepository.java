package com.sems.reporting.domain.port.out;

import com.sems.reporting.domain.model.Report;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReportRepository {
    
    Report save(Report report);
    
    Optional<Report> findById(UUID id);
    
    List<Report> findByUserId(UUID userId);
    
    List<Report> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    void delete(UUID id);
} 