"use strict";
// =====================================================================
//  THE SKILL TREE: the town's K-12 schools (Christian, Nov 16: "the K-12 schools should have a education complex subgame within
//  them that I want ROBUST mimicking actual k12 education"; "Base the towns education around The Collins Institute for the Gifted";
//  "For K-12 in the schools"; "See if you can use this site for the education base": parrhesia.io's skill tree).
//  The shape follows Collins and Parrhesia: all of it is one map of skills. A skill opens when the skills under it are mastered,
//  and anyone may test out of anything they already know: learning more is the reward. Each skill has a short lesson, worked
//  examples (the tutor), a mastery test with explanations, and its sources; some have a project to finish somewhere real in town.
//  The content is real K-12 material written for this game against Wisconsin's standards (nothing is copied from Parrhesia).
//  High-school skills earn credits toward Wisconsin's diploma (Wis. Stat. 118.33: 15.5 credits and the civics test).
//  Lessons, examples and tests open in the study window (study.js), a clear page over the game, not a dialog box.
//  Files: edu.js (this: the map, the rules, the record), study.js (the window), figs.js (its drawings), gen.js (problem makers),
//  content_*.js (the skills), civics.js (the citizenship questions), schools.js (the buildings, their people, how they're paid for).
// =====================================================================
const EDU_LANES = [
  { id: 'ela', name: 'READING & WRITING', short: 'READ', col: '#5a9ae8' },
  { id: 'math', name: 'MATH', short: 'MATH', col: '#e8645a' },
  { id: 'sci', name: 'SCIENCE', short: 'SCI', col: '#5ac878' },
  { id: 'ss', name: 'SOCIAL STUDIES', short: 'SOC', col: '#e8b84a' },
  { id: 'body', name: 'HEALTH & PE', short: 'BODY', col: '#f08a4a' },
  { id: 'arts', name: 'ARTS', short: 'ARTS', col: '#b878e8' },
  { id: 'make', name: 'MAKE & BUILD', short: 'MAKE', col: '#4ac8c8' },
  { id: 'self', name: 'PEOPLE & SELF', short: 'SELF', col: '#e878b0' }];
const EDU_BANDS = [{ id: 'K2', name: 'K-2', long: 'GRADES K-2' }, { id: '35', name: '3-5', long: 'GRADES 3-5' },
  { id: '68', name: '6-8', long: 'GRADES 6-8' }, { id: 'HS', name: '9-12', long: 'HIGH SCHOOL' }];
