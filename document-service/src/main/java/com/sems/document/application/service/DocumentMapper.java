package com.sems.document.application.service;

import com.sems.document.application.dto.DocumentResponse;
import com.sems.document.domain.model.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Mapper(componentModel = "spring")
public interface DocumentMapper {
    
    @Mapping(target = "url", source = "s3Url")
    @Mapping(target = "tags", source = "tags", qualifiedByName = "stringToList")
    DocumentResponse toResponse(Document document);
    
    @Named("stringToList")
    default List<String> stringToList(String tags) {
        if (tags == null || tags.isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.asList(tags.split(","));
    }
} 