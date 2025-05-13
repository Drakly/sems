package com.sems.expense.adapter.messaging;

import com.sems.expense.adapter.client.UserServiceClient;
import com.sems.expense.domain.model.Expense;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ExpenseEventPublisher {
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final UserServiceClient userServiceClient;
    
    @Value("${app.kafka.topics.expense-event}")
    private String expenseEventTopic;
    
    public void publishExpenseStatusChange(Expense expense) {
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
                    expense.getAmount().toString(),
                    expense.getCurrency().toString(),
                    expense.getCategory().toString(),
                    expense.getStatus().toString(),
                    expense.getExpenseDate().toString()
                );
                
                kafkaTemplate.send(expenseEventTopic, expense.getId().toString(), event);
                log.info("Published expense event for ID: {}, Status: {}", 
                         expense.getId(), expense.getStatus());
            } else {
                log.error("Failed to get user details for expense event: {}", expense.getId());
            }
        } catch (Exception e) {
            log.error("Error publishing expense event: {}", e.getMessage(), e);
        }
    }
    
    record ExpenseEvent(
        java.util.UUID id,
        java.util.UUID userId,
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