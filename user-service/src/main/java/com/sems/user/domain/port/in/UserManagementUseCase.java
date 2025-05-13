package com.sems.user.domain.port.in;

import com.sems.user.domain.model.User;
import com.sems.user.domain.model.UserRole;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserManagementUseCase {
    User createUser(User user);
    User updateUser(UUID id, User user);
    void deleteUser(UUID id);
    Optional<User> getUserById(UUID id);
    Optional<User> getUserByEmail(String email);
    List<User> getAllUsers();
    User updateUserRole(UUID id, UserRole role);
    User activateUser(UUID id);
    User deactivateUser(UUID id);
} 