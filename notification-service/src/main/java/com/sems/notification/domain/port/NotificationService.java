package com.sems.notification.domain.port;

import com.sems.notification.domain.model.Notification;
import com.sems.notification.domain.model.NotificationStatus;
import com.sems.notification.domain.model.NotificationType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationService {
    Notification createNotification(UUID userId, String recipient, String subject, String content, NotificationType type);
    void sendNotification(UUID notificationId);
    Optional<Notification> getNotification(UUID id);
    List<Notification> getUserNotifications(UUID userId);
    List<Notification> getNotificationsByStatus(NotificationStatus status);
    List<Notification> getUserNotificationsByStatus(UUID userId, NotificationStatus status);
} 