const express = require('express');
const Nurse = require('../models/Nurse');
const { authenticateToken, generateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Nurses
 *   description: Endpoints para la gestión de enfermeros
 */

/**
 * @swagger
 * /nurses:
 *   get:
 *     summary: Obtener enfermeros (sin datos sensibles)
 *     tags: [Nurses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de enfermeros
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
 *                   especialidad:
 *                     type: string
 *                   ubicacion:
 *                     type: string
 *                   tarifa:
 *                     type: number
 *                   disponibilidad:
 *                     type: array
 *                     items:
 *                       type: string
 *                   certificados:
 *                     type: array
 *                     items:
 *                       type: string
 *       500:
 *         description: Error en el servidor
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const nurses = await Nurse.find({}, '-user_name -password -_id');
    res.status(200).json(nurses);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

/**
 * @swagger
 * /nurses/search:
 *   get:
 *     summary: Búsqueda de enfermeros con filtros
 *     tags: [Nurses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: especialidad
 *         schema:
 *           type: string
 *         description: Especialidad del enfermero (p. ej., geriatría, cuidados intensivos)
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Ubicación del enfermero para facilitar desplazamientos
 *       - in: query
 *         name: tarifa
 *         schema:
 *           type: number
 *         description: Tarifa máxima diaria del enfermero
 *     responses:
 *       200:
 *         description: Lista de enfermeros que cumplen con los filtros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   name:
 *                     type: string
 *                   especialidad:
 *                     type: string
 *                   ubicacion:
 *                     type: string
 *                   tarifa:
 *                     type: number
 *       500:
 *         description: Error en el servidor
 */
router.get('/search', authenticateToken, async (req, res) => {
  const { especialidad, ubicacion, tarifa } = req.query;

  const filters = {};
  if (especialidad) filters.especialidad = especialidad;
  if (ubicacion) filters.ubicacion = ubicacion;
  if (tarifa) filters.tarifa = { $lte: tarifa };

  try {
    const nurses = await Nurse.find(filters, '-user_name -password -_id');
    res.status(200).json(nurses);
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

/**
 * @swagger
 * /nurses/register:
 *   post:
 *     summary: Registro de enfermero
 *     tags: [Nurses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: "Nombre completo del enfermero"
 *               user_name:
 *                 type: string
 *                 description: "Nombre de usuario del enfermero"
 *               password:
 *                 type: string
 *                 description: "Contraseña del enfermero"
 *               genero:
 *                 type: string
 *                 description: "Género del enfermero"
 *               fecha_nacimiento:
 *                 type: string
 *                 description: "Fecha de nacimiento del enfermero"
 *               tarifa:
 *                 type: number
 *                 description: "Tarifa diaria del enfermero"
 *               certificados:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "Certificados y licencias"
 *               especialidad:
 *                 type: string
 *                 description: "Especialidad profesional"
 *               ubicacion:
 *                 type: string
 *                 description: "Ubicación"
 *               disponibilidad:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia:
 *                       type: string
 *                       description: "Día de la semana"
 *                     horaInicio:
 *                       type: string
 *                       description: "Hora de inicio"
 *                     horaFin:
 *                       type: string
 *                       description: "Hora de fin"
 *     responses:
 *       201:
 *         description: Enfermero registrado exitosamente
 *       400:
 *         description: Error en el registro del enfermero
 */
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      user_name,
      password,
      genero,
      fecha_nacimiento,
      tarifa,
      certificados,
      especialidad,
      ubicacion,
      disponibilidad
    } = req.body;

    const newNurse = new Nurse({
      name,
      user_name,
      password,
      genero,
      fecha_nacimiento,
      tarifa,
      certificados,
      especialidad,
      ubicacion,
      disponibilidad
    });

    await newNurse.save();
    const token = generateToken(newNurse._id);
    res.status(201).json({
      message: 'Enfermero registrado exitosamente',
      nurse: newNurse,
      token: `Bearer ${token}`
    });
  } catch (error) {
    res.status(400).json({ message: 'Error en el registro del enfermero', error: error.message });
  }
});

/**
 * @swagger
 * /nurses/login:
 *   post:
 *     summary: Inicio de sesión de enfermero
 *     tags: [Nurses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: "Nombre de usuario del enfermero"
 *               password:
 *                 type: string
 *                 description: "Contraseña del enfermero"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const nurse = await Nurse.findOne({ user_name, password });
    if (!nurse) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const token = generateToken({ userId: nurse._id, role: 'enfermero' });
    res.json({ token, role: 'enfermero' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
  }
});

/**
 * @swagger
 * /nurses/me/disponibilidad:
 *   put:
 *     summary: Configurar disponibilidad del enfermero
 *     tags: [Nurses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disponibilidad:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dia:
 *                       type: string
 *                     horaInicio:
 *                       type: string
 *                     horaFin:
 *                       type: string
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada exitosamente
 *       400:
 *         description: Error al actualizar disponibilidad
 */
router.put('/me/disponibilidad', authenticateToken, async (req, res) => {
  const { disponibilidad } = req.body;

  try {
    const updatedNurse = await Nurse.findByIdAndUpdate(
      req.userId,
      { disponibilidad },
      { new: true }
    );

    if (!updatedNurse) {
      return res.status(404).json({ message: 'Enfermero no encontrado' });
    }

    res.status(200).json({ message: 'Disponibilidad actualizada exitosamente', disponibilidad: updatedNurse.disponibilidad });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar disponibilidad', error: error.message });
  }
});

/**
 * @swagger
 * /nurses/me:
 *   put:
 *     summary: Actualizar el perfil del enfermero autenticado
 *     tags: [Nurses]
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
 *               tarifa:
 *                 type: number
 *               certificados:
 *                 type: array
 *                 items:
 *                   type: string
 *               especialidad:
 *                 type: string
 *               ubicacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *       404:
 *         description: Enfermero no encontrado
 *       500:
 *         description: Error en el servidor
 */
router.put('/me', authenticateToken, async (req, res) => {
  const { name, tarifa, certificados, especialidad, ubicacion } = req.body;

  try {
    const updatedNurse = await Nurse.findByIdAndUpdate(
      req.userId,
      { name, tarifa, certificados, especialidad, ubicacion },
      { new: true }
    );

    if (!updatedNurse) {
      return res.status(404).json({ message: 'Enfermero no encontrado' });
    }

    res.status(200).json({ message: 'Perfil actualizado exitosamente', nurse: updatedNurse });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
});

module.exports = router;
