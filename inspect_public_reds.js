const fs = require('fs');
const matches = JSON.parse(fs.readFileSync('red_audit_matches.json', 'utf8'));

const publicMatches = matches.filter(m => {
  const file = m.file.replace(/\\/g, '/');
  // Ignore admin files
  if (file.includes('app/admin') || file.includes('components/admin') || file.includes('app/api')) return false;
  // Ignore breaking ticker and live clock which MUST keep red
  if (file.includes('BreakingTicker.tsx') || file.includes('LiveClock.tsx')) return false;
  return true;
});

console.log(`Public non-breaking/live matches count: ${publicMatches.length}`);
publicMatches.forEach(m => {
  console.log(`${m.file}:${m.line} -> ${m.text.trim()}`);
});
