require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/database');
const fs = require('fs');
const path = require('path');

const users = db.prepare(`
  SELECT u.id, u.nombre_completo, u.email
  FROM users u
  JOIN payments pay ON pay.user_id = u.id AND pay.comprobante_url = 'recuperado_pdf'
  WHERE u.role = 'user'
  ORDER BY u.nombre_completo
`).all();

const lines = [];
lines.push(`// seed-produccion.js — generado automáticamente desde PDFs`);
lines.push(`// Inserta los 23 usuarios y sus pronósticos en producción`);
lines.push(`// USO: node scripts/seed-produccion.js`);
lines.push(`require('dotenv').config({ path: require('path').join(__dirname, '../.env') });`);
lines.push(`const bcrypt = require('bcryptjs');`);
lines.push(`const db = require('../src/db/database');`);
lines.push(``);
lines.push(`const PASSWORD_HASH = bcrypt.hashSync('Quiniela2026!', 10);`);
lines.push(`const event = db.prepare("SELECT id FROM events WHERE is_active = 1 ORDER BY id LIMIT 1").get();`);
lines.push(`if (!event) { console.error('No hay evento activo'); process.exit(1); }`);
lines.push(`const EVENT_ID = event.id;`);
lines.push(``);
lines.push(`const insertUser = db.prepare(\`INSERT OR IGNORE INTO users (nombre_completo, email, password, role, is_active) VALUES (?, ?, ?, 'user', 1)\`);`);
lines.push(`const insertPayment = db.prepare(\`INSERT OR IGNORE INTO payments (user_id, event_id, comprobante_url, status) VALUES (?, ?, 'recuperado_pdf', 'aprobado')\`);`);
lines.push(`const insertPred = db.prepare(\`INSERT OR IGNORE INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos) VALUES (?, ?, ?, ?, 0)\`);`);
lines.push(``);
lines.push(`const USUARIOS = [`);

for (const user of users) {
  const preds = db.prepare(`
    SELECT p.match_id, p.goles_local_pred, p.goles_visitante_pred,
           m.local, m.visitante
    FROM predictions p
    JOIN matches m ON m.id = p.match_id
    WHERE p.user_id = ?
    ORDER BY p.match_id
  `).all(user.id);

  lines.push(`  {`);
  lines.push(`    nombre: ${JSON.stringify(user.nombre_completo)},`);
  lines.push(`    email: ${JSON.stringify(user.email)},`);
  lines.push(`    preds: [`);
  for (const p of preds) {
    lines.push(`      { match_id: ${p.match_id}, gl: ${p.goles_local_pred}, gv: ${p.goles_visitante_pred} }, // ${p.local} vs ${p.visitante}`);
  }
  lines.push(`    ]`);
  lines.push(`  },`);
}

lines.push(`];`);
lines.push(``);
lines.push(`let stats = { usuarios: 0, pagos: 0, preds: 0 };`);
lines.push(`db.transaction(() => {`);
lines.push(`  for (const u of USUARIOS) {`);
lines.push(`    insertUser.run(u.nombre, u.email, PASSWORD_HASH);`);
lines.push(`    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);`);
lines.push(`    if (!user) { console.warn('No se pudo crear:', u.email); continue; }`);
lines.push(`    stats.usuarios++;`);
lines.push(`    insertPayment.run(user.id, EVENT_ID);`);
lines.push(`    stats.pagos++;`);
lines.push(`    for (const p of u.preds) {`);
lines.push(`      insertPred.run(user.id, p.match_id, p.gl, p.gv);`);
lines.push(`      stats.preds++;`);
lines.push(`    }`);
lines.push(`  }`);
lines.push(`})();`);
lines.push(``);
lines.push(`console.log('Usuarios insertados:', stats.usuarios);`);
lines.push(`console.log('Pagos aprobados:', stats.pagos);`);
lines.push(`console.log('Pronósticos insertados:', stats.preds);`);
lines.push(`console.log('Contraseña temporal: Quiniela2026!');`);

const output = lines.join('\n');
const outPath = path.join(__dirname, 'seed-produccion.js');
fs.writeFileSync(outPath, output, 'utf8');
console.log(`Generado: ${outPath}`);
console.log(`Usuarios: ${users.length}`);
