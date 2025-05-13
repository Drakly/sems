-- Create approval_levels table
CREATE TABLE approval_levels (
    id BINARY(16) PRIMARY KEY,
    level INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    department_id BINARY(16),
    role_id BINARY(16),
    min_amount_threshold DECIMAL(19, 2) NOT NULL,
    max_amount_threshold DECIMAL(19, 2),
    requires_receipt BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    required_approvers INT
);

-- Create approval_steps table
CREATE TABLE approval_steps (
    id BINARY(16) PRIMARY KEY,
    level INT,
    approver_id BINARY(16),
    approver_name VARCHAR(100),
    approver_role VARCHAR(100),
    expense_id BINARY(16) NOT NULL,
    action VARCHAR(20) NOT NULL,
    comments VARCHAR(1000),
    action_date TIMESTAMP NOT NULL,
    FOREIGN KEY (expense_id) REFERENCES expenses(id)
);

-- Add workflow fields to expenses table
ALTER TABLE expenses ADD COLUMN department_id BINARY(16);
ALTER TABLE expenses ADD COLUMN project_id BINARY(16);
ALTER TABLE expenses ADD COLUMN current_approval_level INT;
ALTER TABLE expenses ADD COLUMN rejection_reason VARCHAR(1000);
ALTER TABLE expenses ADD COLUMN requires_receipt BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN flagged_for_review BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN review_comments VARCHAR(1000);

-- Create indexes for performance
CREATE INDEX idx_approval_steps_expense_id ON approval_steps(expense_id);
CREATE INDEX idx_approval_steps_approver_id ON approval_steps(approver_id);
CREATE INDEX idx_approval_levels_amount_range ON approval_levels(min_amount_threshold, max_amount_threshold);
CREATE INDEX idx_approval_levels_department_id ON approval_levels(department_id);
CREATE INDEX idx_approval_levels_role_id ON approval_levels(role_id);
CREATE INDEX idx_expenses_current_level_status ON expenses(current_approval_level, status);
CREATE INDEX idx_expenses_amount ON expenses(amount);

-- Insert default approval levels
INSERT INTO approval_levels (id, level, name, description, min_amount_threshold, max_amount_threshold, is_active, role_id)
VALUES 
(UUID_TO_BIN(UUID()), 1, 'Manager Approval', 'First level approval by department manager', 0.00, 1000.00, TRUE, UUID_TO_BIN('11111111-1111-1111-1111-111111111111')),
(UUID_TO_BIN(UUID()), 2, 'Finance Approval', 'Second level approval by finance department', 1000.01, 5000.00, TRUE, UUID_TO_BIN('22222222-2222-2222-2222-222222222222')),
(UUID_TO_BIN(UUID()), 3, 'Executive Approval', 'Final approval for large expenses', 5000.01, NULL, TRUE, UUID_TO_BIN('33333333-3333-3333-3333-333333333333')); 