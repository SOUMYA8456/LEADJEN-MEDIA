const fs = require('fs');
const path = require('path');

function searchInDir(dir, pattern) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === '.git') continue;
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'admin') { // we only care about public frontend linking to admin
        searchInDir(fullPath, pattern);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('/admin') || line.toLowerCase().includes('cms') || line.toLowerCase().includes('newsroom login')) {
          if (!fullPath.includes('app\\admin') && !fullPath.includes('app/admin') && !fullPath.includes('components\\admin') && !fullPath.includes('components/admin')) {
            console.log(`${fullPath}:${idx + 1} -> ${line.trim()}`);
          }
        }
      });
    }
  }
}

searchInDir('./components', '/admin');
searchInDir('./app', '/admin');
