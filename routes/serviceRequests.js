const express = require('express');
const ServiceRequest = require('../models/ServiceRequest');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Endpoints para la gestión de solicitudes de servicio de enfermería
 */

/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una nueva solicitud de servicio
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nurse_id:
 *                 type: string
 *                 description: "ID del enfermero asignado"
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "IDs de los pacientes seleccionados para el servicio"
 *               detalles:
 *                 type: string
 *               fecha:
 *                 type: string
 *                 format: date
 *               tarifa:
 *                 type: number
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada exitosamente
 *       400:
 *         description: Error al crear la solicitud de servicio
 */
router.post('/', authenticateToken, async (req, res) => {
  const { nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;
  try {
    const newRequest = new ServiceRequest({
      user_id: req.userId,
      nurse_id,
      patient_ids,
      detalles,
      fecha,
      tarifa
    });
    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la solicitud de servicio', error: error.message });
  }
});
/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Obtener todas las solicitudes de servicio asignadas al enfermero autenticado
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes de servicio asignadas al enfermero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   user_id:
 *                     type: string
 *                   patient_ids:
 *                     type: array
 *                     items:
 *                       type: string
 *                   detalles:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   tarifa:
 *                     type: number
 *       500:
 *         description: Error al obtener las solicitudes
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
      const requests = await ServiceRequest.find({ nurse_id: req.userId }).populate('patient_ids', 'name fecha_nacimiento genero descripcion');
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las solicitudes', error: error.message });
    }
  });
/**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Endpoints para la gestión de solicitudes de servicio de enfermería
 */

/**
 * @swagger
 * /service-requests:
 *   post:
 *     summary: Crear una nueva solicitud de servicio para un enfermero específico
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nurse_id:
 *                 type: string
 *                 description: "ID del enfermero seleccionado para el servicio"
 *               patient_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: "IDs de los pacientes que requieren atención"
 *               detalles:
 *                 type: string
 *                 description: "Información adicional sobre el servicio"
 *               fecha:
 *                 type: string
 *                 format: date
 *               tarifa:
 *                 type: number
 *                 description: "Tarifa acordada para el servicio"
 *     responses:
 *       201:
 *         description: Solicitud de servicio creada exitosamente
 *       400:
 *         description: Error al crear la solicitud de servicio
 */
router.post('/', authenticateToken, async (req, res) => {
    const { nurse_id, patient_ids, detalles, fecha, tarifa } = req.body;
    try {
      // Verificar que el usuario tenga acceso a los pacientes seleccionados
      const validPatients = await Patient.find({ _id: { $in: patient_ids }, usuario_id: req.userId });
      if (validPatients.length !== patient_ids.length) {
        return res.status(403).json({ message: 'Acceso denegado a uno o más pacientes seleccionados' });
      }
  
      const newRequest = new ServiceRequest({
        user_id: req.userId,
        nurse_id,
        patient_ids,
        detalles,
        fecha,
        tarifa
      });
      await newRequest.save();
      res.status(201).json(newRequest);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear la solicitud de servicio', error: error.message });
    }
  });
  
 /**
 * @swagger
 * tags:
 *   name: ServiceRequests
 *   description: Endpoints para la gestión de solicitudes de servicio de enfermería
 */

/**
 * @swagger
 * /service-requests:
 *   get:
 *     summary: Obtener todas las solicitudes pendientes del enfermero autenticado
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de solicitudes pendientes del enfermero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 properties:
 *                   _id:
 *                     type: string
 *                   patient_ids:
 *                     type: array
 *                     items:
 *                       type: string
 *                   detalles:
 *                     type: string
 *                   fecha:
 *                     type: string
 *                     format: date
 *                   tarifa:
 *                     type: number
 *                   estado:
 *                     type: string
 *       500:
 *         description: Error al obtener las solicitudes
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
      const requests = await ServiceRequest.find({ nurse_id: req.userId, estado: 'pendiente' }).populate('patient_ids', 'name fecha_nacimiento genero descripcion');
      res.status(200).json(requests);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener las solicitudes', error: error.message });
    }
  });
  
  /**
   * @swagger
   * /service-requests/{id}:
   *   put:
   *     summary: Aceptar o rechazar una solicitud de servicio
   *     tags: [ServiceRequests]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID de la solicitud de servicio
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               estado:
   *                 type: string
   *                 enum: [aceptada, rechazada]
   *                 description: "Nuevo estado de la solicitud de servicio"
   *     responses:
   *       200:
   *         description: Estado de la solicitud actualizado exitosamente
   *       400:
   *         description: Error al actualizar la solicitud
   */
  router.put('/:id', authenticateToken, async (req, res) => {
    const { estado } = req.body;
  
    // Validar que el estado es aceptado o rechazado
    if (!['aceptada', 'rechazada'].includes(estado)) {
      return res.status(400).json({ message: 'Estado inválido, debe ser "aceptada" o "rechazada"' });
    }
  
    try {
      const request = await ServiceRequest.findOneAndUpdate(
        { _id: req.params.id, nurse_id: req.userId },
        { estado },
        { new: true }
      );
  
      if (!request) {
        return res.status(404).json({ message: 'Solicitud de servicio no encontrada' });
      }
  
      res.status(200).json({ message: `Solicitud ${estado} exitosamente`, request });
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar la solicitud', error: error.message });
    }
  });
  
