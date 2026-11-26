"""Build the site data: Tier 0 catalog rows (catalog.db) + deep entries (markdown from the research thread).
Writes site/data.json and site/entries/<slug>.md. Never invents a score: series without a deep entry
show only database facts and database content signals."""
import json, os, re, sqlite3, glob, shutil, datetime
HERE = os.path.dirname(os.path.abspath(__file__))
ENTRIES = '/mnt/project-files/manga-entries'
SITE = os.path.join(HERE, 'site')

LENSES = ['Christian','Jewish','Islamic','Dharmic (Hindu/Buddhist)','Pantheist/New Age','Pagan/occult','Moralistic therapeutic deism',
 'Secular humanism','Naturalism','Classical virtue ethics','Stoicism','Utilitarianism','Critical theory','Marxism','Feminism',
 'Postmodernism','Environmentalism','Existentialism','Absurdism','Nihilism','Anti-natalism','Expressive individualism','Hedonism',
 'Consumerism','Might makes right','Traditionalism','Progressivism','Libertarianism','Collectivism/authoritarianism','Transhumanism','Pragmatism','Communitarianism','Confucian ethics']
FRAMES = json.load(open(os.path.join(HERE, 'frames.json')))
LEGACY = {'evangelicalpentecostal': ['Non-denominational Evangelical', 'Pentecostal / Charismatic'], 'jewish': ['Orthodox Jewish', 'Conservative Jewish', 'Reform Jewish']}
GROUPS = json.load(open(os.path.join(HERE, 'frame-groups.json')))
def frame_names(raw):
    key = norm(raw)
    return [F for F in FRAMES if norm(F) == key] or LEGACY.get(key) or [F for F in FRAMES if key.startswith(norm(F)) or norm(F).startswith(key)][:1] or [raw]
def concern(w):
    return next((x for x in ['Minor', 'Discuss', 'Significant'] if x.lower() in (w or '').lower()), w or '')
CATS = ['Violence','Fear and intensity','Sexuality and romance','Language','Substances','Mental health and self-harm','Imitable behavior','Commercial']

def norm(s):
    import unicodedata; s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]', '', s.lower())
def num(s):
    m = re.search(r'\d+(\.\d+)?', s or ''); return float(m.group()) if m else None

def sections(md):
    out, cur = {}, 'top'
    for line in md.splitlines():
        if line.startswith('## '): cur = line[3:].strip(); out[cur] = []
        else: out.setdefault(cur, []).append(line)
    return {k: '\n'.join(v) for k, v in out.items()}

def tables(text):
    """Return list of tables; each a list of row-cell lists (header excluded)."""
    res, cur = [], None
    for line in text.splitlines():
        if line.strip().startswith('|'):
            cells = [c.strip() for c in line.strip().strip('|').split('|')]
            if cur is None: cur = {'head': cells, 'rows': []}
            elif set(''.join(cells)) <= set('-: '): continue
            else: cur['rows'].append(cells)
        elif cur is not None: res.append(cur); cur = None
    if cur: res.append(cur)
    return res

def find_sec(secs, prefix):
    for k, v in secs.items():
        if k.lower().startswith(prefix.lower()): return v
    return ''

def clean(s): return re.sub(r'\*\*|\*', '', s or '').strip()

DIMS = ['Dignity vs honor', 'Order vs freedom', 'Civic vs kin', 'Equality vs hierarchy', 'Tradition vs secular-rational', 'Survival vs self-expression']
def load_clusters():
    p = '/mnt/project-files/manga-entries/CULTURE-CLUSTERS.md'
    if not os.path.exists(p): return []
    sec = find_sec(sections(open(p, encoding='utf-8').read()), 'Cluster positions'); out = []
    for t in tables(sec):
        for r in t['rows']:
            if len(r) < 11: continue
            try: pos = [int(float(x)) for x in r[2:8]]
            except ValueError: continue
            out.append({'name': clean(r[0]), 'group': clean(r[1]), 'pos': pos, 'values': clean(r[8]), 'source': clean(r[9]), 'status': clean(r[10])})
    return out
def load_heritage(names):
    p = '/mnt/project-files/manga-entries/CULTURE-CLUSTERS.md'
    if not os.path.exists(p): return []
    sec = find_sec(sections(open(p, encoding='utf-8').read()), 'Heritage picker'); out = []
    for t in tables(sec):
        for r in t['rows']:
            cl = [clean(x) for x in r[1].split(';') if clean(x) in names] if len(r) > 1 else []
            if cl: out.append({'name': clean(r[0]), 'clusters': cl})
    return out
