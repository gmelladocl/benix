import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const USERS_KEY = 'benix_users'
const SESSION_KEY = 'benix_session'

const DEFAULT_USERS = [
  {
    id: '1',
    username: 'gmellado',
    password: 'gmellado1988x',
    role: 'superadmin',
    displayName: 'Gonzalo Mellado',
    email: 'gonzalo@gmellado.cl',
    avatarColor: '#393A3A',
    createdAt: new Date().toISOString(),
  }
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const users = localStorage.getItem(USERS_KEY)
    if (!users) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
    }

    const session = localStorage.getItem(SESSION_KEY)
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    const found = users.find(u => u.username === username && u.password === password)
    if (found) {
      const { password: _p, ...safeUser } = found
      setUser(safeUser)
      localStorage.setItem(SESSION_KEY, JSON.stringify(safeUser))
      return { success: true }
    }
    return { success: false, error: 'Usuario o contraseña incorrectos' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }

  const getUsers = () => {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  }

  const addUser = (userData) => {
    const users = getUsers()
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    return newUser
  }

  const deleteUser = (userId) => {
    const users = getUsers()
    localStorage.setItem(USERS_KEY, JSON.stringify(users.filter(u => u.id !== userId)))
  }

  const updateProfile = (updates) => {
    const users = getUsers()
    const updated = users.map(u => u.id === user.id ? { ...u, ...updates } : u)
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    const newUser = { ...user, ...updates }
    setUser(newUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getUsers, addUser, deleteUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
