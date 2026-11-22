"use strict";
// =====================================================================
//  DISC GOLF at Springbrook (Christian, Nov 16: "Can you find info on the disc golf course? For Springbrook? I want to add that as a minigame").
//  The City of Antigo Disc Golf Course, Springbrook Trailhead on N. Virginia Street (UDisc pin 45.148042, -89.141769).
//  The 18 holes' real distances and pars are from UDisc's "18 Holes Full Course" layout (par 55, about 4,782 ft).
//  The hole shapes and trees are stand-ins drawn by the game (no public fairway map exists); a photo of a hole can replace one.
//  Throw: LEFT/RIGHT aim, UP/DOWN disc, MAP key (M) the release angle, A for power, A again for accuracy. Putts inside 66 ft.
// =====================================================================
const DG_HOLES = [[244, 3], [285, 3], [203, 3], [289, 3], [343, 3], [201, 3], [566, 4], [265, 3], [418, 3],
                  [374, 3], [241, 3], [137, 3], [232, 3], [118, 3], [131, 3], [177, 3], [237, 3], [320, 3]];
const DG_DISCS = [   // max distance at full power (ft), turn (early drift right, RHBH), fade (late hook left)
  { name: 'DRIVER', max: 400, turn: 1.0, fade: 2.6, col: '#e85a3a' },
  { name: 'MIDRANGE', max: 300, turn: 0.3, fade: 1.2, col: '#3ab0e8' },
  { name: 'PUTTER', max: 210, turn: 0.0, fade: 0.8, col: '#f0d040' }];
const DG_ANGLES = ['HYZER', 'FLAT', 'ANHYZER'];
const DG_INFO = [['', 'The City of Antigo Disc Golf Course. It opened in 2011 with nine holes, paid for by local businesses.'],
  ['', 'In 2016 the Antigo Rotary, the parks department and the local disc golf league cleared brush and set nine more baskets: eighteen in all.'],
  ['', 'Concrete tee pads came after a 2021 winter tournament raised money for them. The course is free to play, all year.']];
