
import React, { useState } from 'react';

import { 
    Box, Typography, Button, Container, Tabs, Tab, TextField, Alert, InputAdornment, CircularProgress
} from '@mui/material';

import BadgeIcon from '@mui/icons-material/Badge';

export default function Welcome({ onSelectRole }) {
    const [tab, setTab] = useState(0); // 0 = Login, 1 = Signup
    const [form, setForm] = useState({ username: '', password: '', email: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

const handleAuth = async (role) => {
    setLoading(true);
    setError('');
    let res, data, text;
    try {
        const endpoint = tab === 0 ? '/api/login' : '/api/signup';
        const payload = tab === 0
            ? new URLSearchParams({ username: form.username, password: form.password })
           : JSON.stringify({ username: form.username, password: form.password, email: form.email, role })
        const headers = tab === 0
            ? { 'Content-Type': 'application/x-www-form-urlencoded' }
            : { 'Content-Type': 'application/json' };
        res = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: payload
        });
        // Only read the body once, and branch on content-type
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await res.json();
        } else {
            text = await res.text();
            throw new Error(text || 'Unknown error');
        }
        if (!res.ok) throw new Error(data.detail || 'Authentication failed');
        let token, userId;
        if (tab === 0) {
    userId = data.user_id;
    token = data.access_token; // if you want to store it for future use
        } else {
        userId = data.user_id;
         const loginRes = await fetch('/api/login', {
         method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ username: form.username, password: form.password })
    });
    const loginData = await loginRes.json();
    token = loginData.access_token;
}
        localStorage.setItem('token', token);
        onSelectRole(role, userId);
    } catch (err) {
        setError(err?.message || err?.detail || JSON.stringify(err));
    } finally {
        setLoading(false);
    }
}

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

                <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(''); }} centered>
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                </Tabs>

                <TextField 
                    fullWidth 
                    name="username"
                    label="Username" 
                    variant="outlined"
                    value={form.username}
                    onChange={handleChange}
                    sx={{ mt: 3 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <BadgeIcon color="primary" />
                            </InputAdornment>
                        )
                    }}
                />
                <TextField 
                    fullWidth 
                    name="password"
                    label="Password" 
                    type="password"
                    variant="outlined"
                    value={form.password}
                    onChange={handleChange}
                    sx={{ mt: 2 }}
                />
                {tab === 1 && (
                    <TextField 
                        fullWidth 
                        name="email"
                        label="Email" 
                        type="email"
                        variant="outlined"
                        value={form.email}
                        onChange={handleChange}
                        sx={{ mt: 2 }}
                    />
                )}
                {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        fullWidth 
                        disabled={loading}
                        onClick={() => handleAuth('vendor')}
                        startIcon={loading && <CircularProgress size={18} />}
                    >
                        {tab === 0 ? 'Login as Vendor' : 'Sign Up as Vendor'}
                    </Button>
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        fullWidth 
                        disabled={loading}
                        onClick={() => handleAuth('customer')}
                        startIcon={loading && <CircularProgress size={18} />}
                    >
                        {tab === 0 ? 'Login as Customer' : 'Sign Up as Customer'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}