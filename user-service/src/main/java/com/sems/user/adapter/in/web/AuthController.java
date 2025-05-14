package com.sems.user.adapter.in.web;

import com.sems.user.adapter.in.web.dto.AuthRequest;
import com.sems.user.adapter.in.web.dto.AuthResponse;
import com.sems.user.adapter.in.web.dto.CreateUserRequest;
import com.sems.user.adapter.in.web.dto.UserResponse;
import com.sems.user.domain.model.User;
import com.sems.user.domain.model.UserRole;
import com.sems.user.domain.port.in.AuthenticationUseCase;
import com.sems.user.domain.port.in.UserManagementUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication API")
public class AuthController {

    private final AuthenticationUseCase authenticationUseCase;
    private final UserManagementUseCase userManagementUseCase;
    private final UserDtoMapper userDtoMapper;

    @PostMapping("/login")
    @Operation(summary = "Login with email and password", description = "Validates credentials and returns JWT token")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        String token = authenticationUseCase.login(request.getEmail(), request.getPassword());
        User user = authenticationUseCase.getCurrentUser();
        AuthResponse response = new AuthResponse(token);
        response.setUser(userDtoMapper.toDto(user));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new user", description = "Creates a new user account with USER role")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody CreateUserRequest request) {
        // Default registered users to USER role
        if (request.getRole() == null) {
            request.setRole(UserRole.USER);
        }
        
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

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user", description = "Returns the current authenticated user information")
    public ResponseEntity<UserResponse> getCurrentUser() {
        User user = authenticationUseCase.getCurrentUser();
        return ResponseEntity.ok(userDtoMapper.toDto(user));
    }
} 