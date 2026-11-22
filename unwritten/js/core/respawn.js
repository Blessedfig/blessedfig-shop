"use strict";
// =====================================================================
//  RESPAWN GAMING LOUNGE, INSIDE (Nov 13). 725 Fifth Ave is 8.1 m wide and 37 m deep (county parcel; its own building
//  since scripts/town/split_respawn.py), so the floor is 8 x 37 tiles at the interiors' 1 m tile.
//  Laid out from Christian's two photos and his notes: wood-paneled walls, dark green patterned carpet with yellow tape
//  marking play areas, a drop ceiling with fluorescent panels (drawn as the light they throw on the floor).
//  Front: the desk (Cecil), a small lounge, a snack machine and a drink machine. One long wall: the PC row, RGB towers on a
//  wire shelf over the desks, black and red gaming chairs. The other side: three offices behind wood-framed doors, from the
//  back: a workout room, a meeting room and a classic gaming lounge with retro games. The back: pool, air hockey, foosball,
//  racing rigs and the golf simulator behind black curtains.
//  Top of the screen = the back of the store, as FF6 rooms are walked into from the bottom; the door on Fifth is the bottom row.
//  The photos are visual reference only: nothing is traced, and none of the people in them are drawn.
// =====================================================================
const RESP_ROWS = [
  'cggggggc',  //  0  golf simulator (the screen is on the back wall above this row)
  'cggggggc',  //  1
  'cggggggc',  //  2
  'cgghhggc',  //  3  the hitting mat
  'cggggggc',  //  4
  'cC....Cc',  //  5  the curtains, drawn back
  'W......W',  //  6  game room
  'rs.QQ.AW',  //  7  racing rigs on the wall; the pool table; air hockey
  'q..QQ.AW',  //  8  cue rack
  'rs.QQ..W',  //  9
  'w.....fW',  // 10  foosball
  'rs....fW',  // 11
  'W......W',  // 12
  'W...WyyW',  // 13  the offices' back wall; the workout room's mirrors
  'Pp..W2.1',  // 14  workout room (closest to the back)
  'Pp..w..W',  // 15
  'Pp..D.3W',  // 16
  'Pp..w..4',  // 17
  'Pp..WnnW',  // 18
  'Pp..WYYW',  // 19  the meeting room's screen
  'Pp..W.kW',  // 20  meeting room
  'Pp..w.Tk',  // 21
  'Pp..D.Tk',  // 22
  'Pp..w.Tk',  // 23
  'Pp..W.kW',  // 24
  'Pp..WZZW',  // 25  shelves of old games and board games
  'Pp..W.vW',  // 26  classic gaming lounge
  'Pp..w..a',  // 27
  'W...D..W',  // 28
  'w...w..a',  // 29
  'W...WSSW',  // 30
  'M...WVVW',  // 31  the snack machine (left, by the door); the offices' front wall, right behind the desk, with a TV
  'W....X.W',  // 32  Cecil, behind the desk
  'N...KKKW',  // 33  the drink machine; the front desk (right, by the door)
  'Lt.....W',  // 34  the small lounge: couch, coffee table, armchair
  'Ltb....W',  // 35
  'WOOeOOOW',  // 36  the front windows and the door on Fifth
];
// . carpet  g golf turf  h hitting mat  e door out  D office doorway  X Cecil  W wood wall  w framed poster  c curtain
// C curtain drawn back  r racing rig screen  s racing seat  q cue rack  Q pool table  A air hockey  f foosball  P PC desk
// p gaming chair  y mirrors  2 squat rack  1 dumbbells  3 bench  n treadmill  Y meeting screen  T table  k office chair
// Z game shelves  v tube TV and consoles  a arcade cabinet  S couch  V console TV  u console stand  B beanbag  G board games
// M snack machine  N drink machine  K front desk  t coffee table  L lounge couch  b armchair  O front window
const RESP_WALK = new Set(['.', 'g', 'h', 'e', 'D']);
const RESP_CECIL = { x: 5, y: 32 };
const RESP_FACE = 'WwcqyYZVrPGMNaDO';             // tiles that stand against (or are) a wall: the paneling shows behind them
const RESP_BLOCK = 'QAfKLtSYVuZyGT';                  // things bigger than one tile: drawn once, from their top-left tile
const RESP_TAPE = '#e3c13a';
const RESP_POSTER_AT = {}; { let n = 0; RESP_ROWS.forEach((r, y) => [...r].forEach((t, x) => { if (t === 'w') RESP_POSTER_AT[x + ',' + y] = n++; })); }   // every poster a different picture
let RX = 0, RY = 0;                                  // the floor's top-left on screen, this frame
function rp(c, x, y, w, h) { F(c, RX + x, RY + y, w, h); }   // a filled rect in floor pixels (24 to a tile)
function respT(x, y) { const r = RESP_ROWS[y]; return r && x >= 0 && x < 8 ? r[x] : ' '; }
function respFaced(x, y) { const t = respT(x, y); return RESP_FACE.includes(t) || ((x === 0 || x === 7) && t !== ' ' && !'.Lnt'.includes(t)); }
function rhsl(h, l, a) { return 'hsla(' + (((h % 360) + 360) % 360) + ',92%,' + (l || 60) + '%,' + (a == null ? 1 : a) + ')'; }

// ---------- floors ----------
function respFloor(t, x, y) {
  const X = x * 24, Y = y * 24, h = hash(x * 13 + 7, y * 29 + 3);
  if (t === 'g' || t === 'h' || t === 'c' || t === 'C') {   // the golf bay's teal turf
    rp('#258a83', X, Y, 24, 24); rp('#1f746e', X, Y + 23, 24, 1);
    for (let i = 0; i < 6; i++) { const q = hash(h + i, i * 3 + 1); rp(i % 2 ? '#2f9c94' : '#20786f', X + q % 23, Y + (q >> 5) % 23, 1, 1); }
    if (t === 'h') {   // the green hitting mat, with a ball on a tee in the middle of it
      const L = respT(x - 1, y) !== 'h', Rr = respT(x + 1, y) !== 'h';
      rp('#2f6a2c', X + (L ? 2 : 0), Y + 3, 24 - (L ? 2 : 0) - (Rr ? 2 : 0), 18); rp('#3fa040', X + (L ? 3 : 0), Y + 4, 24 - (L ? 3 : 0) - (Rr ? 3 : 0), 16);
      for (let i = (L ? 4 : 1); i < (Rr ? 21 : 24); i += 3) rp('#36923a', X + i, Y + 4, 1, 16);
      if (!Rr) { rp('#d8b860', X + 23, Y + 13, 2, 2); rp('#f6f6f2', X + 23, Y + 11, 2, 2); }
    }
    return;
  }
  if (x >= 5 && y >= 14 && y <= 18) {   // the workout room: black rubber mats
    rp('#26262c', X, Y, 24, 24); rp('#1b1b20', X, Y + 23, 24, 1); rp('#1b1b20', X + 23, Y, 1, 24);
    if (h % 2) rp('#33333b', X + h % 21 + 1, Y + (h >> 4) % 21 + 1, 2, 1);
    return;
  }
  // the dark green patterned carpet: a little lattice of crosses and dots, with the odd fleck
  rp('#22473a', X, Y, 24, 24);
  rp('#2e5c4a', X + 5, Y + 4, 1, 3); rp('#2e5c4a', X + 4, Y + 5, 3, 1); rp('#2e5c4a', X + 17, Y + 16, 1, 3); rp('#2e5c4a', X + 16, Y + 17, 3, 1);
  rp('#183629', X + 17, Y + 5, 1, 1); rp('#183629', X + 5, Y + 17, 1, 1);
  if (h % 3 === 0) rp('#3b6e57', X + (h >> 3) % 22 + 1, Y + (h >> 7) % 22 + 1, 1, 1);
  if (h % 11 === 0) rp('#7a6a34', X + (h >> 5) % 22 + 1, Y + (h >> 9) % 22 + 1, 1, 1);
  if (t === 'e') { rp('#1e1e24', X + 3, Y + 2, 18, 12); rp('#3e6a2c', X + 3, Y + 2, 18, 1); rp('#3e6a2c', X + 3, Y + 13, 18, 1); }   // the mat at the door
}

