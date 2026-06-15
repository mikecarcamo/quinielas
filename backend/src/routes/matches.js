const express = require('express');
const db = require('../db/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { recalculateMatchPoints } = require('../lib/scoring');

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const { event_id, fase, status } = req.query;
  let query = 'SELECT * FROM matches WHERE 1=1';
  const params = [];

  if (event_id) { query += ' AND event_id = ?'; params.push(event_id); }
  if (fase)     { query += ' AND fase = ?';     params.push(fase); }
  if (status)   { query += ' AND status = ?';   params.push(status); }

  query += ' ORDER BY fecha ASC, hora ASC, id ASC';
  const matches = db.prepare(query).all(...params);
  res.json(matches);
});

router.get('/:id', verifyToken, (req, res) => {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
  res.json(match);
});

router.post('/', verifyToken, requireAdmin, (req, res) => {
  const { event_id, local, visitante, fecha, grupo, fase } = req.body;
  if (!event_id || !local || !visitante || !fecha) {
    return res.status(400).json({ error: 'event_id, local, visitante y fecha son requeridos' });
  }
  const result = db.prepare(`
    INSERT INTO matches (event_id, local, visitante, fecha, grupo, fase)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(event_id, local, visitante, fecha, grupo || null, fase || 'grupos');

  res.status(201).json({ id: result.lastInsertRowid, event_id, local, visitante, fecha, grupo, fase });
});

router.patch('/:id/result', verifyToken, requireAdmin, (req, res) => {
  const { goles_local_real, goles_visitante_real, finalizar } = req.body;
  if (goles_local_real === undefined || goles_visitante_real === undefined) {
    return res.status(400).json({ error: 'Goles local y visitante requeridos' });
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  // finalizar=false → solo actualiza marcador parcial (en_curso), no recalcula puntos
  // finalizar=true o partido no en_curso → finaliza y recalcula puntos
  const debeFinalizarse = finalizar !== false || match.status !== 'en_curso';
  const nuevoStatus = debeFinalizarse ? 'finalizado' : 'en_curso';

  db.prepare(`
    UPDATE matches
    SET goles_local_real = ?, goles_visitante_real = ?, status = ?,
        resultado_editado = ?
    WHERE id = ?
  `).run(goles_local_real, goles_visitante_real, nuevoStatus, debeFinalizarse ? 1 : 0, req.params.id);

  // Recalcular puntos en tiempo real tanto para marcador parcial (en_curso) como finalizado
  recalculateMatchPoints(db, Number(req.params.id));

  const updated = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM matches WHERE id = ?').run(req.params.id);
  res.json({ message: 'Partido eliminado' });
});

module.exports = router;
