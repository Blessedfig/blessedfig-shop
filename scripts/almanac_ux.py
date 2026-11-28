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

MENU = [('./#shop', 'Shop merch'), ('./#stay', 'Stay upstairs'),
        ('manga-guide/', 'Manga guide for parents'), ('book-guide/', 'Old book guide'), ('foraging/', 'Foraging'),
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
 var sum0=st.closest('details').querySelector('summary');if(c.classList.contains('on')&&/ in Antigo$/.test(sum0.textContent.trim())){var sum=sum0;
  if(sum&&!sum.querySelector('.am-now-tag')){var t=document.createElement('span');t.className='am-now-tag';t.textContent='Now';
   var first=sum.firstChild;sum.insertBefore(t,first?first.nextSibling:null);}}});
})();
"""

END = ('<aside class="am-end" aria-label="The end of the almanac"><h2>That is Antigo\'s year</h2>'
       '<p>Seen a number here that has changed, or one you would like added? Tell us at '
       '<a href="mailto:owner@theblessedfigtree.com">owner@theblessedfigtree.com</a>, and we will look into it.</p></aside>')


# ---------- the opening: Langlade County at a glance (answer first), then the four parts as cards ----------
CREDIT = ('Photos via Wikimedia Commons: depot, opera house and log cabin by '
          '<a href="https://commons.wikimedia.org/wiki/File:Antigo_Depot.jpg">Jeff the quiet</a> (public domain); '
          'courthouse by <a href="https://commons.wikimedia.org/wiki/File:Langlade_County_Courthouse,_Antigo,_WI.jpg">TheCatalyst31</a> (CC0).')

STATS = [('888', 'square miles', 'Woods and water'), ('78%', 'of the land is forest', 'Woods and water'),
         ('19,491', 'people, 2020 Census', 'People over time'), ('843', 'lakes, 418 with public access', 'Woods and water'),
         ('130,000+', 'acres of county forest, open to the public', 'Woods and water'), ('10,562', 'acres of potatoes (2022)', 'The Antigo flats')]

PARTS = [('part-year', 'I', 'The year in Antigo', 'Seasons, weather, daylight, and what happens when.', None),
         ('part-visitors', 'II', 'Visitors', 'When the North Woods fills, and what visitors spend.', 'depot'),
         ('part-town', 'III', 'The town', 'People, homes, work, money, and what the town is worth.', 'opera'),
         ('part-land', 'IV', 'Land and history', 'Woods and water, how Antigo began, and its books.', 'cabin')]
MON = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']


def glance_html(counts):
    stats = ''.join(f'<a class="gl-stat" href="#" data-open="{e}"><b>{n}</b><span>{t}</span></a>' for n, t, e in STATS)
    cards = ''
    for pid, num, title, line, img in PARTS:
        pic = (f'<img src="almanac/img/{img}.webp" width="720" height="480" alt="" loading="lazy" decoding="async">' if img else
               '<span class="gl-year" aria-hidden="true">' + ''.join(f'<i>{m}</i>' for m in MON) + '</span>')
        cards += (f'<a class="gl-part" href="#{pid}">{pic}<span class="gl-pt"><span class="gl-num">Part {num}</span>'
                  f'<b>{title}</b><span>{line}</span><span class="gl-n">{counts.get(title, 0)} pages</span></span></a>')
    return ('<section class="glance" aria-labelledby="glance-h">'
            '<h2 id="glance-h">Langlade County at a glance</h2>'
            '<p class="gl-lede">A North Woods county of about 888 square miles, mostly forest and lakes, home to about 19,500 people. '
            'Antigo, the county seat, sits on a high, flat plain in the south, ringed by potato fields.</p>'
            '<div class="gl-grid">'
            '<figure class="gl-map"><a class="mapimg" href="almanac/maps/landcover@2x.webp" data-big aria-label="Open a larger land cover map">'
            '<img src="almanac/maps/landcover.webp" width="1000" height="792" alt="Map of Langlade County: forest across most of the county, cropland on the flats around Antigo, swamps in the north." decoding="async">'
            '<span class="mapzoom" aria-hidden="true">Tap to enlarge</span></a>'
            '<figcaption><i style="background:#3d6b4f"></i>Forest <i style="background:#769c96"></i>Swamp <i style="background:#d6aa52"></i>Cropland '
            '<i style="background:#9cc3d5"></i>Water <i style="background:#b0502a"></i>Antigo</figcaption></figure>'
            '<div class="gl-live"><button type="button" class="gl-livebtn" data-src="https://maps.google.com/maps?q=Langlade%20County%2C%20Wisconsin&amp;t=k&amp;z=9&amp;ie=UTF8&amp;output=embed">Open a live Google map (satellite view)</button>'
            '<p class="gl-livenote">Loads Google Maps only when you tap. Google runs it and sets its own cookies.</p></div>'
            '<div class="gl-stats">' + stats + '</div></div>'
            '<h2 class="gl-h2">Four parts</h2><div class="gl-parts">' + cards + '</div>'
            '<figure class="gl-court"><img src="almanac/img/courthouse.webp" width="720" height="480" alt="The red sandstone Langlade County Courthouse in Antigo, with its clock tower" loading="lazy" decoding="async">'
            '<figcaption>The Langlade County Courthouse in Antigo.</figcaption></figure>'
            '<p class="gl-credit">' + CREDIT + '</p>'
            '<h2 class="gl-h2">About these numbers</h2></section>')


GLANCE_CSS = r"""
.glance{margin:8px 0 18px}
.glance h2{font:600 1.6rem/1.2 var(--font-display);margin:0 0 6px}
.glance .gl-h2{font-size:1.3rem;margin:30px 0 12px}
.gl-lede{font-size:1.08rem;max-width:60ch;margin:0 0 16px}
.gl-grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:20px;align-items:start}
.gl-map{margin:0}.gl-map figcaption{display:flex;flex-wrap:wrap;gap:4px 14px;align-items:center;font-size:.92rem;margin-top:8px}
.gl-map figcaption i{display:inline-block;width:14px;height:14px;border-radius:3px;margin-right:-8px;border:1px solid #0002}
.gl-live{grid-column:1/2}.gl-livebtn{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--spruce-3);background:var(--sheet);color:var(--spruce);font:700 .95rem var(--font-body);cursor:pointer}
.gl-livebtn:hover{background:var(--spruce);color:var(--birch)}.gl-livenote{font-size:.85rem;color:var(--muted);margin-top:6px}
.gl-live iframe{width:100%;height:420px;border:1px solid var(--rule);border-radius:10px;display:block}
.gl-stats{grid-row:1/3;grid-column:2;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.gl-stat{display:flex;flex-direction:column;justify-content:center;min-height:92px;padding:12px 14px;background:var(--sheet);border:1px solid var(--rule);border-top:3px solid var(--spruce-3);border-radius:10px;text-decoration:none;color:var(--ink)}
.gl-stat b{font:600 1.7rem/1.1 var(--font-display);color:var(--spruce)}.gl-stat span{font-size:.95rem;color:var(--muted)}
.gl-stat:hover{border-top-color:var(--maple)}
.gl-parts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.gl-part{display:flex;flex-direction:column;background:var(--sheet);border:1px solid var(--rule);border-radius:12px;overflow:hidden;text-decoration:none;color:var(--ink);min-height:44px}
.gl-part:hover{border-color:var(--spruce-3);box-shadow:0 2px 10px #0001}
.gl-part img{width:100%;aspect-ratio:3/2;object-fit:cover;display:block}
.gl-year{display:grid;grid-template-columns:repeat(6,1fr);gap:2px;aspect-ratio:3/2;padding:10px;background:var(--spruce);align-content:center}
.gl-year i{font:700 13px/1 var(--font-body);font-style:normal;color:var(--birch);background:#ffffff14;text-align:center;padding:9px 0;border-radius:3px}
.gl-year i.now{background:var(--maple);color:#fff}
.gl-pt{display:flex;flex-direction:column;gap:3px;padding:12px 14px 14px}
.gl-num{font:700 .78rem var(--font-body);letter-spacing:.14em;text-transform:uppercase;color:var(--maple)}
.gl-pt b{font:600 1.15rem/1.2 var(--font-display)}.gl-pt span{font-size:.95rem}.gl-pt .gl-n{color:var(--muted);font-size:.88rem;margin-top:auto}
.gl-court{margin:22px 0 0}.gl-court img{width:100%;max-height:340px;object-fit:cover;border-radius:12px}
.gl-court figcaption{font-size:.92rem;color:var(--muted);margin-top:6px}
.gl-credit{font-size:.85rem;color:var(--muted);margin-top:4px}
.am-photo{margin:0 0 14px}.am-photo img{width:100%;border-radius:10px}.am-photo figcaption{font-size:.88rem;color:var(--muted);margin-top:4px}
@media (max-width:860px){.gl-grid{grid-template-columns:1fr}.gl-stats,.gl-live{grid-column:auto;grid-row:auto}.gl-parts{grid-template-columns:1fr 1fr}}
@media (max-width:760px){.gl-map figcaption,.gl-credit,.gl-pt .gl-n,.gl-num,.am-photo figcaption{font-size:13px}.gl-stat b{font-size:1.45rem}}
"""

GLANCE_JS = r"""
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.gl-livebtn');if(!b)return;var f=document.createElement('iframe');
 f.src=b.getAttribute('data-src');f.title='Live Google map of Langlade County';f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade';
 var w=b.parentNode;w.insertBefore(f,b);b.remove();});
(function(){var m=new Date().getMonth();document.querySelectorAll('.gl-year').forEach(function(y){var c=y.children[m];if(c)c.classList.add('now');});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[data-open]');if(!a)return;e.preventDefault();var want=a.getAttribute('data-open');
 var d=[].slice.call(document.querySelectorAll('details.am-page')).filter(function(x){var t=x.querySelector('summary');return t&&t.textContent.trim().indexOf(want)===0;})[0];
 if(d){d.open=true;d.scrollIntoView({block:'start'});}});})();
