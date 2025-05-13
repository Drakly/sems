package com.sems.reporting.integration;

import com.sems.reporting.adapter.web.dto.CreateReportRequest;
import com.sems.reporting.adapter.web.dto.ReportResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class ReportingServiceIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    public void createReport_ShouldCreateAndReturnReport() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateReportRequest request = CreateReportRequest.builder()
                .name("Integration Test Report")
                .type("EXPENSE_SUMMARY")
                .userId(userId)
                .dateFrom(LocalDateTime.now().minusDays(30))
                .dateTo(LocalDateTime.now())
                .build();

        // When
        ResponseEntity<ReportResponse> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/v1/reports",
                request,
                ReportResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo(request.getName());
        assertThat(response.getBody().getType()).isEqualTo(request.getType());
        assertThat(response.getBody().getUserId()).isEqualTo(request.getUserId());
    }

    @Test
    public void getReportById_WhenReportExists_ShouldReturnReport() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateReportRequest request = CreateReportRequest.builder()
                .name("Report for GetById Test")
                .type("EXPENSE_DETAILED")
                .userId(userId)
                .dateFrom(LocalDateTime.now().minusDays(30))
                .dateTo(LocalDateTime.now())
                .build();

        ResponseEntity<ReportResponse> createResponse = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/v1/reports",
                request,
                ReportResponse.class);
        
        UUID reportId = createResponse.getBody().getId();

        // When
        ResponseEntity<ReportResponse> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/v1/reports/" + reportId,
                ReportResponse.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isEqualTo(reportId);
        assertThat(response.getBody().getName()).isEqualTo(request.getName());
    }

    @Test
    public void getUserReports_ShouldReturnUserReports() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateReportRequest request = CreateReportRequest.builder()
                .name("User Report Test")
                .type("BUDGET_ANALYSIS")
                .userId(userId)
                .dateFrom(LocalDateTime.now().minusDays(30))
                .dateTo(LocalDateTime.now())
                .build();

        restTemplate.postForEntity(
                "http://localhost:" + port + "/api/v1/reports",
                request,
                ReportResponse.class);

        // When
        ResponseEntity<ReportResponse[]> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/api/v1/reports/user/" + userId,
                ReportResponse[].class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().length).isGreaterThanOrEqualTo(1);
        assertThat(response.getBody()[0].getUserId()).isEqualTo(userId);
    }

    @Test
    public void generateReport_ShouldAcceptRequest() {
        // Given
        UUID userId = UUID.randomUUID();
        CreateReportRequest request = CreateReportRequest.builder()
                .name("Report to Generate")
                .type("EXPENSE_SUMMARY")
                .userId(userId)
                .dateFrom(LocalDateTime.now().minusDays(30))
                .dateTo(LocalDateTime.now())
                .build();

        ResponseEntity<ReportResponse> createResponse = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/v1/reports",
                request,
                ReportResponse.class);
        
        UUID reportId = createResponse.getBody().getId();

        // When
        ResponseEntity<Void> response = restTemplate.postForEntity(
                "http://localhost:" + port + "/api/v1/reports/" + reportId + "/generate",
                null,
                Void.class);

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.ACCEPTED);
    }
} 