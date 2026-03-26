import { useState, useEffect } from 'react'

function App() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    symbol: '',
    direction: 'LONG',
    quantity: '',
    entry_price: '',
    exit_price: '',
    trade_date: '',
    notes: ''
  })

  useEffect(() => {
    fetchTrades()
  }, [])

  function fetchTrades() {
    fetch('http://localhost:3000/trades')
      .then(res => res.json())
      .then(data => {
        setTrades(data)
        setLoading(false)
      })
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSubmit(e) {
    e.preventDefault()
    fetch('http://localhost:3000/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        fetchTrades()
        setForm({
          symbol: '',
          direction: 'LONG',
          quantity: '',
          entry_price: '',
          exit_price: '',
          trade_date: '',
          notes: ''
        })
      })
  }

  function calculatePL(trade) {
    const entry = parseFloat(trade.entry_price)
    const exit = parseFloat(trade.exit_price)
    const qty = parseFloat(trade.quantity) || 1
    if (trade.direction === 'SHORT') {
      return ((entry - exit) * qty).toFixed(2)
    }
    return ((exit - entry) * qty).toFixed(2)
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Trading Journal</h1>

      {/* Add Trade Form */}
      <div style={{ marginBottom: '40px', padding: '24px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Add a Trade</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <input
            name="symbol"
            placeholder="Symbol (e.g. AAPL)"
            value={form.symbol}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            name="trade_date"
            type="date"
            value={form.trade_date}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <select
            name="direction"
            value={form.direction}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
          <input
            name="quantity"
            placeholder="Quantity (e.g. 10)"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            name="entry_price"
            placeholder="Entry price"
            type="number"
            value={form.entry_price}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            name="exit_price"
            placeholder="Exit price"
            type="number"
            value={form.exit_price}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            name="notes"
            placeholder="Notes"
            value={form.notes}
            onChange={handleChange}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', gridColumn: '1 / -1' }}
          />
          <button
            onClick={handleSubmit}
            style={{ gridColumn: '1 / -1', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            Add Trade
          </button>
        </div>
      </div>

      {/* Trades Table */}
      <h2>Your Trades</h2>
      {loading ? (
        <p>Loading trades...</p>
      ) : trades.length === 0 ? (
        <p>No trades yet. Add your first trade above.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Symbol</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Direction</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Qty</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Entry</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Exit</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>P/L</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => {
              const pl = calculatePL(trade)
              const plColor = pl >= 0 ? 'green' : 'red'
              return (
                <tr key={trade.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px', fontWeight: 'bold' }}>{trade.symbol}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: trade.direction === 'LONG' ? '#dcfce7' : '#fee2e2',
                      color: trade.direction === 'LONG' ? '#16a34a' : '#dc2626'
                    }}>
                      {trade.direction}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>{trade.quantity}</td>
                  <td style={{ padding: '8px' }}>${trade.entry_price}</td>
                  <td style={{ padding: '8px' }}>${trade.exit_price}</td>
                  <td style={{ padding: '8px', color: plColor, fontWeight: 'bold' }}>
                    {pl >= 0 ? '+' : ''}${pl}
                  </td>
                  <td style={{ padding: '8px' }}>{trade.trade_date?.slice(0, 10)}</td>
                  <td style={{ padding: '8px' }}>{trade.notes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App