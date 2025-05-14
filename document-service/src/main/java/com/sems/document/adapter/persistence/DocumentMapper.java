package com.sems.document.adapter.persistence;

import com.sems.document.domain.model.Document;
import com.sems.document.domain.model.DocumentType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import java.time.LocalDateTime;

@Mapper(componentModel = "spring", imports = {DocumentType.class, LocalDateTime.class})
public interface DocumentMapper {

    @Mapping(target = "documentType", expression = "java(DocumentType.valueOf(entity.getDocumentType()))")
    @Mapping(target = "originalFileName", source = "metadata", defaultValue = "")
    @Mapping(target = "s3Key", source = "storageLocation")
    @Mapping(target = "s3Url", ignore = true)
    @Mapping(target = "updatedAt", expression = "java(LocalDateTime.now())")
    @Mapping(target = "tags", source = "metadata", defaultValue = "")
    Document toDomain(DocumentEntity entity);

    @Mapping(target = "documentType", expression = "java(document.getDocumentType().name())")
    @Mapping(target = "storageLocation", source = "s3Key")
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "metadata", expression = "java(document.getTags())")
    DocumentEntity toEntity(Document document);
} 