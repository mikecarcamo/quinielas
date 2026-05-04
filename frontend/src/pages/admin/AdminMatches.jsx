import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Alert, Tooltip, CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import api from '../../api/axios';
import { FlagImg } from '../../lib/flags.jsx';
import { useEvent } from '../../context/EventContext';
import EventSelector from '../../components/EventSelector';
import { formatDate } from '../../lib/dates';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, match: null });
  const [form, setForm] = useState({ goles_local: '', goles_visitante: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { selectedEventId, selectedEvent } = useEvent();

  const load = () => {
    if (!selectedEventId) return;
    api.get(`/matches?event_id=${selectedEventId}`)
      .then((r) => setMatches(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedEventId]);

  const openDialog = (match) => {
    setForm({ goles_local: match.goles_local_real ?? '', goles_visitante: match.goles_visitante_real ?? '' });
    setDialog({ open: true, match });
    setError('');
  };

  const handleSave = async () => {
    if (form.goles_local === '' || form.goles_visitante === '') return setError('Ingresa ambos marcadores');
    setSaving(true);
    try {
      await api.patch(`/matches/${dialog.match.id}/result`, {
        goles_local_real: Number(form.goles_local),
        goles_visitante_real: Number(form.goles_visitante),
      });
      setSuccess('Resultado guardado y puntos recalculados.');
      setDialog({ open: false, match: null });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const grupos = [...new Set(matches.map((m) => m.grupo))].filter(Boolean).sort();

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">{selectedEvent?.nombre ?? 'Gestión de Partidos'}</Typography>
        <EventSelector onlyApproved={false} />
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {grupos.map((g) => (
        <Box key={g} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Grupo {g}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>Partido</TableCell>
                  <TableCell align="center">Fecha</TableCell>
                  <TableCell align="center">Resultado</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="center">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matches.filter((m) => m.grupo === g).map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FlagImg country={m.local} size={18} />
                        <Typography variant="body2" fontWeight={600}>{m.local}</Typography>
                        <Typography variant="body2" color="text.secondary">vs</Typography>
                        <FlagImg country={m.visitante} size={18} />
                        <Typography variant="body2" fontWeight={600}>{m.visitante}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="caption">{formatDate(m.fecha, { day: '2-digit', month: 'short' })}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      {m.status === 'finalizado' ? (
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography fontWeight={700}>{m.goles_local_real} – {m.goles_visitante_real}</Typography>
                          {!!m.resultado_editado && (
                            <Tooltip title="Resultado corregido">
                              <Typography component="span" color="warning.main" fontWeight={700} fontSize={14}>*</Typography>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={m.status} size="small" color={m.status === 'finalizado' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Cargar resultado">
                        <IconButton size="small" onClick={() => openDialog(m)} color="primary">
                          {m.status === 'finalizado' ? <CheckCircleIcon /> : <EditIcon />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, match: null })} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialog.match?.status === 'finalizado' ? 'Corregir resultado' : 'Cargar resultado'} — {dialog.match?.local} vs {dialog.match?.visitante}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {dialog.match?.status === 'finalizado' && (
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
              Este partido ya tiene resultado. Al guardar se recalcularán los puntos de todos los participantes.
            </Alert>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <TextField label={dialog.match?.local} type="number" inputProps={{ min: 0 }}
              value={form.goles_local} onChange={(e) => setForm({ ...form, goles_local: e.target.value })} fullWidth />
            <Typography variant="h5">–</Typography>
            <TextField label={dialog.match?.visitante} type="number" inputProps={{ min: 0 }}
              value={form.goles_visitante} onChange={(e) => setForm({ ...form, goles_visitante: e.target.value })} fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, match: null })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar resultado'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
