"use strict";
// ---------- Background life (Nov 13): cars driving the real streets (OpenStreetMap ways, keeping to the right, one-way
// streets one way, stopping for you and for each other), birds on the lawns that fly off when you come close, geese
// passing over, and mallards on the lakes. No people: the townsfolk sheets are on hold. ----------
const LIFE = { cars: [], birds: [], flock: null, ducks: [], last: -1, next: 0, ids: 0 };
const ROADS = [], RVERT = [], RIDX = new Map();
(function buildRoads() {
  for (const v of TOWN.V) {
    if (v[0] !== 'road' && v[0] !== 'major') continue;
    const Q = v[2], P = []; for (let i = 0; i < Q.length; i += 2) P.push([Q[i], Q[i + 1]]);
    if (P.length < 2) continue;
    const r = { P, w: v[1] || 8, major: v[0] === 'major', lanes: v[4] || 0, oneway: !!v[5], id: ROADS.length }; ROADS.push(r);
    P.forEach(([x, y], i) => { RVERT.push([r.id, i]); const k = Math.round(x / 3) + ',' + Math.round(y / 3); if (!RIDX.has(k)) RIDX.set(k, []); RIDX.get(k).push([r.id, i]); });
  }
})();
// where roads meet (another way within 4 m of a vertex), and the signalized corners (OpenStreetMap; OSM maps no stop signs in Antigo)
const JUNC = new Set();
for (const r of ROADS) r.P.forEach(([x, y], i) => { const kx = Math.round(x / 3), ky = Math.round(y / 3);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const [ri, j] of RIDX.get((kx + dx) + ',' + (ky + dy)) || []) if (ri !== r.id && Math.hypot(ROADS[ri].P[j][0] - x, ROADS[ri].P[j][1] - y) < 4) JUNC.add(r.id + ':' + i); });
const SIGX = [];
for (const [x, y, ha, hb, side] of (typeof FURN !== 'undefined' && FURN.SG) || []) {
  const k = SIGX.find(q => Math.hypot(q.sx / q.n - x, q.sy / q.n - y) < 8);
  if (k) { k.sx += x; k.sy += y; k.n++; } else SIGX.push({ sx: x, sy: y, n: 1, ha, hb });
}
for (const q of SIGX) { q.x = q.sx / q.n * 4 + 2; q.y = q.sy / q.n * 4 + 2;   // metres
  // the stop line (Nov 21 sweep): wait clear of the cross street, half its width plus a car's half length and a metre
  // back from the middle (it was 9 m flat, which left cars off a two-lane street standing in Superior's lanes)
  q.wa = 8; q.wb = 8;
  for (const r of ROADS) for (let i = 1; i < r.P.length; i++) { const [ax, ay] = r.P[i - 1], [bx, by] = r.P[i], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((q.x - ax) * dx + (q.y - ay) * dy) / L2)); if (Math.hypot(ax + dx * t - q.x, ay + dy * t - q.y) > 8) continue;
    const h = Math.atan2(dy, dx); if (Math.abs(Math.cos(h - q.ha)) >= Math.abs(Math.cos(h - q.hb))) q.wa = Math.max(q.wa, r.w); else q.wb = Math.max(q.wb, r.w); }
}
function sigLit(side) { const ph2 = ((frame >> 6) + (side > 0 ? 0 : 8)) % 16; return ph2 < 7 ? 2 : ph2 < 9 ? 1 : 0; }   // the same cycle the signal heads show
function lifeDt() { const d = LIFE.last < 0 ? 1 : Math.min(4, frame - LIFE.last); LIFE.last = frame; return d / 60; }
function playerM() { return [(G.x + 0.5) * 4, (G.y + 0.5) * 4]; }
function inView(x, y, pad) { const sx = (x / 4 - camX) * T, sy = (y / 4 - camY) * T; return sx > -pad && sx < SW + pad && sy > -pad && sy < SH + pad; }
// ---- cars ----
function carPlace(c) {   // position and heading from the way, the vertex and the distance along the leg
  const P = ROADS[c.r].P, a = P[c.i], b = P[c.i + c.dir], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ux = (b[0] - a[0]) / L, uy = (b[1] - a[1]) / L;
  c.h = Math.atan2(uy, ux); c.len = L;
  c.x = a[0] + ux * c.s - uy * c.off; c.y = a[1] + uy * c.s + ux * c.off;   // right of travel (y points south)
}
function carSpawn() {
  const [px, py] = playerM();
  for (let t = 0; t < 40; t++) {
    const [ri, i] = RVERT[(Math.random() * RVERT.length) | 0], r = ROADS[ri], [x, y] = r.P[i], d = Math.hypot(x - px, y - py);
    if (d < 40 || d > 130 || inView(x, y, 40)) continue;
    let dir = r.oneway ? 1 : (Math.random() < 0.5 ? 1 : -1); if (!r.P[i + dir]) { if (r.oneway) continue; dir = -dir; }
    const lanes = r.lanes || 2, lw = Math.min(3.6, r.w / Math.max(2, lanes));
    const off = r.oneway ? (((Math.random() * Math.max(1, lanes)) | 0) - (Math.max(1, lanes) - 1) / 2) * lw : lw * (lanes >= 4 ? 1.5 : 0.5);
    const c = { r: ri, i, dir, s: 0, off, v: r.major ? 11 : 8, vmax: r.major ? 11 : 8, ci: [0, 1, 2, 3, 4, 5, 0, 2, 1, 6, 7][(Math.random() * 11) | 0] };
    carPlace(c); if (LIFE.cars.some(o => Math.hypot(o.x - c.x, o.y - c.y) < 12)) continue;   // never spawned on top of another
    c.id = ++LIFE.ids; c.stuck = 0; return c;
  }
  return null;
}
function carNextLeg(c) {   // at the end of a leg: on along the way, or onto another way that meets it here
  const r = ROADS[c.r], ni = c.i + c.dir, on = !!r.P[ni + c.dir];
  if (on && (!JUNC.has(c.r + ':' + ni) || Math.random() > 0.3)) { c.i = ni; c.s = 0; return true; }   // straight on, or a turn now and then
  const [x, y] = r.P[ni], k0x = Math.round(x / 3), k0y = Math.round(y / 3), opts = [], hx = Math.cos(c.h), hy = Math.sin(c.h);
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const [ri, i] of RIDX.get((k0x + dx) + ',' + (k0y + dy)) || []) {
    if (ri === c.r) continue; const q = ROADS[ri], [qx, qy] = q.P[i]; if (Math.hypot(qx - x, qy - y) > 4) continue;
    for (const d of [1, -1]) { if (q.oneway && d < 0) continue; const nx = q.P[i + d]; if (!nx) continue;
      const L = Math.hypot(nx[0] - qx, nx[1] - qy) || 1; if (((nx[0] - qx) * hx + (nx[1] - qy) * hy) / L < -0.7) continue;   // no U-turns
      opts.push([ri, i, d]); }
  }
  if (!opts.length) { if (on) { c.i = ni; c.s = 0; return true; } return false; }
  const [ri, i, d] = opts[(Math.random() * opts.length) | 0], q = ROADS[ri], lanes = q.lanes || 2, lw = Math.min(3.6, q.w / Math.max(2, lanes));
  c.r = ri; c.i = i; c.dir = d; c.s = 0; c.vmax = q.major ? 11 : 8; c.off = q.oneway ? 0 : lw * (lanes >= 4 ? 1.5 : 0.5); return true;
}
function lifeCars(dt) {
  const [px, py] = playerM();
  LIFE.cars = LIFE.cars.filter(c => Math.hypot(c.x - px, c.y - py) < 170);
  while (LIFE.cars.length < 12) { const c = carSpawn(); if (!c) break; LIFE.cars.push(c); }
  for (const c of LIFE.cars) {
    const ux = Math.cos(c.h), uy = Math.sin(c.h);
    let block = false;
    const ahead = (x, y, far, side) => { const dx = x - c.x, dy = y - c.y, f = dx * ux + dy * uy, l = Math.abs(-dx * uy + dy * ux); return f > 0 && f < far && l < side; };
    if (ahead(px, py, 9, 2.6)) block = true;
    for (const q of SIGX) {   // red light (or a yellow it can stop for): wait at the line, about 9 m short of the middle
      const dx = q.x - c.x, dy = q.y - c.y, f = dx * ux + dy * uy, l = Math.abs(-dx * uy + dy * ux);
      if (f > 46 || l > 16) continue;
      const grp = Math.abs(Math.cos(c.h - q.ha)) >= Math.abs(Math.cos(c.h - q.hb)) ? 1 : -1, lit = sigLit(grp), stop = (grp > 0 ? q.wb : q.wa) / 2 + 3.3;
      if (f < stop - 1.5) continue;   // already in the crossing: clear it
      if ((lit === 0 || (lit === 1 && f > stop + 5)) && f - stop < c.v * c.v / 24 + 1.5) block = true;
    }
    const nxt = ROADS[c.r].P[c.i + c.dir], slow = nxt && JUNC.has(c.r + ':' + (c.i + c.dir)) && c.len - c.s < 12;   // ease through crossings
    // other cars (Nov 21 sweep): queue behind the car ahead in the lane, and give way to a car crossing the path ahead
    // (where it is now or will be in a second); when two cars wait on each other the older one goes, so no two ever
    // lock up nose to door in a crossing and pile a queue up behind them
    const sees = (a, b) => { const ax = Math.cos(a.h), ay = Math.sin(a.h), co = Math.cos(b.h - a.h);
      for (const t of co > 0.8 ? [0] : [0, 0.5, 1]) { const dx = b.x + Math.cos(b.h) * b.v * t - a.x, dy = b.y + Math.sin(b.h) * b.v * t - a.y, f = dx * ax + dy * ay, l = Math.abs(-dx * ay + dy * ax);
        if (co > 0.8 ? (f > 0 && f < 6.2 + a.v * a.v / 18 && l < 2.1) : co > -0.8 && f > 0 && f < 10 && l < 3.6) return true; }
      return false; };
    for (const o of LIFE.cars) { if (o === c || Math.abs(o.x - c.x) > 16 || Math.abs(o.y - c.y) > 16 || !sees(c, o)) continue;
      if (Math.cos(o.h - c.h) <= 0.8 && sees(o, c) && c.id < o.id) continue;
      block = true; break; }
    c.stuck = block && c.v < 0.3 ? (c.stuck || 0) + dt : 0;
    if (c.stuck > 20 && !inView(c.x, c.y, 60)) { c.dead = true; continue; }
    c.v = block ? Math.max(0, c.v - 14 * dt) : Math.min(slow ? Math.min(c.vmax, 5.5) : c.vmax, c.v + 3 * dt);
    if (!block && slow && c.v > 5.5) c.v = Math.max(5.5, c.v - 6 * dt);
    c.s += c.v * dt;
    while (c.s > c.len) { const over = c.s - c.len; if (!carNextLeg(c)) { c.dead = true; break; } c.s = over; carPlace(c); }
    if (!c.dead) carPlace(c);
  }
  LIFE.cars = LIFE.cars.filter(c => !c.dead);
}
// ---- birds ----
const BIRD_KINDS = [   // drawn larger than life so you can see them
  { k: 'robin', body: '#5a4a3e', belly: '#d8742c', n: [2, 4], size: 1 },
  { k: 'sparrow', body: '#7a6248', belly: '#c8b89a', n: [4, 8], size: 0.9 },
  { k: 'crow', body: '#16161c', belly: '#26262e', n: [2, 5], size: 1.3 },
  { k: 'goose', body: '#6a5a4a', belly: '#d8d0c0', n: [4, 9], size: 1.9 }];
