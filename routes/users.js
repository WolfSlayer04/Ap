const express = require('express');
const User = require('../models/User');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Endpoints para la gestión de usuarios
 */

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Registro de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               user_name:
 *                 type: string
 *               password:
 *                 type: string
 *               foto:
 *                 type: string
 *               verificado:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en el registro
 */
router.post('/register', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    const token = generateToken(newUser._id);
    res.status(201).json({ user: newUser, token });
  } catch (error) {
    res.status(400).json({ message: 'Error al registrar el usuario', error: error.message });
  }
});


/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Inicio de sesión de usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *                 description: "Nombre de usuario o correo electrónico del usuario"
 *               password:
 *                 type: string
 *                 description: "Contraseña del usuario"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', async (req, res) => {
  const { user_name, password } = req.body;

  try {
    const user = await User.findOne({ user_name, password });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar token JWT para el usuario
    const token = generateToken({ userId: user._id, role: 'usuario' });
    res.json({ token, role: 'usuario' });
  } catch (error) {
    res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
  }
});

module.exports = router;

module.exports = router;
/**
 * @swagger
 * /users/panel:
 *   get:
 *     summary: Acceso al panel principal del usuario
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Acceso al panel principal del usuario autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Bienvenido al panel principal"
 *                 opciones:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Buscar Enfermeros", "Mis Pacientes"]
 *       401:
 *         description: No autorizado, token no proporcionado o inválido
 */
router.get('/panel', authenticateToken, (req, res) => {
    res.status(200).json({
      message: "Bienvenido al panel principal",
      opciones: ["Buscar Enfermeros", "Mis Pacientes"]
    });
  });
  