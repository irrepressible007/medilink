import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import heroImg from '../assets/healthcare_hero.png'
import './AuthPages.css'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
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
    setSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Login failed')
      }

      if (data.token) {
        window.localStorage.setItem('medilink_token', data.token)
      }

      setSuccess('Logged in successfully.')
      navigate('/dashboard')
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
          <h1 className="auth-heading">LOGIN</h1>

          <form onSubmit={handleSubmit}>
            {error && <p className="auth-error-msg">{error}</p>}
            {success && <p className="auth-success-msg">{success}</p>}

            <div className="auth-field-group">
              <label htmlFor="login-email">Email or Phone:</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="auth-field-group">
              <label htmlFor="login-password">Password:</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Signing in…' : 'Submit'}
            </button>
          </form>

          <p className="auth-footer-link">
            Don&apos;t have an account?{' '}
            <Link to="/signup">Signup</Link>
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

export default LoginPage
