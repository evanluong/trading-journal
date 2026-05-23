import styles from './Header.module.css'

const TABS = [
  { id: 'trading',  label: 'Trading' },
  { id: 'gambling', label: 'Gambling' },
  { id: 'soon',     label: '•••' },
]

export default function Header({ user, activeTab, onTabChange, onLogout }) {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>L</div>
        Ledger
      </div>

      <nav className={styles.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''} ${tab.id === 'soon' ? styles.tabSoon : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className={styles.user}>
        <span className={styles.email}>{user?.email}</span>
        <button className={styles.btnLogout} onClick={onLogout}>Logout</button>
      </div>
    </header>
  )
}
