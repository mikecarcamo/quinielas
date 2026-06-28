const express = require('express');
const db = require('../db/database');
const { calculatePrizes } = require('../lib/prizes');

const router = express.Router();

router.get('/:event_id', (req, res) => {
  const { event_id } = req.params;

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) return res.status(404).json({ error: 'Evento no encontrado' });

  const ranking = db.prepare(`
    SELECT
      u.id as user_id,
      u.nombre_completo,
      COALESCE(SUM(p.puntos_obtenidos), 0) as total_puntos,
      COUNT(p.id) as total_predicciones
    FROM users u
    JOIN payments pay ON pay.user_id = u.id AND pay.event_id = ? AND pay.status = 'aprobado'
    LEFT JOIN predictions p ON p.user_id = u.id AND p.match_id IN (SELECT id FROM matches WHERE event_id = ?)
    WHERE u.is_active = 1
    GROUP BY u.id
    ORDER BY total_puntos DESC
  `).all(event_id, event_id);

  const totalUsuarios = ranking.length;
  const withPrizes = calculatePrizes(ranking, totalUsuarios, event.precio_entrada);

  res.json({
    event,
    pozo: totalUsuarios * event.precio_entrada,
    total_participantes: totalUsuarios,
    ranking: withPrizes,
  });
});

module.exports = router;
