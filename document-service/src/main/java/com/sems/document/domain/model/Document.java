package com.sems.document.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    private UUID id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private long fileSize;
    private String s3Key;
    private String s3Url;
    private UUID expenseId;
    private UUID uploadedBy;
    private DocumentType documentType;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private String description;
    private String tags;
} 