package com.sems.document.domain.port;

import com.sems.document.domain.model.Document;

import java.util.List;
import java.util.UUID;

public interface SearchService {
    void indexDocument(Document document);
    void updateDocument(Document document);
    void deleteDocument(UUID id);
    List<Document> search(String query);
    List<Document> findByTags(List<String> tags);
} 