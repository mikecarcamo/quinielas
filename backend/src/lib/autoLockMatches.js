/**
 * autoLockMatches.js
 * Bloquea automáticamente los partidos que ya iniciaron (fecha/hora alcanzada)
 * poniendo 0-0 y status 'en_curso' para evitar nuevos pronósticos.
 * Solo actúa una vez por partido. FIFA sync o admin pueden corregir el marcador real después.
 */

const { recalculateMatchPoints } = require('./scoring');
const { notifyScoreUpdate } = require('./sse');

function getGuatemalaNowISO() {
  const gt = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' }));
  return gt.toISOString().slice(0, 19).replace('T', ' ');
}

function startAutoLockMatches(db) {
  console.log('[AUTO-LOCK] Job de auto-bloqueo de partidos iniciado.');

  async function run() {
    try {
      const now = getGuatemalaNowISO();
      const rows = db.prepare(`
        SELECT id, local, visitante, fecha, hora
        FROM matches
        WHERE status = 'pendiente'
          AND goles_local_real IS NULL
          AND datetime(fecha || ' ' || COALESCE(hora, '00:00')) <= datetime(?)
      `).all(now);

      if (rows.length > 0) {
        const update = db.prepare(`
          UPDATE matches
          SET goles_local_real = 0, goles_visitante_real = 0, status = 'en_curso', resultado_editado = 0
          WHERE id = ?
        `);
        const updateAll = db.transaction((matches) => {
          for (const m of matches) update.run(m.id);
        });
        updateAll(rows);

        for (const m of rows) {
          recalculateMatchPoints(db, m.id);
          const updatedMatch = db.prepare('SELECT * FROM matches WHERE id = ?').get(m.id);
          if (updatedMatch) notifyScoreUpdate(updatedMatch);
          console.log(`[AUTO-LOCK] 🔒 ${m.local} vs ${m.visitante} bloqueado (${m.fecha} ${m.hora || '00:00'})`);
        }
        console.log(`[AUTO-LOCK] ${rows.length} partido(s) bloqueado(s)`);
      }
    } catch (err) {
      console.error('[AUTO-LOCK] Error:', err.message);
    }
    setTimeout(run, 60 * 1000);
  }

  run();
}

module.exports = { startAutoLockMatches };
