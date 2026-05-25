import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { getInitials, generateId } from '../utils/helpers'
import Modal from '../components/UI/Modal'
import './Settings.css'

const AVATAR_COLORS = ['#393A3A','#4F7FFA','#25D366','#8B5CF6','#F59E0B','#E05252']
const EMPTY_USER = { username:'', password:'', role:'Editor', avatarColor:'#4F7FFA' }

export default function Settings() {
  const { user, updateProfile, getUsers, addUser, deleteUser } = useAuth()
  const { showToast, theme, toggleTheme, connections, saveConnection, disconnectPlatform } = useApp()

  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState({ displayName: user?.displayName||'', email: user?.email||'' })
  const [newPass, setNewPass] = useState({ current:'', next:'', confirm:'' })
  const [users, setUsers] = useState(() => getUsers())
  const [userModal, setUserModal] = useState(false)
  const [userForm, setUserForm] = useState(EMPTY_USER)
  const [connectModal, setConnectModal] = useState(null)
  const [connectForm, setConnectForm] = useState({})

  const saveProfile = () => {
    updateProfile({ displayName: profile.displayName, email: profile.email })
    showToast('Perfil actualizado')
  }

  const changePassword = () => {
    const users = getUsers()
    const u = users.find(u => u.id === user.id)
    if (u.password !== newPass.current) { showToast('Contraseña actual incorrecta', 'error'); return }
    if (newPass.next !== newPass.confirm) { showToast('Las contraseñas no coinciden', 'error'); return }
    if (newPass.next.length < 6) { showToast('La contraseña debe tener al menos 6 caracteres', 'error'); return }
    updateProfile({ password: newPass.next })
    setNewPass({ current:'', next:'', confirm:'' })
    showToast('Contraseña actualizada')
  }

  const saveUser = () => {
    if (!userForm.username.trim() || !userForm.password.trim()) { showToast('Completa los campos', 'error'); return }
    addUser(userForm)
    setUsers(getUsers())
    setUserModal(false)
    setUserForm(EMPTY_USER)
    showToast('Usuario creado')
  }

  const removeUser = (id) => {
    if (id === user.id) { showToast('No puedes eliminar tu propio usuario', 'error'); return }
    if (!confirm('¿Eliminar usuario?')) return
    deleteUser(id)
    setUsers(getUsers())
    showToast('Usuario eliminado')
  }

  const handleConnect = (platform) => {
    saveConnection(platform, { ...connectForm, connectedAt: new Date().toISOString() })
    setConnectModal(null)
    setConnectForm({})
    showToast(`${platform} conectado`)
  }

  const PLATFORMS_CONFIG = [
    { key:'instagram', label:'Instagram', icon:'📸', color:'#E1306C', fields:[{label:'Usuario', key:'username'}] },
    { key:'tiktok', label:'TikTok', icon:'🎵', color:'#010101', fields:[{label:'Usuario', key:'username'}] },
    { key:'meta', label:'Meta Business', icon:'▣', color:'#1877F2', fields:[{label:'Business Account ID', key:'accountId'},{label:'Access Token', key:'token', type:'password'}] },
    { key:'google_calendar', label:'Google Calendar', icon:'📅', color:'#4285F4', fields:[{label:'Email de Google', key:'email'}] },
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Ajustes</h1>
      </div>

      <div className="tabs" style={{marginBottom:'28px'}}>
        {[['profile','Perfil'],['connections','Conexiones'],['users','Usuarios'],['appearance','Apariencia']].map(([k,l]) => (
          <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="settings-section">
          <div className="settings-card">
            <h3 className="settings-card-title">Información del perfil</h3>
            <div style={{display:'flex', alignItems:'center', gap:'16px', marginBottom:'24px'}}>
              <div className="profile-avatar" style={{background: user?.avatarColor||'#393A3A'}}>
                {getInitials(user?.displayName||user?.username||'U')}
              </div>
              <div>
                <div style={{fontSize:'18px', fontWeight:800, fontFamily:'var(--font-brand)'}}>{user?.username}</div>
                <div style={{fontSize:'13px', color:'var(--muted)'}}>{user?.role === 'superadmin' ? 'Super Administrador' : user?.role}</div>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
              <div className="form-group">
                <label className="form-label">Nombre de visualización</label>
                <input className="form-input" value={profile.displayName} onChange={e=>setProfile(p=>({...p,displayName:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={profile.email} onChange={e=>setProfile(p=>({...p,email:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Color de avatar</label>
                <div style={{display:'flex', gap:'8px'}}>
                  {AVATAR_COLORS.map(c=>(
                    <button key={c} type="button"
                      style={{width:32,height:32,borderRadius:'50%',background:c,border:'3px solid',borderColor:user?.avatarColor===c?'var(--dark)':'transparent',cursor:'pointer'}}
                      onClick={()=>updateProfile({avatarColor:c})} />
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{width:'fit-content'}} onClick={saveProfile}>Guardar cambios</button>
            </div>
          </div>

          <div className="settings-card">
            <h3 className="settings-card-title">Cambiar contraseña</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
              <div className="form-group">
                <label className="form-label">Contraseña actual</label>
                <input className="form-input" type="password" value={newPass.current} onChange={e=>setNewPass(p=>({...p,current:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Nueva contraseña</label>
                <input className="form-input" type="password" value={newPass.next} onChange={e=>setNewPass(p=>({...p,next:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Confirmar contraseña</label>
                <input className="form-input" type="password" value={newPass.confirm} onChange={e=>setNewPass(p=>({...p,confirm:e.target.value}))} />
              </div>
              <button className="btn btn-secondary" style={{width:'fit-content'}} onClick={changePassword}>Cambiar contraseña</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'connections' && (
        <div className="settings-section">
          {PLATFORMS_CONFIG.map(platform => {
            const conn = connections[platform.key]
            return (
              <div key={platform.key} className="settings-card connection-card">
                <div style={{display:'flex', alignItems:'center', gap:'14px', flex:1}}>
                  <div className="connection-icon" style={{background:`${platform.color}15`, color:platform.color}}>
                    {platform.icon}
                  </div>
                  <div>
                    <div style={{fontWeight:700, fontSize:'16px'}}>{platform.label}</div>
                    {conn ? (
                      <div style={{fontSize:'13px', color:'var(--accent)'}}> ● Conectado{conn.username ? ` · @${conn.username}` : conn.email ? ` · ${conn.email}` : ''}</div>
                    ) : (
                      <div style={{fontSize:'13px', color:'var(--muted)'}}>No conectado</div>
                    )}
                  </div>
                </div>
                {conn ? (
                  <button className="btn btn-secondary btn-sm" onClick={() => disconnectPlatform(platform.key)}>Desconectar</button>
                ) : (
                  <button className="btn btn-primary btn-sm" onClick={() => { setConnectModal(platform); setConnectForm({}) }}>
                    Conectar
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'users' && (
        <div className="settings-section">
          <div className="settings-card">
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
              <h3 className="settings-card-title" style={{marginBottom:0}}>Usuarios del sistema</h3>
              <button className="btn btn-primary btn-sm" onClick={()=>{setUserForm(EMPTY_USER);setUserModal(true)}}>+ Nuevo Usuario</button>
            </div>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Usuario</th><th>Rol</th><th>Creado</th><th></th></tr></thead>
                <tbody>
                  {users.map(u=>(
                    <tr key={u.id}>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                          <div className="user-avatar" style={{background:u.avatarColor||'#393A3A',width:'32px',height:'32px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-brand)',fontWeight:800,fontSize:'12px',color:'white',flexShrink:0}}>
                            {getInitials(u.displayName||u.username)}
                          </div>
                          <div>
                            <div style={{fontWeight:600}}>{u.username}</div>
                            {u.displayName&&<div style={{fontSize:'12px',color:'var(--muted)'}}>{u.displayName}</div>}
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${u.role==='superadmin'?'badge-purple':'badge-blue'}`}>{u.role==='superadmin'?'Super Admin':u.role}</span></td>
                      <td style={{fontSize:'13px',color:'var(--muted)'}}>{new Date(u.createdAt).toLocaleDateString('es-CL')}</td>
                      <td>
                        {u.id !== user.id && (
                          <button className="btn btn-danger btn-sm" onClick={()=>removeUser(u.id)}>Eliminar</button>
                        )}
                        {u.id === user.id && <span style={{fontSize:'12px',color:'var(--muted)'}}>Tú</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'appearance' && (
        <div className="settings-section">
          <div className="settings-card">
            <h3 className="settings-card-title">Tema</h3>
            <div className="theme-options">
              <button className={`theme-btn ${theme==='light'?'active':''}`} onClick={()=>theme!=='light'&&toggleTheme()}>
                <span style={{fontSize:'24px'}}>☀</span>
                <span>Claro</span>
              </button>
              <button className={`theme-btn ${theme==='dark'?'active':''}`} onClick={()=>theme!=='dark'&&toggleTheme()}>
                <span style={{fontSize:'24px'}}>☽</span>
                <span>Oscuro</span>
              </button>
            </div>
          </div>
          <div className="settings-card">
            <h3 className="settings-card-title">Información del sistema</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              {[['Sistema','Benix'],['Versión','0.01'],['Desarrollado por','gmellado.cl'],['Almacenamiento','localStorage (local)']].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:'14px',padding:'10px 0',borderBottom:'1px solid var(--cream-dark)'}}>
                  <span style={{color:'var(--muted)',fontWeight:600}}>{k}</span>
                  <span style={{fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* New User Modal */}
      <Modal open={userModal} onClose={()=>setUserModal(false)} title="Nuevo Usuario"
        footer={<><button className="btn btn-secondary" onClick={()=>setUserModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={saveUser}>Crear Usuario</button></>}>
        <div className="form-group">
          <label className="form-label">Nombre de usuario *</label>
          <input className="form-input" value={userForm.username} onChange={e=>setUserForm(f=>({...f,username:e.target.value}))} placeholder="usuario" />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña *</label>
          <input className="form-input" type="password" value={userForm.password} onChange={e=>setUserForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" />
        </div>
        <div className="form-group">
          <label className="form-label">Rol</label>
          <select className="form-select" value={userForm.role} onChange={e=>setUserForm(f=>({...f,role:e.target.value}))}>
            <option value="superadmin">Super Admin</option>
            <option value="Editor">Editor</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </Modal>

      {/* Connect Modal */}
      {connectModal && (
        <Modal open={!!connectModal} onClose={()=>setConnectModal(null)} title={`Conectar ${connectModal.label}`}
          footer={<><button className="btn btn-secondary" onClick={()=>setConnectModal(null)}>Cancelar</button><button className="btn btn-primary" onClick={()=>handleConnect(connectModal.key)}>Conectar</button></>}>
          <p style={{fontSize:'13px',color:'var(--muted)',lineHeight:'1.5',marginBottom:'4px'}}>
            Esta es una conexión de demostración. En producción se utilizaría OAuth para la autenticación segura.
          </p>
          {connectModal.fields.map(field=>(
            <div key={field.key} className="form-group">
              <label className="form-label">{field.label}</label>
              <input className="form-input" type={field.type||'text'} value={connectForm[field.key]||''}
                onChange={e=>setConnectForm(f=>({...f,[field.key]:e.target.value}))} />
            </div>
          ))}
        </Modal>
      )}
    </div>
  )
}
