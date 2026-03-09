import unittest
import psycopg2
import sys
import os

# Resolve namespace path to locate the System Under Test (SUT)
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from booking_transaction import execute_booking

class TestBookingBoundaryValues(unittest.TestCase):
    """
    Formal Boundary Value Analysis (BVA) testing matrix.
    Valid Equivalence Partition: 1 <= x <= 10
    """

    def setUp(self):
        # Synchronized parameters for isolated test execution
        self.conn = psycopg2.connect(
            dbname="event_booking", 
            user="postgres", 
            password="",
            host="localhost",
            port="5432"
        )
        
        # Dynamically acquire the UUID of the initial state vector
        with self.conn.cursor() as cursor:
            cursor.execute("SELECT event_id FROM events LIMIT 1;")
            result = cursor.fetchone()
            if not result:
                self.fail("State violation: Database is empty. Execute schema.sql first.")
            self.mock_event_id = result[0]

    def tearDown(self):
        # Enforce state isolation via absolute rollback post-execution
        self.conn.rollback() 
        self.conn.close()

    def test_lower_invalid_boundary(self):
        """Test vector x = 0. Expected state: ValueError interception."""
        with self.assertRaises(ValueError):
            execute_booking(self.mock_event_id, 0, self.conn)

    def test_lower_valid_boundary(self):
        """Test vector x = 1. Expected state: CONFIRMED state transition."""
        result = execute_booking(self.mock_event_id, 1, self.conn)
        self.assertEqual(result['status'], 'CONFIRMED')

    def test_upper_valid_boundary(self):
        """Test vector x = 10. Expected state: CONFIRMED state transition."""
        result = execute_booking(self.mock_event_id, 10, self.conn)
        self.assertEqual(result['status'], 'CONFIRMED')

    def test_upper_invalid_boundary(self):
        """Test vector x = 11. Expected state: ValueError interception."""
        with self.assertRaises(ValueError):
            execute_booking(self.mock_event_id, 11, self.conn)

if __name__ == '__main__':
    unittest.main()