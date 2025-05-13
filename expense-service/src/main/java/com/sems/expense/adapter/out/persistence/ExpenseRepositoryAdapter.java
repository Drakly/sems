package com.sems.expense.adapter.out.persistence;

import com.sems.expense.adapter.out.persistence.entity.ExpenseEntity;
import com.sems.expense.adapter.out.persistence.entity.ExpenseStatusEntity;
import com.sems.expense.adapter.out.persistence.repository.JpaExpenseRepository;
import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;
import com.sems.expense.domain.port.out.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ExpenseRepositoryAdapter implements ExpenseRepository, com.sems.expense.domain.port.ExpenseRepository {

    private final JpaExpenseRepository jpaExpenseRepository;
    private final ExpenseMapper mapper;

    @Override
    public Expense save(Expense expense) {
        ExpenseEntity entity = mapper.toEntity(expense);
        ExpenseEntity savedEntity = jpaExpenseRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Expense> findById(UUID id) {
        return jpaExpenseRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public List<Expense> findAll() {
        return jpaExpenseRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findBySubmittedBy(UUID userId) {
        return jpaExpenseRepository.findBySubmittedBy(userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByUserId(UUID userId) {
        return findBySubmittedBy(userId);
    }

    @Override
    public List<Expense> findByStatus(ExpenseStatus status) {
        ExpenseStatusEntity statusEntity = mapStatusToEntity(status);
        return jpaExpenseRepository.findByStatus(statusEntity).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByUserIdAndStatus(UUID userId, ExpenseStatus status) {
        return findByStatusAndSubmittedBy(status, userId);
    }

    @Override
    public List<Expense> findByStatusAndSubmittedBy(ExpenseStatus status, UUID userId) {
        ExpenseStatusEntity statusEntity = mapStatusToEntity(status);
        return jpaExpenseRepository.findByStatusAndSubmittedBy(statusEntity, userId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByDepartmentId(UUID departmentId) {
        return jpaExpenseRepository.findByDepartmentId(departmentId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByProjectId(UUID projectId) {
        return jpaExpenseRepository.findByProjectId(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate) {
        return jpaExpenseRepository.findByExpenseDateBetween(startDate, endDate).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByUserIdAndDateBetween(UUID userId, LocalDate startDate, LocalDate endDate) {
        return jpaExpenseRepository.findBySubmittedByAndExpenseDateBetween(userId, startDate, endDate).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByUserIdAndExpenseDateBetween(UUID userId, LocalDate startDate, LocalDate endDate) {
        return findByUserIdAndDateBetween(userId, startDate, endDate);
    }

    @Override
    public void deleteById(UUID id) {
        jpaExpenseRepository.deleteById(id);
    }

    @Override
    public boolean existsById(UUID id) {
        return jpaExpenseRepository.existsById(id);
    }

    @Override
    public List<Expense> findAllById(Collection<UUID> ids) {
        return jpaExpenseRepository.findAllById(ids).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Expense> findByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses) {
        Collection<ExpenseStatusEntity> statusEntities = statuses.stream()
                .map(this::mapStatusToEntity)
                .collect(Collectors.toList());
                
        return jpaExpenseRepository.findByCurrentApprovalLevelAndStatusIn(level, statusEntities)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public long countByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses) {
        Collection<ExpenseStatusEntity> statusEntities = statuses.stream()
                .map(this::mapStatusToEntity)
                .collect(Collectors.toList());
                
        return jpaExpenseRepository.countByCurrentApprovalLevelAndStatusIn(level, statusEntities);
    }

    @Override
    public BigDecimal sumAmountByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses) {
        Collection<ExpenseStatusEntity> statusEntities = statuses.stream()
                .map(this::mapStatusToEntity)
                .collect(Collectors.toList());
                
        BigDecimal result = jpaExpenseRepository.sumAmountByCurrentApprovalLevelAndStatusIn(level, statusEntities);
        return result != null ? result : BigDecimal.ZERO;
    }

    @Override
    public List<Expense> findByStatusAndAmountLessThanEqual(ExpenseStatus status, BigDecimal amount) {
        ExpenseStatusEntity statusEntity = mapStatusToEntity(status);
        return jpaExpenseRepository.findByStatusAndAmountLessThanEqual(statusEntity, amount)
                .stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    private ExpenseStatusEntity mapStatusToEntity(ExpenseStatus status) {
        if (status == null) {
            return ExpenseStatusEntity.DRAFT;
        }
        
        try {
            return ExpenseStatusEntity.valueOf(status.name());
        } catch (IllegalArgumentException e) {
            return ExpenseStatusEntity.DRAFT;
        }
    }
} 