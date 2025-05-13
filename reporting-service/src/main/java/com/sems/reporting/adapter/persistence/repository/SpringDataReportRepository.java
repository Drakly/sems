package com.sems.reporting.adapter.persistence.repository;

import com.sems.reporting.adapter.persistence.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SpringDataReportRepository extends JpaRepository<ReportEntity, UUID> {
    
    List<ReportEntity> findByUserId(UUID userId);
    
    List<ReportEntity> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
} 