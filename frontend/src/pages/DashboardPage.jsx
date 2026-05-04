import React, { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Alert } from '@mui/material';
import EditNoteIcon from '@mui/icons-material/EditNote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvent } from '../context/EventContext';
import EventSelector from '../components/EventSelector';
import api from '../api/axios';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { selectedEventId, selectedEvent, paymentForEvent } = useEvent();
  const [hasQuiniela, setHasQuiniela] = useState(false);
  const [ranking, setRanking] = useState(null);

  const payment = selectedEventId ? paymentForEvent(selectedEventId) : null;

  useEffect(() => {
    if (!selectedEventId) return;
    api.get(`/predictions/has-quinela/${selectedEventId}`).then((r) => setHasQuiniela(r.data.hasQuiniela)).catch(() => {});
    api.get(`/ranking/${selectedEventId}`).then((r) => setRanking(r.data)).catch(() => {});
  }, [selectedEventId]);

  const myRank = ranking?.ranking?.find((r) => r.user_id === user?.id);

  const steps = [
    { title: '1. Sube tu pago', desc: 'Adjunta comprobante de transferencia', done: !!payment, action: () => navigate('/pago'), icon: <PaymentIcon /> },
    { title: '2. Espera aprobación', desc: 'El admin valida tu pago', done: payment?.status === 'aprobado', icon: <CheckCircleIcon /> },
    { title: '3. Llena tu quiniela', desc: 'Ingresa tus pronósticos', done: hasQuiniela, action: () => navigate('/quiniela'), icon: <EditNoteIcon /> },
    { title: '4. Sigue el ranking', desc: 'Ve tu posición en tiempo real', done: false, action: () => navigate('/ranking'), icon: <EmojiEventsIcon /> },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            ¡Bienvenido, {user?.nombre_completo?.split(' ')[0]}! 🏆
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {selectedEvent?.nombre ?? 'Quiniela'}
          </Typography>
        </Box>
        <EventSelector onlyApproved={false} />
      </Box>

      {!user?.is_active && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Tu cuenta aún no ha sido habilitada por el administrador. Sube tu comprobante de pago.
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>{myRank?.posicion ?? '-'}</Typography>
              <Typography variant="body2" color="text.secondary">Mi posición</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SportsSoccerIcon sx={{ fontSize: 40, color: 'secondary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>{myRank?.total_puntos ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">Mis puntos</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>Q{ranking ? (ranking.total_participantes * (selectedEvent?.precio_entrada ?? 100)).toLocaleString() : 0}</Typography>
              <Typography variant="body2" color="text.secondary">Pozo total</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>{ranking?.total_participantes ?? 0}</Typography>
              <Typography variant="body2" color="text.secondary">Participantes</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>Pasos para participar</Typography>
      <Grid container spacing={2}>
        {steps.map((step, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ border: step.done ? '1px solid' : '1px solid transparent', borderColor: step.done ? 'success.main' : 'transparent' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: step.done ? 'success.main' : 'primary.main' }}>{step.icon}</Box>
                  {step.done && <Chip label="Listo" color="success" size="small" />}
                </Box>
                <Typography variant="subtitle2" fontWeight={700}>{step.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{step.desc}</Typography>
                {step.action && !step.done && (
                  <Button size="small" variant="outlined" onClick={step.action}>Ir</Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
