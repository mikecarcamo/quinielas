import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Alert, Chip, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Accordion, AccordionSummary, AccordionDetails, Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import api from '../api/axios';
import { FlagImg } from '../lib/flags.jsx';
import { formatDate } from '../lib/dates';
import { useEvent } from '../context/EventContext';

function calcPoints(p) {
  const gl = p.goles_local_pred, gv = p.goles_visitante_pred;
  const rl = p.goles_local_real, rv = p.goles_visitante_real;
  if (rl === null || rl === undefined || rv === null || rv === undefined) return null;
  let pts = 0;
  if (gl === rl) pts += 5;
  if (gv === rv) pts += 5;
  if (Math.sign(gl - gv) === Math.sign(rl - rv)) pts += 2;

  // Extra por ganador en penales en fase eliminatoria (solo si finalizado)
  const isEliminatoria = p.fase && p.fase !== 'grupos';
  const finalizado = p.match_status === 'finalizado';
  if (
    finalizado &&
    isEliminatoria &&
    rl === rv &&
    gl === gv &&
    p.ganador_penales &&
    p.pred_ganador_penales &&
    p.ganador_penales === p.pred_ganador_penales
  ) {
    pts += 2;
  }

  return pts;
}

function PointsChip({ p }) {
  if (p.match_status === 'pendiente') return <Chip label="Pendiente" size="small" variant="outlined" />;
  const pts = calcPoints(p);
  if (p.match_status === 'en_curso') {
    return <Chip label={pts > 0 ? `🔴 +${pts} pts` : '🔴 En curso'} size="small" color="warning" />;
  }
  const color = pts === 14 ? 'success' : pts === 12 ? 'success' : pts >= 7 ? 'warning' : pts > 0 ? 'default' : 'error';
  return <Chip label={`+${pts} pts`} size="small" color={color} />;
}

export default function QuinielaView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { selectedEventId, selectedEvent } = useEvent();
  const [preds, setPreds] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedEventId) return;
    api.get(`/predictions/view/${userId}/${selectedEventId}`)
      .then((r) => {
        setPreds(r.data.predictions);
        setUserName(r.data.nombre_completo);
      })
      .catch((e) => {
        if (e.response?.status === 403) {
          navigate('/quiniela', { replace: true });
        } else {
          setError(e.response?.data?.error || 'No se pudo cargar la quiniela');
        }
      })
      .finally(() => setLoading(false));
  }, [userId, selectedEventId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ranking')} sx={{ mb: 2 }}>Volver al Ranking</Button>
      <Alert severity="warning">{error}</Alert>
    </Box>
  );

  // Ordenar por fecha, hora, id (igual que QuinielaForm)
  const sortedPreds = [...preds].sort((a, b) => a.fecha.localeCompare(b.fecha) || (a.hora || '').localeCompare(b.hora || '') || a.id - b.id);
  const days = [...new Set(sortedPreds.map((p) => p.fecha))].sort();
  const totalPts = preds.reduce((s, p) => (p.match_status === 'finalizado' || p.match_status === 'en_curso') ? s + (calcPoints(p) ?? 0) : s, 0);
  const played = preds.filter((p) => p.match_status === 'finalizado').length;
  const enCursoCount = preds.filter((p) => p.match_status === 'en_curso').length;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ranking')} sx={{ mb: 2 }}>
        Volver al Ranking
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={700}>Quiniela de {userName}</Typography>
        <Chip label={`${preds.length} / ${preds.length} pronósticos`} color={preds.length > 0 ? 'success' : 'warning'} />
        {(played > 0 || enCursoCount > 0) && <Chip label={`${totalPts} pts acumulados${enCursoCount > 0 ? ' (en curso)' : ''}`} color={enCursoCount > 0 ? 'warning' : 'primary'} variant="outlined" />}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectedEvent?.nombre?.includes('Dieciseisavos') ? 'Mundial 2026 — Fase de Dieciseisavos · Solo lectura' : 'Mundial 2026 — Fase de Grupos · Solo lectura'}
      </Typography>

      {preds.length === 0 ? (
        <Alert severity="info">Este usuario aún no ha ingresado su quiniela.</Alert>
      ) : (
        days.map((fecha, idx) => {
          const dayPreds = sortedPreds.filter((p) => p.fecha === fecha);
          const finalizados = dayPreds.filter((p) => p.match_status === 'finalizado');
          const enCursoDia = dayPreds.filter((p) => p.match_status === 'en_curso');
          const dayPts = [...finalizados, ...enCursoDia].reduce((s, p) => s + (calcPoints(p) ?? 0), 0);
          const fechaLabel = formatDate(fecha, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

          return (
            <Accordion key={fecha} defaultExpanded={idx < 3} disableGutters
              sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '10px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ textTransform: 'capitalize' }}>{fechaLabel}</Typography>
                  {(finalizados.length > 0 || enCursoDia.length > 0) && <Chip label={`${dayPts} pts`} size="small" color={enCursoDia.length > 0 ? 'warning' : 'primary'} variant="outlined" />}
                  <Chip label={`${finalizados.length}/${dayPreds.length} jugados`} size="small"
                    color={finalizados.length === dayPreds.length ? 'success' : enCursoDia.length > 0 ? 'warning' : 'default'} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1, pt: 0 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell>Partido</TableCell>
                        <TableCell align="center">Grupo</TableCell>
                        <TableCell align="center">Hora</TableCell>
                        <TableCell align="center">Pronóstico</TableCell>
                        <TableCell align="center">Resultado Real</TableCell>
                        <TableCell align="center">Puntos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dayPreds.map((p) => {
                        const finalizado = p.match_status === 'finalizado';
                        const enCurso = p.match_status === 'en_curso';
                        return (
                          <TableRow key={p.id} hover
                            sx={{ bgcolor: finalizado && calcPoints(p) === 12 ? 'rgba(76,175,80,0.06)' : enCurso ? 'rgba(255,152,0,0.05)' : 'inherit' }}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                                <FlagImg country={p.local} size={16} />
                                <Typography variant="body2" fontWeight={600}>{p.local}</Typography>
                                <Typography variant="caption" color="text.secondary">vs</Typography>
                                <FlagImg country={p.visitante} size={16} />
                                <Typography variant="body2" fontWeight={600}>{p.visitante}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                {p.grupo}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary">
                                {p.hora || '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" fontWeight={700} color="primary.light">
                                {p.goles_local_pred} – {p.goles_visitante_pred}
                              </Typography>
                              {p.pred_ganador_penales && (
                                <Typography variant="caption" color="info.main">
                                  P: {p.pred_ganador_penales === 'local' ? p.local : p.visitante}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              {(finalizado || enCurso)
                                ? (
                                  <Typography variant="body1" fontWeight={700} sx={{ color: enCurso ? 'warning.main' : 'inherit' }}>
                                    {p.goles_local_real} – {p.goles_visitante_real}
                                    {p.ganador_penales && (
                                      <Typography component="span" variant="caption" color="info.main" sx={{ ml: 0.5 }}>
                                        P: {p.ganador_penales === 'local' ? p.local : p.visitante}
                                      </Typography>
                                    )}
                                  </Typography>
                                )
                                : <Typography variant="caption" color="text.secondary">—</Typography>}
                            </TableCell>
                            <TableCell align="center"><PointsChip p={p} /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          );
        })
      )}
    </Box>
  );
}
