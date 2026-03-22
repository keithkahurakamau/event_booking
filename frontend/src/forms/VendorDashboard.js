// ==============================================================================
// FILE: src/forms/VendorDashboard.js
// PURPOSE: Vendor CRUD Interface & Constraint Handling
// SQA FOCUS: Update Invariants (Cannot shrink capacity below sold tickets)
// ==============================================================================
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, TextField, Button, Alert, Table, TableBody, 
    TableCell, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

// INTERFACE: Accepts both 'onStateChange' and 'onEventCreated' to ensure 
// backward compatibility with App.js routing logic.
export default function VendorDashboard({ vendorId, onStateChange, onEventCreated }) {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [capacity, setCapacity] = useState('');
    const [notification, setNotification] = useState({ type: '', text: '' });

    // --- EDIT MODAL STATE ---
    const [editOpen, setEditOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState({ id: '', title: '', capacity: '' });

    // READ: Fetch only this vendor's events
    const fetchMyEvents = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/vendor/events/${vendorId}`);
            setEvents(res.data.data);
        } catch (error) {
            console.error("Failed to fetch vendor data");
        }
    }, [vendorId]);

    useEffect(() => { fetchMyEvents(); }, [fetchMyEvents]);

    // SYNCHRONIZATION PROTOCOL: Fires all available state-lifting callbacks
    const triggerGlobalRefresh = () => {
        if (typeof onStateChange === 'function') onStateChange();
        if (typeof onEventCreated === 'function') onEventCreated();
    };

    // CREATE: Inject new event associated with vendorId
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/vendor/events', {
                vendor_id: vendorId, title: title, total_capacity: parseInt(capacity, 10)
            });
            setNotification({ type: 'success', text: 'Entity Deployed Successfully.' });
            setTitle(''); setCapacity('');
            
            fetchMyEvents(); // Update local table
            triggerGlobalRefresh(); // Update global inventory
            
        } catch (err) {
            setNotification({ type: 'error', text: 'Deployment Failed.' });
        }
    };

    // DELETE: Attempt to remove entity
    const handleDelete = async (eventId) => {
        try {
            await axios.delete(`http://localhost:8000/api/vendor/events/${eventId}`);
            setNotification({ type: 'success', text: 'Entity Purged.' });
            
            fetchMyEvents(); // Update local table
            triggerGlobalRefresh(); // Update global inventory
            
        } catch (error) {
            // SQA FOCUS: Referential Integrity Interception
            if (error.response && error.response.status === 400) {
                setNotification({ type: 'error', text: 'Integrity Fault: Cannot delete an event with active customer bookings.' });
            }
        }
    };

    // UPDATE - PART 1: Open the modal and populate with current data
    const handleOpenEdit = (ev) => {
        setEditingEvent({ id: ev.event_id, title: ev.title, capacity: ev.total_capacity });
        setEditOpen(true);
        setNotification({ type: '', text: '' }); // Clear any background notifications
    };

    // UPDATE - PART 2: Transmit the mutated vector to the API
    const handleUpdateSubmit = async () => {
        try {
            await axios.put(`http://localhost:8000/api/vendor/events/${editingEvent.id}`, {
                title: editingEvent.title,
                total_capacity: parseInt(editingEvent.capacity, 10)
            });
            setNotification({ type: 'success', text: 'Entity Updated Successfully.' });
            setEditOpen(false);
            
            fetchMyEvents(); // Update local table
            triggerGlobalRefresh(); // Update global inventory
            
        } catch (error) {
            // SQA FOCUS: Intercepting the mathematical capacity constraint
            if (error.response && error.response.data) {
                setNotification({ type: 'error', text: `[UPDATE FAULT] ${error.response.data.detail}` });
            } else {
                setNotification({ type: 'error', text: 'Update Failed. System unreachable.' });
            }
            setEditOpen(false); // Close modal so user sees the error on the main dashboard
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#fff', borderRadius: 2, boxShadow: 2 }}>
            <Typography variant="h6" color="primary" gutterBottom>Vendor Dashboard: {vendorId}</Typography>
            
            {notification.text && <Alert severity={notification.type} sx={{ mb: 2 }}>{notification.text}</Alert>}

            {/* Creation Form */}
            <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                <TextField label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} required size="small" sx={{ flexGrow: 1 }} />
                <TextField label="Total Capacity" type="number" inputProps={{ min: 1 }} value={capacity} onChange={(e) => setCapacity(e.target.value)} required size="small" sx={{ width: 120 }} />
                <Button type="submit" variant="contained" color="success">Deploy</Button>
            </Box>

            {/* Data Table */}
            <Paper variant="outlined">
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><strong>My Events</strong></TableCell>
                            <TableCell align="center"><strong>Avail / Total</strong></TableCell>
                            <TableCell align="right"><strong>Actions</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.map((ev) => (
                            <TableRow key={ev.event_id}>
                                <TableCell>{ev.title}</TableCell>
                                <TableCell align="center">
                                    {ev.available_capacity} / {ev.total_capacity}
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => handleOpenEdit(ev)} size="small" sx={{ mr: 1 }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => handleDelete(ev.event_id)} size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {events.length === 0 && (
                            <TableRow><TableCell colSpan={3} align="center">No entities deployed.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* SQA-Secured Edit Modal */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold', color: '#2c3e50' }}>Modify Event Entity</DialogTitle>
                <DialogContent dividers>
                    <TextField
                        fullWidth label="Event Title" variant="outlined" margin="normal"
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    />
                    <TextField
                        fullWidth label="Total Capacity" type="number" variant="outlined" margin="normal"
                        inputProps={{ min: 1 }}
                        value={editingEvent.capacity}
                        onChange={(e) => setEditingEvent({ ...editingEvent, capacity: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setEditOpen(false)} color="inherit" sx={{ fontWeight: 'bold' }}>Cancel</Button>
                    <Button onClick={handleUpdateSubmit} variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>Commit Update</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}