import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Box, Chip, IconButton, Tooltip, LinearProgress } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

export default function EventInventory({ refreshTrigger }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStateMatrix = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/events');
                setEvents(response.data.data);
            } catch (err) {
                console.error("State synchronization failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchStateMatrix();
    }, [refreshTrigger]);

    const handleCopy = (uuid) => {
        navigator.clipboard.writeText(uuid);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, color: '#2c3e50', mb: 3 }}>
                Live Inventory State
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                            <TableCell><strong>Entity</strong></TableCell>
                            <TableCell sx={{ minWidth: 150 }}><strong>Capacity Vector</strong></TableCell>
                            <TableCell><strong>UUID (Copy)</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.map((event) => {
                            const capacityRatio = (event.available_capacity / event.total_capacity) * 100;
                            const isCritical = event.available_capacity < 10;

                            return (
                                <TableRow key={event.event_id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{event.title}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Chip 
                                                label={`${event.available_capacity} / ${event.total_capacity}`} 
                                                color={event.available_capacity === 0 ? "error" : isCritical ? "warning" : "success"}
                                                size="small" variant="outlined" sx={{ fontWeight: 'bold' }}
                                            />
                                            <Box sx={{ width: '100%' }}>
                                                <LinearProgress 
                                                    variant="determinate" 
                                                    value={capacityRatio} 
                                                    color={event.available_capacity === 0 ? "error" : isCritical ? "warning" : "success"}
                                                    sx={{ height: 6, borderRadius: 3 }}
                                                />
                                            </Box>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#7f8c8d' }}>
                                                {event.event_id.substring(0, 13)}...
                                            </Typography>
                                            <Tooltip title="Copy UUID for Testing">
                                                <IconButton size="small" onClick={() => handleCopy(event.event_id)} sx={{ ml: 1 }}>
                                                    <ContentCopyIcon fontSize="small" color="primary" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}