package com.sems.expense.domain.port.out;

import com.sems.expense.domain.model.ApprovalLevel;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ApprovalLevelRepository {
    ApprovalLevel save(ApprovalLevel approvalLevel);
    Optional<ApprovalLevel> findById(UUID id);
    void delete(ApprovalLevel approvalLevel);
    List<ApprovalLevel> findAll();
    List<ApprovalLevel> findByDepartmentId(UUID departmentId);
    List<ApprovalLevel> findByActive(boolean active);
    Optional<ApprovalLevel> findByLevelAndDepartmentId(Integer level, UUID departmentId);
    List<ApprovalLevel> findByAmountBetweenThresholds(BigDecimal amount);
    List<ApprovalLevel> findByRoleId(UUID roleId);
} 