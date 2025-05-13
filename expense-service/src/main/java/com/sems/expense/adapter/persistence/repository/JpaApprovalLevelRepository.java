package com.sems.expense.adapter.persistence.repository;

import com.sems.expense.adapter.persistence.entity.ApprovalLevelEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JpaApprovalLevelRepository extends JpaRepository<ApprovalLevelEntity, UUID> {
    
    List<ApprovalLevelEntity> findByDepartmentId(UUID departmentId);
    
    List<ApprovalLevelEntity> findByIsActive(boolean active);
    
    Optional<ApprovalLevelEntity> findByLevelAndDepartmentId(Integer level, UUID departmentId);
    
    @Query("SELECT a FROM ApprovalLevelEntity a WHERE a.minAmountThreshold <= :amount AND (a.maxAmountThreshold IS NULL OR a.maxAmountThreshold >= :amount)")
    List<ApprovalLevelEntity> findByAmountBetweenThresholds(@Param("amount") BigDecimal amount);
    
    List<ApprovalLevelEntity> findByRoleId(UUID roleId);
} 