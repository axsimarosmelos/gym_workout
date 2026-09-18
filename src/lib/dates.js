// Local calendar dates for records; UTC timestamps only for chart coordinates.
export function today() {
  return dateKey(new Date());
}
export function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function parseDay(day) {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}
export function validDay(day) {
  return typeof day === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(day)
    && day >= '1900-01-01' && day <= '2200-12-31'
    && dateKey(parseDay(day)) === day;
}
export function addDays(day, amount) {
  const date = parseDay(day);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}
export function addMonths(day, amount) {
  const date = parseDay(day);
  const originalDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + amount);
  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(originalDay, last));
  return dateKey(date);
}
export function stamp(day) {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}
export function prettyDay(day, options = { month: 'short', day: 'numeric' }) {
  return parseDay(day).toLocaleDateString(undefined, options);
}
export function sixMonths(start) {
  return Array.from({ length: 6 }, (_, i) => ({ start: addMonths(start, i), end: addDays(addMonths(start, i + 1), -1) }));
}
export function number(value, digits = 1) {
  return value == null ? '—' : Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
}
