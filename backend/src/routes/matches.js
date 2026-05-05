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

  query += ' ORDER BY fecha ASC, id ASC';
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
  const { goles_local_real, goles_visitante_real } = req.body;
  if (goles_local_real === undefined || goles_visitante_real === undefined) {
    return res.status(400).json({ error: 'Goles local y visitante requeridos' });
  }

  const existing = db.prepare('SELECT status, resultado_editado FROM matches WHERE id = ?').get(req.params.id);
  const esCorreccion = existing && existing.status === 'finalizado' ? 1 : 0;

  db.prepare(`
    UPDATE matches
    SET goles_local_real = ?, goles_visitante_real = ?, status = 'finalizado',
        resultado_editado = ?
    WHERE id = ?
  `).run(goles_local_real, goles_visitante_real, esCorreccion, req.params.id);

  recalculateMatchPoints(db, Number(req.params.id));

  const updated = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM matches WHERE id = ?').run(req.params.id);
  res.json({ message: 'Partido eliminado' });
});

// ENDPOINT TEMPORAL DE LIMPIEZA - ELIMINAR DESPUÉS DE USAR
router.post('/admin-cleanup', verifyToken, requireAdmin, (req, res) => {
  const { secret } = req.body;
  if (secret !== 'cleanup2026') return res.status(403).json({ error: 'No autorizado' });

  const r1 = db.prepare("UPDATE matches SET goles_local_real = NULL, goles_visitante_real = NULL, status = 'pendiente', resultado_editado = 0").run();

  const jose = db.prepare("SELECT id FROM users WHERE email = 'josemiguelcarcamo2007@gmail.com'").get();
  let r2 = { changes: 0 };
  if (jose) {
    r2 = db.prepare('DELETE FROM predictions WHERE user_id = ?').run(jose.id);
  }

  res.json({
    message: 'Limpieza completada',
    partidos_reseteados: r1.changes,
    predicciones_eliminadas: r2.changes,
    usuario: jose ? jose.id : 'no encontrado',
  });
});

module.exports = router;
