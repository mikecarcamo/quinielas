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
 * Devuelve true si el partido ya cerró (faltan menos de 2 horas para el inicio).
 * El cálculo se hace en GMT-6 (Guatemala).
 * @param {string} fecha - formato YYYY-MM-DD
 * @param {string} hora  - formato HH:MM (opcional, default '00:00')
 */
export function isPastDeadline(fecha, hora = '00:00') {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = (hora || '00:00').split(':').map(Number);
  const matchDate = new Date(year, month - 1, day, hours, minutes);
  const diffMs = matchDate.getTime() - now.getTime();
  return diffMs < 2 * 60 * 60 * 1000; // menos de 2 horas = cerrado
}
