import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../src/utils/announcements.js', import.meta.url), 'utf8');
const { announcementVisibility, parishInputDate, parishInputToISO, safeAnnouncementUrl, parishDate } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('visibility includes both boundaries and inactive always stays hidden', () => {
  const item = { status: 'active', start_date: '2026-11-01T02:30:00Z', end_date: '2026-11-08T17:30:00Z' };
  const start = Date.parse(item.start_date);
  const end = Date.parse(item.end_date);
  assert.equal(announcementVisibility(item, start - 1), 'Scheduled');
  assert.equal(announcementVisibility(item, start), 'Visible');
  assert.equal(announcementVisibility(item, end), 'Visible');
  assert.equal(announcementVisibility(item, end + 1), 'Expired');
  for (const now of [start - 1, start, end, end + 1]) assert.equal(announcementVisibility({ ...item, status: 'inactive' }, now), 'Inactive');
  assert.equal(announcementVisibility({ ...item, end_date: item.start_date }, start), 'Visible');
});

test('parish inputs convert explicitly to IST across date and year boundaries', () => {
  assert.equal(parishInputDate('2026-10-31T20:00:00Z'), '2026-11-01T01:30:00');
  assert.equal(parishInputDate('2026-12-31T18:30:00Z'), '2027-01-01T00:00:00');
  assert.equal(parishInputToISO('2026-11-01T08:00'), '2026-11-01T02:30:00.000Z');
  assert.equal(parishInputToISO('2027-01-01T00:00:30'), '2026-12-31T18:30:30.000Z');
  assert.equal(parishInputToISO(parishInputDate('2026-11-01T02:30:45Z')), '2026-11-01T02:30:45.000Z');
  assert.match(parishDate('2026-12-31T18:30:00Z'), /2027/);
  assert.throws(() => parishInputToISO('invalid'));
});

test('external links accept HTTP(S) only and retain returned media URLs unchanged', () => {
  for (const value of ['', 'javascript:alert(1)', 'data:image/png;base64,aaa', 'blob:https://example.com/test', '//example.com/image.jpg', '/image.jpg', 'not a URL']) assert.equal(safeAnnouncementUrl(value), '');
  const url = 'https://cdn.example.com/public/announcements/image.jpg?key=a%2Fb';
  assert.equal(safeAnnouncementUrl(url), url);
  assert.equal(safeAnnouncementUrl('http://example.com'), 'http://example.com');
});
