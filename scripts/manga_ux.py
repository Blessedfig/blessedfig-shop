#!/usr/bin/env python3
"""The Manga Worldview Guide (manga-guide/index.html), held to every law in Laws of UX (Yablonski, 2nd ed.).

Idempotent: added blocks sit between <!-- manga-ux*:start/end --> markers; edits to the page's own script are
exact string swaps, skipped once applied. Re-run after anyone edits manga-guide/index.html. Never touches
data.json (the scheduled guide process owns it).

- Answer first (Jakob, Tesler): what the guide is for and what manga is, in three lines on the front, and a full
  About page (#about, in about.js) that needs no catalog data, so it shows at once.
- Doherty threshold: the catalog is about 11 MB to download and about 48 MB to unpack. Until it arrives, the page
  shows the intro and a real progress bar instead of "Loading the catalog…".
- Postel's law: title search ignores case, accents, punctuation and word order ("spy family" finds SPY x FAMILY).
- Fitts / readability: 44 px targets on touch screens, no text under 13 px on phones.
- Peak-End rule: every view ends at the real shelf.
"""
import os, re

SHOP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE = os.path.join(SHOP, 'manga-guide', 'index.html')
DATA = [os.path.join(SHOP, 'manga-guide', f) for f in ('data.slim.json', 'realign.slim.json')]

LEDE = ("A neutral guide for parents of every background: what each English-licensed manga holds up as a good life, "
        "graded S to F from your own tradition's view.</p>")
WHAT = ('<p class="whatis">Manga are Japanese comics, usually read right to left and collected in paperback volumes. '
        'Each one is described here in the same neutral words for everyone; your tradition only changes the grade. '
        '<a href="#about">What manga is, and what this guide is for</a></p>')

SWAPS = [
    # Readers with no tradition picked: search first, grades clearly optional, the neutral reading stands alone
    ('<div class="finder"><div class="sel"><label for="profile" class="trad">Your tradition${profileSelect',
     '<div class="finder">${findBox()}<div class="sel"><label for="profile" class="trad">Your tradition (optional)${profileSelect'),
    ("</select></label></div>\n    ${findBox()}</div></section>`;", "</select></label></div></div></section>`;"),
    ('<label for="find" class="eyebrow">Have a title in mind?</label>', '<label for="find" class="eyebrow">Search any manga to see what it teaches</label>'),
    ("${f ? gradeTile(f.g, f.prov, 'sm') : gradeTile(null, false, 'sm')}<span>${esc(s.title)}${s.year?` <span class=\"count\">${esc(s.year)}</span>`:''}</span></a>`;",
     "${f ? gradeTile(f.g, f.prov, 'sm') : (state.profile ? gradeTile(null, false, 'sm') : '')}<span>${esc(s.title)}${s.year?` <span class=\"count\">${esc(s.year)}</span>`:''}${!state.profile && s.entry && mainFn(s.entry) ? (m => `<span class=\"hitmf\"><b>${VERB[m.k].replace('Argues ','')}</b> ${esc(PLAIN[m.lens] || m.lens)}</span>`)(mainFn(s.entry)) : ''}</span></a>`;"),
    ("h += `<section class=\"verdict\">${fit ? gradeTile(fit.g, fit.prov, 'lg') : gradeTile(null,false,'lg')}",
     "h += `<section class=\"verdict${p ? '' : ' nop'}\">${fit ? gradeTile(fit.g, fit.prov, 'lg') : (p ? gradeTile(null,false,'lg') : '')}"),
    ('<label class="eyebrow" for="profile2">Grade for</label>', '<label class="eyebrow" for="profile2">${p ? \'Grade for\' : \'Grade for your family (optional)\'}</label>'),
    (": 'This tradition has not been graded for this series yet.'}</p></div>",
     ": (p ? 'This tradition has not been graded for this series yet.' : 'You do not need to pick a tradition. Everything above describes this series the same way for every reader. Pick one only if you want a grade from your family\\u2019s point of view, or <a href=\"#\" data-open=\"How every tradition grades it\">see how all ' + e.frames.length + ' traditions grade it</a>.')}</p></div>"),
    # Doherty: two-step catalog. The first screen comes from small copies (data.slim.json, realign.slim.json,
    # made by scripts/manga_slim.py); the full files then load in the background and the view is redrawn in place.
    ("\nconst RALIGN = fetch('realign.json',", "\nlet RALIGN = fetch('realign.json',"),
    ("\nfetch('data.json', {cache: 'no-cache'}).then(r=>r.json())", "\nfunction LOADCAT() { return fetch('data.json', {cache: 'no-cache'}).then(r=>r.json())"),
    ("Wikipedia.`; render(); })", "Wikipedia.`; MRENDER(); })"),
    ("could not load. Reload the page to try again.</p>'; });\n</script>",
     "could not load. Reload the page to try again.</p>'; }); }\n"
     "LOADCAT().then(() => { if (!window.MSLIM) return; const FULL = /^#(s-|e-|method)/; const go = () => { if (!window.MSLIM) return; window.MSLIM = false; window.MPHASE2 = true; "
     "RALIGN = fetch('realign.json', {cache: 'no-cache'}).then(r => r.ok ? r.json() : null).catch(() => null); RLOAD = null; R = null; return LOADCAT(); }; "
     "if ((navigator.connection || {}).saveData && !FULL.test(location.hash)) { const h = () => { if (FULL.test(location.hash)) { window.removeEventListener('hashchange', h); go(); } }; window.addEventListener('hashchange', h); return; } "
     "return go(); });\n</script>"),
    (".catch(()=>{ $('#app').innerHTML = '<p class=\"empty\">The catalog could not load.", ".catch(()=>{ if (window.MPHASE2) return; $('#app').innerHTML = '<p class=\"empty\">The catalog could not load."),
    # a route for the About page
    ("else if (h === 'values') html = viewValues();",
     "else if (h === 'about' && window.viewAbout) { html = viewAbout(); view = 'about'; } else if (h === 'values') html = viewValues();"),
    ("['popular','browse','ideas','values','deep','explained','method'].includes(view)",
     "['popular','browse','ideas','values','deep','explained','method','about'].includes(view)"),
    # the About page works before the catalog has loaded
    ("function render() {", "function render() { if (!D) { if (location.hash === '#about' && window.viewAbout) $('#app').innerHTML = viewAbout(); return; }"),
    # About first in the Explore cards and menu
    ("const EXPLORE = [", "const EXPLORE = [['#about','About this guide','What manga is, the culture around it, the main terms, and what this guide is for.'],"),
    ('<div class="menu-list">\n', '<div class="menu-list">\n<a href="#about" data-view="about">About this guide</a>\n'),
    # the three-line answer under the front headline
    (LEDE, LEDE + WHAT),
    # Postel: forgiving title search
    (".filter(s => [s.title, s.romaji, s.native].some(x => (x||'').toLowerCase().includes(q)))",
     ".filter(s => { const w = mnorm(q).split(' ').filter(Boolean), t = mnorm([s.title, s.romaji, s.native].join(' ')); return (w.length && w.every(x => t.includes(x))) || (s.native||'').includes(q); })"),
]