const EDU = {}, EDU_ORDER = [], EDU_GEN = {};
// a skill: n name, s short tag (on the map), lane, band, g grade, req, std (standard), L lesson cards, Q bank or gen, nq/pass,
// cr [credit kind, amount], sec (a section of Christian's it opens), proj {t, where, how, done()}, src [sources]
function eduNode(id, o) {
  EDU[id] = Object.assign({ id, req: [], L: [], Q: null, gen: null, nq: 5, pass: 4, hint: [], src: [] }, o);
  if (o.band === 'HS' && o.cr && o.nq == null) { EDU[id].nq = 8; EDU[id].pass = 6; }
  EDU_ORDER.push(id); EDU_LAYOUT = null;
}
function eduState() {
  if (!G.edu) G.edu = { m: {}, best: {}, tries: {}, proj: {}, sec: {}, civ: { best: 0, passed: 0, run: null }, school: null, started: Date.now() };
  return G.edu;
}
function eduMastered(id) { return !!(G && G.edu && G.edu.m[id]); }
function eduOpen(id) { const n = EDU[id]; return !!n && n.req.every(r => !EDU[r] || eduMastered(r)); }
function eduMissing(id) { return EDU[id].req.filter(r => EDU[r] && !eduMastered(r)); }
function eduLane(id) { return EDU_LANES.find(l => l.id === id) || EDU_LANES[0]; }
function eduBand(id) { return EDU_BANDS.find(b => b.id === id) || EDU_BANDS[0]; }
function eduShuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// one question: {q, a, w:[3 wrong], why, steps, fig}
function eduQ(n, i) {
  let q;
  const gn = Array.isArray(n.gen) ? n.gen[Math.floor(Math.random() * n.gen.length)] : n.gen;   // a skill may draw on several makers
  if (gn && EDU_GEN[gn] && !(n.Q && n.Q.length && Math.random() < (n.mix || 0))) q = EDU_GEN[gn]();
  else { const b = n.Q || []; const r = b[i != null ? i % b.length : Math.floor(Math.random() * b.length)];
    q = { q: r[0], a: r[1], w: r.slice(2, 5).filter(x => x != null), why: r[5] || '', fig: r[6] || null }; }
  q.w = [...new Set((q.w || []).map(String))].filter(x => x !== String(q.a));
  for (let k = 1; q.w.length < 3 && k < 9; k++) {   // pad with near numbers if a maker came up short
    const m = /-?\d+(\.\d+)?/.exec(String(q.a)); if (!m) break;
    for (const v of [+m[0] + k, +m[0] - k]) { const s = String(q.a).replace(m[0], String(+(+v).toFixed(2))); if (s !== q.a && !q.w.includes(s) && q.w.length < 3) q.w.push(s); }
  }
  return q;
}
function eduTestSet(n, count) {
  const k = count || n.nq;
  if (n.gen) { const out = [], seen = new Set(); for (let t = 0; out.length < k && t < k * 8; t++) { const q = eduQ(n), key = q.q + '|' + q.a + '|' + JSON.stringify(q.fig || '');   // clocks and coins ask the same words of a new picture
    if (!seen.has(key)) { seen.add(key); out.push(q); } } return out; }
  return eduShuffle([...Array((n.Q || []).length).keys()]).slice(0, k).map(i => eduQ(n, i));
}
// ---------- credits and the diploma (Wis. Stat. 118.33; DPI: 15.5 credits plus the civics test, 65 of 100) ----------
const EDU_GRAD = [['eng', 'English (with writing)', 4], ['math', 'Mathematics', 3], ['sci', 'Science', 3], ['ss', 'Social studies (with state and local government)', 3],
  ['pe', 'Physical education', 1.5], ['health', 'Health', 0.5], ['pfl', 'Personal financial literacy', 0.5]];
