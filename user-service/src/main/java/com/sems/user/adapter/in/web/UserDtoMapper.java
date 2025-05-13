package com.sems.user.adapter.in.web;

import com.sems.user.adapter.in.web.dto.UserResponse;
import com.sems.user.domain.model.UserRole;
import com.sems.user.domain.model.User;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserDtoMapper {

    public UserResponse toDto(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .department(user.getDepartment())
                .active(user.isActive())
                .roles(mapRolesToString(user.getRoles()))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    private Set<String> mapRolesToString(Set<UserRole> roles) {
        if (roles == null) {
            return null;
        }
        return roles.stream()
                .map(Enum::name)
                .collect(Collectors.toSet());
    }
} 