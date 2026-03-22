import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import axios from 'axios';

export default function BookingForm() {
    const [eventId, setEventId] = useState('');
    const [tickets, setTickets] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleBooking = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' }); // Clear previous state

        try {
            // Transmit vector to the Python API
            const response = await axios.post('http://localhost:8000/api/bookings', {
                event_id: eventId,
                requested_tickets: parseInt(tickets, 10)
            });
            
            // Handle CFG Path 1 (Nominal Execution)
            setMessage({ 
                type: 'success', 
                text: `Booking Confirmed! ID: ${response.data.data.booking_id}` 
            });
            
        } catch (error) {
            // Handle Constraint Interceptions (CFG Paths 2, 3, 4)
            if (error.response && error.response.data) {
                setMessage({ type: 'error', text: error.response.data.detail });
            } else {
                setMessage({ type: 'error', text: 'Network Error. API Unreachable.' });
            }
        }
    };

    return (
        <Box component="form" onSubmit={handleBooking} sx={{ maxWidth: 400, margin: 'auto', mt: 5 }}>
            <Typography variant="h5" gutterBottom>Event Booking Portal</Typography>
            
            {message.text && (
                <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>
            )}

            <TextField
                fullWidth label="Event ID (UUID)" variant="outlined" margin="normal"
                value={eventId} onChange={(e) => setEventId(e.target.value)} required
            />
            
            <TextField
                fullWidth label="Requested Tickets (1-10)" type="number" variant="outlined" margin="normal"
                inputProps={{ min: 1, max: 10 }} // Client-side constraint enforcement
                value={tickets} onChange={(e) => setTickets(e.target.value)} required
            />
            
            <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 2 }}>
                Authorize Transaction
            </Button>
        </Box>
    );
}