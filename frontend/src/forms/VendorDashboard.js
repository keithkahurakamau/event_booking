import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, TextField, Button, Alert, Table, TableBody, 
    TableCell, TableHead, TableRow, Paper, IconButton, 
    Dialog, DialogTitle, DialogContent, DialogActions, Avatar, InputAdornment 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PostAddIcon from '@mui/icons-material/PostAdd';
import axios from 'axios';

export default function VendorDashboard({ vendorId, onStateChange, onEventCreated }) {
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState('');
    const [capacity, setCapacity] = useState('');
    const [notification, setNotification] = useState({ type: '', text: '' });
    const [editOpen, setEditOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState({ id: '', title: '', capacity: '' });

    const fetchMyEvents = useCallback(async () => {
        try {
            const res = await axios.get(`http://localhost:8000/api/vendor/events/${vendorId}`);
            setEvents(res.data.data);
        } catch (error) { console.error("Fetch error"); }
    }, [vendorId]);

    useEffect(() => { fetchMyEvents(); }, [fetchMyEvents]);

    const triggerGlobalRefresh = () => {
        if (typeof onStateChange === 'function') onStateChange();
        if (typeof onEventCreated === 'function') onEventCreated();
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8000/api/vendor/events', {
                vendor_id: vendorId, title: title, total_capacity: parseInt(capacity, 10)
            });
            setNotification({ type: 'success', text: 'Deployment Successful.' });
            setTitle(''); setCapacity('');
            fetchMyEvents();
            triggerGlobalRefresh();
        } catch (err) { setNotification({ type: 'error', text: 'Deployment Failed.' }); }
    };

    const handleUpdateSubmit = async () => {
        try {
            await axios.put(`http://localhost:8000/api/vendor/events/${editingEvent.id}`, {
                title: editingEvent.title, total_capacity: parseInt(editingEvent.capacity, 10)
            });
            setNotification({ type: 'success', text: 'Update Committed.' });
            setEditOpen(false);
            fetchMyEvents();
            triggerGlobalRefresh();
        } catch (error) {
            const msg = error.response?.data?.detail || "Update Rejected.";
            setNotification({ type: 'error', text: msg });
            setEditOpen(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 4, borderRadius: 6, border: '1px solid #e2e8f0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ bgcolor: '#10b981', mr: 2, width: 40, height: 40 }}><PostAddIcon /></Avatar>
                <Typography variant="h5">Management Console</Typography>
            </Box>

            {notification.text && <Alert severity={notification.type} sx={{ mb: 3, borderRadius: 3 }}>{notification.text}</Alert>}

            <Box component="form" onSubmit={handleCreate} sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <TextField 
                    fullWidth label="Event Name" size="small" value={title} 
                    onChange={(e) => setTitle(e.target.value)} required 
                    sx={{ flexGrow: 1 }}
                />
                <TextField 
                    label="Units" type="number" size="small" value={capacity} 
                    onChange={(e) => setCapacity(e.target.value)} required 
                    sx={{ width: 100 }}
                />
                <Button variant="contained" color="success" type="submit" sx={{ px: 4, borderRadius: 3 }}>Deploy</Button>
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.7rem' }}>
                Active System Entities
            </Typography>
            
            <Table size="small">
                <TableBody>
                    {events.map((ev) => (
                        <TableRow key={ev.event_id} sx={{ '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 700, py: 2 }}>{ev.title}</TableCell>
                            <TableCell align="right">
                                <IconButton size="small" onClick={() => { setEditingEvent({ id: ev.event_id, title: ev.title, capacity: ev.total_capacity }); setEditOpen(true); }}>
                                    <EditIcon fontSize="inherit" color="primary" />
                                </IconButton>
                                <IconButton size="small" onClick={async () => { 
                                    try { 
                                        await axios.delete(`http://localhost:8000/api/vendor/events/${ev.event_id}`); 
                                        fetchMyEvents(); triggerGlobalRefresh(); 
                                    } catch(e) { setNotification({type: 'error', text: 'Deletion Restricted: Active Bookings Found.'}); }
                                }}>
                                    <DeleteIcon fontSize="inherit" color="error" />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} PaperProps={{ sx: { borderRadius: 5, p: 2 } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>Update Vector</DialogTitle>
                <DialogContent>
                    <TextField fullWidth label="Title" margin="normal" value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} />
                    <TextField fullWidth label="Total Capacity" type="number" margin="normal" value={editingEvent.capacity} onChange={(e) => setEditingEvent({...editingEvent, capacity: e.target.value})} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleUpdateSubmit} variant="contained">Commit</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
}