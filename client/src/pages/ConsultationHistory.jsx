import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import './ConsultationHistory.css'
import './Dashboard.css'

function ConsultationHistory() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [followUpModal, setFollowUpModal] = useState(null)
  const [reason, setReason] = useState('')
  const [prefDate, setPrefDate] = useState('')
  const [prefTime, setPrefTime] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  const token = window.localStorage.getItem('medilink_token')

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
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

  const openFollowUpModal = (apt) => {
    setFollowUpModal(apt)
    setReason('')
    setPrefDate('')
    setPrefTime('')
    setMessage({ text: '', type: '' })
  }

  const requestFollowUp = async () => {
    if (!reason.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE_URL}/follow-ups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: followUpModal.id,
          reason,
          preferredDate: prefDate || undefined,
          preferredTime: prefTime || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setMessage({ text: 'Follow-up request submitted successfully! Your doctor will be notified.', type: 'success' })
      setFollowUpModal(null)
    } catch (err) {
      setMessage({ text: err.message || 'Something went wrong.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="history-page">
      {/* ── Navbar ── */}
      <nav className="dashboard-navbar">
        <span className="navbar-logo">MediLink</span>
        <ul className="navbar-links">
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/consultation-history">My History</Link></li>
          <li><Link to="/appointments">Book Appointment</Link></li>
        </ul>
      </nav>

      {/* ── Content ── */}
      <div className="history-container">
        <h1 className="history-title">Consultation History</h1>
        <p className="history-subtitle">
          View your past appointments and request follow-ups directly from any consultation.
        </p>

        {message.text && (
          <div className={`history-message ${message.type}`}>
            {message.text}
          </div>
        )}

        {loading && <div className="history-loading">Loading your consultations...</div>}

        {!loading && appointments.length === 0 && (
          <div className="history-empty">
            <div className="history-empty-icon">📋</div>
            <p>No consultations found yet.</p>
            <p>Book your first appointment to get started!</p>
          </div>
        )}

        {!loading && appointments.length > 0 && (
          <div className="history-cards">
            {appointments.map((apt) => (
              <div className="history-card" key={apt.id}>
                <div className={`history-card-accent ${apt.status}`} />
                <div className="history-card-body">
                  <div className="history-card-header">
                    <h3 className="history-card-doctor">
                      {apt.doctorOrService || 'General Consultation'}
                    </h3>
                    <span className={`history-status ${apt.status}`}>
                      {apt.status}
                    </span>
                  </div>

                  <div className="history-card-meta">
                    <span>📅 {apt.appointmentDate}</span>
                    <span>🕐 {apt.appointmentTime}</span>
                    <span>👤 {apt.patientName}</span>
                  </div>

                  {apt.requestFor && (
                    <p className="history-card-reason">
                      <strong>Request:</strong> {apt.requestFor}
                    </p>
                  )}

                  <button
                    className="history-followup-btn"
                    onClick={() => openFollowUpModal(apt)}
                  >
                    📋 Request Follow-Up
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Follow-Up Modal ── */}
      {followUpModal && (
        <div className="followup-overlay" onClick={() => setFollowUpModal(null)}>
          <div className="followup-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Request Follow-Up</h2>
            <p className="followup-modal-sub">
              From your appointment on <strong>{followUpModal.appointmentDate}</strong>
              {followUpModal.doctorOrService && (
                <> with <strong>{followUpModal.doctorOrService}</strong></>
              )}
            </p>

            <div className="followup-field">
              <label htmlFor="followup-reason">Reason *</label>
              <textarea
                id="followup-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why you need a follow-up appointment..."
                rows={3}
              />
            </div>

            <div className="followup-field">
              <label htmlFor="followup-date">Preferred Date (optional)</label>
              <input
                id="followup-date"
                type="date"
                value={prefDate}
                onChange={(e) => setPrefDate(e.target.value)}
              />
            </div>

            <div className="followup-field">
              <label htmlFor="followup-time">Preferred Time (optional)</label>
              <input
                id="followup-time"
                type="time"
                value={prefTime}
                onChange={(e) => setPrefTime(e.target.value)}
              />
            </div>

            <div className="followup-actions">
              <button
                className="followup-cancel-btn"
                onClick={() => setFollowUpModal(null)}
              >
                Cancel
              </button>
              <button
                className="followup-submit-btn"
                onClick={requestFollowUp}
                disabled={submitting || !reason.trim()}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ConsultationHistory
