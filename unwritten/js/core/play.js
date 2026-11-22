"use strict";
// =====================================================================
//  PLAYER, DIALOG AND THE WALK MODE
// =====================================================================
let G = null;   // the saved game
// The kid walks on a grid of CELL-metre steps (one 16 px tile each). G.x, G.y count those cells from the map's corner;
// the town data underneath is in 4 m cells (tAt, bAt), so walking cell (mx, my) sits in data cell (mx / CPD, my / CPD).
function newGame(kid, mature) {
  const [x, y] = outsideDoorM(BLD[TOWN.fig]);
  return { v: 6, x, y, dir: 'down', steps: 0, seen: {}, started: Date.now(), kid: kid || { g: 'girl', name: 'Wren' }, mature: !!mature };
}
// ---------- what blocks a one-metre cell: water and woods by data cell, buildings by their real outline ----------
function inPoly(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j];
  if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function bldgAtM(mx, my) {
  const tx = Math.floor(mx / CPD), ty = Math.floor(my / CPD), cx = (mx + 0.5) / CPD, cy = (my + 0.5) / CPD, seen = new Set();
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const b = bAt(tx + dx, ty + dy);
    if (b && !seen.has(b.id)) { seen.add(b.id); if (b.style && b.style.canopyOnly) continue; if (cx >= b.pxMin && cx <= b.pxMax && cy >= b.pyMin && cy <= b.pyMax && inPoly(b.poly, cx, cy)) return b; } }
  return null;
}
const SOLIDM = new Map();
function solidM(mx, my) {
  const k = my * TW * CPD + mx; let v = SOLIDM.get(k); if (v !== undefined) return v;
  v = mx < 0 || my < 0 || mx >= TW * CPD || my >= TH * CPD || townSolid(Math.floor(mx / CPD), Math.floor(my / CPD)) || !!bldgAtM(mx, my);
  if (!v && CPD >= 2) { const t = treeAt(Math.floor(mx / CPD), Math.floor(my / CPD)); if (t && Math.floor(t.x * CPD) === mx && Math.floor(t.y * CPD) === my) v = true; }   // a tree trunk
  if (SOLIDM.size > 200000) SOLIDM.clear(); SOLIDM.set(k, v); return v;
}
function freeNearM(mx, my) { for (let r = 0; r < 40; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
  if (Math.max(Math.abs(dx), Math.abs(dy)) === r && !solidM(mx + dx, my + dy)) return [mx + dx, my + dy]; return [mx, my]; }
// the door, in metres: the middle of the door cell's run of wall, on the side the building faces
function doorM(b) {
  const f = b.face || 'S', cx = (b.door[0] + 0.5) * CPD, cy = (b.door[1] + 0.5) * CPD;   // in walking cells
  return f === 'S' ? [cx, b.pyMax * CPD] : f === 'N' ? [cx, b.pyMin * CPD] : f === 'E' ? [b.pxMax * CPD, cy] : [b.pxMin * CPD, cy];
}
function outsideDoorM(b) {
  if (!b || !b.door) return freeNearM(TW * CPD / 2, TH * CPD / 2);
  const [dx, dy] = FDIR[b.face] || [0, 1], [x, y] = doorM(b); let mx = Math.floor(x - (dx < 0 ? 1 : 0)), my = Math.floor(y - (dy < 0 ? 1 : 0));
  for (let i = 0; i < 6 && solidM(mx, my); i++) { mx += dx; my += dy; }
  return solidM(mx, my) ? freeNearM(mx, my) : [mx, my];
}
// (Curiosity's fairy sheet stays in assets/fairy for the inward, Jungian places. The town itself is grounded.)
// ---------- smooth tile-to-tile walking ----------
const P = { mx: 0, my: 0, t: 0 };   // move offset in progress
const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
function tryMove(dir) {
  G.dir = dir; const [dx, dy] = DIRS[dir], nx = G.x + dx, ny = G.y + dy;
  if (solidM(nx, ny) || npcAt(nx, ny)) return false;
  G.x = nx; G.y = ny; G.steps++; P.mx = -dx; P.my = -dy; P.t = 1; return true;
}
const WALK_FRAMES = 8, RUN_FRAMES = 4;   // frames per step: 2 px a frame walking, 4 holding B (Christian: "way too slow"); one step is a whole 4 m tile now
function facing() { const [dx, dy] = DIRS[G.dir]; return [G.x + dx, G.y + dy]; }

// ---------- dialog: a queue of lines with an optional speaker, then optional choices ----------
let DLG = null;
function say(lines, then) { DLG = { lines: lines.map(l => typeof l === 'string' ? ['', l] : l), i: 0, ch: 0, then, opts: null, sel: 0 }; }
function ask(prompt, opts) { DLG = { lines: [['', prompt]], i: 0, ch: 999, then: null, opts, sel: 0 }; }
function dlgUpdate() {
  const D = DLG, L = D.lines[D.i]; D.ch += 2;
  if (D.opts && D.i === D.lines.length - 1) {
    if (pressed.up) D.sel = (D.sel + D.opts.length - 1) % D.opts.length;
    if (pressed.down) D.sel = (D.sel + 1) % D.opts.length;
    if (pressed.a) { const o = D.opts[D.sel]; DLG = null; o.f && o.f(); }
    if (pressed.b) { DLG = null; }
    return;
  }
  if (D.survey && pressed.b) { DLG = null; return; }   // B closes the Survey
  if (pressed.a || pressed.b) {
    if (D.ch < L[1].length) { D.ch = 999; return; }
    D.i++; D.ch = 0;
    if (D.i >= D.lines.length) { const t = D.then; DLG = null; t && t(); }
  }
}
const FACE_IMG = {}; for (const [k, src] of [['danny', 'assets/danny/portrait.png']]) { FACE_IMG[k] = new Image(); FACE_IMG[k].src = src; }
function sayFace(face, lines, then) { say(lines, then); DLG.face = face; }
function askFace(face, prompt, opts) { ask(prompt, opts); DLG.face = face; }
function dlgDraw() {
  if (DLG.survey) drawSurvey(DLG.survey, Math.min(DLG.i, DLG.survey.pages.length - 1));
  else if (DLG.photos) drawPhotoCard(DLG.photos[Math.min(DLG.i, DLG.photos.length - 1)], DLG.credit);
  else if (DLG.card) drawFrontCard(DLG.card);
  const D = DLG, [who, s] = D.lines[Math.min(D.i, D.lines.length - 1)];
  const y = SH - 64; win(4, y, SW - 8, 60);
  const fim = D.face && FACE_IMG[D.face], fx = fim ? 58 : 12;   // a portrait at the left of the box, FF6 style (the art as given, scaled)
  if (fim && fim.complete && fim.naturalWidth) { const ph = 52, pw = Math.round(ph * fim.naturalWidth / fim.naturalHeight);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(fim, 9, y + 4, pw, ph); ctx.imageSmoothingEnabled = false; }
  if (who) txt(who, fx, y + 6, '#ffd860');
  wrap(s.slice(0, D.ch), SW - 16 - fx).slice(0, 5).forEach((l, i) => txt(l, fx, y + (who ? 18 : 8) + i * 10, '#fff'));
  if (D.opts && D.i === D.lines.length - 1) {
    ctx.font = SMALL; const ow = Math.min(SW - 8, Math.max(164, 20 + Math.max(...D.opts.map(o => ctx.measureText('▶ ' + o.t).width))));   // as wide as the longest choice
    const h = D.opts.length * 12 + 10, oy = y - h - 4; win(SW - 4 - ow, oy, ow, h);
    D.opts.forEach((o, i) => txt((i === D.sel ? '▶ ' : '  ') + o.t, SW - ow + 4, oy + 6 + i * 12, i === D.sel ? '#ffd860' : '#fff', 'left', SMALL));
  }
}

// ---------- what you find when you face a building ----------
const TYPE_WORD = { house: 'a house', garage: 'a garage', shed: 'a shed', store: 'a storefront', apartments: 'apartments', civic: 'a public building',
  church: 'a church', school: 'a school', hospital: 'a hospital building', factory: 'a plant or warehouse', barn: 'a barn', farmhouse: 'a farmhouse', fig: 'the bookstore' };
// the Fig Tree's door is the cut corner at Fifth and Clermont; at the 4 m walking step it sits half on the sidewalk,
// so the cells touching it count: facing it with A, or walking up into it, goes inside (inside.js)
function doorEnter(x, y) {   // the buildings you can go into, by their door: returns the function that takes you inside
  if (figDoorAt(x, y)) return enterFig;
  if (typeof UMA !== 'undefined' && UMA && UMA.door) { const [dx, dy] = doorM(UMA); if (Math.hypot(x + 0.5 - dx, y + 0.5 - dy) <= 1.01 && y + 0.5 <= dy + 0.01) return enterUma; }
  return null;
}
function figDoorAt(x, y) { const f = BLD[TOWN.fig]; if (!f || !f.door) return false; const [dx, dy] = doorM(f);
  return Math.hypot(x + 0.5 - dx, y + 0.5 - dy) <= 1.01 && y + 0.5 <= dy + 0.01; }
function lookAt(x, y) {   // x, y: the walking cell being faced
  { const go = doorEnter(x, y); if (go && !(x === G.x && y === G.y)) return go(); }
  const npc = npcAt(x, y); if (npc) return npcTalk(npc);
  const cam = camNear((x + 0.5) / CPD, (y + 0.5) / CPD, 1.2) || camNear((G.x + 0.5) / CPD, (G.y + 0.5) / CPD, 1.2);
  if (cam) return say([['', 'A license-plate camera on a pole' + (cam.mf ? ', made by ' + cam.mf : '') + '. It photographs the plates of passing cars.'],
    ['', 'Supporters say cameras like this help find stolen cars and missing people. Critics worry about how long the plate data is kept and who can search it.'],
    ['', 'Some Wisconsin towns have dropped them and others kept them under new rules. Its spot comes from OpenStreetMap.']]);
  const b = bldgAtM(x, y);
  if (b) {
    G.seen[b.id] = 1;
    if (b.landmark) return landmarkLook(b);
    const isDoor = !!(b.door && (([dx, dy]) => (b.face === 'S' || b.face === 'N') ? Math.abs(x + 0.5 - dx) <= 1 : Math.abs(y + 0.5 - dy) <= 1)(doorM(b)));
    if (b.type === 'fig') { if (isDoor) return enterFig(); say([['', 'THE BLESSED FIG TREE · 800 Fifth Avenue.'], ['', 'The bookstore. The door is on the corner.']]); DLG.card = b; surveyOffer(b); return; }
    const head = b.name ? b.name.toUpperCase() : TYPE_WORD[b.type].replace(/^a /, '').replace(/^\w/, c => c.toUpperCase());
    const addr = b.addr ? ' · ' + b.addr.replace(/\b(\w)(\w*)/g, (m, a, r) => a + r.toLowerCase()) : '';
    const lines = [['', head + addr]];
    if (b.type === 'house' || b.type === 'garage' || b.type === 'shed') lines.push(['', isDoor ? "Somebody's home. You don't knock without a reason." : 'A private home. Real people live here.']);
    // owners are named only when they are public bodies or institutions, never people or private companies (Nov 13)
    else if (b.owner && ['gov', 'faith', 'health', 'util'].includes(b.okind)) lines.push(['', 'Owned by ' + titleCase(b.owner) + '.']);
    say(lines);
    if (DLG && !['house', 'garage', 'shed', 'farmhouse', 'barn'].includes(b.type)) DLG.card = b;   // the front view
    surveyOffer(b);
    return;
  }
  const t = tAt(Math.floor(x / CPD), Math.floor(y / CPD));
  if (t === TL.WATER) return say(['Water. Spring Brook runs right through town and widens into Antigo Lake.']);
  if (t === TL.WOODS) return say(['Trees, close together.']);
}
function titleCase(s) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(/\bLlc\b/, 'LLC').replace(/\bInc\b/, 'Inc.'); }

