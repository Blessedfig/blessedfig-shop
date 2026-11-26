"""Pull the English Wikipedia lead + plot/synopsis sections for each catalog series (second, independent source).
Writes /mnt/project-files/manga-sources/wikipedia/<anilist_id>.txt and series-list.csv. Facts only; not shown on the site."""
import json, os, re, sqlite3, sys, time, urllib.parse, urllib.request, csv
OUT = '/mnt/project-files/manga-sources'; os.makedirs(OUT + '/wikipedia', exist_ok=True)
H = {'User-Agent': 'manga-worldview-catalog-prototype/0.1 (research use)'}
def api(params):
    url = 'https://en.wikipedia.org/w/api.php?' + urllib.parse.urlencode({**params, 'format': 'json', 'formatversion': 2})
    for i in range(8):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=30) as r: return json.load(r)
        except Exception as e: print('err', e, file=sys.stderr); time.sleep(30 * (i + 1))
db = sqlite3.connect(os.path.join(os.path.dirname(__file__), 'catalog.db')); db.row_factory = sqlite3.Row
rows = db.execute('select anilist_id,title_en,title_romaji,title_native,start_year,creators,en_publishers,popularity,mu_id from series order by popularity desc').fetchall()
listing = []
for r in rows:
    creators = [c['name'] for c in json.loads(r['creators']) if re.search('story|art', c['role'], re.I)]
    title = r['title_en'] or r['title_romaji']
    path = f"{OUT}/wikipedia/{r['anilist_id']}.txt"
    page, status = None, 'not found'
    if os.path.exists(path):
        status = open(path).readline().strip()
    else:
        for q in [f'{title} manga', f"{r['title_romaji']} manga", f"{title} {' '.join(creators[:1])}"]:
            s = api({'action': 'query', 'list': 'search', 'srsearch': q, 'srlimit': 5}); time.sleep(1.2)
            for hit in (s or {}).get('query', {}).get('search', []):
                p = api({'action': 'query', 'prop': 'extracts', 'explaintext': 1, 'titles': hit['title'], 'redirects': 1}); time.sleep(1.2)
                txt = ((p or {}).get('query', {}).get('pages') or [{}])[0].get('extract', '')
                surnames = [c.split()[-1] for c in creators if c]
                if 'manga' in txt.lower() and (any(sn in txt for sn in surnames) or (r['title_native'] or '@@') in txt):
                    page = (hit['title'], txt); break
            if page: break
        if page:
            t, txt = page
            parts = re.split(r'\n(==+ [^=]+ ==+)\n', txt)
            keep = [parts[0]]
            for i in range(1, len(parts) - 1, 2):
                if re.search(r'plot|synopsis|premise|story|characters|themes|reception|controvers|setting', parts[i], re.I) and not re.search(r'see also|reference', parts[i], re.I):
                    keep.append(parts[i] + '\n' + parts[i + 1][:12000])
            status = 'https://en.wikipedia.org/wiki/' + urllib.parse.quote(t.replace(' ', '_'))
            open(path, 'w').write(status + '\n' + 'Source: English Wikipedia (CC BY-SA). Use for plot facts only; do not quote on the site.\n\n' + '\n\n'.join(keep))
        print(('ok  ' if page else 'MISS') , title)
    listing.append({'anilist_id': r['anilist_id'], 'title': title, 'romaji': r['title_romaji'], 'year': r['start_year'], 'creators': '; '.join(creators),
        'english_publishers': '; '.join(p['name'] for p in json.loads(r['en_publishers'])), 'popularity_rank': len(listing) + 1,
        'anilist': f"https://anilist.co/manga/{r['anilist_id']}", 'wikipedia': status if status.startswith('http') else '',
        'wikipedia_text_file': path if os.path.exists(path) else ''})
with open(OUT + '/series-list.csv', 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=list(listing[0].keys())); w.writeheader(); w.writerows(listing)
print('done', len(listing), 'with wikipedia:', sum(1 for x in listing if x['wikipedia']))
