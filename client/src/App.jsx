import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import Dashboard from './pages/Dashboard.jsx'
import BookAppointment from './pages/BookAppointment.jsx'
import ConsultationHistory from './pages/ConsultationHistory.jsx'
import MySchedule from './pages/MySchedule.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import DoctorLoginPage from './pages/DoctorLoginPage.jsx'
import DoctorDashboard from './pages/DoctorDashboard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/appointments" element={<BookAppointment />} />
      <Route path="/consultation-history" element={<ConsultationHistory />} />
      <Route path="/schedule" element={<MySchedule />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

      {/* Doctor */}
      <Route path="/doctor" element={<DoctorLoginPage />} />
      <Route path="/doctor/dashboard" element={<DoctorDashboard />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
