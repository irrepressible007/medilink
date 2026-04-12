import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import './BookAppointment.css'
import '../pages/Dashboard.css'          /* reuse navbar styles */

function BookAppointment() {
  const [form, setForm] = useState({
    patientName: '',
    dateOfBirth: '',
    gender: '',
    contactNumber: '',
    email: '',
    requestFor: '',
    doctorOrService: '',
    appointmentDate: '',
    appointmentTime: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  // ── Doctor search state ──
  const [doctorSearch, setDoctorSearch] = useState('')
  const [doctors, setDoctors] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const dropdownRef = useRef(null)
  const inputRef = useRef(null)

  // Debounced doctor search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(doctorSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [doctorSearch])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchDoctors = useCallback(async (query) => {
    try {
      setLoadingDoctors(true)
      const params = query ? `?search=${encodeURIComponent(query)}` : ''
      const res = await fetch(`${API_BASE_URL}/doctors${params}`)
      const data = await res.json()
      setDoctors(data.doctors || [])
      setHighlightIndex(-1)
    } catch {
      setDoctors([])
    } finally {
      setLoadingDoctors(false)
    }
  }, [])

  const selectDoctor = (doctor) => {
    setForm((prev) => ({ ...prev, doctorOrService: doctor.fullName }))
    setDoctorSearch(doctor.fullName)
    setShowDropdown(false)
  }

  const handleDoctorInputChange = (e) => {
    const value = e.target.value
    setDoctorSearch(value)
    setForm((prev) => ({ ...prev, doctorOrService: value }))
    setShowDropdown(true)
  }

  const handleDoctorKeyDown = (e) => {
    if (!showDropdown || doctors.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev < doctors.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : doctors.length - 1))
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault()
      selectDoctor(doctors[highlightIndex])
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const token = window.localStorage.getItem('medilink_token')

      const response = await fetch(`${API_BASE_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to submit appointment')
      }

      setSuccess('Appointment request submitted successfully!')
      setForm({
        patientName: '',
        dateOfBirth: '',
        gender: '',
        contactNumber: '',
        email: '',
        requestFor: '',
        doctorOrService: '',
        appointmentDate: '',
        appointmentTime: '',
      })
      setDoctorSearch('')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="appointment-page">
      {/* ── Navbar (shared style) ── */}
      <nav className="dashboard-navbar">
        <span className="navbar-logo">MediLink</span>
        <ul className="navbar-links">
          <li><Link to="/dashboard">Home</Link></li>
          <li><Link to="/services">Our Services</Link></li>
          <li><Link to="/about">About Us</Link></li>
          <li><Link to="/locations">Locations</Link></li>
        </ul>
      </nav>

      {/* ── Form ── */}
      <div className="appointment-wrapper">
        <div className="appointment-card">
          <h1>Appointment Request Form</h1>

          <form className="appointment-form" onSubmit={handleSubmit}>
            {success && <p className="appointment-success">{success}</p>}
            {error && <p className="appointment-error">{error}</p>}

            {/* Row 1 */}
            <div className="form-group">
              <label htmlFor="patientName">Patient Name</label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                placeholder="Full name"
                required
                value={form.patientName}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="dateOfBirth">Date of Birth</label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={form.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            {/* Row 2 */}
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                name="gender"
                required
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber">Contact Number</label>
              <input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                placeholder="e.g. 01XXXXXXXXX"
                required
                value={form.contactNumber}
                onChange={handleChange}
              />
            </div>

            {/* Row 3 */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="requestFor">Request For</label>
              <input
                id="requestFor"
                name="requestFor"
                type="text"
                placeholder="e.g. Consultation, Follow-up"
                value={form.requestFor}
                onChange={handleChange}
              />
            </div>

            {/* Row 4 – Doctor search dropdown */}
            <div className="form-group doctor-search-wrapper" ref={dropdownRef}>
              <label htmlFor="doctorOrService">Doctor or Service</label>
              <div className="doctor-input-container">
                <input
                  ref={inputRef}
                  id="doctorOrService"
                  type="text"
                  placeholder="Search for a doctor..."
                  autoComplete="off"
                  value={doctorSearch}
                  onChange={handleDoctorInputChange}
                  onFocus={() => {
                    setShowDropdown(true)
                    if (doctors.length === 0) fetchDoctors(doctorSearch)
                  }}
                  onKeyDown={handleDoctorKeyDown}
                />
                <span className="doctor-search-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
              </div>

              {showDropdown && (
                <div className="doctor-dropdown">
                  {loadingDoctors && (
                    <div className="doctor-dropdown-item doctor-loading">
                      Searching...
                    </div>
                  )}
                  {!loadingDoctors && doctors.length === 0 && (
                    <div className="doctor-dropdown-item doctor-empty">
                      No doctors found
                    </div>
                  )}
                  {!loadingDoctors &&
                    doctors.map((doc, idx) => (
                      <div
                        key={doc.id}
                        className={`doctor-dropdown-item${idx === highlightIndex ? ' highlighted' : ''}`}
                        onMouseDown={() => selectDoctor(doc)}
                        onMouseEnter={() => setHighlightIndex(idx)}
                      >
                        <span className="doctor-name">{doc.fullName}</span>
                        <span className="doctor-email">{doc.email}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="appointmentDate">Appointment Date</label>
              <input
                id="appointmentDate"
                name="appointmentDate"
                type="date"
                required
                value={form.appointmentDate}
                onChange={handleChange}
              />
            </div>

            {/* Row 5 – single column */}
            <div className="form-group">
              <label htmlFor="appointmentTime">Appointment Time</label>
              <input
                id="appointmentTime"
                name="appointmentTime"
                type="time"
                required
                value={form.appointmentTime}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <div className="appointment-submit-row">
              <button
                type="submit"
                className="appointment-submit-btn"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookAppointment
