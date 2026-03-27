from behave import given, when, then
from booking_transaction import execute_booking
import psycopg2

@given('a valid event and customer')
def step_given_valid_event_and_customer(context):
    # These should match test data in your DB or be mocked
    context.event_id = 'e702f066-023d-4f5a-986f-9efeaa059222'
    context.customer_id = '2171f87d-4984-46f4-bc4c-eee0f9ebf3f4'
    context.requested_tickets = 1

@when('the customer books the event')
def step_when_customer_books_event(context):
    conn = psycopg2.connect(dbname='event_booking', user='postgres', host='localhost')
    try:
        context.result = execute_booking(context.event_id, context.customer_id, context.requested_tickets, conn)
    except Exception as e:
        context.result = {'status': 'error', 'error': str(e)}
    finally:
        conn.close()

@then('the booking should be successful')
def step_then_booking_successful(context):
    assert context.result.get('status') == 'CONFIRMED', f"Booking failed: {context.result}"