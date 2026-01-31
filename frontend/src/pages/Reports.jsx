import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../App'

function Reports({ user }) {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    priority: 'media'
  })

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      const endpoint = user.role === 'admin' 
        ? `${API_URL}/reports`
        : `${API_URL}/reports/my-reports`

      const response = await axios.get(endpoint, config)
      setReports(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar reportes:', err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      await axios.post(`${API_URL}/reports`, newReport, config)
      
      setNewReport({
        title: '',
        description: '',
        priority: 'media'
      })
      setShowForm(false)
      fetchReports()
    } catch (err) {
      console.error('Error al crear reporte:', err)
      alert('Error al enviar el reporte')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      await axios.put(`${API_URL}/reports/${id}`, { status }, config)
      fetchReports()
    } catch (err) {
      console.error('Error al actualizar reporte:', err)
    }
  }

  const getPriorityBadge = (priority) => {
    const classes = {
      baja: 'badge-approved',
      media: 'badge-pending',
      alta: 'badge-rejected'
    }
    return classes[priority] || 'badge-pending'
  }

  const getPriorityText = (priority) => {
    const text = {
      baja: 'Baja',
      media: 'Media',
      alta: 'Alta'
    }
    return text[priority] || priority
  }

  const getStatusText = (status) => {
    const statusMap = {
      open: 'Abierto',
      in_progress: 'En Progreso',
      resolved: 'Resuelto',
      closed: 'Cerrado'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return <div className="loading">Cargando reportes...</div>
  }

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2>{user.role === 'admin' ? 'Todos los Reportes' : 'Mis Reportes'}</h2>
        {user.role !== 'admin' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Cancelar' : '+ Nuevo Reporte'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card" style={{marginBottom: '2rem'}}>
          <h3 style={{marginBottom: '1rem'}}>Enviar Reporte</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                className="form-control"
                value={newReport.title}
                onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                placeholder="Ej: Error en el sistema de login"
                required
              />
            </div>

            <div className="form-group">
              <label>Descripción del Problema</label>
              <textarea
                className="form-control"
                value={newReport.description}
                onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                placeholder="Describe el problema con el mayor detalle posible..."
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Prioridad</label>
              <select
                className="form-control"
                value={newReport.priority}
                onChange={(e) => setNewReport({...newReport, priority: e.target.value})}
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Enviar Reporte
            </button>
          </form>
        </div>
      )}

      {reports.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {user.role === 'admin' && <th>Cliente</th>}
                <th>Título</th>
                <th>Descripción</th>
                <th>Prioridad</th>
                <th>Estado</th>
                <th>Fecha</th>
                {user.role === 'admin' && <th>Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report._id}>
                  {user.role === 'admin' && (
                    <td>{report.client?.name || 'N/A'}</td>
                  )}
                  <td><strong>{report.title}</strong></td>
                  <td style={{maxWidth: '300px'}}>{report.description}</td>
                  <td>
                    <span className={`badge ${getPriorityBadge(report.priority)}`}>
                      {getPriorityText(report.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${report.status === 'resolved' || report.status === 'closed' ? 'completed' : 'pending'}`}>
                      {getStatusText(report.status)}
                    </span>
                  </td>
                  <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                  {user.role === 'admin' && (
                    <td>
                      {report.status === 'open' && (
                        <button
                          onClick={() => handleUpdateStatus(report._id, 'in_progress')}
                          className="btn btn-primary"
                          style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem', marginRight: '0.5rem'}}
                        >
                          En Progreso
                        </button>
                      )}
                      {report.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(report._id, 'resolved')}
                          className="btn btn-success"
                          style={{padding: '0.25rem 0.75rem', fontSize: '0.875rem'}}
                        >
                          Resolver
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <p>No hay reportes para mostrar</p>
        </div>
      )}
    </div>
  )
}

export default Reports
