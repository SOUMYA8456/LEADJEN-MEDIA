const fs = require('fs');
const path = require('path');

const dirsToScan = [
  path.join(__dirname, '..', 'app'),
  path.join(__dirname, '..', 'components'),
  path.join(__dirname, '..', 'lib'),
];

let issues = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      scan(full);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('http://localhost') && !line.includes('process.env.NEXT_PUBLIC_SITE_URL')) {
          issues.push({ file: path.relative(process.cwd(), full), line: idx + 1, text: line.trim() });
        }
      });
    }
  }
}

dirsToScan.forEach(scan);

console.log('=== SCAN LOCALHOST RESULTS ===');
if (issues.length === 0) {
  console.log('No hardcoded localhost references found in production paths!');
} else {
  console.log(`Found ${issues.length} references:`);
  issues.forEach(i => console.log(`${i.file}:${i.line} -> ${i.text}`));
}
