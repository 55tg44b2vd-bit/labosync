import fs from 'fs';
const p = new URL('../app.html', import.meta.url);
let s = fs.readFileSync(p, 'utf8');
const d = 'div';
const start = s.indexOf(`      <${d} class="ptitle">Planning — \${info.label}`);
if (start < 0) {
  console.error('marker not found');
  process.exit(1);
}
const endMark = s.indexOf(`    </${d}>\`;\n  } else {`, start);
if (endMark < 0) {
  console.error('end not found');
  process.exit(1);
}
const block = `      <${d} class="ptitle">Planning du jour — \${info.label}</${d}>
      <${d} class="psub">\${fmtL(today)} · \${tasks.length} tâche(s) · Généré le \${fmtL(new Date())}</${d}>
      \${tasks.length?tasks.map(function(t){
        return \`<${d} class="prow" style="background:\${info.soft};border-color:\${info.color}\${t.urgent?';border-left-width:6px':''}">
            <${d} class="pp">\${t.urgent?'🔴 ':''}\${t.patient}</${d}>
            <${d} class="pst">\${t.label}\${t.note?\` · <em>\${t.note}</em>\`:''}</${d}>
          </${d}>\`;
      }).join(''):'<${d} class="empty">'+t('print.no_tasks_day')+'</${d}>'}
`;
s = s.slice(0, start) + block + s.slice(endMark);
fs.writeFileSync(p, s);
console.log('patched');
