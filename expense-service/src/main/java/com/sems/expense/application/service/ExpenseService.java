package com.sems.expense.application.service;

import com.sems.expense.application.dto.CreateExpenseRequest;
import com.sems.expense.application.dto.ExpenseResponse;
import com.sems.expense.application.dto.UpdateExpenseRequest;
import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.model.ExpenseStatus;
import com.sems.expense.domain.port.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseService {
    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final UserValidationService userValidationService;
    private final com.sems.expense.adapter.messaging.ExpenseEventPublisher eventPublisher;

    @Transactional
    public ExpenseResponse createExpense(CreateExpenseRequest request) {
        // Validate that the user exists and is active
        if (!userValidationService.validateUserExists(request.getUserId())) {
            throw new RuntimeException("User not found");
        }
        
        if (!userValidationService.validateUserActive(request.getUserId())) {
            throw new RuntimeException("User is not active");
        }
        
        Expense expense = expenseMapper.toEntity(request);
        expense.setId(UUID.randomUUID());
        expense.setStatus(ExpenseStatus.DRAFT);
        expense.setCreatedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());
        
        Expense savedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(savedExpense);
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        return expenseMapper.toResponse(expense);
    }
    
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByUserId(UUID userId) {
        return expenseRepository.findByUserId(userId).stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByUserIdAndStatus(UUID userId, ExpenseStatus status) {
        return expenseRepository.findByUserIdAndStatus(userId, status).stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByStatus(ExpenseStatus status) {
        return expenseRepository.findByStatus(status).stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExpenseResponse updateExpense(UUID id, UpdateExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        // Only allow updates if expense is in DRAFT status
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new RuntimeException("Cannot update expense that is not in DRAFT status");
        }
        
        expenseMapper.updateEntity(request, expense);
        expense.setUpdatedAt(LocalDateTime.now());
        
        Expense updatedExpense = expenseRepository.save(expense);
        return expenseMapper.toResponse(updatedExpense);
    }
    
    @Transactional
    public ExpenseResponse submitExpense(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new RuntimeException("Only expenses in DRAFT status can be submitted");
        }
        
        expense.setStatus(ExpenseStatus.SUBMITTED);
        expense.setUpdatedAt(LocalDateTime.now());
        
        Expense submittedExpense = expenseRepository.save(expense);
        
        // Publish event for the status change
        eventPublisher.publishExpenseStatusChange(submittedExpense);
        
        return expenseMapper.toResponse(submittedExpense);
    }
    
    @Transactional
    public ExpenseResponse approveExpense(UUID id, UUID approverId) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new RuntimeException("Expense must be in SUBMITTED or UNDER_REVIEW status to be approved");
        }
        
        expense.setStatus(ExpenseStatus.APPROVED);
        expense.setApprovedBy(approverId);
        expense.setApprovedAt(LocalDateTime.now());
        expense.setUpdatedAt(LocalDateTime.now());
        
        Expense approvedExpense = expenseRepository.save(expense);
        
        // Publish event for the status change
        eventPublisher.publishExpenseStatusChange(approvedExpense);
        
        return expenseMapper.toResponse(approvedExpense);
    }
    
    @Transactional
    public ExpenseResponse rejectExpense(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (expense.getStatus() != ExpenseStatus.SUBMITTED && expense.getStatus() != ExpenseStatus.UNDER_REVIEW) {
            throw new RuntimeException("Expense must be in SUBMITTED or UNDER_REVIEW status to be rejected");
        }
        
        expense.setStatus(ExpenseStatus.REJECTED);
        expense.setUpdatedAt(LocalDateTime.now());
        
        Expense rejectedExpense = expenseRepository.save(expense);
        
        // Publish event for the status change
        eventPublisher.publishExpenseStatusChange(rejectedExpense);
        
        return expenseMapper.toResponse(rejectedExpense);
    }

    @Transactional
    public void deleteExpense(UUID id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        
        if (expense.getStatus() != ExpenseStatus.DRAFT) {
            throw new RuntimeException("Only expenses in DRAFT status can be deleted");
        }
        
        expenseRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByDateRange(LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByExpenseDateBetween(startDate, endDate).stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getExpensesByUserIdAndDateRange(UUID userId, LocalDate startDate, LocalDate endDate) {
        return expenseRepository.findByUserIdAndExpenseDateBetween(userId, startDate, endDate).stream()
                .map(expenseMapper::toResponse)
                .collect(Collectors.toList());
    }
} 