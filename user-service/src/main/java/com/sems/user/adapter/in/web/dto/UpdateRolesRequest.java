package com.sems.user.adapter.in.web.dto;

import com.sems.user.domain.model.UserRole;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRolesRequest {
    
    @NotNull(message = "Role is required")
    private UserRole role;
} 