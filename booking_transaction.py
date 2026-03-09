# Placeholder for Core Business Logic & System Under Test (SUT)
# booking_transaction.py
import uuid
import psycopg2
from psycopg2.errors import CheckViolation, IntegrityError

def execute_booking(event_id: str, requested_tickets: int, conn) -> dict:
    """
    Executes a booking transaction with row-level locking.
    Time Complexity: O(1) database operation.
    """
    try:
        with conn.cursor() as cursor:
            # 1. Acquire exclusive row lock to prevent concurrency anomalies
            cursor.execute(
                "SELECT available_capacity FROM events WHERE event_id = %s FOR UPDATE",
                (event_id,)
            )
            result = cursor.fetchone()
            
            if not result:
                raise ValueError("Target entity [event_id] does not exist.")
                
            current_capacity = result[0]
            
            # 2. Logic node: Verify inventory constraint
            if requested_tickets > current_capacity:
                raise ValueError(f"Constraint violation: Requested vector {requested_tickets} exceeds limit {current_capacity}.")

            # 3. State mutation: Decrement inventory
            cursor.execute(
                "UPDATE events SET available_capacity = available_capacity - %s WHERE event_id = %s",
                (requested_tickets, event_id)
            )

            # 4. State record: Instantiate booking record
            booking_id = str(uuid.uuid4())
            cursor.execute(
                """INSERT INTO bookings (booking_id, event_id, tickets_requested, status) 
                   VALUES (%s, %s, %s, %s)""",
                (booking_id, event_id, requested_tickets, 'CONFIRMED')
            )
            
            # 5. Commit state transition
            conn.commit()
            return {"booking_id": booking_id, "status": "CONFIRMED"}

    except IntegrityError as e:
        # Triggered by PostgreSQL CHECK constraint (x < 1 or x > 10)
        conn.rollback()
        raise ValueError("Invalid partition: Vector falls outside the [1, 10] constraint.")
    except Exception as e:
        # Fallback absolute rollback
        conn.rollback()
        raise e