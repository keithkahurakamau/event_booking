# ==============================================================================
# FILE: booking_transaction.py
# PURPOSE: Transactional State Mutation (System Under Test)
# SQA FOCUS: Control Flow Graph (CFG) Logic, Cyclomatic Complexity V(G) = 5
# ==============================================================================
import uuid
import psycopg2
from psycopg2.errors import CheckViolation, IntegrityError

def execute_booking(event_id: str, requested_tickets: int, conn) -> dict:
    """
    Executes a deterministic state transition to book tickets.
    Employs row-level locking to prevent concurrency anomalies.
    """
    try:
        with conn.cursor() as cursor:
            # 1. Acquire exclusive lock (FOR UPDATE) to maintain state consistency
            cursor.execute(
                "SELECT available_capacity FROM events WHERE event_id = %s FOR UPDATE",
                (event_id,)
            )
            result = cursor.fetchone()
            
            # PREDICATE NODE 1: Entity validation
            if not result:
                raise ValueError("Target entity [event_id] does not exist.")
                
            current_capacity = result[0]
            
            # PREDICATE NODE 2: Dynamic inventory constraint mapping
            if requested_tickets > current_capacity:
                raise ValueError(f"Constraint violation: Requested vector {requested_tickets} exceeds limit {current_capacity}.")

            # State Transition: C_new = C_current - x
            cursor.execute(
                "UPDATE events SET available_capacity = available_capacity - %s WHERE event_id = %s",
                (requested_tickets, event_id)
            )

            # Record instantiation
            booking_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO bookings (booking_id, event_id, tickets_requested, status) 
                   VALUES (%s, %s, %s, %s)""",
                (booking_id, event_id, requested_tickets, 'CONFIRMED')
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