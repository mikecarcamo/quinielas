// Fixture OFICIAL FIFA Copa Mundial 2026 — Fase de Grupos
// Fuente: ESPN / FIFA — Sorteo realizado en Washington DC
// Horas en GMT-6 (Guatemala). Conversión: ET-2h, CT-1h, PT+1h, MT=GMT-6
const FIXTURE_2026 = [
  // ── GRUPO A: México · Sudáfrica · Corea del Sur · Chequia ──
  { local: 'México',        visitante: 'Sudáfrica',    fecha: '2026-06-11', hora: '15:00', grupo: 'A', fase: 'grupos' }, // 3pm CT
  { local: 'Corea del Sur', visitante: 'Chequia',      fecha: '2026-06-11', hora: '22:00', grupo: 'A', fase: 'grupos' }, // 10pm CT
  { local: 'Chequia',       visitante: 'Sudáfrica',    fecha: '2026-06-18', hora: '12:00', grupo: 'A', fase: 'grupos' }, // noon ET→GMT-6
  { local: 'México',        visitante: 'Corea del Sur',fecha: '2026-06-18', hora: '21:00', grupo: 'A', fase: 'grupos' }, // 9pm CT
  { local: 'Chequia',       visitante: 'México',       fecha: '2026-06-24', hora: '21:00', grupo: 'A', fase: 'grupos' }, // 9pm CT
  { local: 'Sudáfrica',     visitante: 'Corea del Sur',fecha: '2026-06-24', hora: '21:00', grupo: 'A', fase: 'grupos' }, // 9pm CT

  // ── GRUPO B: Canadá · Bosnia y Herzegovina · Qatar · Suiza ──
  { local: 'Canadá',              visitante: 'Bosnia y Herzegovina', fecha: '2026-06-12', hora: '15:00', grupo: 'B', fase: 'grupos' }, // 3pm ET→GMT-6
  { local: 'Qatar',               visitante: 'Suiza',                fecha: '2026-06-13', hora: '15:00', grupo: 'B', fase: 'grupos' }, // 3pm PT+1
  { local: 'Suiza',               visitante: 'Bosnia y Herzegovina', fecha: '2026-06-18', hora: '15:00', grupo: 'B', fase: 'grupos' }, // 3pm PT+1
  { local: 'Canadá',              visitante: 'Qatar',                fecha: '2026-06-18', hora: '18:00', grupo: 'B', fase: 'grupos' }, // 6pm PT+1
  { local: 'Suiza',               visitante: 'Canadá',               fecha: '2026-06-24', hora: '15:00', grupo: 'B', fase: 'grupos' }, // 3pm PT+1
  { local: 'Bosnia y Herzegovina',visitante: 'Qatar',                fecha: '2026-06-24', hora: '15:00', grupo: 'B', fase: 'grupos' }, // 3pm ET→GMT-6

  // ── GRUPO C: Brasil · Marruecos · Haití · Escocia ──
  { local: 'Brasil',    visitante: 'Marruecos', fecha: '2026-06-13', hora: '18:00', grupo: 'C', fase: 'grupos' }, // 6pm ET→GMT-6
  { local: 'Haití',     visitante: 'Escocia',   fecha: '2026-06-13', hora: '21:00', grupo: 'C', fase: 'grupos' }, // 9pm ET→GMT-6
  { local: 'Escocia',   visitante: 'Marruecos', fecha: '2026-06-19', hora: '18:00', grupo: 'C', fase: 'grupos' }, // 6pm ET→GMT-6
  { local: 'Brasil',    visitante: 'Haití',     fecha: '2026-06-19', hora: '20:30', grupo: 'C', fase: 'grupos' }, // 8:30pm ET→GMT-6
  { local: 'Escocia',   visitante: 'Brasil',    fecha: '2026-06-24', hora: '18:00', grupo: 'C', fase: 'grupos' }, // 6pm ET→GMT-6
  { local: 'Marruecos', visitante: 'Haití',     fecha: '2026-06-24', hora: '18:00', grupo: 'C', fase: 'grupos' }, // 6pm ET→GMT-6

  // ── GRUPO D: Estados Unidos · Paraguay · Australia · Turquía ──
  { local: 'Estados Unidos', visitante: 'Paraguay',  fecha: '2026-06-12', hora: '21:00', grupo: 'D', fase: 'grupos' }, // 9pm PT+1
  { local: 'Australia',      visitante: 'Turquía',   fecha: '2026-06-14', hora: '00:00', grupo: 'D', fase: 'grupos' }, // midnight PT+1
  { local: 'Turquía',        visitante: 'Paraguay',  fecha: '2026-06-19', hora: '23:00', grupo: 'D', fase: 'grupos' }, // 11pm PT+1
  { local: 'Estados Unidos', visitante: 'Australia', fecha: '2026-06-19', hora: '15:00', grupo: 'D', fase: 'grupos' }, // 3pm PT+1
  { local: 'Turquía',        visitante: 'Estados Unidos', fecha: '2026-06-25', hora: '22:00', grupo: 'D', fase: 'grupos' }, // 10pm PT+1
  { local: 'Paraguay',       visitante: 'Australia', fecha: '2026-06-25', hora: '22:00', grupo: 'D', fase: 'grupos' }, // 10pm PT+1

  // ── GRUPO E: Alemania · Curazao · Costa de Marfil · Ecuador ──
  { local: 'Alemania',        visitante: 'Curazao',        fecha: '2026-06-14', hora: '13:00', grupo: 'E', fase: 'grupos' }, // 1pm CT
  { local: 'Costa de Marfil', visitante: 'Ecuador',        fecha: '2026-06-14', hora: '19:00', grupo: 'E', fase: 'grupos' }, // 7pm ET→GMT-6
  { local: 'Alemania',        visitante: 'Costa de Marfil',fecha: '2026-06-20', hora: '16:00', grupo: 'E', fase: 'grupos' }, // 4pm ET→GMT-6
  { local: 'Ecuador',         visitante: 'Curazao',        fecha: '2026-06-20', hora: '20:00', grupo: 'E', fase: 'grupos' }, // 8pm CT
  { local: 'Ecuador',         visitante: 'Alemania',       fecha: '2026-06-25', hora: '16:00', grupo: 'E', fase: 'grupos' }, // 4pm ET→GMT-6
  { local: 'Curazao',         visitante: 'Costa de Marfil',fecha: '2026-06-25', hora: '16:00', grupo: 'E', fase: 'grupos' }, // 4pm ET→GMT-6

  // ── GRUPO F: Países Bajos · Japón · Suecia · Túnez ──
  { local: 'Países Bajos', visitante: 'Japón',        fecha: '2026-06-14', hora: '16:00', grupo: 'F', fase: 'grupos' }, // 4pm CT
  { local: 'Suecia',       visitante: 'Túnez',        fecha: '2026-06-14', hora: '22:00', grupo: 'F', fase: 'grupos' }, // 10pm CT
  { local: 'Países Bajos', visitante: 'Suecia',       fecha: '2026-06-20', hora: '13:00', grupo: 'F', fase: 'grupos' }, // 1pm CT
  { local: 'Túnez',        visitante: 'Japón',        fecha: '2026-06-21', hora: '00:00', grupo: 'F', fase: 'grupos' }, // midnight CT
  { local: 'Japón',        visitante: 'Suecia',       fecha: '2026-06-25', hora: '19:00', grupo: 'F', fase: 'grupos' }, // 7pm CT
  { local: 'Túnez',        visitante: 'Países Bajos', fecha: '2026-06-25', hora: '19:00', grupo: 'F', fase: 'grupos' }, // 7pm CT

  // ── GRUPO G: Bélgica · Egipto · Irán · Nueva Zelanda ──
  { local: 'Irán',        visitante: 'Nueva Zelanda', fecha: '2026-06-15', hora: '21:00', grupo: 'G', fase: 'grupos' }, // 9pm PT+1
  { local: 'Bélgica',     visitante: 'Egipto',        fecha: '2026-06-15', hora: '15:00', grupo: 'G', fase: 'grupos' }, // 3pm PT+1
  { local: 'Bélgica',     visitante: 'Irán',          fecha: '2026-06-21', hora: '15:00', grupo: 'G', fase: 'grupos' }, // 3pm PT+1
  { local: 'Nueva Zelanda',visitante: 'Egipto',       fecha: '2026-06-21', hora: '21:00', grupo: 'G', fase: 'grupos' }, // 9pm PT+1
  { local: 'Egipto',      visitante: 'Irán',          fecha: '2026-06-26', hora: '23:00', grupo: 'G', fase: 'grupos' }, // 11pm PT+1
  { local: 'Nueva Zelanda',visitante: 'Bélgica',      fecha: '2026-06-26', hora: '23:00', grupo: 'G', fase: 'grupos' }, // 11pm PT+1

  // ── GRUPO H: España · Cabo Verde · Arabia Saudita · Uruguay ──
  { local: 'España',        visitante: 'Cabo Verde',    fecha: '2026-06-15', hora: '12:00', grupo: 'H', fase: 'grupos' }, // noon ET→GMT-6
  { local: 'Arabia Saudita',visitante: 'Uruguay',       fecha: '2026-06-15', hora: '18:00', grupo: 'H', fase: 'grupos' }, // 6pm ET→GMT-6
  { local: 'España',        visitante: 'Arabia Saudita',fecha: '2026-06-21', hora: '12:00', grupo: 'H', fase: 'grupos' }, // noon ET→GMT-6
  { local: 'Uruguay',       visitante: 'Cabo Verde',    fecha: '2026-06-21', hora: '18:00', grupo: 'H', fase: 'grupos' }, // 6pm ET→GMT-6
  { local: 'Cabo Verde',    visitante: 'Arabia Saudita',fecha: '2026-06-26', hora: '20:00', grupo: 'H', fase: 'grupos' }, // 8pm CT
  { local: 'Uruguay',       visitante: 'España',        fecha: '2026-06-26', hora: '20:00', grupo: 'H', fase: 'grupos' }, // 8pm CT

  // ── GRUPO I: Francia · Senegal · Irak · Noruega ──
  { local: 'Francia',  visitante: 'Senegal', fecha: '2026-06-16', hora: '15:00', grupo: 'I', fase: 'grupos' }, // 3pm ET→GMT-6
  { local: 'Irak',     visitante: 'Noruega', fecha: '2026-06-16', hora: '18:00', grupo: 'I', fase: 'grupos' }, // 6pm ET→GMT-6
  { local: 'Francia',  visitante: 'Irak',    fecha: '2026-06-22', hora: '17:00', grupo: 'I', fase: 'grupos' }, // 5pm ET→GMT-6
  { local: 'Noruega',  visitante: 'Senegal', fecha: '2026-06-22', hora: '20:00', grupo: 'I', fase: 'grupos' }, // 8pm ET→GMT-6
  { local: 'Noruega',  visitante: 'Francia', fecha: '2026-06-26', hora: '15:00', grupo: 'I', fase: 'grupos' }, // 3pm ET→GMT-6
  { local: 'Senegal',  visitante: 'Irak',    fecha: '2026-06-26', hora: '15:00', grupo: 'I', fase: 'grupos' }, // 3pm ET→GMT-6

  // ── GRUPO J: Argentina · Argelia · Austria · Jordania ──
  { local: 'Argentina', visitante: 'Argelia',  fecha: '2026-06-16', hora: '21:00', grupo: 'J', fase: 'grupos' }, // 9pm CT
  { local: 'Austria',   visitante: 'Jordania', fecha: '2026-06-17', hora: '00:00', grupo: 'J', fase: 'grupos' }, // midnight PT+1
  { local: 'Argentina', visitante: 'Austria',  fecha: '2026-06-22', hora: '13:00', grupo: 'J', fase: 'grupos' }, // 1pm CT
  { local: 'Jordania',  visitante: 'Argelia',  fecha: '2026-06-22', hora: '23:00', grupo: 'J', fase: 'grupos' }, // 11pm PT+1
  { local: 'Argelia',   visitante: 'Austria',  fecha: '2026-06-27', hora: '22:00', grupo: 'J', fase: 'grupos' }, // 10pm CT
  { local: 'Jordania',  visitante: 'Argentina',fecha: '2026-06-27', hora: '22:00', grupo: 'J', fase: 'grupos' }, // 10pm CT

  // ── GRUPO K: Portugal · Congo · Uzbekistán · Colombia ──
  { local: 'Portugal',   visitante: 'Congo',      fecha: '2026-06-17', hora: '13:00', grupo: 'K', fase: 'grupos' }, // 1pm CT
  { local: 'Uzbekistán', visitante: 'Colombia',   fecha: '2026-06-17', hora: '22:00', grupo: 'K', fase: 'grupos' }, // 10pm CT
  { local: 'Portugal',   visitante: 'Uzbekistán', fecha: '2026-06-23', hora: '13:00', grupo: 'K', fase: 'grupos' }, // 1pm CT
  { local: 'Colombia',   visitante: 'Congo',      fecha: '2026-06-23', hora: '22:00', grupo: 'K', fase: 'grupos' }, // 10pm CT
  { local: 'Colombia',   visitante: 'Portugal',   fecha: '2026-06-27', hora: '19:30', grupo: 'K', fase: 'grupos' }, // 7:30pm ET→GMT-6
  { local: 'Congo',      visitante: 'Uzbekistán', fecha: '2026-06-27', hora: '19:30', grupo: 'K', fase: 'grupos' }, // 7:30pm ET→GMT-6

  // ── GRUPO L: Inglaterra · Croacia · Ghana · Panamá ──
  { local: 'Inglaterra', visitante: 'Croacia', fecha: '2026-06-17', hora: '16:00', grupo: 'L', fase: 'grupos' }, // 4pm CT
  { local: 'Ghana',      visitante: 'Panamá',  fecha: '2026-06-17', hora: '19:00', grupo: 'L', fase: 'grupos' }, // 7pm ET→GMT-6
  { local: 'Inglaterra', visitante: 'Ghana',   fecha: '2026-06-23', hora: '16:00', grupo: 'L', fase: 'grupos' }, // 4pm ET→GMT-6
  { local: 'Panamá',     visitante: 'Croacia', fecha: '2026-06-23', hora: '19:00', grupo: 'L', fase: 'grupos' }, // 7pm ET→GMT-6
  { local: 'Panamá',     visitante: 'Inglaterra', fecha: '2026-06-27', hora: '17:00', grupo: 'L', fase: 'grupos' }, // 5pm ET→GMT-6
  { local: 'Croacia',    visitante: 'Ghana',   fecha: '2026-06-27', hora: '17:00', grupo: 'L', fase: 'grupos' }, // 5pm ET→GMT-6
];

module.exports = { FIXTURE_2026 };
