#!/usr/bin/env python3
"""The Antigo Almanac page, held to every law in Laws of UX (Yablonski, 2nd ed.).

Idempotent: everything this adds sits between <!-- alm-*:start/end --> markers. Re-run after any
rebuild of almanac/index.html, then run sitefamily.py. Maps come from scripts/almanac_maps.py
(they are inserted here too, into the entry each one belongs to).

- Jakob's law: the menu has the same names, in the same order, as the home page menu.
- Fitts's law / readability: 44 px targets on touch screens, no text under 13 px on phones.
- Tesler's law: the page marks this month and the season you are in, so the visitor doesn't have to.
- Peak-End rule: the how-to line moves to the start; the page ends on a closing card.
"""
import json, os, re

SHOP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(SHOP, 'almanac', 'index.html')
MAPS = os.path.join(SHOP, 'almanac', 'maps', 'maps.json')

MENU = [('./#shop', 'Shop merch'), ('./#stay', 'Stay upstairs'), ('./#play', 'Play the game'),
        ('manga-guide/', 'Manga guide for parents'), ('book-guide/', 'Book materials guide'), ('foraging/', 'Foraging'),
        ('almanac/', 'Almanac')]

CSS = r"""
.am-how{margin:14px 0 0;color:var(--muted);font-size:.95rem}
.am-now-tag{display:inline-block;margin-left:10px;padding:2px 9px;border-radius:999px;background:var(--maple);color:#fff;font:700 .78rem/1.5 var(--font-body);letter-spacing:.06em;text-transform:uppercase;vertical-align:middle}
.am-m.now{outline:3px solid var(--maple);outline-offset:-3px;position:relative}
.am-end{margin:34px 0 6px;padding:20px 22px;background:var(--spruce);color:var(--birch);border-radius:14px}
.am-end h2{font:600 1.35rem/1.2 var(--font-display);margin:0 0 6px;color:inherit}
.am-end p{max-width:60ch}.am-end a{color:#f3d9a8}
@media (pointer:coarse),(max-width:760px){
 #sitenav a{min-height:44px;display:inline-flex;align-items:center}
 .am-text a,.am-src a{display:inline-block;padding:12px 0;margin:-12px 0}
}
@media (max-width:760px){
 .am-n,.am-tile small,.eyebrow,.label,.am-marks b,.am-src,.am-foot,.am-l,.am-m b{font-size:13px!important}
 .am-v{font-size:13px!important;letter-spacing:-.03em}
 .am-strip{grid-template-columns:repeat(6,1fr)!important}
 body{padding-bottom:76px}
 .am-ref span,.am-ref *{font-size:13px!important}
 .am-now-tag{font-size:13px}
}
"""

JS = r"""
(function(){var m=new Date().getMonth();var seasons=document.querySelectorAll('.am-page');
document.querySelectorAll('.am-strip').forEach(function(st){var c=st.children[m];if(!c)return;c.classList.add('now');c.setAttribute('aria-current','date');c.title='This month';
 if(c.classList.contains('on')){var sum=st.closest('details').querySelector('summary');
  if(sum&&!sum.querySelector('.am-now-tag')){var t=document.createElement('span');t.className='am-now-tag';t.textContent='Now';
   var first=sum.firstChild;sum.insertBefore(t,first?first.nextSibling:null);}}});
})();
"""

END = ('<aside class="am-end" aria-label="The end of the almanac"><h2>That is Antigo\'s year</h2>'
       '<p>Every page here is also hidden somewhere in town in The Unwritten, the free game on this site. '
       'Find them all and the almanac fills in as you play. <a href="unwritten/">Play the game</a></p></aside>')


def put(s, tag, inner, before=None, after=None):
    block = f'<!-- {tag}:start -->{inner}<!-- {tag}:end -->'
    if f'<!-- {tag}:start -->' in s:
        return re.sub(rf'<!-- {tag}:start -->.*?<!-- {tag}:end -->', lambda m: block, s, count=1, flags=re.S)
    if before:
        i = s.rfind(before) if before == '</body>' else s.find(before)
        assert i >= 0, before
        return s[:i] + block + s[i:]
    i = s.find(after); assert i >= 0, after
    i += len(after)
    return s[:i] + block + s[i:]


def maps_html(entry, maps):
    """One or more map figures for an entry. Labels and the key are HTML so they stay readable on phones."""
    out = []
    for mp in maps:
        if mp['entry'] != entry:
            continue
        labels = ''.join(f'<span class="mapl{" mapl-"+l.get("k","") if l.get("k") else ""}" style="left:{l["x"]:.2f}%;top:{l["y"]:.2f}%">{l["t"]}</span>'
                         for l in mp.get('labels', []))
        key = ''.join(f'<li><i style="{k["css"]}"></i>{k["t"]}</li>' for k in mp['key'])
        w, h = mp['w'], mp['h']
        out.append(
            f'<figure class="am-map" id="map-{mp["id"]}">'
            f'<figcaption><b>{mp["title"]}</b><span>{mp["notice"]}</span></figcaption>'
            f'<a class="mapimg" href="almanac/maps/{mp["id"]}@2x.webp" data-big aria-label="Open a larger copy of this map">'
            f'<img src="almanac/maps/{mp["id"]}.webp" width="{w}" height="{h}" loading="lazy" decoding="async" alt="{mp["alt"]}">'
            f'{labels}<span class="mapzoom" aria-hidden="true">Tap to enlarge</span></a>'
            f'<ul class="mapkey">{key}</ul>'
            f'<p class="am-src">Map: {mp["source"]}</p></figure>')
    return ''.join(out)


