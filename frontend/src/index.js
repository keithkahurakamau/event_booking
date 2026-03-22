// ==============================================================================
// FILE: index.js
// PURPOSE: React Virtual DOM Injection Protocol
// ==============================================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// StrictMode enforces component lifecycle checks during development
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);