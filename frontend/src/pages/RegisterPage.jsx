import React, { useState } from 'react';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link } from '@mui/material';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre_completo: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('Las contraseñas no coinciden');
    setLoading(true);
    try {
      await api.post('/auth/register', { nombre_completo: form.nombre_completo, email: form.email, password: form.password });
      setSuccess('Registro exitoso. El administrador debe aprobar tu cuenta.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <SportsSoccerIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">Crear cuenta</Typography>
            <Typography variant="body2" color="text.secondary">Quiniela Mundial 2026</Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nombre completo" value={form.nombre_completo} onChange={(e) => setForm({ ...form, nombre_completo: e.target.value })} required fullWidth autoFocus />
            <TextField label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required fullWidth />
            <TextField label="Contraseña" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required fullWidth helperText="Mínimo 6 caracteres" />
            <TextField label="Confirmar contraseña" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required fullWidth />
            <Button type="submit" variant="contained" size="large" disabled={loading || !!success} sx={{ mt: 1 }}>
              {loading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </Box>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            ¿Ya tienes cuenta?{' '}
            <Link component={RouterLink} to="/login" color="primary">Inicia sesión</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
