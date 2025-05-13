package com.sems.document.application.dto;

import com.sems.document.domain.model.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentUploadRequest {
    @NotNull(message = "Expense ID is required")
    private UUID expenseId;
    
    @NotNull(message = "User ID is required")
    private UUID uploadedBy;
    
    @NotNull(message = "Document type is required")
    private DocumentType documentType;
    
    private String description;
    
    private List<String> tags;
} 