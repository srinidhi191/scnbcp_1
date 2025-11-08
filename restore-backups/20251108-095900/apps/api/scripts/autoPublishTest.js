const fs = require('fs');
const fetch = global.fetch || require('node-fetch');

const api = 'http://127.0.0.1:4000/api';

async function waitForApi(timeoutSec = 60) {
  const start = Date.now();
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await fetch(`${api}/auth/login`, { method: 'OPTIONS' });
      // If we get any response (even 404/405), server is up
      return true;
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return false;
}

async function run() {
  console.log('waiting for API...');
  const ok = await waitForApi(60);
  if (!ok) {
    console.error('timeout waiting for API');
    process.exit(2);
  }
  console.log('API reachable');

  const email = 'testpub@example.com';
  const pw = 'Test123!';
  const name = 'Automated Pub';

  let token = null;
  try {
    console.log('attempting register...');
    const r = await fetch(`${api}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pw, role: 'admin' }),
    });
    const json = await r.json();
    if (!r.ok) throw new Error(JSON.stringify(json));
    console.log('register success', json);
    token = json.token;
  } catch (e) {
    console.log('register failed, trying login:', e.message);
    try {
      const l = await fetch(`${api}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      });
      const lj = await l.json();
      if (!l.ok) throw new Error(JSON.stringify(lj));
      console.log('login success', lj);
      token = lj.token;
    } catch (err) {
      console.error('login also failed:', err.message);
      process.exit(3);
    }
  }

  if (!token) {
    console.error('no token obtained');
    process.exit(4);
  }

  try {
    console.log('creating notice...');
    const note = await fetch(`${api}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: `Automated Test Notice ${new Date().toISOString()}`, body: 'Automated test publish', category: 'general', priority: 'normal', visibility: 'public' }),
    });
    const nj = await note.json();
    if (!note.ok) throw new Error(JSON.stringify(nj));
    console.log('notice created', nj);
  } catch (err) {
    console.error('notice create failed:', err.message);
    process.exit(5);
  }

  // tail log
  const logPath = './api-dev.log';
  if (fs.existsSync(logPath)) {
    const data = fs.readFileSync(logPath, { encoding: 'utf8' });
    const lines = data.split(/\r?\n/).slice(-300).join('\n');
    console.log('--- api-dev.log tail ---');
    console.log(lines);
  } else {
    console.log('api-dev.log not found');
  }
}

run();
