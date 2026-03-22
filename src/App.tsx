import { useState, useEffect } from 'react'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'

function App() {
  const [page, setPage] = useState<'landing' | 'dashboard'>(
    window.location.hash === '#/dashboard' ? 'dashboard' : 'landing'
  )

  useEffect(() => {
    const handler = () => {
      setPage(window.location.hash === '#/dashboard' ? 'dashboard' : 'landing')
    }
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  const goToDashboard = () => {
    window.location.hash = '#/dashboard'
  }

  const goToLanding = () => {
    window.location.hash = ''
  }

  if (page === 'dashboard') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>
        <Dashboard onBack={goToLanding} />
      </div>
    )
  }

  return <LandingPage onLaunch={goToDashboard} />
}

export default App