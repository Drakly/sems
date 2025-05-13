package com.sems.notification.adapter.persistence.repository;

import com.sems.notification.adapter.persistence.entity.NotificationEntity;
import com.sems.notification.domain.model.NotificationStatus;
import com.sems.notification.domain.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationJpaRepository extends JpaRepository<NotificationEntity, UUID> {
    List<NotificationEntity> findByUserId(UUID userId);
    List<NotificationEntity> findByStatus(NotificationStatus status);
    List<NotificationEntity> findByType(NotificationType type);
    List<NotificationEntity> findByUserIdAndStatus(UUID userId, NotificationStatus status);
} 