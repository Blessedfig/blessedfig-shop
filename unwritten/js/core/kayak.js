"use strict";
// ---------- Tanner and the kayak trip (Nov 13). Tanner waits in the store (main floor, by the front window). His side quest
// is a summer paddle on a made-up Northwoods lake: find the painted turtles sunning on logs, watch the loons, and meet his
// demands one by one. The reward is a turtle outfit for GooseGoose. Christian writes Tanner's words; the lines in
// TANNER_LINES are plain stand-ins that only say what each step needs. A second Tanner quest (his house, an anime and
// manga quiz) is set aside for now. ----------
const TANNER = { f: 'main', x: 2, y: 23 };
function tannerHere() { return !!(G && G.inside && G.inside.f === TANNER.f); }
const TANNER_LINES = {
  ask: 'Tanner: Want to go kayaking? I know a lake up north.',
  again: 'Tanner: Back out on the lake?',
  after: 'Tanner: Good paddle.',
  start: 'A summer morning on a Northwoods lake. Paddle with the arrows; A looks and talks; B heads home.',
  demands: [
    ['turtles', 'Tanner wants to see painted turtles sunning on the logs: three logs of them. Drift in slowly or they slide off.'],
    ['loons', 'Tanner wants to watch both loons. Give them room: crowd a loon and it dives.'],
    ['lilies', 'Tanner wants to paddle through the water lilies in the north bay.'],
    ['beaver', 'Tanner wants a look at the beaver lodge in the east marsh.'],
    ['island', 'Tanner wants to paddle all the way around the big island.'],
  ],
  home: 'That keeps Tanner happy. Paddle back to the landing.',
};
function tannerTalk() {
  const done = G.quests && G.quests.kayak === 'done';
  ask(done ? TANNER_LINES.after : (G.quests && G.quests.kayak ? TANNER_LINES.again : TANNER_LINES.ask), [
    { t: done ? 'Paddle again' : 'Go kayaking', f: kayakStart }, { t: 'Not now' }]);
}
// ---- the lake: 2 m cells, made once from a fixed seed so everyone paddles the same lake ----
const KW = 180, KH = 132, KC = 2;   // 360 m x 264 m
const K_LAND = 0, K_DEEP = 1, K_SHAL = 2, K_MARSH = 3, K_SAND = 4, K_LILY = 5;
function krand(seed) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }
const KLAKE = (() => {
  const rnd = krand(20261113), L = new Uint8Array(KW * KH);
  const basins = [[90, 74, 60, 34, 0.12], [42, 46, 30, 19, -0.45], [138, 38, 30, 17, 0.5], [148, 100, 25, 19, 0.1], [52, 104, 22, 15, 0.35], [94, 24, 11, 24, 0.05]];
  const isl = [[98, 76, 16, 8, 0.3], [56, 44, 6, 4, 0.2]];
  const inE = (x, y, [cx, cy, rx, ry, a], wob) => { const dx = x - cx, dy = y - cy, u = dx * Math.cos(a) + dy * Math.sin(a), v = -dx * Math.sin(a) + dy * Math.cos(a);
    return (u / rx) ** 2 + (v / ry) ** 2 < 1 + wob * (Math.sin(x * 0.23 + y * 0.05) * 0.5 + Math.sin(y * 0.19 - x * 0.07 + 1.3) * 0.5); };
  for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) {
    let w = basins.some(b => inE(x, y, b, 0.16)); if (w && isl.some(b => inE(x, y, b, 0.12))) w = false;
    L[y * KW + x] = w ? K_DEEP : K_LAND;
  }
  const near = (x, y, r, t) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const X = x + i, Y = y + j; if (X < 0 || Y < 0 || X >= KW || Y >= KH) continue; if (L[Y * KW + X] === t) return true; } return false; };
  const S = L.slice();
  for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) if (L[y * KW + x] === K_DEEP && near(x, y, 3, K_LAND)) S[y * KW + x] = K_SHAL;
  for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) {
    const i = y * KW + x; if (S[i] === K_LAND) continue;
    if (Math.hypot(x - 152, y - 104) < 17 && (S[i] === K_SHAL || Math.hypot(x - 158, y - 108) < 9)) S[i] = K_MARSH;    // the east marsh
    if (y < 34 && Math.abs(x - 94) < 10 && (Math.sin(x * 1.7 + y * 2.3) + Math.sin(x * 0.9 - y * 1.1)) > 0.2) S[i] = K_LILY;   // lilies in the north bay
  }
  let ly = KH - 1; while (ly > 0 && S[ly * KW + 90] === K_LAND) ly--;    // the landing on the south shore
  for (let y = ly; y < Math.min(KH, ly + 5); y++) for (let x = 84; x <= 96; x++) if (S[y * KW + x] === K_LAND) S[y * KW + x] = K_SAND;
  const logs = [], shoreCells = [];
  for (let y = 2; y < KH - 2; y++) for (let x = 2; x < KW - 2; x++) if (S[y * KW + x] === K_SHAL && near(x, y, 1, K_LAND) && !near(x, y, 2, K_SAND)) shoreCells.push([x, y]);
  for (let t = 0; t < 400 && logs.length < 6; t++) { const [x, y] = shoreCells[(rnd() * shoreCells.length) | 0];
    if (logs.some(l => Math.hypot(l.x / KC - x, l.y / KC - y) < 30) || Math.hypot(x - 90, y - ly) < 25) continue;
    let gx = 0, gy = 0; for (let j = -2; j <= 2; j++) for (let i = -2; i <= 2; i++) if (S[(y + j) * KW + x + i] === K_LAND) { gx += i; gy += j; }
    logs.push({ x: (x + 0.5) * KC, y: (y + 0.5) * KC, a: Math.atan2(gy, gx) + Math.PI / 2, n: 1 + ((rnd() * 3) | 0), up: true, t: 0, seen: false }); }
  const trees = [];
  for (let y = 0; y < KH; y += 2) for (let x = 0; x < KW; x += 2) { const i = y * KW + x; if (S[i] !== K_LAND || !near(x, y, 7, K_DEEP) || rnd() > 0.55) continue;
    const ev = rnd() < 0.6 ? 1 : 0; trees.push({ x: (x + rnd() * 2) * KC, y: (y + rnd() * 2) * KC, ev, v: (rnd() * 6) | 0, r: ev ? 1.6 + rnd() * 1.2 : 2.4 + rnd() * 1.6, h: ev ? 12 + rnd() * 8 : 11 + rnd() * 7 }); }
  trees.sort((a, b) => a.y - b.y);
  return { L: S, ly, logs, trees, lodge: { x: 164 * KC, y: 112 * KC }, island: { x: 98 * KC, y: 76 * KC }, landing: { x: 90 * KC, y: (ly - 2) * KC } };
})();
function kCell(x, y) { const cx = Math.floor(x / KC), cy = Math.floor(y / KC); return cx < 0 || cy < 0 || cx >= KW || cy >= KH ? K_LAND : KLAKE.L[cy * KW + cx]; }
const K_WET = new Set([K_DEEP, K_SHAL, K_MARSH, K_LILY]);
// ---- the static picture of the lake, drawn once ----
let KMAP = null;
function kMap() {
  if (KMAP) return KMAP;
  const c = document.createElement('canvas'); c.width = KW * KC * PM; c.height = KH * KC * PM; const g = c.getContext('2d'), Z = KC * PM;
  const col = { [K_LAND]: '#3c5a2c', [K_DEEP]: '#24465a', [K_SHAL]: '#356474', [K_MARSH]: '#4e6e4a', [K_SAND]: '#c8b488', [K_LILY]: '#2e5a66' };
  for (let y = 0; y < KH; y++) for (let x = 0; x < KW; x++) { const t = KLAKE.L[y * KW + x]; g.fillStyle = col[t]; g.fillRect(x * Z, y * Z, Z, Z);
    const q = hash(x * 3 + 7, y * 5 + 1);
    if (t === K_LAND) { g.fillStyle = q % 2 ? '#34502a' : '#46663a'; g.fillRect(x * Z + q % 12, y * Z + (q >> 4) % 12, 3, 2); if (q % 5 === 0) { g.fillStyle = '#6a5a3a'; g.fillRect(x * Z + (q >> 3) % 13, y * Z + (q >> 6) % 13, 2, 1); } }
    if (t === K_DEEP || t === K_SHAL) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(x * Z + q % 10, y * Z + (q >> 4) % 14, 5, 1); }
    if (t === K_MARSH) for (let k = 0; k < 5; k++) { const r = hash(x * 7 + k, y * 11 + k); g.fillStyle = k % 2 ? '#7a8a4a' : '#3e5a2e'; g.fillRect(x * Z + r % 15, y * Z + (r >> 4) % 10, 1, 5); if (k === 0 && r % 3 === 0) { g.fillStyle = '#5a3a20'; g.fillRect(x * Z + r % 15, y * Z + (r >> 4) % 10 - 2, 1, 2); } }
    if (t === K_LILY) for (let k = 0; k < 2; k++) { const r = hash(x * 13 + k, y * 17 + k), px = x * Z + 4 + r % 9, py = y * Z + 4 + (r >> 4) % 9;
      g.fillStyle = '#3e7a34'; g.beginPath(); g.arc(px, py, 4, 0.5, 6.0); g.lineTo(px, py); g.fill(); g.fillStyle = '#5a9a44'; g.fillRect(px - 2, py - 2, 2, 1);
      if (r % 4 === 0) { g.fillStyle = '#f4f0f0'; g.fillRect(px - 1, py - 1, 3, 3); g.fillStyle = '#f0d040'; g.fillRect(px, py, 1, 1); } }
    if (t !== K_LAND && t !== K_SAND) { const up = y > 0 ? KLAKE.L[(y - 1) * KW + x] : K_LAND; if (up === K_LAND) { g.fillStyle = 'rgba(20,30,20,.45)'; g.fillRect(x * Z, y * Z, Z, 3); } }   // bank shadow
  }
  const L = KLAKE.landing; g.fillStyle = '#2a1e16'; g.fillRect((L.x - 1.2) * PM - 1, (L.y - 9) * PM - 1, 2.4 * PM + 2, 12 * PM + 2); g.fillStyle = '#9a7a56'; g.fillRect((L.x - 1.2) * PM, (L.y - 9) * PM, 2.4 * PM, 12 * PM);
  g.fillStyle = '#7e6044'; for (let y = (L.y - 9) * PM; y < (L.y + 3) * PM; y += 4) g.fillRect((L.x - 1.2) * PM, y, 2.4 * PM, 1);   // the dock
  const B = KLAKE.lodge; g.fillStyle = '#3a2a1c'; g.beginPath(); g.ellipse(B.x * PM, B.y * PM, 26, 17, 0, 0, 6.29); g.fill();
  g.strokeStyle = '#6a5034'; g.lineWidth = 2; for (let k = 0; k < 22; k++) { const a = hash(k, 3) % 628 / 100, r = 6 + hash(k, 9) % 16; g.beginPath(); g.moveTo(B.x * PM + Math.cos(a) * r, B.y * PM + Math.sin(a) * r * 0.65); g.lineTo(B.x * PM + Math.cos(a + 0.8) * (r - 5), B.y * PM + Math.sin(a + 0.8) * (r - 5) * 0.65); g.stroke(); }   // the beaver lodge
  for (const l of KLAKE.logs) { g.save(); g.translate(l.x * PM, l.y * PM); g.rotate(l.a); g.fillStyle = '#2a1e14'; g.fillRect(-27, -5, 54, 10); g.fillStyle = '#6a4e32'; g.fillRect(-26, -4, 52, 8); g.fillStyle = '#4e3824'; for (let u = -22; u < 24; u += 7) g.fillRect(u, -4, 1, 8); g.fillStyle = '#8a6a48'; g.fillRect(-26, -4, 52, 2); g.restore(); }
  return (KMAP = c);
}
// ---- the trip ----
const KT = { on: false };
function kayakStart() {
  G.quests = G.quests || {}; if (!G.quests.kayak) G.quests.kayak = 'started';
  const L = KLAKE.landing;
  Object.assign(KT, { on: true, x: L.x, y: L.y - 12, h: -Math.PI / 2, v: 0, tx: L.x + 3, ty: L.y - 4, th: -Math.PI / 2, trail: [], step: 0, logsSeen: 0, loonsSeen: 0, lilyT: 0, ang: 0, lastA: null, near: 0, msgT: 0, msg: '', back: G.inside ? { ...G.inside } : null, done: false,
    loons: [0, 1].map(k => ({ x: (60 + k * 70) * KC, y: (64 + k * 10) * KC, h: k * 2, t: 6 + k * 9, under: false, seen: false, watch: 0 })) });
  KLAKE.logs.forEach(l => { l.up = true; l.t = 0; l.seen = false; l.watch = 0; });
  setMode('kayak'); say([['', TANNER_LINES.start], ['', TANNER_LINES.demands[0][1]]]);
}
function kayakEnd(won) {
  KT.on = false;
  if (won) { G.quests.kayak = 'done'; G.outfits = G.outfits || {}; G.outfits.turtle = true; }
  if (KT.back) G.inside = KT.back; saveGame(); setMode('inside');
  if (won) say([['', 'Back at the store.'], ['', 'GooseGoose\'s turtle outfit is yours. He can wear it once he\'s free of the stone and following you.']]);
}
const kWet = (x, y) => K_WET.has(kCell(x, y)) || kCell(x, y) === K_SAND;
function kDemandDone(id) {
  if (id === 'turtles') return KT.logsSeen >= 3;
  if (id === 'loons') return KT.loonsSeen >= 2;
  if (id === 'lilies') return KT.lilyT > 90;
  if (id === 'beaver') return Math.hypot(KT.x - KLAKE.lodge.x, KT.y - KLAKE.lodge.y) < 18;
  if (id === 'island') return Math.abs(KT.ang) > 6.1;
  return false;
}
function kSay(m) { KT.msg = m; KT.msgT = 200; }
MODES.kayak = {
  update() {
    if (DLG) return dlgUpdate();
    if (KT.reward) { if (pressed.a || pressed.b) { KT.reward = false; kayakEnd(true); } return; }
    if (pressed.b) return ask('Paddle back and call it a day?', [{ t: 'Keep paddling' }, { t: 'Head home', f: () => kayakEnd(false) }]);
    // paddling: up pulls ahead, down back-paddles, left and right turn; B-free, no running on water
    const turn = 0.032 + Math.min(0.02, Math.abs(KT.v) * 0.006);
    if (held.left) KT.h -= turn; if (held.right) KT.h += turn;
    if (held.up) KT.v += 0.05; if (held.down) KT.v -= 0.07;
    const c0 = kCell(KT.x, KT.y); KT.v *= c0 === K_LILY || c0 === K_MARSH ? 0.955 : 0.986; KT.v = Math.max(-1.2, Math.min(3.4, KT.v));
    const nx = KT.x + Math.cos(KT.h) * KT.v / 60, ny = KT.y + Math.sin(KT.h) * KT.v / 60;
    const hit = !kWet(nx + Math.cos(KT.h) * 2, ny + Math.sin(KT.h) * 2) || KLAKE.logs.some(l => Math.hypot(nx - l.x, ny - l.y) < 3.2);
    if (hit) KT.v *= -0.3; else { KT.x = nx; KT.y = ny; }
    if (frame % 4 === 0) { KT.trail.push([KT.x, KT.y]); if (KT.trail.length > 60) KT.trail.shift(); }
    const tg = KT.trail[Math.max(0, KT.trail.length - 22)] || [KT.x, KT.y + 8];   // Tanner keeps about 10 m behind
    const dx = tg[0] - KT.tx, dy = tg[1] - KT.ty, d = Math.hypot(dx, dy);
    if (d > 1.5) { const a = Math.atan2(dy, dx), sp = Math.min(3.6, d * 0.9) / 60; KT.th += Math.atan2(Math.sin(a - KT.th), Math.cos(a - KT.th)) * 0.08; KT.tx += Math.cos(KT.th) * sp * 60 / 60; KT.ty += Math.sin(KT.th) * sp * 60 / 60; }
    const quiet = Math.abs(KT.v) < 1.6;
    for (const l of KLAKE.logs) {   // painted turtles: they slide off if you come in fast, and climb back later
      const dl = Math.hypot(KT.x - l.x, KT.y - l.y);
      if (l.up && dl < 14 && !quiet) { l.up = false; l.t = 25 * 60; kSay('Plop! The turtles slid off the log. Come in slower.'); }
      if (!l.up && --l.t <= 0) l.up = true;
      if (l.up && dl < 15 && quiet) { l.watch++; if (l.watch > 70 && !l.seen) { l.seen = true; KT.logsSeen++; kSay(l.n + ' painted turtle' + (l.n > 1 ? 's' : '') + ' sunning on a log. (' + KT.logsSeen + ' logs)'); } } else l.watch = 0;
    }
    for (const o of KT.loons) {   // loons: up for a while, then a long dive; crowd one and it dives at once
      o.t -= 1 / 60; const dl = Math.hypot(KT.x - o.x, KT.y - o.y);
      if (!o.under) {
        o.x += Math.cos(o.h) * 0.25 / 60; o.y += Math.sin(o.h) * 0.25 / 60; if (Math.random() < 0.004) o.h += (Math.random() - 0.5) * 2;
        if (!K_WET.has(kCell(o.x + Math.cos(o.h) * 4, o.y + Math.sin(o.h) * 4))) o.h += Math.PI * 0.8;
        if (dl < 22) { o.under = true; o.t = 9 + Math.random() * 6; o.watch = 0; kSay('Too close. The loon dove.'); }
        else if (o.t <= 0) { o.under = true; o.t = 8 + Math.random() * 8; }
        else if (dl < 70 && Math.abs(KT.v) < 2.4) { o.watch++; if (o.watch > 120 && !o.seen) { o.seen = true; KT.loonsSeen++; kSay('A common loon: black head, white necklace, checkered back. (' + KT.loonsSeen + ' of 2)'); } }
        else o.watch = 0;
      } else if (o.t <= 0) {   // comes up somewhere else, on open water
        for (let k = 0; k < 30; k++) { const a = Math.random() * 6.28, r = 25 + Math.random() * 30, x = o.x + Math.cos(a) * r, y = o.y + Math.sin(a) * r;
          if (kCell(x, y) === K_DEEP && Math.hypot(x - KT.x, y - KT.y) > 30) { o.x = x; o.y = y; break; } }
        o.under = false; o.t = 20 + Math.random() * 20;
      }
    }
    if (kCell(KT.x, KT.y) === K_LILY) KT.lilyT++;
    const I = KLAKE.island, a = Math.atan2(KT.y - I.y, KT.x - I.x);   // circling the island counts the angle swept
    if (Math.hypot(KT.x - I.x, KT.y - I.y) < 70) { if (KT.lastA !== null) KT.ang += Math.atan2(Math.sin(a - KT.lastA), Math.cos(a - KT.lastA)); KT.lastA = a; } else { KT.lastA = null; KT.ang = 0; }
    const D = TANNER_LINES.demands;
    if (KT.step < D.length && kDemandDone(D[KT.step][0])) { KT.step++; say([['', KT.step < D.length ? D[KT.step][1] : TANNER_LINES.home]]); }
    if (KT.step >= D.length && Math.hypot(KT.x - KLAKE.landing.x, KT.y - KLAKE.landing.y) < 12) KT.reward = true;
    if (pressed.a) {
      const dt = Math.hypot(KT.x - KT.tx, KT.y - KT.ty);
      say([['', dt < 14 ? (KT.step < D.length ? D[KT.step][1] : TANNER_LINES.home) : 'Tanner is too far back to hear you.']]);
    }
    if (KT.msgT > 0) KT.msgT--;
  },
  draw() {
    const camx = KT.x * PM - SW / 2, camy = KT.y * PM - SH / 2, M = kMap();
    R(0, 0, SW, SH, '#3c5a2c'); ctx.drawImage(M, Math.round(-camx), Math.round(-camy));
    const sx = x => Math.round(x * PM - camx), sy = y => Math.round(y * PM - camy);
    for (let k = 0; k < 18; k++) { const q = hash(k, (frame >> 6) + k), x = (q % SW + frame * 0.2) % SW, y = (q >> 9) % SH; if (K_WET.has(kCell((x + camx) / PM, (y + camy) / PM))) F('rgba(255,255,255,.18)', x | 0, y, 4, 1); }   // glints
    for (const l of KLAKE.logs) if (l.up) for (let k = 0; k < l.n; k++) {   // turtles on the logs
      const u = (k - (l.n - 1) / 2) * 14, x = sx(l.x) + Math.cos(l.a) * u, y = sy(l.y) + Math.sin(l.a) * u - 3;
      F('#14140e', x - 5, y - 4, 10, 8); F('#3a4430', x - 4, y - 3, 8, 6); F('#5a6440', x - 2, y - 3, 4, 2); F('#c8a030', x - 4, y + 2, 8, 1); F('#c03a24', x - 5, y - 1, 1, 2); F('#14140e', x + 4, y - 2, 4, 3); F('#e0c040', x + 5, y - 1, 2, 1);
    }
    for (const o of KT.loons) {   // loons
      if (o.under) continue; const x = sx(o.x), y = sy(o.y), f = Math.cos(o.h) >= 0 ? 1 : -1;
      F('rgba(255,255,255,.25)', x - f * 14, y + 3, 6, 1); F('#0c0c10', x - 8, y - 4, 16, 8); F('#1e2024', x - 7, y - 3, 13, 6);
      for (let k = -6; k < 5; k += 3) F('#e8e8e8', x + k, y - 2, 1, 1); F('#0c0c10', x + f * 5, y - 9, 6, 6); F('#16302a', x + f * 6, y - 8, 4, 4); F('#e8e8e8', x + f * 5, y - 4, 5, 1); F('#c02020', x + f * 7, y - 7, 1, 1); F('#2a2a2a', x + (f > 0 ? 10 : -12), y - 7, 3, 1);
    }
    const things = KLAKE.trees.filter(t => sx(t.x) > -60 && sx(t.x) < SW + 60 && sy(t.y) > -20 && sy(t.y) < SH + 160).map(t => ({ y: t.y, d: () => { const im = (treeImgSized.summer || treeImgSized)(t.ev, t.v, t.r, t.h); ctx.fillStyle = 'rgba(10,20,10,.25)'; ctx.beginPath(); ctx.ellipse(sx(t.x) + 5, sy(t.y) + 2, im.width * 0.42, im.width * 0.16, 0, 0, 6.29); ctx.fill(); ctx.drawImage(im, Math.round(sx(t.x) - im.width / 2), sy(t.y) - im.height + 6); } }));
    const kayak = (x, y, h, hull, who) => () => {   // a kayak from above, its paddler, the wake
      ctx.save(); ctx.translate(sx(x), sy(y)); ctx.rotate(h);
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(-30, -5, 8, 1); ctx.fillRect(-34, 4, 8, 1);
      ctx.fillStyle = '#1a1418'; ctx.beginPath(); ctx.ellipse(0, 0, 23, 6, 0, 0, 6.29); ctx.fill(); ctx.fillStyle = hull; ctx.beginPath(); ctx.ellipse(0, 0, 22, 5, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-16, -3, 30, 1); ctx.fillStyle = '#1a1418'; ctx.fillRect(-6, -4, 9, 8);   // cockpit
      const sw = Math.sin(frame / 9 + x) * 6; ctx.fillStyle = '#d8c070'; ctx.fillRect(-2 + sw * 0.3, -15, 2, 30); ctx.fillStyle = '#e8a030'; ctx.fillRect(-4 + sw * 0.3, -17, 6, 4); ctx.fillRect(-4 - sw * 0.3, 13, 6, 4);   // the paddle
      ctx.restore();
      drawFolkTop(who, sx(x), sy(y));
    };
    things.push({ y: KT.ty, d: kayak(KT.tx, KT.ty, KT.th, '#c84a2a', 'tanner') }, { y: KT.y, d: kayak(KT.x, KT.y, KT.h, '#2a8ac8', null) });
    things.sort((a, b) => a.y - b.y).forEach(t => t.d());
    // what Tanner wants now, and the tallies
    const D = TANNER_LINES.demands, line = KT.step < D.length ? D[KT.step][1] : TANNER_LINES.home;
    win(4, 4, SW - 8, 34); ctx.font = SMALL; let s = line; while (s.length > 10 && ctx.measureText(s).width > SW - 24) s = s.slice(0, -2) + '…';
    txt(s, 12, 10, '#ffffff', 'left', SMALL); txt('Turtle logs ' + KT.logsSeen + '/3   Loons ' + KT.loonsSeen + '/2   Demand ' + Math.min(KT.step + 1, D.length) + ' of ' + D.length, 12, 23, '#ffd860', 'left', SMALL);
    if (KT.msgT > 0) { win(4, SH - 46, SW - 8, 22); txt(KT.msg, 12, SH - 40, '#ffffff', 'left', SMALL); }
    txt('ARROWS PADDLE · A TANNER · B HEAD HOME', SW / 2, SH - 14, '#c8d0ff', 'center', SMALL);
    if (KT.reward) drawTurtleReward();
    if (DLG) dlgDraw();
  }
};
function drawFolkTop(who, x, y) {   // a paddler seen from above: shoulders, head, and Tanner's cap
  const kid = who === null, hair = kid ? '#4a3020' : FOLKS[who].hair, shirt = kid ? '#5a6ab0' : FOLKS[who].shirt;
  F('#1a1418', x - 6, y - 5, 12, 10); F(shirt, x - 5, y - 4, 10, 8); F('#1a1418', x - 4, y - 9, 8, 8); F(kid ? '#e8b890' : FOLKS[who].skin, x - 3, y - 8, 6, 6); F(hair, x - 3, y - 8, 6, 3);
  if (who === 'tanner') { F('#4e5a34', x - 4, y - 9, 8, 4); F('#3a4426', x - 4, y - 6, 8, 1); }
}
// ---- the reward: GooseGoose in a turtle outfit, drawn for this; he wears it once he follows you ----
function drawGooseTurtle(cx, by, s) {
  const P = (c, x, y, w, h) => F(c, Math.round(cx + x * s), Math.round(by + y * s), Math.ceil(w * s), Math.ceil(h * s)), E = (c, x, y, rx, ry) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(cx + x * s, by + y * s, rx * s, ry * s, 0, 0, 6.29); ctx.fill(); };
  E('#4a4a50', 0, -3, 22, 6); P('#6e6e74', -21, -6, 42, 4); P('#8a8a90', -19, -7, 38, 2);           // the stone base
  P('#e08a20', -8, -10, 5, 3); P('#e08a20', 3, -10, 5, 3);                                          // feet
  E('#1a1418', 0, -20, 17, 12); E('#f4f2ec', 0, -20, 16, 11);                                      // body
  E('#1a1418', 1, -24, 15, 10); E('#4e8a3a', 1, -25, 14, 9);                                       // the shell
  ctx.strokeStyle = '#2e5a24'; ctx.lineWidth = Math.max(1, s * 0.8); ctx.beginPath();
  for (const [x, y] of [[-6, -27], [3, -29], [10, -25], [-3, -21], [7, -20]]) { ctx.moveTo(cx + (x - 3) * s, by + y * s); ctx.lineTo(cx + (x - 1.5) * s, by + (y - 3) * s); ctx.lineTo(cx + (x + 1.5) * s, by + (y - 3) * s); ctx.lineTo(cx + (x + 3) * s, by + y * s); ctx.lineTo(cx + (x + 1.5) * s, by + (y + 3) * s); ctx.lineTo(cx + (x - 1.5) * s, by + (y + 3) * s); ctx.closePath(); }
  ctx.stroke(); P('#c8c860', -13, -18, 27, 1.5);                                                    // its yellow rim
  P('#1a1418', -15, -44, 7, 20); P('#f4f2ec', -14, -43, 5, 19);                                    // neck
  E('#1a1418', -12, -47, 7, 6); E('#f4f2ec', -12, -47, 6, 5);                                      // head
  E('#4e8a3a', -12, -50, 6.5, 4); P('#2e5a24', -18, -50, 13, 1);                                   // the turtle hood
  P('#ffffff', -15, -54, 2.5, 2.5); P('#ffffff', -10, -54, 2.5, 2.5); P('#1a1418', -14, -53, 1.2, 1.2); P('#1a1418', -9, -53, 1.2, 1.2);   // the hood's eyes
  P('#1a1418', -10, -47, 1.5, 1.5); P('#e08a20', -20, -46, 5, 3); P('#c06a10', -20, -44, 5, 1);    // GooseGoose's eye and beak
}
function drawTurtleReward() {
  F('rgba(0,0,0,.55)', 0, 0, SW, SH); win(SW / 2 - 150, 30, 300, 210);
  txt('GooseGoose\'s turtle outfit', SW / 2, 40, '#ffd860', 'center');
  drawGooseTurtle(SW / 2, 196, 2.2);
  txt('Tanner\'s reward. Press A.', SW / 2, 214, '#c8d0ff', 'center', SMALL);
}
