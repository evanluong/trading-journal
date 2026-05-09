import './Auth.css'

export default function Auth({ authMode, authForm, authError, onChange, onSubmit, onToggleMode }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__logo">
          <div className="auth-card__logo-icon">T</div>
          TradingJournal
        </div>
        <p className="auth-card__subtitle">Track your trades. Learn from every position.</p>

        <h2 className="auth-card__heading">
          {authMode === 'login' ? 'Welcome back' : 'Create an account'}
        </h2>

        {authError && <div className="auth-error">{authError}</div>}

        <div className="auth-field">
          <label>Email</label>
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={authForm.email}
            onChange={onChange}
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={authForm.password}
            onChange={onChange}
          />
        </div>

        <button className="btn-primary" onClick={onSubmit}>
          {authMode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="auth-toggle">
          {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={onToggleMode}>
            {authMode === 'login' ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
