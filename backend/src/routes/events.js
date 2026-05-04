const express = require('express');
const db = require('../db/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { all } = req.query;
  const events = all
    ? db.prepare('SELECT * FROM events ORDER BY id ASC').all()
    : db.prepare('SELECT * FROM events WHERE is_active = 1 ORDER BY id ASC').all();
  res.json(events);
});

router.get('/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(event);
});

router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { nombre, precio_entrada } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre requerido' });
  const result = db.prepare('INSERT INTO events (nombre, precio_entrada) VALUES (?, ?)').run(nombre, precio_entrada || 100);
  res.status(201).json({ id: result.lastInsertRowid, nombre, precio_entrada: precio_entrada || 100 });
});

router.patch('/:id', verifyToken, requireAdmin, (req, res) => {
  const { nombre, precio_entrada, is_active } = req.body;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });
  db.prepare('UPDATE events SET nombre = ?, precio_entrada = ?, is_active = ? WHERE id = ?')
    .run(nombre ?? event.nombre, precio_entrada ?? event.precio_entrada, is_active ?? event.is_active, req.params.id);
  res.json(db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id));
});

router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  const matches = db.prepare('SELECT COUNT(*) as cnt FROM matches WHERE event_id = ?').get(req.params.id);
  if (matches.cnt > 0) return res.status(400).json({ error: 'No se puede eliminar: el evento tiene partidos asociados.' });
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ message: 'Evento eliminado' });
});

module.exports = router;
