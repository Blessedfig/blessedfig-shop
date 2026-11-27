"use strict";
// =====================================================================
//  WEATHER TOUCHES (Nov 27). Christian: "how can I improve this game in ways we arent thinking yet ... town map polishing or
//  something else that doesnt impact the main story but improves the quality".
//  1) Snow falls on some winter days. The ground is already snowy from December to mid-March (by the real calendar); now
//     about two days in five it is also snowing, light or steady, the same for everyone on the same day (?snow forces it,
//     ?nosnow stops it). Three layers of flakes drift with a little wind and move against the camera, so walking feels deep.
//     SCREEN MOTION > CALM keeps a few slow flakes only.
//  2) Footprints. On snowy ground the kid leaves boot prints that fade over about a minute (not on plowed roads or lots).
// =====================================================================
const WX = { flakes: [], prints: [], last: null, cam: null };
function wxSnowing() {
  const q = location.search;
  if (/[?&]nosnow\b/.test(q)) return 0;
  if (typeof SKY === 'undefined' || SKY.phase !== 'snow') return 0;
  if (/[?&]snow\b/.test(q)) return 1;
  const h = hash(SKY.doy * 31 + 7, (new Date()).getFullYear()) % 100;
  return h < 40 ? 0.35 + (h % 13) / 20 : 0;   // 40% of winter days: 0.35 .. 0.95
}
function wxCalm() { try { return typeof a11yCfg === 'function' && a11yCfg().motion === 'calm'; } catch (e) { return false; } }
function wxFlakes() {
  const k = wxSnowing(); if (!k) { WX.flakes.length = 0; return; }
  const want = Math.round((wxCalm() ? 40 : 170) * k);
  while (WX.flakes.length < want) { const z = Math.random(); WX.flakes.push({ x: Math.random() * SW, y: Math.random() * SH, z, ph: Math.random() * 6.28 }); }
  WX.flakes.length = Math.min(WX.flakes.length, want);
  const dx = WX.cam ? (camX - WX.cam[0]) * T : 0, dy = WX.cam ? (camY - WX.cam[1]) * T : 0; WX.cam = [camX, camY];
  const night = typeof SKY !== 'undefined' ? SKY.d || 0 : 0, calm = wxCalm();
  for (const f of WX.flakes) {
    const sp = calm ? 0.25 : 0.35 + f.z * 0.9, par = 0.4 + f.z * 0.7;
    f.y += sp; f.x += Math.sin(frame / 40 + f.ph) * 0.25 + (calm ? 0 : 0.18) - dx * par; f.y -= dy * par;
    if (f.y > SH + 4) { f.y = -4; f.x = Math.random() * SW; } if (f.y < -6) f.y = SH + 2;
    if (f.x < -4) f.x += SW + 8; if (f.x > SW + 4) f.x -= SW + 8;
    const s = f.z > 0.75 ? 2 : 1, a = (0.55 + f.z * 0.4) * (1 - night * 0.2);
    ctx.fillStyle = `rgba(250,252,255,${a.toFixed(2)})`; ctx.fillRect(Math.round(f.x), Math.round(f.y), s, s);
  }
}
// ---- footprints ----
const WX_BARE = new Set([TL.ROAD, TL.MAJOR, TL.PARKING, TL.PAVED, TL.WATER, TL.BLDG]);
function wxStep() {
  if (typeof G === 'undefined' || !G || mode !== 'walk' || typeof SKY === 'undefined' || SKY.phase !== 'snow') { WX.last = null; return; }
  const at = [G.x, G.y];
  if (WX.last && (WX.last[0] !== at[0] || WX.last[1] !== at[1])) {
    const [x0, y0] = WX.last, t = tAt(x0, y0);
    if (!WX_BARE.has(t)) { const ddx = Math.sign(at[0] - x0), ddy = Math.sign(at[1] - y0);
      WX.prints.push({ x: x0, y: y0, dx: ddx, dy: ddy, t: performance.now() }); if (WX.prints.length > 90) WX.prints.shift(); }
  }
  WX.last = at;
}
function wxPrints() {
  if (!WX.prints.length) return; const now = performance.now();
  WX.prints = WX.prints.filter(p => now - p.t < 60000);
  for (const p of WX.prints) {
    const a = 0.32 * (1 - (now - p.t) / 60000), bx = (p.x + 0.5 - camX) * T, by = (p.y + 0.5 - camY) * T + T * 0.25;
    if (bx < -T || bx > SW + T || by < -T || by > SH + T) continue;
    ctx.fillStyle = `rgba(110,126,150,${a.toFixed(3)})`;
    const side = p.dx ? [0, 3] : [3, 0];   // left and right boot sit apart across the line of travel
    for (let k = 0; k < 4; k++) {   // four prints across the 4 m step, alternating feet
      const u = (k + 0.5) / 4 - 0.5, sgn = k % 2 ? 1 : -1, x = bx + p.dx * u * T + side[0] * sgn, y = by + p.dy * u * T + side[1] * sgn;
      if (p.dx) ctx.fillRect(Math.round(x - 2), Math.round(y - 1), 4, 2); else ctx.fillRect(Math.round(x - 1), Math.round(y - 2), 2, 4);
    }
  }
}
{ const _dt = drawTown; drawTown = function () { const r = _dt.apply(this, arguments); try { wxStep(); wxPrints(); } catch (e) {} return r; }; }
{ const _dl = drawTownLabels; drawTownLabels = function (cx, cy) { if (mode === 'walk') try { wxFlakes(); } catch (e) {} return _dl(cx, cy); }; }
