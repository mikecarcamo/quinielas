const TZ = 'America/Guatemala';

/**
 * Formatea una fecha (string YYYY-MM-DD o Date) en zona horaria de Guatemala.
 * @param {string|Date} fecha
 * @param {object} options - opciones de Intl.DateTimeFormat (mismas que toLocaleDateString)
 */
export function formatDate(fecha, options = { weekday: 'short', day: '2-digit', month: 'short' }) {
  const d = typeof fecha === 'string' ? new Date(fecha + 'T12:00:00') : fecha;
  return d.toLocaleDateString('es-GT', { timeZone: TZ, ...options });
}

/**
 * Formatea fecha y hora en zona horaria de Guatemala.
 */
export function formatDateTime(fecha, options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) {
  const d = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return d.toLocaleString('es-GT', { timeZone: TZ, ...options });
}

/**
 * Devuelve true si la fecha del partido ya pasó el deadline (menos de 1 día de anticipación).
 * El cálculo se hace en GMT-6 (Guatemala).
 */
export function isPastDeadline(fecha) {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + 1);
  return new Date(fecha + 'T00:00:00') < deadline;
}