// ---------- walls ----------
function respPanel(X, y0, h) {   // wood paneling, grooves every 6 px
  rp('#7a4626', X, y0, 24, h);
  for (let i = 2; i < 24; i += 6) { rp('#5c3219', X + i, y0, 1, h); rp('#8f5a34', X + i + 1, y0, 1, h); }
}
function respCurtain(x, y, w, h) { rp('#141419', x, y, w, h); for (let i = 1; i < w; i += 4) { rp('#24242c', x + i, y, 2, h); rp('#0a0a0d', x + i + 2, y, 1, h); } }
function respWall(x, y) {   // the face of a wall tile: from 9 px above the tile to its foot; a run of them reads as one wall
  const X = x * 24, Y = y * 24, top = !respFaced(x, y - 1), foot = !respFaced(x, y + 1), cur = respT(x, y) === 'c';
  if (cur) { respCurtain(X, Y - 9, 24, foot ? 33 : 24); if (foot) rp('#22222a', X, Y + 21, 24, 3); return; }
  respPanel(X, Y - 9, foot ? 33 : 24);
  if (top) { rp('#4a2914', X, Y - 9, 24, 2); rp('#a06c44', X, Y - 7, 24, 1); }   // the top of the wall and its trim
  if (foot) { rp('#3a2010', X, Y + 19, 24, 4); rp('#1c1210', X, Y + 23, 24, 1); }   // baseboard
}
const RESP_POSTERS = [
  (X, Y) => { rp('#141a3a', X, Y, 14, 16); rp('#e8e8f0', X + 2, Y + 2, 1, 1); rp('#e8e8f0', X + 11, Y + 5, 1, 1); rp('#e8e8f0', X + 6, Y + 1, 1, 1);   // a rocket and a planet
    rp('#d8703a', X + 1, Y + 10, 6, 5); rp('#d8703a', X + 2, Y + 9, 4, 7); rp('#f0a060', X + 2, Y + 10, 2, 2);
    rp('#e8e8f0', X + 9, Y + 4, 2, 7); rp('#c83030', X + 8, Y + 9, 1, 2); rp('#c83030', X + 11, Y + 9, 1, 2); rp('#f0b030', X + 9, Y + 11, 2, 2); },
  (X, Y) => { rp('#3a1a2a', X, Y, 14, 16); rp('#d0d4dc', X + 6, Y + 1, 2, 9); rp('#c8a040', X + 3, Y + 10, 8, 1); rp('#5a3418', X + 6, Y + 11, 2, 3); rp('#c8a040', X + 6, Y + 14, 2, 1); },   // a sword
  (X, Y) => { rp('#f0c040', X, Y, 14, 16); rp('#2a2a30', X + 2, Y + 6, 10, 5); rp('#2a2a30', X + 1, Y + 7, 12, 4);   // a controller
    rp('#8a8a96', X + 3, Y + 8, 3, 1); rp('#8a8a96', X + 4, Y + 7, 1, 3); rp('#d83030', X + 9, Y + 7, 1, 1); rp('#3060d8', X + 10, Y + 8, 1, 1); },
  (X, Y) => { rp('#1a1a26', X, Y, 14, 16); rp('#e03a4a', X + 3, Y + 4, 3, 3); rp('#e03a4a', X + 8, Y + 4, 3, 3); rp('#e03a4a', X + 3, Y + 6, 8, 3); rp('#e03a4a', X + 5, Y + 9, 4, 2); rp('#e03a4a', X + 6, Y + 11, 2, 1);   // a heart
    for (let i = 0; i < 3; i++) rp('#e03a4a', X + 3 + i * 3, Y + 13, 2, 2); },
  (X, Y) => { rp('#6ab0e8', X, Y, 14, 9); rp('#5a6a8a', X + 2, Y + 5, 5, 4); rp('#5a6a8a', X + 7, Y + 3, 6, 6); rp('#e8eef4', X + 9, Y + 3, 2, 1);   // mountains, hills, a castle
    rp('#3a8a3a', X, Y + 9, 14, 7); rp('#c8c8d0', X + 4, Y + 8, 4, 4); rp('#c83030', X + 4, Y + 7, 4, 1); },
  (X, Y) => { rp('#24243a', X, Y, 14, 16); for (const gx of [2, 8]) { rp('#40e0a0', X + gx, Y + 5, 4, 1); rp('#40e0a0', X + gx, Y + 5, 1, 6); rp('#40e0a0', X + gx, Y + 10, 4, 1); rp('#40e0a0', X + gx + 3, Y + 8, 1, 3); rp('#40e0a0', X + gx + 2, Y + 8, 1, 1); } },   // GG
];

// ---------- small screens ----------
function respScreen(k, X, Y, w, h, seed) {   // a game on a monitor, one of a few kinds
  const f = frame + seed * 37;
  switch (k % 6) {
    case 0: rp('#1a1e2a', X, Y, w, h); rp('#3a3a46', X, Y + h - 2, w, 2); rp('#2a2e3e', X, Y, 2, h); rp('#2a2e3e', X + w - 2, Y, 2, h);   // a corridor shooter
      rp('#f0f0f0', X + (w >> 1), Y + (h >> 1) - 1, 1, 3); rp('#f0f0f0', X + (w >> 1) - 1, Y + (h >> 1), 3, 1); rp('#d83030', X + 1, Y + h - 1, 3, 1); break;
    case 1: rp('#06060c', X, Y, w, h); for (let i = 0; i < 4; i++) { const q = hash(i + seed, 5); rp('#e8e8f0', X + (q + (f >> 2)) % w, Y + q % h, 1, 1); }   // space
      rp('#40e0f0', X + 1, Y + (h >> 1), 3, 2); rp('#e04060', X + w - 3, Y + 1 + (f >> 4) % (h - 2), 2, 2); break;
    case 2: rp('#6ab0f0', X, Y, w, h); rp('#3a9a40', X, Y + (h >> 1), w, h - (h >> 1)); rp('#6a6a72', X + (w >> 1) - 1, Y + (h >> 1), 3, h - (h >> 1));   // a race
      rp('#6a6a72', X + (w >> 1) - 3, Y + h - 2, 7, 2); rp('#e03030', X + (w >> 1) - 1 + ((f >> 5) % 2), Y + h - 3, 3, 2); break;
    case 3: rp('#8ac8f8', X, Y, w, h); rp('#4aa848', X, Y + h - 3, w, 3); rp('#c8c8d0', X + w - 5, Y + h - 6, 3, 3); rp('#c83030', X + w - 5, Y + h - 7, 3, 1); rp('#2a4ac8', X + 2, Y + h - 5, 1, 2); break;   // a quest
    case 4: rp('#14141c', X, Y, w, h); { const C = ['#e04040', '#40c060', '#4080e0', '#e0c040']; for (let i = 0; i < w; i += 2) rp(C[(i + seed) % 4], X + i, Y + h - 2 - (hash(i, seed) % 3), 2, 2 + (hash(i, seed) % 3)); }   // falling blocks
      rp('#c060e0', X + 2 + (f >> 4) % (w - 4), Y + 1 + (f >> 3) % 3, 2, 2); break;
    default: rp('#3a7a3a', X, Y, w, h); rp('#3a6ad0', X + 3, Y, 2, h); rp('#e04040', X + 1, Y + 2, 1, 1); rp('#e04040', X + w - 3, Y + h - 3, 1, 1); rp('#40a0f0', X + w - 2, Y + 1, 1, 1); rp('#f0e040', X + 6, Y + h - 2, 1, 1);   // a strategy map
  }
}
function respSlide(X, Y, w, h) {   // a tournament bracket on the meeting room screen
  rp('#eef2f6', X, Y, w, h); rp('#c02828', X, Y, w, 3);
  for (let i = 0; i < 4; i++) { rp('#3a4a6a', X + 3, Y + 5 + i * 3, 8, 1); }
  rp('#3a4a6a', X + 11, Y + 5, 1, 4); rp('#3a4a6a', X + 11, Y + 11, 1, 4); rp('#3a4a6a', X + 12, Y + 7, 6, 1); rp('#3a4a6a', X + 12, Y + 13, 6, 1);
  rp('#3a4a6a', X + 18, Y + 7, 1, 7); rp('#3a4a6a', X + 19, Y + 10, 6, 1); rp('#e0b030', X + 25, Y + 9, 6, 3);
  for (let i = 0; i < 3; i++) rp('#9aa4b0', X + 33, Y + 5 + i * 4, 6 - i, 1);
}

