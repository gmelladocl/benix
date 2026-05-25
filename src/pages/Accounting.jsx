import { useState, useMemo } from 'react'
import { storage, KEYS } from '../utils/storage'
import { generateId, todayStr, MONTHS_ES, formatCurrency } from '../utils/helpers'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import './Accounting.css'

const EMPTY_TX = {
  date: todayStr(), description: '', category: 'Ingreso',
  amount: '', client: '', notes: '', status: 'Pagado',
}

const THIS_YEAR = new Date().getFullYear()
const THIS_MONTH = String(new Date().getMonth() + 1).padStart(2, '0')

const SAMPLE_TRANSACTIONS = [
  { id:'s1', date:`${THIS_YEAR}-${THIS_MONTH}-01`, description:'Servicio gestión RRSS', category:'Ingreso', amount:350000, client:'Cliente A', notes:'', status:'Pagado', createdAt: new Date().toISOString() },
  { id:'s2', date:`${THIS_YEAR}-${THIS_MONTH}-05`, description:'Hosting y dominio', category:'Egreso', amount:25000, client:'', notes:'Renovación anual', status:'Pagado', createdAt: new Date().toISOString() },
  { id:'s3', date:`${THIS_YEAR}-${THIS_MONTH}-10`, description:'Consultoría Meta Ads', category:'Ingreso', amount:180000, client:'Cliente B', notes:'', status:'Pendiente', createdAt: new Date().toISOString() },
  { id:'s4', date:`${THIS_YEAR}-${THIS_MONTH}-15`, description:'Software diseño', category:'Egreso', amount:45000, client:'', notes:'Adobe CC', status:'Pagado', createdAt: new Date().toISOString() },
]

