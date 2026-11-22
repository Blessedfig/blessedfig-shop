"use strict";
// =====================================================================
//  TITLE AND THE TOWN MAP
// =====================================================================
MODES.title = {
  enter() { this.sel = 0; this.opts = (loadGame() ? ['CONTINUE'] : []).concat(typeof storeLoad === 'function' && storeLoad() ? ['THE STORE'] : []).concat(['NEW GAME', 'ALMANAC']); },
  update() {
    if (pressed.up) this.sel = (this.sel + this.opts.length - 1) % this.opts.length;
    if (pressed.down) this.sel = (this.sel + 1) % this.opts.length;
    if (pressed.a) {
      const o = this.opts[this.sel];
      if (o === 'NEW GAME') { setMode('create'); return; }
      if (o === 'ALMANAC') { setMode('almanac'); return; }
      if (o === 'THE STORE') { S = storeLoad(); setMode('store'); return; }
      G = loadGame(); setMode(G.inside ? 'inside' : 'walk');
    }
  },
  draw() {
    R(0, 0, SW, SH, '#0b0b1c');
    for (let i = 0; i < 60; i++) { const h = hash(i, 3); R(h % SW, (h >> 9) % 140, 1, 1, (frame >> 3) % 7 === i % 7 ? '#fff' : '#8888aa'); }
    txt('THE UNWRITTEN', SW / 2, 70, '#ffd860', 'center');
    txt('a Fig Tree tale · Antigo, Wisconsin', SW / 2, 86, '#c8c8e0', 'center', SMALL);
    this.opts.forEach((o, i) => txt((i === this.sel ? '▶ ' : '  ') + o, SW / 2 - 40, 140 + i * 14, i === this.sel ? '#ffd860' : '#fff'));
    txt('A HUGE WORK IN PROGRESS · EARLY BUILD', SW / 2, SH - 14, '#8a8aa0', 'center', SMALL);
  }
};
// ---------- new game: who you are, and how heavy the story gets ----------
const CR = { g: 'christian', name: 'Christian', mature: false, row: 0, named: false, play: 'adventure' };   // play: 'adventure' or 'store' (the bookstore, store.js)
const CR_NAMES = { boy: 'Eli', girl: 'Wren', christian: 'Christian', danny: 'Danny', robin: 'Robin' };
addEventListener('keydown', e => {   // typing a name (captured before the game keys, only on the name row)
  if (mode !== 'create' || CR.row !== 1) return;
  if (/^Key[A-Z]$/.test(e.code) || e.code === 'Space' || e.code === 'Minus' || e.code === 'Quote') {
    if (!CR.named) { CR.name = ''; CR.named = true; }
    if (CR.name.length < 10 && e.key.length === 1) CR.name += e.key;
    e.preventDefault(); e.stopPropagation();
  } else if (e.code === 'Backspace') { if (!CR.named) { CR.name = ''; CR.named = true; } CR.name = CR.name.slice(0, -1); e.preventDefault(); e.stopPropagation(); }
}, true);
MODES.create = {
  enter() { CR.row = 0; },
  update() {
    if (pressed.up) CR.row = (CR.row + 4) % 5;
    if (pressed.down) CR.row = (CR.row + 1) % 5;
    const lr = pressed.left ? -1 : pressed.right ? 1 : 0;
    if (lr && CR.row === 0) { CR.g = KID_CHOICES[(KID_CHOICES.indexOf(CR.g) + lr + KID_CHOICES.length) % KID_CHOICES.length]; if (!CR.named) CR.name = CR_NAMES[CR.g]; }
    if (lr && CR.row === 2) CR.mature = !CR.mature;
    if (lr && CR.row === 3) CR.play = CR.play === 'store' ? 'adventure' : 'store';
    if (pressed.b && CR.row !== 1) { setMode('title'); return; }
    if (pressed.a && CR.row === 1 && typeof IS_TOUCH !== 'undefined' && IS_TOUCH) {   // phones: the system keyboard
      const n = prompt('Name (up to 10 letters):', CR.name); if (n !== null) { CR.name = n.replace(/[^A-Za-z '\-]/g, '').slice(0, 10); CR.named = true; } CR.row = 2; return; }
    if (pressed.a && CR.row === 4) {
      const name = (CR.name.trim() || CR_NAMES[CR.g]).slice(0, 10);
      if (CR.play === 'store') { S = storeNew(name, CR.g); storeSave(); setMode('store');
        say([['', 'The Blessed Fig Tree, Fifth and Clermont. ' + name + ' runs the store now.'], ['', 'The picture is your store. The choices around it are your morning: order books, buy used boxes, plan events, then OPEN UP.'],
          ['', 'Customers come to the counter. Ring them up, recommend books, take trade-ins. Rent is due every Monday. Arrows and A, or tap.']]);
        return; }
      G = newGame({ g: CR.g, name }, CR.mature); setMode('walk');
      say([['', 'Antigo, Wisconsin. Every building here stands where it really stands.'],
           ['', name + ' stands outside The Blessed Fig Tree, on the corner of Fifth and Clermont.'],
           ['', 'Arrows to walk. A (Enter or Z) to look. M for the map.']]);
    } else if (pressed.a && CR.row < 4) CR.row++;
  },
  draw() {
    R(0, 0, SW, SH, '#0b0b1c');
    txt('WHO ARE YOU?', SW / 2, 14, '#ffd860', 'center');
    // the kid, three times size, turning slowly in place and walking
    const dirs = ['down', 'right', 'up', 'left'], dir = dirs[(frame >> 6) % 4];
    win(20, 34, 96, 120);
    kidFrame(CR.g, dir, (frame >> 3) % KID_META[CR.g].n, 68, 142, 2);
    txt(CR.name || ' ', 68, 136, '#fff', 'center', SMALL);
    const rows = [['WHO', '◀ ' + KID_LABEL[CR.g] + ' ▶'],
      ['NAME', CR.name + (CR.row === 1 && (frame >> 4) % 2 ? '_' : ' ')], ['STORY', CR.mature ? '◀ MATURE ▶' : '◀ STANDARD ▶'], ['PLAY', CR.play === 'store' ? '◀ BOOKSTORE ▶' : '◀ ADVENTURE ▶'], ['BEGIN', '']];
    win(124, 34, 180, 120);
    rows.forEach(([k, v], i) => { const y = 48 + i * 21, on = i === CR.row;
      txt((on ? '▶ ' : '  ') + k, 132, y, on ? '#ffd860' : '#fff', 'left', SMALL); txt(v, 296, y, on ? '#ffd860' : '#c8c8e0', 'right', SMALL); });
    const help = CR.row === 1 ? (typeof IS_TOUCH !== 'undefined' && IS_TOUCH ? 'Tap A to type a name.' : 'Type a name. Backspace erases. Arrows move on.')
      : CR.row === 2 ? (CR.mature ? 'Mature: the inward fights hit harder. Horror, drinking, grief and faith argued hard, with no padding. Never sexual.'
                                  : 'Standard: teen and up. The real town, honestly, and the inward fights with a lighter hand.')
      : CR.row === 3 ? (CR.play === 'store' ? 'Bookstore: run The Blessed Fig Tree. A little money, the shelves, and whoever walks in the door.' : 'Adventure: walk the real town of Antigo.')
      : CR.row === 4 ? (CR.play === 'store' ? 'A to open the store.' : 'A to begin, outside the bookstore.') : 'Left and right to choose. Up and down to move.';
    win(20, 162, SW - 40, 56);
    wrap(help, SW - 60, SMALL).slice(0, 4).forEach((l, i) => txt(l, 30, 172 + i * 10, '#fff', 'left', SMALL));
  }
};
// ---------- the town map: the whole real town, building colors by kind, you are here ----------
let MAPIMG = null;
function mapImage() {
  if (MAPIMG) return MAPIMG;
  const c = document.createElement('canvas'); c.width = TW; c.height = TH; const g = c.getContext('2d'), im = g.createImageData(TW, TH);
  const COL = { 0: [78, 138, 64], 1: [168, 154, 90], 2: [46, 90, 48], 3: [58, 106, 168], 4: [150, 150, 156], 5: [190, 190, 196], 6: [200, 184, 144], 7: [110, 110, 116],
    8: [90, 78, 68], 9: [106, 168, 80], 10: [94, 164, 70], 11: [200, 180, 138], 13: [95, 154, 72], 14: [112, 112, 118] };
  const BC = { house: [216, 196, 160], garage: [170, 160, 140], shed: [150, 145, 135], store: [200, 90, 70], apartments: [190, 140, 90], civic: [90, 120, 170],
    church: [150, 100, 170], school: [220, 180, 60], hospital: [230, 235, 240], factory: [110, 110, 120], barn: [160, 60, 50], farmhouse: [216, 196, 160], fig: [80, 220, 110] };
  for (let i = 0; i < TW * TH; i++) {
    const t = TT[i]; const c3 = t === TL.BLDG ? (BC[BLD[TB[i] - 1].type] || [200, 200, 200]) : (COL[t] || [0, 0, 0]);
    im.data[i * 4] = c3[0]; im.data[i * 4 + 1] = c3[1]; im.data[i * 4 + 2] = c3[2]; im.data[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0); MAPIMG = c; return c;
}
MODES.map = {
  // the whole real town; a cursor to pick a spot and go there (the kid bikes over), zoom on C
  enter() { this.z = 1; this.cx = G.x / CPD; this.cy = G.y / CPD; },
  update() {
    if (pressed.b || pressed.map) { setMode('walk'); return; }
    if (pressed.menu) this.z = this.z === 1 ? 3 : this.z === 3 ? 0.5 : 1;
    const sp = 2.5 / this.z * (held.b ? 3 : 1);
    if (held.left) this.cx -= sp; if (held.right) this.cx += sp; if (held.up) this.cy -= sp; if (held.down) this.cy += sp;
    this.cx = Math.max(0, Math.min(TW - 1, this.cx)); this.cy = Math.max(0, Math.min(TH - 1, this.cy));
    if (pressed.a) {
      const [x, y] = freeNearM(Math.round(this.cx * CPD), Math.round(this.cy * CPD)); G.x = x; G.y = y; G.dir = 'down';
      P.t = 0; P.mx = P.my = 0; setMode('walk');
      const b = bAt(Math.floor(x / CPD), Math.floor(y / CPD)), near = b && b.name ? b.name : '';
      say([['', 'You ride over' + (near ? ', by ' + near : '') + '.']]);
    }
  },
  draw() {
    R(0, 0, SW, SH, '#0b0b1c');
    const img = mapImage(), z = this.z * (SH - 20) / 400;   // at z=1 about 400 cells (1.6 km) fill the screen height
    const vw = SW / z, vh = (SH - 20) / z;
    const x0 = Math.max(0, Math.min(TW - vw, this.cx - vw / 2)), y0 = Math.max(0, Math.min(TH - vh, this.cy - vh / 2));
    ctx.imageSmoothingEnabled = z < 1;
    ctx.drawImage(img, x0, y0, vw, vh, 0, 0, SW, SH - 20); ctx.imageSmoothingEnabled = false;
    const px = (G.x / CPD - x0) * z, py = (G.y / CPD - y0) * z;
    if ((frame >> 3) % 2) { R(px - 2, py - 2, 5, 5, '#000'); R(px - 1, py - 1, 3, 3, '#ffd860'); }
    // license-plate cameras (OpenStreetMap)
    for (const c of CAMS) { const X = (c.x - x0) * z, Y = (c.y - y0) * z; if (X < -4 || X > SW + 4 || Y < -4 || Y > SH) continue;
      R(X - 3, Y - 3, 7, 7, '#000'); R(X - 2, Y - 2, 5, 5, '#e04848'); R(X - 1, Y - 1, 3, 2, '#fff'); }
    if (CAMS.length) { win(SW - 104, 16, 100, 14); R(SW - 98, 20, 5, 5, '#e04848'); txt('PLATE CAMERAS (' + CAMS.length + ')', SW - 90, 19, '#fff', 'left', SMALL); }
    const cx = (this.cx - x0) * z, cy = (this.cy - y0) * z;
    R(cx - 6, cy, 4, 1, '#fff'); R(cx + 3, cy, 4, 1, '#fff'); R(cx, cy - 6, 1, 4, '#fff'); R(cx, cy + 3, 1, 4, '#fff');
    const cn = camNear(this.cx, this.cy, 3 / z + 0.5);
    if (cn) { const t = 'License-plate camera (OpenStreetMap)'; ctx.font = SMALL; const w = ctx.measureText(t).width + 8; win(Math.min(SW - w - 2, cx + 6), cy - 16, w, 12); txt(t, Math.min(SW - w - 2, cx + 6) + 4, cy - 13, '#fff', 'left', SMALL); }
    const b = cn ? null : bAt(Math.round(this.cx), Math.round(this.cy)); if (b && b.name) { ctx.font = SMALL; const w = ctx.measureText(b.name).width + 8; win(Math.min(SW - w - 2, cx + 6), cy - 16, w, 12); txt(b.name, Math.min(SW - w - 2, cx + 6) + 4, cy - 13, '#fff', 'left', SMALL); }
    win(0, SH - 20, SW, 20);
    txt('ARROWS MOVE · A GO THERE · C ZOOM · B BACK', 6, SH - 14, '#fff', 'left', SMALL);
    txt('© OSM · Microsoft · Langlade Co. · WROC 2025 · USGS · USDA', SW - 4, 4, 'rgba(255,255,255,.6)', 'right', SMALL);
  }
};
