import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const EventContext = createContext(null);

export function EventProvider({ children }) {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);          // todos los eventos activos
  const [myPayments, setMyPayments] = useState([]);  // pagos del usuario
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    const p1 = api.get('/events').then((r) => setEvents(r.data)).catch(() => {});
    const p2 = user
      ? api.get('/payments/my-events').then((r) => setMyPayments(r.data)).catch(() => {})
      : Promise.resolve();
    Promise.all([p1, p2]).finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    reload();
  }, [user]);

  // Cuando se cargan pagos, seleccionar automáticamente el primer evento con pago aprobado
  useEffect(() => {
    if (loading) return;
    const approved = myPayments.filter((p) => p.status === 'aprobado');
    if (approved.length > 0 && !selectedEventId) {
      setSelectedEventId(approved[0].event_id);
    } else if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [myPayments, events, loading]);

  const paymentForEvent = (eventId) => myPayments.find((p) => p.event_id === eventId) || null;
  const approvedEvents = myPayments.filter((p) => p.status === 'aprobado').map((p) => p.event_id);
  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <EventContext.Provider value={{
      events, myPayments, selectedEventId, setSelectedEventId,
      selectedEvent, paymentForEvent, approvedEvents, loading, reload,
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}
