import { Link } from 'react-router-dom'
import './LandingPage.css'

const FEATURES = [
  { icon: '🤖', title: 'AI Symptom Checker', desc: 'Describe your symptoms and get instant guidance on which specialist to see, powered by Meta LLaMA 3.', color: '#9333ea' },
  { icon: '📹', title: 'Telemedicine Calls', desc: 'HD video consultations with your doctor from anywhere in the world. Secure, private, real-time.', color: '#0057B7' },
  { icon: '🗺️', title: 'Emergency SOS', desc: 'One-tap GPS-based ambulance dispatch. Your live location is sent to the nearest admin dispatch.', color: '#dc2626' },
  { icon: '🩸', title: 'Blood Bank Network', desc: 'Find compatible blood donors near you on an interactive live map, even in emergencies.', color: '#e11d48' },
  { icon: '📁', title: 'Digital Health Records', desc: 'X-rays, lab results, and clinical notes stored securely in the cloud, always accessible.', color: '#059669' },
  { icon: '💬', title: 'Real-time Messaging', desc: 'Encrypted chat directly with your assigned doctor. Attach files and share vital information.', color: '#0EA5E9' },
]

const STATS = [
  { value: '10K+', label: 'Patients Served' },
  { value: '500+', label: 'Verified Doctors' },
  { value: '99.9%', label: 'Uptime Guaranteed' },
  { value: '24/7', label: 'Emergency Support' },
]

export default function LandingPage() {
  return (
    <div className="landing-page">

      {/* ── Navbar ── */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">⚕️ MediLink</div>
          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#stats">Why Us</a>
            <Link to="/doctor" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>👨‍⚕️ <span style={{ color: 'var(--primary)' }}>For Doctors</span></Link>
          </div>
          <div className="landing-nav-cta">
            <Link to="/login" className="landing-btn-ghost">Sign In</Link>
            <Link to="/signup" className="landing-btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="landing-hero">
        <div className="landing-hero-blob blob-1" />
        <div className="landing-hero-blob blob-2" />
        <div className="landing-hero-blob blob-3" />

        <div className="landing-hero-content">
          <span className="landing-badge">🚀 AI-Powered Healthcare Platform</span>
          <h1 className="landing-hero-title">
            Healthcare That Comes<br />
            <span className="landing-gradient-text">To You</span>
          </h1>
          <p className="landing-hero-sub">
            MediLink connects patients with verified doctors through telemedicine, AI diagnostics, emergency dispatch, and a complete digital health ecosystem — all completely free.
          </p>
          <div className="landing-hero-actions">
            <Link to="/signup" className="landing-cta-btn">
              Start For Free
              <span>→</span>
            </Link>
            <Link to="/blood-bank" className="landing-cta-ghost">
              🩸 Find Blood Donors
            </Link>
          </div>

          <div className="landing-trust-bar">
            <span>🔒 HIPAA-Inspired Security</span>
            <span>•</span>
            <span>⚡ Powered by Groq AI</span>
            <span>•</span>
            <span>🌍 OpenStreetMap Integration</span>
          </div>
        </div>

        {/* Hero visual cards */}
        <div className="landing-hero-visual">
          <div className="landing-hero-card card-main">
            <div className="hero-card-icon">🤖</div>
            <div>
              <p className="hero-card-title">AI Symptom Analysis</p>
              <p className="hero-card-sub">Powered by LLaMA 3.1</p>
            </div>
            <span className="hero-card-badge live">LIVE</span>
          </div>
          <div className="landing-hero-card card-2">
            <div className="hero-card-icon">📹</div>
            <div>
              <p className="hero-card-title">Dr. Ahmed is online</p>
              <p className="hero-card-sub">Video call ready</p>
            </div>
            <span className="hero-card-badge online">●</span>
          </div>
          <div className="landing-hero-card card-3">
            <div className="hero-card-icon">🚨</div>
            <div>
              <p className="hero-card-title">SOS Dispatched</p>
              <p className="hero-card-sub">Ambulance arriving in 4 min</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="landing-stats" id="stats">
        {STATS.map((s, i) => (
          <div key={i} className="landing-stat">
            <span className="landing-stat-value">{s.value}</span>
            <span className="landing-stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ── Features ── */}
      <section className="landing-features" id="features">
        <div className="landing-section-header">
          <h2>Everything You Need in One Place</h2>
          <p>A complete healthcare ecosystem designed for the modern patient.</p>
        </div>
        <div className="landing-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="landing-feature-card" style={{ '--accent-color': f.color }}>
              <div className="landing-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="landing-cta-section">
        <div className="landing-cta-inner">
          <h2>Ready to Take Control of Your Health?</h2>
          <p>Join thousands of patients who trust MediLink for their complete healthcare needs.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2rem' }}>
            <Link to="/signup" className="landing-cta-btn large">
              Create Patient Account →
            </Link>
            <Link to="/doctor/signup" className="landing-cta-btn large" style={{ background: 'linear-gradient(135deg, #1E40AF, #0057B7)' }}>
              Register as Doctor 👨‍⚕️
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-logo" style={{ color: 'white' }}>⚕️ MediLink</div>
          <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>© 2026 MediLink. Built for patients, by design.</p>
          <div className="landing-footer-links">
            <Link to="/login">Patient Login</Link>
            <Link to="/doctor">Doctor Portal</Link>
            <Link to="/blood-bank">Blood Bank</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
