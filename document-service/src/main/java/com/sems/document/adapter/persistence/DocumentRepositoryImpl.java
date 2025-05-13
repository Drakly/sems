package com.sems.document.adapter.persistence;

import com.sems.document.domain.model.Document;
import com.sems.document.domain.model.DocumentType;
import com.sems.document.domain.port.DocumentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
public class DocumentRepositoryImpl implements DocumentRepository {

    private final DocumentJpaRepository documentJpaRepository;
    private final DocumentMapper documentMapper;

    @Override
    public Document save(Document document) {
        DocumentEntity entity = documentMapper.toEntity(document);
        DocumentEntity savedEntity = documentJpaRepository.save(entity);
        return documentMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Document> findById(UUID id) {
        return documentJpaRepository.findById(id)
                .map(documentMapper::toDomain);
    }

    @Override
    public List<Document> findByExpenseId(UUID expenseId) {
        return documentJpaRepository.findByExpenseId(expenseId).stream()
                .map(documentMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Document> findByUploadedBy(UUID userId) {
        return documentJpaRepository.findByUploadedBy(userId).stream()
                .map(documentMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Document> findByDocumentType(DocumentType documentType) {
        return documentJpaRepository.findByDocumentType(documentType.name()).stream()
                .map(documentMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Document> search(String query) {
        // Basic implementation - in a real app, could use Elasticsearch here
        return documentJpaRepository.findAll().stream()
                .filter(doc -> doc.getFileName().toLowerCase().contains(query.toLowerCase()) || 
                               doc.getDescription() != null && doc.getDescription().toLowerCase().contains(query.toLowerCase()))
                .map(documentMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(UUID id) {
        documentJpaRepository.deleteById(id);
    }
} 