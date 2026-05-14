import { useState, useEffect } from 'react'
import { Spinner } from '@fluentui/react-components'
import LoginPage from './pages/LoginPage'
import ConfigPage from './pages/ConfigPage'
import { api } from './api'

function App() {
  const [username, setUsername] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    api.session()
      .then(s => setUsername(s.username))
      .catch(() => setUsername(null))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spinner size="large" />
      </div>
    )
  }

  if (!username) {
    return <LoginPage onLogin={setUsername} />
  }

  return <ConfigPage username={username} onLogout={() => setUsername(null)} />
}

export default App
