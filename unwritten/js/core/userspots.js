"use strict";
// ============================================================================
// Owner-flagged spots (Christian, Nov 19), the parts that need code; the ground tiles are in js/data/fixes/user.js.
//  - Spring Brook south of the East 2nd Avenue bridge: "land mixed with water oddly". Two traced water shapes overlapped
//    there, and the even-odd fill cut the overlap back to grass in strips. Now one pond, traced from the May 2025 photo:
//    the open water to the west, the long reedy spit running south from the bridge, the narrow channel east of it.
//  - The Taco Bell pole sign by Neva Road, where the photo shows its pole and shadow.
//  - Langlade Road ball diamond: bleachers from the photo, and a painted crosswalk over Langlade Road at East 2nd Avenue.
// ============================================================================
(function () {
  const inP = (P, x, y) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; };
  const near = (p, x, y) => Math.abs(p[0] * 4 - x) < 1.2 && Math.abs(p[1] * 4 - y) < 1.2;

  // ---- Spring Brook pond (game metres) ----
  const POND = [[4101, 3516], [4100, 3510], [4101, 3504], [4101, 3492], [4105, 3487], [4107, 3479], [4112, 3474], [4115, 3466], [4120, 3457], [4124, 3450],
    [4130, 3444], [4138, 3440], [4146, 3435], [4158, 3432], [4166, 3421], [4177, 3412], [4180, 3407], [4189, 3401], [4198, 3393], [4200, 3392], [4226, 3392],
    [4228, 3405], [4228, 3420], [4226, 3432], [4224, 3442], [4221, 3450], [4218, 3450], [4217, 3441], [4215, 3429], [4217, 3419], [4214, 3416], [4209, 3416],
    [4206, 3421], [4204, 3432], [4200, 3440], [4199, 3447], [4202, 3457], [4198, 3463], [4195, 3470], [4192, 3478], [4193, 3494], [4192, 3509], [4190, 3515]];
  const wi = WATERS.findIndex(w => w.R[0].some(p => near(p, 4104, 3534)) && w.R[0].some(p => near(p, 4190, 3510)));
  if (wi >= 0) {
    const R = WATERS[wi].R[0], a = R.findIndex(p => near(p, 4104, 3534)), b = R.findIndex(p => near(p, 4190, 3510));
    if (a >= 0 && b > a) {
      R.splice(a, b - a + 1, ...POND.map(([x, y]) => [x / 4, y / 4]));
      const W = WATERS[wi], xs = R.map(p => p[0]), ys = R.map(p => p[1]); W.x0 = Math.min(...xs); W.x1 = Math.max(...xs); W.y0 = Math.min(...ys); W.y1 = Math.max(...ys);
      // the second, overlapping trace of the same pond goes
      const di = WATERS.findIndex(w => w !== W && Math.abs(w.x0 * 4 - 4071) < 3 && Math.abs(w.y0 * 4 - 3394) < 3);
      if (di >= 0) WATERS.splice(di, 1);
    }
  }
  // the ground under it: water in the pond, reeds on the spit, grass on the banks
  const PG = POND.concat([[4182, 3548], [4176, 3563], [4100, 3563]]), wet = [];
  for (let y = 848; y <= 881; y++) for (let x = 1027; x <= 1071; x++) {
    const i = y * TW + x, t = TT[i], gx = x * 4 + 2, gy = y * 4 + 2;
    if (TB[i] || t === TL.ROAD || t === TL.MAJOR || t === TL.PATH || t === TL.BLDG) continue;
    if (inP(PG, gx, gy)) { TT[i] = TL.WATER; wet.push(i); continue; }
    if (gx >= 4188 && gx < 4224 && gy >= (gx > 4200 ? 3404 : 3414) && gy < 3520) TT[i] = TL.MARSH;            // the reedy spit and the ditch beside it
    else if (t === TL.WATER || t === TL.MARSH || t === TL.PAVED) TT[i] = gx < 4200 ? TL.LAWN : TL.GRASS;
  }
  if (typeof clearTreesAt === 'function') clearTreesAt(wet);

  // ---- props: the Taco Bell sign and the ball-diamond bleachers ----
  PROPS.push({ k: 'us_tbsign', x: 3535 / 4, y: 2143.5 / 4, reach: 3 });
  for (const [x, y] of [[4318, 3394], [4325, 3394], [4335.5, 3404], [4348, 3421]]) PROPS.push({ k: 'pl_bleach', x: x / 4, y: y / 4, h: 0 });
  // nothing left standing inside the buildings added from the photo
  const NB = (typeof FIXQ !== 'undefined' ? FIXQ.filter(f => f.area === 'user').flatMap(f => f.newBld || []) : []).map(n => { const P = []; for (let i = 0; i < n.poly.length; i += 2) P.push([n.poly[i], n.poly[i + 1]]); return P; });
  for (let i = PROPS.length - 1; i >= 0; i--) { const p = PROPS[i]; if (NB.some(P => inP(P, p.x * 4, p.y * 4))) PROPS.splice(i, 1); }
  PROPS.sort((a, b) => a.y - b.y);

  // ---- the crosswalk over Langlade Road on the south side of East 2nd Avenue, where the sidewalks meet ----
  if (typeof FURN !== 'undefined') FURN.CW.push([1094.4, 848.5, 1.951, 11]);

  if (typeof SOLIDM !== 'undefined') SOLIDM.clear();

  // the concrete in these fixes (the fire apron, the walks around the Taco Bell, the ball-diamond plaza) draws as light
  // concrete, not asphalt: every PAVED tile in the owner's fix list
  const CONC = new Set();
  for (const f of FIXQ) if (['user', 'retail', 'food', 'gas', 'dg', 'ix_w', 'ix_e', 'hs'].includes(f.area)) for (const k in f.tiles || {}) if (f.tiles[k] === TL.PAVED && TT[+k] === TL.PAVED) CONC.add(+k);
  const _dt = drawTownTile;
  drawTownTile = function (x, y, sx, sy) {
    const r = _dt(x, y, sx, sy), i = y * TW + x;
    if (CONC.has(i) && !TB[i]) {
      const n = Math.ceil(T / 16);
      for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) { const w = Math.min(16, T - k * 16), h = Math.min(16, T - j * 16); ctx.drawImage(gtex('walk', hash(x * n + k, y * n + j) % 4), 0, 0, w, h, sx + k * 16, sy + j * 16, w, h); }
      const E = '#9a968e', g = t => t === TL.GRASS || t === TL.YARD || t === TL.LAWN || t === TL.PITCH;
      if (g(tAt(x, y - 1))) R(sx, sy, T, 2, E); if (g(tAt(x, y + 1))) R(sx, sy + T - 2, T, 2, E);
      if (g(tAt(x - 1, y))) R(sx, sy, 2, T, E); if (g(tAt(x + 1, y))) R(sx + T - 2, sy, 2, T, E);
    }
    return r;
  };

  const _dp = drawProp;
  drawProp = function (p) {
    if (p.k === 'us_tbsign') {   // a pole sign: grey pole, purple panel, white letters
      const X = Math.round(p.x * T), Y = Math.round(p.y * T), m = v => Math.round(v * PM), ph = m(6.5);
      ctx.save(); ctx.font = SMALL; const tw = Math.ceil(ctx.measureText('TACO BELL').width), w = tw + 10, h = 16;
      F('rgba(0,0,0,.22)', X - 2, Y - 2, 8, 4); F('#6a6e74', X - 2, Y - ph, 4, ph); F('#4a4e54', X + 1, Y - ph, 1, ph);
      F('#1c1618', X - w / 2 - 1, Y - ph - h - 1, w + 2, h + 2); F('#5b2a86', X - w / 2, Y - ph - h, w, h); F('#7a46a8', X - w / 2, Y - ph - h, w, 2);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText('TACO BELL', X, Y - ph - h / 2 + 1); ctx.restore();
      return;
    }
    return _dp(p);
  };
  const _look = lookAt;
  lookAt = function (x, y) {
    const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD;
    if (PROPS.some(p => p.k === 'us_tbsign' && Math.hypot(p.x - cx, p.y - cy) < 1.2)) return say([['', 'The pole sign reads TACO BELL.']]);
    return _look(x, y);
  };
})();
// the old McDonald's record at 332 Superior St is gone (a Dollar General stands there now, js/data/fixes/dg.js): no old name left on the map
{ const b = BLD.find(b => b.id === 20 && b.addr === '332 SUPERIOR ST'); if (b) b.name = ''; }
