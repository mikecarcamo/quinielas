import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert, CircularProgress, Tooltip, Select,
  MenuItem, FormControl, InputLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import api from '../../api/axios';
import { formatDateTime } from '../../lib/dates';

const statusConfig = {
  pendiente: { color: 'warning', label: 'Pendiente' },
  aprobado:  { color: 'success', label: 'Aprobado' },
  rechazado: { color: 'error',   label: 'Rechazado' },
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [dialog, setDialog] = useState({ open: false, payment: null, action: '' });
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [imgDialog, setImgDialog] = useState({ open: false, url: '' });

  const load = () => {
    const q = filter ? `?status=${filter}` : '';
    api.get(`/payments${q}`).then((r) => setPayments(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const handleAction = async () => {
    setSaving(true);
    try {
      await api.patch(`/payments/${dialog.payment.id}/status`, { status: dialog.action, notas });
      setFeedback(`Pago ${dialog.action}`);
      setDialog({ open: false, payment: null, action: '' });
      setNotas('');
      load();
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  const isImage = (url) => url && /\.(jpg|jpeg|png)$/i.test(url);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">Gestión de Pagos</Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filtrar estado</InputLabel>
          <Select value={filter} label="Filtrar estado" onChange={(e) => setFilter(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pendiente">Pendientes</MenuItem>
            <MenuItem value="aprobado">Aprobados</MenuItem>
            <MenuItem value="rechazado">Rechazados</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {feedback && <Alert severity="info" sx={{ mb: 2 }}>{feedback}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>Participante</TableCell>
              <TableCell>Evento</TableCell>
              <TableCell align="center">Comprobante</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Fecha</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>{p.nombre_completo}</Typography>
                  <Typography variant="caption" color="text.secondary">{p.email}</Typography>
                </TableCell>
                <TableCell><Typography variant="body2">{p.event_nombre}</Typography></TableCell>
                <TableCell align="center">
                  {p.comprobante_url ? (
                    <Tooltip title="Ver comprobante">
                      <Button size="small" startIcon={<VisibilityIcon />}
                        onClick={() => isImage(p.comprobante_url)
                          ? setImgDialog({ open: true, url: p.comprobante_url })
                          : window.open(p.comprobante_url, '_blank')}>
                        Ver
                      </Button>
                    </Tooltip>
                  ) : <Typography color="text.secondary" variant="caption">Sin archivo</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Chip label={statusConfig[p.status].label} color={statusConfig[p.status].color} size="small" />
                  {p.notas && <Typography variant="caption" display="block" color="text.secondary">{p.notas}</Typography>}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption">{formatDateTime(p.created_at, { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                    {p.status !== 'aprobado' && (
                      <Tooltip title="Aprobar">
                        <Button size="small" color="success" variant="outlined"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => { setDialog({ open: true, payment: p, action: 'aprobado' }); setNotas(''); }}>
                          Aprobar
                        </Button>
                      </Tooltip>
                    )}
                    {p.status !== 'rechazado' && (
                      <Tooltip title="Rechazar">
                        <Button size="small" color="error" variant="outlined"
                          startIcon={<CancelIcon />}
                          onClick={() => { setDialog({ open: true, payment: p, action: 'rechazado' }); setNotas(''); }}>
                          Rechazar
                        </Button>
                      </Tooltip>
                    )}
                    <Tooltip title="Descargar recibo">
                      <Button size="small" variant="text" href={`/api/payments/${p.id}/receipt`} target="_blank">
                        <DownloadIcon fontSize="small" />
                      </Button>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>No hay pagos</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, payment: null, action: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialog.action === 'aprobado' ? 'Aprobar pago' : 'Rechazar pago'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Participante: <strong>{dialog.payment?.nombre_completo}</strong>
          </Typography>
          <TextField label="Notas (opcional)" multiline rows={3} fullWidth value={notas}
            onChange={(e) => setNotas(e.target.value)} placeholder="Mensaje para el usuario..." />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, payment: null, action: '' })}>Cancelar</Button>
          <Button variant="contained" color={dialog.action === 'aprobado' ? 'success' : 'error'}
            onClick={handleAction} disabled={saving}>
            {saving ? 'Guardando...' : `Confirmar ${dialog.action}`}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={imgDialog.open} onClose={() => setImgDialog({ open: false, url: '' })} maxWidth="md">
        <DialogTitle>Comprobante</DialogTitle>
        <DialogContent>
          <Box component="img" src={imgDialog.url} alt="comprobante"
            sx={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', mx: 'auto' }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImgDialog({ open: false, url: '' })}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
