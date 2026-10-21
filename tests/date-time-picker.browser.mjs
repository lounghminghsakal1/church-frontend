import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';
import WebSocket from 'next/dist/compiled/ws/index.js';

// Check all page routes, populated forms, review panels and dialogs at five viewport sizes.
// Run against a production preview: npm run build, then next start -p 3101.
// MOBILE_UI_SIZES optionally accepts JSON pairs, e.g. [[320,568],[844,390]].
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
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 45000);
    pending.set(id, { method, resolve: value => { clearTimeout(timer); resolve(value); }, reject });
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
    payment: { payment_mode: index === 0 ? 'offline' : 'online', amount: 250, payment_status: 'completed' }, mass_prayer_image: null,
  }))]));
  let userSignedIn = true;
  const posts = [];
  const announcements = [0, 1].map(index => ({
    _id: `preview-announcement-${index}`, title: index ? 'Parish gathering' : 'Parish feast celebration',
    description: 'Join our parish community for Mass, prayer, and fellowship.',
    image_url: index === 0 ? `${origin}/images/church/st-antony-banner.webp` : '', link: '', start_date: '2020-01-01T00:00:00Z', end_date: '2099-01-01T00:00:00Z', status: 'active',
  }));
  let failCategory = false;
  let failReview = false;
  ws.onmessage = async event => {
    if (shuttingDown) return;
    const message = JSON.parse(event.data);
    if (message.id) {
      const task = pending.get(message.id); pending.delete(message.id);
      if (message.error && task?.method.startsWith('Fetch.') && /Invalid InterceptionId/i.test(message.error.message)) task.resolve({});
      else if (message.error) task?.reject(new Error(JSON.stringify(message.error))); else task?.resolve(message.result);
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
    if (path.endsWith('/auth/priest/me')) data.data = { _id: 'preview-priest', priest_name: 'Antony Joseph Arulraj', priest_email: 'antony.joseph.arulraj@parish.example.org' };
    else if (path.endsWith('/auth/user/me') && !userSignedIn) { responseCode=401;data={status:'failure',message:'Not signed in'}; }
    else if (path.endsWith('/auth/user/me')) data.data = { _id:'preview-user', user_name:'Maria Joseph Arulraj',user_email:'maria.joseph.arulraj@parish.example.org',user_mobile_number:'9000000000',spouse_name:'Joseph Antony Arulraj',address:'12, St. Antony Church Street, Illuppur, Tamil Nadu',prayer_group:'St.Antony prayer group',church_organizations:['Vincent de paul organization','Younger services group'],family_card_document:{file_path:'uploads/family-card.pdf',file_name:'Arulraj-family-card-document.pdf',verification_status:'verified'} };
    else if (request.method === 'OPTIONS') data = {};
    else if (request.method === 'GET' && /\/announcements(?:\/|$)/.test(path)) data.data = path.endsWith('/announcements') ? announcements : announcements.find(item => path.endsWith(item._id));
    else if (request.method === 'GET' && path.includes('/priest_availability/')) data.data = { _id: 'preview-availability', availability_status: 'available', available_until: '2099-01-01T00:00:00Z', priest: { priest_name: 'Antony' }, notes: 'Please request a meeting before visiting.' };
    else if (request.method === 'PUT' && path.includes('/priest_availability/')) { const body=JSON.parse(request.postData);posts.push({path,body,method:'PUT'});data.data={_id:'preview-availability',...body,priest:{priest_name:'Antony'}}; }
    else if (request.method === 'POST') { posts.push({ path, body: JSON.parse(request.postData) }); if (failReview) { failReview = false; responseCode = 503; data = { status: 'failure', message: 'Could not save. Please try again.' }; } else data = { status: 'success', message: 'Saved' }; }
    else {
      const type = path.split('/').at(-1);
      if (failCategory && type === 'mass_prayers') { responseCode = 503; data = { status: 'failure', message: 'Temporarily unavailable' }; }
      else { const alias = {baptism_request:'baptism_requests',eucharist_request:'eucharist_requests',confession_request:'confession_requests',confirmation_request:'confirmation_requests',marriage_request:'marriage_requests',aos_request:'aos_requests',mass_prayer:'mass_prayers',meeting_request:'meeting_requests'}; data.data = fixtures[alias[type] || type] || []; }
    }
    await command('Fetch.fulfillRequest', { requestId, responseCode, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }, { name: 'Access-Control-Allow-Origin', value: origin }, { name: 'Access-Control-Allow-Credentials', value: 'true' }, { name: 'Access-Control-Allow-Headers', value: 'content-type' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,PATCH,OPTIONS' }], body: Buffer.from(JSON.stringify(data)).toString('base64') });
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
  const editInput = async (selector,value) => evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});const proto=el instanceof HTMLTextAreaElement?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,${JSON.stringify(value)});el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
  const select = async (selector,value) => evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(String(value))};el.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  const open = async selector => {
    await pause(400);
    const point=await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
    await command('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',clickCount:1,...point});
    await command('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',clickCount:1,...point});
    try { await wait(`document.querySelector('[data-testid=date-time-dialog][open]')`); } catch(error) { console.log(await evaluate(`({body:document.body.innerText,dialogs:document.querySelectorAll('dialog').length})`));await screenshot('picker-open-failure.png');throw error; }
    assert.ok(await evaluate(`(() => {const r=document.querySelector('[data-testid=date-time-dialog]').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth+1&&r.top>=0&&r.bottom<=innerHeight+1})()`),'Picker fits viewport');
  };
  const calendar = async(year,month,day)=>{
    await select('[aria-label="Calendar year"]',year);
    await select('[aria-label="Calendar month"]',month-1);
    const date=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    await wait(`document.querySelector('[data-date="${date}"]')`);
    await evaluate(`document.querySelector('[data-date="${date}"]').click()`);
  };
  const time = async(hour,minute,period,second)=>{
    await editInput('[data-testid=date-time-dialog] input[aria-label=Hour]',hour);
    await editInput('[data-testid=date-time-dialog] input[aria-label=Minute]',minute);
    if(second!=null)await editInput('[data-testid=date-time-dialog] input[aria-label=Second]',second);
    await click('[aria-label="Time period"] button',period);
  };
  const apply = async()=>{await evaluate(`document.querySelector('[data-testid=date-time-apply]').click()`);await wait(`!document.querySelector('[data-testid=date-time-dialog]')`);};
  const escape = async()=>{
    await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await wait(`!document.querySelector('[data-testid=date-time-dialog]')`);
  };
  await command('Emulation.setDeviceMetricsOverride',{width:320,height:497,deviceScaleFactor:1,mobile:true});
  await command('Page.navigate',{url:origin+'/applications/meeting_request/apply'});
  await wait(`document.querySelector('[data-testid=date-time-trigger]')`);
  await open('[data-testid=date-time-trigger]');
  await select('[aria-label="Calendar year"]',2030);await select('[aria-label="Calendar month"]',10);
  await screenshot('calendar-320.png');
  await calendar(2030,11,3);await time('07','05','PM');await screenshot('time-320.png');await apply();
  const chosen=await evaluate(`document.querySelector('[data-testid=date-time-trigger]').textContent`);
  assert.ok(chosen.includes('3 Nov 2030')&&chosen.includes('7:05 PM'));
  await open('[data-testid=date-time-trigger]');await calendar(2030,11,4);await time('09','00','AM');await click('[data-testid=date-time-dialog] button','Cancel');
  await wait(`!document.querySelector('[data-testid=date-time-dialog]')`);
  assert.equal(await evaluate(`document.querySelector('[data-testid=date-time-trigger]').textContent`),chosen,'Cancel preserves committed value');
  await open('[data-testid=date-time-trigger]');await escape();
  assert.ok(await evaluate(`document.activeElement.matches('[data-testid=date-time-trigger]')`),'Focus returns to trigger');
  await editInput('#parish-content input:not([type=hidden]):not([type=file])','Maria Joseph');
  await editInput('#parish-content textarea','A conversation about sacrament preparation.');
  await click('#parish-content button','Submit Request');
  await wait(`document.body.textContent.includes('Meeting Request')`);
  for(let i=0;i<50&&!posts.length;i++)await pause(50);
  assert.equal(posts[0].path,'/api/user/meeting_request');
  assert.equal(posts[0].body.preferred_meeting_date_and_time,'2030-11-03T19:05');
  console.log('PASS: Mobile time selection, draft cancellation, Escape/focus return, and unchanged meeting API format.');

  await command('Page.navigate',{url:origin+'/applications/baptism_request/apply'});await wait(`document.querySelector('[data-testid=date-time-trigger]')`);
  await open('[data-testid=date-time-trigger]');await calendar(2024,2,29);await apply();
  assert.ok(await evaluate(`document.querySelector('[data-testid=date-time-trigger]').textContent.includes('29 Feb 2024')`));
  await open('[data-testid=date-time-trigger]');
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});
  await wait(`document.activeElement.getAttribute('data-date')==='2024-03-01'`);
  await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await command('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});
  await wait(`document.querySelector('[data-date="2024-03-01"][aria-selected=true]')`);
  await apply();
  assert.ok(await evaluate(`document.querySelector('[data-testid=date-time-trigger]').textContent.includes('1 Mar 2024')`));
  console.log('PASS: Birth-date picker, leap day, month/year navigation, and calendar keyboard navigation.');

  await command('Page.navigate',{url:origin+'/priest_dashboard/announcements'});await wait(`document.querySelector('[data-testid=announcement-admin-card]')`);
  await click('[data-testid=announcement-admin] button','New announcement');await wait(`document.querySelector('[data-testid=announcement-form]')`);
  await open('[data-testid=announcement-form-dates] label:first-child [data-testid=date-time-trigger]');await escape();
  assert.ok(await evaluate(`document.querySelector('[data-testid=announcement-dialog][open]') && document.body.classList.contains('overflow-hidden')`),'Escape closes the nested picker, preserving its parent dialog');
  await open('[data-testid=announcement-form-dates] label:first-child [data-testid=date-time-trigger]');
  await calendar(2030,11,3);await time('07','05','PM','09');await apply();
  assert.equal(await evaluate(`document.querySelector('input[name=start_date]').value`),'2030-11-03T19:05:09');
  await open('[data-testid=announcement-form-dates] label:last-child [data-testid=date-time-trigger]');
  assert.ok(await evaluate(`document.querySelector('[data-date="2030-11-02"]').disabled`),'Dates before minimum are disabled');
  await calendar(2030,11,3);await time('07','05','PM','08');
  assert.ok(await evaluate(`document.querySelector('[data-testid=date-time-apply]').disabled`),'Same-day time before the minimum cannot be applied');
  await time('07','05','PM','09');assert.ok(await evaluate(`!document.querySelector('[data-testid=date-time-apply]').disabled`),'Exact minimum is valid');
  await click('[role=tab]','Date');await calendar(2030,11,5);await time('08','10','PM','11');await apply();
  await editInput('input[name=title]','Parish schedule test');await editInput('textarea[name=description]','A sample announcement for checking the date picker.');
  await click('[data-testid=announcement-form-actions] button','Create announcement');
  for(let i=0;i<50&&!posts.some(post=>post.path==='/api/priest/announcements');i++)await pause(50);
  const notice=posts.find(post=>post.path==='/api/priest/announcements');
  assert.equal(notice.body.start_date,'2030-11-03T13:35:09.000Z');assert.equal(notice.body.end_date,'2030-11-05T14:40:11.000Z');
  console.log('PASS: Nested dialog, date/time minimums, seconds, and existing IST-to-ISO announcement payload.');

  await command('Page.navigate',{url:origin+'/priest_dashboard'});await wait(`document.querySelector('input[name=priest-availability]:checked') && document.querySelector('[data-testid=date-time-trigger]')`);
  await open('[data-testid=date-time-trigger]');await calendar(2030,11,6);await time('06','45','AM');await apply();
  await click('main button','Publish availability');
  for(let i=0;i<50&&!posts.some(post=>post.method==='PUT');i++)await pause(50);
  const availability=posts.find(post=>post.method==='PUT');
  assert.equal(availability.path,'/api/priest_availability/preview-availability');assert.equal(availability.body.available_until,'2030-11-06T01:15:00.000Z');assert.equal(availability.body.next_available,null);
  console.log('PASS: Priest availability picker retains its existing IST-to-ISO API payload.');

  for(const [width,height] of [[390,844],[844,390],[1280,800]]){
    await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
    await command('Page.navigate',{url:origin+'/applications/meeting_request/apply'});await wait(`document.querySelector('[data-testid=date-time-trigger]')`);
    await open('[data-testid=date-time-trigger]');await calendar(2030,11,3);await time('06','30','AM');
    assert.ok(await evaluate(`document.documentElement.scrollWidth<=innerWidth`));await screenshot(`picker-${width}.png`);await apply();
  }
  console.log(`PASS: Picker at phone, landscape and desktop sizes. Screenshots: ${output}`);
} finally {
  shuttingDown=true;for(const task of pending.values())task.resolve({});pending.clear();ws?.terminate();browser.kill();clearInterval(keepalive);
}
