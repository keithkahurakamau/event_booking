-- ==============================================================================
-- FILE: schema.sql
-- PURPOSE: Physical Data Layer & Multi-Tenant State Machine Initialization
-- SQA FOCUS: Correctness, Integrity, Referential Invariants, and Deterministic Execution
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure a clean initialization state by dropping existing relations
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- 1. ENTITY: EVENTS (Vendor Domain)
CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- IDENTITY ASSOCIATION: Links the entity to a specific vendor
    vendor_id VARCHAR(100) NOT NULL, 
    
    title VARCHAR(255) NOT NULL,
    
    -- SYSTEM INVARIANT 1: Total capacity must be a positive, non-zero integer.
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    
    -- SYSTEM INVARIANT 2 (CORRECTNESS FACTOR): 
    -- The available capacity (C) must mathematically never drop below zero.
    -- This database-level CHECK constraint physically prevents venue overbooking,
    -- bypassing application-layer race conditions.
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0)
);

-- 2. ENTITY: BOOKINGS (Customer Domain)
CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- REFERENTIAL INTEGRITY: 'RESTRICT' prevents the deletion of an event 
    -- if child records (bookings) exist in this table.
    event_id UUID REFERENCES events(event_id) ON DELETE RESTRICT,
    
    -- IDENTITY ASSOCIATION: Links the transaction to a specific customer
    customer_id VARCHAR(100) NOT NULL,
    
    -- EQUIVALENCE PARTITION ENFORCEMENT:
    -- Valid Partition: 1 <= x <= 10.
    -- This constraint guarantees that vectors like x=0 or x=11 are rejected
    -- at the database level, throwing an IntegrityError to the Python backend.
    tickets_requested INTEGER NOT NULL CHECK (tickets_requested BETWEEN 1 AND 10),
    
    status VARCHAR(50) NOT NULL,
    
    -- TEMPORAL TRACKING: Required for sorting customer transaction history
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -- Seed Initial State Vector for testing boundaries (Update with vendor_id)
-- INSERT INTO events (vendor_id, title, total_capacity, available_capacity)
-- VALUES ('vendor_demo', 'System Testing Symposium', 100, 100);