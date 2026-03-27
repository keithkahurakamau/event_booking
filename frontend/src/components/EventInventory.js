// ==============================================================================
// FILE: src/components/EventInventory.js
// PURPOSE: Dynamic Data Fetching & Real-Time State Visualization
// SQA FOCUS: Cache-Busting for Deterministic Data Representation
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,  

    Paper, Typography, CircularProgress, Box, Chip, IconButton, 
    Tooltip, LinearProgress 
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import axios from 'axios';

export default function EventInventory({ refreshTrigger }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStateMatrix = async () => {
            try {
                // INJECTED CACHE BUSTER: Appending a timestamp forces a fresh network call
                const timestamp = new Date().getTime();
                const response = await axios.get(`http://localhost:8000/api/events?t=${timestamp}`);
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

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 10 }}>
            <CircularProgress thickness={5} size={50} sx={{ color: 'primary.main' }} />
        </Box>
    );

    return (
        <Box sx={{ width: '100%', mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                Live Inventory State
                <Chip 
                    label="Real-time" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 2, fontSize: '0.65rem', height: 20, fontWeight: 700, textTransform: 'uppercase' }} 
                />
            </Typography>

            <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                    border: '1px solid #e2e8f0', 
                    borderRadius: 4, 
                    overflow: 'hidden',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f1f5f9' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>EVENT ENTITY</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 200 }}>CAPACITY METRICS</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="right">IDENTIFIER</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {events.map((event) => {
                            const capacityRatio = (event.available_capacity / event.total_capacity) * 100;
                            const isCritical = event.available_capacity < 10;
                            const isEmpty = event.available_capacity === 0;

                            return (
                                <TableRow key={event.event_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                                        {event.title}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Box sx={{ width: '100%' }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: isEmpty ? 'error.main' : 'text.secondary' }}>
                                                    {event.available_capacity} / {event.total_capacity} Seats
                                                </Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                                                    {Math.round(capacityRatio)}%
                                                </Typography>
                                            </Box>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={capacityRatio} 
                                                sx={{ 
                                                    height: 8, 
                                                    borderRadius: 4, 
                                                    bgcolor: '#f1f5f9',
                                                    '& .MuiLinearProgress-bar': {
                                                        borderRadius: 4,
                                                        bgcolor: isEmpty ? 'error.main' : isCritical ? 'warning.main' : 'primary.main'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </TableCell>

                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                            <Tooltip title="Copy UUID">
                                                <Chip 
                                                    label={event.event_id.substring(0, 8)} 
                                                    onClick={() => handleCopy(event.event_id)}
                                                    variant="outlined"
                                                    clickable
                                                    icon={<ContentCopyIcon sx={{ fontSize: '12px !important' }} />}
                                                    sx={{ 
                                                        fontFamily: 'monospace', 
                                                        fontWeight: 500,
                                                        fontSize: '0.75rem',
                                                        borderColor: '#e2e8f0',
                                                        '&:hover': { bgcolor: '#f8fafc' }
                                                    }}
                                                />
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {events.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                    No active event vectors detected in system memory.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}