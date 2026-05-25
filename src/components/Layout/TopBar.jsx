import { useAuth } from '../../context/AuthContext'
import { getGreeting } from '../../utils/helpers'
import './TopBar.css'

export default function TopBar() {
  const { user } = useAuth()

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-greeting">
          {getGreeting()}, <span>{user?.displayName?.split(' ')[0] || user?.username}</span>
        </h1>
        <p className="topbar-date">{dateStr}</p>
      </div>
    </header>
  )
}
