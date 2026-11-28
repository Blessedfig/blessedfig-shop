#!/usr/bin/env python3
"""Make every foraging page follow the same Laws of UX rules the rest of the site uses.

Idempotent: re-run after any foraging page is rebuilt (build_pages.py, build_fieldguide.py),
then run sitefamily.py. Everything this script adds sits between <!-- forage-*:start/end --> markers.

What it does
- Jakob's law: one foraging nav, same names and order on every page
  (Foraging home, County map, Places, Field guide, Harvest guide, Bookstore).
- Fitts's law: 44 px tap targets on touch screens for the links that were smaller.
- Readability: no text under 13 px on phones.
- Hick's law: on phones the county map's filters fold behind one Filters button,
  and map keys start folded behind a Key button, so the map gets the first screen.
- Safety: the mushroom expert-ID line and Poison Control on every page that names mushrooms.
"""
import glob, os, re, sys

SHOP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
F = os.path.join(SHOP, 'foraging')

NAV = [('home', 'foraging/', 'Foraging home'), ('map', 'foraging/map/', 'County map'),
       ('places', 'foraging/places/', 'Places'), ('field', 'foraging/field-guide/', 'Field guide'),
       ('harvest', 'foraging/guide/', 'Harvest guide'), ('shop', './', 'Bookstore')]

SAFE = ('<b>Mushrooms:</b> never eat a wild mushroom unless an experienced identifier has checked it '
        'in person. Learn each plant in person too. Poison Control: '
        '<a href="tel:18002221222">1-800-222-1222</a>.')

CSS = r"""
.fnav{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 0;padding:0}
.fnav a{display:inline-flex;align-items:center;min-height:36px;padding:0 13px;border:1px solid color-mix(in srgb,currentColor 38%,transparent);border-radius:999px;color:inherit;text-decoration:none;font-size:.9rem;line-height:1.2;white-space:nowrap}
.fnav a:hover{background:color-mix(in srgb,currentColor 12%,transparent)}
.fnav a[aria-current]{background:color-mix(in srgb,currentColor 18%,transparent);font-weight:700}
.fsafe{background:#fbeee7;border:1px solid #e3b8a3;border-radius:10px;padding:10px 14px;margin:12px 0;font-size:.95rem;color:#1f2a24}
.fsafe a{color:inherit}
@media (pointer:coarse),(max-width:760px){
 .fnav a{min-height:44px}
 .toc a,nav.jump a{display:inline-flex;align-items:center;min-height:44px;min-width:44px;justify-content:center}
 html body li>a,html body p.cr a,html body footer a,html body .sp b a{display:inline-block;padding:12px 0;margin:-12px 0;min-width:44px}
 html body .card a.big{display:block;padding:12px 0;margin:-10px 0 -4px}
 .pin{width:30px!important;height:30px!important;line-height:30px!important;font-size:14px!important}
}
@media (max-width:760px){
 .fnav{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;margin-right:-20px;padding-right:20px}
 .fnav::-webkit-scrollbar{display:none}.fnav a{flex:none}
 .badge,.fx,.ev,span.m,.cr,.cr a,.months,.grade,.bar label,td span[style*="font-size:.8rem"]{font-size:13px!important}
 .legend,.legend div,.legend span{font-size:13px!important;line-height:1.45!important}
 .legend i{width:12px!important;height:12px!important}
 /* map keys start folded on phones: tap "Key" to open */
 .legend{cursor:pointer;min-height:44px;min-width:44px}
 .legend:not(.open){padding:0 14px!important;display:flex;align-items:center}
 .legend:not(.open)>*{display:none!important}
 .legend:not(.open)::after{content:"Key \25B8";font-weight:700;font-size:15px}
 .legend.open::before{content:"Key \25BE  (tap to fold)";display:block;font-weight:700;margin-bottom:4px}
}
"""

MAP_CSS = r"""
@media (min-width:761px){header>div:first-child{flex:1 1 320px;min-width:0}header .fnav{margin:0 0 0 auto}header .fnav a{min-height:32px;font-size:.85rem;padding:0 11px}}
#ftoggle{display:none;align-items:center;gap:6px;min-height:44px;font-weight:700}
@media (max-width:760px){
 header{padding:8px 14px 10px}header h1{font-size:1.1rem}
 header>div:first-child{flex:1 1 100%}
 #ftoggle{display:inline-flex}
 .bar:not(.open)>:not(#ftoggle):not(#weeklabel):not(#locate){display:none}
 .bar.open #weeklabel{display:none}
 .bar label{display:block;flex:1 1 100%;margin-top:6px}
 main{grid-template-rows:62vh auto!important}
}
"""

JS = r"""
(function(){var mq=matchMedia('(max-width:760px)');
document.addEventListener('click',function(e){var l=e.target.closest&&e.target.closest('.legend');
 if(!l||!mq.matches||e.target.closest('a'))return;l.classList.toggle('open');e.stopPropagation();e.preventDefault();},true);
var b=document.querySelector('.bar');if(b&&!document.getElementById('ftoggle')){var t=document.createElement('button');
 t.id='ftoggle';t.className='chip';t.type='button';t.setAttribute('aria-expanded','false');t.setAttribute('aria-controls','fbar');
 t.textContent='Filters ▾';b.id=b.id||'fbar';b.insertBefore(t,b.firstChild);
 t.addEventListener('click',function(){var o=b.classList.toggle('open');t.setAttribute('aria-expanded',o);t.textContent=o?'Done ▴':'Filters ▾';});}
})();
"""


