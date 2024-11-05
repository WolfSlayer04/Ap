const express = require('express');
const FAQ = require('../models/FAQ');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Support
 *   description: Endpoints para soporte técnico y ayuda
 */

/**
 * @swagger
 * /support/faq:
 *   get:
 *     summary: Obtener la lista de preguntas frecuentes (FAQ)
 *     tags: [Support]
 *     responses:
 *       200:
 *         description: Lista de preguntas frecuentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   pregunta:
 *                     type: string
 *                   respuesta:
 *                     type: string
 */
router.get('/faq', async (req, res) => {
  try {
    const faqs = await FAQ.find();
    res.status(200).json(faqs);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las preguntas frecuentes', error: error.message });
  }
});

/**
 * @swagger
 * /support/request:
 *   post:
 *     summary: Enviar una solicitud de soporte técnico
 *     tags: [Support]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               asunto:
 *                 type: string
 *                 description: "Asunto de la solicitud de soporte"
 *               mensaje:
 *                 type: string
 *                 description: "Descripción detallada del problema"
 *     responses:
 *       201:
 *         description: Solicitud de soporte enviada exitosamente
 *       400:
 *         description: Error al enviar la solicitud de soporte
 */
router.post('/request', authenticateToken, async (req, res) => {
    const { asunto, mensaje } = req.body;
    const tipo_usuario = req.userRole; // Asume que el rol está en el token (usuario o enfermero)
  
    try {
      const supportRequest = new SupportRequest({
        user_id: req.userId,
        tipo_usuario,
        asunto,
        mensaje
      });
  
      await supportRequest.save();
  
      // Notificación simulada al equipo de soporte
      res.status(201).json({ message: 'Solicitud de soporte enviada exitosamente', supportRequest });
    } catch (error) {
      res.status(400).json({ message: 'Error al enviar la solicitud de soporte', error: error.message });
    }
  });
  
  module.exports = router;
