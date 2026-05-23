import { useState, useEffect } from 'react'
import styles              from './GamblingPage.module.css'
import Modal               from '../../components/Modal/Modal'
import GamblingStatsPanel  from '../../components/GamblingStatsPanel/GamblingStatsPanel'
import GamblingForm        from '../../components/GamblingForm/GamblingForm'
import GamblingTable       from '../../components/GamblingTable/GamblingTable'

const API            = 'http://localhost:3000'
const EMPTY_SESSION  = { session_date: '', games: [], notes: '' }

function calcGamblingStats(sessions) {
  if (sessions.length === 0) return null
  const pls = sessions.map(s =>
    (s.games || []).reduce((sum, g) => sum + (parseFloat(g.outcome || 0) - parseFloat(g.stake || 0)), 0)
  )
  const totalPL = pls.reduce((a, b) => a + b, 0)
  const wins    = pls.filter(pl => pl > 0).length
  return {
    totalPL: totalPL.toFixed(2),
    winRate: ((wins / sessions.length) * 100).toFixed(0),
    count:   sessions.length,
    best:    Math.max(...pls).toFixed(2),
  }
}

export default function GamblingPage({ token, onLogout }) {
  const [sessions,         setSessions]         = useState([])
  const [loading,          setLoading]          = useState(true)
  const [showForm,         setShowForm]         = useState(false)
  const [editingId,        setEditingId]        = useState(null)
  const [sessionInitData,  setSessionInitData]  = useState(EMPTY_SESSION)

  useEffect(() => { fetchSessions() }, [])

  function authHeaders() {
    return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
  }

  function fetchSessions() {
    fetch(`${API}/gambling-sessions`, { headers: authHeaders() })
      .then(res => {
        if (res.status === 401 || res.status === 403) { onLogout(); return }
        return res.json()
      })
      .then(data => {
        if (!Array.isArray(data)) return
        setSessions(data)
        setLoading(false)
      })
  }

  function closeModal() {
    setShowForm(false)
    setEditingId(null)
    setSessionInitData(EMPTY_SESSION)
  }

  function handleSubmit(data) {
    const url    = editingId ? `${API}/gambling-sessions/${editingId}` : `${API}/gambling-sessions`
    const method = editingId ? 'PUT' : 'POST'
    fetch(url, { method, headers: authHeaders(), body: JSON.stringify(data) })
      .then(() => { fetchSessions(); closeModal() })
  }

  function handleEdit(session) {
    setEditingId(session.id)
    setSessionInitData({
      session_date: session.session_date?.slice(0, 10) || '',
      games:        session.games || [],
      notes:        session.notes || '',
    })
    setShowForm(true)
  }

  function handleDelete(id) {
    fetch(`${API}/gambling-sessions/${id}`, { method: 'DELETE', headers: authHeaders() })
      .then(() => fetchSessions())
  }

  return (
    <div>
      <div className={styles.actions}>
        <button className={styles.btnAdd} onClick={() => setShowForm(true)}>+ Add Session</button>
      </div>

      <GamblingStatsPanel stats={calcGamblingStats(sessions)} />

      <div className={styles.card}>
        <p className={styles.sectionLabel}>Your Sessions</p>
        <GamblingTable
          sessions={sessions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {showForm && (
        <Modal title={editingId ? 'Edit Session' : 'New Session'} onClose={closeModal}>
          <GamblingForm
            key={editingId || 'new'}
            initialData={sessionInitData}
            editingId={editingId}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </Modal>
      )}
    </div>
  )
}
