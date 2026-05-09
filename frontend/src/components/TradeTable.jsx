import './TradeTable.css'

function calculatePL(trade) {
  const entry = parseFloat(trade.entry_price)
  const exit  = parseFloat(trade.exit_price)
  const qty   = parseFloat(trade.quantity) || 1
  return trade.direction === 'SHORT'
    ? ((entry - exit) * qty).toFixed(2)
    : ((exit  - entry) * qty).toFixed(2)
}

export default function TradeTable({ trades, loading, onEdit, onDelete }) {
  if (loading) return <div className="loading-state">Loading trades…</div>

  if (trades.length === 0) {
    return <div className="empty-state">No trades yet. Add your first trade above.</div>
  }

  return (
    <div className="trade-table-wrap">
      <table className="trade-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Direction</th>
            <th>Qty</th>
            <th>Entry</th>
            <th>Exit</th>
            <th>P/L</th>
            <th>Date</th>
            <th>Notes</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {trades.map(trade => {
            const pl         = calculatePL(trade)
            const plPositive = parseFloat(pl) >= 0
            return (
              <tr key={trade.id}>
                <td><span className="symbol">{trade.symbol}</span></td>
                <td>
                  <span className={`badge badge--${trade.direction === 'LONG' ? 'long' : 'short'}`}>
                    {trade.direction}
                  </span>
                </td>
                <td className="td-secondary">{trade.quantity}</td>
                <td className="td-secondary">${trade.entry_price}</td>
                <td className="td-secondary">${trade.exit_price}</td>
                <td className={plPositive ? 'pl--profit' : 'pl--loss'}>
                  {plPositive ? '+' : ''}${pl}
                </td>
                <td className="td-secondary">{trade.trade_date?.slice(0, 10)}</td>
                <td className="td-secondary">{trade.notes || '—'}</td>
                <td>
                  <div className="actions">
                    <button className="btn-edit"   onClick={() => onEdit(trade)}>Edit</button>
                    <button className="btn-delete" onClick={() => onDelete(trade.id)}>Delete</button>
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
