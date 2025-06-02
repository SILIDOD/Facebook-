require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARE CONFIGURATION
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
  // Cache control for production
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : '0'
}));

// ======================
// ROUTE HANDLERS
// ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'), {
    headers: {
      'Cache-Control': 'no-cache' // Prevent caching of HTML files
    }
  });
});

app.get('/admin', (req, res) => {
  // Basic authentication check (replace with proper auth in production)
  if (!req.query.token || req.query.token !== process.env.ADMIN_TOKEN) {
    return res.status(403).send('Access denied');
  }
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// ======================
// API ENDPOINTS
// ======================
app.post('/api/login', (req, res) => {
  // Your existing login logic
  res.json({ success: true });
});

app.get('/api/logins', (req, res) => {
  // Your existing admin data endpoint
  res.json([]);
});

// ======================
// ERROR HANDLING
// ======================
// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// ======================
// SERVER START
// ======================
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`Access at: http://localhost:${PORT}`);
  console.log(`Admin panel: http://localhost:${PORT}/admin?token=${process.env.ADMIN_TOKEN}`);
});
