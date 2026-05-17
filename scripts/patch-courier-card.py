# -*- coding: utf-8 -*-
from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'courier.html'
lines = p.read_text(encoding='utf-8').splitlines(keepends=True)

start = None
for i, line in enumerate(lines):
    if line.strip().startswith('const addr=m.cabAddress'):
        start = i
        break

if start is None:
    raise SystemExit('addr block not found')

replacement = [
    "  const stops=missionStops(m);\n",
    "  const headType=stops.length>1?'multi':(stops[0]&&stops[0].type)||m.type;\n",
    "  const notes=m.notes?'<div style=\"margin-top:6px;font-style:italic;\">'+esc(m.notes)+'</div>':'';\n",
    "  return '<motion class=\"mcard'+pulse+'\" data-mid=\"'+esc(m.id)+'\">'+\n",
]

# fix motion typo in replacement
replacement[3] = replacement[3].replace('motion', 'div')

replacement += [
    "    '<div class=\"mcard-type '\"+(headType==='delivery'?'delivery':'pickup')+'\">'+\n",
    "      (stops.length>1?'🛵 Course multi-arrêts':typeIcon(headType)+' '+typeLabel(headType))+'</div>'+\n",
    "    '<div class=\"mcard-title\">'+missionTitle(m)+'</div>'+\n",
    "    '<div class=\"mcard-sub\">'+fmtWhen(m.createdAt)+missionStopsHtml(m)+notes+'</div>'+\n",
]

end = start
while end < len(lines) and not lines[end].strip().startswith("'<div class=\"mcard-lab\""):
    end += 1

lines[start:end] = replacement
p.write_text(''.join(lines), encoding='utf-8')
print('patched courier missionCard', start, end)
