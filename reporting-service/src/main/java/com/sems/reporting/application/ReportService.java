package com.sems.reporting.application;

import com.sems.reporting.domain.model.Report;
import com.sems.reporting.domain.model.ReportStatus;
import com.sems.reporting.domain.model.ReportType;
import com.sems.reporting.domain.port.in.ReportUseCase;
import com.sems.reporting.domain.port.out.ReportRepository;
import com.sems.reporting.domain.port.out.ExpenseDataClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService implements ReportUseCase {

    private final ReportRepository reportRepository;
    private final ExpenseDataClient expenseDataClient;
    
    @Override
    public Report createReport(String name, String type, UUID userId, String parameters, LocalDateTime dateFrom, LocalDateTime dateTo) {
        ReportType reportType;
        try {
            reportType = ReportType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid report type: {}, defaulting to CUSTOM", type);
            reportType = ReportType.CUSTOM;
        }
        
        Report report = Report.builder()
                .id(UUID.randomUUID())
                .name(name)
                .type(reportType)
                .status(ReportStatus.QUEUED)
                .userId(userId)
                .parameters(parameters)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .createdAt(LocalDateTime.now())
                .build();
        
        return reportRepository.save(report);
    }

    @Override
    public Report getReportById(UUID reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found with id: " + reportId));
    }

    @Override
    public List<Report> getUserReports(UUID userId) {
        return reportRepository.findByUserId(userId);
    }

    @Override
    public void generateReport(UUID reportId) {
        Report report = getReportById(reportId);
        report.setStatus(ReportStatus.PROCESSING);
        reportRepository.save(report);
        
        try {
            // Perform report generation based on report type
            switch (report.getType()) {
                case EXPENSE_SUMMARY:
                case EXPENSE_DETAILED:
                    generateExpenseReport(report);
                    break;
                case BUDGET_ANALYSIS:
                    generateBudgetAnalysisReport(report);
                    break;
                case DEPARTMENT_SUMMARY:
                    generateDepartmentReport(report);
                    break;
                case USER_ACTIVITY:
                case CUSTOM:
                default:
                    generateCustomReport(report);
            }
            
            report.setStatus(ReportStatus.COMPLETED);
            report.setCompletedAt(LocalDateTime.now());
        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage(), e);
            report.setStatus(ReportStatus.FAILED);
        }
        
        reportRepository.save(report);
    }

    @Override
    public List<Report> getReportsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return reportRepository.findByCreatedAtBetween(startDate, endDate);
    }

    @Override
    public void deleteReport(UUID reportId) {
        reportRepository.delete(reportId);
    }
    
    private void generateExpenseReport(Report report) {
        // Fetch expense data
        var expenses = expenseDataClient.getExpensesByUserAndDateRange(
                report.getUserId(), report.getDateFrom(), report.getDateTo());
        
        // Report generation logic would go here
        // For now, just simulate a file path for the generated report
        String filePath = "reports/" + report.getId() + "_expense_report.pdf";
        report.setGeneratedFilePath(filePath);
    }
    
    private void generateBudgetAnalysisReport(Report report) {
        var budgetData = expenseDataClient.getBudgetAnalysis(
                report.getUserId(), report.getDateFrom(), report.getDateTo());
        
        // Report generation logic would go here
        String filePath = "reports/" + report.getId() + "_budget_analysis.pdf";
        report.setGeneratedFilePath(filePath);
    }
    
    private void generateDepartmentReport(Report report) {
        // Extract department parameter
        String department = report.getParameters(); // Simplified for example
        
        var departmentExpenses = expenseDataClient.getExpensesByDepartmentAndDateRange(
                department, report.getDateFrom(), report.getDateTo());
        
        // Report generation logic would go here
        String filePath = "reports/" + report.getId() + "_department_report.pdf";
        report.setGeneratedFilePath(filePath);
    }
    
    private void generateCustomReport(Report report) {
        // Handle custom report generation
        String filePath = "reports/" + report.getId() + "_custom_report.pdf";
        report.setGeneratedFilePath(filePath);
    }
} 