const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Explicit routes - serve correct HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'));
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Redirect favicon.ico to SVG data URI
app.get('/favicon.ico', (req, res) => {
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🕵️</text></svg>');
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 El Impostor server running on http://localhost:${PORT}`);
    console.log(`📱 Landing: http://localhost:${PORT}/`);
    console.log(`🎮 Game: http://localhost:${PORT}/game`);
});
