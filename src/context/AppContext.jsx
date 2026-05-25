import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('benix_theme') || 'light')
  const [connections, setConnections] = useState(() => {
    try { return JSON.parse(localStorage.getItem('benix_connections') || '{}') } catch { return {} }
  })

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    localStorage.setItem('benix_theme', next)
    document.documentElement.setAttribute('data-theme', next === 'dark' ? 'dark' : '')
  }

  const saveConnection = (platform, data) => {
    const updated = { ...connections, [platform]: data }
    setConnections(updated)
    localStorage.setItem('benix_connections', JSON.stringify(updated))
  }

  const disconnectPlatform = (platform) => {
    const updated = { ...connections }
    delete updated[platform]
    setConnections(updated)
    localStorage.setItem('benix_connections', JSON.stringify(updated))
  }

  return (
    <AppContext.Provider value={{
      toasts, showToast,
      theme, toggleTheme,
      connections, saveConnection, disconnectPlatform,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
