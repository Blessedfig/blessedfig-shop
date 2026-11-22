"use strict";
// ============================================================================
// Street life from the Street View survey (Nov 17, 2026): what Antigo's streets hold besides buildings.
// js/data/survey_street.js lists, for each detail a surveyor saw, the camera point and the point the view looked at.
// Here each one becomes a prop: wooden utility poles strung with wires, curbside mailboxes, foundation hedges,
// flags, fences (chain-link, picket, privacy, rail, iron), flower beds, vegetable gardens, basketball hoops,
// swing sets, campers, lawn statues, woodpiles, benches, utility boxes. Placement only uses the game's own tiles:
// curb items stand just off the road toward the view; yard items stand in front of the first building that way.
// ============================================================================
(function () {
  if (typeof SURVEY_STREET === 'undefined') return;
  const ROADISH = new Set([TL.ROAD, TL.MAJOR, TL.RAIL, TL.WATER, TL.PARKING]);
  const free = (x, y) => { const t = tAt(Math.floor(x), Math.floor(y)); return t >= 0 && !ROADISH.has(t) && t !== TL.BLDG && t !== TL.WOODS && !bAt(Math.floor(x), Math.floor(y)); };
  const near = (k, x, y, r) => PROPS.some(p => p.k === k && Math.abs(p.x - x) < r && Math.abs(p.y - y) < r);
  const poles = [];
  const CURB2 = { hydrant: 0.25, stop: 0.2, speed: 0.2, noparking: 0.2, kidsign: 0.2, newsbox: 0.3, bin: 0.35, billboard: 3.0 };
  const SIDE2 = new Set(['trampoline', 'pool', 'tireswing', 'propane', 'grainbin', 'silo', 'gazebo']);
  const roomy = (x, y, r) => [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r]].every(([i, j]) => free(x + i, y + j));
  for (const [k, cx, cy, tx, ty] of SURVEY_STREET) {
    let dx = tx - cx, dy = ty - cy; const L = Math.hypot(dx, dy) || 1; dx /= L; dy /= L;
    // walk from the camera toward the view until we leave the road: that is the curb
    let s = 0, curb = null;
    for (; s < 12; s += 0.25) { const x = cx + dx * s, y = cy + dy * s; const t = tAt(Math.floor(x), Math.floor(y)); if (t >= 0 && !ROADISH.has(t)) { curb = [x, y]; break; } }
    if (!curb) continue;
    const across = Math.abs(dx) > Math.abs(dy) ? 'v' : 'h';   // a run that crosses the view: along the street
    if (k === 'pole' || k === 'mailbox') {
      const ox = k === 'mailbox' ? (across === 'h' ? 0.7 : 0) : 0, oy = k === 'mailbox' ? (across === 'v' ? 0.7 : 0) : 0;
      const back = k === 'mailbox' ? 0.05 : 0.35, x = curb[0] + dx * back + ox, y = curb[1] + dy * back + oy;
      if (!free(x, y) || near(k, x, y, k === 'pole' ? 4 : 1.5)) continue;
      const p = { x, y, k: k === 'pole' ? 'upole' : 'mailbox', run: across, h: hash(Math.round(x * 8), Math.round(y * 8)) };
      PROPS.push(p); if (k === 'pole') poles.push(p); continue;
    }
    // second pass (Nov 18): signs, hydrants, newspaper boxes and carts at the curb; billboards set back from it
    if (CURB2[k] !== undefined) {
      const back = CURB2[k], x = curb[0] + dx * back + (across === 'h' ? 0.35 : 0), y = curb[1] + dy * back + (across === 'v' ? 0.35 : 0);
      if (!free(x, y) || near(k === 'hydrant' ? 'hydrant' : 'yd_' + k, x, y, k === 'billboard' ? 12 : 3)) continue;
      PROPS.push({ x, y, k: k === 'hydrant' ? 'hydrant' : 'yd_' + k, run: across, h: hash(Math.round(x * 8), Math.round(y * 8)) }); continue;
    }
    // yard items: keep walking to the first building; stand in front of it
    let hit = null, last = null, hb = null;
    for (; s < 16; s += 0.25) { const x = cx + dx * s, y = cy + dy * s; const b = bAt(Math.floor(x), Math.floor(y)); if (b) { hit = [x, y]; hb = b; break; } if (free(x, y)) last = [x, y]; }
    let x, y;
    if (k.startsWith('fence') && hb && hb.pxMin != null) {   // a side-yard fence: beside the house, running from its front toward the street
      const right = p => 0, side = hash(Math.round(hb.pxMin), Math.round(hb.pyMin)) % 2;
      if (across === 'h') { x = side ? hb.pxMax + 0.45 : hb.pxMin - 0.45; y = (dy < 0 ? hb.pyMax : hb.pyMin) + (dy < 0 ? 1.6 : -1.6); }
      else { y = side ? hb.pyMax + 0.45 : hb.pyMin - 0.45; x = (dx < 0 ? hb.pxMax : hb.pxMin) + (dx < 0 ? 1.6 : -1.6); }
      if (!free(x, y) || near('yd_' + k, x, y, 2.5)) continue;
      PROPS.push({ x, y, k: 'yd_' + k, run: across === 'h' ? 'v' : 'h', h: hash(Math.round(x * 8), Math.round(y * 8)) }); continue; }
    if (SIDE2.has(k) && hb && hb.pxMin != null) {   // back- and side-yard things: beside the house or barn, set toward the back
      const r = { pool: 0.75, trampoline: 0.6, silo: 0.55, grainbin: 0.5, gazebo: 0.6, propane: 0.4, tireswing: 0.4 }[k], side = hash(Math.round(hb.pxMax), Math.round(hb.pyMax)) % 2;
      const tries = across === 'h' ? [[side ? hb.pxMax + r + 0.4 : hb.pxMin - r - 0.4, (hb.pyMin + hb.pyMax) / 2], [side ? hb.pxMin - r - 0.4 : hb.pxMax + r + 0.4, (hb.pyMin + hb.pyMax) / 2]]
        : [[(hb.pxMin + hb.pxMax) / 2, side ? hb.pyMax + r + 0.4 : hb.pyMin - r - 0.4], [(hb.pxMin + hb.pxMax) / 2, side ? hb.pyMin - r - 0.4 : hb.pyMax + r + 0.4]];
      const at = tries.find(([tx2, ty2]) => roomy(tx2, ty2, r) && !near('yd_' + k, tx2, ty2, 3));
      if (at) PROPS.push({ x: at[0], y: at[1], k: 'yd_' + k, run: across, h: hash(Math.round(at[0] * 8), Math.round(at[1] * 8)) });
      continue; }
    if (k === 'dumpster' && hit) {   // dumpsters stand on the lot or alley pavement against the building
      const x2 = hit[0] - dx * 0.8, y2 = hit[1] - dy * 0.8, t2 = tAt(Math.floor(x2), Math.floor(y2));
      if (t2 !== TL.ROAD && t2 !== TL.MAJOR && t2 !== TL.WATER && !bAt(Math.floor(x2), Math.floor(y2)) && !near('yd_dumpster', x2, y2, 3)) PROPS.push({ x: x2, y: y2, k: 'yd_dumpster', run: across, h: hash(Math.round(x2 * 8), Math.round(y2 * 8)) });
      continue; }
    if (k.startsWith('fence') || k === 'bench' || k === 'ubox') { x = curb[0] + dx * 1.3; y = curb[1] + dy * 1.3; }   // along the lot front
    else if (hit) { const off = k === 'hedge' || k === 'planter' || k === 'bollard' || k === 'bikerack' ? 0.55 : 1.6; x = hit[0] - dx * off; y = hit[1] - dy * off; }
    else if (last) [x, y] = last; else continue;
    if (!free(x, y) || near(k, x, y, 2.5) || PROPS.some(q => String(q.k).startsWith('yd_') && Math.abs(q.x - x) < 0.9 && Math.abs(q.y - y) < 0.9)) continue;
    PROPS.push({ x, y, k: 'yd_' + k, run: across, h: hash(Math.round(x * 8), Math.round(y * 8)) });
  }
  // wires: each pole strings to its nearest neighbour 5-14 cells away, running the same way along the street
  for (const p of poles) { let best = null, bd = 99;
    for (const q of poles) { if (q === p || q.to === p) continue; const ddx = q.x - p.x, ddy = q.y - p.y, d = Math.hypot(ddx, ddy);
      if (d < 5 || d > 14) continue; if (p.run === 'h' ? Math.abs(ddy) > 1.2 : Math.abs(ddx) > 1.2) continue; if (d < bd) { bd = d; best = q; } }
    if (best) { p.to = best; p.reach = Math.ceil(bd) + 2; } }
  PROPS.sort((a, b) => a.y - b.y);
  window.STREETLIFE_COUNT = PROPS.filter(p => p.k === 'upole' || p.k === 'mailbox' || String(p.k).startsWith('yd_')).length;
})();

