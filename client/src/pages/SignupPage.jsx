import { useState } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import heroImg from '../assets/healthcare_hero.png'
import './AuthPages.css'

function SignupPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      }

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Signup failed')
      }

      if (data.token) {
        window.localStorage.setItem('medilink_token', data.token)
      }

      setSuccess('Account created successfully. You can now sign in.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      {/* ---- Left: Form Panel ---- */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          <h1 className="auth-heading">SignUp</h1>

          <form onSubmit={handleSubmit}>
            {error && <p className="auth-error-msg">{error}</p>}
            {success && <p className="auth-success-msg">{success}</p>}

            <div className="auth-field-group">
              <label htmlFor="signup-name">Name:</label>
              <input
                id="signup-name"
                name="fullName"
                type="text"
                required
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="signup-email">Email:</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="signup-password">Password:</label>
              <input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="signup-confirm-password">Confirm Password:</label>
              <input
                id="signup-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Creating…' : 'Submit'}
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/login">Login</Link>
          </p>
        </div>
      </div>

      {/* ---- Right: Hero Image ---- */}
      <div className="auth-hero-panel">
        <img src={heroImg} alt="Healthcare professional with patient" />
      </div>
    </div>
  )
}

export default SignupPage
