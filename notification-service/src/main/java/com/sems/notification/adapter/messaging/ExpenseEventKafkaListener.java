package com.sems.notification.adapter.messaging;

import com.sems.notification.domain.model.NotificationType;
import com.sems.notification.domain.port.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventKafkaListener {
    private final NotificationService notificationService;

    @KafkaListener(
        topics = "${app.kafka.topics.expense-events}", 
        groupId = "${spring.application.name}"
    )
    public void listen(ExpenseEvent event) {
        log.info("Received expense event for expense ID: {}, status: {}", event.getId(), event.getStatus());
        
        try {
            // Create and send appropriate notification based on event type
            if (event.getStatus() == null) {
                log.warn("No status in event, skipping notification");
                return;
            }
            
            ExpenseStatus status;
            try {
                status = ExpenseStatus.valueOf(event.getStatus());
            } catch (IllegalArgumentException e) {
                log.warn("Unknown expense status received: {}", event.getStatus());
                return;
            }
            
            switch (status) {
                case SUBMITTED -> handleExpenseSubmitted(event);
                case APPROVED -> handleExpenseApproved(event);
                case REJECTED -> handleExpenseRejected(event);
                case PAID -> handleExpensePaid(event);
                case UNDER_REVIEW -> handleExpenseUnderReview(event);
                default -> log.info("No notification needed for expense status: {}", event.getStatus());
            }
        } catch (Exception e) {
            log.error("Error processing expense event: {}", e.getMessage(), e);
        }
    }
    
    private void handleExpenseSubmitted(ExpenseEvent event) {
        // Notify expense owner that their expense was submitted
        String subject = "Expense Submitted: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been submitted and is awaiting approval.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        sendNotification(event, subject, content, NotificationType.EXPENSE_SUBMITTED);
                
        // Notify approvers that a new expense is submitted
        // This would require integration with user service to get approvers
        log.info("Would notify approvers about submitted expense: {}", event.getId());
    }
    
    private void handleExpenseApproved(ExpenseEvent event) {
        String subject = "Expense Approved: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been approved.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        sendNotification(event, subject, content, NotificationType.EXPENSE_APPROVED);
    }
    
    private void handleExpenseRejected(ExpenseEvent event) {
        String subject = "Expense Rejected: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been rejected.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        sendNotification(event, subject, content, NotificationType.EXPENSE_REJECTED);
    }
    
    private void handleExpensePaid(ExpenseEvent event) {
        String subject = "Expense Paid: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been paid.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        sendNotification(event, subject, content, NotificationType.EXPENSE_PAID);
    }
    
    private void handleExpenseUnderReview(ExpenseEvent event) {
        String subject = "Expense Under Review: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s is currently under review.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        sendNotification(event, subject, content, NotificationType.EXPENSE_UNDER_REVIEW);
    }
    
    private void sendNotification(ExpenseEvent event, String subject, String content, NotificationType type) {
        try {
            notificationService.createNotification(
                    event.getUserId(), 
                    event.getUserEmail(), 
                    subject, 
                    content, 
                    type);
            log.info("Notification sent for expense {}, type: {}", event.getId(), type);
        } catch (Exception e) {
            log.error("Failed to send notification for expense {}, type: {}: {}", 
                     event.getId(), type, e.getMessage(), e);
        }
    }
} 