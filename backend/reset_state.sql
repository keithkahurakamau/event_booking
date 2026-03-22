-- ==============================================================================
-- FILE: reset_state.sql
-- PURPOSE: Absolutely Reset Database State for Deterministic Testing
-- SQA FOCUS: Ensuring a Pristine Environment for Each Test Run
-- ==============================================================================

-- 1. Purge Mutated State Data
-- CASCADE ensures foreign key constraints do not block the truncation of bookings.
TRUNCATE TABLE bookings CASCADE;

-- 2. Clear Existing Entity Vectors
DELETE FROM events;

-- 3. Inject Clean Presentation Vectors
INSERT INTO events (title, total_capacity, available_capacity) VALUES 
('SWE3020 System Testing Symposium', 100, 100),
('Summertides Festival', 2000, 2000),
('PostgreSQL Architecture Workshop', 30, 30),
('Nairobi Developer Meetup', 150, 150),
('Exclusive SQA Masterclass', 5, 5);