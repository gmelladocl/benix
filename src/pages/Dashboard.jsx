import TopBar from '../components/Layout/TopBar'
import InstagramWidget from '../components/Dashboard/InstagramWidget'
import TikTokWidget from '../components/Dashboard/TikTokWidget'
import MetaWidget from '../components/Dashboard/MetaWidget'
import CalendarWidget from '../components/Dashboard/CalendarWidget'
import MeetingsWidget from '../components/Dashboard/MeetingsWidget'
import './Dashboard.css'
import '../components/Dashboard/Widget.extra.css'

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <TopBar />
      <div className="app-content">
        <div className="dashboard-grid">
          <InstagramWidget />
          <TikTokWidget />
          <MetaWidget />
          <CalendarWidget />
          <MeetingsWidget />
        </div>
      </div>
    </div>
  )
}
