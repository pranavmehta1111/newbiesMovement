import { useState, useEffect } from 'react'
import PhoneLogin from './components/PhoneLogin'
import Onboarding from './components/Onboarding'
import Dashboard from './components/Dashboard'
import { getUserByPhone, createUser, isSupabaseConfigured, getCurrentMonthLabel } from './lib/supabase'
import './index.css'

const STORAGE_KEY = 'newbies_wellness_phone'

function App() {
  const [appState, setAppState] = useState('loading') // loading, login, onboarding, dashboard, setup
  const [phone, setPhone] = useState('')
  const [user, setUser] = useState(null)
  const [darkMode, setDarkMode] = useState(false)

  // Detect system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setDarkMode(mediaQuery.matches)

    const handler = (e) => setDarkMode(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  // Check for saved phone on mount
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAppState('setup')
      return
    }

    const savedPhone = localStorage.getItem(STORAGE_KEY)
    if (savedPhone) {
      setPhone(savedPhone)
      checkUser(savedPhone)
    } else {
      setAppState('login')
    }
  }, [])

  const checkUser = async (phoneNumber) => {
    try {
      const existingUser = await getUserByPhone(phoneNumber)
      if (existingUser) {
        setUser(existingUser)
        setAppState('dashboard')
      } else {
        setAppState('onboarding')
      }
    } catch (err) {
      console.error('Error checking user:', err)
      setAppState('login')
    }
  }

  const handleLogin = async (phoneNumber) => {
    localStorage.setItem(STORAGE_KEY, phoneNumber)
    setPhone(phoneNumber)
    await checkUser(phoneNumber)
  }

  const handleOnboardingComplete = async (userData) => {
    const newUser = await createUser({
      phone,
      name: userData.name,
      challenge_level: userData.challenge_level,
      opt_out_sugar: userData.opt_out_sugar,
    })
    setUser(newUser)
    setAppState('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setPhone('')
    setUser(null)
    setAppState('login')
  }

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  // Loading state
  if (appState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[color:var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    )
  }

  // Setup required state (Supabase not configured)
  if (appState === 'setup') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Toggle theme"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <div className="card w-full max-w-lg fade-in-up">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🌿</div>
            <h1 className="text-3xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                Newbies Wellness
              </span>
            </h1>
            <p className="text-[color:var(--text-secondary)] text-sm">{getCurrentMonthLabel()} • Health Challenge</p>
          </div>

          <div className="p-4 rounded-xl mb-6" style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            <h2 className="font-bold text-amber-600 dark:text-amber-400 mb-2">⚠️ Setup Required</h2>
            <p className="text-sm text-[color:var(--text-secondary)] mb-4">
              To use this app, you need to configure Supabase for the database.
            </p>

            <ol className="text-sm text-[color:var(--text-secondary)] space-y-3 list-decimal list-inside">
              <li>Go to <a href="https://supabase.com" target="_blank" rel="noopener" className="text-[color:var(--accent)] underline">supabase.com</a> and create a free project</li>
              <li>Run the SQL schema from <code className="px-1 py-0.5 rounded bg-[color:var(--bg-secondary)]">supabase-schema.sql</code> in the SQL Editor</li>
              <li>Copy your project URL and anon key from Settings → API</li>
              <li>Create a <code className="px-1 py-0.5 rounded bg-[color:var(--bg-secondary)]">.env</code> file with:
                <pre className="mt-2 p-3 rounded bg-[color:var(--bg-secondary)] overflow-x-auto text-xs">
                  {`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key`}
                </pre>
              </li>
              <li>Restart the dev server</li>
            </ol>
          </div>

          <div className="text-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              I've configured it, refresh! 🔄
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle"
        aria-label="Toggle theme"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* Main content based on state */}
      {appState === 'login' && (
        <PhoneLogin onLogin={handleLogin} />
      )}

      {appState === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {appState === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </>
  )
}

export default App
