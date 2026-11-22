"use strict";
// =====================================================================
//  THE START (Christian, Nov 16): "start as a custom character, Video Gamer, perhaps the game starts in a private room, with them
//  alone, and hint at the nature of the light, metal and plastic that has them entranced before they venture to the store."
//  And: "an explore town option with just the Robin ... for people not wanting to play the rpg but just see what we made."
//  NEW GAME: THE STORY (your own gamer, waking in their room), EXPLORE TOWN (the Robin, just the town), BOOKSTORE (store.js).
//  Every line in the room is a stand-in for Christian to rewrite. Christian, Nov 16: the game's purpose is never stated in the game;
//  the room only shows things plainly (Plato's cave is the shape underneath: a wall of light, your shadow, a door behind you).
// =====================================================================
// ---------- the private room ----------
// B bed  S the screen  D the stand and console  G a shelf of game cases  w curtained window  h gaming chair  r rug
// k cables  m cans and a mug  l lamp (off)  p poster  e the door  . floor
FIG_FLOORS.myroom = { name: 'YOUR ROOM', place: 'HOME', rows: [
  'BB.SSS.GGw',
  'BB.DDD.GG.',
  '...rhr....',
  '..rrrrr..m',
  'k.rrrrr..l',
  '.........p',
  '....e.....'],
  free: (x, y) => { const r = FIG_FLOORS.myroom.rows[y]; return !!r && x >= 0 && x < r.length && '.re'.includes(r[x]); },
  look: (x, y, t) => {
    const L = {
      S: 'The screen. The only light in the room. Shapes move across it, and your shadow sits very still on the wall behind you.',
      D: 'The console hums, warm as a sleeping animal. Copper, silicon, a little gold: things that came out of the ground, very far from here.',
      h: 'The chair, shaped to you. The controller lies on the seat: plastic, which was oil once, and before that, forests. It is worn smooth where your thumbs rest.',
      G: 'Game cases lined up like books on a shelf. Every one is a world somebody built.',
      w: 'Curtains drawn. Under them, a thin line of daylight.',
      B: 'Unmade. The pillow still has the shape of you in it.',
      l: 'A lamp. Off.', k: 'A knot of cables: power, signal, charge. Every one of them runs to the screen.',
      m: 'Empty cans and a cold mug.', p: 'A poster from a game. The hero on it looks out at the room.',
      r: 'The rug. A pale path is worn into it, from the chair to the screen.' }[t];
    if (L) say([['', L], ['', '(Stand-in lines: Christian writes this room.)']]);
  },
  leave: () => {
    const fd = outsideDoorM(BLD[TOWN.fig]), [x, y] = freeNearM(fd[0] + 26, fd[1]);
    G.inside = null; G.x = x; G.y = y; G.dir = 'left'; G.leftRoom = 1; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('walk');
    say([['', 'You open the door. The hallway light is so plain it almost hurts.'], ['', 'Outside: cold air, and light coming from everywhere at once.'],
      ['', 'The Blessed Fig Tree is just down Fifth Avenue to the west, on the corner of Clermont. (Stand-in: Christian writes the walk there.)']]);
  },
  paint: (ox, oy, kx, ky) => {
    const fl = FIG_FLOORS.myroom, W = fl.rows[0].length, H = fl.rows.length, f = frame, glow = 0.75 + 0.25 * Math.sin(f / 7) * Math.sin(f / 3.1);
    R(ox - 4, oy - 2 * IT - 2, W * IT + 8, H * IT + 2 * IT + 6, '#06060c');
    R(ox, oy - 2 * IT, W * IT, 2 * IT, '#141826');   // the back wall
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const sx = ox + x * IT, sy = oy + y * IT, t = fl.rows[y][x];
      R(sx, sy, IT, IT, (x + y) % 2 ? '#191a24' : '#1c1d28'); if (t === 'r') R(sx + 1, sy + 1, IT - 2, IT - 2, '#2a2236'); }
    // the curtained window: a thin line of daylight
    const wx = ox + 9 * IT; R(wx + 2, oy - 2 * IT + 6, IT - 4, 2 * IT - 8, '#2a1e30'); R(wx + 2, oy - 6, IT - 4, 3, '#e8d8a0');
    // the bed
    R(ox + 2, oy - 6, 2 * IT - 4, 2 * IT + 2, '#2a2a3a'); R(ox + 4, oy - 4, 18, 10, '#4a4a5a'); R(ox + 2, oy + 10, 2 * IT - 4, 2 * IT - 18, '#3a2a4a');
    // the shelf of game cases
    for (let i = 0; i < 2; i++) { R(ox + 7 * IT + 2, oy - 2 * IT + 10 + i * 18, 2 * IT - 4, 3, '#2a2a30'); for (let j = 0; j < 10; j++) R(ox + 7 * IT + 4 + j * 4, oy - 2 * IT + 1 + i * 18, 3, 9, ['#2a5aa8', '#a83a3a', '#3a8a5a', '#d8d8d8', '#202020'][(j + i * 3) % 5]); }
    R(ox + 7 * IT + 2, oy, 2 * IT - 4, IT * 2 - 6, '#22222c');
    // the screen and its glow: the only light in the room
    const sx = ox + 3 * IT + 2, sy = oy - 2 * IT + 6; R(sx - 2, sy - 2, 3 * IT, 2 * IT - 2, '#0a0a10');
    const sc = ctx.createLinearGradient(sx, sy, sx, sy + 2 * IT - 12); sc.addColorStop(0, 'rgba(120,200,255,' + glow + ')'); sc.addColorStop(1, 'rgba(60,90,220,' + glow + ')'); ctx.fillStyle = sc; ctx.fillRect(sx, sy, 3 * IT - 6, 2 * IT - 8);
    for (let i = 0; i < 6; i++) R(sx + 4 + ((f * 2 + i * 23) % (3 * IT - 14)), sy + 6 + i * 6, 6, 2, 'rgba(255,255,255,.55)');
    R(ox + 3 * IT, oy + 2, 3 * IT, IT - 6, '#2a2a34'); R(ox + 4 * IT - 6, oy + 8, 20, 6, '#101014'); R(ox + 4 * IT + 10, oy + 10, 2, 2, (f >> 4) % 2 ? '#40ff60' : '#106020');
    // the chair, the cables, the cans, the lamp, the poster
    R(ox + 4 * IT + 3, oy + 2 * IT + 2, IT - 6, IT - 4, '#5a1e2a'); R(ox + 4 * IT + 5, oy + 2 * IT - 4, IT - 10, 8, '#6a2434');
    ctx.strokeStyle = '#30303c'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ox + 6, oy + 4 * IT + 12); ctx.quadraticCurveTo(ox + 2 * IT, oy + 3 * IT, ox + 4 * IT, oy + IT + 8); ctx.stroke();
    for (let i = 0; i < 3; i++) R(ox + 9 * IT + 4 + i * 6, oy + 3 * IT + 10, 4, 8, ['#c8c8d0', '#a8a8b8', '#d8d0c0'][i]);
    R(ox + 9 * IT + 8, oy + 4 * IT + 2, 8, 14, '#3a3a44'); R(ox + 9 * IT + 4, oy + 4 * IT, 16, 4, '#4a4a54');
    R(ox + 9 * IT + 3, oy + 5 * IT + 2, IT - 6, IT - 4, '#3a2a5a'); R(ox + 9 * IT + 8, oy + 5 * IT + 6, 8, 10, '#c8a040');
    R(ox + 4 * IT + 2, oy + 6 * IT + IT - 4, IT - 4, 4, '#4a4a3a');   // the door's sill
    // the glow, washing over everything, and the dark at the edges
    const g = ctx.createRadialGradient(ox + 4.5 * IT, oy - IT / 2, 10, ox + 4.5 * IT, oy - IT / 2, 9 * IT);
    g.addColorStop(0, 'rgba(90,150,255,' + (0.22 * glow) + ')'); g.addColorStop(0.5, 'rgba(40,60,140,.08)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.fillStyle = g; ctx.fillRect(ox - 4, oy - 2 * IT - 2, W * IT + 8, H * IT + 2 * IT + 6);
  },
};
// ---------- NEW GAME ----------
// Nov 16, Christian: "Remove 'the bookstore' options, in the Rpg thats the first place you go" (store.js is kept, unused, for later)
const CR_PLAY = ['story', 'explore'], CR_PLAY_LABEL = { story: 'THE STORY', explore: 'EXPLORE TOWN' };
const CR_LOOKS = ['boy', 'girl'];
CR.play = 'story'; CR.g = 'boy'; CR.name = 'Eli';
MODES.create = {
  enter() { CR.row = 0; if (!CR_PLAY.includes(CR.play)) CR.play = 'story'; },
  update() {
    const rowsN = 5;
    if (pressed.up) CR.row = (CR.row + rowsN - 1) % rowsN;
    if (pressed.down) CR.row = (CR.row + 1) % rowsN;
    const lr = pressed.left ? -1 : pressed.right ? 1 : 0;
    if (lr && CR.row === 0) { CR.play = CR_PLAY[(CR_PLAY.indexOf(CR.play) + lr + CR_PLAY.length) % CR_PLAY.length];
      if (CR.play === 'explore') { CR.g = 'robin'; if (!CR.named) CR.name = 'Robin'; }
      else if (CR.play === 'story') { if (!CR_LOOKS.includes(CR.g)) CR.g = 'boy'; if (!CR.named) CR.name = CR_NAMES[CR.g]; }
      else { if (!KID_CHOICES.includes(CR.g)) CR.g = 'christian'; if (!CR.named) CR.name = CR_NAMES[CR.g]; } }
    if (lr && CR.row === 2) { const L = CR.play === 'story' ? CR_LOOKS : CR.play === 'store' ? KID_CHOICES : ['robin']; CR.g = L[(L.indexOf(CR.g) + lr + L.length) % L.length]; if (!CR.named) CR.name = CR_NAMES[CR.g]; }
    if (lr && CR.row === 3 && CR.play === 'story') CR.mature = !CR.mature;
    if (pressed.b && CR.row !== 1) { setMode('title'); return; }
    if (pressed.a && CR.row === 1 && typeof IS_TOUCH !== 'undefined' && IS_TOUCH) { const n = prompt('Name (up to 10 letters):', CR.name); if (n !== null) { CR.name = n.replace(/[^A-Za-z '\-]/g, '').slice(0, 10); CR.named = true; } CR.row = 2; return; }
    if (pressed.a && CR.row === 4) return crBegin();
    if (pressed.a && CR.row < 4) CR.row++;
  },
  draw() {
    R(0, 0, SW, SH, '#0b0b1c');
    txt(CR.play === 'story' ? 'WHO ARE YOU?' : CR.play === 'explore' ? 'EXPLORE ANTIGO' : 'THE BOOKSTORE', SW / 2, 14, '#ffd860', 'center');
    const dirs = ['down', 'right', 'up', 'left'], dir = dirs[(frame >> 6) % 4];
    win(20, 34, 96, 120); kidFrame(CR.g, dir, (frame >> 3) % KID_META[CR.g].n, 68, 142, 2); txt(CR.name || ' ', 68, 136, '#fff', 'center', SMALL);
    const look = CR.play === 'story' ? '◀ ' + KID_LABEL[CR.g] + ' ▶' : CR.play === 'store' ? '◀ ' + KID_LABEL[CR.g] + ' ▶' : 'THE ROBIN';
    const rows = [['PLAY', '◀ ' + CR_PLAY_LABEL[CR.play] + ' ▶'], ['NAME', CR.name + (CR.row === 1 && (frame >> 4) % 2 ? '_' : ' ')], ['LOOK', look],
      ['STORY', CR.play === 'story' ? (CR.mature ? '◀ MATURE ▶' : '◀ STANDARD ▶') : '-'], ['BEGIN', '']];
    win(124, 34, 236, 120);
    rows.forEach(([k, v], i) => { const y = 48 + i * 21, on = i === CR.row; txt((on ? '▶ ' : '  ') + k, 132, y, on ? '#ffd860' : '#fff', 'left', SMALL); txt(v, 352, y, on ? '#ffd860' : '#c8c8e0', 'right', SMALL); });
    const help = CR.row === 0 ? (CR.play === 'story' ? 'THE STORY: the RPG. You are a video gamer, alone in your room, and the town is waiting. Battles, a party, the inward places.'
        : CR.play === 'explore' ? 'EXPLORE TOWN: just the town, as the Antigo Red Robin. No battles, no story: walk real Antigo and see what is here.'
        : '')
      : CR.row === 1 ? (typeof IS_TOUCH !== 'undefined' && IS_TOUCH ? 'Tap A to type a name.' : 'Type a name. Backspace erases. Arrows move on.')
      : CR.row === 2 ? (CR.play === 'story' ? 'Your look. (Your own sprite sheets will add more.)' : CR.play === 'explore' ? 'In Explore Town you are the Robin: the town\'s own collective character.' : 'Who runs the store.')
      : CR.row === 3 ? (CR.play !== 'story' ? 'Only the story has a mature setting.' : CR.mature ? 'Mature: the inward fights hit harder. Horror, drinking, grief and faith argued hard, with no padding. Never sexual.' : 'Standard: teen and up. The real town, honestly, and the inward fights with a lighter hand.')
      : CR.play === 'story' ? 'A to begin, in your room.' : CR.play === 'explore' ? 'A to begin, outside the bookstore.' : 'A to open the store.';
    win(20, 162, SW - 40, 56); wrap(help, SW - 60, SMALL).slice(0, 4).forEach((l, i) => txt(l, 30, 172 + i * 10, '#fff', 'left', SMALL));
  }
};
function crBegin() {
  const name = (CR.name.trim() || CR_NAMES[CR.g] || 'Player').slice(0, 10);
  if (CR.play === 'store') { S = storeNew(name, CR.g); storeSave(); setMode('store');
    return say([['', 'The Blessed Fig Tree, Fifth and Clermont. ' + name + ' runs the store now.'], ['', 'The picture is your store. The choices around it are your morning: order books, buy used boxes, plan events, then OPEN UP.'], ['', 'Customers come to the counter. Ring them up, recommend books, take trade-ins. Rent is due every Monday. Arrows and A, or tap.']]); }
  if (CR.play === 'explore') { G = newGame({ g: 'robin', name }, false); G.explore = 1; setMode('walk');
    return say([['', 'Antigo, Wisconsin. Every building here stands where it really stands.'], ['', name + ' stands outside The Blessed Fig Tree, on the corner of Fifth and Clermont.'], ['', 'Arrows to walk. A to look. M for the map. Nothing here will fight you.']]); }
  G = newGame({ g: CR.g, name }, CR.mature); G.story = 1; partyEnsure();
  G.inside = { f: 'myroom', x: 4, y: 3 }; G.dir = 'up'; P.t = 0; saveGame(); setMode('inside');
  say([['', 'A room with the curtains drawn. The only light comes from the screen.'], ['', 'The game is paused. The room is very quiet.'], ['', '(Arrows to walk. A to look. The door is behind you. Stand-in opening: Christian writes this.)']]);
}

// the title screen without THE STORE (the bookstore playstyle's own save stays on the device, unused)
{ const _te = MODES.title.enter; MODES.title.enter = function () { _te.call(this); this.opts = this.opts.filter(o => o !== 'THE STORE'); }; }
