import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import { Navbar, BottomNav } from '../components/Navbar.jsx'
import './Discovery.css'

const BD_CITIES = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 
  'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'
]

function HospitalsDirectory() {
  const [hospitals, setHospitals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    const fetchHopsitals = async () => {
      setLoading(true)
      try {
        let url = `${API_BASE_URL}/directory/hospitals?`
        if (search) url += `search=${encodeURIComponent(search)}&`
        if (cityFilter) url += `city=${encodeURIComponent(cityFilter)}`

        const res = await fetch(url)
        const data = await res.json()
        setHospitals(data.hospitals || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchHopsitals, 300)
    return () => clearTimeout(timer)
  }, [search, cityFilter])

  return (
    <div className="discovery-page">
      <Navbar />

      <main className="discovery-main ml-fade-up">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/discovery" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to Hub</Link>
        </div>

        <header className="discovery-header" style={{ textAlign: 'left' }}>
          <h1>🏥 Hospitals & Clinics</h1>
          <p>Find the best medical facilities across Bangladesh.</p>
        </header>

        <div className="dir-toolbar">
          <div className="dir-search-wrap">
            <input 
              type="text" 
              placeholder="Search hospitals by name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="dir-select" 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">All Divisions</option>
            {BD_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading hospitals...</div>
        ) : hospitals.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No hospitals found. Try adjusting your search.</div>
        ) : (
          <div className="dir-list">
            {hospitals.map(h => (
              <div key={h.id} className="dir-item-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2>{h.name}</h2>
                    <div className="dir-item-meta">
                      📍 {h.city} • 📞 {h.contactPhone || 'N/A'}
                    </div>
                  </div>
                  <span className="dir-item-badge">{h.hospitalServices?.length || 0} Services Logged</span>
                </div>
                
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  {h.description || h.address}
                </p>

                {h.hospitalServices && h.hospitalServices.length > 0 && (
                  <div className="dir-services-list">
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Top Services & Prices</h4>
                    {h.hospitalServices.slice(0, 3).map(hs => (
                      <div key={hs.id} className="dir-srv-row">
                        <span className="dir-srv-name">{hs.service.name}</span>
                        <span className="dir-srv-price">৳ {hs.price}</span>
                      </div>
                    ))}
                    {h.hospitalServices.length > 3 && (
                      <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                        + {h.hospitalServices.length - 3} more services
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav role="patient" />
    </div>
  )
}

export default HospitalsDirectory
