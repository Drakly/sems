package com.sems.expense.adapter.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "user-service", path = "/users/api/users")
public interface UserServiceClient {

    @GetMapping("/{id}")
    ResponseEntity<UserDto> getUserById(@PathVariable UUID id);
    
    record UserDto(UUID id, String username, String email, String firstName, String lastName, String role, boolean active) {}
} 