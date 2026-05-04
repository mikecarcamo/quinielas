require('dotenv').config();
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

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`Quiniela Backend corriendo en puerto ${PORT}`);
});

module.exports = app;
