#!/usr/bin/env python3
"""Build book-guide/plain.html: the whole Book Guide as plain HTML that needs no JavaScript.

Why (Postel's law, progressive enhancement): the main /book-guide/ page draws its chapters with
JavaScript. This page gives the same words to anyone without it: old phones, slow connections,
screen readers that struggle, printing, and search engines.

Run after editing book-guide/materials.json or book-guide/history.json:
    python3 scripts/build_book_guide_plain.py
"""
import html
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GUIDE = os.path.join(ROOT, 'book-guide')
e = html.escape


def roman(n):
    out = ''
    for v, s in [(10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v:
            out += s
            n -= v
    return out


def century(y):
    try:
        y = int(float(y))
    except (TypeError, ValueError):
        return 'Undated'
    if y < 1500:
        return 'Before 1500'
    c = (y - 1) // 100 + 1
    suf = 'th' if 11 <= c % 100 <= 13 else {1: 'st', 2: 'nd', 3: 'rd'}.get(c % 10, 'th')
    return f'{c}{suf} century'


def main():
    G = json.load(open(os.path.join(GUIDE, 'materials.json'), encoding='utf-8'))
    hp = os.path.join(GUIDE, 'history.json')
    H = json.load(open(hp, encoding='utf-8')) if os.path.exists(hp) else None

    toc, body = [], []
    for i, c in enumerate(G['chapters'], 1):
        toc.append(f'<li><a href="#{e(c["id"])}">{e(c["name"])}</a></li>')
        body.append(f'<section id="{e(c["id"])}"><p class="eyebrow">Chapter {roman(i)}</p><h2>{e(c["name"])}</h2>')
        if c.get('intro'):
            body.append(f'<p>{e(c["intro"])}</p>')
        for en in c['entries']:
            body.append(f'<article><h3>{e(en["name"])}</h3>')
            if en.get('years'):
                body.append(f'<p class="yrs">{e(en["years"])}</p>')
            if en.get('spot'):
                body.append(f'<p><b>Look for:</b> {e(en["spot"])}</p>')
            if en.get('detail'):
                body.append(f'<p>{e(en["detail"])}</p>')
            if en.get('value'):
                body.append(f'<p class="value">{e(en["value"])}</p>')
            body.append('</article>')
        body.append('</section>')

    if H:
        n = len(G['chapters']) + 1
        toc.append('<li><a href="#history">How books changed</a></li>')
        themes = {t['id']: t['name'] for t in H.get('themes', [])}
        body.append(f'<section id="history"><p class="eyebrow">Chapter {roman(n)}</p><h2>How books changed</h2>')
        if H.get('intro'):
            body.append(f'<p>{e(H["intro"])}</p>')
        last = None
        for en in sorted(H['entries'], key=lambda x: x['yearSort']):
            c = century(en['yearSort'])
            if c != last:
                if last is not None:
                    body.append('</ol>')
                body.append(f'<h3 class="cent">{e(c)}</h3><ol class="tl">')
                last = c
            extra = ' (approximate date)' if en.get('confidence') == 'approximate' else ''
            body.append(f'<li><b>{e(str(en["year"]))}</b> <span class="th">{e(themes.get(en.get("theme"), ""))}{extra}</span><br>{e(en["event"])}')
            if en.get('onTheShelf'):
                body.append(f'<br><i>{e(en["onTheShelf"])}</i>')
            body.append('</li>')
        if last is not None:
            body.append('</ol>')
        body.append('</section>')

    page = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Book Materials Guide, text version | The Blessed Fig Tree</title>
<meta name="description" content="The Book Materials Guide as plain text: paper, leather, cloth, bindings, printing, pictures and jackets, and how books changed over time.">
<link rel="canonical" href="https://www.theblessedfigtree.com/book-guide/">
<style>
:root{{--paper:#f7f1e3;--ink:#2a2019;--muted:#5e4c3c;--rule:#c9b48c;--accent:#6b2326;--gilt-ink:#80602a}}
@media (prefers-color-scheme:dark){{:root{{--paper:#131d17;--ink:#eee5d2;--muted:#b6aa92;--rule:#33463a;--accent:#dc8f98;--gilt-ink:#d4b062;color-scheme:dark}}}}
body{{background:var(--paper);color:var(--ink);font:19px/1.6 "EB Garamond",Garamond,Georgia,"Times New Roman",serif;margin:0}}
main{{max-width:68ch;margin:0 auto;padding:24px 16px 56px}}
a{{color:var(--accent)}}
a:focus-visible{{outline:2px solid var(--accent);outline-offset:2px}}
h1,h2,h3{{font-weight:500;line-height:1.15}}
h2{{margin:48px 0 8px;border-top:3px double var(--rule);padding-top:20px}}
h3{{margin:22px 0 4px}}
.eyebrow{{margin:40px 0 0;color:var(--accent);font-variant-caps:all-small-caps;letter-spacing:.14em}}
.eyebrow+h2{{margin-top:0;border:0;padding-top:0}}
.yrs{{margin:0;font-style:italic;color:var(--gilt-ink)}}
.value{{font-style:italic}}
.muted,.th{{color:var(--muted)}}
article{{border-top:1px solid var(--rule);padding:4px 0 8px}}
nav li{{padding:9px 0}}
@media (min-width:600px){{nav ol{{columns:2;column-gap:32px}}nav li{{break-inside:avoid}}}}
.tl li{{margin:0 0 12px}}
.cent{{font-size:1.35rem}}
@media print{{nav,.back{{display:none}}body{{font-size:12pt}}}}
</style>
</head>
<body>
<main>
<p class="back"><a href="./">&larr; Back to the illustrated guide</a></p>
<h1>Materials of the Book</h1>
<p class="muted">A text-only version of the Book Materials Guide from The Blessed Fig Tree, Antigo, Wisconsin. It works without JavaScript and prints well. The illustrated version with drawn plates is at <a href="./">theblessedfigtree.com/book-guide</a>.</p>
<nav aria-label="Chapters"><h2 style="border:0;margin-top:24px">Chapters</h2><ol>{"".join(toc)}</ol></nav>
{"".join(body)}
<p class="muted" style="margin-top:48px">Written by The Blessed Fig Tree from general bookbinding, printing and conservation knowledge. Dates are approximate. Have a book like these? Bring it to 800 5th Ave, Antigo. <a href="../#visit">Hours and directions</a>.</p>
</main>
</body>
</html>
'''
    out = os.path.join(GUIDE, 'plain.html')
    open(out, 'w', encoding='utf-8').write(page)
    print('wrote', out, len(page), 'bytes')


if __name__ == '__main__':
    main()
