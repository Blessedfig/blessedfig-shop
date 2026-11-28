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
    return '<div class="stack about" style="max-width:72ch">' +
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

      '<h2>Manga as a book</h2>' +
      '<p>A manga volume is an ordinary paperback, but it is bound on the other side, its pages are read right to left, and a long series fills a whole shelf. These drawings show how, without reproducing any manga’s artwork.</p>' +
      bookPlates() +

      '<h2>The culture around it</h2>' +
      '<p>Manga in Japan are read by every age, much as novels and TV are here, and the magazines are written for a particular reader: teen boys, teen girls, adult men, adult women, or young children. ' +
      'Popular series often become anime, games and merchandise, and fans meet at conventions, draw their own fan art and comics, and dress up as characters. ' +
      'For many kids, manga is a social thing: friends trade volumes, watch the anime together and talk about the characters online. ' +
      'Knowing the series your kid is reading, and what it holds up, gives you a way into that world.</p>' +

      '<h2>The main terms</h2>' + g +
      '<p class="note">Sources for the terms: general reference works and publisher information. Each series page in this guide lists its own sources.</p>' +
      '</div>';
  };
  // open straight to About, even before the catalog has loaded
  if (location.hash === '#about') { var app = document.getElementById('app'); if (app) app.innerHTML = window.viewAbout(); }
})();
