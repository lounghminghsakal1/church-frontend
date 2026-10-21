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
    else if (path.includes('/priest_availability/')) data.data = { _id: 'preview-availability', availability_status: 'available', available_until: '2099-01-01T00:00:00Z', priest: { priest_name: 'Antony' }, notes: 'Please request a meeting before visiting.' };
    else if (request.method === 'POST') { posts.push({ path, body: JSON.parse(request.postData) }); if (failReview) { failReview = false; responseCode = 503; data = { status: 'failure', message: 'Could not save. Please try again.' }; } else data = { status: 'success', message: 'Saved' }; }
    else {
      const type = path.split('/').at(-1);
      if (failCategory && type === 'mass_prayers') { responseCode = 503; data = { status: 'failure', message: 'Temporarily unavailable' }; }
      else { const alias = {baptism_request:'baptism_requests',eucharist_request:'eucharist_requests',confession_request:'confession_requests',confirmation_request:'confirmation_requests',marriage_request:'marriage_requests',aos_request:'aos_requests',mass_prayer:'mass_prayers',meeting_request:'meeting_requests'}; data.data = fixtures[alias[type] || type] || []; }
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
  const files = [];
  const scan = (dir) => { for (const item of readdirSync(dir,{withFileTypes:true})) { const path=`${dir}/${item.name}`; if(item.isDirectory())scan(path); else if(item.name==='page.js')files.push(path); } };
  scan('src/app');
  const routes = files.map(path => '/' + path.replace(/^src\/app\//,'').replace(/\/page\.js$/,'').split('/').filter(part=>!part.startsWith('(')).join('/')).sort();
  console.log(`Auditing ${routes.length} routes.`);
  const failures=[];
  let screenshotIndex=0;
  const inspect=async(route,width,state)=>{
    const result=await evaluate(`(() => {
      const controls=[...document.querySelectorAll('button,input,select,textarea,a')].filter(el=>{const r=el.getBoundingClientRect();return r.width>2&&r.height>2&&getComputedStyle(el).visibility!=='hidden'});
      const outside=controls.filter(el=>{const r=el.getBoundingClientRect();return r.right>innerWidth+2||r.left < -2}).map(el=>({tag:el.tagName,label:(el.getAttribute('aria-label')||el.textContent||el.getAttribute('placeholder')||el.type||'').trim().slice(0,75),right:Math.round(el.getBoundingClientRect().right),left:Math.round(el.getBoundingClientRect().left),cls:el.className}));
      const smallFields=controls.filter(el=>['INPUT','SELECT','TEXTAREA'].includes(el.tagName)&&!['file','checkbox','radio'].includes(el.type)&&parseFloat(getComputedStyle(el).fontSize)<16).map(el=>({label:el.placeholder||el.name||el.type,font:getComputedStyle(el).fontSize}));
      const clippedText=[...document.querySelectorAll('#parish-content label + span, [aria-label="Priest mobile navigation"] > a > span')].filter(el=>el.getClientRects().length).filter(el=>{const range=document.createRange();range.selectNodeContents(el);const text=range.getBoundingClientRect();const box=el.getBoundingClientRect();return text.right>box.right+2||text.left<box.left-2;}).map(el=>el.textContent.trim().slice(0,70));
      const metadataOverlap=[...document.querySelectorAll('#parish-content span')].filter(el=>el.childElementCount===0&&el.textContent.trim().startsWith('Submitted ')).filter(el=>el.getBoundingClientRect().right>el.parentElement.getBoundingClientRect().right+2).map(el=>el.textContent.trim());
      const runtimeError=/Application error:|client-side exception has occurred/.test(document.body.innerText);
      const overflow=[...document.querySelectorAll('main *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>2&&r.right>innerWidth+2&&getComputedStyle(el).position!=='fixed'}).slice(0,5).map(el=>({tag:el.tagName,text:el.textContent?.trim().slice(0,55),cls:el.className,right:Math.round(el.getBoundingClientRect().right)}));
      return {docWidth:document.documentElement.scrollWidth,viewport:innerWidth,outside,smallFields,clippedText,metadataOverlap,runtimeError,overflow};
    })()`);
    writeFileSync(join(output,'audit-live.json'),JSON.stringify({route,width,state,result,failures}));
    if(result.docWidth>width+2||result.outside.length||result.smallFields.length||result.clippedText.length||result.metadataOverlap.length||result.runtimeError){ failures.push({route,width,state,...result}); await screenshot(`issue-${screenshotIndex++}-${width}.png`); }
  };
  for(const [width,height] of JSON.parse(process.env.MOBILE_UI_SIZES || '[[320,497],[390,844],[430,932],[768,1024],[844,390]]')) {
    await command('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<768});
    for(const route of routes){
      writeFileSync(join(output,'progress.json'),JSON.stringify({route,width,height}));
      await command('Page.navigate',{url:`${origin}${route}`});
      await wait(`location.pathname===${JSON.stringify(route)} && document.readyState==='complete' && document.querySelector('main')`);
      await pause(250);
      if(route==='/profile')await wait(`document.body.textContent.includes('Maria Joseph Arulraj')`);
      if(route.includes('/applications/')&&route.endsWith('/edit'))await wait(`document.body.textContent.includes('Submitted')`);
      if(route.includes('/priest_dashboard/requests/')&&!route.endsWith('/requests'))await wait(`document.querySelector('[data-testid=request-record]')`);
      await inspect(route,width,'default');
      if(width<768 && route==='/') {
        assert.ok(await evaluate(`(() => {const image=document.querySelector('[data-testid=announcement-feature] [data-testid=announcement-image]').getBoundingClientRect();const copy=document.querySelector('[data-testid=announcement-feature-copy]').getBoundingClientRect();return copy.top>=image.bottom-1&&copy.width>=image.width-2})()`),'Announcement image must stack above its text on phones');
        assert.ok(await evaluate(`(() => {const card=document.querySelector('#services article');return card.children[1].getBoundingClientRect().top>=card.children[0].getBoundingClientRect().bottom})()`),'Service content should follow its icon vertically');
      }
      if(route.includes('/priest_dashboard/requests/')) {
        await click('[data-testid=request-record] button','Review request');await wait(`document.querySelector('[data-testid=request-details-panel]')`);await inspect(route,width,'review');
      }
      if(route==='/priest_dashboard/announcements') {
        await click('[data-testid=announcement-admin] button','New announcement');await wait(`document.querySelector('[data-testid=announcement-form]')`);await inspect(route,width,'announcement-editor');
        await evaluate(`document.querySelector('button[aria-label="Close dialog"]').click()`);
      }
      if(route==='/priest_dashboard' && width<768) {
        await evaluate(`document.querySelector('button[aria-label="More navigation"]').click()`);await wait(`document.body.classList.contains('overflow-hidden')`);await inspect(route,width,'more-navigation');
        await evaluate(`document.querySelector('button[aria-label="Close more navigation"]').click()`);await wait(`!document.body.classList.contains('overflow-hidden')`);
      }
      if(route==='/profile') {
        await click('main button','View Fully');await wait(`document.querySelector('[role=dialog][aria-label="Family card document"]')`);await inspect(route,width,'family-document');
        assert.ok(await evaluate(`document.body.classList.contains('overflow-hidden')`));
        assert.ok(await evaluate(`(() => {const r=document.querySelector('[role=dialog]').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1})()`));
        await evaluate(`document.querySelector('button[aria-label="Close family card document"]').click()`);
      }
      if(route==='/applications/mass_prayer/apply') {
        await click('main button','Online');await wait(`document.querySelector('[role=dialog][aria-label="Mass prayer payment"]')`);await inspect(route,width,'payment-dialog');
        assert.ok(await evaluate(`(() => {const r=document.querySelector('[role=dialog]').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight+1&&document.body.classList.contains('overflow-hidden')})()`));
        await evaluate(`document.querySelector('button[aria-label="Close payment dialog"]').click()`);
      }
      if(route.includes('/applications/')&&route.endsWith('/edit')){
        assert.ok(await evaluate(`(() => {const edit=Array.from(document.querySelectorAll('main button')).find(el=>el.textContent.trim()==='Edit');edit?.click();return !!edit})()`), `Editable fixture available: ${route}`);await pause(150);await inspect(route,width,'editing');
      }
      if(route==='/profile'){
        await evaluate(`Array.from(document.querySelectorAll('main button')).find(el=>el.textContent.includes('Edit Profile'))?.click()`);await pause(150);await inspect(route,width,'editing');
      }
    }
    console.log(`Completed ${routes.length} routes at ${width}px.`);
  }
  writeFileSync(join(output,'audit.json'),JSON.stringify({routes,failures},null,2));
  console.log(JSON.stringify({routes:routes.length,failures:failures.map(({route,width,state,docWidth,outside,smallFields,runtimeError})=>({route,width,state,docWidth,outside,smallFields,runtimeError})),output},null,2));
  assert.equal(failures.length,0,'All routes and expanded states should fit mobile/tablet viewports');
} finally {
  shuttingDown=true;for(const task of pending.values())task.resolve({});pending.clear();ws?.terminate();browser.kill();clearInterval(keepalive);
}
