import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../App'

function AdminDashboard({ user }) {
  const [stats, setStats] = useState({
    totalConsultations: 0,
    pendingConsultations: 0,
    totalReports: 0,
    totalServices: 0
  })
  const [recentConsultations, setRecentConsultations] = useState([])
  const [services, setServices] = useState([])
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [loading, setLoading] = useState(true)

  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: 'desarrollo',
    price: '',
    duration: ''
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      const [consultationsRes, reportsRes, servicesRes] = await Promise.all([
        axios.get(`${API_URL}/consultations`, config),
        axios.get(`${API_URL}/reports`, config),
        axios.get(`${API_URL}/services`)
      ])

      const consultations = consultationsRes.data
      const pending = consultations.filter(c => c.status === 'pending')

      setStats({
        totalConsultations: consultations.length,
        pendingConsultations: pending.length,
        totalReports: reportsRes.data.length,
        totalServices: servicesRes.data.length
      })

      setRecentConsultations(consultations.slice(0, 5))
      setServices(servicesRes.data)
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setLoading(false)
    }
  }

  const handleServiceSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      await axios.post(`${API_URL}/services`, newService, config)
      
      setNewService({
        name: '',
        description: '',
        category: 'desarrollo',
        price: '',
        duration: ''
      })
      setShowServiceForm(false)
      fetchDashboardData()
    } catch (err) {
      console.error('Error al crear servicio:', err)
      alert('Error al crear el servicio')
    }
  }

  const handleDeleteService = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return

    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      await axios.delete(`${API_URL}/services/${id}`, config)
      fetchDashboardData()
    } catch (err) {
      console.error('Error al eliminar servicio:', err)
      alert('Error al eliminar el servicio')
    }
  }

  const handleUpdateConsultation = async (id, status) => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      await axios.put(`${API_URL}/consultations/${id}`, { status }, config)
      fetchDashboardData()
    } catch (err) {
      console.error('Error al actualizar consulta:', err)
    }
  }

  if (loading) {
    return <div className="loading">Cargando...</div>
  }

  return (
    <div className="dashboard">
      <h2>Panel de Administración</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats.totalConsultations}</h3>
          <p>Total Consultas</p>
        </div>
        <div className="stat-card" style={{background: 'linear-gradient(135deg, #f59e0b, #d97706)'}}>
          <h3>{stats.pendingConsultations}</h3>
          <p>Consultas Pendientes</p>
        </div>
        <div className="stat-card" style={{background: 'linear-gradient(135deg, #10b981, #059669)'}}>
          <h3>{stats.totalReports}</h3>
          <p>Total Reportes</p>
        </div>
        <div className="stat-card" style={{background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'}}>
          <h3>{stats.totalServices}</h3>
          <p>Servicios Activos</p>
        </div>
      </div>

      {/* Gestión de Servicios */}
      <div className="card">
        <div className="card-header">
          Gestión de Servicios
          <button 
            onClick={() => setShowServiceForm(!showServiceForm)} 
            className="btn btn-primary"
            style={{float: 'right', marginTop: '-0.5rem'}}
          >
            {showServiceForm ? 'Cancelar' : '+ Nuevo Servicio'}
          </button>
        </div>

        {showServiceForm && (
          <form onSubmit={handleServiceSubmit} style={{marginBottom: '2rem'}}>
            <div className="form-group">
              <label>Nombre del Servicio</label>
              <input
                type="text"
                className="form-control"
                value={newService.name}
                onChange={(e) => setNewService({...newService, name: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                className="form-control"
                value={newService.description}
                onChange={(e) => setNewService({...newService, description: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Categoría</label>
              <select
                className="form-control"
                value={newService.category}
                onChange={(e) => setNewService({...newService, category: e.target.value})}
              >
                <option value="desarrollo">Desarrollo</option>
                <option value="cloud">Cloud</option>
                <option value="seguridad">Seguridad</option>
                <option value="consultoria">Consultoría</option>
                <option value="soporte">Soporte</option>
              </select>
            </div>

            <div className="form-group">
              <label>Precio (USD)</label>
              <input
                type="number"
                className="form-control"
                value={newService.price}
                onChange={(e) => setNewService({...newService, price: e.target.value})}
                required
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Duración</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: 2-4 semanas"
                value={newService.duration}
                onChange={(e) => setNewService({...newService, duration: e.target.value})}
                required
              />
            </div>

            <button type="submit" className="btn btn-success">Crear Servicio</button>
          </form>
        )}

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service._id}>
                  <td><strong>{service.name}</strong></td>
                  <td>{service.category}</td>
                  <td>${service.price}</td>
                  <td>{service.duration}</td>
                  <td>
                    <button
                      onClick={() => handleDeleteService(service._id)}
                      className="btn btn-danger"
                      style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem'}}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Consultas Recientes */}
      <div className="card">
        <div className="card-header">Consultas Pendientes</div>
        {recentConsultations.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recentConsultations.map((consultation) => (
                  <tr key={consultation._id}>
                    <td>{consultation.client?.name || 'Cliente'}</td>
                    <td>{consultation.service?.name || 'Servicio'}</td>
                    <td>
                      <span className={`badge badge-${consultation.status}`}>
                        {consultation.status === 'pending' ? 'Pendiente' :
                         consultation.status === 'approved' ? 'Aprobada' :
                         consultation.status === 'rejected' ? 'Rechazada' :
                         'Completada'}
                      </span>
                    </td>
                    <td>{new Date(consultation.createdAt).toLocaleDateString()}</td>
                    <td>
                      {consultation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateConsultation(consultation._id, 'approved')}
                            className="btn btn-success"
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem'}}
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => handleUpdateConsultation(consultation._id, 'rejected')}
                            className="btn btn-danger"
                            style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem'}}
                          >
                            Rechazar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <p>No hay consultas pendientes</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
