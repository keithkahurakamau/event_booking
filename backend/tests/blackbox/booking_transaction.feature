Feature: Booking Transaction
  Scenario: Successful booking
    Given a valid event and customer
    When the customer books the event
    Then the booking should be successful
