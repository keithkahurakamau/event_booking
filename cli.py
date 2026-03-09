# Placeholder for CLI User Interface
# cli.py
import sys
from db import get_connection
from booking_transaction import execute_booking

def main():
    print("INITIALIZING EVENT BOOKING SYSTEM CLI...")
    try:
        conn = get_connection()
    except Exception as e:
        print(f"FATAL: Database connection failed. {e}")
        sys.exit(1)

    # Output current system state
    with conn.cursor() as cursor:
        cursor.execute("SELECT event_id, title, available_capacity FROM events")
        events = cursor.fetchall()
        print("\n--- SYSTEM STATE: ACTIVE EVENTS ---")
        for evt in events:
            print(f"ID: {evt[0]} | Title: {evt[1]} | Capacity: {evt[2]}")
        print("-----------------------------------")

    while True:
        try:
            target_event = input("\nInput Target Event ID (or 'exit'): ").strip()
            if target_event.lower() == 'exit':
                break
                
            x_input = input("Input requested ticket vector (x): ").strip()
            x = int(x_input)
            
            # Execute business logic
            result = execute_booking(target_event, x, conn)
            print(f"STATUS: Transaction Authorized. Booking ID: {result['booking_id']}")
            
        except ValueError as ve:
            print(f"STATUS: Transaction Aborted. {ve}")
        except Exception as e:
            print(f"STATUS: System Fault. {e}")

    conn.close()
    print("SYSTEM TERMINATED.")

if __name__ == "__main__":
    main()