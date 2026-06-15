/**
 * footballDataSync.js
 * Sincroniza resultados en vivo desde football-data.org v4
 * Requiere variable de entorno: FOOTBALL_DATA_API_KEY
 *
 * Frecuencia adaptativa:
 *  - Partido en curso (IN_PLAY / PAUSED)  → cada 2 min
 *  - Partido hoy pero no iniciado         → cada 5 min
 *  - Sin partidos activos hoy             → cada 60 min
 */

const https = require('https');

const API_KEY  = process.env.FOOTBALL_DATA_API_KEY;
const BASE_URL = 'api.football-data.org';
const COMP     = 'WC'; // Copa del Mundo FIFA

// ── Mapeo de nombres FIFA → nombres en tu BD ──────────────────────────────
// Agrega aquí cualquier discrepancia entre el nombre que devuelve la API y el que tienes en BD
const NAME_MAP = {
  'USA':                    'Estados Unidos',
  'United States':          'Estados Unidos',
  'Korea Republic':         'Corea del Sur',
  'South Korea':            'Corea del Sur',
  'IR Iran':                'Irán',
  'Côte d\'Ivoire':         'Costa de Marfil',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  'New Zealand':            'Nueva Zelanda',
  'Saudi Arabia':           'Arabia Saudita',
  'Curaçao':                'Curazao',
  'Norway':                 'Noruega',
  'Morocco':                'Marruecos',
  'Switzerland':            'Suiza',
  'Netherlands':            'Países Bajos',
  'Australia':              'Australia',
  'Japan':                  'Japón',
  'Tunisia':                'Túnez',
  'Germany':                'Alemania',
  'Belgium':                'Bélgica',
  'Ecuador':                'Ecuador',
  'Turkey':                 'Turquía',
  'Scotland':               'Escocia',
  'Portugal':               'Portugal',
  'Serbia':                 'Serbia',
  'Ukraine':                'Ucrania',
  'Hungary':                'Hungría',
  'Romania':                'Rumanía',
  'Czechia':                'Chequia',
  'Czech Republic':         'Chequia',
  'Senegal':                'Senegal',
  'Algeria':                'Argelia',
  'Nigeria':                'Nigeria',
  'Cameroon':               'Camerún',
  'Egypt':                  'Egipto',
  'Uzbekistan':             'Uzbekistán',
  'Colombia':               'Colombia',
  'Venezuela':              'Venezuela',
  'Paraguay':               'Paraguay',
  'Uruguay':                'Uruguay',
  'Chile':                  'Chile',
  'Peru':                   'Perú',
  'Canada':                 'Canadá',
  'Mexico':                 'México',
  'South Africa':           'Sudáfrica',
  'Brazil':                 'Brasil',
  'Haiti':                  'Haití',
  'Sweden':                 'Suecia',
  'Spain':                  'España',
  'Cape Verde':             'Cabo Verde',
  'Cabo Verde':             'Cabo Verde',
  'Iraq':                   'Irak',
  'France':                 'Francia',
  'Congo DR':               'Congo',
  'DR Congo':               'Congo',
  'Democratic Republic of Congo': 'Congo',
  'England':                'Inglaterra',
  'Croatia':                'Croacia',
  'Panama':                 'Panamá',
  'Jordan':                 'Jordania',
  'Iran':                   'Irán',
  'Ivory Coast':            'Costa de Marfil',
  'Greece':                 'Grecia',
  'Poland':                 'Polonia',
  'Denmark':                'Dinamarca',
  'Wales':                  'Gales',
};

function normalize(name) {
  return NAME_MAP[name] || name;
}

