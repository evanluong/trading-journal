const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/trades', (req, res) => {
  res.json([
    { id: 1, symbol: 'AAPL', entryPrice: 150, exitPrice: 165 },
    { id: 2, symbol: 'TSLA', entryPrice: 200, exitPrice: 185 },
  ]);
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});