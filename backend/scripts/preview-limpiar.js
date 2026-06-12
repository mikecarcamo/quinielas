require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/database');

const rows = db.prepare(`
  SELECT u.id, u.nombre_completo, u.email, COUNT(p.id) as preds
  FROM payments pay
  JOIN users u ON u.id = pay.user_id
  LEFT JOIN predictions p ON p.user_id = u.id
  WHERE pay.comprobante_url = 'recuperado_pdf'
  GROUP BY u.id
  ORDER BY u.nombre_completo
`).all();

console.log('ID  | NOMBRE                                    | EMAIL                                | PREDS');
console.log('-'.repeat(100));
rows.forEach(u =>
  console.log(
    String(u.id).padStart(3) + ' | ' +
    u.nombre_completo.padEnd(42) + '| ' +
    u.email.padEnd(37) + '| ' +
    u.preds
  )
);
console.log('-'.repeat(100));
console.log('Total a limpiar:', rows.length, 'usuarios,', rows.reduce((a, u) => a + u.preds, 0), 'predicciones');
