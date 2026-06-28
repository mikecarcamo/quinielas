/**
 * Calcula los puntos obtenidos por una predicción.
 * @param {{ goles_local_pred: number, goles_visitante_pred: number, pred_ganador_penales?: string }} pred
 * @param {{ goles_local_real: number, goles_visitante_real: number, ganador_penales?: string, fase?: string }} real
 * @returns {number} puntos
 */
function calculatePoints(pred, real) {
  if (
    real.goles_local_real === null ||
    real.goles_visitante_real === null ||
    real.goles_local_real === undefined ||
    real.goles_visitante_real === undefined
  ) {
    return 0;
  }

  let points = 0;

  if (pred.goles_local_pred === real.goles_local_real) points += 5;
  if (pred.goles_visitante_pred === real.goles_visitante_real) points += 5;

  const resultadoReal = Math.sign(real.goles_local_real - real.goles_visitante_real);
  const resultadoPred = Math.sign(pred.goles_local_pred - pred.goles_visitante_pred);
  if (resultadoReal === resultadoPred) points += 2;

  // Puntos extra por ganador en penales en fase eliminatoria
  const isEliminatoria = real.fase && real.fase !== 'grupos';
  const realEmpate = resultadoReal === 0;
  const predEmpate = resultadoPred === 0;
  if (
    isEliminatoria &&
    realEmpate &&
    predEmpate &&
    real.ganador_penales &&
    pred.pred_ganador_penales &&
    real.ganador_penales === pred.pred_ganador_penales
  ) {
    points += 2;
  }

  return points;
}

/**
 * Recalcula y actualiza los puntos de todas las predicciones de un partido.
 * @param {import('better-sqlite3').Database} db
 * @param {number} matchId
 */
function recalculateMatchPoints(db, matchId) {
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match || (match.status !== 'finalizado' && match.status !== 'en_curso')) return;

  const predictions = db.prepare('SELECT * FROM predictions WHERE match_id = ?').all(matchId);
  const update = db.prepare('UPDATE predictions SET puntos_obtenidos = ? WHERE id = ?');

  const updateMany = db.transaction((preds) => {
    for (const p of preds) {
      const pts = calculatePoints(
        {
          goles_local_pred: p.goles_local_pred,
          goles_visitante_pred: p.goles_visitante_pred,
          pred_ganador_penales: p.pred_ganador_penales,
        },
        {
          goles_local_real: match.goles_local_real,
          goles_visitante_real: match.goles_visitante_real,
          ganador_penales: match.ganador_penales,
          fase: match.fase,
        }
      );
      update.run(pts, p.id);
    }
  });

  updateMany(predictions);
}

module.exports = { calculatePoints, recalculateMatchPoints };
