export function safeAnnouncementUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? value : '';
  } catch { return ''; }
}

export function announcementVisibility(item, now = Date.now()) {
  if (item.status === 'inactive') return 'Inactive';
  if (now < new Date(item.start_date).getTime()) return 'Scheduled';
  if (now > new Date(item.end_date).getTime()) return 'Expired';
  return 'Visible';
}

export function parishDate(value) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

// datetime-local fields always represent parish time, regardless of device timezone.
export function parishInputDate(value) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}`;
}

export function parishInputToISO(value) {
  return new Date(`${value}+05:30`).toISOString();
}
