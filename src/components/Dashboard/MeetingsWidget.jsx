import './Widget.css'

const MOCK_MEETINGS = [
  { time: '10:00', date: 'Hoy', title: 'Reunión estrategia Q2', attendees: 'gmellado, cliente@empresa.cl' },
  { time: '14:00', date: 'Hoy', title: 'Review campañas Meta', attendees: 'gmellado' },
  { time: '09:00', date: 'Viernes', title: 'Entrega informe mensual', attendees: 'gmellado, equipo@agencia.cl' },
]

export default function MeetingsWidget() {
  return (
    <div className="widget">
      <div className="widget-header">
        <div className="widget-title-row">
          <div className="widget-icon meetings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
            </svg>
          </div>
          <div className="widget-title">Próximas Reuniones</div>
        </div>
      </div>

      <div className="meetings-list">
        {MOCK_MEETINGS.map((m, i) => (
          <div key={i} className="meeting-row">
            <div className="meeting-time">
              <span className="meeting-date">{m.date}</span>
              <span className="meeting-hour">{m.time}</span>
            </div>
            <div className="meeting-info">
              <div className="meeting-title">{m.title}</div>
              <div className="meeting-attendees">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                {m.attendees}
              </div>
            </div>
            <div className="meeting-dot" />
          </div>
        ))}
      </div>
    </div>
  )
}
