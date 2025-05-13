package com.sems.reporting.adapter.web.mapper;

import com.sems.reporting.adapter.web.dto.ReportResponse;
import com.sems.reporting.domain.model.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReportDtoMapper {
    
    @Mapping(target = "type", expression = "java(report.getType().name())")
    @Mapping(target = "status", expression = "java(report.getStatus().name())")
    ReportResponse toResponse(Report report);
} 