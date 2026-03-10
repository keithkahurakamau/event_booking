# ==============================================================================
# FILE: db.py
# PURPOSE: PostgreSQL Database Connection Factory
# SQA FOCUS: Environment Isolation
# ==============================================================================
import psycopg2

def get_connection():
    """
    Establishes the physical TCP/IP connection to the isolated test environment.
    Credentials point exclusively to the 'event_booking' namespace to prevent 
    cross-contamination of test states.
    """
    return psycopg2.connect(
        dbname="event_booking", 
        user="postgres", 
        password="",
        host="localhost",
        port="5432"
    )