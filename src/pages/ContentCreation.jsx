import { useState, useRef } from 'react'
import { storage, KEYS } from '../utils/storage'
import { generateId, todayStr, formatDate } from '../utils/helpers'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import './ContentCreation.css'

const PLATFORMS = ['Instagram','TikTok','YouTube','Blog','Otros']
const STATUSES = ['Pendiente','En Curso','Listo']
const STATUS_COLORS = { 'Pendiente':'orange', 'En Curso':'blue', 'Listo':'green' }
const PLATFORM_ICONS = { 'Instagram':'📸', 'TikTok':'🎵', 'YouTube':'▶', 'Blog':'✍', 'Otros':'📝' }
const EMOJIS = ['😀','😂','❤️','🔥','⭐','✅','📢','📱','📸','🎯','💡','🚀','💪','🎉','👏','✨','💥','🌟','📊','💰']

const EMPTY_CONTENT = {
  title:'', platform:'Instagram', createdAt: todayStr(), publishAt:'', status:'Pendiente',
  copy:'', notes:'', files:[]
}

export default function ContentCreation() {
  const { showToast } = useApp()
  const [items, setItems] = useState(() => storage.get(KEYS.CONTENT, []))
  const [view, setView] = useState('kanban')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_CONTENT)
  const [editingId, setEditingId] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [listening, setListening] = useState(false)
  const fileRef = useRef()
  const copyRef = useRef()

  const save = () => {
    if (!form.title.trim()) { showToast('El título es requerido', 'error'); return }
    let updated
    if (editingId) {
      updated = items.map(i => i.id === editingId ? {...i,...form} : i)
      showToast('Contenido actualizado')
    } else {
      updated = [...items, { ...form, id: generateId(), createdAt: new Date().toISOString() }]
      showToast('Contenido guardado')
    }
    setItems(updated)
    storage.set(KEYS.CONTENT, updated)
    setModal(false)
    setEditingId(null)
    setForm(EMPTY_CONTENT)
  }

  const deleteItem = (id) => {
    if (!confirm('¿Eliminar este contenido?')) return
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    storage.set(KEYS.CONTENT, updated)
    setModal(false)
    showToast('Contenido eliminado')
  }

  const addEmoji = (emoji) => {
    const el = copyRef.current
    if (el) {
      const s = el.selectionStart, e = el.selectionEnd
      setForm(f => ({...f, copy: f.copy.slice(0,s) + emoji + f.copy.slice(e)}))
    } else {
      setForm(f => ({...f, copy: f.copy + emoji}))
    }
    setShowEmoji(false)
  }

  const handleFiles = (fileList) => {
    Array.from(fileList).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => setForm(f => ({...f, files:[...(f.files||[]), {name:file.name, data:e.target.result, type:file.type}]}))
      reader.readAsDataURL(file)
    })
  }

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showToast('Tu navegador no soporta reconocimiento de voz', 'error'); return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.lang = 'es-CL'
    recognition.continuous = false
    recognition.interimResults = false
    setListening(true)
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      setForm(f => ({...f, copy: f.copy + (f.copy ? ' ' : '') + transcript}))
      setListening(false)
    }
    recognition.onerror = () => { setListening(false); showToast('Error en reconocimiento de voz', 'error') }
    recognition.onend = () => setListening(false)
    recognition.start()
  }

  const kanbanCols = STATUSES.map(s => ({ status: s, items: items.filter(i => i.status === s) }))

  const openEdit = (item) => {
    setForm({...item})
    setEditingId(item.id)
    setModal(true)
  }

  return (
    <div className="page-container" style={{paddingBottom:'40px'}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Creación de Contenido</h1>
          <p className="page-subtitle">{items.length} pieza{items.length!==1?'s':''} de contenido</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <div className="tabs">
            <button className={`tab-btn ${view==='kanban'?'active':''}`} onClick={()=>setView('kanban')}>■ Kanban</button>
            <button className={`tab-btn ${view==='table'?'active':''}`} onClick={()=>setView('table')}>≡ Tabla</button>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_CONTENT); setEditingId(null); setModal(true) }}>
            + Nuevo Contenido
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">✦</div>
          <h3>Sin contenido aún</h3>
          <p>Empieza a organizar tu contenido para redes sociales y blogs</p>
          <button className="btn btn-primary" style={{marginTop:'8px'}} onClick={() => setModal(true)}>+ Nuevo Contenido</button>
        </div>
      )}

      {items.length > 0 && view === 'kanban' && (
        <div className="kanban-board">
          {kanbanCols.map(col => (
            <div key={col.status} className="kanban-col">
              <div className="kanban-col-header">
                <span className={`badge badge-${STATUS_COLORS[col.status]}`}>{col.status}</span>
                <span style={{fontSize:'13px', color:'var(--muted)'}}>{col.items.length}</span>
              </div>
              <div className="kanban-cards">
                {col.items.map(item => (
                  <div key={item.id} className="kanban-card" onClick={() => openEdit(item)}>
                    <div className="kanban-card-top">
                      <span className="platform-badge">{PLATFORM_ICONS[item.platform]} {item.platform}</span>
                    </div>
                    <div className="kanban-card-title">{item.title}</div>
                    {item.copy && <div className="kanban-card-copy">{item.copy.slice(0,80)}{item.copy.length>80?'…':''}</div>}
                    <div className="kanban-card-footer">
                      {item.publishAt && <span>📅 {formatDate(item.publishAt, {day:'2-digit',month:'short'})}</span>}
                      {item.files?.length > 0 && <span>📎 {item.files.length}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && view === 'table' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Plataforma</th>
                <th>Estado</th>
                <th>Publicación</th>
                <th>Archivos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{cursor:'pointer'}} onClick={()=>openEdit(item)}>
                  <td style={{fontWeight:600}}>{item.title}</td>
                  <td><span className="platform-badge">{PLATFORM_ICONS[item.platform]} {item.platform}</span></td>
                  <td><span className={`badge badge-${STATUS_COLORS[item.status]}`}>{item.status}</span></td>
                  <td style={{fontSize:'13px', color:'var(--mid)'}}>{item.publishAt ? formatDate(item.publishAt,{day:'2-digit',month:'short',year:'numeric'}) : '—'}</td>
                  <td style={{fontSize:'13px', color:'var(--muted)'}}>{item.files?.length||0} archivo{item.files?.length!==1?'s':''}</td>
                  <td><button className="btn btn-ghost btn-icon btn-sm" onClick={e=>{e.stopPropagation();deleteItem(item.id)}}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={()=>{setModal(false);setEditingId(null)}} title={editingId?'Editar Contenido':'Nuevo Contenido'} size="lg"
        footer={
          <>
            {editingId && <button className="btn btn-danger btn-sm" onClick={()=>deleteItem(editingId)}>Eliminar</button>}
            <button className="btn btn-secondary" onClick={()=>{setModal(false);setEditingId(null)}}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </>
        }>
        <div className="form-group">
          <label className="form-label">Título del copy *</label>
          <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="Título del contenido" />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Plataforma</label>
            <select className="form-select" value={form.platform} onChange={e=>setForm(f=>({...f,platform:e.target.value}))}>
              {PLATFORMS.map(p=><option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Fecha de creación</label>
            <input className="form-input" value={typeof form.createdAt==='string'?form.createdAt.split('T')[0]:form.createdAt} readOnly style={{opacity:0.6}} />
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de publicación</label>
            <input className="form-input" type="date" value={form.publishAt} onChange={e=>setForm(f=>({...f,publishAt:e.target.value}))} />
          </div>
        </div>

        <div className="form-group" style={{position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px'}}>
            <label className="form-label" style={{marginBottom:0}}>Copy / Desarrollo</label>
            <div style={{display:'flex', gap:'6px', position:'relative'}}>
              <button type="button" className="btn btn-ghost btn-sm" style={{fontSize:'16px'}} onClick={()=>setShowEmoji(s=>!s)}>😊</button>
              <button type="button" className={`btn btn-sm ${listening?'btn-blue':'btn-secondary'}`} onClick={startVoice} title="Nota de voz">
                {listening ? '⏹ Escuchando...' : '🎤 Voz'}
              </button>
              {showEmoji && (
                <div className="emoji-picker" style={{right:0, top:'100%'}}>
                  {EMOJIS.map(e=><button key={e} className="emoji-btn" onClick={()=>addEmoji(e)}>{e}</button>)}
                </div>
              )}
            </div>
          </div>
          <textarea ref={copyRef} className="form-textarea" style={{minHeight:'160px'}}
            value={form.copy} onChange={e=>setForm(f=>({...f,copy:e.target.value}))}
            placeholder="Escribe el copy aquí... también puedes usar la nota de voz 🎤" />
        </div>

        <div className="form-group">
          <label className="form-label">Notas internas</label>
          <textarea className="form-textarea" style={{minHeight:'80px'}} value={form.notes}
            onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
            placeholder="Notas, comentarios internos, instrucciones..." />
        </div>

        <div className="form-group">
          <label className="form-label">Archivos adjuntos</label>
          <div className={`upload-zone ${dragOver?'drag-over':''}`}
            onDragOver={e=>{e.preventDefault();setDragOver(true)}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)}}
            onClick={()=>fileRef.current?.click()}>
            <div className="upload-icon">📂</div>
            <p>Arrastra o haz clic para subir archivos</p>
            <p style={{fontSize:'11px'}}>Imágenes, videos, documentos, audio</p>
            <input ref={fileRef} type="file" multiple style={{display:'none'}} onChange={e=>handleFiles(e.target.files)} />
          </div>
          {form.files?.length>0 && (
            <div className="files-list">
              {form.files.map((f,i)=>(
                <div key={i} className="file-item">
                  <span>{f.type?.startsWith('image')?'🖼':f.type?.startsWith('video')?'🎬':'📄'}</span>
                  <span style={{flex:1,fontSize:'13px'}}>{f.name}</span>
                  <button className="btn btn-ghost btn-sm" onClick={e=>{e.stopPropagation();setForm(fm=>({...fm,files:fm.files.filter((_,j)=>j!==i)}))}}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