// ---------- drawing (called from drawProp for kinds it does not know) ----------
function drawStreetProp(p, x, y, m) {
  const snow = typeof SKY !== 'undefined' && SKY.phase === 'snow', bare = typeof SKY !== 'undefined' && /^(snow|bare)$/.test(SKY.phase);
  const k = p.k;
  if (k === 'upole') {   // a creosote-brown wooden pole with a crossarm and three insulators; every few poles a transformer can
    const ph = m(8.5), top = y - ph;
    F('rgba(0,0,0,.22)', x - 2, y - 1, m(1.4), 3); F('#4a3424', x - 2, top, 4, ph); F('#6a4a32', x - 1, top, 1, ph);
    F('#3e2c1e', x - m(1.0), top + m(0.5), m(2.0), 3); for (const ix of [-0.8, 0, 0.8]) F('#c8d0d8', x + m(ix) - 1, top + m(0.5) - 3, 2, 3);
    if (p.h % 4 === 0) { F('#5a6068', x + 2, top + m(1.6), m(0.6), m(0.9)); F('#7a8088', x + 3, top + m(1.6), 2, m(0.9)); }
    if (p.to) { const qx = Math.round(p.to.x * T), qy = Math.round(p.to.y * T) - ph + m(0.5) - 2;
      ctx.strokeStyle = 'rgba(20,20,22,.8)'; ctx.lineWidth = 1;
      for (const ix of [-0.8, 0.8]) { ctx.beginPath(); ctx.moveTo(x + m(ix), top + m(0.5) - 2); const mx = (x + qx) / 2 + m(ix), my = (top + qy) / 2 + m(0.9); ctx.quadraticCurveTo(mx, my, qx + m(ix), qy); ctx.stroke(); } }
    return true; }
  if (k === 'mailbox') { F('rgba(0,0,0,.2)', x - 2, y - 1, m(0.7), 2); F('#5a4a3a', x - 1, y - m(1.1), 2, m(1.1));
    const c = ['#1a1a1e', '#c8ccd0', '#2a3a6a', '#7a2a24'][p.h % 4]; F('#101012', x - m(0.3) - 1, y - m(1.45) - 1, m(0.6) + 2, m(0.38) + 2); F(c, x - m(0.3), y - m(1.45), m(0.6), m(0.38));
    if (p.h % 3 === 0) F('#d83a2a', x + m(0.3), y - m(1.55), 2, m(0.25)); if (snow) F('#f2f4f8', x - m(0.3), y - m(1.5), m(0.6), 2); return true; }
  if (k.startsWith('pl_')) return drawPlaceProp(p, x, y, m);
  if (!k.startsWith('yd_')) return false;
  const t = k.slice(3), H = p.run === 'h';
  const run = (len, fn) => { const n = Math.max(2, Math.round(len / 0.5)); for (let i = 0; i <= n; i++) { const o = (i / n - 0.5) * len; fn(H ? x + m(o) : x, H ? y : y + m(o) * 0.6, i, n); } };
  switch (t) {
    case 'hedge': { const w = m(3.2), h = m(0.9); if (H) { const n = 5, bw = w / n;
        for (let i = 0; i < n; i++) { const bx = x - w / 2 + i * bw, bh = h + ((p.h >> i) % 3) * 2; F('#16241a', bx - 1, y - bh - 1, bw + 2, bh + 1); }
        for (let i = 0; i < n; i++) { const bx = x - w / 2 + i * bw, bh = h + ((p.h >> i) % 3) * 2; F(bare ? '#3e5a34' : '#2e5a2e', bx, y - bh, bw, bh); F(bare ? '#4e6a40' : '#4a7a3a', bx + 2, y - bh + 1, bw - 4, 3); if (snow) F('#eef2f6', bx, y - bh, bw, 3); } }
      else { F('#16241a', x - m(0.5) - 1, y - m(2.2) - 1, m(1.0) + 2, m(2.2) + 2); F('#2e5a2e', x - m(0.5), y - m(2.2), m(1.0), m(2.2)); F('#4a7a3a', x - m(0.5), y - m(2.2), 3, m(2.2)); } return true; }
    case 'flag': { F('rgba(0,0,0,.2)', x - 2, y - 1, 5, 2); F('#d8dce0', x - 1, y - m(5.5), 2, m(5.5)); F('#e8c048', x - 1, y - m(5.5) - 2, 3, 2);
      const fw = m(1.3), fh = m(0.75), fx = x + 1, fy = y - m(5.4); for (let i = 0; i < 7; i++) F(i % 2 ? '#f2f1ea' : '#b8323a', fx, fy + i * fh / 7, fw, fh / 7 + 1); F('#2a3a7a', fx, fy, fw * 0.42, fh * 0.55); return true; }
    case 'fence_chain': run(3.6, (px, py, i) => { F('#7a7e84', px - 1, py - m(1.2), 2, m(1.2)); if (i) F('rgba(170,176,184,.55)', H ? px - m(3.6) / Math.max(2, Math.round(3.6 / 0.5)) : px - 1, H ? py - m(1.1) : py - m(1.1), H ? m(3.6) / Math.max(2, Math.round(3.6 / 0.5)) : 2, m(1.0)); F('#9aa0a8', px - 1, py - m(1.2), 2, 1); }); return true;
    case 'fence_picket': run(3.2, (px, py) => { F('#d8d4cc', px - 1, py - m(1.0), 3, m(1.0)); F('#f4f2ec', px - 1, py - m(1.0), 2, m(0.9)); }); if (H) F('#e8e4dc', x - m(1.6), y - m(0.7), m(3.2), 2); return true;
    case 'fence_privacy': { if (H) { F('#3a2a1a', x - m(1.8) - 1, y - m(1.8) - 1, m(3.6) + 2, m(1.8) + 2); F(p.h % 2 ? '#8a6a48' : '#e8e4dc', x - m(1.8), y - m(1.8), m(3.6), m(1.8)); for (let i = 0; i < m(3.6); i += 5) F('rgba(0,0,0,.12)', x - m(1.8) + i, y - m(1.8), 1, m(1.8)); }
      else { F('#3a2a1a', x - 2, y - m(3.0), 4, m(3.0)); F(p.h % 2 ? '#8a6a48' : '#e8e4dc', x - 1, y - m(3.0), 3, m(2.9)); } return true; }
    case 'fence_rail': run(4.0, (px, py, i) => { F('#6a4a2e', px - 1, py - m(1.1), 3, m(1.1)); }); if (H) { F('#7a5a3a', x - m(2.0), y - m(0.95), m(4.0), 2); F('#7a5a3a', x - m(2.0), y - m(0.55), m(4.0), 2); } return true;
    case 'fence_iron': run(3.2, (px, py) => { F('#1a1a1e', px, py - m(1.2), 1, m(1.2)); F('#1a1a1e', px - 1, py - m(1.25), 3, 2); }); if (H) F('#1a1a1e', x - m(1.6), y - m(1.0), m(3.2), 1); return true;
    case 'planter': { const w = m(2.4); F('#5a3424', x - w / 2, y - m(0.35), w, m(0.35)); F('#8a4a32', x - w / 2, y - m(0.35), w, 2);
      if (!bare) for (let i = 0; i < 7; i++) F(['#e04a6a', '#e8c040', '#f2f1ea', '#c8323a', '#9a5ac0', '#e88a3a', '#e04a6a'][(i + p.h) % 7], x - w / 2 + 2 + i * (w - 4) / 7, y - m(0.5) + (i % 2) * 2, 3, 3); return true; }
    case 'garden': { const w = m(3.0), h = m(1.6); F('#4a3424', x - w / 2, y - h, w, h); for (let r = 0; r < 4; r++) F(bare ? '#5a4430' : '#3e7a32', x - w / 2 + 2, y - h + 3 + r * h / 4, w - 4, 3); return true; }
    case 'basketball': { F('rgba(0,0,0,.2)', x - 2, y - 1, 6, 2); F('#5a5e66', x - 1, y - m(3.2), 3, m(3.2)); F('#f2f2f2', x - m(0.6), y - m(3.9), m(1.2), m(0.8)); F('#c84a2a', x - m(0.15), y - m(3.3), m(0.3), 2); F('#3a3a3e', x - m(0.6), y - m(3.9), m(1.2), 1); return true; }
    case 'playground': { F('#2a6a3a', x - m(1.4), y - m(2.2), 2, m(2.2)); F('#2a6a3a', x + m(1.4), y - m(2.2), 2, m(2.2)); F('#2a6a3a', x - m(1.4), y - m(2.2), m(2.8) + 2, 2);
      F('#3a3a3e', x - m(0.6), y - m(2.0), 1, m(1.4)); F('#3a3a3e', x + m(0.6), y - m(2.0), 1, m(1.4)); F('#c84a2a', x - m(0.8), y - m(0.6), m(0.5), 2); F('#e8c040', x + m(0.4), y - m(0.6), m(0.5), 2); return true; }
    case 'trailer': { F('rgba(0,0,0,.25)', x - m(2.2), y - 1, m(4.4), 4); F('#2a2a2e', x - m(2.2) - 1, y - m(2.4) - 1, m(4.4) + 2, m(2.2) + 2); F('#e8e6e0', x - m(2.2), y - m(2.4), m(4.4), m(2.2)); F('#7a8a9a', x - m(1.6), y - m(2.0), m(1.0), m(0.6)); F('#3a5a8a', x - m(2.2), y - m(1.2), m(4.4), 2); F('#1a1a1e', x - m(0.8), y - m(0.3), m(0.6), m(0.4)); return true; }
    case 'boat': { F('#2a2a2e', x - m(2.0), y - m(1.0), m(4.0), m(0.9)); F('#e8e6e0', x - m(1.9), y - m(1.0), m(3.8), m(0.5)); F('#2a5a8a', x - m(1.9), y - m(0.5), m(3.8), 2); return true; }
    case 'statue': { F('#8a8a86', x - m(0.35), y - m(0.3), m(0.7), m(0.3)); F('#a8a8a2', x - m(0.2), y - m(1.0), m(0.4), m(0.7)); F('#b8b8b2', x - m(0.15), y - m(1.2), m(0.3), m(0.25)); return true; }
    case 'woodpile': { F('#3a2618', x - m(1.2), y - m(1.0), m(2.4), m(1.0)); for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) F(i % 2 ? '#8a6a48' : '#a8845a', x - m(1.2) + 1 + i * m(0.4), y - m(1.0) + 1 + r * m(0.33), m(0.3), m(0.28)); if (snow) F('#eef2f6', x - m(1.2), y - m(1.0) - 2, m(2.4), 3); return true; }
    case 'bench': { F('rgba(0,0,0,.2)', x - m(0.9), y - 1, m(1.8), 3); F('#6a4a2e', x - m(0.9), y - m(0.55), m(1.8), 4); F('#3a2a1a', x - m(0.7), y - m(0.5), 2, m(0.5)); F('#3a2a1a', x + m(0.6), y - m(0.5), 2, m(0.5)); return true; }
    // ---- second pass (Nov 18) ----
    case 'stop': { F('rgba(0,0,0,.2)', x - 2, y - 1, 5, 2); F('#8a8e94', x - 1, y - m(2.1), 2, m(2.1)); const r = m(0.38), cy2 = y - m(2.1);
      ctx.fillStyle = '#f2f2f2'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(x + Math.cos(a) * (r + 1.5), cy2 + Math.sin(a) * (r + 1.5)); } ctx.fill();
      ctx.fillStyle = '#c4202a'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(x + Math.cos(a) * r, cy2 + Math.sin(a) * r); } ctx.fill();
      F('#f2f2f2', x - r * 0.6, cy2 - 1, r * 1.2, 2); if (snow) F('#f2f4f8', x - r * 0.7, cy2 - r - 2, r * 1.4, 2); return true; }
    case 'speed': F('rgba(0,0,0,.2)', x - 2, y - 1, 5, 2); F('#8a8e94', x - 1, y - m(2.0), 2, m(2.0)); F('#1c1618', x - m(0.3) - 1, y - m(2.0) - m(0.75) - 1, m(0.6) + 2, m(0.75) + 2);
      F('#f4f4f0', x - m(0.3), y - m(2.0) - m(0.75), m(0.6), m(0.75)); F('#1c1618', x - m(0.2), y - m(2.0) - m(0.6), m(0.4), 1); F('#1c1618', x - m(0.15), y - m(2.0) - m(0.35), m(0.3), m(0.2)); return true;
    case 'noparking': F('#8a8e94', x - 1, y - m(2.0), 2, m(2.0)); F('#f4f4f0', x - m(0.22), y - m(2.0) - m(0.5), m(0.44), m(0.5)); ctx.strokeStyle = '#c4202a'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y - m(2.0) - m(0.25), m(0.15), 0, 7); ctx.moveTo(x - m(0.1), y - m(2.0) - m(0.36)); ctx.lineTo(x + m(0.1), y - m(2.0) - m(0.14)); ctx.stroke(); return true;
    case 'kidsign': { F('#8a8e94', x - 1, y - m(2.0), 2, m(2.0)); const r = m(0.35), cy2 = y - m(2.0) - r; ctx.fillStyle = '#1c1618'; ctx.beginPath(); ctx.moveTo(x, cy2 - r - 1); ctx.lineTo(x + r + 1, cy2); ctx.lineTo(x, cy2 + r + 1); ctx.lineTo(x - r - 1, cy2); ctx.fill();
      ctx.fillStyle = '#e8d020'; ctx.beginPath(); ctx.moveTo(x, cy2 - r); ctx.lineTo(x + r, cy2); ctx.lineTo(x, cy2 + r); ctx.lineTo(x - r, cy2); ctx.fill(); F('#1c1618', x - 1, cy2 - 3, 2, 6); return true; }
    case 'newsbox': { const c = ['#c8402a', '#e07a20', '#2a7a4a', '#2a4a8a'][p.h % 4]; F('rgba(0,0,0,.22)', x - m(0.3), y - 1, m(0.6), 3); F(c, x - m(0.25), y - m(1.0), m(0.5), m(1.0)); F('#d8dce0', x - m(0.18), y - m(0.85), m(0.36), m(0.3)); F(shade(c, -0.3), x - m(0.25), y - m(1.0), m(0.5), 2); return true; }
    case 'bin': { const c = ['#2a5a3a', '#2a4a7a', '#2a2a2e', '#6a6e74'][p.h % 4]; F('rgba(0,0,0,.22)', x - m(0.35), y - 1, m(0.7), 3); F(c, x - m(0.3), y - m(1.05), m(0.6), m(1.05)); F(shade(c, -0.35), x - m(0.33), y - m(1.12), m(0.66), m(0.12));
      F('#1c1618', x - m(0.3), y - 2, 3, 3); if (snow) F('#f2f4f8', x - m(0.33), y - m(1.16), m(0.66), 2); return true; }
    case 'dumpster': { const c = ['#2a4a7a', '#2a5a3a', '#7a2a24', '#5a5e64'][p.h % 4], w = m(1.9), h = m(1.25); F('rgba(0,0,0,.25)', x - w / 2, y - 2, w + 3, 4); F(c, x - w / 2, y - h, w, h); F(shade(c, -0.3), x - w / 2 - 1, y - h - 3, w + 2, 4);
      F(shade(c, 0.15), x - w / 2 + 3, y - h + 4, w - 6, 2); F('#1c1618', x - w / 2 + 2, y - 2, 3, 2); F('#1c1618', x + w / 2 - 5, y - 2, 3, 2); if (snow) F('#f2f4f8', x - w / 2, y - h - 4, w, 2); return true; }
    case 'trampoline': { if (snow) return true; const rx = m(1.8), ry = m(1.0); for (const ox of [-0.7, 0.7]) F('#3a3e46', x + rx * ox, y - m(0.7), 2, m(0.7));
      ctx.fillStyle = '#2a6ac0'; ctx.beginPath(); ctx.ellipse(x, y - m(0.8), rx, ry, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#1a1a1e'; ctx.beginPath(); ctx.ellipse(x, y - m(0.8), rx * 0.8, ry * 0.75, 0, 0, 7); ctx.fill();
      ctx.strokeStyle = 'rgba(30,30,34,.55)'; ctx.lineWidth = 1; for (const ox of [-1, -0.5, 0, 0.5, 1]) { ctx.beginPath(); ctx.moveTo(x + rx * ox * 0.95, y - m(0.8) - ry * 0.3); ctx.lineTo(x + rx * ox * 0.95, y - m(2.4)); ctx.stroke(); } return true; }
    case 'pool': { if (snow) return true; const rx = m(2.2), ry = m(1.3), top = y - m(1.2); F('rgba(0,0,0,.22)', x - rx, y - 2, rx * 2, 4); F('#8a9aa8', x - rx, top, rx * 2, m(1.2)); for (let i = -rx; i < rx; i += 5) F('#7a8a98', x + i, top, 1, m(1.2));
      ctx.fillStyle = '#dce4ea'; ctx.beginPath(); ctx.ellipse(x, top, rx, ry, 0, 0, 7); ctx.fill(); ctx.fillStyle = '#4aa0d8'; ctx.beginPath(); ctx.ellipse(x, top, rx - 3, ry - 2, 0, 0, 7); ctx.fill();
      F('rgba(255,255,255,.35)', x - rx * 0.4, top - ry * 0.3, rx * 0.5, 1); return true; }
    case 'boulder': { const w = m(1.1 + (p.h % 3) * 0.3), h = m(0.6 + (p.h % 2) * 0.2); ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x, y, w / 2 + 2, 3, 0, 0, 7); ctx.fill();
      ctx.fillStyle = ['#8a8680', '#9a8e80', '#7e8286'][p.h % 3]; ctx.beginPath(); ctx.ellipse(x, y - h / 2, w / 2, h / 2 + 1, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(x - w * 0.15, y - h * 0.7, w * 0.2, h * 0.18, 0, 0, 7); ctx.fill();
      if (snow) F('#f2f4f8', x - w * 0.35, y - h - 1, w * 0.7, 2); return true; }
    case 'propane': { const w = m(2.2), h = m(0.85); F('rgba(0,0,0,.22)', x - w / 2, y - 1, w, 3); for (const ox of [-0.3, 0.3]) F('#5a5e64', x + w * ox, y - m(0.35), 2, m(0.35));
      ctx.fillStyle = '#eef0f0'; ctx.beginPath(); ctx.ellipse(x - w / 2 + h / 2, y - m(0.35) - h / 2, h / 2, h / 2, 0, 0, 7); ctx.ellipse(x + w / 2 - h / 2, y - m(0.35) - h / 2, h / 2, h / 2, 0, 0, 7); ctx.fill();
      F('#eef0f0', x - w / 2 + h / 2, y - m(0.35) - h, w - h, h); F('#c8ccd0', x - w / 2 + h / 2, y - m(0.35) - 3, w - h, 2); F('#7a7e84', x - 2, y - m(0.35) - h - 3, 4, 3); return true; }
    case 'gazebo': { const w = m(3.2), c = '#f4f2ec'; F('rgba(0,0,0,.22)', x - w / 2, y - 2, w, 4); for (const ox of [-0.45, -0.15, 0.15, 0.45]) F(c, x + w * ox - 1, y - m(2.3), 3, m(2.3));
      F(c, x - w / 2, y - m(0.9), w, 2); ctx.fillStyle = snow ? '#f2f4f8' : '#5a6068'; ctx.beginPath(); ctx.moveTo(x - w / 2 - 4, y - m(2.3)); ctx.lineTo(x, y - m(3.6)); ctx.lineTo(x + w / 2 + 4, y - m(2.3)); ctx.fill(); F('#1c1618', x - w / 2 - 4, y - m(2.3), w + 8, 2); return true; }
    case 'billboard': { const w = m(5.5), h = m(2.2), top = y - m(5.0); for (const ox of [-0.3, 0.3]) F('#5a4a3a', x + w * ox - 2, top + h, 4, m(5.0) - h);
      F('#1c1618', x - w / 2 - 2, top - 2, w + 4, h + 4); const c = ['#2a5a9a', '#b8402a', '#2a7a4a', '#e8b020'][p.h % 4]; F('#f2f0ea', x - w / 2, top, w, h); F(c, x - w / 2, top, w * 0.42, h);
      F(shade(c, -0.2), x - w / 2 + w * 0.5, top + h * 0.25, w * 0.42, 3); F('#5a5e64', x - w / 2 + w * 0.5, top + h * 0.5, w * 0.3, 2); F('#5a5e64', x - w / 2 + w * 0.5, top + h * 0.68, w * 0.36, 2); return true; }
    case 'grainbin': { const w = m(3.2), h = m(4.4), top = y - h; F('rgba(0,0,0,.22)', x - w / 2, y - 2, w + 3, 4); F('#b8bcc0', x - w / 2, top, w, h); for (let yy = top + 3; yy < y; yy += 4) F('#9ca0a6', x - w / 2, yy, w, 1);
      F('rgba(0,0,0,.15)', x + w * 0.15, top, w * 0.35, h); ctx.fillStyle = snow ? '#f2f4f8' : '#c8ccd0'; ctx.beginPath(); ctx.moveTo(x - w / 2 - 2, top); ctx.lineTo(x, top - m(1.4)); ctx.lineTo(x + w / 2 + 2, top); ctx.fill(); F('#7a7e84', x - 2, top - m(1.6), 4, 3); return true; }
    case 'silo': { const w = m(3.4), h = m(11), top = y - h; F('rgba(0,0,0,.22)', x - w / 2, y - 2, w + 4, 5); F('#b0aca4', x - w / 2, top, w, h); for (let yy = top + 6; yy < y; yy += m(0.8)) F('#8e8a84', x - w / 2, yy, w, 1);
      F('rgba(0,0,0,.16)', x + w * 0.15, top, w * 0.35, h); ctx.fillStyle = snow ? '#f2f4f8' : '#9aa0a6'; ctx.beginPath(); ctx.ellipse(x, top, w / 2 + 1, m(1.0), 0, Math.PI, 0); ctx.fill(); F('#5a5e64', x + w / 2 - 3, top + 4, 2, h - 6); return true; }
    case 'churchsign': { const w = m(2.4); F('rgba(0,0,0,.22)', x - w / 2, y - 1, w, 3); ctx.fillStyle = pat('brick', '#8a4a3a'); ctx.fillRect(x - w / 2 - 2, y - m(0.6), w + 4, m(0.6)); F('#1c1618', x - w / 2 - 1, y - m(1.7) - 1, w + 2, m(1.1) + 2);
      F('#f4f2ec', x - w / 2, y - m(1.7), w, m(1.1)); for (const r of [0.25, 0.5, 0.75]) F('#2a2a3a', x - w * 0.35, y - m(1.7) + m(1.1) * r - 1, w * (0.5 + (p.h >> r * 4) % 3 * 0.1), 2); return true; }
    case 'bollard': for (const ox of [-0.6, 0, 0.6]) { F('rgba(0,0,0,.2)', x + m(ox) - 2, y - 1, 5, 2); F('#e8c020', x + m(ox) - 2, y - m(1.0), 4, m(1.0)); F('#1c1618', x + m(ox) - 2, y - m(0.75), 4, 2); } return true;
    case 'bikerack': ctx.strokeStyle = '#3a3e46'; ctx.lineWidth = 2; for (const ox of [-0.5, 0, 0.5]) { ctx.beginPath(); ctx.moveTo(x + m(ox) - m(0.2), y); ctx.lineTo(x + m(ox) - m(0.2), y - m(0.6)); ctx.arc(x + m(ox), y - m(0.6), m(0.2), Math.PI, 0); ctx.lineTo(x + m(ox) + m(0.2), y); ctx.stroke(); } return true;
    case 'tireswing': { F('#5a4a3a', x - m(1.2), y - m(3), 3, m(3)); F('#5a4a3a', x - m(1.2), y - m(3), m(1.6), 3); F('#c8c0b0', x + m(0.3), y - m(3), 1, m(2.0)); ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(x + m(0.3), y - m(0.8), m(0.35), m(0.28), 0, 0, 7); ctx.stroke(); return true; }
    case 'ubox': { F('#1c2a1e', x - m(0.4) - 1, y - m(1.0) - 1, m(0.8) + 2, m(1.0) + 1); F('#3e5a42', x - m(0.4), y - m(1.0), m(0.8), m(1.0)); F('#5a7a5e', x - m(0.4), y - m(1.0), m(0.8), 2); return true; }
    case 'dish': { F('#5a5e66', x - 1, y - m(1.2), 2, m(1.2)); F('#d8dce0', x - m(0.4), y - m(1.6), m(0.8), m(0.6)); return true; }
    case 'barnquilt': return true;
  }
  return false;
}

