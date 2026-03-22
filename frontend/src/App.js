// ==============================================================================
// FILE: App.js
// PURPOSE: Root React Component & Material UI Theme Provider
// ==============================================================================
import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// RESOLUTION PROTOCOL: Update relative import path to target the 'forms' directory
import BookingForm from './forms/BookingForm';

// Establish a baseline aesthetic constraint for the GUI
const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        background: {
            default: '#f4f6f8',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            {/* CssBaseline standardizes default browser rendering */}
            <CssBaseline /> 
            <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
                <BookingForm />
            </Container>
        </ThemeProvider>
    );
}

export default App;