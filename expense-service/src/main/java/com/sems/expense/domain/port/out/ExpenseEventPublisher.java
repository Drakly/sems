package com.sems.expense.domain.port.out;

import com.sems.expense.domain.model.Expense;

public interface ExpenseEventPublisher {
    void publishExpenseCreated(Expense expense);
    void publishExpenseUpdated(Expense expense);
    void publishExpenseStatusChanged(Expense expense, String previousStatus);
    void publishExpenseDeleted(Expense expense);
} 