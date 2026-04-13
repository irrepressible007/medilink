import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { API_BASE_URL } from '../config.js'
import { Navbar, BottomNav } from '../components/Navbar.jsx'
import './Discovery.css'

const BD_CITIES = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 
  'Khulna', 'Barishal', 'Rangpur', 'Mymensingh'
]

function ServicesDirectory() {
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'TEST' // TEST or OPERATION

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true)
      try {
        let url = `${API_BASE_URL}/directory/services?type=${type}&`
        if (search) url += `search=${encodeURIComponent(search)}&`
        if (cityFilter) url += `city=${encodeURIComponent(cityFilter)}`

        const res = await fetch(url)
        const data = await res.json()
        setServices(data.services || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchServices, 300)
    return () => clearTimeout(timer)
  }, [search, cityFilter, type])

  const title = type === 'TEST' ? '🔬 Diagnostic Tests' : '⚕️ Surgical Operations'
  const subtitle = type === 'TEST' 
    ? 'Compare prices for diagnostic tests across the country.'
    : 'Find hospitals equipped for major procedures and compare base costs.'

  return (
    <div className="discovery-page">
      <Navbar />

      <main className="discovery-main ml-fade-up">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/discovery" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>← Back to Hub</Link>
        </div>

        <header className="discovery-header" style={{ textAlign: 'left' }}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </header>

        <div className="dir-toolbar">
          <div className="dir-search-wrap">
            <input 
              type="text" 
              placeholder={`Search ${type.toLowerCase()}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            className="dir-select" 
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            <option value="">Any City in BD</option>
            {BD_CITIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
        ) : services.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No records found. Try adjusting your filters.</div>
        ) : (
          <div className="dir-list">
            {services.map(s => (
              <div key={s.id} className="dir-item-card">
                <h2>{s.name}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  {s.description}
                </p>

                {s.hospitalServices && s.hospitalServices.length > 0 ? (
                  <div className="dir-services-list">
                    <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Available at {s.hospitalServices.length} Location{s.hospitalServices.length > 1 ? 's' : ''} {cityFilter && `in ${cityFilter}`}
                    </h4>
                    {s.hospitalServices.map(hs => (
                      <div key={hs.id} className="dir-srv-row">
                        <div>
                          <div className="dir-srv-name">{hs.hospital.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hs.hospital.city}</div>
                        </div>
                        <span className="dir-srv-price">৳ {hs.price}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="dir-services-list" style={{ textAlign: 'center', color: 'var(--text-muted)', background: 'transparent', border: '1px dashed var(--border)' }}>
                    No hospitals found offering this {type.toLowerCase()} matching your filters.
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

export default ServicesDirectory
