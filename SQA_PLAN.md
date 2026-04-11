# Software Quality Assurance (SQA) Plan

## Event Booking System - EVENTIC

**Document Version:** 1.0
**Project:** SWE 3020 - Event Booking System
**Course:** SWE 3020 (Software Testing & Quality Assurance)
**Prepared By:** SQA Project Team
**Date:** April 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Scope](#2-scope)
3. [Reference Documents](#3-reference-documents)
4. [Quality Objectives](#4-quality-objectives)
5. [System Architecture Overview](#5-system-architecture-overview)
6. [SQA Roles & Responsibilities](#6-sqa-roles--responsibilities)
7. [Test Strategy](#7-test-strategy)
8. [Test Techniques & Methods](#8-test-techniques--methods)
9. [Test Environment & Infrastructure](#9-test-environment--infrastructure)
10. [Test Cases & Traceability Matrix](#10-test-cases--traceability-matrix)
11. [Defect Management](#11-defect-management)
12. [Entry & Exit Criteria](#12-entry--exit-criteria)
13. [Risk Analysis & Mitigation](#13-risk-analysis--mitigation)
14. [Metrics & Reporting](#14-metrics--reporting)
15. [Configuration Management](#15-configuration-management)
16. [Schedule & Milestones](#16-schedule--milestones)
17. [Tools & Technologies](#17-tools--technologies)
18. [Appendices](#18-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Quality Assurance (SQA) Plan defines the standards, practices, processes, and procedures employed to assure the quality of the **EVENTIC Event Booking System**. It establishes the framework for systematic verification and validation activities across all tiers of the application architecture.

The plan ensures mathematical verification of transactional state machines, multi-tenant referential integrity, and demonstration of absolute structural coverage in alignment with SWE 3020 course requirements.

### 1.2 Document Overview

This SQA Plan provides:

- Comprehensive quality objectives grounded in McCall's Software Quality Model
- A multi-layered test strategy spanning Black Box, White Box, and End-to-End (E2E) testing
- Formal Boundary Value Analysis (BVA) and Equivalence Partitioning (EP) specifications
- Control Flow Graph (CFG) analysis with Cyclomatic Complexity verification
- Traceability matrix linking requirements to test cases
- Risk assessment and mitigation strategies
- Defect lifecycle management procedures

### 1.3 Intended Audience

| Audience                    | Usage                                          |
|-----------------------------|-------------------------------------------------|
| Development Team            | Implementation standards and testing procedures |
| QA/Test Engineers           | Test execution guidelines and acceptance criteria |
| Course Instructor/Assessor  | Evaluation of SQA methodology and rigor         |
| Project Stakeholders        | Quality assurance oversight                     |

---

## 2. Scope

### 2.1 In Scope

| Area                         | Description                                                              |
|------------------------------|--------------------------------------------------------------------------|
| Backend API Layer            | FastAPI RESTful endpoints (`main.py`), business logic (`booking_transaction.py`), database connectivity (`db.py`) |
| Frontend Presentation Layer  | React + Material UI components: Welcome page, Vendor Dashboard, Customer Booking Form, Event Inventory, Customer History |
| Database Layer               | PostgreSQL schema with CHECK constraints, referential integrity, UUID primary keys |
| Authentication Module        | User signup/login with bcrypt password hashing and role-based access (`vendor` / `customer`) |
| Booking Transaction Engine   | Core state machine with capacity validation, BVA enforcement, and transactional atomicity |
| Vendor CRUD Operations       | Create, Read, Update, Delete operations for event entities |
| E2E Integration Tests        | Mocha/Chai/Supertest API verification suite |
| BDD Tests                    | Behave feature files for blackbox and whitebox scenarios |
| CI/CD Pipeline               | GitHub Actions workflow for automated testing and linting |

### 2.2 Out of Scope

| Area                          | Justification                                              |
|-------------------------------|------------------------------------------------------------|
| Production Deployment         | Prototype scope; no production infrastructure              |
| Performance/Load Testing      | Not required for SWE 3020 deliverables                     |
| Security Penetration Testing  | Beyond course scope; basic security measures are validated |
| Mobile Application Testing    | No mobile client exists                                    |
| Payment Gateway Integration   | Simulated with fake payment delay in BookingForm.js        |
| Third-Party API Integration   | System is self-contained                                   |

---

## 3. Reference Documents

| Document                      | Description                                                       |
|-------------------------------|-------------------------------------------------------------------|
| `README.md`                   | Project documentation, architecture overview, and runbook         |
| `traceability_matrix.md`      | Requirements-to-test mapping                                      |
| `schema.sql`                  | Database DDL with constraint definitions                          |
| `booking_transaction.py`      | Core System Under Test (SUT) with CFG annotations                 |
| `.github/workflows/ci.yml`    | CI/CD pipeline configuration                                      |
| McCall's Software Quality Model | Theoretical framework for quality factor evaluation             |
| IEEE 730-2014                 | Standard for Software Quality Assurance Processes                 |

---

## 4. Quality Objectives

### 4.1 Quality Model: McCall's Software Quality Framework

This project is built upon **McCall's Software Quality Model**, optimizing entirely for the **Product Operation** domain. The four targeted quality factors are:

#### 4.1.1 Correctness

> *The extent to which the software satisfies its specifications and fulfills the user's objectives.*

| Objective                                        | Verification Method                         |
|--------------------------------------------------|---------------------------------------------|
| Booking transactions produce deterministic results | BVA/EP testing of `execute_booking()` function |
| Database state invariants are never violated      | PostgreSQL CHECK constraints + rollback tests |
| `available_capacity` is always non-negative       | SQL `CHECK (available_capacity >= 0)` constraint |
| Tickets per transaction are bounded `[1, 10]`     | SQL `CHECK (tickets_requested BETWEEN 1 AND 10)` |
| Event capacity initialization: `available == total` | Vendor event creation API tests            |

#### 4.1.2 Usability

> *The effort required to learn, operate, prepare input, and interpret output of the software.*

| Objective                                    | Verification Method                                    |
|----------------------------------------------|--------------------------------------------------------|
| Intuitive role-based navigation (Vendor/Customer) | Manual UI walkthrough and functional testing      |
| Searchable event dropdown replaces manual UUID entry | Frontend component inspection (BookingForm.js) |
| Real-time capacity visualization with progress bars | EventInventory.js renders live state              |
| Clear error messages for constraint violations | API response validation in E2E tests                  |
| Responsive Material UI interface              | Browser compatibility testing                          |

#### 4.1.3 Integrity

> *The extent to which access to software or data by unauthorized persons can be controlled.*

| Objective                                   | Verification Method                                     |
|---------------------------------------------|---------------------------------------------------------|
| Passwords are hashed with bcrypt            | Code review of `signup()` in `main.py`                  |
| Role enforcement (`vendor` / `customer`)    | SQL `CHECK (role IN ('vendor', 'customer'))` constraint  |
| UUID primary keys prevent enumeration attacks | Schema inspection and API testing                      |
| Foreign key constraints prevent orphan records | `ON DELETE RESTRICT` clauses in `schema.sql`           |
| CORS middleware configured                  | `main.py` middleware inspection                         |

#### 4.1.4 Reliability

> *The extent to which the software can be expected to perform its intended function without failure.*

| Objective                                    | Verification Method                                     |
|----------------------------------------------|---------------------------------------------------------|
| Transaction rollback on any failure          | White box CFG Path 4 & 5 testing                        |
| `FOR UPDATE` row-level locks prevent race conditions | `booking_transaction.py` code analysis            |
| Graceful error handling across all API endpoints | E2E test suite covering fault paths                  |
| Database connection cleanup in `finally` blocks | Code review of all API handlers                       |
| System fault tolerance (hardware/network)    | CFG Path 5 test with `conn=None`                        |

### 4.2 Quality Metrics Targets

| Metric                        | Target                              |
|-------------------------------|--------------------------------------|
| Branch Coverage               | 100% on `booking_transaction.py`     |
| BVA Boundary Test Pass Rate   | 100% (all 4 boundary vectors)        |
| CFG Path Coverage             | 100% (all 5 independent paths)       |
| E2E Test Pass Rate            | 100% across 3 test domains           |
| Behave Scenario Pass Rate     | 100% for blackbox and whitebox       |
| Critical Defect Escape Rate   | 0 (zero critical defects in release) |

---

## 5. System Architecture Overview

### 5.1 Three-Tier Architecture

```
+--------------------------------------------------------------+
|                    PRESENTATION LAYER                         |
|               ReactJS + Material UI (Port 3000)               |
|                                                              |
|  +------------------+  +------------------+  +--------------+ |
|  |   Welcome Page   |  |  VendorDashboard |  |  BookingForm | |
|  |  (Login/Signup)  |  |   (CRUD Events)  |  | (Reservations)| |
|  +------------------+  +------------------+  +--------------+ |
|  +------------------+  +------------------+                   |
|  | EventInventory   |  | CustomerHistory  |                   |
|  | (Live State View)|  | (Booking Records)|                   |
|  +------------------+  +------------------+                   |
+-------------------------------+------------------------------+
                                |
                          HTTP/REST API
                                |
+-------------------------------v------------------------------+
|                    APPLICATION LAYER                          |
|              FastAPI / Python (Port 8000)                     |
|                                                              |
|  +------------------+  +------------------+  +--------------+ |
|  |     main.py      |  |    db.py         |  | booking_     | |
|  | (API Routing &   |  | (Connection      |  | transaction  | |
|  |  DTO Validation) |  |  Factory)        |  | .py (SUT)    | |
|  +------------------+  +------------------+  +--------------+ |
+-------------------------------+------------------------------+
                                |
                          TCP/IP (psycopg2)
                                |
+-------------------------------v------------------------------+
|                      DATA LAYER                              |
|              PostgreSQL (Port 5432)                           |
|                                                              |
|  +------------------+  +------------------+  +--------------+ |
|  |  users           |  |  events          |  |  bookings    | |
|  |  - user_id (PK)  |  |  - event_id (PK) |  | - booking_id | |
|  |  - username (UQ) |  |  - vendor_id (FK)|  | - event_id   | |
|  |  - email (UQ)    |  |  - title         |  | - customer_id| |
|  |  - password_hash |  |  - total_capacity|  | - tickets    | |
|  |  - role (CHECK)  |  |  - avail_capacity|  | - status     | |
|  +------------------+  +------------------+  +--------------+ |
+--------------------------------------------------------------+
```

### 5.2 Data Flow

1. **User Authentication:** Client submits credentials -> FastAPI validates via bcrypt -> returns `user_id` and `role`
2. **Event Management:** Vendor creates/updates/deletes events -> FastAPI enforces constraints -> PostgreSQL persists state
3. **Booking Transaction:** Customer selects event + ticket count -> `execute_booking()` acquires row lock -> validates capacity -> decrements `available_capacity` -> creates booking record -> commits or rolls back

### 5.3 Key Source Files

| File                          | Layer          | Purpose                                   |
|-------------------------------|----------------|-------------------------------------------|
| `backend/main.py`            | Application    | RESTful API routing and DTO validation     |
| `backend/booking_transaction.py` | Application | Core transaction logic (SUT)              |
| `backend/db.py`              | Application    | PostgreSQL connection factory              |
| `backend/schema.sql`         | Data           | DDL with constraints and referential integrity |
| `backend/reset_state.sql`    | Data           | State purge and seed data script           |
| `backend/cli.py`             | Application    | CLI interface for manual testing           |
| `frontend/src/App.js`        | Presentation   | Root component with theme and routing      |
| `frontend/src/pages/Welcome.js` | Presentation | Login/Signup interface                  |
| `frontend/src/forms/BookingForm.js` | Presentation | Customer booking form               |
| `frontend/src/forms/VendorDashboard.js` | Presentation | Vendor CRUD interface          |
| `frontend/src/components/EventInventory.js` | Presentation | Live capacity display       |
| `frontend/src/components/CustomerHistory.js` | Presentation | Booking history view       |

---

## 6. SQA Roles & Responsibilities

| Role                     | Responsibilities                                                                        |
|--------------------------|-----------------------------------------------------------------------------------------|
| **SQA Lead**             | Oversees the SQA plan execution; ensures quality standards are met; reports quality metrics |
| **Test Engineer**        | Designs, writes, and executes test cases; maintains test suites; reports defects          |
| **Backend Developer**    | Implements API logic; fixes backend defects; ensures database constraint correctness      |
| **Frontend Developer**   | Implements UI components; fixes frontend defects; ensures usability compliance            |
| **Database Engineer**    | Designs schema constraints; validates referential integrity; manages state reset scripts   |
| **CI/CD Engineer**       | Maintains GitHub Actions workflows; monitors build health; ensures pipeline reliability    |
| **Code Reviewer**        | Reviews all code changes for quality, security, and adherence to standards                 |

---

## 7. Test Strategy

### 7.1 Testing Levels

The testing strategy employs a multi-level approach to ensure comprehensive quality coverage:

```
+---------------------------------------------------------------+
|                    TESTING PYRAMID                             |
|                                                               |
|                        /\                                     |
|                       /  \         E2E Tests                  |
|                      / E2E\        (Mocha/Chai/Supertest)     |
|                     /______\       3 test domains             |
|                    /        \                                  |
|                   / BDD/BVA  \     Integration Tests          |
|                  / (Behave +  \    (Behave feature files +    |
|                 /  unittest)   \   BVA/EP unit tests)         |
|                /________________\                             |
|               /                  \                            |
|              /   Database Layer   \   Schema Constraints      |
|             /   (CHECK, FK, UQ)    \  (SQL-level validation)  |
|            /________________________\                         |
+---------------------------------------------------------------+
```

| Level                    | Scope                                   | Tools                    |
|--------------------------|-----------------------------------------|--------------------------|
| **Unit / BVA Testing**   | `execute_booking()` function boundaries | Python `unittest`        |
| **White Box Testing**    | CFG path coverage of `execute_booking()` | Python `unittest`       |
| **BDD Integration**      | Blackbox & whitebox Behave scenarios    | Python `behave`          |
| **E2E API Testing**      | Full API endpoint verification          | Mocha, Chai, Supertest   |
| **UI Functional Testing**| Frontend component behavior             | Manual + React Testing Library |
| **CI Pipeline Testing**  | Automated regression on push/PR         | GitHub Actions           |

### 7.2 Testing Approaches

#### 7.2.1 Black Box Testing

Black box testing treats the system as an opaque entity, validating inputs and expected outputs without knowledge of internal implementation.

**Techniques Applied:**

- **Equivalence Partitioning (EP):** Divides the input domain of `tickets_requested` into valid and invalid partitions
- **Boundary Value Analysis (BVA):** Tests the precise boundaries of the valid partition `[1, 10]`

#### 7.2.2 White Box Testing

White box testing examines the internal structure, logic paths, and code flow of the System Under Test.

**Techniques Applied:**

- **Control Flow Graph (CFG) Analysis:** Maps all decision points in `execute_booking()`
- **Cyclomatic Complexity:** Calculates the minimum number of independent paths requiring test coverage
- **Branch Coverage:** Ensures every conditional branch is executed at least once

#### 7.2.3 End-to-End Testing

E2E testing validates the complete request-response cycle from API entry point through database operations and back.

**Domains Covered:**

1. User Authentication & Role Constraints
2. Vendor Event Integrity
3. Transaction Control Flow & BVA

---

## 8. Test Techniques & Methods

### 8.1 Equivalence Partitioning (EP)

The input domain for `tickets_requested` is partitioned as follows:

| Partition ID | Class              | Range       | Expected Behavior             |
|--------------|--------------------|-------------|-------------------------------|
| EP-1         | Invalid (Lower)    | `x < 1`    | Rejection (ValueError / 400)  |
| EP-2         | Valid              | `1 <= x <= 10` | Acceptance (CONFIRMED / 201) |
| EP-3         | Invalid (Upper)    | `x > 10`   | Rejection (ValueError / 400)  |

### 8.2 Boundary Value Analysis (BVA)

BVA test vectors target the absolute limits of the valid partition:

| BVA Vector | Value | Partition | Expected Result              | Enforcement Layer          |
|------------|-------|-----------|------------------------------|----------------------------|
| BVA-1      | 0     | EP-1      | `ValueError` raised          | PostgreSQL CHECK + Python  |
| BVA-2      | 1     | EP-2      | `CONFIRMED` status returned  | Application logic          |
| BVA-3      | 10    | EP-2      | `CONFIRMED` status returned  | Application logic          |
| BVA-4      | 11    | EP-3      | `ValueError` raised          | PostgreSQL CHECK + Python  |

**Dual-Layer Enforcement:**

- **Client Layer:** HTML `<input>` element with `min=1` and `max=10` attributes prevents invalid input at the UI level
- **Persistence Layer:** PostgreSQL `CHECK (tickets_requested BETWEEN 1 AND 10)` constraint rejects invalid values at the database level, producing an `IntegrityError` that is caught and translated to a `ValueError`

### 8.3 Control Flow Graph (CFG) Analysis

The core transaction module `execute_booking()` in `booking_transaction.py` contains **4 Predicate Nodes** (Decision Points):

```
                    START
                      |
                      v
              +-------+-------+
              | UUID Validation |
              | (try/except)    |
              +-------+--------+
                      |
              +-------v--------+
              | Node A:         |
              | Entity Exists?  |-----> NO ----> ValueError
              | (customer check)|              "Entity Fault"
              +-------+--------+
                      | YES
                      v
              +-------+--------+
              | Acquire FOR     |
              | UPDATE Lock     |
              +-------+--------+
                      |
              +-------v--------+
              | Event Record    |
              | Exists?         |-----> NO ----> ValueError
              |                 |              "Event not found"
              +-------+--------+
                      | YES
                      v
              +-------+--------+
              | Node B:         |
              | Capacity >=     |-----> NO ----> ValueError
              | Requested?      |              "Capacity Fault"
              +-------+--------+
                      | YES
                      v
              +-------+--------+
              | Mutate State    |
              | (UPDATE + INSERT)|
              +-------+--------+
                      |
                      v
              +-------+--------+
              | COMMIT          |
              | Return CONFIRMED|
              +-------+--------+
                      |
                      v
                    END (Nominal)

  EXCEPTION HANDLERS:
  
  +-------------------+          +-------------------+
  | Node C:           |          | Node D:           |
  | IntegrityError    |          | Generic Exception |
  | (BVA Violation)   |          | (System Fault)    |
  | -> ROLLBACK       |          | -> ROLLBACK       |
  | -> ValueError     |          | -> Re-raise       |
  +-------------------+          +-------------------+
```

### 8.4 Cyclomatic Complexity Calculation

Using McCabe's formula:

```
V(G) = P + 1
```

Where `P` = number of predicate nodes = **4**

```
V(G) = 4 + 1 = 5
```

**Result:** Exactly **5 independent execution paths** must be tested to achieve 100% branch coverage.

### 8.5 Independent Path Enumeration

| Path ID | Description                | Predicate Flow           | Expected Outcome              |
|---------|----------------------------|--------------------------|-------------------------------|
| Path 1  | Nominal Execution          | A=pass, B=pass           | `CONFIRMED` (commit)          |
| Path 2  | Entity Fault               | A=fail                   | `ValueError` (entity missing) |
| Path 3  | Capacity Fault             | A=pass, B=fail           | `ValueError` (capacity exceeded) |
| Path 4  | Integrity Fault (BVA)      | A=pass, B=pass, C=catch  | `ValueError` (partition violation) |
| Path 5  | System Fault               | D=catch                  | `Exception` (hardware/network) |

---

## 9. Test Environment & Infrastructure

### 9.1 Development Environment

| Component        | Specification                                    |
|------------------|--------------------------------------------------|
| Operating System | Ubuntu Linux (latest LTS)                        |
| Python Version   | 3.9+ (CI) / 3.10+ (local development)           |
| Node.js Version  | 18.x                                             |
| Database         | PostgreSQL running on `localhost:5432`            |
| Database Name    | `event_booking`                                  |
| Backend Server   | Uvicorn on `localhost:8000`                       |
| Frontend Server  | React dev server on `localhost:3000`              |
| Package Manager  | pip (Python), npm (Node.js)                      |

### 9.2 Test Environment Setup

#### Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
pip install behave coverage flake8
```

#### Frontend Dependencies

```bash
cd frontend
npm install
```

#### E2E Test Dependencies

```bash
cd e2e_tests
npm install
```

#### Database Initialization

```bash
cd backend
psql -U postgres -h localhost -c "CREATE DATABASE event_booking;"
psql -U postgres -h localhost -d event_booking -f schema.sql
```

#### State Reset (Before Each Test Run)

```bash
cd backend
psql -U postgres -h localhost -d event_booking -f reset_state.sql
```

### 9.3 CI/CD Pipeline Configuration

The project uses **GitHub Actions** for continuous integration, defined in `.github/workflows/ci.yml`:

| Job                | Steps                                                      | Trigger                    |
|--------------------|-----------------------------------------------------------|----------------------------|
| `backend-tests`   | Install deps -> Blackbox Behave -> Whitebox Behave -> Coverage Report -> Flake8 Lint | Push to `main`, PRs to `main` |
| `frontend-tests`  | Install deps -> Jest Tests with Coverage -> ESLint         | Push to `main`, PRs to `main` |

---

## 10. Test Cases & Traceability Matrix

### 10.1 Requirements Specification

| Req ID  | Requirement Description                                          | Priority  | Category       |
|---------|------------------------------------------------------------------|-----------|----------------|
| REQ-01  | Users can register with username, email, password, and role      | High      | Authentication |
| REQ-02  | Users can log in with username and password                      | High      | Authentication |
| REQ-03  | Duplicate usernames/emails are rejected on signup                | High      | Integrity      |
| REQ-04  | Vendors can create events with title and capacity                | High      | CRUD           |
| REQ-05  | Event initialization invariant: `available_capacity == total_capacity` | High | Correctness    |
| REQ-06  | Vendors can update event title and capacity                      | Medium    | CRUD           |
| REQ-07  | Vendors cannot reduce capacity below tickets already sold        | High      | Correctness    |
| REQ-08  | Vendors can delete events with no active bookings                | Medium    | CRUD           |
| REQ-09  | Events with active bookings cannot be deleted (referential integrity) | High  | Integrity      |
| REQ-10  | Customers can book between 1 and 10 tickets per transaction      | High      | Correctness    |
| REQ-11  | Booking 0 tickets is rejected (BVA lower boundary)               | High      | Correctness    |
| REQ-12  | Booking 11+ tickets is rejected (BVA upper boundary)             | High      | Correctness    |
| REQ-13  | Booking fails when requested tickets exceed available capacity   | High      | Correctness    |
| REQ-14  | Booking fails for non-existent event or customer UUIDs           | High      | Integrity      |
| REQ-15  | Invalid UUID formats are rejected before database query          | Medium    | Integrity      |
| REQ-16  | All transactions use row-level locking (`FOR UPDATE`)            | High      | Reliability    |
| REQ-17  | Failed transactions trigger automatic rollback                   | High      | Reliability    |
| REQ-18  | System handles hardware/network faults gracefully                | Medium    | Reliability    |
| REQ-19  | Event inventory displays real-time capacity with cache busting   | Medium    | Usability      |
| REQ-20  | Customer booking history is retrievable by customer ID           | Medium    | Usability      |
| REQ-21  | Passwords are stored as bcrypt hashes, never in plaintext        | High      | Integrity      |
| REQ-22  | Role field is constrained to `vendor` or `customer` only         | High      | Integrity      |

### 10.2 Test Case Catalog

#### 10.2.1 Authentication Test Cases

| Test ID   | Test Description                              | Req ID  | Type     | Input                                    | Expected Result                     |
|-----------|-----------------------------------------------|---------|----------|------------------------------------------|-------------------------------------|
| TC-AUTH-01 | Successful vendor registration               | REQ-01  | E2E      | Valid username, email, password, role=vendor | HTTP 201, returns UUID `user_id`   |
| TC-AUTH-02 | Reject duplicate registration                | REQ-03  | E2E      | Previously registered username/email     | HTTP 400, "already exists" message  |
| TC-AUTH-03 | Successful vendor login                      | REQ-02  | E2E      | Valid credentials (form-encoded)         | HTTP 200, returns `user_id` + `role` |
| TC-AUTH-04 | Reject invalid login credentials             | REQ-02  | E2E      | Wrong password                           | HTTP 401, "Invalid username or password" |
| TC-AUTH-05 | UUID format validation on user_id            | REQ-01  | E2E      | Check returned user_id matches UUID v4 regex | UUID v4 pattern match             |

#### 10.2.2 Vendor Event Management Test Cases

| Test ID    | Test Description                              | Req ID   | Type    | Input                                    | Expected Result                       |
|------------|-----------------------------------------------|----------|---------|------------------------------------------|---------------------------------------|
| TC-VEND-01 | Create event with valid parameters            | REQ-04   | E2E     | vendor_id, title, total_capacity=5       | HTTP 201, returns `event_id`          |
| TC-VEND-02 | Verify initial capacity invariant             | REQ-05   | E2E     | GET /api/events after creation           | `available_capacity == total_capacity` |
| TC-VEND-03 | Update event title and capacity               | REQ-06   | API     | PUT with new title and increased capacity | HTTP 200, state updated              |
| TC-VEND-04 | Reject capacity reduction below sold tickets  | REQ-07   | API     | PUT with capacity < tickets_sold         | HTTP 400, "Constraint Fault"          |
| TC-VEND-05 | Delete event with no bookings                 | REQ-08   | API     | DELETE /api/vendor/events/{event_id}     | HTTP 200, event removed               |
| TC-VEND-06 | Reject deletion of event with active bookings | REQ-09   | API     | DELETE event that has bookings           | HTTP 400, "Integrity Fault"           |

#### 10.2.3 Booking Transaction Test Cases (BVA/EP)

| Test ID    | Test Description                              | Req ID   | Type     | Input (tickets_requested) | Expected Result                     |
|------------|-----------------------------------------------|----------|----------|---------------------------|-------------------------------------|
| TC-BVA-01  | Lower invalid boundary (x=0)                 | REQ-11   | Unit/E2E | 0                         | `ValueError` / HTTP 400             |
| TC-BVA-02  | Lower valid boundary (x=1)                   | REQ-10   | Unit/E2E | 1                         | `CONFIRMED` / HTTP 201              |
| TC-BVA-03  | Internal valid partition (x=2)                | REQ-10   | E2E      | 2                         | `CONFIRMED` / HTTP 201              |
| TC-BVA-04  | Upper valid boundary (x=10)                   | REQ-10   | Unit     | 10                        | `CONFIRMED` / HTTP 201              |
| TC-BVA-05  | Upper invalid boundary (x=11)                | REQ-12   | Unit/E2E | 11                        | `ValueError` / HTTP 400             |
| TC-BVA-06  | Capacity exhaustion fault                     | REQ-13   | E2E      | 10 (when only 2 available)| HTTP 400, "Capacity Fault"           |

#### 10.2.4 White Box CFG Path Test Cases

| Test ID    | Test Description                     | Req ID         | CFG Path | Input Configuration                     | Expected Result                      |
|------------|--------------------------------------|----------------|----------|------------------------------------------|--------------------------------------|
| TC-CFG-01  | Nominal execution (happy path)       | REQ-10, REQ-16 | Path 1   | Valid event, valid customer, tickets=2   | `CONFIRMED`, state committed         |
| TC-CFG-02  | Entity fault (missing customer)      | REQ-14         | Path 2   | Non-existent UUID for customer           | `ValueError` ("does not exist")      |
| TC-CFG-03  | Capacity fault (overbooking)         | REQ-13         | Path 3   | Request 5 tickets, only 2 available      | `ValueError` ("exceeds limit")       |
| TC-CFG-04  | Integrity fault (BVA violation)      | REQ-12         | Path 4   | tickets=15, passes capacity but fails CHECK | `ValueError` ("outside the [1, 10]") |
| TC-CFG-05  | System fault (hardware/network)      | REQ-18         | Path 5   | Pass `conn=None` to force exception      | `Exception` raised                   |

#### 10.2.5 BDD (Behave) Test Cases

| Test ID    | Feature File                                         | Scenario                     | Type      |
|------------|------------------------------------------------------|------------------------------|-----------|
| TC-BDD-01  | `tests/blackbox/booking_transaction.feature`         | Successful booking           | Blackbox  |
| TC-BDD-02  | `tests/whitebox/booking_transaction_control_flow.feature` | Booking with invalid state | Whitebox  |

### 10.3 Requirements Traceability Matrix (RTM)

| Req ID  | TC-AUTH | TC-VEND | TC-BVA | TC-CFG | TC-BDD | Test File(s)                                            |
|---------|---------|---------|--------|--------|--------|---------------------------------------------------------|
| REQ-01  | 01, 05  |         |        |        |        | `01_auth.test.js`                                       |
| REQ-02  | 03, 04  |         |        |        |        | `01_auth.test.js`                                       |
| REQ-03  | 02      |         |        |        |        | `01_auth.test.js`                                       |
| REQ-04  |         | 01      |        |        |        | `02_vendor_state.test.js`                               |
| REQ-05  |         | 02      |        |        |        | `02_vendor_state.test.js`                               |
| REQ-06  |         | 03      |        |        |        | (Manual / API test)                                     |
| REQ-07  |         | 04      |        |        |        | (Manual / API test)                                     |
| REQ-08  |         | 05      |        |        |        | (Manual / API test)                                     |
| REQ-09  |         | 06      |        |        |        | (Manual / API test)                                     |
| REQ-10  |         |         | 02, 03, 04 | 01 |        | `03_booking_bva.test.js`, `test_bva_ep.py`, `test_cfg_paths` |
| REQ-11  |         |         | 01     |        |        | `03_booking_bva.test.js`, `test_bva_ep.py`              |
| REQ-12  |         |         | 05     | 04     |        | `03_booking_bva.test.js`, `test_bva_ep.py`, `test_cfg_paths` |
| REQ-13  |         |         | 06     | 03     |        | `03_booking_bva.test.js`, `test_cfg_paths`              |
| REQ-14  |         |         |        | 02     |        | `test_cfg_paths`                                        |
| REQ-15  |         |         |        | 02     |        | `test_cfg_paths`                                        |
| REQ-16  |         |         |        | 01     |        | `booking_transaction.py` (code review)                  |
| REQ-17  |         |         |        | 03-05  | 02     | `test_cfg_paths`, `booking_transaction_control_flow.feature` |
| REQ-18  |         |         |        | 05     |        | `test_cfg_paths`                                        |
| REQ-19  |         |         |        |        |        | `EventInventory.js` (manual UI test)                    |
| REQ-20  |         |         |        |        |        | `CustomerHistory.js` (manual UI test)                   |
| REQ-21  |         |         |        |        |        | `main.py` (code review)                                 |
| REQ-22  |         |         |        |        |        | `schema.sql` (schema inspection)                        |

---

## 11. Defect Management

### 11.1 Defect Lifecycle

```
  +----------+     +----------+     +----------+     +----------+     +--------+
  |   NEW    | --> | ASSIGNED | --> |   FIXED  | --> | VERIFIED | --> | CLOSED |
  +----------+     +----------+     +----------+     +----------+     +--------+
       |                |                |                |
       |                v                v                v
       |          +----------+     +----------+     +----------+
       +--------> | DEFERRED |     | REJECTED |     | REOPENED |
                  +----------+     +----------+     +----------+
```

### 11.2 Defect Severity Classification

| Severity     | Definition                                                    | Example                                              |
|-------------|---------------------------------------------------------------|------------------------------------------------------|
| **Critical** | System crash, data corruption, or complete feature failure    | Booking allows negative tickets; database state corruption |
| **Major**    | Feature malfunction with no workaround                        | Capacity not decremented after booking; login always fails |
| **Minor**    | Feature works but with cosmetic or minor behavioral issues    | Error message text is unclear; UI alignment issues    |
| **Trivial**  | Cosmetic defect with no functional impact                     | Typo in label; minor color inconsistency              |

### 11.3 Defect Priority Classification

| Priority   | Response Time    | Resolution Target |
|------------|------------------|-------------------|
| P1 - Urgent | Immediate       | Same day          |
| P2 - High   | Within 24 hours | 2 business days   |
| P3 - Medium | Within 48 hours | 5 business days   |
| P4 - Low    | Next sprint     | Best effort       |

### 11.4 Defect Report Template

| Field              | Description                              |
|--------------------|------------------------------------------|
| Defect ID          | Unique identifier (e.g., DEF-001)        |
| Title              | Brief description                        |
| Severity           | Critical / Major / Minor / Trivial       |
| Priority           | P1 / P2 / P3 / P4                       |
| Status             | New / Assigned / Fixed / Verified / Closed |
| Reporter           | Person who found the defect              |
| Assignee           | Developer responsible for fix            |
| Component          | Backend / Frontend / Database / E2E Tests |
| Steps to Reproduce | Detailed reproduction steps              |
| Expected Result    | What should happen                       |
| Actual Result      | What actually happened                   |
| Environment        | OS, browser, Node.js version, etc.       |
| Attachments        | Screenshots, logs, error traces          |
| Date Found         | Date of discovery                        |
| Date Fixed         | Date of resolution                       |

---

## 12. Entry & Exit Criteria

### 12.1 Test Entry Criteria

| Criterion                                              | Verification                              |
|--------------------------------------------------------|-------------------------------------------|
| All source code committed to version control           | `git status` shows clean working tree     |
| Database schema deployed and initialized               | `schema.sql` executed successfully         |
| Backend server starts without errors                   | `uvicorn main:app --reload` returns 200    |
| Frontend compiles without errors                       | `npm start` launches successfully          |
| All test dependencies installed                        | `pip install behave coverage flake8`, `npm install` |
| Test environment matches specification (Section 9)     | Manual verification                        |
| State reset script executed                            | `reset_state.sql` runs without errors      |
| CI pipeline is operational                             | GitHub Actions workflow triggers on push   |

### 12.2 Test Exit Criteria

| Criterion                                              | Threshold                                 |
|--------------------------------------------------------|-------------------------------------------|
| All planned test cases executed                        | 100% test execution rate                  |
| All Critical and Major defects resolved                | 0 open Critical/Major defects             |
| BVA boundary vectors pass (0, 1, 10, 11)              | 4/4 vectors verified                      |
| CFG paths covered (Paths 1-5)                          | 5/5 paths executed                        |
| E2E test suite passes across all 3 domains            | 100% pass rate                            |
| Behave blackbox and whitebox scenarios pass            | 100% pass rate                            |
| Code coverage meets target on SUT                      | >= 90% statement coverage                 |
| Flake8 lint passes with no errors                      | 0 lint errors                             |
| ESLint passes on frontend source                       | 0 lint errors                             |
| CI pipeline passes all jobs                            | All GitHub Actions checks green            |
| Traceability matrix is complete                        | Every requirement linked to >= 1 test     |

---

## 13. Risk Analysis & Mitigation

### 13.1 Risk Register

| Risk ID | Risk Description                                          | Probability | Impact  | Severity | Mitigation Strategy                                                |
|---------|-----------------------------------------------------------|-------------|---------|----------|--------------------------------------------------------------------|
| R-01    | Database unavailable during test execution                | Medium      | High    | High     | Use `setUp/tearDown` for connection management; verify PostgreSQL daemon before tests |
| R-02    | Race conditions in concurrent booking transactions        | Medium      | Critical| Critical | Row-level `FOR UPDATE` locking in `execute_booking()` prevents phantom reads |
| R-03    | BVA boundary bypassed via direct API call (skipping UI)   | Low         | High    | Medium   | Database CHECK constraints enforce boundaries independent of client |
| R-04    | State contamination between test runs                     | Medium      | Medium  | Medium   | `reset_state.sql` purges all data; `tearDown()` performs `conn.rollback()` |
| R-05    | Frontend caching stale event data                         | Low         | Medium  | Low      | Cache-busting query parameter `?t=${timestamp}` on all GET requests |
| R-06    | Plaintext passwords exposed                               | Low         | Critical| High     | bcrypt hashing enforced in signup handler; code review verification |
| R-07    | Test environment differs from CI environment              | Medium      | Medium  | Medium   | Docker or consistent Python/Node.js version pinning via CI config  |
| R-08    | Schema migration breaks existing tests                    | Medium      | High    | High     | Version-controlled DDL; `DROP TABLE IF EXISTS CASCADE` in schema   |
| R-09    | CORS misconfiguration exposes API                         | Low         | High    | Medium   | `allow_origins=["*"]` is acceptable for prototype; restrict in production |
| R-10    | Connection pool exhaustion under load                     | Medium      | High    | Medium   | `finally: conn.close()` in every handler; consider connection pooling for scale |

### 13.2 Risk Response Matrix

| Response Type | Applicable Risks | Action                                                                    |
|---------------|-------------------|---------------------------------------------------------------------------|
| **Avoid**     | R-06              | Enforce bcrypt at application layer; code review policy                   |
| **Mitigate**  | R-01, R-02, R-04, R-07, R-08, R-10 | Implement described mitigation strategies                |
| **Accept**    | R-03, R-05, R-09  | Documented and accepted within prototype scope                            |

---

## 14. Metrics & Reporting

### 14.1 Quality Metrics

| Metric                         | Formula                                                  | Target      |
|--------------------------------|----------------------------------------------------------|-------------|
| Test Case Pass Rate            | `(Passed Tests / Total Tests) * 100`                     | >= 95%      |
| BVA Coverage                   | `(Tested Boundary Vectors / Total Boundary Vectors) * 100` | 100%      |
| CFG Path Coverage              | `(Tested Paths / V(G)) * 100`                           | 100%        |
| Statement Coverage (SUT)       | `(Executed Statements / Total Statements) * 100`         | >= 90%      |
| Branch Coverage (SUT)          | `(Executed Branches / Total Branches) * 100`             | 100%        |
| Defect Density                 | `Defects / KLOC (thousands of lines of code)`            | < 5         |
| Defect Removal Efficiency      | `(Pre-release Defects / Total Defects) * 100`            | >= 90%      |
| CI Build Success Rate          | `(Successful Builds / Total Builds) * 100`               | >= 95%      |

### 14.2 Code Coverage Measurement

Coverage is measured using Python's `coverage` module during CI:

```bash
# Blackbox test coverage
coverage run -m behave tests/blackbox

# Whitebox test coverage (append to existing data)
coverage run -a -m behave tests/whitebox

# Generate report
coverage report -m
```

### 14.3 Reporting Schedule

| Report Type             | Frequency     | Audience                 | Contents                                        |
|-------------------------|---------------|--------------------------|--------------------------------------------------|
| Test Execution Report   | Per test run  | Development Team         | Pass/fail counts, coverage data, defect summary  |
| CI Build Report         | Per commit    | All stakeholders         | Build status, test results, lint results          |
| Defect Summary Report   | Weekly        | SQA Lead, Instructor     | Open/closed defects, severity breakdown           |
| Final SQA Report        | End of project| Course Instructor        | Complete quality assessment, metrics, lessons learned |

---

## 15. Configuration Management

### 15.1 Version Control

| Aspect              | Configuration                                     |
|----------------------|----------------------------------------------------|
| VCS                  | Git (GitHub)                                       |
| Repository           | `keithkahurakamau/event_booking`                   |
| Main Branch          | `main`                                             |
| Branching Strategy   | Feature branches merged via Pull Requests          |
| CI Trigger           | Push to `main` and Pull Requests to `main`         |

### 15.2 Controlled Artifacts

| Artifact                     | Location                              | Owner              |
|------------------------------|---------------------------------------|---------------------|
| Source Code (Backend)        | `backend/`                            | Backend Developer   |
| Source Code (Frontend)       | `frontend/`                           | Frontend Developer  |
| Database Schema              | `backend/schema.sql`                  | Database Engineer   |
| State Reset Script           | `backend/reset_state.sql`             | Database Engineer   |
| E2E Test Suite               | `e2e_tests/`                          | Test Engineer       |
| Blackbox BDD Tests           | `backend/tests/blackbox/`             | Test Engineer       |
| Whitebox BDD Tests           | `backend/tests/whitebox/`             | Test Engineer       |
| BVA Unit Tests               | `backend/tests/blackbox/test_bva_ep.py` | Test Engineer     |
| CFG Path Tests               | `backend/tests/whitebox/test_cfg_paths` | Test Engineer     |
| CI/CD Pipeline               | `.github/workflows/ci.yml`            | CI/CD Engineer      |
| SQA Plan (this document)     | `SQA_PLAN.md`                         | SQA Lead            |
| Traceability Matrix          | `traceability_matrix.md`              | SQA Lead            |

### 15.3 Change Control Process

1. All code changes must be submitted via **Pull Request** to the `main` branch
2. PRs require at least **one code review** approval before merge
3. CI pipeline must pass all checks (tests + lint) before merge
4. Schema changes require corresponding test updates
5. Test case changes must maintain or improve coverage targets

---

## 16. Schedule & Milestones

### 16.1 Project Phases

| Phase                   | Activities                                                  | Deliverables                          |
|-------------------------|-------------------------------------------------------------|---------------------------------------|
| **Phase 1: Planning**   | Requirements gathering, SQA Plan drafting, test strategy design | This SQA Plan document              |
| **Phase 2: Design**     | Schema design, API specification, CFG analysis, BVA vector selection | Schema DDL, API contracts, CFG diagram |
| **Phase 3: Implementation** | Backend API, Frontend UI, database constraints, core transaction logic | Working 3-tier application        |
| **Phase 4: Testing**    | Unit tests, BDD tests, E2E tests, CI pipeline setup         | Test suites, coverage reports         |
| **Phase 5: Verification** | Full regression testing, defect resolution, coverage validation | Final test execution report        |
| **Phase 6: Presentation** | Live demo, test execution, constraint interception proof   | Presentation slides, live defense     |

### 16.2 Test Execution Order

The following execution order ensures proper dependency satisfaction:

1. **Database Setup** - Execute `schema.sql` to initialize constraints
2. **State Reset** - Execute `reset_state.sql` for deterministic starting state
3. **Backend Startup** - Launch `uvicorn main:app --reload` on port 8000
4. **Blackbox BDD Tests** - `coverage run -m behave tests/blackbox`
5. **Whitebox BDD Tests** - `coverage run -a -m behave tests/whitebox`
6. **BVA Unit Tests** - Execute `test_bva_ep.py` for boundary verification
7. **CFG Path Tests** - Execute `test_cfg_paths` for structural coverage
8. **E2E API Tests** - `cd e2e_tests && npm test` for full API verification
9. **Frontend Tests** - `cd frontend && npm test -- --coverage --watchAll=false`
10. **Lint Checks** - Backend: `flake8 .` / Frontend: `npx eslint src/`
11. **Coverage Report** - `coverage report -m`

---

## 17. Tools & Technologies

### 17.1 Development Tools

| Tool                  | Version     | Purpose                                            |
|-----------------------|-------------|-----------------------------------------------------|
| Python                | 3.9+        | Backend application language                        |
| FastAPI               | 0.135.1     | RESTful API framework                               |
| Uvicorn               | 0.42.0      | ASGI server for FastAPI                             |
| Pydantic              | 2.12.5      | Data validation and DTO serialization               |
| psycopg2-binary       | 2.9.11      | PostgreSQL database adapter                         |
| bcrypt                | 5.0.0       | Password hashing library                            |
| React                 | 19.2.4      | Frontend UI library                                 |
| Material UI (MUI)     | 7.3.9       | React component library                             |
| Axios                 | 1.13.6      | HTTP client for API communication                   |
| PostgreSQL            | Latest      | Relational database management system               |

### 17.2 Testing Tools

| Tool                  | Version     | Purpose                                            |
|-----------------------|-------------|-----------------------------------------------------|
| Mocha                 | 10.2.0      | E2E test framework (JavaScript)                     |
| Chai                  | 4.3.7       | Assertion library for Mocha                         |
| Supertest             | 6.3.3       | HTTP assertion library for API testing              |
| Behave                | Latest      | BDD framework for Python (Gherkin feature files)    |
| Python unittest       | Built-in    | Unit testing framework for BVA/EP and CFG tests     |
| Coverage.py           | Latest      | Code coverage measurement for Python                |
| React Testing Library | 16.3.2      | React component testing utilities                   |
| Jest                  | (via react-scripts) | Frontend test runner                         |

### 17.3 Quality & CI Tools

| Tool                  | Version     | Purpose                                            |
|-----------------------|-------------|-----------------------------------------------------|
| Flake8                | Latest      | Python linting and style checking                   |
| ESLint                | Latest      | JavaScript linting and style checking               |
| GitHub Actions        | N/A         | Continuous integration and automated testing        |
| Git                   | Latest      | Version control system                              |

---

## 18. Appendices

### Appendix A: Database Constraints Summary

| Table      | Constraint                                       | Type        | SQA Purpose                              |
|------------|--------------------------------------------------|-------------|------------------------------------------|
| `users`    | `user_id UUID PRIMARY KEY`                       | Primary Key | Unique entity identification              |
| `users`    | `username VARCHAR(100) UNIQUE NOT NULL`           | Unique      | Prevent duplicate registrations           |
| `users`    | `email VARCHAR(255) UNIQUE NOT NULL`              | Unique      | Prevent duplicate email addresses         |
| `users`    | `role CHECK (role IN ('vendor', 'customer'))`    | Check       | Role-based access enforcement             |
| `events`   | `event_id UUID PRIMARY KEY`                      | Primary Key | Unique event identification               |
| `events`   | `vendor_id UUID REFERENCES users(user_id)`       | Foreign Key | Referential integrity (vendor ownership)  |
| `events`   | `total_capacity CHECK (total_capacity > 0)`      | Check       | Prevent zero/negative capacity            |
| `events`   | `available_capacity CHECK (available_capacity >= 0)` | Check   | Prevent overbooking at DB level           |
| `bookings` | `booking_id UUID PRIMARY KEY`                    | Primary Key | Unique booking identification             |
| `bookings` | `event_id UUID REFERENCES events(event_id)`      | Foreign Key | Referential integrity (event linkage)     |
| `bookings` | `customer_id UUID REFERENCES users(user_id)`     | Foreign Key | Referential integrity (customer linkage)  |
| `bookings` | `tickets_requested CHECK (BETWEEN 1 AND 10)`    | Check       | BVA enforcement at persistence layer      |
| `bookings` | `ON DELETE RESTRICT` (events, users)             | Foreign Key | Prevent cascade deletion of active records |

### Appendix B: API Endpoint Catalog

| Method   | Endpoint                              | Status Codes   | Description                            |
|----------|---------------------------------------|----------------|----------------------------------------|
| `GET`    | `/api/events`                         | 200, 500       | Retrieve all events with capacity data |
| `POST`   | `/api/signup`                         | 201, 400, 500  | Register a new user                    |
| `POST`   | `/api/login`                          | 200, 401, 500  | Authenticate user credentials          |
| `GET`    | `/api/users`                          | 200, 500       | List all registered users              |
| `GET`    | `/api/users/{user_id}`                | 200, 404, 500  | Retrieve specific user profile         |
| `GET`    | `/api/bookings`                       | 200, 500       | List all bookings                      |
| `POST`   | `/api/bookings`                       | 201, 400, 500  | Create a new booking (transaction)     |
| `GET`    | `/api/customer/bookings/{customer_id}`| 200, 500       | Retrieve customer booking history      |
| `POST`   | `/api/vendor/events`                  | 201, 500       | Create a new vendor event              |
| `GET`    | `/api/vendor/events/{vendor_id}`      | 200, 500       | Retrieve vendor's events               |
| `PUT`    | `/api/vendor/events/{event_id}`       | 200, 400, 404, 500 | Update event details              |
| `DELETE` | `/api/vendor/events/{event_id}`       | 200, 400, 500  | Delete an event                        |

### Appendix C: Cyclomatic Complexity Reference

**McCabe's Cyclomatic Complexity Formula:**

```
V(G) = E - N + 2P
```

Where:
- `E` = Number of edges in the control flow graph
- `N` = Number of nodes in the control flow graph
- `P` = Number of connected components (1 for a single program)

**Simplified (Predicate Node Method):**

```
V(G) = P + 1
```

Where `P` = number of predicate nodes (decision points)

**For `execute_booking()`:**
- Predicate Nodes: 4 (Entity check, Capacity check, IntegrityError catch, Exception catch)
- `V(G) = 4 + 1 = 5`
- Required independent test paths: **5**

### Appendix D: Test Execution Commands Quick Reference

```bash
# === BACKEND TESTING ===

# Run blackbox BDD tests with coverage
cd backend && coverage run -m behave tests/blackbox

# Run whitebox BDD tests with coverage (append)
cd backend && coverage run -a -m behave tests/whitebox

# Run BVA/EP unit tests
cd backend && python -m pytest tests/blackbox/test_bva_ep.py -v

# Run CFG path tests
cd backend && python -m pytest tests/whitebox/test_cfg_paths -v

# Generate coverage report
cd backend && coverage report -m

# Lint backend code
cd backend && flake8 .


# === FRONTEND TESTING ===

# Run React tests with coverage
cd frontend && npm test -- --coverage --watchAll=false

# Lint frontend code
cd frontend && npx eslint src/


# === E2E TESTING ===

# Install E2E dependencies
cd e2e_tests && npm install

# Run full E2E verification suite
cd e2e_tests && npm test


# === DATABASE MANAGEMENT ===

# Initialize database
psql -U postgres -h localhost -c "CREATE DATABASE event_booking;"
psql -U postgres -h localhost -d event_booking -f backend/schema.sql

# Reset state for testing
psql -U postgres -h localhost -d event_booking -f backend/reset_state.sql


# === APPLICATION STARTUP ===

# Start backend (Terminal 1)
cd backend && uvicorn main:app --reload

# Start frontend (Terminal 2)
cd frontend && npm start
```

---

## Document Approval

| Role           | Name              | Signature | Date       |
|----------------|-------------------|-----------|------------|
| SQA Lead       |                   |           |            |
| Project Manager|                   |           |            |
| Lead Developer |                   |           |            |
| Course Instructor |                |           |            |

---

**End of SQA Plan Document**
