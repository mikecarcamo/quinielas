/**
 * seed-demo.js
 * Crea:
 *  - Usuario admin: mncarcamo@oj.gob.gt / 123456789
 *  - 40 usuarios dummy activos con pago aprobado y quiniela completa (72 partidos)
 *
 * Uso: node scripts/seed-demo.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/db/database');

// ── Probabilidades de goles por partido (análisis propio) ──────────────────
// Distribución realista: la mayoría de partidos terminan 1-0, 1-1, 2-1, 2-0, etc.
function randomScore() {
  const outcomes = [
    [0,0],[1,0],[0,1],[1,1],[2,0],[0,2],[2,1],[1,2],
    [2,2],[3,0],[0,3],[3,1],[1,3],[3,2],[2,3],[4,0],
    [0,4],[4,1],[1,4],[3,3],
  ];
  const weights = [2,12,10,10,10,8,10,8,4,4,3,3,3,2,2,1,1,1,1,1];
  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let i = 0; i < outcomes.length; i++) {
    r -= weights[i];
    if (r <= 0) return outcomes[i];
  }
  return [1,1];
}

// Variación aleatoria ±1 sobre el resultado base para cada usuario
function userPred(base) {
  const delta = () => {
    const r = Math.random();
    if (r < 0.4) return 0;
    if (r < 0.7) return 1;
    return -1;
  };
  return [Math.max(0, base[0] + delta()), Math.max(0, base[1] + delta())];
}

// ── 1. Crear/actualizar admin mncarcamo ────────────────────────────────────
const ADMIN_EMAIL = 'mncarcamo@oj.gob.gt';
const ADMIN_PASS  = '123456789';
const ADMIN_NAME  = 'Administrador MNC';

const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(ADMIN_EMAIL);
if (!existingAdmin) {
  const hash = bcrypt.hashSync(ADMIN_PASS, 10);
  db.prepare(`INSERT INTO users (nombre_completo, email, password, role, is_active)
              VALUES (?, ?, ?, 'admin', 1)`).run(ADMIN_NAME, ADMIN_EMAIL, hash);
  console.log(`✅ Admin creado: ${ADMIN_EMAIL} / ${ADMIN_PASS}`);
} else {
  const hash = bcrypt.hashSync(ADMIN_PASS, 10);
  db.prepare('UPDATE users SET password = ?, role = ?, is_active = 1, nombre_completo = ? WHERE id = ?')
    .run(hash, 'admin', ADMIN_NAME, existingAdmin.id);
  console.log(`✅ Admin actualizado: ${ADMIN_EMAIL}`);
}

// ── 2. Obtener event_id activo ─────────────────────────────────────────────
const event = db.prepare("SELECT id FROM events WHERE is_active = 1 ORDER BY id LIMIT 1").get();
if (!event) { console.error('❌ No hay evento activo'); process.exit(1); }
const EVENT_ID = event.id;
console.log(`📅 Evento activo id: ${EVENT_ID}`);

// ── 3. Obtener partidos ────────────────────────────────────────────────────
const matches = db.prepare('SELECT id FROM matches WHERE event_id = ? ORDER BY fecha ASC, hora ASC, id ASC').all(EVENT_ID);
if (matches.length === 0) { console.error('❌ No hay partidos'); process.exit(1); }
console.log(`⚽ Partidos encontrados: ${matches.length}`);

// Generar resultados "reales" simulados para los 72 partidos
const simulatedResults = matches.map(m => ({ match_id: m.id, score: randomScore() }));

// ── 4. Crear 40 usuarios dummy ─────────────────────────────────────────────
const DUMMY_TAG = '__DEMO__';
const NOMBRES = [
  'Carlos López','María García','José Martínez','Ana Rodríguez','Luis Hernández',
  'Laura Pérez','Miguel González','Sofia Ramirez','Diego Torres','Valentina Flores',
  'Andrés Vargas','Isabella Moreno','Sebastián Jiménez','Camila Ruiz','Daniel Castro',
  'Lucía Romero','Pablo Díaz','Fernanda Álvarez','Emilio Morales','Natalia Gutiérrez',
  'Ricardo Mendoza','Paola Reyes','Fernando Soto','Daniela Cruz','Alejandro Núñez',
  'Mariana Ramos','Rodrigo Ortiz','Valeria Gómez','Esteban Castillo','Gabriela Guerrero',
  'Julián Medina','Claudia Herrera','Tomás Aguilar','Patricia Vega','Mateo Ríos',
  'Elena Sandoval','Oscar Campos','Teresa Domínguez','Nicolás Espinoza','Andrea Peña',
];

const insertUser   = db.prepare(`INSERT OR IGNORE INTO users (nombre_completo, email, password, role, is_active) VALUES (?,?,?,'user',1)`);
const insertPay    = db.prepare(`INSERT OR IGNORE INTO payments (user_id, event_id, comprobante_url, status) VALUES (?,?,'demo_comprobante.pdf','aprobado')`);
const insertPred   = db.prepare(`INSERT OR IGNORE INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos) VALUES (?,?,?,?,0)`);
const hash123      = bcrypt.hashSync('Demo1234!', 10);

let creados = 0;
const seedAll = db.transaction(() => {
  for (let i = 0; i < 40; i++) {
    const email = `demo_user_${i+1}${DUMMY_TAG}@quiniela.test`;
    const nombre = `${NOMBRES[i]} ${DUMMY_TAG}`;

    insertUser.run(nombre, email, hash123);
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) continue;

    insertPay.run(user.id, EVENT_ID);

    for (const r of simulatedResults) {
      const [local, vis] = userPred(r.score);
      insertPred.run(user.id, r.match_id, local, vis);
    }
    creados++;
  }
});

seedAll();
console.log(`✅ ${creados} usuarios dummy creados con pago aprobado y ${matches.length} predicciones cada uno.`);
console.log('');
console.log('Para iniciar la simulación de marcadores:');
console.log('  node scripts/simulate-scores.js');
console.log('');
console.log('Para limpiar todos los datos demo:');
console.log('  node scripts/cleanup-demo.js');
