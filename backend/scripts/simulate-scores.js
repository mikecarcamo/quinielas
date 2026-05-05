/**
 * simulate-scores.js
 * Simula resultados reales de los 72 partidos, actualizando uno cada minuto.
 * Usa análisis de probabilidad propio para generar marcadores realistas.
 * Recalcula puntos de predicciones automáticamente vía la función de scoring.
 *
 * Uso: node scripts/simulate-scores.js
 * Detener: Ctrl+C
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/database');
const { recalculateMatchPoints } = require('../src/lib/scoring');

// ── Probabilidades de resultado por tipo de partido ────────────────────────
// Basado en estadísticas históricas de Mundiales FIFA (2010-2022)
// Peso: [0-0, 1-0, 0-1, 1-1, 2-0, 0-2, 2-1, 1-2, 2-2, 3-0, 0-3, 3-1, 1-3, 3-2, 4-0, otro]
const OUTCOMES = [
  { s:[0,0], w:3  },
  { s:[1,0], w:14 },
  { s:[0,1], w:12 },
  { s:[1,1], w:11 },
  { s:[2,0], w:11 },
  { s:[0,2], w:9  },
  { s:[2,1], w:11 },
  { s:[1,2], w:9  },
  { s:[2,2], w:5  },
  { s:[3,0], w:4  },
  { s:[0,3], w:3  },
  { s:[3,1], w:3  },
  { s:[1,3], w:2  },
  { s:[3,2], w:2  },
  { s:[2,3], w:2  },
  { s:[4,0], w:1  },
  { s:[0,4], w:1  },
  { s:[4,1], w:1  },
  { s:[1,4], w:1  },
];
const TOTAL_W = OUTCOMES.reduce((a, o) => a + o.w, 0);

function randomScore() {
  let r = Math.random() * TOTAL_W;
  for (const o of OUTCOMES) {
    r -= o.w;
    if (r <= 0) return [...o.s];
  }
  return [1, 1];
}

// ── Obtener evento activo ──────────────────────────────────────────────────
const event = db.prepare("SELECT id FROM events WHERE is_active = 1 ORDER BY id LIMIT 1").get();
if (!event) { console.error('❌ No hay evento activo'); process.exit(1); }

// ── Obtener partidos pendientes (en orden) ─────────────────────────────────
function getPendingMatches() {
  return db.prepare(`
    SELECT id, local, visitante, fecha, hora
    FROM matches
    WHERE event_id = ? AND status = 'pendiente'
    ORDER BY fecha ASC, hora ASC, id ASC
  `).all(event.id);
}

function finalizeMatch(match) {
  const [gl, gv] = randomScore();
  db.prepare(`
    UPDATE matches
    SET goles_local_real = ?, goles_visitante_real = ?, status = 'finalizado', resultado_editado = 0
    WHERE id = ?
  `).run(gl, gv, match.id);
  recalculateMatchPoints(db, match.id);
  console.log(`[${new Date().toLocaleTimeString('es-GT')}] ⚽ ${match.local} ${gl}-${gv} ${match.visitante}  (${match.fecha} ${match.hora || ''})`);
}

// ── Loop principal ─────────────────────────────────────────────────────────
console.log('🚀 Simulador de marcadores iniciado. Se finalizará 1 partido por minuto.');
console.log('   Presiona Ctrl+C para detener.\n');

let pending = getPendingMatches();
console.log(`📋 Partidos pendientes: ${pending.length}`);

if (pending.length === 0) {
  console.log('✅ No hay partidos pendientes. Todos ya están finalizados.');
  process.exit(0);
}

// Finalizar el primero inmediatamente
finalizeMatch(pending.shift());

const interval = setInterval(() => {
  pending = getPendingMatches();
  if (pending.length === 0) {
    console.log('\n🏆 Simulación completa. Todos los partidos han sido finalizados.');
    clearInterval(interval);
    process.exit(0);
  }
  finalizeMatch(pending[0]);
}, 60 * 1000); // cada 60 segundos

process.on('SIGINT', () => {
  console.log('\n⏹  Simulación detenida manualmente.');
  clearInterval(interval);
  process.exit(0);
});
