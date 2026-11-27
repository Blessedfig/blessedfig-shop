#!/usr/bin/env python3
"""Shared "site family" footer and tap-target fixes for every Blessed Fig Tree page.

Applies the design principles from the manga-guide app (Laws of UX):
  1. Familiar before clever (Jakob's Law): every site ends with the same list of
     sites, in the same order, with the same names.
  2. Answer the visitor's question first (Fitts's, Hick's): every tap target on a
     phone is at least 44 px tall.
  4. End at a real book (Peak-End Rule): every page ends with the shop's address
     and a link to hours and directions.

Idempotent: re-run after any page is rebuilt (the foraging pages are generated).
  python3 scripts/sitefamily.py [path/to/shop-repo] [path/to/canopy-stays-repo]
"""
import os, re, sys, glob, html

SHOP = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..'))
STAYS = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else os.path.join(os.path.dirname(SHOP), 'canopy-stays')
WWW = 'https://www.theblessedfigtree.com'

# One list, one order, one name per place.  key -> (label, url)
SITES = [
    ('visit',    'Visit the bookstore',           WWW + '/#visit'),
    ('stay',     'Stay upstairs',                 'https://stays.theblessedfigtree.com/'),
    ('manga',    'Manga guide for parents',       WWW + '/manga-guide/'),
    ('books',    'Book materials guide',          WWW + '/book-guide/'),
    ('forage',   'Foraging Langlade County',      WWW + '/foraging/'),
    ('almanac',  'Antigo Almanac',                WWW + '/almanac/'),
    ('game',     'Play The Unwritten',            WWW + '/unwritten/'),
    ('goose',    'Meet Goose Goose',              WWW + '/goose.html'),
    ('merch',    'Shirts, stickers and puzzles',  'https://the-blessed-fig-tree-llc-shop.fourthwall.com'),
    ('support',  'Support the shop on PayPal',    'https://www.paypal.me/blessedfigtree'),
]
EXTERNAL = ('merch', 'support')

FAMILY_CSS = (
    '.bft-family{display:block;clear:both;margin:22px 0 0;padding:14px 0 0;'
    'border-top:1px solid color-mix(in srgb,currentColor 28%,transparent);color:inherit;font:inherit;text-align:left}'
    '.bft-family .bft-h{margin:0;font-weight:700}'
    '.bft-family ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0 20px}'
    '.bft-family li{margin:0;padding:0}'
    '.bft-family li::before{content:none}'
    '.bft-family a{display:inline-flex;align-items:center;min-height:44px;color:inherit;'
    'text-decoration:underline;text-underline-offset:3px;text-decoration-thickness:1px}'
    '.bft-family a[aria-current]{font-weight:700;text-decoration:none}'
    '.bft-family .bft-end{margin:4px 0 0}'
    '.bft-wrap{max-width:1100px;margin:0 auto;padding:6px 20px 34px;box-sizing:border-box}'
)


def family_html(current, wrap=False):
    lis = []
    for key, label, url in SITES:
        cur = ' aria-current="page"' if key == current else ''
        ext = ' target="_blank" rel="noopener"' if key in EXTERNAL else ''
        lis.append(f'<li><a href="{url}"{cur}{ext}>{html.escape(label)}</a></li>')
    nav = ('<div class="bft-family" role="navigation" aria-label="All Blessed Fig Tree sites">'
           '<p class="bft-h">More from The Blessed Fig Tree</p>'
           f'<ul>{"".join(lis)}</ul>'
           '<p class="bft-end">Everything on these sites is free. Support helps pay for all of it. '
           'Come see us at 800 5th Ave, Antigo, Wisconsin. '
           f'<a href="{WWW}/#visit">Hours and directions</a></p></div>')
    if wrap:
        nav = f'<div class="bft-wrap">{nav}</div>'
    return f'<!-- bft-family:start --><style>{FAMILY_CSS}</style>{nav}<!-- bft-family:end -->'


