import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Grid, AppBar, Toolbar, Typography, Box, Button, Chip } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import HomeIcon from '@mui/icons-material/Home';

import BookingForm from './forms/BookingForm';
import VendorDashboard from './forms/VendorDashboard';
import EventInventory from './components/EventInventory';
import CustomerHistory from './components/CustomerHistory';
import Welcome from './pages/Welcome';

const theme = createTheme({
    palette: { mode: 'light', primary: { main: '#2c3e50' }, background: { default: '#f4f7f6' } }
});

function App() {
    const [currentView, setCurrentView] = useState('welcome');
    const [activeUserId, setActiveUserId] = useState(''); // Holds the Session Identity
    const [refreshKey, setRefreshKey] = useState(0);

    const handleStateMutation = () => setRefreshKey(prev => prev + 1);

    const handleLogin = (role, id) => {
        setActiveUserId(id);
        setCurrentView(role);
    };

    const handleLogout = () => {
        setActiveUserId('');
        setCurrentView('welcome');
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> 
            <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <EventSeatIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>SWE3020 | STATE MACHINE</Typography>
                    
                    {currentView !== 'welcome' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip label={`ID: ${activeUserId}`} color="secondary" variant="outlined" sx={{ bgcolor: '#fff' }} />
                            <Button color="inherit" startIcon={<HomeIcon />} onClick={handleLogout}>Logout</Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {currentView === 'welcome' && <Welcome onSelectRole={handleLogin} />}

            {currentView === 'vendor' && (
                <Container maxWidth="xl" sx={{ mt: 5 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={5}>
                            <VendorDashboard vendorId={activeUserId} onStateChange={handleStateMutation} />
                        </Grid>
                        <Grid item xs={12} md={7}>
                            <EventInventory refreshTrigger={refreshKey} />
                        </Grid>
                    </Grid>
                </Container>
            )}

            {currentView === 'customer' && (
                <Container maxWidth="xl" sx={{ mt: 5 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <BookingForm customerId={activeUserId} onTransactionSuccess={handleStateMutation} />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <EventInventory refreshTrigger={refreshKey} />
                            <CustomerHistory customerId={activeUserId} refreshTrigger={refreshKey} />
                        </Grid>
                    </Grid>
                </Container>
            )}
        </ThemeProvider>
    );
}

export default App;