import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Alert, Chip,
  CircularProgress, Divider, Grid, Accordion, AccordionSummary, AccordionDetails,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Tooltip,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FlagImg } from '../lib/flags.jsx';
import { useEvent } from '../context/EventContext';
import EventSelector from '../components/EventSelector';
import { formatDate } from '../lib/dates';

function isPredFilled(p) {
  return p && p.goles_local !== '' && p.goles_local !== undefined && p.goles_visitante !== '' && p.goles_visitante !== undefined;
}


function MatchPredictionRow({ match, value, onChange, disabled, onViewPredictions, hasQuiniela }) {
  const hora = match.hora || '—';
  const filled = isPredFilled(value);
  const finalizado = match.status === 'finalizado';
  const enCurso = match.status === 'en_curso';
  const tieneMarcador = match.goles_local_real !== null && match.goles_local_real !== undefined;
  const isLocked = disabled || finalizado || enCurso || tieneMarcador;
  const tieneResultado = finalizado || enCurso || tieneMarcador;

  let statusChip = null;
  if (finalizado) {
    statusChip = <Chip label="Finalizado" size="small" color="default" sx={{ fontSize: 10, height: 18, flexShrink: 0 }} />;
  } else if (enCurso) {
    statusChip = <Chip label="🔴 En curso" size="small" color="warning" sx={{ fontSize: 10, height: 18, flexShrink: 0 }} />;
  } else if (tieneMarcador) {
    statusChip = <Chip label="Con resultado" size="small" color="error" sx={{ fontSize: 10, height: 18, flexShrink: 0 }} />;
  } else if (filled) {
    statusChip = <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 16, flexShrink: 0 }} />;
  }

  return (
    <Box sx={{
      py: 1, px: 1.5, borderRadius: 2, mb: 0.5,
      bgcolor: finalizado ? 'rgba(255,255,255,0.02)' : tieneMarcador ? 'rgba(255,0,0,0.04)' : filled ? 'rgba(212,160,23,0.06)' : 'background.default',
      border: '1px solid', borderColor: finalizado ? 'divider' : filled ? 'primary.dark' : 'divider',
      opacity: isLocked && !filled ? 0.6 : 1,
    }}>
      {/* Fila superior: hora + status + ojo */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
          {formatDate(match.fecha, { day: '2-digit', month: 'short' })} · {hora}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {statusChip}
        </Box>
      </Box>
      {/* Botón de ojo debajo del pill (solo si hay resultado y usuario tiene quiniela) */}
      {tieneResultado && hasQuiniela && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.5 }}>
          <Tooltip title="Ver pronósticos de otros">
            <IconButton size="small" onClick={() => onViewPredictions(match)} color="info" sx={{ p: 0.3 }}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* Fila principal: local — score — visitante */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
        {/* Equipo local */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' }, fontSize: { xs: 11, sm: 14 }, textAlign: 'right', lineHeight: 1.2 }}>
            {match.local}
          </Typography>
          <FlagImg country={match.local} size={18} />
        </Box>

        {/* Inputs marcador */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          <TextField
            size="small" type="number"
            inputProps={{ min: 0, max: 20, style: { width: 32, textAlign: 'center', padding: '5px 0', fontWeight: 700, fontSize: 15 } }}
            value={value?.goles_local ?? ''} disabled={isLocked}
            onChange={(e) => onChange(match.id, 'goles_local', parseInt(e.target.value, 10))}
            sx={{ width: 46, flexShrink: 0 }}
          />
          <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0 }}>–</Typography>
          <TextField
            size="small" type="number"
            inputProps={{ min: 0, max: 20, style: { width: 32, textAlign: 'center', padding: '5px 0', fontWeight: 700, fontSize: 15 } }}
            value={value?.goles_visitante ?? ''} disabled={isLocked}
            onChange={(e) => onChange(match.id, 'goles_visitante', parseInt(e.target.value, 10))}
            sx={{ width: 46, flexShrink: 0 }}
          />
        </Box>

        {/* Equipo visitante */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <FlagImg country={match.visitante} size={18} />
          <Typography variant="body2" fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: { xs: 'normal', sm: 'nowrap' }, fontSize: { xs: 11, sm: 14 }, lineHeight: 1.2 }}>
            {match.visitante}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function DaySection({ fecha, matches, predictions, onChange, disabled, index, onViewPredictions, hasQuiniela }) {
  const filled = matches.filter((m) => isPredFilled(predictions[m.id])).length;
  const total = matches.length;
  const complete = filled === total;

  const fechaLabel = formatDate(fecha, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <Accordion defaultExpanded={index < 3} disableGutters
      sx={{ mb: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: complete ? 'primary.dark' : 'divider', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
            {fechaLabel}
          </Typography>
          <Chip
            label={`${filled}/${total}`}
            size="small"
            color={complete ? 'success' : filled > 0 ? 'warning' : 'default'}
            sx={{ flexShrink: 0, ml: 'auto' }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: { xs: 1, sm: 2 }, pb: 2 }}>
        {!complete && (
          <LinearProgress
            variant="determinate" value={(filled / total) * 100}
            sx={{ mb: 1.5, borderRadius: 1, height: 4 }}
            color={filled > 0 ? 'warning' : 'inherit'}
          />
        )}
        {matches.map((match) => (
          <MatchPredictionRow
            key={match.id} match={match}
            value={predictions[match.id]}
            onChange={onChange}
            disabled={disabled || match.status === 'finalizado'}
            onViewPredictions={onViewPredictions}
            hasQuiniela={hasQuiniela}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default function QuinielaForm() {
  const navigate = useNavigate();
  const { selectedEventId, selectedEvent, paymentForEvent } = useEvent();
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [payment, setPayment] = useState(null);
  const [hasQuiniela, setHasQuiniela] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Diálogo de pronósticos de otros usuarios
  const [predDialog, setPredDialog] = useState({ open: false, match: null, predictions: [], loading: false });

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    Promise.all([
      api.get(`/matches?event_id=${selectedEventId}`),
      api.get(`/predictions/has-quinela/${selectedEventId}`),
    ]).then(([mRes, hRes]) => {
      setMatches(mRes.data);
      setPayment(paymentForEvent(selectedEventId));
      const hasQ = hRes.data.hasQuiniela;
      setHasQuiniela(hasQ);
      if (hasQ) {
        // Cargar predicciones existentes
        return api.get(`/predictions/my/${selectedEventId}`).then((pRes) => {
          const map = {};
          pRes.data.forEach((p) => {
            map[p.match_id] = { goles_local: p.goles_local_pred, goles_visitante: p.goles_visitante_pred };
          });
          setPredictions(map);
        });
      }
    }).catch(() => setError('Error cargando datos')).finally(() => setLoading(false));
  }, [selectedEventId]);

  const handleChange = useCallback((matchId, field, val) => {
    setPredictions((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], [field]: isNaN(val) ? '' : val },
    }));
  }, []);

  const sortedMatches = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || '') || a.id - b.id);
  const days = [...new Set(sortedMatches.map((m) => m.fecha))].sort();
  const openMatches = matches.filter((m) => m.status === 'pendiente' && m.goles_local_real === null);
  const totalFilled = openMatches.filter((m) => isPredFilled(predictions[m.id])).length;

  // Funciones para diálogo de pronósticos
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

  const handleSubmit = async () => {
    const filledOpen = openMatches.filter((m) => isPredFilled(predictions[m.id]));
    const pending = openMatches.filter((m) => !isPredFilled(predictions[m.id]));

    if (filledOpen.length === 0) return setError('No hay pronósticos para guardar.');

    if (!hasQuiniela && pending.length > 0) {
      const ok = window.confirm(`Faltan ${pending.length} pronóstico(s) por llenar. Los partidos sin pronóstico quedarán sin puntos. ¿Deseas guardar de todas formas?`);
      if (!ok) return;
    }

    setSaving(true);
    setError('');
    try {
      const preds = filledOpen.map((m) => ({
        match_id: m.id,
        goles_local_pred: predictions[m.id].goles_local,
        goles_visitante_pred: predictions[m.id].goles_visitante,
      }));
      if (hasQuiniela) {
        await api.put('/predictions/bulk', { event_id: selectedEventId, predictions: preds });
        setSuccess('¡Pronósticos actualizados correctamente!');
      } else {
        await api.post('/predictions/bulk', { event_id: selectedEventId, predictions: preds });
        setSuccess('¡Quiniela guardada exitosamente!');
        setHasQuiniela(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (!selectedEventId || loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  const canPredict = payment?.status === 'aprobado';

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SportsSoccerIcon color="primary" />
          <Typography variant="h5">{selectedEvent?.nombre ?? 'Mi Quiniela'}</Typography>
        </Box>
        <EventSelector onlyApproved />
      </Box>
      <Typography variant="body2" color="text.secondary">
        {selectedEvent?.nombre?.includes('Dieciseisavos') ? 'Fase de Dieciseisavos' : 'Fase de Grupos'}
        {selectedEvent?.nombre?.includes('Mundial') ? ' — Mundial 2026' : ''}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={<SportsSoccerIcon />}
          label={`${totalFilled} / ${openMatches.length} completados${matches.length - openMatches.length > 0 ? ` (${matches.length - openMatches.length} cerrados)` : ''}`}
          color={totalFilled === openMatches.length ? 'success' : totalFilled > 0 ? 'warning' : 'default'}
          sx={{ fontWeight: 700 }}
        />
      </Box>

      {hasQuiniela && openMatches.length > 0 && (
        <Alert severity="info" icon={<LockIcon />} sx={{ mb: 2 }}>
          Ya tienes una quiniela guardada. Puedes editar los partidos que aún no han cerrado.
        </Alert>
      )}
      {hasQuiniela && openMatches.length === 0 && (
        <Alert severity="warning" icon={<LockIcon />} sx={{ mb: 2 }}>
          Todos los partidos ya cerraron. No es posible modificar pronósticos.
          <Button size="small" sx={{ ml: 2 }} onClick={() => navigate('/mi-quiniela')}>Ver mis pronósticos</Button>
        </Alert>
      )}

      {!canPredict && !hasQuiniela && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {!payment ? 'Debes subir tu comprobante de pago.' : 'Tu pago está pendiente de aprobación por el administrador.'}
          <Button size="small" sx={{ ml: 2 }} onClick={() => navigate('/pago')}>Ir a pagos</Button>
        </Alert>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }}>{success}</Alert>}

      <Box sx={{ mb: 3 }}>
        {days.map((fecha, i) => (
          <DaySection
            key={fecha} fecha={fecha} index={i}
            matches={sortedMatches.filter((m) => m.fecha === fecha)}
            predictions={predictions}
            onChange={handleChange}
            disabled={!canPredict}
            onViewPredictions={openPredDialog}
            hasQuiniela={hasQuiniela}
          />
        ))}
      </Box>

      {canPredict && openMatches.length > 0 && (
        <Box sx={{ position: 'sticky', bottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained" size="large" onClick={handleSubmit}
            disabled={saving}
            sx={{ minWidth: 240, boxShadow: 6 }}
          >
            {saving
              ? 'Guardando...'
              : hasQuiniela
                ? `Actualizar Pronósticos (${totalFilled}/${openMatches.length})`
                : totalFilled === openMatches.length
                  ? 'Guardar Quiniela ✓'
                  : `Guardar Quiniela (${totalFilled}/${openMatches.length})`
            }
          </Button>
        </Box>
      )}

      {/* Diálogo de pronósticos de otros usuarios */}
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
                    label={`Resultado: ${predDialog.match?.goles_local_real} – ${predDialog.match?.goles_visitante_real}`} 
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
