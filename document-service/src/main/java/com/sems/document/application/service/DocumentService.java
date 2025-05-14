package com.sems.document.application.service;

import com.sems.document.application.dto.DocumentResponse;
import com.sems.document.application.dto.DocumentUploadRequest;
import com.sems.document.domain.model.Document;
import com.sems.document.domain.port.DocumentRepository;
import com.sems.document.domain.port.SearchService;
import com.sems.document.domain.port.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final StorageService storageService;
    private final SearchService searchService;
    private final DocumentResponseMapper documentMapper;
    
    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, DocumentUploadRequest request) {
        try {
            // Generate a unique filename
            String fileExtension = getFileExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + fileExtension;
            
            // Upload to S3
            String s3Key = storageService.uploadFile(
                fileName, 
                file.getInputStream(), 
                file.getContentType()
            );
            
            // Get file URL
            String s3Url = storageService.getFileUrl(s3Key);
            
            // Create document entity
            Document document = Document.builder()
                .id(UUID.randomUUID())
                .fileName(fileName)
                .originalFileName(file.getOriginalFilename())
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .s3Key(s3Key)
                .s3Url(s3Url)
                .expenseId(request.getExpenseId())
                .uploadedBy(request.getUploadedBy())
                .documentType(request.getDocumentType())
                .description(request.getDescription())
                .tags(String.join(",", request.getTags()))
                .uploadedAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
            
            // Save to database
            Document savedDocument = documentRepository.save(document);
            
            // Index in Elasticsearch
            searchService.indexDocument(savedDocument);
            
            return documentMapper.toResponse(savedDocument);
        } catch (IOException e) {
            log.error("Failed to upload document", e);
            throw new RuntimeException("Failed to upload document: " + e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        return documentMapper.toResponse(document);
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByExpenseId(UUID expenseId) {
        return documentRepository.findByExpenseId(expenseId).stream()
            .map(documentMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsByUserId(UUID userId) {
        return documentRepository.findByUploadedBy(userId).stream()
            .map(documentMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteDocument(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        // Delete from S3
        storageService.deleteFile(document.getS3Key());
        
        // Delete from database
        documentRepository.deleteById(id);
        
        // Delete from Elasticsearch
        searchService.deleteDocument(id);
    }
    
    @Transactional(readOnly = true)
    public byte[] downloadDocument(UUID id) {
        Document document = documentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Document not found with id: " + id));
        
        return storageService.downloadFile(document.getS3Key());
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> searchDocuments(String query) {
        List<Document> documents = documentRepository.search(query);
        return documents.stream()
            .map(documentMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DocumentResponse> searchDocumentsByTags(String tags) {
        List<String> tagList = Arrays.asList(tags.split(","));
        List<Document> documents = searchService.findByTags(tagList);
        return documents.stream()
            .map(documentMapper::toResponse)
            .collect(Collectors.toList());
    }
    
    private String getFileExtension(String filename) {
        return filename == null ? "" 
            : filename.lastIndexOf(".") > 0 
              ? filename.substring(filename.lastIndexOf("."))
              : "";
    }
} 