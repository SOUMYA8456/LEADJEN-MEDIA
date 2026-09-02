const matches = require('./red_audit_matches.json');
const byFile = {};
matches.forEach(m => {
  byFile[m.file] = (byFile[m.file] || 0) + 1;
});
console.log(JSON.stringify(byFile, null, 2));
