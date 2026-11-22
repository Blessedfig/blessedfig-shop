"use strict";
// ---------- street furniture from OpenStreetMap (js/data/furniture.js, scripts/town/furniture.py): painted crosswalks,
// traffic signals, lamp posts, and a street-name sign at the corners where two named streets meet. Signs can be read
// (face one and press A): an RPG signpost for real wayfinding. ----------
if (typeof FURN !== 'undefined') {
  for (const [x, y] of FURN.LP) if (!PROPS.some(p => p.k === 'lamp' && Math.hypot(p.x - x, p.y - y) < 2)) PROPS.push({ x, y, k: 'lamp' });
  for (const [x, y, a, b] of FURN.SN) PROPS.push({ x, y, k: 'sign', a, b });
  for (const [x, y, ha, hb, side] of FURN.SG) PROPS.push({ x, y, k: 'signal', ha, hb, side });
  for (const [x, y, name, ref, net] of FURN.BS || []) PROPS.push({ x, y, k: 'bus', name, ref, net });
  for (const [x, y, h, kind, top, base, decal] of FURN.WT || []) PROPS.push({ x, y, k: 'tower', h, kind, top, base, decal, reach: Math.ceil(h / 4) + 2 });
  PROPS.sort((a, b) => a.y - b.y);
}
{ const _dp = drawProp;
  drawProp = function (p) {
    if (p.k === 'bus') {   // a bus-stop sign: a white plate with a blue bus panel
      const x = Math.round(p.x * T), y = Math.round(p.y * T), ph = Math.round(2.6 * PM);
      F('rgba(0,0,0,.22)', x - 1, y - 1, 6, 2); F('#5a5c62', x - 1, y - ph, 2, ph);
      F('#1a1c22', x - 6, y - ph - 9, 12, 12); F('#f2f2ee', x - 5, y - ph - 8, 10, 10); F('#1e4fb0', x - 4, y - ph - 7, 8, 5); F('#f2f2ee', x - 3, y - ph - 6, 6, 2); F('#1e4fb0', x - 3, y - ph - 1, 6, 1);
      return;
    }
    if (p.k === 'tower') return drawTower(p);
    if (p.k !== 'sign' && p.k !== 'signal') return _dp(p);
    const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM);
    if (p.k === 'sign') {   // a green two-blade street sign on a grey post (2.8 m)
      const ph = m(2.8); F('rgba(0,0,0,.22)', x - 1, y - 1, 6, 2); F('#5a5c62', x - 1, y - ph, 2, ph); F('#8a8c92', x - 1, y - ph, 1, ph);
      F('#0e3a20', x - 8, y - ph - 2, 16, 5); F('#1f7a44', x - 7, y - ph - 1, 14, 3); F('#e8f0e8', x - 5, y - ph, 10, 1);
      F('#0e3a20', x - 3, y - ph + 4, 6, 6); F('#1f7a44', x - 2, y - ph + 5, 4, 4); F('#e8f0e8', x - 1, y - ph + 6, 2, 2);
      return;
    }
    // a signal pole (5 m) with a mast arm toward the intersection and a three-light head; the two corners take turns
    const ph = m(5.2), cx = -p.side * (Math.cos(p.ha) + Math.cos(p.hb)), dir = cx >= 0 ? 1 : -1, arm = m(3.2), hx = x + dir * arm;
    F('rgba(0,0,0,.25)', x - 2, y - 1, 6, 3); F('#3a3c42', x - 2, y - ph, 4, ph); F('#5a5c62', x - 2, y - ph, 1, ph);
    F('#3a3c42', Math.min(x, hx), y - ph + 2, arm, 2);
    const ph2 = ((frame >> 6) + (p.side > 0 ? 0 : 8)) % 16, lit = ph2 < 7 ? 2 : ph2 < 9 ? 1 : 0;   // 0 red, 1 yellow, 2 green
    F('#1a1a1e', hx - 3, y - ph + 3, 7, 14); F('#e0b020', hx - 3, y - ph + 3, 7, 1);
    [['#ff3a2a', '#4a1410'], ['#ffc020', '#4a3a10'], ['#40e070', '#103a1c']].forEach(([on, off], i) => F(lit === i ? on : off, hx - 1, y - ph + 5 + i * 4, 3, 3));
  };
}
function drawTower(p) {   // a water tower at its real height (lidar), seen from the south like the buildings
  const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM), H = m(p.h);
  if (p.kind === 'sphere') {
    const r = m(7.5), top = y - H, cy = top + r;
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(x + 6, y + 2, m(2.4), m(0.9), 0, 0, 6.29); ctx.fill();
    // the pedestal: a tall column flaring at the base
    ctx.fillStyle = '#1c1618'; ctx.beginPath(); ctx.moveTo(x - m(2.4) - 1, y); ctx.lineTo(x - m(1.3) - 1, cy + r * 0.6); ctx.lineTo(x + m(1.3) + 1, cy + r * 0.6); ctx.lineTo(x + m(2.4) + 1, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = p.base; ctx.beginPath(); ctx.moveTo(x - m(2.4), y); ctx.lineTo(x - m(1.3), cy + r * 0.6); ctx.lineTo(x + m(1.3), cy + r * 0.6); ctx.lineTo(x + m(2.4), y); ctx.closePath(); ctx.fill();
    F('rgba(0,0,0,.18)', x + 2, cy + r * 0.6, m(1.0), y - cy - r * 0.6); F('rgba(255,255,255,.18)', x - m(1.0), cy + r * 0.6, 2, y - cy - r * 0.6);
    F('#1c1618', x - m(0.5) - 1, y - m(2.2) - 1, m(1.0) + 2, m(2.2) + 1); F('#4a3a30', x - m(0.5), y - m(2.2), m(1.0), m(2.2));   // the door at its foot
    // the tank: a sphere lit from the upper left
    ctx.fillStyle = '#1c1618'; ctx.beginPath(); ctx.arc(x, cy, r + 2, 0, 6.29); ctx.fill();
    const g = ctx.createRadialGradient(x - r * 0.35, cy - r * 0.4, r * 0.1, x, cy, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, p.top); g.addColorStop(1, '#a8aab0');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, cy, r, 0, 6.29); ctx.fill();
    F('rgba(0,0,0,.12)', x - r + 2, cy + 1, 2 * r - 4, 2);   // the seam at its equator
    if (p.decal === 'robin' && KID_IMG.robin.complete && KID_IMG.robin.naturalWidth) {   // Christian's Robin, painted on the tank facing town
      const [sx, sy, sw, sh] = KID_META.robin.rects.down[0], dh = Math.round(r * 1.15), dw = Math.round(dh * sw / sh);
      ctx.save(); ctx.beginPath(); ctx.arc(x, cy, r - 2, 0, 6.29); ctx.clip();
      ctx.drawImage(KID_IMG.robin, sx, sy, sw, sh, x - (dw >> 1), Math.round(cy - dh * 0.52), dw, dh);
      ctx.restore();
    }
  } else {   // the older tower on four legs, a tank with a cone roof
    const tw = m(3.6), tb = m(5.4), th = m(5.5), tt = y - H, legTop = tt + th + m(1.0);
    F('rgba(0,0,0,.2)', x - tb, y - 1, tb * 2 + 6, 3);
    ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 4; ctx.beginPath();
    for (const s of [-1, 1]) { ctx.moveTo(x + s * tb, y); ctx.lineTo(x + s * tw * 0.8, legTop); ctx.moveTo(x + s * tb * 0.45, y + 2); ctx.lineTo(x + s * tw * 0.35, legTop); } ctx.stroke();
    ctx.strokeStyle = p.base; ctx.lineWidth = 2; ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); for (let k = 1; k < 5; k++) { const yy = y - (y - legTop) * k / 5, wl = tb - (tb - tw * 0.8) * k / 5; ctx.moveTo(x - wl, yy); ctx.lineTo(x + wl, yy); } ctx.stroke();
    F('#1c1618', x - tw - 1, tt + m(1.6) - 1, tw * 2 + 2, th - m(1.6) + 2); F(p.top, x - tw, tt + m(1.6), tw * 2, th - m(1.6)); F('rgba(0,0,0,.18)', x + tw * 0.3, tt + m(1.6), tw * 0.7, th - m(1.6));
    ctx.fillStyle = '#1c1618'; ctx.beginPath(); ctx.moveTo(x - tw - 2, tt + m(1.6)); ctx.lineTo(x, tt - 2); ctx.lineTo(x + tw + 2, tt + m(1.6)); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#8a6a50'; ctx.beginPath(); ctx.moveTo(x - tw, tt + m(1.6) - 1); ctx.lineTo(x, tt); ctx.lineTo(x + tw, tt + m(1.6) - 1); ctx.closePath(); ctx.fill();
    F('#3a3c42', x - tw - 2, tt + th, tw * 2 + 4, 2);   // the catwalk
  }
}
{ const _ds = drawStreets;
  drawStreets = function () {   // painted crosswalks over the asphalt: bars along the traffic, laid across the street
    _ds();
    if (typeof FURN === 'undefined') return;
    ctx.fillStyle = 'rgba(236,236,226,.88)';
    for (const [x, y, h, w] of FURN.CW) {
      if (x < camX - 4 || x > camX + SW / T + 4 || y < camY - 4 || y > camY + SH / T + 4) continue;
      ctx.save(); ctx.translate((x - camX) * T, (y - camY) * T); ctx.rotate(h);
      for (let v = -w / 2 + 0.4; v < w / 2 - 0.3; v += 1.2) ctx.fillRect(-1.5 * PM, v * PM, 3 * PM, 0.6 * PM);
      ctx.restore();
    }
  };
}
{ const _look = lookAt;   // read a street sign you're facing
  lookAt = function (x, y) {
    const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD, s = PROPS.find(p => p.k === 'sign' && Math.hypot(p.x - cx, p.y - cy) < 0.9);
    if (s) return say([['', 'The street sign reads ' + s.a.toUpperCase() + ' and ' + s.b.toUpperCase() + '.']]);
    const bs = PROPS.find(p => p.k === 'bus' && Math.hypot(p.x - cx, p.y - cy) < 0.9);
    if (bs) return say([['', 'A bus stop: ' + bs.name + (bs.ref ? ' (stop ' + bs.ref + ')' : '') + '.'], ['', (bs.net || 'County transit') + ' stops here. The stop comes from OpenStreetMap.']]);
    const tw = PROPS.find(p => p.k === 'tower' && Math.hypot(p.x - cx, p.y - (cy + 0.5)) < 2.5);
    if (tw) return say([['', 'A water tower, about ' + Math.round(tw.h * 3.28084) + ' feet tall by the county\'s 2017 laser survey.'], ['', tw.decal === 'robin' ? 'The Robin is painted on its tank, looking out over town. The old tower on legs beside it is gone now.' : 'From up there you could see the whole town laid out like a map.']]);
    return _look(x, y);
  };
}
