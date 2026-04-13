import { Link } from 'react-router-dom'
import { Navbar, BottomNav } from '../components/Navbar.jsx'
import './Discovery.css'

function DiscoveryHub() {
  return (
    <div className="discovery-page">
      <Navbar />

      <main className="discovery-main ml-fade-up">
        <header className="discovery-header">
          <h1>Medical Directory</h1>
          <p>Find the best healthcare services across Bangladesh.</p>
        </header>

        <div className="discovery-grid">
          <Link to="/discovery/hospitals" className="discovery-card">
            <div className="discovery-card-icon">🏥</div>
            <h2>Hospitals & Clinics</h2>
            <p>Browse top-rated medical facilities by city.</p>
          </Link>

          <Link to="/discovery/services?type=TEST" className="discovery-card">
            <div className="discovery-card-icon">🔬</div>
            <h2>Diagnostic Tests</h2>
            <p>Find blood tests, MRI, CT scans & imaging.</p>
          </Link>

          <Link to="/discovery/services?type=OPERATION" className="discovery-card">
            <div className="discovery-card-icon">⚕️</div>
            <h2>Surgical Operations</h2>
            <p>Compare costs and facilities for operations.</p>
          </Link>

          <Link to="/blood-bank" className="discovery-card">
            <div className="discovery-card-icon">🩸</div>
            <h2>Blood Bank</h2>
            <p>Find live blood donors or request blood urgently.</p>
          </Link>

          <Link to="/appointments" className="discovery-card">
            <div className="discovery-card-icon">👨‍⚕️</div>
            <h2>Find a Specialist</h2>
            <p>Search for doctors and book a consultation.</p>
          </Link>
        </div>
      </main>

      <BottomNav role="patient" />
    </div>
  )
}

export default DiscoveryHub