// ---------- places from the Street View places survey (js/data/survey_places.js): park and field furniture ----------
(function () {
  if (typeof SURVEY_PLACES === 'undefined') return;
  const OPEN = new Set([TL.GRASS, TL.LAWN, TL.PITCH, TL.YARD, TL.SAND, TL.PATH, TL.PAVED]);
  const ok = (x, y, k) => (k === 'bench' || k === 'trash' || k === 'lamp' || tAt(Math.floor(x), Math.floor(y)) !== TL.PAVED) && OPEN.has(tAt(Math.floor(x), Math.floor(y))) && !bAt(Math.floor(x), Math.floor(y)) && !PROPS.some(p => Math.abs(p.x - x) < 1.2 && Math.abs(p.y - y) < 1.2);
  const KIND = { bench: 'bench', trash: 'trash', lamp: 'lamp', fieldlight: 'pl_fieldlight', flag: 'yd_flag', swing: 'yd_playground', play: 'pl_play', ptable: 'pl_ptable',
    shelter: 'pl_shelter', bleach: 'pl_bleach', backstop: 'pl_backstop', goal: 'pl_goal', score: 'pl_score', psign: 'pl_sign', stones: 'pl_stones', toilet: 'pl_toilet',
    boulder: 'pl_boulder', marker: 'pl_marker', grill: 'pl_grill', concession: 'pl_stand', press: 'pl_stand' };
  let placed = 0;
  for (const [k, tx, ty, n, col, label] of SURVEY_PLACES) {
    const kind = KIND[k]; if (!kind) continue;
    let left = k === 'stones' ? 1 : Math.max(1, n | 0);
    for (let r = 0; r < 7 && left > 0; r++) for (let a = 0; a < 8 && left > 0; a++) {
      const x = tx + Math.cos(a * 0.785 + r) * r * 1.3, y = ty + Math.sin(a * 0.785 + r) * r * 1.3;
      if (!ok(x, y, k)) continue;
      PROPS.push({ x, y, k: kind, col, label, run: 'h', h: hash(Math.round(x * 8), Math.round(y * 8)) }); left--; placed++; }
  }
  PROPS.sort((a, b) => a.y - b.y); window.PLACES_COUNT = placed;
})();
function drawPlaceProp(p, x, y, m) {
  const snow = typeof SKY !== 'undefined' && SKY.phase === 'snow';
  switch (p.k) {
    case 'pl_fieldlight': F('rgba(0,0,0,.2)', x - 2, y - 1, 6, 3); F('#6a6e76', x - 2, y - m(14), 4, m(14)); F('#3a3e46', x - m(1.4), y - m(14) - m(1.0), m(2.8), m(1.0));
      for (let i = 0; i < 4; i++) F('#e8e4c8', x - m(1.3) + i * m(0.7), y - m(14) - m(0.85), m(0.5), m(0.35)); return true;
    case 'pl_play': { const c = p.col || '#c84a2a'; F('#3a2a1a', x - m(1.6), y - m(2.6), 3, m(2.6)); F('#3a2a1a', x + m(1.4), y - m(2.6), 3, m(2.6)); F('#8a6a48', x - m(1.6), y - m(1.4), m(3.2), m(0.4));
      F(c, x - m(1.8), y - m(3.2), m(3.6), m(0.7)); F('#e8c040', x + m(1.5), y - m(1.4), m(1.2), 3); F('#3a7ac0', x - m(2.6), y - m(1.3), m(1.0), m(1.3)); return true; }
    case 'pl_ptable': F('rgba(0,0,0,.2)', x - m(1.0), y - 1, m(2.0), 3); F(p.col || '#7a5a3a', x - m(1.0), y - m(0.8), m(2.0), m(0.35)); F('#5a3a22', x - m(1.0), y - m(0.35), m(2.0), 2); F('#5a3a22', x - m(0.8), y - m(0.5), 2, m(0.5)); F('#5a3a22', x + m(0.7), y - m(0.5), 2, m(0.5)); return true;
    case 'pl_shelter': { const w = m(5), c = p.col || '#3e6a3a'; F('rgba(0,0,0,.22)', x - w / 2, y - 2, w, 5); for (const ox of [-0.45, 0.45]) F('#6a4a2e', x + w * ox - 2, y - m(2.4), 4, m(2.4));
      F('#1c1618', x - w / 2 - 3, y - m(3.6) - 2, w + 6, m(1.3) + 4); F(c, x - w / 2 - 2, y - m(3.6), w + 4, m(1.3)); F('rgba(255,255,255,.25)', x - w / 2 - 2, y - m(3.6), w + 4, 2); if (snow) F('#eef2f6', x - w / 2 - 2, y - m(3.6) - 2, w + 4, 4); return true; }
    case 'pl_bleach': { const w = m(4.5); for (let r = 0; r < 4; r++) F(r % 2 ? '#a8acb2' : '#c8ccd2', x - w / 2 + r * 3, y - m(0.5) - r * m(0.45), w - r * 6, m(0.25)); F('#6a6e76', x - w / 2, y - m(2.0), 2, m(2.0)); F('#6a6e76', x + w / 2 - 2, y - m(2.0), 2, m(2.0)); return true; }
    case 'pl_backstop': { const w = m(6); F('#7a7e84', x - w / 2, y - m(3.5), 2, m(3.5)); F('#7a7e84', x + w / 2 - 2, y - m(3.5), 2, m(3.5)); F('#7a7e84', x - 1, y - m(3.5), 2, m(3.5)); F('rgba(170,176,184,.45)', x - w / 2, y - m(3.5), w, m(3.4)); F('#9aa0a8', x - w / 2, y - m(3.5), w, 2); F('#b4724a', x - m(1.5), y + 2, m(3), m(1.2)); return true; }
    case 'pl_goal': F('#f2f2f2', x - m(1.8), y - m(1.6), m(3.6), 3); F('#f2f2f2', x - m(1.8), y - m(1.6), 3, m(1.6)); F('#f2f2f2', x + m(1.8) - 3, y - m(1.6), 3, m(1.6)); F('rgba(240,240,240,.3)', x - m(1.8), y - m(1.6), m(3.6), m(1.4)); return true;
    case 'pl_score': F('#3a3e46', x - 2, y - m(3.0), 4, m(3.0)); F('#1a3a2a', x - m(1.6), y - m(4.6), m(3.2), m(1.7)); F('#e8c040', x - m(1.2), y - m(4.3), m(0.7), m(0.5)); F('#e8c040', x + m(0.5), y - m(4.3), m(0.7), m(0.5)); F('#f2f2f2', x - m(1.4), y - m(3.4), m(2.8), 2); return true;
    case 'pl_sign': { F('#4a3020', x - m(1.4), y - m(1.0), 3, m(1.0)); F('#4a3020', x + m(1.4) - 3, y - m(1.0), 3, m(1.0)); F('#1c1618', x - m(1.7), y - m(2.0) - 1, m(3.4), m(1.1) + 2); F('#6a4428', x - m(1.6), y - m(2.0), m(3.2), m(1.0));
      if (p.label) { ctx.save(); ctx.fillStyle = '#f0d890'; ctx.font = `bold ${Math.max(7, Math.round(PM * 0.32))}px monospace`; ctx.textAlign = 'center'; ctx.fillText(p.label.slice(0, 18), x, y - m(1.35)); ctx.restore(); } return true; }
    case 'pl_stones': { for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const sx = x - m(3) + i * m(1.1) + (r % 2) * 2, sy = y - m(1.6) + r * m(1.1); F('#4a4a4e', sx - 1, sy - m(0.55) - 1, m(0.5) + 2, m(0.55) + 1); F(((p.h >> (r * 6 + i)) & 1) ? '#9a9a9e' : '#7a7470', sx, sy - m(0.55), m(0.5), m(0.55)); if (snow) F('#eef2f6', sx, sy - m(0.55) - 1, m(0.5), 2); } return true; }
    case 'pl_toilet': F('#1c1618', x - m(0.6) - 1, y - m(2.3) - 1, m(1.2) + 2, m(2.3) + 1); F('#3a6aa8', x - m(0.6), y - m(2.3), m(1.2), m(2.3)); F('#f2f2f2', x - m(0.6), y - m(2.3), m(1.2), 2); return true;
    case 'pl_boulder': F('#3a3a3e', x - m(0.7) - 1, y - m(0.7) - 1, m(1.4) + 2, m(0.7) + 1); F('#8a8680', x - m(0.7), y - m(0.7), m(1.4), m(0.7)); F('#a8a49e', x - m(0.5), y - m(0.7), m(0.6), 2); return true;
    case 'pl_marker': F('#e8c040', x - 1, y - m(1.1), 3, m(1.1)); F('#1a1a1e', x - 1, y - m(1.1), 3, 2); return true;
    case 'pl_grill': F('#2a2a2e', x - 1, y - m(0.9), 2, m(0.9)); F('#1a1a1e', x - m(0.4), y - m(1.2), m(0.8), m(0.35)); return true;
    case 'pl_stand': F('#1c1618', x - m(1.6) - 1, y - m(2.6) - 1, m(3.2) + 2, m(2.6) + 1); F(p.col || '#c8b898', x - m(1.6), y - m(2.6), m(3.2), m(2.6)); F('#5a3a22', x - m(1.0), y - m(1.8), m(2.0), m(0.7)); F('#7a2a24', x - m(1.8), y - m(2.9), m(3.6), m(0.4)); return true;
  }
  return false;
}

