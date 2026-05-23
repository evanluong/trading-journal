import styles from './StatsPanel.module.css'

function StatCard({ label, value, tone }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={`${styles.value} ${styles[tone]}`}>{value}</div>
    </div>
  )
}

export default function StatsPanel({ stats }) {
  if (!stats) return null

  const plPositive = parseFloat(stats.totalPL) >= 0

  return (
    <div className={styles.panel}>
      <StatCard label="Total P/L"     value={`${plPositive ? '+' : ''}$${stats.totalPL}`} tone={plPositive ? 'profit' : 'loss'} />
      <StatCard label="Win Rate"      value={`${stats.winRate}%`}                          tone={parseFloat(stats.winRate) >= 50 ? 'profit' : 'loss'} />
      <StatCard label="Best Trade"    value={`+$${stats.best}`}                            tone="profit" />
      <StatCard label="Total Trades"  value={stats.count}                                  tone="neutral" />
    </div>
  )
}
