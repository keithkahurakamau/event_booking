// ==============================================================================
// FILE: src/forms/BookingForm.js
// PURPOSE: Customer Transaction Interface
// SQA FOCUS: Multi-Tenant Identity Injection & Constraint Interception
// ==============================================================================
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Snackbar, Alert, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

// ARCHITECTURE UPDATE: Inject customerId from the parent component (App.js)
export default function BookingForm({ customerId, onTransactionSuccess }) {
    const [eventId, setEventId] = useState('');
    const [tickets, setTickets] = useState('');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ open: false, type: 'info', text: '' });

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    const handleBooking = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TRANSMISSION PROTOCOL: Include customer_id in the DTO payload
            const response = await axios.post('http://localhost:8000/api/bookings', {
                event_id: eventId,
                customer_id: customerId, 
                requested_tickets: parseInt(tickets, 10)
            });
            
            setNotification({ 
                open: true, 
                type: 'success', 
                text: `[SUCCESS] Transaction ${response.data.data.booking_id} committed.` 
            });
            
            setEventId('');
            setTickets('');
            
            if (onTransactionSuccess) onTransactionSuccess();
            
        } catch (error) {
            if (error.response && error.response.data) {
                setNotification({ 
                    open: true, 
                    type: 'error', 
                    text: `[CONSTRAINT FAULT] ${error.response.data.detail}` 
                });
            } else {
                setNotification({ 
                    open: true, 
                    type: 'error', 
                    text: '[SYSTEM FAULT] API Unreachable.' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleBooking} sx={{ p: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 3, bgcolor: '#ffffff' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: '#2c3e50', mb: 3 }}>
                Transaction Vector
            </Typography>

            <TextField
                fullWidth label="Target Entity (UUID)" variant="outlined" margin="normal"
                value={eventId} onChange={(e) => setEventId(e.target.value)} required
                disabled={loading}
            />
            
            <TextField
                fullWidth label="Ticket Vector (1-10)" type="number" variant="outlined" margin="normal"
                inputProps={{ min: 1, max: 10 }} 
                value={tickets} onChange={(e) => setTickets(e.target.value)} required
                disabled={loading}
            />
            
            <Button 
                type="submit" fullWidth variant="contained" color="primary" 
                size="large" sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                disabled={loading}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
                {loading ? 'Processing State...' : 'Commit Transaction'}
            </Button>

            {/* Professional Transient Feedback */}
            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%', fontWeight: 'bold' }}>
                    {notification.text}
                </Alert>
            </Snackbar>
        </Box>
    );
}