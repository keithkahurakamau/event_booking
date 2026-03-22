import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import axios from 'axios';

export default function CustomerHistory({ customerId, refreshTrigger }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!customerId) return;
            try {
                const res = await axios.get(`http://localhost:8000/api/customer/bookings/${customerId}`);
                setHistory(res.data.data);
            } catch (err) {
                console.error("Failed to fetch history matrix.", err);
            }
        };
        fetchHistory();
    }, [customerId, refreshTrigger]);

    return (
        <Box sx={{ mt: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary">Booking History</Typography>
            </Box>
            
            <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <Table size="medium">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>DATE</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#64748b' }}>EVENT</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#64748b' }}>TICKETS</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#64748b' }}>RECEIPT ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((row) => (
                            <TableRow key={row.booking_id} hover>
                                <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    {new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{row.title}</TableCell>
                                <TableCell align="center">
                                    <Chip label={row.tickets_requested} size="small" sx={{ fontWeight: 700, bgcolor: '#f1f5f9' }} />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.5, borderRadius: 1 }}>
                                        {row.booking_id.substring(0, 8).toUpperCase()}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ))}
                        {history.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    No transaction records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}