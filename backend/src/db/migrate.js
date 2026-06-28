const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dataDir = process.env.DB_PATH
  ? path.dirname(process.env.DB_PATH)
  : path.join('/app/data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || path.join(dataDir, 'dei.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('admin','user')),
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    precio_entrada REAL NOT NULL DEFAULT 100,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    local TEXT NOT NULL,
    visitante TEXT NOT NULL,
    fecha TEXT NOT NULL,
    grupo TEXT,
    fase TEXT NOT NULL DEFAULT 'grupos',
    hora TEXT,
    goles_local_real INTEGER,
    goles_visitante_real INTEGER,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','en_curso','finalizado')),
    resultado_editado INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    match_id INTEGER NOT NULL,
    goles_local_pred INTEGER NOT NULL,
    goles_visitante_pred INTEGER NOT NULL,
    puntos_obtenidos INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, match_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (match_id) REFERENCES matches(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    comprobante_url TEXT,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente','aprobado','rechazado')),
    notas TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (event_id) REFERENCES events(id)
  );
`);

// Migraciones adicionales: ganador en penales para fase eliminatoria
try {
  db.exec("ALTER TABLE matches ADD COLUMN ganador_penales TEXT CHECK(ganador_penales IN ('local','visitante'))");
  console.log('Columna ganador_penales agregada a matches');
} catch (e) {
  // Columna ya existe
}

try {
  db.exec("ALTER TABLE predictions ADD COLUMN pred_ganador_penales TEXT CHECK(pred_ganador_penales IN ('local','visitante'))");
  console.log('Columna pred_ganador_penales agregada a predictions');
} catch (e) {
  // Columna ya existe
}

const existingEvent = db.prepare('SELECT id FROM events WHERE nombre = ?').get('Mundial 2026');
let eventId;
if (!existingEvent) {
  const result = db.prepare('INSERT INTO events (nombre, precio_entrada) VALUES (?,?)').run('Mundial 2026', 100);
  eventId = result.lastInsertRowid;
  console.log('Evento Mundial 2026 creado con id:', eventId);
} else {
  eventId = existingEvent.id;
  console.log('Evento Mundial 2026 ya existe con id:', eventId);
}

// Crear evento de dieciseisavos si no existe
const existing16 = db.prepare('SELECT id FROM events WHERE nombre = ?').get('Mundial 2026 - Dieciseisavos');
if (!existing16) {
  const result16 = db.prepare('INSERT INTO events (nombre, precio_entrada) VALUES (?,?)').run('Mundial 2026 - Dieciseisavos', 100);
  console.log('Evento Mundial 2026 - Dieciseisavos creado con id:', result16.lastInsertRowid);
} else {
  console.log('Evento Mundial 2026 - Dieciseisavos ya existe con id:', existing16.id);
}

const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@quiniela.com');
if (!adminExists) {
  const hash = bcrypt.hashSync('Admin1234!', 10);
  db.prepare(`
    INSERT INTO users (nombre_completo, email, password, role, is_active)
    VALUES (?, ?, ?, 'admin', 1)
  `).run('Administrador', 'admin@quiniela.com', hash);
  console.log('Admin creado: admin@quiniela.com / Admin1234!');
}

const matchCount = db.prepare('SELECT COUNT(*) as cnt FROM matches WHERE event_id = ?').get(eventId);
if (matchCount.cnt === 0) {
  const { FIXTURE_2026 } = require('./fixture2026');
  const insertMatch = db.prepare(`
    INSERT INTO matches (event_id, local, visitante, fecha, hora, grupo, fase)
    VALUES (@event_id, @local, @visitante, @fecha, @hora, @grupo, @fase)
  `);
  const insertMany = db.transaction((matches) => {
    for (const m of matches) insertMatch.run({ ...m, event_id: eventId });
  });
  insertMany(FIXTURE_2026);
  console.log(`${FIXTURE_2026.length} partidos insertados.`);
}

if (require.main === module) {
  db.close();
}
console.log('Migración completada.');