def parse_folkways(secs):
    fw = find_sec(secs, 'Folkways and cultural values')
    if not fw: return None
    dims = {}
    for t in tables(fw):
        if not t['head'][0].lower().startswith('dimension'): continue
        for r in t['rows']:
            d = next((D for D in DIMS if norm(D) == norm(clean(r[0])) or norm(clean(r[0])).startswith(norm(D))), None)
            if d and len(r) > 1 and num(r[1]) is not None: dims[d] = {'pos': num(r[1]), 'evidence': clean(r[2]) if len(r) > 2 else ''}
    cl = re.search(r'Closest clusters:\s*(.+)', fw); jp = re.search(r'Japanese source culture:\s*(.+)', fw)
    if not dims: return None
    return {'dims': dims, 'closest': [clean(x) for x in cl.group(1).split(';') if clean(x)] if cl else [], 'japan': clean(jp.group(1)) if jp else ''}

def match_lens(name):
    n = norm(name)
    for L in LENSES:
        if norm(L) == n or n.startswith(norm(L.split(' ')[0].split('/')[0])): return L
    return None

def parse_entry(path):
    md = open(path, encoding='utf-8').read()
    slug = os.path.basename(path)[:-3]
    secs = sections(md)
    head = md.splitlines()[0].lstrip('# ').strip()
    top = secs.get('top', '')
    conf = re.search(r'Confidence:\s*\**([^.*]+)', md)
    e = {'slug': slug, 'heading': head, 'confidence': (lambda c: (re.match(r'(low to medium|medium to high|medium-low|medium-high|low|medium|high)', c.lower()) or re.match('(.*)', c)).group(1))(clean(conf.group(1))) if conf else 'unstated',
         'label': 'From summaries' if 'From summaries' in top else ('Full read' if 'Full read' in top else 'From summaries')}
    life = re.search(r'^\*\*(.+?)\*\*\s*$', find_sec(secs, 'Life message'), re.M)
    e['life_message'] = life.group(1) if life else None
    cs = find_sec(secs, 'Content scores')
    ov = re.search(r'Overall content level:\**\s*(\d+)', cs); e['overall'] = int(ov.group(1)) if ov else None
    e['content'] = []
    for t in tables(cs):
        if t['head'] and t['head'][0].lower().startswith('category'):
            for r in t['rows']:
                cat = next((c for c in CATS if norm(r[0]).startswith(norm(c))), clean(r[0]))
                e['content'].append({'category': cat, 'score': num(r[1]), 'raw': clean(r[1]), 'frequency': clean(r[2]) if len(r) > 2 else '',
                                     'framing': clean(r[3]) if len(r) > 3 else ''})
        if t['head'] and t['head'][0].lower().startswith('values'):
            e['values'] = [{'theme': clean(r[0]), 'presence': clean(r[1])} for r in t['rows']]
    ff = find_sec(secs, 'Family frames'); e['frames'] = []
    for t in tables(ff):
        hd = [h.lower() for h in t['head']]
        col = lambda name: next((i for i, h in enumerate(hd) if h.startswith(name)), None)
        wi, gi, ai, ci = (col('depiction') if col('depiction') is not None else col('weight')), col('grade'), col('what align'), col('what may')
        for r in t['rows']:
            key = norm(clean(r[0]))
            names = frame_names(clean(r[0]))
            get = lambda i: clean(r[i]) if i is not None and i < len(r) else ''
            wn = concern(get(wi))
            g = re.match(r'\s*([SABCDF])\b', get(gi)); 
            for n in names:
                e['frames'].append({'frame': n, 'weight': wn, 'grade': g.group(1) if g else None, 'aligns': get(ai if ai is not None else 1), 'concerns': get(ci if ci is not None else 2), 'legacy': key in LEGACY})
    e['folkways'] = parse_folkways(secs)
    wl = find_sec(secs, 'Worldview lenses'); e['lenses'] = []; e['axes'] = {}
    dom = re.search(r'Dominant lenses:\s*(.+)', wl); e['dominant'] = clean(dom.group(1)) if dom else ''
    for t in tables(wl):
        h0 = t['head'][0].lower()
        if h0.startswith('lens'):
            for r in t['rows']:
                if r[0].lower().startswith(('at 0','all other','others')) or len(r) < 3 or not num(r[1]): continue
                ci = next((i for i, h in enumerate(t['head']) if h.lower().startswith('closeness')), None)
                cg = re.match(r'\s*([SABCDF])\b', clean(r[ci])) if ci is not None and ci < len(r) else None
                e['lenses'].append({'lens': match_lens(clean(r[0])) or clean(r[0]), 'label': clean(r[0]), 'strength': num(r[1]), 'stance': clean(r[2]), 'closeness': cg.group(1) if cg else None})
        if 'axis' in h0:
            for r in t['rows']:
                k = 'community' if re.search('communit|communal|individ', r[0].lower()) else 'economic' if 'econom' in r[0].lower() else 'social' if 'social' in r[0].lower() else 'cultural' if 'cultur' in r[0].lower() else None
                if k: e['axes'][k] = num(r[1])
    mf = re.search(r'Moral foundations profile[^:]*:\**\s*(.+)', md)
    e['foundations'] = {k: int(v) for k, v in re.findall(r'(care|loyalty|fairness|sanctity|authority|liberty)\s+(\d+)', mf.group(1))} if mf else {}
    e['markdown_file'] = f'entries/{slug}.md'
    return e, md

