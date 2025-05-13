package com.sems.document.domain.port;

import com.sems.document.domain.model.Document;
import com.sems.document.domain.model.DocumentType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DocumentRepository {
    Document save(Document document);
    Optional<Document> findById(UUID id);
    List<Document> findByExpenseId(UUID expenseId);
    List<Document> findByUploadedBy(UUID userId);
    List<Document> findByDocumentType(DocumentType documentType);
    List<Document> search(String query);
    void deleteById(UUID id);
} 