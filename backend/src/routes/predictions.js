const express = require('express');
const db = require('../db/database');
const { verifyToken } = require('../middleware/auth');
const { calculatePoints } = require('../lib/scoring');

const router = express.Router();

// Helper: verifica si el partido ya pasó el deadline (menos de 1h antes del inicio)
// Usa GMT-6 (Guatemala) consistentemente con el frontend
function isMatchClosed(match) {
  // Obtener ahora en GMT-6
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));

  // Parsear fecha y hora del partido en GMT-6
  const [year, month, day] = match.fecha.split('-').map(Number);
  const [hours, minutes] = (match.hora || '00:00').split(':').map(Number);
  const matchDate = new Date(year, month - 1, day, hours, minutes);

  // El partido está cerrado si faltan menos de 120 minutos
  const diffMs = matchDate.getTime() - now.getTime();
  return diffMs < 2 * 60 * 60 * 1000; // menos de 2 horas = cerrado
}

function userCanPredict(userId, eventId) {
  const payment = db.prepare(`
    SELECT id FROM payments WHERE user_id = ? AND event_id = ? AND status = 'aprobado'
  `).get(userId, eventId);
  if (!payment) return { allowed: false, reason: 'Pago no aprobado. Contacta al administrador.' };

  const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(userId);
  if (!user || !user.is_active) return { allowed: false, reason: 'Usuario no habilitado por el administrador.' };

  return { allowed: true };
}

