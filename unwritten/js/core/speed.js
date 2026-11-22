"use strict";
let drawTerrainLayer_orig = null;   // kept for comparison tests
// ---------- Speed (Nov 13): the soft terrain shading was rebuilt and smoothly enlarged to full screen every frame, which
// was most of the drawing time. Now it is built once per 4 m step of the camera and simply copied in between.
// Same picture as before (town.js drawTerrainLayer), drawn into a cached canvas. ----------
{ const TLC = { key: '', cv: null, g: null, sm: null, sg: null }; drawTerrainLayer_orig = drawTerrainLayer;
  drawTerrainLayer = function (x0, y0, ox, oy) {
    if (!TERR) return;
    const cols = Math.ceil(SW / T) + 3, rows = Math.ceil(SH / T) + 3, key = x0 + ',' + y0 + ',' + T;
    if (TLC.key !== key) {
      if (!TLC.cv || TLC.cv.width !== cols * T || TLC.cv.height !== rows * T) {
        TLC.cv = document.createElement('canvas'); TLC.cv.width = cols * T; TLC.cv.height = rows * T; TLC.g = TLC.cv.getContext('2d');
        TLC.sm = document.createElement('canvas'); TLC.sm.width = cols; TLC.sm.height = rows; TLC.sg = TLC.sm.getContext('2d');
      }
      const img = TLC.sg.createImageData(cols, rows), d = img.data;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = x0 - 1 + i, y = y0 - 1 + j, o = (j * cols + i) * 4;
        if (x < 0 || y < 0 || x >= TW || y >= TH) continue;
        const kind = TKIND[tAt(x, y)]; if (kind === 'water') continue;
        const s = TERR[y * TW + x], tone = s & 7;
        if (s & 8 && NATURAL.has(kind)) { d[o] = 112; d[o + 1] = 88; d[o + 2] = 56; d[o + 3] = 105; continue; }
        if (tone < 3) { d[o] = 18; d[o + 1] = 28; d[o + 2] = 56; d[o + 3] = Math.round((3 - tone) * 0.075 * 255); }
        else if (tone > 3) { d[o] = 255; d[o + 1] = 246; d[o + 2] = 214; d[o + 3] = Math.round((tone - 3) * 0.06 * 255); }
      }
      TLC.sg.putImageData(img, 0, 0);
      const g = TLC.g; g.clearRect(0, 0, TLC.cv.width, TLC.cv.height);
      g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(TLC.sm, 0, 0, cols * T, rows * T); g.imageSmoothingEnabled = false;
      g.fillStyle = 'rgba(70,52,30,.45)';
      for (let j = 1; j < rows - 1; j++) for (let i = 1; i < cols - 1; i++) {   // ledges on the steep banks
        const x = x0 - 1 + i, y = y0 - 1 + j; if (x < 0 || y < 0 || x >= TW || y >= TH) continue;
        if (!(TERR[y * TW + x] & 8) || !NATURAL.has(TKIND[tAt(x, y)])) continue;
        for (let k = 0; k < 3; k++) g.fillRect(i * T + 2 + (hash(x, y + k) % 8), j * T + 5 + k * 10, T - 12, 2);
      }
      TLC.key = key;
    }
    ctx.drawImage(TLC.cv, Math.round(ox - T), Math.round(oy - T));
  };
}
