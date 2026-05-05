/**
 * cleanup-demo.js
 * Elimina TODOS los datos de prueba:
 *  - 40 usuarios dummy (__DEMO__)
 *  - Sus pagos y predicciones
 *  - Resetea los marcadores de todos los partidos a pendiente
 *
 * NO elimina: admins, el evento, ni los partidos del fixture.
 *
 * Uso: node scripts/cleanup-demo.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/database');

const DUMMY_TAG = '__DEMO__';

console.log('🧹 Iniciando limpieza de datos demo...\n');

const cleanup = db.transaction(() => {
  // 1. Obtener IDs de usuarios dummy
  const dummies = db.prepare(`SELECT id FROM users WHERE email LIKE ?`).all(`%${DUMMY_TAG}%`);
  const ids = dummies.map(u => u.id);
  console.log(`👥 Usuarios dummy encontrados: ${ids.length}`);

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');

    // 2. Borrar predicciones de dummy users
    const delPreds = db.prepare(`DELETE FROM predictions WHERE user_id IN (${placeholders})`).run(...ids);
    console.log(`🗑  Predicciones eliminadas: ${delPreds.changes}`);

    // 3. Borrar pagos de dummy users
    const delPays = db.prepare(`DELETE FROM payments WHERE user_id IN (${placeholders})`).run(...ids);
    console.log(`🗑  Pagos eliminados: ${delPays.changes}`);

    // 4. Borrar usuarios dummy
    const delUsers = db.prepare(`DELETE FROM users WHERE id IN (${placeholders})`).run(...ids);
    console.log(`🗑  Usuarios eliminados: ${delUsers.changes}`);
  }

  // 5. Resetear marcadores de partidos a pendiente
  const resetMatches = db.prepare(`
    UPDATE matches
    SET goles_local_real = NULL, goles_visitante_real = NULL,
        status = 'pendiente', resultado_editado = 0
    WHERE status = 'finalizado'
  `).run();
  console.log(`🔄 Partidos reseteados a pendiente: ${resetMatches.changes}`);

  // 6. Resetear puntos de predicciones reales que queden (usuarios reales)
  db.prepare(`UPDATE predictions SET puntos_obtenidos = 0`).run();
  console.log(`🔄 Puntos de predicciones reales reseteados a 0`);
});

try {
  cleanup();
  console.log('\n✅ Limpieza completa. La aplicación está lista para uso en vivo.');
} catch (e) {
  console.error('❌ Error durante la limpieza:', e.message);
  process.exit(1);
}
