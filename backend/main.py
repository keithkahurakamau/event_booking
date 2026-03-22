# ==============================================================================
# FILE: main.py
# PURPOSE: RESTful API Routing Layer
# SQA FOCUS: System Integration, State Visualization & Initialization
# ==============================================================================
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import psycopg2

# Import mathematically verified logic
from booking_transaction import execute_booking
from db import get_connection

app = FastAPI(title="SWE3020 Event Booking API")

# Configure CORS to allow the React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In a production environment, restrict to the client URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# DATA TRANSFER OBJECTS (DTOs)
# ==============================================================================
class BookingRequest(BaseModel):
    event_id: str
    requested_tickets: int

class EventCreateRequest(BaseModel):
    title: str
    total_capacity: int


# ==============================================================================
# ENDPOINT 1: TRANSACTION MUTATION (POST) - CUSTOMER ACTION
# ==============================================================================
@app.post("/api/bookings", status_code=201)
def create_booking(payload: BookingRequest):
    """
    Endpoint to process a ticket booking.
    Maps HTTP requests directly to the CFG paths defined in the White Box SQA testing.
    """
    conn = None
    try:
        conn = get_connection()
        # Execute the core mathematically verified transaction
        result = execute_booking(payload.event_id, payload.requested_tickets, conn)
        return {"status": "success", "data": result}
        
    except ValueError as ve:
        # Intercepts Domain Faults (e.g., CFG Path 2, 3, 4) -> Returns HTTP 400 Bad Request
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        # Intercepts System Faults (e.g., CFG Path 5) -> Returns HTTP 500 Internal Server Error
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        if conn:
            conn.close()

# ==============================================================================
# ENDPOINT 2: STATE RETRIEVAL (GET) - SYSTEM VISUALIZATION
# ==============================================================================
@app.get("/api/events", status_code=200)
def get_events():
    """
    Endpoint to retrieve the current event inventory state.
    Provides real-time visibility into the available capacity invariant, 
    satisfying the 'Usability' and 'Correctness' SQA parameters.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            # Query the state matrix, sorting by lowest capacity to highlight constraints
            cursor.execute(
                "SELECT event_id, title, total_capacity, available_capacity FROM events ORDER BY available_capacity ASC"
            )
            events = cursor.fetchall()
            
            # Serialize the tuples into a JSON-compliant list of dictionaries
            event_list = [
                {
                    "event_id": row[0],
                    "title": row[1],
                    "total_capacity": row[2],
                    "available_capacity": row[3]
                } for row in events
            ]
        return {"status": "success", "data": event_list}
        
    except Exception as e:
        # Intercepts database retrieval faults
        raise HTTPException(status_code=500, detail=f"Database retrieval fault: {str(e)}")
    finally:
        if conn:
            conn.close()

# ==============================================================================
# ENDPOINT 3: ENTITY CREATION (POST) - VENDOR ACTION
# ==============================================================================
@app.post("/api/vendor/events", status_code=201)
def create_vendor_event(payload: EventCreateRequest):
    """
    Vendor endpoint to instantiate a new event entity.
    Enforces the logical invariant: Initial Available Capacity == Total Capacity.
    """
    # Application-layer boundary enforcement before database transmission
    if payload.total_capacity < 1:
        raise HTTPException(status_code=400, detail="Total capacity must be >= 1.")

    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            # SQL execution with RETURNING clause to immediately fetch the generated UUID
            cursor.execute(
                """
                INSERT INTO events (title, total_capacity, available_capacity) 
                VALUES (%s, %s, %s) RETURNING event_id
                """,
                (payload.title, payload.total_capacity, payload.total_capacity)
            )
            new_event_id = cursor.fetchone()[0]
            conn.commit()
            
        return {"status": "success", "event_id": new_event_id}
        
    except psycopg2.errors.CheckViolation:
        # Intercepts database-level CHECK constraints (e.g., total_capacity > 0)
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail="Database constraint violation.")
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=f"System Fault: {str(e)}")
    finally:
        if conn: conn.close()