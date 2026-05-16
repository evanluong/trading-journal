import './TradeTable.css'
import './GamblingTable.css'

function sessionTotals(session) {
  const games = session.games || []
  const stake   = games.reduce((s, g) => s + parseFloat(g.stake   || 0), 0)
  const outcome = games.reduce((s, g) => s + parseFloat(g.outcome || 0), 0)
  const pl      = outcome - stake
  return { stake, outcome, pl }
}

function resultLabel(pl) {
  if (pl > 0)  return 'Win'
  if (pl < 0)  return 'Loss'
  return 'Push'
}

export default function GamblingTable({ sessions, loading, onEdit, onDelete }) {
  if (loading) return <div className="loading-state">Loading sessions…</div>

  if (sessions.length === 0) {
    return <div className="empty-state">No sessions yet. Add your first session above.</div>
  }

  return (
    <div className="trade-table-wrap">
      <table className="trade-table">
        <thead>
          <tr>
            <th>Date</th>
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
            return (
              <tr key={session.id}>
                <td className="td-secondary">{session.session_date?.slice(0, 10)}</td>
                <td>
                  <div className="game-badge-list">
                    {(session.games || []).map(g => (
                      <span key={g.type} className="badge badge--game">{g.type}</span>
                    ))}
                  </div>
                </td>
                <td className="td-secondary">${stake.toFixed(2)}</td>
                <td className="td-secondary">${outcome.toFixed(2)}</td>
                <td className={plPositive ? 'pl--profit' : plZero ? '' : 'pl--loss'}>
                  {plPositive ? '+' : ''}${pl.toFixed(2)}
                </td>
                <td>
                  <span className={`badge badge--${result.toLowerCase()}`}>{result}</span>
                </td>
                <td className="td-secondary">{session.notes || '—'}</td>
                <td>
                  <div className="actions">
                    <button className="btn-edit"   onClick={() => onEdit(session)}>Edit</button>
                    <button className="btn-delete" onClick={() => onDelete(session.id)}>Delete</button>
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
