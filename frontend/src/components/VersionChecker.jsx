import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import api from '../api/axios';

const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos
const STORAGE_KEY = 'app_version';

export default function VersionChecker() {
  const [needsReload, setNeedsReload] = useState(false);
  const [newVersion, setNewVersion] = useState(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const { data } = await api.get('/version');
        const currentVersion = data.version;
        const savedVersion = localStorage.getItem(STORAGE_KEY);

        if (!savedVersion) {
          localStorage.setItem(STORAGE_KEY, currentVersion);
          return;
        }

        if (savedVersion !== currentVersion) {
          setNewVersion(currentVersion);
          setNeedsReload(true);
        }
      } catch {
        // Silencioso: no bloquear la app si el endpoint falla
      }
    };

    checkVersion();
    const interval = setInterval(checkVersion, CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    if (newVersion) localStorage.setItem(STORAGE_KEY, newVersion);
    window.location.reload();
  };

  if (!needsReload) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        bgcolor: 'warning.main',
        color: 'black',
        px: 2,
        py: 1,
        borderRadius: 2,
        boxShadow: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body2" fontWeight={700}>
        Hay una nueva versión disponible
      </Typography>
      <Button
        size="small"
        variant="contained"
        color="primary"
        onClick={handleReload}
        sx={{ fontWeight: 700 }}
      >
        Recargar
      </Button>
    </Box>
  );
}