/**
 * @swagger
 * /service-requests/{id}/pagar:
 *   put:
 *     summary: Marcar el servicio como pagado por el usuario
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     responses:
 *       200:
 *         description: Servicio marcado como pagado exitosamente
 *       400:
 *         description: Error al procesar el pago
 *       403:
 *         description: Acceso denegado o solicitud no pertenece al usuario
 */
router.put('/:id/pagar', authenticateToken, async (req, res) => {
  try {
    // Verificar que la solicitud pertenece al usuario autenticado y que el pago aún no ha sido realizado
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      user_id: req.userId,
      pago_realizado: false
    });

    if (!serviceRequest) {
      return res.status(403).json({ message: 'Acceso denegado o la solicitud ya está pagada' });
    }

    // Marcar la solicitud como pagada
    serviceRequest.pago_realizado = true;
    await serviceRequest.save();

    res.status(200).json({ message: 'Servicio marcado como pagado exitosamente', serviceRequest });
  } catch (error) {
    res.status(400).json({ message: 'Error al procesar el pago', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}/estado-pago:
 *   get:
 *     summary: Verificar el estado de pago de una solicitud de servicio
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     responses:
 *       200:
 *         description: Estado del pago de la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pago_realizado:
 *                   type: boolean
 *                 pago_liberado:
 *                   type: boolean
 *                 estado:
 *                   type: string
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/:id/estado-pago', authenticateToken, async (req, res) => {
  try {
    // Verificar que la solicitud pertenece al enfermero autenticado
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      nurse_id: req.userId
    });

    if (!serviceRequest) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.status(200).json({
      pago_realizado: serviceRequest.pago_realizado,
      pago_liberado: serviceRequest.pago_liberado,
      estado: serviceRequest.estado
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al obtener el estado del pago', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}/completar:
 *   put:
 *     summary: Marcar el servicio como completado y documentar el estado del paciente
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentacion_servicio:
 *                 type: string
 *                 description: "Detalles y notas del servicio realizado y el estado del paciente"
 *     responses:
 *       200:
 *         description: Servicio marcado como completado y documentado exitosamente
 *       403:
 *         description: Acceso denegado
 *       400:
 *         description: Error al completar el servicio
 */
router.put('/:id/completar', authenticateToken, async (req, res) => {
  const { documentacion_servicio } = req.body;

  try {
    // Verificar que la solicitud pertenece al enfermero autenticado y que el estado es pendiente
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      nurse_id: req.userId,
      estado: 'pendiente'
    });

    if (!serviceRequest) {
      return res.status(403).json({ message: 'Acceso denegado o el servicio ya fue completado' });
    }

    // Actualizar la solicitud a estado completado y agregar documentación del servicio
    serviceRequest.estado = 'completado';
    serviceRequest.documentacion_servicio = documentacion_servicio;
    serviceRequest.pago_liberado = true; // Liberar el pago al completar el servicio
    await serviceRequest.save();

    res.status(200).json({ message: 'Servicio completado y documentado exitosamente', serviceRequest });
  } catch (error) {
    res.status(400).json({ message: 'Error al completar el servicio', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}/reporte:
 *   put:
 *     summary: Completar el reporte del servicio con observaciones y recomendaciones
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *                 description: "Observaciones sobre la atención prestada"
 *               recomendaciones:
 *                 type: string
 *                 description: "Recomendaciones para el usuario"
 *     responses:
 *       200:
 *         description: Reporte completado y enviado al usuario exitosamente
 *       403:
 *         description: Acceso denegado
 *       400:
 *         description: Error al completar el reporte
 */
router.put('/:id/reporte', authenticateToken, async (req, res) => {
  const { observaciones, recomendaciones } = req.body;

  try {
    // Verificar que la solicitud pertenece al enfermero autenticado y que el estado es completado
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      nurse_id: req.userId,
      estado: 'completado'
    });

    if (!serviceRequest) {
      return res.status(403).json({ message: 'Acceso denegado o el servicio no está completado' });
    }

    // Completar el reporte de servicio
    serviceRequest.observaciones = observaciones;
    serviceRequest.recomendaciones = recomendaciones;
    await serviceRequest.save();

    // Notificación simulada (por ejemplo, enviar un correo electrónico o mensaje al usuario)
    // Aquí solo agregamos un mensaje de éxito
    res.status(200).json({
      message: 'Reporte completado y notificado al usuario exitosamente',
      report: {
        observaciones: serviceRequest.observaciones,
        recomendaciones: serviceRequest.recomendaciones
      }
    });
  } catch (error) {
    res.status(400).json({ message: 'Error al completar el reporte', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}:
 *   put:
 *     summary: Aceptar o rechazar una solicitud de servicio
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [aceptada, rechazada]
 *                 description: "Nuevo estado de la solicitud de servicio"
 *     responses:
 *       200:
 *         description: Estado de la solicitud actualizado y notificación enviada
 *       400:
 *         description: Error al actualizar la solicitud
 */
router.put('/:id', authenticateToken, async (req, res) => {
  const { estado } = req.body;

  // Validar que el estado es aceptado o rechazado
  if (!['aceptada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ message: 'Estado inválido, debe ser "aceptada" o "rechazada"' });
  }

  try {
    // Verificar que la solicitud pertenece al enfermero autenticado
    const serviceRequest = await ServiceRequest.findOneAndUpdate(
      { _id: req.params.id, nurse_id: req.userId },
      { estado },
      { new: true }
    );

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud de servicio no encontrada' });
    }

    // Enviar notificación al cliente si el servicio fue aceptado
    if (estado === 'aceptada') {
      const user = await User.findById(serviceRequest.user_id);

      if (user) {
        // Enviar correo electrónico o notificación (simulación aquí)
        // Por ejemplo, podrías usar un servicio de email como SendGrid o Nodemailer
        console.log(`Notificación enviada a ${user.email}: Su solicitud de servicio ha sido aceptada.`);
      }
    }

    res.status(200).json({ message: `Solicitud ${estado} exitosamente`, serviceRequest });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la solicitud', error: error.message });
  }
});

/**
 * @swagger
 * /service-requests/{id}:
 *   get:
 *     summary: Obtener detalles de una solicitud de servicio aceptada
 *     tags: [ServiceRequests]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la solicitud de servicio
 *     responses:
 *       200:
 *         description: Detalles de la solicitud de servicio aceptada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 nurse_name:
 *                   type: string
 *                 horario:
 *                   type: string
 *                 detalles:
 *                   type: string
 *                 patient_info:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     fecha_nacimiento:
 *                       type: string
 *                     genero:
 *                       type: string
 *                     descripcion:
 *                       type: string
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Solicitud no encontrada o no aceptada
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    // Buscar la solicitud de servicio que pertenezca al usuario y que esté en estado "aceptada"
    const serviceRequest = await ServiceRequest.findOne({
      _id: req.params.id,
      user_id: req.userId,
      estado: 'aceptada'
    }).populate('patient_ids', 'name fecha_nacimiento genero descripcion');

    if (!serviceRequest) {
      return res.status(404).json({ message: 'Solicitud no encontrada o aún no aceptada' });
    }

    // Obtener información del enfermero
    const nurse = await Nurse.findById(serviceRequest.nurse_id, 'name');

    if (!nurse) {
      return res.status(404).json({ message: 'Enfermero no encontrado' });
    }

    // Formato de la respuesta con los detalles necesarios
    res.status(200).json({
      nurse_name: nurse.name,
      horario: serviceRequest.fecha, // O ajusta para un formato adecuado
      detalles: serviceRequest.detalles,
      patient_info: serviceRequest.patient_ids
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los detalles del servicio', error: error.message });
  }
});

module.exports = router;