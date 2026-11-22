"use strict";
// =====================================================================
//  THE STUDY WINDOW (Nov 16, Christian: "The learning windows have to be better than what appears as a JRPG conversation
//  window though, research the best option there"). A clear page drawn by the browser over the game, at the screen's full
//  sharpness, in a face made for legibility (Atkinson Hyperlegible), never the pixel dialog box. What the research asks for:
//   - one idea per card, the learner turns the page (segmenting, Mayer d = 0.70);
//   - key words first and key words marked (pre-training d = 0.46; signaling d = 0.46);
//   - nothing on the page that isn't the lesson (coherence d = 0.70);
//   - a drawing beside the words it explains, its labels on the drawing (multimedia and spatial contiguity, d = 0.79);
//   - talk to the reader as "you" (personalization d = 0.79);
//   - worked examples revealed a step at a time, then one with the last step left for you (worked examples in math g = 0.48,
//     Barbieri et al. 2023; fading, Renkl);
//   - tests that tell you why, right after you answer (retrieval practice works when the feedback explains);
//   - lines of about 60 characters at 18-21 px (Dyson & Haselgrove: ~55 cpl reads well; 50-75 cpl preferred).
//  Keys: arrows, Enter or Z, Esc or X, 1-4 for answers. Mouse and touch work on every button.
// =====================================================================
const STUDY = { el: null, prev: null, node: null, view: null };
(function studyStyle() {
  if (document.getElementById('study-style')) return;
  const s = document.createElement('style'); s.id = 'study-style';
  s.textContent = `
#study{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;background:rgba(6,8,18,.78);
  font-family:'Atkinson Hyperlegible',Verdana,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
#study .sc{width:min(980px,96vw);max-height:94vh;display:grid;grid-template-rows:auto 1fr auto;background:#f6f1e4;color:#1c1c26;
  border:3px solid #f0f0f8;outline:3px solid #1a1c4a;border-radius:3px;box-shadow:0 10px 40px rgba(0,0,0,.6);overflow:hidden}
#study .sh{display:flex;align-items:center;gap:12px;padding:10px 16px;background:linear-gradient(#2c3a8c,#141850);color:#fff}
#study .chip{width:12px;height:30px;border-radius:2px;flex:none}
#study .tt{font-family:'Press Start 2P',monospace;font-size:13px;line-height:1.5;letter-spacing:.5px}
#study .st{font-size:14px;color:#c8cdf0;margin-top:2px}
#study .x{margin-left:auto;font:14px inherit;font-family:inherit;background:#3a4aa8;color:#fff;border:1px solid #8a96e0;border-radius:4px;padding:8px 12px;cursor:pointer}
#study .sb{overflow:auto;padding:22px 30px;font-size:clamp(17px,1.9vw,20px);line-height:1.55}
#study .cols{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,390px);gap:26px;align-items:start}
#study .cols.one{grid-template-columns:minmax(0,62ch)}
#study h2{font-size:1.15em;margin:0 0 .5em;color:#1a1c4a}
#study p{margin:0 0 .7em;max-width:62ch}
#study b.key{background:#ffe9a8;padding:0 .15em;border-radius:2px}
#study .fig{background:#fffdf6;border:1px solid #d8d0bc;border-radius:4px;padding:10px;justify-self:stretch;width:100%;box-sizing:border-box}
#study .fig svg{width:100%;height:auto;display:block}
#study .words{display:grid;grid-template-columns:max-content 1fr;gap:.5em 1em;max-width:66ch}
#study .words dt{font-weight:700;color:#1a1c4a}
#study .words dd{margin:0}
#study .sf{display:flex;align-items:center;gap:10px;padding:10px 16px;background:#e8e0cc;border-top:1px solid #cfc4aa;flex-wrap:wrap}
#study .btn{font-family:inherit;font-size:17px;min-height:44px;padding:8px 16px;border-radius:5px;border:2px solid #1a1c4a;background:#fff;color:#1a1c4a;cursor:pointer}
#study .btn.go{background:#1a1c4a;color:#fff}
#study .btn.on{outline:3px solid #e8a020;outline-offset:1px}
#study .btn:disabled{opacity:.45;cursor:default}
#study .dots{display:flex;gap:5px;margin-right:auto}
#study .dots i{width:9px;height:9px;border-radius:50%;background:#c8bea6;display:block}
#study .dots i.on{background:#1a1c4a}
#study .hint{font-size:13px;color:#6a6252;margin-left:auto}
#study .menu{display:grid;gap:10px}
#study .menu .btn{text-align:left;display:flex;gap:10px;align-items:center}
#study .menu .btn small{color:#5a5a6a;font-size:14px;margin-left:auto}
#study .status{padding:8px 12px;border-radius:4px;margin-bottom:12px;font-weight:700}
#study .status.done{background:#fbeeb0;color:#5a4400}
#study .status.open{background:#d6f2d8;color:#1d5a24}
#study .status.lock{background:#f2dada;color:#6a2020}
#study ol.steps{padding-left:1.4em;margin:.4em 0 .8em}
#study ol.steps li{margin:.25em 0;padding:.15em .3em;border-radius:3px}
#study ol.steps li.now{background:#e6eeff}
#study .q{font-size:1.08em;margin-bottom:.8em}
#study .opts{display:grid;gap:9px;max-width:62ch}
#study .opt{font-family:inherit;font-size:clamp(16px,1.8vw,19px);text-align:left;padding:10px 12px;border-radius:5px;border:2px solid #b8ae96;background:#fff;color:#1c1c26;cursor:pointer;display:flex;gap:10px;align-items:flex-start}
#study .opt .k{font-weight:700;color:#1a1c4a;min-width:1.3em}
#study .opt.on{border-color:#1a1c4a;box-shadow:0 0 0 2px #e8a020}
#study .opt.right{border-color:#2a8a3a;background:#e2f6e4}
#study .opt.wrong{border-color:#b83232;background:#fbe4e4}
#study .fb{margin-top:12px;padding:10px 14px;border-radius:5px;max-width:62ch}
#study .fb.ok{background:#e2f6e4;border-left:5px solid #2a8a3a}
#study .fb.no{background:#fbe8e0;border-left:5px solid #c86a32}
#study .bar{height:10px;background:#d8d0bc;border-radius:5px;overflow:hidden;margin:4px 0 14px;max-width:62ch}
#study .bar i{display:block;height:100%;background:#1a1c4a}
#study table{border-collapse:collapse;font-size:.92em}
#study td,#study th{padding:5px 9px;border-bottom:1px solid #d8d0bc;text-align:left}
#study td.c{text-align:center}
#study .tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
#study .real{background:#eaf4ff;border-left:5px solid #3a7ad8;padding:10px 14px;border-radius:4px}
@media (max-width:760px){#study .cols{grid-template-columns:1fr}#study .sb{padding:16px}}`;
  document.head.appendChild(s);
})();
function stEsc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function stFmt(s) { return stEsc(s).replace(/\*\*(.+?)\*\*/g, '<b class="key">$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br>'); }
function stFig(f) { if (!f) return ''; const svg = typeof f === 'string' ? (f.startsWith('<svg') ? f : '') : (typeof FIG !== 'undefined' && FIG[f[0]] ? FIG[f[0]](...f.slice(1)) : ''); return svg ? '<div class="fig">' + svg + '</div>' : ''; }
// ---------- the frame ----------
function studyShell(title, sub, col) {
  if (!STUDY.el) {
    STUDY.prev = mode === 'study' ? STUDY.prev : mode;
    const w = document.createElement('div'); w.id = 'study'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true');
    w.innerHTML = '<div class="sc"><div class="sh"><span class="chip"></span><div><div class="tt"></div><div class="st"></div></div><button class="x" title="Close (Esc)">✕ Close</button></div><div class="sb"></div><div class="sf"></div></div>';
    document.body.appendChild(w); STUDY.el = w; w.querySelector('.x').onclick = studyBack;
    setMode('study');
  }
  const E = STUDY.el; E.querySelector('.chip').style.background = col || '#e8b84a';
  E.querySelector('.tt').textContent = title; E.querySelector('.st').textContent = sub || '';
  return { body: E.querySelector('.sb'), foot: E.querySelector('.sf') };
}
function studyClose() {
  if (!STUDY.el) return; STUDY.el.remove(); STUDY.el = null; STUDY.view = null; const r = STUDY.prev || 'walk'; STUDY.prev = null;
  for (const k in pressed) delete pressed[k]; setMode(MODES[r] ? r : 'walk');
}
function studyBack() { const v = STUDY.view; if (v && v.back) v.back(); else studyClose(); }
MODES.study = {
  update() { if (!STUDY.el) setMode(STUDY.prev || 'walk'); },
  draw() { const p = STUDY.prev && MODES[STUDY.prev]; if (p && p !== MODES.study && p.draw) p.draw(); else R(0, 0, SW, SH, '#10121e'); } };
