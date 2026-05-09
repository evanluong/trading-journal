import { useState, useEffect } from 'react'

function App() {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [editingId, setEditingId] = useState(null)
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
    if (token) fetchTrades()
    else setLoading(false)
  }, [token])

  function fetchTrades() {
    fetch('http://localhost:3000/trades', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401 || res.status === 403) {
          handleLogout()
          return
        }
        return res.json()
      })
      .then(data => {
        if (!Array.isArray(data)) return
        setTrades(data)
        setLoading(false)
      })
  }

  function handleAuthChange(e) {
    setAuthForm({ ...authForm, [e.target.name]: e.target.value })
  }

  function handleAuth(e) {
    e.preventDefault()
    setAuthError('')
    const url = authMode === 'login' ? '/auth/login' : '/auth/register'
    fetch(`http://localhost:3000${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm)
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setAuthError(data.error)
        } else {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          setToken(data.token)
          setUser(data.user)
        }
      })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setTrades([])
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const emptyForm = { symbol: '', direction: 'LONG', quantity: '', entry_price: '', exit_price: '', trade_date: '', notes: '' }

  function handleEdit(trade) {
    setEditingId(trade.id)
    setForm({
      symbol: trade.symbol,
      direction: trade.direction,
      quantity: trade.quantity,
      entry_price: trade.entry_price,
      exit_price: trade.exit_price,
      trade_date: trade.trade_date?.slice(0, 10),
      notes: trade.notes || ''
    })
  }

  function handleCancelEdit() {
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const url = editingId ? `http://localhost:3000/trades/${editingId}` : 'http://localhost:3000/trades'
    const method = editingId ? 'PUT' : 'POST'
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        fetchTrades()
        setEditingId(null)
        setForm(emptyForm)
      })
  }

  function handleDelete(id) {
    fetch(`http://localhost:3000/trades/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetchTrades())
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

  function calcStats(trades) {
    if (trades.length === 0) return null
    const pls = trades.map(t => parseFloat(calculatePL(t)))
    const totalPL = pls.reduce((a, b) => a + b, 0)
    const wins = pls.filter(pl => pl > 0).length
    return {
      totalPL: totalPL.toFixed(2),
      winRate: ((wins / trades.length) * 100).toFixed(0),
      count: trades.length,
      best: Math.max(...pls).toFixed(2),
      worst: Math.min(...pls).toFixed(2),
    }
  }

  // Show login/register if not logged in
  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '100px auto', padding: '40px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h1 style={{ marginTop: 0 }}>Trading Journal</h1>
        <h2>{authMode === 'login' ? 'Login' : 'Register'}</h2>

        {authError && (
          <p style={{ color: 'red', marginBottom: '12px' }}>{authError}</p>
        )}

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={authForm.email}
          onChange={handleAuthChange}
          style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={authForm.password}
          onChange={handleAuthChange}
          style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
        <button
          onClick={handleAuth}
          style={{ width: '100%', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
        >
          {authMode === 'login' ? 'Login' : 'Register'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '16px' }}>
          {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
            style={{ color: '#2563eb', cursor: 'pointer' }}
          >
            {authMode === 'login' ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    )
  }

  // Main app (logged in)
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ margin: 0 }}>Trading Journal</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ color: '#666' }}>{user?.email}</span>
          <button
            onClick={handleLogout}
            style={{ padding: '6px 14px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Trade Form */}
      <div style={{ marginBottom: '40px', padding: '24px', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Trade' : 'Add a Trade'}</h2>
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
            style={{ gridColumn: editingId ? 'auto' : '1 / -1', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            {editingId ? 'Update Trade' : 'Add Trade'}
          </button>
          {editingId && (
            <button
              onClick={handleCancelEdit}
              style={{ padding: '10px', backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {!loading && (() => {
        const stats = calcStats(trades)
        if (!stats) return null
        const plColor = parseFloat(stats.totalPL) >= 0 ? '#16a34a' : '#dc2626'
        const statCard = (label, value, color) => (
          <div style={{ flex: 1, padding: '16px', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: color || 'inherit' }}>{value}</div>
          </div>
        )
        return (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
            {statCard('Total P/L', `${parseFloat(stats.totalPL) >= 0 ? '+' : ''}$${stats.totalPL}`, plColor)}
            {statCard('Win Rate', `${stats.winRate}%`, stats.winRate >= 50 ? '#16a34a' : '#dc2626')}
            {statCard('Trades', stats.count)}
            {statCard('Best Trade', `+$${stats.best}`, '#16a34a')}
            {statCard('Worst Trade', `$${stats.worst}`, '#dc2626')}
          </div>
        )
      })()}

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
              <th style={{ textAlign: 'left', padding: '8px' }}>Action</th>
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
                  <td style={{ padding: '8px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => handleEdit(trade)}
                      style={{ padding: '4px 10px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trade.id)}
                      style={{ padding: '4px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
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