// ---------- things in the room ----------
function respProp(t, x, y, w, h) {
  const X = x * 24, Y = y * 24, hu = frame * 3 + y * 37 + x * 90;
  switch (t) {
    case 'W': case 'c': break;
    case 'D':   // a wood-framed office door, standing open
      rp('#1e1712', X + 5, Y - 6, 14, 21); rp('#2a2018', X + 5, Y - 6, 14, 2);
      rp('#c99a62', X + 3, Y - 9, 18, 3); rp('#c99a62', X + 3, Y - 9, 2, 24); rp('#c99a62', X + 19, Y - 9, 2, 24); rp('#e0b880', X + 3, Y - 9, 18, 1);
      rp('#8a5a32', X + 15, Y - 6, 4, 21); rp('#6e4626', X + 15, Y - 6, 1, 21); rp('#e8c060', X + 16, Y + 4, 1, 2); break;
    case 'e':   // the front door: its frame, and the threshold
      rp('#2a1a10', X, Y, 3, 24); rp('#2a1a10', X + 21, Y, 3, 24); rp('#3a2414', X, Y, 24, 2); rp('#4a4a52', X + 3, Y + 21, 18, 3); rp('#6a6a72', X + 3, Y + 21, 18, 1); break;
    case 'w': { const fx = X + 5, fy = Y - 6; rp('#16161a', fx - 1, fy - 1, 16, 18); RESP_POSTERS[(RESP_POSTER_AT[x + ',' + y] || 0) % RESP_POSTERS.length](fx, fy); rp('rgba(255,255,255,.08)', fx + 1, fy, 2, 16); break; }
    case 'q': rp('#5a3418', X + 3, Y - 5, 18, 2); rp('#5a3418', X + 3, Y + 10, 18, 2);   // the cue rack
      for (let i = 0; i < 5; i++) { rp('#d8b070', X + 5 + i * 3, Y - 7, 1, 21); rp('#26262c', X + 5 + i * 3, Y - 8, 1, 2); rp('#3a2010', X + 5 + i * 3, Y + 11, 1, 3); }
      rp('#3a6ad0', X + 18, Y + 8, 2, 2); break;
    case 'C': { const L = x < 4, bx = L ? X : X + 14;   // the curtain drawn back to the wall
      respCurtain(bx, Y - 32, 10, 54); rp('#3a3a44', bx, Y - 4, 10, 2); rp('rgba(0,0,0,.25)', bx, Y + 21, 10, 2); break; }
    case 'r': rp('#0c0c10', X + 2, Y - 7, 20, 14); respScreen(2, X + 3, Y - 6, 18, 12, x + y); rp('#2a2a30', X + 11, Y + 7, 2, 6); rp('#1a1a1e', X + 6, Y + 12, 12, 2); break;   // a racing rig's screen
    case 's': rp('rgba(0,0,0,.25)', X + 1, Y + 19, 22, 3); rp('#1a1a1e', X - 4, Y + 16, 28, 3);   // the rig: rails, pedals, wheel and seat
      rp('#3a3a42', X + 1, Y + 13, 4, 3); rp('#2a2a30', X + 5, Y + 6, 2, 10); rp('#16161a', X + 3, Y + 0, 4, 10); rp('#c02828', X + 4, Y + 0, 2, 1);
      rp('#141418', X + 9, Y + 9, 12, 6); rp('#141418', X + 16, Y - 6, 6, 18); rp('#c02828', X + 16, Y - 4, 1, 15); rp('#c02828', X + 21, Y - 4, 1, 15); rp('#26262c', X + 18, Y - 3, 2, 2); break;
    case 'Q': { const x0 = X, y0 = Y - 8, x1 = X + 48, y1 = Y + 64;   // the pool table
      rp('rgba(0,0,0,.25)', X + 2, Y + 66, 44, 5);
      rp('#2e160a', x0 + 3, y1, 5, 7); rp('#2e160a', x1 - 8, y1, 5, 7); rp('#4a2410', x0 + 1, y1 - 2, 46, 5); rp('#3a1c0c', x0 + 1, y1 + 2, 46, 1);
      rp('#6a3618', x0, y0, 48, 70); rp('#86502a', x0 + 1, y0 + 1, 46, 1);
      rp('#1e7a4b', x0 + 5, y0 + 5, 38, 60); rp('#1a6b42', x0 + 5, y0 + 5, 38, 2); rp('#1a6b42', x0 + 5, y0 + 5, 2, 60);
      for (const [px, py] of [[x0 + 2, y0 + 2], [x1 - 6, y0 + 2], [x0 + 2, y0 + 33], [x1 - 6, y0 + 33], [x0 + 2, y0 + 64], [x1 - 6, y0 + 64]]) rp('#0a0a0c', px, py, 4, 4);
      for (let i = 1; i < 4; i++) { rp('#e8dcc0', x0 + i * 12, y0 + 2, 1, 1); rp('#e8dcc0', x0 + i * 12, y0 + 67, 1, 1); }
      for (let i = 1; i < 9; i++) if (i !== 4 && i !== 5) { rp('#e8dcc0', x0 + 2, y0 + i * 8, 1, 1); rp('#e8dcc0', x1 - 3, y0 + i * 8, 1, 1); }
      rp('rgba(255,255,255,.16)', x0 + 6, y0 + 50, 36, 1);
      const BC = ['#e8c838', '#2a4ac8', '#d02828', '#6a2a9a', '#e07020', '#1a8a3a', '#7a1a2a', '#101010', '#e8c838', '#2a4ac8', '#d02828', '#6a2a9a', '#e07020', '#1a8a3a', '#7a1a2a'];
      let k = 0; for (let r = 4; r >= 0; r--) for (let i = 0; i <= r; i++) rp(BC[k++], x0 + 23 - r * 2 + i * 4 - 1, y0 + 22 - r * 3, 3, 3);
      rp('#f4f4f0', x0 + 23, y0 + 52, 3, 3);
      rp('#d8b070', x0 + 9, y0 + 30, 1, 30); rp('#3a2010', x0 + 9, y0 + 54, 1, 6); rp('#e8e8e8', x0 + 9, y0 + 29, 1, 1);   // a cue left on the table
      break; }
    case 'A': { const x0 = X + 2, y0 = Y - 8, w0 = 20, h0 = 46;   // air hockey
      rp('rgba(0,0,0,.25)', x0, Y + 42, w0, 4); rp('#16161c', x0, y0 + h0, w0, 7); rp('#2a50b0', x0 + 1, y0 + h0 + 2, w0 - 2, 1); rp('#0e0e12', x0 + 1, y0 + h0 + 6, 3, 2); rp('#0e0e12', x0 + w0 - 4, y0 + h0 + 6, 3, 2);
      rp('#2a50b0', x0, y0, w0, h0); rp('#e6edf2', x0 + 2, y0 + 2, w0 - 4, h0 - 4);
      for (let j = 4; j < h0 - 3; j += 3) for (let i = 4; i < w0 - 3; i += 3) rp('#cdd6de', x0 + i, y0 + j, 1, 1);
      rp('#d03030', x0 + 2, y0 + (h0 >> 1), w0 - 4, 1); rp('#0e0e12', x0 + 6, y0, 8, 2); rp('#0e0e12', x0 + 6, y0 + h0 - 2, 8, 2);
      const pt = frame % 96, py = y0 + 9 + Math.round((pt < 48 ? pt : 96 - pt) / 48 * 26);
      rp('#c02828', x0 + 8, y0 + 5, 4, 3); rp('#2a4ac8', x0 + 8, y0 + h0 - 8, 4, 3); rp('#101010', x0 + 9, py, 3, 2); break; }
    case 'f': { const x0 = X + 2, y0 = Y - 8, w0 = 20, h0 = 46;   // foosball
      rp('rgba(0,0,0,.25)', x0, Y + 42, w0, 4); rp('#4a2a12', x0, y0 + h0, w0, 6); rp('#2a1608', x0 + 1, y0 + h0 + 5, 3, 3); rp('#2a1608', x0 + w0 - 4, y0 + h0 + 5, 3, 3);
      rp('#6a3e1c', x0, y0, w0, h0); rp('#2e8a40', x0 + 3, y0 + 4, w0 - 6, h0 - 8); rp('#e8e8e8', x0 + 3, y0 + (h0 >> 1), w0 - 6, 1);
      rp('#101010', x0 + 7, y0 + 2, 6, 2); rp('#101010', x0 + 7, y0 + h0 - 4, 6, 2);
      for (let i = 0; i < 8; i++) { const ry = y0 + 6 + i * 5, c = [0, 1, 3, 5].includes(i) ? '#c82a2a' : '#2a4ac8';
        rp('#c8ccd4', x0 - 3, ry, w0 + 6, 1); rp('#1a1a1a', i % 2 ? x0 + w0 + 2 : x0 - 5, ry - 1, 3, 3);
        for (let p = 0; p < (i % 3) + 1; p++) rp(c, x0 + 5 + p * 4 + (i % 2) * 2, ry - 1, 2, 3); }
      break; }
    case 'P': {   // a PC: the tower on a wire shelf, the monitor, keyboard and mouse on the long desk
      rp('#a2a6ae', X + 1, Y - 2, 22, 1); rp('#7a7e86', X + 3, Y - 1, 1, 2); rp('#7a7e86', X + 20, Y - 1, 1, 2);
      rp('#141418', X + 12, Y - 9, 9, 7); rp('#2a2a32', X + 12, Y - 9, 9, 1);
      rp(rhsl(hu, 60), X + 13, Y - 7, 3, 3); rp('#141418', X + 14, Y - 6, 1, 1); rp(rhsl(hu + 120, 60), X + 17, Y - 7, 3, 3); rp('#141418', X + 18, Y - 6, 1, 1); rp(rhsl(hu + 240, 62), X + 20, Y - 8, 1, 5);
      rp('#0c0c10', X + 2, Y - 1, 13, 9); respScreen(y, X + 3, Y, 11, 7, y); rp('#2a2a30', X + 8, Y + 8, 2, 1);
      rp('#1d1d23', X, Y + 9, 24, 4); rp('#34343c', X, Y + 9, 24, 1);
      rp('#2c2c34', X + 3, Y + 10, 10, 2); rp(rhsl(hu, 60, 0.6), X + 3, Y + 12, 10, 1); rp('#2c2c34', X + 15, Y + 10, 2, 2); rp(rhsl(hu + 60, 60), X + 15, Y + 10, 1, 1);
      rp('#0e0e12', X, Y + 13, 24, 2);
      if (respT(x, y + 1) !== 'P') { rp('#16161a', X, Y + 15, 24, 5); rp('#0e0e12', X + 2, Y + 15, 2, 8); rp('#0e0e12', X + 20, Y + 15, 2, 8); }
      break; }
    case 'p':   // a black and red gaming chair, facing the desk
      rp('rgba(0,0,0,.25)', X + 4, Y + 19, 16, 3); rp('#2a2a30', X + 5, Y + 18, 14, 2); rp('#0e0e12', X + 4, Y + 19, 2, 2); rp('#0e0e12', X + 18, Y + 19, 2, 2); rp('#0e0e12', X + 11, Y + 20, 2, 2);
      rp('#4a4a52', X + 11, Y + 13, 2, 5); rp('#16161a', X + 4, Y + 8, 12, 6); rp('#c02828', X + 4, Y + 8, 12, 1); rp('#2a2a30', X + 5, Y + 5, 9, 2);
      rp('#16161a', X + 14, Y - 9, 7, 22); rp('#c02828', X + 14, Y - 7, 1, 18); rp('#c02828', X + 20, Y - 7, 1, 18); rp('#c02828', X + 16, Y - 1, 3, 6); rp('#26262c', X + 16, Y - 6, 3, 2); break;
    case 'y': for (let i = 0; i < w; i++) { const mx = X + i * 24; rp('#b8bcc4', mx + 2, Y - 5, 20, 19); rp('#a9c6d6', mx + 3, Y - 4, 18, 17); rp('#dcecf4', mx + 6, Y - 3, 1, 8); rp('#dcecf4', mx + 8, Y - 3, 1, 4); } break;   // mirrors
    case '2': case '1': case '4': drawFigTile(t, RX + X, RY + Y, x, y, false, false, 'none'); break;   // the weight room's own rack, dumbbells and kettlebells
    case '3': rp('rgba(0,0,0,.25)', X + 3, Y + 18, 18, 3); rp('#8a8c94', X + 5, Y + 11, 2, 8); rp('#8a8c94', X + 17, Y + 11, 2, 8); rp('#6a6c74', X + 4, Y + 18, 16, 1);   // a flat bench, red pad
      rp('#a83232', X + 3, Y + 6, 18, 6); rp('#c84444', X + 3, Y + 6, 18, 1); rp('#7a2222', X + 3, Y + 11, 18, 1); break;
    case 'n': rp('#3a3c42', X + 4, Y - 2, 16, 24); rp('#1a1a1e', X + 6, Y + 2, 12, 19); rp('#26262c', X + 6, Y + 2 + (frame >> 2) % 4, 12, 1);   // a treadmill, facing the mirrors
      rp('#7a7c84', X + 4, Y - 10, 2, 10); rp('#7a7c84', X + 18, Y - 10, 2, 10); rp('#2a2c32', X + 4, Y - 13, 16, 4); rp('#40e070', X + 9, Y - 12, 6, 2); break;
    case 'Y': rp('#0c0c10', X + 3, Y - 5, 42, 19); respSlide(X + 4, Y - 4, 40, 17); rp('#16161a', X + 13, Y + 15, 22, 2); break;   // the meeting room's screen
    case 'T': { const x0 = X + 3, y0 = Y - 6, w0 = 18, h0 = h * 24 - 2;   // the meeting table: long, wood, a laptop and notepads on it
      rp('rgba(0,0,0,.25)', X + 3, Y + h * 24 - 5, 18, 4); rp('#3a2414', x0 + 1, y0 + h0, 3, 6); rp('#3a2414', x0 + w0 - 4, y0 + h0, 3, 6);
      rp('#5a3a20', x0, y0 + h0 - 3, w0, 4); rp('#7a5230', x0, y0, w0, h0 - 3); rp('#8e6440', x0, y0, w0, 1); rp('#8e6440', x0, y0, 1, h0 - 3);
      rp('#3a3a44', x0 + 5, y0 + 6, 9, 3); rp('#a8acb4', x0 + 5, y0 + 9, 9, 5); rp('#c8ccd4', x0 + 6, y0 + 10, 7, 1);
      rp('#f0ecd8', x0 + 3, y0 + 28, 5, 7); rp('#9aa4b0', x0 + 4, y0 + 30, 3, 1); rp('#9aa4b0', x0 + 4, y0 + 32, 3, 1); rp('#e8e8ec', x0 + 12, y0 + 33, 3, 3);
      rp('#f0ecd8', x0 + 9, y0 + 50, 5, 7); rp('#e8e8ec', x0 + 3, y0 + 54, 3, 3); break; }
    case 'k': { const tx = respT(x, y + 1) === 'T' ? 'd' : respT(x, y - 1) === 'T' ? 'u' : respT(x + 1, y) === 'T' ? 'r' : 'l';   // an office chair, turned to the table
      rp('rgba(0,0,0,.25)', X + 5, Y + 19, 14, 3); rp('#3a3a42', X + 6, Y + 18, 12, 2); rp('#0e0e12', X + 5, Y + 19, 2, 2); rp('#0e0e12', X + 17, Y + 19, 2, 2); rp('#4a4a52', X + 11, Y + 13, 2, 5);
      if (tx === 'd') { rp('#22222a', X + 7, Y - 3, 10, 11); rp('#2e2e36', X + 9, Y - 2, 1, 9); rp('#2e2e36', X + 14, Y - 2, 1, 9); rp('#2a2a30', X + 6, Y + 8, 12, 5); }
      else if (tx === 'u') { rp('#2a2a30', X + 6, Y + 6, 12, 5); rp('#22222a', X + 7, Y - 1, 10, 13); rp('#2e2e36', X + 8, Y, 8, 1); }
      else if (tx === 'r') { rp('#2a2a30', X + 7, Y + 8, 12, 5); rp('#22222a', X + 4, Y - 4, 5, 16); rp('#2e2e36', X + 7, Y - 3, 1, 14); }
      else { rp('#2a2a30', X + 5, Y + 8, 12, 5); rp('#22222a', X + 15, Y - 4, 5, 16); rp('#2e2e36', X + 16, Y - 3, 1, 14); }
      break; }
    case 'Z': rp('#5a3418', X + 2, Y - 6, 44, 23); rp('#3a2214', X + 4, Y - 4, 40, 19);   // shelves of old games
      for (const sy of [Y - 1, Y + 7, Y + 15]) rp('#7a4a26', X + 3, sy, 42, 2);
      { const C = ['#c83a3a', '#3a6ad0', '#e0c040', '#40a050', '#8a3ac8', '#e07a30', '#e8e8ec', '#2a2a2e'];
        for (let i = 0; i < 19; i++) rp(C[hash(i, 3) % 8], X + 5 + i * 2, Y - 4 + (hash(i, 9) % 2), 2, 3 - (hash(i, 9) % 2));
        for (let i = 0; i < 9; i++) { rp(i % 3 ? '#8a8a92' : '#2e2e34', X + 5 + i * 4, Y + 2, 3, 5); rp(C[hash(i, 7) % 8], X + 6 + i * 4, Y + 3, 1, 2); }
        for (let i = 0; i < 5; i++) { rp('#5a5a64', X + 6 + i * 8, Y + 11, 6, 4); rp(C[(i + 2) % 8], X + 7 + i * 8, Y + 12, 2, 1); } }
      break;
    case 'v': rp('rgba(0,0,0,.25)', X + 1, Y + 21, 22, 3);   // the tube TV on a stand, consoles on the shelves, cords to the couch
      rp('#5a3820', X + 1, Y + 6, 22, 15); rp('#7a4c2a', X + 1, Y + 6, 22, 2); rp('#3a2414', X + 2, Y + 13, 20, 1); rp('#2a1a0e', X + 2, Y + 20, 3, 3); rp('#2a1a0e', X + 19, Y + 20, 3, 3);
      rp('#9a9aa2', X + 3, Y + 9, 8, 4); rp('#5a5a62', X + 3, Y + 11, 8, 1); rp('#c83030', X + 4, Y + 10, 1, 1);
      rp('#3a3a46', X + 13, Y + 9, 8, 4); rp('#7a5ac8', X + 14, Y + 10, 2, 1); rp('#c8c8cc', X + 4, Y + 15, 7, 4); rp('#2a2a30', X + 5, Y + 16, 5, 1); rp('#1a1a22', X + 13, Y + 15, 8, 4); rp('#e8c040', X + 14, Y + 16, 1, 1);
      rp('#2e2e34', X + 2, Y - 10, 20, 17); rp('#3c3c44', X + 2, Y - 10, 20, 1); rp('#141418', X + 3, Y - 8, 14, 12);
      rp('#5a8ae8', X + 4, Y - 7, 12, 10); rp('#e8f0f8', X + 6, Y - 6, 3, 1); rp('#3aa040', X + 4, Y + 1, 12, 2); rp('#8a5a30', X + 4, Y + 2, 12, 1);
      rp('#c87a3a', X + 9, Y - 3, 4, 2); rp('#40c040', X + 6 + (frame >> 4) % 3, Y - 2, 2, 3); rp('#8a40c0', X + 13, Y - 1, 2, 2);
      for (let r = 0; r < 10; r += 2) rp('rgba(0,0,0,.18)', X + 4, Y - 7 + r, 12, 1);
      rp('#6a6a72', X + 18, Y - 7, 2, 2); rp('#6a6a72', X + 18, Y - 3, 2, 2); rp('#e03030', X + 18, Y + 1, 1, 1);
      rp('#16161a', X + 6, Y + 21, 1, 3); rp('#16161a', X + 16, Y + 21, 1, 3); break;
    case 'a': rp('rgba(0,0,0,.3)', X + 2, Y + 21, 20, 3);   // an upright arcade cabinet
      rp('#24183a', X + 2, Y - 22, 20, 45); rp('#e040c0', X + 2, Y - 22, 1, 45); rp('#e040c0', X + 21, Y - 22, 1, 45);
      rp(frame % 90 < 84 ? '#f0d040' : '#c8a830', X + 4, Y - 20, 16, 5); rp('#fff2a0', X + 4, Y - 20, 16, 1);
      rp('#0a0a0e', X + 4, Y - 14, 16, 13); respScreen(1, X + 5, Y - 13, 14, 11, 9);
      rp('#16161e', X + 3, Y - 1, 18, 5); rp('#2e2e3a', X + 3, Y - 1, 18, 1); rp('#3a3a42', X + 6, Y, 2, 2); rp('#e03030', X + 6, Y - 2, 2, 2);
      rp('#f0d040', X + 11, Y + 1, 2, 2); rp('#40a0f0', X + 14, Y + 1, 2, 2); rp('#40d060', X + 17, Y + 1, 2, 2);
      rp('#3a3a46', X + 8, Y + 8, 8, 9); rp('#e08a30', X + 10, Y + 10, 1, 3); rp('#e08a30', X + 13, Y + 10, 1, 3); rp('#0e0e14', X + 2, Y + 19, 20, 4); break;
    case 'S': rp('rgba(0,0,0,.25)', X + 1, Y + 20, 46, 3);   // a couch facing the old TV: its back to you
      rp('#5a1c1c', X + 1, Y + 14, 46, 6); rp('#7a2626', X + 1, Y - 4, 46, 19); rp('#8e3232', X + 1, Y - 4, 46, 2);
      rp('#6a2020', X + 1, Y - 4, 5, 22); rp('#6a2020', X + 42, Y - 4, 5, 22); rp('#6a2020', X + 23, Y - 2, 1, 16); rp('#2a1a12', X + 3, Y + 20, 3, 2); rp('#2a1a12', X + 42, Y + 20, 3, 2); break;
    case 'V': {   // the console TV: four players, split screen
      rp('#0c0c10', X + 2, Y - 5, 44, 21); const C = [['#6ab0f0', '#e03030'], ['#f0a060', '#2a4ac8'], ['#9ad0f0', '#30a040'], ['#c8a0e0', '#e0c030']];
      for (let q = 0; q < 4; q++) { const qx = X + 3 + (q % 2) * 21, qy = Y - 4 + (q >> 1) * 10;
        rp(C[q][0], qx, qy, 20, 9); rp('#4a9a40', qx, qy + 5, 20, 4); rp('#6a6a72', qx + 8, qy + 5, 4, 4); rp(C[q][1], qx + 9 + ((frame >> 4) + q) % 2, qy + 6, 3, 2); }
      rp('#0c0c10', X + 23, Y - 4, 1, 19); rp('#0c0c10', X + 3, Y + 5, 41, 1); break; }
    case 'u': rp('rgba(0,0,0,.25)', X + 1, Y + 17, 46, 3); rp('#1a1a20', X + 1, Y + 3, 46, 14); rp('#2a2a32', X + 1, Y + 3, 46, 2); rp('#0e0e12', X + 23, Y + 6, 1, 10);   // the console stand
      rp('#e8e8ec', X + 6, Y - 6, 5, 9); rp('#c8c8cc', X + 10, Y - 6, 1, 9); rp('#121216', X + 15, Y - 1, 14, 4); rp('#40a0ff', X + 17, Y, 6, 1);
      rp('#5a5a64', X + 33, Y - 3, 10, 6); rp('#d83030', X + 33, Y - 2, 1, 4); rp('#3060d8', X + 42, Y - 2, 1, 4);
      rp('#2a2a30', X + 18, Y - 3, 4, 2); rp('#2a2a30', X + 24, Y - 3, 4, 2); break;
    case 'B': { const c = x === 5 ? '#c83a3a' : '#3a5ac8';   // a beanbag
      rp('rgba(0,0,0,.25)', X + 3, Y + 19, 18, 3); rp(c, X + 4, Y + 5, 16, 15); rp(c, X + 2, Y + 9, 20, 9);
      rp(shade(c, 0.25), X + 6, Y + 6, 6, 3); rp(shade(c, -0.18), X + 8, Y + 10, 8, 4); rp(shade(c, -0.32), X + 3, Y + 17, 18, 2); break; }
    case 'G': rp('#5a3418', X + 2, Y - 8, 20, 52); rp('#3a2214', X + 4, Y - 6, 16, 48);   // board games on a shelf, stacked flat
      for (let s = 0; s < 4; s++) { const sy = Y - 6 + s * 12; rp('#7a4a26', X + 3, sy + 10, 18, 2);
        for (let b = 0; b < 3; b++) { const q = hash(s * 5 + b, 41); rp(['#c83a3a', '#3a6ad0', '#e0c040', '#40a050', '#e8e8ec', '#8a3ac8', '#e07a30'][q % 7], X + 5 + (q >> 3) % 3, sy + 7 - b * 3, 10 + (q >> 5) % 4, 3); } }
      break;
    case 'M': rp('rgba(0,0,0,.3)', X + 2, Y + 21, 20, 3);   // the snack machine
      rp('#2c2c36', X + 1, Y - 20, 22, 43); rp('#3c3c48', X + 1, Y - 20, 22, 1); rp('#e8e8f0', X + 2, Y - 19, 20, 3); rp('#0e1218', X + 3, Y - 15, 13, 28);
      for (let r = 0; r < 5; r++) { rp('#5a606a', X + 3, Y - 10 + r * 5, 13, 1);
        for (let i = 0; i < 3; i++) rp(['#e0402a', '#e0b02a', '#3a8ae0', '#40b050', '#8a3ad0', '#e07ab0', '#e8e8e8'][(r * 3 + i) % 7], X + 4 + i * 4, Y - 14 + r * 5, 3, 4); }
      rp('rgba(255,255,255,.12)', X + 5, Y - 15, 2, 28); rp('#3a3a46', X + 17, Y - 15, 5, 20); rp('#40e070', X + 18, Y - 14, 3, 2);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 2; i++) rp('#8a8a96', X + 18 + i * 2, Y - 10 + r * 2, 1, 1);
      rp('#0a0a0c', X + 3, Y + 15, 13, 5); rp('#3a3a46', X + 3, Y + 15, 13, 1); rp('#16161c', X + 1, Y + 21, 22, 2); break;
    case 'N': rp('rgba(0,0,0,.3)', X + 2, Y + 21, 20, 3);   // the drink machine
      rp('#2a5aa8', X + 1, Y - 20, 22, 43); rp('#3a6ac0', X + 1, Y - 20, 22, 1); rp('#dfeaf8', X + 3, Y - 17, 13, 28); rp('#bcd2ec', X + 3, Y - 17, 13, 1);
      for (let r = 0; r < 4; r++) { rp('#9ab0cc', X + 3, Y - 10 + r * 7, 13, 1);
        for (let i = 0; i < 4; i++) { const c = ['#e03030', '#30a0e0', '#40c060', '#f0c030', '#e8e8e8', '#e07ab0'][(r + i * 2) % 6]; rp(c, X + 4 + i * 3, Y - 15 + r * 7, 2, 5); rp('#f8f8f8', X + 4 + i * 3, Y - 16 + r * 7, 2, 1); } }
      for (let r = 0; r < 6; r++) rp(r === (frame >> 4) % 6 ? '#ffffff' : '#c8d8f0', X + 18, Y - 15 + r * 4, 3, 2);
      rp('#0a0a0c', X + 3, Y + 15, 13, 5); rp('#1e3a70', X + 3, Y + 15, 13, 1); rp('#16161c', X + 1, Y + 21, 22, 2); break;
    case 'K': { const x0 = X, w0 = w * 24;   // the front desk: a wood top, a black front with RESPAWN on it; Cecil's monitor faces him
      rp('rgba(0,0,0,.25)', x0 + 1, Y + 21, w0 - 2, 3); rp('#8a5a30', x0, Y - 8, w0, 9); rp('#a87040', x0, Y - 8, w0, 1); rp('#6a4020', x0, Y, w0, 1);
      rp('#18181e', x0, Y + 1, w0, 19); rp('#26262e', x0, Y + 1, w0, 1); rp('#3e8a3a', x0, Y + 15, w0, 2); rp('#0e0e12', x0, Y + 20, w0, 2);
      respWord('RESPAWN', x0 + (w0 >> 1), Y + 6, '#e2c64a');
      rp('#22222a', x0 + 30, Y - 18, 14, 10); rp('#2e2e36', x0 + 30, Y - 18, 14, 1); rp('#3a3a42', x0 + 36, Y - 8, 2, 1);
      rp('#3a3a46', x0 + 50, Y - 10, 6, 3); rp('#e8e8ec', x0 + 8, Y - 9, 6, 2); rp('#c83a3a', x0 + 9, Y - 10, 1, 1); rp('#3a8ae0', x0 + 11, Y - 10, 1, 1); rp('#e0c040', x0 + 13, Y - 10, 1, 1);   // a card reader, a bowl of candy
      break; }
    case 't': rp('rgba(0,0,0,.25)', X + 3, Y + 44, 18, 3); rp('#4a2c14', X + 3, Y + 40, 18, 5); rp('#2a1a0e', X + 4, Y + 44, 2, 3); rp('#2a1a0e', X + 18, Y + 44, 2, 3);   // the coffee table
      rp('#8a5a30', X + 3, Y + 2, 18, 39); rp('#a87040', X + 3, Y + 2, 18, 1);
      rp('#d84a3a', X + 6, Y + 8, 7, 9); rp('#3a6ad0', X + 9, Y + 11, 7, 9); rp('#e8e8ec', X + 10, Y + 12, 4, 1); rp('#2a2a30', X + 7, Y + 28, 6, 3); rp('#2a2a30', X + 6, Y + 29, 8, 2); break;
    case 'L': {   // the lounge couch along a wall, facing the room: arms at both ends, the back against the wall
      const c = '#2f5a8a', d = shade(c, -0.28), l = shade(c, 0.18), fl = x === 0, m = (col, px, py, pw, ph) => rp(col, fl ? 2 * X + 24 - px - pw : px, py, pw, ph);
      m('rgba(0,0,0,.28)', X + 2, Y + 44, 22, 4); m(d, X + 3, Y - 1, 21, 47);
      m(c, X + 15, Y - 2, 8, 48); m(l, X + 15, Y - 2, 8, 1); m(d, X + 22, Y - 2, 1, 48);   // the back
      m(c, X + 4, Y + 3, 12, 19); m(c, X + 4, Y + 23, 12, 19); m(l, X + 4, Y + 3, 12, 1); m(l, X + 4, Y + 23, 12, 1); m(l, X + 4, Y + 3, 1, 39);   // two seat cushions
      m(d, X + 4, Y + 22, 12, 1);
      m(l, X + 2, Y - 2, 21, 5); m(c, X + 2, Y + 1, 21, 3); m(l, X + 2, Y + 41, 21, 6); m(c, X + 2, Y + 44, 21, 3);   // the arms
      m('#e0b840', X + 11, Y + 6, 4, 6); m('#c89a2a', X + 11, Y + 11, 4, 1); m('#2a1a10', X + 4, Y + 46, 2, 2); m('#2a1a10', X + 20, Y + 46, 2, 2); break; }
    case 'b': { const c = '#2f5a8a', d = shade(c, -0.28), l = shade(c, 0.18);   // an armchair facing the coffee table
      if (respT(x - 1, y) === 't') {   // the table is to its left: seen from the side, its back to the right
        rp('rgba(0,0,0,.28)', X + 2, Y + 19, 20, 3); rp('#2a1a10', X + 4, Y + 19, 2, 2); rp('#2a1a10', X + 18, Y + 19, 2, 2);
        rp(d, X + 4, Y + 14, 16, 5); rp(c, X + 4, Y + 3, 12, 12); rp(l, X + 4, Y + 3, 12, 1);
        rp(c, X + 15, Y - 5, 6, 21); rp(l, X + 15, Y - 5, 6, 1); rp(d, X + 20, Y - 5, 1, 21);
        rp(c, X + 3, Y - 1, 17, 5); rp(l, X + 3, Y - 1, 17, 1); rp(c, X + 3, Y + 12, 17, 6); rp(d, X + 3, Y + 17, 17, 1); break; }
      rp('rgba(0,0,0,.28)', X + 2, Y + 20, 20, 3); rp(d, X + 4, Y + 15, 16, 5); rp('#2a1a10', X + 4, Y + 19, 2, 2); rp('#2a1a10', X + 18, Y + 19, 2, 2);
      rp(c, X + 5, Y - 3, 14, 18); rp(l, X + 5, Y - 3, 14, 2); rp(d, X + 11, Y - 1, 2, 15);
      rp(c, X + 2, Y + 1, 4, 16); rp(l, X + 2, Y + 1, 4, 1); rp(c, X + 18, Y + 1, 4, 16); rp(l, X + 18, Y + 1, 4, 1); break; }
    case 'O': {   // the front windows: Fifth Avenue outside, the edge of the green and yellow awning across the top
      const night = typeof SKY !== 'undefined' && SKY.elev < -4;
      rp('#7a4626', X, Y, 24, 24); rp('#2a1a10', X + 1, Y + 1, 22, 19); rp(night ? '#1a2238' : '#a8cce4', X + 2, Y + 2, 20, 17);
      for (let i = 0; i < 20; i += 4) rp(i % 8 ? '#e2c64a' : '#3e6a2c', X + 2 + i, Y + 2, 4, 3);
      rp(night ? '#2c3450' : '#d6c6a8', X + 2, Y + 8, 20, 5); rp(night ? '#e8c87a' : '#e8eef4', X + 4 + (x * 5) % 12, Y + 9, 3, 2);
      rp(night ? '#30303a' : '#74747c', X + 2, Y + 14, 20, 5); rp('rgba(255,255,255,.22)', X + 4, Y + 4, 2, 13);
      rp('#5a3418', X, Y + 19, 24, 2); rp('#3a2010', X, Y + 21, 24, 3); break; }
  }
}
function respWord(s, cx, y, c) {   // tiny 3x5 capitals for the desk front
  const GL = { R: ['110', '101', '110', '101', '101'], E: ['111', '100', '110', '100', '111'], S: ['011', '100', '010', '001', '110'], P: ['110', '101', '110', '100', '100'],
    A: ['010', '101', '111', '101', '101'], W: ['10001', '10001', '10101', '10101', '01010'], N: ['1001', '1101', '1011', '1001', '1001'] };
  let wd = -1; for (const ch of s) wd += GL[ch][0].length + 1; let x = cx - (wd >> 1);
  for (const ch of s) { const g = GL[ch]; for (let r = 0; r < 5; r++) for (let i = 0; i < g[r].length; i++) if (g[r][i] === '1') rp(c, x + i, y + r, 1, 1); x += g[0].length + 1; }
}
function respBackWall() {   // the back wall over the golf bay: paneling, black curtains, the screen with a course on it
  respPanel(0, -48, 48); for (let i = 1; i < 8; i++) respPanel(i * 24, -48, 48); rp('#4a2914', 0, -48, 192, 2); rp('#3a2010', 0, -4, 192, 4);
  respCurtain(0, -48, 24, 48); respCurtain(168, -48, 24, 48);
  rp('#0c0c10', 26, -46, 140, 42);
  const X = 28, Y = -44;
  ['#6aaee6', '#7eb9ea', '#94c6ee', '#aed4f2', '#c6e2f6', '#d6eaf8'].forEach((c, i) => rp(c, X, Y + i * 3, 136, 3));
  for (let i = 0; i < 136; i += 4) rp('#7aa088', X + i, Y + 13 - (hash(i, 2) % 3), 4, 4);
  for (let i = 0; i < 136; i += 3) rp(i % 2 ? '#2e6a3a' : '#28603a', X + i, Y + 15 - (hash(i, 5) % 3), 3, 5);
  rp('#3e8a36', X, Y + 19, 136, 19);
  for (let r = 19; r < 38; r++) { const k = (r - 19) / 18, half = Math.round(5 + k * 34), c = 68 - Math.round((1 - k) * 4);
    rp(Math.floor(r / 3) % 2 ? '#62b04e' : '#58a446', X + c - half, Y + r, half * 2, 1); }
  rp('#86cc6c', X + 59, Y + 19, 14, 2); rp('#86cc6c', X + 61, Y + 18, 10, 1);
  rp('#4a8ad0', X + 10, Y + 28, 16, 3); rp('#6aa6e0', X + 12, Y + 28, 6, 1);
  rp('#e6d9a8', X + 88, Y + 23, 9, 2); rp('#e6d9a8', X + 40, Y + 30, 7, 2);
  rp('#f4f4f4', X + 67, Y + 11, 1, 8); rp('#e03a3a', X + 68, Y + 11, 4, 3);
  rp('rgba(0,0,0,.35)', X + 3, Y + 2, 24, 8); rp('#f0f0f0', X + 5, Y + 4, 9, 1); rp('#f0f0f0', X + 5, Y + 7, 14, 1); rp('#f0e040', X + 17, Y + 4, 6, 1);
  rp('rgba(0,0,0,.35)', X + 118, Y + 2, 15, 7); rp('#f0f0f0', X + 121, Y + 5, 7, 1); rp('#f0f0f0', X + 126, Y + 4, 1, 3);
  const ft = frame % 420;   // now and then the simulator replays a shot: the ball climbs toward the flag
  if (ft < 90) { const k = ft / 90, bx = X + 68 + Math.round(k * 2), by = Y + 37 - Math.round(k * 19) - Math.round(Math.sin(k * Math.PI) * 14);
    rp('rgba(255,255,255,.35)', bx, by + 2, 1, 3); rp('#ffffff', bx, by, 1, 1); }
}
const RESP_TAPES = [[2, 6, 6, 11], [2, 14, 2, 28]];   // yellow tape: round the pool table, along the PC chairs
function respTape() {
  for (const [x0, y0, x1, y1] of RESP_TAPES) {
    if (x0 === x1) { rp(RESP_TAPE, x0 * 24 + 1, y0 * 24 + 2, 2, (y1 - y0) * 24 - 4); continue; }
    const X0 = x0 * 24 + 2, Y0 = y0 * 24 + 2, X1 = x1 * 24 - 2, Y1 = y1 * 24 - 2;
    rp(RESP_TAPE, X0, Y0, X1 - X0, 2); rp(RESP_TAPE, X0, Y1 - 2, X1 - X0, 2); rp(RESP_TAPE, X0, Y0, 2, Y1 - Y0); rp(RESP_TAPE, X1 - 2, Y0, 2, Y1 - Y0);
  }
}
function respPaint(ox, oy, kx, ky) {
  RX = ox; RY = oy;
  const FH = RESP_ROWS.length, ya = Math.max(0, Math.floor(-oy / 24) - 1), yb = Math.min(FH - 1, Math.ceil((SH - oy) / 24) + 1);
  if (oy > 0) respBackWall();
  for (let y = ya; y <= yb; y++) for (let x = 0; x < 8; x++) respFloor(respT(x, y), x, y);
  if (ya <= 5) rp('rgba(4,8,20,.18)', 24, 0, 144, 6 * 24);   // the golf bay is kept dim for the projector
  respTape();
  for (const [lx, ly] of [[2.6, 8.6], [2.6, 16.5], [2.6, 23], [2.6, 29.5], [3.2, 34]]) {   // the fluorescent panels overhead, as soft light on the floor
    const cx = RX + lx * 24, cy = RY + ly * 24; if (cy < -60 || cy > SH + 60) continue;
    const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, 46); g.addColorStop(0, 'rgba(255,253,232,.075)'); g.addColorStop(1, 'rgba(255,253,232,0)');
    ctx.fillStyle = g; ctx.fillRect(cx - 46, cy - 46, 92, 92); }
  // everything standing up, in depth order with Cecil and the kid
  const L = [];
  for (let y = Math.max(0, ya - 3); y <= yb; y++) for (let x = 0; x < 8; x++) {
    const t = respT(x, y), up = respFaced(x, y - 1);
    if (respFaced(x, y) && t !== 'O') L.push({ y: up ? y - 1.01 : y, draw: () => respWall(x, y) });   // a wall under a wall goes down first
    if (RESP_WALK.has(t) && t !== 'D' && t !== 'e') continue;
    if (t === 'X' || t === 'W' || t === 'c') continue;
    if (RESP_BLOCK.includes(t)) {
      if (respT(x - 1, y) === t || respT(x, y - 1) === t) continue;   // drawn from its top-left tile
      let w = 1, h = 1; while (respT(x + w, y) === t) w++; while (respT(x, y + h) === t) h++;
      L.push({ y: y + h - 1 + 0.002, draw: () => respProp(t, x, y, w, h) }); continue;
    }
    // a poster or a doorway sits on its own stretch of wall; anything else stands in its own row
    L.push({ y: 'wD'.includes(t) && up ? y - 1.009 : y + 0.002, draw: () => respProp(t, x, y, 1, 1) });
  }
  L.push({ y: RESP_CECIL.y + 0.005, draw: () => drawFolk('cecil', RX + RESP_CECIL.x * 24 + 12, RY + RESP_CECIL.y * 24 + 23, frame) });
  L.push({ y: ky + 0.005, draw: () => drawKid(G.kid, Math.round(RX + kx * IT), Math.round(RY + ky * IT), G.dir, P.t > 0, IT) });
  L.sort((a, b) => a.y - b.y).forEach(e => e.draw());
  if (ya <= 7) {   // the projector on the ceiling over the bay, and its light on the way to the screen
    ctx.fillStyle = 'rgba(220,235,255,.05)'; ctx.beginPath(); ctx.moveTo(RX + 94, RY + 30); ctx.lineTo(RX + 28, RY - 6); ctx.lineTo(RX + 164, RY - 6); ctx.lineTo(RX + 98, RY + 30); ctx.closePath(); ctx.fill();
    rp('#8a8e96', 95, 22, 2, 8); rp('#d8dade', 91, 30, 10, 4); rp('#b0b4ba', 91, 33, 10, 1); rp('#1a1e26', 94, 30, 4, 1); rp('#40e070', 99, 32, 1, 1);
  }
  F('#1c1618', ox - 4, oy - 2 * IT - 2, 8 * IT + 8, 3); F('#1c1618', ox - 4, oy - 2 * IT - 2, 4, FH * IT + 2 * IT + 2); F('#1c1618', ox + 8 * IT, oy - 2 * IT - 2, 4, FH * IT + 2 * IT + 2); F('#1c1618', ox - 4, oy + FH * IT, 8 * IT + 8, 4);
}

