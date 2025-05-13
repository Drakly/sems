package com.sems.expense.adapter.persistence;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.sems.expense.adapter.persistence.mapper.ExpensePersistenceMapper;
import com.sems.expense.adapter.persistence.repository.ExpenseJpaRepository;
import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;
import com.sems.expense.domain.port.ExpenseRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ExpenseRepositoryAdapter implements ExpenseRepository {
    
    private final ExpenseJpaRepository expenseRepository;
    private final ExpensePersistenceMapper mapper;
    
    @Override
    public Expense save(Expense expense) {
        if (expense.getId() == null) {
            expense.setId(UUID.randomUUID());
        }
        
        if (expense.getCreatedAt() == null) {
            expense.setCreatedAt(LocalDateTime.now());
        }
        
        expense.setUpdatedAt(LocalDateTime.now());
        
        var entity = mapper.toEntity(expense);
        var savedEntity = expenseRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }
    
    @Override
    public Optional<Expense> findById(UUID id) {
        return expenseRepository.findById(id.toString())
                .map(mapper::toDomain);
    }
    
    @Override
    public List<Expense> findByUserId(UUID userId) {
        return mapper.toDomainList(
                expenseRepository.findByUserId(userId.toString())
        );
    }
    
    @Override
    public List<Expense> findByUserIdAndStatus(UUID userId, ExpenseStatus status) {
        return mapper.toDomainList(
                expenseRepository.findByUserIdAndStatus(userId.toString(), status)
        );
    }
    
    @Override
    public List<Expense> findByStatus(ExpenseStatus status) {
        return mapper.toDomainList(
                expenseRepository.findByStatus(status)
        );
    }
    
    @Override
    public List<Expense> findByExpenseDateBetween(LocalDate startDate, LocalDate endDate) {
        return mapper.toDomainList(
                expenseRepository.findByDateBetween(startDate, endDate)
        );
    }
    
    @Override
    public List<Expense> findByUserIdAndExpenseDateBetween(UUID userId, LocalDate startDate, LocalDate endDate) {
        return mapper.toDomainList(
                expenseRepository.findByUserIdAndDateBetween(userId.toString(), startDate, endDate)
        );
    }
    
    @Override
    public void deleteById(UUID id) {
        expenseRepository.deleteById(id.toString());
    }
    
    @Override
    public List<Expense> findAll() {
        return mapper.toDomainList(
                expenseRepository.findAll()
        );
    }
    
    @Override
    public boolean existsById(UUID id) {
        return expenseRepository.existsById(id.toString());
    }
    
    @Override
    public List<Expense> findAllById(Collection<UUID> ids) {
        Collection<String> stringIds = ids.stream()
                .map(UUID::toString)
                .collect(Collectors.toList());
        return mapper.toDomainList(
                expenseRepository.findAllById(stringIds)
        );
    }
    
    @Override
    public List<Expense> findByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses) {
        // Since our JPA repository doesn't have this method, we'll implement it by filtering
        // the results from findAll()
        return findAll().stream()
                .filter(e -> e.getCurrentApprovalLevel() != null 
                        && e.getCurrentApprovalLevel().equals(level)
                        && statuses.contains(e.getStatus()))
                .collect(Collectors.toList());
    }
    
    @Override
    public long countByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses) {
        return findByCurrentApprovalLevelAndStatusIn(level, statuses).size();
    }
    
    @Override
    public BigDecimal sumAmountByCurrentApprovalLevelAndStatusIn(Integer level, Collection<ExpenseStatus> statuses) {
        return findByCurrentApprovalLevelAndStatusIn(level, statuses).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
    
    @Override
    public List<Expense> findByStatusAndAmountLessThanEqual(ExpenseStatus status, BigDecimal amount) {
        // Since our JPA repository doesn't have this method, we'll implement it by filtering
        // the results from findByStatus()
        return findByStatus(status).stream()
                .filter(e -> e.getAmount().compareTo(amount) <= 0)
                .collect(Collectors.toList());
    }
    
    // This method is not in the interface, but was being called in the adapter
    public Optional<Expense> findByIdAndUserId(UUID id, UUID userId) {
        return expenseRepository.findByIdAndUserId(id.toString(), userId.toString())
                .map(mapper::toDomain);
    }
} 