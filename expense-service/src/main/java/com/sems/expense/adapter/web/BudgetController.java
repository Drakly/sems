package com.sems.expense.adapter.web;

import com.sems.expense.adapter.web.dto.BudgetCreateRequest;
import com.sems.expense.adapter.web.dto.BudgetResponse;
import com.sems.expense.adapter.web.dto.BudgetUpdateRequest;
import com.sems.expense.application.service.BudgetService;
import com.sems.expense.domain.model.Budget;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/budgets")
@Tag(name = "Budget Management", description = "APIs for budget management and tracking")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;
    private final BudgetMapper budgetMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new budget")
    public BudgetResponse createBudget(@Valid @RequestBody BudgetCreateRequest request) {
        log.info("Creating budget from request: {}", request);
        Budget budget = budgetMapper.toBudgetEntity(request);
        Budget createdBudget = budgetService.createBudget(budget);
        return budgetMapper.toBudgetResponse(createdBudget);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get budget by ID")
    public ResponseEntity<BudgetResponse> getBudgetById(@PathVariable UUID id) {
        return budgetService.getBudgetById(id)
                .map(budget -> ResponseEntity.ok(budgetMapper.toBudgetResponse(budget)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    @Operation(summary = "Get all budgets or filter by active status")
    public List<BudgetResponse> getBudgets(@RequestParam(required = false) Boolean active) {
        List<Budget> budgets = active != null && active 
                ? budgetService.getActiveBudgets() 
                : budgetService.getAllBudgets();
        
        return budgets.stream()
                .map(budgetMapper::toBudgetResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/date/{date}")
    @Operation(summary = "Get budgets for a specific date")
    public List<BudgetResponse> getBudgetsByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return budgetService.getBudgetsForDate(date).stream()
                .map(budgetMapper::toBudgetResponse)
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get budgets for a specific user in a date range")
    public ResponseEntity<Map<String, Object>> getUserBudgetAnalysis(
            @PathVariable UUID userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        Map<String, Object> analysis = budgetService.analyzeBudgetUtilization(userId, startDate, endDate);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/{id}/risk")
    @Operation(summary = "Assess budget risk")
    public ResponseEntity<Map<String, Object>> assessBudgetRisk(@PathVariable UUID id) {
        Map<String, Object> riskAssessment = budgetService.assessBudgetRisk(id);
        return ResponseEntity.ok(riskAssessment);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a budget")
    public BudgetResponse updateBudget(
            @PathVariable UUID id,
            @Valid @RequestBody BudgetUpdateRequest request) {
        
        Budget budget = budgetMapper.toBudgetEntity(request);
        Budget updatedBudget = budgetService.updateBudget(id, budget);
        return budgetMapper.toBudgetResponse(updatedBudget);
    }

    @PatchMapping("/{id}/amount")
    @Operation(summary = "Update budget amount")
    public BudgetResponse updateBudgetAmount(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount) {
        
        Budget updatedBudget = budgetService.updateBudgetAmount(id, amount);
        return budgetMapper.toBudgetResponse(updatedBudget);
    }

    @PatchMapping("/{id}/activate")
    @Operation(summary = "Activate a budget")
    public BudgetResponse activateBudget(@PathVariable UUID id) {
        Budget updatedBudget = budgetService.activateBudget(id);
        return budgetMapper.toBudgetResponse(updatedBudget);
    }

    @PatchMapping("/{id}/deactivate")
    @Operation(summary = "Deactivate a budget")
    public BudgetResponse deactivateBudget(@PathVariable UUID id) {
        Budget updatedBudget = budgetService.deactivateBudget(id);
        return budgetMapper.toBudgetResponse(updatedBudget);
    }

    @PatchMapping("/{id}/allocate")
    @Operation(summary = "Allocate expense amount to budget")
    public BudgetResponse allocateExpense(
            @PathVariable UUID id,
            @RequestParam BigDecimal amount) {
        
        Budget updatedBudget = budgetService.allocateExpenseToBudget(id, amount);
        return budgetMapper.toBudgetResponse(updatedBudget);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a budget")
    public void deleteBudget(@PathVariable UUID id) {
        budgetService.deleteBudget(id);
    }
} 