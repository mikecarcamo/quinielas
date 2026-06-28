const express = require('express');
const db = require('../db/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { recalculateMatchPoints } = require('../lib/scoring');
const { notifyScoreUpdate } = require('../lib/sse');

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
  const { event_id, local, visitante, fecha, grupo, fase, ganador_penales } = req.body;
  if (!event_id || !local || !visitante || !fecha) {
    return res.status(400).json({ error: 'event_id, local, visitante y fecha son requeridos' });
  }
  const faseValue = fase || 'grupos';
  const result = db.prepare(`
    INSERT INTO matches (event_id, local, visitante, fecha, grupo, fase, ganador_penales)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(event_id, local, visitante, fecha, grupo || null, faseValue, ganador_penales || null);

  res.status(201).json({ id: result.lastInsertRowid, event_id, local, visitante, fecha, grupo, fase: faseValue, ganador_penales });
});

router.patch('/:id/result', verifyToken, requireAdmin, (req, res) => {
  const { goles_local_real, goles_visitante_real, ganador_penales, finalizar } = req.body;
  if (goles_local_real === undefined || goles_visitante_real === undefined) {
    return res.status(400).json({ error: 'Goles local y visitante requeridos' });
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  // finalizar=false → solo actualiza marcador parcial (en_curso), no recalcula puntos
  // finalizar=true o partido no en_curso → finaliza y recalcula puntos
  const debeFinalizarse = finalizar !== false || match.status !== 'en_curso';
  const nuevoStatus = debeFinalizarse ? 'finalizado' : 'en_curso';

  // En fase eliminatoria, al finalizar con empate se requiere ganador de penales
  const isEliminatoria = match.fase && match.fase !== 'grupos';
  const esEmpate = Number(goles_local_real) === Number(goles_visitante_real);
  if (isEliminatoria && esEmpate && nuevoStatus === 'finalizado' && !ganador_penales) {
    return res.status(400).json({ error: 'En fase eliminatoria, empate requiere ganador de penales' });
  }

  db.prepare(`
    UPDATE matches
    SET goles_local_real = ?, goles_visitante_real = ?, ganador_penales = ?, status = ?,
        resultado_editado = ?
    WHERE id = ?
  `).run(goles_local_real, goles_visitante_real, ganador_penales || null, nuevoStatus, debeFinalizarse ? 1 : 0, req.params.id);

  // Recalcular puntos en tiempo real tanto para marcador parcial (en_curso) como finalizado
  recalculateMatchPoints(db, Number(req.params.id));

  const updated = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  notifyScoreUpdate(updated);
  res.json(updated);
});

router.delete('/:id', verifyToken, requireAdmin, (req, res) => {
  db.prepare('DELETE FROM matches WHERE id = ?').run(req.params.id);
  res.json({ message: 'Partido eliminado' });
});

// Resetear resultado de partido no finalizado (corrección de error admin)
router.post('/:id/reset-result', verifyToken, requireAdmin, (req, res) => {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(req.params.id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' })).toISOString().split('T')[0];
  if (match.fecha < hoy) {
    return res.status(400).json({ error: 'Solo se pueden resetear partidos de hoy o futuros' });
  }

  if (match.goles_local_real === null && match.goles_visitante_real === null) {
    return res.status(400).json({ error: 'El partido no tiene marcador' });
  }

  db.prepare(`
    UPDATE matches
    SET goles_local_real = null, goles_visitante_real = null, ganador_penales = null, status = 'pendiente', resultado_editado = 0
    WHERE id = ?
  `).run(req.params.id);

  db.prepare(`
    UPDATE predictions
    SET puntos_obtenidos = 0
    WHERE match_id = ?
  `).run(req.params.id);

  res.json({ message: 'Resultado reseteado correctamente' });
});

module.exports = router;
