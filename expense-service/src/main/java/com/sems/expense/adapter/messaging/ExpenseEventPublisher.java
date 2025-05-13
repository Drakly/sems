package com.sems.expense.adapter.messaging;

import com.sems.expense.adapter.client.UserServiceClient;
import com.sems.expense.domain.model.Expense;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventPublisher {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserServiceClient userServiceClient;
    
    @Value("${app.kafka.topics.expense-event}")
    private String expenseEventTopic;
    
    public void publishExpenseStatusChange(Expense expense) {
        if (expense == null || expense.getId() == null) {
            log.error("Cannot publish event for null expense or expense with null ID");
            return;
        }
        
        try {
            // Get user email from the user service
            var userResponse = userServiceClient.getUserById(expense.getUserId());
            
            if (userResponse.getStatusCode().is2xxSuccessful() && userResponse.getBody() != null) {
                var userDto = userResponse.getBody();
                
                // Create and publish the event
                ExpenseEvent event = new ExpenseEvent(
                    expense.getId(),
                    expense.getUserId(),
                    userDto.email(),
                    expense.getTitle(),
                    expense.getDescription(),
                    expense.getAmount() != null ? expense.getAmount().toString() : "0.00",
                    expense.getCurrency() != null ? expense.getCurrency().toString() : "USD",
                    expense.getCategory() != null ? expense.getCategory().toString() : "OTHER",
                    expense.getStatus().toString(),
                    expense.getExpenseDate() != null ? expense.getExpenseDate().toString() : ""
                );
                
                // Send the event and handle the CompletableFuture result
                CompletableFuture<SendResult<String, Object>> future = 
                    kafkaTemplate.send(expenseEventTopic, expense.getId().toString(), event);
                
                future.whenComplete((result, ex) -> {
                    if (ex == null) {
                        log.info("Published expense event successfully for ID: {}, Status: {}", 
                               expense.getId(), expense.getStatus());
                    } else {
                        log.error("Failed to publish expense event for ID: {}, Error: {}", 
                               expense.getId(), ex.getMessage(), ex);
                    }
                });
            } else {
                log.error("Failed to get user details for expense event: {}, Status code: {}", 
                         expense.getId(), 
                         userResponse.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Error publishing expense event for ID: {}, Error: {}", 
                     expense.getId(), e.getMessage(), e);
        }
    }
    
    public record ExpenseEvent(
        UUID id,
        UUID userId,
        String userEmail,
        String title,
        String description,
        String amount,
        String currency,
        String category,
        String status,
        String expenseDate
    ) {}
} 