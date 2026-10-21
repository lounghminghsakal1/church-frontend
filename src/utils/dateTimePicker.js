const pad = number => String(number).padStart(2, '0');

export function dateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseCalendarDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function parishClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function pickerValue(date, hour, minute, period, second) {
  if (!parseCalendarDate(date) || !['AM', 'PM'].includes(period) || !/^\d{1,2}$/.test(hour) || Number(hour) < 1 || Number(hour) > 12 || !/^\d{1,2}$/.test(minute) || Number(minute) > 59) return '';
  if (second != null && (!/^\d{1,2}$/.test(second) || Number(second) > 59)) return '';
  const hour24 = Number(hour) % 12 + (period === 'PM' ? 12 : 0);
  return `${date}T${pad(hour24)}:${pad(Number(minute))}${second != null ? `:${pad(Number(second))}` : ''}`;
}

export function withinPickerBounds(value, min, max, dateOnly = false) {
  if (!parseCalendarDate(value)) return false;
  if (!dateOnly && !/T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return false;
  const normalize = text => dateOnly ? text.slice(0, 10) : `${text.slice(0, 10)}T${text.slice(11, 16) || '00:00'}:${text.slice(17, 19) || '00'}`;
  const candidate = normalize(value);
  return (!min || candidate >= normalize(min)) && (!max || candidate <= normalize(max));
}

export function formatPickerValue(value, dateOnly = false, seconds = false) {
  const date = parseCalendarDate(value);
  if (!date) return '';
  const day = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  if (dateOnly) return day;
  const match = /T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value);
  if (!match) return day;
  const hour = Number(match[1]);
  return `${day} · ${hour % 12 || 12}:${match[2]}${seconds ? `:${match[3] || '00'}` : ''} ${hour >= 12 ? 'PM' : 'AM'}`;
}
