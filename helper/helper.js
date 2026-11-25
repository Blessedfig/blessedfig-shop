/*
 * The Blessed Fig Tree: "Ask a question" helper.
 * Static only: no server, no API keys, no external calls. The answers live in faq.json next to this file,
 * fetched the first time the panel opens. Matching runs entirely in the visitor's browser.
 *
 * Page options (optional, on the <script> tag):
 *   data-faq="/helper/faq.json"   where to load the answers from (default: faq.json beside this script)
 *   data-root="/"                 prefix for the answers' site links (default "/")
 *   data-hide="/unwritten/"       comma-separated path prefixes where the button is never shown
 *
 * In node, require('./helper.js') returns the matcher for testing; no DOM is touched.
 */
(function (global) {
  "use strict";

  // ---------------------------------------------------------------------------
  //  The matcher: normalize, stem-lite, synonyms, keyword + token overlap scoring
  // ---------------------------------------------------------------------------

  var STOP = toSet(
    "a an the is are was were be been being am do does did doing i im me my mine we our ours you your yours u ur " +
    "it its this that these those there here to of in on at for with and or but can could would should will shall " +
    "may might must have has had having get got gets just about please tell know want wanna need like any some " +
    "so than then from by as up into if also too very really much many more most one ones thing things " +
    "hi hello hey thanks thank ok okay yes no not dont cant isnt arent wont youre theyre whats wheres hows " +
    "they them their he she his her him who whom whose which what why how where when " +
    "go going come coming see look find let lets make im ive id ill guys yall shop store fig tree blessed figtree"
  );

  // Question words carry a little intent. They count for less than content words.
  var INTENT = {
    when: ["#time"], where: ["#where"], whats: [], what: [], how: [], who: ["#who"]
  };

  // Phrases are rewritten before splitting into words.
  var PHRASES = [
    [/\bd\s*&\s*d\b|\bd and d\b|\bdungeons? (and|&) dragons?\b/g, " dnd "],
    [/\bwhat time\b|\bhow late\b|\bhow early\b|\bstay open\b/g, " #time time "],
    [/\bbook ?clubs?\b/g, " bookclub "],
    [/\bgift ?cards?\b|\bgift certificates?\b/g, " giftcard "],
    [/\btrade[- ]?ins?\b|\btrade in\b/g, " tradein "],
    [/\bcheck[- ]?in\b/g, " checkin "],
    [/\bcheck[- ]?out\b/g, " checkout "],
    [/\bhow much\b/g, " price "],
    [/\bvideo ?games?\b/g, " game "],
    [/\bair ?bnb\b/g, " airbnb "],
    [/\bwi[- ]?fi\b/g, " wifi "],
    [/\bsci[- ]fi\b/g, " scifi "],
    [/\bnon[- ]fiction\b/g, " nonfiction "],
    [/\bpre[- ]?order\b/g, " preorder "],
    [/\btouch ?screen\b/g, " touchscreen "],
    [/\bd[- ]pad\b/g, " dpad "],
    [/\bw ?a ?s ?d\b/g, " wasd "],
    [/\b(\d+)[- ]?(years?|yrs?)[- ]?olds?\b/g, " $1 yearold "],
    [/\b(\d+)\s*\+/g, " $1plus "],
    [/\bs to f\b|\bs-f\b/g, " sgrade "],
    [/\btechno[- ]puritan\b/g, " technopuritan "],
    [/\bsecond[- ]?hand\b|\bpre[- ]?owned\b/g, " used "],
    [/\bworld ?view\b/g, " worldview "]
  ];

  // Word -> extra concept tokens. Both the visitor's words and each entry's words go through this,
  // so "when do you close" and an entry keyed on "hours" meet at #time.
  var SYN = {
    hour: ["#time"], hrs: ["#time"], open: ["#time"], close: ["#time"], closed: ["#time"], closing: ["#time"],
    opening: ["#time"], today: ["#time"], tonight: ["#time"], late: ["#time"], early: ["#time"], schedule: ["#time"],
    monday: ["#day"], tuesday: ["#day"], wednesday: ["#day"], thursday: ["#day"], friday: ["#day"], saturday: ["#day"],
    sunday: ["#day"], weekend: ["#day"], weekday: ["#day"], mon: ["#day"], tue: ["#day"], tues: ["#day"], wed: ["#day"],
    thu: ["#day"], thur: ["#day"], thurs: ["#day"], fri: ["#day"], sat: ["#day"], sun: ["#day"],
    address: ["#where"], located: ["#where"], location: ["#where"], directions: ["#where"], map: ["#where"],
    street: ["#where"], avenue: ["#where"], ave: ["#where"],
    park: ["#park"], parking: ["#park"], car: ["#park"], lot: ["#park"], vehicle: ["#park"], drive: ["#park"],
    phone: ["#contact", "#device"], call: ["#contact"], text: ["#contact"], email: ["#contact"], mail: ["#contact"],
    contact: ["#contact"], reach: ["#contact"], number: ["#contact"], message: ["#contact"],
    manga: ["#manga"], comic: ["#manga"], comics: ["#manga"], anime: ["#manga"], shonen: ["#manga"], shojo: ["#manga"],
    shounen: ["#manga"], shoujo: ["#manga"], mangas: ["#manga"],
    game: ["#game"], games: ["#game"], rpg: ["#game"], jrpg: ["#game"], unwritten: ["#game"], videogame: ["#game"],
    play: ["#game"], playing: ["#game"], player: ["#game"],
    save: ["#save"], saves: ["#save"], saved: ["#save"], saving: ["#save"], savegame: ["#save"], progress: ["#save"],
    continue: ["#save"], lost: ["#save"], deleted: ["#save"], erased: ["#save"],
    mobile: ["#device"], iphone: ["#device"], android: ["#device"], tablet: ["#device"], ipad: ["#device"],
    touch: ["#device"], touchscreen: ["#device"], cell: ["#device"], cellphone: ["#device"], chromebook: ["#device"],
    kid: ["#kid"], kids: ["#kid"], child: ["#kid"], children: ["#kid"], son: ["#kid"], daughter: ["#kid"],
    toddler: ["#kid"], teen: ["#kid"], teenager: ["#kid"], grandkid: ["#kid"], grandkids: ["#kid"], family: ["#kid"],
    yearold: ["#age"], age: ["#age"], ages: ["#age"], old: ["#age"], appropriate: ["#age"], suitable: ["#age"],
    "7plus": ["#age"], "10plus": ["#age"], "13plus": ["#age"], "16plus": ["#age"], "18plus": ["#age"],
    grade: ["#grade"], grades: ["#grade"], graded: ["#grade"], grading: ["#grade"], sgrade: ["#grade"], letter: ["#grade"],
    religion: ["#faith"], religious: ["#faith"], faith: ["#faith"], tradition: ["#faith"], traditions: ["#faith"],
    christian: ["#faith"], catholic: ["#faith"], baptist: ["#faith"], muslim: ["#faith"], islam: ["#faith"],
    jewish: ["#faith"], buddhist: ["#faith"], secular: ["#faith"], evangelical: ["#faith"], denomination: ["#faith"],
    church: ["#faith"], technopuritan: ["#faith"], lds: ["#faith"], mormon: ["#faith"], atheist: ["#faith"],
    stay: ["#stay"], apartment: ["#stay"], apartments: ["#stay"], airbnb: ["#stay"], rental: ["#stay"], rent: ["#stay"],
    lodging: ["#stay"], hotel: ["#stay"], motel: ["#stay"], sleep: ["#stay"], upstairs: ["#stay"], overnight: ["#stay"],
    room: ["#stay"], bedroom: ["#stay"],
    buy: ["#buy"], purchase: ["#buy"], sell: ["#sell"], selling: ["#sell"], sold: ["#sell"], carry: ["#sell"],
    stock: ["#sell"], tradein: ["#tradein"], trade: ["#tradein"], donate: ["#tradein"], consign: ["#tradein"],
    used: ["#used"], snack: ["#snack"], snacks: ["#snack"], candy: ["#snack"], chips: ["#snack"], drink: ["#snack"],
    drinks: ["#snack"], soda: ["#snack"], pop: ["#snack"], treats: ["#snack"], food: ["#snack"],
    tea: ["#tea"], coffee: ["#tea"], latte: ["#tea"], espresso: ["#tea"], cafe: ["#tea"],
    dnd: ["#ttrpg"], tabletop: ["#ttrpg"], ttrpg: ["#ttrpg"], pathfinder: ["#ttrpg"], roleplaying: ["#ttrpg"],
    event: ["#event"], events: ["#event"], bookclub: ["#event"], club: ["#event"], signing: ["#event"], storytime: ["#event"],
    almanac: ["#almanac"], statistics: ["#almanac"], stats: ["#almanac"], census: ["#almanac"], population: ["#almanac"],
    pay: ["#pay"], payment: ["#pay"], card: ["#pay"], cards: ["#pay"], credit: ["#pay"], debit: ["#pay"], cash: ["#pay"],
    venmo: ["#pay"], visa: ["#pay"], mastercard: ["#pay"],
    price: ["#price"], prices: ["#price"], cost: ["#price"], costs: ["#price"], expensive: ["#price"], cheap: ["#price"],
    dog: ["#pet"], dogs: ["#pet"], pet: ["#pet"], pets: ["#pet"], cat: ["#pet"], puppy: ["#pet"],
    wheelchair: ["#access"], accessible: ["#access"], accessibility: ["#access"], ramp: ["#access"], stairs: ["#access"],
    disability: ["#access"], disabled: ["#access"], stroller: ["#access"],
    recommend: ["#rec"], recommendation: ["#rec"], recommendations: ["#rec"], suggest: ["#rec"], suggestion: ["#rec"],
    finished: ["#wip"], unfinished: ["#wip"], complete: ["#wip"], done: ["#wip"], wip: ["#wip"], beta: ["#wip"],
    bug: ["#wip"], bugs: ["#wip"], glitch: ["#wip"], broken: ["#wip"],
    controls: ["#controls"], keys: ["#controls"], keyboard: ["#controls"], buttons: ["#controls"], wasd: ["#controls"],
    controller: ["#controls"], gamepad: ["#controls"], instructions: ["#controls"],
    giftcard: ["#giftcard"], voucher: ["#giftcard"],
    gift: ["#gift"], gifts: ["#gift"], present: ["#gift"], souvenir: ["#gift"], art: ["#gift"], artist: ["#gift"],
    holiday: ["#holiday"], holidays: ["#holiday"], christmas: ["#holiday"], thanksgiving: ["#holiday"], easter: ["#holiday"],
    goose: ["#goose"], honk: ["#goose"],
    review: ["#review"], reviews: ["#review"], rating: ["#review"], stars: ["#review"],
    fantasy: ["#fantasy"], scifi: ["#fantasy"], dragons: ["#fantasy"], wizard: ["#fantasy"],
    special: [], order: ["#order"], preorder: ["#order"], request: ["#order"], reserve: ["#order"], hold: ["#order"]
  };

  function toSet(s) { var o = Object.create(null); s.split(/\s+/).forEach(function (w) { if (w) o[w] = true; }); return o; }

  function normalize(s) {
    s = String(s || "").toLowerCase();
    if (s.normalize) s = s.normalize("NFKD").replace(/[̀-ͯ]/g, "");
    s = s.replace(/[‘’']/g, "").replace(/&/g, " & ");
    for (var i = 0; i < PHRASES.length; i++) s = s.replace(PHRASES[i][0], PHRASES[i][1]);
    s = s.replace(/&/g, " and ");
    return s.replace(/[^a-z0-9#+]+/g, " ").replace(/\s+/g, " ").trim();
  }

  // A light stemmer: plurals, -ing, -ed and a final e, applied the same way to both sides.
  function stem(w) {
    if (w.charAt(0) === "#" || /^\d/.test(w) || w.length <= 3) return w;
    if (/ies$/.test(w) && w.length > 4) w = w.slice(0, -3) + "y";
    else if (/sses$/.test(w)) w = w.slice(0, -2);
    else if (/s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    if (/ing$/.test(w) && w.length > 5) w = undouble(w.slice(0, -3));
    else if (/ed$/.test(w) && w.length > 4) w = undouble(w.slice(0, -2));
    if (/e$/.test(w) && w.length > 3) w = w.slice(0, -1);
    return w;
  }
  function undouble(w) { return /([^aeiouls])\1$/.test(w) ? w.slice(0, -1) : w; }

  // Returns a list of {t, w}: tokens with a weight (content words 1, intent words and concepts less).
  function analyze(text, keepStop) {
    var norm = normalize(text), out = [], seen = Object.create(null);
    function add(t, w) { if (!(t in seen) || seen[t] < w) { seen[t] = w; } }
    norm.split(" ").forEach(function (raw) {
      if (!raw) return;
      if (INTENT[raw]) { INTENT[raw].forEach(function (c) { add(c, 0.5); }); return; }
      if (raw.charAt(0) === "#") { add(raw, 0.7); return; }
      var syn = SYN[raw] || SYN[stem(raw)];
      if (syn) syn.forEach(function (c) { add(c, 0.7); });
      if (!keepStop && STOP[raw]) return;
      if (raw.length < 2 && !/\d/.test(raw)) return;
      add(stem(raw), 1);
    });
    for (var t in seen) out.push({ t: t, w: seen[t] });
    return out;
  }

  // Damerau-free edit distance, capped (for typos like "mnaga" or "hourse").
  function editDist(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; var best = i;
      for (j = 1; j <= b.length; j++) {
        var c = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) c = Math.min(c, prev[j - 2] === undefined ? c : prev[j - 2] + 1);
        cur[j] = c; if (c < best) best = c;
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  var FIELD_W = { q: 2, k: 3, kp: 1.8, a: 0.6 };

  function buildIndex(data) {
    var entries = Array.isArray(data) ? data : (data && data.entries) || [];
    var docs = entries.map(function (e, i) {
      var tw = Object.create(null), phrases = [];
      function put(list, fw) { list.forEach(function (x) { var v = fw * x.w; if (!(x.t in tw) || tw[x.t] < v) tw[x.t] = v; }); }
      put(analyze(e.q), FIELD_W.q);
      (e.keywords || []).forEach(function (k) {
        // a one-word keyword is a strong signal; the words inside a phrase are weaker, and the whole phrase earns a bonus
        var nk = normalize(k), multi = nk.indexOf(" ") > 0;
        put(analyze(k), multi ? FIELD_W.kp : FIELD_W.k);
        if (multi) phrases.push(nk);
      });
      put(analyze(e.a), FIELD_W.a);
      return { i: i, e: e, tw: tw, phrases: phrases, nq: normalize(e.q) };
    });
    var df = Object.create(null);
    docs.forEach(function (d) { for (var t in d.tw) if (d.tw[t] >= FIELD_W.q * 0.5) df[t] = (df[t] || 0) + 1; });
    var N = docs.length, idf = Object.create(null), vocab = [];
    for (var t in df) { idf[t] = Math.log((N + 1) / (df[t] + 0.5)); if (t.charAt(0) !== "#") vocab.push(t); }
    return { docs: docs, idf: idf, vocab: vocab, N: N, data: data };
  }

  function idfOf(ix, t) { return t in ix.idf ? ix.idf[t] : Math.log(ix.N + 1); }

  // Swap unknown words for a close word the answers know, at a discount.
  function fixTypos(ix, toks) {
    return toks.map(function (x) {
      if (x.t.charAt(0) === "#" || x.t in ix.idf || x.t.length < 4) return x;
      var max = x.t.length >= 8 ? 2 : 1, best = null, bd = max + 1;
      for (var i = 0; i < ix.vocab.length; i++) {
        var v = ix.vocab[i]; if (Math.abs(v.length - x.t.length) > max || v.charAt(0) !== x.t.charAt(0) && max < 2) continue;
        var d = editDist(x.t, v, max); if (d < bd) { bd = d; best = v; }
      }
      return best ? { t: best, w: x.w * 0.8, fixed: x.t } : x;
    });
  }

  function score(ix, query) {
    var nq = normalize(query);
    var toks = fixTypos(ix, analyze(query));
    var content = toks.filter(function (x) { return x.t.charAt(0) !== "#"; });
    var results = ix.docs.map(function (d) {
      var s = 0, hits = 0;
      toks.forEach(function (x) {
        var w = d.tw[x.t]; if (!w) return;
        s += x.w * w * idfOf(ix, x.t);
        if (x.t.charAt(0) !== "#") hits++;
      });
      d.phrases.forEach(function (p) { if ((" " + nq + " ").indexOf(" " + p + " ") >= 0) s += 2.5 * p.split(" ").length; });
      if (nq === d.nq) s += 20;
      // a little credit for covering more of what was asked
      if (content.length) s *= 0.75 + 0.25 * (hits / content.length);
      return { entry: d.e, index: d.i, score: s };
    });
    results.sort(function (a, b) { return b.score - a.score || a.index - b.index; });
    return { results: results, tokens: toks, contentCount: content.length };
  }

  var MIN_SCORE = 4;

  // The answer for a question: best entry (or null for the fallback) plus up to 2 related entries.
  function ask(ix, query) {
    var r = score(ix, query), res = r.results, best = res[0];
    if (!best || best.score < MIN_SCORE) return { best: null, related: res.filter(function (x) { return x.score >= MIN_SCORE * 0.6; }).slice(0, 2).map(function (x) { return x.entry; }), score: best ? best.score : 0 };
    var related = res.slice(1).filter(function (x) { return x.score >= Math.max(MIN_SCORE, best.score * 0.4); }).slice(0, 2).map(function (x) { return x.entry; });
    return { best: best.entry, related: related, score: best.score, ranked: res };
  }

  var Matcher = { normalize: normalize, stem: stem, analyze: analyze, buildIndex: buildIndex, score: score, ask: ask, MIN_SCORE: MIN_SCORE };

  if (typeof module !== "undefined" && module.exports) { module.exports = Matcher; return; }
  if (typeof document === "undefined") return;

  // ---------------------------------------------------------------------------
  //  The widget
  // ---------------------------------------------------------------------------

  var script = document.currentScript || (function () { var s = document.querySelectorAll("script[src*='helper.js']"); return s[s.length - 1]; })();
  var opt = function (name, def) { return (script && script.getAttribute("data-" + name)) || def; };
  var FAQ_URL = opt("faq", script && script.src ? script.src.replace(/helper\.js(\?.*)?$/, "faq.json") : "faq.json");
  var ROOT = opt("root", "/");
  var HIDE = opt("hide", "/unwritten/").split(",").map(function (s) { return s.trim(); }).filter(Boolean);

  // Never on the game: its touch controls own the corners of the screen.
  var path = location.pathname.replace(/\/index\.html?$/, "/");
  for (var h = 0; h < HIDE.length; h++) {
    var pre = HIDE[h], bare = pre.replace(/\/$/, "");
    if (bare && (path === bare || path.indexOf(bare + "/") === 0)) return;
  }

  var FALLBACK = "I couldn't find that on the website. The quickest way to get an answer is to ask the shop directly: email owner@theblessedfigtree.com, or call or text 715-628-0468. The shop is at 800 5th Ave in downtown Antigo.";
  var DEFAULT_SUGGESTED = ["What are your hours?", "Where do I park?", "What do you sell?", "How do I play The Unwritten?"];

  var index = null, loading = null, data = null;
  var btn, panel, input, form, out, chips, live, lastFocus = null, uid = "bfh" + Math.random().toString(36).slice(2, 7);

  function el(tag, cls, attrs, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }

  function siteLink(link) {
    if (!link) return "";
    if (/^(https?:|mailto:|tel:)/.test(link)) return link;
    return ROOT.replace(/\/$/, "") + "/" + link.replace(/^\//, "");
  }

  // Plain text in, with emails and the phone number turned into links. Built with DOM nodes, never innerHTML.
  function richText(parent, text) {
    var re = /([\w.+-]+@[\w-]+\.[\w.]+)|(\b\d{3}-\d{3}-\d{4}\b)|(\bstays\.theblessedfigtree\.com\b)/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = el("a");
      var shown = m[0].replace(/[.,]$/, "");
      if (m[1]) a.href = "mailto:" + shown;
      else if (m[2]) a.href = "tel:+1" + shown.replace(/\D/g, "");
      else { a.href = "https://" + shown; a.target = "_blank"; a.rel = "noopener"; }
      a.textContent = shown;
      parent.appendChild(a);
      if (shown.length < m[0].length) parent.appendChild(document.createTextNode(m[0].slice(shown.length)));
      last = m.index + m[0].length;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function build() {
    btn = el("button", "bfh-btn", { type: "button", "aria-haspopup": "dialog", "aria-expanded": "false", "aria-controls": uid + "-panel" });
    btn.appendChild(el("span", "bfh-btn-icon", { "aria-hidden": "true" }, "?"));
    btn.appendChild(el("span", "bfh-btn-text", null, "Ask a question"));
    btn.addEventListener("click", function () { panel.hidden ? open() : close(); });

    panel = el("div", "bfh-panel", { id: uid + "-panel", role: "dialog", "aria-modal": "true", "aria-labelledby": uid + "-title" });
    panel.hidden = true;

    var head = el("div", "bfh-head");
    head.appendChild(el("h2", "bfh-title", { id: uid + "-title" }, "Ask a question"));
    var x = el("button", "bfh-close", { type: "button", "aria-label": "Close the question helper" }, "×");
    x.addEventListener("click", function () { close(); });
    head.appendChild(x);
    panel.appendChild(head);

    panel.appendChild(el("p", "bfh-sub", { id: uid + "-sub" }, "Answers come from this website. For anything else, contact the shop."));

    form = el("form", "bfh-form", { role: "search" });
    var label = el("label", "bfh-sr", { "for": uid + "-q" }, "Your question");
    input = el("input", "bfh-input", { id: uid + "-q", type: "text", autocomplete: "off", enterkeyhint: "search", maxlength: "200",
      placeholder: "e.g. Where do I park?", "aria-describedby": uid + "-sub" });
    var go = el("button", "bfh-go", { type: "submit" }, "Ask");
    form.appendChild(label); form.appendChild(input); form.appendChild(go);
    form.addEventListener("submit", function (e) { e.preventDefault(); var q = input.value.trim(); if (q) answer(q); });
    panel.appendChild(form);

    live = el("div", "bfh-out", { "aria-live": "polite", "aria-atomic": "true" });
    out = live;
    panel.appendChild(out);

    chips = el("div", "bfh-chips", { role: "group", "aria-label": "Suggested questions" });
    panel.appendChild(chips);

    panel.addEventListener("keydown", onKey);
    // a click or tap anywhere else on the page closes the panel and leaves focus where the visitor put it
    document.addEventListener("pointerdown", function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close(true);
    }, true);
    document.body.appendChild(btn);
    document.body.appendChild(panel);
    watchStick();
  }

  // The home page has a phone-only sticky bar at the bottom; sit above it when it shows.
  function watchStick() {
    var stick = document.querySelector(".stick");
    if (!stick) return;
    function check() {
      var cs = getComputedStyle(stick), on = cs.display !== "none" && cs.position === "fixed" && !stick.classList.contains("off");
      document.documentElement.classList.toggle("bfh-raised", on);
    }
    check(); addEventListener("resize", check);
    if (global.MutationObserver) new MutationObserver(check).observe(stick, { attributes: true, attributeFilter: ["class", "style"] });
  }

  function focusables() {
    return Array.prototype.filter.call(panel.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])"),
      function (n) { return n.offsetParent !== null || n === document.activeElement; });
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key !== "Tab") return;
    var f = focusables(); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function open() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    document.documentElement.classList.add("bfh-open");
    load().then(function () { if (!out.firstChild) renderSuggested(); });
    setTimeout(function () { input.focus(); }, 30);
  }

  function close(keepFocus) {
    if (panel.hidden) return;
    panel.hidden = true;
    btn.setAttribute("aria-expanded", "false");
    document.documentElement.classList.remove("bfh-open");
    if (keepFocus !== true) (lastFocus && document.contains(lastFocus) ? lastFocus : btn).focus();
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    setStatus("Loading answers…");
    loading = fetch(FAQ_URL, { credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { data = d; index = Matcher.buildIndex(d); clearOut(); return index; })
      .catch(function () { loading = null; clearOut(); showFallback("The answers couldn't load just now. "); return null; });
    return loading;
  }

  function clearOut() { while (out.firstChild) out.removeChild(out.firstChild); }
  function setStatus(t) { clearOut(); out.appendChild(el("p", "bfh-status", null, t)); }

  function chipRow(label, list) {
    while (chips.firstChild) chips.removeChild(chips.firstChild);
    if (!list.length) return;
    chips.setAttribute("aria-label", label);
    chips.appendChild(el("p", "bfh-chips-label", { "aria-hidden": "true" }, label));
    list.forEach(function (item) {
      var q = typeof item === "string" ? item : item.q;
      var c = el("button", "bfh-chip", { type: "button" }, q);
      c.addEventListener("click", function () { input.value = q; answer(q, typeof item === "string" ? null : item); });
      chips.appendChild(c);
    });
  }

  function renderSuggested() {
    var s = (data && data.suggested) || DEFAULT_SUGGESTED;
    clearOut();
    chipRow("Try asking", s);
  }

  function showFallback(prefix) {
    var box = el("div", "bfh-answer bfh-fallback");
    var p = el("p", "bfh-a");
    richText(p, (prefix || "") + ((data && data.fallback) || FALLBACK));
    box.appendChild(p);
    var link = (data && data.fallbackLink) || "/#find";
    var a = el("a", "bfh-more", { href: siteLink(link) }, "Contact details and map");
    box.appendChild(a);
    out.appendChild(box);
  }

  function answer(q, exact) {
    load().then(function (ix) {
      if (!ix) return;
      var res = exact ? { best: exact, related: relatedFor(ix, exact) } : Matcher.ask(ix, q);
      clearOut();
      out.appendChild(el("p", "bfh-asked", null, "You asked: " + q));
      if (!res.best) {
        showFallback("");
      } else {
        var box = el("div", "bfh-answer");
        box.appendChild(el("h3", "bfh-q", null, res.best.q));
        var p = el("p", "bfh-a"); richText(p, res.best.a); box.appendChild(p);
        if (res.best.link) box.appendChild(el("a", "bfh-more", { href: siteLink(res.best.link) }, "More on the site"));
        out.appendChild(box);
      }
      chipRow("Related questions", res.related || []);
      if (!res.related || !res.related.length) chipRow("Try asking", ((data && data.suggested) || DEFAULT_SUGGESTED).filter(function (s) { return !res.best || s !== res.best.q; }).slice(0, 3));
    });
  }

  // For a tapped question: the two entries that best match its question and keywords.
  function relatedFor(ix, entry) {
    var r = Matcher.score(ix, entry.q + " " + (entry.keywords || []).slice(0, 4).join(" ")).results;
    return r.filter(function (x) { return x.entry !== entry && x.score >= Matcher.MIN_SCORE; }).slice(0, 2).map(function (x) { return x.entry; });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})(typeof window !== "undefined" ? window : this);
