package com.sems.reporting.domain.port.out;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface ExpenseDataClient {
    
    List<Map<String, Object>> getExpensesByUserAndDateRange(UUID userId, LocalDateTime start, LocalDateTime end);
    
    List<Map<String, Object>> getExpensesByDepartmentAndDateRange(String department, LocalDateTime start, LocalDateTime end);
    
    Map<String, Object> getBudgetAnalysis(UUID userId, LocalDateTime start, LocalDateTime end);
} 