import { useState, useEffect } from 'react'
import './App.css'
import Auth       from './components/Auth'
import Modal      from './components/Modal'
import TradeForm  from './components/TradeForm'
import StatsPanel from './components/StatsPanel'
import TradeTable from './components/TradeTable'

const API = 'http://localhost:3000'
const EMPTY_FORM = { symbol: '', direction: 'LONG', quantity: '', entry_price: '', exit_price: '', trade_date: '', notes: '' }

function calculatePL(trade) {
  const entry = parseFloat(trade.entry_price)
  const exit  = parseFloat(trade.exit_price)
  const qty   = parseFloat(trade.quantity) || 1
  return trade.direction === 'SHORT'
    ? ((entry - exit) * qty).toFixed(2)
    : ((exit  - entry) * qty).toFixed(2)
}

function calcStats(trades) {
  if (trades.length === 0) return null
  const pls     = trades.map(t => parseFloat(calculatePL(t)))
  const totalPL = pls.reduce((a, b) => a + b, 0)
  const wins    = pls.filter(pl => pl > 0).length
  return {
    totalPL:  totalPL.toFixed(2),
    winRate:  ((wins / trades.length) * 100).toFixed(0),
    count:    trades.length,
    best:     Math.max(...pls).toFixed(2),
  }
}

export default function App() {
  const [token,     setToken]     = useState(localStorage.getItem('token'))
  const [user,      setUser]      = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [authMode,  setAuthMode]  = useState('login')
  const [authForm,  setAuthForm]  = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')

  const [trades,    setTrades]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [activeTab, setActiveTab] = useState('trading')

  useEffect(() => {
    if (token) fetchTrades()
    else setLoading(false)
  }, [token])

  function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  function fetchTrades() {
    fetch(`${API}/trades`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401 || res.status === 403) { handleLogout(); return }
        return res.json()
      })
      .then(data => {
        if (!Array.isArray(data)) return
        setTrades(data)
        setLoading(false)
      })
  }

  function handleAuth(e) {
    e.preventDefault()
    setAuthError('')
    fetch(`${API}/auth/${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) { setAuthError(data.error); return }
        localStorage.setItem('token', data.token)
        localStorage.setItem('user',  JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
      })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
    setTrades([])
  }

  function closeModal() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const url    = editingId ? `${API}/trades/${editingId}` : `${API}/trades`
    const method = editingId ? 'PUT' : 'POST'
    fetch(url, { method, headers: authHeaders(), body: JSON.stringify(form) })
      .then(() => { fetchTrades(); closeModal() })
  }

  function handleEdit(trade) {
    setEditingId(trade.id)
    setForm({
      symbol:      trade.symbol,
      direction:   trade.direction,
      quantity:    trade.quantity,
      entry_price: trade.entry_price,
      exit_price:  trade.exit_price,
      trade_date:  trade.trade_date?.slice(0, 10),
      notes:       trade.notes || '',
    })
    setShowForm(true)
  }

  function handleDelete(id) {
    fetch(`${API}/trades/${id}`, { method: 'DELETE', headers: authHeaders() })
      .then(() => fetchTrades())
  }

  if (!token) {
    return (
      <Auth
        authMode={authMode}
        authForm={authForm}
        authError={authError}
        onChange={e => setAuthForm({ ...authForm, [e.target.name]: e.target.value })}
        onSubmit={handleAuth}
        onToggleMode={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('') }}
      />
    )
  }

  return (
    <div className="app-wrapper">
      <header className="app-header">
        <div className="app-header__logo">
          <div className="app-header__logo-icon">L</div>
          Ledger
        </div>
        <nav className="tab-bar">
          <button
            className={`tab-btn${activeTab === 'trading' ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab('trading')}
          >
            Trading
          </button>
          <button
            className={`tab-btn${activeTab === 'gambling' ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab('gambling')}
          >
            Gambling
          </button>
          <button
            className={`tab-btn tab-btn--soon${activeTab === 'soon' ? ' tab-btn--active' : ''}`}
            onClick={() => setActiveTab('soon')}
          >
            •••
          </button>
        </nav>
        <div className="app-header__user">
          <span className="app-header__email">{user?.email}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {activeTab === 'trading' && (
        <>
          <div className="tab-actions">
            <button className="btn-add-trade" onClick={() => setShowForm(true)}>+ Add Trade</button>
          </div>
          <StatsPanel stats={calcStats(trades)} />
          <div className="card">
            <p className="section-label">Your Trades</p>
            <TradeTable
              trades={trades}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </>
      )}

      {activeTab === 'gambling' && (
        <div className="coming-soon-card">
          <p className="coming-soon-title">Gambling Tracker</p>
          <p className="coming-soon-sub">Coming soon</p>
        </div>
      )}

      {activeTab === 'soon' && (
        <div className="coming-soon-card">
          <p className="coming-soon-title">More tools</p>
          <p className="coming-soon-sub">Coming soon</p>
        </div>
      )}

      {showForm && (
        <Modal
          title={editingId ? 'Edit Trade' : 'New Trade'}
          onClose={closeModal}
        >
          <TradeForm
            form={form}
            editingId={editingId}
            onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  )
}