function eduCredits() {
  const c = { eng: 0, math: 0, sci: 0, ss: 0, pe: 0, health: 0, pfl: 0, elec: 0 };
  if (G && G.edu) for (const id in G.edu.m) { const n = EDU[id]; if (n && n.cr) c[n.cr[0]] = (c[n.cr[0]] || 0) + n.cr[1]; }
  return c;
}
function eduGrad() {
  const c = eduCredits(), rows = EDU_GRAD.map(([k, name, need]) => ({ k, name, need, have: Math.min(c[k] || 0, 99), ok: (c[k] || 0) >= need }));
  const civ = !!(G.edu && G.edu.civ && G.edu.civ.passed), gov = eduMastered('ss_civics');
  const core = rows.reduce((s, r) => s + Math.min(r.have, r.need), 0);
  return { rows, civ, gov, core, elec: c.elec, done: rows.every(r => r.ok) && civ && gov };
}
// ---------- what each band means for a lane: mastered, open, total ----------
function eduCount(lane, band) {
  const ids = EDU_ORDER.filter(id => (!lane || EDU[id].lane === lane) && (!band || EDU[id].band === band));
  return { total: ids.length, done: ids.filter(eduMastered).length, open: ids.filter(id => !eduMastered(id) && eduOpen(id)).length };
}
function eduGradeLevel(lane) {   // the highest band finished in a lane: "K-2", "3-5"...; null if none
  let best = null; for (const b of EDU_BANDS) { const c = eduCount(lane, b.id); if (c.total && c.done === c.total) best = b.name; else break; } return best;
}
// ---------- mastering a skill ----------
function eduMaster(id, score, total) {
  const E = eduState(), n = EDU[id], first = !E.m[id], before = new Set(EDU_ORDER.filter(eduOpen));
  E.best[id] = Math.max(E.best[id] || 0, score); E.tries[id] = (E.tries[id] || 0) + 1;
  const out = { first, opened: [], und: 0, sec: null, credit: n.cr || null };
  if (first) {
    E.m[id] = Date.now();
    out.opened = EDU_ORDER.filter(x => !eduMastered(x) && eduOpen(x) && !before.has(x));
    if (n.sec && typeof SECTIONS !== 'undefined' && SECTIONS[n.sec] && !E.sec[n.sec]) { E.sec[n.sec] = 1; out.sec = SECTIONS[n.sec]; }
    if (typeof isRPG === 'function' && isRPG() && typeof giveUnd === 'function' && G.party) {   // the party learns along (an RPG save)
      const amt = { K2: 2, '35': 3, '68': 4, HS: 6 }[n.band] || 3; out.und = amt;
      for (const pid of G.party.order) if (G.party.m[pid]) giveUnd(pid, amt);
    }
  }
  if (typeof saveGame === 'function') saveGame();
  return out;
}
// Christian's Dewey sections can open early through the school (party.js memberSections)
if (typeof memberSections === 'function') { const _ms = memberSections; memberSections = function (id) {
  const r = _ms(id); if (id === 'christian' && G && G.edu && G.edu.sec) for (const k in G.edu.sec) if (!r.includes(k) && typeof SECTIONS !== 'undefined' && SECTIONS[k]) r.push(k); return r; }; }

// =====================================================================
//  THE MAP (canvas): lanes across, bands left to right, a line from each skill to the ones it opens
// =====================================================================
let EDU_LAYOUT = null;
const EDU_LX = 44, EDU_CW = 46, EDU_LH = 22, EDU_TOP = 32, EDU_BW = 40, EDU_BH = 16;
function eduLayout() {
  if (EDU_LAYOUT) return EDU_LAYOUT;
  const depth = {}, dep = id => { if (depth[id] != null) return depth[id]; depth[id] = 0; const n = EDU[id]; let v = 0;
    for (const r of n.req) if (EDU[r] && EDU[r].band === n.band) v = Math.max(v, dep(r) + 1); return depth[id] = v; };
  EDU_ORDER.forEach(dep);
  const pos = {}, bands = []; let start = 0;
  for (const b of EDU_BANDS) {
    let width = 1;
    for (const L of EDU_LANES) {
      const ids = EDU_ORDER.filter(id => EDU[id].band === b.id && EDU[id].lane === L.id).sort((p, q) => depth[p] - depth[q]);
      let next = 0; for (const id of ids) { const c = Math.max(depth[id], next); pos[id] = { col: start + c, lane: EDU_LANES.indexOf(L) }; next = c + 1; width = Math.max(width, c + 1); }
    }
    bands.push({ id: b.id, name: b.long, c0: start, c1: start + width - 1 }); start += width + 1;
  }
  for (const id in pos) { pos[id].x = EDU_LX + pos[id].col * EDU_CW; pos[id].y = EDU_TOP + pos[id].lane * EDU_LH; }
  return EDU_LAYOUT = { pos, bands, cols: start };
}
let EDT = null;   // the map's state: {sel, cam, ret, school}
function eduTree(opts) {
  eduState(); const o = opts || {}, Lo = eduLayout();
  let sel = o.sel && EDU[o.sel] ? o.sel : null;
  if (!sel) {   // the first open, unmastered skill in the school's band (or anywhere)
    const pick = b => EDU_ORDER.find(id => (!b || EDU[id].band === b) && !eduMastered(id) && eduOpen(id) && (!o.lane || EDU[id].lane === o.lane));
    sel = pick(o.band) || pick(null) || EDU_ORDER[0];
  }
  EDT = { sel, cam: 0, ret: o.ret || mode, school: o.school || (G.edu && G.edu.school) || '', t: 0 };
  if (o.school) G.edu.school = o.school;
  eduCam(true); setMode('edutree');
}
function eduCam(snap) { const p = eduLayout().pos[EDT.sel]; if (!p) return; const want = Math.max(0, p.x - EDU_LX - 140);
  EDT.cam = snap ? want : EDT.cam + (want - EDT.cam) * 0.25; }
