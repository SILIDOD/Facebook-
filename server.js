require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ===== SECURITY MIDDLEWARE =====
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// ===== STATIC FILES =====
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : '0'
}));

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== ERROR HANDLING =====
// 404 Handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('💥 SERVER ERROR:', err);
  res.status(500).sendFile(path.join(__dirname, 'public', 'error.html'));
});

// ===== SERVER START =====
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err);
  server.close(() => process.exit(1));
});