SIGNAL_TAGS = {'Violence': ['Gore','Torture','War','Assassins','Body Horror','Cannibalism','Death Game','Massacre','Execution'],
  'Sexuality and romance': ['Nudity','Ecchi','Sexual Content','Fan Service','Large Breasts','Harem','Prostitution','Rape','Incest','Boys\' Love','Yuri','Shoujo Ai','Shounen Ai'],
  'Fear and intensity': ['Horror','Psychological','Survival','Tragedy','Body Horror'],
  'Substances': ['Drugs','Alcohol','Smoking'],
  'Mental health and self-harm': ['Suicide','Self-Harm','Bullying','Depression','Abuse','Trauma'],
  'Gender and identity': ['LGBTQ+ Themes','Transgender','Cross-Dressing','Gender Bending','Male Protagonist','Female Protagonist'],
  'Religion and spirituality': ['Religion','Gods','Mythology','Demons','Angels','Witch','Shrine Maiden','Cult','Monk']}
MU_SIGNALS = ['Explicit Violence','Gore','Sexual Content','Nudity','Rape','Suicide/s','Torture','Drugs','Religion','Christianity','Buddhism','Shinto','Cult/s','LGBT Scenes','Gay Character/s','Lesbian Character/s','Transgender Character/s','Panty Shots','Fan Service','Ecchi','Abuse','Bullying']

