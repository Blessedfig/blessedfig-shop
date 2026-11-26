"""Extra per-series sources via public APIs: MyAnimeList (Jikan) and Anime News Network encyclopedia.
Writes ../manga-sources/mal/<anilist_id>.json and ann/<anilist_id>.xml. Facts only; never shown verbatim on the site."""
import json, os, sqlite3, sys, time, urllib.parse, urllib.request
OUT = '/mnt/project-files/manga-sources'; H = {'User-Agent': 'manga-worldview-catalog-prototype/0.1'}
def get(url, raw=False):
    for i in range(6):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=H), timeout=40) as r:
                b = r.read(); return b if raw else json.loads(b)
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            time.sleep(5 * (i + 1))
        except Exception: time.sleep(5 * (i + 1))
db = sqlite3.connect(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'catalog.db'))
for aid, mal, title, romaji in db.execute('select anilist_id, mal_id, title_en, title_romaji from series order by popularity desc'):
    mp, ap = f'{OUT}/mal/{aid}.json', f'{OUT}/ann/{aid}.xml'
    if mal and not os.path.exists(mp):
        d = get(f'https://api.jikan.moe/v4/manga/{mal}/full'); time.sleep(1.2)
        if d and d.get('data'):
            m = d['data']; keep = {k: m.get(k) for k in ['mal_id','url','title','title_english','type','chapters','volumes','status','published','score','rank','popularity','synopsis','background','genres','explicit_genres','themes','demographics','authors','serializations','relations']}
            json.dump(keep, open(mp, 'w'), ensure_ascii=False, indent=1)
    if not os.path.exists(ap):
        for t in [title, romaji]:
            if not t: continue
            x = get('https://cdn.animenewsnetwork.com/encyclopedia/api.xml?manga=~' + urllib.parse.quote(t), raw=True); time.sleep(1.1)
            if x and b'<manga' in x: open(ap, 'wb').write(x); break
    print(aid, title, os.path.exists(mp), os.path.exists(ap), flush=True)
