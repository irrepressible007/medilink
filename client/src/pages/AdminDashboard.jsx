import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import './AdminPages.css'
import './Dashboard.css'    /* reuse navbar base styles */

function AdminDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

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
      const token = window.localStorage.getItem('medilink_admin_token')

      const response = await fetch(`${API_BASE_URL}/auth/doctor/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to register doctor')
      }

      setSuccess(`Doctor "${data.user.fullName}" registered successfully!`)
      setForm({ fullName: '', email: '', password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="admin-dashboard-page">
      {/* ── Navbar ── */}
      <nav className="admin-navbar">
        <span className="navbar-logo">MediLink Admin</span>
        <ul className="navbar-links">
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/">Logout</Link></li>
        </ul>
      </nav>

      {/* ── Content ── */}
      <div className="admin-content">
        <h1 className="admin-welcome">Welcome, Administrator</h1>

        <div className="admin-actions">
          <button
            className="admin-action-btn"
            onClick={() => { setShowForm(!showForm); setSuccess(''); setError('') }}
          >
            {showForm ? '✕  Close Form' : '＋  Sign Up Doctor'}
          </button>
        </div>

        {/* ── Doctor Signup Form ── */}
        {showForm && (
          <div className="doctor-signup-card">
            <h2>Register New Doctor</h2>

            <form className="doctor-signup-form" onSubmit={handleSubmit}>
              {success && <p className="doctor-signup-success">{success}</p>}
              {error && <p className="doctor-signup-error">{error}</p>}

              <div className="form-group">
                <label htmlFor="doctor-fullName">Full Name</label>
                <input
                  id="doctor-fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Dr. Jane Smith"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-email">Email</label>
                <input
                  id="doctor-email"
                  name="email"
                  type="email"
                  required
                  placeholder="doctor@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-password">Password</label>
                <input
                  id="doctor-password"
                  name="password"
                  type="password"
                  required
                  placeholder="Set a password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="doctor-signup-submit" disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Doctor'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
