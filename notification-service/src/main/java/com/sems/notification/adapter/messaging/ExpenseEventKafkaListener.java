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

    @KafkaListener(topics = "${app.kafka.topics.expense-events}", groupId = "${spring.application.name}")
    public void listen(ExpenseEvent event) {
        log.info("Received expense event: {}", event);
        
        // Create and send appropriate notification based on event type
        if (event.getStatus() == null) {
            log.info("No status in event, skipping notification");
            return;
        }
        
        try {
            ExpenseStatus status = ExpenseStatus.valueOf(event.getStatus());
            switch (status) {
                case SUBMITTED -> handleExpenseSubmitted(event);
                case APPROVED -> handleExpenseApproved(event);
                case REJECTED -> handleExpenseRejected(event);
                case PAID -> handleExpensePaid(event);
                default -> log.info("No notification needed for expense event: {}", event.getStatus());
            }
        } catch (IllegalArgumentException e) {
            log.warn("Unknown expense status: {}", event.getStatus());
        }
    }
    
    private void handleExpenseSubmitted(ExpenseEvent event) {
        // Notify expense owner that their expense was submitted
        String subject = "Expense Submitted: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been submitted and is awaiting approval.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        notificationService.createNotification(
                event.getUserId(), 
                event.getUserEmail(), 
                subject, 
                content, 
                NotificationType.EXPENSE_SUBMITTED);
                
        // Notify approvers that a new expense is submitted
        // In a real application, we'd fetch approvers from the user service
        // For now, we'll just log this
        log.info("Would notify approvers about submitted expense: {}", event.getId());
    }
    
    private void handleExpenseApproved(ExpenseEvent event) {
        String subject = "Expense Approved: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been approved.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        notificationService.createNotification(
                event.getUserId(), 
                event.getUserEmail(), 
                subject, 
                content, 
                NotificationType.EXPENSE_APPROVED);
    }
    
    private void handleExpenseRejected(ExpenseEvent event) {
        String subject = "Expense Rejected: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been rejected.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        notificationService.createNotification(
                event.getUserId(), 
                event.getUserEmail(), 
                subject, 
                content, 
                NotificationType.EXPENSE_REJECTED);
    }
    
    private void handleExpensePaid(ExpenseEvent event) {
        String subject = "Expense Paid: " + event.getTitle();
        String content = String.format(
                "Your expense '%s' for %s %s has been paid.",
                event.getTitle(), event.getAmount(), event.getCurrency());
                
        notificationService.createNotification(
                event.getUserId(), 
                event.getUserEmail(), 
                subject, 
                content, 
                NotificationType.EXPENSE_PAID);
    }
} 