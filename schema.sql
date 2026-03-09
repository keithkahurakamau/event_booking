-- Placeholder for Database DDL, State Machine, & Schema Constraints
-- schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    available_capacity INTEGER NOT NULL CHECK (available_capacity >= 0)
);

CREATE TABLE bookings (
    booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(event_id),
    tickets_requested INTEGER NOT NULL CHECK (tickets_requested BETWEEN 1 AND 10),
    status VARCHAR(50) NOT NULL
);

-- Seed initial vector state for testing
INSERT INTO events (title, total_capacity, available_capacity)
VALUES ('System Testing Symposium', 100, 100);