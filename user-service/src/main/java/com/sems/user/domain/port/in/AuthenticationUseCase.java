package com.sems.user.domain.port.in;

import com.sems.user.domain.model.User;

public interface AuthenticationUseCase {
    String login(String email, String password);
    User getCurrentUser();
} 