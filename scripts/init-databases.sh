#!/bin/bash

# Create directory if it doesn't exist
mkdir -p scripts

# Exit on error
set -e

echo "===== SEMS Database Initialization Script ====="
echo "Creating and initializing databases for SEMS..."

# Check if MySQL is running locally or in Docker
if command -v mysql &> /dev/null; then
    echo "Using local MySQL client..."
    MYSQL_CMD="mysql -h127.0.0.1 -P3307 -uroot -proot"
else
    echo "Using Docker container MySQL..."
    MYSQL_CMD="docker exec -i sems-mysql mysql -uroot -proot"
fi

# Create databases if they don't exist
echo "Creating databases..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS sems_users;"
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS sems_expenses;"
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS sems_reporting;"
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS sems_documents;"
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS sems_integration;"

# Grant permissions
echo "Setting up database permissions..."
$MYSQL_CMD -e "GRANT ALL PRIVILEGES ON sems_users.* TO 'sems'@'%';"
$MYSQL_CMD -e "GRANT ALL PRIVILEGES ON sems_expenses.* TO 'sems'@'%';"
$MYSQL_CMD -e "GRANT ALL PRIVILEGES ON sems_reporting.* TO 'sems'@'%';"
$MYSQL_CMD -e "GRANT ALL PRIVILEGES ON sems_documents.* TO 'sems'@'%';"
$MYSQL_CMD -e "GRANT ALL PRIVILEGES ON sems_integration.* TO 'sems'@'%';"
$MYSQL_CMD -e "FLUSH PRIVILEGES;"

# User Service Database Schema
echo "Setting up User Service schema..."
cat << EOF | $MYSQL_CMD sems_users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    department VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data for users
INSERT IGNORE INTO users (id, username, email, password, first_name, last_name, department, role, created_at)
VALUES 
    ('1', 'admin', 'admin@sems.com', '\$2a\$10\$XR0gQN0s8ZtZvM1M94P4puYbCeYD9ej.XWpkQJ40/r9n1RWNdW02q', 'Admin', 'User', 'ADMIN', 'ADMIN', NOW()),
    ('2', 'manager', 'manager@sems.com', '\$2a\$10\$XR0gQN0s8ZtZvM1M94P4puYbCeYD9ej.XWpkQJ40/r9n1RWNdW02q', 'Manager', 'User', 'MANAGEMENT', 'MANAGER', NOW()),
    ('3', 'employee', 'employee@sems.com', '\$2a\$10\$XR0gQN0s8ZtZvM1M94P4puYbCeYD9ej.XWpkQJ40/r9n1RWNdW02q', 'Employee', 'User', 'DEVELOPMENT', 'EMPLOYEE', NOW());
EOF

# Expense Service Database Schema
echo "Setting up Expense Service schema..."
cat << EOF | $MYSQL_CMD sems_expenses
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    category VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    approver_id VARCHAR(36),
    receipt_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sample data for expenses
INSERT IGNORE INTO expenses (id, title, description, amount, date, category, status, user_id, created_at)
VALUES 
    ('1', 'Business Trip', 'Trip to NYC for client meeting', 1250.00, '2023-11-15', 'TRAVEL', 'APPROVED', '3', NOW()),
    ('2', 'Office Supplies', 'Purchased notebooks and pens', 85.50, '2023-11-18', 'SUPPLIES', 'APPROVED', '3', NOW()),
    ('3', 'Team Lunch', 'Lunch with development team', 150.75, '2023-11-20', 'MEALS', 'PENDING', '3', NOW()),
    ('4', 'Software License', 'Annual license for development tools', 599.99, '2023-11-22', 'SOFTWARE', 'PENDING', '3', NOW());
EOF

# Reporting Service Database Schema
echo "Setting up Reporting Service schema..."
cat << EOF | $MYSQL_CMD sems_reporting
CREATE TABLE IF NOT EXISTS expense_reports (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    department VARCHAR(50),
    status VARCHAR(20) NOT NULL,
    generated_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS report_expenses (
    report_id VARCHAR(36) NOT NULL,
    expense_id VARCHAR(36) NOT NULL,
    PRIMARY KEY (report_id, expense_id)
);
EOF

echo "===== Database Initialization Complete ====="
echo "All databases have been successfully created and initialized."
echo "You can now start the microservices." 