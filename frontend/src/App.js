// ==============================================================================
// FILE: App.js
// PURPOSE: Root React Component & Conditional Routing
// ==============================================================================
import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Grid, AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import HomeIcon from '@mui/icons-material/Home';

// Import Components
import BookingForm from './forms/BookingForm';
import VendorDashboard from './forms/VendorDashboard';
import EventInventory from './components/EventInventory';
import Welcome from './pages/Welcome';

const theme = createTheme({
    palette: { mode: 'light', primary: { main: '#2c3e50' }, background: { default: '#f4f7f6' } },
    typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }
});

function App() {
    // State to manage the active view: 'welcome', 'vendor', or 'customer'
    const [currentView, setCurrentView] = useState('welcome');
    // State to trigger dynamic data fetching
    const [refreshKey, setRefreshKey] = useState(0);

    const handleStateMutation = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> 
            
            {/* Unified Navigation Bar */}
            <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <EventSeatIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        SWE3020 | STATE MACHINE PORTAL
                    </Typography>
                    
                    {/* Render Home Button only if not on the Welcome page */}
                    {currentView !== 'welcome' && (
                        <Button 
                            color="inherit" 
                            startIcon={<HomeIcon />} 
                            onClick={() => setCurrentView('welcome')}
                        >
                            Home
                        </Button>
                    )}
                </Toolbar>
            </AppBar>

            {/* Conditional Rendering Logic */}
            {currentView === 'welcome' && (
                <Welcome onSelectRole={(role) => setCurrentView(role)} />
            )}

            {currentView === 'vendor' && (
                <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ position: 'sticky', top: 20 }}>
                                <VendorDashboard onEventCreated={handleStateMutation} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <EventInventory refreshTrigger={refreshKey} />
                        </Grid>
                    </Grid>
                </Container>
            )}

            {currentView === 'customer' && (
                <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <Box sx={{ position: 'sticky', top: 20 }}>
                                <BookingForm onTransactionSuccess={handleStateMutation} />
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <EventInventory refreshTrigger={refreshKey} />
                        </Grid>
                    </Grid>
                </Container>
            )}

        </ThemeProvider>
    );
}

export default App;