function camFollow() {
  const kx = (G.x + P.mx * P.t + 0.5) / CPD, ky = (G.y + P.my * P.t + 0.5) / CPD;
  camX = Math.max(0, Math.min(TW - SW / T, kx - SW / T / 2)); camY = Math.max(0, Math.min(TH - SH / T, ky - SH / T / 2 - 0.1));
}
MODES.walk = {
  update() {
    npcUpdate();
    camFollow();
    if (DLG) return dlgUpdate();
    if (P.t > 0) { P.t -= 1 / (held.b ? RUN_FRAMES : WALK_FRAMES); if (P.t <= 0) { P.t = 0; P.mx = P.my = 0; } }
    if (P.t === 0) {
      if (pressed.a) { const [fx, fy] = facing(); lookAt(fx, fy); return; }
      if (pressed.map) { setMode('map'); return; }
      if (pressed.menu) { saveGame(); say(['Saved.']); return; }
      const d = dirHeld();
      if (d === 'up' && doorEnter(G.x, G.y - 1)) { G.dir = 'up'; return doorEnter(G.x, G.y - 1)(); }   // walking up into a door you can use goes in
      if (d) tryMove(d);
    }
    camFollow();
  },
  draw() {
    drawTown();
    const px = Math.round(((G.x + P.mx * P.t) / CPD - camX) * T), py = Math.round(((G.y + P.my * P.t) / CPD - camY) * T);
    drawBuildingsWith(top => drawKid(G.kid, px, py, G.dir, P.t > 0, T, top), (G.y + P.my * P.t + 1) / CPD, [px + T / 2 - 20, py + T - 52, 40, 52]);
    drawTownLabels(Math.floor(camX), Math.floor(camY));
    // what you're facing
    const b = bldgAtM(...facing());
    if (b && !DLG) { const n = b.name || (b.addr ? b.addr : ''); if (n) { ctx.font = SMALL; const w = ctx.measureText(n).width + 10; win(4, 4, w, 14); txt(n, 9, 8, '#fff', 'left', SMALL); } }
    txt(typeof IS_TOUCH !== 'undefined' && IS_TOUCH ? 'HOLD B TO RUN' : 'B: RUN  M: MAP  N: SKY  C: SAVE', SW - 4, SH - 10, 'rgba(255,255,255,.5)', 'right', SMALL);
    if (DLG) dlgDraw();
  }
};
// ---------- save ----------
const SAVE_KEY = 'unwritten2_save';
function saveGame() { if (!G) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) {} }
function loadGame() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.v >= 2) { if (!s.kid) { s.kid = { g: 'girl', name: 'Wren' }; s.mature = false; }
      if (s.v < 4) { s.x = s.x * 4 + 2; s.y = s.y * 4 + 2; s.v = 4; }   // v2-3 saves were in 4 m cells
      if (s.v < 5) { s.x = Math.floor(s.x / 2); s.y = Math.floor(s.y / 2); s.v = 5; }   // v4 saves were in metres, v5 in 2 m cells
      if (s.v < 6) { s.x = Math.floor(s.x * 2 / CELL); s.y = Math.floor(s.y * 2 / CELL); s.v = 6; }
      if (solidM(s.x, s.y)) [s.x, s.y] = freeNearM(s.x, s.y); return s; } } catch (e) {} return null; }
