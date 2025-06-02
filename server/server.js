require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

// Temporary database (in production, use a real database)
let userLogins = [];

// Middleware
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('Authentication API is running. Use /api/login to authenticate.');
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // In a real app, you would verify credentials against a database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    userLogins.push({
      id: Date.now(),
      email,
      passwordHash: hashedPassword, // Store only the hash
      loginTime: new Date().toISOString(),
      ip: req.ip || "127.0.0.1"
    });
    
    res.json({ 
      success: true,
      message: "Login recorded (demo only - not real authentication)"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin endpoint with proper authorization
app.get('/api/logins', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized: Invalid admin token" });
  }

  // Return sanitized data without password hashes
  const safeLogins = userLogins.map(login => ({
    id: login.id,
    email: login.email,
    loginTime: login.loginTime,
    ip: login.ip
  }));
  
  res.json(safeLogins);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
