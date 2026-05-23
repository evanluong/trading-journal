import styles from './Sidebar.module.css'

const TABS = [
  { id: 'trading',  label: 'Trading' },
  { id: 'gambling', label: 'Gambling' },
  { id: 'soon',     label: 'Sport Betting' },
]

export default function Sidebar({ open, user, activeTab, onTabChange, onLogout, onClose }) {
  function handleTabClick(id) {
    onTabChange(id)
    onClose()
  }

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${open ? styles.open : ''}`}>

        <div className={styles.profile}>
          <div className={styles.avatar}>
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileLabel}>Signed in as</span>
            <span className={styles.profileEmail}>{user?.email}</span>
          </div>
        </div>

        <div className={styles.divider} />

        <nav className={styles.nav}>
          <p className={styles.navLabel}>Pages</p>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.navBtn} ${activeTab === tab.id ? styles.navBtnActive : ''}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.footer}>
          <button className={styles.btnLogout} onClick={onLogout}>Logout</button>
        </div>

      </aside>
    </>
  )
}
