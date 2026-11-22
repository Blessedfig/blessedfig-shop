"use strict";
// ============================================================================
// Fuel canopies from the Street View survey (Nov 18). OpenStreetMap draws a station's pump canopy as a building
// (a "roof"), so the game had been painting walls and windows on it. Each one the surveyors saw is drawn instead as an
// open canopy you can walk under, with pumps and the colour of its fascia band as seen. Colours only; no brand logos.
// Keyed by the canopy outline's centre in 4 m cells.
// ============================================================================
(function () {
  const CANOPIES = [
    [783.6, 1354.9, '#e0b020'], [783.4, 1359.6, '#e0b020'],   // Shell, S Superior: white canopy, red and yellow band
    [799.8, 1362.1, '#2a5cc0', [3186, 5427, 3204, 5437]],     // the small canopy east of the store, where the 2025 photo shows it
    [786.5, 915.5, '#1e4fb0'],                                 // Cenex, Superior north of Fourth: white canopy, blue band
    [913.0, 21.1, '#1f8a3a', [3640, 75, 3659, 92]],            // Hwy 45 north: white with green bands, three islands
    [785.0, 1165.3, '#2050b0'],                                // Krist, Superior: white with blue stripes
    [798.0, 1166.3, '#1e4fb0'],                                // Superior across from it
    [796.9, 1046.3, '#1f8a3a'],                                // Gas-n-Go: green and white
    [858.4, 398.1, '#1f8a3a'],                                 // Neva Rd: green and white band
    [849.9, 297.8, '#c8202a'], [855.9, 303.5, '#c8202a'],      // Fast Stop: red band
    // Fleet Farm Gas, Neva Rd north (Nov 19, checked on the 2025 photo): the dark-roofed outline in the middle is the store;
    // the canopies, orange fascia and white columns, stand either side of it (the east one is added in js/data/fixes/gas.js)
    [883.25, 231.75, '#e07020', [3527, 913, 3537, 937]], [888.9, 231.25, '#e07020'],
    [877.25, 376.75, '#c8202a', [3490, 1502, 3526, 1513]],    // Kwik Trip, Hwy 64: one long canopy south of the store
    [802.0, 953.1, null, [3188, 3802, 3218, 3816]],             // VP Fuels, 601 Superior: the canopy where the photo shows it
  ];
  let n = 0;
  for (const [x, y, col, rect] of CANOPIES) {
    const b = BLD.find(b => Math.abs((b.pxMin + b.pxMax) / 2 - x) < 1.2 && Math.abs((b.pyMin + b.pyMax) / 2 - y) < 1.2);
    if (!b || b.type === 'fig' || b.landmark) continue;
    const s = bstyle(b);
    if (rect) { s.canopy = [rect[0] / 4, rect[1] / 4, rect[2] / 4, rect[3] / 4, s.canopyH || 4.8]; s.canopyRect = rect; }
    if (s.canopyOnly) { if (s.canopy) s.canopy[4] = s.canopyH || 4.6; delete s.pylon; continue; }   // its sign is now the brand sign (js/data/fixes/gas.js)
    s.canopyOnly = 1; s.canopyH = Math.max(4.4, Math.min(5.6, (b.lh || 5) - 0.4)); s.canopyCol = col; b.canopyRoof = 1; n++;
    if (s.canopyRect) s.canopy[4] = s.canopyH;
  }
  window.FUEL_CANOPIES = n;
  // the ground under a canopy is the station's concrete, not a yard (a canopy traced as a 'shed' would otherwise sit on grass)
  const _dtt = drawTownTile;
  drawTownTile = function (x, y, sx, sy) {
    const b = TT[y * TW + x] === TL.BLDG ? bAt(x, y) : null;
    if (b && b.canopyRoof && !PAVED_UNDER.has(b.type)) { PAVED_UNDER.add(b.type); try { return _dtt(x, y, sx, sy); } finally { PAVED_UNDER.delete(b.type); } }
    return _dtt(x, y, sx, sy);
  };
  // pump islands along a long east-west canopy (the stock canopy puts three pumps in one north-south row)
  const _dc = drawCanopy;
  drawCanopy = function (s) {
    const [x0, y0, x1, y1] = s.canopy;
    if (!s.canopyOnly || s.pumps === 0 || x1 - x0 < (y1 - y0) * 1.3) return _dc(s);
    const X0 = x0 * T, X1 = x1 * T, Y0 = y0 * T, Y1 = y1 * T, k = Math.max(2, Math.round((x1 - x0) * 4 / 8)), cy = (Y0 + Y1) / 2;
    for (let i = 0; i < k; i++) { const px = X0 + (i + 0.5) * (X1 - X0) / k;
      F('#a8a49a', px - 14, cy - 3, 28, 8); F('#3a6ad0', px - 5, cy - 11, 10, 12); F('#e8ecf2', px - 3, cy - 9, 6, 4); F('rgba(0,0,0,.25)', px - 5, cy + 1, 10, 2); }
    s.pumps = 0; _dc(s); delete s.pumps;
  };
})();
