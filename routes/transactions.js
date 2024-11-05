const express = require('express');
const Transaction = require('../models/Transaction');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Endpoints para la gestión de pagos y facturación
 */

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Obtener el historial de pagos recibidos por el enfermero
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial de pagos del enfermero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   service_request_id:
 *                     type: string
 *                   monto:
 *                     type: number
 *                   fecha_pago:
 *                     type: string
 *                     format: date-time
 *                   estado:
 *                     type: string
 *       403:
 *         description: Acceso denegado
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ nurse_id: req.userId }).sort({ fecha_pago: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el historial de pagos', error: error.message });
  }
});

/**
 * @swagger
 * /transactions/{id}/factura:
 *   post:
 *     summary: Generar una factura para un usuario
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la transacción
 *     responses:
 *       200:
 *         description: Factura generada y enviada exitosamente
 *       404:
 *         description: Transacción no encontrada
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/factura', authenticateToken, async (req, res) => {
    try {
      // Verificar que la transacción pertenece al enfermero autenticado
      const transaction = await Transaction.findOne({ _id: req.params.id, nurse_id: req.userId });
  
      if (!transaction) {
        return res.status(404).json({ message: 'Transacción no encontrada o acceso denegado' });
      }
  
      // Generar la factura (simulado aquí)
      const factura = {
        nurse_id: transaction.nurse_id,
        user_id: transaction.user_id,
        service_request_id: transaction.service_request_id,
        monto: transaction.monto,
        fecha_pago: transaction.fecha_pago,
        estado: transaction.estado,
        fecha_factura: new Date(),
        detalles: 'Servicio de enfermería proporcionado' // Puedes personalizar el contenido de la factura
      };
  
      // Enviar notificación al usuario (esto puede ser un correo o una notificación en la aplicación)
      res.status(200).json({ message: 'Factura generada y enviada exitosamente', factura });
    } catch (error) {
      res.status(500).json({ message: 'Error al generar la factura', error: error.message });
    }
  });
  
  module.exports = router;
  