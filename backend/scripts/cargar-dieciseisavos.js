/**
 * cargar-dieciseisavos.js
 * Carga manualmente los 16 partidos de dieciseisavos del Mundial 2026
 * en el evento "Mundial 2026 - Dieciseisavos" si aún no existen.
 * No modifica datos existentes.
 */

const db = require('../src/db/database');

const EVENT_NAME = 'Mundial 2026 - Dieciseisavos';
const FASE = 'dieciseisavos';

const PARTIDOS = [
  { local: 'Sudáfrica', visitante: 'Canadá', fecha: '2026-06-28', hora: '13:00' },
  { local: 'Brasil', visitante: 'Japón', fecha: '2026-06-29', hora: '11:00' },
  { local: 'Alemania', visitante: 'Paraguay', fecha: '2026-06-29', hora: '14:30' },
  { local: 'Países Bajos', visitante: 'Marruecos', fecha: '2026-06-29', hora: '19:00' },
  { local: 'Costa de Marfil', visitante: 'Noruega', fecha: '2026-06-30', hora: '11:00' },
  { local: 'Francia', visitante: 'Suecia', fecha: '2026-06-30', hora: '15:00' },
  { local: 'México', visitante: 'Ecuador', fecha: '2026-06-30', hora: '19:00' },
  { local: 'Inglaterra', visitante: 'RD Congo', fecha: '2026-07-01', hora: '10:00' },
  { local: 'Bélgica', visitante: 'Senegal', fecha: '2026-07-01', hora: '14:00' },
  { local: 'Estados Unidos', visitante: 'Bosnia y Herzegovina', fecha: '2026-07-01', hora: '18:00' },
  { local: 'España', visitante: 'Austria', fecha: '2026-07-02', hora: '13:00' },
  { local: 'Portugal', visitante: 'Croacia', fecha: '2026-07-02', hora: '17:00' },
  { local: 'Suiza', visitante: 'Argelia', fecha: '2026-07-02', hora: '21:00' },
  { local: 'Australia', visitante: 'Egipto', fecha: '2026-07-03', hora: '12:00' },
  { local: 'Argentina', visitante: 'Cabo Verde', fecha: '2026-07-03', hora: '16:00' },
  { local: 'Colombia', visitante: 'Ghana', fecha: '2026-07-03', hora: '19:30' },
];

let event = db.prepare('SELECT id FROM events WHERE nombre = ?').get(EVENT_NAME);
if (!event) {
  const result = db.prepare('INSERT INTO events (nombre, precio_entrada) VALUES (?, ?)').run(EVENT_NAME, 100);
  event = { id: result.lastInsertRowid };
  console.log(`Evento "${EVENT_NAME}" creado con id: ${event.id}`);
} else {
  console.log(`Evento "${EVENT_NAME}" ya existe con id: ${event.id}`);
}

const insertMatch = db.prepare(`
  INSERT INTO matches (event_id, local, visitante, fecha, hora, grupo, fase)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const findMatch = db.prepare(`
  SELECT id FROM matches
  WHERE event_id = ? AND local = ? AND visitante = ? AND fecha = ?
`);

let creados = 0;
let existentes = 0;

const insertMany = db.transaction((partidos) => {
  for (const p of partidos) {
    const existing = findMatch.get(event.id, p.local, p.visitante, p.fecha);
    if (existing) {
      console.log(`Ya existe: ${p.local} vs ${p.visitante} (${p.fecha} ${p.hora})`);
      existentes++;
    } else {
      insertMatch.run(event.id, p.local, p.visitante, p.fecha, p.hora, null, FASE);
      console.log(`Creado: ${p.local} vs ${p.visitante} (${p.fecha} ${p.hora})`);
      creados++;
    }
  }
});

insertMany(PARTIDOS);
console.log(`\nTotal creados: ${creados}`);
console.log(`Total ya existentes: ${existentes}`);
console.log('Script terminado. Sin duplicados.');
