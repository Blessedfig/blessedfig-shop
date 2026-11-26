#!/usr/bin/env python3
"""Publish deep entries into the store repo without the old catalog container.
Usage: publish_deep.py SLUG:ANILIST_ID [SLUG:ANILIST_ID ...]
For each entry in /mnt/project-files/manga-entries/SLUG.md:
  - copies the markdown to manga-guide/entries/
  - parses it (build.parse_entry + Message delivery) into realign.json["entries"][id]
  - adds "How we reached this grade" data to realign.json["reasons"][slug]
  - reads "Outlook:" / "Hope source:" into realign.json["outlook"][id]
  - if the entry has a "**Content warning.**" paragraph, sets data.json series.warning (first sentence)
Written 2026-11-26 by the 'deep entries 201-300' thread."""
import sys, os, re, json, shutil
sys.path.insert(0, '/mnt/project-files/manga-site')
import build as B

REPO = '/home/user/blessedfig-shop/manga-guide'
SRC = '/mnt/project-files/manga-entries'
R = json.load(open(f'{REPO}/realign.json'))
EXTRA = list(R.get('lenses', [])) + ['Hindu ideas', 'Buddhist ideas']
DISPLAY = {'Strength rules': 'Might makes right', 'Authoritarianism': 'Collectivism/authoritarianism', 'Feel-good faith': 'Moralistic therapeutic deism'}

def canon_lens(label):
    n = B.norm(label)
    for k, v in DISPLAY.items():
        if n.startswith(B.norm(k)): return v
    for L in EXTRA:
        if n == B.norm(L) or n.startswith(B.norm(L.split(' (')[0].split(' /')[0])): return L
    m = B.match_lens(label)
    return m or label

def delivery(md):
    m = re.search(r'^## Message delivery[^\n]*\n(.*?)(?=^## |\Z)', md, re.S | re.M)
    if not m: return None
    t = m.group(1); g = lambda k: (re.search(r'^- ' + k + r':\s*(.+)$', t, re.M) or [None, None])[1]
    d = {'style': B.clean(g('Style') or ''), 'preachiness': B.num(g('Preachiness') or ''), 'opposing_views': B.clean(g('Opposing views') or ''),
         'evidence': B.clean(g('Evidence') or ''), 'note': B.clean(g('Note') or ''), 'personified': []}
    for tb in B.tables(t):
        if tb['head'] and tb['head'][0].lower().startswith('character'):
            for r in tb['rows']:
                if len(r) >= 4: d['personified'].append({'character': B.clean(r[0]), 'ideology': B.clean(r[1]), 'role': B.clean(r[2]), 'treatment': B.clean(r[3])})
    return d

def section(text, name):
    m = re.search(r'^## ' + re.escape(name) + r'[^\n]*\n(.*?)(?=^## |\Z)', text, re.S | re.M)
    return m.group(1).strip() if m else ''
cells = lambda line: [c.strip() for c in line.strip().strip('|').split('|')]

def reasons(t):
    fam = section(t, 'Family frames'); talking, head = {}, None
    for line in fam.splitlines():
        if not line.startswith('|') or line.startswith('|---'): continue
        c = cells(line)
        if head is None: head = [h.lower() for h in c]; continue
        ti = next((i for i, h in enumerate(head) if h.startswith('talking')), None)
        if ti is not None and len(c) > ti: talking[c[0]] = c[ti]
    m = re.search(r'What the rows weigh:\s*(.+?)(?:\n|$)', fam)
    urls = [u.rstrip('.,;') for u in dict.fromkeys(re.findall(r'https?://[^\s)>\]]+', section(t, 'Sources')))]
    items = [{'done': x.group(1).lower() == 'x', 'text': x.group(2).strip()} for x in re.finditer(r'^- \[( |x|X)\]\s*(.+)$', section(t, 'Full-read review checklist'), re.M)]
    conf = re.search(r'[Cc]onfidence[^a-z]*\b(low|medium|high)\b', t[:1500])
    return {'talking': talking, 'weigh': m.group(1).strip() if m else '', 'sources': urls, 'checklist': items, 'confidence': conf.group(1) if conf else ''}

D = None
for arg in sys.argv[1:]:
    slug, aid = arg.split(':')
    path = f'{SRC}/{slug}.md'
    e, md = B.parse_entry(path)
    for l in e['lenses']:
        l['lens'] = canon_lens(l['label'])
    e['delivery'] = delivery(md)
    assert len(e['frames']) >= 31, f'{slug}: only {len(e["frames"])} frame rows'
    assert e['overall'] is not None and e['life_message'], f'{slug}: missing overall/life message'
    R['entries'][aid] = e
    R['reasons'][slug] = reasons(md)
    o = re.search(r'^Outlook:\s*\**\s*(Hopeful|Bittersweet|Bleak)', md, re.M)
    h = re.search(r'^Hope source:\s*\**\s*([GRFLESPKJN])\b', md, re.M)
    if o and h: R['outlook'][aid] = {'o': {'Hopeful': 'h', 'Bittersweet': 'm', 'Bleak': 'b'}[o.group(1)], 'hope': h.group(1), 'hh': 1}
    else: print(f'WARNING {slug}: no outlook/hope line')
    w = re.search(r'\*\*Content warning\.\*\*\s*(.+)', md)
    if w:
        D = D or json.load(open(f'{REPO}/data.json'))
        s = next((s for s in D['series'] if str(s['id']) == aid), None)
        print(f'{slug}: HAS CONTENT WARNING PARAGRAPH - set data.json warning by hand from the writer report (current: {s and s.get("warning")})')
    shutil.copy(path, f'{REPO}/entries/{slug}.md')
    print(f'{slug} ({aid}): {len(e["frames"])} frames, {len(e["lenses"])} lenses, overall {e["overall"]}, outlook {R["outlook"].get(aid)}, delivery {bool(e["delivery"])}')

json.dump(R, open(f'{REPO}/realign.json', 'w'), ensure_ascii=False, separators=(',', ':'))
if D: json.dump(D, open(f'{REPO}/data.json', 'w'), ensure_ascii=False, separators=(',', ':'))
