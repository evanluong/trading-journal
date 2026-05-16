import { useState } from 'react'
import './GamblingForm.css'

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
  const [sessionDate,   setSessionDate]   = useState(initialData?.session_date || '')
  const [overallStake,  setOverallStake]  = useState(() => {
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
    let updated
    if (isChecked(gameType)) {
      updated = games.filter(g => g.type !== gameType)
    } else {
      updated = [...games, { type: gameType, stake: '', outcome: '' }]
    }
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
    <form onSubmit={handleSubmit} className="gambling-form">

      <div className="form-field">
        <label>Date</label>
        <div className="date-row">
          <input
            type="date"
            value={sessionDate}
            onChange={e => setSessionDate(e.target.value)}
            required
          />
          <button type="button" className="btn-today" onClick={() => setSessionDate(today())}>
            Today
          </button>
        </div>
      </div>

      <div className="overall-row">
        <div className="form-field">
          <label>Overall Stake ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={overallStake}
            onChange={e => handleOverallStake(e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Overall Outcome ($)</label>
          <input
            type="number"
            placeholder="0.00"
            value={overallOutcome}
            onChange={e => handleOverallOutcome(e.target.value)}
          />
        </div>
      </div>

      <div className="form-field">
        <label>Games Played</label>
        <div className="game-checkboxes">
          {GAME_OPTIONS.map(game => (
            <label key={game} className="game-checkbox-label">
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
        <div className="game-rows">
          <div className="game-rows__header">
            <span>Game</span>
            <span>Stake ($)</span>
            <span>Outcome ($)</span>
          </div>
          {games.map(game => (
            <div key={game.type} className="game-row">
              <span className="game-row__name">{game.type}</span>
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

      <div className="form-field">
        <label>Notes</label>
        <input
          type="text"
          placeholder="Optional notes about this session"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      <div className="gambling-form__actions">
        <button type="submit" className="btn-submit">
          {editingId ? 'Update Session' : 'Add Session'}
        </button>
        {editingId && (
          <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        )}
      </div>

    </form>
  )
}
