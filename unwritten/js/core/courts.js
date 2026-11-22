"use strict";
// =====================================================================
//  PLAYCOURTS: pickup basketball and pickleball where Antigo's real courts are (Christian, Nov 17: "we need a simple
//  pickleball and basketball game at each park" ... "well, where those courts are").
//  Where (OpenStreetMap court polygons, the Street View places survey, and the court directories pickleheads.com
//  and bounce.game, checked Nov 17, 2026):
//   - Jaycee Park: the Krueger Pickleball Courts, 16 outdoor courts with permanent lines and nets (opened 2025).
//   - Elleson Courts at the high school, 10th Avenue: lighted outdoor courts used for open pickleball play.
//   - Mendik Park: a fenced asphalt basketball court; pickleball players bring their own nets.
//   - North Clermont Playground: a basketball hoop on the playground lawn.
//  The other players are generic park regulars, never real people.
// =====================================================================
const PLAYCOURTS = [
  { name: 'the Krueger Pickleball Courts at Jaycee Park', at: [723.5, 1198.5], pb: 1, intro: 'Sixteen pickleball courts with permanent nets, new in 2025. A regular is warming up.' },
  { name: 'Elleson Courts at the high school', at: [385.5, 1186.2], pb: 1, intro: 'The lighted courts by the high school. Open play is on; a regular waves you over.' },
  { name: 'the Mendik Park court', at: [775.5, 655.6], bb: 1, pb: 1, portable: 1, drawn: 1, intro: 'A fenced asphalt court with two hoops. Pickleball people bring their own net here.' },
  { name: 'the North Clermont Playground hoop', at: [765.0, 447.5], bb: 1, intro: 'One hoop on a post at the edge of the playground lawn.' },
].map(c => { try { const [x, y] = freeNearM(Math.round(c.at[0]), Math.round(c.at[1])); return Object.assign(c, { x, y }); } catch (e) { return Object.assign(c, { x: c.at[0], y: c.at[1] }); } });
for (const c of PLAYCOURTS) { if (c.bb && !c.drawn) PROPS.push({ x: c.x - 0.6, y: c.y - 0.2, k: 'ct_hoop' }); if (c.pb) PROPS.push({ x: c.x + 0.8, y: c.y - 0.1, k: 'ct_net', portable: c.portable }); }
PROPS.sort((a, b) => a.y - b.y);
{ const _dp = drawProp; drawProp = function (p) {
  if (p.k !== 'ct_hoop' && p.k !== 'ct_net') return _dp(p);
  const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM);
  if (p.k === 'ct_hoop') { F('rgba(0,0,0,.22)', x - 3, y - 1, m(1.2), 3); F('#3a5aa0', x - 2, y - m(3.0), 4, m(3.0)); F('#3a5aa0', x - 2, y - m(3.0), m(0.7), 3);
    F('#f2f2f2', x + m(0.4), y - m(3.6), m(1.2), m(0.8)); F('#c84a2a', x + m(0.4), y - m(3.6), m(1.2), 1); F('#e86a2a', x + m(0.75), y - m(2.85), m(0.5), 2); return; }
  F('rgba(0,0,0,.2)', x - m(1.6), y - 1, m(3.2), 3); F(p.portable ? '#2a2a2e' : '#3a3e46', x - m(1.6), y - m(0.95), 2, m(0.95)); F(p.portable ? '#2a2a2e' : '#3a3e46', x + m(1.6) - 2, y - m(0.95), 2, m(0.95));
  F('rgba(30,30,34,.55)', x - m(1.6), y - m(0.9), m(3.2), m(0.6)); F('#f2f2f2', x - m(1.6), y - m(0.95), m(3.2), 2);
}; }
{ const _la = lookAt; lookAt = function (x, y) {
  if (mode === 'walk' && !DLG) { const c = PLAYCOURTS.find(c => Math.hypot(x - c.x, y - c.y) < 3.2); if (c) return courtIntro(c); }
  return _la(x, y);
}; }
function courtIntro(c) {
  G.courts = G.courts || { hoops: {}, pb: { w: 0, l: 0 } };
  const o = [];
  if (c.bb) o.push({ t: 'Shootaround, 60 seconds' + (G.courts.hoops.shoot != null ? ' (best ' + G.courts.hoops.shoot + ')' : ''), f: () => hoopsStart(c, 'shoot') },
                   { t: 'Ten free throws' + (G.courts.hoops.ft != null ? ' (best ' + G.courts.hoops.ft + '/10)' : ''), f: () => hoopsStart(c, 'ft') });
  if (c.pb) o.push({ t: 'Pickleball to 11' + (G.courts.pb.w + G.courts.pb.l ? ' (' + G.courts.pb.w + '-' + G.courts.pb.l + ')' : ''), f: () => pbStart(c) }, { t: 'How pickleball works', f: () => say(PB_RULES) });
  o.push({ t: 'Not now' });
  ask(c.intro, o);
}
const PB_RULES = [['', 'Serve underhand, diagonally, past the kitchen line. The serve has to bounce, and so does the return.'],
  ['', 'After those two bounces you can volley, but not while standing in the kitchen, the 7 feet each side of the net.'],
  ['', 'A ball that bounces twice, lands out or hits the net loses the rally. Here every rally scores; first to 11, win by 2.'],
  ['', 'Move with the arrows. A swings. Hold UP to drive it hard and deep, DOWN to dink it soft into the kitchen.']];

