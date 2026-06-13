import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, CircularProgress, Alert, Card, CardContent, Grid,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { FlagImg } from '../lib/flags.jsx';
import { useEvent } from '../context/EventContext';
import EventSelector from '../components/EventSelector';
import { formatDate } from '../lib/dates';

function ResultChip({ p }) {
  if (p.match_status === 'finalizado') {
    const pts = calcPoints(p);
    return <Chip label={`+${pts} pts`} size="small" color={pts === 12 ? 'success' : pts >= 7 ? 'warning' : pts > 0 ? 'default' : 'error'} />;
  }
  if (p.match_status === 'en_curso') return <Chip label="🔴 En curso" size="small" color="warning" />;
  return <Chip label="Pendiente" size="small" />;
}

function calcPoints(p) {
  const gl = p.goles_local_pred, gv = p.goles_visitante_pred;
  const rl = p.goles_local_real, rv = p.goles_visitante_real;
  if (rl === null || rl === undefined || rv === null || rv === undefined) return 0;
  let pts = 0;
  if (gl === rl) pts += 5;
  if (gv === rv) pts += 5;
  if (Math.sign(gl - gv) === Math.sign(rl - rv)) pts += 2;
  return pts;
}

export default function MiQuiniela() {
  const navigate = useNavigate();
  const { selectedEventId, selectedEvent } = useEvent();
  const [preds, setPreds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    api.get(`/predictions/my/${selectedEventId}`)
      .then((r) => setPreds(r.data))
      .catch(() => setError('Error al cargar pronósticos'))
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  if (preds.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Typography variant="h6" gutterBottom>Aún no tienes pronósticos</Typography>
        <Typography variant="body2" color="text.secondary">Ve a <strong>Mi Quiniela</strong> para ingresar tus predicciones.</Typography>
      </Box>
    );
  }

  const totalPuntos = preds.reduce((a, p) => a + p.puntos_obtenidos, 0);
  const finalizados = preds.filter((p) => p.match_status === 'finalizado').length;
  const maxPosible = preds.length * 12;

  const grupos = [...new Set(preds.map((p) => p.grupo))].filter(Boolean).sort();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h5">{selectedEvent?.nombre ?? 'Mis Pronósticos'}</Typography>
        <EventSelector onlyApproved />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Puntos obtenidos', value: totalPuntos, color: 'primary.main' },
          { label: 'Partidos finalizados', value: `${finalizados} / ${preds.length}`, color: 'text.primary' },
          { label: 'Máximo posible', value: maxPosible, color: 'text.secondary' },
        ].map((s) => (
          <Grid item xs={12} sm={4} key={s.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: s.color }}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {grupos.map((grupo) => (
        <Box key={grupo} sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>Grupo {grupo}</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell>Partido</TableCell>
                  <TableCell align="center">Tu pronóstico</TableCell>
                  <TableCell align="center">Resultado real</TableCell>
                  <TableCell align="center">Puntos</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {preds.filter((p) => p.grupo === grupo).map((p) => (
                  <TableRow key={p.id} hover
                    sx={{ bgcolor: p.match_status === 'finalizado' && p.puntos_obtenidos >= 7 ? 'rgba(76,175,80,0.05)' : 'inherit' }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                        <FlagImg country={p.local} size={18} />
                        <Typography variant="body2" fontWeight={600}>{p.local}</Typography>
                        <Typography variant="body2" color="text.secondary">vs</Typography>
                        <FlagImg country={p.visitante} size={18} />
                        <Typography variant="body2" fontWeight={600}>{p.visitante}</Typography>
                      </Box>
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
                      {(p.match_status === 'finalizado' || p.match_status === 'en_curso') ? (
                        <Typography variant="body1" fontWeight={700} sx={{ color: p.match_status === 'en_curso' ? 'warning.main' : 'inherit' }}>
                          {p.goles_local_real} – {p.goles_visitante_real}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <ResultChip p={p} />
                    </TableCell>
                    <TableCell align="center">
                      {p.match_status === 'finalizado'
                        ? <CheckCircleIcon color="success" fontSize="small" />
                        : p.match_status === 'en_curso'
                        ? <RadioButtonUncheckedIcon color="warning" fontSize="small" />
                        : <RadioButtonUncheckedIcon color="disabled" fontSize="small" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      ))}
    </Box>
  );
}
