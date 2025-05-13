package com.sems.document.adapter.persistence;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    private String fileName;
    
    private String contentType;
    
    private long fileSize;
    
    private String storageLocation;
    
    private String documentType;
    
    private UUID expenseId;
    
    private UUID uploadedBy;
    
    private LocalDateTime uploadedAt;
    
    private String status;
    
    private String description;
    
    @Column(length = 1000)
    private String metadata;
} 