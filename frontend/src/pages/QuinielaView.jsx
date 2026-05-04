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

const EVENT_ID = 1;

function calcPoints(p) {
  const gl = p.goles_local_pred, gv = p.goles_visitante_pred;
  const rl = p.goles_local_real, rv = p.goles_visitante_real;
  if (rl === null || rl === undefined || rv === null || rv === undefined) return null;
  let pts = 0;
  if (gl === rl) pts += 5;
  if (gv === rv) pts += 5;
  if (Math.sign(gl - gv) === Math.sign(rl - rv)) pts += 2;
  return pts;
}

function PointsChip({ p }) {
  if (p.match_status !== 'finalizado') return <Chip label="Pendiente" size="small" variant="outlined" />;
  const pts = calcPoints(p);
  const color = pts === 12 ? 'success' : pts >= 7 ? 'warning' : pts > 0 ? 'default' : 'error';
  return <Chip label={`+${pts} pts`} size="small" color={color} />;
}

export default function QuinielaView() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [preds, setPreds] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/predictions/view/${userId}/${EVENT_ID}`)
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
  }, [userId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ranking')} sx={{ mb: 2 }}>Volver al Ranking</Button>
      <Alert severity="warning">{error}</Alert>
    </Box>
  );

  const groups = [...new Set(preds.map((p) => p.grupo))].sort();
  const totalPts = preds.reduce((s, p) => p.match_status === 'finalizado' ? s + (calcPoints(p) ?? 0) : s, 0);
  const played = preds.filter((p) => p.match_status === 'finalizado').length;

  return (
    <Box>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ranking')} sx={{ mb: 2 }}>
        Volver al Ranking
      </Button>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
        <Typography variant="h5" fontWeight={700}>Quiniela de {userName}</Typography>
        <Chip label={`${preds.length} / 72 pronósticos`} color={preds.length === 72 ? 'success' : 'warning'} />
        {played > 0 && <Chip label={`${totalPts} pts acumulados`} color="primary" variant="outlined" />}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Mundial 2026 — Fase de Grupos · Solo lectura
      </Typography>

      {preds.length === 0 ? (
        <Alert severity="info">Este usuario aún no ha ingresado su quiniela.</Alert>
      ) : (
        groups.map((grupo) => {
          const gPreds = preds.filter((p) => p.grupo === grupo);
          const finalizados = gPreds.filter((p) => p.match_status === 'finalizado');
          const gpPts = finalizados.reduce((s, p) => s + (calcPoints(p) ?? 0), 0);

          return (
            <Accordion key={grupo} defaultExpanded disableGutters
              sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: '10px !important', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, mr: 1, flexWrap: 'wrap' }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ minWidth: 80 }}>Grupo {grupo}</Typography>
                  {finalizados.length > 0 && <Chip label={`${gpPts} pts`} size="small" color="primary" variant="outlined" />}
                  <Chip label={`${finalizados.length}/${gPreds.length} jugados`} size="small"
                    color={finalizados.length === gPreds.length ? 'success' : 'default'} />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1, pt: 0 }}>
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell>Partido</TableCell>
                        <TableCell align="center">Fecha</TableCell>
                        <TableCell align="center">Pronóstico</TableCell>
                        <TableCell align="center">Resultado Real</TableCell>
                        <TableCell align="center">Puntos</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {gPreds.map((p) => {
                        const finalizado = p.match_status === 'finalizado';
                        return (
                          <TableRow key={p.id} hover
                            sx={{ bgcolor: finalizado && calcPoints(p) === 12 ? 'rgba(76,175,80,0.06)' : 'inherit' }}>
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
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(p.fecha, { day: '2-digit', month: 'short' })}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" fontWeight={700} color="primary.light">
                                {p.goles_local_pred} – {p.goles_visitante_pred}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {finalizado
                                ? <Typography variant="body1" fontWeight={700}>{p.goles_local_real} – {p.goles_visitante_real}</Typography>
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
