import './StatsPanel.css'

function StatCard({ label, value, tone }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className={`stat-card__value stat-card__value--${tone}`}>{value}</div>
    </div>
  )
}

export default function StatsPanel({ stats }) {
  if (!stats) return null

  const plPositive = parseFloat(stats.totalPL) >= 0

  return (
    <div className="stats-panel">
      <StatCard
        label="Total P/L"
        value={`${plPositive ? '+' : ''}$${stats.totalPL}`}
        tone={plPositive ? 'profit' : 'loss'}
      />
      <StatCard
        label="Win Rate"
        value={`${stats.winRate}%`}
        tone={parseFloat(stats.winRate) >= 50 ? 'profit' : 'loss'}
      />
      <StatCard
        label="Best Trade"
        value={`+$${stats.best}`}
        tone="profit"
      />
      <StatCard
        label="Total Trades"
        value={stats.count}
        tone="neutral"
      />
    </div>
  )
}