MAP_CSS = r"""
.am-map{margin:18px 0 6px;grid-column:1/-1}
.am-map figcaption{display:flex;flex-direction:column;gap:2px;margin-bottom:8px}
.am-map figcaption b{font:600 1.12rem/1.3 var(--font-display)}
.am-map figcaption span{color:var(--ink);max-width:66ch}
.mapimg{position:relative;display:block;border:1px solid var(--rule);border-radius:10px;overflow:hidden;background:#eef0ea;line-height:0}
.mapimg img{width:100%;height:auto}
.mapl{position:absolute;transform:translate(-50%,-50%);font:600 13px/1.1 var(--font-body);color:#1f2a24;white-space:nowrap;
 text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 2px #fff;pointer-events:none;line-height:1.1}
.mapl-town{font-weight:700}.mapl-big{font:700 15px/1.1 var(--font-display)}.mapl-water{color:#1d4f66;font-style:italic;font-weight:600}
.mapzoom{position:absolute;right:8px;bottom:8px;background:#1d3328e6;color:#efe8d8;font:600 13px/1 var(--font-body);padding:7px 10px;border-radius:999px;line-height:1}
.mapkey{list-style:none;margin:10px 0 4px;padding:0;display:flex;flex-wrap:wrap;gap:6px 18px;font-size:.92rem}
.mapkey li{display:flex;align-items:center;gap:7px}
.mapkey i{display:inline-block;width:16px;height:16px;border-radius:3px;flex:none;border:1px solid #0002}
.mapdlg{border:0;padding:0;max-width:100vw;max-height:100vh;width:100vw;height:100vh;background:#111d17}
.mapdlg::backdrop{background:#000c}
.mapdlg .in{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom}
.mapdlg img{max-width:none;width:max(100%,1400px);height:auto;display:block}
.mapdlg button{position:fixed;top:12px;right:12px;min-height:44px;min-width:44px;padding:0 16px;border-radius:999px;border:0;background:#efe8d8;color:#1d3328;font:700 15px var(--font-body);cursor:pointer;z-index:2}
@media (max-width:760px){.mapl{font-size:12px}.mapl-big{font-size:13px}.mapkey{font-size:13px}}
"""

MAP_JS = r"""
(function(){var d;document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-big]');if(!a)return;
 if(!window.HTMLDialogElement)return;e.preventDefault();
 if(!d){d=document.createElement('dialog');d.className='mapdlg';d.innerHTML='<button type="button">Close</button><div class="in"><img alt=""></div>';
  document.body.appendChild(d);d.querySelector('button').onclick=function(){d.close();};d.addEventListener('click',function(ev){if(ev.target===d)d.close();});}
 var im=d.querySelector('img');im.src=a.getAttribute('href');im.alt=a.querySelector('img').alt;d.showModal();});})();
"""


def main():
    s0 = s = open(PAGE, encoding='utf-8').read()
    # Jakob: the same menu as the home page
    m = re.search(r'(<nav id="sitenav" aria-label="Sections">)(.*?)(</nav>)', s, re.S)
    menu = ''.join(f' <a href="{h}"{" aria-current=\"page\"" if t == "Almanac" else ""}>{t}</a>' for h, t in MENU) + ' '
    s = s[:m.start(2)] + menu + s[m.end(2):]
    # Peak-End and Tesler: the how-to line goes first; the page ends on a closing card
    s = s.replace('Compiled from public sources, November 2026. Tap a title to open or close a page.',
                  'Compiled from public sources, November 2026.')
    s = put(s, 'alm-how', '<p class="am-how">Tap any title to open or close its page. This month and the season you are in are marked.</p>',
            after='hidden around town.</p></div>')
    s = put(s, 'alm-end', END, before='<!-- ALMANAC END -->')
    # maps, each inside the entry it belongs to (after that entry's text)
    maps = json.load(open(MAPS)) if os.path.exists(MAPS) else []
    s = re.sub(r'<!-- alm-map-[a-z0-9-]+:start -->.*?<!-- alm-map-[a-z0-9-]+:end -->', '', s, flags=re.S)
    for entry in dict.fromkeys(mp['entry'] for mp in maps):
        i = s.find(f'<summary>{entry}</summary>')
        assert i >= 0, entry
        j = s.find('</div></details>', i)  # the entry body's closing tag: the map spans the body grid
        slug = re.sub(r'[^a-z0-9]+', '-', entry.lower()).strip('-')
        s = s[:j] + f'<!-- alm-map-{slug}:start -->{maps_html(entry, maps)}<!-- alm-map-{slug}:end -->' + s[j:]
    s = put(s, 'alm-ux', '<style>' + CSS + MAP_CSS + '</style>', before='</head>')
    s = put(s, 'alm-js', '<script>' + JS + MAP_JS + '</script>', before='</body>')
    if s != s0:
        open(PAGE, 'w', encoding='utf-8').write(s)
        print('almanac updated')
    else:
        print('no change')


if __name__ == '__main__':
    main()
