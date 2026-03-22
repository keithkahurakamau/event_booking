// ==============================================================================
// FILE: src/components/CustomerHistory.js
// PURPOSE: Read-Only Transaction Log for Authenticated Customers
// ==============================================================================
import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';

export default function CustomerHistory({ customerId, refreshTrigger }) {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!customerId) return; // Prevent firing if identity is not yet loaded
            
            try {
                // SQA FOCUS: Hitting the correct Multi-Tenant endpoint
                const res = await axios.get(`http://localhost:8000/api/customer/bookings/${customerId}`);
                setHistory(res.data.data);
            } catch (err) {
                console.error("Failed to fetch customer history matrix.", err);
            }
        };
        fetchHistory();
    }, [customerId, refreshTrigger]);

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom color="primary">My Transaction History</Typography>
            <Paper variant="outlined">
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#e3f2fd' }}>
                        <TableRow>
                            <TableCell><strong>Date</strong></TableCell>
                            <TableCell><strong>Event Title</strong></TableCell>
                            <TableCell align="center"><strong>Tickets Booked</strong></TableCell>
                            <TableCell><strong>Receipt ID</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {history.map((row) => (
                            <TableRow key={row.booking_id}>
                                <TableCell>{new Date(row.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>{row.title}</TableCell>
                                <TableCell align="center">{row.tickets_requested}</TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                    {row.booking_id.substring(0, 8)}...
                                </TableCell>
                            </TableRow>
                        ))}
                        {history.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No transactions found in the database.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}