const GRASSY = new Set([TL.GRASS, TL.LAWN, TL.YARD, TL.PITCH]);
function birdSpawn() {
  const [px, py] = playerM();
  for (let t = 0; t < 30; t++) {
    const a = Math.random() * 6.283, d = 14 + Math.random() * 34, x = px + Math.cos(a) * d, y = py + Math.sin(a) * d;
    if (!GRASSY.has(tAt(Math.floor(x / 4), Math.floor(y / 4)))) continue;
    const near = (dx, dy) => tAt(Math.floor((x + dx) / 4), Math.floor((y + dy) / 4));
    const wet = [-12, 0, 12].some(dx => [-12, 0, 12].some(dy => near(dx, dy) === TL.WATER));
    const ok = k => !(k === 'robin' && (SKY.phase === 'snow' || SKY.phase === 'bare')) && !(k === 'goose' && SKY.frozen);   // robins leave for the winter; geese need open water
    const land = BIRD_KINDS.slice(0, 3).filter(k => ok(k.k)), K = wet && ok('goose') ? BIRD_KINDS[3] : land[(Math.random() * land.length) | 0];
    const n = K.n[0] + ((Math.random() * (K.n[1] - K.n[0] + 1)) | 0);
    const out = [];
    for (let j = 0; j < n; j++) { const bx = x + (Math.random() - 0.5) * 6, by = y + (Math.random() - 0.5) * 4;
      if (!GRASSY.has(tAt(Math.floor(bx / 4), Math.floor(by / 4)))) continue;
      out.push({ K, x: bx, y: by, z: 0, vx: 0, vy: 0, face: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 3, fly: false }); }
    return out;
  }
  return [];
}
function lifeBirds(dt) {
  const [px, py] = playerM();
  LIFE.birds = LIFE.birds.filter(b => !b.gone && Math.hypot(b.x - px, b.y - py) < 90);
  if (SKY.d < 0.6 && LIFE.birds.filter(b => !b.fly).length < 14 && Math.random() < dt * 0.6) LIFE.birds.push(...birdSpawn());   // birds roost at night
  for (const b of LIFE.birds) {
    if (!b.fly) {
      const d = Math.hypot(b.x - px, b.y - py);
      if (d < (b.K.k === 'goose' ? 6 : 4.5)) {   // too close: up they go, away from you
        b.fly = true; const a = Math.atan2(b.y - py, b.x - px) + (Math.random() - 0.5) * 0.8, sp = 7 + Math.random() * 4;
        b.vx = Math.cos(a) * sp; b.vy = Math.sin(a) * sp; b.face = b.vx < 0 ? -1 : 1;
        for (const o of LIFE.birds) if (!o.fly && o.K === b.K && Math.hypot(o.x - b.x, o.y - b.y) < 8) { o.fly = true; o.vx = b.vx * (0.8 + Math.random() * 0.4); o.vy = b.vy * (0.8 + Math.random() * 0.4); o.face = b.face; }
        continue;
      }
      b.t -= dt;
      if (b.t < 0) { b.t = 0.6 + Math.random() * 2.4; if (Math.random() < 0.5) { const nx = b.x + (Math.random() - 0.5) * 1.2, ny = b.y + (Math.random() - 0.5) * 0.8; if (GRASSY.has(tAt(Math.floor(nx / 4), Math.floor(ny / 4)))) { b.face = nx < b.x ? -1 : 1; b.x = nx; b.y = ny; } } }
    } else {
      b.x += b.vx * dt; b.y += b.vy * dt; b.z += (4 + b.z * 0.4) * dt;
      if (b.z > 40 || !inView(b.x, b.y - b.z, 60)) b.gone = true;
    }
  }
}
function drawBird(b, sx, sy) {
  const s = b.K.size, flap = b.fly ? ((frame >> 2) + Math.round(b.x)) % 2 : 0, w = Math.round(5 * s), h = Math.max(2, Math.round(3 * s));
  if (b.fly) {
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.fillRect(Math.round(sx) - 2, Math.round(sy + b.z * PM * 0.5) + 2, w, 2);   // its shadow, falling behind as it climbs
    const y = Math.round(sy - b.z * PM * 0.5); ctx.fillStyle = b.K.body;
    ctx.fillRect(Math.round(sx) - 1, y, w - 2, h - 1);
    if (flap) { ctx.fillRect(Math.round(sx) - w + 2, y - 2, w - 1, 1); ctx.fillRect(Math.round(sx) + 1, y - 2, w - 1, 1); }
    else { ctx.fillRect(Math.round(sx) - w + 2, y + 1, w - 1, 1); ctx.fillRect(Math.round(sx) + 1, y + 1, w - 1, 1); }
    return;
  }
  const x = Math.round(sx), y = Math.round(sy), peck = !b.fly && ((frame >> 4) + Math.round(b.x * 3)) % 7 === 0;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(x - 2, y + 1, w, 1);
  ctx.fillStyle = '#101014'; ctx.fillRect(x - 3, y - h - 1, w + 2, h + 1);
  ctx.fillStyle = b.K.body; ctx.fillRect(x - 2, y - h, w, h - 1); ctx.fillStyle = b.K.belly; ctx.fillRect(x - 2, y - 2, w, 1);
  const hx = b.face > 0 ? x + w - 2 : x - 3, hy = peck ? y - 2 : y - h - 1;
  ctx.fillStyle = '#101014'; ctx.fillRect(hx - 1, hy - 1, 3, 3); ctx.fillStyle = b.K.k === 'goose' ? '#1a1a1e' : b.K.body; ctx.fillRect(hx, hy, 2, 2);
  if (b.K.k === 'goose') { ctx.fillStyle = '#f0f0ea'; ctx.fillRect(hx, hy + 1, 1, 1); }
  ctx.fillStyle = b.K.k === 'goose' ? '#202024' : '#e0a030'; ctx.fillRect(b.face > 0 ? hx + 2 : hx - 1, hy + 1, 1, 1);
}
// ---- geese passing over in a V, now and then ----
function lifeFlock(dt) {
  if (!LIFE.flock) {
    LIFE.next -= dt; if (LIFE.next > 0) return;
    LIFE.next = (SKY.frozen ? 160 : 40) + Math.random() * 70;
    if (SKY.d > 0.6) return;
    const [px, py] = playerM(), dir = Math.random() < 0.5 ? 1 : -1, n = 7 + ((Math.random() * 9) | 0);
    LIFE.flock = { x: px - dir * 40, y: py + 10 + Math.random() * 10, vx: dir * 9, vy: -3 - Math.random() * 3, n, dir, z: 30 };
    return;
  }
  const f = LIFE.flock; f.x += f.vx * dt; f.y += f.vy * dt;
  const [px, py] = playerM(); if (Math.hypot(f.x - px, f.y - py) > 90) LIFE.flock = null;
}
function drawFlock() {
  const f = LIFE.flock; if (!f) return;
  for (let i = 0; i < f.n; i++) {
    const side = i % 2 ? 1 : -1, k = (i + 1) >> 1, x = f.x - f.dir * k * 2.2, y = f.y + side * k * 1.6;
    const sx = (x / 4 - camX) * T, sy = (y / 4 - camY) * T - f.z * PM * 0.5, flap = ((frame >> 3) + i) % 2;
    ctx.fillStyle = 'rgba(0,0,0,.14)'; ctx.fillRect(Math.round(sx) + 10, Math.round(sy + f.z * PM * 0.5) + 6, 7, 2);
    ctx.fillStyle = '#2a2622'; ctx.fillRect(Math.round(sx), Math.round(sy), 6, 2); ctx.fillRect(Math.round(sx) + (f.dir > 0 ? 6 : -2), Math.round(sy) - 1, 2, 2);
    ctx.fillRect(Math.round(sx) - 3, Math.round(sy) + (flap ? -2 : 2), 5, 1); ctx.fillRect(Math.round(sx) + 3, Math.round(sy) + (flap ? -2 : 2), 5, 1);
  }
}
// ---- mallards on the lakes ----
function lifeDucks(dt) {
  const [px, py] = playerM();
  LIFE.ducks = LIFE.ducks.filter(d => Math.hypot(d.x - px, d.y - py) < 100);
  if (!SKY.frozen && LIFE.ducks.length < 6 && Math.random() < dt) {
    for (let t = 0; t < 20; t++) {
      const x = px + (Math.random() - 0.5) * 120, y = py + (Math.random() - 0.5) * 90, cx = Math.floor(x / 4), cy = Math.floor(y / 4);
      if (tAt(cx, cy) !== TL.WATER || [[-2, 0], [2, 0], [0, -2], [0, 2]].some(([a, b]) => tAt(cx + a, cy + b) !== TL.WATER)) continue;
      const n = 1 + ((Math.random() * 3) | 0);
      for (let j = 0; j < n; j++) LIFE.ducks.push({ x: x + j * 1.4, y: y + j * 0.6, h: Math.random() * 6.283, t: 0, male: j % 2 === 0 });
      break;
    }
  }
  for (const d of LIFE.ducks) {
    d.t -= dt; if (d.t < 0) { d.t = 2 + Math.random() * 4; d.h += (Math.random() - 0.5) * 1.6; }
    const nx = d.x + Math.cos(d.h) * 0.5 * dt, ny = d.y + Math.sin(d.h) * 0.5 * dt, cx = Math.floor(nx / 4), cy = Math.floor(ny / 4);
    if (tAt(cx, cy) === TL.WATER && tAt(cx + Math.sign(Math.cos(d.h)), cy) === TL.WATER && tAt(cx, cy + Math.sign(Math.sin(d.h))) === TL.WATER) { d.x = nx; d.y = ny; } else d.h += Math.PI * 0.7;
  }
}
function drawDuck(d) {
  const sx = Math.round((d.x / 4 - camX) * T), sy = Math.round((d.y / 4 - camY) * T), f = Math.cos(d.h) >= 0 ? 1 : -1;
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(sx - f * 7, sy + 1, 4, 1); ctx.fillRect(sx - f * 10, sy + 2, 3, 1);   // the wake
  ctx.fillStyle = '#101014'; ctx.fillRect(sx - 4, sy - 3, 9, 5);
  ctx.fillStyle = d.male ? '#8a8478' : '#8a6a48'; ctx.fillRect(sx - 3, sy - 2, 7, 3);
  ctx.fillStyle = '#101014'; ctx.fillRect(sx + f * 3 - 1, sy - 6, 4, 4);
  ctx.fillStyle = d.male ? '#1e6a3a' : '#7a5a3a'; ctx.fillRect(sx + f * 3, sy - 5, 2, 2);
  ctx.fillStyle = '#e0a830'; ctx.fillRect(sx + f * 3 + (f > 0 ? 2 : -1), sy - 4, 1, 1);
}
function drawCarsMoving() {
  for (const c of LIFE.cars) {
    if (!inView(c.x, c.y, 40)) continue;
    const im = carImg(c.ci); ctx.save(); ctx.translate(Math.round((c.x / 4 - camX) * T), Math.round((c.y / 4 - camY) * T)); ctx.rotate(c.h);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-im.width / 2 + 2, -im.height / 2 + 2, im.width, im.height);
    ctx.drawImage(im, -im.width / 2, -im.height / 2); ctx.restore();
  }
}
{ const _ds = drawStreets;
  drawStreets = function () {
    _ds();
    if (mode !== 'walk' || typeof G === 'undefined' || !G || (typeof INSIDE !== 'undefined' && INSIDE)) return;
    const dt = lifeDt(); lifeCars(dt); lifeBirds(dt); lifeDucks(dt); lifeFlock(dt);
    drawCarsMoving();
    for (const d of LIFE.ducks) if (inView(d.x, d.y, 20)) drawDuck(d);
    for (const b of LIFE.birds) if (!b.fly && inView(b.x, b.y, 20)) drawBird(b, (b.x / 4 - camX) * T, (b.y / 4 - camY) * T);
  };
}
{ const _dl = drawTownLabels;   // things in the air go over the roofs
  drawTownLabels = function (cx, cy) {
    if (mode === 'walk' && typeof G !== 'undefined' && G) { for (const b of LIFE.birds) if (b.fly && inView(b.x, b.y - b.z, 40)) drawBird(b, (b.x / 4 - camX) * T, (b.y / 4 - camY) * T); drawFlock(); }
    _dl(cx, cy);
  };
}
