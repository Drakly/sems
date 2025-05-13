package com.sems.notification.domain.port;

import com.sems.notification.domain.model.Notification;

public interface EmailService {
    void sendEmail(String to, String subject, String content);
    void sendEmailWithAttachment(String to, String subject, String content, String attachmentPath);
    void sendNotification(Notification notification);
} 