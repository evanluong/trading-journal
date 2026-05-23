import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './GamblingTable.module.css'

function sessionTotals(session) {
  const games   = session.games || []
  const stake   = games.reduce((s, g) => s + parseFloat(g.stake   || 0), 0)
  const outcome = games.reduce((s, g) => s + parseFloat(g.outcome || 0), 0)
  const pl      = outcome - stake
  return { stake, outcome, pl }
}

function resultLabel(pl) {
  if (pl > 0) return 'Win'
  if (pl < 0) return 'Loss'
  return 'Push'
}

export default function GamblingTable({ sessions, loading, onEdit, onDelete }) {
  const [expandedStake, setExpandedStake] = useState(null)
  const [dropPos,       setDropPos]       = useState({ top: 0, left: 0 })

  function handleStakeClick(sessionId, e) {
    e.stopPropagation()
    if (expandedStake === sessionId) {
      setExpandedStake(null)
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setDropPos({ top: rect.bottom + 6, left: rect.left })
    setExpandedStake(sessionId)
  }

  useEffect(() => {
    if (!expandedStake) return
    function close() { setExpandedStake(null) }
    document.addEventListener('click', close)
    document.addEventListener('scroll', close, true)
    return () => {
      document.removeEventListener('click', close)
      document.removeEventListener('scroll', close, true)
    }
  }, [expandedStake])

  if (loading) return <div className={styles.loadingState}>Loading sessions…</div>
  if (sessions.length === 0) {
    return <div className={styles.emptyState}>No sessions yet. Add your first session above.</div>
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Mode</th>
            <th>Games</th>
            <th>Stake</th>
            <th>Outcome</th>
            <th>P/L</th>
            <th>Result</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => {
            const { stake, outcome, pl } = sessionTotals(session)
            const plPositive = pl > 0
            const plZero     = pl === 0
            const result     = resultLabel(pl)
            const hasPartner = !!session.partner
            const stakeOpen  = expandedStake === session.id

            return (
              <tr key={session.id}>
                <td className={styles.tdSecondary}>{session.session_date?.slice(0, 10)}</td>
                <td>
                  {hasPartner
                    ? <span className={`${styles.badge} ${styles.badgePartner}`}>👥 {session.partner.name || 'Partner'}</span>
                    : <span className={`${styles.badge} ${styles.badgeSolo}`}>Solo</span>
                  }
                </td>
                <td>
                  <div className={styles.badgeList}>
                    {(session.games || []).map(g => (
                      <span key={g.type} className={`${styles.badge} ${styles.badgeGame}`}>{g.type}</span>
                    ))}
                  </div>
                </td>
                <td>
                  {hasPartner ? (
                    <button
                      className={`${styles.stakeAmount} ${stakeOpen ? styles.stakeAmountOpen : ''}`}
                      onClick={e => handleStakeClick(session.id, e)}
                    >
                      ${stake.toFixed(2)}
                    </button>
                  ) : (
                    <span className={styles.tdSecondary}>${stake.toFixed(2)}</span>
                  )}

                  {hasPartner && stakeOpen && createPortal(
                    <div className={styles.stakeBreakdown} style={{ top: dropPos.top, left: dropPos.left }}>
                      <div className={styles.stakeRow}>
                        <span>You</span>
                        <span>${parseFloat(session.partner.my_stake || 0).toFixed(2)}</span>
                      </div>
                      <div className={styles.stakeRow}>
                        <span>{session.partner.name || 'Partner'}</span>
                        <span>${parseFloat(session.partner.partner_stake || 0).toFixed(2)}</span>
                      </div>
                    </div>,
                    document.body
                  )}
                </td>
                <td className={styles.tdSecondary}>${outcome.toFixed(2)}</td>
                <td className={plPositive ? styles.plProfit : plZero ? '' : styles.plLoss}>
                  {plPositive ? '+' : ''}${pl.toFixed(2)}
                </td>
                <td>
                  <span className={`${styles.badge} ${styles['badge' + result]}`}>{result}</span>
                </td>
                <td className={styles.tdSecondary}>{session.notes || '—'}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit}   onClick={() => onEdit(session)}>Edit</button>
                    <button className={styles.btnDelete} onClick={() => onDelete(session.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
