const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.dirname(process.env.DB_PATH || '/app/data/dei.sqlite');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DB_PATH || '/app/data/dei.sqlite';
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;
