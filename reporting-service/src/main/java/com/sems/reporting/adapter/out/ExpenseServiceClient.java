package com.sems.reporting.adapter.out;

import com.sems.reporting.domain.port.out.ExpenseDataClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ExpenseServiceClient implements ExpenseDataClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${services.expense.url}")
    private String expenseServiceUrl;
    
    @Override
    public List<Map<String, Object>> getExpensesByUserAndDateRange(UUID userId, LocalDateTime start, LocalDateTime end) {
        try {
            String url = UriComponentsBuilder.fromUriString(expenseServiceUrl)
                    .path("/api/v1/expenses/user/{userId}")
                    .queryParam("startDate", start.format(DateTimeFormatter.ISO_DATE_TIME))
                    .queryParam("endDate", end.format(DateTimeFormatter.ISO_DATE_TIME))
                    .buildAndExpand(userId)
                    .toUriString();
            
            return restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            ).getBody();
        } catch (Exception e) {
            log.error("Error fetching expenses for user {}: {}", userId, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public List<Map<String, Object>> getExpensesByDepartmentAndDateRange(String department, LocalDateTime start, LocalDateTime end) {
        try {
            String url = UriComponentsBuilder.fromUriString(expenseServiceUrl)
                    .path("/api/v1/expenses/department/{department}")
                    .queryParam("startDate", start.format(DateTimeFormatter.ISO_DATE_TIME))
                    .queryParam("endDate", end.format(DateTimeFormatter.ISO_DATE_TIME))
                    .buildAndExpand(department)
                    .toUriString();
            
            return restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            ).getBody();
        } catch (Exception e) {
            log.error("Error fetching expenses for department {}: {}", department, e.getMessage(), e);
            return Collections.emptyList();
        }
    }
    
    @Override
    public Map<String, Object> getBudgetAnalysis(UUID userId, LocalDateTime start, LocalDateTime end) {
        try {
            String url = UriComponentsBuilder.fromUriString(expenseServiceUrl)
                    .path("/api/v1/budget/analysis/{userId}")
                    .queryParam("startDate", start.format(DateTimeFormatter.ISO_DATE_TIME))
                    .queryParam("endDate", end.format(DateTimeFormatter.ISO_DATE_TIME))
                    .buildAndExpand(userId)
                    .toUriString();
            
            return restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            ).getBody();
        } catch (Exception e) {
            log.error("Error fetching budget analysis for user {}: {}", userId, e.getMessage(), e);
            return Collections.emptyMap();
        }
    }
} 