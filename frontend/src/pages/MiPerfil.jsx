import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, TextField, Button,
  Alert, Divider, InputAdornment, IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function MiPerfil() {
  const { user } = useAuth();
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const toggleShow = (field) => setShow({ ...show, [field]: !show[field] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.new_password !== form.confirm_password) {
      return setError('La nueva contraseña y la confirmación no coinciden');
    }
    if (form.new_password.length < 6) {
      return setError('La nueva contraseña debe tener al menos 6 caracteres');
    }

    setLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        current_password: form.current_password,
        new_password: form.new_password,
      });
      setSuccess(res.data.message);
      setForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={480}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <LockIcon color="primary" />
        <Typography variant="h5">Mi Perfil</Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Información de la cuenta</Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="body2"><strong>Nombre:</strong> {user?.nombre_completo}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Email:</strong> {user?.email}</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}><strong>Rol:</strong> {user?.role}</Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Cambiar contraseña</Typography>
          <Divider sx={{ mb: 2 }} />

          {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
          {success && <Alert severity="success" icon={<CheckCircleIcon />} sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Contraseña actual"
              type={show.current ? 'text' : 'password'}
              value={form.current_password}
              onChange={handleChange('current_password')}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => toggleShow('current')}>
                      {show.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Nueva contraseña"
              type={show.new ? 'text' : 'password'}
              value={form.new_password}
              onChange={handleChange('new_password')}
              required
              helperText="Mínimo 6 caracteres"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => toggleShow('new')}>
                      {show.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirmar nueva contraseña"
              type={show.confirm ? 'text' : 'password'}
              value={form.confirm_password}
              onChange={handleChange('confirm_password')}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => toggleShow('confirm')}>
                      {show.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Guardando...' : 'Cambiar contraseña'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
