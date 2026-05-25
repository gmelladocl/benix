import { useState } from 'react'
import { storage, KEYS } from '../utils/storage'
import { formatDate, getInitials, generateId, STATUS_COLORS, todayStr } from '../utils/helpers'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import './Clients.css'

const EMPTY_CLIENT = {
  name: '', company: '', email: '', phone: '', website: '',
  status: 'Activo', notes: '', joinedAt: todayStr(),
}

export default function Clients() {
  const { showToast } = useApp()
  const [clients, setClients] = useState(() => storage.get(KEYS.CLIENTS, []))
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(null)
  const [form, setForm] = useState(EMPTY_CLIENT)
  const [editing, setEditing] = useState(null)

  const save = () => {
    if (!form.name.trim()) { showToast('El nombre es requerido', 'error'); return }
    let updated
    if (editing) {
      updated = clients.map(c => c.id === editing ? { ...c, ...form } : c)
      showToast('Cliente actualizado')
    } else {
      const newClient = { ...form, id: generateId(), createdAt: new Date().toISOString() }
      updated = [...clients, newClient]
      showToast('Cliente creado')
    }
    setClients(updated)
    storage.set(KEYS.CLIENTS, updated)
    setModal(false)
    setForm(EMPTY_CLIENT)
    setEditing(null)
  }

  const deleteClient = (id) => {
    if (!confirm('¿Eliminar este cliente?')) return
    const updated = clients.filter(c => c.id !== id)
    setClients(updated)
    storage.set(KEYS.CLIENTS, updated)
    setDetailModal(null)
    showToast('Cliente eliminado')
  }

  const openEdit = (client) => {
    setForm({ ...client })
    setEditing(client.id)
    setDetailModal(null)
    setModal(true)
  }

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const AVATAR_COLORS = ['#393A3A','#4F7FFA','#25D366','#8B5CF6','#F59E0B','#E05252']

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">{clients.length} cliente{clients.length !== 1 ? 's' : ''} registrado{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_CLIENT); setEditing(null); setModal(true) }}>
          + Nuevo Cliente
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-bar" style={{flex:1, maxWidth:320}}>
          <span className="search-icon">⌕</span>
          <input className="form-input" placeholder="Buscar clientes..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {['Todos', 'Activo', 'Inactivo'].map(s => (
          <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">◎</div>
          <h3>{search ? 'Sin resultados' : 'Sin clientes aún'}</h3>
          <p>{search ? 'Prueba con otro término de búsqueda' : 'Agrega tu primer cliente para empezar a gestionar tu cartera'}</p>
          {!search && <button className="btn btn-primary" style={{marginTop:'8px'}} onClick={() => { setForm(EMPTY_CLIENT); setModal(true) }}>+ Nuevo Cliente</button>}
        </div>
      ) : (
        <div className="clients-grid">
          {filtered.map((c, i) => (
            <div key={c.id} className="client-card" onClick={() => setDetailModal(c)}>
              <div className="client-card-top">
                <div className="client-avatar" style={{background: AVATAR_COLORS[i % AVATAR_COLORS.length]}}>
                  {getInitials(c.name)}
                </div>
                <span className={`badge badge-${STATUS_COLORS[c.status] || 'gray'}`}>{c.status}</span>
              </div>
              <div className="client-name">{c.name}</div>
              {c.company && <div className="client-company">{c.company}</div>}
              <div className="client-meta">
                {c.email && <span>✉ {c.email}</span>}
                {c.phone && <span>📞 {c.phone}</span>}
              </div>
              <div className="client-footer">
                Desde {formatDate(c.joinedAt, { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modal} onClose={() => { setModal(false); setEditing(null) }}
        title={editing ? 'Editar Cliente' : 'Nuevo Cliente'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setModal(false); setEditing(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </>
        }>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(f=>({...f, name:e.target.value}))} placeholder="Nombre completo" />
          </div>
          <div className="form-group">
            <label className="form-label">Empresa</label>
            <input className="form-input" value={form.company} onChange={e => setForm(f=>({...f, company:e.target.value}))} placeholder="Empresa o negocio" />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm(f=>({...f, email:e.target.value}))} placeholder="email@ejemplo.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={form.phone} onChange={e => setForm(f=>({...f, phone:e.target.value}))} placeholder="+56 9 1234 5678" />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Sitio Web</label>
            <input className="form-input" value={form.website} onChange={e => setForm(f=>({...f, website:e.target.value}))} placeholder="www.ejemplo.cl" />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f=>({...f, status:e.target.value}))}>
              <option>Activo</option>
              <option>Inactivo</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Notas</label>
          <textarea className="form-textarea" value={form.notes} onChange={e => setForm(f=>({...f, notes:e.target.value}))} placeholder="Notas sobre el cliente..." />
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de Incorporación</label>
          <input className="form-input" type="date" value={form.joinedAt} onChange={e => setForm(f=>({...f, joinedAt:e.target.value}))} />
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!detailModal} onClose={() => setDetailModal(null)}
        title={detailModal?.name}
        footer={
          <>
            <button className="btn btn-danger btn-sm" onClick={() => deleteClient(detailModal.id)}>Eliminar</button>
            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(detailModal)}>Editar</button>
            <button className="btn btn-primary btn-sm" onClick={() => setDetailModal(null)}>Cerrar</button>
          </>
        }>
        {detailModal && (
          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            <div className="grid-2">
              <div><span className="form-label">Empresa</span><p style={{marginTop:'4px'}}>{detailModal.company || '—'}</p></div>
              <div><span className="form-label">Estado</span><p style={{marginTop:'4px'}}><span className={`badge badge-${STATUS_COLORS[detailModal.status]}`}>{detailModal.status}</span></p></div>
            </div>
            <div className="grid-2">
              <div><span className="form-label">Email</span><p style={{marginTop:'4px'}}>{detailModal.email || '—'}</p></div>
              <div><span className="form-label">Teléfono</span><p style={{marginTop:'4px'}}>{detailModal.phone || '—'}</p></div>
            </div>
            {detailModal.website && <div><span className="form-label">Sitio Web</span><p style={{marginTop:'4px'}}><a href={`https://${detailModal.website}`} target="_blank" rel="noopener noreferrer" style={{color:'var(--blue)'}}>{detailModal.website}</a></p></div>}
            {detailModal.notes && <div><span className="form-label">Notas</span><p style={{marginTop:'4px', fontSize:'14px', color:'var(--mid)', lineHeight:'1.6'}}>{detailModal.notes}</p></div>}
            <div><span className="form-label">Desde</span><p style={{marginTop:'4px'}}>{formatDate(detailModal.joinedAt)}</p></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