router.post('/bulk', verifyToken, (req, res) => {
  const { event_id, predictions } = req.body;
  const userId = req.user.id;

  if (!event_id || !Array.isArray(predictions) || predictions.length === 0) {
    return res.status(400).json({ error: 'event_id y predictions[] requeridos' });
  }

  const check = userCanPredict(userId, event_id);
  if (!check.allowed) return res.status(403).json({ error: check.reason });

  const existingCount = db.prepare(`
    SELECT COUNT(*) as cnt FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ? AND m.event_id = ?
  `).get(userId, event_id);

  if (existingCount.cnt > 0) {
    return res.status(409).json({ error: 'Ya tienes una quiniela guardada. No se puede modificar.' });
  }

  const insertPred = db.prepare(`
    INSERT OR IGNORE INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos)
    VALUES (?, ?, ?, ?, ?)
  `);

  const saveAll = db.transaction((preds) => {
    for (const p of preds) {
      const match = db.prepare('SELECT * FROM matches WHERE id = ? AND event_id = ?').get(p.match_id, event_id);
      if (!match) throw new Error(`Partido ${p.match_id} no válido`);
      if (match.status === 'finalizado') throw new Error(`Partido ${p.match_id} ya finalizó`);

      // Bloquear si el partido ya tiene marcador (ingresado por admin o FIFA sync)
      if (match.goles_local_real !== null && match.goles_local_real !== undefined) {
        throw new Error(`El partido ${match.local} vs ${match.visitante} ya tiene resultado y no puede modificarse.`);
      }

      if (p.goles_local_pred === undefined || p.goles_visitante_pred === undefined) {
        throw new Error(`Pronóstico incompleto para partido ${p.match_id}`);
      }

      let pts = 0;
      if (match.status === 'finalizado') {
        pts = calculatePoints(
          { goles_local_pred: p.goles_local_pred, goles_visitante_pred: p.goles_visitante_pred },
          { goles_local_real: match.goles_local_real, goles_visitante_real: match.goles_visitante_real }
        );
      }
      insertPred.run(userId, p.match_id, p.goles_local_pred, p.goles_visitante_pred, pts);
    }
  });

  try {
    saveAll(predictions);
    res.status(201).json({ message: 'Quiniela guardada exitosamente' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/bulk', verifyToken, (req, res) => {
  const { event_id, predictions } = req.body;
  const userId = req.user.id;

  if (!event_id || !Array.isArray(predictions) || predictions.length === 0) {
    return res.status(400).json({ error: 'event_id y predictions[] requeridos' });
  }

  const check = userCanPredict(userId, event_id);
  if (!check.allowed) return res.status(403).json({ error: check.reason });

  const upsert = db.prepare(`
    INSERT INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, match_id) DO UPDATE SET
      goles_local_pred = excluded.goles_local_pred,
      goles_visitante_pred = excluded.goles_visitante_pred,
      puntos_obtenidos = excluded.puntos_obtenidos
  `);

  const saveAll = db.transaction((preds) => {
    for (const p of preds) {
      const match = db.prepare('SELECT * FROM matches WHERE id = ? AND event_id = ?').get(p.match_id, event_id);
      if (!match) throw new Error(`Partido ${p.match_id} no válido`);
      if (match.status === 'finalizado') throw new Error(`El partido ${match.local} vs ${match.visitante} ya finalizó.`);

      // Bloquear si el partido ya tiene marcador (ingresado por admin o FIFA sync)
      if (match.goles_local_real !== null && match.goles_local_real !== undefined) {
        throw new Error(`El partido ${match.local} vs ${match.visitante} ya tiene resultado y no puede modificarse.`);
      }

      let pts = 0;
      if (match.status === 'finalizado') {
        pts = calculatePoints(
          { goles_local_pred: p.goles_local_pred, goles_visitante_pred: p.goles_visitante_pred },
          { goles_local_real: match.goles_local_real, goles_visitante_real: match.goles_visitante_real }
        );
      }
      upsert.run(userId, p.match_id, p.goles_local_pred, p.goles_visitante_pred, pts);
    }
  });

  try {
    saveAll(predictions);
    res.json({ message: 'Pronósticos actualizados' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/my/:event_id', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { event_id } = req.params;

  const rows = db.prepare(`
    SELECT
      p.id, p.match_id, p.goles_local_pred, p.goles_visitante_pred, p.puntos_obtenidos,
      m.local, m.visitante, m.fecha, m.grupo, m.fase,
      m.goles_local_real, m.goles_visitante_real, m.status as match_status
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ? AND m.event_id = ?
    ORDER BY m.fecha ASC, m.id ASC
  `).all(userId, event_id);

  res.json(rows);
});

router.get('/user/:user_id/:event_id', verifyToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Sin acceso' });
  const { user_id, event_id } = req.params;

  const rows = db.prepare(`
    SELECT
      p.id, p.match_id, p.goles_local_pred, p.goles_visitante_pred, p.puntos_obtenidos,
      m.local, m.visitante, m.fecha, m.grupo, m.fase,
      m.goles_local_real, m.goles_visitante_real, m.status as match_status
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ? AND m.event_id = ?
    ORDER BY m.fecha ASC
  `).all(user_id, event_id);

  res.json(rows);
});

router.get('/view/:user_id/:event_id', verifyToken, (req, res) => {
  const requesterId = req.user.id;
  const { user_id, event_id } = req.params;

  // Verificar que el solicitante ya tiene quiniela (a menos que sea admin)
  if (req.user.role !== 'admin') {
    const count = db.prepare(`
      SELECT COUNT(*) as cnt FROM predictions p
      JOIN matches m ON p.match_id = m.id
      WHERE p.user_id = ? AND m.event_id = ?
    `).get(requesterId, event_id);
    if (count.cnt === 0) return res.status(403).json({ error: 'Debes ingresar tu quiniela primero para ver la de otros.' });
  }

  const rows = db.prepare(`
    SELECT
      p.id, p.match_id, p.goles_local_pred, p.goles_visitante_pred, p.puntos_obtenidos,
      m.local, m.visitante, m.fecha, m.grupo, m.fase,
      m.goles_local_real, m.goles_visitante_real, m.status as match_status
    FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ? AND m.event_id = ?
    ORDER BY m.fecha ASC, m.id ASC
  `).all(user_id, event_id);

  const owner = db.prepare('SELECT nombre_completo FROM users WHERE id = ?').get(user_id);
  res.json({ predictions: rows, nombre_completo: owner?.nombre_completo || '' });
});

router.get('/has-quinela/:event_id', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { event_id } = req.params;
  const count = db.prepare(`
    SELECT COUNT(*) as cnt FROM predictions p
    JOIN matches m ON p.match_id = m.id
    WHERE p.user_id = ? AND m.event_id = ?
  `).get(userId, event_id);
  res.json({ hasQuiniela: count.cnt > 0 });
});

// Ver todas las predicciones de un partido específico (admin o usuarios con quiniela)
router.get('/match/:match_id', verifyToken, (req, res) => {
  const { match_id } = req.params;
  const userId = req.user.id;

  // Si no es admin, verificar que tenga quiniela propia
  if (req.user.role !== 'admin') {
    const hasPrediction = db.prepare(`
      SELECT COUNT(*) as cnt FROM predictions WHERE user_id = ? LIMIT 1
    `).get(userId);
    if (hasPrediction.cnt === 0) {
      return res.status(403).json({ error: 'Debes ingresar tu quiniela primero para ver la de otros.' });
    }
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(match_id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  const rows = db.prepare(`
    SELECT
      u.id as user_id,
      u.nombre_completo,
      p.goles_local_pred,
      p.goles_visitante_pred,
      p.puntos_obtenidos,
      m.goles_local_real,
      m.goles_visitante_real,
      m.status as match_status
    FROM predictions p
    JOIN users u ON p.user_id = u.id
    JOIN matches m ON p.match_id = m.id
    WHERE p.match_id = ?
    ORDER BY p.puntos_obtenidos DESC, u.nombre_completo ASC
  `).all(match_id);

  res.json({ match, predictions: rows });
});

module.exports = router;
