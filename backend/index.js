const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/trades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM trades ORDER BY trade_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/trades', async (req, res) => {
  const { symbol, entry_price, exit_price, trade_date, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO trades (symbol, entry_price, exit_price, trade_date, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [symbol, entry_price, exit_price, trade_date, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});