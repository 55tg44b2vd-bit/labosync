const fs = require('fs');
const h = fs.readFileSync('c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/app.html', 'utf8');
const start = h.indexOf('<script>', h.indexOf('supabase'));
const end = h.indexOf('</script>', start);
const s = h.slice(start + 8, end);
fs.writeFileSync('c:/Users/tomgo/OneDrive/Bureau/labosync - Copie/scripts/_tmp-check.js', s, 'utf8');
const { execSync } = require('child_process');
try {
  execSync('node --check scripts/_tmp-check.js', { cwd: 'c:/Users/tomgo/OneDrive/Bureau/labosync - Copie', stdio: 'inherit' });
  console.log('syntax OK');
} catch (e) {
  process.exit(1);
}
