package com.sems.notification.domain.port;

import com.sems.notification.domain.model.Notification;
import com.sems.notification.domain.model.NotificationStatus;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository {
    Notification save(Notification notification);
    Optional<Notification> findById(UUID id);
    List<Notification> findByUserId(UUID userId);
    List<Notification> findByStatus(NotificationStatus status);
    List<Notification> findByUserIdAndStatus(UUID userId, NotificationStatus status);
    List<Notification> findAll();
} 