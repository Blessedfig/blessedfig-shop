"use strict";
// =====================================================================
//  LANDMARKS (Nov 12): the five places in Antigo on the National Register of Historic Places, so people recognise them.
//  - Each is found by a point inside its real outline (quarter cells, from the NRHP coordinates and the county building data).
//  - Its colours and roof follow public-domain photos on Wikimedia Commons (used as reference); the courthouse gets its tower.
//  - Looking at one shows that photo as a small pixel postcard (192 x 144, 40 colours, assets/landmarks/), credited on the card.
//  Facts come from the Wisconsin Historical Society / National Park Service register records; nothing is added beyond them.
// =====================================================================
const LANDMARKS = {
  court: { q: [733.25, 861.06], name: 'Langlade County Courthouse', photos: ['court'], credit: 'Photo: Wikimedia Commons, public domain',
    style: { m: 11, roof: 'hip', roofCol: '#4a5458', wall: '#94483a', mat: 'stone', win: 'tall', parapet: 0, tower: 1 },
    lines: ['LANGLADE COUNTY COURTHOUSE · 800 Clermont Street.', 'Red sandstone under a domed tower. The county seat does its business here.', 'It is on the National Register of Historic Places.'] },
  po: { q: [761.0, 991.56], name: 'Antigo Post Office', photos: ['po'], credit: 'Photo: Wikimedia Commons, public domain',
    style: { m: 8, roof: 'flat', roofCol: '#77726a', wall: '#c4b088', mat: 'stone', win: 'arch', parapet: 1 },
    lines: ['UNITED STATES POST OFFICE · 501 Clermont Street.', 'Classical Revival with Beaux-Arts touches, built in 1916.', 'It joined the National Register of Historic Places in 2000.'] },
  depot: { q: [693.58, 982.58], name: 'Antigo Depot', photos: ['depot'], credit: 'Photo: Wikimedia Commons, public domain',
    style: { m: 8, roof: 'hip', roofCol: '#3e584c', wall: '#a24e3a', mat: 'brick', win: 'tall', parapet: 0 },
    lines: ['THE ANTIGO DEPOT · 522 Morse Street.', 'Built in 1907 for the Chicago and North Western Railway, of brick made nearby. It was also a division headquarters.',
      'After the trains stopped it became apartments, in 1992. It is on the National Register of Historic Places.'] },
  museum: { q: [781.19, 1027.31], name: 'Langlade County Historical Society Museum', type: 'civic', photos: ['museum', 'museum', 'cabin'], credit: 'Photos: Wikimedia Commons, public domain',
    style: { m: 8, roof: 'hip', roofCol: '#b4a494', wall: '#964434', mat: 'brick', win: 'tall', parapet: 0, portico: 1 },
    lines: ['LANGLADE COUNTY HISTORICAL SOCIETY MUSEUM · 404 Superior Street.', 'This was the Antigo Public Library. Local artists show their work here now too.',
      'On the grounds stands the log cabin of Francis Deleglise, who founded Antigo. Library and cabin are both on the National Register.'] },
  opera: { q: [667.0, 951.25], name: 'Antigo Opera House', photos: ['opera'], credit: 'Photo: Wikimedia Commons, public domain',
    style: { m: 12.5, floors: 3, roof: 'flat', roofCol: '#6a6662', wall: '#a2462e', mat: 'brick', win: 'tall', parapet: 1, trim: '#ecebe4' },
    lines: ['THE ANTIGO OPERA HOUSE · 1016 Fifth Avenue.', 'Red brick with white trim, from 1904. It is on the National Register of Historic Places.'] },
};
const LM_IMG = {};
for (const k of ['court', 'po', 'depot', 'museum', 'opera', 'cabin']) { LM_IMG[k] = new Image(); LM_IMG[k].src = 'assets/landmarks/' + k + '.png'; }
function polyQContains(P, x, y) {   // even-odd test on a flat quarter-cell polygon
  let c = false;
  for (let i = 0, j = P.length - 2; i < P.length; j = i, i += 2) {
    const xi = P[i], yi = P[i + 1], xj = P[j], yj = P[j + 1];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
for (const [k, L] of Object.entries(LANDMARKS)) {
  const qx = L.q[0] * 4, qy = L.q[1] * 4;
  const b = BLD.find(b => b.polyQ && polyQContains(b.polyQ, qx, qy));
  if (!b) continue;
  L.b = b; b.landmark = k; b.name = L.name; if (L.type) b.type = L.type;
  b.style = Object.assign({}, L.style, { h: Math.round(L.style.m * PM) });
}
function landmarkLook(b) {
  const L = LANDMARKS[b.landmark];
  say(L.lines.map(s => ['', s]));
  DLG.photos = L.photos; DLG.credit = L.credit;
  surveyOffer(b);
}
function drawPhotoCard(key, credit) {
  const im = LM_IMG[key]; if (!im || !im.complete || !im.naturalWidth) return;
  const w = 240, h = 144 + 24, x = Math.round((SW - w) / 2), y = 10;
  win(x, y, w, h); ctx.drawImage(im, x + 24, y + 6, 192, 144);
  txt(credit || '', x + w / 2, y + 152, 'rgba(255,255,255,.75)', 'center', SMALL);
}
// the courthouse tower and the museum's white portico, drawn with the building (world pixels)
{ const _db = drawBuilding; drawBuilding = function (b) { _db(b); if (b.landmark === 'court') drawCourtTower(b); if (b.landmark === 'museum') drawPortico(b); }; }
function drawCourtTower(b) {
  // the tower stands over the main entrance (the front), as in the photos
  const s = b.style, f = b.face || 'S', inset = 4 * PM;
  let cx = (b.pxMin + b.pxMax) / 2 * T, cy = (b.pyMin + b.pyMax) / 2 * T;
  if (f === 'W') cx = b.pxMin * T + inset; else if (f === 'E') cx = b.pxMax * T - inset; else if (f === 'S') cy = b.pyMax * T - inset; else cy = b.pyMin * T + inset;
  cx = Math.round(cx); cy = Math.round(cy) - s.h;
  const tw = Math.round(6 * PM), th = Math.round(9 * PM), x = cx - tw / 2, top = cy - th;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x + 4, cy - 4, tw, 8);
  ctx.fillStyle = '#8a4234'; ctx.fillRect(x, top, tw, th);                                    // sandstone shaft
  ctx.fillStyle = '#6e3428'; ctx.fillRect(x, top, 3, th); ctx.fillRect(x + tw - 3, top, 3, th);
  ctx.fillStyle = '#2a2830'; for (let i = 0; i < 3; i++) ctx.fillRect(x + 6 + i * (tw - 12) / 3 + 1, top + 10, Math.max(3, (tw - 12) / 3 - 4), 14);   // belfry openings
  ctx.fillStyle = '#c8b498'; ctx.fillRect(x - 2, top - 3, tw + 4, 4);                            // cornice
  ctx.fillStyle = '#4e5a5c'; ctx.beginPath(); ctx.ellipse(cx, top - 3, tw / 2 - 2, tw / 2 - 2, 0, Math.PI, 0); ctx.fill();   // the dome
  ctx.fillStyle = '#6a7a7c'; ctx.fillRect(cx - tw / 4, top - tw / 2 + 2, 3, tw / 2 - 6);
  ctx.fillStyle = '#c8b498'; ctx.fillRect(cx - 1, top - tw / 2 - 6, 2, 6); ctx.fillRect(cx - 3, top - tw / 2 - 2, 6, 2);
  ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, top + 0.5, tw - 1, th - 1);
}
function drawPortico(b) {
  if (b.face !== 'E' && b.face !== 'W' && b.face !== 'S' && b.face !== 'N') return;
  const s = b.style, alongX = b.face === 'N' || b.face === 'S';
  // columns on the front wall, centred on the door
  const [dx, dy] = doorM(b), fy = Math.round(b.pyMax * T);
  if (!alongX && b.face === 'E') {   // an east front shows as the side wall in this view: two white columns at the door end
    const x = Math.round(b.pxMax * T), y = Math.round(dy * T);
    ctx.fillStyle = '#ecebe4'; ctx.fillRect(x - 2, y - s.h, 4, s.h); ctx.fillRect(x - 2, y - s.h - 2 + 14, 4, 2);
    ctx.fillStyle = '#f4f2ea'; ctx.beginPath(); ctx.moveTo(x - 4, y - s.h - 10); ctx.lineTo(x + 4, y - s.h - 4); ctx.lineTo(x - 4, y - s.h + 2); ctx.fill();
    return;
  }
  const cx = Math.round(dx * T), w = Math.round(6 * PM);
  ctx.fillStyle = '#f4f2ea'; ctx.beginPath(); ctx.moveTo(cx - w / 2 - 4, fy - s.h + 10); ctx.lineTo(cx, fy - s.h - 6); ctx.lineTo(cx + w / 2 + 4, fy - s.h + 10); ctx.fill();
  ctx.fillStyle = '#ecebe4'; for (const k of [-1, 1]) ctx.fillRect(cx + k * w / 2 - 3, fy - s.h + 10, 6, s.h - 10);
}

