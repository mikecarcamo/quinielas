import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, Tooltip, Chip, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Switch from '@mui/material/Switch';
import api from '../../api/axios';
import { formatDateTime } from '../../lib/dates';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, event: null });
  const [form, setForm] = useState({ nombre: '', precio_entrada: '', is_active: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    api.get('/events?all=1').then((r) => setEvents(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setForm({ nombre: '', precio_entrada: '100', is_active: true });
    setError('');
    setDialog({ open: true, event: null });
  };

  const openEdit = (ev) => {
    setForm({ nombre: ev.nombre, precio_entrada: String(ev.precio_entrada), is_active: !!ev.is_active });
    setError('');
    setDialog({ open: true, event: ev });
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return setError('El nombre es requerido');
    if (!form.precio_entrada || isNaN(form.precio_entrada) || Number(form.precio_entrada) <= 0)
      return setError('Precio de entrada inválido');
    setSaving(true);
    try {
      if (dialog.event) {
        await api.patch(`/events/${dialog.event.id}`, { nombre: form.nombre, precio_entrada: Number(form.precio_entrada), is_active: form.is_active ? 1 : 0 });
        setSuccess('Evento actualizado');
      } else {
        await api.post('/events', { nombre: form.nombre, precio_entrada: Number(form.precio_entrada) });
        setSuccess('Evento creado');
      }
      setDialog({ open: false, event: null });
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ev) => {
    if (!window.confirm(`¿Eliminar "${ev.nombre}"? Solo es posible si no tiene partidos.`)) return;
    try {
      await api.delete(`/events/${ev.id}`);
      setSuccess('Evento eliminado');
      load();
    } catch (e) {
      setSuccess('');
      alert(e.response?.data?.error || 'Error al eliminar');
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Gestión de Eventos / Quinielas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNew}>Nuevo Evento</Button>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="center">Precio entrada</TableCell>
              <TableCell align="center">Activo</TableCell>
              <TableCell align="center">Creado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((ev) => (
              <TableRow key={ev.id} hover>
                <TableCell><Chip label={`#${ev.id}`} size="small" /></TableCell>
                <TableCell><Typography variant="body2" fontWeight={600}>{ev.nombre}</Typography></TableCell>
                <TableCell align="center">
                  <Typography variant="body2" fontWeight={700} color="success.main">Q{ev.precio_entrada}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Switch checked={!!ev.is_active} color="success" size="small"
                    onChange={async () => {
                      await api.patch(`/events/${ev.id}`, { is_active: ev.is_active ? 0 : 1 });
                      load();
                    }} />
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(ev.created_at, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Editar">
                    <IconButton size="small" color="primary" onClick={() => openEdit(ev)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton size="small" color="error" onClick={() => handleDelete(ev)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {events.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>No hay eventos creados</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, event: null })} maxWidth="xs" fullWidth>
        <DialogTitle>{dialog.event ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Nombre del evento" fullWidth sx={{ mt: 1, mb: 2 }}
            value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Mundial 2026, Euro 2028..."
          />
          <TextField
            label="Precio de entrada (Q)" type="number" fullWidth inputProps={{ min: 1 }}
            value={form.precio_entrada} onChange={(e) => setForm({ ...form, precio_entrada: e.target.value })}
          />
          {dialog.event && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Switch checked={form.is_active} color="success" onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
              <Typography variant="body2">{form.is_active ? 'Evento activo (visible para usuarios)' : 'Evento inactivo (oculto)'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, event: null })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
