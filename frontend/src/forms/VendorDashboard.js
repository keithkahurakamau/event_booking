// ==============================================================================
// FILE: src/forms/VendorDashboard.js
// PURPOSE: Vendor Interface for Entity Creation
// ==============================================================================
import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Alert } from '@mui/material';
import AddBusinessIcon from '@mui/icons-material/AddBusiness';
import axios from 'axios';

export default function VendorDashboard({ onEventCreated }) {
    const [title, setTitle] = useState('');
    const [capacity, setCapacity] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.post('http://localhost:8000/api/vendor/events', {
                title: title,
                total_capacity: parseInt(capacity, 10)
            });
            
            setMessage({ type: 'success', text: `Event Deployed. UUID: ${response.data.event_id}` });
            setTitle('');
            setCapacity('');
            
            // Trigger State Lifting to refresh the Customer Inventory view
            if (onEventCreated) onEventCreated();
            
        } catch (error) {
            setMessage({ type: 'error', text: 'Entity deployment failed. Check constraints.' });
        }
    };

    return (
        <Box component="form" onSubmit={handleCreateEvent} sx={{ p: 4, mb: 4, boxShadow: 2, borderRadius: 2, bgcolor: '#fafafa', border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <AddBusinessIcon sx={{ mr: 1, color: '#27ae60' }} />
                Vendor Control Panel
            </Typography>
            
            {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            <TextField
                fullWidth label="Event Title" variant="outlined" margin="dense"
                value={title} onChange={(e) => setTitle(e.target.value)} required
            />
            
            <TextField
                fullWidth label="Total Capacity" type="number" variant="outlined" margin="dense"
                inputProps={{ min: 1 }} 
                value={capacity} onChange={(e) => setCapacity(e.target.value)} required
            />
            
            <Button type="submit" fullWidth variant="contained" color="success" sx={{ mt: 2, fontWeight: 'bold' }}>
                Deploy Event to System
            </Button>
        </Box>
    );
}