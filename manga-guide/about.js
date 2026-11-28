/* The Manga Worldview Guide: "About this guide" (#about).
   Static: it needs none of the catalog data, so it shows at once, even while the catalog is still loading.
   Plain, neutral words. Edit the text here; scripts/manga_ux.py wires it into the page. */
(function () {
  'use strict';
  var TERMS = [
    ['Who a series is written for', [
      ['Shōnen', 'Written for teen boys, usually serialized in magazines like Weekly Shōnen Jump. Action, friendship, rivals, training and growing stronger. Many of the most popular series are shōnen.'],
      ['Shōjo', 'Written for teen girls. Romance, friendship, family and feelings, often with a lighter, flowing art style.'],
      ['Seinen', 'Written for adult men. Wider range, from office comedy to war, crime and philosophy, and often more violent or more explicit.'],
      ['Josei', 'Written for adult women. Work, relationships and everyday adult life.'],
      ['Kodomo', 'Written for young children.'],
      ['A note on these labels', 'They name the magazine’s intended reader, not an age rating. A shōnen series can still be very violent, and a seinen series can be gentle. The publisher’s age rating on the back cover, and the age band in this guide, are the better guides to fit.']
    ]],
    ['Kinds of story', [
      ['Isekai', '“Another world.” Someone is carried, reborn or summoned into a fantasy or game-like world.'],
      ['Slice of life', 'Quiet, everyday stories: school, work, cooking, friendship. Little danger, lots of small moments.'],
      ['Mecha', 'Giant robots and the people who pilot them.'],
      ['Harem', 'One main character with many admirers. Often comedy, and often uses fan service.'],
      ['Fan service and ecchi', 'Scenes put in mainly to please fans, often suggestive: revealing outfits, camera angles, accidental touches. Ecchi means sexual humor and suggestive images without explicit sex.'],
      ['BL and yuri', 'Romance between two men (boys’ love, BL) or two women (yuri). Range from all-ages to adults-only.']
    ]],
    ['Around the books', [
      ['Mangaka', 'The manga artist and writer. Many draw and write their own series, with assistants and an editor.'],
      ['Chapter and volume', 'A series comes out a chapter at a time in a weekly or monthly magazine, then is collected into paperback volumes (tankōbon). English editions follow the volumes.'],
      ['Reading order', 'Most English editions keep the Japanese layout: read from the back cover, right to left, top to bottom.'],
      ['Anime', 'Japanese animation. Many popular manga become anime series, which often bring new readers to the books.'],
      ['Light novel', 'A short Japanese novel with a few illustrations. Many manga and anime are adapted from light novels.'],
      ['Manhwa, manhua and webtoons', 'Comics from Korea (manhwa) and China (manhua). Webtoons are made to scroll on a phone, often in full color.'],
      ['Otaku', 'A devoted fan of manga, anime or games. Fans now use it about themselves, often with pride.'],
      ['Cosplay', 'Dressing up as a character, most often at conventions.'],
      ['Doujinshi', 'Self-published comics by fans, often using characters from existing series.'],
      ['Scanlation', 'Unofficial fan translations posted online. This guide only covers series with an official English edition.'],
      ['Simulpub', 'A new chapter released in English on the same day it comes out in Japan, usually on a publisher’s app.']
    ]]
  ];
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  /* ---- Manga as a book: seven schematic plates (inline SVG, drawn for this guide; no manga artwork is reproduced).
     Every color comes from the page's own tokens, so the plates follow light and dark mode. 360-wide viewBoxes,
     so they read at phone width with no sideways scroll. Plate VI is drawn to scale; the others are not. ---- */
  var PCSS = '.mb-figs{display:grid;gap:16px;margin:14px 0 6px}' +
    '.mb-fig{margin:0;background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:8px;min-width:0}' +
    '.mb-fig svg{display:block;width:100%;height:auto;max-width:520px;margin:0 auto}' +
    '.mb-fig figcaption{font-size:.95rem;line-height:1.45;color:var(--ink)}' +
    '.mb-fig figcaption b{font-family:var(--f-display);font-weight:400}' +
    '.mb-fig .schem{color:var(--muted);font-size:.86rem}' +
    '.mb .ln{stroke:var(--ink);stroke-width:1.4;fill:none}' +
    '.mb .pg{fill:var(--paper);stroke:var(--ink);stroke-width:1.4}' +
    '.mb .cv{fill:var(--tone);stroke:var(--ink);stroke-width:1.4}' +
    '.mb .sp{fill:var(--muted);stroke:var(--ink);stroke-width:1.4}' +
    '.mb .ob{fill:var(--warm-soft);stroke:var(--warm);stroke-width:1.6}' +
    '.mb .hl{stroke:var(--muted);stroke-width:2;stroke-linecap:round;fill:none}' +
    '.mb .ar{stroke:var(--accent);stroke-width:2;fill:none;stroke-linecap:round}' +
    '.mb .dash{stroke-dasharray:4 4}' +
    '.mb .ah{fill:var(--accent)}' +
    '.mb .lead{stroke:var(--muted);stroke-width:1;fill:none}' +
    '.mb .dot{fill:var(--ink)}' +
    '.mb .nb{fill:var(--accent)}' +
    '.mb text{font-family:var(--f-body);font-size:12.5px;fill:var(--ink)}' +
    '.mb .b{font-weight:700}' +
    '.mb .m{fill:var(--muted);font-size:11.5px}' +
    '.mb .nt{fill:var(--panel);font-weight:700;font-size:12px}' +
    '.mb .big{font-family:var(--f-display);font-size:22px}';
  if (!document.getElementById('mb-css')) document.head.insertAdjacentHTML('beforeend', '<style id="mb-css">' + PCSS + '</style>');

  function svg(id, h, title, desc, body) {
    return '<svg class="mb" viewBox="0 0 360 ' + h + '" role="img" aria-labelledby="' + id + '-t ' + id + '-d">' +
      '<title id="' + id + '-t">' + esc(title) + '</title><desc id="' + id + '-d">' + esc(desc) + '</desc>' + body + '</svg>';
  }
  function T(x, y, s, cls, anchor) {
    return '<text x="' + x + '" y="' + y + '"' + (cls ? ' class="' + cls + '"' : '') + ' text-anchor="' + (anchor || 'middle') + '">' + esc(s) + '</text>';
  }
  function R(x, y, w, h, cls, rx) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" class="' + cls + '"' + (rx ? ' rx="' + rx + '"' : '') + '/>';
  }
  function L(x1, y1, x2, y2, cls) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="' + cls + '"/>'; }
  // straight arrow, head drawn as a filled triangle at (x2, y2)
  function A(x1, y1, x2, y2, cls) {
    var a = Math.atan2(y2 - y1, x2 - x1), s = 8, w = 4.5;
    var bx = x2 - s * Math.cos(a), by = y2 - s * Math.sin(a);
    var p = [x2 + ',' + y2, (bx + w * Math.sin(a)).toFixed(1) + ',' + (by - w * Math.cos(a)).toFixed(1), (bx - w * Math.sin(a)).toFixed(1) + ',' + (by + w * Math.cos(a)).toFixed(1)];
    return L(x1, y1, bx.toFixed(1), by.toFixed(1), 'ar' + (cls ? ' ' + cls : '')) + '<polygon class="ah" points="' + p.join(' ') + '"/>';
  }
  // curved arrow from (x1,y1) over control (cx,cy) to (x2,y2)
  function C(x1, y1, cx, cy, x2, y2) {
    var a = Math.atan2(y2 - cy, x2 - cx), s = 8, w = 4.5, bx = x2 - s * Math.cos(a), by = y2 - s * Math.sin(a);
    return '<path class="ar" d="M' + x1 + ' ' + y1 + ' Q' + cx + ' ' + cy + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1) + '"/>' +
      '<polygon class="ah" points="' + x2 + ',' + y2 + ' ' + (bx + w * Math.sin(a)).toFixed(1) + ',' + (by - w * Math.cos(a)).toFixed(1) + ' ' + (bx - w * Math.sin(a)).toFixed(1) + ',' + (by + w * Math.cos(a)).toFixed(1) + '"/>';
  }
  function N(x, y, n) { return '<circle cx="' + x + '" cy="' + y + '" r="10" class="nb"/>' + T(x, y + 4.2, String(n), 'nt'); }
  // gray placeholder lines standing in for printed text
  function lines(x, y, w, n, gap) { var s = ''; for (var i = 0; i < n; i++) s += L(x, y + i * gap, x + (i === n - 1 ? w * 0.6 : w), y + i * gap, 'hl'); return s; }

  var PLATES = [
    ['From magazine to book', 'wide', 210,
     'A thick magazine, an arrow to a single paperback volume, and an arrow to an English edition.',
     function () {
       return R(22, 34, 78, 100, 'cv') + R(22, 134, 78, 16, 'pg') + L(22, 139, 100, 139, 'ln') + L(22, 144, 100, 144, 'ln') +
         lines(32, 56, 58, 3, 10) + T(61, 110, 'many series', 'm') +
         A(108, 92, 138, 92) +
         R(150, 46, 60, 96, 'cv') + R(150, 142, 60, 7, 'pg') + lines(160, 64, 40, 2, 10) + T(180, 120, '1', 'big') +
         A(220, 92, 250, 92) +
         R(266, 42, 64, 100, 'cv') + R(266, 142, 64, 7, 'pg') + lines(276, 60, 44, 2, 10) + T(298, 118, '1', 'big') +
         T(61, 172, 'Magazine', 'b') + T(61, 188, 'a chapter a week', 'm') + T(61, 202, 'or a month', 'm') +
         T(180, 172, 'Volume', 'b') + T(180, 188, '(tankōbon): several', 'm') + T(180, 202, 'chapters, ~200 pages', 'm') +
         T(298, 172, 'English', 'b') + T(298, 188, 'edition: same', 'm') + T(298, 202, 'volumes, translated', 'm');
     },
     'A series usually first runs in a thick, cheap magazine (today often an app or website), one chapter at a time, beside many other series. The chapters are then collected into paperback volumes called tankōbon, usually around 200 pages each. English publishers usually translate those same volumes in the same order, though some combine two or three into one omnibus.'],

    ['Where the front cover is', '', 262,
     'Two books, front covers facing up. The Western book has its spine on the left and its pages turn to the left. The manga has its spine on the right and its pages turn to the right.',
     function () {
       return C(128, 46, 90, 14, 52, 46) + R(40, 56, 100, 140, 'cv') + R(40, 56, 13, 140, 'sp') + lines(66, 86, 62, 2, 12) + T(96, 140, 'front', 'm') + T(96, 154, 'cover', 'm') +
         C(232, 46, 270, 14, 308, 46) + R(220, 56, 100, 140, 'cv') + R(307, 56, 13, 140, 'sp') + lines(232, 86, 62, 2, 12) + T(264, 140, 'front', 'm') + T(264, 154, 'cover', 'm') + T(264, 182, '1', 'big') +
         T(90, 218, 'Western book', 'b') + T(90, 234, 'spine on the left,', 'm') + T(90, 250, 'pages turn left', 'm') +
         T(270, 218, 'Manga', 'b') + T(270, 234, 'spine on the right,', 'm') + T(270, 250, 'pages turn right', 'm');
     },
     'Both books are shown front cover up. A manga’s spine is on the right, so it opens from what a Western reader thinks of as the back. Many English editions put a “you’re reading the wrong way” page at the other end, where a Western reader would start. Older English editions, from the 1980s to the early 2000s, were often flipped (mirrored) to read left to right.'],

    ['Reading an open book', 'wide', 318,
     'An open manga with nine numbered panels. Reading starts at the top right of the right-hand page and moves right to left, row by row, then on to the left-hand page.',
     function () {
       var c = [[303, 73], [227, 73], [265, 150], [288, 227], [212, 227], [133, 112], [57, 73], [57, 150], [95, 227]], path = '', nums = '';
       for (var i = 0; i < c.length - 1; i++) {
         var dx = c[i + 1][0] - c[i][0], dy = c[i + 1][1] - c[i][1], d = Math.sqrt(dx * dx + dy * dy), ux = dx / d, uy = dy / d;
         path += A((c[i][0] + ux * 13).toFixed(1), (c[i][1] + uy * 13).toFixed(1), +(c[i + 1][0] - ux * 13).toFixed(1), +(c[i + 1][1] - uy * 13).toFixed(1), 'dash');
       }
       c.forEach(function (p, i) { nums += N(p[0], p[1], i + 1); });
       return R(10, 26, 340, 250, 'cv', 3) + R(14, 30, 166, 242, 'pg') + R(180, 30, 166, 242, 'pg') + L(180, 30, 180, 272, 'ln') +
         R(268, 38, 70, 70, 'ln') + R(192, 38, 70, 70, 'ln') + R(192, 114, 146, 72, 'ln') + R(238, 192, 100, 70, 'ln') + R(192, 192, 40, 70, 'ln') +
         R(98, 38, 70, 148, 'ln') + R(22, 38, 70, 70, 'ln') + R(22, 114, 70, 72, 'ln') + R(22, 192, 146, 70, 'ln') +
         T(97, 19, 'left-hand page: second', 'm') + T(263, 19, 'right-hand page: first', 'm') +
         path + nums + A(300, 296, 60, 296) + T(180, 312, 'read right to left', 'm');
     },
     'Start at the top right of the right-hand page. Read each row from right to left, then drop to the next row. A tall panel on the right (6) comes before the panels stacked beside it (7 and 8).'],

    ['Inside a panel', '', 300,
     'One panel with three numbered speech balloons, read from the top right. Below it, a Japanese balloon with vertical columns and an English balloon with horizontal lines.',
     function () {
       return R(14, 14, 332, 168, 'pg') +
         '<path class="pg" d="M258 74 L282 118 L272 72 Z"/>' + '<ellipse cx="268" cy="48" rx="62" ry="28" class="pg"/>' + lines(232, 44, 70, 2, 10) + N(320, 26, 1) +
         '<path class="pg" d="M150 96 L118 128 L140 92 Z"/>' + '<ellipse cx="160" cy="70" rx="56" ry="26" class="pg"/>' + lines(128, 66, 62, 2, 10) + N(196, 52, 2) +
         '<path class="pg" d="M76 122 L96 140 L90 116 Z"/>' + '<ellipse cx="64" cy="108" rx="40" ry="20" class="pg"/>' + lines(44, 104, 40, 2, 9) + N(98, 92, 3) +
         '<circle cx="296" cy="150" r="17" class="cv"/><path class="cv" d="M268 182 Q296 156 324 182 Z"/>' +
         '<circle cx="106" cy="154" r="15" class="cv"/><path class="cv" d="M82 182 Q106 160 130 182 Z"/>' +
         '<ellipse cx="90" cy="238" rx="38" ry="38" class="pg"/>' + L(104, 214, 104, 262, 'hl') + L(90, 210, 90, 266, 'hl') + L(76, 214, 76, 246, 'hl') + A(112, 192, 70, 192) +
         T(90, 292, 'Japanese: columns, right first', 'm') +
         '<ellipse cx="262" cy="232" rx="62" ry="30" class="pg"/>' + lines(224, 222, 76, 3, 10) + A(222, 192, 304, 192) +
         T(262, 292, 'English: lines, left to right', 'm');
     },
     'Inside a panel, balloons are read from the top right, moving left and down. Japanese editions print the words in vertical columns, read top to bottom, right column first. English editions turn the words into ordinary left-to-right lines but keep the pages and panels in Japanese order.'],

    ['Dust jacket and obi', '', 280,
     'A Japanese volume with a corner of its dust jacket folded back to show the cover underneath, and a paper band called an obi around its lower part.',
     function () {
       return R(24, 20, 140, 222, 'cv') + R(152, 20, 12, 222, 'sp') + lines(40, 72, 90, 2, 12) + T(134, 60, '1', 'big') +
         '<polygon class="pg" points="24,20 70,20 24,66"/>' + L(32, 34, 50, 34, 'hl') + L(32, 42, 44, 42, 'hl') +
         '<polygon class="cv" style="fill:var(--rule)" points="70,20 24,66 70,66"/>' +
         R(20, 168, 148, 70, 'ob') + lines(36, 190, 110, 3, 12) +
         '<circle cx="34" cy="30" r="2.5" class="dot"/>' + L(34, 30, 196, 30, 'lead') + T(202, 26, 'Cover underneath', 'b', 'start') + T(202, 42, 'often plain, or a bonus', 'm', 'start') + T(202, 56, 'drawing', 'm', 'start') +
         '<circle cx="110" cy="128" r="2.5" class="dot"/>' + L(110, 128, 196, 108, 'lead') + T(202, 100, 'Dust jacket', 'b', 'start') + T(202, 116, 'loose printed paper', 'm', 'start') + T(202, 130, 'wrapped around the cover', 'm', 'start') +
         '<circle cx="158" cy="150" r="2.5" class="dot"/>' + L(158, 150, 196, 160, 'lead') + T(202, 164, 'Spine', 'b', 'start') +
         '<circle cx="150" cy="206" r="2.5" class="dot"/>' + L(150, 206, 196, 206, 'lead') + T(202, 200, 'Obi band', 'b', 'start') + T(202, 216, 'ads or news, such as', 'm', 'start') + T(202, 230, 'a coming anime', 'm', 'start') +
         T(94, 266, 'a Japanese volume, front', 'm');
     },
     'Japanese volumes usually wear a printed paper dust jacket, and many come with an obi: a removable paper band printed with ads or news. Under the jacket the cover is often plain or has a bonus drawing. Collectors of Japanese copies often want the obi kept. Most English editions have no jacket; the art is printed straight onto a card cover.'],

    ['How big a volume is', '', 262,
     'Three books standing side by side, drawn to the same scale: a Japanese volume, a slightly taller English manga volume, and a much larger American comic book.',
     function () {
       return '<line x1="10" y1="196" x2="350" y2="196" class="ln"/>' +
         R(26, 86.4, 70.6, 109.6, 'cv') + lines(36, 104, 50, 2, 10) + T(61.3, 176, '1', 'big') +
         R(118, 76, 80, 120, 'cv') + lines(128, 94, 60, 2, 10) + T(158, 176, '1', 'big') +
         R(228, 32, 106, 164, 'cv') + lines(240, 52, 82, 2, 10) +
         T(61, 216, 'Japanese', 'b') + T(61, 232, '11.2 × 17.4 cm', 'm') +
         T(158, 216, 'English manga', 'b') + T(158, 232, 'about 5 × 7½ in', 'm') +
         T(281, 216, 'American comic', 'b') + T(281, 232, 'about 6⅝ × 10¼ in', 'm') +
         T(180, 254, 'drawn to scale', 'm');
     },
     'Drawn to scale. A common Japanese volume (the shinsho size used by most boys’ and girls’ manga) is about 11.2 × 17.4 cm (4.4 × 6.9 in), the size of a mass-market paperback. Most English editions are a little larger, about 5 × 7½ in, and some publishers go larger still. An American comic book is much larger, has far fewer pages, and is printed in color.'],

    ['Volume numbers on the spine', 'wide', 222,
     'Seven manga spines numbered 1 to 8, with a gap where volume 5 is missing.',
     function () {
       var s = '', x = 22, h = [150, 150, 150, 150, 0, 150, 150, 150];
       for (var i = 0; i < 8; i++) {
         if (i === 4) { s += '<rect x="' + x + '" y="40" width="30" height="150" class="lead dash" fill="none"/>' + T(x + 15, 120, '?', 'm'); x += 40; continue; }
         s += R(x, 40, 30, 150, 'cv') + R(x + 4, 48, 22, 26, 'pg') + T(x + 15, 66, String(i + 1), 'b') + L(x + 15, 86, x + 15, 172, 'hl');
         x += 40;
       }
       return s + L(8, 190, 352, 190, 'ln') + R(8, 190, 344, 8, 'sp') +
         T(197, 32, 'missing volume', 'm') + T(180, 216, 'shelved in volume order', 'm');
     },
     'The volume number is printed on the spine, so a series can be shelved in order and a missing volume is easy to spot. In some series the spine art lines up into one picture when the volumes stand in order.']
  ];
  function roman(n) { return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n - 1]; }
  function bookPlates() {
    return '<div class="mb-figs">' + PLATES.map(function (p, i) {
      return '<figure class="mb-fig' + (p[1] ? ' ' + p[1] : '') + '">' + svg('mbp' + (i + 1), p[2], p[0], p[3], p[4]()) +
        '<figcaption><b>Plate ' + roman(i + 1) + '. ' + esc(p[0]) + '.</b> ' + esc(p[5]) +
        (i === 5 ? '' : ' <span class="schem">Schematic drawing.</span>') + '</figcaption></figure>';
    }).join('') + '</div>';
  }

  window.viewAbout = function () {
    var g = TERMS.map(function (grp) {
      return '<section class="ab-grp"><h3>' + esc(grp[0]) + '</h3><dl class="ab-terms">' +
        grp[1].map(function (t) { return '<dt>' + esc(t[0]) + '</dt><dd>' + esc(t[1]) + '</dd>'; }).join('') + '</dl></section>';
    }).join('');
    return '<div class="stack about" style="max-width:72ch">' + '<figure class="ab-hero"><img src="../img/manga_hero.webp" width="720" height="603" alt="Three manga-style kids and a white goose cheering, holding books" decoding="async"></figure>' +
      '<h1 style="display:block">About this guide</h1>' +
      '<p class="lede">This guide tells parents what each manga holds up as a good life, in the same neutral words for every family, ' +
      'then grades it from your own tradition’s point of view, so you can choose, and talk about, what your kids read.</p>' +

      '<h2>What the guide is for</h2>' +
      '<ul class="ab-list">' +
      '<li><b>The message, not just the warnings.</b> Content labels tell you what is on the page. This guide also tells you what a series argues for: what it treats as good, what it treats as the way through hard times, and who wins and loses.</li>' +
      '<li><b>Neutral for every family.</b> Every description is written once and is the same for everyone. Choosing a tradition only changes the grade and the order, never the description.</li>' +
      '<li><b>Something to talk about.</b> Many grades say “good with talk.” The guide gives you the questions a series raises, so you can read it together or ask about it.</li>' +
      '<li><b>Real books.</b> It covers manga with an official English edition, the kind you can find on a shelf. The Blessed Fig Tree in Antigo carries the largest manga selection in North and Central Wisconsin. Ask us for any series in this guide.</li>' +
      '</ul>' +
      '<p>It is not a list of banned books, and it does not judge the art or the storytelling. It is in beta: grades are still being checked and added. ' +
      'See <a href="#method">How we grade</a> for the method, and the <a href="#explained">Glossary</a> for every tradition and philosophy in plain words.</p>' +

      '<h2>What manga is</h2>' +
      '<p>Manga are Japanese comics. Most are drawn in black and white, released a chapter at a time in magazines, and then collected into paperback volumes. ' +
      'A single series can run for years and dozens of volumes. In English, publishers such as Viz Media, Kodansha, Yen Press and Seven Seas translate the volumes and print their own age ratings on the back cover.</p>' +
      '<figure class="ab-shelf"><img src="shelf.webp" width="900" height="675" alt="A long wall of shelves at The Blessed Fig Tree packed with manga volumes, each series in a row of matching spines" loading="lazy" decoding="async"><figcaption>Manga on our shelves at The Blessed Fig Tree: each series is a row of matching paperback volumes.</figcaption></figure>' +

      '<h2>Manga as a book</h2>' +
      '<p>A manga volume is an ordinary paperback, but it is bound on the other side, its pages are read right to left, and a long series fills a whole shelf. These drawings show how, without reproducing any manga’s artwork.</p>' +
      bookPlates() +

      '<h2>The culture around it</h2>' +
      '<p>Manga in Japan are read by every age, much as novels and TV are here, and the magazines are written for a particular reader: teen boys, teen girls, adult men, adult women, or young children. ' +
      'Popular series often become anime, games and merchandise, and fans meet at conventions, draw their own fan art and comics, and dress up as characters. ' +
      'For many kids, manga is a social thing: friends trade volumes, watch the anime together and talk about the characters online. ' +
      'Knowing the series your kid is reading, and what it holds up, gives you a way into that world.</p>' +

      '<h2 id="history">A short history of manga</h2>' +
      '<h3>In Japan</h3><ol class="ab-time">' +
      '<li><b>1100s</b> The Chōjū-giga scrolls show frogs, rabbits and monkeys acting like people. Some call them the first manga; scholars disagree.</li>' +
      '<li><b>1814</b> The woodblock artist Hokusai publishes the first volume of his <i>Hokusai Manga</i>, sketchbooks of everyday life. Ten volumes followed by 1819, and five more later.</li>' +
      '<li><b>Early 1900s</b> The cartoonist Kitazawa Rakuten is the first to use the word <i>manga</i> in its modern sense.</li>' +
      '<li><b>1946–1952</b> After the war, Machiko Hasegawa’s <i>Sazae-san</i> and Osamu Tezuka’s <i>Mighty Atom</i> (Astro Boy) begin. Tezuka’s film-like storytelling shapes everything after; in 1963 Astro Boy becomes Japan’s first weekly half-hour animated TV series.</li>' +
      '<li><b>1968</b> <i>Weekly Shōnen Jump</i> launches; thick weekly magazines become the home of most hit series.</li>' +
      '<li><b>1975</b> The first Comic Market (Comiket) for fan-made comics draws about 700 people in Tokyo. By 2019 it counted about 750,000, the largest fan convention in the world.</li></ol>' +
      '<h3>In America</h3><ol class="ab-time">' +
      '<li><b>1987</b> The first regular translations: Viz, with Eclipse Comics, publishes <i>The Legend of Kamui</i>, <i>Mai the Psychic Girl</i> and <i>Area 88</i>; First Comics starts <i>Lone Wolf and Cub</i> with covers by Frank Miller.</li>' +
      '<li><b>1988</b> Marvel’s Epic Comics brings <i>Akira</i>, colorized, to American comic shops.</li>' +
      '<li><b>2002</b> Tokyopop prints manga right to left as in Japan and sells it in bookstores like Borders. U.S. manga sales grow from about $60 million in 2002 to about $210 million in 2007.</li>' +
      '<li><b>2008–2012</b> A steep fall: the financial crisis, less anime on TV, piracy, and the 2011 bankruptcy of Borders, a major seller of manga. Del Rey Manga folds in 2010 and Tokyopop closes its U.S. publishing in 2011, leaving many series out of print.</li>' +
      '<li><b>2020–2021</b> Streaming anime and the pandemic bring a boom: sales reach an all-time high in 2020 and more than double again in 2021.</li>' +
      '<li><b>Today</b> Viz sells more than half of the manga bought in the U.S., box sets and deluxe hardcovers sell strongly, and Japanese companies own most of the English publishers.</li></ol>' +
      '<h2 id="collecting">Publishers, out-of-print books, collecting and value</h2>' +
      '<p>Most manga in English comes from a handful of publishers. Each prints its name and logo on the spine, and that tells you a lot about a copy.</p>' +
      '<div class="ab-tablewrap"><table class="ab-pubs"><thead><tr><th>Publisher</th><th>Who owns it</th><th>Good to know</th></tr></thead><tbody>' +
      '<tr><td><b>Viz Media</b></td><td>Japan’s Shueisha and Shogakukan</td><td>The biggest by far: about 57 percent of manga sold in the U.S. in 2023. One Piece, Naruto, Demon Slayer, Chainsaw Man.</td></tr>' +
      '<tr><td><b>Kodansha</b> (includes Vertical)</td><td>Japan’s Kodansha</td><td>About 13 percent. Took over the Del Rey Manga series in 2010. Attack on Titan, Blue Lock.</td></tr>' +
      '<tr><td><b>Yen Press</b></td><td>Kadokawa and Hachette, founded 2006</td><td>About 13 percent. Many light novels as well as manga; rescued Fruits Basket.</td></tr>' +
      '<tr><td><b>Seven Seas</b></td><td>Media Do (bought in 2026)</td><td>About 9 percent. Was the largest independent; adult titles under its Ghost Ship imprint.</td></tr>' +
      '<tr><td><b>Dark Horse</b></td><td>A U.S. comics publisher</td><td>Berserk and other long-running classics, often in deluxe hardcovers.</td></tr>' +
      '<tr><td><b>Square Enix</b>, <b>Tokyopop</b> and others</td><td>Various</td><td>Smaller shares today. Tokyopop was once the top U.S. publisher and stopped most publishing in 2011.</td></tr>' +
      '</tbody></table></div>' +
      '<h3>Why a manga goes out of print</h3>' +
      '<ul class="ab-list"><li><b>Licenses end.</b> An English publisher only rents a series from the Japanese owner. When the contract ends, or the publisher closes, the books stop being printed.</li>' +
      '<li><b>The last volumes run out first.</b> Later volumes are printed in smaller numbers, so a series can be easy to start and hard to finish.</li>' +
      '<li><b>Quiet reprints.</b> Publishers rarely announce that a book is out of print; often it simply stops being restocked.</li>' +
      '<li><b>License rescues.</b> Another publisher may bring a series back, usually with a new translation and in thicker 2-in-1 or 3-in-1 omnibus volumes. A rescue can make the old edition cheaper overnight.</li>' +
      '<li><b>Digital often stays.</b> Many series that are gone in paper are still sold as e-books.</li></ul>' +
      '<h3>Editions you will see</h3>' +
      '<ul class="ab-list"><li><b>Single volumes</b>, the standard paperback.</li><li><b>Omnibus</b> editions that bind two or three volumes together.</li>' +
      '<li><b>Deluxe</b> or collector’s hardcovers, larger and on better paper.</li><li><b>Box sets</b> of a whole series or story arc, often with extras.</li></ul>' +
      '<h3>Collecting culture, here and abroad</h3><ul class="ab-list">' +
      '<li><b>Japan.</b> Used volumes are everywhere, in big secondhand chains and specialty shops, and whole series are sold bundled as a <i>zenkan setto</i> (complete set), usually at a discount. Collectors prize a <i>shohan</i> (first printing) that still has its <i>obi</i>, the paper band printed with publicity, and sellers note how yellowed (<i>hiyake</i>) the pages are. A complete One Piece set in first printings with every obi is listed for thousands of dollars; an ordinary used set of the same books sells for a few hundred.</li>' +
      '<li><b>Fan comics.</b> In Japan, <i>dōjinshi</i> (self-published comics, often about existing characters) are a collecting world of their own, bought at Comiket twice a year and in consignment shops.</li>' +
      '<li><b>The U.S.</b> Readers here collect to read and to display: complete runs, matching spines (some series form one picture across the spines), box sets and deluxe hardcovers. Box sets were a main reason Viz’s sales rose in 2024, and comic-shop collectors often preorder and complete whole series. A few now send Japanese first editions to be professionally graded, as with comic books.</li>' +
      '<li><b>France and Europe.</b> France is often called the world’s second-biggest manga market after Japan: about 36 million copies sold in 2024. A government culture pass that gave 18-year-olds €300 from 2021 was spent so heavily on manga that the press called it the “manga pass.” Paris hosts Japan Expo, the largest Japanese-culture convention outside Japan, with more than 250,000 visitors.</li></ul>' +
      '<h3>Collecting and value</h3>' +
      '<ul class="ab-list"><li><b>Most volumes are worth about their cover price or less used.</b> Manga is printed in large numbers; buy it to read.</li>' +
      '<li><b>Complete runs beat scattered volumes.</b> A full series in matching editions is worth more than the same books bought one at a time, especially when the last volumes are scarce.</li>' +
      '<li><b>Out-of-print editions can climb</b>, sometimes a lot, but prices swing both ways and can fall when a series is rescued or reprinted.</li>' +
      '<li><b>Condition matters.</b> Look for straight, uncreased spines, no sun fading on the spine, clean pages and no water damage.</li>' +
      '<li><b>Check the printing.</b> The copyright page lists the printing; a first printing of an early or famous volume can matter to collectors. Signed copies and numbered limited editions are scarcer.</li></ul>' +
      '<p>For how paper, printing and bindings date and value any book, see our <a href="../book-guide/">Old book guide</a>. Hunting for an out-of-print volume, or wondering about a collection? Bring it to The Blessed Fig Tree and we will take a look.</p>' +
      '<p class="note">Sources: Google Arts &amp; Culture and the British Museum on the Chōjū-giga and Hokusai Manga; University of Colorado teaching materials on Tezuka; the Comic Market committee and Japan’s government magazine Highlighting Japan on Comiket; Viz Media’s timeline, Publishers Weekly and Anime News Network on manga in America; ICv2 and Publishers Weekly on U.S. sales and box sets; Circana BookScan shares for 2023 via ComicBook.com; Arcom (2024), Anime News Network and Monocle on France; collector guides and current listings for Japanese first printings; Anime News Network’s Answerman on out-of-print books.</p>' +
      '<h2>The main terms</h2>' + g +
      '<p class="note">Sources for the terms: general reference works and publisher information. Each series page in this guide lists its own sources.</p>' +
      '</div>';
  };
  // open straight to About, even before the catalog has loaded
  if (location.hash === '#about') { var app = document.getElementById('app'); if (app) app.innerHTML = window.viewAbout(); }
})();
