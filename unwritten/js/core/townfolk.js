"use strict";
// =====================================================================
//  TOWNSFOLK (Nov 19): about 2,000 made-up people around town, Pokemon-style. Each stands (or idles a few steps) in a
//  public place and, when you talk to them, says where you are: the street or corner, the nearest public place or
//  business (its sign name only), what the ground and the season are like, and which way the Fig Tree is.
//  About one in four also passes on some town talk tied to the spot (themes from the town's own message board,
//  composites only). Nobody is a real person; no homes, no politics, no faith, no bad news, nothing about sales.
//  Placement and context: /home/claude/npcgen (gen.js + build.py) -> js/data/townfolk_data.js. Sprites: the people
//  generator in sprites.js (Nov 22), about 28 px for an adult, with walk frames in four directions.
// =====================================================================
// Nov 22: the old sheet (assets/townfolk/sprites.png) is no longer drawn; everybody is made by the people generator
// (sprites.js) from their id, flavour and role, dressed for the season. n.spr stays as each person's role.
const TF = [], TF_GRID = new Map(), TF_B = 16;   // NPCs, bucketed by home tile (16 x 16 tiles)
const TFE = { WATER: 1, WOODS: 2, FARM: 4, TRAIL: 8, DOWNTOWN: 16, RURAL: 32, RAIL: 64, MARSH: 128, PARK: 256, SCHOOL: 512, FAIR: 1024, BROOK: 2048, LOT: 4096, WALK: 8192 };
(function tfSetup() {
  if (typeof TF_DATA === 'undefined') return;
  const D = TF_DATA, k = D.k, A = D.n;
  for (let i = 0; i < A.length; i += k) {
    const n = { tf: 1, id: 'tf' + (i / k), x: A[i], y: A[i + 1], hx: A[i], hy: A[i + 1], spr: D.spr[A[i + 2]], fl: A[i + 3], s1: A[i + 4], s2: A[i + 5], pi: A[i + 6], pd: A[i + 7], inP: A[i + 8],
      env: A[i + 9], wat: D.w[A[i + 10]], topic: A[i + 11] >= 0 ? D.tk[A[i + 11]] : '', r: A[i + 12], seed: A[i + 13], t: 0, mx: 0, my: 0, wait: A[i + 13] % 90, flip: A[i + 13] & 1, k: 0, talking: false };
    TF.push(n); const gk = Math.floor(n.hy / TF_B) * 1000 + Math.floor(n.hx / TF_B); if (!TF_GRID.has(gk)) TF_GRID.set(gk, []); TF_GRID.get(gk).push(n);
  }
})();
function tfIn(x0, y0, x1, y1, fn) {   // every NPC whose home bucket touches the tile rect
  for (let gy = Math.floor(y0 / TF_B); gy <= Math.floor(y1 / TF_B); gy++) for (let gx = Math.floor(x0 / TF_B); gx <= Math.floor(x1 / TF_B); gx++) { const L = TF_GRID.get(gy * 1000 + gx); if (L) for (const n of L) fn(n); }
}
// at night most folks are home; a few stay out, more downtown
function tfOut(n) { const d = typeof SKY !== 'undefined' && SKY.d !== undefined ? SKY.d : 0; return d < 0.75 || n.seed % 4 === 0 || (n.env & TFE.DOWNTOWN && n.seed % 2 === 0); }
function tfAt(x, y) { let hit = null; tfIn(x - 3, y - 3, x + 3, y + 3, n => { if (!hit && n.x === x && n.y === y && tfOut(n)) hit = n; }); return hit; }
const TF_WINTER = { Fisherman: 'Ice Fisher', Biker: 'Snowmobiler', Hiker: 'Skier', 'Delivery Driver': 'Snow Shoveler' };
function tfSprite(n) { if (typeof SKY !== 'undefined' && SKY.phase === 'snow' && TF_WINTER[n.spr] && (n.spr !== 'Biker' || n.env & TFE.RURAL) && (n.spr !== 'Fisherman' || n.wat !== 'Spring Brook')) return TF_WINTER[n.spr]; return n.spr; }
// ---------- idling and wandering: only the folks near the camera ----------
function tfUpdate() {
  if (typeof G === 'undefined' || !G) return;
  const cx = Math.floor(camX), cy = Math.floor(camY), w = Math.ceil(SW / T), h = Math.ceil(SH / T);
  tfIn(cx - 3, cy - 3, cx + w + 3, cy + h + 3, n => {
    if (n.t > 0) { n.t -= 1 / 14; if (n.t <= 0) { n.t = 0; n.mx = n.my = 0; } return; }
    if (n.talking) return;
    if (G && Math.abs(G.x - n.x) + Math.abs(G.y - n.y) <= 2) { n.wait = 60; return; }   // hold still while you walk up
    if (n.wait-- > 0) return;
    n.wait = 60 + hash(frame, n.seed * 7 + n.x) % 160;
    if (!n.r || hash(frame, n.seed) % 3 === 0) { n.flip = 1 - n.flip; return; }   // look the other way
    const ds = [[1, 0], [-1, 0], [0, 1], [0, -1]], [ax, ay] = ds[hash(frame + n.seed, n.y) % 4], nx = n.x + ax, ny = n.y + ay;
    if (Math.abs(nx - n.hx) > n.r || Math.abs(ny - n.hy) > n.r || solidM(nx, ny) || (nx === G.x && ny === G.y) || tfAt(nx, ny) || NPCS.some(m => m.x === nx && m.y === ny)) return;
    if (ax) n.flip = ax < 0 ? 1 : 0;
    n.x = nx; n.y = ny; n.mx = -ax; n.my = -ay; n.t = 1;
  });
}
function tfProps() {
  const out = [], x0 = camX - 1, x1 = camX + SW / T + 1, y0 = camY - 0.5, y1 = camY + SH / T + 2;
  tfIn(Math.floor(x0) - 3, Math.floor(y0) - 3, Math.ceil(x1) + 3, Math.ceil(y1) + 3, n => {
    if (!tfOut(n)) return; const x = n.x + n.mx * n.t + 0.5, y = n.y + n.my * n.t + 1;
    if (x > x0 && x < x1 && y > y0 && y < y1) out.push({ k: 'tf', n, x, y });
  });
  return out;
}
// ---------- how each person looks: from the id (seed), the flavour and the role, dressed for the season ----------
function tfLook(n) {
  const ph = TF_SEASON(); if (n._lk && n._lkp === ph) return n._lk;
  const C = SPR.C, r = SPR.rng(n.seed * 7919 + n.fl * 131 + (n.x & 255) * 7 + 17), P = a => SPR.pick(r, a), role = n.spr;
  const winter = ph === 'snow', cool = /^(spring|bare|color)$/.test(ph), warm = !winter && !cool, ch = q => r() < q;
  const L = { age: 'adult', build: Math.floor(r() * 3), skin: P(C.skin), hair: P(C.hair), sh: P(C.shoes), pc: P(C.pants), c1: P(C.cloth), c2: P(C.cloth),
    hs: P(['short', 'side', 'messy', 'ponytail', 'bob', 'long', 'bun', 'curly', 'buzz', 'short', 'bald', 'side']) };
  const casual = (bright) => { L.top = P(warm ? ['tee', 'tee', 'polo', 'tee', 'dress', 'open', 'tee'] : ['hoodie', 'jacket', 'flannel', 'sweater', 'open', 'hoodie']); if (bright) L.c1 = P(C.bright);
    if (L.top === 'dress') L.c1 = P(C.cloth.concat(C.bright)); else if (warm && ch(0.35)) L.bot = ch(0.6) ? 'shorts' : 'skirt'; };
  const hat = (k, c, c2) => { L.hat = k; L.hc = c; if (c2) L.hc2 = c2; };
  const elderHair = () => { L.hair = P(C.grey); L.hs = P(['short', 'bald', 'side', 'bob', 'buzz', 'bun', 'short']); };
  switch (n.fl) {
    case 0: L.age = role === 'Student' && ch(0.4) ? 'teen' : 'kid'; if (L.hs === 'bald' || L.hs === 'buzz' && ch(0.5)) L.hs = 'messy'; casual(true); L.blush = L.age === 'kid' ? 1 : 0;
      if (role === 'Student') L.bag = 'pack', L.bc = P(C.bright); if (role === 'Gamer' && ch(0.35)) L.hold = 'game'; if (ch(0.2)) hat('cap', P(C.bright)); if (warm && L.top !== 'dress' && ch(0.5)) L.bot = 'shorts'; break;
    case 1: L.age = 'elder'; elderHair(); L.top = P(['sweater', 'flannel', 'open', 'jacket', 'polo', 'sweater']); L.gl = ch(0.6) ? 1 : 0; L.pc = P(['#4a4a52', '#5a5040', '#8a7a58', '#3a4458', '#6a6a72']);
      if (ch(0.16)) L.aid = 'cane'; else if (ch(0.07)) L.aid = 'walker';
      if (role === 'Veteran') { L.top = 'jacket'; L.c1 = '#4e5a34'; hat('cap', '#2a3a5a'); } else if (role === 'Librarian') { L.top = 'sweater'; L.gl = 1; } else if (role === 'Historian') { L.top = 'open'; L.c2 = '#e8e4dc'; L.vest = P(C.earth); }
      else if (role === 'Antique Dealer') { L.top = 'flannel'; L.vest = P(C.earth); } else if (ch(0.25)) hat(P(['cap', 'sunhat']), P(C.earth));
      if (L.hs !== 'bald' && L.hs !== 'bun' && L.hs !== 'bob' && ch(0.3)) L.beard = ch(0.5) ? 1 : 2; if (ch(0.2)) L.bot = 'skirt'; break;
    case 2: L.age = ch(0.25) ? 'teen' : 'adult'; L.hs = P(['ponytail', 'short', 'buzz', 'ponytail', 'bun', 'side']); L.c1 = P(C.bright); L.c2 = P(C.bright); L.sh = P(['#e8e8ea', '#e8e8ea', '#3a8ad8', '#e84a3a']);
      if (warm) { L.top = P(['run', 'tee', 'run']); L.bot = 'shorts'; L.pc = P(['#26262c', '#3a4a6a', '#4a4a52']); if (ch(0.4)) hat(P(['headband', 'cap']), P(C.bright)); }
      else { L.top = P(['hoodie', 'jacket']); L.pc = '#26262c'; } break;
    case 3: if (ch(0.25)) { L.age = 'elder'; elderHair(); } else if (ch(0.15)) L.age = 'teen'; casual(false); if (ch(0.2)) L.bag = 'side', L.bc = P(C.earth); if (ch(0.2)) hat(P(['cap', 'sunhat']), P(C.cloth)); break;
    case 4: if (ch(0.3)) { L.age = 'elder'; elderHair(); } L.top = P(['flannel', 'tee', 'polo']); L.vest = P(C.earth); L.pc = P(C.earth.concat(C.pants)); L.hold = 'rod';
      hat(P(['sunhat', 'cap', 'cap', 'sunhat']), P(C.earth.concat(['#d8c070']))); if (L.hs !== 'bun' && ch(0.35)) L.beard = 1; break;
    case 5: L.top = 'uniform'; L.c1 = P(['#3a4a6a', '#5a6a7a', '#4a4a52', '#2a3a5a']); L.c2 = '#26262c'; L.pc = L.c1; L.sh = '#2a2224'; if (ch(0.6)) hat('cap', P(['#c83a3a', '#2a2a30', '#3a5a8a']));
      if (role === 'Handyman') { L.top = 'overalls'; L.c1 = P(C.earth); L.c2 = P(C.cloth); } if (role === 'ATV Rider') { L.top = 'jacket'; L.c1 = P(['#2a4a3a', '#6a4a2a', '#2a2a30']); L.pc = '#4a4a52'; }
      if (ch(0.3)) L.beard = ch(0.5) ? 1 : 2; break;
    case 6: L.top = 'overalls'; L.c1 = P(['#3a5a8a', '#4a6ab0', '#6a5a3a', '#3a4458']); L.c2 = P(['#a8322a', '#e8e4dc', '#3a5a8a', '#4a7a5a', '#c8a050']); L.sh = P(['#5a3a24', '#2a2224', '#4a3a2a']);
      if (role === 'Maple Syrup Maker') { L.top = 'flannel'; L.c1 = '#a8322a'; L.c2 = '#1e1a1a'; L.pc = '#4a3a2a'; hat('beanie', P(C.knit)); }
      else hat(P(['cap', 'cap', 'cowboy', 'sunhat']), P(['#4e5a34', '#c83a3a', '#e8e4dc', '#d8c070', '#6a4a2a', '#3a5a8a']));
      if (ch(0.2)) { L.age = 'elder'; elderHair(); } if (L.hs !== 'bun' && ch(0.35)) L.beard = ch(0.6) ? 1 : 2; break;
    case 7: L.age = ch(0.6) ? 'teen' : 'adult'; if (L.hs === 'bald') L.hs = 'messy'; casual(false); if (L.top === 'polo' || L.top === 'open') L.top = 'hoodie'; L.bag = 'pack'; L.bc = P(C.cloth.concat(C.earth));
      if (role === 'Musician') L.bag = 'case'; if (role === 'Tech Helper') L.gl = 1; if (role === 'College Visitor' && ch(0.5)) L.neck = 'lanyard'; break;
    case 8: casual(false); if (L.top === 'dress') L.top = 'tee';
      if (role === 'Barista') { L.top = 'tee'; L.apron = P(['#3a2a20', '#2a5a3a', '#5a3a24']); }
      else if (role === 'Diner Cook') { L.top = 'polo'; L.c1 = '#f4f2ea'; L.c2 = '#e8e4dc'; L.apron = '#f4f2ea'; hat('cap', '#f4f2ea'); L.pc = '#26262c'; }
      else if (role === 'Pizza Owner') { L.top = 'tee'; L.apron = '#c83a3a'; }
      else if (role === 'Grocery Manager') { L.top = 'polo'; L.neck = 'lanyard'; L.pc = '#26262c'; }
      else if (role === 'Delivery Driver') { L.top = 'uniform'; L.c1 = '#6a4a2a'; L.c2 = '#3a2a1a'; L.pc = '#6a4a2a'; }
      else if (role === 'Parcel Carrier') { L.top = 'uniform'; L.c1 = '#3a5a8a'; L.c2 = '#26262c'; L.pc = '#3a4458'; hat('cap', '#3a5a8a'); L.bag = 'side'; L.bc = '#4a3a2a'; if (warm) L.bot = 'shorts'; }
      else if (role === 'Hardware Clerk') { L.top = 'tee'; L.apron = P(['#c83a3a', '#d86a2a', '#3a6a3a']); }
      else if (role === 'Bookseller') { L.top = 'sweater'; L.gl = ch(0.6) ? 1 : 0; L.hold = 'book'; }
      if (L.bot === 'shorts' && role !== 'Parcel Carrier') L.bot = 'pants'; break;
    case 9: L.age = ch(0.2) ? 'teen' : 'adult'; L.hs = P(['short', 'ponytail', 'buzz', 'side']); L.top = 'jersey'; L.c1 = P(C.bright); L.c2 = P(C.bright.concat(['#e8e4dc', '#26262c'])); L.pc = '#26262c'; L.bot = 'shorts';
      hat('helmet', P(C.bright.concat(['#e8e4dc', '#2a2a30']))); if (!warm) { L.top = 'jacket'; L.bot = 'pants'; } break;
    case 10: if (ch(0.3)) { L.age = 'elder'; elderHair(); } L.top = P(['tee', 'flannel', 'polo']); L.vest = P(C.earth); L.hold = 'bino'; L.pc = P(C.earth.concat(C.pants)); hat(P(['sunhat', 'cap']), P(C.earth.concat(['#d8c070'])));
      if (role === 'Conservation Volunteer') { L.vest = ''; L.top = 'workvest'; L.c1 = P(['#e8a020', '#c8e040', '#f07020']); L.c2 = P(C.cloth); hat('cap', '#2a2a30'); }
      else if (role === 'Forester') { L.vest = ''; L.top = 'flannel'; L.c1 = '#a8322a'; L.c2 = '#1e1a1a'; hat(P(['beanie', 'hardhat']), P(['#f08a30', '#e8c030', '#4e5a34'])); }
      else if (role === 'Campground Host') { L.vest = ''; L.top = 'uniform'; L.c1 = '#8a7a58'; L.c2 = '#4a3a2a'; L.pc = '#4e5a34'; hat('sunhat', '#6a6a4a'); }
      else if (role === 'Trapper') { L.vest = ''; L.top = 'flannel'; L.c1 = P(['#3a5a3a', '#a8322a', '#3a4a6a']); L.c2 = '#1e1a1a'; hat('cap', '#6a4a2a'); }
      break;
  }
  if (L.top === 'dress') L.bot = 'pants';
  if (cool) { if (L.bot === 'shorts' && n.fl !== 2) L.bot = 'pants'; if (L.top === 'dress' || L.bot === 'skirt') L.tights = P(['#3a3a44', '#5a2a3a', '#2a3a5a']); if (L.hat === 'sunhat' && ch(0.6)) hat('beanie', P(C.knit)); }
  if (winter) {   // coats, scarves and mittens, knit hats; hard hats, cowboy hats, helmets and caps under a hood stay
    const keep = L.hat === 'hardhat' || L.hat === 'cowboy' || L.hat === 'helmet' || L.hat === 'beanie';
    L.top = 'coat'; L.c1 = P(C.coat); L.c2 = P(C.knit); L.mitts = P(C.knit); L.vest = ''; L.apron = ''; L.neck = L.neck === 'lanyard' ? '' : L.neck; if (L.hold === 'game' || L.hold === 'book') L.hold = '';
    if (L.bot === 'shorts') L.bot = 'pants'; if (L.bot === 'skirt') L.tights = P(['#3a3a44', '#5a2a3a', '#2a3a5a']); L.sh = P(['#5a3a24', '#2a2224', '#4a3a2a', '#6a2a2a']);
    if (!keep && (ch(0.75) || !L.hat)) hat('beanie', P(C.knit), ch(0.5) ? P(C.knit) : ''); if (n.fl === 9) hat('helmet', P(C.bright)); if (L.pc === '#26262c' && n.fl === 9) L.pc = '#3a3a44';
  }
  n._lk = SPR.norm(L); n._lkp = ph; return n._lk;
}
function drawTf(p) {
  const n = p.n, x = Math.round(p.x * T), y = Math.round(p.y * T) - 1, L = tfLook(n);
  let dir;   // facing: the way they step; the player, while talking; otherwise front, or a look to the side
  if (n.t > 0) dir = n.mx > 0 ? 'left' : n.mx < 0 ? 'right' : n.my > 0 ? 'up' : 'down';
  else if (n.talking && typeof G !== 'undefined' && G) { const dx = G.x - n.x, dy = G.y - n.y; dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : (dy < 0 ? 'up' : 'down'); }
  else { if (n._f !== n.flip) { if (n._f !== undefined) n._d = !n._d || n._d === 'down' || n._d === 'up' ? (n.flip ? 'left' : 'right') : 'down'; n._f = n.flip; } dir = n._d || 'down'; }
  if (n.t > 0) n._d = dir;
  const fr = n.t > 0.3 ? (((n.x + n.y) & 1) ? 1 : 2) : n.t > 0 ? 0 : SPR.idleFrame(frame, n.seed);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, y - 1, L.age === 'kid' ? 5 : 7, 2.5, 0, 0, 6.29); ctx.fill();
  if (n.fl === 3) {   // dog walkers have the dog with them, on a leash
    const left = dir === 'left' || (dir !== 'right' && !!n.flip), dx = left ? -14 : 14, [c, d] = TF_DOGS[n.seed % 4], hx = x + (left ? -6 : 6), hy = y - (L.age === 'kid' ? 8 : 11);
    if (dir === 'up') { SPR.draw(L, 'o', x, y, dir, fr); tfLeash(hx, hy, x + dx + (left ? -3 : 3), y - 7); SPR.dog(c, d, x + dx, y, left, frame, n.t > 0); return; }
    SPR.dog(c, d, x + dx, y, left, frame, n.t > 0); tfLeash(hx, hy, x + dx + (left ? -3 : 3), y - 7);
  }
  SPR.draw(L, 'o', x, y, dir, fr);
}
const TF_DOGS = [['#8a5a32', '#5e3c20'], ['#3a3434', '#1e1c1c'], ['#d8c8a8', '#a89878'], ['#c88a3a', '#8e5e24']];
function tfLeash(x0, y0, x1, y1) {   // a thin leash from the walker's hand to the collar, with a little slack
  ctx.fillStyle = '#3a2a24'; const n = Math.max(Math.abs(x1 - x0), 1);
  for (let k = 0; k <= n; k++) { const u = k / n; ctx.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u + Math.sin(u * Math.PI) * 2), 1, 1); }
}
// ---------- hooks: depth-sorted drawing, the walk loop, collision, talking ----------
{ const _vp = visibleProps; visibleProps = function () { const v = _vp(); if (mode !== 'walk') return v; const t = tfProps(); return t.length ? v.concat(t).sort((a, b) => a.y - b.y) : v; }; }
{ const _dp = drawProp; drawProp = function (p) { if (p.k === 'tf') return drawTf(p); return _dp(p); }; }
{ const _nu = npcUpdate; npcUpdate = function () { _nu(); tfUpdate();
  for (const s of NPCS) if (s._away && !s.t && !s.talking) {   // someone squeezed past: step back home once the spot is clear
    if (s.x === s.hx && s.y === s.hy) { s._away = 0; continue; }
    if (G && Math.abs(G.x - s.x) + Math.abs(G.y - s.y) < 2) continue;
    if ((G.x === s.hx && G.y === s.hy) || NPCS.some(m => m !== s && m.x === s.hx && m.y === s.hy)) continue;
    const ax = s.hx - s.x, ay = s.hy - s.y; if (Math.abs(ax) + Math.abs(ay) !== 1) { s.x = s.hx; s.y = s.hy; s._away = 0; continue; }
    s.x = s.hx; s.y = s.hy; s.mx = -ax; s.my = -ay; s.t = 1; s._away = 0; s.dir = s.face0 || s.dir;
  } }; }
{ const _na = npcAt; npcAt = function (x, y) { return _na(x, y) || tfAt(x, y); };
  // Nov 26 (Christian: "don't have them move out of the way when approaching, have them solid enough to bump into and
  // talk to"): everybody is solid now. Walk into someone and you stop; keep leaning into them a moment and they talk to you
  // (A still works too). After a talk you have to let go or turn before the same person talks again.
  const _tm = tryMove; tryMove = function (dir) {
    const [dx, dy] = DIRS[dir], nx = G.x + dx, ny = G.y + dy;
    if (_tm(dir)) { G._bump = null; G._quiet = null; return true; }
    if (solidM(nx, ny)) { G._bump = null; return false; }
    const s = npcAt(nx, ny); if (!s) { G._bump = null; return false; }
    if (s.talking || (typeof DLG !== 'undefined' && DLG)) return false;
    if (G._quiet && G._quiet.id === s.id && G._quiet.dir === dir) return false;   // just talked; wait for a fresh push
    G._bump = G._bump && G._bump.id === s.id ? { id: s.id, k: G._bump.k + 1 } : { id: s.id, k: 1 };
    if (G._bump.k < 12) return false;
    G._bump = null; G._quiet = { id: s.id, dir }; npcTalk(s); return false;
  }; }
{ const _nt = npcTalk; npcTalk = function (n) { if (n && n.tf) return tfTalk(n); return _nt(n); }; }

