import unittest
import psycopg2
import sys
import os

# RESOLUTION PROTOCOL: Namespace path modification to locate the System Under Test (SUT).
# This prevents ModuleNotFoundError during automated discovery by explicitly prepending
# the parent directory (event_booking) to the Python path.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from booking_transaction import execute_booking

class TestBookingBoundaryValues(unittest.TestCase):
    """
    Formal Boundary Value Analysis (BVA) and Equivalence Partitioning (EP) testing matrix.
    
    MATHEMATICAL DOMAIN:
    - Valid Equivalence Partition: 1 <= x <= 10
    - Invalid Partition 1 (Lower): x < 1
    - Invalid Partition 2 (Upper): x > 10
    
    BVA VECTOR SELECTION:
    Test vectors target the absolute limits of the valid partition to mitigate off-by-one errors.
    Target Vectors: {0, 1, 10, 11}.
    """

    def setUp(self):
        # STATE INITIALIZATION: Synchronized parameters for isolated test execution.
        # The 'event_booking' namespace is explicitly targeted to prevent cross-contamination
        # of state data with other projects or production schemas.
        self.conn = psycopg2.connect(
            dbname="event_booking", 
            user="postgres", 
            password="limo91we",
            host="localhost",
            port="5432"
        )
        
        # VECTOR ACQUISITION: Dynamically acquire the UUID of the initial state vector.
        # This guarantees the test suite operates on an existing entity, satisfying 
        # Predicate Node 1 (Entity validation) in the SUT Control Flow Graph.
        with self.conn.cursor() as cursor:
            cursor.execute("SELECT event_id FROM events LIMIT 1;")
            result = cursor.fetchone()
            if not result:
                self.fail("State violation: Database is empty. Execute schema.sql first.")
            self.mock_event_id = result[0]

    def tearDown(self):
        # STATE ISOLATION: Enforce absolute rollback post-execution.
        # This guarantees transactional atomicity. No test vector permanently mutates
        # the database state, ensuring sequential tests execute in an identical, sterile environment.
        self.conn.rollback() 
        self.conn.close()

    def test_lower_invalid_boundary(self):
        """
        BVA VECTOR: x = 0.
        EXPECTED STATE: ValueError interception.
        JUSTIFICATION: Proves the system mathematically prevents zero-value transactions,
        which would otherwise consume computational resources and primary keys without 
        altering inventory states. The database CHECK constraint throws an IntegrityError,
        which the SUT translates to a ValueError.
        """
        with self.assertRaises(ValueError):
            execute_booking(self.mock_event_id, 0, self.conn)

    def test_lower_valid_boundary(self):
        """
        BVA VECTOR: x = 1.
        EXPECTED STATE: CONFIRMED state transition.
        JUSTIFICATION: Verifies the minimal state transition required for a standard atomic 
        transaction within the valid equivalence partition.
        """
        result = execute_booking(self.mock_event_id, 1, self.conn)
        self.assertEqual(result['status'], 'CONFIRMED')

    def test_upper_valid_boundary(self):
        """
        BVA VECTOR: x = 10.
        EXPECTED STATE: CONFIRMED state transition.
        JUSTIFICATION: Validates the system's capacity to process the maximum authorized 
        payload within the valid partition without prematurely triggering capacity constraint locks.
        """
        result = execute_booking(self.mock_event_id, 10, self.conn)
        self.assertEqual(result['status'], 'CONFIRMED')

    def test_upper_invalid_boundary(self):
        """
        BVA VECTOR: x = 11.
        EXPECTED STATE: ValueError interception.
        JUSTIFICATION: Proves the schema physically mitigates the catastrophic risk of venue 
        overbooking. The transaction exceeds the upper bound (10), triggering a database rejection 
        that is successfully caught and handled by the backend logic.
        """
        with self.assertRaises(ValueError):
            execute_booking(self.mock_event_id, 11, self.conn)

if __name__ == '__main__':
    unittest.main()