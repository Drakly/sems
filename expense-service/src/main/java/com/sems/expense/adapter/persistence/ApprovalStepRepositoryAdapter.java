package com.sems.expense.adapter.persistence;

import com.sems.expense.adapter.persistence.entity.ApprovalStepEntity;
import com.sems.expense.adapter.persistence.mapper.ApprovalStepPersistenceMapper;
import com.sems.expense.adapter.persistence.repository.JpaApprovalStepRepository;
import com.sems.expense.domain.model.ApprovalStep;
import com.sems.expense.domain.port.out.ApprovalStepRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApprovalStepRepositoryAdapter implements ApprovalStepRepository {

    private final JpaApprovalStepRepository jpaApprovalStepRepository;
    private final ApprovalStepPersistenceMapper mapper;

    @Override
    public ApprovalStep save(ApprovalStep approvalStep) {
        ApprovalStepEntity entity = mapper.toEntity(approvalStep);
        ApprovalStepEntity savedEntity = jpaApprovalStepRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<ApprovalStep> findById(UUID id) {
        return jpaApprovalStepRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public void delete(ApprovalStep approvalStep) {
        jpaApprovalStepRepository.deleteById(approvalStep.getId());
    }

    @Override
    public List<ApprovalStep> findAll() {
        return jpaApprovalStepRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalStep> findByExpenseId(UUID expenseId) {
        return jpaApprovalStepRepository.findByExpenseId(expenseId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalStep> findByApproverId(UUID approverId) {
        return jpaApprovalStepRepository.findByApproverId(approverId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ApprovalStep> findLatestByExpenseId(UUID expenseId) {
        return jpaApprovalStepRepository.findLatestByExpenseId(expenseId)
                .map(mapper::toDomain);
    }

    @Override
    public List<ApprovalStep> findByExpenseIdAndLevel(UUID expenseId, Integer level) {
        return jpaApprovalStepRepository.findByExpenseIdAndLevel(expenseId, level).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public long countByExpenseIdAndLevel(UUID expenseId, Integer level) {
        return jpaApprovalStepRepository.countByExpenseIdAndLevel(expenseId, level);
    }
} 