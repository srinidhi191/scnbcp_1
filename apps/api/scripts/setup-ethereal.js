const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

async function main(){
  console.log('Creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  console.log('Ethereal account created. Writing to .env...');

  const envPath = path.join(__dirname, '..', '.env');
  let env = '';
  try { env = fs.readFileSync(envPath, 'utf8'); } catch (e) { env = '' }

  // remove any existing SMTP and MAIL_FROM lines
  env = env.split(/\r?\n/).filter(l => !l.startsWith('SMTP_') && !l.startsWith('MAIL_FROM')).join('\n').trim();

  const additions = [`SMTP_HOST=${testAccount.smtp.host}`,
    `SMTP_PORT=${testAccount.smtp.port}`,
    `SMTP_USER=${testAccount.user}`,
    `SMTP_PASS=${testAccount.pass}`,
    `MAIL_FROM=${testAccount.user}`];

  const newEnv = (env ? env + '\n' : '') + additions.join('\n') + '\n';
  fs.writeFileSync(envPath, newEnv, 'utf8');

  console.log('Wrote SMTP credentials to', envPath);
  console.log('Credentials:');
  console.log('HOST:', testAccount.smtp.host);
  console.log('PORT:', testAccount.smtp.port);
  console.log('USER:', testAccount.user);
  console.log('PASS:', testAccount.pass);
  console.log('\nEthereal web URL: https://ethereal.email/messages (use the credentials above to login)');
}

main().catch(err => {
  console.error('Failed to create Ethereal account:', err);
  process.exit(1);
});
