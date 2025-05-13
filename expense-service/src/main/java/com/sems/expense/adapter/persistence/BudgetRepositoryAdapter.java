package com.sems.expense.adapter.persistence;

import com.sems.expense.adapter.out.persistence.entity.BudgetEntity;
import com.sems.expense.adapter.persistence.mapper.BudgetPersistenceMapper;
import com.sems.expense.adapter.persistence.repository.JpaBudgetRepository;
import com.sems.expense.domain.model.Budget;
import com.sems.expense.domain.port.out.BudgetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BudgetRepositoryAdapter implements BudgetRepository {

    private final JpaBudgetRepository jpaBudgetRepository;
    private final BudgetPersistenceMapper mapper;

    @Override
    public Budget save(Budget budget) {
        BudgetEntity entity = mapper.toEntity(budget);
        BudgetEntity savedEntity = jpaBudgetRepository.save(entity);
        return mapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Budget> findById(UUID id) {
        return jpaBudgetRepository.findById(id)
                .map(mapper::toDomain);
    }

    @Override
    public void delete(Budget budget) {
        jpaBudgetRepository.deleteById(budget.getId());
    }

    @Override
    public List<Budget> findAll() {
        return jpaBudgetRepository.findAll().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Budget> findByActiveTrue() {
        return jpaBudgetRepository.findByActiveTrue().stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Budget> findByDepartmentId(UUID departmentId) {
        return jpaBudgetRepository.findByDepartmentId(departmentId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Budget> findByProjectId(UUID projectId) {
        return jpaBudgetRepository.findByProjectId(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Budget> findByDepartmentIdAndActiveTrue(UUID departmentId) {
        return jpaBudgetRepository.findByDepartmentIdAndActiveTrue(departmentId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Budget> findByProjectIdAndActiveTrue(UUID projectId) {
        return jpaBudgetRepository.findByProjectIdAndActiveTrue(projectId).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Budget> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date, LocalDate sameDate) {
        return jpaBudgetRepository.findByStartDateLessThanEqualAndEndDateGreaterThanEqual(date, sameDate).stream()
                .map(mapper::toDomain)
                .collect(Collectors.toList());
    }
} 