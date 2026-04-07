# ==============================================================================
# FILE: booking_transaction.py
# PURPOSE: Transactional State Mutation (System Under Test)
# SQA FOCUS: Control Flow Graph (CFG) Logic, Cyclomatic Complexity V(G) = 5
# ==============================================================================
import uuid
import psycopg2
from psycopg2.errors import IntegrityError

def execute_booking(event_id: str, customer_id: str, requested_tickets: int, conn) -> dict:
    try:
        with conn.cursor() as cursor:
            # PREDICATE NODE 1: Entity Integrity Validation
            try:
                uuid.UUID(customer_id)
                uuid.UUID(event_id)
            except Exception:
                raise ValueError("Entity Fault: Invalid UUID format.")
            
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (customer_id,))
            if not cursor.fetchone():
                raise ValueError("Entity Fault: Target customer does not exist.")

            # 1. Acquire exclusive lock (FOR UPDATE)
            cursor.execute(
                "SELECT available_capacity FROM events WHERE event_id = %s FOR UPDATE",
                (event_id,)
            )
            
            event_record = cursor.fetchone()
            if not event_record:
                raise ValueError("Event not found.") # Intercepts phantom events
                
            available_capacity = event_record[0]

            # PREDICATE NODE 2: Capacity Exhaustion Validation
            if available_capacity < requested_tickets:
                raise ValueError(f"Capacity Fault: Requested {requested_tickets}, but only {available_capacity} available.")

            # SQA FIX: Mutate State Machine (Decrement Capacity)
            cursor.execute(
                "UPDATE events SET available_capacity = available_capacity - %s WHERE event_id = %s",
                (requested_tickets, event_id)
            )

            # Record instantiation
            booking_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO bookings (booking_id, event_id, customer_id, tickets_requested, status) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (booking_id, event_id, customer_id, requested_tickets, 'CONFIRMED')
            )
            
            conn.commit()
            return {"booking_id": booking_id, "status": "CONFIRMED"}

    # PREDICATE NODE 3: Database EP/BVA constraint rejection
    except IntegrityError as e:
        conn.rollback()
        raise ValueError("Constraint Fault: Vector falls outside the [1, 10] BVA partition.")
        
    # PREDICATE NODE 4: Hardware/Network fault handler
    except Exception as e:
        conn.rollback()
        if isinstance(e, ValueError):
            raise e
        raise Exception(f"System Fault: {str(e)}")