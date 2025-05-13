-- Create expenses table
CREATE TABLE expenses (
    id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL,
    category_id BINARY(16),
    status VARCHAR(20) NOT NULL,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    approved_by BINARY(16),
    approved_at TIMESTAMP,
    receipt_url VARCHAR(255)
);

-- Create indexes for common queries
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category_id); 