// ---------- Spring Brook's fieldstone channel and the lake's globe lamps (Street View places survey, Nov 17) ----------
// Downtown the brook runs between fieldstone walls past Peaceful Valley Park and leaves the lake through a stone-lined
// channel below the Faust dam; the stone bridge on the lake carries black globe lamps, and more line the lakeshore drive.
(function () {
  const ZONES = [[810, 970, 852, 1052], [816, 920, 838, 946]];
  const isW = (x, y) => tAt(x, y) === TL.WATER;
  let n = 0;
  for (const [x0, y0, x1, y1] of ZONES) for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (isW(x, y) || bAt(x, y) || [TL.ROAD, TL.MAJOR].includes(tAt(x, y))) continue;
    if (isW(x, y + 1)) { PROPS.push({ x: x + 0.5, y: y + 0.98, k: 'pl_stonewall', run: 'h', h: hash(x, y) }); n++; }
    else if (isW(x, y - 1)) { PROPS.push({ x: x + 0.5, y: y + 0.12, k: 'pl_stonewall', run: 'h', h: hash(x, y) }); n++; }
    if (isW(x + 1, y)) { PROPS.push({ x: x + 0.95, y: y + 0.9, k: 'pl_stonewall', run: 'v', h: hash(x, y) }); n++; }
    else if (isW(x - 1, y)) { PROPS.push({ x: x + 0.05, y: y + 0.9, k: 'pl_stonewall', run: 'v', h: hash(x, y) }); n++; }
  }
  for (const [x, y] of [[905.5, 931.2], [910.5, 931.2], [905.5, 935.2], [910.5, 935.2], [912.5, 917.5], [917.5, 916.8], [922.5, 916.4]]) {
    const ok = tAt(Math.floor(x), Math.floor(y)) !== TL.WATER && !bAt(Math.floor(x), Math.floor(y));
    if (ok && !PROPS.some(p => Math.abs(p.x - x) < 1 && Math.abs(p.y - y) < 1)) PROPS.push({ x, y, k: 'pl_globelamp' }); }
  PROPS.sort((a, b) => a.y - b.y); window.STONEWALL_COUNT = n;
})();
{ const _dpp = drawPlaceProp; drawPlaceProp = function (p, x, y, m) {
  if (p.k === 'pl_stonewall') { const snow = typeof SKY !== 'undefined' && SKY.phase === 'snow', C = ['#9a948a', '#8a8070', '#a8a294', '#7a7266'];
    if (p.run === 'h') { const w = T, h = m(0.7); F('#3a342c', x - w / 2, y - h - 1, w, h + 2); for (let i = 0; i < 4; i++) for (let r = 0; r < 2; r++) F(C[(p.h >> (i * 2 + r)) % 4], x - w / 2 + 1 + i * (w / 4) + (r ? 2 : 0), y - h + r * h / 2, w / 4 - 2, h / 2 - 1); if (snow) F('#eef2f6', x - w / 2, y - h - 1, w, 2); }
    else { F('#3a342c', x - 3, y - T, 6, T); for (let r = 0; r < 4; r++) F(C[(p.h >> r) % 4], x - 2, y - T + 1 + r * T / 4, 4, T / 4 - 2); }
    return true; }
  if (p.k === 'pl_globelamp') { F('rgba(0,0,0,.22)', x - 2, y - 1, m(1.0), 3); F('#1a1a1e', x - 3, y - 4, 7, 4); F('#1a1a1e', x - 1, y - m(3.6), 3, m(3.6));
    F('#1a1a1e', x - m(0.35) - 1, y - m(4.2) - 1, m(0.7) + 2, m(0.7) + 2); F('#f2ead0', x - m(0.35), y - m(4.2), m(0.7), m(0.7)); F('#fffbe8', x - m(0.2), y - m(4.1), 2, 2); return true; }
  return _dpp(p, x, y, m);
}; }
