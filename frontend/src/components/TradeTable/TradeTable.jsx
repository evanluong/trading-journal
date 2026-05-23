import styles from './TradeTable.module.css'

function calculatePL(trade) {
  const entry = parseFloat(trade.entry_price)
  const exit  = parseFloat(trade.exit_price)
  const qty   = parseFloat(trade.quantity) || 1
  return trade.direction === 'SHORT'
    ? ((entry - exit) * qty).toFixed(2)
    : ((exit  - entry) * qty).toFixed(2)
}

export default function TradeTable({ trades, loading, onEdit, onDelete }) {
  if (loading) return <div className={styles.loadingState}>Loading trades…</div>

  if (trades.length === 0) {
    return <div className={styles.emptyState}>No trades yet. Add your first trade above.</div>
  }

  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
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
                <td><span className={styles.symbol}>{trade.symbol}</span></td>
                <td>
                  <span className={`${styles.badge} ${trade.direction === 'LONG' ? styles.badgeLong : styles.badgeShort}`}>
                    {trade.direction}
                  </span>
                </td>
                <td className={styles.tdSecondary}>{trade.quantity}</td>
                <td className={styles.tdSecondary}>${trade.entry_price}</td>
                <td className={styles.tdSecondary}>${trade.exit_price}</td>
                <td className={plPositive ? styles.plProfit : styles.plLoss}>
                  {plPositive ? '+' : ''}${pl}
                </td>
                <td className={styles.tdSecondary}>{trade.trade_date?.slice(0, 10)}</td>
                <td className={styles.tdSecondary}>{trade.notes || '—'}</td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnEdit}   onClick={() => onEdit(trade)}>Edit</button>
                    <button className={styles.btnDelete} onClick={() => onDelete(trade.id)}>Delete</button>
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
