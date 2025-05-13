package com.sems.document.adapter.persistence;

import com.sems.document.domain.model.Document;
import com.sems.document.domain.model.DocumentType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(target = "documentType", expression = "java(DocumentType.valueOf(entity.getDocumentType()))")
    Document toDomain(DocumentEntity entity);

    @Mapping(target = "documentType", expression = "java(document.getDocumentType().name())")
    DocumentEntity toEntity(Document document);
} 