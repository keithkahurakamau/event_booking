// ==============================================================================
// FILE: src/pages/Welcome.js
// PURPOSE: Identity Capture & Modern Role Routing
// SQA FOCUS: Usability & Identity Invariants
// ==============================================================================
import React, { useState } from 'react';
import { 
    Box, Typography, Button, Container, Grid, Paper, 
    TextField, Alert, InputAdornment, Avatar // ADDED AVATAR HERE
} from '@mui/material';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import BadgeIcon from '@mui/icons-material/Badge';

export default function Welcome({ onSelectRole }) {
    const [userId, setUserId] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (role) => {
        if (!userId.trim()) { 
            setError('System Entry Denied: Identification required for audit logging.'); 
            return; 
        }
        onSelectRole(role, userId.trim());
    };

    return (
        <Container maxWidth="md">
            <Box textAlign="center" mb={8}>
                <Typography variant="h3" sx={{ mb: 2, color: 'primary.main', fontWeight: 900 }}>
                    Secure Event Portal
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Deterministic State Management for High-Concurrency Venues
                </Typography>
            </Box>

            <Box sx={{ maxWidth: 450, mx: 'auto', mb: 6 }}>
                <TextField 
                    fullWidth 
                    placeholder="Enter Username or ID" 
                    variant="outlined"
                    value={userId}
                    onChange={(e) => { setUserId(e.target.value); setError(''); }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <BadgeIcon color="primary" />
                            </InputAdornment>
                        ),
                        sx: { bgcolor: '#fff', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
                    }}
                />
                {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
            </Box>

            <Grid container spacing={4}>
                {[
                    { 
                        title: 'Vendor Console', 
                        icon: <StorefrontIcon />, 
                        color: '#10b981', // Emerald 500
                        role: 'vendor', 
                        desc: 'Initialize and manage event entity lifecycle.' 
                    },
                    { 
                        title: 'Customer Portal', 
                        icon: <ConfirmationNumberIcon />, 
                        color: '#4f46e5', // Indigo 600
                        role: 'customer', 
                        desc: 'Browse inventory and authorize ticket transactions.' 
                    }
                ].map((item) => (
                    <Grid item xs={12} sm={6} key={item.role}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 5, 
                                textAlign: 'center', 
                                borderRadius: 8, 
                                border: '2px solid transparent',
                                bgcolor: 'background.paper',
                                transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                '&:hover': { 
                                    borderColor: item.color, 
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
                                }
                            }}
                        >
                            <Avatar 
                                sx={{ 
                                    bgcolor: `${item.color}15`, 
                                    color: item.color, 
                                    mx: 'auto', 
                                    mb: 3, 
                                    width: 72, 
                                    height: 72 
                                }}
                            >
                                {React.cloneElement(item.icon, { sx: { fontSize: 32 } })}
                            </Avatar>
                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 800 }}>
                                {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4, px: 2 }}>
                                {item.desc}
                            </Typography>
                            <Button 
                                variant="contained" 
                                size="large" 
                                fullWidth 
                                sx={{ 
                                    bgcolor: item.color, 
                                    borderRadius: 3,
                                    py: 1.5,
                                    '&:hover': { bgcolor: item.color, filter: 'brightness(0.9)' } 
                                }} 
                                onClick={() => handleLogin(item.role)}
                            >
                                Launch {item.title.split(' ')[0]}
                            </Button>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}