package com.sems.document.adapter.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentJpaRepository extends JpaRepository<DocumentEntity, UUID> {
    List<DocumentEntity> findByExpenseId(UUID expenseId);
    List<DocumentEntity> findByUploadedBy(UUID userId);
    List<DocumentEntity> findByDocumentType(String documentType);
} 