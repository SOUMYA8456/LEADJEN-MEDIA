const { execSync } = require('child_process');
const fs = require('fs');

const envContent = fs.readFileSync('.env.vercel', 'utf8');
const lines = envContent.split('\n');
let dbUrl = '';

for (const line of lines) {
  if (line.startsWith('DATABASE_URL=')) {
    dbUrl = line.substring('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
  }
}

console.log('Connecting to cloud PostgreSQL database...');
process.env.DATABASE_URL = dbUrl;

try {
  const output = execSync('npx prisma db push', {
    env: { ...process.env, DATABASE_URL: dbUrl },
    encoding: 'utf8',
  });
  console.log(output);
  console.log('✓ Cloud database successfully synced with schema!');
} catch (err) {
  console.error('Push error:', err.stdout || err.message);
}
