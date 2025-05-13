package com.sems.notification.application.service;

import com.sems.notification.domain.model.Notification;
import com.sems.notification.domain.model.NotificationStatus;
import com.sems.notification.domain.model.NotificationType;
import com.sems.notification.domain.port.EmailService;
import com.sems.notification.domain.port.NotificationRepository;
import com.sems.notification.domain.port.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final EmailService emailService;

    @Override
    @Transactional
    public Notification createNotification(UUID userId, String recipient, String subject, String content, NotificationType type) {
        Notification notification = Notification.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .recipient(recipient)
                .subject(subject)
                .content(content)
                .type(type)
                .status(NotificationStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();
        
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void sendNotification(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            try {
                emailService.sendNotification(notification);
                notification.setStatus(NotificationStatus.SENT);
                notification.setSentAt(LocalDateTime.now());
                notificationRepository.save(notification);
                log.info("Notification sent successfully: {}", notification.getId());
            } catch (Exception e) {
                notification.setStatus(NotificationStatus.FAILED);
                notificationRepository.save(notification);
                log.error("Failed to send notification: {}", notification.getId(), e);
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Notification> getNotification(UUID id) {
        return notificationRepository.findById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getNotificationsByStatus(NotificationStatus status) {
        return notificationRepository.findByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Notification> getUserNotificationsByStatus(UUID userId, NotificationStatus status) {
        return notificationRepository.findByUserIdAndStatus(userId, status);
    }
} 