import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BenixIcon } from '../components/UI/BenixLogo'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Completa todos los campos')
      triggerShake()
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    const result = login(form.username, form.password)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
      triggerShake()
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-grid" />
        <div className="login-bg-glow" />
      </div>

      <div className={`login-card ${shake ? 'shake' : ''}`}>
        <div className="login-brand">
          <div className="login-logo-wrap">
            <BenixIcon size={64} color="#EDEDE5" />
            <div className="login-logo">Benix</div>
          </div>
          <div className="login-tagline">Sistema de Gestión</div>
          <div className="login-version">Versión 0.01</div>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(237,237,229,0.55)' }}>
              Usuario
            </label>
            <input
              className="login-input"
              type="text"
              placeholder="Ingresa tu usuario"
              value={form.username}
              onChange={e => {
                setForm(f => ({ ...f, username: e.target.value }))
                setError('')
              }}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'rgba(237,237,229,0.55)' }}>
              Contraseña
            </label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••••••"
              value={form.password}
              onChange={e => {
                setForm(f => ({ ...f, password: e.target.value }))
                setError('')
              }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="login-spinner" />
            ) : (
              'Ingresar'
            )}
          </button>
        </form>

        <div className="login-footer">
          by <span>gmellado.cl</span>
        </div>
      </div>
    </div>
  )
}
