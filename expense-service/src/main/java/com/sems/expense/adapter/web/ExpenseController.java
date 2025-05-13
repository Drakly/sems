package com.sems.expense.adapter.web;

import com.sems.expense.application.dto.CreateExpenseRequest;
import com.sems.expense.application.dto.ExpenseResponse;
import com.sems.expense.application.dto.UpdateExpenseRequest;
import com.sems.expense.application.service.ExpenseService;
import com.sems.expense.domain.model.ExpenseStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {
    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        return new ResponseEntity<>(expenseService.createExpense(request), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseResponse> getExpenseById(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(expenseService.getExpensesByUserId(userId));
    }
    
    @GetMapping("/user/{userId}/status/{status}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByUserIdAndStatus(
            @PathVariable UUID userId, 
            @PathVariable ExpenseStatus status) {
        return ResponseEntity.ok(expenseService.getExpensesByUserIdAndStatus(userId, status));
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByStatus(@PathVariable ExpenseStatus status) {
        return ResponseEntity.ok(expenseService.getExpensesByStatus(status));
    }
    
    @GetMapping
    public ResponseEntity<List<ExpenseResponse>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @PathVariable UUID id, 
            @Valid @RequestBody UpdateExpenseRequest request) {
        return ResponseEntity.ok(expenseService.updateExpense(id, request));
    }
    
    @PostMapping("/{id}/submit")
    public ResponseEntity<ExpenseResponse> submitExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.submitExpense(id));
    }
    
    @PostMapping("/{id}/approve")
    public ResponseEntity<ExpenseResponse> approveExpense(
            @PathVariable UUID id, 
            @RequestParam UUID approverId) {
        return ResponseEntity.ok(expenseService.approveExpense(id, approverId));
    }
    
    @PostMapping("/{id}/reject")
    public ResponseEntity<ExpenseResponse> rejectExpense(@PathVariable UUID id) {
        return ResponseEntity.ok(expenseService.rejectExpense(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable UUID id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getExpensesByDateRange(startDate, endDate));
    }
    
    @GetMapping("/user/{userId}/date-range")
    public ResponseEntity<List<ExpenseResponse>> getExpensesByUserIdAndDateRange(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getExpensesByUserIdAndDateRange(userId, startDate, endDate));
    }
} 