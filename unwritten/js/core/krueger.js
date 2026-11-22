"use strict";
// ============================================================================
// The Krueger Pickleball Courts at Jaycee Park, as they are now (Christian, Nov 18: "there is a small bridge access and a
// parking lot of gravel now across spring brook on the road side, and there is a chain link fence around it").
// Measured off the WROC May 2025 photo (0.3 m): OpenStreetMap still has the old 8 tennis courts here; the photo shows
// 16 pickleball courts (two rows of five, two rows of three) on green pads, the layout turned about 4 degrees, an asphalt
// drive along the north side to South Clermont, and a plank footbridge over Spring Brook at the north-west corner.
// The gravel lot on 10th Avenue, the bridge and the chain-link fence are drawn where Christian and the photo put them;
// the fence follows the pads' edge, with a gate by the shelter and one onto the drive.
// ============================================================================
(function () {
  const A = 1.636;   // the courts' long axis (north-south, turned ~4 degrees), same frame as the old OSM courts
  // the old tennis courts come out
  for (let i = SPT.length - 1; i >= 0; i--) { const s = SPT[i]; if (s.k === 'tennis' && s.x > 714 && s.x < 734 && s.y > 1185 && s.y < 1209) SPT.splice(i, 1); }
  // the green pads (cells), then the 16 courts
  const PAD = [[716.4, 1187.25], [731.5, 1187.7], [731.0, 1198.3], [724.25, 1198.3], [724.05, 1207.45], [715.6, 1207.2]];
  SPT.push({ k: 'pk_pad', x: PAD[0][0], y: PAD[0][1], a: 0, ex: PAD });
  const COURTS = [[718.0, 1189.85], [720.8, 1190.0], [724.3, 1190.2], [727.0, 1190.4], [729.85, 1190.6],
                  [717.5, 1195.8], [720.35, 1196.0], [723.8, 1196.1], [726.75, 1196.3], [729.3, 1196.4],
                  [717.2, 1200.4], [719.95, 1200.5], [722.75, 1200.55],
                  [716.95, 1205.0], [719.65, 1205.1], [722.45, 1205.15]];
  for (const [x, y] of COURTS) SPT.push({ k: 'pickle', x, y, a: A, L: 13.41, W: 6.1 });
  SPDRAW.pk_pad = s => { ctx.beginPath(); s.ex.forEach(([x, y], i) => { const X = (x - s.x) * T, Y = (y - s.y) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath();
    ctx.fillStyle = '#6f9262'; ctx.fill(); ctx.strokeStyle = '#5a7a50'; ctx.lineWidth = 2; ctx.stroke(); };
  SPDRAW.pickle = s => {   // 20 x 44 ft: blue court, the light non-volley zone 7 ft each side of the net, centre lines, the net
    const L = s.L, W = s.W, k = 2.13;
    spRect('#4c5c9c', -L / 2, -W / 2, L, W); spRect('#c9d3e2', -k, -W / 2, 2 * k, W);
    spBox(-L / 2, -W / 2, L, W); spLine(-L / 2, 0, -k, 0); spLine(k, 0, L / 2, 0); spLine(-k, -W / 2, -k, W / 2); spLine(k, -W / 2, k, W / 2);
    spLine(0, -W / 2 - 0.3, 0, W / 2 + 0.3, '#1c1c22', 2); spLine(0, -W / 2 - 0.3, 0, W / 2 + 0.3, 'rgba(255,255,255,.7)', 1);
  };
  // the asphalt drive along the north side, from the shelter to South Clermont
  const addVec = (o) => { const xs = o.P.map(p => p[0]), ys = o.P.map(p => p[1]); Object.assign(o, { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), cap: [2, 2] }); VEC.push(o); };
  addVec({ cl: 'service', w: 1.4, name: '', P: [[712.4, 1186.9], [731.6, 1187.4], [738.0, 1185.7], [750.2, 1185.3]] });
  // a walk from the gravel lot down to the bridge, and off the bridge onto the drive
  addVec({ cl: 'path', w: 0.5, P: [[713.1, 1180.9], [713.1, 1183.1]] });
  addVec({ cl: 'path', w: 0.5, P: [[713.1, 1186.1], [713.1, 1186.8]] });
  // the bridge is walkable: the brook's cells under it become a path
  for (let y = 1183; y <= 1186; y++) for (const x of [712, 713]) if (tAt(x, y) === TL.WATER) TT[y * TW + x] = TL.PATH;
  // the gravel lot on 10th Avenue, west of the fenced equipment yard, down to the brook's bank
  const LOT = [[697.4, 1173.7], [713.6, 1173.9], [713.6, 1181.4], [705.0, 1181.0], [697.4, 1180.4]];
  const BRIDGE = { x: 713.1, y0: 1183.0, y1: 1186.2, w: 0.5 };
  let GPAT = null;
  const gravel = () => { if (GPAT) return GPAT; const c = document.createElement('canvas'); c.width = c.height = 16; const g = c.getContext('2d'); g.fillStyle = '#a89c86'; g.fillRect(0, 0, 16, 16);
    for (let i = 0; i < 46; i++) { const h = hash(i * 7, i * 13); g.fillStyle = ['#bdb19a', '#8e8270', '#c8bea8', '#9a8e7a'][h % 4]; g.fillRect(h % 16, (h >> 4) % 16, 1 + (h >> 9) % 2, 1); } return GPAT = ctx.createPattern(c, 'repeat'); };
  const _ds = drawStreets;
  drawStreets = function () {
    if (camX < 725 && camX + SW / T > 690 && camY < 1190 && camY + SH / T > 1165) {
      const p = gravel(); p.setTransform(new DOMMatrix().translateSelf(-Math.round(camX * T) % 16, -Math.round(camY * T) % 16));
      ctx.beginPath(); LOT.forEach(([x, y], i) => { const X = (x - camX) * T, Y = (y - camY) * T; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.closePath();
      ctx.fillStyle = p; ctx.fill(); ctx.strokeStyle = '#8a8070'; ctx.lineWidth = 2; ctx.stroke();
    }
    _ds();
    if (Math.abs(BRIDGE.x - camX - SW / T / 2) < SW / T && Math.abs(BRIDGE.y0 - camY - SH / T / 2) < SH / T) {   // plank deck with side rails
      const X0 = Math.round((BRIDGE.x - BRIDGE.w / 2 - camX) * T), X1 = Math.round((BRIDGE.x + BRIDGE.w / 2 - camX) * T), Y0 = Math.round((BRIDGE.y0 - camY) * T), Y1 = Math.round((BRIDGE.y1 - camY) * T);
      F('rgba(0,0,0,.25)', X0 + 3, Y0 + 3, X1 - X0, Y1 - Y0); F('#8a6a48', X0, Y0, X1 - X0, Y1 - Y0);
      for (let y = Y0; y < Y1; y += 3) F('#6e5238', X0, y, X1 - X0, 1);
      F('#5a4430', X0 - 2, Y0, 2, Y1 - Y0); F('#5a4430', X1, Y0, 2, Y1 - Y0);
      for (let y = Y0; y <= Y1; y += Math.round(PM * 1.5)) { F('#4a3626', X0 - 2, y - 4, 2, 5); F('#4a3626', X1, y - 4, 2, 5); }
    }
  };
  // the chain-link fence on the pads' edge, in short runs so it sorts in front of and behind the player properly;
  // gates: the west side by the shelter, and the north side onto the drive
  const GATES = [[715.9, 1189.3, 716.6, 1190.6], [721.6, 1187.0, 722.8, 1188.2]];
  const inGate = (x, y) => GATES.some(([a, b, c, d]) => x >= a && x <= c && y >= b && y <= d);
  for (let i = 0; i < PAD.length; i++) { const [ax, ay] = PAD[i], [bx, by] = PAD[(i + 1) % PAD.length], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(L));
    for (let j = 0; j < n; j++) { const x1 = ax + (bx - ax) * j / n, y1 = ay + (by - ay) * j / n, x2 = ax + (bx - ax) * (j + 1) / n, y2 = ay + (by - ay) * (j + 1) / n;
      if (inGate((x1 + x2) / 2, (y1 + y2) / 2)) continue;
      PROPS.push({ x: (x1 + x2) / 2, y: Math.max(y1, y2) + 0.01, k: 'chainlink', x1, y1, x2, y2 }); } }
  // the pickleball game starts at the first row's second court, by its net, and the loose stand-in net goes
  const KC = PLAYCOURTS.find(c => /Krueger/.test(c.name));
  if (KC) { KC.x = 720.8; KC.y = 1191.4; for (let i = PROPS.length - 1; i >= 0; i--) if (PROPS[i].k === 'ct_net' && Math.abs(PROPS[i].x - 724.5) < 4 && Math.abs(PROPS[i].y - 1198.5) < 4) PROPS.splice(i, 1); }
  PROPS.sort((a, b) => a.y - b.y);
  const _dp = drawProp;
  drawProp = function (p) {
    if (p.k !== 'chainlink') return _dp(p);
    const h = PM * 3.0, X1 = p.x1 * T, Y1 = p.y1 * T, X2 = p.x2 * T, Y2 = p.y2 * T;
    if (Math.abs(X2 - X1) < Math.abs(Y2 - Y1) * 0.5) {   // a north-south run, seen end-on from the south: a narrow strip of mesh with its posts
      const xs = Math.round(Math.min(X1, X2)) - 2, top = Math.round(Math.min(Y1, Y2) - h), bot = Math.round(Math.max(Y1, Y2));
      F('rgba(176,182,188,.35)', xs, top, Math.abs(X2 - X1) + 5, bot - top); for (let y = top; y < bot; y += 3) F('rgba(200,206,212,.5)', xs, y, Math.abs(X2 - X1) + 5, 1);
      F('#7a7e84', xs + 1, top, 2, bot - top); F('#6a6e74', Math.round(X1) - 1, Math.round(Y1 - h), 3, Math.round(h)); F('rgba(0,0,0,.15)', xs + 4, top + h, 2, bot - top - h); return;
    }
    ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X2, Y2); ctx.lineTo(X2, Y2 - h); ctx.lineTo(X1, Y1 - h); ctx.closePath();
    ctx.fillStyle = 'rgba(176,182,188,.22)'; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(196,202,208,.45)'; ctx.lineWidth = 1; ctx.beginPath();
    const x0 = Math.min(X1, X2) - h, x1 = Math.max(X1, X2) + h, yt = Math.min(Y1, Y2) - h, yb = Math.max(Y1, Y2);
    for (let x = x0; x < x1; x += 4) { ctx.moveTo(x, yt); ctx.lineTo(x + (yb - yt), yb); ctx.moveTo(x, yb); ctx.lineTo(x + (yb - yt), yt); }
    ctx.stroke(); ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.moveTo(X1, Y1); ctx.lineTo(X2, Y2); ctx.lineTo(X2, Y2 + 2); ctx.lineTo(X1, Y1 + 2); ctx.fill();
    ctx.strokeStyle = '#7a7e84'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X1, Y1 - h); ctx.lineTo(X2, Y2 - h); ctx.stroke();   // top rail
    F('#6a6e74', Math.round(X1) - 1, Math.round(Y1 - h), 3, Math.round(h));   // post
  };
})();