// ── HTTP helper ───────────────────────────────────────────────────────────
function apiGet(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path,
      method: 'GET',
      headers: { 'X-Auth-Token': API_KEY },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { reject(new Error('JSON parse error: ' + data.slice(0, 200))); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// ── Lógica de sincronización ──────────────────────────────────────────────
async function syncMatches(db, recalculateMatchPoints) {
  const today = new Date().toISOString().slice(0, 10);

  // Obtener partidos de hoy y mañana para anticipar
  const dateTo = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const { status, body } = await apiGet(
    `/v4/competitions/${COMP}/matches?dateFrom=${today}&dateTo=${dateTo}`
  );

  if (status !== 200) {
    console.warn(`[FIFA-SYNC] API respondió ${status}:`, body?.message || '');
    return { interval: 60 * 60 * 1000 }; // reintentar en 1h si hay error
  }

  const apiMatches = body.matches || [];
  let hasLive = false;
  let hasToday = false;
  let synced = 0;

  for (const am of apiMatches) {
    const homeRaw = am.homeTeam?.name || am.homeTeam?.shortName || '';
    const awayRaw = am.awayTeam?.name || am.awayTeam?.shortName || '';
    const homeTeam = normalize(homeRaw);
    const awayTeam = normalize(awayRaw);
    const apiStatus = am.status; // SCHEDULED, IN_PLAY, PAUSED, FINISHED, POSTPONED

    if (apiStatus === 'IN_PLAY' || apiStatus === 'PAUSED') hasLive = true;
    if (am.utcDate?.slice(0, 10) === today) hasToday = true;

    if (apiStatus !== 'IN_PLAY' && apiStatus !== 'PAUSED' && apiStatus !== 'FINISHED') continue;

    const scoreHome = am.score?.fullTime?.home ?? am.score?.halfTime?.home ?? null;
    const scoreAway = am.score?.fullTime?.away ?? am.score?.halfTime?.away ?? null;
    if (scoreHome === null || scoreAway === null) continue;

    // Buscar partido en BD por equipos (orden local/visitante)
    const match = db.prepare(
      `SELECT id, status, goles_local_real, goles_visitante_real, resultado_editado
       FROM matches WHERE local = ? AND visitante = ?`
    ).get(homeTeam, awayTeam)
    || db.prepare(
      `SELECT id, status, goles_local_real, goles_visitante_real, resultado_editado
       FROM matches WHERE local = ? AND visitante = ?`
    ).get(awayTeam, homeTeam); // por si el orden está invertido

    if (!match) {
      console.warn(`[FIFA-SYNC] Partido no encontrado en BD: "${homeTeam}" vs "${awayTeam}" (raw: "${homeRaw}" vs "${awayRaw}")`);
      continue;
    }

    // Nunca sobreescribir un partido ya finalizado (admin lo cerró manualmente)
    if (match.status === 'finalizado') continue;

    const nuevoStatus = apiStatus === 'FINISHED' ? 'finalizado' : (apiStatus === 'IN_PLAY' || apiStatus === 'PAUSED') ? 'en_curso' : 'pendiente';
    const cambioMarcador = match.goles_local_real !== scoreHome || match.goles_visitante_real !== scoreAway;
    const cambioStatus   = match.status !== nuevoStatus;

    if (cambioMarcador || cambioStatus) {
      db.prepare(
        `UPDATE matches SET goles_local_real=?, goles_visitante_real=?, status=?, resultado_editado=0 WHERE id=?`
      ).run(scoreHome, scoreAway, nuevoStatus, match.id);

      // Recalcular puntos en tiempo real tanto para en_curso como finalizado
      recalculateMatchPoints(db, match.id);

      console.log(`[FIFA-SYNC] ⚽ ${homeTeam} ${scoreHome}-${scoreAway} ${awayTeam} [${apiStatus}]`);
      synced++;
    }
  }

  if (synced > 0) console.log(`[FIFA-SYNC] ${synced} partido(s) actualizados`);

  // Devolver el intervalo adecuado
  if (hasLive)  return { interval: 1  * 60 * 1000 }; // 1 min si hay partido en curso
  if (hasToday) return { interval: 5  * 60 * 1000 }; // 5 min si hay partido hoy
  return        { interval: 60 * 60 * 1000 };         // 60 min si no hay nada hoy
}

// ── Iniciar job adaptativo ────────────────────────────────────────────────
function startFootballDataSync(db, recalculateMatchPoints) {
  if (!API_KEY) {
    console.log('[FIFA-SYNC] FOOTBALL_DATA_API_KEY no configurada. Sincronización desactivada.');
    return;
  }

  console.log('[FIFA-SYNC] Sincronización con football-data.org iniciada.');
  let timer = null;

  async function run() {
    try {
      const { interval } = await syncMatches(db, recalculateMatchPoints);
      console.log(`[FIFA-SYNC] Próxima sincronización en ${interval / 60000} min`);
      timer = setTimeout(run, interval);
    } catch (err) {
      console.error('[FIFA-SYNC] Error:', err.message);
      timer = setTimeout(run, 5 * 60 * 1000); // reintentar en 5 min si falla
    }
  }

  // Primera ejecución a los 10 segundos de arrancar el servidor
  timer = setTimeout(run, 10 * 1000);

  return () => clearTimeout(timer); // función para detenerlo si se necesita
}

module.exports = { startFootballDataSync };
