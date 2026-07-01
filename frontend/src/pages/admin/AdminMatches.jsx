import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Alert, Tooltip, CircularProgress,
  Accordion, AccordionSummary, AccordionDetails, FormControlLabel, Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import UndoIcon from '@mui/icons-material/Undo';
import api from '../../api/axios';
import { FlagImg } from '../../lib/flags.jsx';
import { useEvent } from '../../context/EventContext';
import EventSelector from '../../components/EventSelector';
import { formatDate } from '../../lib/dates';

export default function AdminMatches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, match: null });
  const [form, setForm] = useState({ goles_local: '', goles_visitante: '', ganador_penales: '', finalizar: true, soloEnCurso: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetting, setResetting] = useState(false);
  const { selectedEventId, selectedEvent } = useEvent();

  // Diálogo de predicciones
  const [predDialog, setPredDialog] = useState({ open: false, match: null, predictions: [], loading: false });

  const load = () => {
    if (!selectedEventId) return;
    api.get(`/matches?event_id=${selectedEventId}`)
      .then((r) => setMatches(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedEventId]);

  const openDialog = (match) => {
    setForm({
      goles_local: match.goles_local_real ?? '',
      goles_visitante: match.goles_visitante_real ?? '',
      ganador_penales: match.ganador_penales ?? '',
      finalizar: match.status !== 'en_curso',
      soloEnCurso: false,
    });
    setDialog({ open: true, match });
    setError('');
  };

  const handleSave = async () => {
    if (form.goles_local === '' || form.goles_visitante === '') return setError('Ingresa ambos marcadores');
    setSaving(true);
    try {
      const esEnCurso = dialog.match.status === 'en_curso';
      const esPendiente = dialog.match.status === 'pendiente';
      const debeFinalizar = esEnCurso ? form.finalizar : !form.soloEnCurso;
      const payload = {
        goles_local_real: Number(form.goles_local),
        goles_visitante_real: Number(form.goles_visitante),
        ganador_penales: form.ganador_penales || null,
        ...(esEnCurso && { finalizar: form.finalizar }),
        ...(esPendiente && { finalizar: !form.soloEnCurso }),
      };
      await api.patch(`/matches/${dialog.match.id}/result`, payload);
      setSuccess(debeFinalizar ? 'Resultado guardado y puntos recalculados.' : 'Marcador parcial actualizado.');
      setDialog({ open: false, match: null });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error');
    } finally {
      setSaving(false);
    }
  };

  const sortedMatches = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora||'').localeCompare(b.hora||'') || a.id - b.id);
  const days = [...new Set(sortedMatches.map(m => m.fecha))].sort();

  // Funciones para diálogo de predicciones
  const openPredDialog = async (match) => {
    setPredDialog({ open: true, match, predictions: [], loading: true });
    try {
      const res = await api.get(`/predictions/match/${match.id}`);
      setPredDialog(prev => ({ ...prev, predictions: res.data.predictions, loading: false }));
    } catch (err) {
      setPredDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const closePredDialog = () => {
    setPredDialog({ open: false, match: null, predictions: [], loading: false });
  };

  const handleReset = async (match) => {
    const ok = window.confirm(`¿Resetear el resultado de ${match.local} vs ${match.visitante}?\nSe pondrá como pendiente y los usuarios podrán ingresar pronósticos nuevamente.`);
    if (!ok) return;
    setResetting(true);
    try {
      await api.post(`/matches/${match.id}/reset-result`);
      setSuccess('Resultado reseteado correctamente.');
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al resetear');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  const hoy = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Guatemala' })).toISOString().split('T')[0];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">{selectedEvent?.nombre ?? 'Gestión de Partidos'}</Typography>
        <EventSelector onlyApproved={false} />
      </Box>
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

      {days.map((fecha, idx) => {
        const dayMatches = sortedMatches.filter(m => m.fecha === fecha);
        const finalizados = dayMatches.filter(m => m.status === 'finalizado').length;
        const enCurso = dayMatches.filter(m => m.status === 'en_curso').length;
        const fechaLabel = formatDate(fecha, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        const esHoy = fecha === hoy;
        return (
          <Accordion key={fecha} defaultExpanded={esHoy} disableGutters
            sx={{ mb: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: enCurso > 0 ? 'warning.main' : finalizados === dayMatches.length ? 'success.dark' : 'divider', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{fechaLabel}</Typography>
                <Chip label={`${finalizados}/${dayMatches.length}`} size="small"
                  color={finalizados === dayMatches.length ? 'success' : finalizados > 0 ? 'warning' : 'default'}
                  sx={{ flexShrink: 0, ml: 'auto' }} />
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, px: { xs: 1, sm: 2 }, pb: 2 }}>
              {dayMatches.map((m) => (
                <Box key={m.id} sx={{
                  py: 1, px: 1.5, borderRadius: 2, mb: 0.5,
                  bgcolor: m.status === 'finalizado' ? 'rgba(255,255,255,0.02)' : m.status === 'en_curso' ? 'rgba(255,152,0,0.06)' : 'background.default',
                  border: '1px solid', borderColor: m.status === 'finalizado' ? 'success.dark' : m.status === 'en_curso' ? 'warning.main' : 'divider',
                }}>
                  {/* Fila superior: hora + grupo + estado */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                      {m.hora || '—'} · Grupo {m.grupo}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Chip
                        label={m.status === 'finalizado' ? 'Finalizado' : m.status === 'en_curso' ? '🔴 En curso' : m.status}
                        size="small"
                        color={m.status === 'finalizado' ? 'success' : m.status === 'en_curso' ? 'warning' : 'default'}
                        sx={{ fontSize: 10, height: 18 }}
                      />
                    </Box>
                  </Box>
                  {/* Fila principal: local — resultado — visitante — acción */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 11, sm: 14 }, textAlign: 'right', lineHeight: 1.2 }}>{m.local}</Typography>
                      <FlagImg country={m.local} size={18} />
                    </Box>
                    <Box sx={{ flexShrink: 0, px: { xs: 0.5, sm: 1 }, textAlign: 'center', minWidth: 48 }}>
                      {(m.status === 'finalizado' || m.status === 'en_curso') ? (
                        <Typography fontWeight={700} sx={{ fontSize: { xs: 13, sm: 15 }, color: m.status === 'en_curso' ? 'warning.main' : 'inherit' }}>
                          {m.goles_local_real} – {m.goles_visitante_real}
                          {m.ganador_penales && (
                            <Typography component="span" fontWeight={700} sx={{ fontSize: 11, color: 'info.main', ml: 0.5 }}>
                              (P: {m.ganador_penales === 'local' ? m.local : m.visitante})
                            </Typography>
                          )}
                          {!!m.resultado_editado && <Typography component="span" color="warning.main" fontWeight={700}> *</Typography>}
                        </Typography>
                      ) : (
                        <Typography color="text.secondary" fontWeight={600} sx={{ fontSize: 13 }}>vs</Typography>
                      )}
                    </Box>
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                      <FlagImg country={m.visitante} size={18} />
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: { xs: 11, sm: 14 }, lineHeight: 1.2 }}>{m.visitante}</Typography>
                    </Box>
                    <Tooltip title="Ver pronósticos">
                      <IconButton size="small" onClick={() => openPredDialog(m)} color="info" sx={{ flexShrink: 0 }}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {(m.goles_local_real !== null && m.goles_local_real !== undefined) && (
                      <Tooltip title="Deshacer resultado">
                        <IconButton size="small" onClick={() => handleReset(m)} color="error" sx={{ flexShrink: 0 }} disabled={resetting}>
                          <UndoIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title={m.status === 'finalizado' ? 'Corregir resultado' : 'Cargar resultado'}>
                      <IconButton size="small" onClick={() => openDialog(m)} color="primary" sx={{ flexShrink: 0 }}>
                        {m.status === 'finalizado' ? <CheckCircleIcon /> : <EditIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </AccordionDetails>
          </Accordion>
        );
      })}

      <Dialog open={dialog.open} onClose={() => setDialog({ open: false, match: null })} maxWidth="xs" fullWidth>
        <DialogTitle>
          {dialog.match?.status === 'finalizado' ? 'Corregir resultado' : dialog.match?.status === 'en_curso' ? '🔴 Partido en curso' : 'Cargar resultado'} — {dialog.match?.local} vs {dialog.match?.visitante}
        </DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {dialog.match?.status === 'finalizado' && (
            <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb: 2 }}>
              Este partido ya tiene resultado. Al guardar se recalcularán los puntos de todos los participantes.
            </Alert>
          )}
          {dialog.match?.status === 'en_curso' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              El partido está en curso. Puedes corregir el marcador parcial o marcarlo como finalizado.
            </Alert>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <TextField label={dialog.match?.local} type="number" inputProps={{ min: 0 }}
              value={form.goles_local} onChange={(e) => setForm({ ...form, goles_local: e.target.value })} fullWidth />
            <Typography variant="h5">–</Typography>
            <TextField label={dialog.match?.visitante} type="number" inputProps={{ min: 0 }}
              value={form.goles_visitante} onChange={(e) => setForm({ ...form, goles_visitante: e.target.value })} fullWidth />
          </Box>
          {dialog.match?.fase && dialog.match?.fase !== 'grupos' &&
            form.goles_local !== '' && form.goles_visitante !== '' &&
            Number(form.goles_local) === Number(form.goles_visitante) && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 1 }}>
              <Button
                size="small"
                onClick={() => setForm({ ...form, ganador_penales: 'local' })}
                variant={form.ganador_penales === 'local' ? 'contained' : 'outlined'}
                color="warning"
                sx={{ fontSize: 11, py: 0.2, px: 1, minWidth: 0, fontWeight: form.ganador_penales === 'local' ? 700 : 400 }}
              >
                {form.ganador_penales === 'local' ? '* ' : ''}Gana {dialog.match?.local} (penales)
              </Button>
              <Button
                size="small"
                onClick={() => setForm({ ...form, ganador_penales: 'visitante' })}
                variant={form.ganador_penales === 'visitante' ? 'contained' : 'outlined'}
                color="warning"
                sx={{ fontSize: 11, py: 0.2, px: 1, minWidth: 0, fontWeight: form.ganador_penales === 'visitante' ? 700 : 400 }}
              >
                {form.ganador_penales === 'visitante' ? '* ' : ''}Gana {dialog.match?.visitante} (penales)
              </Button>
            </Box>
          )}
          {dialog.match?.status === 'en_curso' && (
            <FormControlLabel
              sx={{ mt: 2 }}
              control={
                <Checkbox
                  checked={form.finalizar}
                  onChange={(e) => setForm({ ...form, finalizar: e.target.checked })}
                  color="success"
                />
              }
              label="Marcar partido como finalizado (recalcula puntos)"
            />
          )}
          {dialog.match?.status === 'pendiente' && (
            <FormControlLabel
              sx={{ mt: 2 }}
              control={
                <Checkbox
                  checked={form.soloEnCurso}
                  onChange={(e) => setForm({ ...form, soloEnCurso: e.target.checked })}
                  color="warning"
                />
              }
              label="Solo marcar como en curso (no finalizar)"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog({ open: false, match: null })}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}
            color={(dialog.match?.status === 'en_curso' && !form.finalizar) || form.soloEnCurso ? 'warning' : 'primary'}>
            {saving ? 'Guardando...' : (dialog.match?.status === 'en_curso' && !form.finalizar) || form.soloEnCurso ? 'Actualizar marcador parcial' : 'Guardar resultado'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de predicciones del partido */}
      <Dialog open={predDialog.open} onClose={closePredDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VisibilityIcon color="info" />
            <Typography variant="h6">
              Pronósticos — {predDialog.match?.local} vs {predDialog.match?.visitante}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {predDialog.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : predDialog.predictions.length === 0 ? (
            <Alert severity="info">Aún no hay pronósticos para este partido.</Alert>
          ) : (
            <>
              <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip label={`${predDialog.predictions.length} pronósticos`} color="primary" variant="outlined" />
                {predDialog.match?.status !== 'pendiente' && (
                  <Chip 
                    label={`Resultado: ${predDialog.match?.goles_local_real} – ${predDialog.match?.goles_visitante_real}${predDialog.match?.ganador_penales ? ' (P: ' + (predDialog.match?.ganador_penales === 'local' ? predDialog.match?.local : predDialog.match?.visitante) + ')' : ''}`} 
                    color={predDialog.match?.status === 'en_curso' ? 'warning' : 'success'} 
                  />
                )}
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'background.default' }}>
                      <TableCell>#</TableCell>
                      <TableCell>Participante</TableCell>
                      <TableCell align="center">Pronóstico</TableCell>
                      <TableCell align="center">Resultado Real</TableCell>
                      <TableCell align="center">Puntos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {predDialog.predictions.map((p, idx) => {
                      const color = p.puntos_obtenidos === 12 ? 'success' : p.puntos_obtenidos >= 7 ? 'warning' : p.puntos_obtenidos > 0 ? 'default' : 'error';
                      return (
                        <TableRow key={p.user_id} hover>
                          <TableCell sx={{ width: 40 }}>{idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>{p.nombre_completo}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" fontWeight={700} color="primary.light">
                              {p.goles_local_pred} – {p.goles_visitante_pred}
                            </Typography>
                            {p.pred_ganador_penales && (
                              <Typography variant="caption" color="info.main">
                                P: {p.pred_ganador_penales === 'local' ? predDialog.match?.local : predDialog.match?.visitante}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            {(p.match_status === 'finalizado' || p.match_status === 'en_curso') ? (
                              <Typography variant="body2" fontWeight={700} sx={{ color: p.match_status === 'en_curso' ? 'warning.main' : 'inherit' }}>
                                {p.goles_local_real} – {p.goles_visitante_real}
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">—</Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={p.puntos_obtenidos > 0 ? `+${p.puntos_obtenidos} pts` : `${p.puntos_obtenidos} pts`} 
                              size="small" 
                              color={color}
                              sx={{ fontWeight: 700 }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePredDialog}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
