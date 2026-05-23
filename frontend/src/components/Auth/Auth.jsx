import styles from './Auth.module.css'

export default function Auth({ authMode, authForm, authError, onChange, onSubmit, onToggleMode }) {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>L</div>
          Ledger
        </div>
        <p className={styles.subtitle}>Track your finances. Learn from every session.</p>

        <h2 className={styles.heading}>
          {authMode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>

        {authError && <div className={styles.error}>{authError}</div>}

        <div className={styles.field}>
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={authForm.email}
            onChange={onChange}
          />
        </div>

        <div className={styles.field}>
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={authForm.password}
            onChange={onChange}
          />
        </div>

        <button className={styles.btnPrimary} onClick={onSubmit}>
          {authMode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className={styles.toggle}>
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={onToggleMode}>
            {authMode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