function eduMove(dir) {
  const Lo = eduLayout(), p = Lo.pos[EDT.sel]; let best = null, bd = 1e9;
  for (const id of EDU_ORDER) { if (id === EDT.sel) continue; const q = Lo.pos[id], dx = q.x - p.x, dy = q.y - p.y;
    const ok = dir === 'left' ? dx < 0 : dir === 'right' ? dx > 0 : dir === 'up' ? dy < 0 : dy > 0; if (!ok) continue;
    const d = dir === 'left' || dir === 'right' ? Math.abs(dx) + Math.abs(dy) * 3 : Math.abs(dy) + Math.abs(dx) * 0.6; if (d < bd) { bd = d; best = id; } }
  if (best) { EDT.sel = best; if (typeof SND !== 'undefined') SND.play('cursor'); }
}
function eduLeave() { const r = EDT ? EDT.ret : 'walk'; EDT = null; setMode(r && MODES[r] ? r : 'walk'); }
MODES.edutree = {
  update() {
    if (DLG) return dlgUpdate();
    if (!EDT) return setMode('walk');
    EDT.t++; eduCam(false);
    for (const d of ['up', 'down', 'left', 'right']) if (pressed[d]) eduMove(d);
    if (pressed.a) return studyOpen(EDT.sel);
    if (pressed.menu || pressed.map) return studyReport();
    if (pressed.b) return eduLeave();
  },
  draw() {
    if (!EDT) return; const Lo = eduLayout(), cam = Math.round(EDT.cam);
    R(0, 0, SW, SH, '#10121e');
    // band headers and their columns
    for (const b of Lo.bands) { const x0 = EDU_LX + b.c0 * EDU_CW - 4 - cam, x1 = EDU_LX + b.c1 * EDU_CW + EDU_BW + 4 - cam;
      if (x1 < EDU_LX || x0 > SW) continue; R(x0, 18, x1 - x0, SH - 92, 'rgba(255,255,255,.035)'); txt(b.name, (x0 + x1) / 2, 22, '#9aa0c8', 'center', SMALL); }
    // the lines first: from each requirement to the skill it opens
    ctx.save(); ctx.beginPath(); ctx.rect(EDU_LX - 4, 18, SW - EDU_LX + 4, SH - 92); ctx.clip();
    for (const id of EDU_ORDER) { const n = EDU[id], q = Lo.pos[id];
      for (const r of n.req) { const p = Lo.pos[r]; if (!p) continue; const lit = eduMastered(r);
        ctx.strokeStyle = lit ? eduLane(EDU[r].lane).col : '#3a3c56'; ctx.globalAlpha = lit ? 0.8 : 0.6; ctx.lineWidth = 1;
        const x1 = p.x + EDU_BW - cam, y1 = p.y + EDU_BH / 2, x2 = q.x - cam, y2 = q.y + EDU_BH / 2, mx = Math.max(x1 + 3, x2 - 6);
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(mx, y1); ctx.lineTo(mx, y2); ctx.lineTo(x2, y2); ctx.stroke(); } }
    ctx.globalAlpha = 1;
    for (const id of EDU_ORDER) {
      const n = EDU[id], p = Lo.pos[id], x = p.x - cam, y = p.y; if (x < EDU_LX - EDU_BW || x > SW) continue;
      const L = eduLane(n.lane), done = eduMastered(id), open = eduOpen(id), sel = id === EDT.sel;
      R(x, y, EDU_BW, EDU_BH, done ? shade(L.col, -0.35) : open ? '#22253e' : '#16172a');
      const bc = sel ? '#ffffff' : done ? '#f0d060' : open ? L.col : '#3a3c56';
      R(x, y, EDU_BW, 1, bc); R(x, y + EDU_BH - 1, EDU_BW, 1, bc); R(x, y, 1, EDU_BH, bc); R(x + EDU_BW - 1, y, 1, EDU_BH, bc);
      if (sel && (EDT.t >> 4) % 2) { R(x - 2, y - 2, EDU_BW + 4, 1, '#fff'); R(x - 2, y + EDU_BH + 1, EDU_BW + 4, 1, '#fff'); }
      txt(n.s || n.n.slice(0, 6), x + EDU_BW / 2, y + 5, done ? '#fff6d0' : open ? '#e8eaff' : '#5a5c78', 'center', SMALL);
      if (done) R(x + EDU_BW - 5, y + 2, 3, 3, '#f0d060');
      if (n.proj && G.edu.proj[id]) R(x + 2, y + 2, 3, 3, '#7ae0f0');
      if (n.cr) R(x + 2, y + EDU_BH - 4, 3, 2, '#c8e8a0');
    }
    ctx.restore();
    // the lane names, fixed at the left
    R(0, 18, EDU_LX - 6, SH - 92, '#10121e');
    EDU_LANES.forEach((L, i) => { const y = EDU_TOP + i * EDU_LH; R(2, y + 2, 3, EDU_BH - 4, L.col); txt(L.short, 8, y + 5, L.col, 'left', SMALL); });
    // the title bar
    R(0, 0, SW, 16, '#1a1c34'); const c = eduCount();
    txt('THE SKILL TREE' + (EDT.school ? ' · ' + EDT.school.toUpperCase() : ''), 6, 4, '#fff', 'left', SMALL);
    txt('MASTERED ' + c.done + '/' + c.total, SW - 6, 4, '#f0d060', 'right', SMALL);
    // the chosen skill
    const n = EDU[EDT.sel], L = eduLane(n.lane), done = eduMastered(n.id), open = eduOpen(n.id);
    win(4, SH - 72, SW - 8, 68);
    txt(n.n, 12, SH - 64, '#fff'); txt(L.name + ' · ' + eduBand(n.band).long + (n.g ? ' (grade ' + n.g + ')' : ''), 12, SH - 52, L.col, 'left', SMALL);
    let st = done ? 'MASTERED · best ' + (G.edu.best[n.id] || 0) + '/' + n.nq : open ? 'OPEN · learn it or test out' : 'NEEDS ' + eduMissing(n.id).map(r => EDU[r].n).join(', ');
    const sl = wrap(st, SW - 30, SMALL).slice(0, 2); sl.forEach((l, i) => txt(l, 12, SH - 42 + i * 8, done ? '#f0d060' : open ? '#a8f0b0' : '#c8a0a0', 'left', SMALL));
    const extra = [n.cr ? 'CREDIT ' + n.cr[1] + ' ' + ({ eng: 'ENGLISH', math: 'MATH', sci: 'SCIENCE', ss: 'SOCIAL STUDIES', pe: 'PE', health: 'HEALTH', pfl: 'PERSONAL FINANCE', elec: 'ELECTIVE' })[n.cr[0]] : '', n.proj ? 'PROJECT' + (G.edu.proj[n.id] ? ' DONE' : '') : ''].filter(Boolean).join(' · ');
    if (extra) txt(extra, 12, SH - 24, '#c8e8a0', 'left', SMALL);
    txt('A OPEN · C REPORT CARD · B LEAVE', SW - 12, SH - 14, '#8a8eb8', 'right', SMALL);
    if (DLG) dlgDraw();
  } };
