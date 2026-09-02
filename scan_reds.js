const fs = require('fs');
const path = require('path');

const dirs = ['components', 'app', 'lib'];
const matches = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== 'pgdata') {
        scanDir(fullPath);
      }
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (
          /leadjen-600|leadjen-700|leadjen-red|text-red-|bg-red-|border-red-|fill-red-|ring-red-/.test(line)
        ) {
          matches.push({ file: fullPath, line: idx + 1, text: line.trim() });
        }
      });
    }
  }
}

dirs.forEach(d => {
  if (fs.existsSync(d)) scanDir(d);
});

console.log(`Total occurrences found: ${matches.length}`);
fs.writeFileSync('red_audit_matches.json', JSON.stringify(matches, null, 2));
console.log('Saved to red_audit_matches.json');
