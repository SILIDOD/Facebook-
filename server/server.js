require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

// Temporary database
let userLogins = [];

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// CORS Middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  next();
});

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Endpoints
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    userLogins.push({
      id: Date.now(),
      email,
      passwordHash: hashedPassword,
      loginTime: new Date().toISOString(),
      ip: req.ip || "127.0.0.1"
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/logins', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const safeLogins = userLogins.map(login => ({
    id: login.id,
    email: login.email,
    loginTime: login.loginTime,
    ip: login.ip
  }));
  
  res.json(safeLogins);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
