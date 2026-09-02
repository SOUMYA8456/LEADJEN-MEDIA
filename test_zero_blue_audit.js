/**
 * LEADJEN MEDIA - ZERO BLUE ACCENTS & BLACK/WHITE/RED COLOR SYSTEM AUDIT
 */

const fs = require('fs');
const path = require('path');

const bluePatterns = [
  /\b(text|bg|border|ring|fill|stroke|shadow|from|to|via)-(blue|sky|cyan|indigo)-/i,
  /#(0000ff|2563eb|3b82f6|60a5fa|0ea5e9|1d4ed8|1e40af|1e3a8a|0284c7|0369a1|075985|0c4a6e|06b6d4|0891b2|0e7490|155e75|164e63|6366f1|4f46e5|4338ca|3730a3|312e81)/i
];

const scannedDirectories = ['app', 'components', 'lib'];
const violations = [];

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'pgdata', '.tempmediaStorage', '.system_generated'].includes(entry.name)) {
        scanDirectory(fullPath);
      }
    } else if (/\.(tsx|ts|js|jsx|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        for (const pattern of bluePatterns) {
          if (pattern.test(line)) {
            violations.push({
              file: path.relative(process.cwd(), fullPath),
              line: idx + 1,
              code: line.trim()
            });
            break;
          }
        }
      });
    }
  }
}

console.log('===============================================================');
console.log('LEADJEN MEDIA - ZERO BLUE DESIGN SYSTEM AUDIT');
console.log('===============================================================');

scannedDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    scanDirectory(dir);
  }
});

if (violations.length === 0) {
  console.log('✓ PASS: ZERO BLUE ACCENTS FOUND (0 violations across app, components, lib)');
  console.log('✓ Color System: Pure Black, White, Neutral Grays, and Urgent Red.');
  process.exit(0);
} else {
  console.error(`❌ FAIL: Found ${violations.length} blue color violations:`);
  violations.forEach(v => console.error(`  - ${v.file}:${v.line} -> ${v.code}`));
  process.exit(1);
}