# Tap targets (Fitts's Law): only on touch screens or narrow windows, so the
# desktop look of each site stays exactly as it was.
TOUCH = '@media (pointer:coarse),(max-width:760px){%s}'
SOCIAL = 'footer .lines a{display:inline-flex;align-items:center;min-height:44px}'
LEAFLET = ('.leaflet-touch .leaflet-bar a,.leaflet-bar a{width:44px;height:44px;line-height:44px;font-size:22px}'
           '.leaflet-control-attribution a{display:inline-block;padding:2px 0}')
UX = {
    'home':    SOCIAL,
    'almanac': SOCIAL + '.menu-btn{min-height:44px}.wordmark{display:inline-flex;align-items:center;min-height:44px}',
    'goose':   '#opskip{min-height:44px}section li>a,.src a{display:inline-block;padding:11px 0;margin:-11px 0}',
    'manga':   '.brand{display:inline-flex;align-items:center;min-height:44px}#foot a{display:inline-block;padding:12px 0}',
    'fhome':   'nav.jump a{display:inline-flex;align-items:center;min-height:44px}li>a,.sp b a{display:inline-block;padding:11px 0;margin:-11px 0}',
    'map':     '.chip,a.home{min-height:44px}select{min-height:44px}' + LEAFLET,
    'place':   'nav a{display:inline-flex;align-items:center;min-height:44px}li>a{display:inline-block;padding:4px 0}' + LEAFLET,
    'fguide':  ('nav.top a{display:inline-flex;align-items:center;min-height:44px}'
                'main button,.filters button,button{min-height:44px}#q{min-height:44px;font-size:16px}'
                'li>a{display:inline-block;padding:4px 0}.next a{display:inline-flex;align-items:center;min-height:44px}'),
    'fdoc':    'nav a{display:inline-flex;align-items:center;min-height:44px}li>a{display:inline-block;padding:4px 0}',
    'gguide':  'footer a{display:inline-flex;align-items:center;min-height:44px}',
    'stays':   (SOCIAL + '.menu-btn{min-height:44px}.btn.sm{min-height:44px;min-width:44px}.mo{min-height:44px}'
                'input[type=checkbox]{width:24px;height:24px}a.fd{min-width:44px;min-height:44px}a.mark{display:inline-flex;align-items:center;min-height:44px}'),
}


def ux_html(kind):
    return f'<!-- bft-ux:start --><style>{TOUCH % UX[kind]}</style><!-- bft-ux:end -->'


def strip(s, tag):
    return re.sub(rf'<!-- {tag}:start -->.*?<!-- {tag}:end -->', '', s, flags=re.S)


def apply(path, current, kind, where):
    """where: 'lines' (end of footer .lines div), 'footer' (end of first <footer>),
    'body' (before </body>), or None (tap targets only)."""
    s = open(path, encoding='utf-8').read()
    orig = s
    s = strip(strip(s, 'bft-family'), 'bft-ux')
    s = s.replace('</head>', ux_html(kind) + '</head>', 1)
    if where == 'lines':
        m = re.search(r'(<footer[^>]*>.*?<div class="lines">)(.*?)(\n\s*</div>\s*</footer>)', s, re.S)
        assert m, path
        body = m.group(2)
        # the family list replaces these one-off lines
        body = re.sub(r'\s*<div>(Shop online|Our porch guardian):.*?</div>', '', body)
        s = s[:m.start(2)] + body.rstrip() + '\n        ' + family_html(current) + '\n      ' + s[m.start(3):m.end(3)].lstrip() + s[m.end(3):]
    elif where == 'footer':
        i = s.find('</footer>')
        assert i > 0, path
        s = s[:i] + family_html(current) + s[i:]
    elif where == 'body':
        i = s.rfind('</body>')
        assert i > 0, path
        s = s[:i] + family_html(current, wrap=True) + s[i:]
    if s != orig:
        open(path, 'w', encoding='utf-8').write(s)
        return True
    return False