CSS = r"""
.whatis{margin:12px 0 0;max-width:60ch;color:var(--ink)}
.hitmf{display:block;font-size:.88rem;color:var(--muted)}.hitmf b{color:var(--fig,#6d3a5f)}
.verdict.nop{grid-template-columns:1fr}.verdict a{color:var(--fig,#6d3a5f);font-weight:700}
.finder .find{margin-bottom:12px}
.whatis a{font-weight:700;color:var(--fig,#6d3a5f)}
.mload{max-width:60ch;margin:8px 0 28px}
.mload h1{margin:0 0 10px}
.mload .bar{height:10px;border-radius:999px;background:var(--rule,#e2d9c8);overflow:hidden;margin:18px 0 6px}
.mload .bar i{display:block;height:100%;width:2%;background:var(--fig,#6d3a5f);transition:width .2s}
.mload .note{margin:0}
.about h2{margin-top:28px}.about h3{margin:22px 0 6px;font-size:1.05rem}
.ab-list{padding-left:1.2em}.ab-list li{margin:.5em 0}
.ab-terms{margin:0;display:grid;grid-template-columns:minmax(120px,12em) 1fr;gap:8px 18px}
.ab-terms dt{font-weight:700}.ab-terms dd{margin:0}
@media (max-width:620px){.ab-terms{grid-template-columns:1fr;gap:2px}.ab-terms dd{margin-bottom:10px}}
.mshelf{margin:40px auto 0;padding:20px 22px;border-radius:14px;background:var(--fig,#6d3a5f);color:#fffdf8;max-width:1100px}
.mshelf h2{margin:0 0 6px;color:inherit}.mshelf p{margin:0;max-width:62ch}.mshelf a{color:#ffe7a8;font-weight:700}
@media (pointer:coarse),(max-width:760px){
 a.back{min-width:44px;justify-content:center;display:inline-flex;align-items:center}
 .whatis a,.ab-list a,.about p a{display:inline-block;padding:10px 0;margin:-10px 0}
}
@media (max-width:760px){
 span.tp,.brand small,label.trad,.sel label,.eyebrow,.find label{font-size:13px!important}
 .mshelf{margin:32px 14px 0}
}
"""

