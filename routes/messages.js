const express = require('express');
const Message = require('../models/Message');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Endpoints para la mensajería entre cliente y enfermero
 */

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Enviar un mensaje en una solicitud de servicio
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_request_id:
 *                 type: string
 *                 description: "ID de la solicitud de servicio"
 *               receiver_id:
 *                 type: string
 *                 description: "ID del usuario receptor del mensaje"
 *               content:
 *                 type: string
 *                 description: "Contenido del mensaje"
 *     responses:
 *       201:
 *         description: Mensaje enviado exitosamente
 *       400:
 *         description: Error al enviar el mensaje
 */
router.post('/', authenticateToken, async (req, res) => {
  const { service_request_id, receiver_id, content } = req.body;

  try {
    // Verificar que el usuario está involucrado en la solicitud de servicio
    const serviceRequest = await ServiceRequest.findOne({
      _id: service_request_id,
      $or: [{ user_id: req.userId }, { nurse_id: req.userId }]
    });

    if (!serviceRequest) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Crear y guardar el mensaje
    const message = new Message({
      service_request_id,
      sender_id: req.userId,
      receiver_id,
      content
    });

    await message.save();

    res.status(201).json({ message: 'Mensaje enviado exitosamente', messageData: message });
  } catch (error) {
    res.status(400).json({ message: 'Error al enviar el mensaje', error: error.message });
  }
});

/**
 * @swagger
 * /messages/{service_request_id}:
 *   get:
 *     summary: Obtener el historial de mensajes de una solicitud de servicio
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: service_request_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     responses:
 *       200:
 *         description: Historial de mensajes de la solicitud de servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   sender_id:
 *                     type: string
 *                   receiver_id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       403:
 *         description: Acceso denegado
 */
router.get('/:service_request_id', authenticateToken, async (req, res) => {
  try {
    // Verificar que el usuario está involucrado en la solicitud de servicio
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.service_request_id,
      $or: [{ user_id: req.userId }, { nurse_id: req.userId }]
    });

    if (!serviceRequest) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    // Obtener todos los mensajes asociados a la solicitud de servicio
    const messages = await Message.find({ service_request_id: req.params.service_request_id }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(400).json({ message: 'Error al obtener el historial de mensajes', error: error.message });
  }
});

module.exports = router;
