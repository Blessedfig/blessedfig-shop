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
