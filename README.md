# Event Booking System

A CLI-based event booking system with PostgreSQL backend.

## File Structure

```
event_booking_system/
├── cli.py                    # User Interface / Input Vector Generation
├── db.py                     # PostgreSQL Connection Factory
├── booking_transaction.py    # Core Business Logic & System Under Test (SUT)
├── schema.sql                # Database DDL, State Machine, & Schema Constraints
├── test_booking.py           # Unit Test Suite (BVA/EP Validation)
└── requirements.txt          # Dependency Manifest
```

## Description

This is a command-line interface (CLI) based event booking system that allows users to:
- Browse available events
- Make bookings for events
- Manage customer information
- Handle booking transactions with state machine validation

## Components

| File | Description |
|------|-------------|
| `cli.py` | User Interface - Handles user input and output for the booking system |
| `db.py` | PostgreSQL Connection Factory - Manages database connections and pooling |
| `booking_transaction.py` | Core Business Logic - Contains the System Under Test (SUT) for booking operations |
| `schema.sql` | Database Schema - DDL with state machine and schema constraints |
| `test_booking.py` | Unit Tests - BVA (Boundary Value Analysis) and EP (Equivalence Partitioning) validation |
| `requirements.txt` | Python Dependencies - Required packages for the system |

## Requirements

- Python 3.8+
- PostgreSQL 12+

## Installation

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables for database connection:
```bash
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=event_booking
export DB_USER=postgres
export DB_PASSWORD=your_password
```

3. Initialize the database:
```bash
psql -U postgres -d event_booking -f schema.sql
```

## Usage

Run the CLI application:
```bash
python cli.py
```

## Testing

Run unit tests:
```bash
pytest test_booking.py -v
```

## License

MIT License

