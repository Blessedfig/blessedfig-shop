"use strict";
// ---------- the Survey: real, sourced facts about any building you look at (Nov 13, Christian: 'give each building a rundown
// of GIS information, or a submenu'). Data: js/data/survey.js, built by scripts/town/survey.py from public sources.
// Rules: homes get physical facts only; Census figures are block-group totals (a few hundred homes), never one household;
// no owner names, no property values or sales. ----------
const PCLASS = { '1': 'Residential', '2': 'Commercial', '3': 'Manufacturing', '4': 'Agricultural', '5': 'Undeveloped', '5m': 'Agricultural forest', '6': 'Forest', '7': 'Other (farm buildings)' };
const OKIND = { gov: 'A public body', faith: 'A congregation', health: 'A health-care organization', util: 'A utility', club: 'A club or association', biz: 'A business', private: 'Privately owned' };
const HOME_TYPES = ['house', 'garage', 'shed', 'farmhouse', 'apartments', 'barn'];
const KIND_WORD = { house: 'House', garage: 'Garage or outbuilding', shed: 'Shed', store: 'Storefront or shop', apartments: 'Apartments', civic: 'Public building',
  church: 'Church', school: 'School', hospital: 'Hospital building', factory: 'Plant or warehouse', barn: 'Barn', farmhouse: 'Farmhouse', fig: 'Bookstore' };
const ft = m => Math.round(m * 3.28084).toLocaleString();
const nice = s => s.toLowerCase().replace(/\b(\w)/g, c => c.toUpperCase());

