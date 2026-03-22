import React, { useState } from 'react';
import { 
    Container, CssBaseline, ThemeProvider, createTheme, Grid, 
    AppBar, Toolbar, Typography, Box, Button, Chip, Avatar 
} from '@mui/material';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Component Imports
import BookingForm from './forms/BookingForm';
import VendorDashboard from './forms/VendorDashboard';
import EventInventory from './components/EventInventory';
import CustomerHistory from './components/CustomerHistory';
import Welcome from './pages/Welcome';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: '#4f46e5' }, // Indigo-600
        secondary: { main: '#06b6d4' }, // Cyan-500
        background: { default: '#f8fafc', paper: '#ffffff' }, // Slate-50 background
        text: { primary: '#1e293b', secondary: '#64748b' },
    },
    shape: { borderRadius: 12 },
    typography: {
        fontFamily: '"Inter", "system-ui", "sans-serif"',
        h5: { fontWeight: 800, letterSpacing: '-0.02em' },
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: { styleOverrides: { root: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } } } },
        MuiPaper: { styleOverrides: { root: { boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)' } } },
    }
});

function App() {
    const [currentView, setCurrentView] = useState('welcome');
    const [activeUserId, setActiveUserId] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleStateMutation = () => setRefreshKey(prev => prev + 1);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> 
            
            <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: '1px solid #e2e8f0', color: 'text.primary' }}>
                <Toolbar sx={{ justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1.5, width: 32, height: 32 }}>
                            <EventSeatIcon fontSize="small" />
                        </Avatar>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900 }}>
                            EVENTIC
                        </Typography>
                    </Box>
                    
                    {currentView !== 'welcome' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip 
                                icon={<AccountCircleIcon />} 
                                label={activeUserId} 
                                variant="outlined" 
                                sx={{ fontWeight: 600, border: '1px solid #e2e8f0' }} 
                            />
                            <Button 
                                variant="text" 
                                color="inherit" 
                                startIcon={<HomeIcon />} 
                                onClick={() => { setActiveUserId(''); setCurrentView('welcome'); }}
                            >
                                Exit
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            <Box sx={{ minHeight: 'calc(100vh - 64px)', py: 6 }}>
                {currentView === 'welcome' && (
                    <Welcome onSelectRole={(role, id) => { setActiveUserId(id); setCurrentView(role); }} />
                )}

                {currentView === 'vendor' && (
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            <Grid item xs={12} lg={5}>
                                <VendorDashboard vendorId={activeUserId} onStateChange={handleStateMutation} />
                            </Grid>
                            <Grid item xs={12} lg={7}>
                                <EventInventory refreshTrigger={refreshKey} />
                            </Grid>
                        </Grid>
                    </Container>
                )}

                {currentView === 'customer' && (
                    <Container maxWidth="lg">
                        <Grid container spacing={4}>
                            <Grid item xs={12} lg={5}>
                                <BookingForm customerId={activeUserId} onTransactionSuccess={handleStateMutation} />
                            </Grid>
                            <Grid item xs={12} lg={7}>
                                <EventInventory refreshTrigger={refreshKey} />
                                <CustomerHistory customerId={activeUserId} refreshTrigger={refreshKey} />
                            </Grid>
                        </Grid>
                    </Container>
                )}
            </Box>
        </ThemeProvider>
    );
}

export default App;