// YYYY-MM-DD in the browser's time zone. toISOString() converts to UTC first,
// which in UTC+7 turns Oct 1 00:00 into "2026-09-30".
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const startOfMonth = (d = new Date()) => localDate(new Date(d.getFullYear(), d.getMonth(), 1));
