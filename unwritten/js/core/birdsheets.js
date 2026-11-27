"use strict";
// =====================================================================
//  BIRDS AND ANIMALS FROM SHEETS (Nov 27). Drawn by ChatGPT in the people sheets' style and pixel size, checked by
//  /home/claude/artpipe/sheet.py (16 frames, outline, palette, each animal within 35% of its target size), then fitted so one
//  art pixel is 4 file px. Side view facing right; left is mirrored. Where a sheet is missing the old shapes still draw.
//  birds1.png rows: robin, sparrow, crow, Canada goose; columns: stand, peck, wings up, wings down.
// =====================================================================
const ANIM_K = 1.33 / 4;   // screen px per file px (the kid's art pixel size)
const ANIM = {};
function animLoad(id, rows) { const im = new Image(); im.onload = () => { ANIM[id] = { im, rows, cw: im.width / 4, ch: im.height / 4 }; }; im.src = 'assets/animals/' + id + '.png'; }
animLoad('birds1', ['robin', 'sparrow', 'crow', 'goose']);
function animRow(kind) { for (const id in ANIM) { const r = ANIM[id].rows.indexOf(kind); if (r >= 0) return [ANIM[id], r]; } return null; }
// draws one frame with the feet at (x, y)
function animDraw(S, row, col, x, y, left, alpha) {
  const w = S.cw * ANIM_K, h = S.ch * ANIM_K;
  ctx.save(); if (alpha != null) ctx.globalAlpha = alpha;
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.translate(Math.round(x), Math.round(y)); if (left) ctx.scale(-1, 1);
  ctx.drawImage(S.im, col * S.cw, row * S.ch, S.cw, S.ch, -w / 2, -h + 2 * ANIM_K, w, h);
  ctx.restore();
}
{ const _db = drawBird; drawBird = function (b, sx, sy) {
  const A = animRow(b.K.k); if (!A) return _db(b, sx, sy);
  const [S, row] = A, left = b.face < 0;
  if (b.fly) {
    const flap = ((frame >> 2) + Math.round(b.x)) % 2, y = sy - b.z * PM * 0.5;
    ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(Math.round(sx) - 4, Math.round(sy + b.z * PM * 0.5) + 1, 8, 2);
    return animDraw(S, row, flap ? 2 : 3, sx, y, left);
  }
  const peck = ((frame >> 4) + Math.round(b.x * 3)) % 7 === 0;
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(sy), b.K.k === 'goose' ? 6 : 3.5, 1.4, 0, 0, 6.29); ctx.fill();
  animDraw(S, row, peck ? 1 : 0, sx, sy, left);
}; }
// ---- animals2.png rows: mallard (float, dip, wings up, turned), dog (stand, step, step, sit), squirrel, deer (stand, step, step, graze) ----
animLoad('animals2', ['mallard', 'dog', 'squirrel', 'deer']);
{ const _dd = drawDuck; drawDuck = function (d) {
  const A = animRow('mallard'); if (!A) return _dd(d);
  const [S, row] = A, sx = Math.round((d.x / 4 - camX) * T), sy = Math.round((d.y / 4 - camY) * T), left = Math.cos(d.h) < 0, f = left ? -1 : 1;
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(sx - f * 9, sy + 1, 4, 1); ctx.fillRect(sx - f * 12, sy + 2, 3, 1);   // the wake
  const ph = ((frame >> 5) + Math.round(d.x * 5)) % 11, col = ph === 0 ? 1 : ph === 5 ? 3 : 0;
  animDraw(S, row, col, sx, sy + 2, left);
}; }
// the dog walkers' dogs
function animDogWrap() { if (typeof SPR === 'undefined' || SPR._dogWrapped) return; SPR._dogWrapped = 1; const _dg = SPR.dog; SPR.dog = function (c, d, x, by, left, f, moving) {
  const A = animRow('dog'); if (!A) return _dg.apply(this, arguments);
  const [S, row] = A, col = moving ? 1 + ((f >> 3) & 1) : ((f >> 6) % 3 === 2 ? 3 : 0);
  animDraw(S, row, col, x, by, left);
}; }
if (typeof SPR !== 'undefined') animDogWrap(); else document.addEventListener('DOMContentLoaded', animDogWrap);   // sprites.js loads after life.js
// ---- grey squirrels on lawns under trees, and white-tailed deer at the wooded edge of town (Nov 27) ----
// They keep to grass (squirrels) or woods and fields (deer), shy away when you come close (squirrels dash, deer bound off),
// and stay home in deep winter nights like the birds. Never on roads, never indoors.
LIFE.critters = [];
const CRIT_GROUND = { squirrel: new Set([TL.GRASS, TL.LAWN, TL.YARD]), deer: new Set([TL.WOODS, TL.FARM, TL.GRASS, TL.MARSH]) };
function critSpawn(kind) {
  const [px, py] = playerM();
  for (let t = 0; t < 24; t++) {
    const a = Math.random() * 6.283, d = 16 + Math.random() * 40, x = px + Math.cos(a) * d, y = py + Math.sin(a) * d, tt = tAt(Math.floor(x / 4), Math.floor(y / 4));
    if (!CRIT_GROUND[kind].has(tt)) continue;
    if (kind === 'deer') {   // deer need woods within a few cells, and no road right there
      let woods = 0, road = 0; for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) { const q = tAt(Math.floor(x / 4) + i, Math.floor(y / 4) + j); if (q === TL.WOODS) woods++; if (q === TL.ROAD || q === TL.MAJOR || q === TL.BLDG) road++; }
      if (woods < 6 || road) continue;
    }
    return { kind, x, y, face: Math.random() < 0.5 ? -1 : 1, t: Math.random() * 3, mv: 0, flee: 0, col: 0, n: Math.random() * 100 };
  }
  return null;
}
function lifeCritters(dt) {
  const [px, py] = playerM();
  LIFE.critters = LIFE.critters.filter(c => !c.gone && Math.hypot(c.x - px, c.y - py) < 90);
  const day = SKY.d < 0.6, sq = LIFE.critters.filter(c => c.kind === 'squirrel').length, dr = LIFE.critters.filter(c => c.kind === 'deer').length;
  if (day && SKY.phase !== 'snow' && sq < 4 && Math.random() < dt * 0.4) { const c = critSpawn('squirrel'); if (c) LIFE.critters.push(c); }
  if ((SKY.d > 0.2 || SKY.warm > 0.3 || Math.random() < 0.3) && dr < 3 && Math.random() < dt * 0.15) { const c = critSpawn('deer'); if (c) { LIFE.critters.push(c); if (Math.random() < 0.6) { const c2 = Object.assign({}, c, { x: c.x + 2.5, y: c.y + 1, n: c.n + 7 }); LIFE.critters.push(c2); } } }   // deer come out at dawn and dusk, often two
  for (const c of LIFE.critters) {
    const d = Math.hypot(c.x - px, c.y - py), shy = c.kind === 'deer' ? 14 : 5;
    if (!c.flee && d < shy) { c.flee = 1; const a = Math.atan2(c.y - py, c.x - px); c.vx = Math.cos(a) * (c.kind === 'deer' ? 9 : 6); c.vy = Math.sin(a) * (c.kind === 'deer' ? 9 : 6); c.face = c.vx < 0 ? -1 : 1; }
    if (c.flee) { c.x += c.vx * dt; c.y += c.vy * dt; c.mv = 1; if (d > 60) c.gone = true; continue; }
    c.t -= dt;
    if (c.t < 0) { c.t = 1 + Math.random() * 3; c.mv = Math.random() < 0.45 ? 0.8 + Math.random() : 0; if (c.mv) c.face = Math.random() < 0.5 ? -1 : 1; }
    if (c.mv > 0) { c.mv -= dt; const sp = c.kind === 'deer' ? 1.2 : 2.2, nx = c.x + c.face * sp * dt, tt = tAt(Math.floor(nx / 4), Math.floor(c.y / 4)); if (CRIT_GROUND[c.kind].has(tt)) c.x = nx; else { c.face = -c.face; c.mv = 0; } }
  }
}
function drawCritter(c) {
  const A = animRow(c.kind); if (!A) return; const [S, row] = A, sx = (c.x / 4 - camX) * T, sy = (c.y / 4 - camY) * T;
  const mov = c.flee || c.mv > 0, f = (frame >> (c.flee ? 2 : 3)) & 1;
  let col = mov ? 1 + f : 0;
  if (!mov) { const ph = ((frame >> 5) + Math.round(c.n)) % 9; col = c.kind === 'deer' ? (ph < 4 ? 3 : 0) : (ph === 0 ? 3 : 0); }   // deer graze, squirrels nibble now and then
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(sy), c.kind === 'deer' ? 9 : 3.5, 1.6, 0, 0, 6.29); ctx.fill();
  animDraw(S, row, col, sx, sy, c.face < 0);
}
{ const _ds = drawStreets; drawStreets = function () {
  _ds();
  if (mode !== 'walk' || typeof G === 'undefined' || !G || (typeof INSIDE !== 'undefined' && INSIDE) || !ANIM.animals2) return;
  try { lifeCritters(1 / 60); for (const c of LIFE.critters) if (inView(c.x, c.y, 24)) drawCritter(c); } catch (e) {}
}; }
