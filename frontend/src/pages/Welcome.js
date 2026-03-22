// ==============================================================================
// FILE: src/pages/Welcome.js
// PURPOSE: Application Entry Point & Role Routing
// SQA FOCUS: Usability & User Journey Segregation
// ==============================================================================
import React from 'react';
import { Box, Typography, Button, Container, Grid, Paper } from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

export default function Welcome({ onSelectRole }) {
    return (
        <Container maxWidth="md" sx={{ mt: 10 }}>
            <Box textAlign="center" mb={6}>
                <Typography variant="h3" fontWeight="900" color="primary" gutterBottom>
                    SWE3020 Event Booking System
                </Typography>
                <Typography variant="h6" color="textSecondary">
                    Mathematical precision in transactional state management.
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                {/* Vendor Route Card */}
                <Grid item xs={12} sm={6}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 5, 
                            textAlign: 'center', 
                            borderRadius: 4,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                        }}
                    >
                        <StorefrontIcon sx={{ fontSize: 60, color: '#27ae60', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Vendor Portal
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 4 }}>
                            Deploy new events to the system matrix and initialize capacity invariants.
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="success" 
                            size="large" 
                            fullWidth
                            onClick={() => onSelectRole('vendor')}
                        >
                            Enter as Vendor
                        </Button>
                    </Paper>
                </Grid>

                {/* Customer Route Card */}
                <Grid item xs={12} sm={6}>
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: 5, 
                            textAlign: 'center', 
                            borderRadius: 4,
                            transition: 'transform 0.2s',
                            '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 }
                        }}
                    >
                        <ConfirmationNumberIcon sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            Customer Portal
                        </Typography>
                        <Typography color="textSecondary" sx={{ mb: 4 }}>
                            Browse live inventory and securely authorize deterministic transactions.
                        </Typography>
                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large" 
                            fullWidth
                            onClick={() => onSelectRole('customer')}
                        >
                            Enter as Customer
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}