def strip(s, tag):
    return re.sub(rf'<!-- {tag}:start -->.*?<!-- {tag}:end -->', '', s, flags=re.S)


def put(s, tag, inner, before):
    """Replace the marked block in place (so other scripts' blocks keep their order), or insert it."""
    block = f'<!-- {tag}:start -->{inner}<!-- {tag}:end -->'
    if f'<!-- {tag}:start -->' in s:
        return re.sub(rf'<!-- {tag}:start -->.*?<!-- {tag}:end -->', lambda m: block, s, count=1, flags=re.S)
    i = s.rfind(before) if before == '</body>' else s.find(before)
    return s[:i] + block + s[i:]


def nav_html(cur, sub=False, extra=''):
    out = []
    for k, href, label in NAV:
        cu = ' aria-current="%s"' % ('true' if sub else 'page') if k == cur else ''
        out.append(f'<a href="{href}"{cu}>{label}</a>')
    return ('<!-- forage-nav:start --><nav class="fnav" aria-label="Foraging pages">'
            + ''.join(out) + extra + '</nav><!-- forage-nav:end -->')


def apply(path, cur, sub=False, extra='', is_map=False, safe=None):
    s0 = s = open(path, encoding='utf-8').read()
    # 1. one nav: swap the old nav (or our earlier one) for the shared nav
    nav = nav_html(cur, sub, extra)
    if '<!-- forage-nav:start -->' in s:
        s = re.sub(r'<!-- forage-nav:start -->.*?<!-- forage-nav:end -->', lambda m: nav, s, count=1, flags=re.S)
    elif is_map:
        s, n = re.subn(r'(?:<a class="home"[^>]*>.*?</a>\s*)+', lambda m: nav, s, count=1, flags=re.S)
        assert n, path
    else:
        s, n = re.subn(r'<nav class="top">.*?</nav>', lambda m: nav, s, count=1, flags=re.S)
        assert n, path
    # 2. styles and the small script
    s = put(s, 'forage-ux', '<style>' + CSS + (MAP_CSS if is_map else '') + '</style>', '</head>')
    s = put(s, 'forage-js', f'<script>{JS}</script>', '</body>')
    # 3. the mushroom line, where a page names mushrooms but has no warning
    s = strip(s, 'forage-safe')
    if safe:
        anchor, how = safe
        block = f'<!-- forage-safe:start --><p class="fsafe">{SAFE}</p><!-- forage-safe:end -->'
        j = s.find(anchor)
        assert j >= 0, (path, anchor)
        j = j + len(anchor) if how == 'after' else j
        s = s[:j] + block + s[j:]
    if s != s0:
        open(path, 'w', encoding='utf-8').write(s)
        return 1
    return 0


def front(path):
    """The front page keeps its hero buttons as its nav; same names, plus the safety line up top."""
    s0 = s = open(path, encoding='utf-8').read()
    if '<!-- forage-hero:start -->' not in s:  # first run: drop the old hero buttons
        s = re.sub(r'<a class="cta" href="foraging/map/">.*?(?=\s*</div></section>)',
                   '', s, count=1, flags=re.S)
    hero = ('<!-- forage-hero:start --><a class="cta" href="foraging/map/">Open the county map</a>'
            '<a class="cta ghost" href="foraging/places/">Places</a>'
            '<a class="cta ghost" href="foraging/field-guide/">Field guide</a>'
            '<a class="cta ghost" href="foraging/guide/">Harvest guide</a>'
            '<p class="fsafe" style="margin-top:14px">' + SAFE + ' <a href="#rules">The rules in one minute</a>.</p>'
            '<!-- forage-hero:end -->')
    if '<!-- forage-hero:start -->' in s:
        s = re.sub(r'<!-- forage-hero:start -->.*?<!-- forage-hero:end -->', lambda m: hero, s, count=1, flags=re.S)
    else:
        s = s.replace('</div></section>', hero + '</div></section>', 1)
    s = put(s, 'forage-ux', '<style>' + CSS + '.hero .fsafe{font-size:.95rem;max-width:46em}'
            '.cta{min-height:44px;display:inline-flex;align-items:center}</style>', '</head>')
    if s != s0:
        open(path, 'w', encoding='utf-8').write(s)
        return 1
    return 0


def main():
    J = lambda *p: os.path.join(F, *p)
    n = 0
    n += front(J('index.html'))
    n += apply(J('map', 'index.html'), 'map', is_map=True)
    n += apply(J('guide', 'index.html'), 'harvest')
    n += apply(J('field-guide', 'index.html'), 'field')
    pages = 3
    for p in sorted(glob.glob(J('field-guide', '*', 'index.html'))):
        n += apply(p, 'field', sub=True); pages += 1
    n += apply(J('places', 'index.html'), 'places', safe=('<main>', 'after'))
    pr = '<a href="#" class="noprint" onclick="window.print();return false">Print this map</a>'
    for p in sorted(glob.glob(J('places', '*', 'index.html'))):
        n += apply(p, 'places', sub=True, extra=pr, safe=('<footer>', 'before')); pages += 1
    print(f'{n} files changed, {pages + 2} pages checked')


if __name__ == '__main__':
    main()
