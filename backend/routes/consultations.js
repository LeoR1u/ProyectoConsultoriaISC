const express = require('express');
const router = express.Router();
const Consultation = require('../models/Consultation');
const { auth, adminAuth } = require('../middleware/auth');

// Obtener todas las consultas (solo admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const consultations = await Consultation.find()
      .populate('client', 'name email company')
      .populate('service', 'name category')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener consultas' });
  }
});

// Obtener consultas del usuario logueado
router.get('/my-consultations', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({ client: req.user._id })
      .populate('service', 'name category price')
      .sort({ createdAt: -1 });
    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener consultas' });
  }
});

// Crear consulta
router.post('/', auth, async (req, res) => {
  try {
    const consultation = new Consultation({
      ...req.body,
      client: req.user._id
    });
    await consultation.save();
    await consultation.populate('service', 'name category');
    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear consulta' });
  }
});

// Actualizar estado de consulta (solo admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
      .populate('client', 'name email')
      .populate('service', 'name category');
    
    if (!consultation) {
      return res.status(404).json({ message: 'Consulta no encontrada' });
    }
    res.json(consultation);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar consulta' });
  }
});

// Eliminar consulta (solo admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const consultation = await Consultation.findByIdAndDelete(req.params.id);
    if (!consultation) {
      return res.status(404).json({ message: 'Consulta no encontrada' });
    }
    res.json({ message: 'Consulta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar consulta' });
  }
});

module.exports = router;