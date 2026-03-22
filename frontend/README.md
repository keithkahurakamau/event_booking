# SWE3020: Event Booking System
**Software Quality Assurance (SQA) Architecture Prototype**

This runbook outlines the exact deterministic boot sequence required for the live system defense.

## 0. Pre-Flight Checklist
Before beginning the presentation, ensure the following daemons are active:
* PostgreSQL server is running on `localhost:5432`.
* No other applications are occupying ports `8000` (FastAPI) or `3000` (React).

---

## 1. State Initialization (Terminal 1)
To guarantee an uncontaminated state matrix for the presentation, the database must be reset to its initial vectors.
1. Open a terminal in the root `SWE3020_Event_Booking/backend/` directory.
2. Execute the state-purge script:
   ```bash
   psql -U postgres -h localhost -d event_booking -f reset_state.sql