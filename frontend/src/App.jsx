import { useState } from 'react'
import './App.css'
import Auth          from './components/Auth/Auth'
import Header        from './components/Header/Header'
import TradingPage   from './pages/TradingPage/TradingPage'
import GamblingPage  from './pages/GamblingPage/GamblingPage'
import ComingSoonPage from './pages/ComingSoonPage/ComingSoonPage'

const API = 'http://localhost:3000'

export default function App() {
  const [token,     setToken]     = useState(localStorage.getItem('token'))
  const [user,      setUser]      = useState(JSON.parse(localStorage.getItem('user') || 'null'))
  const [authMode,  setAuthMode]  = useState('login')
  const [authForm,  setAuthForm]  = useState({ email: '', password: '' })
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('trading')

  function handleAuth(e) {
    e.preventDefault()
    setAuthError('')
    fetch(`${API}/auth/${authMode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(authForm),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) { setAuthError(data.error); return }
        localStorage.setItem('token', data.token)
        localStorage.setItem('user',  JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
      })
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }

  if (!token) {
    return (
      <Auth
        authMode={authMode}
        authForm={authForm}
        authError={authError}
        onChange={e => setAuthForm({ ...authForm, [e.target.name]: e.target.value })}
        onSubmit={handleAuth}
        onToggleMode={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError('') }}
      />
    )
  }

  return (
    <div className="app-wrapper">
      <Header
        user={user}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />
      {activeTab === 'trading'  && <TradingPage   token={token} onLogout={handleLogout} />}
      {activeTab === 'gambling' && <GamblingPage  token={token} onLogout={handleLogout} />}
      {activeTab === 'soon'     && <ComingSoonPage />}
    </div>
  )
}
