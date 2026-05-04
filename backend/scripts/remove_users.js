require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || 'C:/PROYECTOS/QUINIELA/backend/data/dei.sqlite');
db.pragma('foreign_keys = ON');

const keep = ['admin@quiniela.com', 'mikenoecarcamo@gmail.com'];
const toDelete = db.prepare('SELECT id, email FROM users WHERE email NOT IN (?, ?)').all(...keep);
console.log('A eliminar:', toDelete.map(u => u.email));

if (toDelete.length === 0) { console.log('Nada que eliminar.'); db.close(); process.exit(0); }

const ids = toDelete.map(u => u.id);
db.prepare(`DELETE FROM predictions WHERE user_id IN (${ids.join(',')})`).run();
db.prepare(`DELETE FROM payments WHERE user_id IN (${ids.join(',')})`).run();
const r = db.prepare(`DELETE FROM users WHERE id IN (${ids.join(',')})`).run();

console.log(`Eliminados ${r.changes} usuarios.`);
console.log('Restantes:', db.prepare('SELECT email, role FROM users').all());
db.close();
