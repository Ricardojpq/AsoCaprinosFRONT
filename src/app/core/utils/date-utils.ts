/**
 * Utilidades de fecha compartidas para todo el frontend.
 *
 * REGLA: Para campos tipo `date` (sin hora) del backend, usar SIEMPRE
 * parseDateLocal() en lugar de `new Date(str)` para evitar desfase de timezone.
 * Para enviar fechas al backend, usar formatDateLocal() en lugar de
 * `toISOString().split('T')[0]`.
 */

/** Convierte 'YYYY-MM-DD' → Date en hora local (sin desfase UTC). */
export function parseDateLocal(dateStr: string): Date {
  const parts = dateStr.split('-');
  return new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
}

/** Convierte Date → 'YYYY-MM-DD' en hora local. */
export function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula edad en { years, months, days } a partir de fecha de nacimiento.
 * Solo para uso en selección/edición individual (NO en listados masivos).
 */
export function calcularEdad(fecNacim: string | Date): { years: number; months: number; days: number } {
  const nacimiento = typeof fecNacim === 'string' ? parseDateLocal(fecNacim) : fecNacim;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  nacimiento.setHours(0, 0, 0, 0);

  let years = hoy.getFullYear() - nacimiento.getFullYear();
  let months = hoy.getMonth() - nacimiento.getMonth();
  let days = hoy.getDate() - nacimiento.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
}

/** Formatea la edad como string legible: "2 años 3 meses 5 días" */
export function formatEdad(fecNacim: string | Date): string {
  const { years, months, days } = calcularEdad(fecNacim);
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} año${years !== 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} mes${months !== 1 ? 'es' : ''}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} día${days !== 1 ? 's' : ''}`);
  return parts.join(' ');
}
