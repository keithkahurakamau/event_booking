-- ==============================================================================
-- FILE: schema.sql
-- PURPOSE: Physical Data Layer & Multi-Tenant State Machine Initialization
-- SQA FOCUS: Correctness, Integrity, Referential Invariants, and Deterministic Execution
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. ENTITY: USERS (Authentication Domain)
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('vendor', 'customer'))
);

-- 2. ENTITY: EVENTS (Vendor Domain)
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID REFERENCES users(user_id) ON DELETE RESTRICT,
    title VARCHAR(255) NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0)
);

-- 3. ENTITY: BOOKINGS (Customer Domain)
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(event_id) ON DELETE RESTRICT,
    customer_id UUID REFERENCES users(user_id) ON DELETE RESTRICT,
    tickets_requested INTEGER NOT NULL CHECK (tickets_requested BETWEEN 1 AND 10),
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('vendor', 'customer'))
);


-- Update events and bookings to reference users if needed
-- (events.vendor_id should match users.user_id, bookings.customer_id should match users.user_id)

-- -- Seed Initial State Vector for testing boundaries (Update with vendor_id)
-- INSERT INTO events (vendor_id, title, total_capacity, available_capacity)
-- VALUES ('vendor_demo', 'System Testing Symposium', 100, 100);