// ==============================================================================
// FILE: src/forms/BookingForm.js
// PURPOSE: Customer Transaction Interface with Autocomplete Dropdown
// SQA FOCUS: Usability & Prevention of Entity Faults (Input Validation)
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { 
    TextField, Button, Box, Typography, Snackbar, 
    Alert, CircularProgress, Autocomplete 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

export default function BookingForm({ customerId, onTransactionSuccess }) {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [tickets, setTickets] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [notification, setNotification] = useState({ open: false, type: 'info', text: '' });

    // READ: Fetch all available events to populate the dropdown
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const timestamp = new Date().getTime();
                const res = await axios.get(`http://localhost:8000/api/events?t=${timestamp}`);
                setEvents(res.data.data);
            } catch (err) {
                console.error("Failed to fetch event list for dropdown.");
            } finally {
                setFetching(false);
            }
        };
        fetchEvents();
    }, [onTransactionSuccess]); // Refresh list when any transaction occurs

    const handleCloseNotification = () => setNotification({ ...notification, open: false });

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!selectedEvent) {
            setNotification({ open: true, type: 'error', text: 'Please select an event from the list.' });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/api/bookings', {
                event_id: selectedEvent.event_id,
                customer_id: customerId, 
                requested_tickets: parseInt(tickets, 10)
            });
            
            setNotification({ 
                open: true, 
                type: 'success', 
                text: `[SUCCESS] ${selectedEvent.title} Booked! ID: ${response.data.data.booking_id.substring(0,8)}` 
            });
            
            setSelectedEvent(null);
            setTickets('');
            if (onTransactionSuccess) onTransactionSuccess();
            
        } catch (error) {
            const errorMsg = error.response?.data?.detail || 'API Unreachable.';
            setNotification({ open: true, type: 'error', text: `[TRANSACTION FAULT] ${errorMsg}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleBooking} sx={{ p: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderRadius: 3, bgcolor: '#ffffff' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: '#2c3e50', mb: 3 }}>
                Reserve Tickets
            </Typography>

            {/* SQA UPGRADE: Searchable Dropdown replaces manual UUID entry */}
            <Autocomplete
                options={events}
                getOptionLabel={(option) => `${option.title} (${option.available_capacity} left)`}
                loading={fetching}
                value={selectedEvent}
                onChange={(event, newValue) => setSelectedEvent(newValue)}
                renderInput={(params) => (
                    <TextField 
                        {...params} 
                        label="Select Event" 
                        variant="outlined" 
                        margin="normal" 
                        required 
                        InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                                <React.Fragment>
                                    {fetching ? <CircularProgress color="inherit" size={20} /> : null}
                                    {params.InputProps.endAdornment}
                                </React.Fragment>
                            ),
                        }}
                    />
                )}
                sx={{ mb: 1 }}
            />
            
            <TextField
                fullWidth label="Ticket Count (1-10)" type="number" variant="outlined" margin="normal"
                inputProps={{ min: 1, max: 10 }} 
                value={tickets} onChange={(e) => setTickets(e.target.value)} required
                disabled={loading}
            />
            
            <Button 
                type="submit" fullWidth variant="contained" color="primary" 
                size="large" sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}
                disabled={loading || !selectedEvent}
                endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            >
                {loading ? 'Processing...' : 'Confirm Booking'}
            </Button>

            <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={handleCloseNotification} severity={notification.type} sx={{ width: '100%', fontWeight: 'bold' }}>
                    {notification.text}
                </Alert>
            </Snackbar>
        </Box>
    );
}