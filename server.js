const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { client, initDb } = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key_for_dev_only';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// GET / - Serves SPA (handled by express.static)

// POST /register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const id = crypto.randomUUID();
    const password_hash = await bcrypt.hash(password, 10);

    await client.execute({
      sql: 'INSERT INTO user (id, username, password_hash) VALUES (?, ?, ?)',
      args: [id, username, password_hash]
    });

    const session_token = jwt.sign({ id, username }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '24h' });
    res.json({ session_token });
  } catch (error) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Username already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const result = await client.execute({
      sql: 'SELECT * FROM user WHERE username = ?',
      args: [username]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const session_token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { algorithm: 'HS256', expiresIn: '24h' });
    res.json({ session_token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /logout
app.post('/logout', (req, res) => {
  // Since we use localStorage for the token, we just return success.
  // The client will delete the token from its storage.
  res.json({ message: 'Logged out successfully' });
});

// POST /add_score
app.post('/add_score', authenticateToken, async (req, res) => {
  const { score } = req.body;
  if (typeof score !== 'number') return res.status(400).json({ error: 'Invalid score' });

  try {
    const id = crypto.randomUUID();
    const created_at = Math.floor(Date.now() / 1000);

    await client.execute({
      sql: 'INSERT INTO score (id, user_id, score, created_at) VALUES (?, ?, ?, ?)',
      args: [id, req.user.id, score, created_at]
    });

    res.json({ message: 'Score added' });
  } catch (error) {
    console.error('Add score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/ranking
app.get('/api/ranking', async (req, res) => {
  try {
    const result = await client.execute(`
      SELECT u.username, MAX(s.score) as highest_score
      FROM user u
      JOIN score s ON u.id = s.user_id
      GROUP BY u.id
      ORDER BY highest_score DESC
      LIMIT 100
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Ranking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database', err);
  process.exit(1);
});
