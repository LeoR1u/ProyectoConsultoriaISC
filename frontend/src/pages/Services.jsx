import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_URL } from '../App'

function Services({ user }) {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedService, setSelectedService] = useState(null)
  const [consultationData, setConsultationData] = useState({
    description: '',
    budget: '',
    deadline: ''
  })

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`)
      setServices(response.data)
      setLoading(false)
    } catch (err) {
      console.error('Error al cargar servicios:', err)
      setLoading(false)
    }
  }

  const handleRequestConsultation = (service) => {
    if (!user) {
      alert('Debes iniciar sesión para solicitar una consulta')
      navigate('/login')
      return
    }
    setSelectedService(service)
  }

  const handleSubmitConsultation = async (e) => {
    e.preventDefault()
    
    try {
      const token = localStorage.getItem('token')
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      }

      const dataToSend = {
        service: selectedService._id,
        ...consultationData
      }

      await axios.post(`${API_URL}/consultations`, dataToSend, config)
      
      alert('¡Consulta enviada exitosamente!')
      setSelectedService(null)
      setConsultationData({
        description: '',
        budget: '',
        deadline: ''
      })
      navigate('/consultations')
    } catch (err) {
      console.error('Error al enviar consulta:', err)
      alert('Error al enviar la consulta')
    }
  }

  if (loading) {
    return <div className="loading">Cargando servicios...</div>
  }

  return (
    <div>
      <h2 style={{marginBottom: '2rem'}}>Nuestros Servicios</h2>

      {services.length > 0 ? (
        <div className="features">
          {services.map((service) => (
            <div key={service._id} className="card">
              <h3 style={{color: 'var(--primary-color)', marginBottom: '1rem'}}>
                {service.name}
              </h3>
              <p style={{marginBottom: '1rem', color: '#6b7280'}}>
                {service.description}
              </p>
              <div style={{marginBottom: '1rem'}}>
                <span className="badge badge-pending" style={{marginRight: '0.5rem'}}>
                  {service.category}
                </span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)'}}>
                    ${service.price}
                  </p>
                  <p style={{fontSize: '0.875rem', color: '#6b7280'}}>
                    ⏱️ {service.duration}
                  </p>
                </div>
                <button
                  onClick={() => handleRequestConsultation(service)}
                  className="btn btn-primary"
                >
                  Solicitar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>No hay servicios disponibles en este momento</p>
        </div>
      )}

      {/* Modal de Consulta */}
      {selectedService && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="form-container" style={{maxWidth: '600px', margin: '1rem'}}>
            <h2 className="form-title">Solicitar: {selectedService.name}</h2>
            
            <form onSubmit={handleSubmitConsultation}>
              <div className="form-group">
                <label>Descripción del Proyecto</label>
                <textarea
                  className="form-control"
                  value={consultationData.description}
                  onChange={(e) => setConsultationData({...consultationData, description: e.target.value})}
                  placeholder="Describe tu proyecto y requerimientos..."
                  required
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>Presupuesto Estimado (USD)</label>
                <input
                  type="number"
                  className="form-control"
                  value={consultationData.budget}
                  onChange={(e) => setConsultationData({...consultationData, budget: e.target.value})}
                  placeholder="Ej: 5000"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Fecha Límite Deseada</label>
                <input
                  type="date"
                  className="form-control"
                  value={consultationData.deadline}
                  onChange={(e) => setConsultationData({...consultationData, deadline: e.target.value})}
                />
              </div>

              <div style={{display: 'flex', gap: '1rem'}}>
                <button type="submit" className="btn btn-primary" style={{flex: 1}}>
                  Enviar Solicitud
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="btn btn-secondary"
                  style={{flex: 1}}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Services
