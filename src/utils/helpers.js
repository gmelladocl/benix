export const formatDate = (dateStr, opts = {}) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return dateStr
  return date.toLocaleDateString('es-CL', {
    day: '2-digit', month: 'long', year: 'numeric', ...opts
  })
}

export const formatDateShort = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date)) return dateStr
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount)
}

export const formatNumber = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n?.toLocaleString('es-CL')
}

export const getInitials = (name = '') => {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export const getGreeting = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

export const todayStr = () => new Date().toISOString().split('T')[0]

export const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()

export const getFirstDayOfMonth = (year, month) => {
  const d = new Date(year, month, 1).getDay()
  return d === 0 ? 6 : d - 1
}

export const MONTHS_ES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

export const DAYS_ES = ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']

export const STATUS_COLORS = {
  'Sin Empezar': 'gray',
  'En Curso': 'blue',
  'Listo': 'green',
  'Publicado': 'purple',
  'Pendiente': 'orange',
  'Activo': 'green',
  'Inactivo': 'gray',
}

export const STATUS_DOT = {
  'Sin Empezar': '#9A9A96',
  'En Curso': '#4F7FFA',
  'Listo': '#25D366',
  'Publicado': '#8B5CF6',
  'Pendiente': '#F59E0B',
}

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2)
