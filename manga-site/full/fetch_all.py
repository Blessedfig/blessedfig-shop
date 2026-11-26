"""Tier 0 pull of every English-licensed manga on MangaUpdates (metadata only, resumable).
Phase 1: enumerate via search split by year. Phase 2: series details (English publishers, categories, status)."""
import json, sqlite3, time, urllib.request, sys
DB = '/home/user/manga-catalog/full/full.db'
c = sqlite3.connect(DB)
c.execute('create table if not exists mu (id integer primary key, title text, year text, votes int, rating real, genres text, url text, detail text)')
def http(url, body=None):
    for i in range(6):
        try:
            r = urllib.request.Request(url, json.dumps(body).encode() if body else None, {'Content-Type': 'application/json', 'User-Agent': 'manga-guide-catalog/1.0'})
            return json.load(urllib.request.urlopen(r, timeout=60))
        except Exception as e:
            print('retry', url[-40:], e, file=sys.stderr, flush=True); time.sleep(5 * (i + 1))
    return None
if 'details' not in sys.argv:
    years = [str(y) for y in range(1930, 2027)] + ['']
    for y in years:
        page = 1
        while True:
            b = {'licensed': 'yes', 'type': ['Manga'], 'perpage': 100, 'page': page, 'orderby': 'title'}
            if y: b['year'] = y
            d = http('https://api.mangaupdates.com/v1/series/search', b); time.sleep(1)
            if not d or not d.get('results'): break
            for x in d['results']:
                r = x['record']
                c.execute('insert or ignore into mu(id,title,year,votes,rating,genres,url) values(?,?,?,?,?,?,?)',
                          (r['series_id'], r['title'], r.get('year'), r.get('rating_votes') or 0, r.get('bayesian_rating'), json.dumps([g['genre'] for g in (r.get('genres') or [])]), r.get('url')))
            c.commit()
            if page * 100 >= min(d.get('total_hits', 0), 10000): break
            page += 1
        print('year', y or '(none)', c.execute('select count(*) from mu').fetchone()[0], flush=True)
        if not y: break
ids = [r[0] for r in c.execute('select id from mu where detail is null order by votes desc')]
print('details to fetch', len(ids), flush=True)
for n, i in enumerate(ids):
    d = http(f'https://api.mangaupdates.com/v1/series/{i}'); time.sleep(1)
    if not d: continue
    keep = {k: d.get(k) for k in ('title', 'associated', 'year', 'type', 'status', 'licensed', 'completed', 'genres', 'categories', 'publishers', 'authors', 'anime', 'rank', 'bayesian_rating', 'rating_votes')}
    keep['categories'] = [{'category': x['category'], 'votes': x.get('votes', 0)} for x in (keep.get('categories') or [])][:40]
    c.execute('update mu set detail=? where id=?', (json.dumps(keep, ensure_ascii=False), i))
    if n % 50 == 0: c.commit(); print('detail', n, flush=True)
c.commit(); print('done')
