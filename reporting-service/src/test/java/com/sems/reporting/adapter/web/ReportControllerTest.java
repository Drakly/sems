package com.sems.reporting.adapter.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sems.reporting.adapter.web.dto.CreateReportRequest;
import com.sems.reporting.adapter.web.dto.ReportResponse;
import com.sems.reporting.adapter.web.mapper.ReportDtoMapper;
import com.sems.reporting.domain.model.Report;
import com.sems.reporting.domain.model.ReportStatus;
import com.sems.reporting.domain.model.ReportType;
import com.sems.reporting.domain.port.in.ReportUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReportController.class)
class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReportUseCase reportUseCase;

    @MockBean
    private ReportDtoMapper reportDtoMapper;

    private UUID reportId;
    private UUID userId;
    private Report testReport;
    private ReportResponse testReportResponse;
    private CreateReportRequest createReportRequest;
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
                .status(ReportStatus.COMPLETED)
                .userId(userId)
                .parameters("")
                .dateFrom(startDate)
                .dateTo(endDate)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build();

        testReportResponse = ReportResponse.builder()
                .id(reportId)
                .name("Test Report")
                .type("EXPENSE_SUMMARY")
                .status("COMPLETED")
                .userId(userId)
                .parameters("")
                .dateFrom(startDate)
                .dateTo(endDate)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .completedAt(LocalDateTime.now())
                .build();

        createReportRequest = new CreateReportRequest();
        createReportRequest.setName("Test Report");
        createReportRequest.setType("EXPENSE_SUMMARY");
        createReportRequest.setUserId(userId);
        createReportRequest.setDateFrom(startDate);
        createReportRequest.setDateTo(endDate);
    }

    @Test
    void createReport_ShouldReturnCreatedReport() throws Exception {
        // Given
        given(reportUseCase.createReport(
                eq(createReportRequest.getName()),
                eq(createReportRequest.getType()),
                eq(createReportRequest.getUserId()),
                eq(createReportRequest.getParameters()),
                eq(createReportRequest.getDateFrom()),
                eq(createReportRequest.getDateTo())))
                .willReturn(testReport);
        
        given(reportDtoMapper.toResponse(testReport)).willReturn(testReportResponse);

        // When/Then
        mockMvc.perform(post("/api/v1/reports")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createReportRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(reportId.toString())))
                .andExpect(jsonPath("$.name", is("Test Report")))
                .andExpect(jsonPath("$.type", is("EXPENSE_SUMMARY")));

        verify(reportUseCase).createReport(
                eq(createReportRequest.getName()),
                eq(createReportRequest.getType()),
                eq(createReportRequest.getUserId()),
                eq(createReportRequest.getParameters()),
                eq(createReportRequest.getDateFrom()),
                eq(createReportRequest.getDateTo()));
    }

    @Test
    void getReportById_ShouldReturnReport() throws Exception {
        // Given
        given(reportUseCase.getReportById(reportId)).willReturn(testReport);
        given(reportDtoMapper.toResponse(testReport)).willReturn(testReportResponse);

        // When/Then
        mockMvc.perform(get("/api/v1/reports/{reportId}", reportId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(reportId.toString())))
                .andExpect(jsonPath("$.name", is("Test Report")))
                .andExpect(jsonPath("$.type", is("EXPENSE_SUMMARY")));

        verify(reportUseCase).getReportById(reportId);
    }

    @Test
    void getUserReports_ShouldReturnUserReports() throws Exception {
        // Given
        List<Report> reports = Collections.singletonList(testReport);
        given(reportUseCase.getUserReports(userId)).willReturn(reports);
        given(reportDtoMapper.toResponse(testReport)).willReturn(testReportResponse);

        // When/Then
        mockMvc.perform(get("/api/v1/reports/user/{userId}", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(reportId.toString())))
                .andExpect(jsonPath("$[0].name", is("Test Report")));

        verify(reportUseCase).getUserReports(userId);
    }

    @Test
    void generateReport_ShouldReturnAccepted() throws Exception {
        // Given
        doNothing().when(reportUseCase).generateReport(reportId);

        // When/Then
        mockMvc.perform(post("/api/v1/reports/{reportId}/generate", reportId))
                .andExpect(status().isAccepted());

        verify(reportUseCase).generateReport(reportId);
    }

    @Test
    void getReportsByDateRange_ShouldReturnReports() throws Exception {
        // Given
        List<Report> reports = Collections.singletonList(testReport);
        given(reportUseCase.getReportsByDateRange(any(), any())).willReturn(reports);
        given(reportDtoMapper.toResponse(testReport)).willReturn(testReportResponse);

        // When/Then
        mockMvc.perform(get("/api/v1/reports")
                .param("startDate", startDate.toString())
                .param("endDate", endDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(reportId.toString())));

        verify(reportUseCase).getReportsByDateRange(any(), any());
    }

    @Test
    void deleteReport_ShouldReturnNoContent() throws Exception {
        // Given
        doNothing().when(reportUseCase).deleteReport(reportId);

        // When/Then
        mockMvc.perform(delete("/api/v1/reports/{reportId}", reportId))
                .andExpect(status().isNoContent());

        verify(reportUseCase).deleteReport(reportId);
    }
} 