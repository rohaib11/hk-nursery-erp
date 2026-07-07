-- ==========================================
-- 1. BASE TABLES & USERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.users (
    id SERIAL PRIMARY KEY,
    username character varying(50) NOT NULL UNIQUE,
    password_hash character varying(255) NOT NULL,
    full_name character varying(100) NOT NULL,
    role character varying(20) DEFAULT 'worker'::character varying,
    security_question character varying(255),
    security_answer character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.settings (
    key character varying(50) PRIMARY KEY,
    value text NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.activity_log (
    id SERIAL PRIMARY KEY,
    user_id integer REFERENCES public.users(id),
    action character varying(50) NOT NULL,
    table_name character varying(50) NOT NULL,
    record_id integer,
    old_value jsonb,
    new_value jsonb,
    ip_address character varying(45),
    done_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. INVENTORY & CATEGORIES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.plant_categories (
    id SERIAL PRIMARY KEY,
    name character varying(50) NOT NULL,
    icon character varying(10)
);

CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL UNIQUE,
    name_urdu character varying(100),
    icon character varying(10)
);

CREATE TABLE IF NOT EXISTS public.locations (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    description text
);

CREATE TABLE IF NOT EXISTS public.plants (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    local_name character varying(100),
    category_id integer REFERENCES public.plant_categories(id),
    quantity integer DEFAULT 0 NOT NULL,
    cost_price numeric(10,2) DEFAULT 0.00,
    sale_price numeric(10,2) DEFAULT 0.00,
    pot_size character varying(50),
    pot_cost numeric(10,2) DEFAULT 0.00,
    health_status character varying(20) DEFAULT 'Healthy'::character varying,
    growth_status character varying(20) DEFAULT 'Growing'::character varying,
    location_id character varying(100),
    supplier_id character varying(100),
    batch_code character varying(50),
    sowing_date date,
    notes text,
    primary_image character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    wholesale_price numeric(10,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.plant_images (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE CASCADE,
    url text NOT NULL,
    is_primary boolean DEFAULT false,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.dead_stock (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE SET NULL,
    quantity_lost integer NOT NULL,
    reason text,
    logged_by integer REFERENCES public.users(id),
    logged_date date DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS public.stock_movements (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE CASCADE,
    type character varying(20) NOT NULL,
    quantity integer NOT NULL,
    ref_id integer,
    ref_type character varying(30),
    note text,
    moved_by integer REFERENCES public.users(id),
    moved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.plant_tasks (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE CASCADE,
    task_type character varying(50) NOT NULL,
    due_date date NOT NULL,
    completed boolean DEFAULT false,
    completed_by integer REFERENCES public.users(id),
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.plant_disease_history (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE CASCADE,
    disease_name character varying(100) NOT NULL,
    treatment text,
    treatment_cost numeric(10,2) DEFAULT 0.00,
    recorded_by integer REFERENCES public.users(id),
    recorded_date date DEFAULT CURRENT_DATE,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.plant_history (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE CASCADE,
    action character varying(50) NOT NULL,
    changed_fields text[],
    old_values jsonb,
    new_values jsonb,
    performed_by integer REFERENCES public.users(id),
    performed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. CUSTOMERS, SUPPLIERS & LEDGERS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.customers (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    phone character varying(20),
    address text,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    outstanding_balance numeric(12,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.customer_payments (
    id SERIAL PRIMARY KEY,
    customer_id integer REFERENCES public.customers(id) ON DELETE CASCADE,
    amount_paid numeric(12,2) NOT NULL,
    payment_date date DEFAULT CURRENT_DATE,
    payment_method character varying(50) DEFAULT 'Cash'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.customer_ledger (
    id SERIAL PRIMARY KEY,
    customer_id integer REFERENCES public.customers(id) ON DELETE CASCADE,
    ledger_date date DEFAULT CURRENT_DATE,
    debit numeric(12,2) DEFAULT 0.00,
    credit numeric(12,2) DEFAULT 0.00,
    reference_type character varying(30),
    reference_id integer,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.suppliers (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    phone character varying(20),
    address text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payable_balance numeric(12,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.supplier_payments (
    id SERIAL PRIMARY KEY,
    supplier_id integer REFERENCES public.suppliers(id) ON DELETE CASCADE,
    amount_paid numeric(12,2) NOT NULL,
    payment_date date DEFAULT CURRENT_DATE,
    payment_method character varying(50) DEFAULT 'Cash'::character varying,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.supplier_ledger (
    id SERIAL PRIMARY KEY,
    supplier_id integer REFERENCES public.suppliers(id) ON DELETE CASCADE,
    ledger_date date DEFAULT CURRENT_DATE,
    debit numeric(12,2) DEFAULT 0.00,
    credit numeric(12,2) DEFAULT 0.00,
    reference_type character varying(30),
    reference_id integer,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. PURCHASES & EXPENSES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.purchases (
    id SERIAL PRIMARY KEY,
    supplier_id integer REFERENCES public.suppliers(id) ON DELETE SET NULL,
    total_amount numeric(10,2) DEFAULT 0.00,
    purchase_date date DEFAULT CURRENT_DATE,
    notes text,
    created_by integer REFERENCES public.users(id),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id integer REFERENCES public.purchases(id) ON DELETE CASCADE,
    plant_id integer REFERENCES public.plants(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    unit_cost numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id SERIAL PRIMARY KEY,
    plant_id integer REFERENCES public.plants(id) ON DELETE SET NULL,
    amount numeric(10,2) NOT NULL,
    description text,
    expense_date date DEFAULT CURRENT_DATE,
    added_by integer REFERENCES public.users(id),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title character varying(150) DEFAULT 'Untitled'::character varying NOT NULL,
    category character varying(50) DEFAULT 'Other'::character varying NOT NULL,
    is_batch_expense boolean DEFAULT false,
    unit_cost_added numeric(10,2) DEFAULT 0.00,
    notes text,
    receipt_image character varying(255)
);

-- ==========================================
-- 5. POS BILLING & INVOICES
-- ==========================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number character varying(50) NOT NULL UNIQUE,
    customer_id integer REFERENCES public.customers(id) ON DELETE SET NULL,
    subtotal numeric(12,2) DEFAULT 0.00 NOT NULL,
    discount numeric(12,2) DEFAULT 0.00 NOT NULL,
    extra_charges numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    amount_paid numeric(12,2) DEFAULT 0.00 NOT NULL,
    udhaar_amount numeric(12,2) DEFAULT 0.00 NOT NULL,
    total_profit numeric(12,2) DEFAULT 0.00 NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id integer REFERENCES public.invoices(id) ON DELETE CASCADE,
    plant_id integer REFERENCES public.plants(id) ON DELETE SET NULL,
    name character varying(150),
    plant_name character varying(150),
    local_name character varying(150),
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    unit_cost numeric(10,2) DEFAULT 0.00,
    total_price numeric(12,2) NOT NULL,
    item_profit numeric(12,2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.bills (
    id SERIAL PRIMARY KEY,
    invoice_number character varying(20) NOT NULL UNIQUE,
    bill_type character varying(20) DEFAULT 'invoice'::character varying,
    customer_id integer REFERENCES public.customers(id) ON DELETE SET NULL,
    created_by integer REFERENCES public.users(id),
    subtotal numeric(10,2) NOT NULL,
    discount numeric(10,2) DEFAULT 0.00,
    round_off numeric(10,2) DEFAULT 0.00,
    total_amount numeric(10,2) NOT NULL,
    payment_method character varying(50),
    payment_status character varying(20) DEFAULT 'Paid'::character varying,
    amount_paid numeric(10,2) DEFAULT 0.00,
    due_date date,
    notes text,
    bill_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.bill_items (
    id SERIAL PRIMARY KEY,
    bill_id integer REFERENCES public.bills(id) ON DELETE CASCADE,
    plant_id integer REFERENCES public.plants(id) ON DELETE SET NULL,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    total_price numeric(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.payments (
    id SERIAL PRIMARY KEY,
    bill_id integer REFERENCES public.bills(id) ON DELETE CASCADE,
    amount numeric(10,2) NOT NULL,
    method character varying(50),
    received_by integer REFERENCES public.users(id),
    note text,
    paid_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_bills_customer ON public.bills USING btree (customer_id);
CREATE INDEX IF NOT EXISTS idx_bills_date ON public.bills USING btree (bill_date);
CREATE INDEX IF NOT EXISTS idx_customer_ledger ON public.customer_ledger USING btree (customer_id);
CREATE INDEX IF NOT EXISTS idx_disease_history ON public.plant_disease_history USING btree (plant_id);
CREATE INDEX IF NOT EXISTS idx_plant_tasks ON public.plant_tasks USING btree (plant_id, due_date);
CREATE INDEX IF NOT EXISTS idx_supplier_ledger ON public.supplier_ledger USING btree (supplier_id);

-- ==========================================
-- 7. INITIAL DATA SEED (Admin & Categories)
-- ==========================================
INSERT INTO public.plant_categories (name, icon) VALUES 
('Fruit Tree', '🥭'),
('Ornamental', '🌸'),
('Indoor', '🌿'),
('Seasonal', '🌻'),
('Medicinal', '🌱'),
('Palm', '🌴'),
('Tree', '🌳')
ON CONFLICT DO NOTHING;

INSERT INTO public.users (username, password_hash, full_name, role, is_active) 
VALUES (
    'admin', 
    '$2b$10$MP4AzQZaAtNYNMPfs911weLusevr4qfToWlgzeGTsYSASnDLoxyjK', 
    'System Administrator', 
    'owner', 
    true
)
ON CONFLICT (username) DO NOTHING;