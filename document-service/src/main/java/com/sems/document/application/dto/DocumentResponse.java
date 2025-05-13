package com.sems.document.application.dto;

import com.sems.document.domain.model.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private UUID id;
    private String fileName;
    private String originalFileName;
    private String contentType;
    private long fileSize;
    private String url;
    private UUID expenseId;
    private UUID uploadedBy;
    private DocumentType documentType;
    private LocalDateTime uploadedAt;
    private LocalDateTime updatedAt;
    private String description;
    private List<String> tags;
} 