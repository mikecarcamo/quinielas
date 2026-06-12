import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, Chip, Switch, Alert, CircularProgress, Tooltip, TextField, InputAdornment,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LockResetIcon from '@mui/icons-material/LockReset';
import api from '../../api/axios';
import { formatDateTime } from '../../lib/dates';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [resetDialog, setResetDialog] = useState({ open: false, user: null });
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  const load = () => {
    api.get('/auth/users').then((r) => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user) => {
    try {
      await api.patch(`/auth/users/${user.id}/activate`, { is_active: !user.is_active });
      setFeedback(`${user.nombre_completo} ${!user.is_active ? 'habilitado' : 'deshabilitado'}`);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: u.is_active ? 0 : 1 } : u));
      setTimeout(() => setFeedback(''), 3000);
    } catch {
      setFeedback('Error al actualizar');
    }
  };

  const openResetDialog = (user) => {
    setResetDialog({ open: true, user });
    setNewPassword('');
    setResetError('');
  };

  const handleReset = async () => {
    if (newPassword.length < 6) return setResetError('Mínimo 6 caracteres');
    setResetLoading(true);
    try {
      const res = await api.patch(`/auth/users/${resetDialog.user.id}/reset-password`, { new_password: newPassword });
      setFeedback(res.data.message);
      setResetDialog({ open: false, user: null });
      setTimeout(() => setFeedback(''), 4000);
    } catch (err) {
      setResetError(err.response?.data?.error || 'Error al restablecer');
    } finally {
      setResetLoading(false);
    }
  };

  const filtered = users.filter((u) =>
    u.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Gestión de Usuarios</Typography>
      {feedback && <Alert severity="info" sx={{ mb: 2 }}>{feedback}</Alert>}

      <TextField
        placeholder="Buscar por nombre o email..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        size="small" sx={{ mb: 2, width: 300 }}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
      />

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell>Nombre</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Rol</TableCell>
              <TableCell align="center">Estado</TableCell>
              <TableCell align="center">Habilitado</TableCell>
              <TableCell align="center">Registro</TableCell>
              <TableCell align="center">Contraseña</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell><Typography variant="body2" fontWeight={600}>{u.nombre_completo}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{u.email}</Typography></TableCell>
                <TableCell align="center">
                  <Chip label={u.role} size="small" color={u.role === 'admin' ? 'secondary' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <Chip label={u.is_active ? 'Activo' : 'Inactivo'} size="small" color={u.is_active ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={u.is_active ? 'Deshabilitar' : 'Habilitar'}>
                    <Switch checked={!!u.is_active} onChange={() => toggleActive(u)} disabled={u.role === 'admin'} color="success" size="small" />
                  </Tooltip>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(u.created_at, { day: '2-digit', month: 'short', year: 'numeric' })}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Restablecer contraseña">
                    <IconButton size="small" onClick={() => openResetDialog(u)} color="warning">
                      <LockResetIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={resetDialog.open} onClose={() => setResetDialog({ open: false, user: null })} maxWidth="xs" fullWidth>
        <DialogTitle>Restablecer contraseña — {resetDialog.user?.nombre_completo}</DialogTitle>
        <DialogContent>
          {resetError && <Alert severity="error" sx={{ mb: 2 }}>{resetError}</Alert>}
          <TextField
            label="Nueva contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            autoFocus
            helperText="Mínimo 6 caracteres"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialog({ open: false, user: null })}>Cancelar</Button>
          <Button variant="contained" color="warning" onClick={handleReset} disabled={resetLoading}>
            {resetLoading ? 'Guardando...' : 'Restablecer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
