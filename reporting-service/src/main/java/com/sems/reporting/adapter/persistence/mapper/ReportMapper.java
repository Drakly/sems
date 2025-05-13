package com.sems.reporting.adapter.persistence.mapper;

import com.sems.reporting.adapter.persistence.entity.ReportEntity;
import com.sems.reporting.domain.model.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReportMapper {
    
    Report toDomain(ReportEntity entity);
    
    ReportEntity toEntity(Report domain);
} 