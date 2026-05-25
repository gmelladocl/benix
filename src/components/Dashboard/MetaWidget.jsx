import { useApp } from '../../context/AppContext'
import './Widget.css'

const MOCK_CAMPAIGNS = [
  { name: 'Campaña Verano 2025', status: 'Activa', budget: '$150.000', results: '2.4K clics' },
  { name: 'Brand Awareness Q2', status: 'Activa', budget: '$80.000', results: '18K alcance' },
  { name: 'Retargeting Clientes', status: 'Pausada', budget: '$60.000', results: '340 conv.' },
]

export default function MetaWidget() {
  const { connections } = useApp()
  const connected = !!connections?.meta

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title-row">
          <div className="widget-icon meta-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </div>
          <div>
            <div className="widget-title">Meta Business</div>
            {!connected && <span className="badge badge-gray" style={{fontSize:'11px'}}>No conectado</span>}
            {connected && <span className="badge badge-green" style={{fontSize:'11px'}}>● Conectado</span>}
          </div>
        </div>
      </div>

      {connected ? (
        <div className="meta-campaigns">
          {MOCK_CAMPAIGNS.map((c, i) => (
            <div key={i} className="campaign-row">
              <div className="campaign-info">
                <div className="campaign-name">{c.name}</div>
                <div className="campaign-meta">{c.budget} · {c.results}</div>
              </div>
              <span className={`badge ${c.status === 'Activa' ? 'badge-green' : 'badge-gray'}`} style={{fontSize:'11px'}}>
                {c.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="widget-disconnected">
          <p>Conecta Meta Business para ver el resumen de tus campañas activas.</p>
          <a href="/settings" className="btn btn-sm btn-secondary" style={{marginTop:'8px', display:'inline-flex', textDecoration:'none'}}>
            Conectar cuenta →
          </a>
        </div>
      )}
    </div>
  )
}
