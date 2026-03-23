import { useState, useEffect } from 'react'

function App() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:3000/trades')
      .then(res => res.json())
      .then(data => {
        setTrades(data)
        setLoading(false)
      })
  }, [])

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
      <h1>Trading Journal</h1>

      {loading ? (
        <p>Loading trades...</p>
      ) : trades.length === 0 ? (
        <p>No trades yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>Symbol</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Entry</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Exit</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {trades.map(trade => (
              <tr key={trade.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{trade.symbol}</td>
                <td style={{ padding: '8px' }}>${trade.entry_price}</td>
                <td style={{ padding: '8px' }}>${trade.exit_price}</td>
                <td style={{ padding: '8px' }}>{trade.trade_date?.slice(0, 10)}</td>
                <td style={{ padding: '8px' }}>{trade.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default App