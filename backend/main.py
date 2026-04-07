# ==============================================================================
# FILE: main.py
# PURPOSE: Multi-Tenant RESTful API Routing Layer (CRUD Implementation)
# SQA FOCUS: Referential Integrity, Constraint Enforcement & State Visibility
# ==============================================================================

import bcrypt
from fastapi import FastAPI, HTTPException
from fastapi import Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid

# Import mathematically verified logic
from booking_transaction import execute_booking
from db import get_connection

app = FastAPI(title="SWE3020 Multi-Tenant Event API")

# Configure CORS for local development environment
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# --- DATA TRANSFER OBJECTS (DTOs) ---

class UserCreateRequest(BaseModel):
    username: str
    email: str
    password: str
    role: str  # 'vendor' or 'customer'

class UserLoginRequest(BaseModel):
    username: str
    password: str

class BookingRequest(BaseModel):
    event_id: str
    customer_id: str
    requested_tickets: int

class EventCreateRequest(BaseModel):
    vendor_id: str
    title: str
    total_capacity: int

class EventUpdateRequest(BaseModel):
    title: str
    total_capacity: int

# ==============================================================================
# GLOBAL STATE RETRIEVAL (GET) - FIXED: Resolves 404 in EventInventory.js
# ==============================================================================
@app.get("/api/events", status_code=200)
def get_all_events():
    """
    Global endpoint to retrieve the current state of all events.
    Used by the EventInventory component to show live capacity to all users.
    """
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                "SELECT event_id, title, total_capacity, available_capacity FROM events ORDER BY title ASC"
            )
            events = cursor.fetchall()
        return {"status": "success", "data": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database retrieval fault: {str(e)}")
    finally:
        if conn: conn.close()

# ==============================================================================
# CUSTOMER DOMAIN
# ==============================================================================

@app.post("/api/signup", status_code=201)
def signup(payload: UserCreateRequest):
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            password_hash = bcrypt.hashpw(payload.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            user_id = str(uuid.uuid4())
            cursor.execute(
                "INSERT INTO users (user_id, username, email, password_hash, role) VALUES (%s, %s, %s, %s, %s) RETURNING user_id",
                (user_id, payload.username, payload.email, password_hash, payload.role)
            )
            conn.commit()
        return {"status": "success", "user_id": user_id}
    except psycopg2.errors.UniqueViolation:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists.")
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()
from fastapi import Form

@app.post("/api/login")
def login(
    username: str = Form(...),
    password: str = Form(...)
):
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT user_id, password_hash, role FROM users WHERE username = %s", (username,))
            user = cursor.fetchone()
            if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
                raise HTTPException(status_code=401, detail="Invalid username or password.")
        return {"status": "success", "user_id": user['user_id'], "role": user['role']}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.get("/api/users", status_code=200)
def list_users():
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT user_id, username, email, role FROM users ORDER BY username")
            users = cursor.fetchall()
        return {"status": "success", "data": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.get("/api/users/{user_id}", status_code=200)
def get_user(user_id: str):
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT user_id, username, email, role FROM users WHERE user_id = %s", (user_id,))
            user = cursor.fetchone()
            if not user:
                raise HTTPException(status_code=404, detail="User not found.")
        return {"status": "success", "data": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.get("/api/bookings", status_code=200)
def list_bookings():
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM bookings ORDER BY created_at DESC")
            bookings = cursor.fetchall()
        return {"status": "success", "data": bookings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()
        
 
@app.post("/api/bookings", status_code=201)
def create_booking(payload: BookingRequest):
    """Executes a transaction, associating it with a customer_id."""
    conn = None
    try:
        conn = get_connection()
        # Integration with booking_transaction.py
        result = execute_booking(payload.event_id, payload.customer_id, payload.requested_tickets, conn)
        return {"status": "success", "data": result}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        if conn: conn.close()

@app.get("/api/customer/bookings/{customer_id}", status_code=200)
def get_customer_history(customer_id: str):
    """READ: Retrieves the transaction history for a specific customer."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("""
                SELECT b.booking_id, b.tickets_requested, b.created_at, e.title 
                FROM bookings b
                JOIN events e ON b.event_id = e.event_id
                WHERE b.customer_id = %s ORDER BY b.created_at DESC
            """, (customer_id,))
            history = cursor.fetchall()
        return {"status": "success", "data": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

# ==============================================================================
# VENDOR DOMAIN (CRUD)
# ==============================================================================
@app.post("/api/vendor/events", status_code=201)
def create_vendor_event(payload: EventCreateRequest):
    """CREATE: Instantiates a new event for a specific vendor."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO events (vendor_id, title, total_capacity, available_capacity) VALUES (%s, %s, %s, %s) RETURNING event_id",
                (payload.vendor_id, payload.title, payload.total_capacity, payload.total_capacity)
            )
            event_id = cursor.fetchone()[0]
            conn.commit()
        return {"status": "success", "event_id": event_id}
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.get("/api/vendor/events/{vendor_id}", status_code=200)
def get_vendor_events(vendor_id: str):
    """READ: Retrieves all events created by a specific vendor."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute("SELECT * FROM events WHERE vendor_id = %s ORDER BY title", (vendor_id,))
            events = cursor.fetchall()
        return {"status": "success", "data": events}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.put("/api/vendor/events/{event_id}", status_code=200)
def update_vendor_event(event_id: str, payload: EventUpdateRequest):
    """UPDATE: Modifies an event. Enforces capacity invariants."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # SQA Check: Row-level lock to calculate safe capacity threshold
            cursor.execute("SELECT total_capacity, available_capacity FROM events WHERE event_id = %s FOR UPDATE", (event_id,))
            event = cursor.fetchone()
            if not event:
                raise HTTPException(status_code=404, detail="Entity not found.")
            
            tickets_sold = event['total_capacity'] - event['available_capacity']
            
            # BUSINESS RULE: New capacity cannot be less than already committed bookings
            if payload.total_capacity < tickets_sold:
                raise ValueError(f"Constraint Fault: Cannot reduce total capacity below tickets already sold ({tickets_sold}).")
            
            new_available = payload.total_capacity - tickets_sold
            cursor.execute(
                "UPDATE events SET title = %s, total_capacity = %s, available_capacity = %s WHERE event_id = %s",
                (payload.title, payload.total_capacity, new_available, event_id)
            )
            conn.commit()
        return {"status": "success"}
    except ValueError as ve:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()

@app.delete("/api/vendor/events/{event_id}", status_code=200)
def delete_vendor_event(event_id: str):
    """DELETE: Removes an event. Fails if active bookings exist (Referential Integrity)."""
    conn = None
    try:
        conn = get_connection()
        with conn.cursor() as cursor:
            cursor.execute("DELETE FROM events WHERE event_id = %s", (event_id,))
            conn.commit()
        return {"status": "success"}
    except psycopg2.errors.ForeignKeyViolation:
        if conn: conn.rollback()
        raise HTTPException(status_code=400, detail="Integrity Fault: Cannot delete an event with active bookings.")
    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn: conn.close()