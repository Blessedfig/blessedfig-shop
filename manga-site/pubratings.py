"""Publisher age ratings for graded series.
English publisher comes from MangaUpdates series detail; the rating itself is read
from the publisher's own site (VIZ, Yen Press, Seven Seas). Resumable: cache in full/pubratings.json.
"""
import json, re, sqlite3, sys, time, html, unicodedata, urllib.request, urllib.parse, os

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, 'full', 'pubratings.json')
UA = {'User-Agent': 'Mozilla/5.0 (manga-guide-catalog)'}

def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return r.read().decode('utf-8', 'replace')
        except urllib.error.HTTPError as e:
            if e.code == 404: return ''
            time.sleep(5 * (i + 1))
        except Exception:
            time.sleep(5 * (i + 1))
    return ''

def slug(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    s = s.replace('&', ' and ')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

# rating label -> (display, suggested minimum age)
SCALE = {
 'viz': {'all ages': ('All Ages', 0), 'teen': ('T (Teen)', 13), 'teen plus': ('T+ (Older Teen)', 16), 'mature': ('M (Mature)', 18)},
 'yen': {'e (everyone)': ('E (Everyone)', 0), 'e': ('E (Everyone)', 0), 't (teen)': ('T (Teen)', 13), 'ot (older teen)': ('OT (Older Teen)', 16), 'm (mature)': ('M (Mature)', 18)},
 'ss': {'allages': ('All Ages', 0), 'tenplus': ('10+', 10), 'teen': ('Teen 13+', 13), 'olderteen15': ('Older Teen 15+', 15),
        'olderteen': ('Older Teen 16+', 16), 'orderteen16': ('Older Teen 16+', 16), 'olderteen17': ('Older Teen 17+', 17),
        'forreaders17': ('17+', 17), 'mature': ('Mature 18+', 18)},
}

def pubkey(name):
    n = name.lower()
    if 'viz' in n: return 'viz'
    if 'yen press' in n or n.startswith('yen '): return 'yen'
    if 'seven seas' in n or 'ghost ship' in n or 'airship' in n: return 'ss'
    if 'kodansha' in n: return 'kodansha'
    return None

def mu_detail(mu_id, full):
    r = full.execute('select detail from mu where id=?', (mu_id,)).fetchone()
    if r and r[0]: return json.loads(r[0])
    t = get(f'https://api.mangaupdates.com/v1/series/{mu_id}'); time.sleep(1.2)
    return json.loads(t) if t else None

SS = None
def seven_seas(titles):
    global SS
    if SS is None:
        page = get('https://sevenseasentertainment.com/series-list/')
        SS = {}
        for url, name, rid in re.findall(r'<a href="(https://sevenseasentertainment.com/series/[^"]+)"><strong>(.*?)</strong></a></td></td><td[^>]*><div class="age-rating" id="([^"]*)"', page, re.S):
            name = html.unescape(re.sub(r'\s+', ' ', name))
            light = 'light novel' in name.lower() or 'novel' in url
            key = slug(re.sub(r'\((manga|light novel|novel)\)', '', name, flags=re.I))
            if key not in SS or not light: SS[key] = (rid, url, light)
    for t in titles:
        hit = SS.get(slug(t))
        if hit and hit[0] in SCALE['ss'] and not hit[2]:
            return hit[0], hit[1]
    return None, None

def viz(titles):
    for t in titles:
        sl = slug(t)
        if not sl: continue
        page = get('https://www.viz.com/search?search=' + urllib.parse.quote(t)); time.sleep(1)
        links = re.findall(r'href="(/manga-books/manga/([a-z0-9-]+?)-volume-[0-9-]+/product/[0-9]+)"', page)
        sl2 = sl[4:] if sl.startswith('the-') else sl
        for link, s in links:
            rest = s[len(sl2):] if s.startswith(sl2) else None
            if rest is not None and re.fullmatch(r'(-(definitive|vizbig|3-in-1|omnibus|deluxe|perfect|edition|full-color|color))*', rest):
                p = get('https://www.viz.com' + link); time.sleep(1)
                m = re.search(r'Age Rating</strong>.*?</a>(?:&nbsp;)?\s*([A-Za-z ]+?)\s*</div>', p, re.S)
                if m: return m.group(1).strip().lower(), 'https://www.viz.com' + link
                break
    return None, None

YEN = None
def yen(titles):
    global YEN
    if YEN is None:
        sm = get('https://yenpress.com/sitemap.xml')
        YEN = re.findall(r'https://yenpress.com/titles/\d+-([a-z0-9-]+)', sm)
        YEN = {s: 'https://yenpress.com/titles/' + n for n, s in re.findall(r'https://yenpress.com/titles/(\d+-([a-z0-9-]+))', sm)}
    for t in titles:
        sl = slug(t)
        if not sl: continue
        cands = [s for s in YEN if s.startswith(sl + '-') and re.match(r'^-(manga-)?(vol|volume)-1(-manga)?$', s[len(sl):])]
        if not cands: continue
        p = get(YEN[cands[0]]); time.sleep(1)
        m = re.search(r'Age Rating</span>\s*<p class="info">([^<]+)</p>', p)
        if m: return m.group(1).strip().lower(), YEN[cands[0]]
    return None, None

def main():
    cat = sqlite3.connect(os.path.join(BASE, 'catalog.db'))
    full = sqlite3.connect(os.path.join(BASE, 'full', 'full.db'))
    out = json.load(open(OUT)) if os.path.exists(OUT) else {}
    rows = cat.execute('select anilist_id, mu_id, title_en, title_romaji from series where mu_id is not null order by popularity desc').fetchall()
    n = 0
    for aid, mu, en, ro in rows:
        prev = out.get(str(aid))
        if prev and ('rating' in prev or not any(pubkey(p) in ('viz', 'yen', 'ss') for p in prev['publishers'])): continue
        d = mu_detail(mu, full)
        if d is None: continue
        pubs = [p['publisher_name'] for p in (d.get('publishers') or []) if p.get('type') == 'English']
        keys = [k for k in (pubkey(p) for p in pubs) if k]
        titles = [x for x in [en, ro, d.get('title')] + [a.get('title') for a in (d.get('associated') or [])][:6] if x]
        rec = {'publishers': pubs}
        raws = []
        for k in keys:
            if k == 'kodansha': continue  # site blocks automated reads
            raw, url = {'viz': viz, 'yen': yen, 'ss': seven_seas}[k](titles)
            if raw: raws.append(raw)
            if raw and raw not in SCALE[k]:
                m = re.match(r'(\d+)\s*(?:&|and|\+)?\s*up', raw) or re.match(r'(\d+)\+$', raw)
                if m: SCALE[k][raw] = (m.group(1) + '+', int(m.group(1)))
                elif 'all ages' in raw or raw == 'everyone': SCALE[k][raw] = ('All Ages', 0)
            if raw and raw in SCALE[k]:
                label, age = SCALE[k][raw]
                rec.update(publisher={'viz': 'VIZ Media', 'yen': 'Yen Press', 'ss': 'Seven Seas'}[k], rating=label, min_age=age, url=url)
                break
        if raws and 'rating' not in rec: rec['unparsed'] = raws
        out[str(aid)] = rec
        n += 1
        if n % 20 == 0:
            json.dump(out, open(OUT, 'w')); print('done', n, sum('rating' in v for v in out.values()), flush=True)
    json.dump(out, open(OUT, 'w')); print('finished', len(out), sum('rating' in v for v in out.values()), flush=True)

if __name__ == '__main__':
    main()
