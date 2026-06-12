// seed-produccion.js — generado automáticamente desde PDFs
// Inserta los 23 usuarios y sus pronósticos en producción
// USO: node scripts/seed-produccion.js
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const db = require('../src/db/database');

const PASSWORD_HASH = bcrypt.hashSync('Quiniela2026!', 10);
const event = db.prepare("SELECT id FROM events WHERE is_active = 1 ORDER BY id LIMIT 1").get();
if (!event) { console.error('No hay evento activo'); process.exit(1); }
const EVENT_ID = event.id;

const insertUser = db.prepare(`INSERT OR IGNORE INTO users (nombre_completo, email, password, role, is_active) VALUES (?, ?, ?, 'user', 1)`);
const insertPayment = db.prepare(`INSERT OR IGNORE INTO payments (user_id, event_id, comprobante_url, status) VALUES (?, ?, 'recuperado_pdf', 'aprobado')`);
const insertPred = db.prepare(`INSERT OR IGNORE INTO predictions (user_id, match_id, goles_local_pred, goles_visitante_pred, puntos_obtenidos) VALUES (?, ?, ?, ?, 0)`);

const USUARIOS = [
  {
    nombre: "Abner Daniel Garcia",
    email: "abner.daniel.garcia@quiniela.com",
    preds: [
      { match_id: 123, gl: 3, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 0 }, // Corea del Sur vs Chequia
      { match_id: 125, gl: 2, gv: 1 }, // Chequia vs Sudáfrica
      { match_id: 126, gl: 1, gv: 2 }, // México vs Corea del Sur
      { match_id: 127, gl: 1, gv: 3 }, // Chequia vs México
      { match_id: 128, gl: 1, gv: 3 }, // Sudáfrica vs Corea del Sur
      { match_id: 129, gl: 2, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 1, gv: 3 }, // Qatar vs Suiza
      { match_id: 131, gl: 2, gv: 0 }, // Suiza vs Bosnia y Herzegovina
      { match_id: 132, gl: 3, gv: 1 }, // Canadá vs Qatar
      { match_id: 133, gl: 1, gv: 0 }, // Suiza vs Canadá
      { match_id: 134, gl: 1, gv: 0 }, // Bosnia y Herzegovina vs Qatar
      { match_id: 135, gl: 3, gv: 0 }, // Brasil vs Marruecos
      { match_id: 136, gl: 1, gv: 1 }, // Haití vs Escocia
      { match_id: 137, gl: 0, gv: 1 }, // Escocia vs Marruecos
      { match_id: 138, gl: 4, gv: 0 }, // Brasil vs Haití
      { match_id: 139, gl: 1, gv: 4 }, // Escocia vs Brasil
      { match_id: 140, gl: 2, gv: 1 }, // Marruecos vs Haití
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 1 }, // Australia vs Turquía
      { match_id: 143, gl: 2, gv: 2 }, // Turquía vs Paraguay
      { match_id: 144, gl: 2, gv: 0 }, // Estados Unidos vs Australia
      { match_id: 145, gl: 1, gv: 3 }, // Turquía vs Estados Unidos
      { match_id: 146, gl: 1, gv: 1 }, // Paraguay vs Australia
      { match_id: 147, gl: 5, gv: 0 }, // Alemania vs Curazao
      { match_id: 148, gl: 0, gv: 1 }, // Costa de Marfil vs Ecuador
      { match_id: 149, gl: 3, gv: 1 }, // Alemania vs Costa de Marfil
      { match_id: 150, gl: 1, gv: 1 }, // Ecuador vs Curazao
      { match_id: 151, gl: 1, gv: 3 }, // Ecuador vs Alemania
      { match_id: 152, gl: 0, gv: 2 }, // Curazao vs Costa de Marfil
      { match_id: 153, gl: 2, gv: 3 }, // Países Bajos vs Japón
      { match_id: 154, gl: 1, gv: 0 }, // Suecia vs Túnez
      { match_id: 155, gl: 1, gv: 2 }, // Países Bajos vs Suecia
      { match_id: 156, gl: 0, gv: 2 }, // Túnez vs Japón
      { match_id: 157, gl: 3, gv: 1 }, // Japón vs Suecia
      { match_id: 158, gl: 0, gv: 3 }, // Túnez vs Países Bajos
      { match_id: 159, gl: 0, gv: 0 }, // Irán vs Nueva Zelanda
      { match_id: 160, gl: 1, gv: 1 }, // Bélgica vs Egipto
      { match_id: 161, gl: 2, gv: 0 }, // Bélgica vs Irán
      { match_id: 162, gl: 1, gv: 2 }, // Nueva Zelanda vs Egipto
      { match_id: 163, gl: 2, gv: 1 }, // Egipto vs Irán
      { match_id: 164, gl: 1, gv: 2 }, // Nueva Zelanda vs Bélgica
      { match_id: 165, gl: 4, gv: 0 }, // España vs Cabo Verde
      { match_id: 166, gl: 1, gv: 3 }, // Arabia Saudita vs Uruguay
      { match_id: 167, gl: 3, gv: 0 }, // España vs Arabia Saudita
      { match_id: 168, gl: 4, gv: 0 }, // Uruguay vs Cabo Verde
      { match_id: 169, gl: 0, gv: 1 }, // Cabo Verde vs Arabia Saudita
      { match_id: 170, gl: 2, gv: 2 }, // Uruguay vs España
      { match_id: 171, gl: 3, gv: 1 }, // Francia vs Senegal
      { match_id: 172, gl: 1, gv: 2 }, // Irak vs Noruega
      { match_id: 173, gl: 4, gv: 0 }, // Francia vs Irak
      { match_id: 174, gl: 2, gv: 1 }, // Noruega vs Senegal
      { match_id: 175, gl: 1, gv: 2 }, // Noruega vs Francia
      { match_id: 176, gl: 1, gv: 1 }, // Senegal vs Irak
      { match_id: 177, gl: 3, gv: 0 }, // Argentina vs Argelia
      { match_id: 178, gl: 1, gv: 1 }, // Austria vs Jordania
      { match_id: 179, gl: 2, gv: 0 }, // Argentina vs Austria
      { match_id: 180, gl: 1, gv: 2 }, // Jordania vs Argelia
      { match_id: 181, gl: 2, gv: 1 }, // Argelia vs Austria
      { match_id: 182, gl: 1, gv: 3 }, // Jordania vs Argentina
      { match_id: 183, gl: 3, gv: 0 }, // Portugal vs Congo
      { match_id: 184, gl: 1, gv: 3 }, // Uzbekistán vs Colombia
      { match_id: 185, gl: 3, gv: 1 }, // Portugal vs Uzbekistán
      { match_id: 186, gl: 3, gv: 0 }, // Colombia vs Congo
      { match_id: 187, gl: 1, gv: 3 }, // Colombia vs Portugal
      { match_id: 188, gl: 0, gv: 1 }, // Congo vs Uzbekistán
      { match_id: 189, gl: 1, gv: 2 }, // Inglaterra vs Croacia
      { match_id: 190, gl: 2, gv: 2 }, // Ghana vs Panamá
      { match_id: 191, gl: 2, gv: 1 }, // Inglaterra vs Ghana
      { match_id: 192, gl: 0, gv: 2 }, // Panamá vs Croacia
      { match_id: 193, gl: 1, gv: 3 }, // Panamá vs Inglaterra
      { match_id: 194, gl: 2, gv: 1 }, // Croacia vs Ghana
    ]
  },
  {
    nombre: "Alejandra Bosarreyes",
    email: "alejandra.bosarreyes@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 1, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 1, gv: 0 }, // Qatar vs Suiza
      { match_id: 135, gl: 2, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 2 }, // Haití vs Escocia
      { match_id: 141, gl: 2, gv: 0 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 0, gv: 1 }, // Australia vs Turquía
    ]
  },
  {
    nombre: "Alfredo Alexander Chacón Hernández",
    email: "alfredo.alexander.chacon.hernandez@quiniela.com",
    preds: [
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 1, gv: 3 }, // Qatar vs Suiza
      { match_id: 135, gl: 4, gv: 0 }, // Brasil vs Marruecos
      { match_id: 136, gl: 1, gv: 1 }, // Haití vs Escocia
      { match_id: 141, gl: 3, gv: 2 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 2, gv: 1 }, // Australia vs Turquía
      { match_id: 147, gl: 5, gv: 2 }, // Alemania vs Curazao
      { match_id: 148, gl: 1, gv: 1 }, // Costa de Marfil vs Ecuador
      { match_id: 153, gl: 1, gv: 2 }, // Países Bajos vs Japón
      { match_id: 154, gl: 1, gv: 0 }, // Suecia vs Túnez
      { match_id: 159, gl: 2, gv: 1 }, // Irán vs Nueva Zelanda
      { match_id: 160, gl: 2, gv: 1 }, // Bélgica vs Egipto
      { match_id: 165, gl: 4, gv: 0 }, // España vs Cabo Verde
      { match_id: 166, gl: 1, gv: 2 }, // Arabia Saudita vs Uruguay
    ]
  },
  {
    nombre: "BYRON ALEXANDER OSORIO OROZCO",
    email: "byron.alexander.osorio.orozco@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 3, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 141, gl: 2, gv: 0 }, // Estados Unidos vs Paraguay
    ]
  },
  {
    nombre: "Danilo",
    email: "danilo@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 2 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 1, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 141, gl: 2, gv: 0 }, // Estados Unidos vs Paraguay
    ]
  },
  {
    nombre: "Denys Cardona",
    email: "denys.cardona@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 0, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 1, gv: 3 }, // Qatar vs Suiza
      { match_id: 135, gl: 4, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 3 }, // Haití vs Escocia
      { match_id: 141, gl: 1, gv: 0 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 2, gv: 4 }, // Australia vs Turquía
    ]
  },
  {
    nombre: "Emiliano",
    email: "emiliano@quiniela.com",
    preds: [
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 2, gv: 4 }, // Qatar vs Suiza
      { match_id: 135, gl: 2, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 3, gv: 1 }, // Haití vs Escocia
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 0, gv: 2 }, // Australia vs Turquía
    ]
  },
  {
    nombre: "Evelyn Lisseth Lopez Morales",
    email: "evelyn.lisseth.lopez.morales@quiniela.com",
    preds: [
      { match_id: 129, gl: 1, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 3 }, // Qatar vs Suiza
      { match_id: 135, gl: 2, gv: 2 }, // Brasil vs Marruecos
      { match_id: 136, gl: 1, gv: 3 }, // Haití vs Escocia
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 0, gv: 0 }, // Australia vs Turquía
      { match_id: 147, gl: 10, gv: 0 }, // Alemania vs Curazao
      { match_id: 148, gl: 1, gv: 0 }, // Costa de Marfil vs Ecuador
      { match_id: 153, gl: 1, gv: 2 }, // Países Bajos vs Japón
      { match_id: 154, gl: 0, gv: 0 }, // Suecia vs Túnez
      { match_id: 159, gl: 0, gv: 0 }, // Irán vs Nueva Zelanda
      { match_id: 160, gl: 5, gv: 0 }, // Bélgica vs Egipto
      { match_id: 165, gl: 8, gv: 0 }, // España vs Cabo Verde
      { match_id: 166, gl: 2, gv: 1 }, // Arabia Saudita vs Uruguay
      { match_id: 171, gl: 3, gv: 1 }, // Francia vs Senegal
      { match_id: 172, gl: 0, gv: 0 }, // Irak vs Noruega
      { match_id: 177, gl: 2, gv: 1 }, // Argentina vs Argelia
      { match_id: 178, gl: 2, gv: 2 }, // Austria vs Jordania
      { match_id: 183, gl: 7, gv: 0 }, // Portugal vs Congo
      { match_id: 184, gl: 0, gv: 1 }, // Uzbekistán vs Colombia
      { match_id: 189, gl: 2, gv: 1 }, // Inglaterra vs Croacia
      { match_id: 190, gl: 2, gv: 0 }, // Ghana vs Panamá
    ]
  },
  {
    nombre: "Felix Tuch",
    email: "felix.tuch@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 2, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 1, gv: 2 }, // Qatar vs Suiza
      { match_id: 135, gl: 2, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 2 }, // Haití vs Escocia
      { match_id: 141, gl: 2, gv: 0 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 1 }, // Australia vs Turquía
      { match_id: 147, gl: 5, gv: 0 }, // Alemania vs Curazao
      { match_id: 148, gl: 1, gv: 2 }, // Costa de Marfil vs Ecuador
      { match_id: 153, gl: 1, gv: 1 }, // Países Bajos vs Japón
      { match_id: 154, gl: 2, gv: 1 }, // Suecia vs Túnez
    ]
  },
  {
    nombre: "Huriel Gómez",
    email: "huriel.gomez@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 1, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
    ]
  },
  {
    nombre: "Jacqueline Carcamo",
    email: "jacqueline.carcamo@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 2 }, // Qatar vs Suiza
      { match_id: 135, gl: 3, gv: 0 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 2 }, // Haití vs Escocia
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 2 }, // Australia vs Turquía
    ]
  },
  {
    nombre: "Jose Arredondo",
    email: "jose.arredondo@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 0 }, // Corea del Sur vs Chequia
    ]
  },
  {
    nombre: "Jose Miguel Carcamo",
    email: "jose.miguel.carcamo@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 0 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 141, gl: 1, gv: 1 }, // Estados Unidos vs Paraguay
    ]
  },
  {
    nombre: "Juan José Hernández López",
    email: "juan.jose.hernandez.lopez@quiniela.com",
    preds: [
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 2 }, // Qatar vs Suiza
      { match_id: 135, gl: 2, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 2 }, // Haití vs Escocia
      { match_id: 141, gl: 1, gv: 2 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 2 }, // Australia vs Turquía
    ]
  },
  {
    nombre: "MANUEL ALEJANDRO OCHOA ORELLANA",
    email: "manuel.alejandro.ochoa.orellana@quiniela.com",
    preds: [
      { match_id: 123, gl: 3, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 2, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 125, gl: 2, gv: 0 }, // Chequia vs Sudáfrica
      { match_id: 126, gl: 1, gv: 1 }, // México vs Corea del Sur
      { match_id: 127, gl: 0, gv: 2 }, // Chequia vs México
      { match_id: 128, gl: 0, gv: 2 }, // Sudáfrica vs Corea del Sur
      { match_id: 130, gl: 0, gv: 2 }, // Qatar vs Suiza
      { match_id: 131, gl: 2, gv: 1 }, // Suiza vs Bosnia y Herzegovina
      { match_id: 132, gl: 2, gv: 0 }, // Canadá vs Qatar
      { match_id: 133, gl: 2, gv: 2 }, // Suiza vs Canadá
      { match_id: 134, gl: 1, gv: 1 }, // Bosnia y Herzegovina vs Qatar
      { match_id: 135, gl: 2, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 3 }, // Haití vs Escocia
      { match_id: 137, gl: 0, gv: 2 }, // Escocia vs Marruecos
      { match_id: 138, gl: 5, gv: 0 }, // Brasil vs Haití
      { match_id: 139, gl: 2, gv: 4 }, // Escocia vs Brasil
      { match_id: 140, gl: 3, gv: 0 }, // Marruecos vs Haití
      { match_id: 142, gl: 1, gv: 3 }, // Australia vs Turquía
      { match_id: 143, gl: 1, gv: 2 }, // Turquía vs Paraguay
      { match_id: 144, gl: 3, gv: 0 }, // Estados Unidos vs Australia
      { match_id: 145, gl: 0, gv: 2 }, // Turquía vs Estados Unidos
      { match_id: 146, gl: 3, gv: 1 }, // Paraguay vs Australia
      { match_id: 147, gl: 5, gv: 0 }, // Alemania vs Curazao
      { match_id: 148, gl: 1, gv: 3 }, // Costa de Marfil vs Ecuador
      { match_id: 149, gl: 2, gv: 1 }, // Alemania vs Costa de Marfil
      { match_id: 150, gl: 3, gv: 1 }, // Ecuador vs Curazao
      { match_id: 151, gl: 2, gv: 1 }, // Ecuador vs Alemania
      { match_id: 152, gl: 0, gv: 3 }, // Curazao vs Costa de Marfil
      { match_id: 153, gl: 1, gv: 1 }, // Países Bajos vs Japón
      { match_id: 154, gl: 2, gv: 0 }, // Suecia vs Túnez
      { match_id: 155, gl: 2, gv: 0 }, // Países Bajos vs Suecia
      { match_id: 156, gl: 0, gv: 2 }, // Túnez vs Japón
      { match_id: 157, gl: 2, gv: 0 }, // Japón vs Suecia
      { match_id: 158, gl: 0, gv: 2 }, // Túnez vs Países Bajos
      { match_id: 159, gl: 1, gv: 1 }, // Irán vs Nueva Zelanda
      { match_id: 160, gl: 3, gv: 1 }, // Bélgica vs Egipto
      { match_id: 161, gl: 3, gv: 1 }, // Bélgica vs Irán
      { match_id: 162, gl: 1, gv: 2 }, // Nueva Zelanda vs Egipto
      { match_id: 163, gl: 2, gv: 0 }, // Egipto vs Irán
      { match_id: 164, gl: 1, gv: 3 }, // Nueva Zelanda vs Bélgica
      { match_id: 165, gl: 5, gv: 0 }, // España vs Cabo Verde
      { match_id: 166, gl: 0, gv: 3 }, // Arabia Saudita vs Uruguay
      { match_id: 167, gl: 4, gv: 0 }, // España vs Arabia Saudita
      { match_id: 168, gl: 3, gv: 0 }, // Uruguay vs Cabo Verde
      { match_id: 169, gl: 1, gv: 1 }, // Cabo Verde vs Arabia Saudita
      { match_id: 170, gl: 1, gv: 3 }, // Uruguay vs España
      { match_id: 171, gl: 2, gv: 2 }, // Francia vs Senegal
      { match_id: 172, gl: 0, gv: 3 }, // Irak vs Noruega
      { match_id: 173, gl: 4, gv: 0 }, // Francia vs Irak
      { match_id: 174, gl: 3, gv: 2 }, // Noruega vs Senegal
      { match_id: 175, gl: 2, gv: 1 }, // Noruega vs Francia
      { match_id: 176, gl: 2, gv: 1 }, // Senegal vs Irak
      { match_id: 177, gl: 3, gv: 0 }, // Argentina vs Argelia
      { match_id: 178, gl: 1, gv: 1 }, // Austria vs Jordania
      { match_id: 179, gl: 3, gv: 1 }, // Argentina vs Austria
      { match_id: 180, gl: 1, gv: 1 }, // Jordania vs Argelia
      { match_id: 181, gl: 1, gv: 2 }, // Argelia vs Austria
      { match_id: 182, gl: 1, gv: 4 }, // Jordania vs Argentina
      { match_id: 183, gl: 4, gv: 0 }, // Portugal vs Congo
      { match_id: 184, gl: 0, gv: 3 }, // Uzbekistán vs Colombia
      { match_id: 185, gl: 3, gv: 0 }, // Portugal vs Uzbekistán
      { match_id: 186, gl: 3, gv: 0 }, // Colombia vs Congo
      { match_id: 187, gl: 2, gv: 1 }, // Colombia vs Portugal
      { match_id: 188, gl: 1, gv: 2 }, // Congo vs Uzbekistán
      { match_id: 189, gl: 1, gv: 1 }, // Inglaterra vs Croacia
      { match_id: 190, gl: 3, gv: 1 }, // Ghana vs Panamá
      { match_id: 191, gl: 2, gv: 1 }, // Inglaterra vs Ghana
      { match_id: 192, gl: 1, gv: 3 }, // Panamá vs Croacia
      { match_id: 193, gl: 0, gv: 4 }, // Panamá vs Inglaterra
      { match_id: 194, gl: 1, gv: 1 }, // Croacia vs Ghana
    ]
  },
  {
    nombre: "Mario López",
    email: "mario.lopez@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 125, gl: 2, gv: 0 }, // Chequia vs Sudáfrica
      { match_id: 126, gl: 2, gv: 1 }, // México vs Corea del Sur
      { match_id: 127, gl: 1, gv: 2 }, // Chequia vs México
      { match_id: 128, gl: 0, gv: 1 }, // Sudáfrica vs Corea del Sur
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 2 }, // Qatar vs Suiza
      { match_id: 131, gl: 2, gv: 1 }, // Suiza vs Bosnia y Herzegovina
      { match_id: 132, gl: 2, gv: 0 }, // Canadá vs Qatar
      { match_id: 133, gl: 2, gv: 1 }, // Suiza vs Canadá
      { match_id: 134, gl: 2, gv: 0 }, // Bosnia y Herzegovina vs Qatar
      { match_id: 135, gl: 1, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 0, gv: 2 }, // Haití vs Escocia
      { match_id: 137, gl: 1, gv: 1 }, // Escocia vs Marruecos
      { match_id: 138, gl: 3, gv: 0 }, // Brasil vs Haití
      { match_id: 139, gl: 0, gv: 3 }, // Escocia vs Brasil
      { match_id: 140, gl: 2, gv: 0 }, // Marruecos vs Haití
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 1 }, // Australia vs Turquía
      { match_id: 143, gl: 1, gv: 1 }, // Turquía vs Paraguay
      { match_id: 144, gl: 2, gv: 0 }, // Estados Unidos vs Australia
      { match_id: 145, gl: 1, gv: 2 }, // Turquía vs Estados Unidos
      { match_id: 146, gl: 1, gv: 1 }, // Paraguay vs Australia
      { match_id: 147, gl: 3, gv: 0 }, // Alemania vs Curazao
      { match_id: 148, gl: 1, gv: 1 }, // Costa de Marfil vs Ecuador
      { match_id: 149, gl: 2, gv: 1 }, // Alemania vs Costa de Marfil
      { match_id: 150, gl: 3, gv: 0 }, // Ecuador vs Curazao
      { match_id: 151, gl: 1, gv: 2 }, // Ecuador vs Alemania
      { match_id: 152, gl: 0, gv: 3 }, // Curazao vs Costa de Marfil
      { match_id: 153, gl: 2, gv: 1 }, // Países Bajos vs Japón
      { match_id: 154, gl: 1, gv: 0 }, // Suecia vs Túnez
      { match_id: 155, gl: 2, gv: 1 }, // Países Bajos vs Suecia
      { match_id: 156, gl: 0, gv: 1 }, // Túnez vs Japón
      { match_id: 157, gl: 1, gv: 1 }, // Japón vs Suecia
      { match_id: 158, gl: 0, gv: 3 }, // Túnez vs Países Bajos
      { match_id: 159, gl: 2, gv: 0 }, // Irán vs Nueva Zelanda
      { match_id: 160, gl: 2, gv: 1 }, // Bélgica vs Egipto
      { match_id: 161, gl: 2, gv: 0 }, // Bélgica vs Irán
      { match_id: 162, gl: 0, gv: 2 }, // Nueva Zelanda vs Egipto
      { match_id: 163, gl: 2, gv: 1 }, // Egipto vs Irán
      { match_id: 164, gl: 0, gv: 3 }, // Nueva Zelanda vs Bélgica
      { match_id: 165, gl: 3, gv: 0 }, // España vs Cabo Verde
      { match_id: 166, gl: 0, gv: 2 }, // Arabia Saudita vs Uruguay
      { match_id: 167, gl: 2, gv: 0 }, // España vs Arabia Saudita
      { match_id: 168, gl: 2, gv: 0 }, // Uruguay vs Cabo Verde
      { match_id: 169, gl: 1, gv: 1 }, // Cabo Verde vs Arabia Saudita
      { match_id: 170, gl: 1, gv: 1 }, // Uruguay vs España
      { match_id: 171, gl: 1, gv: 0 }, // Francia vs Senegal
      { match_id: 172, gl: 0, gv: 2 }, // Irak vs Noruega
      { match_id: 173, gl: 3, gv: 0 }, // Francia vs Irak
      { match_id: 174, gl: 1, gv: 1 }, // Noruega vs Senegal
      { match_id: 175, gl: 1, gv: 2 }, // Noruega vs Francia
      { match_id: 176, gl: 2, gv: 0 }, // Senegal vs Irak
      { match_id: 177, gl: 1, gv: 0 }, // Argentina vs Argelia
      { match_id: 178, gl: 2, gv: 0 }, // Austria vs Jordania
      { match_id: 179, gl: 2, gv: 1 }, // Argentina vs Austria
      { match_id: 180, gl: 1, gv: 1 }, // Jordania vs Argelia
      { match_id: 181, gl: 1, gv: 1 }, // Argelia vs Austria
      { match_id: 182, gl: 0, gv: 3 }, // Jordania vs Argentina
      { match_id: 183, gl: 2, gv: 0 }, // Portugal vs Congo
      { match_id: 184, gl: 0, gv: 2 }, // Uzbekistán vs Colombia
      { match_id: 185, gl: 3, gv: 0 }, // Portugal vs Uzbekistán
      { match_id: 186, gl: 2, gv: 0 }, // Colombia vs Congo
      { match_id: 187, gl: 1, gv: 1 }, // Colombia vs Portugal
      { match_id: 188, gl: 2, gv: 0 }, // Congo vs Uzbekistán
      { match_id: 189, gl: 1, gv: 1 }, // Inglaterra vs Croacia
      { match_id: 190, gl: 2, gv: 0 }, // Ghana vs Panamá
      { match_id: 191, gl: 2, gv: 0 }, // Inglaterra vs Ghana
      { match_id: 192, gl: 0, gv: 2 }, // Panamá vs Croacia
      { match_id: 193, gl: 0, gv: 3 }, // Panamá vs Inglaterra
      { match_id: 194, gl: 1, gv: 0 }, // Croacia vs Ghana
    ]
  },
  {
    nombre: "Michelle García",
    email: "michelle.garcia@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 1, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
    ]
  },
  {
    nombre: "Mike Cárcamo",
    email: "mike.carcamo@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 2, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 1, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 2 }, // Qatar vs Suiza
      { match_id: 135, gl: 1, gv: 0 }, // Brasil vs Marruecos
      { match_id: 136, gl: 1, gv: 2 }, // Haití vs Escocia
      { match_id: 141, gl: 1, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 3 }, // Australia vs Turquía
      { match_id: 147, gl: 4, gv: 0 }, // Alemania vs Curazao
    ]
  },
  {
    nombre: "Nery Peinado",
    email: "nery.peinado@quiniela.com",
    preds: [
    ]
  },
  {
    nombre: "Paolo Sebastián",
    email: "paolo.sebastian@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 1 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 1, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 1 }, // Qatar vs Suiza
      { match_id: 135, gl: 3, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 1, gv: 2 }, // Haití vs Escocia
      { match_id: 141, gl: 1, gv: 2 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 0, gv: 1 }, // Australia vs Turquía
    ]
  },
  {
    nombre: "ROMY FUENTES",
    email: "romy.fuentes@quiniela.com",
    preds: [
      { match_id: 123, gl: 2, gv: 0 }, // México vs Sudáfrica
      { match_id: 124, gl: 1, gv: 1 }, // Corea del Sur vs Chequia
      { match_id: 129, gl: 2, gv: 0 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 141, gl: 2, gv: 2 }, // Estados Unidos vs Paraguay
    ]
  },
  {
    nombre: "SEBASTIAN CANCINOS",
    email: "sebastian.cancinos@quiniela.com",
    preds: [
    ]
  },
  {
    nombre: "eber garza",
    email: "eber.garza@quiniela.com",
    preds: [
      { match_id: 125, gl: 1, gv: 1 }, // Chequia vs Sudáfrica
      { match_id: 126, gl: 2, gv: 1 }, // México vs Corea del Sur
      { match_id: 127, gl: 0, gv: 2 }, // Chequia vs México
      { match_id: 128, gl: 1, gv: 2 }, // Sudáfrica vs Corea del Sur
      { match_id: 129, gl: 2, gv: 1 }, // Canadá vs Bosnia y Herzegovina
      { match_id: 130, gl: 0, gv: 2 }, // Qatar vs Suiza
      { match_id: 131, gl: 2, gv: 0 }, // Suiza vs Bosnia y Herzegovina
      { match_id: 132, gl: 1, gv: 1 }, // Canadá vs Qatar
      { match_id: 133, gl: 1, gv: 1 }, // Suiza vs Canadá
      { match_id: 134, gl: 1, gv: 0 }, // Bosnia y Herzegovina vs Qatar
      { match_id: 135, gl: 3, gv: 1 }, // Brasil vs Marruecos
      { match_id: 136, gl: 1, gv: 2 }, // Haití vs Escocia
      { match_id: 137, gl: 1, gv: 3 }, // Escocia vs Marruecos
      { match_id: 138, gl: 4, gv: 0 }, // Brasil vs Haití
      { match_id: 139, gl: 0, gv: 2 }, // Escocia vs Brasil
      { match_id: 140, gl: 2, gv: 0 }, // Marruecos vs Haití
      { match_id: 141, gl: 2, gv: 1 }, // Estados Unidos vs Paraguay
      { match_id: 142, gl: 1, gv: 3 }, // Australia vs Turquía
      { match_id: 143, gl: 2, gv: 1 }, // Turquía vs Paraguay
      { match_id: 144, gl: 2, gv: 1 }, // Estados Unidos vs Australia
      { match_id: 145, gl: 1, gv: 1 }, // Turquía vs Estados Unidos
      { match_id: 146, gl: 2, gv: 0 }, // Paraguay vs Australia
      { match_id: 147, gl: 4, gv: 0 }, // Alemania vs Curazao
      { match_id: 148, gl: 1, gv: 2 }, // Costa de Marfil vs Ecuador
      { match_id: 149, gl: 2, gv: 1 }, // Alemania vs Costa de Marfil
      { match_id: 150, gl: 3, gv: 0 }, // Ecuador vs Curazao
      { match_id: 151, gl: 1, gv: 1 }, // Ecuador vs Alemania
      { match_id: 152, gl: 0, gv: 2 }, // Curazao vs Costa de Marfil
      { match_id: 153, gl: 1, gv: 1 }, // Países Bajos vs Japón
      { match_id: 154, gl: 2, gv: 0 }, // Suecia vs Túnez
      { match_id: 155, gl: 2, gv: 2 }, // Países Bajos vs Suecia
      { match_id: 156, gl: 1, gv: 3 }, // Túnez vs Japón
      { match_id: 157, gl: 1, gv: 1 }, // Japón vs Suecia
      { match_id: 158, gl: 0, gv: 2 }, // Túnez vs Países Bajos
      { match_id: 159, gl: 1, gv: 1 }, // Irán vs Nueva Zelanda
      { match_id: 160, gl: 1, gv: 1 }, // Bélgica vs Egipto
      { match_id: 161, gl: 3, gv: 0 }, // Bélgica vs Irán
      { match_id: 162, gl: 0, gv: 2 }, // Nueva Zelanda vs Egipto
      { match_id: 163, gl: 2, gv: 0 }, // Egipto vs Irán
      { match_id: 164, gl: 0, gv: 3 }, // Nueva Zelanda vs Bélgica
      { match_id: 165, gl: 5, gv: 0 }, // España vs Cabo Verde
      { match_id: 166, gl: 1, gv: 3 }, // Arabia Saudita vs Uruguay
      { match_id: 167, gl: 3, gv: 0 }, // España vs Arabia Saudita
      { match_id: 168, gl: 2, gv: 0 }, // Uruguay vs Cabo Verde
      { match_id: 169, gl: 1, gv: 0 }, // Cabo Verde vs Arabia Saudita
      { match_id: 170, gl: 1, gv: 2 }, // Uruguay vs España
      { match_id: 171, gl: 2, gv: 1 }, // Francia vs Senegal
      { match_id: 172, gl: 1, gv: 3 }, // Irak vs Noruega
      { match_id: 173, gl: 4, gv: 0 }, // Francia vs Irak
      { match_id: 174, gl: 1, gv: 1 }, // Noruega vs Senegal
      { match_id: 175, gl: 1, gv: 1 }, // Noruega vs Francia
      { match_id: 176, gl: 2, gv: 0 }, // Senegal vs Irak
      { match_id: 177, gl: 2, gv: 1 }, // Argentina vs Argelia
      { match_id: 178, gl: 2, gv: 0 }, // Austria vs Jordania
      { match_id: 179, gl: 2, gv: 0 }, // Argentina vs Austria
      { match_id: 180, gl: 1, gv: 2 }, // Jordania vs Argelia
      { match_id: 181, gl: 1, gv: 0 }, // Argelia vs Austria
      { match_id: 182, gl: 0, gv: 3 }, // Jordania vs Argentina
      { match_id: 183, gl: 3, gv: 1 }, // Portugal vs Congo
      { match_id: 184, gl: 1, gv: 3 }, // Uzbekistán vs Colombia
      { match_id: 185, gl: 3, gv: 0 }, // Portugal vs Uzbekistán
      { match_id: 186, gl: 2, gv: 1 }, // Colombia vs Congo
      { match_id: 187, gl: 1, gv: 1 }, // Colombia vs Portugal
      { match_id: 188, gl: 1, gv: 0 }, // Congo vs Uzbekistán
      { match_id: 189, gl: 3, gv: 1 }, // Inglaterra vs Croacia
      { match_id: 190, gl: 2, gv: 0 }, // Ghana vs Panamá
      { match_id: 191, gl: 1, gv: 1 }, // Inglaterra vs Ghana
      { match_id: 192, gl: 0, gv: 3 }, // Panamá vs Croacia
      { match_id: 193, gl: 1, gv: 3 }, // Panamá vs Inglaterra
      { match_id: 194, gl: 1, gv: 1 }, // Croacia vs Ghana
    ]
  },
];

let stats = { usuarios: 0, pagos: 0, preds: 0 };
db.transaction(() => {
  for (const u of USUARIOS) {
    insertUser.run(u.nombre, u.email, PASSWORD_HASH);
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(u.email);
    if (!user) { console.warn('No se pudo crear:', u.email); continue; }
    stats.usuarios++;
    insertPayment.run(user.id, EVENT_ID);
    stats.pagos++;
    for (const p of u.preds) {
      insertPred.run(user.id, p.match_id, p.gl, p.gv);
      stats.preds++;
    }
  }
})();

console.log('Usuarios insertados:', stats.usuarios);
console.log('Pagos aprobados:', stats.pagos);
console.log('Pronósticos insertados:', stats.preds);
console.log('Contraseña temporal: Quiniela2026!');