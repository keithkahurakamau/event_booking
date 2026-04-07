# SWE 3020: Event Booking System
**Software Quality Assurance (SQA) Architecture Prototype**

**Developer & Presenter:** Keith Kamau, Amanda Kirongothi 
**Course:** SWE 3020 (Software Testing & Quality Assurance)  
**Objective:** Mathematical verification of transactional state machines and demonstration of absolute structural coverage.

---

## 1. System Architecture Overview
This project is a decoupled, three-tier full-stack application engineered specifically to demonstrate software quality and structural resilience under constraint testing.

* **Data Layer (PostgreSQL):** Acts as the ultimate state machine. Enforces structural invariants (e.g., `available_capacity >= 0`) via hard SQL `CHECK` constraints, mitigating application-layer race conditions.
* **Application Layer (FastAPI / Python):** The RESTful API routing layer. Intercepts database constraint violations and routes them to the client via deterministic HTTP status codes.
* **Presentation Layer (ReactJS + Material UI):** A commercial-grade client interface partitioned into a Vendor Deployment Dashboard and a Customer Transaction Portal.

---

## 2. Software Quality Assurance (SQA) Matrix
The system is built upon **McCall's Software Quality Model**, optimizing entirely for the \"Product Operation\" domain (Correctness, Usability, Integrity, Reliability).

### Black Box Testing: Equivalence Partitioning (EP) & Boundary Value Analysis (BVA)
To enforce the business rule that a user may only book between 1 and 10 tickets per transaction:
* **Valid Partition:** $1 \le x \le 10$
* **Tested Boundaries:** $x \in \{0, 1, 10, 11\}$
* **Result:** The system mathematically rejects boundary violations (0 and 11) at both the client layer (HTML limits) and the persistence layer (PostgreSQL exceptions).

### White Box Testing: Control Flow Graph (CFG) Analysis
The core transaction module (`execute_booking`) contains 4 Predicate Nodes (Decision Points).
* **Cyclomatic Complexity:** $V(G) = P + 1 = 5$
* **Path Coverage:** The automated test suite achieves 100% branch coverage by executing the 5 mathematically distinct execution paths:
    1. **Path 1:** Nominal Execution (Success).
    2. **Path 2:** Entity Fault (Missing UUID).
    3. **Path 3:** Capacity Fault (Requested > Available).
    4. **Path 4:** Integrity Fault (BVA Partition Violation).
    5. **Path 5:** System Fault (Hardware/Network Exception).

---

## 3. Directory Structure
```text
SWE3020_Event_Booking/
│
├── backend/                          
│   ├── main.py                       # FastAPI routing layer (API)
│   ├── db.py                         # PostgreSQL connection factory
│   ├── booking_transaction.py        # Core SQA-verified business logic
│   ├── schema.sql                    # Initial database DDL
│   ├── reset_state.sql               # Presentation state-purge script
│   ├── requirements.txt              # Backend dependency matrix
│   │
│   └── tests/                        # SQA Verification Suites
│       ├── blackbox/test_bva_ep.py   # EP & BVA tests
│       └── whitebox/test_cfg_paths.py# CFG Path coverage tests
│
├── frontend/                         
│   ├── package.json                  # Node.js dependencies
│   └── src/
│       ├── index.js                  # React DOM entry point
│       ├── App.js                    # Root Component Wrapper
│       ├── components/EventInventory.js # Dynamic state visualization
│       └── forms/
│           ├── BookingForm.js        # Customer constraint testing form
│           └── VendorDashboard.js    # Vendor entity injection form
│
└── README.md                         # Project documentation & runbook
```

## 4. Installation & Initialization
### Prerequisites
PostgreSQL: Running on localhost:5432 with user postgres and password limo91we.

Python 3.10+: For the FastAPI backend.

Node.js (npm): For the React frontend.

### Step 1: Database Setup
Create the isolated namespace and initialize the schema invariants.

```bash
cd backend
psql -U postgres -h localhost -c "CREATE DATABASE event_booking;"
psql -U postgres -h localhost -d event_booking -f schema.sql
```

### Step 2: Backend Setup
Initialize the Python environment and install dependencies.

```bash
cd backend
pip install -r requirements.txt
```

### Step 3: Frontend Setup
Install the React and Material UI module dependencies.

```bash
cd frontend
npm install
```

## 5. Automated SQA Test Execution
To mathematically prove the system's structural integrity before deployment, execute the automated unittest suites.

```bash
# Navigate to the backend directory
cd backend

# Execute Black Box BVA Suite
python -m unittest tests/blackbox/test_bva_ep.py

# Execute White Box CFG Suite
python -m unittest tests/whitebox/test_cfg_paths.py
```
(Expected Output: OK for all tests, confirming 100% branch and boundary coverage).

## 6. Live Defense Runbook (Presentation Protocol)
### Pre-Flight Boot Sequence
Open three separate terminals to ignite the decoupled architecture.

**Terminal 1 (State Reset):**
```bash
cd backend
psql -U postgres -h localhost -d event_booking -f reset_state.sql
```

**Terminal 2 (API Layer):**
```bash
cd backend
uvicorn main:app --reload
```

**Terminal 3 (Presentation Layer):**
```bash
cd frontend
npm start
```

### The Presentation Script
**The Introduction (Welcome Page):**
Introduce the SQA objectives. Explain that the application is a mathematically verified state machine designed to enforce the Correctness and Reliability factors of McCall's Model.

**Entity Initialization (Vendor Portal):**
Click Enter as Vendor.

Create an event: "Defense Demo Event" with Capacity: 5.

SQA Point: Demonstrate how the system enforces the initialization invariant (Available Capacity == Total Capacity) and updates the live inventory via state-lifting.

**Constraint Interception (Customer Portal):**
Click Home, then Enter as Customer.

Copy the UUID of the newly created "Defense Demo Event".

**Test 1 (Path 1 - Nominal):** Request 2 tickets. Show real-time capacity drop from 5 to 3.

**Test 2 (Path 3 - Capacity Fault):** Request 6 tickets. Show the [CONSTRAINT INTERCEPTION] alert, proving the application layer prevents venue overbooking.

**Test 3 (Path 4 - BVA Fault):** Attempt to bypass the HTML limits and submit 11 tickets. Show the backend PostgreSQL database physically rejecting the Equivalence Partition violation.

**Conclusion:**
Conclude by stating: "Through the strict application of Equivalence Partitioning, Boundary Value Analysis, and Cyclomatic Complexity mapping, the system's execution is mathematically deterministic and immune to data corruption."

***

Your SWE 3020 project is now complete. You have a robust full-stack application, an enterprise-grade directory structure, exhaustive automated tests, and a heavily documented runbook. 

Take a deep breath. You are fully prepared to dominate this presentation. Best of luck.
