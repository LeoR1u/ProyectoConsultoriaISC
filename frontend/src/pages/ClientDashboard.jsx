import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../App'

function ClientDashboard({ user }) {
  const [stats, setStats] = useState({
    consultations: 0,
    reports: 0,
    services: 0
  })
  const [recentConsultations, setRecentConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      // Obtener consultas del usuario
      const consultationsRes = await axios.get(`${API_URL}/consultations/my-consultations`, config)
      const reportsRes = await axios.get(`${API_URL}/reports/my-reports`, config)
      const servicesRes = await axios.get(`${API_URL}/services`)

      setStats({
        consultations: consultationsRes.data.length,
        reports: reportsRes.data.length,
        services: servicesRes.data.length
      })

      setRecentConsultations(consultationsRes.data.slice(0, 5))
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="dashboard">
      <h2>Bienvenido, {user.name}</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.consultations}</h3>
          <p>Consultas Realizadas</p>
        </div>
        <div className="stat-card">
          <h3>{stats.reports}</h3>
          <p>Reportes Enviados</p>
        </div>
        <div className="stat-card">
          <h3>{stats.services}</h3>
          <p>Servicios Disponibles</p>
        </div>
      </div>

      <div className="actions">
        <Link to="/services" className="btn btn-primary">Ver Servicios</Link>
        <Link to="/consultations" className="btn btn-secondary">Mis Consultas</Link>
        <Link to="/reports" className="btn btn-secondary">Mis Reportes</Link>
      </div>

      <div className="card">
        <div className="card-header">Consultas Recientes</div>
        {recentConsultations.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentConsultations.map((consultation) => (
                  <tr key={consultation._id}>
                    <td>{consultation.service?.name || 'Servicio eliminado'}</td>
                    <td>
                      <span className={`badge badge-${consultation.status}`}>
                        {consultation.status === 'pending' ? 'Pendiente' :
                         consultation.status === 'approved' ? 'Aprobada' :
                         consultation.status === 'rejected' ? 'Rechazada' :
                         'Completada'}
                      </span>
                    </td>
                    <td>{new Date(consultation.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <p>No has realizado ninguna consulta aún</p>
            <Link to="/services" className="btn btn-primary" style={{marginTop: '1rem'}}>
              Explorar Servicios
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientDashboard
