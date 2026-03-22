import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme, Grid, AppBar, Toolbar, Typography, Box } from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import BookingForm from './forms/BookingForm';
import EventInventory from './components/EventInventory';
import VendorDashboard from './forms/VendorDashboard'; // Import the new Vendor module

const theme = createTheme({
    palette: { mode: 'light', primary: { main: '#2c3e50' }, background: { default: '#f4f7f6' } },
    typography: { fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }
});

function App() {
    const [refreshKey, setRefreshKey] = useState(0);

    // Single deterministic trigger to synchronize all child components
    const handleStateMutation = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> 
            
            <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
                <Toolbar>
                    <EventSeatIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        SWE3020 | STATE MACHINE PORTAL
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
                <Grid container spacing={4}>
                    {/* Left Column: Input Vectors (Vendor + Customer Actions) */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 20 }}>
                            {/* Vendor creates an event -> Triggers Inventory Refresh */}
                            <VendorDashboard onEventCreated={handleStateMutation} />
                            
                            {/* Customer books a ticket -> Triggers Inventory Refresh */}
                            <BookingForm onTransactionSuccess={handleStateMutation} />
                        </Box>
                    </Grid>
                    
                    {/* Right Column: Active System State Visualization */}
                    <Grid item xs={12} md={8}>
                        <EventInventory refreshTrigger={refreshKey} />
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;