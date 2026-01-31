const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { auth, adminAuth } = require('../middleware/auth');

// Obtener todos los reportes (solo admin)
router.get('/', adminAuth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('client', 'name email company')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes' });
  }
});

// Obtener reportes del usuario logueado
router.get('/my-reports', auth, async (req, res) => {
  try {
    const reports = await Report.find({ client: req.user._id })
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reportes' });
  }
});

// Crear reporte
router.post('/', auth, async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      client: req.user._id
    });
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear reporte' });
  }
});

// Actualizar estado de reporte (solo admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('client', 'name email');
    
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar reporte' });
  }
});

// Eliminar reporte (solo admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Reporte no encontrado' });
    }
    res.json({ message: 'Reporte eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar reporte' });
  }
});

module.exports = router;