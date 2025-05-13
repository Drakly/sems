package com.sems.expense.application.service;

import com.sems.expense.domain.model.Budget;
import com.sems.expense.domain.model.Expense;
import com.sems.expense.domain.port.in.BudgetManagementUseCase;
import com.sems.expense.domain.port.out.BudgetRepository;
import com.sems.expense.domain.port.out.ExpenseRepository;
import com.sems.expense.application.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService implements BudgetManagementUseCase {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;
    private final UserValidationService userValidationService;

    @Override
    @Transactional
    public Budget createBudget(Budget budget) {
        log.info("Creating budget: {}", budget);
        userValidationService.validateUserExists(budget.getUserId());
        return budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public Budget updateBudget(UUID id, Budget budget) {
        log.info("Updating budget {} with data: {}", id, budget);
        Budget existingBudget = getBudgetById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        existingBudget.setName(budget.getName());
        existingBudget.setAmount(budget.getAmount());
        existingBudget.setCategoryIds(budget.getCategoryIds());
        existingBudget.setStartDate(budget.getStartDate());
        existingBudget.setEndDate(budget.getEndDate());
        existingBudget.setActive(budget.isActive());
        
        return budgetRepository.save(existingBudget);
    }

    @Override
    @Transactional
    public void deleteBudget(UUID id) {
        log.info("Deleting budget with id: {}", id);
        Budget budget = getBudgetById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        budgetRepository.delete(budget);
    }

    @Override
    public Optional<Budget> getBudgetById(UUID id) {
        return budgetRepository.findById(id);
    }

    @Override
    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    @Override
    public List<Budget> getActiveBudgets() {
        return budgetRepository.findByActiveTrue();
    }

    @Override
    public List<Budget> getBudgetsByDepartment(UUID departmentId) {
        return budgetRepository.findByDepartmentId(departmentId);
    }

    @Override
    public List<Budget> getBudgetsByProject(UUID projectId) {
        return budgetRepository.findByProjectId(projectId);
    }

    @Override
    public List<Budget> getActiveBudgetsByDepartment(UUID departmentId) {
        return budgetRepository.findByDepartmentIdAndActiveTrue(departmentId);
    }

    @Override
    public List<Budget> getActiveBudgetsByProject(UUID projectId) {
        return budgetRepository.findByProjectIdAndActiveTrue(projectId);
    }

    @Override
    public List<Budget> getBudgetsForDate(LocalDate date) {
        return budgetRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(date, date);
    }

    @Override
    @Transactional
    public Budget updateBudgetAmount(UUID id, BigDecimal newAmount) {
        Budget budget = getBudgetById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        budget.setAmount(newAmount);
        return budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public Budget activateBudget(UUID id) {
        Budget budget = getBudgetById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        budget.setActive(true);
        return budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public Budget deactivateBudget(UUID id) {
        Budget budget = getBudgetById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + id));
        
        budget.setActive(false);
        return budgetRepository.save(budget);
    }

    @Override
    @Transactional
    public Budget allocateExpenseToBudget(UUID budgetId, BigDecimal amount) {
        Budget budget = getBudgetById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));
        
        // Update the spent amount
        BigDecimal currentSpent = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
        budget.setSpentAmount(currentSpent.add(amount));
        
        return budgetRepository.save(budget);
    }
    
    /**
     * Calculate the percentage of budget used
     * @param budget The budget to analyze
     * @return Percentage of budget used (0-100)
     */
    public BigDecimal calculateBudgetUtilization(Budget budget) {
        if (budget.getAmount().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal spentAmount = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
        return spentAmount.multiply(new BigDecimal("100"))
                .divide(budget.getAmount(), 2, RoundingMode.HALF_UP);
    }
    
    /**
     * Analyze a user's budget utilization for a specific period
     * @param userId User ID
     * @param startDate Start date for analysis
     * @param endDate End date for analysis
     * @return Map with budget analysis data
     */
    public Map<String, Object> analyzeBudgetUtilization(UUID userId, LocalDate startDate, LocalDate endDate) {
        // Get all active budgets for the given period first
        List<Budget> activeBudgets = budgetRepository.findByActiveTrue();
        
        // Then filter by date range manually
        List<Budget> userBudgets = activeBudgets.stream()
                .filter(budget -> !budget.getStartDate().isAfter(endDate) && !budget.getEndDate().isBefore(startDate))
                .collect(Collectors.toList());
        
        // Get expenses for the user in the period
        List<Expense> userExpenses = expenseRepository.findByUserIdAndDateBetween(userId, startDate, endDate);
        
        // Calculate summary statistics
        BigDecimal totalBudget = userBudgets.stream()
                .map(Budget::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalSpent = userExpenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalRemaining = totalBudget.subtract(totalSpent);
        
        // Calculate utilization metrics
        BigDecimal utilizationRate = BigDecimal.ZERO;
        if (totalBudget.compareTo(BigDecimal.ZERO) > 0) {
            utilizationRate = totalSpent.multiply(new BigDecimal("100"))
                    .divide(totalBudget, 2, RoundingMode.HALF_UP);
        }
        
        // Calculate per-category breakdown
        Map<UUID, BigDecimal> categoryExpenses = userExpenses.stream()
                .collect(Collectors.groupingBy(
                        Expense::getCategoryId,
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));
        
        // Compile the analysis
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("userId", userId);
        analysis.put("startDate", startDate);
        analysis.put("endDate", endDate);
        analysis.put("totalBudget", totalBudget);
        analysis.put("totalSpent", totalSpent);
        analysis.put("totalRemaining", totalRemaining);
        analysis.put("utilizationRate", utilizationRate);
        analysis.put("budgetCount", userBudgets.size());
        analysis.put("expenseCount", userExpenses.size());
        analysis.put("categoryBreakdown", categoryExpenses);
        
        // Add detailed budget information
        List<Map<String, Object>> budgetDetails = userBudgets.stream().map(budget -> {
            Map<String, Object> detail = new HashMap<>();
            detail.put("id", budget.getId());
            detail.put("name", budget.getName());
            detail.put("amount", budget.getAmount());
            detail.put("spentAmount", budget.getSpentAmount());
            detail.put("utilizationPercentage", calculateBudgetUtilization(budget));
            return detail;
        }).collect(Collectors.toList());
        
        analysis.put("budgets", budgetDetails);
        
        return analysis;
    }
    
    /**
     * Check if a budget is at risk of being overrun
     * @param budgetId Budget ID
     * @return Risk assessment
     */
    public Map<String, Object> assessBudgetRisk(UUID budgetId) {
        Budget budget = getBudgetById(budgetId)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found with id: " + budgetId));
        
        BigDecimal utilizationRate = calculateBudgetUtilization(budget);
        BigDecimal timeProgress = calculateTimeProgress(budget);
        
        // Budget is at risk if spending rate is higher than time progress
        boolean isAtRisk = utilizationRate.compareTo(timeProgress) > 0;
        String riskLevel = assessRiskLevel(utilizationRate, timeProgress);
        
        LocalDate projectedExhaustionDate = null;
        if (utilizationRate.compareTo(BigDecimal.ZERO) > 0) {
            // Calculate daily burn rate
            BigDecimal totalDays = new BigDecimal(budget.getEndDate().toEpochDay() - budget.getStartDate().toEpochDay());
            BigDecimal spentAmount = budget.getSpentAmount() != null ? budget.getSpentAmount() : BigDecimal.ZERO;
            BigDecimal dailySpend = spentAmount.divide(timeProgress.multiply(totalDays).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP), 2, RoundingMode.HALF_UP);
            
            // Project days until exhaustion
            BigDecimal remainingAmount = budget.getAmount().subtract(spentAmount);
            if (dailySpend.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal daysUntilExhaustion = remainingAmount.divide(dailySpend, 0, RoundingMode.FLOOR);
                projectedExhaustionDate = LocalDate.now().plusDays(daysUntilExhaustion.longValue());
            }
        }
        
        Map<String, Object> assessment = new HashMap<>();
        assessment.put("budgetId", budgetId);
        assessment.put("utilizationRate", utilizationRate);
        assessment.put("timeProgress", timeProgress);
        assessment.put("isAtRisk", isAtRisk);
        assessment.put("riskLevel", riskLevel);
        assessment.put("projectedExhaustionDate", projectedExhaustionDate);
        
        return assessment;
    }
    
    private BigDecimal calculateTimeProgress(Budget budget) {
        long totalDays = budget.getEndDate().toEpochDay() - budget.getStartDate().toEpochDay();
        long elapsedDays = LocalDate.now().toEpochDay() - budget.getStartDate().toEpochDay();
        
        if (totalDays <= 0) {
            return new BigDecimal("100");
        }
        
        // Calculate time progress as percentage
        return new BigDecimal(elapsedDays)
                .multiply(new BigDecimal("100"))
                .divide(new BigDecimal(totalDays), 2, RoundingMode.HALF_UP);
    }
    
    private String assessRiskLevel(BigDecimal utilizationRate, BigDecimal timeProgress) {
        BigDecimal difference = utilizationRate.subtract(timeProgress);
        
        if (difference.compareTo(new BigDecimal("20")) > 0) {
            return "HIGH";
        } else if (difference.compareTo(new BigDecimal("10")) > 0) {
            return "MEDIUM";
        } else if (difference.compareTo(BigDecimal.ZERO) > 0) {
            return "LOW";
        } else {
            return "NONE";
        }
    }
} 