def main():
    db = sqlite3.connect(os.path.join(HERE, 'catalog.db')); db.row_factory = sqlite3.Row
    series = []
    for r in db.execute('select * from series order by popularity desc'):
        tags = db.execute('select tag, category, rank, is_spoiler from tags where anilist_id=? order by rank desc', (r['anilist_id'],)).fetchall()
        tagmap = {t['tag']: t['rank'] for t in tags}
        signals = {}
        for cat, names in SIGNAL_TAGS.items():
            hits = [{'tag': n, 'rank': tagmap[n], 'src': 'AniList'} for n in names if n in tagmap and tagmap[n] >= 50]
            if 'Ecchi' in json.loads(r['genres']) and cat == 'Sexuality and romance': hits.append({'tag': 'Ecchi (genre)', 'rank': None, 'src': 'AniList'})
            if hits: signals[cat] = hits
        mucats = json.loads(r['mu_categories'] or '[]')
        mu_hits = [c for c in mucats if c in MU_SIGNALS]
        desc = re.sub(r'<[^>]+>', '', r['description'] or '').split('(Source')[0].strip()
        series.append({'id': r['anilist_id'], 'mal': r['mal_id'], 'mu': r['mu_id'], 'mdex': r['mangadex_id'],
            'title': r['title_en'] or r['title_romaji'], 'romaji': r['title_romaji'], 'native': r['title_native'],
            'year': r['start_year'], 'status': r['status'], 'volumes': r['volumes'], 'genres': json.loads(r['genres']),
            'cover': r['cover'], 'popularity': r['popularity'], 'adult': bool(r['is_adult']),
            'publishers': json.loads(r['en_publishers']), 'mdex_rating': r['mdex_content_rating'],
            'creators': json.loads(r['creators']), 'signals': signals, 'mu_signals': mu_hits,
            'themes': [t['tag'] for t in tags if t['category'].startswith('Theme') and t['rank'] >= 60 and not t['is_spoiler']][:8],
            'synopsis_db': desc[:600], 'tier': r['tier'], 'match': r['match_notes']})
    by_title = {}
    for s in series:
        for k in (s['title'], s['romaji']): by_title[norm(k)] = s
    ALIAS = {'demon-slayer': 'Demon Slayer: Kimetsu no Yaiba', 'dragon-ball': 'Dragon Ball', 'jujutsu-kaisen': 'Jujutsu Kaisen', 'spy-x-family': 'SPY x FAMILY'}
    if os.path.exists(SITE): shutil.rmtree(SITE)
    os.makedirs(os.path.join(SITE, 'entries'))
    entries, unmatched = [], []
    for p in sorted(glob.glob(os.path.join(ENTRIES, '*.md'))):
        if os.path.basename(p).startswith('TEMPLATE'): continue
        e, md = parse_entry(p)
        if e['overall'] is None and not e['frames']: continue  # not a series entry (queue/notes file)
        name = ALIAS.get(e['slug']) or re.split(r'\s*\(', e['heading'])[0]
        s = by_title.get(norm(name)) or next((x for x in series if norm(x['title']).startswith(norm(name)) or norm(name) in norm(x['title'])), None)
        if s: s['entry'] = e
        else:
            unmatched.append(e['slug']); series.append({'id': None, 'title': name, 'entry': e, 'publishers': [], 'genres': [], 'signals': {}, 'mu_signals': [], 'creators': [], 'themes': [], 'tier': 'Entry only (not in pilot catalog yet)'})
        open(os.path.join(SITE, 'entries', e['slug'] + '.md'), 'w', encoding='utf-8').write(md)
        entries.append(e['slug'])
    QUICK = '/mnt/project-files/manga-quick'
    nquick = 0
    for p in sorted(glob.glob(os.path.join(QUICK, '*.json'))):
        try: q = json.load(open(p, encoding='utf-8'))
        except Exception as ex: print('bad quick entry', p, ex); continue
        s = next((x for x in series if x['id'] == q.get('anilist_id')), None)
        if not s or s.get('entry'): continue   # deep entry wins
        for l in q.get('lenses', []): l['label'] = l['lens']; l['lens'] = match_lens(l['lens']) or l['lens']
        q.update({'slug': None, 'quick': True, 'label': q.get('label', 'Quick read (from summaries)'), 'markdown_file': None,
                  'overall': max([c.get('score') or 0 for c in q.get('content', [])] or [q.get('overall') or 0])})
        flags = []
        for c in q.get('content', []):
            strong = [t['tag'] for t in s['signals'].get(c['category'], []) if (t.get('rank') or 0) >= 70]
            mu_hit = [m for m in s['mu_signals'] if (c['category'] == 'Violence' and m in ('Explicit Violence', 'Gore', 'Torture')) or (c['category'] == 'Sexuality and romance' and m in ('Sexual Content', 'Nudity', 'Rape', 'Panty Shots', 'Ecchi'))]
            if (c.get('score') or 0) <= 3 and (strong or mu_hit or (c['category'] == 'Sexuality and romance' and s.get('adult'))):
                flags.append(f"{c['category']}: database tags ({', '.join((strong + mu_hit)[:3]) or 'adult rating'}) suggest more than {c.get('score')}/10")
        q['understated'] = flags
        fr = []
        for f in q.get('frames', []):
            names = frame_names(f.get('frame', ''))
            for n in names:
                fr.append({**f, 'frame': n, 'weight': concern(f.get('depiction_concern') or f.get('weight')), 'legacy': norm(f.get('frame')) in LEGACY})
        q['frames'] = fr
        s['entry'] = q; nquick += 1
    print('quick entries:', nquick)
    out = {'built': datetime.datetime.now(datetime.UTC).strftime('%Y-%m-%d %H:%M UTC'), 'lenses': LENSES, 'frames': FRAMES, 'groups': GROUPS, 'dims': DIMS, 'clusters': (CL := load_clusters()), 'heritage': load_heritage({c['name'] for c in CL}), 'categories': CATS,
           'series': series}
    with open(os.path.join(SITE, 'data.json'), 'w', encoding='utf-8') as f: json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(len(series), 'series;', len(entries), 'deep entries; unmatched:', unmatched)
    for s in series:
        if s.get('entry') and s['entry'].get('slug'):
            e = s['entry']; print(f"  {e['slug']:20} overall={e['overall']} conf={e['confidence'][:20]!r} lenses={len(e['lenses'])} frames={len(e['frames'])} axes={e['axes']} mf={len(e['foundations'])} unmatched_lens={[l['label'] for l in e['lenses'] if l['lens'] not in LENSES]}")

if __name__ == '__main__': main()
