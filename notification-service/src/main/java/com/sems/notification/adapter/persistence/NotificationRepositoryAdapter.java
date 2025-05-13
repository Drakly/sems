package com.sems.notification.adapter.persistence;

import com.sems.notification.adapter.persistence.entity.NotificationEntity;
import com.sems.notification.adapter.persistence.mapper.NotificationEntityMapper;
import com.sems.notification.adapter.persistence.repository.NotificationJpaRepository;
import com.sems.notification.domain.model.Notification;
import com.sems.notification.domain.model.NotificationStatus;
import com.sems.notification.domain.model.NotificationType;
import com.sems.notification.domain.port.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class NotificationRepositoryAdapter implements NotificationRepository {
    private final NotificationJpaRepository notificationJpaRepository;
    private final NotificationEntityMapper notificationEntityMapper;

    @Override
    public Notification save(Notification notification) {
        NotificationEntity entity = notificationEntityMapper.toEntity(notification);
        NotificationEntity savedEntity = notificationJpaRepository.save(entity);
        return notificationEntityMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Notification> findById(UUID id) {
        return notificationJpaRepository.findById(id)
                .map(notificationEntityMapper::toDomain);
    }

    @Override
    public List<Notification> findByUserId(UUID userId) {
        return notificationJpaRepository.findByUserId(userId).stream()
                .map(notificationEntityMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> findByStatus(NotificationStatus status) {
        return notificationJpaRepository.findByStatus(status).stream()
                .map(notificationEntityMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> findAll() {
        return notificationJpaRepository.findAll().stream()
                .map(notificationEntityMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Notification> findByUserIdAndStatus(UUID userId, NotificationStatus status) {
        return notificationJpaRepository.findByUserIdAndStatus(userId, status).stream()
                .map(notificationEntityMapper::toDomain)
                .collect(Collectors.toList());
    }
} 