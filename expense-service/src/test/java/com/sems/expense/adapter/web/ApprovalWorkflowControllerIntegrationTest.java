package com.sems.expense.adapter.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sems.expense.adapter.web.dto.ApprovalActionRequest;
import com.sems.expense.adapter.web.dto.ExpenseResponse;
import com.sems.expense.application.service.ApprovalWorkflowService;
import com.sems.expense.config.TestSecurityConfig;
import com.sems.expense.domain.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ApprovalWorkflowController.class)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
public class ApprovalWorkflowControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApprovalWorkflowService approvalWorkflowService;

    private UUID expenseId;
    private UUID userId;
    private UUID approverId;
    private Expense testExpense;
    private ApprovalLevel level1;
    private ApprovalLevel level2;

    @BeforeEach
    void setUp() {
        expenseId = UUID.randomUUID();
        userId = UUID.randomUUID();
        approverId = UUID.randomUUID();

        // Create test expense
        testExpense = Expense.builder()
                .id(expenseId)
                .userId(userId)
                .title("Business Trip to New York")
                .amount(new BigDecimal("500.00"))
                .status(ExpenseStatus.DRAFT)
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Create approval levels
        level1 = ApprovalLevel.builder()
                .id(UUID.randomUUID())
                .level(1)
                .name("Manager Approval")
                .minAmountThreshold(BigDecimal.ZERO)
                .maxAmountThreshold(new BigDecimal("1000.00"))
                .isActive(true)
                .build();

        level2 = ApprovalLevel.builder()
                .id(UUID.randomUUID())
                .level(2)
                .name("Finance Approval")
                .minAmountThreshold(BigDecimal.ZERO)
                .maxAmountThreshold(new BigDecimal("5000.00"))
                .isActive(true)
                .build();
    }

    @Test
    void submitForApproval_ShouldReturnSubmittedExpense() throws Exception {
        // Given
        Expense submittedExpense = Expense.builder()
                .id(expenseId)
                .userId(userId)
                .title("Business Trip to New York")
                .amount(new BigDecimal("500.00"))
                .status(ExpenseStatus.SUBMITTED)
                .currentApprovalLevel(1)
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(approvalWorkflowService.submitForApproval(expenseId)).thenReturn(submittedExpense);

        // When/Then
        mockMvc.perform(post("/api/v1/expenses/workflow/{expenseId}/submit", expenseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(expenseId.toString())))
                .andExpect(jsonPath("$.status", is("SUBMITTED")))
                .andExpect(jsonPath("$.currentApprovalLevel", is(1)));
    }

    @Test
    void approveExpense_ShouldMoveToNextLevel() throws Exception {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);

        Expense approvedExpense = Expense.builder()
                .id(expenseId)
                .userId(userId)
                .title("Business Trip to New York")
                .amount(new BigDecimal("500.00"))
                .status(ExpenseStatus.UNDER_REVIEW)
                .currentApprovalLevel(2)
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ApprovalActionRequest request = ApprovalActionRequest.builder()
                .actorId(approverId)
                .comments("Looks good to me")
                .build();

        when(approvalWorkflowService.approveExpense(eq(expenseId), eq(approverId), any(String.class)))
                .thenReturn(approvedExpense);

        // When/Then
        mockMvc.perform(post("/api/v1/expenses/workflow/{expenseId}/approve", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(expenseId.toString())))
                .andExpect(jsonPath("$.status", is("UNDER_REVIEW")))
                .andExpect(jsonPath("$.currentApprovalLevel", is(2)));
    }

    @Test
    void rejectExpense_ShouldSetRejectedStatus() throws Exception {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);

        Expense rejectedExpense = Expense.builder()
                .id(expenseId)
                .userId(userId)
                .title("Business Trip to New York")
                .amount(new BigDecimal("500.00"))
                .status(ExpenseStatus.REJECTED)
                .rejectionReason("Missing receipts")
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ApprovalActionRequest request = ApprovalActionRequest.builder()
                .actorId(approverId)
                .comments("Missing receipts")
                .build();

        when(approvalWorkflowService.rejectExpense(eq(expenseId), eq(approverId), any(String.class)))
                .thenReturn(rejectedExpense);

        // When/Then
        mockMvc.perform(post("/api/v1/expenses/workflow/{expenseId}/reject", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(expenseId.toString())))
                .andExpect(jsonPath("$.status", is("REJECTED")))
                .andExpect(jsonPath("$.rejectionReason", is("Missing receipts")));
    }

    @Test
    void getApprovalHistory_ShouldReturnHistory() throws Exception {
        // Given
        ApprovalStep step1 = ApprovalStep.builder()
                .id(UUID.randomUUID())
                .expenseId(expenseId)
                .level(1)
                .approverId(approverId)
                .approverName("John Manager")
                .approverRole("Department Manager")
                .action(ApprovalStep.ApprovalAction.APPROVED)
                .comments("Approved")
                .actionDate(LocalDateTime.now().minusDays(1))
                .build();

        when(approvalWorkflowService.getApprovalHistory(expenseId))
                .thenReturn(Collections.singletonList(step1));

        // When/Then
        mockMvc.perform(get("/api/v1/expenses/workflow/{expenseId}/history", expenseId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].expenseId", is(expenseId.toString())))
                .andExpect(jsonPath("$[0].approverName", is("John Manager")))
                .andExpect(jsonPath("$[0].action", is("APPROVED")));
    }

    @Test
    void requestChanges_ShouldSetChangesRequestedStatus() throws Exception {
        // Given
        testExpense.setStatus(ExpenseStatus.SUBMITTED);
        testExpense.setCurrentApprovalLevel(1);

        Expense changesRequestedExpense = Expense.builder()
                .id(expenseId)
                .userId(userId)
                .title("Business Trip to New York")
                .amount(new BigDecimal("500.00"))
                .status(ExpenseStatus.CHANGES_REQUESTED)
                .reviewComments("Please add receipts")
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ApprovalActionRequest request = ApprovalActionRequest.builder()
                .actorId(approverId)
                .comments("Please add receipts")
                .build();

        when(approvalWorkflowService.requestChanges(eq(expenseId), eq(approverId), any(String.class)))
                .thenReturn(changesRequestedExpense);

        // When/Then
        mockMvc.perform(post("/api/v1/expenses/workflow/{expenseId}/request-changes", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(expenseId.toString())))
                .andExpect(jsonPath("$.status", is("CHANGES_REQUESTED")))
                .andExpect(jsonPath("$.reviewComments", is("Please add receipts")));
    }
    
    @Test
    void processAutoApprovals_ShouldReturnCount() throws Exception {
        // Given
        when(approvalWorkflowService.processLowValueExpensesForAutoApproval()).thenReturn(5);
        
        // When/Then
        mockMvc.perform(post("/api/v1/expenses/workflow/process-auto-approvals"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.count", is(5)))
                .andExpect(jsonPath("$.message", containsString("auto-approved")));
    }
} 