// ---------------- BASKETBALL: a half court seen from above, the rim at the top ----------------
let HPS = null;
const HOOP_SPOTS = [   // [x ft from the rim's centre, y ft out, points, name]
  [0, 4, 2, 'LAYUP'], [-15, 6, 2, 'LEFT BLOCK'], [0, 15, 1, 'FREE THROW'], [14, 12, 2, 'RIGHT ELBOW'], [-21, 3, 3, 'LEFT CORNER THREE'],
  [-16, 17, 3, 'LEFT WING THREE'], [0, 23.75, 3, 'TOP OF THE KEY'], [16, 17, 3, 'RIGHT WING THREE'], [21, 3, 3, 'RIGHT CORNER THREE']];
function hoopsStart(c, kind) { HPS = { c, kind, ret: mode, t: 0, time: kind === 'shoot' ? 60 * 60 : 0, spot: kind === 'ft' ? 2 : 0, score: 0, shots: 0, makes: 0, phase: 'set', needle: 0, nd: 1, msg: kind === 'ft' ? 'Ten from the line.' : 'Make it and move on. Sixty seconds.' }; setMode('hoops'); }
const hpS = (x, y) => [SW / 2 + x * 6.4, 46 + y * 6.4];
MODES.hoops = {
  update() {
    if (DLG) return dlgUpdate();
    const H = HPS; H.t++;
    if (H.kind === 'shoot' && H.phase !== 'done') { H.time--; if (H.time <= 0 && H.phase !== 'fly') return hoopsEnd(); }
    if (pressed.b && H.phase !== 'fly') return ask('Leave the court?', [{ t: 'Keep shooting' }, { t: 'Leave', f: () => { const r = HPS.ret; HPS = null; setMode(r || 'walk'); } }]);
    const sp = HOOP_SPOTS[H.spot], dist = Math.hypot(sp[0], sp[1]);
    if (H.phase === 'set') { if (pressed.a) { H.phase = 'meter'; H.needle = 0; H.nd = 1; } return; }
    if (H.phase === 'meter') {   // the needle sweeps; the green window shrinks with distance
      H.needle += H.nd * (0.012 + dist * 0.0005); if (H.needle >= 1) { H.needle = 1; H.nd = -1; } if (H.needle <= 0) { H.needle = 0; H.nd = 1; }
      if (pressed.a) { const win = Math.max(0.12, 0.30 - dist * 0.0065), off = Math.abs(H.needle - 0.72);
        H.good = off <= win / 2 ? 1 : off <= win ? 0.5 : 0; H.make = H.good === 1 ? Math.random() < 0.93 : H.good ? Math.random() < 0.45 : Math.random() < 0.06;
        H.short = H.needle < 0.72; H.phase = 'fly'; H.f = 0; H.shots++; if (typeof SND !== 'undefined') SND.play('hit'); }
      return; }
    if (H.phase === 'fly') { H.f++; if (H.f === 42) {
        if (H.make) { H.makes++; H.score += H.kind === 'ft' ? 1 : sp[2]; H.msg = ['Swish.', 'Bottom of the net.', 'Off the glass and in.', 'Count it.'][H.shots % 4]; if (typeof SND !== 'undefined') SND.play('free');
          if (H.kind === 'shoot') H.spot = (H.spot + 1) % HOOP_SPOTS.length; }
        else H.msg = H.good ? 'In and out.' : H.short ? 'Short. Front rim.' : 'Long. Off the back iron.'; }
      if (H.f > 64) { H.phase = 'set'; if (H.kind === 'ft' && H.shots >= 10) return hoopsEnd(); } }
  },
  draw() {
    const H = HPS; if (!H) return; const sp = HOOP_SPOTS[H.spot];
    R(0, 0, SW, SH, '#3a6a32'); R(SW / 2 - 25 * 6.4, 40, 50 * 6.4, SH - 80, '#c88a56');   // the asphalt or wood half court
    ctx.strokeStyle = '#f2f2f2'; ctx.lineWidth = 2; const [rx, ry] = hpS(0, 0);
    ctx.strokeRect(SW / 2 - 6 * 6.4, 40, 12 * 6.4, 19 * 6.4); ctx.beginPath(); ctx.arc(rx, 40 + 19 * 6.4, 6 * 6.4, 0, Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(SW / 2 - 22 * 6.4, 40); ctx.lineTo(SW / 2 - 22 * 6.4, ry + 23.75 * 6.4 * Math.sin(0.38)); ctx.arc(rx, ry, 23.75 * 6.4, Math.PI - 0.38, 0.38, true); ctx.lineTo(SW / 2 + 22 * 6.4, 40); ctx.stroke();
    R(rx - 20, 40, 40, 4, '#f2f2f2'); ctx.strokeStyle = '#e86a2a'; ctx.beginPath(); ctx.arc(rx, ry, 6, 0, 7); ctx.stroke();
    // the spots still to go, and you at this one
    HOOP_SPOTS.forEach((s, i) => { const [x, y] = hpS(s[0], s[1]); R(x - 2, y - 2, 4, 4, i === H.spot ? '#ffd860' : 'rgba(255,255,255,.35)'); });
    const [px, py] = hpS(sp[0], sp[1]);
    if (typeof kidFrame === 'function' && G.kid) kidFrame(G.kid.g, 'up', H.phase === 'fly' && H.f < 8 ? 1 : 0, px, py + 18, 0.8); else R(px - 4, py - 4, 8, 20, '#c84a3a');
    if (H.phase === 'fly') { const t = Math.min(1, H.f / 42), miss = H.make ? 0 : (H.short ? -0.12 : 0.1), ex = rx + (H.make ? 0 : (H.short ? 0 : 6)), ey = ry + (H.make ? 0 : miss * 40);
      const bx = px + (ex - px) * t, by = py + (ey - py) * t - Math.sin(t * Math.PI) * (30 + Math.hypot(sp[0], sp[1]) * 1.6);
      R(px + (ex - px) * t - 3, py + (ey - py) * t - 1, 6, 3, 'rgba(0,0,0,.3)'); ctx.fillStyle = '#e8762a'; ctx.beginPath(); ctx.arc(bx, by, 4, 0, 7); ctx.fill(); ctx.strokeStyle = '#3a1a0a'; ctx.lineWidth = 1; ctx.stroke(); }
    win(4, 4, SW - 8, 22);
    txt(H.kind === 'ft' ? 'FREE THROWS  ' + H.makes + '/' + H.shots : 'SCORE ' + H.score + '   ' + sp[3] + (sp[2] === 3 ? ' (3)' : ''), 12, 9, '#ffd860', 'left', SMALL);
    if (H.kind === 'shoot') txt(Math.max(0, Math.ceil(H.time / 60)) + ' S', SW - 14, 9, H.time < 600 ? '#ff8a6a' : '#fff', 'right', SMALL);
    win(4, SH - 38, SW - 8, 34);
    if (H.phase === 'meter') { const x0 = 40, w = SW - 80, dist = Math.hypot(sp[0], sp[1]), wn = Math.max(0.12, 0.30 - dist * 0.0065);
      R(x0, SH - 30, w, 10, '#101028'); R(x0 + w * (0.72 - wn), SH - 30, w * wn * 2, 10, 'rgba(255,224,128,.35)'); R(x0 + w * (0.72 - wn / 2), SH - 30, w * wn, 10, 'rgba(120,232,120,.6)');
      R(x0 + w * H.needle - 1, SH - 33, 2, 16, '#ff6060'); txt('A: RELEASE IN THE GREEN', SW / 2, SH - 17, '#c8c8e0', 'center', SMALL); }
    else txt((H.msg || '') + (H.phase === 'set' ? '   A: SHOOT   B: LEAVE' : ''), SW / 2, SH - 26, '#fff', 'center', SMALL);
    if (DLG) dlgDraw();
  },
};
function hoopsEnd() {
  const H = HPS; H.phase = 'done'; const key = H.kind, val = H.kind === 'ft' ? H.makes : H.score; G.courts = G.courts || { hoops: {}, pb: { w: 0, l: 0 } };
  const best = G.courts.hoops[key] == null || val > G.courts.hoops[key]; if (best) G.courts.hoops[key] = val; saveGame();
  const r = H.ret; HPS = null; setMode(r || 'walk');
  say([['', H.kind === 'ft' ? 'Free throws: ' + val + ' of 10.' : 'Time. ' + val + ' points on ' + H.makes + ' of ' + H.shots + ' shots.'], ['', best ? 'Your best yet on these courts.' : 'The rim will be here tomorrow.']]);
}

// ---------------- PICKLEBALL: singles against a park regular, seen from above; you at the bottom ----------------
let PKB = null;
const PB_G = 32 / 3600, PB_NET = 2.9;   // gravity in ft per frame squared at 60 frames a second; net height (ft)
function pbStart(c) { PKB = { c, ret: mode, me: 0, cpu: 0, server: 'me', t: 0, msg: 'First to 11, win by 2. You serve.', p: { x: 15, y: 46 }, o: { x: 5, y: -2 }, ball: null, phase: 'serve', swing: 0 }; pbServeSetup(); setMode('pickle'); }
function pbServeSetup() {
  const P = PKB, even = (P.server === 'me' ? P.me : P.cpu) % 2 === 0;   // serve from the right when your score is even
  if (P.server === 'me') { P.p = { x: even ? 15 : 5, y: 45.5 }; P.o = { x: even ? 15 : 5, y: -1.5 }; } else { P.o = { x: even ? 5 : 15, y: -1.5 }; P.p = { x: even ? 5 : 15, y: 45.5 }; }
  P.ball = null; P.phase = 'serve'; P.t = 0; P.hits = 0; P.srvX = P.server === 'me' ? P.p.x : P.o.x; P.bounced = false; P.lastHit = null; P.side = null;
}
function pbLaunch(from, tx, ty, kind, who) {   // a ball from where it is to land at (tx, ty)
  let t = { drive: 38, dink: 50, serve: 62, lob: 80, deep: 54 }[kind] || 54; const z0 = Math.max(1.5, from.z || 2.5);
  // a clean shot clears the net by a little: give it more air until it does
  const zAt = (tt, k) => { const vz = (0.5 * PB_G * tt * tt - z0) / tt; return z0 + vz * k - 0.5 * PB_G * k * k; };
  const cross = Math.abs(ty - from.y) > 0.1 ? (22 - from.y) / (ty - from.y) : -1;
  for (let i = 0; i < 20 && cross > 0 && cross < 1 && zAt(t, cross * t) < PB_NET + 0.5; i++) t += 4;
  const vz = (0.5 * PB_G * t * t - z0) / t;
  PKB.ball = { x: from.x, y: from.y, z: z0, vx: (tx - from.x) / t, vy: (ty - from.y) / t, vz, crossed: false };
  PKB.lastHit = who; PKB.bounced = false; PKB.side = null; PKB.hits++; if (typeof SND !== 'undefined') SND.play('hit');
}
function pbPoint(winner, why) {
  const P = PKB; if (winner === 'me') P.me++; else P.cpu++; P.server = winner; P.msg = why; P.phase = 'between'; P.t = 0;
  if (typeof SND !== 'undefined') SND.play(winner === 'me' ? 'ok' : 'weak');
  if ((P.me >= 11 || P.cpu >= 11) && Math.abs(P.me - P.cpu) >= 2) P.phase = 'over';
}
MODES.pickle = {
  update() {
    if (DLG) return dlgUpdate();
    const P = PKB; P.t++;
    if (pressed.b && P.phase !== 'over') return ask('Leave the game?', [{ t: 'Keep playing' }, { t: 'Leave', f: () => { const r = PKB.ret; PKB = null; setMode(r || 'walk'); } }]);
    if (P.phase === 'over') { if (P.t > 40 && pressed.a) { const won = P.me > P.cpu; G.courts = G.courts || { hoops: {}, pb: { w: 0, l: 0 } }; G.courts.pb[won ? 'w' : 'l']++; saveGame();
        const r = P.ret, s = P.me + '-' + P.cpu; PKB = null; setMode(r || 'walk');
        say([['', (won ? 'You win, ' : 'The regular wins, ') + (won ? s : s.split('-').reverse().join('-')) + '.'], ['Regular', won ? 'Good game. Same time next week?' : 'Good game. Keep coming out; the dinks get easier.']]); }
      return; }
    if (P.phase === 'between') { if (P.t > 70 || (P.t > 20 && pressed.a)) pbServeSetup(); return; }
    // you move; the kitchen line is 7 ft from the net (y 29 on your side)
    const sp = 0.22, frozen = P.phase === 'serve' && P.server === 'me'; if (held.left && !frozen) P.p.x -= sp; if (held.right && !frozen) P.p.x += sp; if (held.up && P.phase !== 'serve') P.p.y -= sp; if (held.down && P.phase !== 'serve') P.p.y += sp;
    P.p.x = Math.max(-4, Math.min(24, P.p.x)); P.p.y = Math.max(23, Math.min(50, P.p.y));
    if (P.phase === 'serve') {
      if (P.server === 'me') { P.msg = 'Your serve: A. Aim with LEFT and RIGHT.'; if (pressed.a) { const right = P.p.x > 10;
          pbLaunch({ x: P.p.x, y: P.p.y, z: 2 }, (right ? 5 : 15) + (held.left ? -3 : held.right ? 3 : 0), 6 + Math.random() * 5, 'serve', 'me'); P.phase = 'rally'; P.msg = null; } }
      else if (P.t > 55) { const right = P.o.x < 10; pbLaunch({ x: P.o.x, y: P.o.y, z: 2 }, right ? 15 : 5, 38 + Math.random() * 5, 'serve', 'cpu'); P.phase = 'rally'; P.msg = null; }
      return; }
    const B = P.ball; if (!B) return;
    // the ball flies
    const py0 = B.y; B.x += B.vx; B.y += B.vy; B.z += B.vz; B.vz -= PB_G;
    if (!B.crossed && (py0 - 22) * (B.y - 22) <= 0) { B.crossed = true; if (B.z < PB_NET) return pbPoint(P.lastHit === 'me' ? 'cpu' : 'me', P.lastHit === 'me' ? 'Into the net.' : 'The regular nets it.'); }
    if (B.z <= 0) {   // a bounce
      B.z = 0; B.vz = Math.abs(B.vz) * 0.62; B.vx *= 0.85; B.vy *= 0.85;
      const mySide = B.y > 22;
      if (!P.bounced) { P.bounced = true;
        const out = B.x < 0 || B.x > 20 || B.y < 0 || B.y > 44;
        const serveFault = P.hits === 1 && (P.lastHit === 'me' ? (B.y > 15 || (P.srvX > 10 ? B.x > 10 : B.x < 10)) : (B.y < 29 || (P.srvX < 10 ? B.x < 10 : B.x > 10)));
        if (out || serveFault) return pbPoint(P.lastHit === 'me' ? 'cpu' : 'me', serveFault && !out ? 'The serve misses the box.' : P.lastHit === 'me' ? 'Out.' : 'The regular hits it out.');
        if ((P.lastHit === 'me') === mySide) return pbPoint(P.lastHit === 'me' ? 'cpu' : 'me', P.lastHit === 'me' ? 'Short of the net.' : 'The regular\'s shot dies short of the net.'); }
      else return pbPoint(mySide ? 'cpu' : 'me', mySide ? 'Two bounces on your side.' : 'Two bounces. It got past the regular.');
    }
    if (B.y > 60 || B.y < -16 || B.x < -14 || B.x > 34) return pbPoint(P.bounced ? (B.y > 22 ? 'cpu' : 'me') : (P.lastHit === 'me' ? 'cpu' : 'me'), P.bounced ? 'Past you.' : 'Way out.');
    // your swing: A arms it for a moment; it connects if the ball comes within reach
    if (pressed.a) P.swing = 14; if (P.swing > 0) P.swing--;
    const mustBounce = P.hits <= 2;   // the two-bounce rule: the serve and the return each bounce before anyone volleys
    if (P.swing > 0 && P.lastHit === 'cpu' && B.y > 22 && Math.hypot(B.x - P.p.x, B.y - P.p.y) < 3.4 && B.z < 6) {
      if (mustBounce && !P.bounced) return pbPoint('cpu', 'Let it bounce first: the two-bounce rule.');
      if (!P.bounced && P.p.y < 29) return pbPoint('cpu', 'A volley from inside the kitchen.');
      const off = Math.abs(B.x - P.p.x) / 3.4, err = off * (held.up ? 5 : 3);
      const kind = held.up ? 'drive' : held.down ? 'dink' : 'deep', aimX = held.left ? 3 : held.right ? 17 : (P.p.x < 10 ? 15 : 5);
      const ty = kind === 'dink' ? 17 + Math.random() * 3 : kind === 'drive' ? 3 + Math.random() * 6 : 5 + Math.random() * 7;
      pbLaunch(B, aimX + (Math.random() - 0.5) * 2 * err, ty - (Math.random() < off * 0.25 ? 8 : 0), kind, 'me'); P.swing = 0; return; }
    // the regular moves to the ball and sends it back
    const O = P.o, home = P.hits >= 3 ? 13 : 1;
    const want = B.y < 22 && P.lastHit === 'me' ? { x: B.x + B.vx * 10, y: Math.min(home, Math.max(-2, B.y - 1)) } : { x: 10 + (B.x - 10) * 0.4, y: home };
    O.x += Math.max(-0.2, Math.min(0.2, want.x - O.x)); O.y += Math.max(-0.16, Math.min(0.16, want.y - O.y));
    if (P.lastHit === 'me' && B.y < 22 && Math.hypot(B.x - O.x, B.y - O.y) < 3 && B.z < 6 && (P.bounced || (!mustBounce && O.y < 15))) {
      const hard = Math.hypot(B.vx, B.vy) > 0.9 ? 0.2 : 0.04, reach = Math.hypot(B.x - O.x, B.y - O.y) / 3;
      if (Math.random() < hard + reach * 0.08) { pbLaunch(B, O.x + (Math.random() - 0.5) * 6, 24 + Math.random() * 2, 'deep', 'cpu'); P.ball.vz *= 0.55; return; }   // a weak one, likely into the net
      const dink = O.y > 10 && Math.random() < 0.6;
      pbLaunch(B, Math.random() < 0.5 ? 3 + Math.random() * 4 : 13 + Math.random() * 4, dink ? 25 + Math.random() * 3 : 33 + Math.random() * 9, dink ? 'dink' : 'deep', 'cpu'); }
  },
  draw() {
    const P = PKB; if (!P) return; const z = 4.6, ox = SW / 2 - 10 * z, oy = 32;
    const S = (x, y, h) => [ox + x * z, oy + y * z - (h || 0) * z * 0.55];
    R(0, 0, SW, SH, '#2e5a3a'); R(ox - 10 * z, oy - 8 * z, 40 * z, 60 * z, '#3a6a8a');   // the court surface and its surround
    R(ox, oy, 20 * z, 44 * z, '#3a7aa8'); R(ox, oy + 15 * z, 20 * z, 14 * z, '#4a8ab8');   // the kitchen in a lighter blue
    ctx.strokeStyle = '#f2f2f2'; ctx.lineWidth = 1.5; ctx.strokeRect(ox, oy, 20 * z, 44 * z);
    ctx.beginPath(); ctx.moveTo(ox, oy + 15 * z); ctx.lineTo(ox + 20 * z, oy + 15 * z); ctx.moveTo(ox, oy + 29 * z); ctx.lineTo(ox + 20 * z, oy + 29 * z);
    ctx.moveTo(ox + 10 * z, oy); ctx.lineTo(ox + 10 * z, oy + 15 * z); ctx.moveTo(ox + 10 * z, oy + 29 * z); ctx.lineTo(ox + 10 * z, oy + 44 * z); ctx.stroke();
    const drawCpu = () => { const [x, y] = S(P.o.x, P.o.y, 0); R(x - 4, y - 2, 8, 3, 'rgba(0,0,0,.3)'); R(x - 3, y - 14, 6, 9, '#3a6a3a'); R(x - 3, y - 5, 2, 5, '#3a3a52'); R(x + 1, y - 5, 2, 5, '#3a3a52');
      R(x - 3, y - 19, 6, 5, '#d8a882'); R(x - 3, y - 20, 6, 2, '#8a8a8a'); R(x + 3, y - 12, 4, 3, '#c84a2a'); };
    const drawMe = () => { const [x, y] = S(P.p.x, P.p.y, 0); if (typeof kidFrame === 'function' && G.kid) kidFrame(G.kid.g, 'up', P.swing > 8 ? 1 : 0, x, y + 2, 0.7); else R(x - 4, y - 18, 8, 18, '#c84a3a');
      if (P.swing > 0) R(x + 4, y - 14, 5, 3, '#e8c040'); };
    drawCpu();
    // the net, across the middle
    const [nx0, ny] = S(0, 22, 0); R(nx0 - 4, ny - PB_NET * z * 0.55, 20 * z + 8, PB_NET * z * 0.55, 'rgba(20,20,24,.55)'); R(nx0 - 4, ny - PB_NET * z * 0.55, 20 * z + 8, 2, '#f2f2f2');
    if (P.ball) { const B = P.ball, [sx, sy] = S(B.x, B.y, 0), [bx, by] = S(B.x, B.y, B.z); R(sx - 2, sy - 1, 4, 2, 'rgba(0,0,0,.35)'); R(bx - 2, by - 2, 4, 4, '#e8e040'); R(bx - 1, by - 2, 1, 1, '#fff'); }
    drawMe();
    win(4, 4, SW - 8, 20); txt('YOU ' + P.me + '   REGULAR ' + P.cpu + '   ' + (P.server === 'me' ? 'YOUR SERVE' : 'THEIR SERVE'), 12, 8, '#ffd860', 'left', SMALL);
    win(4, SH - 30, SW - 8, 26);
    txt(P.phase === 'over' ? (P.me > P.cpu ? 'GAME. YOU WIN ' : 'GAME. THE REGULAR WINS ') + Math.max(P.me, P.cpu) + '-' + Math.min(P.me, P.cpu) + '   A' : P.msg || 'A: SWING   HOLD UP: DRIVE   DOWN: DINK   B: LEAVE', SW / 2, SH - 22, '#fff', 'center', SMALL);
    if (DLG) dlgDraw();
  },
};
