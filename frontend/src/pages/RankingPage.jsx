import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, CircularProgress, Card, CardContent, Grid, Avatar, Button,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import api from '../api/axios';
import { useEvent } from '../context/EventContext';
import EventSelector from '../components/EventSelector';

const medalColors = { 1: '#D4A017', 2: '#9E9E9E', 3: '#CD7F32' };

export default function RankingPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { selectedEventId } = useEvent();

  useEffect(() => {
    if (!selectedEventId) return;
    setLoading(true);
    api.get(`/ranking/${selectedEventId}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [selectedEventId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (!data) return <Typography>No se pudo cargar el ranking.</Typography>;

  const { ranking, pozo, total_participantes, event } = data;

  // Premio total por posición y conteo de empatados
  const infoPos = (pos) => {
    const rows = ranking.filter((r) => r.posicion === pos);
    if (rows.length === 0) return null;
    const total = rows.reduce((s, r) => s + r.premio, 0);
    return { valor: `Q${total.toLocaleString()}`, count: rows.length };
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">Ranking — {event.nombre}</Typography>
          <Typography variant="body2" color="text.secondary">Clasificación en tiempo real</Typography>
        </Box>
        <Box className="no-print" sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <EventSelector onlyApproved={false} />
          <Button
            variant="outlined"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            onClick={() => window.print()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Exportar PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Cards fijos */}
        {[
          { label: 'Pozo total', value: `Q${pozo.toLocaleString()}`, icon: <EmojiEventsIcon />, sub: null },
          { label: 'Participantes', value: total_participantes, icon: <SportsSoccerIcon />, sub: null },
        ].map((s) => (
          <Grid item xs={6} md={2.4} key={s.label}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                {s.icon}
                <Typography variant="h6" fontWeight={700}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Cards dinámicos por lugar */}
        {[
          { label: '1er Lugar', pos: 1, color: '#D4A017' },
          { label: '2do Lugar', pos: 2, color: '#9E9E9E' },
          { label: '3er Lugar', pos: 3, color: '#CD7F32' },
        ].map((s) => {
          const info = infoPos(s.pos);
          return (
            <Grid item xs={6} md={2.4} key={s.label}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <EmojiEventsIcon sx={{ color: s.color }} />
                  <Typography variant="h6" fontWeight={700}>{info ? info.valor : '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                  {info && info.count > 1 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label={`${info.count} empatados`} size="small" sx={{ fontSize: 10, height: 18, bgcolor: s.color, color: '#000' }} />
                    </Box>
                  )}
                  {info && info.count === 1 && (
                    <Box sx={{ mt: 0.5 }}>
                      <Chip label="1 participante" size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell align="center" width={60}>#</TableCell>
              <TableCell>Participante</TableCell>
              <TableCell align="center">Puntos</TableCell>
              <TableCell align="center">Premio estimado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranking.map((row) => (
              <TableRow key={row.user_id} hover
                sx={{ bgcolor: row.posicion <= 3 ? `${medalColors[row.posicion]}10` : 'inherit' }}>
                <TableCell align="center">
                  {row.posicion <= 3 ? (
                    <EmojiEventsIcon sx={{ color: medalColors[row.posicion] }} />
                  ) : (
                    <Typography variant="body2">{row.posicion}</Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: row.posicion <= 3 ? medalColors[row.posicion] : 'grey.700', fontSize: 14, color: '#000' }}>
                      {row.nombre_completo[0].toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{row.nombre_completo}</Typography>
                      {row.posicion && (
                        <Chip label={`${row.posicion}° lugar`} size="small"
                          sx={{ height: 18, fontSize: 10, bgcolor: medalColors[row.posicion] || 'grey.800', color: '#000' }} />
                      )}
                    </Box>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="h6" fontWeight={700} color="primary.light">{row.total_puntos}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body1" fontWeight={600} color={row.premio > 0 ? 'success.main' : 'text.secondary'}>
                    {row.premio > 0 ? `Q${row.premio.toLocaleString()}` : '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {ranking.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="text.secondary" sx={{ py: 4 }}>Aún no hay participantes</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
