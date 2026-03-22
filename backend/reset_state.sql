-- ==============================================================================
-- FILE: reset_state.sql
-- PURPOSE: Absolute State Purge & Multi-Tenant Initialization
-- SQA FOCUS: Referential Integrity & State Isolation
-- ==============================================================================

-- 1. PURGE EXISTING MATRICES
-- CASCADE drops the tables regardless of existing foreign key constraints
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 2. REBUILD VENDOR DOMAIN
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id VARCHAR(100) NOT NULL, 
    title VARCHAR(255) NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0)
);

-- 3. REBUILD CUSTOMER DOMAIN
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(event_id) ON DELETE RESTRICT,
    customer_id VARCHAR(100) NOT NULL,
    tickets_requested INTEGER NOT NULL CHECK (tickets_requested BETWEEN 1 AND 10),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. INJECT PRESENTATION SEED DATA
-- This ensures you have immediate data to show the assessor
INSERT INTO events (vendor_id, title, total_capacity, available_capacity)
VALUES 
('vendor_demo', 'SWE3020 Final Defense', 50, 50),
('vendor_demo', 'PostgreSQL Architecture Workshop', 15, 15);