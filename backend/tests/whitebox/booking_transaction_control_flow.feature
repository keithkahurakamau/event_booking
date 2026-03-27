Feature: Booking Transaction Control Flow
  Scenario: Booking with invalid state
    Given a booking in an invalid state
    When the booking is processed
    Then an error should be raised