def main():
    J = lambda *p: os.path.join(SHOP, *p)
    jobs = [
        (J('index.html'), None, 'home', 'lines'),
        (J('almanac', 'index.html'), 'almanac', 'almanac', 'lines'),
        (J('goose.html'), 'goose', 'goose', None),          # has its own family list; see fix_goose
        (J('manga-guide', 'index.html'), 'manga', 'manga', 'body'),
        (J('book-guide', 'index.html'), 'books', 'manga', 'body'),
        (J('foraging', 'index.html'), 'forage', 'fhome', 'footer'),
        (J('foraging', 'map', 'index.html'), 'forage', 'map', 'body'),
        (J('unwritten', 'guide', 'index.html'), 'game', 'gguide', None),  # see fix_gguide
    ]
    for p in sorted(glob.glob(J('foraging', 'places', '*', 'index.html'))):
        jobs.append((p, 'forage', 'place', 'footer'))
    for p in sorted(glob.glob(J('foraging', 'field-guide', '*', 'index.html'))) + [J('foraging', 'field-guide', 'index.html')]:
        jobs.append((p, 'forage', 'fguide', 'footer'))
    for p in sorted(glob.glob(J('foraging', '*', 'index.html'))):
        if os.path.basename(os.path.dirname(p)) not in ('map', 'field-guide', 'places') and p not in [j[0] for j in jobs]:
            jobs.append((p, 'forage', 'fdoc', 'footer'))
    if os.path.exists(J('foraging', 'places', 'index.html')):
        pass  # covered by the glob above
    if os.path.isdir(STAYS):
        jobs.append((os.path.join(STAYS, 'index.html'), 'stay', 'stays', 'lines'))
    n = 0
    for path, cur, kind, where in jobs:
        if not os.path.exists(path):
            continue
        if where == 'footer' and '</footer>' not in open(path, encoding='utf-8').read():
            where = 'body'
        n += apply(path, cur, kind, where)
    n += fix_goose(J('goose.html'))
    n += fix_gguide(J('unwritten', 'guide', 'index.html'))
    print(f'{n} files changed, {len(jobs)} pages checked')


def std_links(current, home_label='Home', home_extra=''):
    return [(WWW + '/', home_label, home_extra)] + [(u, l, '') for k, l, u in SITES if k != current]


def fix_goose(path):
    """The Goose Goose page already ends with 'More from The Blessed Fig Tree'.
    Keep its pixel styling; use the standard names, order and full list."""
    s = open(path, encoding='utf-8').read()
    m = re.search(r'(<nav class="shopnav"[^>]*>.*?<ul>)(.*?)(</ul>)', s, re.S)
    if not m:
        return False
    first = re.search(r'<li>.*?</li>', m.group(2), re.S).group(0)  # Home, with the pixel fig
    first = re.sub(r'href="[^"]*"', f'href="{WWW}/"', first, count=1)
    lis = [first]
    for k, label, url in SITES:
        if k == 'goose':
            continue
        ext = ' target="_blank" rel="noopener"' if k in EXTERNAL else ''
        lis.append(f'<li><a href="{url}"{ext}><span>{html.escape(label)}</span></a></li>')
    new = '\n        ' + '\n        '.join(lis) + '\n      '
    s2 = s[:m.start(2)] + new + s[m.end(2):]
    if s2 != s:
        open(path, 'w', encoding='utf-8').write(s2)
        return True
    return False


def fix_gguide(path):
    s = open(path, encoding='utf-8').read()
    m = re.search(r'<footer>(.*?)</footer>', s, re.S)
    if not m:
        return False
    s2 = s[:m.start()] + '<footer><span>The Blessed Fig Tree, 800 5th Ave, Antigo, WI</span>' + family_html('game') + '</footer>' + s[m.end():]
    if s2 != s:
        open(path, 'w', encoding='utf-8').write(s2)
        return True
    return False


if __name__ == '__main__':
    main()
