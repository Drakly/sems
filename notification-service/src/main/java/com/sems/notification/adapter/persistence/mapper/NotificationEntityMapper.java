package com.sems.notification.adapter.persistence.mapper;

import com.sems.notification.adapter.persistence.entity.NotificationEntity;
import com.sems.notification.domain.model.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationEntityMapper {
    NotificationEntity toEntity(Notification notification);
    Notification toDomain(NotificationEntity entity);
} 