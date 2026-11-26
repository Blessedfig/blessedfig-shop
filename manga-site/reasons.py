#!/usr/bin/env python3
"""Build reasons.json for the guide's "How we reached this grade" sections.
Reads the tradition guides (frame-guides/*.md) and the deep entries (manga-entries/*.md).
Usage: reasons.py <output path>   (default: manga-guide/reasons.json in the store repo)"""
import json, re, sys, glob, os
PF = '/mnt/project-files'
out = sys.argv[1] if len(sys.argv) > 1 else '/home/user/blessedfig-shop/manga-guide/reasons.json'

def cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

def section(text, name):
    m = re.search(r'^## ' + re.escape(name) + r'[^\n]*\n(.*?)(?=^## |\Z)', text, re.S | re.M)
    return m.group(1).strip() if m else ''

frames = {}
for f in sorted(glob.glob(f'{PF}/frame-guides/*.md')):
    if f.endswith('FRAMES.md'): continue
    t = open(f, encoding='utf-8').read()
    name = t.splitlines()[0].lstrip('# ').strip()
    summ = section(t, 'Summary')
    fields = {}
    for m in re.finditer(r'^\*\*([^*]+?):\*\*\s*(.+)$', summ, re.M):
        fields[m.group(1).strip()] = re.sub(r'\s*See \[Teaching on art[^\]]*\]\([^)]*\)\.?', '', m.group(2)).strip()
    topics = {}
    for line in t.splitlines():
        if line.startswith('|') and not line.startswith('|---'):
            c = cells(line)
            if len(c) >= 2 and c[0] != 'Topic': topics[c[0]] = c[1]
    media = section(t, 'Teaching on art, media and depiction')
    media = media.split('\n\nGrade (S to F)')[0].strip()
    status = 'draft' if re.search(r'draft from general knowledge', t, re.I) else 'checked'
    frames[name] = {'beliefs': fields.get('Core beliefs', ''), 'values': fields.get('What it values', ''),
        'forbids': fields.get('What it forbids or discourages', ''), 'family': fields.get('Family, sex and identity', ''),
        'stories': fields.get('Stories, fiction and art', ''), 'range': fields.get('Range within the tradition', ''),
        'sources': fields.get('Own sources', ''), 'topics': topics, 'media': media, 'status': status,
        'file': os.path.basename(f)}

entries = {}
for f in sorted(glob.glob(f'{PF}/manga-entries/*.md')):
    slug = os.path.basename(f)[:-3]
    if slug.isupper() or slug.startswith(('AGENT', 'TEMPLATE', 'TOP-', 'CULTURE')): continue
    t = open(f, encoding='utf-8').read()
    fam = section(t, 'Family frames')
    talking, head = {}, None
    for line in fam.splitlines():
        if not line.startswith('|') or line.startswith('|---'): continue
        c = cells(line)
        if head is None: head = [h.lower() for h in c]; continue
        ti = next((i for i, h in enumerate(head) if h.startswith('talking')), None)
        if ti is not None and len(c) > ti: talking[c[0]] = c[ti]
    weigh = ''
    m = re.search(r'What the rows weigh:\s*(.+?)(?:\n|$)', fam)
    if m: weigh = m.group(1).strip()
    src = section(t, 'Sources')
    urls = list(dict.fromkeys(re.findall(r'https?://[^\s)>\]]+', src)))
    urls = [u.rstrip('.,;') for u in urls]
    chk = section(t, 'Full-read review checklist')
    items = [{'done': m.group(1).lower() == 'x', 'text': m.group(2).strip()} for m in re.finditer(r'^- \[( |x|X)\]\s*(.+)$', chk, re.M)]
    first = '\n'.join(t.splitlines()[:4])
    conf = re.search(r'[Cc]onfidence[^a-z]*\b(low|medium|high)\b', t[:1500])
    entries[slug] = {'talking': talking, 'weigh': weigh, 'sources': urls, 'checklist': items,
                     'confidence': conf.group(1) if conf else ''}

json.dump({'frames': frames, 'entries': entries}, open(out, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'{out}: {len(frames)} traditions, {len(entries)} deep entries, {os.path.getsize(out)//1024} KB')
