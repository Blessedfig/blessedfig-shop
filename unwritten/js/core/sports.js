"use strict";
// ---------- Ballfields, courts and playgrounds (Nov 13): OpenStreetMap outlines (js/data/sports.js, scripts/town/sports.py).
// Diamonds face the way the May 2025 aerial shows their infields; courts and fields carry their real markings at real size.
// Playground equipment is drawn generically (OSM marks where each playground is, not what's in it). ----------
const SPT = (typeof SPORTS !== 'undefined' ? SPORTS : []).map(([k, x, y, a, L, W, ex]) => ({ k, x, y, a, L, W, ex }));
const SP_LINE = 'rgba(246,246,240,.92)';
function spRect(col, x, y, w, h) { ctx.fillStyle = col; ctx.fillRect(Math.round(x * PM), Math.round(y * PM), Math.max(1, Math.round(w * PM)), Math.max(1, Math.round(h * PM))); }
function spBox(x, y, w, h, col) { ctx.strokeStyle = col || SP_LINE; ctx.lineWidth = 1; ctx.strokeRect(Math.round(x * PM) + 0.5, Math.round(y * PM) + 0.5, Math.round(w * PM), Math.round(h * PM)); }
function spLine(x1, y1, x2, y2, col, wd) { ctx.strokeStyle = col || SP_LINE; ctx.lineWidth = wd || 1; ctx.beginPath(); ctx.moveTo(Math.round(x1 * PM) + 0.5, Math.round(y1 * PM) + 0.5); ctx.lineTo(Math.round(x2 * PM) + 0.5, Math.round(y2 * PM) + 0.5); ctx.stroke(); }
function spArc(x, y, r, a0, a1, col, fill) { ctx.beginPath(); ctx.arc(x * PM, y * PM, r * PM, a0, a1); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (col) { ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.stroke(); } }
// mowing stripes across a field, in bands about 5 m wide, lined up with the field (was 4 m stair-step tiles, Nov 18)
function mowStripes(L, W) { const n = Math.ceil(L / 5); for (let i = 0; i < n; i++) spRect(i % 2 ? 'rgba(255,255,230,.07)' : 'rgba(20,60,20,.06)', -L / 2 + i * L / n, -W / 2, L / n + 0.05, W); }
const SPDRAW = {
  tennis(s) {   // OSM draws each court's lines: 23.77 x 10.97 m; a green hard court with its apron
    const L = s.L, W = s.W, sw = W * 8.23 / 10.97;
    spRect('#356a4c', -L / 2 - 5.5, -W / 2 - 3.2, L + 11, W + 6.4); spRect('#3f7e5a', -L / 2, -W / 2, L, W);
    spBox(-L / 2, -W / 2, L, W); spLine(-L / 2, -sw / 2, L / 2, -sw / 2); spLine(-L / 2, sw / 2, L / 2, sw / 2);
    spLine(-6.4, -sw / 2, -6.4, sw / 2); spLine(6.4, -sw / 2, 6.4, sw / 2); spLine(-6.4, 0, 6.4, 0);
    spLine(0, -W / 2 - 0.9, 0, W / 2 + 0.9, '#1c1c22', 2); spLine(0, -W / 2 - 0.9, 0, W / 2 + 0.9, 'rgba(255,255,255,.75)', 1);   // the net
  },
  basket(s) {   // asphalt, a full court or a half court, keys, arcs and hoops
    const L = s.L, W = s.W, half = L < 20;
    spRect('#5c5c62', -L / 2, -W / 2, L, W); spBox(-L / 2 + 0.3, -W / 2 + 0.3, L - 0.6, W - 0.6);
    const ends = half ? [-1] : [-1, 1];
    if (!half) { spLine(0, -W / 2 + 0.3, 0, W / 2 - 0.3); spArc(0, 0, 1.8, 0, 6.29, SP_LINE); }
    for (const e of ends) {
      const bx = e * (L / 2 - 0.3), kx = bx - e * 5.8;
      spBox(Math.min(bx, kx), -2.45, 5.8, 4.9); spArc(kx, 0, 1.8, 0, 6.29, SP_LINE);
      ctx.beginPath(); ctx.arc((bx - e * 1.6) * PM, 0, Math.min(6.75, W / 2 - 0.9) * PM, e < 0 ? -1.35 : Math.PI - 1.35, e < 0 ? 1.35 : Math.PI + 1.35); ctx.strokeStyle = SP_LINE; ctx.stroke();
      spLine(bx - e * 1.2, -0.9, bx - e * 1.2, 0.9, '#f4f4f4', 2); spArc(bx - e * 1.6, 0, 0.3, 0, 6.29, '#e07020');   // backboard and rim
    }
  },
  diamond(s) {   // home plate at the origin, second base along +x; bases 90 ft or 60 ft
    const b = s.L, big = b > 20, d = b / Math.SQRT2, R = big ? b * 1.45 : b * 1.5, q = Math.PI / 4;
    const DIRT = '#b88a58', DIRT2 = '#a87a4a';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R * PM, -q - 0.05, q + 0.05); ctx.closePath(); ctx.fillStyle = DIRT; ctx.fill();   // the skinned infield
    spArc(0, 0, 4, 0, 6.29, null, DIRT);
    if (big) {   // a grass infield inside the base paths
      const g = 1.6; ctx.beginPath(); ctx.moveTo(g * 1.4 * PM, 0); ctx.lineTo(d * PM, -(d - g) * PM); ctx.lineTo((2 * d - g * 1.4) * PM, 0); ctx.lineTo(d * PM, (d - g) * PM); ctx.closePath(); ctx.fillStyle = '#5ea446'; ctx.fill();
      for (const [x, y] of [[d, -d], [2 * d, 0], [d, d]]) spArc(x, y, 2.7, 0, 6.29, null, DIRT);
    }
    const mx = big ? 18.44 : 14.0; spArc(mx, 0, big ? 2.74 : 2.4, 0, 6.29, null, DIRT2); spRect('#f4f4f0', mx - 0.08, -0.3, 0.16, 0.6);   // mound and rubber
    for (const [x, y] of [[d, -d], [2 * d, 0], [d, d]]) spRect('#f8f8f4', x - 0.25, y - 0.25, 0.5, 0.5);   // the bases
    spRect('#f8f8f4', -0.25, -0.25, 0.5, 0.5); spBox(-0.5, -1.6, 1.0, 1.1); spBox(-0.5, 0.5, 1.0, 1.1);     // home and the batter's boxes
    const F = s.W; spLine(0, 0, F * Math.cos(q), -F * Math.sin(q)); spLine(0, 0, F * Math.cos(q), F * Math.sin(q));   // foul lines
  },
  soccer(s) {   // lines inset a metre from the OSM outline; youth fields scaled down
    const L = s.L - 2, W = s.W - 2, k = Math.min(1, W / 64);
    mowStripes(s.L + 4, s.W + 4);
    spBox(-L / 2, -W / 2, L, W); spLine(0, -W / 2, 0, W / 2); spArc(0, 0, 9.15 * k, 0, 6.29, SP_LINE);
    for (const e of [-1, 1]) {
      const x = e * L / 2, pa = 16.5 * k, pw = Math.min(40.3 * k, W - 4), ga = 5.5 * k, gw = 18.3 * k;
      spBox(e < 0 ? x : x - pa, -pw / 2, pa, pw); spBox(e < 0 ? x : x - ga, -gw / 2, ga, gw);
      spRect('#f8f8f4', x - (e < 0 ? 1.2 : 0), -3.66 * k, 1.2, 7.32 * k);   // the goal
      spArc(x - e * 11 * k, 0, 0.3, 0, 6.29, null, SP_LINE);
    }
  },
  football(s) {   // 100 yards between the goal lines, end zones, a line every five yards, goalposts
    const L = Math.min(s.L - 0.8, 109.7), W = Math.min(s.W - 0.6, 48.8), yd = 0.9144, gl = 50 * yd;
    mowStripes(s.L + 4, s.W + 4);
    spRect('rgba(30,70,30,.25)', -L / 2, -W / 2, L / 2 - gl, W); spRect('rgba(30,70,30,.25)', gl, -W / 2, L / 2 - gl, W);
    spBox(-L / 2, -W / 2, L, W);
    for (let k = -10; k <= 10; k++) spLine(k * 5 * yd, -W / 2, k * 5 * yd, W / 2, SP_LINE, k % 2 ? 1 : (k ? 1 : 2));
    for (let k = -49; k <= 49; k++) if (k % 5) { spLine(k * yd, -W / 2 + 0.2, k * yd, -W / 2 + 0.8); spLine(k * yd, -2.8, k * yd, -2.4); spLine(k * yd, 2.4, k * yd, 2.8); spLine(k * yd, W / 2 - 0.8, k * yd, W / 2 - 0.2); }
    for (const e of [-1, 1]) { spLine(e * L / 2, -2.8, e * L / 2, 2.8, '#e8c020', 2); spArc(e * L / 2, 0, 0.35, 0, 6.29, null, '#e8c020'); }
  },
  volley(s) {   // sand courts: 18 x 9 m inside, a net across the middle
    spRect('#d8c48e', -s.L / 2, -s.W / 2, s.L, s.W);
    for (let i = 0; i < 24; i++) { const h = hash(i, Math.round(s.x * 10)); spRect('#c4ae78', ((h % 100) / 100 - 0.5) * s.L, (((h >> 8) % 100) / 100 - 0.5) * s.W, 0.25, 0.12); }
    const L = Math.min(18, s.L - 2), W = Math.min(9, s.W - 1.5); spBox(-L / 2, -W / 2, L, W, 'rgba(40,90,170,.9)');
    spLine(0, -W / 2 - 0.8, 0, W / 2 + 0.8, '#1c1c22', 2); spLine(0, -W / 2 - 0.8, 0, W / 2 + 0.8, 'rgba(255,255,255,.7)', 1);
  },
  skate(s) {   // a concrete pad with quarter pipes at the ends, a funbox and a rail in the middle
    const L = s.L, W = s.W; spRect('#b9b7b0', -L / 2, -W / 2, L, W);
    for (let x = -L / 2 + 3; x < L / 2; x += 3) spLine(x, -W / 2, x, W / 2, 'rgba(90,88,84,.35)');
    for (const e of [-1, 1]) { const x0 = e < 0 ? -L / 2 : L / 2 - 3.5; spRect('#d4d2cc', x0, -W / 2 + 2, 3.5, W - 4); spRect('#8a8884', e < 0 ? x0 : x0 + 3.2, -W / 2 + 2, 0.3, W - 4); spLine(e < 0 ? x0 + 3.5 : x0, -W / 2 + 2, e < 0 ? x0 + 3.5 : x0, W / 2 - 2, '#6a6864', 1); }
    spRect('#cfccc4', -4, -3, 8, 6); spRect('#a4a29c', -2.5, -1.5, 5, 3); spBox(-4, -3, 8, 6, 'rgba(80,78,74,.6)');
    spLine(-6, W / 2 - 3, 6, W / 2 - 3, '#3a3c42', 2);
  },
  pool(s) {   // a concrete deck and the water
    spRect('#d8d4c8', -s.L / 2 - 1.5, -s.W / 2 - 1.5, s.L + 3, s.W + 3); spRect('#3f9ed0', -s.L / 2, -s.W / 2, s.L, s.W);
    spRect('rgba(255,255,255,.35)', -s.L / 2 + 1, -s.W / 2 + 1 + ((frame >> 4) % 3), s.L * 0.4, 0.15); spRect('rgba(255,255,255,.25)', 0, s.W / 4 - ((frame >> 5) % 2), s.L * 0.3, 0.15);
  },
  helipad(s) {   // the hospital's concrete pad, a ring and an H
    spRect('#c4c2bc', -s.L / 2, -s.W / 2, s.L, s.W); spBox(-s.L / 2, -s.W / 2, s.L, s.W, 'rgba(90,90,96,.6)');
    ctx.lineWidth = 2; spArc(0, 0, Math.min(s.L, s.W) * 0.36, 0, 6.29, '#f4f4f0'); ctx.lineWidth = 1;
    spRect('#f4f4f0', -2.2, -2.6, 0.8, 5.2); spRect('#f4f4f0', 1.4, -2.6, 0.8, 5.2); spRect('#f4f4f0', -1.4, -0.4, 2.8, 0.8);
  },
  play(s) {   // wood chips under the equipment
    const r = 8.5; spArc(0, 0, r, 0, 6.29, null, '#9a7048');
    for (let i = 0; i < 40; i++) { const h = hash(i, Math.round(s.x * 7 + s.y)); const a = (h % 628) / 100, rr = Math.sqrt(((h >> 10) % 100) / 100) * (r - 0.6); spRect(i % 2 ? '#b48858' : '#7e5a38', Math.cos(a) * rr, Math.sin(a) * rr, 0.25, 0.25); }
  }
};
function drawSports() {
  const x0 = camX - 40, x1 = camX + SW / T + 40, y0 = camY - 40, y1 = camY + SH / T + 40;
  for (const s of SPT) {
    if (s.k === 'dog' || s.k === 'track' || s.x < x0 || s.x > x1 || s.y < y0 || s.y > y1 || !SPDRAW[s.k]) continue;
    ctx.save(); ctx.translate(Math.round((s.x - camX) * T), Math.round((s.y - camY) * T)); ctx.rotate(s.a); SPDRAW[s.k](s); ctx.restore();
  }
  for (const s of SPT) if (s.k === 'track' && Math.abs(s.x - camX - SW / T / 2) < 70 && Math.abs(s.y - camY - SH / T / 2) < 70) {   // the fairgrounds oval, infield left as grass
    ctx.beginPath();
    for (const r of s.ex) r.forEach(([x, y], i) => { const X = Math.round((x - camX) * T), Y = Math.round((y - camY) * T); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
    ctx.fillStyle = '#a8603c'; ctx.fill('evenodd'); ctx.strokeStyle = '#7e4428'; ctx.lineWidth = 1; ctx.stroke();
  }
  for (const s of SPT) {   // fences: the diamonds' outlines, the dog park
    const P = s.k === 'dog' ? s.ex : s.k === 'diamond' ? s.ex[1] : null; if (!P) continue;
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    if (Math.max(...xs) < camX - 2 || Math.min(...xs) > camX + SW / T + 2 || Math.max(...ys) < camY - 2 || Math.min(...ys) > camY + SH / T + 2) continue;
    ctx.strokeStyle = 'rgba(70,74,80,.85)'; ctx.lineWidth = 1; ctx.beginPath();
    P.forEach(([x, y], i) => { const X = Math.round((x - camX) * T) + 0.5, Y = Math.round((y - camY) * T) + 0.5; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
    ctx.fillStyle = '#4a4e54';
    for (let i = 1; i < P.length; i++) { const [ax, ay] = P[i - 1], [bx, by] = P[i], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 4 / 3);
      for (let j = 0; j < n; j++) { const X = (ax + (bx - ax) * j / n - camX) * T, Y = (ay + (by - ay) * j / n - camY) * T; if (X > -4 && X < SW + 4 && Y > -4 && Y < SH + 4) ctx.fillRect(Math.round(X) - 1, Math.round(Y) - 3, 2, 4); } }
  }
}
// cars parked where the May 8, 2025 aerial shows them (js/data/parked.js), seen from above, in the colour the photo shows
const CARIMG = {};
function carImg(ci) {
  if (CARIMG[ci]) return CARIMG[ci];
  const L = Math.round(4.6 * PM), W = Math.round(1.9 * PM), c = document.createElement('canvas'); c.width = L + 2; c.height = W + 2; const g = c.getContext('2d');
  const col = (typeof CAR_COLS !== 'undefined' && CAR_COLS[ci]) || '#888', R = (cl, x, y, w, h) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
  R('#16161a', 1, 0, L, W + 2); R('#16161a', 0, 1, L + 2, W); R(col, 1, 1, L, W);
  R(shade(col, 0.22), 3, 2, L - 6, 2); R(shade(col, -0.25), 2, W - 1, L - 2, 2);
  R('#20262e', Math.round(L * 0.26), 2, Math.round(L * 0.12), W - 2); R('#20262e', Math.round(L * 0.68), 2, Math.round(L * 0.08), W - 2);   // windshield, rear window
  R(shade(col, 0.1), Math.round(L * 0.38), 3, Math.round(L * 0.3), W - 4);   // the roof
  R('#f4f0d8', L, 2, 1, 2); R('#f4f0d8', L, W - 2, 1, 2); R('#c02020', 1, 2, 1, 2); R('#c02020', 1, W - 2, 1, 2);
  return (CARIMG[ci] = c);
}
function drawParked() {
  if (typeof PARKED === 'undefined') return;
  const x0 = (camX - 2) * 40, x1 = (camX + SW / T + 2) * 40, y0 = (camY - 2) * 40, y1 = (camY + SH / T + 2) * 40;
  for (const [x, y, a, ci] of PARKED) {
    if (x < x0 || x > x1 || y < y0 || y > y1) continue;
    const im = carImg(ci); ctx.save(); ctx.translate(Math.round((x / 40 - camX) * T), Math.round((y / 40 - camY) * T)); ctx.rotate(a / 1000);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-im.width / 2 + 2, -im.height / 2 + 2, im.width, im.height);
    ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
  }
}
{ const _ds = drawStreets; drawStreets = function () { _ds(); drawSports(); drawParked(); }; }

// playground equipment: a play structure with a slide, and a swing set beside it, kept off paths and buildings
const PLAYK = [];
for (const s of SPT) if (s.k === 'play') {
  const h = hash(Math.round(s.x * 10), Math.round(s.y * 10)), side = h % 2 ? 1 : -1;
  const ok = (x, y) => { const t = tAt(Math.floor(x), Math.floor(y)); return t !== TL.BLDG && t !== TL.ROAD && t !== TL.MAJOR && t !== TL.WATER && t !== TL.PARKING; };
  PLAYK.push({ k: 'climber', x: s.x, y: s.y, reach: 2, name: s.ex });
  const sx = ok(s.x + side * 1.8, s.y) ? s.x + side * 1.8 : s.x - side * 1.8;
  PLAYK.push({ k: 'swings', x: sx, y: s.y + 0.6, reach: 2, name: s.ex });
}
// the emergency entrance: a canopy over the drop-off at the hospital's north-east corner, off Langlade Road (2025 aerial;
// Christian's photo shows the red fascia). Drawn as a roof on posts you can walk under.
PLAYK.push({ k: 'ercanopy', box: [1057.8, 920.7, 1060.4, 923.6], x: 1059.1, y: 923.6, reach: 4, hm: 4.6 });
PROPS.push(...PLAYK); PROPS.sort((a, b) => a.y - b.y);
{ const _dp = drawProp;
  drawProp = function (p) {
    if (p.k === 'ercanopy') {
      const [x0, y0, x1, y1] = p.box, X0 = Math.round(x0 * T), X1 = Math.round(x1 * T), Y0 = Math.round(y0 * T), Y1 = Math.round(y1 * T), h = Math.round(p.hm * PM), fh = Math.round(1.3 * PM);
      F('rgba(0,0,0,.2)', X0 + 6, Y0 + 8, X1 - X0, Y1 - Y0);
      for (const x of [X0 + 4, X1 - 7]) for (const y of [Y0 + 4, Y1 - 1]) { F('#1c1618', x - 1, y - h, 5, h); F('#d8d6d0', x, y - h, 3, h); }
      F('#1c1618', X0 - 1, Y0 - h - 1, X1 - X0 + 2, Y1 - Y0 + 2); F('#8a8c90', X0, Y0 - h, X1 - X0, Y1 - Y0 - fh); F('#9ea0a4', X0 + 2, Y0 - h + 2, X1 - X0 - 4, 2);
      F('#c8202a', X0, Y1 - h - fh, X1 - X0, fh); F('#e04040', X0, Y1 - h - fh, X1 - X0, 1);
      ctx.font = SMALL; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText('EMERGENCY', (X0 + X1) / 2, Y1 - h - fh / 2 + 1);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      return;
    }
    if (p.k !== 'climber' && p.k !== 'swings') return _dp(p);
    const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM), o = '#26262c';
    F('rgba(0,0,0,.22)', x - m(2.4), y - 2, m(4.8), 5);
    if (p.k === 'swings') {   // an A-frame swing set, two swings
      ctx.strokeStyle = o; ctx.lineWidth = 3; ctx.beginPath();
      for (const e of [-1, 1]) { ctx.moveTo(x + e * m(3) - m(0.6), y); ctx.lineTo(x + e * m(3), y - m(2.6)); ctx.lineTo(x + e * m(3) + m(0.6), y); } ctx.stroke();
      ctx.strokeStyle = '#3a6ab0'; ctx.lineWidth = 1; ctx.stroke();
      F(o, x - m(3) - 1, y - m(2.6) - 2, m(6) + 2, 3); F('#4a7ac0', x - m(3), y - m(2.6) - 1, m(6), 1);
      const sw = Math.sin(frame / 22 + p.x) * 2;
      for (const e of [-1, 1]) { const cx = x + e * m(1.2); F('#8a8e94', cx - 3, y - m(2.6), 1, m(1.9)); F('#8a8e94', cx + 2, y - m(2.6), 1, m(1.9)); F(o, cx - 4 + sw, y - m(0.7) - 1, 8, 3); F('#202024', cx - 3 + sw, y - m(0.7), 6, 1); }
      return;
    }
    // the play structure: a deck on posts under a roof, a slide down one side, a ladder up the other
    const dw = m(2.4), dh = m(1.5), top = y - m(3.4);
    for (const e of [-1, 1]) F(o, x + e * (dw / 2) - 2, top + 4, 3, y - top - 4);
    F(o, x - dw / 2 - 1, y - dh - 3, dw + 2, 4); F('#c8a050', x - dw / 2, y - dh - 2, dw, 2);   // the deck
    F(o, x - dw / 2 - 3, top - 1, dw + 6, 6); F('#c84a3a', x - dw / 2 - 2, top, dw + 4, 4); F('#e06a50', x - dw / 2 - 2, top, dw + 4, 1);   // the roof
    ctx.fillStyle = o; ctx.beginPath(); ctx.moveTo(x + dw / 2, y - dh - 3); ctx.lineTo(x + dw / 2 + m(2.2), y - 2); ctx.lineTo(x + dw / 2 + m(2.2) - 2, y + 1); ctx.lineTo(x + dw / 2 - 2, y - dh); ctx.fill();
    ctx.fillStyle = '#e8c030'; ctx.beginPath(); ctx.moveTo(x + dw / 2, y - dh - 1); ctx.lineTo(x + dw / 2 + m(2.2) - 1, y - 2); ctx.lineTo(x + dw / 2 + m(2.2) - 2, y); ctx.lineTo(x + dw / 2 - 1, y - dh + 1); ctx.fill();   // the slide
    for (let k = 0; k < 3; k++) F('#6a6e74', x - dw / 2 - 5, y - 3 - k * 4, 4, 1);   // ladder rungs
    F('#6a6e74', x - dw / 2 - 6, y - dh - 2, 1, dh + 2); F('#6a6e74', x - dw / 2 - 1, y - dh - 2, 1, dh + 2);
  };
}
const SPORT_SAY = { tennis: 'Tennis courts.', basket: 'A basketball court.', soccer: 'A soccer field.', football: 'A football field.',
  volley: 'Sand volleyball.', skate: 'A skate park.', pool: 'A pool.', play: 'A playground.' };
function sportAt(cx, cy) {   // the court or field under a spot, in its own rotated frame
  for (const s of SPT) {
    if (s.k === 'track') { let inn = false; for (const r of s.ex) for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const [xi, yi] = r[i], [xj, yj] = r[j]; if ((yi > cy) !== (yj > cy) && cx < (xj - xi) * (cy - yi) / (yj - yi) + xi) inn = !inn; } if (inn) return s; continue; }
    if (s.k === 'dog' || Math.abs(s.x - cx) > 40 || Math.abs(s.y - cy) > 40) continue;
    const dx = (cx - s.x) * 4, dy = (cy - s.y) * 4, u = dx * Math.cos(s.a) + dy * Math.sin(s.a), v = -dx * Math.sin(s.a) + dy * Math.cos(s.a);
    if (s.k === 'diamond') { if (u > -6 && Math.hypot(u, v) < s.W && Math.abs(Math.atan2(v, u)) < Math.PI / 4 + 0.15) return s; continue; }
    if (s.k === 'play') { if (Math.hypot(dx, dy) < 9) return s; continue; }
    if (Math.abs(u) <= s.L / 2 + 1 && Math.abs(v) <= s.W / 2 + 1) return s;
  }
  return null;
}
{ const _look = lookAt;
  lookAt = function (x, y) {
    _look(x, y); if (DLG || mode !== 'walk') return;
    const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD;
    const er = PLAYK.find(p => p.k === 'ercanopy'); if (er && cx > er.box[0] - 0.5 && cx < er.box[2] + 0.5 && cy > er.box[1] - 0.5 && cy < er.box[3] + 1)
      return say([['', 'The emergency entrance. OpenStreetMap lists the hospital\'s emergency room as open around the clock.']]);
    const s = sportAt(cx, cy); if (!s) return;
    if (s.k === 'track') return say([['', 'The dirt oval at the fairgrounds. OpenStreetMap doesn\'t have it; it\'s traced from the 2025 aerial photo.']]);
    if (s.k === 'helipad') return say([['', 'The hospital\'s helipad, for medical flights.']]);
    const nm = typeof s.ex === 'string' ? s.ex : s.ex && s.ex[0];
    if (s.k === 'diamond') return say([['', (nm ? nm + ': a' : 'A') + ' ball diamond, ' + (s.L > 20 ? '90' : '60') + '-foot bases.'], ['', 'Its outline is from OpenStreetMap; it faces the way the 2025 aerial photo shows.']]);
    const t = SPORT_SAY[s.k]; if (!t) return;
    say([['', (nm ? nm.replace(/\t/g, ' ') + '. ' : '') + t]]);
  };
}
