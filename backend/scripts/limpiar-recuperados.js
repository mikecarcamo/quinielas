require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/database');

// Borrar SOLO los usuarios recuperados desde PDF (pago con comprobante_url = 'recuperado_pdf')
const pagos = db.prepare(`SELECT user_id FROM payments WHERE comprobante_url = 'recuperado_pdf'`).all();
const ids = pagos.map(p => p.user_id);

if (ids.length === 0) { console.log('Nada que limpiar.'); process.exit(0); }

const ph = ids.map(() => '?').join(',');
db.transaction(() => {
  const p = db.prepare(`DELETE FROM predictions WHERE user_id IN (${ph})`).run(...ids);
  const pay = db.prepare(`DELETE FROM payments WHERE user_id IN (${ph})`).run(...ids);
  const u = db.prepare(`DELETE FROM users WHERE id IN (${ph})`).run(...ids);
  console.log(`Eliminados: ${u.changes} usuarios, ${p.changes} predicciones, ${pay.changes} pagos`);
})();
