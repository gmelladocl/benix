import { useState } from 'react'
import { storage, KEYS, encodeB64, decodeB64 } from '../utils/storage'
import { generateId, formatDate } from '../utils/helpers'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import './Vault.css'

const VAULT_AUTH = { user: 'benito', pass: 'gvm1988x@' }

const EMPTY_ACCOUNT = { platform: '', username: '', password: '', url: '', notes: '' }

export default function Vault() {
  const { showToast } = useApp()
  const [authenticated, setAuthenticated] = useState(false)
  const [authForm, setAuthForm] = useState({ user: '', pass: '' })
  const [authError, setAuthError] = useState('')
  const [authShake, setAuthShake] = useState(false)

  const [accounts, setAccounts] = useState(() => {
    const raw = storage.get(KEYS.VAULT, [])
    return raw.map(a => ({ ...a, password: decodeB64(a.password) }))
  })
  const [comments, setComments] = useState(() => storage.get(KEYS.VAULT_COMMENTS, {}))
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [addModal, setAddModal] = useState(false)
  const [form, setForm] = useState(EMPTY_ACCOUNT)
  const [editingId, setEditingId] = useState(null)
  const [showPasswords, setShowPasswords] = useState({})
  const [confirmDelete, setConfirmDelete] = useState(null)

  const authenticate = () => {
    if (authForm.user === VAULT_AUTH.user && authForm.pass === VAULT_AUTH.pass) {
      setAuthenticated(true)
    } else {
      setAuthError('Credenciales incorrectas')
      setAuthShake(true)
      setTimeout(() => setAuthShake(false), 500)
    }
  }

  const saveAccount = () => {
    if (!form.platform.trim() || !form.username.trim()) { showToast('Plataforma y usuario son requeridos', 'error'); return }
    let updated
    const encoded = { ...form, password: encodeB64(form.password) }
    if (editingId) {
      const decoded = accounts.map(a => a.id === editingId ? { ...a, ...form } : a)
      setAccounts(decoded)
      updated = decoded.map(a => ({ ...a, password: encodeB64(a.password) }))
      showToast('Cuenta actualizada')
    } else {
      const newAcc = { ...form, id: generateId(), createdAt: new Date().toISOString() }
      const decoded = [...accounts, newAcc]
      setAccounts(decoded)
      updated = [...accounts.map(a => ({...a, password: encodeB64(a.password)})), { ...encoded, id: newAcc.id, createdAt: newAcc.createdAt }]
      showToast('Cuenta guardada')
    }
    storage.set(KEYS.VAULT, updated)
    setAddModal(false)
    setEditingId(null)
    setForm(EMPTY_ACCOUNT)
  }

  const deleteAccount = (id) => {
    const updated = accounts.filter(a => a.id !== id)
    setAccounts(updated)
    storage.set(KEYS.VAULT, updated.map(a => ({ ...a, password: encodeB64(a.password) })))
    setSelectedAccount(null)
    setConfirmDelete(null)
    showToast('Cuenta eliminada')
  }

  const addComment = (accountId) => {
    if (!newComment.trim()) return
    const comment = { text: newComment, createdAt: new Date().toISOString(), id: generateId() }
    const updated = { ...comments, [accountId]: [...(comments[accountId] || []), comment] }
    setComments(updated)
    storage.set(KEYS.VAULT_COMMENTS, updated)
    setNewComment('')
    showToast('Comentario agregado')
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text).then(() => showToast(`${label} copiado`))
  }

  const togglePass = (id) => setShowPasswords(p => ({...p, [id]: !p[id]}))

  if (!authenticated) {
    return (
      <div className="vault-auth-overlay">
        <div className={`vault-auth-card ${authShake ? 'shake' : ''}`}>
          <div className="vault-auth-icon">🔐</div>
          <h2 className="vault-auth-title">Acceso Seguro</h2>
          <p className="vault-auth-subtitle">Bóveda de Claves</p>
          <p className="vault-auth-hint">Esta sección requiere autenticación adicional</p>
          <div style={{display:'flex', flexDirection:'column', gap:'12px', marginTop:'20px'}}>
            <input className="form-input" placeholder="Usuario" value={authForm.user}
              onChange={e => { setAuthForm(f=>({...f,user:e.target.value})); setAuthError('') }} />
            <input className="form-input" type="password" placeholder="Contraseña" value={authForm.pass}
              onChange={e => { setAuthForm(f=>({...f,pass:e.target.value})); setAuthError('') }}
              onKeyDown={e => e.key === 'Enter' && authenticate()} />
            {authError && <div className="login-error" style={{background:'var(--red-light)', border:'1px solid rgba(224,82,82,0.3)', color:'var(--red)', padding:'10px 14px', borderRadius:'var(--radius)', fontSize:'13px'}}>⚠ {authError}</div>}
            <button className="btn btn-primary btn-lg" onClick={authenticate}>Acceder</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container" style={{display:'flex', gap:'24px', height:'100%', alignItems:'flex-start'}}>
      <div style={{flex:1, minWidth:0}}>
        <div className="page-header">
          <div>
            <h1 className="page-title">🔐 Bóveda de Claves</h1>
            <p className="page-subtitle">{accounts.length} cuenta{accounts.length!==1?'s':''} guardada{accounts.length!==1?'s':''}</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_ACCOUNT); setEditingId(null); setAddModal(true) }}>
            + Nueva Cuenta
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔑</div>
            <h3>Sin cuentas guardadas</h3>
            <p>Guarda tus credenciales de forma segura</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plataforma</th>
                  <th>Usuario</th>
                  <th>Contraseña</th>
                  <th>URL</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(acc => (
                  <tr key={acc.id} className={selectedAccount?.id===acc.id ? 'row-selected' : ''} onClick={() => setSelectedAccount(acc)} style={{cursor:'pointer'}}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <div className="platform-icon">
                          {acc.platform.charAt(0).toUpperCase()}
                        </div>
                        <span style={{fontWeight:600}}>{acc.platform}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <span style={{fontFamily:'monospace', fontSize:'13px'}}>{acc.username}</span>
                        <button className="copy-btn" onClick={e=>{e.stopPropagation(); copyToClipboard(acc.username,'Usuario')}} title="Copiar usuario">⎘</button>
                      </div>
                    </td>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                        <span style={{fontFamily:'monospace', fontSize:'13px', letterSpacing:'2px'}}>
                          {showPasswords[acc.id] ? acc.password : '••••••••••'}
                        </span>
                        <button className="copy-btn" onClick={e=>{e.stopPropagation(); togglePass(acc.id)}} title="Ver contraseña">
                          {showPasswords[acc.id] ? '👁' : '👁‍🗨'}
                        </button>
                        <button className="copy-btn" onClick={e=>{e.stopPropagation(); copyToClipboard(acc.password,'Contraseña')}} title="Copiar">⎘</button>
                      </div>
                    </td>
                    <td style={{fontSize:'13px', color:'var(--blue)'}}>
                      {acc.url ? <a href={acc.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()}>{acc.url.replace(/^https?:\/\//,'').slice(0,30)}</a> : '—'}
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'4px'}}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={e=>{e.stopPropagation(); setForm({...acc}); setEditingId(acc.id); setAddModal(true)}} title="Editar">✎</button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={e=>{e.stopPropagation(); setConfirmDelete(acc.id)}} title="Eliminar">✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {selectedAccount && (
        <div className="vault-side-panel">
          <div className="vault-side-header">
            <div className="platform-icon large">{selectedAccount.platform.charAt(0).toUpperCase()}</div>
            <div>
              <div style={{fontFamily:'var(--font-brand)', fontWeight:800, fontSize:'16px'}}>{selectedAccount.platform}</div>
              <div style={{fontSize:'12px', color:'var(--muted)'}}>@{selectedAccount.username}</div>
            </div>
            <button className="modal-close" style={{marginLeft:'auto'}} onClick={() => setSelectedAccount(null)}>✕</button>
          </div>
          <hr className="divider" />
          <div style={{fontSize:'13px', color:'var(--mid)', marginBottom:'4px', fontWeight:600}}>Notas</div>
          <p style={{fontSize:'13px', color:'var(--muted)', lineHeight:'1.6'}}>{selectedAccount.notes || 'Sin notas'}</p>
          <hr className="divider" style={{margin:'16px 0'}} />
          <div style={{fontWeight:700, fontSize:'14px', marginBottom:'12px'}}>Comentarios</div>
          <div style={{display:'flex', flexDirection:'column', gap:'8px', marginBottom:'12px', maxHeight:'200px', overflowY:'auto'}}>
            {(comments[selectedAccount.id] || []).map(c => (
              <div key={c.id} className="vault-comment">
                <div style={{fontSize:'13px', lineHeight:'1.5'}}>{c.text}</div>
                <div style={{fontSize:'11px', color:'var(--muted)', marginTop:'4px'}}>{formatDate(c.createdAt, {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</div>
              </div>
            ))}
            {!comments[selectedAccount.id]?.length && <p style={{fontSize:'13px', color:'var(--muted)'}}>Sin comentarios aún</p>}
          </div>
          <div style={{display:'flex', gap:'8px'}}>
            <input className="form-input" style={{flex:1}} placeholder="Agregar comentario..." value={newComment}
              onChange={e=>setNewComment(e.target.value)}
              onKeyDown={e=>e.key==='Enter' && addComment(selectedAccount.id)} />
            <button className="btn btn-primary btn-sm" onClick={() => addComment(selectedAccount.id)}>+</button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setEditingId(null) }}
        title={editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setAddModal(false); setEditingId(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={saveAccount}>Guardar</button>
          </>
        }>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Plataforma *</label>
            <input className="form-input" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))} placeholder="Instagram, Google, etc." />
          </div>
          <div className="form-group">
            <label className="form-label">Usuario *</label>
            <input className="form-input" value={form.username} onChange={e=>setForm(f=>({...f,username:e.target.value}))} placeholder="usuario@email.com" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input className="form-input" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••••" />
        </div>
        <div className="form-group">
          <label className="form-label">URL</label>
          <input className="form-input" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} placeholder="https://..." />
        </div>
        <div className="form-group">
          <label className="form-label">Notas</label>
          <textarea className="form-textarea" style={{minHeight:'70px'}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notas adicionales..." />
        </div>
      </Modal>

      {/* Confirm Delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Eliminar cuenta"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
            <button className="btn btn-danger" onClick={() => deleteAccount(confirmDelete)}>Eliminar</button>
          </>
        }>
        <p style={{fontSize:'14px', color:'var(--mid)'}}>¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  )
}
