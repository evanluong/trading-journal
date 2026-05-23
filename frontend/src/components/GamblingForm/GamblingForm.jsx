import { useState } from 'react'
import styles from './GamblingForm.module.css'

const GAME_OPTIONS = ['Blackjack', 'Roulette', 'Baccarat']

function today() {
  return new Date().toISOString().slice(0, 10)
}

function distribute(total, count) {
  if (!count) return ''
  const val = parseFloat(total)
  if (isNaN(val)) return ''
  return (val / count).toFixed(2)
}

export default function GamblingForm({ initialData, editingId, onSubmit, onCancel }) {
  const [sessionDate,    setSessionDate]    = useState(initialData?.session_date || '')
  const [overallStake,   setOverallStake]   = useState(() => {
    const games = initialData?.games || []
    if (!games.length) return ''
    return games.reduce((s, g) => s + parseFloat(g.stake || 0), 0).toFixed(2)
  })
  const [overallOutcome, setOverallOutcome] = useState(() => {
    const games = initialData?.games || []
    if (!games.length) return ''
    return games.reduce((s, g) => s + parseFloat(g.outcome || 0), 0).toFixed(2)
  })
  const [games, setGames] = useState(initialData?.games || [])
  const [notes, setNotes] = useState(initialData?.notes || '')

  function isChecked(gameType) {
    return games.some(g => g.type === gameType)
  }

  function redistributed(currentGames, stake, outcome) {
    const n = currentGames.length
    return currentGames.map(g => ({
      ...g,
      stake:   distribute(stake,   n),
      outcome: distribute(outcome, n),
    }))
  }

  function toggleGame(gameType) {
    const updated = isChecked(gameType)
      ? games.filter(g => g.type !== gameType)
      : [...games, { type: gameType, stake: '', outcome: '' }]
    setGames(redistributed(updated, overallStake, overallOutcome))
  }

  function handleOverallStake(value) {
    setOverallStake(value)
    setGames(redistributed(games, value, overallOutcome))
  }

  function handleOverallOutcome(value) {
    setOverallOutcome(value)
    setGames(redistributed(games, overallStake, value))
  }

  function updateGameField(gameType, field, value) {
    setGames(games.map(g => g.type === gameType ? { ...g, [field]: value } : g))
  }

  function handleSubmit(e) {
    e.preventDefault()
    onSubmit({ session_date: sessionDate, games, notes })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      <div className={styles.field}>
        <label>Date</label>
        <div className={styles.dateRow}>
          <input
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            required
          />
          <button type="button" className={styles.btnToday} onClick={() => setSessionDate(today())}>
            Today
          </button>
        </div>
      </div>

      <div className={styles.overallRow}>
        <div className={styles.field}>
          <label>Overall Stake ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={overallStake}
            onChange={e => handleOverallStake(e.target.value)}
          />
        </div>
        <div className={styles.field}>
          <label>Overall Outcome ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={overallOutcome}
            onChange={e => handleOverallOutcome(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label>Games Played</label>
        <div className={styles.checkboxes}>
          {GAME_OPTIONS.map(game => (
            <label key={game} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isChecked(game)}
                onChange={() => toggleGame(game)}
              />
              {game}
            </label>
          ))}
        </div>
      </div>

      {games.length > 0 && (
        <div className={styles.gameRows}>
          <div className={styles.gameRowsHeader}>
            <span>Game</span>
            <span>Stake ($)</span>
            <span>Outcome ($)</span>
          </div>
          {games.map(game => (
            <div key={game.type} className={styles.gameRow}>
              <span className={styles.gameRowName}>{game.type}</span>
              <input
                type="number"
                placeholder="0.00"
                value={game.stake}
                onChange={e => updateGameField(game.type, 'stake', e.target.value)}
              />
              <input
                type="number"
                placeholder="0.00"
                value={game.outcome}
                onChange={e => updateGameField(game.type, 'outcome', e.target.value)}
              />
            </div>
          ))}
        </div>
      )}

      <div className={styles.field}>
        <label>Notes</label>
        <input
          type="text"
          placeholder="Optional notes about this session"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.btnSubmit}>
          {editingId ? 'Update Session' : 'Add Session'}
        </button>
        {editingId && (
          <button type="button" className={styles.btnCancel} onClick={onCancel}>Cancel</button>
        )}
      </div>

    </form>
  )
}
