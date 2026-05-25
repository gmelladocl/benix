import { useApp } from '../../context/AppContext'
import { formatNumber } from '../../utils/helpers'
import './Widget.css'

export default function TikTokWidget() {
  const { connections } = useApp()
  const connected = !!connections?.tiktok

  const stats = [
    { label: 'Posts', value: formatNumber(89) },
    { label: 'Seguidores', value: formatNumber(4230) },
    { label: 'Seguidos', value: formatNumber(312) },
  ]

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title-row">
          <div className="widget-icon tiktok-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.05a8.25 8.25 0 004.85 1.56V7.18a4.85 4.85 0 01-1.08-.49z"/>
            </svg>
          </div>
          <div>
            <div className="widget-title">TikTok</div>
            {!connected && <span className="badge badge-gray" style={{fontSize:'11px'}}>No conectado</span>}
            {connected && <span className="badge badge-green" style={{fontSize:'11px'}}>● Conectado</span>}
          </div>
        </div>
      </div>

      {connected ? (
        <div className="widget-stats">
          {stats.map(s => (
            <div className="stat-item" key={s.label}>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="widget-disconnected">
          <p>Conecta tu cuenta de TikTok para ver las estadísticas de tu perfil.</p>
          <a href="/settings" className="btn btn-sm btn-secondary" style={{marginTop:'8px', display:'inline-flex', textDecoration:'none'}}>
            Conectar cuenta →
          </a>
        </div>
      )}
    </div>
  )
}
