package com.sems.reporting.application;

import com.sems.reporting.domain.model.Report;
import com.sems.reporting.domain.model.ReportStatus;
import com.sems.reporting.domain.model.ReportType;
import com.sems.reporting.domain.port.out.ExpenseDataClient;
import com.sems.reporting.domain.port.out.ReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private ExpenseDataClient expenseDataClient;

    @InjectMocks
    private ReportService reportService;

    private UUID reportId;
    private UUID userId;
    private Report testReport;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    @BeforeEach
    void setUp() {
        reportId = UUID.randomUUID();
        userId = UUID.randomUUID();
        startDate = LocalDateTime.now().minusDays(30);
        endDate = LocalDateTime.now();

        testReport = Report.builder()
                .id(reportId)
                .name("Test Report")
                .type(ReportType.EXPENSE_SUMMARY)
                .status(ReportStatus.QUEUED)
                .userId(userId)
                .parameters("")
                .dateFrom(startDate)
                .dateTo(endDate)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void createReport_ShouldCreateAndSaveReport() {
        // Given
        String name = "Test Report";
        String type = "EXPENSE_SUMMARY";
        String parameters = "";
        when(reportRepository.save(any(Report.class))).thenReturn(testReport);

        // When
        Report result = reportService.createReport(name, type, userId, parameters, startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(reportId, result.getId());
        assertEquals(name, result.getName());
        assertEquals(ReportType.EXPENSE_SUMMARY, result.getType());
        assertEquals(userId, result.getUserId());
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    void createReport_WithInvalidType_ShouldDefaultToCustom() {
        // Given
        String name = "Test Report";
        String type = "INVALID_TYPE";
        String parameters = "";
        when(reportRepository.save(any(Report.class))).thenAnswer(i -> i.getArgument(0));

        // When
        Report result = reportService.createReport(name, type, userId, parameters, startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(name, result.getName());
        assertEquals(ReportType.CUSTOM, result.getType());
        verify(reportRepository, times(1)).save(any(Report.class));
    }

    @Test
    void getReportById_WhenReportExists_ShouldReturnReport() {
        // Given
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(testReport));

        // When
        Report result = reportService.getReportById(reportId);

        // Then
        assertNotNull(result);
        assertEquals(reportId, result.getId());
        verify(reportRepository, times(1)).findById(reportId);
    }

    @Test
    void getReportById_WhenReportDoesNotExist_ShouldThrowException() {
        // Given
        when(reportRepository.findById(reportId)).thenReturn(Optional.empty());

        // When/Then
        Exception exception = assertThrows(RuntimeException.class, () -> {
            reportService.getReportById(reportId);
        });

        assertTrue(exception.getMessage().contains("Report not found"));
        verify(reportRepository, times(1)).findById(reportId);
    }

    @Test
    void getUserReports_ShouldReturnUserReports() {
        // Given
        List<Report> userReports = Collections.singletonList(testReport);
        when(reportRepository.findByUserId(userId)).thenReturn(userReports);

        // When
        List<Report> result = reportService.getUserReports(userId);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testReport, result.get(0));
        verify(reportRepository, times(1)).findByUserId(userId);
    }

    @Test
    void generateReport_ShouldUpdateReportStatus() {
        // Given
        Report processingReport = new Report();
        processingReport.setId(reportId);
        processingReport.setType(ReportType.EXPENSE_SUMMARY);
        processingReport.setStatus(ReportStatus.PROCESSING);
        
        when(reportRepository.findById(reportId)).thenReturn(Optional.of(testReport));
        when(reportRepository.save(any(Report.class))).thenReturn(processingReport);
        when(expenseDataClient.getExpensesByUserAndDateRange(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        reportService.generateReport(reportId);

        // Then
        verify(reportRepository, times(1)).findById(reportId);
        verify(reportRepository, times(2)).save(any(Report.class)); // Once for PROCESSING and once for COMPLETED
        verify(expenseDataClient, times(1)).getExpensesByUserAndDateRange(any(), any(), any());
    }

    @Test
    void getReportsByDateRange_ShouldReturnReportsInRange() {
        // Given
        List<Report> reports = Collections.singletonList(testReport);
        when(reportRepository.findByCreatedAtBetween(startDate, endDate)).thenReturn(reports);

        // When
        List<Report> result = reportService.getReportsByDateRange(startDate, endDate);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testReport, result.get(0));
        verify(reportRepository, times(1)).findByCreatedAtBetween(startDate, endDate);
    }

    @Test
    void deleteReport_ShouldDeleteReport() {
        // Given
        doNothing().when(reportRepository).delete(reportId);

        // When
        reportService.deleteReport(reportId);

        // Then
        verify(reportRepository, times(1)).delete(reportId);
    }
} 