HEAD_JS = r"""
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('[data-open]'); if (!a) return; e.preventDefault();
  var want = a.getAttribute('data-open');
  var d = [].slice.call(document.querySelectorAll('#app details')).filter(function (x) { var t = x.querySelector('summary'); return t && t.textContent.indexOf(want) >= 0; })[0];
  if (d) { d.open = true; d.scrollIntoView({block: 'start'}); }
});
window.mnorm = function (t) { return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); };
(function () {
  window.MSLIM = true;
  window.MRENDER = function () {
    if (!window.MPHASE2) { render(); return; }
    var a = document.activeElement;
    if (a && a.closest && a.closest('#app') && /INPUT|SELECT|TEXTAREA/.test(a.tagName)) { a.addEventListener('blur', function () { window.MRENDER(); }, {once: true}); return; }
    var y = window.scrollY; render(); window.scrollTo(0, y);
  };
  var T = %TOTALS%, got = {}, tot = 0, k;
  for (k in T) tot += T[k];
  var of = window.fetch;
  function upd() { var g = 0; for (var k in got) g += got[k]; var p = Math.max(2, Math.min(99, Math.round(g / tot * 100)));
    var b = document.getElementById('mload-bar'), t = document.getElementById('mload-pct');
    if (b) b.style.width = p + '%'; if (t) t.textContent = p + '%'; }
  window.fetch = function (u, o) {
    var name = String(u).split('?')[0].split('/').pop();
    if (window.MSLIM && (name === 'data.json' || name === 'realign.json')) { name = name.replace('.json', '.slim.json'); u = name; }
    else return of.apply(this, arguments);
    if (!window.ReadableStream || !window.Response) return of.call(this, u, o);
    return of.call(this, u, o).then(function (r) {
      if (!r.ok || !r.body || !r.body.getReader) return r;
      var rd = r.body.getReader(), parts = []; got[name] = 0;
      function pump() { return rd.read().then(function (x) {
        if (x.done) return new Response(new Blob(parts), {status: r.status, statusText: r.statusText, headers: {'Content-Type': 'application/json'}});
        parts.push(x.value); got[name] += x.value.length; upd(); return pump(); }); }
      return pump();
    });
  };
})();
"""

LOADING = ('<div class="mload" role="status"><h1>What is your kid reading, and what does it teach?</h1>'
           '<p class="lede">' + LEDE + WHAT +
           '<div class="bar" aria-hidden="true"><i id="mload-bar"></i></div>'
           '<p class="note">Loading more than 3,000 manga and their grades: <span id="mload-pct">0%</span>. '
           'The first visit takes a little while on a phone; after that it opens quickly.</p></div>')

SHELF = ('<aside class="mshelf" aria-label="Find them on the shelf"><h2>Find them on the shelf</h2>'
         '<p>The Blessed Fig Tree, 800 5th Ave, Antigo, carries the largest manga selection in North and Central Wisconsin. '
         'Bring a list from this guide, or ask us about any series. <a href="../#visit">Hours and directions</a></p></aside>')


def put(s, tag, inner, before):
    block = f'<!-- {tag}:start -->{inner}<!-- {tag}:end -->'
    if f'<!-- {tag}:start -->' in s:
        return re.sub(rf'<!-- {tag}:start -->.*?<!-- {tag}:end -->', lambda m: block, s, count=1, flags=re.S)
    i = s.find(before)
    assert i >= 0, before
    return s[:i] + block + s[i:]


def main():
    import subprocess
    subprocess.run(['python3', os.path.join(SHOP, 'scripts', 'manga_slim.py')], check=True)
    s0 = s = open(PAGE, encoding='utf-8').read()
    for a, b in SWAPS:
        if b not in s:
            assert a in s, a[:70]
            s = s.replace(a, b, 1)
    totals = '{' + ','.join(f'"{os.path.basename(p)}":{os.path.getsize(p)}' for p in DATA) + '}'
    s = put(s, 'manga-ux', '<style>' + CSS + '</style><script>' + HEAD_JS.replace('%TOTALS%', totals) + '</script>'
            '<script src="about.js" defer></script>', '</head>')
    # Doherty: a real first screen while the catalog loads
    s = re.sub(r'(<main class="wrap" id="app">)(?:<p class="empty">Loading the catalog…</p>|<!-- manga-ux-load:start -->.*?<!-- manga-ux-load:end -->)',
               lambda m: m.group(1) + '<!-- manga-ux-load:start -->' + LOADING + '<!-- manga-ux-load:end -->', s, count=1, flags=re.S)
    assert 'manga-ux-load:start' in s
    s = put(s, 'manga-ux-shelf', SHELF, '<footer class="wrap" id="foot">')
    if s != s0:
        open(PAGE, 'w', encoding='utf-8').write(s)
        print('manga guide updated')
    else:
        print('no change')


if __name__ == '__main__':
    main()