// keys: the window takes them before the game does
addEventListener('keydown', e => {
  if (!STUDY.el || !STUDY.view) return;
  const k = e.code, v = STUDY.view, map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', Enter: 'ok', Space: 'ok', KeyZ: 'ok', Escape: 'back', KeyX: 'back', Backspace: 'back',
    Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4, Digit5: 5, Digit6: 6, Numpad1: 1, Numpad2: 2, Numpad3: 3, Numpad4: 4, KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
  const a = map[k]; if (a == null) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (e.repeat && (a === 'ok' || a === 'back')) return;
  if (a === 'back') return studyBack();
  if (v.key) v.key(a);
}, true);
// a row of buttons that the arrow keys walk: returns a key handler
function stButtons(foot, list, startAt) {
  foot.innerHTML = ''; const els = [];
  if (list.dots) { const d = document.createElement('div'); d.className = 'dots'; d.innerHTML = list.dots; foot.appendChild(d); }
  list.items.forEach((b, i) => { if (!b) return; const el = document.createElement('button'); el.className = 'btn' + (b.go ? ' go' : ''); el.textContent = b.t; el.disabled = !!b.off;
    el.onclick = () => { if (!b.off) b.f(); }; foot.appendChild(el); els.push({ el, b }); });
  if (list.hint) { const h = document.createElement('span'); h.className = 'hint'; h.textContent = list.hint; foot.appendChild(h); }
  let sel = Math.max(0, Math.min(els.length - 1, startAt != null ? startAt : els.findIndex(x => x.b.go)));
  const show = () => els.forEach((x, i) => x.el.classList.toggle('on', i === sel)); show();
  return a => { if (a === 'left' || a === 'up') { sel = (sel + els.length - 1) % els.length; show(); } else if (a === 'right' || a === 'down') { sel = (sel + 1) % els.length; show(); }
    else if (a === 'ok') { const x = els[sel]; if (x && !x.b.off) x.b.f(); } };
}

