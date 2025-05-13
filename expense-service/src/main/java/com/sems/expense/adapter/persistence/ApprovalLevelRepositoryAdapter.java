package com.sems.expense.adapter.persistence;

import com.sems.expense.adapter.persistence.entity.ApprovalLevelEntity;
import com.sems.expense.adapter.persistence.mapper.ApprovalLevelPersistenceMapper;
import com.sems.expense.adapter.persistence.repository.JpaApprovalLevelRepository;
import com.sems.expense.domain.model.ApprovalLevel;
import com.sems.expense.domain.port.out.ApprovalLevelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ApprovalLevelRepositoryAdapter implements ApprovalLevelRepository {

    private final JpaApprovalLevelRepository jpaApprovalLevelRepository;
    private final ApprovalLevelPersistenceMapper mapper;

    @Override
    public ApprovalLevel save(ApprovalLevel approvalLevel) {
        ApprovalLevelEntity entity = mapper.toEntity(approvalLevel);
        ApprovalLevelEntity savedEntity = jpaApprovalLevelRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<ApprovalLevel> findById(UUID id) {
        return jpaApprovalLevelRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public void delete(ApprovalLevel approvalLevel) {
        jpaApprovalLevelRepository.deleteById(approvalLevel.getId());
    }

    @Override
    public List<ApprovalLevel> findAll() {
        return jpaApprovalLevelRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalLevel> findByDepartmentId(UUID departmentId) {
        return jpaApprovalLevelRepository.findByDepartmentId(departmentId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalLevel> findByActive(boolean active) {
        return jpaApprovalLevelRepository.findByIsActive(active).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<ApprovalLevel> findByLevelAndDepartmentId(Integer level, UUID departmentId) {
        return jpaApprovalLevelRepository.findByLevelAndDepartmentId(level, departmentId)
                .map(mapper::toDomain);
    }

    @Override
    public List<ApprovalLevel> findByAmountBetweenThresholds(BigDecimal amount) {
        return jpaApprovalLevelRepository.findByAmountBetweenThresholds(amount).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovalLevel> findByRoleId(UUID roleId) {
        return jpaApprovalLevelRepository.findByRoleId(roleId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
} 