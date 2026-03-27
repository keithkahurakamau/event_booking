# ==============================================================================
# FILE: booking_transaction.py
# PURPOSE: Transactional State Mutation (System Under Test)
# SQA FOCUS: Control Flow Graph (CFG) Logic, Cyclomatic Complexity V(G) = 5
# ARCHITECTURE: Multi-Tenant Identity Association (customer_id)
# ==============================================================================
import uuid
import psycopg2
from psycopg2.errors import CheckViolation, IntegrityError

def execute_booking(event_id: str, customer_id: str, requested_tickets: int, conn) -> dict:

    try:
        with conn.cursor() as cursor:
            # Validate customer_id is a valid UUID and exists in users table
            try:
                uuid.UUID(customer_id)
            except Exception:
                raise ValueError("Invalid customer_id: not a valid UUID.")
            cursor.execute("SELECT user_id FROM users WHERE user_id = %s", (customer_id,))
            if not cursor.fetchone():
                raise ValueError("Target entity [customer_id] does not exist.")

            # 1. Acquire exclusive lock (FOR UPDATE) to maintain state consistency
            cursor.execute(
                "SELECT available_capacity FROM events WHERE event_id = %s FOR UPDATE",
                (event_id,)
            )


            # Record instantiation with Multi-Tenant Customer Association
            booking_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO bookings (booking_id, event_id, customer_id, tickets_requested, status) 
                   VALUES (%s, %s, %s, %s, %s)""",
                (booking_id, event_id, customer_id, requested_tickets, 'CONFIRMED')
            )
            
            # Absolute Commit
            conn.commit()
            return {"booking_id": booking_id, "status": "CONFIRMED"}

    # PREDICATE NODE 3: Database equivalence partition boundary rejection
    except IntegrityError as e:
        conn.rollback() # Maintain state isolation
        raise ValueError("Invalid partition: Vector falls outside the [1, 10] constraint.")
        
    # PREDICATE NODE 4: Hardware/Network fault handler
    except Exception as e:
        conn.rollback() # Maintain state isolation
        raise e