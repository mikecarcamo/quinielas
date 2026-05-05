require('dotenv').config();

// Ejecutar migración al iniciar (crea tablas y datos iniciales si no existen)
try {
  require('./src/db/migrate');
} catch (e) {
  console.error('Error en migración:', e.message);
}

// Migración incremental: agregar columna hora si no existe, y siempre sincronizar horas del fixture
try {
  const db = require('./src/db/database');
  const cols = db.pragma('table_info(matches)').map(c => c.name);
  if (!cols.includes('hora')) {
    db.exec("ALTER TABLE matches ADD COLUMN hora TEXT");
    console.log('Columna hora agregada a matches');
  }
  const { FIXTURE_2026 } = require('./src/db/fixture2026');
  const update = db.prepare('UPDATE matches SET hora = ? WHERE local = ? AND visitante = ? AND fecha = ?');
  const updateAll = db.transaction(() => {
    for (const m of FIXTURE_2026) {
      update.run(m.hora, m.local, m.visitante, m.fecha);
    }
  });
  updateAll();
  console.log('Horas de partidos sincronizadas');
} catch (e) {
  console.error('Error en migración incremental hora:', e.message);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./src/routes/auth');
const matchRoutes = require('./src/routes/matches');
const predictionRoutes = require('./src/routes/predictions');
const paymentRoutes = require('./src/routes/payments');
const rankingRoutes = require('./src/routes/ranking');
const eventRoutes = require('./src/routes/events');

const app = express();
const PORT = process.env.PORT || 4001;

const dataDir = path.join('/app/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3001').split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS bloqueado: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ranking', rankingRoutes);
app.use('/api/events', eventRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Seed demo: se activa con variable de entorno SEED_DEMO=true en Railway
if (process.env.SEED_DEMO === 'true') {
  try {
    require('./scripts/seed-demo');
    console.log('Seed demo ejecutado al arrancar');
  } catch (e) {
    console.error('Error en seed demo:', e.message);
  }
}

// Simulador de marcadores: se activa con SIMULATE_SCORES=true en Railway
if (process.env.SIMULATE_SCORES === 'true') {
  const db = require('./src/db/database');
  const { recalculateMatchPoints } = require('./src/lib/scoring');

  const OUTCOMES = [
    {s:[0,0],w:3},{s:[1,0],w:14},{s:[0,1],w:12},{s:[1,1],w:11},
    {s:[2,0],w:11},{s:[0,2],w:9},{s:[2,1],w:11},{s:[1,2],w:9},
    {s:[2,2],w:5},{s:[3,0],w:4},{s:[0,3],w:3},{s:[3,1],w:3},
    {s:[1,3],w:2},{s:[3,2],w:2},{s:[2,3],w:2},{s:[4,0],w:1},
  ];
  const TOTAL_W = OUTCOMES.reduce((a,o)=>a+o.w,0);
  function randomScore() {
    let r = Math.random()*TOTAL_W;
    for (const o of OUTCOMES) { r-=o.w; if(r<=0) return [...o.s]; }
    return [1,1];
  }

  const event = db.prepare("SELECT id FROM events WHERE is_active=1 ORDER BY id LIMIT 1").get();
  if (event) {
    console.log('🚀 Simulador de marcadores iniciado (1 partido/minuto)');
    const simInterval = setInterval(() => {
      const next = db.prepare(`SELECT id,local,visitante,fecha,hora FROM matches WHERE event_id=? AND status='pendiente' ORDER BY fecha ASC, hora ASC, id ASC LIMIT 1`).get(event.id);
      if (!next) {
        console.log('🏆 Simulación completa. Todos los partidos finalizados.');
        clearInterval(simInterval);
        return;
      }
      const [gl,gv] = randomScore();
      db.prepare(`UPDATE matches SET goles_local_real=?,goles_visitante_real=?,status='finalizado',resultado_editado=0 WHERE id=?`).run(gl,gv,next.id);
      recalculateMatchPoints(db, next.id);
      console.log(`⚽ ${next.local} ${gl}-${gv} ${next.visitante} (${next.fecha} ${next.hora||''})`);
    }, 60*1000);
  }
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Quiniela Backend corriendo en puerto ${PORT}`);
});

module.exports = app;
