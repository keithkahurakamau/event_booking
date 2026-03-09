# Placeholder for PostgreSQL Connection Factory
# db.py
import psycopg2

def get_connection():
    """Establishes the physical connection to the PostgreSQL database."""
    return psycopg2.connect(
        dbname="event_booking",      # Replace with your target database
        user="postgres",        # Replace with your role
        password="limo91we",    # Replace with your credentials
        host="localhost",
        port="5432"
    )