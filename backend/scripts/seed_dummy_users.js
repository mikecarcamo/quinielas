require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const db = new Database(process.env.DB_PATH || 'C:/PROYECTOS/QUINIELA/backend/data/dei.sqlite');
db.pragma('foreign_keys = ON');

const EVENT_ID = 1;
const PASSWORD_HASH = bcrypt.hashSync('123456789', 10);

const NAMES = [
  'Carlos Mendoza','Ana Pérez','Roberto Flores','María López','Diego Ramírez',
  'Sofía Torres','Fernando García','Valentina Ruiz','Andrés Morales','Camila Jiménez',
  'Pablo Herrera','Lucía Castro','Sebastián Vargas','Daniela Reyes','Mateo Guzmán',
  'Isabella Sánchez','Alejandro Romero','Gabriela Núñez','Nicolás Ortega','Mariana Espinoza',
  'Emilio Fuentes','Patricia Mendez','Ricardo Aguilar','Natalia Vega','Javier Paredes',
  'Carolina Serrano','Marcos Delgado','Fernanda Cruz','Rodrigo Lara','Adriana Peña',
];

const matches = db.prepare('SELECT id, goles_local_real, goles_visitante_real, status FROM matches WHERE event_id = ?').all(EVENT_ID);

// Genera un marcador aleatorio sesgado (0-3 goles por equipo, más comunes 0-1)
function randGoals() {
  const w = [0,0,0,1,1,1,1,2,2,3];
  return w[Math.floor(Math.random() * w.length)];
}

// Para partidos finalizados, genera predicción con cierto % de acierto
function predForMatch(m, accuracy) {
  const gl = randGoals();
  const gv = randGoals();
  if (m.status === 'finalizado' && Math.random() < accuracy) {
    // acierto parcial o total
    const hitLocal  = Math.random() < 0.4 ? m.goles_local_real  : gl;
    const hitVisit  = Math.random() < 0.4 ? m.goles_visitante_real : gv;
    return { gl: hitLocal, gv: hitVisit };
  }
  return { gl, gv };
}

// Calcula puntos igual que scoring.js
function calcPoints(glPred, gvPred, glReal, gvReal) {
  if (glReal === null || glReal === undefined) return 0;
  let pts = 0;
  if (glPred === glReal) pts += 5;
  if (gvPred === gvReal) pts += 5;
  if (Math.sign(glPred - gvPred) === Math.sign(glReal - gvReal)) pts += 2;
  return pts;
}

const insertUser = db.prepare(`INSERT OR IGNORE INTO users (nombre_completo, email, password, role, is_active) VALUES (?,?,?,'user',1)`);
const insertPayment = db.prepare(`INSERT OR IGNORE INTO payments (user_id, event_id, comprobante_url, status) VALUES (?,?,'dummy/comprobante_dummy.jpg','aprobado')`);
const insertPred = db.prepare(`INSERT OR IGNORE INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos) VALUES (?,?,?,?,?)`);

// Distribuir accuracies para tener ranking variado
const accuracies = NAMES.map((_, i) => 0.10 + (i / NAMES.length) * 0.55); // 10%~65%

let created = 0;
const insertAll = db.transaction(() => {
  NAMES.forEach((name, idx) => {
    const email = `dummy${idx + 1}@quiniela.com`;
    const accuracy = accuracies[idx];

    const res = insertUser.run(name, email, PASSWORD_HASH);
    let userId;
    if (res.changes === 0) {
      userId = db.prepare('SELECT id FROM users WHERE email = ?').get(email)?.id;
    } else {
      userId = res.lastInsertRowid;
      created++;
    }
    if (!userId) return;

    insertPayment.run(userId, EVENT_ID);

    matches.forEach((m) => {
      const { gl, gv } = predForMatch(m, accuracy);
      const pts = calcPoints(gl, gv, m.goles_local_real, m.goles_visitante_real);
      insertPred.run(userId, m.id, gl, gv, pts);
    });
  });
});

insertAll();

// Mostrar resumen
const ranking = db.prepare(`
  SELECT u.nombre_completo, COALESCE(SUM(p.puntos_obtenidos),0) as pts
  FROM users u
  JOIN payments pay ON pay.user_id = u.id AND pay.event_id = ? AND pay.status = 'aprobado'
  LEFT JOIN predictions p ON p.user_id = u.id
  LEFT JOIN matches m ON p.match_id = m.id AND m.event_id = ?
  WHERE u.is_active = 1
  GROUP BY u.id
  ORDER BY pts DESC
  LIMIT 10
`).all(EVENT_ID, EVENT_ID);

console.log(`\nUsuarios creados: ${created}`);
console.log('\nTop 10 ranking:');
ranking.forEach((r, i) => console.log(`  ${i+1}. ${r.nombre_completo} - ${r.pts} pts`));
console.log('\nDone.');
db.close();
