export function getAvailabilitySchedule(data, now) {
  const available = data?.availability_status === 'available';
  const busy = data?.availability_status === 'not_available';
  const dateValue = available ? data?.available_until : busy ? data?.next_available : null;
  const date = dateValue ? new Date(dateValue) : null;
  const validDate = !!date && Number.isFinite(date.getTime());
  const expired = validDate && now != null && date.getTime() <= now;
  return { available, busy, date, validDate, expired };
}