// ---------- what they say ----------
const TF_DIR8 = ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast'];
function tfDir(dx, dy) { return TF_DIR8[(Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8]; }
function tfFar(m) {   // metres, in the words people use
  if (m < 45) return 'right here'; if (m < 150) return 'about a block'; if (m < 900) return 'about ' + Math.max(2, Math.round(m / 110)) + ' blocks';
  const mi = m / 1609; return mi < 0.75 ? 'about half a mile' : mi < 1.5 ? 'about a mile' : 'about ' + Math.round(mi) + ' miles';
}
function tfPick(n, arr, salt) { return arr[hash(n.seed * 31 + (salt || 0), n.k * 7 + 3) % arr.length]; }
function tfFill(s, V) { return s.replace(/\{(\w+)\}/g, (m, k) => V[k] !== undefined ? V[k] : m); }
const TF_SEASON = () => (typeof SKY !== 'undefined' && SKY.phase) || 'summer';
// lines may start with '@phase,phase|' to say them only in those seasons (sky.js phases)
function tfOk(s) { const m = /^@([\w,]+)\|/.exec(s); return !m || m[1].split(',').includes(TF_SEASON()); }
function tfStrip(s) { return s.replace(/^@[\w,]+\|/, ''); }
function tfPickS(n, arr, salt) { const ok = arr.filter(tfOk); return ok.length ? tfStrip(tfPick(n, ok, salt)) : null; }

const TF_HELLO = [   // per flavour: openers (short, and they lead into the place line)
  ['Hi! Hi!', 'Hey, hey!', 'Guess what?', 'Psst!', 'Oh! Hi!', 'Wanna know something?'],
  ['Well, hello there.', 'Afternoon, young one.', 'Ah, a visitor.', 'Nice day for a walk.', 'Don\'t mind me, just resting my knees.', 'Good to see somebody out and about.'],
  ['Huff... hi!', 'Hey! Just... catching my breath.', 'Morning run. Or whatever time it is.', 'One more lap. Hi!', 'Hoo! Hello!'],
  ['Hi there! He\'s friendly.', 'Don\'t mind the dog. She says hi.', 'We walk this way every day.', 'Easy, buddy. Hello!', 'Sniffing every post, as usual.'],
  ['Shh. Fish are listening.', 'Nothing biting yet.', 'Hey there. Quiet out here, huh?', 'Good spot, this.', 'Caught one this big. Well... this big.'],
  ['Grease on my hands, don\'t shake.', 'Hey. Car trouble? Kidding.', 'Taking five.', 'Heard a noise in my truck. Listening for it.'],
  ['Morning! In town for parts.', 'Hello. Town\'s busy today.', 'Well, howdy.', 'Back to the fields soon.', 'Came in for supplies.'],
  ['Hey. Studying, sort of.', 'Oh, hi. Got a test tomorrow.', 'Hey! Between classes.', 'Hi. Don\'t tell anyone I\'m outside.'],
  ['Hello! On my break.', 'Hi there. Nice to see a friendly face.', 'Taking some air before the next rush.', 'Hello, hello!'],
  ['Hey! Nice day to ride.', 'Hi! Just fixing my chain.', 'On your left! Oh, I\'m stopped. Hi.', 'Hey there. Good roads today.'],
  ['Shh... hear that warbler?', 'Hello. Seen anything with feathers?', 'Oh, hello. I\'m counting birds.', 'Hi. Binoculars are heavy today.']];
// North or South (Nov 21 sweep; Christian: a dog walker on North Lincoln said "South Lincoln Street"). Antigo's north-south
// streets change from North to South at 10th Avenue (the map's South Clermont, Superior, Hudson, Virginia, Park and Mayfair
// all begin there), but the OpenStreetMap way for Lincoln carries "South" all the way up past 6th Avenue. So the half of a
// "South X" / "North X" street a person names follows where they stand: north of 10th Avenue it is North X, south of it South X.
let TF_DIV = null;
function tfDivide(x) {   // the y (tiles) of 10th Avenue nearest this x
  if (!TF_DIV) { TF_DIV = []; for (const o of VEC) if ((o.cl === 'road' || o.cl === 'major') && /^(East |West )?10th Avenue$/.test(o.name || '')) for (const p of o.P) TF_DIV.push(p); }
  let best = null, bd = 1e9; for (const p of TF_DIV) { const d = Math.abs(p[0] - x); if (d < bd) { bd = d; best = p; } }
  return best && bd < 400 ? best[1] : 1171;
}
function tfStreetNS(name, x, y) {
  const m = /^(North|South) (.+)$/.exec(name || ''); if (!m || /Avenue$|Road$|Way$|Drive$/.test(m[2])) return name;
  const div = tfDivide(x), want = y < div - 1 ? 'North' : y > div + 1 ? 'South' : m[1];
  return want === m[1] ? name : want + ' ' + m[2];
}
const TF_CORNER = ['This is the corner of {s1} and {s2}.', 'We\'re at {s1} and {s2}.', '{s1} meets {s2} right here.', 'You\'re standing at {s1} and {s2}.', 'Corner of {s1} and {s2}. Good spot to watch the town go by.'];
const TF_STREET = ['You\'re on {s1}.', 'This here is {s1}.', 'This stretch is {s1}.', 'We\'re on {s1}, if you\'re keeping track.', '{s1}. I know every crack in this sidewalk.', 'Yep, this is {s1}.'];
const TF_INPARK = ['This is {park}.', 'Welcome to {park}!', 'You found {park}.', 'We\'re in {park}.', '{park}. One of my favorite spots.'];
const TF_BYPLACE = ['We\'re right by {pl}.', 'This is the block with {pl} on it.', 'Middle of the block here, near {pl}.'];
const TF_INBLOCK = ['Middle of the block here. Streets all around.', 'Between the streets here. Good shortcut.', 'Right in the middle of town.'];
const TF_NEXT = ['{pl} is just {pdir} of here.', 'Just {pdir} of here is {pl}.', '{pl} is right around here, a little {pdir}.'];
const TF_NOWHERE = ['Not much out here but sky and fields.', 'Edge of town. Quiet, isn\'t it?', 'Out here the town thins out into fields.', 'Just open ground out here.'];
const TF_NEAR = ['{pl} is {pdist} {pdir} of here.', 'See {pl}? That\'s {pdist} {pdir}.', 'If you\'re looking for {pl}, it\'s {pdist} {pdir}.', '{pl} is just {pdir}, {pdist} or so.'];
const TF_RIGHTHERE = ['That\'s {pl} right there.', '{pl} is right here.', 'Right next to {pl}.', 'That building? {pl}.'];
const TF_KIND = {   // a word about the nearest place, by kind
  park: ['Kids, dogs, frisbees. Parks are the best part of town.', 'There\'s room on a bench if you want to sit.', 'Picnic tables fill up fast on summer Sundays.', '@snow|They pack down a sled run here when the snow\'s good.', '@summer,early,late|Grass is soft today. Perfect for lying down and looking at clouds.'],
  school: ['School grounds. Loud at recess, quiet all summer.', 'When the bell rings this whole block fills up.', 'The playground here is open to everybody after school.'],
  library: ['The library\'s free for everybody. All you need is a card.', 'Story hour, puzzles, computers. Lots going on at the library.'],
  lake: ['Ducks, geese, and the odd fish jumping. Good water.', 'Paddle out on a calm day. It\'s glassy.', '@snow|Folks drill holes in the ice out there all winter.'],
  fair: ['The county fair takes over these grounds every summer.', 'Animals, rides, fair food. These grounds come alive in August.'],
  hospital: ['That\'s the hospital. Folks say its little cafe is a nice quiet spot.', 'The hospital serves the whole county.'],
  fuel: ['{pl} is handy if you need a snack for the road.', 'Lots of trucks stop at {pl}.'],
  food: ['Something always smells good near {pl}.', 'I can smell lunch from here.'],
  camp: ['Campers come up from all over in summer.', 'You can hear loons from the campground some nights.'],
  pool: ['On hot days you can hear the splashing from a block away.'],
  dog: ['Dogs run free in there. Best place to meet folks. Dogs first, names later.'],
  market: ['Fresh vegetables and flowers on market days.'],
  pitch: ['Ball games here on summer evenings. Bring a lawn chair.'],
  playground: ['Swings! The good kind that go really high.'],
  work: ['Lots of folks in town work at places like {pl}.'],
  auto: ['{pl} is right there if your car starts making noises.'],
  movies: ['{pl}. Look at that marquee.', 'Movies at {pl}. The marquee lights up at night.'],
  civic: ['{pl} is right there.'], historic: ['{pl} is a real piece of history.'] };
const TF_FIG = ['The Blessed Fig Tree? That\'s {fdist} {fdir}, at 800 Fifth Ave.', 'Looking for the bookstore? The Fig Tree is {fdist} {fdir}.', 'The Fig Tree on Fifth is {fdist} {fdir} of here.',
  'The bookstore at 800 Fifth Ave is {fdist} {fdir}. Corner door.', 'Head {fdir}, {fdist}, and you\'ll find The Blessed Fig Tree.'];
const TF_FIGHERE = ['The Blessed Fig Tree is right there on the corner!', 'The Fig Tree\'s door is the one on the corner.'];
const TF_QUIP = [   // a flavour aside
  ['I can run there in like a minute!', 'I know a shortcut. Probably.', 'Bet I can hop on one foot the whole way.', 'My friend says there\'s a frog under that bridge. A BIG one.'],
  ['I\'ve walked this town for a long time. It changes, slow.', 'Used to know every family on every block.', 'Trains used to whistle all day here.', 'Back when I was your age, we walked everywhere.'],
  ['Two more miles and I get a pancake.', 'Good flat town for running.', 'Hills? What hills? Antigo\'s pretty flat.'],
  ['She knows every tree on this street by smell.', 'We stop at every hydrant. Every single one.', 'He wants to say hi to you. Can you tell?'],
  ['Patience is most of fishing.', 'Best bait is whatever they\'re biting.', 'Herons fish here too. They\'re better at it.'],
  ['Cold starts are hard on engines up here.', 'Salt on the roads in winter eats cars alive.', 'Always carry jumper cables in the Northwoods.'],
  ['Cool nights up here are good for potatoes.', 'Rain at the right time is worth more than gold.', 'Got to get back before the weather turns.'],
  ['Studying for a science test. Did you know dirt has a state?', 'I like walking to think.', 'There\'s free Wi-Fi at the library. Just saying.'],
  ['Everybody knows everybody on Fifth.', 'Best part of the job is the regulars.', 'Wave at folks. They wave back here.'],
  ['Flat streets, quiet mornings. Good biking town.', 'Watch out for the potholes after the thaw.', 'Brakes squeak. Gotta oil that.'],
  ['Chickadees stay all winter. Tough little birds.', 'Sandhill cranes call over the fields in spring.', 'Spotted a red-tailed hawk on a light pole.']];
const TF_GROUND = {   // what the ground and the land are like
  farm: ['This dirt? Antigo silt loam. It\'s Wisconsin\'s state soil, named after this town.', 'Antigo silt loam: fine silt over glacial sand and gravel. Drains well. Potatoes love it.',
    'Potato fields all around town. Langlade County grows a lot of seed potatoes.', '@late,color|Potato harvest! Trucks run day and night this time of year.',
    'The glaciers left sand and gravel here. Wind laid silt on top. That\'s why the fields are good.'],
  woods: ['This was all big pine and hemlock once. Logging built this town.', 'Maple, birch, aspen. The woods grow back fast up here.', 'Watch for deer at dusk. They step right out of the trees.', 'Timber still matters up here. Lots of wood goes out of this county.'],
  water: ['Spring Brook runs right through town and widens into Antigo Lake.', 'Sit still by the water and you\'ll see herons.', 'The brook\'s cold and clear. You can see the stones.', '@snow|The water freezes hard up here. Stay off thin ice.'],
  rail: ['The railroad gave this town its start. Trains hauled lumber and potatoes.', 'Lumber and potatoes rode these rails out to the world.'],
  marsh: ['Cattails and red-winged blackbirds. Wet ground, keep to the path.', '@leafout,early,summer|Frogs here sing so loud at night.'],
  trail: ['The Springbrook Trail follows the brook. Good for walking, biking, or just thinking.', 'This trail\'s smooth enough for strollers and bikes.'],
  town: ['Antigo silt loam is the state soil, and it\'s named after this town. Neat, right?', 'Downtown\'s old brick buildings are from when lumber money came to town.',
    'The whole town sits on an old glacial outwash plain. Flat as a table.'] };
const TF_SEAS = {
  snow: ['Snow squeaks underfoot when it\'s this cold.', 'Plows were out before dawn.', 'Bundle up. Northwoods winter means it.'],
  spring: ['Mud season. Wear boots, not shoes.', 'Snow can still show up in April here. Don\'t put the shovel away.', 'The robins are back. Spring for real, maybe.'],
  leafout: ['Leaves are popping out. Black flies won\'t be far behind.', 'Everything\'s turning green at once.'],
  early: ['Lilacs first, then the mosquitoes.', 'Long evenings now. Light out late.'],
  summer: ['Warm one today. Good day to be outside.', 'Storms roll in fast up here in summer. Keep an eye west.'],
  late: ['Late summer. The evenings are getting cooler.', 'Sweet corn time.'],
  color: ['Leaves are turning. The maples go red first.', 'Smell that? Leaves and woodsmoke. Fall up north.'],
  bare: ['Bare trees, gray sky. Deer season\'s close. Lots of blaze orange around.', 'Feels like snow\'s coming.'] };
// town talk, by the kind of place it fits (composites of what the town talks about; no names, no politics)
const TF_TALK = {
  fifth: ['The food festival on Fifth came back. Now it\'s called the Multicultural Festival.', '@color,bare|Halloween Hop! Kids trick-or-treat at the shops downtown.',
    '@bare,snow|Christmas parade\'s usually the first Wednesday of December. Right down Fifth.', '@bare,snow|At Christmas they take free photos by the big tree at Fifth and Clermont.',
    'The Dixie Lunch has been on Fifth since 1945. New folks took it over in 2026. Same counter.', 'The flea market moved downtown. Free to get in, and food trucks too.',
    '@early,summer,late|See the hanging flower baskets? Downtown looks great with them.', '@summer,late|The car show in August fills Fifth Avenue with chrome.',
    'Old-timers remember plastic reindeer on every light pole downtown at Christmas.', 'There used to be a bubbler and a big corner clock downtown. People still talk about them.',
    '@leafout,early|Memorial Day, they line Fifth with flags. Quite a sight.', '@early,summer|Fourth of July parade comes right through. Bring a chair early.'],
  citypark: ['The splash pad\'s dolphin came back home. Kids climb all over it.', 'The YMCA runs the aquatic center now.', '@early,summer,late|Splash pad on a hot day? Best idea anybody ever had.', 'The big slide at the pool is worth the wait.'],
  bike: ['Have you tried the Rotary pump track? Bumps and berms, hardly any pedaling.', 'The bike park and pump track got finished a couple summers back. Kids love it.', 'Some volunteer keeps the bike track in shape so it can be ridden into fall.'],
  library: ['Puzzle week at the library! I\'m going for the thousand-piecer.', 'The library has a chess club. I lose a lot, but I\'m getting better.', 'No more overdue fines at the library. Just bring them back.',
    'The library\'s big used-book sale is the best day of the year.', 'Toddler story-and-song hour, Thursday mornings. So many little ones.', 'The library threw a Kindness Festival. Lots of smiles.'],
  clermont: ['Geese fly right over Clermont at dawn. Loud enough to wake the whole street.', '@spring,color,bare|Hear that honking? The geese use Clermont like a highway.'],
  fair: ['The flea market used to be at the fairgrounds. Now it\'s downtown.', '4-H kids bring their animals here every summer.', 'Somebody\'s always got a wish list for these grounds. More concerts, more shows.'],
  trail: ['Parents push strollers on the Springbrook Trail even in winter.', '@leafout,early|Black flies on the trail in June. Wear a hat.', 'Walk the trail every day and you notice everything.'],
  outdoors: ['@snow|Kettlebowl\'s got the hill groomed. Volunteers run it on weekends.', '@snow|Cross-country trails are groomed. Perfect day for skis.', '@bare,color|Deer season\'s coming. Half the county\'s in blaze orange.',
    '@spring,snow|Snow in April? Happens every year up here.', '@leafout,early|Black flies are out. They love ears.', '@early,summer|Pick-your-own strawberries run into late July out past town.',
    'Northern lights some nights. Look north, away from the streetlights.'],
  farm: ['@early,summer|Strawberry picking! My fingers are still red.', '@summer,late|The farmers market is the place for sweet corn.', '@color|Farm stands sell mums in fall. Every porch gets one.', 'Seed potatoes from up here get planted all over the country.'],
  market: ['The farmers market sets up here. Come early for the good tomatoes.', 'Market days are the best people-watching in town.'],
  hospital: ['The hospital cafe is everybody\'s favorite quiet spot for coffee.', 'Nurses walk out here on break. It\'s a nice loop.'],
  dog: ['Lots of shops in town let dogs in. Some keep treats behind the counter.', 'The dog park\'s where you meet folks. Dogs first, names later.'],
  school: ['Everybody loves the crossing guards. They know every kid by name.', 'Wave at the crossing guard. Best job in town, they say.'],
  general: ['Somebody in town once bought a kid a brand-new bike, just because. People still talk about it.', 'I\'m job hunting. Put in applications all over town. Fingers crossed!',
    'Anybody heading toward the highway later? I need a ride to work.', 'Still looking for a family doctor. Waiting lists are long, but I keep calling.',
    'I wish somebody in town sold sewing supplies. I quilt, and thread goes fast.', 'My cousin says there\'s nothing to do here. I told her: trails, the lake, the library, the pool, the fair...',
    'Somebody always says there\'s nothing to do. Then summer comes and there\'s too much.', '@snow|Young folks with plows clear their neighbors\' walks before sunrise. Good town.',
    'Folks here help each other. Push a stuck car, share a ride, that kind of thing.', 'Somebody started a free-stuff page. Somebody always needs a crib or a couch.'] };

function tfTalk(n) {
  n.talking = true; const back = () => { n.talking = false; n.wait = 120; n.k++; };
  const dx = G.x - n.x; if (dx) n.flip = dx < 0 ? 1 : 0;
  const D = TF_DATA, who = D.fl[n.fl], P = n.pi >= 0 ? D.p[n.pi] : null, IN = n.inP >= 0 ? D.p[n.inP] : null;
  const fig = BLD[TOWN.fig], fx = (fig.pxMin + fig.pxMax) / 2, fy = (fig.pyMin + fig.pyMax) / 2, fm = Math.hypot(fx - n.x - 0.5, fy - n.y - 0.5) * 4;
  const V = { s1: n.s1 >= 0 ? tfStreetNS(D.st[n.s1], n.hx, n.hy) : '', s2: n.s2 >= 0 ? tfStreetNS(D.st[n.s2], n.hx, n.hy) : '', park: IN ? IN[0] : '', pl: P ? P[0] : '', fdist: tfFar(fm), fdir: tfDir(fx - n.x - 0.5, fy - n.y - 0.5) };
  if (P) { V.pdist = tfFar(n.pd * 4 + 10); V.pdir = tfDir(P[2] - n.x, P[3] - n.y); }
  // 1. where you are
  let where, byPlace = false;
  if (IN && (IN[1] === 'park' || IN[1] === 'school' || IN[1] === 'fair') && (n.s1 < 0 || n.seed % 3 === 0)) where = tfPick(n, TF_INPARK, 1);
  else if (V.s1 && V.s2 && V.s1 !== V.s2) where = tfPick(n, TF_CORNER, 2);
  else if (V.s1) where = tfPick(n, TF_STREET, 3);
  else if (IN) where = tfPick(n, TF_INPARK, 1);
  else if (n.env & TFE.TRAIL) where = tfPick(n, ['This is the Springbrook Trail.', 'We\'re on the Springbrook Trail.', 'Springbrook Trail. It follows the brook.'], 4);
  else if (P && n.pd < 12) { where = tfPick(n, TF_BYPLACE, 4); byPlace = true; }
  else where = tfPick(n, n.env & TFE.RURAL || n.env & TFE.FARM ? TF_NOWHERE : TF_INBLOCK, 4);
  const lines = [tfPick(n, TF_HELLO[n.fl], 5) + ' ' + tfFill(where, V)];
  // 2. the pool of things to add
  const pool = [];
  if (P && P[0] !== V.park && !byPlace) pool.push(tfFill(tfPick(n, n.pd < 3 ? TF_RIGHTHERE : n.pd < 12 ? TF_NEXT : TF_NEAR, 6), V));
  if (P) { const kk = TF_KIND[P[1]]; let s = kk ? tfPickS(n, kk, 7) : null;
    if (P[1] === 'historic' && P[4]) { const yr = /Built (\d{4}(?:-\d\d)?)/.exec(P[4]), nr = /National Register/.test(P[4]);
      s = P[0] + (yr ? ' was built in ' + yr[1] + (nr ? ', and it\'s on the National Register of Historic Places.' : '.') : nr ? ' is on the National Register of Historic Places.' : ' is a real piece of history.'); }
    if (s) pool.push(tfFill(s, V)); }
  if (IN && IN !== P) { const kk = TF_KIND[IN[1]]; const s = kk && tfPickS(n, kk, 8); if (s) pool.push(tfFill(s, V)); }
  const e = n.env, g = [];
  if (e & TFE.FARM || e & TFE.RURAL) g.push('farm'); if (e & TFE.WOODS) g.push('woods'); if (e & TFE.WATER) g.push('water'); if (e & TFE.RAIL) g.push('rail');
  if (e & TFE.MARSH) g.push('marsh'); if (e & TFE.TRAIL) g.push('trail'); if (!g.length) g.push('town');
  { const s = tfPickS(n, TF_GROUND[g[n.seed % g.length]], 9); if (s) pool.push(s); }
  { const s = tfPickS(n, TF_SEAS[TF_SEASON()] || TF_SEAS.summer, 10); if (s) pool.push(s); }
  pool.push(tfPick(n, TF_QUIP[n.fl], 11));
  const figLine = tfFill(fm < 60 ? tfPick(n, TF_FIGHERE, 12) : tfPick(n, TF_FIG, 12), V);
  // 3. town talk replaces the extras for about one in four
  const talk = n.topic && (tfPickS(n, TF_TALK[n.topic], 13) || tfPickS(n, TF_TALK.general, 13));
  if (talk) { lines.push(talk); if ((n.seed + n.k) % 2) lines.push(figLine); }
  else {
    const a = hash(n.seed, n.k + 17) % pool.length; lines.push(pool[a]);
    if ((n.seed + n.k) % 3 !== 2) lines.push(figLine); else if (pool.length > 1) lines.push(pool[(a + 1 + hash(n.k, n.seed) % (pool.length - 1)) % pool.length]);
  }
  return say(lines.map(s => [who, s]), back);
}
// anyone left standing on water, marsh or a wall after the map fixes steps to the nearest open ground (Nov 19)
for (const t of TF) { const x = Math.floor(t.x), y = Math.floor(t.y); if (!solidM(x * CPD, y * CPD)) continue;
  const [mx, my] = freeNearM(x * CPD, y * CPD), dx = mx / CPD - x, dy = my / CPD - y; t.x += dx; t.y += dy; t.hx += dx; t.hy += dy; }
