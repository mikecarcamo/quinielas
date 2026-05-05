const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const db = require('../db/database');
const { verifyToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/comprobantes');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `comprobante_${req.user.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Solo se permiten imágenes JPG/PNG o PDF'));
  },
});

router.post('/upload', verifyToken, upload.single('comprobante'), (req, res) => {
  const { event_id } = req.body;
  const userId = req.user.id;

  if (!event_id || !req.file) {
    return res.status(400).json({ error: 'event_id y comprobante requeridos' });
  }

  const baseUrl = process.env.BACKEND_URL || '';
  const fileUrl = `${baseUrl}/uploads/comprobantes/${req.file.filename}`;
  const existing = db.prepare('SELECT id, status FROM payments WHERE user_id = ? AND event_id = ?').get(userId, event_id);

  if (existing) {
    if (existing.status === 'aprobado') {
      return res.status(409).json({ error: 'Tu pago ya fue aprobado.' });
    }
    db.prepare('UPDATE payments SET comprobante_url = ?, status = ? WHERE id = ?').run(fileUrl, 'pendiente', existing.id);
    return res.json({ message: 'Comprobante actualizado', fileUrl });
  }

  const result = db.prepare(`
    INSERT INTO payments (user_id, event_id, comprobante_url, status)
    VALUES (?, ?, ?, 'pendiente')
  `).run(userId, event_id, fileUrl);

  res.status(201).json({ id: result.lastInsertRowid, fileUrl, message: 'Comprobante enviado. Pendiente de aprobación.' });
});

router.get('/', verifyToken, requireAdmin, (req, res) => {
  const { status, event_id } = req.query;
  let query = `
    SELECT p.*, u.nombre_completo, u.email, e.nombre as event_nombre
    FROM payments p
    JOIN users u ON p.user_id = u.id
    JOIN events e ON p.event_id = e.id
    WHERE 1=1
  `;
  const params = [];
  if (status)   { query += ' AND p.status = ?';   params.push(status); }
  if (event_id) { query += ' AND p.event_id = ?'; params.push(event_id); }
  query += ' ORDER BY p.created_at DESC';

  const payments = db.prepare(query).all(...params);
  res.json(payments);
});

router.get('/my-events', verifyToken, (req, res) => {
  const payments = db.prepare(`
    SELECT p.*, e.nombre as event_nombre, e.precio_entrada, e.is_active
    FROM payments p
    JOIN events e ON p.event_id = e.id
    WHERE p.user_id = ?
    ORDER BY p.created_at DESC
  `).all(req.user.id);
  res.json(payments);
});

router.get('/my/:event_id', verifyToken, (req, res) => {
  const payment = db.prepare(`
    SELECT p.*, e.nombre as event_nombre
    FROM payments p JOIN events e ON p.event_id = e.id
    WHERE p.user_id = ? AND p.event_id = ?
  `).get(req.user.id, req.params.event_id);
  res.json(payment || null);
});

router.patch('/:id/status', verifyToken, requireAdmin, (req, res) => {
  const { status, notas } = req.body;
  if (!['aprobado', 'rechazado', 'pendiente'].includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  db.prepare('UPDATE payments SET status = ?, notas = ? WHERE id = ?').run(status, notas || null, req.params.id);

  if (status === 'aprobado') {
    const payment = db.prepare('SELECT user_id FROM payments WHERE id = ?').get(req.params.id);
    if (payment) db.prepare('UPDATE users SET is_active = 1 WHERE id = ?').run(payment.user_id);
  }

  res.json({ message: `Pago marcado como ${status}` });
});

router.get('/:id/receipt', verifyToken, (req, res) => {
  const payment = db.prepare(`
    SELECT p.*, u.nombre_completo, u.email, e.nombre as event_nombre, e.precio_entrada
    FROM payments p
    JOIN users u ON p.user_id = u.id
    JOIN events e ON p.event_id = e.id
    WHERE p.id = ?
  `).get(req.params.id);

  if (!payment) return res.status(404).json({ error: 'Pago no encontrado' });
  if (req.user.role !== 'admin' && payment.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sin acceso' });
  }

  const doc = new PDFDocument({ margin: 50, size: 'A5' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=recibo_${payment.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(18).font('Helvetica-Bold').text('QUINIELA MUNDIAL 2026', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).font('Helvetica').text('Comprobante de Pago', { align: 'center' });
  doc.moveDown(1);

  doc.fontSize(10).font('Helvetica-Bold').text('DATOS DEL PARTICIPANTE');
  doc.font('Helvetica').text(`Nombre: ${payment.nombre_completo}`);
  doc.text(`Email: ${payment.email}`);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('DETALLE DEL PAGO');
  doc.font('Helvetica').text(`Evento: ${payment.event_nombre}`);
  doc.text(`Monto: $${payment.precio_entrada}`);
  doc.text(`Estado: ${payment.status.toUpperCase()}`);
  doc.text(`Fecha: ${new Date(payment.created_at).toLocaleString('es-MX')}`);
  doc.moveDown(1);

  doc.fontSize(8).fillColor('gray').text(`Recibo generado el ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
  doc.end();
});

module.exports = router;
