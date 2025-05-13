package com.sems.expense.adapter.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sems.expense.adapter.web.dto.ApprovalActionRequest;
import com.sems.expense.adapter.web.dto.ExpenseResponse;
import com.sems.expense.domain.model.*;
import com.sems.expense.domain.port.ExpenseRepository;
import com.sems.expense.domain.port.out.ApprovalLevelRepository;
import com.sems.expense.domain.port.out.ApprovalStepRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class ApprovalWorkflowControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ExpenseRepository expenseRepository;

    @MockBean
    private ApprovalLevelRepository approvalLevelRepository;

    @MockBean
    private ApprovalStepRepository approvalStepRepository;

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

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(Collections.singletonList(level1));
        when(expenseRepository.save(any(Expense.class))).thenReturn(submittedExpense);

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

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(approvalLevelRepository.findByAmountBetweenThresholds(any(BigDecimal.class)))
                .thenReturn(Arrays.asList(level1, level2));
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenReturn(approvedExpense);

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

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenReturn(rejectedExpense);

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

        when(expenseRepository.existsById(expenseId)).thenReturn(true);
        when(approvalStepRepository.findByExpenseId(expenseId)).thenReturn(Collections.singletonList(step1));

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
                .reviewComments("Please add itemized receipts")
                .category(Category.builder().id(UUID.randomUUID()).name("Travel").build())
                .expenseDate(LocalDate.now())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        ApprovalActionRequest request = ApprovalActionRequest.builder()
                .actorId(approverId)
                .comments("Please add itemized receipts")
                .build();

        when(expenseRepository.findById(expenseId)).thenReturn(Optional.of(testExpense));
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenReturn(changesRequestedExpense);

        // When/Then
        mockMvc.perform(post("/api/v1/expenses/workflow/{expenseId}/request-changes", expenseId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(expenseId.toString())))
                .andExpect(jsonPath("$.status", is("CHANGES_REQUESTED")))
                .andExpect(jsonPath("$.reviewComments", is("Please add itemized receipts")));
    }

    @Test
    void processAutoApprovals_ShouldReturnCount() throws Exception {
        // Given
        when(expenseRepository.findByStatusAndAmountLessThanEqual(
                eq(ExpenseStatus.SUBMITTED), any(BigDecimal.class)))
                .thenReturn(Arrays.asList(
                        Expense.builder().id(UUID.randomUUID()).amount(new BigDecimal("45.00")).build(),
                        Expense.builder().id(UUID.randomUUID()).amount(new BigDecimal("25.00")).build()
                ));
        
        when(approvalStepRepository.save(any(ApprovalStep.class))).thenAnswer(i -> i.getArgument(0));
        when(expenseRepository.save(any(Expense.class))).thenAnswer(i -> i.getArgument(0));
        
        // When
        MvcResult result = mockMvc.perform(post("/api/v1/expenses/workflow/auto-approve/process"))
                .andExpect(status().isOk())
                .andReturn();
                
        // Then
        String resultContent = result.getResponse().getContentAsString();
        int count = Integer.parseInt(resultContent);
        assertEquals(2, count);
    }
} 