require('dotenv').config();

// Ejecutar migración al iniciar (crea tablas y datos iniciales si no existen)
try {
  require('./src/db/migrate');
} catch (e) {
  console.error('Error en migración:', e.message);
}

// Migración incremental: status 'en_curso' — recrear matches sin CHECK restrictivo si necesario
try {
  const db = require('./src/db/database');
  const createSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='matches'").get()?.sql || '';
  if (createSql.includes("CHECK(status IN ('pendiente','finalizado'))") || createSql.includes("CHECK(status IN ('pendiente', 'finalizado'))")) {
    db.exec(`
      PRAGMA foreign_keys = OFF;
      BEGIN;
      CREATE TABLE matches_new (
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
      INSERT INTO matches_new SELECT id,event_id,local,visitante,fecha,grupo,fase,hora,goles_local_real,goles_visitante_real,status,resultado_editado,created_at FROM matches;
      DROP TABLE matches;
      ALTER TABLE matches_new RENAME TO matches;
      COMMIT;
      PRAGMA foreign_keys = ON;
    `);
    console.log('Migración: matches.status CHECK constraint actualizado con en_curso');
  }
} catch (e) {
  console.error('Error en migración status en_curso:', e.message);
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

// ── Endpoints temporales de administración (protegidos por ADMIN_SECRET) ──
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'quiniela-admin-2026';
function checkSecret(req, res, next) {
  if (req.headers['x-admin-secret'] !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
}

app.post('/api/admin/seed-demo', checkSecret, (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const db = require('./src/db/database');
    const DUMMY_TAG = '__DEMO__';
    const EVENT_ID = db.prepare("SELECT id FROM events WHERE is_active=1 ORDER BY id LIMIT 1").get()?.id;
    if (!EVENT_ID) return res.status(500).json({ error: 'No hay evento activo' });

    const matches = db.prepare('SELECT id FROM matches WHERE event_id=? ORDER BY fecha ASC, hora ASC, id ASC').all(EVENT_ID);
    if (!matches.length) return res.status(500).json({ error: 'No hay partidos' });

    const OUTCOMES = [[0,0],[1,0],[0,1],[1,1],[2,0],[0,2],[2,1],[1,2],[2,2],[3,0],[0,3],[3,1],[1,3],[3,2],[4,0],[0,4]];
    const WEIGHTS  = [3,14,12,11,11,9,11,9,5,4,3,3,2,2,1,1];
    const TOTAL_W  = WEIGHTS.reduce((a,b)=>a+b,0);
    function rScore() { let r=Math.random()*TOTAL_W; for(let i=0;i<OUTCOMES.length;i++){r-=WEIGHTS[i];if(r<=0)return OUTCOMES[i];} return [1,1]; }
    function uPred(b) { const d=()=>{const r=Math.random();return r<0.4?0:r<0.7?1:-1;}; return [Math.max(0,b[0]+d()),Math.max(0,b[1]+d())]; }
    const simResults = matches.map(m=>({match_id:m.id,score:rScore()}));

    // Admin mncarcamo
    const ADMIN_EMAIL='mncarcamo@oj.gob.gt';
    const hash=bcrypt.hashSync('123456789',10);
    const ex=db.prepare('SELECT id FROM users WHERE email=?').get(ADMIN_EMAIL);
    if(ex) db.prepare("UPDATE users SET password=?,role='admin',is_active=1,nombre_completo=? WHERE id=?").run(hash,'Administrador MNC',ex.id);
    else db.prepare("INSERT INTO users (nombre_completo,email,password,role,is_active) VALUES (?,?,?,'admin',1)").run('Administrador MNC',ADMIN_EMAIL,hash);

    const NOMBRES=['Carlos López','María García','José Martínez','Ana Rodríguez','Luis Hernández','Laura Pérez','Miguel González','Sofia Ramirez','Diego Torres','Valentina Flores','Andrés Vargas','Isabella Moreno','Sebastián Jiménez','Camila Ruiz','Daniel Castro','Lucía Romero','Pablo Díaz','Fernanda Álvarez','Emilio Morales','Natalia Gutiérrez','Ricardo Mendoza','Paola Reyes','Fernando Soto','Daniela Cruz','Alejandro Núñez','Mariana Ramos','Rodrigo Ortiz','Valeria Gómez','Esteban Castillo','Gabriela Guerrero','Julián Medina','Claudia Herrera','Tomás Aguilar','Patricia Vega','Mateo Ríos','Elena Sandoval','Oscar Campos','Teresa Domínguez','Nicolás Espinoza','Andrea Peña'];
    const hash2=bcrypt.hashSync('Demo1234!',10);
    const iUser=db.prepare("INSERT OR IGNORE INTO users (nombre_completo,email,password,role,is_active) VALUES (?,?,?,'user',1)");
    const iPay =db.prepare("INSERT OR IGNORE INTO payments (user_id,event_id,comprobante_url,status) VALUES (?,?,'demo.pdf','aprobado')");
    const iPred=db.prepare("INSERT OR IGNORE INTO predictions (user_id,match_id,goles_local_pred,goles_visitante_pred,puntos_obtenidos) VALUES (?,?,?,?,0)");
    let creados=0;
    db.transaction(()=>{
      for(let i=0;i<40;i++){
        const email=`demo_user_${i+1}${DUMMY_TAG}@quiniela.test`;
        iUser.run(`${NOMBRES[i]} ${DUMMY_TAG}`,email,hash2);
        const u=db.prepare('SELECT id FROM users WHERE email=?').get(email);
        if(!u) continue;
        iPay.run(u.id,EVENT_ID);
        for(const r of simResults){const[l,v]=uPred(r.score);iPred.run(u.id,r.match_id,l,v);}
        creados++;
      }
    })();
    res.json({ ok:true, message:`Admin creado. ${creados} usuarios demo con ${matches.length} predicciones cada uno.` });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/clean-admin-data', checkSecret, (req, res) => {
  try {
    const db = require('./src/db/database');
    const admins = db.prepare(`SELECT id FROM users WHERE role = 'admin'`).all();
    const ids = admins.map(u => u.id);
    let result = { predicciones: 0, pagos: 0, partidos_reseteados: 0 };
    db.transaction(() => {
      if (ids.length) {
        const ph = ids.map(() => '?').join(',');
        result.predicciones = db.prepare(`DELETE FROM predictions WHERE user_id IN (${ph})`).run(...ids).changes;
        result.pagos        = db.prepare(`DELETE FROM payments WHERE user_id IN (${ph})`).run(...ids).changes;
      }
      result.partidos_reseteados = db.prepare(`UPDATE matches SET goles_local_real=NULL, goles_visitante_real=NULL, status='pendiente', resultado_editado=0`).run().changes;
    })();
    res.json({ ok: true, message: 'Datos de admin limpiados', ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/reset-users', checkSecret, (req, res) => {
  try {
    const db = require('./src/db/database');
    const users = db.prepare(`SELECT id FROM users WHERE role = 'user'`).all();
    const ids = users.map(u => u.id);
    let result = { usuarios: 0, predicciones: 0, pagos: 0, partidos_reseteados: 0 };
    db.transaction(() => {
      if (ids.length) {
        const ph = ids.map(() => '?').join(',');
        result.predicciones = db.prepare(`DELETE FROM predictions WHERE user_id IN (${ph})`).run(...ids).changes;
        result.pagos        = db.prepare(`DELETE FROM payments WHERE user_id IN (${ph})`).run(...ids).changes;
        result.usuarios     = db.prepare(`DELETE FROM users WHERE id IN (${ph})`).run(...ids).changes;
      }
      result.partidos_reseteados = db.prepare(`UPDATE matches SET goles_local_real=NULL, goles_visitante_real=NULL, status='pendiente', resultado_editado=0 WHERE status='finalizado'`).run().changes;
    })();
    res.json({ ok: true, message: 'Reset completo', ...result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/cleanup-demo', checkSecret, (req, res) => {
  try {
    const db = require('./src/db/database');
    const DUMMY_TAG = '__DEMO__';
    const dummies = db.prepare(`SELECT id FROM users WHERE email LIKE ?`).all(`%${DUMMY_TAG}%`);
    const ids = dummies.map(u=>u.id);
    let result = { usuarios:0, predicciones:0, pagos:0, partidos_reseteados:0 };
    db.transaction(()=>{
      if(ids.length){
        const ph=ids.map(()=>'?').join(',');
        result.predicciones=db.prepare(`DELETE FROM predictions WHERE user_id IN (${ph})`).run(...ids).changes;
        result.pagos=db.prepare(`DELETE FROM payments WHERE user_id IN (${ph})`).run(...ids).changes;
        result.usuarios=db.prepare(`DELETE FROM users WHERE id IN (${ph})`).run(...ids).changes;
      }
      result.partidos_reseteados=db.prepare("UPDATE matches SET goles_local_real=NULL,goles_visitante_real=NULL,status='pendiente',resultado_editado=0 WHERE status='finalizado'").run().changes;
      db.prepare("UPDATE predictions SET puntos_obtenidos=0").run();
    })();
    res.json({ ok:true, message:'Limpieza completa', ...result });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/simulate-next', checkSecret, (req, res) => {
  try {
    const db = require('./src/db/database');
    const { recalculateMatchPoints } = require('./src/lib/scoring');
    const event = db.prepare("SELECT id FROM events WHERE is_active=1 ORDER BY id LIMIT 1").get();
    if(!event) return res.status(500).json({ error:'No hay evento activo' });
    const { cantidad = 1 } = req.body;
    const OUTCOMES=[[0,0],[1,0],[0,1],[1,1],[2,0],[0,2],[2,1],[1,2],[2,2],[3,0],[0,3],[3,1],[1,3],[3,2],[2,3],[4,0]];
    const WEIGHTS=[3,14,12,11,11,9,11,9,5,4,3,3,2,2,2,1];
    const TW=WEIGHTS.reduce((a,b)=>a+b,0);
    function rScore(){let r=Math.random()*TW;for(let i=0;i<OUTCOMES.length;i++){r-=WEIGHTS[i];if(r<=0)return OUTCOMES[i];}return[1,1];}
    const pending=db.prepare(`SELECT id,local,visitante,fecha,hora FROM matches WHERE event_id=? AND status='pendiente' ORDER BY fecha ASC,hora ASC,id ASC LIMIT ?`).all(event.id, cantidad);
    if(!pending.length) return res.json({ ok:true, message:'No hay partidos pendientes', finalizados:[] });
    const finalizados=[];
    db.transaction(()=>{
      for(const m of pending){
        const[gl,gv]=rScore();
        db.prepare("UPDATE matches SET goles_local_real=?,goles_visitante_real=?,status='finalizado',resultado_editado=0 WHERE id=?").run(gl,gv,m.id);
        recalculateMatchPoints(db,m.id);
        finalizados.push({partido:`${m.local} ${gl}-${gv} ${m.visitante}`,fecha:m.fecha,hora:m.hora});
      }
    })();
    res.json({ ok:true, finalizados });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Quiniela Backend corriendo en puerto ${PORT}`);

  // Iniciar sincronización en vivo con football-data.org (solo si hay API key)
  const { startFootballDataSync } = require('./src/lib/footballDataSync');
  const db = require('./src/db/database');
  const { recalculateMatchPoints } = require('./src/lib/scoring');
  startFootballDataSync(db, recalculateMatchPoints);
});

module.exports = app;
