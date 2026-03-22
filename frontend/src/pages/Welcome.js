// ==============================================================================
// FILE: src/pages/Welcome.js
// PURPOSE: Identity Capture & Role Routing
// ==============================================================================
import React, { useState } from 'react';
import { Box, Typography, Button, Container, Grid, Paper, TextField, Alert } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

export default function Welcome({ onSelectRole }) {
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');

    const handleRoleSelection = (role) => {
        if (!userId.trim()) {
            setError('System Constraint: A unique Identity ID is required to proceed.');
            return;
        }
        onSelectRole(role, userId.trim());
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" fontWeight="900" color="primary" gutterBottom>
                    SWE3020 Event Booking System
                </Typography>
                <Typography variant="h6" color="textSecondary" mb={4}>
                    Multi-Tenant Transactional State Machine
                </Typography>
                
                {/* Identity Input Vector */}
                <Box sx={{ maxWidth: 400, margin: '0 auto', mb: 4 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField 
                        fullWidth 
                        label="Enter System Identity (e.g., keith_vendor)" 
                        variant="outlined"
                        value={userId}
                        onChange={(e) => { setUserId(e.target.value); setError(''); }}
                        sx={{ bgcolor: '#fff', borderRadius: 1 }}
                    />
                </Box>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                        <StorefrontIcon sx={{ fontSize: 60, color: '#27ae60', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>Vendor Portal</Typography>
                        <Button variant="contained" color="success" size="large" fullWidth onClick={() => handleRoleSelection('vendor')}>
                            Authenticate as Vendor
                        </Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Paper elevation={3} sx={{ p: 5, textAlign: 'center', borderRadius: 4 }}>
                        <ConfirmationNumberIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>Customer Portal</Typography>
                        <Button variant="contained" color="primary" size="large" fullWidth onClick={() => handleRoleSelection('customer')}>
                            Authenticate as Customer
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}