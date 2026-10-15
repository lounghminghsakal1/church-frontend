import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import WebSocket from 'next/dist/compiled/ws/index.js';

// Run against a production preview: npm run build, then next start -p 3101.
// Optional overrides: REQUEST_UI_ORIGIN and REQUEST_UI_BROWSER.
// All API and external requests are intercepted with sample responses.
const origin = process.env.REQUEST_UI_ORIGIN || 'http://localhost:3101';
const keepalive = setInterval(() => {}, 1000);
const output = mkdtempSync(join(tmpdir(), 'church-request-review-'));
const browser = spawn(process.env.REQUEST_UI_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-sandbox', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', `--user-data-dir=${join(output, 'profile')}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let ws;
let shuttingDown = false;
const pending = new Map();
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  const portFile = join(output, 'profile', 'DevToolsActivePort');
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await pause(100);
  assert.ok(existsSync(portFile), 'Chrome should start');
  const port = readFileSync(portFile, 'utf8').split('\n')[0];
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  ws = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let sequence = 0;
  const command = (method, params = {}) => shuttingDown ? Promise.resolve({}) : new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const types = ['baptism_requests', 'eucharist_requests', 'confession_requests', 'marriage_requests', 'confirmation_requests', 'aos_requests', 'mass_prayers', 'meeting_requests'];
  const fixtures = Object.fromEntries(types.map(type => [type, [0, 1, 2].map(index => ({
    _id: `test-${type}-${index}`, status: index === 2 ? 'approved' : 'pending', priest_response: index === 2 ? 'Please come to the parish office.' : '', createdAt: `2026-10-${12 + index}T05:30:00Z`,
    user: { user_name: ['Maria Joseph', 'Antony Thomas', 'Grace Peter'][index], user_mobile_number: '9000000000', family_card_document: index === 0 ? null : { file_path: 'uploads/family-card.pdf' } },
    child_name: ['Anna Joseph', 'Paul Thomas', 'Rose Peter'][index], father_name: 'Joseph', mother_name: 'Maria', child_date_of_birth: '2025-01-12', eucharist_person_name: 'Anna Joseph', confirmation_person_name: 'Anna Joseph', confession_person_name: 'Maria Joseph',
    groom_name: 'Antony Thomas', bride_name: 'Maria Joseph', groom_location: 'Illuppur', bride_location: 'Illuppur', groom_mobile_number: '9000000001', bride_mobile_number: '9000000002',
    patient_name: ['Joseph Antony', 'Mary Thomas', 'Grace Peter'][index], relationship_to_patient: 'Father', patient_condition: 'Recovering after surgery. Please visit for prayer and anointing.', patient_address: '12, Parish Street, Illuppur', contact_number: '9000000003', is_urgent: type === 'aos_requests' && index === 1,
    person_name: ['Maria Joseph', 'Antony Thomas', 'Grace Peter'][index], meeting_purpose: 'A conversation about preparation for the sacrament and the documents our family needs to bring.',
    ...Object.fromEntries(['preferred_baptism_date_and_time', 'preferred_eucharist_date_and_time', 'preferred_confession_date_and_time', 'preferred_marriage_date_and_time', 'preferred_visit_date_and_time', 'mass_prayer_date_and_time', 'preferred_meeting_date_and_time'].map(key => [key, '2026-11-01T02:30:00Z'])),
    payment: { payment_mode: 'online', amount: 250, payment_status: 'completed' }, mass_prayer_image: null,
  }))]));
  const posts = [];
  const announcements = [0, 1].map(index => ({
    _id: `preview-announcement-${index}`, title: index ? 'Parish gathering' : 'Parish feast celebration',
    description: 'Join our parish community for Mass, prayer, and fellowship.',
    image_url: '', link: '', start_date: '2020-01-01T00:00:00Z', end_date: '2099-01-01T00:00:00Z', status: 'active',
  }));
  let failCategory = false;
  let failReview = false;
  ws.onmessage = async event => {
    if (shuttingDown) return;
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id); pending.delete(message.id);
      if (message.error) task?.reject(new Error(JSON.stringify(message.error))); else task?.resolve(message.result);
      return;
    }
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    const requestUrl = new URL(request.url);
    const path = requestUrl.pathname;
    if (requestUrl.origin === origin && !path.startsWith('/api/')) {
      await command('Fetch.continueRequest', { requestId });
      return;
    }
    let data = { status: 'success', data: [] }, responseCode = 200;
    if (path.endsWith('/auth/priest/me')) data.data = { _id: 'preview-priest', priest_name: 'Antony', priest_email: 'preview@example.com' };
    else if (path.endsWith('/auth/user/me')) { responseCode = 401; data = { status: 'failure', message: 'Not signed in' }; }
    else if (request.method === 'OPTIONS') data = {};
    else if (request.method === 'GET' && /\/announcements(?:\/|$)/.test(path)) data.data = path.endsWith('/announcements') ? announcements : announcements.find(item => path.endsWith(item._id));
    else if (path.includes('/priest_availability/')) data.data = { _id: 'preview-availability', availability_status: 'available', available_until: '2099-01-01T00:00:00Z', priest: { priest_name: 'Antony' }, notes: 'Please request a meeting before visiting.' };
    else if (request.method === 'POST') { posts.push({ path, body: JSON.parse(request.postData) }); if (failReview) { failReview = false; responseCode = 503; data = { status: 'failure', message: 'Could not save. Please try again.' }; } else data = { status: 'success', message: 'Saved' }; }
    else {
      const type = path.split('/').at(-1);
      if (failCategory && type === 'mass_prayers') { responseCode = 503; data = { status: 'failure', message: 'Temporarily unavailable' }; }
      else data.data = fixtures[type] || [];
    }
    await command('Fetch.fulfillRequest', { requestId, responseCode, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: origin }, { name: 'Access-Control-Allow-Credentials', value: 'true' }, { name: 'Access-Control-Allow-Headers', value: 'content-type' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' }], body: Buffer.from(JSON.stringify(data)).toString('base64') });
  };
  const evaluate = async expression => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const wait = async expression => { for (let i = 0; i < 150; i++) { if (await evaluate(`Boolean(${expression})`)) return; await pause(100); } throw new Error(`Timed out: ${expression}`); };
  const click = async (selector, text) => evaluate(`Array.from(document.querySelectorAll(${JSON.stringify(selector)})).find(element => element.textContent.includes(${JSON.stringify(text)}))?.click()`);
  const navigate = async route => {
    await command('Page.navigate', { url: `${origin}${route}` });
    await wait(`document.querySelector('[data-testid=request-workspace]') && !document.querySelector('[data-testid=request-loading]') && !document.querySelector('[data-testid=request-count-skeleton]')`);
  };
  const screenshot = async name => { const result = await command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); writeFileSync(join(output, name), Buffer.from(result.data, 'base64')); };
  await command('Page.enable'); await command('Runtime.enable');
  await command('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await command('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await navigate('/priest_dashboard/requests');
  assert.equal(await evaluate(`document.querySelectorAll('[data-testid=request-category-card]').length`), 8);
  assert.equal(await evaluate(`document.querySelector('[data-testid=request-summary] strong').textContent`), '16');
  await screenshot('overview-desktop.png');
  failCategory = true; await click('[data-testid=request-page-heading] button', 'Refresh');
  await wait(`document.querySelector('[data-testid=request-alert]') && !document.querySelector('[data-testid=request-page-heading] button').disabled`);
  assert.equal(await evaluate(`document.querySelectorAll('[data-testid=request-category-card]').length`), 8);
  assert.equal(await evaluate(`document.querySelector('[data-testid=request-summary] strong').textContent`), '14+');
  failCategory = false;
  console.log('PASS: Overview totals, eight categories, and partial failure.');
  await navigate('/priest_dashboard/requests/baptism_requests');
  await wait(`document.querySelectorAll('[data-testid=request-record]').length === 2`);
  await click('[data-testid=request-record] button', 'Review request');
  await click('[data-testid=request-review-actions] button', 'Approve');
  await wait(`document.querySelector('[data-testid=request-field-error]')`);
  assert.equal(posts.length, 0);
  await evaluate(`(() => { const input = document.querySelector('[data-testid=request-review-panel] textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'Please arrive at 8 am with the required documents.'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  await click('[data-testid=request-record-summary] button', 'Close details'); await click('[data-testid=request-record] button', 'Review request');
  assert.equal(await evaluate(`document.querySelector('[data-testid=request-review-panel] textarea').value`), 'Please arrive at 8 am with the required documents.');
  await click('[data-testid=request-page-heading] button', 'Refresh'); await wait(`!document.querySelector('[data-testid=request-page-heading] button').disabled`);
  assert.equal(await evaluate(`document.querySelector('[data-testid=request-review-panel] textarea').value`), 'Please arrive at 8 am with the required documents.');
  await screenshot('review-desktop.png');
  await click('[data-testid=request-review-actions] button', 'Approve'); assert.equal(posts.length, 0);
  await wait(`document.activeElement.textContent.includes('Send approval')`);
  await click('[data-testid=request-confirm-decision] button', 'Send approval'); await wait(`document.querySelector('[data-testid=request-success]')`);
  assert.equal(posts.length, 1); assert.equal(posts[0].path, '/api/priest/baptism_requests/test-baptism_requests-0');
  assert.deepEqual(posts[0].body, { status: 'approved', priest_response: 'Please arrive at 8 am with the required documents.' });
  assert.equal(await evaluate(`document.querySelectorAll('[data-testid=request-record]').length`), 1);
  await click('[data-testid=request-success] button', 'View response'); await wait(`document.querySelector('[data-testid=request-sent-response]')`);
  console.log('PASS: Required response, draft persistence, confirmation, approval payload, reviewed view.');
  for (const type of types) {
    await navigate(`/priest_dashboard/requests/${type === 'aos_requests' ? 'anointing_of_the_sick_requests' : type}`);
    await wait(`document.querySelectorAll('[data-testid=request-record]').length === 2`);
    if (type === 'aos_requests') assert.ok(await evaluate(`document.querySelector('[data-testid=request-record]').dataset.urgent === 'true'`));
    await click('[data-testid=request-record] button', 'Review request'); await wait(`document.querySelector('[data-testid=request-details-panel]')`);
    if (['eucharist_requests', 'marriage_requests', 'confirmation_requests'].includes(type)) assert.ok(await evaluate(`document.querySelector('[data-testid=request-attachment]').textContent.includes('No family card document provided')`));
    if (type === 'eucharist_requests') {
      await click('[data-testid=request-record-summary] button', 'Close details');
      await evaluate(`document.querySelectorAll('[data-testid=request-record-summary] button')[1].click()`);
      await click('[data-testid=request-attachment] button', 'View document');
      await wait(`document.querySelector('dialog[open]')`);
      assert.ok(await evaluate(`document.querySelector('dialog iframe').src.endsWith('/api/uploads/family-card.pdf')`));
      await evaluate(`document.querySelector('dialog button[aria-label="Close document"]').click()`);
    }
    if (type === 'mass_prayers') {
      assert.ok(await evaluate(`document.querySelector('[data-testid=request-payment]').textContent.includes('250')`));
      await evaluate(`(() => { const input = document.querySelector('[data-testid=request-review-panel] textarea'); Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(input, 'Please contact the parish office to arrange another time.'); input.dispatchEvent(new Event('input', { bubbles: true })); })()`);
      failReview = true;
      await click('[data-testid=request-review-actions] button', 'Reject'); await click('[data-testid=request-confirm-decision] button', 'Send rejection');
      await wait(`document.querySelector('[data-testid=request-field-error]')`);
      assert.equal(await evaluate(`document.querySelector('[data-testid=request-review-panel] textarea').value`), 'Please contact the parish office to arrange another time.');
      await click('[data-testid=request-review-actions] button', 'Reject'); await click('[data-testid=request-confirm-decision] button', 'Send rejection');
      await wait(`document.querySelector('[data-testid=request-success]')`);
      assert.equal(posts.at(-1).path, '/api/priest/mass_prayer_requests/test-mass_prayers-0');
      assert.equal(posts.at(-1).body.status, 'rejected');
    }
  }
  console.log('PASS: Eight review screens, urgent ordering, absent family cards, Mass payment details.');
  await command('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate('/priest_dashboard/requests/anointing_of_the_sick_requests'); await click('[data-testid=request-record] button', 'Review request');
  await wait(`document.querySelector('[data-testid=request-details-panel]')`);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Mobile should not overflow horizontally');
  await screenshot('review-mobile.png');
  await evaluate(`document.querySelector('[data-testid=request-review-panel]').scrollIntoView({ block: 'start' })`);
  await pause(700); // Allow the site's smooth scrolling to settle before capture.
  await screenshot('response-mobile.png');
  await command('Page.navigate', { url: `${origin}/` });
  await wait(`document.querySelector('[data-testid=announcement-feature]')`);
  assert.ok(await evaluate(`document.querySelector('#announcements').textContent.includes('Parish feast celebration')`));
  assert.ok(await evaluate(`!document.querySelector('#announcements').textContent.includes('Sign in')`));
  await click('[data-testid=announcement-feature] button', 'Read announcement');
  await wait(`document.querySelector('[data-testid=announcement-dialog][open]')`);
  assert.ok(await evaluate(`document.body.classList.contains('overflow-hidden')`));
  await screenshot('announcement-details-mobile.png');
  await evaluate(`document.querySelector('[data-testid=announcement-dialog] button[aria-label="Close dialog"]').click()`);
  await wait(`!document.body.classList.contains('overflow-hidden')`);
  await evaluate(`document.querySelector('button[aria-label="Next announcement"]').click()`);
  await wait(`document.querySelector('[data-testid=announcement-feature]').textContent.includes('Parish gathering')`);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Home page should not overflow horizontally');
  await command('Page.navigate', { url: `${origin}/priest_dashboard/announcements` });
  await wait(`document.querySelectorAll('[data-testid=announcement-admin-card]').length === 2`);
  await click('[data-testid=announcement-admin] button', 'New announcement');
  await wait(`document.querySelector('[data-testid=announcement-form] input[name=title]')`);
  assert.ok(await evaluate(`parseFloat(getComputedStyle(document.querySelector('input[name=title]')).height) >= 48`));
  await screenshot('announcement-editor-mobile.png');
  await evaluate(`document.querySelector('[data-testid=announcement-dialog] button[aria-label="Close dialog"]').click()`);
  await command('Page.navigate', { url: `${origin}/` });
  await wait(`document.querySelector('button[aria-label="Sign in to your parish account"]')`);
  await evaluate(`document.querySelector('button[aria-label="Sign in to your parish account"]').click()`);
  await wait(`document.querySelector('[role=dialog] input[autocomplete=email]')`);
  assert.ok(await evaluate(`document.body.classList.contains('overflow-hidden')`));
  await screenshot('user-signin-mobile.png');
  await command('Page.navigate', { url: `${origin}/priest_login` });
  await wait(`document.querySelector('input[autocomplete=current-password]')`);
  assert.ok(await evaluate(`document.documentElement.scrollWidth <= window.innerWidth`), 'Priest sign-in should not overflow');
  await screenshot('priest-signin-mobile.png');
  await command('Page.navigate', { url: `${origin}/priest_dashboard` });
  await wait(`document.querySelector('input[name=priest-availability]:checked')`);
  assert.ok(await evaluate(`document.querySelector('[data-checked=true]') !== null`));
  await screenshot('availability-mobile.png');
  console.log('PASS: User sign-in, priest sign-in, availability editor, and modal scroll locking.');
  console.log('PASS: Anonymous announcements, carousel, details dialog, and priest editor.');
  console.log(`PASS: Mobile layout. Screenshots: ${output}`);
} finally {
  shuttingDown = true;
  for (const task of pending.values()) task.resolve({});
  pending.clear();
  ws?.terminate(); browser.kill(); clearInterval(keepalive);
}
