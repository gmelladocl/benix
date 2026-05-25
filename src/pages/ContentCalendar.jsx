import { useState, useRef } from 'react'
import { storage, KEYS } from '../utils/storage'
import { getDaysInMonth, getFirstDayOfMonth, MONTHS_ES, DAYS_ES, generateId, todayStr, STATUS_DOT } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import './ContentCalendar.css'

const EMOJIS = ['😀','😂','❤️','🔥','⭐','✅','📢','📱','📸','🎯','💡','🚀','💪','🎉','👏','✨','💥','🌟','📊','💰','🎁','🛒','📣','🤝','💼','📝','🔑','⚡','🎨','📅']

const EMPTY_POST = {
  client: '', format: 'Imagen', status: 'Sin Empezar',
  date: todayStr(), copy: '', files: [],
}

const STATUS_BADGE = {
  'Sin Empezar': { bg: '#9A9A96', label: 'Sin emp.' },
  'En Curso': { bg: '#4F7FFA', label: 'En curso' },
  'Listo': { bg: '#25D366', label: 'Listo' },
  'Publicado': { bg: '#8B5CF6', label: 'Publicado' },
}

export default function ContentCalendar() {
  const { user } = useAuth()
  const { showToast } = useApp()
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [posts, setPosts] = useState(() => storage.get(KEYS.POSTS, []))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_POST)
  const [editingId, setEditingId] = useState(null)
  const [showEmoji, setShowEmoji] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const copyRef = useRef()

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const openAddModal = (dayNum) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`
    setForm({ ...EMPTY_POST, date: dateStr })
    setEditingId(null)
    setModal(true)
  }

  const openPostModal = (post, e) => {
    e.stopPropagation()
    setForm({ ...post })
    setEditingId(post.id)
    setModal(true)
  }

  const savePost = () => {
    if (!form.client.trim()) { showToast('El nombre del cliente es requerido', 'error'); return }
    let updated
    if (editingId) {
      updated = posts.map(p => p.id === editingId ? { ...p, ...form } : p)
      showToast('Post actualizado')
    } else {
      const newPost = { ...form, id: generateId(), createdBy: user?.username, createdAt: new Date().toISOString() }
      updated = [...posts, newPost]
      showToast('Post agregado al calendario')
    }
    setPosts(updated)
    storage.set(KEYS.POSTS, updated)
    setModal(false)
  }

  const deletePost = () => {
    if (!confirm('¿Eliminar este post?')) return
    const updated = posts.filter(p => p.id !== editingId)
    setPosts(updated)
    storage.set(KEYS.POSTS, updated)
    setModal(false)
    showToast('Post eliminado')
  }

  const addEmoji = (emoji) => {
    const el = copyRef.current
    if (el) {
      const start = el.selectionStart
      const end = el.selectionEnd
      const newCopy = form.copy.slice(0, start) + emoji + form.copy.slice(end)
      setForm(f => ({ ...f, copy: newCopy }))
      setTimeout(() => {
        el.selectionStart = el.selectionEnd = start + emoji.length
        el.focus()
      }, 0)
    } else {
      setForm(f => ({ ...f, copy: f.copy + emoji }))
    }
    setShowEmoji(false)
  }

  const handleFiles = (fileList) => {
    const files = Array.from(fileList)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setForm(f => ({ ...f, files: [...(f.files || []), { name: file.name, data: e.target.result, type: file.type }] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const getPostsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return posts.filter(p => p.date === dateStr)
  }

  const isToday = (day) => {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
  }

  const calendarCells = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario de Contenido</h1>
          <p className="page-subtitle">{MONTHS_ES[month]} {year}</p>
        </div>
        <button className="btn btn-primary" onClick={() => openAddModal(today.getDate())}>
          + Agregar Post
        </button>
      </div>

      {/* Month Navigation */}
      <div className="cal-nav">
        <button className="btn btn-ghost btn-icon" onClick={prevMonth}>←</button>
        <span className="cal-month-label">{MONTHS_ES[month]} {year}</span>
        <button className="btn btn-ghost btn-icon" onClick={nextMonth}>→</button>
        <button className="btn btn-sm btn-secondary" onClick={() => { setMonth(today.getMonth()); setYear(today.getFullYear()) }}>
          Hoy
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-wrapper">
        <div className="cal-header">
          {DAYS_ES.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        </div>
        <div className="cal-grid">
          {calendarCells.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="cal-cell cal-cell-empty" />
            const dayPosts = getPostsForDay(day)
            return (
              <div
                key={day}
                className={`cal-cell ${isToday(day) ? 'cal-cell-today' : ''}`}
                onClick={() => openAddModal(day)}
              >
                <span className="cal-day-num">{day}</span>
                <div className="cal-posts">
                  {dayPosts.slice(0, 3).map(post => (
                    <div
                      key={post.id}
                      className="cal-post-badge"
                      style={{ background: STATUS_DOT[post.status] || '#9A9A96' }}
                      onClick={(e) => openPostModal(post, e)}
                      title={`${post.client} — ${post.format}`}
                    >
                      {post.client.slice(0, 12)}{post.client.length > 12 ? '…' : ''}
                    </div>
                  ))}
                  {dayPosts.length > 3 && (
                    <div className="cal-post-more">+{dayPosts.length - 3} más</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add/Edit Post Modal */}
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editingId ? 'Editar Post' : 'Agregar Post'}
        size="lg"
        footer={
          <>
            {editingId && <button className="btn btn-danger btn-sm" onClick={deletePost}>Eliminar</button>}
            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={savePost}>Guardar</button>
          </>
        }
      >
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Nombre del cliente *</label>
            <input className="form-input" value={form.client} onChange={e => setForm(f=>({...f,client:e.target.value}))} placeholder="Nombre del cliente" />
          </div>
          <div className="form-group">
            <label className="form-label">Formato del post</label>
            <select className="form-select" value={form.format} onChange={e => setForm(f=>({...f,format:e.target.value}))}>
              <option>Carrusel</option>
              <option>Imagen</option>
              <option>Reel</option>
            </select>
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
              <option>Sin Empezar</option>
              <option>En Curso</option>
              <option>Listo</option>
              <option>Publicado</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Fecha de publicación</label>
            <input className="form-input" type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Creado por</label>
          <input className="form-input" value={user?.username || ''} readOnly style={{opacity:0.6, cursor:'not-allowed'}} />
        </div>

        <div className="form-group" style={{position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px'}}>
            <label className="form-label" style={{marginBottom:0}}>Copy del post</label>
            <div style={{position:'relative'}}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowEmoji(s=>!s)} style={{fontSize:'18px', padding:'4px 8px'}}>😊</button>
              {showEmoji && (
                <div className="emoji-picker">
                  {EMOJIS.map(e => (
                    <button key={e} className="emoji-btn" onClick={() => addEmoji(e)}>{e}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <textarea
            ref={copyRef}
            className="form-textarea"
            style={{minHeight:'140px'}}
            value={form.copy}
            onChange={e => setForm(f=>({...f,copy:e.target.value}))}
            placeholder="Escribe el copy del post aquí... Puedes usar emojis 🚀"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Archivos adjuntos</label>
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
            onClick={() => fileRef.current?.click()}
          >
            <div className="upload-icon">📎</div>
            <p>Arrastra archivos aquí o haz clic para seleccionar</p>
            <p style={{fontSize:'11px'}}>Imágenes, videos, documentos</p>
            <input ref={fileRef} type="file" multiple style={{display:'none'}} onChange={e => handleFiles(e.target.files)} />
          </div>
          {form.files?.length > 0 && (
            <div className="files-list">
              {form.files.map((f, i) => (
                <div key={i} className="file-item">
                  <span>{f.type?.startsWith('image') ? '🖼' : '📄'}</span>
                  <span style={{flex:1, fontSize:'13px'}}>{f.name}</span>
                  <button className="btn btn-ghost btn-sm" onClick={(e) => {
                    e.stopPropagation()
                    setForm(fm => ({...fm, files: fm.files.filter((_,j)=>j!==i)}))
                  }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
