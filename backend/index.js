const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// REGISTER
app.post('/auth/register', async (req, res) => {
  const { email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.status(201).json({ token, user })
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' })
    } else {
      console.error(err)
      res.status(500).json({ error: 'Server error' })
    }
  }
})

// LOGIN
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user) return res.status(400).json({ error: 'Invalid email or password' })
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' })
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET all trades (protected)
app.get('/trades', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM trades WHERE user_id = $1 ORDER BY trade_date DESC',
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// POST a new trade (protected)
app.post('/trades', authenticateToken, async (req, res) => {
  const { symbol, direction, quantity, entry_price, exit_price, trade_date, notes } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO trades (symbol, direction, quantity, entry_price, exit_price, trade_date, notes, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [symbol, direction, quantity, entry_price, exit_price, trade_date, notes, req.user.id]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

// DELETE a trade (protected)
app.delete('/trades/:id', authenticateToken, async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM trades WHERE id = $1 AND user_id = $2', [id, req.user.id])
    res.json({ message: 'Trade deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Database error' })
  }
})

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})