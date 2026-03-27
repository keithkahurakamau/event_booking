from behave import given, when, then
from booking_transaction import execute_booking
import psycopg2

@given('a booking in an invalid state')
def step_given_invalid_state(context):
    # Use invalid event_id or customer_id to simulate invalid state
    context.event_id = 'invalid-event-id'  # Should not exist in DB
    context.customer_id = 'invalid-customer-id'  # Should not exist in DB
    context.requested_tickets = 1

@when('the booking is processed')
def step_when_booking_processed(context):
    conn = psycopg2.connect(dbname='event_booking', user='postgres', host='localhost')
    try:
        execute_booking(context.event_id, context.customer_id, context.requested_tickets, conn)
        context.error = None
    except Exception as e:
        context.error = e
    finally:
        conn.close()

@then('an error should be raised')
def step_then_error_raised(context):
    assert context.error is not None, "Expected an error but none was raised."
    