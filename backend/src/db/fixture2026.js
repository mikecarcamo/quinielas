// Fixture OFICIAL FIFA Copa Mundial 2026 — Fase de Grupos
// Fuente: ESPN / FIFA — Sorteo realizado en Washington DC
const FIXTURE_2026 = [
  // ── GRUPO A: México · Sudáfrica · Corea del Sur · Chequia ──
  { local: 'México',        visitante: 'Sudáfrica',    fecha: '2026-06-11', grupo: 'A', fase: 'grupos' },
  { local: 'Corea del Sur', visitante: 'Chequia',      fecha: '2026-06-11', grupo: 'A', fase: 'grupos' },
  { local: 'Chequia',       visitante: 'Sudáfrica',    fecha: '2026-06-18', grupo: 'A', fase: 'grupos' },
  { local: 'México',        visitante: 'Corea del Sur',fecha: '2026-06-18', grupo: 'A', fase: 'grupos' },
  { local: 'Chequia',       visitante: 'México',       fecha: '2026-06-24', grupo: 'A', fase: 'grupos' },
  { local: 'Sudáfrica',     visitante: 'Corea del Sur',fecha: '2026-06-24', grupo: 'A', fase: 'grupos' },

  // ── GRUPO B: Canadá · Bosnia y Herzegovina · Qatar · Suiza ──
  { local: 'Canadá',              visitante: 'Bosnia y Herzegovina', fecha: '2026-06-12', grupo: 'B', fase: 'grupos' },
  { local: 'Qatar',               visitante: 'Suiza',                fecha: '2026-06-13', grupo: 'B', fase: 'grupos' },
  { local: 'Suiza',               visitante: 'Bosnia y Herzegovina', fecha: '2026-06-18', grupo: 'B', fase: 'grupos' },
  { local: 'Canadá',              visitante: 'Qatar',                fecha: '2026-06-18', grupo: 'B', fase: 'grupos' },
  { local: 'Suiza',               visitante: 'Canadá',               fecha: '2026-06-24', grupo: 'B', fase: 'grupos' },
  { local: 'Bosnia y Herzegovina',visitante: 'Qatar',                fecha: '2026-06-24', grupo: 'B', fase: 'grupos' },

  // ── GRUPO C: Brasil · Marruecos · Haití · Escocia ──
  { local: 'Brasil',    visitante: 'Marruecos', fecha: '2026-06-13', grupo: 'C', fase: 'grupos' },
  { local: 'Haití',     visitante: 'Escocia',   fecha: '2026-06-13', grupo: 'C', fase: 'grupos' },
  { local: 'Escocia',   visitante: 'Marruecos', fecha: '2026-06-19', grupo: 'C', fase: 'grupos' },
  { local: 'Brasil',    visitante: 'Haití',     fecha: '2026-06-19', grupo: 'C', fase: 'grupos' },
  { local: 'Escocia',   visitante: 'Brasil',    fecha: '2026-06-24', grupo: 'C', fase: 'grupos' },
  { local: 'Marruecos', visitante: 'Haití',     fecha: '2026-06-24', grupo: 'C', fase: 'grupos' },

  // ── GRUPO D: Estados Unidos · Paraguay · Australia · Turquía ──
  { local: 'Estados Unidos', visitante: 'Paraguay',  fecha: '2026-06-12', grupo: 'D', fase: 'grupos' },
  { local: 'Australia',      visitante: 'Turquía',   fecha: '2026-06-13', grupo: 'D', fase: 'grupos' },
  { local: 'Turquía',        visitante: 'Paraguay',  fecha: '2026-06-19', grupo: 'D', fase: 'grupos' },
  { local: 'Estados Unidos', visitante: 'Australia', fecha: '2026-06-19', grupo: 'D', fase: 'grupos' },
  { local: 'Turquía',        visitante: 'Estados Unidos', fecha: '2026-06-25', grupo: 'D', fase: 'grupos' },
  { local: 'Paraguay',       visitante: 'Australia', fecha: '2026-06-25', grupo: 'D', fase: 'grupos' },

  // ── GRUPO E: Alemania · Curazao · Costa de Marfil · Ecuador ──
  { local: 'Alemania',        visitante: 'Curazao',        fecha: '2026-06-14', grupo: 'E', fase: 'grupos' },
  { local: 'Costa de Marfil', visitante: 'Ecuador',        fecha: '2026-06-14', grupo: 'E', fase: 'grupos' },
  { local: 'Alemania',        visitante: 'Costa de Marfil',fecha: '2026-06-20', grupo: 'E', fase: 'grupos' },
  { local: 'Ecuador',         visitante: 'Curazao',        fecha: '2026-06-20', grupo: 'E', fase: 'grupos' },
  { local: 'Ecuador',         visitante: 'Alemania',       fecha: '2026-06-25', grupo: 'E', fase: 'grupos' },
  { local: 'Curazao',         visitante: 'Costa de Marfil',fecha: '2026-06-25', grupo: 'E', fase: 'grupos' },

  // ── GRUPO F: Países Bajos · Japón · Suecia · Túnez ──
  { local: 'Países Bajos', visitante: 'Japón',        fecha: '2026-06-14', grupo: 'F', fase: 'grupos' },
  { local: 'Suecia',       visitante: 'Túnez',        fecha: '2026-06-14', grupo: 'F', fase: 'grupos' },
  { local: 'Países Bajos', visitante: 'Suecia',       fecha: '2026-06-20', grupo: 'F', fase: 'grupos' },
  { local: 'Túnez',        visitante: 'Japón',        fecha: '2026-06-20', grupo: 'F', fase: 'grupos' },
  { local: 'Japón',        visitante: 'Suecia',       fecha: '2026-06-25', grupo: 'F', fase: 'grupos' },
  { local: 'Túnez',        visitante: 'Países Bajos', fecha: '2026-06-25', grupo: 'F', fase: 'grupos' },

  // ── GRUPO G: Bélgica · Egipto · Irán · Nueva Zelanda ──
  { local: 'Irán',        visitante: 'Nueva Zelanda', fecha: '2026-06-15', grupo: 'G', fase: 'grupos' },
  { local: 'Bélgica',     visitante: 'Egipto',        fecha: '2026-06-15', grupo: 'G', fase: 'grupos' },
  { local: 'Bélgica',     visitante: 'Irán',          fecha: '2026-06-21', grupo: 'G', fase: 'grupos' },
  { local: 'Nueva Zelanda',visitante: 'Egipto',       fecha: '2026-06-21', grupo: 'G', fase: 'grupos' },
  { local: 'Egipto',      visitante: 'Irán',          fecha: '2026-06-26', grupo: 'G', fase: 'grupos' },
  { local: 'Nueva Zelanda',visitante: 'Bélgica',      fecha: '2026-06-26', grupo: 'G', fase: 'grupos' },

  // ── GRUPO H: España · Cabo Verde · Arabia Saudita · Uruguay ──
  { local: 'España',        visitante: 'Cabo Verde',    fecha: '2026-06-15', grupo: 'H', fase: 'grupos' },
  { local: 'Arabia Saudita',visitante: 'Uruguay',       fecha: '2026-06-15', grupo: 'H', fase: 'grupos' },
  { local: 'España',        visitante: 'Arabia Saudita',fecha: '2026-06-21', grupo: 'H', fase: 'grupos' },
  { local: 'Uruguay',       visitante: 'Cabo Verde',    fecha: '2026-06-21', grupo: 'H', fase: 'grupos' },
  { local: 'Cabo Verde',    visitante: 'Arabia Saudita',fecha: '2026-06-26', grupo: 'H', fase: 'grupos' },
  { local: 'Uruguay',       visitante: 'España',        fecha: '2026-06-26', grupo: 'H', fase: 'grupos' },

  // ── GRUPO I: Francia · Senegal · Irak · Noruega ──
  { local: 'Francia',  visitante: 'Senegal', fecha: '2026-06-16', grupo: 'I', fase: 'grupos' },
  { local: 'Irak',     visitante: 'Noruega', fecha: '2026-06-16', grupo: 'I', fase: 'grupos' },
  { local: 'Francia',  visitante: 'Irak',    fecha: '2026-06-22', grupo: 'I', fase: 'grupos' },
  { local: 'Noruega',  visitante: 'Senegal', fecha: '2026-06-22', grupo: 'I', fase: 'grupos' },
  { local: 'Noruega',  visitante: 'Francia', fecha: '2026-06-26', grupo: 'I', fase: 'grupos' },
  { local: 'Senegal',  visitante: 'Irak',    fecha: '2026-06-26', grupo: 'I', fase: 'grupos' },

  // ── GRUPO J: Argentina · Argelia · Austria · Jordania ──
  { local: 'Argentina', visitante: 'Argelia',  fecha: '2026-06-16', grupo: 'J', fase: 'grupos' },
  { local: 'Austria',   visitante: 'Jordania', fecha: '2026-06-16', grupo: 'J', fase: 'grupos' },
  { local: 'Argentina', visitante: 'Austria',  fecha: '2026-06-22', grupo: 'J', fase: 'grupos' },
  { local: 'Jordania',  visitante: 'Argelia',  fecha: '2026-06-22', grupo: 'J', fase: 'grupos' },
  { local: 'Argelia',   visitante: 'Austria',  fecha: '2026-06-27', grupo: 'J', fase: 'grupos' },
  { local: 'Jordania',  visitante: 'Argentina',fecha: '2026-06-27', grupo: 'J', fase: 'grupos' },

  // ── GRUPO K: Portugal · Congo · Uzbekistán · Colombia ──
  { local: 'Portugal',   visitante: 'Congo',      fecha: '2026-06-17', grupo: 'K', fase: 'grupos' },
  { local: 'Uzbekistán', visitante: 'Colombia',   fecha: '2026-06-17', grupo: 'K', fase: 'grupos' },
  { local: 'Portugal',   visitante: 'Uzbekistán', fecha: '2026-06-23', grupo: 'K', fase: 'grupos' },
  { local: 'Colombia',   visitante: 'Congo',      fecha: '2026-06-23', grupo: 'K', fase: 'grupos' },
  { local: 'Colombia',   visitante: 'Portugal',   fecha: '2026-06-27', grupo: 'K', fase: 'grupos' },
  { local: 'Congo',      visitante: 'Uzbekistán', fecha: '2026-06-27', grupo: 'K', fase: 'grupos' },

  // ── GRUPO L: Inglaterra · Croacia · Ghana · Panamá ──
  { local: 'Inglaterra', visitante: 'Croacia', fecha: '2026-06-17', grupo: 'L', fase: 'grupos' },
  { local: 'Ghana',      visitante: 'Panamá',  fecha: '2026-06-17', grupo: 'L', fase: 'grupos' },
  { local: 'Inglaterra', visitante: 'Ghana',   fecha: '2026-06-23', grupo: 'L', fase: 'grupos' },
  { local: 'Panamá',     visitante: 'Croacia', fecha: '2026-06-23', grupo: 'L', fase: 'grupos' },
  { local: 'Panamá',     visitante: 'Inglaterra', fecha: '2026-06-27', grupo: 'L', fase: 'grupos' },
  { local: 'Croacia',    visitante: 'Ghana',   fecha: '2026-06-27', grupo: 'L', fase: 'grupos' },
];

module.exports = { FIXTURE_2026 };
