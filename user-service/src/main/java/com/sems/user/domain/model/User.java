package com.sems.user.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    private UUID id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String department;
    private String passwordHash;
    private UserRole role;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public String getPassword() {
        return passwordHash;
    }
    
    public Set<UserRole> getRoles() {
        return Collections.singleton(this.role);
    }
    
    public UserRole getRole() {
        return this.role;
    }
} 