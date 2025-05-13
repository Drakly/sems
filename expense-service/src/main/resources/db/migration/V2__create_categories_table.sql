-- Create categories table
CREATE TABLE categories (
    id BINARY(16) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category_type VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default categories
INSERT INTO categories (id, name, category_type, description, is_active)
VALUES 
(UUID_TO_BIN(UUID()), 'Travel', 'EXPENSE', 'Travel related expenses like flights, hotels, car rentals', TRUE),
(UUID_TO_BIN(UUID()), 'Meals', 'EXPENSE', 'Business meals and entertainment', TRUE),
(UUID_TO_BIN(UUID()), 'Office Supplies', 'EXPENSE', 'Office supplies and stationery', TRUE),
(UUID_TO_BIN(UUID()), 'Software', 'EXPENSE', 'Software licenses and subscriptions', TRUE),
(UUID_TO_BIN(UUID()), 'Hardware', 'EXPENSE', 'Computer hardware and equipment', TRUE),
(UUID_TO_BIN(UUID()), 'Training', 'EXPENSE', 'Professional training and development', TRUE),
(UUID_TO_BIN(UUID()), 'Marketing', 'EXPENSE', 'Marketing and advertising expenses', TRUE),
(UUID_TO_BIN(UUID()), 'Utilities', 'EXPENSE', 'Office utilities like electricity, internet', TRUE);

-- Add foreign key to expenses table
ALTER TABLE expenses ADD CONSTRAINT fk_expense_category 
FOREIGN KEY (category_id) REFERENCES categories(id); 