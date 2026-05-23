import styles from './Header.module.css'

const PAGE_TITLES = {
  trading:  'Trading Dashboard',
  gambling: 'Gambling Dashboard',
  soon:     'Sport Betting',
}

export default function Header({ activeTab, onMenuClick }) {
  return (
    <header className={styles.header}>
      <button className={styles.logoBtn} onClick={onMenuClick}>
        <div className={styles.logoIcon}>L</div>
        <span className={styles.logoText}>Ledger</span>
      </button>

      <h1 className={styles.pageTitle}>{PAGE_TITLES[activeTab]}</h1>
    </header>
  )
}
