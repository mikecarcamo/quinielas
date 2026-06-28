const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'quiniela_secret_2026';
const JWT_EXPIRES = '24h';

router.post('/register', (req, res) => {
  const { nombre_completo, email, password } = req.body;
  if (!nombre_completo || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'El email ya está registrado' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(`
    INSERT INTO users (nombre_completo, email, password, role, is_active)
    VALUES (?, ?, ?, 'user', 0)
  `).run(nombre_completo, email.toLowerCase(), hash);

  res.status(201).json({ message: 'Usuario registrado. Esperando aprobación del administrador.', id: result.lastInsertRowid });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, nombre_completo: user.nombre_completo },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.json({
    token,
    user: {
      id: user.id,
      nombre_completo: user.nombre_completo,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    },
  });
});

router.get('/me', verifyToken, (req, res) => {
  const user = db.prepare('SELECT id, nombre_completo, email, role, is_active, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});

router.get('/users', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin acceso' });
  const users = db.prepare('SELECT id, nombre_completo, email, role, is_active, created_at FROM users ORDER BY created_at DESC').all();
  res.json(users);
});

router.patch('/users/:id/activate', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin acceso' });
  const { id } = req.params;
  const { is_active } = req.body;
  db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(is_active ? 1 : 0, id);
  res.json({ message: 'Estado actualizado' });
});

// Cambio de contraseña por el propio usuario
router.put('/change-password', verifyToken, (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const valid = bcrypt.compareSync(current_password, user.password);
  if (!valid) return res.status(401).json({ error: 'La contraseña actual es incorrecta' });

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
  res.json({ message: 'Contraseña actualizada correctamente' });
});

// Reset de contraseña por admin
router.patch('/users/:id/reset-password', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin acceso' });
  const { new_password } = req.body;
  if (!new_password || new_password.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const hash = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.params.id);
  res.json({ message: `Contraseña de ${user.email} restablecida correctamente` });
});

module.exports = router;