// =====================================================================
//  A SKILL'S HOME: where it sits, what it needs, what it opens, and the ways in
// =====================================================================
function studyOpen(id) {
  const n = EDU[id]; if (!n) return; eduState(); STUDY.node = n;
  const L = eduLane(n.lane), B = eduBand(n.band), done = eduMastered(id), open = eduOpen(id);
  const { body, foot } = studyShell(n.n.toUpperCase(), L.name + ' · ' + B.long + (n.g ? ' · grade ' + n.g : '') + (n.std ? ' · ' + n.std : ''), L.col);
  const opens = EDU_ORDER.filter(x => EDU[x].req.includes(id)).map(x => EDU[x].n);
  const needs = n.req.filter(r => EDU[r]).map(r => (eduMastered(r) ? '✓ ' : '○ ') + EDU[r].n);
  const first = n.L.find(c => typeof c === 'string' || c.t === 'idea'); const blurb = n.d || (first ? (typeof first === 'string' ? first : first.p) : '');
  let st = done ? '<div class="status done">★ Mastered · best ' + (G.edu.best[id] || 0) + ' of ' + n.nq + '</div>'
    : open ? '<div class="status open">Open. Learn it, or test out if you already know it.</div>'
    : '<div class="status lock">Locked until you master: ' + stEsc(eduMissing(id).map(r => EDU[r].n).join(', ')) + '. You can still read ahead.</div>';
  const items = [];
  if (n.L.length) items.push({ t: '📖 Learn it', s: n.L.length + ' cards', f: () => studyLearn(id, 0) });
  items.push({ t: '✏️ Worked examples', s: 'the tutor', f: () => studyExamples(id) });
  if (n.civ) items.push({ t: '🗳 Practice quiz', s: '20 questions', f: () => studyQuiz(id, { practice: 1, count: 20 }) });
  items.push({ t: done ? '🔁 Practice test' : open ? (n.civ ? '🗳 The civics test' : '✅ Mastery test') : '🔒 Mastery test', s: n.civ ? n.nq + ' questions · ' + n.pass + ' to pass' : n.nq + ' questions · ' + n.pass + ' to pass', off: !open && !done, f: () => studyQuiz(id, { practice: done && !n.civ }) });
  if (n.proj) items.push({ t: '🛠 Project: ' + n.proj.t, s: G.edu.proj[id] ? 'done' : n.proj.where || '', f: () => studyProject(id) });
  if (n.src.length || n.std) items.push({ t: '📚 Sources', s: '', f: () => studySources(id) });
  body.innerHTML = '<div class="cols"><div>' + st + (blurb ? '<p>' + stFmt(blurb) + '</p>' : '') +
    (needs.length ? '<p><b>Needs:</b><br>' + needs.map(stEsc).join('<br>') + '</p>' : '') + (opens.length ? '<p><b>Opens:</b> ' + stEsc(opens.join(', ')) + '</p>' : '') +
    (n.cr ? '<p><b>Credit:</b> ' + n.cr[1] + ' toward ' + ({ eng: 'English', math: 'math', sci: 'science', ss: 'social studies', pe: 'physical education', health: 'health', pfl: 'personal financial literacy', elec: 'electives' })[n.cr[0]] + '</p>' : '') +
    '</div><div class="menu"></div></div>';
  const menu = body.querySelector('.menu'), els = [];
  items.forEach(it => { const b = document.createElement('button'); b.className = 'btn'; b.disabled = !!it.off; b.innerHTML = stEsc(it.t) + (it.s ? '<small>' + stEsc(it.s) + '</small>' : ''); b.onclick = () => { if (!it.off) it.f(); }; menu.appendChild(b); els.push({ b, it }); });
  foot.innerHTML = '<span class="hint">↑↓ choose · Enter open · Esc back to the map</span>';
  let sel = Math.max(0, els.findIndex(x => !x.it.off)); const show = () => els.forEach((x, i) => x.b.classList.toggle('on', i === sel)); show();
  STUDY.view = { back: studyClose, key: a => {
    if (a === 'up' || a === 'left') { sel = (sel + els.length - 1) % els.length; show(); } else if (a === 'down' || a === 'right') { sel = (sel + 1) % els.length; show(); }
    else if (a === 'ok') { const x = els[sel]; if (x && !x.it.off) x.it.f(); } else if (typeof a === 'number' && els[a - 1] && !els[a - 1].it.off) els[a - 1].it.f(); } };
}
// ---------- the lesson: one card at a time ----------
function stCardHTML(c) {
  if (typeof c === 'string') c = { t: 'idea', p: c };
  if (c.t === 'words') return '<div class="cols one"><div><h2>Words to know</h2><dl class="words">' + c.w.map(([a, b]) => '<dt>' + stEsc(a) + '</dt><dd>' + stFmt(b) + '</dd>').join('') + '</dl></div></div>';
  if (c.t === 'real') return '<div class="cols ' + (c.fig ? '' : 'one') + '"><div><h2>' + stEsc(c.h || 'Here in Antigo') + '</h2><div class="real">' + stFmt(c.p) + '</div></div>' + stFig(c.fig) + '</div>';
  if (c.t === 'ex') return '<div class="cols ' + (c.fig ? '' : 'one') + '"><div><h2>' + stEsc(c.h || 'Worked example') + '</h2><p class="q">' + stFmt(c.q) + '</p><ol class="steps">' + c.steps.map(s => '<li>' + stFmt(s) + '</li>').join('') + '</ol>' + (c.a ? '<p><b>Answer:</b> ' + stFmt(c.a) + '</p>' : '') + '</div>' + stFig(c.fig) + '</div>';
  const paras = (Array.isArray(c.p) ? c.p : [c.p]).map(x => '<p>' + stFmt(x) + '</p>').join('');
  return '<div class="cols ' + (c.fig ? '' : 'one') + '"><div>' + (c.h ? '<h2>' + stFmt(c.h) + '</h2>' : '') + paras + '</div>' + stFig(c.fig) + '</div>';
}
function studyCards(title, sub, col, cards, i, opts) {   // a reader for any set of cards (lessons, and the town's explainers)
  const o = opts || {}, { body, foot } = studyShell(title, sub, col);
  i = Math.max(0, Math.min(cards.length - 1, i || 0));
  body.innerHTML = stCardHTML(cards[i]); body.scrollTop = 0;
  const last = i === cards.length - 1, dots = cards.map((_, k) => '<i class="' + (k === i ? 'on' : '') + '"></i>').join('');
  const go = k => studyCards(title, sub, col, cards, k, o);
  const items = [{ t: '◀ Back', off: i === 0, f: () => go(i - 1) }];
  if (!last) items.push({ t: 'Next ▶', go: 1, f: () => go(i + 1) });
  else (o.end || [{ t: 'Done', go: 1, f: o.done || studyClose }]).forEach(b => items.push(b));
  const k = stButtons(foot, { dots, items, hint: '← → turn the page' }, last ? items.length - 1 : 1);
  STUDY.view = { back: o.back || studyClose, key: a => { if (a === 'left' && i > 0) return go(i - 1); if (a === 'right' && !last) return go(i + 1); k(a); } };
}
function studyLearn(id, i) {
  const n = EDU[id], L = eduLane(n.lane);
  studyCards(n.n.toUpperCase(), 'LESSON · ' + L.name, L.col, n.L, i, { back: () => studyOpen(id),
    end: [{ t: '✏️ Worked examples', f: () => studyExamples(id) }, { t: eduOpen(id) || eduMastered(id) ? '✅ Mastery test' : '◀ Skill page', go: 1, f: () => eduOpen(id) || eduMastered(id) ? studyQuiz(id, { practice: eduMastered(id) && !n.civ }) : studyOpen(id) }] });
}
// ---------- the tutor: a worked example step by step, then one with its last step left for you ----------
function studyExamples(id, phase, ex) {
  const n = EDU[id], L = eduLane(n.lane);
  if (!phase) {   // a fresh example: content examples first, then made ones
    const own = (n.ex || []), q = own.length && Math.random() < 0.5 ? own[Math.floor(Math.random() * own.length)] : null;
    ex = q ? { q: q.q, steps: q.steps, a: q.a, fig: q.fig } : (() => { const g = eduQ(n); return { q: g.q, steps: g.steps && g.steps.length ? g.steps : [g.why || 'Look at what the question asks, then check each choice against it.'], a: g.a, fig: g.fig, w: g.w }; })();
    ex.shown = 1; phase = 'show';
  }
  const { body, foot } = studyShell(n.n.toUpperCase(), 'THE TUTOR · ' + L.name, L.col);
  if (phase === 'show') {
    const all = ex.shown >= ex.steps.length;
    body.innerHTML = '<div class="cols ' + (ex.fig ? '' : 'one') + '"><div><h2>Worked example</h2><p class="q">' + stFmt(ex.q) + '</p><ol class="steps">' +
      ex.steps.slice(0, ex.shown).map((s, k) => '<li class="' + (k === ex.shown - 1 ? 'now' : '') + '">' + stFmt(s) + '</li>').join('') + '</ol>' +
      (all ? '<p><b>Answer:</b> ' + stFmt(ex.a) + '</p>' : '<p style="color:#6a6252">Press Next for the next step. Try to guess it first.</p>') + '</div>' + stFig(ex.fig) + '</div>';
    const items = all ? [{ t: '◀ Skill page', f: () => studyOpen(id) }, { t: 'Your turn ▶', go: 1, f: () => studyExamples(id, 'try', null) }]
      : [{ t: '◀ Skill page', f: () => studyOpen(id) }, { t: 'Next step ▶', go: 1, f: () => { ex.shown++; studyExamples(id, 'show', ex); } }];
    const k = stButtons(foot, { items, hint: 'Esc: skill page' }, 1); STUDY.view = { back: () => studyOpen(id), key: k };
    return;
  }
  // 'try': a new one, every step but the last shown; you pick the answer
  if (!ex) { const g = eduQ(n); ex = { q: g.q, steps: g.steps || [], a: g.a, w: g.w || [], why: g.why, fig: g.fig, ch: eduShuffle([g.a, ...(g.w || [])].slice(0, 4)), pick: null }; if (!ex.ch.includes(ex.a)) ex.ch[0] = ex.a; }
  const shown = ex.steps.length > 1 ? ex.steps.slice(0, -1) : []; STUDY.view = { back: () => studyOpen(id) };
  body.innerHTML = '<div class="cols ' + (ex.fig ? '' : 'one') + '"><div><h2>Your turn</h2><p class="q">' + stFmt(ex.q) + '</p>' + (shown.length ? '<ol class="steps">' + shown.map(s => '<li>' + stFmt(s) + '</li>').join('') + '<li class="now">…you finish it.</li></ol>' : '') +
    '<div class="opts"></div><div class="fbw"></div></div>' + stFig(ex.fig) + '</div>';
  stOptions(body, ex, () => {
    const ok = ex.pick === ex.a;
    body.querySelector('.fbw').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Yes!' : 'Not quite. It\'s ' + stEsc(ex.a) + '.') + '</b> ' + (ex.steps.length ? stFmt(ex.steps[ex.steps.length - 1]) : stFmt(ex.why || '')) + '</div>';
    const k = stButtons(foot, { items: [{ t: '◀ Skill page', f: () => studyOpen(id) }, { t: 'Another example', f: () => studyExamples(id) }, { t: '✅ Mastery test', go: 1, off: !eduOpen(id) && !eduMastered(id), f: () => studyQuiz(id, { practice: eduMastered(id) && !n.civ }) }] }, 1);
    STUDY.view = { back: () => studyOpen(id), key: k };
  });
  foot.innerHTML = '<span class="hint">↑↓ or 1-4 to choose · Enter to answer · Esc: skill page</span>';
}
// four answers as buttons; returns when one is chosen (then calls done)
function stOptions(body, q, done) {
  const box = body.querySelector('.opts'); box.innerHTML = ''; let sel = 0; const els = [];
  q.ch.forEach((c, i) => { const b = document.createElement('button'); b.className = 'opt'; b.innerHTML = '<span class="k">' + (i + 1) + '</span><span>' + stFmt(c) + '</span>'; b.onclick = () => choose(i); box.appendChild(b); els.push(b); });
  const show = () => els.forEach((b, i) => b.classList.toggle('on', i === sel)); show();
  function choose(i) { if (q.pick != null) return; q.pick = q.ch[i]; els.forEach((b, k) => { b.disabled = true; b.classList.remove('on'); if (q.ch[k] === q.a) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); }); done(); }
  const prevBack = STUDY.view && STUDY.view.back;
  STUDY.view = { back: prevBack || studyClose, key: a => { if (q.pick != null) return; if (a === 'up' || a === 'left') { sel = (sel + els.length - 1) % els.length; show(); } else if (a === 'down' || a === 'right') { sel = (sel + 1) % els.length; show(); } else if (a === 'ok') choose(sel); else if (typeof a === 'number' && a <= els.length) choose(a - 1); } };
}
// ---------- the mastery test ----------
function studyQuiz(id, o) {
  const n = EDU[id], L = eduLane(n.lane), E = eduState(); o = o || {};
  let Z;
  if (n.civ && !o.practice && E.civ.run && E.civ.run.order) Z = { n, qs: E.civ.run.order.map(i => eduQ(n, i)), i: E.civ.run.i, right: E.civ.run.right, o, resumed: 1 };
  else { const qs = n.civ && !o.practice ? eduShuffle([...Array(n.Q.length).keys()]).slice(0, n.nq) : null;
    Z = { n, qs: qs ? qs.map(i => eduQ(n, i)) : eduTestSet(n, o.count), i: 0, right: 0, o, order: qs }; if (Z.order) E.civ.run = { order: Z.order, i: 0, right: 0 }; }
  Z.qs.forEach(q => { q.ch = eduShuffle([q.a, ...q.w].slice(0, 4)); if (!q.ch.includes(q.a)) q.ch[0] = q.a; q.pick = null; });
  STUDY.quiz = Z; stQuizShow();
}
function stQuizShow() {
  const Z = STUDY.quiz, n = Z.n, L = eduLane(n.lane), q = Z.qs[Z.i], total = Z.qs.length, need = Z.o.practice ? Math.ceil(total * (n.pass / n.nq)) : n.pass;
  const { body, foot } = studyShell(n.n.toUpperCase(), (Z.o.practice ? 'PRACTICE' : n.civ ? 'THE CIVICS TEST' : 'MASTERY TEST') + ' · ' + L.name, L.col);
  body.innerHTML = '<div class="cols ' + (q.fig ? '' : 'one') + '"><div><div style="display:flex;justify-content:space-between;font-size:15px;color:#5a5a6a"><span>Question ' + (Z.i + 1) + ' of ' + total + '</span><span>' + Z.right + ' right · ' + need + ' to pass</span></div>' +
    '<div class="bar"><i style="width:' + Math.round(Z.i / total * 100) + '%"></i></div><p class="q">' + stFmt(q.q) + '</p><div class="opts"></div><div class="fbw"></div></div>' + stFig(q.fig) + '</div>';
  body.scrollTop = 0;
  const quit = () => { if (n.civ && !Z.o.practice) { const E = eduState(); E.civ.run = { order: Z.order || E.civ.run.order, i: Z.i, right: Z.right }; saveGame(); } studyOpen(n.id); };
  STUDY.view = { back: quit };
  stOptions(body, q, () => {
    const ok = q.pick === q.a; if (ok) Z.right++;
    if (n.civ && !Z.o.practice) { const E = eduState(); E.civ.run = { order: Z.order || (E.civ.run && E.civ.run.order), i: Z.i + 1, right: Z.right }; }
    const why = q.why || (q.steps && q.steps.length ? q.steps.join(' ') : '');
    body.querySelector('.fbw').innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Right.' : 'Not quite. The answer is ' + stEsc(q.a) + '.') + '</b> ' + stFmt(why) + '</div>';
    const fbw = body.querySelector('.fbw'); if (fbw.scrollIntoView) fbw.scrollIntoView({ block: 'nearest' });
    const last = Z.i === total - 1;
    const k = stButtons(foot, { items: [{ t: n.civ && !Z.o.practice ? 'Stop and save' : 'Quit', f: quit }, { t: last ? 'See results ▶' : 'Next ▶', go: 1, f: () => { if (last) stQuizEnd(); else { Z.i++; stQuizShow(); } } }] }, 1);
    STUDY.view = { back: quit, key: k };
  });
  foot.innerHTML = '<span class="hint">↑↓ or 1-4 to choose · Enter to answer' + (n.civ && !Z.o.practice ? ' · Esc stops and saves your place' : ' · Esc quits') + '</span>';
}
function stQuizEnd() {
  const Z = STUDY.quiz, n = Z.n, L = eduLane(n.lane), total = Z.qs.length, E = eduState();
  const need = Z.o.practice ? Math.ceil(total * (n.pass / n.nq)) : n.pass, passed = Z.right >= need;
  let res = null, html = '<h2>' + Z.right + ' of ' + total + ' right</h2>';
  if (n.civ && !Z.o.practice) { E.civ.run = null; E.civ.best = Math.max(E.civ.best || 0, Z.right); if (passed) E.civ.passed = Date.now(); }
  if (!Z.o.practice && passed) res = eduMaster(n.id, Z.right, total);
  else if (!Z.o.practice) { E.tries[n.id] = (E.tries[n.id] || 0) + 1; E.best[n.id] = Math.max(E.best[n.id] || 0, Z.right); saveGame(); }
  if (Z.o.practice) html += '<p>' + (passed ? 'That would pass.' : 'That one wouldn\'t pass yet (' + need + ' needed).') + ' Practice doesn\'t change your record.</p>';
  else if (passed) {
    html += '<div class="status done">★ ' + (n.civ ? 'Passed the civics test' : 'Mastered: ' + stEsc(n.n)) + '</div>';
    if (res && res.first) {
      if (res.credit) html += '<p><b>Credit earned:</b> ' + res.credit[1] + ' toward ' + ({ eng: 'English', math: 'math', sci: 'science', ss: 'social studies', pe: 'physical education', health: 'health', pfl: 'personal financial literacy', elec: 'electives' })[res.credit[0]] + '.</p>';
      if (res.opened.length) html += '<p><b>Now open:</b> ' + stEsc(res.opened.map(x => EDU[x].n).join(', ')) + '</p>';
      if (res.sec) html += '<p>Christian can now RECOMMEND from <b>' + stEsc(res.sec) + '</b>.</p>';
      if (res.und) html += '<p>The party gains ' + res.und + ' Understanding each.</p>';
      if (eduGrad().done && !E.diploma) { E.diploma = Date.now(); saveGame(); html += '<div class="status done">🎓 Every Wisconsin requirement is met. The front office has your diploma.</div>'; }
    } else html += '<p>You\'d already mastered this. Your best score is kept.</p>';
  } else html += '<div class="status lock">' + need + ' needed to ' + (n.civ ? 'pass' : 'master it') + '. Worked examples first? Then try again: every try is new questions.</div>';
  const { body, foot } = studyShell(n.n.toUpperCase(), 'RESULTS · ' + L.name, L.col);
  body.innerHTML = '<div class="cols one"><div>' + html + '</div></div>';
  const k = stButtons(foot, { items: [{ t: '◀ Skill page', f: () => studyOpen(n.id) }, { t: 'Back to the map', go: 1, f: () => { if (passed && res && res.opened && res.opened.length && EDT) EDT.sel = res.opened[0]; studyClose(); } }] }, 1);
  STUDY.view = { back: () => studyOpen(n.id), key: k };
}
// ---------- the project and the sources ----------
function studyProject(id) {
  const n = EDU[id], P = n.proj, L = eduLane(n.lane), E = eduState(), done = !!E.proj[id] || (P.done && P.done());
  if (done && !E.proj[id]) { E.proj[id] = Date.now(); saveGame(); }
  studyCards(n.n.toUpperCase(), 'PROJECT · ' + L.name, L.col, [{ t: 'idea', h: P.t, p: [].concat(P.how || []).concat([done ? '**Done.** It\'s on your record.' : 'Where: ' + (P.where || 'in town') + '. Come back here when it\'s done.']), fig: P.fig || null }], 0,
    { back: () => studyOpen(id), end: [{ t: '◀ Skill page', go: 1, f: () => studyOpen(id) }] });
}
function studySources(id) {
  const n = EDU[id], L = eduLane(n.lane);
  const p = [(n.std ? 'Wisconsin standard: **' + n.std + '**.' : ''), ...(n.src || []).map(s => '• ' + s), 'The lessons and questions here were written for this game. Check anything against the sources; that\'s what they\'re for.'].filter(Boolean);
  studyCards(n.n.toUpperCase(), 'SOURCES · ' + L.name, L.col, [{ t: 'idea', h: 'Where this comes from', p }], 0, { back: () => studyOpen(id), end: [{ t: '◀ Skill page', go: 1, f: () => studyOpen(id) }] });
}
// =====================================================================
//  THE REPORT CARD: progress by subject and band, credits toward the diploma, the transcript
// =====================================================================
function studyReport(tab) {
  eduState(); tab = tab || 'prog';
  const { body, foot } = studyShell('REPORT CARD', (G.kid && G.kid.name ? G.kid.name + ' · ' : '') + (G.edu.school || 'Antigo schools'), '#e8b84a');
  let h = '';
  if (tab === 'prog') {
    h += '<h2>Skills mastered, by subject and grade band</h2><table><tr><th>Subject</th>' + EDU_BANDS.map(b => '<th class="c">' + b.name + '</th>').join('') + '<th>Finished through</th></tr>';
    for (const L of EDU_LANES) { h += '<tr><td><span style="display:inline-block;width:9px;height:9px;background:' + L.col + ';margin-right:6px"></span>' + stEsc(L.name) + '</td>';
      for (const b of EDU_BANDS) { const c = eduCount(L.id, b.id); h += '<td class="c" style="' + (c.total && c.done === c.total ? 'background:#fbeeb0' : '') + '">' + (c.total ? c.done + '/' + c.total : '·') + '</td>'; }
      h += '<td>' + (eduGradeLevel(L.id) ? 'grades ' + eduGradeLevel(L.id) : '—') + '</td></tr>'; }
    const c = eduCount(); h += '</table><p style="margin-top:12px">' + c.done + ' of ' + c.total + ' skills mastered. ' + c.open + ' open now.</p><p>Here there are no letter grades. A skill is mastered or not yet, and anyone may test out of anything.</p>';
  } else if (tab === 'grad') {
    const g = eduGrad();
    h += '<h2>Toward a Wisconsin diploma</h2><p>State law (Wis. Stat. 118.33) sets the minimum: 15.5 credits in these subjects and the civics test. School boards may require more.</p><table><tr><th>Subject</th><th>Have</th><th>Need</th><th></th></tr>';
    for (const r of g.rows) h += '<tr><td>' + stEsc(r.name) + '</td><td class="c">' + r.have + '</td><td class="c">' + r.need + '</td><td>' + (r.ok ? '✓' : '') + '</td></tr>';
    h += '<tr><td>State and local government</td><td colspan="2" class="c">' + (g.gov ? 'mastered' : 'not yet') + '</td><td>' + (g.gov ? '✓' : '') + '</td></tr>';
    h += '<tr><td>Civics test (65 of 100)</td><td colspan="2" class="c">' + (g.civ ? 'passed' : 'best ' + (G.edu.civ.best || 0)) + '</td><td>' + (g.civ ? '✓' : '') + '</td></tr></table>';
    h += '<p style="margin-top:12px">Electives: ' + g.elec + ' credits (the state encourages 8.5 more from career and technical courses, world languages, fine arts and others).</p>';
    h += g.done ? '<div class="status done">🎓 Every state requirement is met.</div>' : '<p>Core credits so far: ' + g.core + ' of 15.5.</p>';
  } else {
    const ids = EDU_ORDER.filter(eduMastered);
    h += '<h2>Transcript</h2>' + (ids.length ? '<table><tr><th>Skill</th><th>Subject</th><th>Best</th><th>Credit</th></tr>' + ids.map(id => { const n = EDU[id]; return '<tr><td>' + stEsc(n.n) + '</td><td>' + stEsc(eduLane(n.lane).short) + '</td><td class="c">' + (G.edu.best[id] || 0) + '/' + n.nq + '</td><td class="c">' + (n.cr ? n.cr[1] : '') + '</td></tr>'; }).join('') + '</table>' : '<p>Nothing mastered yet. Every skill on the map can be tested out of.</p>');
  }
  body.innerHTML = '<div class="tabs"></div>' + h;
  const tabs = body.querySelector('.tabs'); [['prog', 'Progress'], ['grad', 'Diploma'], ['tr', 'Transcript']].forEach(([k, t]) => { const b = document.createElement('button'); b.className = 'btn' + (k === tab ? ' go' : ''); b.textContent = t; b.onclick = () => studyReport(k); tabs.appendChild(b); });
  const order = ['prog', 'grad', 'tr'], i = order.indexOf(tab);
  const k = stButtons(foot, { items: [{ t: '◀ ' + ['Transcript', 'Progress', 'Diploma'][i], f: () => studyReport(order[(i + 2) % 3]) }, { t: ['Diploma', 'Transcript', 'Progress'][i] + ' ▶', f: () => studyReport(order[(i + 1) % 3]) }, { t: 'Close', go: 1, f: studyClose }], hint: '← → change page' }, 2);
  STUDY.view = { back: studyClose, key: a => { if (a === 'left') return studyReport(order[(i + 2) % 3]); if (a === 'right') return studyReport(order[(i + 1) % 3]); k(a); } };
}
