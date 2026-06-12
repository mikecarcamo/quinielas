/**
 * Script para recuperar quinielas desde PDFs
 * Lee los PDFs de PRONOSTICOS/, extrae usuarios y predicciones, y los recrea en la BD
 *
 * Formato de los PDFs:
 *   Participante: <Nombre Completo>
 *   <Local> vs <Visitante> <dd>-<mes> <gl> - <gv> — Pend.      (pendiente)
 *   <Local> vs <Visitante> <dd>-<mes> <gl> - <gv> <gr> - <gvr> +<pts>  (jugado)
 *
 * USO: node scripts/recuperar-quinielas.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const bcrypt = require('bcryptjs');

const PRONOSTICOS_DIR = path.join(__dirname, '..', 'src', 'db', 'PRONOSTICOS');
const db = require('../src/db/database');

// Contraseña temporal para todos los usuarios recuperados
const PASSWORD_HASH = bcrypt.hashSync('Quiniela2026!', 10);

// Evento activo
const event = db.prepare("SELECT id FROM events WHERE is_active = 1 ORDER BY id LIMIT 1").get();
if (!event) { console.error('❌ No hay evento activo en la BD'); process.exit(1); }
const EVENT_ID = event.id;
console.log(`📅 Evento activo ID: ${EVENT_ID}\n`);

// Cargar todos los partidos para hacer el match lookup
const allMatches = db.prepare('SELECT * FROM matches WHERE event_id = ?').all(EVENT_ID);
console.log(`⚽ Partidos en BD: ${allMatches.length}\n`);

// ── Extraer texto del PDF ──────────────────────────────────────────────────
async function extractTextFromPDF(pdfPath) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser();
    parser.on('pdfParser_dataError', reject);
    parser.on('pdfParser_dataReady', (data) => {
      const text = data.Pages
        .map(page => page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(' '))
        .join(' ');
      resolve(text);
    });
    parser.loadPDF(pdfPath);
  });
}

// ── Extraer nombre del participante del texto del PDF ─────────────────────
function extractParticipantName(text) {
  const m = text.match(/Participante:\s+(.+?)\s+Generado:/);
  return m ? m[1].trim() : null;
}

// ── Generar email a partir del nombre ─────────────────────────────────────
function nameToEmail(fullName) {
  return fullName
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '') + '@quiniela.com';
}

// ── Buscar partido en BD por nombre de equipos ────────────────────────────
function normalize(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function findMatch(local, visitante) {
  const nL = normalize(local);
  const nV = normalize(visitante);
  return allMatches.find(m =>
    (normalize(m.local) === nL && normalize(m.visitante) === nV) ||
    (normalize(m.local) === nV && normalize(m.visitante) === nL)
  ) || null;
}

// ── Parsear pronósticos del texto ─────────────────────────────────────────
// Formato: "Local vs Visitante dd-mes gl - gv — Pend."
//          "Local vs Visitante dd-mes gl - gv gr - gvr +pts"
function parsePredictions(rawText) {
  const predictions = [];
  const notFound = [];

  // Eliminar encabezados de tabla que aparecen en PDFs multipágina
  // "Partido Fecha Pronóstico Real Pts" precede a líneas reales en páginas 2+
  const text = rawText.replace(/Partido\s+Fecha\s+Pronóstico\s+Real\s+Pts\s*/g, '');

  // Patrón: "<equipo> vs <equipo> <dd>-<mes> <gl> - <gv> (— Pend. | <gr> - <gvr> +<pts>)"
  const pattern = /([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s]+?)\s+vs\s+([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ\s]+?)\s+\d{1,2}-\w+\s+(\d+)\s*-\s*(\d+)\s+(?:—\s*Pend\.|[\d]+\s*-\s*[\d]+\s*[+\-]\d+)/g;

  let m;
  while ((m = pattern.exec(text)) !== null) {
    const local     = m[1].trim();
    const visitante = m[2].trim();
    const gl        = parseInt(m[3], 10);
    const gv        = parseInt(m[4], 10);

    const matchObj = findMatch(local, visitante);
    if (matchObj) {
      // Evitar duplicados
      if (!predictions.find(p => p.match_id === matchObj.id)) {
        predictions.push({
          match_id: matchObj.id,
          local: matchObj.local,
          visitante: matchObj.visitante,
          goles_local_pred: gl,
          goles_visitante_pred: gv
        });
      }
    } else {
      notFound.push(`${local} vs ${visitante}`);
    }
  }

  return { predictions, notFound };
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const files = fs.readdirSync(PRONOSTICOS_DIR)
    .filter(f => f.endsWith('.pdf'))
    .sort();

  console.log(`📄 PDFs encontrados: ${files.length}\n`);
  console.log('─'.repeat(60));

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (nombre_completo, email, password, role, is_active)
    VALUES (?, ?, ?, 'user', 1)
  `);
  const insertPayment = db.prepare(`
    INSERT OR IGNORE INTO payments (user_id, event_id, comprobante_url, status)
    VALUES (?, ?, 'recuperado_pdf', 'aprobado')
  `);
  const insertPrediction = db.prepare(`
    INSERT OR IGNORE INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos)
    VALUES (?, ?, ?, ?, 0)
  `);

  const stats = { usuarios: 0, pagos: 0, predicciones: 0, sinPronosticos: 0, errores: 0 };

  for (const file of files) {
    const filepath = path.join(PRONOSTICOS_DIR, file);
    console.log(`\n📄 ${file}`);

    try {
      const text = await extractTextFromPDF(filepath);

      // Extraer nombre real desde el PDF
      const fullName = extractParticipantName(text) || file.replace(/^quiniela_/, '').replace(/_\d{4}-\d{2}-\d{2}\.pdf$/, '').replace(/_+$/, '').replace(/_/g, ' ');
      const email = nameToEmail(fullName);

      console.log(`   👤 ${fullName}  →  ${email}`);

      // Crear o recuperar usuario
      insertUser.run(fullName, email, PASSWORD_HASH);
      const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (!user) { console.warn(`   ⚠️  No se pudo crear usuario`); stats.errores++; continue; }
      stats.usuarios++;

      // Pago aprobado
      insertPayment.run(user.id, EVENT_ID);
      stats.pagos++;

      // Parsear pronósticos
      const { predictions, notFound } = parsePredictions(text);

      if (notFound.length > 0) {
        console.warn(`   ⚠️  Partidos no encontrados: ${notFound.join(', ')}`);
      }

      if (predictions.length === 0) {
        console.log(`   ℹ️  Sin pronósticos registrados en este PDF`);
        stats.sinPronosticos++;
        continue;
      }

      db.transaction(() => {
        for (const pred of predictions) {
          insertPrediction.run(user.id, pred.match_id, pred.goles_local_pred, pred.goles_visitante_pred);
        }
      })();

      console.log(`   ✅ ${predictions.length} pronósticos guardados`);
      stats.predicciones += predictions.length;

    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
      stats.errores++;
    }
  }

  console.log('\n' + '─'.repeat(60));
  console.log('📊 RESUMEN FINAL:');
  console.log(`   Usuarios creados/recuperados : ${stats.usuarios}`);
  console.log(`   Pagos aprobados              : ${stats.pagos}`);
  console.log(`   Pronósticos guardados        : ${stats.predicciones}`);
  console.log(`   PDFs sin pronósticos         : ${stats.sinPronosticos}`);
  console.log(`   Errores                      : ${stats.errores}`);
  console.log('\n🎉 Recuperación completada!');
  console.log('🔑 Contraseña temporal de todos los usuarios: Quiniela2026!');
}

main().catch(console.error);
