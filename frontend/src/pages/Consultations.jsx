import { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../App'

function Consultations({ user }) {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConsultations()
  }, [])

  const fetchConsultations = async () => {
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      const endpoint = user.role === 'admin' 
        ? `${API_URL}/consultations`
        : `${API_URL}/consultations/my-consultations`

      const response = await axios.get(endpoint, config)
      setConsultations(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar consultas:', err)
      setLoading(false)
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Pendiente',
      approved: 'Aprobada',
      rejected: 'Rechazada',
      completed: 'Completada'
    }
    return statusMap[status] || status
  }

  if (loading) {
    return <div className="loading">Cargando consultas...</div>
  }

  return (
    <div>
      <h2 style={{marginBottom: '2rem'}}>
        {user.role === 'admin' ? 'Todas las Consultas' : 'Mis Consultas'}
      </h2>

      {consultations.length > 0 ? (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {user.role === 'admin' && <th>Cliente</th>}
                <th>Servicio</th>
                <th>Descripción</th>
                <th>Presupuesto</th>
                <th>Fecha Límite</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation._id}>
                  {user.role === 'admin' && (
                    <td>{consultation.client?.name || 'N/A'}</td>
                  )}
                  <td><strong>{consultation.service?.name || 'Servicio eliminado'}</strong></td>
                  <td style={{maxWidth: '300px'}}>{consultation.description}</td>
                  <td>{consultation.budget ? `$${consultation.budget}` : 'No especificado'}</td>
                  <td>
                    {consultation.deadline 
                      ? new Date(consultation.deadline).toLocaleDateString()
                      : 'No especificada'
                    }
                  </td>
                  <td>
                    <span className={`badge badge-${consultation.status}`}>
                      {getStatusText(consultation.status)}
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
          <p>No hay consultas para mostrar</p>
          {user.role !== 'admin' && (
            <a href="/services" className="btn btn-primary" style={{marginTop: '1rem'}}>
              Ver Servicios
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default Consultations
