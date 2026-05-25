import { useState, useRef, useEffect, useCallback } from 'react'
import { storage, KEYS } from '../utils/storage'
import { generateId, todayStr } from '../utils/helpers'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import './MindMap.css'

const NODE_COLORS = ['#4F7FFA','#25D366','#8B5CF6','#F59E0B','#E05252']
const NODE_LABELS = ['Azul','Verde','Morado','Naranja','Rojo']

const EMPTY_NODE = { title: '', status: 'Sin Empezar', color: '#4F7FFA', connections: [], x: 400, y: 300, createdAt: todayStr() }

export default function MindMap() {
  const { showToast } = useApp()
  const [nodes, setNodes] = useState(() => storage.get(KEYS.MIND_NODES, []))
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_NODE)
  const [editingId, setEditingId] = useState(null)
  const [analysisPanel, setAnalysisPanel] = useState(null)
  const [analysisNote, setAnalysisNote] = useState('')
  const [zoom, setZoom] = useState(1)
  const [dragging, setDragging] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const canvasRef = useRef()
  const dragOffset = useRef({x:0, y:0})

  const saveNodes = (updated) => {
    setNodes(updated)
    storage.set(KEYS.MIND_NODES, updated)
  }

  const addNode = () => {
    const canvasEl = canvasRef.current
    const rect = canvasEl?.getBoundingClientRect() || { width: 800, height: 600 }
    const cx = (rect.width / 2 / zoom) + Math.random() * 100 - 50
    const cy = (rect.height / 2 / zoom) + Math.random() * 100 - 50
    if (!form.title.trim()) { showToast('El nombre es requerido', 'error'); return }
    const node = { ...form, id: generateId(), x: cx, y: cy }
    const updated = [...nodes, node]
    saveNodes(updated)
    setModal(false)
    setForm(EMPTY_NODE)
    showToast('Idea agregada')
  }

  const updateNode = () => {
    if (!form.title.trim()) { showToast('El nombre es requerido', 'error'); return }
    const updated = nodes.map(n => n.id === editingId ? { ...n, ...form } : n)
    saveNodes(updated)
    setModal(false)
    setEditingId(null)
    showToast('Idea actualizada')
  }

  const deleteNode = (id) => {
    const updated = nodes.filter(n => n.id !== id).map(n => ({
      ...n, connections: n.connections.filter(c => c !== id)
    }))
    saveNodes(updated)
    setContextMenu(null)
    showToast('Idea eliminada')
  }

  const toggleConnection = (fromId, toId) => {
    const updated = nodes.map(n => {
      if (n.id !== fromId) return n
      const hasConn = n.connections.includes(toId)
      return { ...n, connections: hasConn ? n.connections.filter(c=>c!==toId) : [...n.connections, toId] }
    })
    saveNodes(updated)
  }

  const onMouseDown = useCallback((e, nodeId) => {
    e.preventDefault()
    const node = nodes.find(n => n.id === nodeId)
    dragOffset.current = { x: e.clientX - node.x * zoom, y: e.clientY - node.y * zoom }
    setDragging(nodeId)
  }, [nodes, zoom])

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragging) return
      const newX = (e.clientX - dragOffset.current.x) / zoom
      const newY = (e.clientY - dragOffset.current.y) / zoom
      setNodes(prev => prev.map(n => n.id === dragging ? { ...n, x: newX, y: newY } : n))
    }
    const onMouseUp = () => {
      if (dragging) {
        storage.set(KEYS.MIND_NODES, nodes)
        setDragging(null)
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp) }
  }, [dragging, zoom, nodes])

  const getConnectedNodes = (nodeId) => {
    return nodes.filter(n => n.connections.includes(nodeId) || nodes.find(m=>m.id===nodeId)?.connections.includes(n.id))
  }

  return (
    <div className="mindmap-page">
      <div className="mindmap-toolbar">
        <h1 className="page-title" style={{fontSize:'20px', marginBottom:0}}>Mapa Mental</h1>
        <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
          <button className="btn btn-ghost btn-icon" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}>+</button>
          <span style={{fontSize:'12px', color:'var(--muted)', minWidth:'40px', textAlign:'center'}}>{Math.round(zoom*100)}%</span>
          <button className="btn btn-ghost btn-icon" onClick={() => setZoom(z => Math.max(z - 0.1, 0.3))}>−</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setZoom(1)}>Reset</button>
          <button className="btn btn-primary btn-sm" onClick={() => { setForm(EMPTY_NODE); setEditingId(null); setModal(true) }}>
            + Nueva Idea
          </button>
        </div>
      </div>

      <div className="mindmap-canvas-wrap" ref={canvasRef} onClick={() => setContextMenu(null)}>
        <svg className="mindmap-svg" style={{transform:`scale(${zoom})`, transformOrigin:'top left'}}>
          <defs>
            <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <circle cx="3" cy="3" r="2" fill="var(--muted-light)" />
            </marker>
          </defs>
          {nodes.map(node =>
            node.connections.map(targetId => {
              const target = nodes.find(n => n.id === targetId)
              if (!target) return null
              const x1 = node.x + 80, y1 = node.y + 28
              const x2 = target.x + 80, y2 = target.y + 28
              const mx = (x1 + x2) / 2
              const my = (y1 + y2) / 2 - 40
              return (
                <g key={`${node.id}-${targetId}`}>
                  <path
                    d={`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeOpacity="0.4"
                    strokeDasharray="5,3"
                    markerEnd="url(#arrow)"
                  />
                  <circle
                    cx={(x1+x2)/2 + (my-y1)*0.1}
                    cy={(y1+y2)/2}
                    r="12"
                    fill="var(--white)"
                    stroke={node.color}
                    strokeWidth="1.5"
                    style={{cursor:'pointer', opacity:0.8}}
                    onClick={(e) => {
                      e.stopPropagation()
                      const connected = [node, target]
                      setAnalysisPanel({ nodes: connected })
                    }}
                  />
                  <text
                    x={(x1+x2)/2 + (my-y1)*0.1}
                    y={(y1+y2)/2 + 5}
                    textAnchor="middle"
                    fontSize="12"
                    fill={node.color}
                    style={{cursor:'pointer', userSelect:'none'}}
                    onClick={(e) => {
                      e.stopPropagation()
                      setAnalysisPanel({ nodes: [node, target] })
                    }}
                  >⬡</text>
                </g>
              )
            })
          )}
        </svg>

        <div className="mindmap-nodes" style={{transform:`scale(${zoom})`, transformOrigin:'top left'}}>
          {nodes.map(node => (
            <div
              key={node.id}
              className="mind-node"
              style={{ left: node.x, top: node.y, borderColor: node.color, '--node-color': node.color }}
              onMouseDown={(e) => onMouseDown(e, node.id)}
              onContextMenu={(e) => { e.preventDefault(); setContextMenu({ nodeId: node.id, x: e.clientX, y: e.clientY }) }}
            >
              <div className="node-dot" style={{background: node.color}} />
              <div className="node-content">
                <div className="node-title">{node.title}</div>
                <div className="node-status" style={{color: node.color}}>{node.status}</div>
              </div>
            </div>
          ))}
        </div>

        {nodes.length === 0 && (
          <div className="mindmap-empty">
            <div style={{fontSize:'48px', marginBottom:'16px'}}>⬡</div>
            <h3>Tu mapa mental está vacío</h3>
            <p>Agrega tu primera idea para comenzar</p>
            <button className="btn btn-primary" style={{marginTop:'16px'}} onClick={() => { setForm(EMPTY_NODE); setModal(true) }}>
              + Nueva Idea
            </button>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
          <button onClick={() => {
            const node = nodes.find(n => n.id === contextMenu.nodeId)
            setForm({ ...node })
            setEditingId(contextMenu.nodeId)
            setContextMenu(null)
            setModal(true)
          }}>✎ Editar</button>
          <button onClick={() => deleteNode(contextMenu.nodeId)}>✕ Eliminar</button>
          <button onClick={() => {
            const node = nodes.find(n => n.id === contextMenu.nodeId)
            setForm({ ...node })
            setEditingId(contextMenu.nodeId)
            setContextMenu(null)
            setModal(true)
          }}>⬡ Conectar</button>
        </div>
      )}

      {/* Analysis Panel */}
      {analysisPanel && (
        <div className="analysis-panel">
          <div className="analysis-header">
            <h3>Análisis en conjunto</h3>
            <button className="modal-close" onClick={() => setAnalysisPanel(null)}>✕</button>
          </div>
          <div className="analysis-nodes">
            {analysisPanel.nodes.map(n => (
              <div key={n.id} className="analysis-node-chip" style={{borderColor: n.color, color: n.color}}>
                {n.title}
              </div>
            ))}
          </div>
          <textarea
            className="form-textarea"
            style={{minHeight:'120px', marginTop:'12px'}}
            value={analysisNote}
            onChange={e => setAnalysisNote(e.target.value)}
            placeholder="Escribe conclusiones o ideas en común entre los nodos conectados..."
          />
          <button className="btn btn-primary btn-sm" style={{marginTop:'8px'}} onClick={() => {
            showToast('Análisis guardado')
            setAnalysisPanel(null)
          }}>Guardar análisis</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setEditingId(null) }}
        title={editingId ? 'Editar Idea' : 'Nueva Idea'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setModal(false); setEditingId(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={editingId ? updateNode : addNode}>
              {editingId ? 'Actualizar' : 'Agregar Idea'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Nombre de la idea *</label>
          <input className="form-input" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="¿Cuál es tu idea?" />
        </div>
        <div className="form-group">
          <label className="form-label">Estado</label>
          <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
            <option>Sin Empezar</option>
            <option>En Curso</option>
            <option>Listo</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Fecha de creación</label>
          <input className="form-input" value={form.createdAt} readOnly style={{opacity:0.6}} />
        </div>
        <div className="form-group">
          <label className="form-label">Color / Categoría</label>
          <div style={{display:'flex', gap:'8px'}}>
            {NODE_COLORS.map((c, i) => (
              <button key={c} type="button"
                style={{
                  width:32, height:32, borderRadius:'50%', background:c, border:'3px solid',
                  borderColor: form.color === c ? 'var(--dark)' : 'transparent',
                  cursor:'pointer', transition:'transform 0.1s'
                }}
                title={NODE_LABELS[i]}
                onClick={() => setForm(f => ({...f, color: c}))}
              />
            ))}
          </div>
        </div>
        {editingId && nodes.filter(n=>n.id!==editingId).length > 0 && (
          <div className="form-group">
            <label className="form-label">Conectar con...</label>
            <div style={{display:'flex', flexDirection:'column', gap:'6px', maxHeight:'140px', overflowY:'auto'}}>
              {nodes.filter(n => n.id !== editingId).map(n => {
                const currentNode = nodes.find(m => m.id === editingId)
                const isConnected = currentNode?.connections.includes(n.id)
                return (
                  <label key={n.id} style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', padding:'6px 8px', borderRadius:'var(--radius-sm)', background:'var(--cream)'}}>
                    <input type="checkbox" checked={isConnected} onChange={() => toggleConnection(editingId, n.id)} />
                    <span className="node-dot" style={{background:n.color, width:'8px', height:'8px', borderRadius:'50%', display:'inline-block', flexShrink:0}} />
                    <span style={{fontSize:'14px'}}>{n.title}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
