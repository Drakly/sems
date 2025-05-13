package com.sems.expense.application.service;

import com.sems.expense.adapter.client.UserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserValidationService {
    private final UserServiceClient userServiceClient;
    
    public boolean validateUserExists(UUID userId) {
        try {
            var response = userServiceClient.getUserById(userId);
            return response.getStatusCode().is2xxSuccessful() && response.getBody() != null;
        } catch (Exception e) {
            log.error("Error validating user with ID {}: {}", userId, e.getMessage());
            return false;
        }
    }
    
    public boolean validateUserActive(UUID userId) {
        try {
            var response = userServiceClient.getUserById(userId);
            return response.getStatusCode().is2xxSuccessful() 
                && response.getBody() != null 
                && response.getBody().active();
        } catch (Exception e) {
            log.error("Error validating user active status with ID {}: {}", userId, e.getMessage());
            return false;
        }
    }
} 