// ---------- walking, looking, the door ----------
function respFree(x, y) { return RESP_WALK.has(respT(x, y)); }
function respZone(x, y) {
  if (y <= 5) return 'GOLF SIMULATOR';
  if (y <= 12) return 'GAME ROOM';
  if (x >= 5 && y >= 14 && y <= 18) return 'WORKOUT ROOM';
  if (x >= 5 && y >= 20 && y <= 24) return 'MEETING ROOM';
  if (x >= 5 && y >= 26 && y <= 30) return 'RETRO LOUNGE';
  if (y <= 31 && x <= 4) return 'PC STATIONS';
  if (y >= 32) return 'FRONT DESK';
  return 'MAIN FLOOR';
}
function respPlay(prompt, list) {   // a station that opens one of Cecil's arcade games
  ask(prompt, list.map(i => ({ t: 'Play ' + ARCADE_GAMES[i][0], f: () => say([['', ARCADE_GAMES[i][2]]], () => arcadeOpen(i)) })).concat([{ t: 'Not now' }]));
}
function respLook(x, y) {
  const t = y < 0 ? '^' : respT(x, y);
  if (t === 'K' || (x === RESP_CECIL.x && y === RESP_CECIL.y)) return cecilTalk();
  if (t === 'P' || t === 'p') return ask('A gaming PC. The screen says PRESS START.', [{ t: 'Open the game library', f: () => arcadeLibrary('all') }, { t: 'Not now' }]);
  if (t === 'r' || t === 's') return respPlay('A racing rig: a bucket seat, a wheel, pedals and a big screen.', [1]);
  if (t === 'a') return ask('An upright arcade cabinet. The attract screen loops.', [{ t: 'Pick a game', f: () => arcadeLibrary('all') }, { t: 'Not now' }]);
  if (t === 'v') return ask('An old tube TV hooked up to a stack of consoles. The cartridges are within reach.', [
    { t: 'Retro gaming quiz', f: () => say([['', 'Eight questions on old games.']], () => quizStart('')) },
    { t: 'NES and Game Boy games', f: () => arcadeLibrary('nes') }, { t: 'Not now' }]);
  const L = {
    '^': x >= 1 && x <= 6 ? 'The golf simulator. A projector on the ceiling puts the course on the screen, and sensors read every swing.' : 'Black curtains keep the light off the screen.',
    g: 'The golf bay\'s turf. The screen is straight ahead.', h: 'A hitting mat, with a ball on a tee.', c: 'Black curtains keep the light off the screen.', C: 'The curtains, drawn back to the walls.',
    W: 'Wood paneling.', w: 'A framed poster from a video game.', q: 'A rack of pool cues and a cube of chalk.',
    Q: 'A pool table. The balls are racked and the cue ball is on its spot.', A: 'An air hockey table. The puck floats when the fans are on.', f: 'A foosball table. Somebody left the score at 9 to 9.',
    y: 'Mirrors along the wall.', '2': 'A squat rack with a bar on the hooks.', '1': 'A rack of dumbbells.', '4': 'Kettlebells in a row, smallest to biggest.', '3': 'A weight bench.', n: 'A treadmill.',
    Y: 'A screen on the wall. Somebody left a tournament bracket up.', T: 'A long table with a laptop, notepads and a coffee mug on it.', k: 'An office chair.',
    Z: 'Shelves of old cartridges, boxed games and board games.', S: 'A couch facing the old TV, worn in from long sessions.',
    V: 'A TV on the wall behind the desk, four players on a split screen.', u: 'A stand with the newest consoles on it.', B: 'A beanbag.',
    G: 'Board games and card games, stacked on a shelf.', M: 'A snack machine: chips, candy bars and crackers.', N: 'A drink machine: pop, sports drinks, energy drinks and water.',
    t: 'A coffee table with a couple of game magazines on it.', L: 'A couch in the front lounge.', b: 'An armchair.', O: 'Fifth Avenue, through the front window.',
  }[t];
  if (L) say([['', L]]);
}
function enterRespawn() {
  G.inside = { f: 'respawn', x: 3, y: 35 }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  say([['', 'Respawn Gaming Lounge. Fans hum, the PC row glows down the left wall, and a pool ball cracks somewhere in the back.']]);
}
function respLeave() {
  const [x, y] = outsideDoorM(RESPAWN); G.inside = null; G.x = x; G.y = y; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; RESP_HOLD = true; saveGame(); setMode('walk');
}
FIG_FLOORS.respawn = { name: 'MAIN FLOOR', place: 'RESPAWN GAMING LOUNGE', bld: 'respawn', rows: RESP_ROWS,
  paint: respPaint, look: respLook, free: respFree, leave: respLeave, zone: respZone };
