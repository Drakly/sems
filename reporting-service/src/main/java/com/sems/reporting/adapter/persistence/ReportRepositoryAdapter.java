package com.sems.reporting.adapter.persistence;

import com.sems.reporting.adapter.persistence.mapper.ReportMapper;
import com.sems.reporting.adapter.persistence.repository.SpringDataReportRepository;
import com.sems.reporting.domain.model.Report;
import com.sems.reporting.domain.port.out.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ReportRepositoryAdapter implements ReportRepository {
    
    private final SpringDataReportRepository repository;
    private final ReportMapper mapper;

    @Override
    public Report save(Report report) {
        var entity = mapper.toEntity(report);
        var savedEntity = repository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Report> findById(UUID id) {
        return repository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<Report> findByUserId(UUID userId) {
        return repository.findByUserId(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Report> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end) {
        return repository.findByCreatedAtBetween(start, end).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(UUID id) {
        repository.deleteById(id);
    }
} 