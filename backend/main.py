# ==============================================================================
# FILE: main.py
# PURPOSE: RESTful API Routing Layer
# ==============================================================================
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import psycopg2

# Import your mathematically verified logic
from booking_transaction import execute_booking
from db import get_connection

app = FastAPI(title="SWE3020 Event Booking API")

# Configure CORS to allow the React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected JSON payload structure
class BookingRequest(BaseModel):
    event_id: str
    requested_tickets: int

@app.post("/api/bookings", status_code=201)
def create_booking(payload: BookingRequest):
    """
    Endpoint to process a ticket booking.
    Maps HTTP requests directly to the CFG paths defined in SQA testing.
    """
    conn = None
    try:
        conn = get_connection()
        # Execute the core transaction
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