require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || 'C:/PROYECTOS/QUINIELA/backend/data/dei.sqlite');
db.pragma('foreign_keys = ON');

const dummies = db.prepare("SELECT id, email FROM users WHERE email LIKE 'dummy%@quiniela.com'").all();
const dummyIds = dummies.map(u => u.id);

console.log(`Usuarios dummy encontrados: ${dummies.length}`);
if (dummyIds.length === 0) { console.log('Nada que limpiar.'); db.close(); process.exit(0); }

const predCount = db.prepare(`SELECT COUNT(*) as c FROM predictions WHERE user_id IN (${dummyIds.join(',')})`).get();
const payCount  = db.prepare(`SELECT COUNT(*) as c FROM payments WHERE user_id IN (${dummyIds.join(',')})`).get();
const matchWithResult = db.prepare("SELECT COUNT(*) as c FROM matches WHERE goles_local_real IS NOT NULL").get();

console.log(`  Predicciones a eliminar: ${predCount.c}`);
console.log(`  Pagos a eliminar:        ${payCount.c}`);
console.log(`  Partidos con resultado:  ${matchWithResult.c} → se pondrán en NULL`);

const cleanup = db.transaction(() => {
  // 1. Eliminar predicciones de usuarios dummy
  const r1 = db.prepare(`DELETE FROM predictions WHERE user_id IN (${dummyIds.join(',')})`).run();
  console.log(`\nEliminadas ${r1.changes} predicciones`);

  // 2. Eliminar pagos de usuarios dummy
  const r2 = db.prepare(`DELETE FROM payments WHERE user_id IN (${dummyIds.join(',')})`).run();
  console.log(`Eliminados ${r2.changes} pagos`);

  // 3. Eliminar usuarios dummy
  const r3 = db.prepare(`DELETE FROM users WHERE id IN (${dummyIds.join(',')})`).run();
  console.log(`Eliminados ${r3.changes} usuarios`);

  // 4. Limpiar resultados reales de todos los partidos
  const r4 = db.prepare("UPDATE matches SET goles_local_real = NULL, goles_visitante_real = NULL, status = 'pendiente', resultado_editado = 0").run();
  console.log(`Reseteados ${r4.changes} partidos (resultados reales → NULL)`);
});

cleanup();

// Verificar puntos acumulados de usuarios restantes (deben ser 0)
const users = db.prepare("SELECT u.email, COALESCE(SUM(p.puntos_obtenidos),0) as pts FROM users u LEFT JOIN predictions p ON p.user_id = u.id GROUP BY u.id").all();
console.log('\nUsuarios restantes y sus puntos:');
users.forEach(u => console.log(`  ${u.email}: ${u.pts} pts`));

console.log('\n✓ Limpieza completada.');
db.close();
