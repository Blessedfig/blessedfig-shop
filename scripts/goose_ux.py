#!/usr/bin/env python3
"""The Goose Goose page (goose.html), held to every law in Laws of UX (Yablonski, 2nd ed.).

Idempotent: additions sit between <!-- goose-ux*:start/end --> markers; script edits are exact string
swaps that are skipped once done. Re-run after any rebuild of goose.html.

- Jakob's law: the shop links use the same names as the home page menu.
- Fitts's law / readability: 44 px targets on touch screens, no text under 13 px on phones.
- Miller's law: the 14 section links are chunked into four labelled groups.
- Hick's law: the opening plays by itself on the first visit only (the Opening button replays it).
- Doherty threshold and ethics: phones and Save-Data get a 720p opening (7.9 MB, was 14.7 MB), and nothing
  loads the film until it is about to play; with Save-Data on it never starts by itself.
- Tesler's law: the wardrobe calendar marks this month.
- Peak-End rule: after the Goose trial the page ends on Goose Goose's real porch.
"""
import os, re

SHOP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(SHOP, 'goose.html')

NAMES = {'Visit &amp; hours': 'Visit', 'Play The Unwritten': 'Play the game', 'Manga guide': 'Manga guide for parents'}

GROUPS = {'#profile': 'Goose Goose', '#species': 'Real geese', '#domestic': 'Geese and people', '#faq': 'Play'}

CSS = r"""
.nav .navg{flex:none;align-self:center;font:800 13px var(--font-body);letter-spacing:.08em;text-transform:uppercase;color:var(--pink-2,#ff9ad0);padding:0 2px 0 10px;white-space:nowrap}
.nav .navg:first-child{padding-left:0}
.goose-now{outline:3px solid var(--pink,#ff4fa3);outline-offset:3px;border-radius:4px}
.goose-now::after{content:" \2190  this month";font-weight:800;color:var(--pink,#ff4fa3)}
.goose-end{margin-top:var(--s6,32px)}
.goose-end .btn{margin:10px 10px 0 0}
@media (pointer:coarse),(max-width:760px){
 .src a,dd a,.dl a,.panel p a{display:inline-block;padding:12px 0;margin:-12px 0;min-height:44px;min-width:44px;text-align:center;box-sizing:border-box}
 .shop-links a,.shop-more a,.shop-more summary{display:inline-flex;align-items:center;min-height:44px}
}
@media (max-width:760px){
 .topbar .wrap{flex-wrap:wrap;row-gap:0}
 .topbar .nav{order:3;flex:1 1 100%;margin:0 -4px}
 .src,.src a,.nav a,.tag,.rk,.num,.mp .num,.quiz button span,.quiz span,button.form span,.kana,.sec-intro small,.panel small{font-size:13px!important}
 .sources a{display:inline-block;padding:10px 0}
}
"""

JS = r"""
(function(){var M=['January','February','March','April','May','June','July','August','September','October','November','December'][new Date().getMonth()];
document.querySelectorAll('.panel ul.tight li b').forEach(function(b){if(b.textContent.indexOf(M)>=0&&!document.querySelector('.goose-now'))b.parentNode.classList.add('goose-now');});})();
"""

END = ('<section class="sec wrap goose-end" id="porch-visit"><div class="panel">'
       '<h2>Come say hi</h2>'
       '<p>Goose Goose stands on the porch at The Blessed Fig Tree, 800 5th Ave, Antigo, Wisconsin, dressed for whatever this month calls for. '
       'He has never moved, and he is happy to be photographed.</p>'
       '<a class="btn pink" href="./#visit">Hours and directions</a><a class="btn" href="./#shop">Goose Goose tees</a>'
       '</div></section>')

# exact swaps inside the page's own script (applied once)
SWAPS = [
    # the film loads only when it is about to play
    ('<video id="opvid" preload="auto" playsinline', '<video id="opvid" preload="none" playsinline'),
    # phones and Save-Data get the 720p copy
    ('<source src="op/opening.mp4" type="video/mp4"></video>',
     '<source src="op/opening.mp4" type="video/mp4"></video><script>(function(){var v=document.getElementById("opvid"),c=navigator.connection||{};'
     'if(c.saveData||matchMedia("(max-width:900px)").matches){v.querySelector("source").src="op/opening-720.mp4";v.load();}})();</script>'),
    # the opening plays by itself on the first visit only, and never with Save-Data on
    ('if (hashFit < 0 && !reduce) { openOpening(false); startOpening(true); }',
     'if (hashFit < 0 && !reduce && store("goose-op") !== "seen" && !((navigator.connection || {}).saveData)) { openOpening(false); startOpening(true); }'),
]


def put(s, tag, inner, before=None, after=None):
    block = f'<!-- {tag}:start -->{inner}<!-- {tag}:end -->'
    if f'<!-- {tag}:start -->' in s:
        return re.sub(rf'<!-- {tag}:start -->.*?<!-- {tag}:end -->', lambda m: block, s, count=1, flags=re.S)
    if before:
        i = s.rfind(before) if before == '</body>' else s.find(before)
    else:
        i = s.find(after) + len(after)
    assert i >= 0
    return s[:i] + block + s[i:]


def main():
    s0 = s = open(PAGE, encoding='utf-8').read()
    for a, b in SWAPS:
        if b not in s:
            assert a in s, a[:60]
            s = s.replace(a, b, 1)
    # Jakob: home-menu names in the shop bar (both the wide list and the phone list)
    m = re.search(r'<nav class="shopbar".*?</nav>', s, re.S)
    bar = m.group(0)
    for a, b in NAMES.items():
        bar = bar.replace(f'>{a}</a>', f'>{b}</a>')
    s = s[:m.start()] + bar + s[m.end():]
    # Miller: label the four groups of section links
    m = re.search(r'(<nav class="nav" aria-label="Sections">)(.*?)(</nav>)', s, re.S)
    nav = re.sub(r'<!-- goose-ux-g:start -->.*?<!-- goose-ux-g:end -->', '', m.group(2), flags=re.S)
    for href, label in GROUPS.items():
        nav = nav.replace(f'<a href="{href}">', f'<!-- goose-ux-g:start --><span class="navg" aria-hidden="true">{label}</span><!-- goose-ux-g:end --><a href="{href}">', 1)
    s = s[:m.start(2)] + nav + s[m.end(2):]
    s = put(s, 'goose-ux-end', END, before='<section class="sec wrap" id="sources">')
    s = put(s, 'goose-ux', '<style>' + CSS + '</style>', before='</head>')
    s = put(s, 'goose-ux-js', '<script>' + JS + '</script>', before='</body>')
    if s != s0:
        open(PAGE, 'w', encoding='utf-8').write(s)
        print('goose updated')
    else:
        print('no change')


if __name__ == '__main__':
    main()
