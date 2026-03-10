# ==============================================================================
# FILE: cli.py
# PURPOSE: User Interface & Input Vector Generation
# SQA FOCUS: Usability and State Visibility
# ==============================================================================

import sys
from db import get_connection
from booking_transaction import execute_booking

def display_system_state(conn):
    """
    Renders the current database state. 
    Demonstrates the 'Correctness' quality factor by reflecting real-time
    inventory tracking after state mutations.
    """
    with conn.cursor() as cursor:
        cursor.execute("SELECT event_id, title, available_capacity FROM events ORDER BY available_capacity DESC")
        events = cursor.fetchall()
        
        print("\n" + "="*70)
        print(f"{'SYSTEM STATE: ACTIVE EVENT INVENTORY':^70}")
        print("="*70)
        print(f"{'EVENT ID (UUID)':<40} | {'CAPACITY':<8} | {'TITLE'}")
        print("-" * 70)
        for evt in events:
            print(f"{str(evt[0]):<40} | {evt[2]:<8} | {evt[1]}")
        print("="*70)

def main():
    print("INITIALIZING EVENT BOOKING SYSTEM CLI...")
    
    try:
        # Establish connection using the synchronized 'event_booking' namespace
        conn = get_connection()
    except Exception as e:
        print(f"\n[FATAL FAULT] Database connection failed. Verify PostgreSQL daemon. Error: {e}")
        sys.exit(1)

    while True:
        # Render the current state matrix before each transaction
        display_system_state(conn)
        
        try:
            print("\n--- TRANSACTION INITIATION ---")
            target_event = input("Input Target Event ID (or type 'exit' to terminate): ").strip()
            
            if target_event.lower() == 'exit':
                break
                
            x_input = input("Input requested ticket vector (x): ").strip()
            
            # Input sanitization
            if not x_input.isdigit() and not (x_input.startswith('-') and x_input[1:].isdigit()):
                print("\n[INPUT FAULT] Ticket vector must be an integer.")
                continue
                
            x = int(x_input)
            
            # Execute Business Logic (System Under Test)
            print("\nProcessing transaction constraints...")
            result = execute_booking(target_event, x, conn)
            
            # Nominal Execution Path (CFG Path 1)
            print(f"[SUCCESS] Transaction Authorized. State Mutated.")
            print(f"          Assigned Booking ID: {result['booking_id']}")
            
        except ValueError as ve:
            # Intercepts Predicate Node failures (Entity missing, Capacity exceeded, or Partition violated)
            print(f"\n[CONSTRAINT INTERCEPTION] Transaction Aborted. State Rolled Back.")
            print(f"                          Reason: {ve}")
        except Exception as e:
            # Intercepts generic system faults
            print(f"\n[SYSTEM FAULT] Transaction Aborted. {e}")

        input("\nPress ENTER to continue to the next transaction cycle...")

    conn.close()
    print("\nSYSTEM TERMINATED. State connections closed.")

if __name__ == "__main__":
    main()