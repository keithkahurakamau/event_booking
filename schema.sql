-- ==============================================================================
-- FILE: schema.sql
-- PURPOSE: Physical Data Layer & State Machine Initialization
-- SQA FOCUS: Correctness, Integrity, and Deterministic Execution
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    
    -- SYSTEM INVARIANT 1: Total capacity must be a positive, non-zero integer.
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    
    -- SYSTEM INVARIANT 2 (CORRECTNESS FACTOR): 
    -- The available capacity (C) must mathematically never drop below zero.
    -- This database-level CHECK constraint physically prevents venue overbooking,
    -- bypassing application-layer race conditions.
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0)
);

CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(event_id),
    
    -- EQUIVALENCE PARTITION ENFORCEMENT:
    -- Valid Partition: 1 <= x <= 10.
    -- This constraint guarantees that vectors like x=0 or x=11 are rejected
    -- at the database level, throwing an IntegrityError to the Python backend.
    tickets_requested INTEGER NOT NULL CHECK (tickets_requested BETWEEN 1 AND 10),
    status VARCHAR(50) NOT NULL
);

-- -- Seed Initial State Vector for testing boundaries
-- INSERT INTO events (title, total_capacity, available_capacity)
-- VALUES ('System Testing Symposium', 100, 100);