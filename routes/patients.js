const express = require('express');
const Patient = require('../models/Patient');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Endpoints para la gestión de pacientes
 */

/**
 * @swagger
 * /patients:
 *   get:
 *     summary: Obtener pacientes del usuario autenticado
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   name:
 *                     type: string
 *                   fecha_nacimiento:
 *                     type: string
 *                   genero:
 *                     type: string
 *                   descripcion:
 *                     type: string
 *       500:
 *         description: Error al obtener los pacientes
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const patients = await Patient.find({ usuario_id: req.userId });
    const patientsWithoutID = patients.map(patient => {
      const { _id, ...patientData } = patient.toObject();
      return patientData;
    });
    res.json(patientsWithoutID);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los pacientes' });
  }
});

/**
 * @swagger
 * /patients:
 *   post:
 *     summary: Agregar un nuevo paciente
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               fecha_nacimiento:
 *                 type: string
 *               genero:
 *                 type: string
 *               descripcion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente agregado exitosamente
 *       400:
 *         description: Error al crear el paciente
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const newPatient = new Patient({ ...req.body, usuario_id: req.userId });
    await newPatient.save();
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el paciente', error: error.message });
  }
});

module.exports = router;
