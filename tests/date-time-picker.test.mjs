import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/utils/dateTimePicker.js', import.meta.url), 'utf8');
const { parseCalendarDate, pickerValue, withinPickerBounds, parishClock, formatPickerValue } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('calendar rejects impossible dates and accepts leap days', () => {
  assert.equal(parseCalendarDate('2026-02-29'), null);
  assert.equal(parseCalendarDate('2026-13-01'), null);
  assert.equal(parseCalendarDate('2026-04-31'), null);
  assert.equal(parseCalendarDate('invalid'), null);
  assert.equal(parseCalendarDate('2024-02-29').getDate(), 29);
});

test('12-hour entry preserves the local API format and optional seconds', () => {
  assert.equal(pickerValue('2026-11-01', '12', '00', 'AM'), '2026-11-01T00:00');
  assert.equal(pickerValue('2026-11-01', '12', '00', 'PM'), '2026-11-01T12:00');
  assert.equal(pickerValue('2026-11-01', '7', '5', 'PM', '9'), '2026-11-01T19:05:09');
  for (const [hour, minute, second] of [['0', '00', '00'], ['13', '00', '00'], ['1', '60', '00'], ['1', '00', '60'], ['', '00', '00']]) assert.equal(pickerValue('2026-11-01', hour, minute, 'AM', second), '');
});

test('minimum and maximum bounds include the exact boundary and reject invalid times', () => {
  const min = '2026-11-01T09:30:00', max = '2026-11-02T12:00:00';
  assert.ok(withinPickerBounds('2026-11-01T09:30', min, max));
  assert.ok(withinPickerBounds('2026-11-02T12:00', min, max));
  assert.equal(withinPickerBounds('2026-11-01T09:29', min, max), false);
  assert.equal(withinPickerBounds('2026-11-02T12:00:01', min, max), false);
  assert.equal(withinPickerBounds('2026-11-01T25:00', min, max), false);
  assert.ok(withinPickerBounds('2026-11-01', '2026-11-01', '2026-11-02', true));
});

test('parish clock is IST and display does not convert chosen wall-clock values', () => {
  assert.equal(parishClock(new Date('2026-12-31T20:00:00Z')), '2027-01-01T01:30');
  assert.match(formatPickerValue('2026-11-01T00:05:09', false, true), /12:05:09 AM/);
  assert.match(formatPickerValue('2026-11-01T19:05'), /7:05 PM/);
  assert.equal(formatPickerValue('not-a-date'), '');
});