function surveyOffer(b) {   // the choice at the end of looking at a building
  if (!DLG || typeof SURVEY === 'undefined' || !SURVEY.R[b.id - 1]) return;
  DLG.opts = [{ t: 'Move on' }, { t: 'Survey this place', f: () => surveyOpen(b) }]; DLG.sel = 0;
}
function storeys(b) {   // an estimate from the lidar height: shop floors run taller than house floors, and a pitched roof adds height
  if (b.floorsKnown) return b.floorsKnown + (b.floorsKnown === 1 ? ' storey' : ' storeys');
  const h = b.lh, home = HOME_TYPES.includes(b.type);
  if (b.lflat || !home) { const n = Math.max(1, Math.round((h - 1.2) / 4)); return 'about ' + n + (n === 1 ? ' storey' : ' storeys'); }
  return h < 6.5 ? 'about 1 storey' : h < 7.8 ? 'about 1½ storeys' : h < 11.5 ? 'about 2 storeys' : 'about 3 storeys';
}
function figCentre() { const f = BLD.find(x => x.type === 'fig'); return f ? [(f.pxMin + f.pxMax) / 2, (f.pyMin + f.pyMax) / 2] : null; }
function surveyPages(b) {
  const r = SURVEY.R[b.id - 1], s = b.style || bstyle(b), home = HOME_TYPES.includes(b.type), pages = [];
  // 1. the building
  const A = [];
  if (b.addr) A.push(['Address', nice(b.addr)]);
  A.push(['Kind', (KIND_WORD[b.type] || 'Building') + (b.name ? ' · ' + b.name : '')]);
  const pc = String(b.pclass || '').split(',').map(c => PCLASS[c.trim().toLowerCase()]).filter(Boolean);
  if (pc.length) A.push(['Property class', pc.join(' and ')]);
  if (!home && OKIND[b.okind]) A.push(['Owner', OKIND[b.okind]]);
  if (b.area) A.push(['Footprint', Math.round(b.area).toLocaleString() + ' sq m (' + Math.round(b.area * 10.764).toLocaleString() + ' sq ft)']);
  if (b.mKnown) A.push(['Height', 'About ' + b.mKnown + ' m (' + ft(b.mKnown) + ' ft), ' + storeys(b) + ', from street photos']);
  else if (b.lh) A.push(['Height', b.lh.toFixed(1) + ' m (' + ft(b.lh) + ' ft) to the roof top, ' + storeys(b)]);
  const big = !home && b.area > 1500;
  if (b.lh) A.push(['Roof', (b.lflat ? 'Flat' : big ? 'Several levels' : 'Pitched') + (b.rc ? '. Its colour from the air, May 2025:' : ''), b.rc]);
  const src = b.traced ? 'Traced from the 2017 county lidar' : ['Microsoft Building Footprints', 'OpenStreetMap', 'Found in the 2017 county lidar', 'Microsoft Building Footprints (2026 release)', 'Traced from the 2025 aerial photo'][r[4]];
  if (src) A.push(['Outline', src]);
  A.push(['Look', b.type === 'fig' ? "Drawn from the owner's photos" : b.landmark ? 'Styled from public-domain photos of it' :
    b.photo ? 'Drawn from street photos, Nov 2026' : 'Typical for its size and roof (no street photo yet)']);
  pages.push({ title: 'THE BUILDING', rows: A,
    src: 'Langlade County parcels 2025 · county lidar 2017 · WROC aerial photo 2025 · ' + (r[4] === 1 ? 'OpenStreetMap' : 'Microsoft and OpenStreetMap') + '. Something wrong? Tell us at the Fig Tree.' });
  // 2. the ground under it
  const Gr = [];
  if (r[0] > 0) Gr.push(['Elevation', ft(r[0] / 10) + ' ft (' + Math.round(r[0] / 10) + ' m) above sea level']);
  const so = SURVEY.S[r[1]];
  if (so) Gr.push(['Soil', so[0] + '. ' + so[1] + '.' + (/^Antigo silt loam/.test(so[0]) ? " Antigo silt loam is Wisconsin's state soil, named for this town." : '')]);
  const ge = SURVEY.G[r[2]];
  if (ge) { const [mat, land, who] = ge.split('|');
    const how = /Meltwater/.test(mat) ? ', laid down by meltwater from the last glaciers' : /till/i.test(mat) ? ', left by the glacier ice itself' : /Peat/.test(mat) ? ', built up in wetland since the ice left' : '';
    Gr.push(['Beneath that', mat + (land ? ' (' + land + ')' : '') + how + (who ? '. ' + who : '') + '.']); }
  const wn = SURVEY.W[r[5]];
  if (wn) Gr.push(['Nearest water', wn + ', ' + r[6].toLocaleString() + ' m (' + ft(r[6]) + ' ft)']);
  const fc = figCentre();
  if (b.type === 'fig') Gr.push(['The Fig Tree', "You're looking at it."]);
  else if (fc) { const d = Math.hypot((b.pxMin + b.pxMax) / 2 - fc[0], (b.pyMin + b.pyMax) / 2 - fc[1]) * 4;
    Gr.push(['The Fig Tree', (d < 1000 ? Math.round(d) + ' m' : (d / 1000).toFixed(1) + ' km') + ' (' + (d / 1609).toFixed(1) + ' mi) as the crow flies']); }
  pages.push({ title: 'THE GROUND', rows: Gr, src: 'USGS 3DEP elevation · USDA NRCS soil survey, Langlade County · WGNHS glacial geology (Mickelson 1986) · OpenStreetMap' });
  // 3. the Census neighborhood: block-group totals only
  const bg = SURVEY.BG[r[3]];
  if (bg) { const [g, pop, hu, yb, moe] = bg, tr = g.slice(5, 11), tract = String(+tr.slice(0, 4)) + (tr.slice(4) !== '00' ? '.' + tr.slice(4) : '');
    const N = [['Census area', 'Tract ' + tract + ', block group ' + g.slice(11)], ['People', pop.toLocaleString() + ' (2020 Census)'], ['Homes', hu.toLocaleString() + ' housing units (2020 Census)']];
    if (yb) N.push(['Year built', yb <= 1939 ? 'Median 1939 or earlier: at least half the homes here are older than 1940 (ACS estimate)' : 'Median ' + yb + (moe > 0 ? ', give or take ' + moe + ' years' : '') + ': half the homes here are older (ACS estimate)']);
    N.push(['Note', 'These are totals for the whole block group, a few hundred homes. The Census never publishes facts about a single household.']);
    pages.push({ title: 'THE NEIGHBORHOOD', rows: N, src: 'U.S. Census Bureau: 2020 Census blocks (TIGER/Line POP20, HOUSING20) · American Community Survey 2020-2024, table B25035' }); }
  return pages;
}
function surveyOpen(b) {
  const pages = surveyPages(b), head = b.name || (b.addr ? nice(b.addr) : KIND_WORD[b.type] || '');
  say(pages.map((p, i) => ['', 'SURVEY ' + (i + 1) + '/' + pages.length + '   A: ' + (i + 1 < pages.length ? 'next page' : 'done') + '   B: close']));
  DLG.ch = 999; DLG.survey = { b, head, pages };
}
function drawSurvey(sv, pg) {
  const x = 8, y = 8, w = SW - 16, h = SH - 64 - 14, P = sv.pages[pg]; win(x, y, w, h);
  txt(P.title, x + 10, y + 9, '#ffd860');
  txt(sv.head.length > 30 ? sv.head.slice(0, 29) + '…' : sv.head, x + w - 10, y + 10, '#c8d0ff', 'right', SMALL);
  R(x + 8, y + 21, w - 16, 1, 'rgba(255,255,255,.25)');
  let yy = y + 27; const vx = x + 112, vw = w - 124;
  for (const [k, v, sw] of P.rows) {
    const L = wrap(v, vw, SMALL);
    txt(k, x + 10, yy, '#ffd860', 'left', SMALL);
    L.forEach((l, i) => txt(l, vx, yy + i * 9, '#fff', 'left', SMALL));
    if (sw) { const last = L[L.length - 1]; ctx.font = SMALL; const sx = vx + ctx.measureText(last).width + 4, sy = yy + (L.length - 1) * 9 - 1;
      R(sx, sy, 16, 8, '#000'); R(sx + 1, sy + 1, 14, 6, sw); }
    yy += L.length * 9 + 4;
  }
  const F = wrap(P.src, w - 20, SMALL);
  F.forEach((l, i) => txt(l, x + 10, y + h - 6 - (F.length - i) * 8, 'rgba(255,255,255,.62)', 'left', SMALL));
}