// ---------- street facts for single storefronts (Nov 12) ----------
// Colours and features noted from a street photo Christian sent of the 800 block (reference only; nothing traced or copied).
// 802 is the two-storey corner building the Fig Tree is part of: buff brick, a decorative corbelled cornice with small finials.
// 808, next door to the west: a white two-storey front with large upper windows.
// FACADES now lives in js/data/facades.js (street facts by address).
applyFacades();
{ const _db2 = drawBuilding; drawBuilding = function (b) { _db2(b); const s = b.style; if (!s || (b.face !== 'S' && b.face !== 'N')) return;
  if (s.cornice) drawCornice(b, s); if (s.metalBand) drawMetalBand(b, s); if (s.pediment) drawPediment(b, s); }; }
{ const _db3 = drawBuilding; drawBuilding = function (b) { const s0 = b.style;
  if (s0 && s0.canopyOnly) { if (!s0.canopy) s0.canopy = [b.pxMin, b.pyMin, b.pxMax, b.pyMax, s0.canopyH || 4.6]; drawCanopy(s0); return; }
  _db3(b); const s = b.style; if (!s) return; if (s.canopy) drawCanopy(s); if (s.dome) drawDome(b, s); if (s.skyway) drawSkyway(s); }; }
function drawDome(b, s) {   // a low dark dome over the entrance, near the street side of the roof
  const cx = ((b.pxMin + b.pxMax) / 2 + (s.domeDx || 0)) * T, cy = (b.face === 'N' ? b.pyMin + 1.4 : b.pyMax - 1.4) * T - s.h, r = 2.4 * PM;
  F('rgba(0,0,0,.25)', cx - r, cy + 2, r * 2 + 4, 4); ctx.fillStyle = '#3e4448'; ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.fill();
  ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 2; ctx.stroke(); ctx.fillStyle = '#6a7276'; ctx.beginPath(); ctx.arc(cx - r * 0.3, cy - r * 0.35, r * 0.25, 0, 6.29); ctx.fill();
}
function drawSkyway(s) {   // the enclosed walkway over Fifth between the two hospital buildings
  const [x0, x1, y0, y1, hb, ht] = s.skyway, X0 = x0 * T, X1 = x1 * T, Y0 = y0 * T, Y1 = y1 * T, Hb = hb * PM, Ht = ht * PM;
  F('rgba(0,0,0,.22)', X0 + 4, Y0, X1 - X0, Y1 - Y0);                                         // its shadow on the road
  F('#1c1618', X0 - 1, Y1 - Ht - 1, X1 - X0 + 2, Ht - Hb + 2); F('#cbbca2', X0, Y1 - Ht, X1 - X0, Ht - Hb);   // south end face
  F('#1c1618', X0 - 1, Y0 - Ht - 1, X1 - X0 + 2, Y1 - Y0 + 2); F('#d8ccb4', X0, Y0 - Ht, X1 - X0, Y1 - Y0);     // roof
  F('#b8a88e', X0, Y0 - Ht, 3, Y1 - Y0); F('#b8a88e', X1 - 3, Y0 - Ht, 3, Y1 - Y0);
  for (let y = Y0 - Ht + 8; y < Y1 - Ht - 6; y += 22) { F('#2a3a52', X0, y, 3, 8); F('#2a3a52', X1 - 3, y, 3, 8); }   // windows along both sides
  for (const y of [Y0, Y1]) for (const x of [X0 + 3, X1 - 6]) F('#b8a88e', x, y - Hb, 3, Hb);   // the legs
}
function drawCanopy(s) {   // a fuel canopy on posts, white roof with a blue fascia, pumps underneath, and the price sign at the corner
  const [x0, y0, x1, y1, hm] = s.canopy, X0 = x0 * T, X1 = x1 * T, Y0 = y0 * T, Y1 = y1 * T, h = hm * PM, fh = Math.round(0.7 * PM);
  if (s.pumps !== 0) for (let i = 0; i < 3; i++) { const py = Y0 + (i + 0.5) * (Y1 - Y0) / 3; F('#3a6ad0', (X0 + X1) / 2 - 5, py - 9, 10, 12); F('#e8ecf2', (X0 + X1) / 2 - 3, py - 7, 6, 4); F('rgba(0,0,0,.25)', (X0 + X1) / 2 - 5, py + 3, 10, 2); }
  for (const x of [X0 + 6, X1 - 8]) for (const y of [Y0 + 4, Y1 - 2]) { F(s.postCol || '#2a4fa8', x, y - h, 3, h); F('rgba(0,0,0,.2)', x + 3, y - h, 1, h); }
  F('rgba(0,0,0,.18)', X0 + 6, Y0 + 8, X1 - X0, Y1 - Y0);   // its shadow on the pavement
  F('#1c1618', X0 - 1, Y0 - h - 1, X1 - X0 + 2, Y1 - Y0 + 2); F('#eef0f2', X0, Y0 - h, X1 - X0, Y1 - Y0 - fh);
  const fc = s.canopyCol || '#1e4fb0'; F(fc, X0, Y1 - h - fh, X1 - X0, fh); F(shade(fc, 0.3), X0 + 2, Y1 - h - fh + 2, X1 - X0 - 4, 1); if (s.pylon) F('#c8202a', (X0 + X1) / 2 - 4, Y1 - h - fh + 1, 8, fh - 2); else for (let x = X0 + 4; x < X1 - 4; x += 6) F(shade(fc, -0.12), x, Y1 - h - fh + 3, 3, fh - 4);
  if (s.pylon) { const px = s.pylon[0] * T, py = s.pylon[1] * T, ph = 7.5 * PM; F('#5a5e64', px - 2, py - ph, 4, ph);
    F('#1c1618', px - 13, py - ph - 30, 26, 32); F('#1e4fb0', px - 12, py - ph - 29, 24, 18); F('#f2f1ea', px - 9, py - ph - 26, 18, 8); F('#c8202a', px - 5, py - ph - 24, 10, 4);
    F('#2a3a52', px - 12, py - ph - 10, 24, 9); F('#e8c060', px - 8, py - ph - 7, 16, 3); }
}
function frontTop(b, s) { return Math.round((b.face === 'S' ? b.pyMax : b.pyMin) * T) - s.h; }
function drawMetalBand(b, s) {   // a ribbed white metal band across the front, just above the shop windows
  const xl = Math.round(b.pxMin * T), xr = Math.round(b.pxMax * T), by = Math.round((b.face === 'S' ? b.pyMax : b.pyMin) * T), y = by - Math.round(4.6 * PM), h = Math.round(1.1 * PM);
  const bc = s.bandCol || '#eceae2';
  ctx.fillStyle = bc; ctx.fillRect(xl, y, xr - xl, h);
  ctx.fillStyle = shade(bc, -0.16); for (let x = xl + 1; x < xr; x += 3) ctx.fillRect(x, y, 1, h);
  if (s.signBox) { const w = Math.round(3.2 * PM), x = Math.round(xr - w - 2.5 * PM); ctx.fillStyle = s.signBox; ctx.fillRect(x, y - 4, w, h + 6); ctx.fillStyle = shade(s.signBox, -0.25); ctx.fillRect(x, y + h + 1, w, 1); ctx.fillStyle = shade(s.signBox, 0.25); ctx.fillRect(x, y - 4, w, 1); }
  ctx.fillStyle = '#9a7a6a'; ctx.fillRect(xl, y + h, xr - xl, 2);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(xl, y + h + 2, xr - xl, 2);
}
function drawPediment(b, s) {   // a stepped parapet in the middle with the building's name, and peach trim along the top
  const xl = Math.round(b.pxMin * T), xr = Math.round(b.pxMax * T), top = frontTop(b, s), cx = (xl + xr) / 2, w = Math.round((xr - xl) * 0.34);
  ctx.fillStyle = s.trim || '#d4a48a'; ctx.fillRect(xl, top + 4, xr - xl, 2);
  ctx.fillStyle = s.wall; ctx.fillRect(Math.round(cx - w / 2), top - 6, w, 8); ctx.fillRect(Math.round(cx - w / 4), top - 10, Math.round(w / 2), 5);
  ctx.fillStyle = shade(s.wall, -0.2); ctx.fillRect(Math.round(cx - w / 2), top - 6, w, 1); ctx.fillRect(Math.round(cx - w / 4), top - 10, Math.round(w / 2), 1);
  ctx.fillStyle = s.trim || '#d4a48a'; ctx.fillRect(Math.round(cx - 13), top - 4, 26, 8);
  ctx.font = SMALL; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = '#5a4034'; ctx.fillText(s.pediment, Math.round(cx), top - 4);
  for (const k of [0.17, 0.5, 0.83]) { ctx.fillStyle = s.trim || '#d4a48a'; ctx.beginPath(); const x = xl + (xr - xl) * k; ctx.moveTo(x - 3, top + 8); ctx.lineTo(x, top + 13); ctx.lineTo(x + 3, top + 8); ctx.fill(); }   // the little diamond keystones
}
function drawCornice(b, s) {   // a brick corbel table along the top of the front, with little finials over the piers
  const xl = Math.round(b.pxMin * T), xr = Math.round(b.pxMax * T), top = Math.round((b.face === 'S' ? b.pyMax : b.pyMin) * T) - s.h;
  const dk = shade(s.wall, -0.25), lt = shade(s.wall, 0.18);
  ctx.fillStyle = dk; ctx.fillRect(xl, top, xr - xl, 3);
  ctx.fillStyle = lt; ctx.fillRect(xl, top + 3, xr - xl, 2);
  for (let x = xl + 2; x < xr - 3; x += 6) { ctx.fillStyle = dk; ctx.fillRect(x, top + 5, 3, 4); ctx.fillStyle = lt; ctx.fillRect(x, top + 5, 1, 3); }   // corbels
  ctx.fillStyle = dk; ctx.fillRect(xl, top + 10, xr - xl, 2);
  for (const x of [xl, xl + (xr - xl) / 3, xl + 2 * (xr - xl) / 3, xr - 6]) {   // finials on the piers
    ctx.fillStyle = s.wall; ctx.fillRect(Math.round(x), top - 7, 6, 7); ctx.fillStyle = dk; ctx.fillRect(Math.round(x), top - 7, 6, 2); ctx.fillStyle = lt; ctx.fillRect(Math.round(x) + 1, top - 5, 1, 4);
  }
}
