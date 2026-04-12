import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import './MySchedule.css'
import './Dashboard.css'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function parseDate(dateStr) {
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return { day: parseInt(parts[2], 10), month: MONTH_NAMES[parseInt(parts[1], 10) - 1] || '', year: parts[0] }
  }
  return { day: '', month: '', year: '' }
}

function MySchedule() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  const token = window.localStorage.getItem('medilink_token')

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setAppointments(data.appointments || [])
    } catch {
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  // Compute summary counts
  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'pending' || a.status === 'rescheduled').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
  }

  // Filter
  const filtered = filter === 'all'
    ? appointments
    : appointments.filter((a) => {
        if (filter === 'pending') return a.status === 'pending' || a.status === 'rescheduled'
        return a.status === filter
      })

  return (
    <div className="schedule-page">
      {/* ── Navbar ── */}
      <nav className="dashboard-navbar">
        <span className="navbar-logo">MediLink</span>
        <ul className="navbar-links">
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/consultation-history">My History</Link></li>
          <li><Link to="/appointments">Book Appointment</Link></li>
          <li><Link to="/schedule">My Schedule</Link></li>
        </ul>
      </nav>

      {/* ── Summary Row ── */}
      <div className="schedule-header">
        <h1 className="schedule-title">My Schedule</h1>
        <p className="schedule-subtitle">View and track all your upcoming and past appointments.</p>

        <div className="schedule-summary">
          <div className="summary-card">
            <div className="summary-icon total">📋</div>
            <div className="summary-info">
              <span className="summary-count">{counts.total}</span>
              <span className="summary-label">Total</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon pending">⏳</div>
            <div className="summary-info">
              <span className="summary-count">{counts.pending}</span>
              <span className="summary-label">Pending</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon confirmed">✅</div>
            <div className="summary-info">
              <span className="summary-count">{counts.confirmed}</span>
              <span className="summary-label">Confirmed</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon completed">✔️</div>
            <div className="summary-info">
              <span className="summary-count">{counts.completed}</span>
              <span className="summary-label">Completed</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="schedule-filters">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={`filter-tab${filter === f ? ' active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Cards ── */}
      <div className="schedule-container">
        {loading && <div className="schedule-loading">Loading your schedule...</div>}

        {!loading && filtered.length === 0 && (
          <div className="schedule-empty">
            <div className="schedule-empty-icon">📅</div>
            <p>No appointments found{filter !== 'all' ? ` with status "${filter}"` : ''}.</p>
            <p>Book an appointment to get started!</p>
            <Link to="/appointments" className="schedule-empty-link">
              Book an Appointment
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="schedule-cards">
            {filtered.map((apt) => {
              const { day, month } = parseDate(apt.appointmentDate)
              return (
                <div className="schedule-card" key={apt.id}>
                  {/* Date block */}
                  <div className="schedule-date-block">
                    <div className="schedule-date-day">{day}</div>
                    <div className="schedule-date-month">{month}</div>
                  </div>

                  {/* Body */}
                  <div className="schedule-card-body">
                    <div className="schedule-card-top">
                      <h3 className="schedule-card-doctor">
                        {apt.doctorOrService || 'General Consultation'}
                      </h3>
                      <span className="schedule-card-time">🕐 {apt.appointmentTime}</span>
                    </div>
                    <div className="schedule-card-meta">
                      <span>👤 {apt.patientName}</span>
                      {apt.requestFor && <span>📝 {apt.requestFor}</span>}
                      <span>📞 {apt.contactNumber}</span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="schedule-status">
                    <span className={`schedule-badge ${apt.status}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default MySchedule