// the basket at the trailhead, on the real map
const DG_SPOT = (() => { try { const [x, y] = freeNearM(997, 748); return { x, y }; } catch (e) { return { x: 997, y: 748 }; } })();
PROPS.push({ x: DG_SPOT.x + 1.2, y: DG_SPOT.y + 0.4, k: 'dgbasket', dg: 1 }); PROPS.sort((a, b) => a.y - b.y);
{ const _dp = drawProp; drawProp = function (p) {
  if (p.k !== 'dgbasket') return _dp(p);
  const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM);
  F('rgba(0,0,0,.22)', x - 6, y - 1, 13, 3); F('#8a8a92', x - 1, y - m(1.5), 2, m(1.5));
  F('#d8d040', x - 7, y - m(1.5) - 2, 15, 3); for (let i = -6; i <= 6; i += 3) F('#c8c8d0', x + i, y - m(1.5) - 10, 1, 8);
  F('#c8c8d0', x - 7, y - m(1.5) - 12, 15, 2); F('#d8d040', x - 7, y - m(0.9), 15, 3); F('#a8a8b0', x - 6, y - m(0.9) + 3, 13, 2);
}; }
{ const _la = lookAt; lookAt = function (x, y) {
  if (mode === 'walk' && !DLG && Math.hypot(x - DG_SPOT.x - 1, y - DG_SPOT.y) < 3) return dgIntro();
  return _la(x, y);
}; }
function dgIntro() {
  G.dg = G.dg || { best: {}, rounds: 0, aces: 0 };
  const b = G.dg.best, bs = k => b[k] != null ? ' (best ' + (b[k] > 0 ? '+' : '') + b[k] + ')' : '';
  ask('A disc golf basket, chains catching the light. The Springbrook course starts here: eighteen holes through the trees.', [
    { t: 'Play all 18' + bs('all'), f: () => dgStart(0, 18, 'all') }, { t: 'Front nine' + bs('front'), f: () => dgStart(0, 9, 'front') },
    { t: 'Back nine' + bs('back'), f: () => dgStart(9, 18, 'back') }, { t: 'About the course', f: () => say(DG_INFO) }, { t: 'Not now' }]);
}
// ---------- a hole: tee at (0,0), the basket up the screen; a dogleg and trees, seeded by the hole number (stand-ins) ----------
function dgRand(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
function dgHole(i) {
  const [L, par] = DG_HOLES[i], r = dgRand(i * 7 + 3), open = i === 6 || i === 8 || r() < 0.15;   // hole 7 crosses the big field
  const bend = (r() - 0.5) * (L > 250 ? 0.9 : 0.5), mid = 0.45 + r() * 0.2;
  const m = { x: Math.sin(bend * 0.5) * L * mid * 0.4, y: -L * mid };
  const bx = m.x + Math.sin(bend) * L * (1 - mid), by = m.y - Math.cos(bend) * L * (1 - mid);
  const trees = [], W = open ? 90 : 40 + r() * 25;
  const along = (t) => t < mid ? [m.x * t / mid, m.y * t / mid] : [m.x + (bx - m.x) * (t - mid) / (1 - mid), m.y + (by - m.y) * (t - mid) / (1 - mid)];
  for (let k = 0; k < (open ? 14 : 46); k++) {
    const t = 0.08 + r() * 1.05, side = r() < 0.5 ? -1 : 1, [ax, ay] = along(Math.min(1.1, t)), off = W * (0.75 + r() * 1.6) * side;
    trees.push({ x: ax + off, y: ay + (r() - 0.5) * 20, r: 7 + r() * 9, hit: 2.5 + r() * 2 });
  }
  if (!open) for (let k = 0; k < 3 + (r() * 3 | 0); k++) { const t = 0.25 + r() * 0.6, [ax, ay] = along(t); trees.push({ x: ax + (r() - 0.5) * W * 0.9, y: ay, r: 6 + r() * 5, hit: 2 + r() }); }   // a few in play
  return { i, L, par, tee: { x: 0, y: 0 }, mid: m, basket: { x: bx, y: by }, trees: trees.filter(t => Math.hypot(t.x - bx, t.y - by) > 22 && Math.hypot(t.x, t.y) > 25), open, wind: { a: r() * 6.28, mph: Math.round(r() * (open ? 12 : 6)) } };
}
// ---------- the round ----------
let DG = null;
function dgStart(a, b, key) { DG = { a, b, key, h: a, ret: mode, card: [], hole: null }; dgNewHole(); setMode('discgolf'); }
function dgNewHole() {
  const H = dgHole(DG.h); DG.hole = H; DG.pos = { x: 0, y: 0 }; DG.strokes = 0; DG.disc = 0; DG.angle = 1; DG.aim = Math.atan2(H.mid.x, -H.mid.y);
  DG.phase = 'card'; DG.t = 0; DG.flight = null; DG.msg = null; dgCam(true);
}
function dgDist() { const H = DG.hole; return Math.hypot(H.basket.x - DG.pos.x, H.basket.y - DG.pos.y); }
function dgCam(snap) {   // fit the tee, the disc and the basket; zoom in near the basket
  const H = DG.hole, near = dgDist() < 90, pts = near ? [DG.pos, H.basket] : [H.tee, H.mid, H.basket, DG.pos];
  let x0 = Math.min(...pts.map(p => p.x)), x1 = Math.max(...pts.map(p => p.x)), y0 = Math.min(...pts.map(p => p.y)), y1 = Math.max(...pts.map(p => p.y));
  const pad = near ? 40 : 50, z = Math.max(0.3, Math.min(near ? 2.6 : 1.3, Math.min((SW - 40) / (x1 - x0 + pad * 2), (SH - 90) / (y1 - y0 + pad * 2))));
  const want = { z, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  if (snap || !DG.cam) DG.cam = want; else for (const k of ['z', 'cx', 'cy']) DG.cam[k] += (want[k] - DG.cam[k]) * 0.08;
}
const dgS = (x, y) => [SW / 2 + (x - DG.cam.cx) * DG.cam.z, (SH - 50) / 2 + 20 + (y - DG.cam.cy) * DG.cam.z];
// the flight: heading drifts right early (turn) and hooks left late (fade), more with a hyzer, less with an anhyzer; wind pushes it
function dgFly(power, err) {
  const H = DG.hole, D = DG_DISCS[DG.disc], dist = D.max * Math.min(1.05, power) * (DG.angle === 0 ? 0.92 : DG.angle === 2 ? 0.95 : 1);
  const steps = 70, pts = []; let x = DG.pos.x, y = DG.pos.y, hd = DG.aim + err * 0.21;
  const ang = DG.angle === 0 ? -0.5 : DG.angle === 2 ? 0.55 : 0, w = H.wind, wx = Math.cos(w.a) * w.mph * 0.18, wy = Math.sin(w.a) * w.mph * 0.18;
  for (let k = 1; k <= steps; k++) {
    const t = k / steps, sp = dist / steps;
    const curve = (t < 0.55 ? D.turn * power * 0.012 : -D.fade * (0.6 + t) * 0.016) + ang * 0.01;
    hd += curve; x += Math.sin(hd) * sp + wx * t * 0.5; y -= Math.cos(hd) * sp + wy * t * 0.5;
    for (const tr of H.trees) if (Math.hypot(tr.x - x, tr.y - y) < tr.hit) { pts.push({ x, y, hit: tr }); return pts; }
    pts.push({ x, y });
  }
  return pts;
}
function dgPuttChance(d, err) { const base = d <= 10 ? 0.98 : d <= 33 ? 0.98 - (d - 10) * 0.021 : Math.max(0.04, 0.5 - (d - 33) * 0.013); return Math.max(0.02, base * (1 - Math.min(0.8, Math.abs(err) * 0.9))); }
MODES.discgolf = {
  update() {
    if (DLG) return dlgUpdate();
    const D = DG; D.t++; dgCam(false);
    if (D.phase === 'card') { if (pressed.a || D.t > 150) { D.phase = 'aim'; D.t = 0; } return; }
    if (D.phase === 'aim') {
      if (pressed.b) return ask('Leave the round?', [{ t: 'Keep playing' }, { t: 'Leave', f: () => { const r = DG.ret; DG = null; setMode(r || 'walk'); } }]);
      const putt = dgDist() <= 66;
      if (!putt) { if (held.left) D.aim -= 0.02; if (held.right) D.aim += 0.02; if (pressed.up) D.disc = (D.disc + 2) % 3; if (pressed.down) D.disc = (D.disc + 1) % 3; if (pressed.map) D.angle = (D.angle + 1) % 3; }
      if (pressed.a) { D.phase = putt ? 'putt' : 'power'; D.t = 0; D.pw = 0; D.dir = 1; }
      return;
    }
    if (D.phase === 'power') {   // the meter climbs and falls; the first A sets the power
      D.pw += D.dir * 0.022; if (D.pw >= 1.05) { D.pw = 1.05; D.dir = -1; } if (D.pw <= 0 && D.dir < 0) { D.phase = 'aim'; return; }
      if (pressed.a) { D.power = D.pw; D.phase = 'acc'; D.t = 0; D.ac = -1; } return;
    }
    if (D.phase === 'acc') {     // the needle sweeps; the second A near the middle throws it straight
      D.ac += 0.045 + (D.power > 1 ? 0.02 : 0); if (D.ac > 1.2 || pressed.a) { const err = Math.max(-1.2, Math.min(1.2, D.ac)); D.err = err;
        D.flight = dgFly(D.power, err); D.fi = 0; D.phase = 'fly'; D.strokes++; if (typeof SND !== 'undefined') SND.play('hit'); } return;
    }
    if (D.phase === 'putt') {
      D.ac = Math.sin(D.t / 9); if (pressed.a) { const d = dgDist(), ok = Math.random() < dgPuttChance(d, D.ac); D.strokes++;
        if (ok) { D.pos = { x: D.hole.basket.x, y: D.hole.basket.y }; D.phase = 'in'; D.t = 0; if (typeof SND !== 'undefined') SND.play('free'); }
        else { const H = D.hole, a = Math.atan2(H.basket.x - D.pos.x, -(H.basket.y - D.pos.y)) + D.ac * 0.5, over = 4 + Math.random() * 10;
          D.pos = { x: H.basket.x + Math.sin(a) * over, y: H.basket.y - Math.cos(a) * over }; D.msg = d > 33 ? 'Short of the chains.' : 'Off the cage.'; D.phase = 'aim'; D.t = 0; } }
      return;
    }
    if (D.phase === 'fly') {
      D.fi += 1; if (D.fi >= D.flight.length) { const last = D.flight[D.flight.length - 1]; D.pos = { x: last.x, y: last.y };
        D.msg = last.hit ? 'Tree.' : null; const d = dgDist();
        if (d < 3.5 && D.strokes === 1) { D.phase = 'in'; D.ace = 1; D.t = 0; } else if (d < 3.5) { D.phase = 'in'; D.t = 0; } else D.phase = 'aim';
        if (D.phase === 'aim') D.aim = Math.atan2(D.hole.basket.x - D.pos.x, -(D.hole.basket.y - D.pos.y));
        if (D.strokes >= 10 && D.phase === 'aim') { D.msg = 'Picked up at ten.'; D.phase = 'in'; D.t = 0; } }
      return;
    }
    if (D.phase === 'in') {
      if (D.t === 1) { D.card.push(D.strokes); G.dg = G.dg || { best: {}, rounds: 0, aces: 0 }; if (D.ace) G.dg.aces++; }
      if (D.t > 40 && (pressed.a || D.t > 160)) {
        D.h++; if (D.h < D.b) return dgNewHole();
        // the round is over: the score against par, the best kept
        const par = DG_HOLES.slice(D.a, D.b).reduce((s, h) => s + h[1], 0), tot = D.card.reduce((s, v) => s + v, 0), rel = tot - par;
        G.dg.rounds++; if (G.dg.best[D.key] == null || rel < G.dg.best[D.key]) G.dg.best[D.key] = rel; saveGame();
        const r = DG.ret; DG = null; setMode(r || 'walk');
        say([['', 'Round over: ' + tot + ' throws on a par ' + par + ' (' + (rel > 0 ? '+' : '') + rel + ').'], ['', rel <= 0 ? 'The chains rang all afternoon.' : 'The trees won a few. They usually do.']]);
      }
    }
  },
  draw() {
    const D = DG; if (!D) return; const H = D.hole, z = D.cam.z;
    R(0, 0, SW, SH, '#3a6a32');
    // mown fairway along the path, darker rough everywhere else
    ctx.strokeStyle = '#58924a'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(10, (H.open ? 150 : 70) * z);
    ctx.beginPath(); let p = dgS(0, 0); ctx.moveTo(p[0], p[1]); p = dgS(H.mid.x, H.mid.y); ctx.lineTo(p[0], p[1]); p = dgS(H.basket.x, H.basket.y); ctx.lineTo(p[0], p[1]); ctx.stroke();
    for (let k = 0; k < 40; k++) { const h = hash(k, D.h); R(h % SW, (h >> 8) % SH, 2, 1, 'rgba(255,255,255,.06)'); }
    // the circle (33 ft) around the basket
    p = dgS(H.basket.x, H.basket.y); ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(p[0], p[1], 33 * z, 0, 7); ctx.stroke();
    // tee pad
    p = dgS(0, 0); ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.atan2(H.mid.x, -H.mid.y)); R(-3 * z - 3, -10 * z - 4, 6 * z + 6, 14 * z + 6, '#b8b4a8'); ctx.restore();
    // the basket
    p = dgS(H.basket.x, H.basket.y); R(p[0] - 5, p[1] - 3, 10, 6, '#d8d040'); R(p[0] - 1, p[1] - 9, 2, 8, '#9a9aa2'); R(p[0] - 5, p[1] - 11, 10, 3, '#c8c8d0');
    // trees, back to front
    for (const tr of H.trees.slice().sort((a, b) => a.y - b.y)) { const q = dgS(tr.x, tr.y), r = tr.r * z;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(q[0] + r * 0.3, q[1] + r * 0.3, r, r * 0.8, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#1e4a24'; ctx.beginPath(); ctx.arc(q[0], q[1], r, 0, 7); ctx.fill(); ctx.fillStyle = '#2e6a32'; ctx.beginPath(); ctx.arc(q[0] - r * 0.3, q[1] - r * 0.3, r * 0.55, 0, 7); ctx.fill(); }
    // the disc: on the ground, or in flight (with its shadow and a little height)
    const Dd = DG_DISCS[D.disc];
    if (D.phase === 'fly') { const f = D.flight[Math.min(D.fi, D.flight.length - 1)], q = dgS(f.x, f.y), ht = Math.sin(Math.min(1, D.fi / D.flight.length) * Math.PI) * 14;
      for (let k = Math.max(0, D.fi - 12); k < D.fi; k += 3) { const g = dgS(D.flight[k].x, D.flight[k].y); R(g[0] - 1, g[1] - 1, 2, 2, 'rgba(255,255,255,.4)'); }
      R(q[0] - 3, q[1] - 1, 6, 3, 'rgba(0,0,0,.35)'); R(q[0] - 3, q[1] - 3 - ht, 6, 3, Dd.col); }
    else if (D.phase !== 'in') { const q = dgS(D.pos.x, D.pos.y); R(q[0] - 3, q[1] - 2, 6, 3, Dd.col);
      // you, standing behind the disc
      if (typeof kidFrame === 'function' && G.kid) kidFrame(G.kid.g, 'up', 0, q[0] - Math.sin(D.aim) * 10, q[1] + Math.cos(D.aim) * 10 + 4, 0.7);
      if (D.phase === 'aim' && dgDist() > 66) { ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(q[0] + Math.sin(D.aim) * 60, q[1] - Math.cos(D.aim) * 60); ctx.stroke(); ctx.setLineDash([]); } }
    // the HUD: the hole, the throw, the wind
    win(4, 4, SW - 8, 30);
    txt('HOLE ' + (D.h + 1) + '  ' + H.L + ' FT  PAR ' + H.par, 12, 9, '#ffd860', 'left', SMALL);
    txt('THROW ' + (D.strokes + (D.phase === 'in' ? 0 : 1)) + '   ' + Math.round(dgDist()) + ' FT TO THE BASKET', 12, 20, '#fff', 'left', SMALL);
    const wa = H.wind.a; txt('WIND ' + H.wind.mph + ' MPH', SW - 70, 9, '#c8e8ff', 'left', SMALL);
    ctx.strokeStyle = '#c8e8ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(SW - 22, 24); ctx.lineTo(SW - 22 + Math.cos(wa) * 9, 24 + Math.sin(wa) * 9); ctx.stroke();
    win(4, SH - 42, SW - 8, 38);
    if (D.phase === 'card') { txt('HOLE ' + (D.h + 1) + ' · ' + H.L + ' FT · PAR ' + H.par + (D.h === 6 ? ' · THE LONGEST ON THE COURSE' : D.h === 13 ? ' · THE SHORTEST' : ''), SW / 2, SH - 33, '#ffd860', 'center', SMALL);
      txt('(Real distance and par. The shape of the hole is a stand-in.)  A: TO THE TEE', SW / 2, SH - 20, '#c8c8e0', 'center', SMALL); }
    else if (D.phase === 'aim') { const putt = dgDist() <= 66;
      txt(putt ? 'PUTT: A, then A again in the middle' : DG_DISCS[D.disc].name + ' · ' + DG_ANGLES[D.angle] + '   ←→ AIM  ↑↓ DISC  M: ANGLE  A: THROW', 12, SH - 35, '#fff', 'left', SMALL);
      txt(D.msg || (putt ? 'Inside 33 ft is the circle: most putts drop.' : 'A sets the power, the next A the accuracy.'), 12, SH - 22, '#c8c8e0', 'left', SMALL); }
    else if (D.phase === 'power' || D.phase === 'acc') {
      R(20, SH - 30, 240, 10, '#101028'); R(21, SH - 29, Math.round(238 * Math.min(1, D.phase === 'power' ? D.pw : D.power) / 1.05), 8, D.power > 1 ? '#ff8a5a' : '#7ae87a');
      R(20 + 238 / 1.05, SH - 32, 1, 14, '#fff'); txt('POWER', 270, SH - 30, '#fff', 'left', SMALL);
      if (D.phase === 'acc') { const cx = 330, nx = cx + D.ac * 30; R(cx - 32, SH - 30, 64, 10, '#101028'); R(cx - 3, SH - 30, 6, 10, 'rgba(255,224,128,.5)'); R(nx - 1, SH - 33, 2, 16, '#ff6060'); }
    }
    else if (D.phase === 'putt') { const cx = SW / 2, nx = cx + D.ac * 60; R(cx - 64, SH - 30, 128, 10, '#101028'); R(cx - 6, SH - 30, 12, 10, 'rgba(255,224,128,.5)'); R(nx - 1, SH - 33, 2, 16, '#ff6060'); txt(Math.round(dgDist()) + ' FT', cx, SH - 40 + 26 - 20, '#fff', 'center', SMALL); }
    else if (D.phase === 'fly') txt('...', SW / 2, SH - 28, '#fff', 'center');
    else if (D.phase === 'in') { const s = D.strokes - H.par, nm = D.ace ? 'ACE!' : s <= -2 ? 'EAGLE' : s === -1 ? 'BIRDIE' : s === 0 ? 'PAR' : s === 1 ? 'BOGEY' : s === 2 ? 'DOUBLE BOGEY' : '+' + s;
      txt('CHAINS. ' + nm + '  (' + D.strokes + ')', SW / 2, SH - 34, '#ffd860', 'center');
      const tot = D.card.reduce((a, v) => a + v, 0), par = DG_HOLES.slice(D.a, D.a + D.card.length).reduce((a, h) => a + h[1], 0); txt('ROUND: ' + tot + ' (' + (tot - par > 0 ? '+' : '') + (tot - par) + ')   A: NEXT', SW / 2, SH - 20, '#fff', 'center', SMALL); }
    if (DLG) dlgDraw();
  },
};
