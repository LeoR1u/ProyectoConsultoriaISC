import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Services from './pages/Services'
import Consultations from './pages/Consultations'
import Reports from './pages/Reports'

// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar si hay un usuario logueado
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🚀 Tech Consultoría
            </Link>
            
            <div className="nav-menu">
              {user ? (
                <>
                  <Link to="/services" className="nav-link">Servicios</Link>
                  {user.role === 'admin' ? (
                    <Link to="/admin" className="nav-link">Panel Admin</Link>
                  ) : (
                    <Link to="/dashboard" className="nav-link">Mi Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="nav-link btn-logout">
                    Cerrar Sesión ({user.name})
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="nav-link">Iniciar Sesión</Link>
                  <Link to="/register" className="nav-link btn-register">Registrarse</Link>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={
              user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} /> : <Login setUser={setUser} />
            } />
            <Route path="/register" element={
              user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />
            } />
            <Route path="/services" element={<Services user={user} />} />
            <Route path="/dashboard" element={
              user && user.role === 'client' ? <ClientDashboard user={user} /> : <Navigate to="/login" />
            } />
            <Route path="/admin" element={
              user && user.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />
            } />
            <Route path="/consultations" element={
              user ? <Consultations user={user} /> : <Navigate to="/login" />
            } />
            <Route path="/reports" element={
              user ? <Reports user={user} /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>

        <footer className="footer">
          <p>© 2026 Tech Consultoría. Todos los derechos reservados.</p>
        </footer>
      </div>
    </Router>
  )
}

function Home({ user }) {
  return (
    <div className="home">
      <div className="hero">
        <h1>Bienvenido a Tech Consultoría</h1>
        <p className="subtitle">Soluciones tecnológicas profesionales para tu negocio</p>
        
        {!user && (
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Comenzar ahora</Link>
            <Link to="/services" className="btn btn-secondary">Ver servicios</Link>
          </div>
        )}
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">💻</div>
          <h3>Desarrollo de Software</h3>
          <p>Aplicaciones web y móviles a medida</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">☁️</div>
          <h3>Infraestructura Cloud</h3>
          <p>Migración y gestión en la nube</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Ciberseguridad</h3>
          <p>Protección y auditorías de seguridad</p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Consultoría IT</h3>
          <p>Asesoría técnica especializada</p>
        </div>
      </div>
    </div>
  )
}

export default App
export { API_URL }