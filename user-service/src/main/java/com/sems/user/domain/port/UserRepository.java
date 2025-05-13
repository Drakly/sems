package com.sems.user.domain.port;

import com.sems.user.domain.model.User;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository {
    User save(User user);
    Optional<User> findById(UUID id);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findAll();
    void deleteById(UUID id);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
} 