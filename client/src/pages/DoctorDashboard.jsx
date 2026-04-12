import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import './AdminPages.css'
import './Dashboard.css'

function DoctorDashboard() {
  const doctorName = window.localStorage.getItem('medilink_doctor_name') || 'Doctor'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState({ text: '', type: '' })

  // Reschedule modal state
  const [rescheduleModal, setRescheduleModal] = useState(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [rescheduling, setRescheduling] = useState(false)

  const token = window.localStorage.getItem('medilink_doctor_token')

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/appointments/doctor/all`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to load appointments')
      }

      setAppointments(data.appointments)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  // ── Accept appointment ──
  const handleAccept = async (aptId) => {
    setActionMsg({ text: '', type: '' })
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/doctor/${aptId}/accept`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setActionMsg({ text: `Appointment confirmed! Patient has been notified.`, type: 'success' })
      // Update local state
      setAppointments((prev) =>
        prev.map((a) => (a.id === aptId ? { ...a, status: 'confirmed' } : a))
      )
    } catch (err) {
      setActionMsg({ text: err.message, type: 'error' })
    }
  }

  // ── Open reschedule modal ──
  const openReschedule = (apt) => {
    setRescheduleModal(apt)
    setNewDate(apt.appointmentDate)
    setNewTime(apt.appointmentTime)
    setActionMsg({ text: '', type: '' })
  }

  // ── Submit reschedule ──
  const handleReschedule = async () => {
    if (!newDate || !newTime) return
    setRescheduling(true)
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/doctor/${rescheduleModal.id}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appointmentDate: newDate, appointmentTime: newTime }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      setActionMsg({ text: `Appointment rescheduled! Patient has been notified.`, type: 'success' })
      // Update local state
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === rescheduleModal.id
            ? { ...a, appointmentDate: newDate, appointmentTime: newTime, status: 'rescheduled' }
            : a
        )
      )
      setRescheduleModal(null)
    } catch (err) {
      setActionMsg({ text: err.message, type: 'error' })
    } finally {
      setRescheduling(false)
    }
  }

  return (
    <div className="doctor-dashboard-page">
      {/* ── Navbar ── */}
      <nav className="doctor-navbar">
        <span className="navbar-logo">MediLink Doctor</span>
        <ul className="navbar-links">
          <li><Link to="/doctor/dashboard">Dashboard</Link></li>
          <li><Link to="/doctor/">Logout</Link></li>
        </ul>
      </nav>

      {/* ── Content ── */}
      <div className="doctor-content" style={{ justifyContent: 'flex-start' }}>
        <h1 className="doctor-welcome">Welcome, {doctorName}</h1>
        <p className="doctor-welcome-sub" style={{ marginBottom: '1.25rem' }}>
          Patient Appointments
        </p>

        {/* Action message banner */}
        {actionMsg.text && (
          <div className={`doc-action-msg ${actionMsg.type}`}>
            {actionMsg.type === 'success' ? '✅ ' : '⚠️ '}
            {actionMsg.text}
          </div>
        )}

        {loading && <p style={{ color: '#047857' }}>Loading appointments...</p>}
        {error && <p className="doctor-signup-error" style={{ maxWidth: 600 }}>{error}</p>}

        {!loading && !error && appointments.length === 0 && (
          <p style={{ color: '#6b7280', fontSize: '1rem' }}>No appointments yet.</p>
        )}

        {!loading && appointments.length > 0 && (
          <div className="appointments-table-wrapper">
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Patient Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Request For</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt, i) => (
                  <tr key={apt.id}>
                    <td>{i + 1}</td>
                    <td>{apt.patientName}</td>
                    <td>{apt.email}</td>
                    <td>{apt.contactNumber}</td>
                    <td>{apt.appointmentDate}</td>
                    <td>{apt.appointmentTime}</td>
                    <td>{apt.requestFor || '—'}</td>
                    <td>
                      <span className={`status-badge status-${apt.status}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td>
                      <div className="doc-actions-cell">
                        {(apt.status === 'pending' || apt.status === 'rescheduled') && (
                          <button
                            className="doc-accept-btn"
                            onClick={() => handleAccept(apt.id)}
                            title="Accept this appointment"
                          >
                            ✓ Accept
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            className="doc-reschedule-btn"
                            onClick={() => openReschedule(apt)}
                            title="Reschedule this appointment"
                          >
                            📅 Reschedule
                          </button>
                        )}
                        {apt.status === 'confirmed' && (
                          <span className="doc-confirmed-label">✔ Confirmed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Reschedule Modal ── */}
      {rescheduleModal && (
        <div className="doc-modal-overlay" onClick={() => setRescheduleModal(null)}>
          <div className="doc-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reschedule Appointment</h2>
            <p className="doc-modal-sub">
              Patient: <strong>{rescheduleModal.patientName}</strong>
              <br />
              Current: <strong>{rescheduleModal.appointmentDate}</strong> at{' '}
              <strong>{rescheduleModal.appointmentTime}</strong>
            </p>

            <div className="doc-modal-field">
              <label htmlFor="reschedule-date">New Date</label>
              <input
                id="reschedule-date"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>

            <div className="doc-modal-field">
              <label htmlFor="reschedule-time">New Time</label>
              <input
                id="reschedule-time"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>

            <div className="doc-modal-actions">
              <button
                className="doc-modal-cancel"
                onClick={() => setRescheduleModal(null)}
              >
                Cancel
              </button>
              <button
                className="doc-modal-submit"
                onClick={handleReschedule}
                disabled={rescheduling || !newDate || !newTime}
              >
                {rescheduling ? 'Saving...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
