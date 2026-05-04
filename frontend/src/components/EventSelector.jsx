import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, Chip, Box } from '@mui/material';
import { useEvent } from '../context/EventContext';

export default function EventSelector({ onlyApproved = false, sx = {} }) {
  const { events, selectedEventId, setSelectedEventId, approvedEvents, myPayments } = useEvent();

  const visible = onlyApproved
    ? events.filter((e) => approvedEvents.includes(e.id))
    : events;

  if (visible.length <= 1) return null;

  return (
    <FormControl size="small" sx={{ minWidth: 200, ...sx }}>
      <InputLabel>Evento</InputLabel>
      <Select
        value={selectedEventId || ''}
        label="Evento"
        onChange={(e) => setSelectedEventId(Number(e.target.value))}
      >
        {visible.map((ev) => {
          const pay = myPayments.find((p) => p.event_id === ev.id);
          return (
            <MenuItem key={ev.id} value={ev.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {ev.nombre}
                {pay && (
                  <Chip
                    label={pay.status}
                    size="small"
                    color={pay.status === 'aprobado' ? 'success' : pay.status === 'pendiente' ? 'warning' : 'error'}
                    sx={{ height: 16, fontSize: 10 }}
                  />
                )}
              </Box>
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}
