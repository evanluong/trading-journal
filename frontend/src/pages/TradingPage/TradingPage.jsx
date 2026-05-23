import { useState, useEffect } from 'react'
import styles          from './TradingPage.module.css'
import Modal           from '../../components/Modal/Modal'
import StatsPanel      from '../../components/StatsPanel/StatsPanel'
import TradeForm       from '../../components/TradeForm/TradeForm'
import TradeTable      from '../../components/TradeTable/TradeTable'

const API        = 'http://localhost:3000'
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
    totalPL: totalPL.toFixed(2),
    winRate: ((wins / trades.length) * 100).toFixed(0),
    count:   trades.length,
    best:    Math.max(...pls).toFixed(2),
  }
}

export default function TradingPage({ token, onLogout }) {
  const [trades,    setTrades]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form,      setForm]      = useState(EMPTY_FORM)

  useEffect(() => { fetchTrades() }, [])

  function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  function fetchTrades() {
    fetch(`${API}/trades`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401 || res.status === 403) { onLogout(); return }
        return res.json()
      })
      .then(data => {
        if (!Array.isArray(data)) return
        setTrades(data)
        setLoading(false)
      })
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

  return (
    <div>
      <div className={styles.actions}>
        <button className={styles.btnAdd} onClick={() => setShowForm(true)}>+ Add Trade</button>
      </div>

      <StatsPanel stats={calcStats(trades)} />

      <div className={styles.card}>
        <p className={styles.sectionLabel}>Your Trades</p>
        <TradeTable
          trades={trades}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {showForm && (
        <Modal title={editingId ? 'Edit Trade' : 'New Trade'} onClose={closeModal}>
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
