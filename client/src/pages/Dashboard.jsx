import { Link } from 'react-router-dom'
import heroImg from '../assets/dashboard_hero.jpg'
import './Dashboard.css'

function Dashboard() {
  return (
    <div className="dashboard-page">
      {/* ── Navbar ── */}
      <nav className="dashboard-navbar">
        <span className="navbar-logo">MediLink</span>
        <ul className="navbar-links">
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/services">Our Services</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/locations">Locations</Link></li>
        </ul>
      </nav>

      {/* ── Hero Section ── */}
      <section
        className="dashboard-hero"
        style={{ backgroundImage: `url(${heroImg})` }}
      >
        <div className="dashboard-hero-overlay" />

        <div className="dashboard-cta-row">
          <Link to="/appointments" className="dashboard-cta-btn" id="btn-book-appointment">
            Book an Appointment
          </Link>
          <Link to="/reports" className="dashboard-cta-btn" id="btn-view-report">
            View Report
          </Link>
          <Link to="/schedule" className="dashboard-cta-btn" id="btn-check-schedule">
            Check Schedule
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Dashboard
