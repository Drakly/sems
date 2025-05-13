package com.sems.user.adapter.in.web;

import com.sems.user.adapter.in.web.dto.CreateUserRequest;
import com.sems.user.adapter.in.web.dto.UpdateRolesRequest;
import com.sems.user.adapter.in.web.dto.UpdateUserRequest;
import com.sems.user.adapter.in.web.dto.UserResponse;
import com.sems.user.application.exception.ResourceNotFoundException;
import com.sems.user.domain.model.User;
import com.sems.user.domain.port.in.UserManagementUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User Management API")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserManagementUseCase userManagementUseCase;
    private final UserDtoMapper userDtoMapper;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users", description = "Returns a list of all users (Admin only)")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userManagementUseCase.getAllUsers();
        List<UserResponse> userResponses = users.stream()
                .map(userDtoMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    @Operation(summary = "Get user by ID", description = "Returns a user by their ID")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return userManagementUseCase.getUserById(id)
                .map(userDtoMapper::toDto)
                .map(ResponseEntity::ok)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new user", description = "Creates a new user (Admin only)")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        User newUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .department(request.getDepartment())
                .role(request.getRole())
                .build();
        
        User createdUser = userManagementUseCase.createUser(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDtoMapper.toDto(createdUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    @Operation(summary = "Update a user", description = "Updates a user's profile information")
    public ResponseEntity<UserResponse> updateUser(@PathVariable UUID id, @Valid @RequestBody UpdateUserRequest request) {
        User userToUpdate = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .department(request.getDepartment())
                .build();
        
        User updatedUser = userManagementUseCase.updateUser(id, userToUpdate);
        return ResponseEntity.ok(userDtoMapper.toDto(updatedUser));
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user roles", description = "Updates a user's role (Admin only)")
    public ResponseEntity<UserResponse> updateUserRoles(@PathVariable UUID id, @Valid @RequestBody UpdateRolesRequest request) {
        User updatedUser = userManagementUseCase.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(userDtoMapper.toDto(updatedUser));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate user", description = "Activates a user account (Admin only)")
    public ResponseEntity<UserResponse> activateUser(@PathVariable UUID id) {
        User updatedUser = userManagementUseCase.activateUser(id);
        return ResponseEntity.ok(userDtoMapper.toDto(updatedUser));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate user", description = "Deactivates a user account (Admin only)")
    public ResponseEntity<UserResponse> deactivateUser(@PathVariable UUID id) {
        User updatedUser = userManagementUseCase.deactivateUser(id);
        return ResponseEntity.ok(userDtoMapper.toDto(updatedUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete user", description = "Deletes a user account (Admin only)")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userManagementUseCase.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
} 