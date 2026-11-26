"""Create new 23-series quick-entry batches from site/data.json for series with no entry and no batch yet, most-read first."""
import json, glob, os, re
def b36(n):
    a='0123456789abcdefghijklmnopqrstuvwxyz'; o=''
    while n: n, r = divmod(n, 36); o = a[r] + o
    return o
Q = '/mnt/project-files/manga-quick'
d = json.load(open('/home/user/manga-catalog/site/data.json'))
done = {int(os.path.basename(p)[:-5]) for p in glob.glob(Q + '/*.json')} | {int(os.path.basename(p)[:-5]) for p in glob.glob(Q + '/held/*.json')}
batched = set(); nums = [0]
for p in glob.glob(Q + '/batches/batch-*.json'):
    nums.append(int(re.search(r'batch-(\d+)', p).group(1)))
    batched |= {b['anilist_id'] for b in json.load(open(p))}
todo = [s for s in d['series'] if not s.get('entry') and int(s['id']) not in done | batched and s.get('mdex_rating') != 'pornographic']
todo.sort(key=lambda s: -(s.get('popularity') or 0))
n = max(nums); made = []
for i in range(0, len(todo) - len(todo) % 23 if len(todo) >= 23 else 0, 23):
    n += 1; chunk = todo[i:i + 23]
    out = [{'anilist_id': int(s['id']), 'title': s['title'] or s['romaji'], 'romaji': s['romaji'], 'native': s['native'], 'year': s['year'],
            'creators': [f"{c['name']} ({c['role']})" for c in s.get('creators') or []], 'english_publishers': [p['name'] for p in s.get('publishers') or []],
            'genres': s.get('genres'), 'anilist_tags': [f"{t}" for t in (s.get('themes') or [])][:12],
            'content_signals': {k: [t['tag'] for t in v] for k, v in (s.get('signals') or {}).items()}, 'mangaupdates_categories': s.get('mu_signals') or [],
            'mangadex_rating': s.get('mdex_rating'), 'adult': s.get('adult'), 'license_note': s.get('match') or '',
            'anilist': f"https://anilist.co/manga/{s['id']}", 'mangaupdates': f"https://www.mangaupdates.com/series/{b36(int(s['mu']))}" if s.get('mu') else None, 'wikipedia_text_file': None} for s in chunk]
    json.dump(out, open(f'{Q}/batches/batch-{n:02d}.json', 'w'), ensure_ascii=False, indent=1); made.append(n)
print('made', made, 'leftover', len(todo) % 23 if len(todo) >= 23 else len(todo))
