import { useState } from 'react'
import styles from './GamblingForm.module.css'

const GAME_OPTIONS = ['Blackjack', 'Roulette', 'Baccarat', 'Slots']

function today() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function toNum(v) {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

function distribute(total, count) {
  if (!count) return ''
  const val = parseFloat(total)
  if (isNaN(val)) return ''
  return (val / count).toFixed(2)
}

function pct(part, total) {
  if (!total || total === 0) return 0
  return ((part / total) * 100).toFixed(1)
}

// Carry-over: (overall_stake − sum_game_stakes) + sum_game_outcomes
function carryCalc(stake, currentGames, stakeField, outcomeField) {
  if (!currentGames.length) return ''
  const used     = currentGames.reduce((s, g) => s + toNum(g[stakeField]   || 0), 0)
  const returned = currentGames.reduce((s, g) => s + toNum(g[outcomeField] || 0), 0)
  return (toNum(stake) - used + returned).toFixed(2)
}

function fmtPL(val) {
  return (val >= 0 ? '+' : '') + val.toFixed(2)
}

export default function GamblingForm({ initialData, partnerMode, editingId, onSubmit, onCancel }) {
  const initPartner = initialData?.partner || {}
  const initGames   = initialData?.games   || []

  const [sessionDate, setSessionDate] = useState(initialData?.session_date || '')

  const [overallStake, setOverallStake] = useState(() => {
    if (!initGames.length) return ''
    return initGames.reduce((s, g) => s + toNum(g.stake), 0).toFixed(2)
  })
  const [overallOutcome, setOverallOutcome] = useState(() => {
    if (!initGames.length) return ''
    return initGames.reduce((s, g) => s + toNum(g.outcome), 0).toFixed(2)
  })

  const [games, setGames] = useState(initGames)
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [formError, setFormError] = useState('')

  const [partnerName,    setPartnerName]    = useState(initPartner.name            || '')
  const [myStake,        setMyStake]        = useState(initPartner.my_stake        ? String(initPartner.my_stake)        : '')
  const [partnerStake,   setPartnerStake]   = useState(initPartner.partner_stake   ? String(initPartner.partner_stake)   : '')
  const [myOutcome,      setMyOutcome]      = useState(initPartner.my_outcome      ? String(initPartner.my_outcome)      : '')
  const [partnerOutcome, setPartnerOutcome] = useState(initPartner.partner_outcome ? String(initPartner.partner_outcome) : '')

  // ── derived totals ────────────────────────────────────────────────────────

  const effectiveStake   = partnerMode
    ? (toNum(myStake) + toNum(partnerStake)).toFixed(2)
    : overallStake
  const effectiveOutcome = partnerMode
    ? (toNum(myOutcome) + toNum(partnerOutcome)).toFixed(2)
    : overallOutcome
  const effectiveProfits = (toNum(effectiveOutcome) - toNum(effectiveStake)).toFixed(2)

  // ── helpers ───────────────────────────────────────────────────────────────

  function isChecked(gameType) {
    return games.some(g => g.type === gameType)
  }

  function applyStakeDistribution(currentGames, stake) {
    const n = currentGames.length
    return currentGames.map(g => ({ ...g, stake: distribute(stake, n) }))
  }

  function applyPartnerStakeDistribution(currentGames, ms, ps) {
    const n = currentGames.length
    return currentGames.map(g => {
      const dms = distribute(ms, n)
      const dps = distribute(ps, n)
      return { ...g, my_stake: dms, partner_stake: dps, stake: (toNum(dms) + toNum(dps)).toFixed(2) }
    })
  }

  function toggleGame(gameType) {
    const updated = isChecked(gameType)
      ? games.filter(g => g.type !== gameType)
      : [...games, { type: gameType, stake: '', outcome: '', my_stake: '', my_outcome: '', partner_stake: '', partner_outcome: '' }]

    if (partnerMode) {
      const finalGames = applyPartnerStakeDistribution(updated, myStake, partnerStake)
      setGames(finalGames)
      setMyOutcome(carryCalc(myStake, finalGames, 'my_stake', 'my_outcome'))
      setPartnerOutcome(carryCalc(partnerStake, finalGames, 'partner_stake', 'partner_outcome'))
    } else {
      const finalGames = applyStakeDistribution(updated, overallStake)
      setGames(finalGames)
      setOverallOutcome(carryCalc(overallStake, finalGames, 'stake', 'outcome'))
    }
  }

  function handleOverallStake(value) {
    setOverallStake(value)
    const updated = applyStakeDistribution(games, value)
    setGames(updated)
    setOverallOutcome(carryCalc(value, updated, 'stake', 'outcome'))
  }

  function handleMyStake(value) {
    setMyStake(value)
    const updated = applyPartnerStakeDistribution(games, value, partnerStake)
    setGames(updated)
    setMyOutcome(carryCalc(value, updated, 'my_stake', 'my_outcome'))
  }

  function handlePartnerStake(value) {
    setPartnerStake(value)
    const updated = applyPartnerStakeDistribution(games, myStake, value)
    setGames(updated)
    setPartnerOutcome(carryCalc(value, updated, 'partner_stake', 'partner_outcome'))
  }

  function updateGameField(gameType, field, value) {
    const updatedGames = games.map(g => {
      if (g.type !== gameType) return g
      const updated = { ...g, [field]: value }
      if (partnerMode) {
        updated.stake   = (toNum(updated.my_stake)   + toNum(updated.partner_stake)).toFixed(2)
        updated.outcome = (toNum(updated.my_outcome) + toNum(updated.partner_outcome)).toFixed(2)
      }
      return updated
    })
    setGames(updatedGames)
    if (partnerMode) {
      setMyOutcome(carryCalc(myStake, updatedGames, 'my_stake', 'my_outcome'))
      setPartnerOutcome(carryCalc(partnerStake, updatedGames, 'partner_stake', 'partner_outcome'))
    } else {
      setOverallOutcome(carryCalc(overallStake, updatedGames, 'stake', 'outcome'))
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (games.length === 0) { setFormError('Please select at least one game.'); return }
    if (!toNum(effectiveStake)) { setFormError('Please enter a stake amount.'); return }
    setFormError('')
    onSubmit({
      session_date: sessionDate,
      games,
      notes,
      partner: partnerMode ? {
        name:            partnerName,
        my_stake:        myStake,
        my_outcome:      myOutcome,
        partner_stake:   partnerStake,
        partner_outcome: partnerOutcome,
      } : null,
    })
  }

  // ── profit split ──────────────────────────────────────────────────────────
  const totalStake       = toNum(effectiveStake)
  const myPct            = pct(toNum(myStake),      totalStake)
  const partPct          = pct(toNum(partnerStake), totalStake)
  // net earnings per player across all games (outcome − stake per game, summed)
  const myGameEarnings   = games.reduce((s, g) => s + toNum(g.my_outcome || 0) - toNum(g.my_stake || 0), 0)
  const partGameEarnings = games.reduce((s, g) => s + toNum(g.partner_outcome || 0) - toNum(g.partner_stake || 0), 0)
  // total raw money returned from all games — basis for proportional return split
  // (using game-level values avoids carryCalc divergence when a player over-stakes)
  const totalReturned    = games.reduce((s, g) => s + toNum(g.my_outcome || 0) + toNum(g.partner_outcome || 0), 0)
  const myReturn         = totalStake > 0 ? (toNum(myStake)      / totalStake) * totalReturned : 0
  const partReturn       = totalStake > 0 ? (toNum(partnerStake) / totalStake) * totalReturned : 0
  const showSplit        = partnerMode && (toNum(myStake) > 0 || toNum(partnerStake) > 0)

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className={styles.form}>

      {/* Date */}
      <div className={styles.field}>
        <label>Date</label>
        <div className={styles.dateRow}>
          <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required />
          <button type="button" className={styles.btnToday} onClick={() => setSessionDate(today())}>Today</button>
        </div>
      </div>

      {/* Partner name */}
      {partnerMode && (
        <div className={styles.field}>
          <label>Partner Name</label>
          <input type="text" placeholder="e.g. Alex" value={partnerName} onChange={e => setPartnerName(e.target.value)} />
        </div>
      )}

      {/* Solo: stake input only */}
      {!partnerMode && (
        <div className={styles.field}>
          <label>Overall Stake ($)</label>
          <input type="number" placeholder="0.00" value={overallStake}
            onChange={e => handleOverallStake(e.target.value)} />
        </div>
      )}

      {/* Partner: split grid with stake + outcome inputs */}
      {partnerMode && (
        <div className={styles.splitGrid}>
          <div className={styles.splitCol}>
            <p className={styles.splitColHeader}>You</p>
            <div className={styles.field}>
              <label>My Stake ($)</label>
              <input type="number" placeholder="0.00" value={myStake}
                onChange={e => handleMyStake(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>My Outcome ($)</label>
              <input type="number" placeholder="auto" value={myOutcome}
                onChange={e => setMyOutcome(e.target.value)} />
            </div>
          </div>
          <div className={styles.splitDivider} />
          <div className={styles.splitCol}>
            <p className={styles.splitColHeader}>{partnerName || 'Partner'}</p>
            <div className={styles.field}>
              <label>Partner Stake ($)</label>
              <input type="number" placeholder="0.00" value={partnerStake}
                onChange={e => handlePartnerStake(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Partner Outcome ($)</label>
              <input type="number" placeholder="auto" value={partnerOutcome}
                onChange={e => setPartnerOutcome(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Partner: overall calc banner (stake + outcome + profits) */}
      {partnerMode && (
        <div className={styles.overallCalc}>
          <div className={styles.overallCalcItem}>
            <span className={styles.overallCalcLabel}>Overall Stake</span>
            <span className={styles.overallCalcValue}>${effectiveStake}</span>
          </div>
          <div className={styles.overallCalcItem}>
            <span className={styles.overallCalcLabel}>Overall Outcome</span>
            <span className={styles.overallCalcValue}>${effectiveOutcome}</span>
          </div>
          <div className={styles.overallCalcItem}>
            <span className={styles.overallCalcLabel}>Profits</span>
            <span className={`${styles.overallCalcValue} ${toNum(effectiveProfits) >= 0 ? styles.profit : styles.loss}`}>
              {fmtPL(toNum(effectiveProfits))}
            </span>
          </div>
        </div>
      )}

      {/* Games */}
      <div className={styles.field}>
        <label>Games Played</label>
        <div className={styles.checkboxes}>
          {GAME_OPTIONS.map(game => (
            <label key={game} className={styles.checkboxLabel}>
              <input type="checkbox" checked={isChecked(game)} onChange={() => toggleGame(game)} />
              {game}
            </label>
          ))}
        </div>
      </div>

      {games.length > 0 && (
        <div className={styles.gameRows}>
          <div className={`${styles.gameRowsHeader} ${partnerMode ? styles.gameRowsHeaderPartner : ''}`}>
            <span>Game</span>
            {partnerMode ? (
              <>
                <span>My Stake</span>
                <span>My Outcome</span>
                <span>{partnerName || 'Partner'} Stake</span>
                <span>{partnerName || 'Partner'} Outcome</span>
                <span>Earnings</span>
              </>
            ) : (
              <>
                <span>Stake ($)</span>
                <span>Outcome ($)</span>
                <span>Earnings</span>
              </>
            )}
          </div>
          {games.map(game => {
            const gameEarnings = toNum(game.outcome) - toNum(game.stake)
            return (
              <div key={game.type} className={`${styles.gameRow} ${partnerMode ? styles.gameRowPartner : ''}`}>
                <span className={styles.gameRowName}>{game.type}</span>
                {partnerMode ? (
                  <>
                    <input type="number" placeholder="0.00" value={game.my_stake || ''}
                      onChange={e => updateGameField(game.type, 'my_stake', e.target.value)} />
                    <input type="number" placeholder="0.00" value={game.my_outcome || ''}
                      onChange={e => updateGameField(game.type, 'my_outcome', e.target.value)} />
                    <input type="number" placeholder="0.00" value={game.partner_stake || ''}
                      onChange={e => updateGameField(game.type, 'partner_stake', e.target.value)} />
                    <input type="number" placeholder="0.00" value={game.partner_outcome || ''}
                      onChange={e => updateGameField(game.type, 'partner_outcome', e.target.value)} />
                  </>
                ) : (
                  <>
                    <input type="number" placeholder="0.00" value={game.stake}
                      onChange={e => updateGameField(game.type, 'stake', e.target.value)} />
                    <input type="number" placeholder="0.00" value={game.outcome}
                      onChange={e => updateGameField(game.type, 'outcome', e.target.value)} />
                  </>
                )}
                <span className={`${styles.gameEarnings} ${gameEarnings >= 0 ? styles.earningsProfit : styles.earningsLoss}`}>
                  {fmtPL(gameEarnings)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Profit split */}
      {showSplit && (
        <div className={styles.profitSplit}>
          <p className={styles.profitSplitTitle}>Profit Split</p>
          <div className={styles.profitSplitGrid}>
            <div className={styles.profitCard}>
              <p className={styles.profitCardName}>You <span className={styles.profitPct}>{myPct}%</span></p>
              <p className={styles.profitRow}><span>Staked</span><span>${toNum(myStake).toFixed(2)}</span></p>
              <p className={styles.profitRow}>
                <span>Outcome</span>
                <span className={myGameEarnings >= 0 ? styles.profit : styles.loss}>
                  {fmtPL(myGameEarnings)}
                </span>
              </p>
              <p className={styles.profitRow}>
                <span>Return</span>
                <span className={myReturn >= toNum(myStake) ? styles.profit : styles.loss}>
                  ${myReturn.toFixed(2)}
                </span>
              </p>
            </div>
            <div className={styles.profitCard}>
              <p className={styles.profitCardName}>{partnerName || 'Partner'} <span className={styles.profitPct}>{partPct}%</span></p>
              <p className={styles.profitRow}><span>Staked</span><span>${toNum(partnerStake).toFixed(2)}</span></p>
              <p className={styles.profitRow}>
                <span>Outcome</span>
                <span className={partGameEarnings >= 0 ? styles.profit : styles.loss}>
                  {fmtPL(partGameEarnings)}
                </span>
              </p>
              <p className={styles.profitRow}>
                <span>Return</span>
                <span className={partReturn >= toNum(partnerStake) ? styles.profit : styles.loss}>
                  ${partReturn.toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Solo: outcome + profits row (bottom, above notes) */}
      {!partnerMode && (
        <div className={styles.bottomRow}>
          <div className={styles.field}>
            <label>Overall Outcome ($)</label>
            <input type="number" placeholder="auto" value={overallOutcome}
              onChange={e => setOverallOutcome(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label>Profits</label>
            <div className={`${styles.profitsDisplay} ${toNum(effectiveProfits) >= 0 ? styles.profit : styles.loss}`}>
              {fmtPL(toNum(effectiveProfits))}
            </div>
          </div>
        </div>
      )}

      {/* Notes */}
      <div className={styles.field}>
        <label>Notes</label>
        <input type="text" placeholder="Optional notes about this session"
          value={notes} onChange={e => setNotes(e.target.value)} />
      </div>

      {formError && <p className={styles.formError}>{formError}</p>}

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