"""

AIR_CREDIT = 'Aerial photo: USDA National Agriculture Imagery Program (NAIP), via USGS, public domain.'
AERIALS = {
    'The town in numbers': ('air-downtown', 'Downtown Antigo from the air, about 1.2 miles across.', 'Aerial photo of downtown Antigo: a grid of streets, rooftops and trees, with two ponds to the east'),
    'The Antigo flats': ('air-potatoes', 'Fields on the flats northeast of Antigo between crops, about 2 miles across. The faint branching lines show where water drains across the fields.',
                         'Aerial photo of large square fields of bare soil and green crops northeast of Antigo'),
    'Summer in Antigo': ('air-fair', 'The Langlade County Fairgrounds in Antigo, home of the county fair and the dirt-track races, about 0.9 miles across.',
                         'Aerial photo of the fairgrounds with an oval race track, barns and parking'),
    'Woods and water': ('air-wolf', 'The Wolf River winding through forest in the east of the county, about 1 mile across.', 'Aerial photo of a dark river winding through unbroken green forest'),
    'Seasonal homes': ('air-postlake', 'Homes and cabins along the shore of Upper Post Lake in the north, about 1.9 miles across.', 'Aerial photo of a large dark lake with houses and cabins along its wooded shore'),
}

ENTRY_PHOTOS = {'Books in Antigo': ('museum', 'The 1905 Carnegie library building on Superior Street, now the historical society museum.',
                                    'The former Antigo public library, now a museum, a brick building with white columns'),
                'How Antigo began': ('cabin', 'The Deleglise cabin, built in May 1878, Antigo’s first house. Photo: Jeff the quiet, public domain.',
                                     'A small log cabin with white clapboard on one end, under large trees')}


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
            + (('<details class="maptable"><summary>The numbers by town</summary><table><thead><tr><th>Place</th><th>Estimate</th><th>Margin of error</th></tr></thead><tbody>'
                + ''.join(f'<tr><td>{a}</td><td>{b}</td><td>{c}</td></tr>' for a, b, c in mp['table']) + '</tbody></table></details>') if mp.get('table') else '') +
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
.maptable{margin:6px 0}.maptable summary{cursor:pointer;font-weight:700;min-height:44px;display:flex;align-items:center}
.maptable table{border-collapse:collapse;width:100%;font-size:.92rem}.maptable td,.maptable th{border-bottom:1px solid var(--rule);padding:6px 4px;text-align:left}
.mapkey i{display:inline-block;width:16px;height:16px;border-radius:3px;flex:none;border:1px solid #0002}
.mapdlg{border:0;padding:0;max-width:100vw;max-height:100vh;width:100vw;height:100vh;background:#111d17}
.mapdlg::backdrop{background:#000c}
.mapdlg .in{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch;touch-action:pan-x pan-y pinch-zoom}
.mapdlg img{max-width:none;width:max(100%,1400px);height:auto;display:block}
.mapdlg button{position:fixed;top:12px;right:12px;min-height:44px;min-width:44px;padding:0 16px;border-radius:999px;border:0;background:#efe8d8;color:#1d3328;font:700 15px var(--font-body);cursor:pointer;z-index:2}
@media (max-width:760px){.mapl{font-size:13px}.mapl-big{font-size:14px}.mapkey{font-size:13px}}
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
    # the opening and the part anchors
    counts = {}
    for m in re.finditer(r'<div class="am-group"(?: id="[^"]*")?><h3>(.*?)</h3>', s):
        j = m.end(); k = s.find('<div class="am-group"', j)
        counts[m.group(1)] = s[j:k if k > 0 else len(s)].count('<details class="am-page"')
    for pid, _, title, _, _ in PARTS:
        s = s.replace(f'<div class="am-group"><h3>{title}</h3>', f'<div class="am-group" id="{pid}"><h3>{title}</h3>', 1)
    s = put(s, 'alm-glance', glance_html(counts), after='<h1 class="am-h1">Antigo\'s year, in real numbers</h1>')
    for entry, (img, cap, alt) in ENTRY_PHOTOS.items():
        slug = re.sub(r'[^a-z0-9]+', '-', entry.lower()).strip('-')
        s = re.sub(rf'<!-- alm-photo-{slug}:start -->.*?<!-- alm-photo-{slug}:end -->', '', s, flags=re.S)
        i = s.find(f'<summary>{entry}</summary>'); assert i >= 0, entry
        j = s.find('<div class="am-text">', i) + len('<div class="am-text">')
        s = s[:j] + (f'<!-- alm-photo-{slug}:start --><figure class="am-photo"><img src="almanac/img/{img}.webp" width="720" height="480" '
                     f'alt="{alt}" loading="lazy" decoding="async"><figcaption>{cap}</figcaption></figure><!-- alm-photo-{slug}:end -->') + s[j:]
    # views from above, one per entry, tap to enlarge
    for entry, (img, cap, alt) in AERIALS.items():
        slug = re.sub(r'[^a-z0-9]+', '-', entry.lower()).strip('-')
        s = re.sub(rf'<!-- alm-air-{slug}:start -->.*?<!-- alm-air-{slug}:end -->', '', s, flags=re.S)
        i = s.find(f'<summary>{entry}</summary>'); assert i >= 0, entry
        j = s.find('<div class="am-text">', i) + len('<div class="am-text">')
        s = s[:j] + (f'<!-- alm-air-{slug}:start --><figure class="am-photo am-air"><a class="mapimg" href="almanac/img/{img}@2x.webp" data-big aria-label="Open a larger aerial photo">'
                     f'<img src="almanac/img/{img}.webp" width="900" height="600" alt="{alt}" loading="lazy" decoding="async"><span class="mapzoom" aria-hidden="true">From above \u00b7 tap to enlarge</span></a>'
                     f'<figcaption>{cap} {AIR_CREDIT}</figcaption></figure><!-- alm-air-{slug}:end -->') + s[j:]
    # maps, each inside the entry it belongs to (after that entry's text)
    maps = json.load(open(MAPS)) if os.path.exists(MAPS) else []
    s = re.sub(r'<!-- alm-map-[a-z0-9-]+:start -->.*?<!-- alm-map-[a-z0-9-]+:end -->', '', s, flags=re.S)
    for entry in dict.fromkeys(mp['entry'] for mp in maps):
        i = s.find(f'<summary>{entry}</summary>')
        assert i >= 0, entry
        j = s.find('</div></details>', i)  # the entry body's closing tag: the map spans the body grid
        slug = re.sub(r'[^a-z0-9]+', '-', entry.lower()).strip('-')
        s = s[:j] + f'<!-- alm-map-{slug}:start -->{maps_html(entry, maps)}<!-- alm-map-{slug}:end -->' + s[j:]
    s = put(s, 'alm-ux', '<style>' + CSS + MAP_CSS + GLANCE_CSS + '</style>', before='</head>')
    s = put(s, 'alm-js', '<script>' + JS + MAP_JS + GLANCE_JS + '</script>', before='</body>')
    if s != s0:
        open(PAGE, 'w', encoding='utf-8').write(s)
        print('almanac updated')
    else:
        print('no change')


if __name__ == '__main__':
    main()