export default function Accounting() {
  const { showToast } = useApp()
  const today = new Date()
  const [transactions, setTransactions] = useState(() => {
    const stored = storage.get(KEYS.TRANSACTIONS, null)
    return stored || SAMPLE_TRANSACTIONS
  })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_TX)
  const [editingId, setEditingId] = useState(null)
  const [monthFilter, setMonthFilter] = useState(today.getMonth())
  const [yearFilter, setYearFilter] = useState(today.getFullYear())
  const [catFilter, setCatFilter] = useState('Todos')

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date)
      const matchMonth = d.getMonth() === monthFilter && d.getFullYear() === yearFilter
      const matchCat = catFilter === 'Todos' || t.category === catFilter
      return matchMonth && matchCat
    }).sort((a,b) => new Date(b.date) - new Date(a.date))
  }, [transactions, monthFilter, yearFilter, catFilter])

  const totals = useMemo(() => {
    const ingresos = filtered.filter(t => t.category === 'Ingreso').reduce((s,t)=>s+Number(t.amount),0)
    const egresos = filtered.filter(t => t.category === 'Egreso').reduce((s,t)=>s+Number(t.amount),0)
    const pendiente = filtered.filter(t => t.status === 'Pendiente').reduce((s,t)=>s+Number(t.amount),0)
    return { ingresos, egresos, balance: ingresos - egresos, pendiente }
  }, [filtered])

  const save = () => {
    if (!form.description.trim() || !form.amount) { showToast('Completa los campos requeridos', 'error'); return }
    let updated
    if (editingId) {
      updated = transactions.map(t => t.id === editingId ? { ...t, ...form, amount: Number(form.amount) } : t)
      showToast('Transacción actualizada')
    } else {
      const newTx = { ...form, amount: Number(form.amount), id: generateId(), createdAt: new Date().toISOString() }
      updated = [...transactions, newTx]
      showToast('Transacción guardada')
    }
    setTransactions(updated)
    storage.set(KEYS.TRANSACTIONS, updated)
    setModal(false)
    setEditingId(null)
    setForm(EMPTY_TX)
  }

  const deleteTx = (id) => {
    if (!confirm('¿Eliminar transacción?')) return
    const updated = transactions.filter(t => t.id !== id)
    setTransactions(updated)
    storage.set(KEYS.TRANSACTIONS, updated)
    showToast('Transacción eliminada')
  }

  const exportCSV = () => {
    const rows = [['Fecha','Descripción','Categoría','Monto','Cliente','Estado'],
      ...filtered.map(t=>[t.date,t.description,t.category,t.amount,t.client,t.status])]
    const csv = rows.map(r=>r.join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `benix-contabilidad-${MONTHS_ES[monthFilter]}-${yearFilter}.csv`
    a.click()
  }

  const maxAmount = Math.max(...filtered.map(t=>Number(t.amount)), 1)

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contabilidad</h1>
          <p className="page-subtitle">{MONTHS_ES[monthFilter]} {yearFilter}</p>
        </div>
        <div style={{display:'flex', gap:'10px'}}>
          <button className="btn btn-secondary" onClick={exportCSV}>↓ Exportar CSV</button>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_TX); setEditingId(null); setModal(true) }}>
            + Nueva Transacción
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{marginBottom:'24px'}}>
        {[
          { label:'Ingresos del mes', value: formatCurrency(totals.ingresos), color:'var(--accent)', icon:'↑' },
          { label:'Egresos del mes', value: formatCurrency(totals.egresos), color:'var(--red)', icon:'↓' },
          { label:'Balance neto', value: formatCurrency(totals.balance), color: totals.balance >= 0 ? 'var(--blue)' : 'var(--red)', icon:'=' },
          { label:'Pendiente de cobro', value: formatCurrency(totals.pendiente), color:'var(--orange)', icon:'⏳' },
        ].map((s,i) => (
          <div key={i} className="summary-card">
            <div className="summary-icon" style={{color:s.color, fontSize:'20px'}}>{s.icon}</div>
            <div className="summary-label">{s.label}</div>
            <div className="summary-value" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {filtered.length > 0 && (
        <div className="card" style={{marginBottom:'24px'}}>
          <div className="card-header">
            <h3 className="card-title">Distribución del mes</h3>
          </div>
          <div className="bar-chart">
            {filtered.slice(0, 8).map(t => (
              <div key={t.id} className="bar-item">
                <div className="bar-label">{t.description.slice(0,14)}</div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{
                      width: `${(Number(t.amount) / maxAmount) * 100}%`,
                      background: t.category === 'Ingreso' ? 'var(--accent)' : 'var(--red)',
                    }}
                  />
                </div>
                <div className="bar-value" style={{color: t.category === 'Ingreso' ? 'var(--accent)' : 'var(--red)'}}>
                  {t.category === 'Egreso' ? '-' : '+'}{formatCurrency(Number(t.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar">
        <select className="form-select" style={{width:'auto'}} value={monthFilter} onChange={e => setMonthFilter(Number(e.target.value))}>
          {MONTHS_ES.map((m,i) => <option key={i} value={i}>{m}</option>)}
        </select>
        <select className="form-select" style={{width:'auto'}} value={yearFilter} onChange={e => setYearFilter(Number(e.target.value))}>
          {[2024,2025,2026].map(y => <option key={y}>{y}</option>)}
        </select>
        {['Todos','Ingreso','Egreso'].map(c => (
          <button key={c} className={`btn btn-sm ${catFilter===c?'btn-primary':'btn-secondary'}`} onClick={()=>setCatFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Transactions Table */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💰</div>
          <h3>Sin transacciones</h3>
          <p>No hay transacciones para el período seleccionado</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Descripción</th>
                <th>Categoría</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Monto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td style={{fontSize:'13px', color:'var(--muted)'}}>{new Date(t.date).toLocaleDateString('es-CL')}</td>
                  <td style={{fontWeight:600}}>{t.description}</td>
                  <td><span className={`badge ${t.category === 'Ingreso' ? 'badge-green' : 'badge-red'}`}>{t.category}</span></td>
                  <td style={{fontSize:'13px', color:'var(--mid)'}}>{t.client || '—'}</td>
                  <td><span className={`badge ${t.status === 'Pagado' ? 'badge-green' : 'badge-orange'}`}>{t.status}</span></td>
                  <td>
                    <span style={{fontFamily:'var(--font-brand)', fontWeight:800, color: t.category==='Ingreso'?'var(--accent)':'var(--red)'}}>
                      {t.category === 'Ingreso' ? '+' : '-'}{formatCurrency(Number(t.amount))}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex', gap:'4px'}}>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => {
                        setForm({...t, amount: t.amount.toString()})
                        setEditingId(t.id)
                        setModal(true)
                      }}>✎</button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Eliminar" onClick={() => deleteTx(t.id)}>✕</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => { setModal(false); setEditingId(null) }}
        title={editingId ? 'Editar Transacción' : 'Nueva Transacción'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => { setModal(false); setEditingId(null) }}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </>
        }
      >
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Fecha *</label>
            <input className="form-input" type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} />
          </div>
          <div className="form-group">
            <label className="form-label">Categoría</label>
            <select className="form-select" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
              <option>Ingreso</option>
              <option>Egreso</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Descripción *</label>
          <input className="form-input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Descripción de la transacción" />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Monto (CLP) *</label>
            <input className="form-input" type="number" value={form.amount} onChange={e=>setForm(f=>({...f,amount:e.target.value}))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Estado</label>
            <select className="form-select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
              <option>Pagado</option>
              <option>Pendiente</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Cliente (opcional)</label>
          <input className="form-input" value={form.client} onChange={e=>setForm(f=>({...f,client:e.target.value}))} placeholder="Nombre del cliente" />
        </div>
        <div className="form-group">
          <label className="form-label">Notas</label>
          <textarea className="form-textarea" style={{minHeight:'70px'}} value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Notas adicionales..." />
        </div>
      </Modal>
    </div>
  )
}
