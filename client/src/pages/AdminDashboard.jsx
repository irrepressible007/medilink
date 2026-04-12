import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../config.js'
import { Navbar, BottomNav } from '../components/Navbar.jsx'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import './AdminPages.css'

// Fix default leaflet icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

// Custom SOS icon
const sosIcon = new L.DivIcon({
  className: 'sos-marker-pulse',
  html: '🚨',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
})

function AdminDashboard() {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [emergencies, setEmergencies] = useState([])

  const token = localStorage.getItem('medilink_admin_token')

  useEffect(() => {
    fetchEmergencies()
    const interval = setInterval(fetchEmergencies, 10000) // Poll every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchEmergencies = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/emergency/active`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.emergencies) setEmergencies(data.emergencies)
    } catch (err) {
      console.error(err)
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
      const response = await fetch(`${API_BASE_URL}/auth/doctor/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message || 'Failed to register doctor')

      setSuccess(`Doctor "${data.user.fullName}" registered successfully!`)
      setForm({ fullName: '', email: '', password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Default to a central coordinate (e.g. Dhaka or 0,0) if no emergencies
  const center = emergencies.length > 0 
    ? [emergencies[0].latitude, emergencies[0].longitude]
    : [23.8103, 90.4125] // Dhaka, Bangladesh as default Medical Hub

  return (
    <div className="admin-dashboard-page">
      <Navbar role="admin" />

      <div className="admin-content ml-fade-up">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="admin-welcome" style={{ fontSize: '1.8rem', fontWeight: 800 }}>Dispatch & Control Center</h1>
            <p style={{ color: 'var(--text-muted)' }}>Manage remote systems and emergency dispatches.</p>
          </div>
          <button className="ml-btn ml-btn-primary" onClick={() => { setShowForm(!showForm); setSuccess(''); setError('') }}>
            {showForm ? '✕ Close Form' : '＋ Add New Doctor'}
          </button>
        </div>

        {/* ── Active Emergencies Map ── */}
        <div className="ml-card ml-fade-up" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--danger-bg)' }}>
          <div style={{ background: 'var(--danger-bg)', color: '#DC2626', padding: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>
            🚨 Active Emergency SOS Dispatches ({emergencies.length})
          </div>
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%', zIndex: 0 }}>
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              {emergencies.map(em => (
                <Marker key={em.id} position={[em.latitude, em.longitude]} icon={sosIcon}>
                  <Popup>
                    <strong>Emergency Signal</strong><br />
                    Time: {new Date(em.createdAt).toLocaleTimeString()}<br />
                    Patient ID: <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{em.userId}</span><br />
                    Status: <span style={{ color: '#DC2626', fontWeight: 'bold' }}>Awaiting Dispatch</span>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* ── Doctor Signup Form ── */}
        {showForm && (
          <div className="ml-card ml-fade-up" style={{ padding: '2rem', maxWidth: 500, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem' }}>Register New Doctor</h2>

            <form onSubmit={handleSubmit}>
              {success && <div className="ml-alert" style={{ backgroundColor: '#fee2e2', color: '#991b1b', marginBottom: '1rem' }}>✅ {success}</div>}
              {error && <div className="ml-alert ml-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

              <div className="ml-field mb-1">
                <label className="ml-label">Full Name</label>
                <input className="ml-input" name="fullName" type="text" required placeholder="Dr. Jane Smith" value={form.fullName} onChange={handleChange} />
              </div>
              <div className="ml-field mb-1">
                <label className="ml-label">Email Address</label>
                <input className="ml-input" name="email" type="email" required placeholder="doctor@hospital.com" value={form.email} onChange={handleChange} />
              </div>
              <div className="ml-field mb-1">
                <label className="ml-label">Initial Password</label>
                <input className="ml-input" name="password" type="password" required placeholder="Enter secure password" value={form.password} onChange={handleChange} />
              </div>

              <button type="submit" className="ml-btn ml-btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                {submitting ? 'Registering...' : 'Register Doctor Account'}
              </button>
            </form>
          </div>
        )}
      </div>

      <BottomNav role="admin" />
    </div>
  )
}

export default AdminDashboard
