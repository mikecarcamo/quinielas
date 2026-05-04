import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Alert, Chip,
  LinearProgress, Divider, CircularProgress, Grid,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../api/axios';
import { useEvent } from '../context/EventContext';

const statusConfig = {
  pendiente: { label: 'Pendiente de revisión', color: 'warning', icon: <HourglassEmptyIcon /> },
  aprobado:  { label: 'Aprobado ✓', color: 'success', icon: <CheckCircleIcon /> },
  rechazado: { label: 'Rechazado', color: 'error', icon: <CancelIcon /> },
};

function EventPaymentCard({ event, payment, onReload }) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputId = `file-input-${event.id}`;

  const handleUpload = async () => {
    if (!file) return setError('Selecciona un archivo');
    setUploading(true); setError('');
    const fd = new FormData();
    fd.append('comprobante', file);
    fd.append('event_id', event.id);
    try {
      await api.post('/payments/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Comprobante enviado. El admin lo revisará.');
      setFile(null);
      onReload();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const st = payment ? statusConfig[payment.status] : null;

  return (
    <Card sx={{ border: '1px solid', borderColor: st ? `${st.color}.main` : 'divider' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" fontWeight={700}>{event.nombre}</Typography>
          <Typography variant="body2" color="success.main" fontWeight={700}>Q{event.precio_entrada}</Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        {payment ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ color: `${st.color}.main` }}>{st.icon}</Box>
              <Chip label={st.label} color={st.color} size="small" />
            </Box>
            {payment.notas && (
              <Alert severity={payment.status === 'rechazado' ? 'error' : 'info'} sx={{ mt: 1, mb: 1 }}>
                <strong>Nota:</strong> {payment.notas}
              </Alert>
            )}
            {payment.comprobante_url && (
              <Box sx={{ mt: 1, mb: 1 }}>
                {payment.comprobante_url.match(/\.(jpg|jpeg|png)$/i) ? (
                  <Box component="img" src={payment.comprobante_url} alt="comprobante"
                    sx={{ maxWidth: '100%', maxHeight: 200, borderRadius: 1 }} />
                ) : (
                  <Button size="small" variant="outlined" href={payment.comprobante_url} target="_blank">
                    Ver comprobante PDF
                  </Button>
                )}
              </Box>
            )}
            {payment.status === 'rechazado' && (
              <UploadArea inputId={inputId} file={file} setFile={setFile} uploading={uploading}
                error={error} success={success} onUpload={handleUpload} label="Volver a subir" />
            )}
          </>
        ) : (
          <UploadArea inputId={inputId} file={file} setFile={setFile} uploading={uploading}
            error={error} success={success} onUpload={handleUpload} label="Enviar comprobante" />
        )}
      </CardContent>
    </Card>
  );
}

function UploadArea({ inputId, file, setFile, uploading, error, success, onUpload, label }) {
  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert>}
      <Box
        sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, p: 2, textAlign: 'center', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
        onClick={() => document.getElementById(inputId).click()}
      >
        <CloudUploadIcon sx={{ fontSize: 36, color: 'primary.main', mb: 0.5 }} />
        <Typography variant="body2">{file ? file.name : 'Haz clic para seleccionar archivo'}</Typography>
        <Typography variant="caption" color="text.secondary">JPG, PNG o PDF — máx. 5MB</Typography>
        <input id={inputId} type="file" accept="image/*,.pdf" hidden onChange={(e) => setFile(e.target.files[0])} />
      </Box>
      {uploading && <LinearProgress sx={{ mt: 1 }} />}
      <Button variant="contained" fullWidth sx={{ mt: 1.5 }} onClick={onUpload} disabled={!file || uploading}>
        {uploading ? 'Subiendo...' : label}
      </Button>
    </>
  );
}

export default function PaymentPage() {
  const { events, paymentForEvent, loading, reload } = useEvent();

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>Mis Pagos</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Para participar en cada quiniela debes subir tu comprobante de pago.
      </Typography>

      {events.length === 0 && (
        <Alert severity="info">No hay eventos activos en este momento.</Alert>
      )}

      <Grid container spacing={2}>
        {events.map((ev) => (
          <Grid item xs={12} md={events.length === 1 ? 12 : 6} key={ev.id}>
            <EventPaymentCard event={ev} payment={paymentForEvent(ev.id)} onReload={reload} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
