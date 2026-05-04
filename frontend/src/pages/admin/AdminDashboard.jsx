import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Button } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: 0, pendingPayments: 0, matches: 0, participantes: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/auth/users'),
      api.get('/payments?status=pendiente'),
      api.get('/matches?event_id=1'),
      api.get('/ranking/1'),
    ]).then(([u, p, m, r]) => {
      setStats({
        users: u.data.length,
        pendingPayments: p.data.length,
        matches: m.data.length,
        participantes: r.data.total_participantes,
      });
    }).catch(() => {});
  }, []);

  const cards = [
    { title: 'Usuarios', value: stats.users, icon: <PeopleIcon />, path: '/admin/usuarios', color: 'secondary.main' },
    { title: 'Pagos pendientes', value: stats.pendingPayments, icon: <ReceiptIcon />, path: '/admin/pagos', color: 'warning.main' },
    { title: 'Partidos', value: stats.matches, icon: <SportsSoccerIcon />, path: '/admin/partidos', color: 'primary.main' },
    { title: 'Participantes activos', value: stats.participantes, icon: <EmojiEventsIcon />, path: '/ranking', color: 'success.main' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Panel de Administración</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Quiniela Mundial 2026</Typography>

      <Grid container spacing={3}>
        {cards.map((c) => (
          <Grid item xs={12} sm={6} md={3} key={c.title}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 6 } }} onClick={() => navigate(c.path)}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ color: c.color, mb: 1 }}>{c.icon}</Box>
                <Typography variant="h3" fontWeight={700}>{c.value}</Typography>
                <Typography variant="body2" color="text.secondary">{c.title}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button variant="contained" onClick={() => navigate('/admin/partidos')}>Gestionar Partidos</Button>
        <Button variant="outlined" onClick={() => navigate('/admin/usuarios')}>Gestionar Usuarios</Button>
        <Button variant="outlined" onClick={() => navigate('/admin/pagos')}>Revisar Pagos</Button>
        <Button variant="outlined" color="success" onClick={() => navigate('/ranking')}>Ver Ranking</Button>
      </Box>
    </Box>
  );
}
