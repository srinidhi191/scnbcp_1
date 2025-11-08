const http = require('http');
const https = require('https');
const { URL } = require('url');

function fetch(url, opts = {}){
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const data = opts.body ? Buffer.from(opts.body) : null;
    const headers = Object.assign({}, opts.headers || {});
    if (data) headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    const req = lib.request(u, { method: opts.method || 'GET', headers }, (res) => {
      let chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const text = buf.toString('utf8');
        let body = text;
        try{ body = JSON.parse(text); }catch(e){}
        if (res.statusCode >= 200 && res.statusCode < 300) resolve({ status: res.statusCode, body });
        else reject({ status: res.statusCode, body, res });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async ()=>{
  const api = 'http://127.0.0.1:4000/api';
  const email = 'bhavanachereddy2006@gmail.com';
  const pass = '12345';

  // wait for api
  console.log('Waiting for API...');
  const start = Date.now();
  while(true){
    try{ await fetch(api + '/auth/login', { method: 'POST', body: JSON.stringify({email:'__ping__', password:'x'}) }); }
    catch(e){
      // server responded or not
    }
    try{ const r = await fetch(api + '/auth/login', { method: 'POST', body: JSON.stringify({ email, password: pass }) });
      console.log('login ok:', r.body); 
      var token = r.body.token; break;
    } catch(err){
      // if 401, try register
      if (err && err.status === 401){
        try{
          console.log('Registering admin...');
          const reg = await fetch(api + '/auth/register', { method: 'POST', body: JSON.stringify({ name: 'Automated Admin', email, password: pass, role: 'admin' }) });
          console.log('registered:', reg.body);
          token = reg.body.token; break;
        } catch(e2){
          console.error('register failed', e2);
          process.exit(1);
        }
      } else if (err && err.status){
        console.log('auth endpoint returned', err.status, err.body);
      }
      if (Date.now() - start > 60_000){ console.error('API not ready'); process.exit(1); }
      await new Promise(r=>setTimeout(r,1000));
    }
  }

  if (!token){ console.error('No token acquired'); process.exit(1); }
  console.log('Token acquired. Creating notice...');
  try{
  const payload = { title: 'Automated test notice', body: 'Automated test notice', category: 'General', priority: 'normal', visibility: 'public' };
    const cr = await fetch(api + '/notices', { method: 'POST', headers: { Authorization: 'Bearer ' + token }, body: JSON.stringify(payload) });
    console.log('Create response:', cr.body);
  } catch (e){ console.error('create failed', e); process.exit(1); }

  // show tail of log
  const fs = require('fs');
  const p = require('path').join(__dirname, '..', 'api-dev.log');
  console.log('\n==== api-dev.log tail ===');
  try{ const l = fs.readFileSync(p,'utf8').split(/\r?\n/).slice(-200).join('\n'); console.log(l); }catch(e){ console.warn('failed to read log', e); }

  process.exit(0);
})();
