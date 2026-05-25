import { useApp } from '../../context/AppContext'
import { DAYS_ES } from '../../utils/helpers'
import './Widget.css'

const getWeekDays = () => {
  const today = new Date()
  const day = today.getDay()
  const monday = new Date(today)
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const MOCK_EVENTS = {
  1: [{ time: '10:00', title: 'Reunión estrategia Q2' }],
  3: [{ time: '14:00', title: 'Review campañas Meta' }, { time: '16:30', title: 'Call con cliente' }],
  5: [{ time: '09:00', title: 'Entrega informe mensual' }],
}

export default function CalendarWidget() {
  const { connections } = useApp()
  const connected = !!connections?.google_calendar
  const weekDays = getWeekDays()
  const todayNum = new Date().getDate()

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title-row">
          <div className="widget-icon calendar-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div className="widget-title">Google Calendar — Esta Semana</div>
            {!connected && <span className="badge badge-gray" style={{fontSize:'11px'}}>No conectado</span>}
            {connected && <span className="badge badge-green" style={{fontSize:'11px'}}>● Conectado</span>}
          </div>
        </div>
      </div>

      <div className="week-grid">
        {weekDays.map((d, i) => {
          const isToday = d.getDate() === todayNum
          const events = MOCK_EVENTS[i] || []
          return (
            <div key={i} className={`week-day ${isToday ? 'today' : ''}`}>
              <div className="week-day-header">
                <span className="week-day-name">{DAYS_ES[i]}</span>
                <span className="week-day-num">{d.getDate()}</span>
              </div>
              <div className="week-day-events">
                {events.map((ev, j) => (
                  <div key={j} className="week-event">
                    <span className="event-time">{ev.time}</span>
                    <span className="event-title">{ev.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {!connected && (
        <div style={{marginTop:'12px'}}>
          <a href="/settings" className="btn btn-sm btn-secondary" style={{display:'inline-flex', textDecoration:'none'}}>
            Conectar Google Calendar →
          </a>
        </div>
      )}
    </div>
  )
}
