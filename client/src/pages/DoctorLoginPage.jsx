import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import './AdminPages.css'

function DoctorLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/doctor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed')
      }

      window.localStorage.setItem('medilink_doctor_token', data.token)
      window.localStorage.setItem('medilink_doctor_name', data.user.fullName)
      navigate('/doctor/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="doctor-login-page">
      <div className="doctor-login-card">
        <div className="auth-header">
          <h1 className="auth-title">Doctor Portal</h1>
          <p className="auth-subtitle">Sign in with your doctor credentials</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <p className="auth-error">{error}</p>}

          <div className="auth-field">
            <label htmlFor="doctor-email">Email address</label>
            <input
              id="doctor-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="doctor@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="doctor-password">Password</label>
            <input
              id="doctor-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-button" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DoctorLoginPage
