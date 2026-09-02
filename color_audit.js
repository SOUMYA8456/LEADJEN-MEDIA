const fs = require('fs');
const path = require('path');

const TARGET_DIRS = ['app', 'components', 'lib'];
const BLUE_PATTERNS = [
  /text-blue-\d+/i,
  /bg-blue-\d+/i,
  /border-blue-\d+/i,
  /ring-blue-\d+/i,
  /text-sky-\d+/i,
  /bg-sky-\d+/i,
  /border-sky-\d+/i,
  /text-indigo-\d+/i,
  /bg-indigo-\d+/i,
  /border-indigo-\d+/i,
  /text-cyan-\d+/i,
  /bg-cyan-\d+/i,
];

let occurrences = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const pattern of BLUE_PATTERNS) {
          if (pattern.test(line)) {
            occurrences.push({
              file: fullPath,
              line: idx + 1,
              match: line.trim(),
            });
          }
        }
      });
    }
  }
}

for (const d of TARGET_DIRS) {
  if (fs.existsSync(d)) {
    scanDir(d);
  }
}

console.log('========================================');
console.log('ZERO BLUE COLOR AUDIT RESULTS');
console.log('========================================');
console.log(`Found ${occurrences.length} blue references:\n`);

occurrences.forEach((occ, i) => {
  console.log(`${i + 1}. ${occ.file}:${occ.line}`);
  console.log(`   ${occ.match}\n`);
});