// outside: the door faces north onto Fifth, so you walk down into it (or face it and press A)
function respDoorAt(x, y) { if (!RESPAWN || !RESPAWN.door) return false; const [dx, dy] = doorM(RESPAWN); return Math.hypot(x + 0.5 - dx, y + 0.5 - dy) <= 1.01 && y + 0.5 >= dy - 0.01; }
{ const _de = doorEnter; doorEnter = function (x, y) { return _de(x, y) || (respDoorAt(x, y) ? enterRespawn : null); }; }
let RESP_HOLD = false;   // you leave by walking down, and you come in by walking down: let go of the key before the door takes you back
{ const _wu = MODES.walk.update; MODES.walk.update = function () {
    if (RESP_HOLD && !held.down) RESP_HOLD = false;
    if (!RESP_HOLD && !DLG && P.t === 0 && !pressed.a && dirHeld() === 'down' && respDoorAt(G.x, G.y + 1)) { G.dir = 'down'; return enterRespawn(); }
    return _wu.call(this); }; }
if (RESPAWN) RESPAWN.enter = 1;   // its name goes on the map first (town.js labels)
if (typeof UMA !== 'undefined' && UMA) UMA.enter = 1;

// ---------- across the street (Christian, Nov 13): someone on the north sidewalk of Fifth, facing Respawn, sends you over.
// A passerby, not anyone real; drawn with the game's own folk painter. The line is a plain stand-in for Christian to rewrite. ----------
FOLKS.gamer = { skin: '#d9a77c', hair: '#2a1e18', shirt: '#4a3a8a', shirt2: '#2e2460', pants: '#2e3440', shoes: '#d8d8dc', hat: '#c8a830', extra: ['beanie', 'handheld'] };
function respFanSpot() {   // the sidewalk cell right against the storefronts across from Respawn's door
  if (!RESPAWN || !RESPAWN.door) return null;
  const x = RESPAWN.door[0]; let y = RESPAWN.door[1] - 1;
  while (y > RESPAWN.door[1] - 12 && !solidM(x, y - 1)) y--;
  return solidM(x, y) ? null : [x, y];
}
{ const _ns = npcSetup; npcSetup = function () { _ns(); if (!NPCS.some(n => n.id === 'respfan')) { const s = respFanSpot();
    if (s) NPCS.push({ id: 'respfan', g: 'gamer', x: s[0], y: s[1], dir: 'down', face0: 'down', hx: s[0], hy: s[1], r: 0, t: 0, mx: 0, my: 0, wait: 0 }); } }; }
{ const _dn = drawNpc; drawNpc = function (p) { if (FOLKS[p.n.g]) return drawFolk(p.n.g, Math.round(p.x * T), Math.round(p.y * T) - 1, frame); return _dn(p); }; }
{ const _nt = npcTalk; npcTalk = function (n) {
    if (n.id !== 'respfan') return _nt(n);
    n.talking = true;
    return say([['', 'Someone on the sidewalk looks up from a handheld game.'],
      ['', '"Go down and check out the gaming south of us! Respawn Gaming Lounge, right across the street."'],
      ['', '"The door\'s under the green and yellow awning."']], () => { n.talking = false; n.wait = 90; }); }; }
