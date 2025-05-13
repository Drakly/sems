package com.sems.expense.adapter.persistence.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sems.expense.adapter.persistence.entity.ExpenseEntity;
import com.sems.expense.domain.model.ExpenseStatus;

@Repository
public interface ExpenseJpaRepository extends JpaRepository<ExpenseEntity, String> {
    
    List<ExpenseEntity> findByUserId(String userId);
    
    List<ExpenseEntity> findByUserIdAndStatus(String userId, ExpenseStatus status);
    
    List<ExpenseEntity> findByStatus(ExpenseStatus status);
    
    List<ExpenseEntity> findByApproverId(String approverId);
    
    @Query("SELECT e FROM ExpenseEntity e WHERE e.userId = :userId AND e.date BETWEEN :startDate AND :endDate")
    List<ExpenseEntity> findByUserIdAndDateBetween(
            @Param("userId") String userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e FROM ExpenseEntity e WHERE e.date BETWEEN :startDate AND :endDate")
    List<ExpenseEntity> findByDateBetween(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
    
    Optional<ExpenseEntity> findByIdAndUserId(String id, String userId);
} 