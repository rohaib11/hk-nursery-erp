-- Core System Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'worker', -- 'owner', 'manager', 'worker'
    security_question VARCHAR(255),
    security_answer VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Categories Reference Table
CREATE TABLE IF NOT EXISTS plant_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(10)
);

-- Insert Default Categories (Added Palm 🌴, Removed Tree)
-- Using ON CONFLICT DO UPDATE so if you restart the server, it overwrites old categories safely
INSERT INTO plant_categories (id, name, icon) VALUES 
(1, 'Fruit Tree', '🥭'),
(2, 'Ornamental', '🌸'),
(3, 'Indoor', '🌿'),
(4, 'Seasonal', '🌻'),
(5, 'Medicinal', '🌱'),
(6, 'Palm', '🌴'),
(7, 'Tree', '🌳') -- <-- Added here
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name, icon = EXCLUDED.icon;

-- Main Plants / Inventory Table
CREATE TABLE IF NOT EXISTS plants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    local_name VARCHAR(100),
    category_id INT REFERENCES plant_categories(id),
    quantity INT NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0.00,
    sale_price DECIMAL(10,2) DEFAULT 0.00,
    pot_size VARCHAR(50), -- e.g., "12 inch", "14 inch"
    pot_cost DECIMAL(10,2) DEFAULT 0.00,
    health_status VARCHAR(20) DEFAULT 'Healthy', -- 'Healthy', 'Diseased', 'Dead'
    growth_status VARCHAR(20) DEFAULT 'Growing', -- 'Seedling', 'Growing', 'Ready'
    location_id VARCHAR(100),
    supplier_id VARCHAR(100),
    batch_code VARCHAR(50),
    sowing_date DATE,
    notes TEXT,
    primary_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




ALTER TABLE plants ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10,2) DEFAULT 0.00;


-- Nursery Expenses & Kharch Ledger
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expense_date DATE DEFAULT CURRENT_DATE,
    plant_id INT REFERENCES plants(id) ON DELETE SET NULL,
    is_batch_expense BOOLEAN DEFAULT FALSE,
    unit_cost_added DECIMAL(10,2) DEFAULT 0.00,
    receipt_image VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS title VARCHAR(150) NOT NULL DEFAULT 'Untitled';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'Other';
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS amount DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS expense_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS plant_id INT REFERENCES plants(id) ON DELETE SET NULL;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS is_batch_expense BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS unit_cost_added DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_image VARCHAR(255);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 1. Remove the old column (if it exists)
ALTER TABLE expenses DROP COLUMN IF EXISTS expense_category;

-- 2. Make sure the new category column exists (it does, but double‑check)
--    and set a default for any existing rows that might have NULL
UPDATE expenses SET category = 'Other' WHERE category IS NULL;

-- 3. Enforce NOT NULL on the category column
ALTER TABLE expenses ALTER COLUMN category SET NOT NULL;
ALTER TABLE expenses ALTER COLUMN category SET DEFAULT 'Other';


-- 1. SUPPLIERS TABLE (Accounts Payable)
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company_name VARCHAR(150), -- e.g., "Ishaq Pot Makers"
    phone VARCHAR(20),
    address TEXT,
    payable_balance DECIMAL(12,2) DEFAULT 0.00, -- Amount YOU owe THEM
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPPLIER PAYMENTS TABLE (When you pay your Udhaar)
CREATE TABLE IF NOT EXISTS supplier_payments (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES suppliers(id) ON DELETE CASCADE,
    amount_paid DECIMAL(12,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add to backend/schema.sql
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(50) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

