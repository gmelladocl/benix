import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/helpers'
import { BenixSidebarLogo } from '../UI/BenixLogo'
import './Sidebar.css'

const NAV_ITEMS = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/clients', icon: '◎', label: 'Clientes' },
  { to: '/calendar', icon: '▤', label: 'Calendario' },
  { to: '/accounting', icon: '◈', label: 'Contabilidad' },
  { to: '/mindmap', icon: '⬡', label: 'Mapa Mental' },
  { to: '/vault', icon: '⬢', label: 'Bóveda de Claves' },
  { to: '/content', icon: '✦', label: 'Creación' },
  { to: '/settings', icon: '◉', label: 'Ajustes' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <BenixSidebarLogo color="#EDEDE5" />
      </div>

      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: user?.avatarColor || '#393A3A' }}>
          {getInitials(user?.displayName || user?.username || 'U')}
        </div>
        <div className="user-info">
          <div className="user-name">{user?.displayName || user?.username}</div>
          <div className="user-role">
            {user?.role === 'superadmin' ? 'Super Admin' : user?.role}
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="btn-logout" onClick={handleLogout}>
          <span>⎋</span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
