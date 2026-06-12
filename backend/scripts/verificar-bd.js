require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../src/db/database');

const users = db.prepare(`
  SELECT u.id, u.nombre_completo, u.email,
         COUNT(p.id) as preds,
         pay.status as pago
  FROM users u
  LEFT JOIN predictions p ON p.user_id = u.id
  LEFT JOIN payments pay ON pay.user_id = u.id AND pay.event_id = 1
  WHERE u.role = 'user'
  GROUP BY u.id
  ORDER BY u.nombre_completo
`).all();

console.log('USUARIO                                    | PREDS | PAGO');
console.log('-'.repeat(65));
users.forEach(u => {
  console.log(
    u.nombre_completo.padEnd(42) + '| ' +
    String(u.preds).padStart(4) + '  | ' +
    (u.pago || 'ninguno')
  );
});
console.log('-'.repeat(65));
console.log('Total usuarios:', users.length);
console.log('Total predicciones:', users.reduce((a, u) => a + u.preds, 0));
