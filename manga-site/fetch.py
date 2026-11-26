"""Tier 0 catalog pull: AniList (popularity order) -> MangaDex (metadata only) -> MangaUpdates.
Keeps only series MangaUpdates marks as licensed in English with an English publisher.
No chapter or page endpoints are ever called."""
import json, sqlite3, sys, time, urllib.request, urllib.parse, datetime, os
DB = os.path.join(os.path.dirname(__file__), 'catalog.db')
UA = {'User-Agent': 'manga-worldview-catalog-prototype/0.1', 'Content-Type': 'application/json', 'Accept': 'application/json'}

def http(url, body=None, tries=5):
    for i in range(tries):
        try:
            req = urllib.request.Request(url, data=json.dumps(body).encode() if body else None, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 404: return None
            wait = int(e.headers.get('Retry-After') or 0) or 5 * (i + 1)
            print('  http', e.code, url[:60], 'wait', wait, file=sys.stderr); time.sleep(wait)
        except Exception as e:
            print('  err', e, file=sys.stderr); time.sleep(5 * (i + 1))
    return None

Q = '''query($page:Int){Page(page:$page,perPage:50){pageInfo{hasNextPage}
 media(type:MANGA,countryOfOrigin:JP,format_in:[MANGA,ONE_SHOT],sort:POPULARITY_DESC){
  id idMal isAdult popularity status volumes chapters startDate{year} genres description(asHtml:false)
  title{english romaji native} coverImage{large}
  tags{name category rank isMediaSpoiler}
  staff(perPage:6){edges{role node{name{full}}}} }}}'''

def mangadex(al_id, titles):
    for t in titles:
        if not t: continue
        d = http('https://api.mangadex.org/manga?' + urllib.parse.urlencode({'title': t, 'limit': 10,
              'contentRating[]': ['safe', 'suggestive', 'erotica', 'pornographic']}, doseq=True))
        time.sleep(0.3)
        for m in (d or {}).get('data', []):
            links = m['attributes'].get('links') or {}
            if str(links.get('al')) == str(al_id):
                return m['id'], m['attributes'].get('contentRating'), links.get('mu')
    return None, None, None

def mu_lookup(mu_slug, titles):
    if mu_slug:
        try:
            sid = int(mu_slug) if mu_slug.isdigit() and len(mu_slug) > 8 else int(mu_slug, 36)
            d = http(f'https://api.mangaupdates.com/v1/series/{sid}'); time.sleep(1)
            if d: return d, 'MU via MangaDex link'
        except ValueError: pass
    for t in titles:
        if not t: continue
        s = http('https://api.mangaupdates.com/v1/series/search', {'search': t, 'perpage': 5, 'type': ['Manga']}); time.sleep(1)
        for r in (s or {}).get('results', []):
            if r['hit_title'].strip().lower() == t.strip().lower():
                d = http(f"https://api.mangaupdates.com/v1/series/{r['record']['series_id']}"); time.sleep(1)
                return d, 'MU via exact title match (check)'
    return None, 'no MU match'

def main(pages):
    db = sqlite3.connect(DB); db.executescript(open(os.path.join(os.path.dirname(__file__), 'schema.sql')).read())
    kept = skipped = 0
    for page in range(1, pages + 1):
        d = http('https://graphql.anilist.co', {'query': Q, 'variables': {'page': page}}); time.sleep(2.5)
        for m in d['data']['Page']['media']:
            if db.execute('select 1 from series where anilist_id=?', (m['id'],)).fetchone(): continue
            t = m['title']; titles = [t['romaji'], t['english']]
            mid, rating, mu_slug = mangadex(m['id'], titles)
            mu, note = mu_lookup(mu_slug, titles)
            en_pubs = [{'name': p['publisher_name'], 'notes': p.get('notes', '')} for p in (mu or {}).get('publishers', []) if p.get('type') == 'English']
            licensed = bool(mu and en_pubs)  # keep partial/lapsed English licenses too; flag them
            if mu and en_pubs and not mu.get('licensed'): note += '; English license partial or lapsed per MangaUpdates'
            if not licensed:
                skipped += 1; print(f'skip  {t["romaji"]} ({note}; licensed={mu and mu.get("licensed")})'); continue
            creators = [{'name': e['node']['name']['full'], 'role': e['role']} for e in m['staff']['edges']]
            db.execute('insert or replace into series values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', (
                m['id'], m['idMal'], mu['series_id'], mid, t['english'], t['romaji'], t['native'],
                (m['startDate'] or {}).get('year'), m['status'], m['volumes'], m['chapters'], json.dumps(m['genres']),
                m['description'], m['coverImage']['large'], m['popularity'], int(m['isAdult']), 1, json.dumps(en_pubs),
                json.dumps([c['category'] for c in mu.get('categories', [])][:40]), rating, json.dumps(creators), note,
                'Tier 0 (metadata)', datetime.datetime.now(datetime.UTC).isoformat()))
            db.executemany('insert or replace into tags values (?,?,?,?,?)',
                [(m['id'], g['name'], g['category'], g['rank'], int(g['isMediaSpoiler'])) for g in m['tags']])
            db.commit(); kept += 1; print(f'keep  {t["english"] or t["romaji"]} [{rating}] {", ".join(p["name"] for p in en_pubs)}')
        if not d['data']['Page']['pageInfo']['hasNextPage']: break
    print('kept', kept, 'skipped', skipped)

if __name__ == '__main__':
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 2)
