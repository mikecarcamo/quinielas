import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button, Alert, Chip,
  CircularProgress, Divider, Grid, Accordion, AccordionSummary, AccordionDetails,
  LinearProgress,
} from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FlagImg } from '../lib/flags.jsx';
import { useEvent } from '../context/EventContext';
import EventSelector from '../components/EventSelector';
import { formatDate, isPastDeadline } from '../lib/dates';

function isPredFilled(p) {
  return p && p.goles_local !== '' && p.goles_local !== undefined && p.goles_visitante !== '' && p.goles_visitante !== undefined;
}


function MatchPredictionRow({ match, value, onChange, disabled }) {
  const fecha = formatDate(match.fecha);
  const filled = isPredFilled(value);
  const closed = isPastDeadline(match.fecha);
  const finalizado = match.status === 'finalizado';
  const isLocked = disabled || closed || finalizado;

  let statusChip = null;
  if (finalizado) {
    statusChip = <Chip label="Finalizado" size="small" color="default" sx={{ fontSize: 10, height: 18, flexShrink: 0 }} />;
  } else if (closed) {
    statusChip = <Chip label="Cerrado" size="small" color="error" sx={{ fontSize: 10, height: 18, flexShrink: 0 }} />;
  } else if (filled) {
    statusChip = <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 16, flexShrink: 0 }} />;
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, py: 1, px: 1.5,
      borderRadius: 2, mb: 0.5,
      bgcolor: finalizado ? 'rgba(255,255,255,0.02)' : closed ? 'rgba(255,0,0,0.04)' : filled ? 'rgba(212,160,23,0.06)' : 'background.default',
      border: '1px solid', borderColor: finalizado ? 'divider' : filled ? 'primary.dark' : 'divider',
      opacity: isLocked && !filled ? 0.6 : 1,
    }}>
      <Typography variant="caption" color="text.secondary" sx={{ width: 70, flexShrink: 0, fontSize: 11 }}>
        {fecha}
      </Typography>

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600} noWrap>{match.local}</Typography>
        <FlagImg country={match.local} size={18} />
      </Box>

      <TextField
        size="small" type="number"
        inputProps={{ min: 0, max: 20, style: { width: 36, textAlign: 'center', padding: '5px 0', fontWeight: 700 } }}
        value={value?.goles_local ?? ''} disabled={isLocked}
        onChange={(e) => onChange(match.id, 'goles_local', parseInt(e.target.value, 10))}
        sx={{ width: 50, flexShrink: 0 }}
      />
      <Typography variant="body1" fontWeight={700} color="text.secondary" sx={{ flexShrink: 0 }}>–</Typography>
      <TextField
        size="small" type="number"
        inputProps={{ min: 0, max: 20, style: { width: 36, textAlign: 'center', padding: '5px 0', fontWeight: 700 } }}
        value={value?.goles_visitante ?? ''} disabled={isLocked}
        onChange={(e) => onChange(match.id, 'goles_visitante', parseInt(e.target.value, 10))}
        sx={{ width: 50, flexShrink: 0 }}
      />

      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
        <FlagImg country={match.visitante} size={18} />
        <Typography variant="body2" fontWeight={600} noWrap>{match.visitante}</Typography>
      </Box>

      {statusChip}
    </Box>
  );
}

function GroupSection({ grupo, matches, predictions, onChange, disabled }) {
  const filled = matches.filter((m) => isPredFilled(predictions[m.id])).length;
  const total = matches.length;
  const complete = filled === total;
  const sorted = [...matches].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const teams = [...new Set(matches.flatMap((m) => [m.local, m.visitante]))];

  return (
    <Accordion defaultExpanded={grupo <= 'C'} disableGutters
      sx={{ mb: 1.5, bgcolor: 'background.paper', border: '1px solid', borderColor: complete ? 'primary.dark' : 'divider', borderRadius: '12px !important', '&:before': { display: 'none' } }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 80 }}>
            Grupo {grupo}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1 }}>
            {teams.map((t) => (
              <Chip key={t} label={<Box sx={{ display:'flex', alignItems:'center', gap:0.5 }}><FlagImg country={t} size={14} />{t}</Box>}
                size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
            ))}
          </Box>
          <Chip
            label={`${filled}/${total}`}
            size="small"
            color={complete ? 'success' : filled > 0 ? 'warning' : 'default'}
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0, px: 2, pb: 2 }}>
        {!complete && (
          <LinearProgress
            variant="determinate" value={(filled / total) * 100}
            sx={{ mb: 1.5, borderRadius: 1, height: 4 }}
            color={filled > 0 ? 'warning' : 'inherit'}
          />
        )}
        {sorted.map((match) => (
          <MatchPredictionRow
            key={match.id} match={match}
            value={predictions[match.id]}
            onChange={onChange}
            disabled={disabled || match.status === 'finalizado'}
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

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    Promise.all([
      api.get(`/matches?event_id=${selectedEventId}&fase=grupos`),
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

  const grupos = [...new Set(matches.map((m) => m.grupo))].filter(Boolean).sort();
  const openMatches = matches.filter((m) => !isPastDeadline(m.fecha));
  const totalFilled = openMatches.filter((m) => isPredFilled(predictions[m.id])).length;

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
      <Typography variant="body2" color="text.secondary">Fase de Grupos — Mundial 2026 · 12 grupos</Typography>
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
        {grupos.map((g) => (
          <GroupSection
            key={g} grupo={g}
            matches={matches.filter((m) => m.grupo === g)}
            predictions={predictions}
            onChange={handleChange}
            disabled={!canPredict}
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
    </Box>
  );
}
