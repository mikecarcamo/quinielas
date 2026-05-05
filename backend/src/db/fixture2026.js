// Fixture OFICIAL FIFA Copa Mundial 2026 — Fase de Grupos
// Fuente: Sky Sports (BST) / FIFA oficial
// Horas en GMT-6 (Guatemala): BST - 7h = GMT-6
// Nota: partidos con hora BST madrugada que pertenecen al día anterior en GMT-6 tienen fecha ajustada
const FIXTURE_2026 = [
  // ── GRUPO A: México · Sudáfrica · Corea del Sur · Chequia ──
  { local: 'México',        visitante: 'Sudáfrica',    fecha: '2026-06-11', hora: '13:00', grupo: 'A', fase: 'grupos' }, // 8pm BST Jun 11
  { local: 'Corea del Sur', visitante: 'Chequia',      fecha: '2026-06-11', hora: '20:00', grupo: 'A', fase: 'grupos' }, // 3am BST Jun 12 → 20:00 Jun 11
  { local: 'Chequia',       visitante: 'Sudáfrica',    fecha: '2026-06-18', hora: '10:00', grupo: 'A', fase: 'grupos' }, // 5pm BST Jun 18
  { local: 'México',        visitante: 'Corea del Sur',fecha: '2026-06-18', hora: '19:00', grupo: 'A', fase: 'grupos' }, // 2am BST Jun 19 → 19:00 Jun 18
  { local: 'Chequia',       visitante: 'México',       fecha: '2026-06-24', hora: '19:00', grupo: 'A', fase: 'grupos' }, // 2am BST Jun 25 → 19:00 Jun 24
  { local: 'Sudáfrica',     visitante: 'Corea del Sur',fecha: '2026-06-24', hora: '19:00', grupo: 'A', fase: 'grupos' }, // 2am BST Jun 25 → 19:00 Jun 24

  // ── GRUPO B: Canadá · Bosnia y Herzegovina · Qatar · Suiza ──
  { local: 'Canadá',              visitante: 'Bosnia y Herzegovina', fecha: '2026-06-12', hora: '13:00', grupo: 'B', fase: 'grupos' }, // 8pm BST Jun 12
  { local: 'Qatar',               visitante: 'Suiza',                fecha: '2026-06-13', hora: '13:00', grupo: 'B', fase: 'grupos' }, // 8pm BST Jun 13
  { local: 'Suiza',               visitante: 'Bosnia y Herzegovina', fecha: '2026-06-18', hora: '13:00', grupo: 'B', fase: 'grupos' }, // 8pm BST Jun 18
  { local: 'Canadá',              visitante: 'Qatar',                fecha: '2026-06-18', hora: '16:00', grupo: 'B', fase: 'grupos' }, // 11pm BST Jun 18
  { local: 'Suiza',               visitante: 'Canadá',               fecha: '2026-06-24', hora: '13:00', grupo: 'B', fase: 'grupos' }, // 8pm BST Jun 24
  { local: 'Bosnia y Herzegovina',visitante: 'Qatar',                fecha: '2026-06-24', hora: '13:00', grupo: 'B', fase: 'grupos' }, // 8pm BST Jun 24

  // ── GRUPO C: Brasil · Marruecos · Haití · Escocia ──
  { local: 'Brasil',    visitante: 'Marruecos', fecha: '2026-06-13', hora: '16:00', grupo: 'C', fase: 'grupos' }, // 11pm BST Jun 13
  { local: 'Haití',     visitante: 'Escocia',   fecha: '2026-06-13', hora: '19:00', grupo: 'C', fase: 'grupos' }, // 2am BST Jun 14 → 19:00 Jun 13
  { local: 'Escocia',   visitante: 'Marruecos', fecha: '2026-06-20', hora: '23:00', grupo: 'C', fase: 'grupos' }, // 11pm GT Jun 20
  { local: 'Brasil',    visitante: 'Haití',     fecha: '2026-06-20', hora: '01:30', grupo: 'C', fase: 'grupos' }, // 1:30am GT Jun 20
  { local: 'Escocia',   visitante: 'Brasil',    fecha: '2026-06-24', hora: '16:00', grupo: 'C', fase: 'grupos' }, // 11pm BST Jun 24
  { local: 'Marruecos', visitante: 'Haití',     fecha: '2026-06-24', hora: '16:00', grupo: 'C', fase: 'grupos' }, // 11pm BST Jun 24

  // ── GRUPO D: Estados Unidos · Paraguay · Australia · Turquía ──
  { local: 'Estados Unidos', visitante: 'Paraguay',  fecha: '2026-06-12', hora: '19:00', grupo: 'D', fase: 'grupos' }, // 2am BST Jun 13 → 19:00 Jun 12
  { local: 'Australia',      visitante: 'Turquía',   fecha: '2026-06-13', hora: '22:00', grupo: 'D', fase: 'grupos' }, // 5am BST Jun 14 → 22:00 Jun 13
  { local: 'Turquía',        visitante: 'Paraguay',  fecha: '2026-06-20', hora: '22:00', grupo: 'D', fase: 'grupos' }, // 10pm GT Jun 20
  { local: 'Estados Unidos', visitante: 'Australia', fecha: '2026-06-19', hora: '13:00', grupo: 'D', fase: 'grupos' }, // 8pm BST Jun 19
  { local: 'Turquía',        visitante: 'Estados Unidos', fecha: '2026-06-25', hora: '20:00', grupo: 'D', fase: 'grupos' }, // 3am BST Jun 26 → 20:00 Jun 25
  { local: 'Paraguay',       visitante: 'Australia', fecha: '2026-06-25', hora: '20:00', grupo: 'D', fase: 'grupos' }, // 3am BST Jun 26 → 20:00 Jun 25

  // ── GRUPO E: Alemania · Curazao · Costa de Marfil · Ecuador ──
  { local: 'Alemania',        visitante: 'Curazao',        fecha: '2026-06-14', hora: '11:00', grupo: 'E', fase: 'grupos' }, // 6pm BST Jun 14
  { local: 'Costa de Marfil', visitante: 'Ecuador',        fecha: '2026-06-14', hora: '17:00', grupo: 'E', fase: 'grupos' }, // 12am BST Jun 15 → 17:00 Jun 14
  { local: 'Alemania',        visitante: 'Costa de Marfil',fecha: '2026-06-19', hora: '16:00', grupo: 'E', fase: 'grupos' }, // 4pm GT Jun 19
  { local: 'Ecuador',         visitante: 'Curazao',        fecha: '2026-06-19', hora: '19:00', grupo: 'E', fase: 'grupos' }, // 7pm GT Jun 19
  { local: 'Ecuador',         visitante: 'Alemania',       fecha: '2026-06-25', hora: '14:00', grupo: 'E', fase: 'grupos' }, // 9pm BST Jun 25
  { local: 'Curazao',         visitante: 'Costa de Marfil',fecha: '2026-06-25', hora: '14:00', grupo: 'E', fase: 'grupos' }, // 9pm BST Jun 25

  // ── GRUPO F: Países Bajos · Japón · Suecia · Túnez ──
  { local: 'Países Bajos', visitante: 'Japón',        fecha: '2026-06-14', hora: '14:00', grupo: 'F', fase: 'grupos' }, // 9pm BST Jun 14
  { local: 'Suecia',       visitante: 'Túnez',        fecha: '2026-06-14', hora: '20:00', grupo: 'F', fase: 'grupos' }, // 3am BST Jun 15 → 20:00 Jun 14
  { local: 'Países Bajos', visitante: 'Suecia',       fecha: '2026-06-20', hora: '11:00', grupo: 'F', fase: 'grupos' }, // 6pm BST Jun 20
  { local: 'Túnez',        visitante: 'Japón',        fecha: '2026-06-19', hora: '22:00', grupo: 'F', fase: 'grupos' }, // 10pm GT Jun 19 (imagen: 19 JUN 10pm)
  { local: 'Japón',        visitante: 'Suecia',       fecha: '2026-06-25', hora: '17:00', grupo: 'F', fase: 'grupos' }, // 12am BST Jun 26 → 17:00 Jun 25
  { local: 'Túnez',        visitante: 'Países Bajos', fecha: '2026-06-25', hora: '17:00', grupo: 'F', fase: 'grupos' }, // 12am BST Jun 26 → 17:00 Jun 25

  // ── GRUPO G: Bélgica · Egipto · Irán · Nueva Zelanda ──
  { local: 'Bélgica',      visitante: 'Egipto',        fecha: '2026-06-15', hora: '13:00', grupo: 'G', fase: 'grupos' }, // 1pm GT Jun 15
  { local: 'Irán',         visitante: 'Nueva Zelanda', fecha: '2026-06-15', hora: '19:00', grupo: 'G', fase: 'grupos' }, // 2am BST Jun 16 → 19:00 Jun 15
  { local: 'Bélgica',      visitante: 'Irán',          fecha: '2026-06-21', hora: '13:00', grupo: 'G', fase: 'grupos' }, // 8pm BST Jun 21
  { local: 'Nueva Zelanda', visitante: 'Egipto',       fecha: '2026-06-21', hora: '19:00', grupo: 'G', fase: 'grupos' }, // 2am BST Jun 22 → 19:00 Jun 21
  { local: 'Egipto',       visitante: 'Irán',          fecha: '2026-06-26', hora: '21:00', grupo: 'G', fase: 'grupos' }, // 4am BST Jun 27 → 21:00 Jun 26
  { local: 'Nueva Zelanda', visitante: 'Bélgica',      fecha: '2026-06-26', hora: '21:00', grupo: 'G', fase: 'grupos' }, // 4am BST Jun 27 → 21:00 Jun 26

  // ── GRUPO H: España · Cabo Verde · Arabia Saudita · Uruguay ──
  { local: 'España',        visitante: 'Cabo Verde',    fecha: '2026-06-15', hora: '10:00', grupo: 'H', fase: 'grupos' }, // 5pm BST Jun 15
  { local: 'Arabia Saudita',visitante: 'Uruguay',       fecha: '2026-06-15', hora: '16:00', grupo: 'H', fase: 'grupos' }, // 11pm BST Jun 15
  { local: 'España',        visitante: 'Arabia Saudita',fecha: '2026-06-21', hora: '10:00', grupo: 'H', fase: 'grupos' }, // 5pm BST Jun 21
  { local: 'Uruguay',       visitante: 'Cabo Verde',    fecha: '2026-06-21', hora: '16:00', grupo: 'H', fase: 'grupos' }, // 11pm BST Jun 21
  { local: 'Cabo Verde',    visitante: 'Arabia Saudita',fecha: '2026-06-26', hora: '18:00', grupo: 'H', fase: 'grupos' }, // 1am BST Jun 27 → 18:00 Jun 26
  { local: 'Uruguay',       visitante: 'España',        fecha: '2026-06-26', hora: '18:00', grupo: 'H', fase: 'grupos' }, // 1am BST Jun 27 → 18:00 Jun 26

  // ── GRUPO I: Francia · Senegal · Irak · Noruega ──
  { local: 'Francia',  visitante: 'Senegal', fecha: '2026-06-16', hora: '13:00', grupo: 'I', fase: 'grupos' }, // 8pm BST Jun 16
  { local: 'Irak',     visitante: 'Noruega', fecha: '2026-06-16', hora: '16:00', grupo: 'I', fase: 'grupos' }, // 11pm BST Jun 16
  { local: 'Francia',  visitante: 'Irak',    fecha: '2026-06-22', hora: '15:00', grupo: 'I', fase: 'grupos' }, // 10pm BST Jun 22
  { local: 'Noruega',  visitante: 'Senegal', fecha: '2026-06-22', hora: '21:00', grupo: 'I', fase: 'grupos' }, // 9pm GT Jun 22
  { local: 'Noruega',  visitante: 'Francia', fecha: '2026-06-26', hora: '13:00', grupo: 'I', fase: 'grupos' }, // 8pm BST Jun 26
  { local: 'Senegal',  visitante: 'Irak',    fecha: '2026-06-26', hora: '13:00', grupo: 'I', fase: 'grupos' }, // 8pm BST Jun 26

  // ── GRUPO J: Argentina · Argelia · Austria · Jordania ──
  { local: 'Argentina', visitante: 'Argelia',  fecha: '2026-06-16', hora: '19:00', grupo: 'J', fase: 'grupos' }, // 2am BST Jun 17 → 19:00 Jun 16
  { local: 'Austria',   visitante: 'Jordania', fecha: '2026-06-16', hora: '22:00', grupo: 'J', fase: 'grupos' }, // 5am BST Jun 17 → 22:00 Jun 16
  { local: 'Argentina', visitante: 'Austria',  fecha: '2026-06-22', hora: '11:00', grupo: 'J', fase: 'grupos' }, // 6pm BST Jun 22
  { local: 'Jordania',  visitante: 'Argelia',  fecha: '2026-06-22', hora: '21:00', grupo: 'J', fase: 'grupos' }, // 4am BST Jun 23 → 21:00 Jun 22
  { local: 'Argelia',   visitante: 'Austria',  fecha: '2026-06-27', hora: '20:00', grupo: 'J', fase: 'grupos' }, // 3am BST Jun 28 → 20:00 Jun 27
  { local: 'Jordania',  visitante: 'Argentina',fecha: '2026-06-27', hora: '20:00', grupo: 'J', fase: 'grupos' }, // 3am BST Jun 28 → 20:00 Jun 27

  // ── GRUPO K: Portugal · Congo · Uzbekistán · Colombia ──
  { local: 'Portugal',   visitante: 'Congo',      fecha: '2026-06-17', hora: '11:00', grupo: 'K', fase: 'grupos' }, // 6pm BST Jun 17
  { local: 'Uzbekistán', visitante: 'Colombia',   fecha: '2026-06-17', hora: '20:00', grupo: 'K', fase: 'grupos' }, // 3am BST Jun 18 → 20:00 Jun 17
  { local: 'Portugal',   visitante: 'Uzbekistán', fecha: '2026-06-23', hora: '11:00', grupo: 'K', fase: 'grupos' }, // 6pm BST Jun 23
  { local: 'Colombia',   visitante: 'Congo',      fecha: '2026-06-23', hora: '20:00', grupo: 'K', fase: 'grupos' }, // 3am BST Jun 24 → 20:00 Jun 23 (wait, sky says 3am Jun 24?)
  { local: 'Colombia',   visitante: 'Portugal',   fecha: '2026-06-27', hora: '17:30', grupo: 'K', fase: 'grupos' }, // 12:30am BST Jun 28 → 17:30 Jun 27
  { local: 'Congo',      visitante: 'Uzbekistán', fecha: '2026-06-27', hora: '17:30', grupo: 'K', fase: 'grupos' }, // 12:30am BST Jun 28 → 17:30 Jun 27

  // ── GRUPO L: Inglaterra · Croacia · Ghana · Panamá ──
  { local: 'Inglaterra', visitante: 'Croacia', fecha: '2026-06-17', hora: '14:00', grupo: 'L', fase: 'grupos' }, // 9pm BST Jun 17
  { local: 'Ghana',      visitante: 'Panamá',  fecha: '2026-06-17', hora: '17:00', grupo: 'L', fase: 'grupos' }, // 12am BST Jun 18 → 17:00 Jun 17
  { local: 'Inglaterra', visitante: 'Ghana',   fecha: '2026-06-23', hora: '14:00', grupo: 'L', fase: 'grupos' }, // 9pm BST Jun 23
  { local: 'Panamá',     visitante: 'Croacia', fecha: '2026-06-23', hora: '17:00', grupo: 'L', fase: 'grupos' }, // 12am BST Jun 24 → 17:00 Jun 23
  { local: 'Panamá',     visitante: 'Inglaterra', fecha: '2026-06-27', hora: '15:00', grupo: 'L', fase: 'grupos' }, // 10pm BST Jun 27
  { local: 'Croacia',    visitante: 'Ghana',   fecha: '2026-06-27', hora: '15:00', grupo: 'L', fase: 'grupos' }, // 10pm BST Jun 27
];

module.exports = { FIXTURE_2026 };
