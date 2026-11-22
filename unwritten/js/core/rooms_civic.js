"use strict";
// =====================================================================
//  SCHOOLS, CHURCHES AND THE LEGION MEMORIAL, INSIDE (Nov 21, Christian: "open schools, churches and legion memorial").
//  Every school building (but NTC, which keeps its own campus inside in industry.js), every church building and the
//  American Legion Memorial opens onto its real outline at the interiors' 1 m tile (rooms.js turns it so the door is at the
//  bottom), divided into rooms that fit whatever width and depth the outline gives:
//   · schools: an entry and the main office, hallways of lockers, classrooms (rugs and cubbies in the grade schools, a
//     science lab in the upper grades), a gym with court lines and bleachers, a cafeteria, a library, a music room, an art
//     room, the nurse, restrooms. The layout is invented from the outline alone; it is nobody's real floor plan.
//   · churches: furnished by what the sign says and nothing more: a narthex, the nave or sanctuary (pews, altar or table,
//     pulpit or ambo, font, hymn boards; chairs and a stage where the church is non-denominational), and where the building
//     is big enough a fellowship hall with a kitchen, classrooms, an office, a nursery.
//   · the Legion Memorial: a lobby of plaques (no names) and display cases, a hall with tables, a stage and flags, a bar
//     counter, a kitchen, an office.
//  People are generic: teachers, staff and ordinary schoolkids with plain lines, a greeter at church, members at the Legion.
//  The schools' own front office, teachers, librarian and gym teacher still open the skill tree (schools.js).
//  Nothing is built until a door is used. Tile tokens added here all start with 'c_'.
// =====================================================================
const CV = new Map();   // building id -> { k: 'school'|'church'|'legion', v: variant, role }
function cvDen(n, own) {
  const s = (n || '').toLowerCase(), o = (own || '').toUpperCase();
  if (/catholic|sts\. mary/.test(s)) return 'cath';
  if (/episcopal|kostel/.test(s)) return 'litur';
  if (/lutheran/.test(s) || (!n && /LUTH/.test(o))) return 'luth';
  if (/baptist/.test(s)) return 'bapt';
  if (/^church of christ$/.test(s)) return 'coc';
  if (/christ central/.test(s)) return 'free';
  if (!n && /PRESID BISHOP/.test(o)) return 'lds';
  if (!n && /ST JOHN/.test(o)) return 'cath';
  return 'prot';
}
function cvArea(b) { const d = bzDims(b); return d[0] * d[1]; }
{ const groups = new Map(), ownNamed = new Set();
  for (const b of BLD) {
    if (!b || !b.poly || b.poly.length < 3 || roomSkip(b) || b.landmark) continue;
    const n = b.name || '';
    if (b.type === 'school' && n !== 'Northcentral Technical College') {
      CV.set(b.id, { k: 'school', v: /middle/i.test(n) ? 'mid' : /high/i.test(n) ? 'high' : /elementary|grade school|lutheran school|schoolhouse/i.test(n) ? 'elem' : 'mid' });
    } else if (b.type === 'church' && !roomEligible(b)) {
      const key = n ? 'n:' + n : 'o:' + (b.owner || b.id); if (!groups.has(key)) groups.set(key, []); groups.get(key).push(b); if (n && b.owner) ownNamed.add(b.owner);
    } else if (n === 'American Legion Memorial' && !roomEligible(b)) CV.set(b.id, { k: 'legion', v: '' });
  }
  for (const [key, list] of groups) { list.sort((p, q) => cvArea(q) - cvArea(p));
    list.forEach((b, i) => { const main = i === 0 && !(key[0] === 'o' && ownNamed.has(b.owner)), a = cvArea(b);
      CV.set(b.id, { k: 'church', v: cvDen(b.name, b.owner), role: main ? (a < 70 ? 'office' : 'main') : (a < 120 ? 'office' : 'hall') }); }); }
}
{ const _re = roomEligible; roomEligible = function (b) { return _re(b) || (!!b && CV.has(b.id)); }; }
{ const _rh = roomHook; roomHook = function (b) { return b && CV.has(b.id) ? cvHook(b) : _rh(b); }; }
for (const b of BLD) if (CV.has(b.id) && b.name) b.enter = b.enter || 1;
ROOM_DOOR = null;   // rebuilt with these doors the first time it's asked
['c_dr', 'c_mat', 'c_rug'].forEach(t => ROOM_WALK.add(t));

// ---------- looks: floors and walls by room ----------
const CZ = {
  hall: { f: ['terr', '#d8d2c2', '#c4bca8'], w: ['#ece4cc', '#8a2a2a'], n: 'HALLWAY' }, vest: { f: ['terr', '#cfc8b6', '#bab2a0'], w: ['#ece4cc', '#8a2a2a'], n: 'ENTRY' },
  office: { f: ['carpet', '#5a6a7a', '#52626f'], w: ['#e8e6e0', '#6a7a8a'], n: 'MAIN OFFICE' }, class: { f: ['vct', '#e2ded0', '#d0ccbe'], w: ['#efe8d4', '#5a6a8a'], n: 'CLASSROOM' },
  eclass: { f: ['vct', '#e8e2cc', '#d6cfb6'], w: ['#f2ead0', '#4a8a5a'], n: 'CLASSROOM' }, lab: { f: ['vct', '#dcdcd4', '#c8c8c0'], w: ['#e6ece8', '#3a6a5a'], n: 'SCIENCE LAB' },
  art: { f: ['vct', '#e4ddd0', '#d2cabe'], w: ['#f2ecdc', '#c86a3a'], n: 'ART ROOM' }, music: { f: ['carpet', '#6a4a6a', '#5e4060'], w: ['#ece6dc', '#6a4a6a'], n: 'MUSIC ROOM' },
  gym: { f: ['maple', '#d4a868', '#c49858'], w: ['#e8e4d8', '#a02828'], n: 'GYM' }, caf: { f: ['check', '#ece6d6', '#c8c0aa'], w: ['#f0ead8', '#3a6a9a'], n: 'CAFETERIA' },
  lib: { f: ['carpet', '#3a5a7a', '#34526f'], w: ['#efe8d8', '#7a5a3a'], n: 'LIBRARY' }, rest: { f: ['hex', '#eeeeea', '#d0d0cc'], w: ['#dfe8ec', '#7a9aaa'], n: 'RESTROOM' },
  nurse: { f: ['vct', '#e8ecea', '#d6dcda'], w: ['#eef4f2', '#4a8aa0'], n: 'NURSE\'S OFFICE' }, aud: { f: ['carpet', '#6a2a2a', '#5e2424'], w: ['#e6dccc', '#5a2a2a'], n: 'AUDITORIUM' },
  stage: { f: ['wood', '#8a5a32', '#7a4e2a'], w: ['#3a2a2a', '#5a2a2a'], n: 'STAGE' },
  narthex: { f: ['tile', '#cfc6b4', '#bdb4a0'], w: ['#ece4d0', '#6a4a2a'], n: 'NARTHEX' }, nave: { f: ['wood', '#9a6a40', '#8a5c36'], w: ['#efe6d2', '#6a4a2a'], n: 'NAVE' },
  chancel: { f: ['carpet', '#8a2a2a', '#7e2626'], w: ['#efe6d2', '#6a4a2a'], n: 'SANCTUARY' }, chall: { f: ['vct', '#dcd6c6', '#cac4b4'], w: ['#ece6d6', '#6a5a4a'], n: 'HALLWAY' },
  fellow: { f: ['vct', '#e0dccb', '#cec8b4'], w: ['#efe8d6', '#5a6a4a'], n: 'FELLOWSHIP HALL' }, kitchen: { f: ['check', '#e8e4dc', '#c8c0b0'], w: ['#f0f0ea', '#8a9aa0'], n: 'KITCHEN' },
  croom: { f: ['carpet', '#6a7a5a', '#607050'], w: ['#f0ead6', '#6a7a5a'], n: 'CLASSROOM' }, cofc: { f: ['carpet', '#5a5a6a', '#525262'], w: ['#ebe6dc', '#5a5a6a'], n: 'OFFICE' },
  nursery: { f: ['carpet', '#c8a8a8', '#bc9c9c'], w: ['#f4ece4', '#c88a8a'], n: 'NURSERY' }, sacr: { f: ['wood', '#8a6a48', '#7a5c3c'], w: ['#ece4d4', '#5a4a3a'], n: 'SACRISTY' },
  llobby: { f: ['carpet', '#2a3a6a', '#26345e'], w: ['#e8e0cc', '#2a3a6a'], n: 'LOBBY' }, lhall: { f: ['wood', '#a87a4a', '#986c40'], w: ['#e8e0cc', '#2a3a6a'], n: 'HALL' },
  lstage: { f: ['wood', '#6a4428', '#5a3a22'], w: ['#e8e0cc', '#2a3a6a'], n: 'STAGE' }, store: { f: ['vct', '#d4d0c4', '#c4c0b4'], w: ['#e4e0d4', '#6a6a6a'], n: 'STORAGE' },
};
const CV_DEF = { c_school: 'hall', c_church: 'nave', c_legion: 'lhall' };
Object.assign(ROOM_STYLE, { c_school: [['tile', '#d8d2c2', '#c4bca8'], ['#ece4cc', '#8a2a2a']], c_church: [['wood', '#9a6a40', '#8a5c36'], ['#efe6d2', '#6a4a2a']], c_legion: [['wood', '#a87a4a', '#986c40'], ['#e8e0cc', '#2a3a6a']] });
Object.assign(KIND_ZONE, { c_school: 'SCHOOL', c_church: 'CHURCH', c_legion: 'HALL' });
Object.assign(FOLKS, {   // generic people: schoolkids, teens, a greeter, a custodian, members of the post
  cv_k0: { skin: '#ecc19c', hair: '#c8903a', shirt: '#e05a5a', shirt2: '#c84a4a', pants: '#3a4a7a', shoes: '#e8e8ea', sc: 0.78 },
  cv_k1: { skin: '#c99878', hair: '#1e1612', shirt: '#4aa0d8', shirt2: '#3a90c8', pants: '#4a4a52', shoes: '#c83a3a', sc: 0.78 },
  cv_k2: { skin: '#e2b48e', hair: '#6a4a2a', shirt: '#f0c040', shirt2: '#e0b030', pants: '#7a3a6a', shoes: '#f4f4f8', sc: 0.78 },
  cv_k3: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#5ab06a', shirt2: '#4aa05a', pants: '#2a3a5a', shoes: '#2a2224', sc: 0.78 },
  cv_t0: { skin: '#ecc19c', hair: '#8a5a2a', shirt: '#a02828', shirt2: '#f0ece2', pants: '#2a3a5a', shoes: '#e8e8ea', sc: 0.93 },
  cv_t1: { skin: '#c99878', hair: '#1e1612', shirt: '#5a5e6a', shirt2: '#4a4e5a', pants: '#3a3a44', shoes: '#2a2224', sc: 0.93 },
  cv_t2: { skin: '#e8b898', hair: '#c87a3a', shirt: '#3a6a8a', shirt2: '#2e5a7a', pants: '#4a4a52', shoes: '#f4f4f8', sc: 0.93, glasses: 1 },
  cv_tch: { skin: '#d9a77c', hair: '#5a3a24', shirt: '#6a8a5a', shirt2: '#5a7a4a', pants: '#3a3a44', shoes: '#2a2224', glasses: 1 },
  cv_cust: { skin: '#e2b48e', hair: '#8a8a88', shirt: '#5a6a7a', shirt2: '#4a5a6a', pants: '#3a4a5a', shoes: '#2a2224', extra: 'cap' },
  cv_greet: { skin: '#ecc19c', hair: '#c8c4bc', shirt: '#8a5a6a', shirt2: '#7a4a5a', pants: '#3a3a44', shoes: '#2a2224', glasses: 1 },
  cv_vet: { skin: '#e2b48e', hair: '#b8b4ac', shirt: '#3a4a6a', shirt2: '#2e3e5e', pants: '#3a3a44', shoes: '#2a2224', extra: 'cap' },
  cv_vol: { skin: '#c99878', hair: '#3a2a20', shirt: '#c8a050', shirt2: '#b89040', pants: '#2a3a5a', shoes: '#2a2224', apron: '#e8e4dc' },
});
{ const _df = drawFolk; drawFolk = function (who, cx, by, t) { const S = FOLKS[who];
    if (S && S.sc) { ctx.save(); ctx.translate(cx, by); ctx.scale(S.sc, S.sc); _df(who, 0, 0, t); ctx.restore(); return; } return _df(who, cx, by, t); }; }

// ---------- the hook ----------
const CV_HOOKS = new Map();
function cvSchoolOf(b) { return typeof SCHOOLS !== 'undefined' && b && SCHOOLS[b.name] ? { name: b.name, band: SCHOOLS[b.name].band } : null; }
function cvHook(b) {
  let h = CV_HOOKS.get(b.id); if (h) return h;
  const c = CV.get(b.id), n = b.name || '', lit = ['cath', 'litur', 'luth'].includes(c.v);
  const title = n ? n.toUpperCase() : c.k === 'school' ? 'A SCHOOL BUILDING' : c.role === 'main' ? 'A CHURCH' : 'A CHURCH HALL';
  let line;
  if (c.k === 'school') { const o = ROOM_HOOK[n]; line = o && o.line ? o.line : (n || 'A school building') + '. Lockers, bulletin boards, and the smell of floor wax.'; }
  else if (c.k === 'legion') line = 'American Legion Memorial. Flags by the door, and a quiet lobby of plaques and display cases.';
  else if (c.role === 'main') line = (n || 'A church') + '. ' + (lit ? 'It\'s quiet inside. Candle wax and old wood.' : c.v === 'free' ? 'Bright and open. Somebody has the coffee on.' : 'It\'s quiet inside, and smells of old wood and coffee.');
  else line = (n ? n + '. ' : '') + (c.role === 'hall' ? 'The church hall: folding tables, a kitchen, a coffee pot.' : 'A small church office.');
  h = { kind: 'c_' + c.k, title, line, layout: (F, ctx) => cvLayout(F, ctx, b, c), zone: (F, x, y) => cvZone(F, x, y), look: (F, x, y, t, nn) => cvLook(F, x, y, t, nn) };
  CV_HOOKS.set(b.id, h); return h;
}
function cvZone(Fm, x, y) { const cv = Fm.cv; if (!cv) return null; const z = cv.Z[y * Fm.W + x]; if (z >= 0) cv.last = cv.zones[z].n; return cv.last || KIND_ZONE[Fm.kind]; }

// ---------- the planner ----------
function cvK(F, c, info, b) {
  const { R, W, H } = F, N = W * H;
  const cv = F.cv = { Z: new Int16Array(N).fill(-1), zones: [], wd: new Map(), last: '', info, school: info.k === 'school' ? cvSchoolOf(b) : null };
  const keep = new Uint8Array(N), keepE = new Uint8Array(N), iw = new Uint8Array(N), IW = [];
  const ok = (u, v) => v >= 0 && v < H && u >= 0 && u < W;
  const fl = (u, v) => ok(u, v) && R[v][u] === '.';
  for (const [u, v] of [[F.ex, F.ey], [F.ex, F.ey - 1], [F.ex - 1, F.ey], [F.ex + 1, F.ey]]) if (ok(u, v)) { keep[v * W + u] = 1; keepE[v * W + u] = 1; }
  const K = { F, R, W, H, cv, info, b, keep, iw, IW, npcs: [], rooms: [], todo: [], fl, ok, x0: c.fx0, x1: c.fx1, y0: c.fy0, y1: c.fy1, xs: F.ex, seed: F.seed, kids: 0, staff: 0,
    rnd: srng((b.id * 7919 + 33) >>> 0),
    set(u, v, t) { if (!fl(u, v) || keep[v * W + u]) return false; R[v][u] = t; return true; },
    floor(u, v, t) { if (!fl(u, v)) return false; R[v][u] = t; return true; },
    wall(u, v) { if (fl(u, v) && !keepE[v * W + u]) { R[v][u] = 'W'; iw[v * W + u] = 1; IW.push(v * W + u); } },
    door(u, v) { if (!ok(u, v)) return false; const i = v * W + u; if (!(R[v][u] === '.' || iw[i])) return false; R[v][u] = 'c_dr'; iw[i] = 0;
      for (let dv = -1; dv <= 1; dv++) for (let du = -1; du <= 1; du++) if (ok(u + du, v + dv)) keep[(v + dv) * W + u + du] = 1;
      for (const [du, dv] of [[0, 2], [0, -2], [2, 0], [-2, 0]]) if (ok(u + du, v + dv)) keep[(v + dv) * W + u + du] = 1; return true; },
    hwall(v, u0, u1, doors, gap) { for (let u = u0; u <= u1; u++) if (!gap || u < gap[0] || u > gap[1]) K.wall(u, v); if (doors) for (const u of doors) K.door(u, v); },
    vwall(u, v0, v1, doors) { for (let v = v0; v <= v1; v++) K.wall(u, v); if (doors) for (const v of doors) K.door(u, v); },
    zone(t, x0, y0, x1, y1, n, o) { const z = Object.assign({ t, n: n || CZ[t].n, x0, y0, x1, y1, i: cv.zones.length }, o || {}); cv.zones.push(z);
      for (let v = Math.max(0, y0); v <= Math.min(H - 1, y1); v++) for (let u = Math.max(0, x0); u <= Math.min(W - 1, x1); u++) if (R[v][u] !== ' ') cv.Z[v * W + u] = z.i; return z; },
    room(t, x0, y0, x1, y1, n, o) { const z = K.zone(t, x0, y0, x1, y1, n, o); K.rooms.push(z); return z; },
    deco(u, v, t) { if (ok(u, v) && R[v][u] === 'W') cv.wd.set(v * W + u, t); },
    npc(folk, u, v, name, lines, o) { o = o || {}; const rr = o.r == null ? 2 : o.r;
      for (let r = 0; r <= rr; r++) for (let dv = -r; dv <= r; dv++) for (let du = -r; du <= r; du++) { if (Math.max(Math.abs(du), Math.abs(dv)) !== r) continue;
        const a = u + du, e = v + dv; if (!fl(a, e) || keep[e * W + a] || K.npcs.some(q => q.x === a && q.y === e)) continue;
        if (o.zone != null && cv.Z[e * W + a] !== o.zone) continue;
        const L = Array.isArray(lines) ? lines : [lines], line = L[hash(a + e * 7, K.seed) % L.length];
        const n = { x: a, y: e, folk, name, talk: o.talk || (() => say([[name, line]])) }; K.npcs.push(n); return n; }
      return null; },
  };
  return K;
}
function cvFlood(K, block) {
  const { R, W, H, F } = K, N = W * H, WK = K._wk || (K._wk = new Uint8Array(N)), seen = new Uint8Array(N), stk = K._stk || (K._stk = new Int32Array(N));
  for (let v = 0; v < H; v++) { const row = R[v]; for (let u = 0; u < W; u++) { const i = v * W + u; WK[i] = ROOM_WALK.has(row[u]) && !(block && block[i]) ? 1 : 0; } }
  const s0 = F.ey * W + F.ex; if (!WK[s0]) return seen; let sp = 0; seen[s0] = 1; stk[sp++] = s0;
  while (sp) { const i = stk[--sp], u = i % W;
    if (u > 0 && WK[i - 1] && !seen[i - 1]) { seen[i - 1] = 1; stk[sp++] = i - 1; }
    if (u < W - 1 && WK[i + 1] && !seen[i + 1]) { seen[i + 1] = 1; stk[sp++] = i + 1; }
    if (i >= W && WK[i - W] && !seen[i - W]) { seen[i - W] = 1; stk[sp++] = i - W; }
    if (i + W < N && WK[i + W] && !seen[i + W]) { seen[i + W] = 1; stk[sp++] = i + W; } }
  return seen;
}
// where a partition cut part of the floor off (an odd-shaped outline), open a doorway through it
function cvFixWalls(K) {
  const { R, W, H } = K;
  for (let it = 0; it < 120; it++) { const seen = cvFlood(K), WK = K._wk; let op = -1;
    for (const i of K.IW) { const u = i % W, v = (i / W) | 0; if (R[v][u] !== 'W') continue;
      if (u > 0 && u < W - 1 && WK[i - 1] && WK[i + 1] && seen[i - 1] !== seen[i + 1]) { op = i; break; }
      if (v > 0 && v < H - 1 && WK[i - W] && WK[i + W] && seen[i - W] !== seen[i + W]) { op = i; break; } }
    if (op < 0) break; K.door(op % W, (op / W) | 0); }
  // still some floor out of reach: the outline pinches (a thin neck between two wings); open the neck, one or two walls thick
  for (let it = 0; it < 40; it++) { const seen = cvFlood(K), WK = K._wk; let un = 0; for (let i = 0; i < W * H; i++) if (WK[i] && !seen[i]) { un = 1; break; } if (!un) break;
    let op = null;
    for (let v = 1; v < H - 1 && !op; v++) for (let u = 1; u < W - 1 && !op; u++) { const i = v * W + u; if (R[v][u] !== 'W') continue;
      for (const s of [1, W]) { const a = i - s, b = i + s, c = i + 2 * s;
        if (WK[a] && WK[b] && seen[a] !== seen[b]) { op = [i]; break; }
        if (WK[a] && (s === 1 ? u + 2 < W : v + 2 < H) && R[(b / W) | 0][b % W] === 'W' && WK[c] && seen[a] !== seen[c]) { op = [i, b]; break; } } }
    if (!op) break; for (const i of op) { R[(i / W) | 0][i % W] = 'c_dr'; } }
}
// furniture never shuts anyone in: anything standing between reached and unreached floor is taken out
function cvFixProps(K) {
  const { R, W, H } = K;
  for (let pass = 0; pass < 12; pass++) { const seen = cvFlood(K), WK = K._wk, kill = [];
    for (let v = 1; v < H - 1; v++) for (let u = 1; u < W - 1; u++) { const i = v * W + u, t = R[v][u]; if (WK[i] || t === 'W' || t === 'O' || t === ' ' || t === 'e') continue;
      let a = 0, b = 0; for (const j of [i - 1, i + 1, i - W, i + W]) if (WK[j]) { if (seen[j]) a = 1; else b = 1; } if (a && b) kill.push(i); }
    if (!kill.length) break; for (const i of kill) R[(i / W) | 0][i % W] = '.'; }
  // furniture several deep in the way: clear the shortest way through it to the floor it shuts in
  const N = W * H, par = new Int32Array(N), q = new Int32Array(N);
  for (let it = 0; it < 40; it++) { const seen = cvFlood(K), WK = K._wk; par.fill(-2); let qh = 0, qt = 0, hit = -1;
    for (let i = 0; i < N; i++) if (seen[i]) { par[i] = -1; q[qt++] = i; }
    while (qh < qt && hit < 0) { const i = q[qh++], u = i % W;
      for (const j of [u > 0 ? i - 1 : -1, u < W - 1 ? i + 1 : -1, i - W, i + W]) { if (j < 0 || j >= N || par[j] !== -2) continue; const t = R[(j / W) | 0][j % W];
        if (t === 'W' || t === 'O' || t === ' ' || t === 'e') continue; par[j] = i; if (WK[j]) { hit = j; break; } q[qt++] = j; } }
    if (hit < 0) break; for (let j = par[hit]; j >= 0 && !seen[j]; j = par[j]) R[(j / W) | 0][j % W] = '.'; }
}
function cvFixNpcs(K) {
  const { W, H } = K;
  for (let it = 0; it < 3; it++) { const a = cvFlood(K), blk = new Uint8Array(W * H); for (const n of K.npcs) blk[n.y * W + n.x] = 1;
    const b = cvFlood(K, blk), drop = new Set();
    for (const n of K.npcs) { const i = n.y * W + n.x; for (const j of [i - 1, i + 1, i - W, i + W]) if (a[j] && !b[j] && !blk[j]) { drop.add(n); break; } }
    if (!drop.size) break; K.npcs = K.npcs.filter(n => !drop.has(n)); }
}
function cvLayout(F, c, b, info) {
  const K = cvK(F, c, info, b);
  if (info.k === 'school') cvSchool(K); else if (info.k === 'legion') cvLegion(K);
  else if (info.role === 'main') cvChurch(K); else if (info.role === 'hall') cvChurchHall(K); else cvOneRoom(K, 'cofc');
  cvFixWalls(K);
  // an odd-shaped outline: each room's furniture goes by the floor it really has
  for (const z of K.rooms) { let a = 1e9, b2 = -1, c2 = 1e9, d = -1;
    for (let v = Math.max(0, z.y0); v <= Math.min(K.H - 1, z.y1); v++) for (let u = Math.max(0, z.x0); u <= Math.min(K.W - 1, z.x1); u++)
      if (K.R[v][u] === '.' && K.cv.Z[v * K.W + u] === z.i) { if (u < a) a = u; if (u > b2) b2 = u; if (v < c2) c2 = v; if (v > d) d = v; }
    if (b2 >= 0) { z.x0 = a; z.x1 = b2; z.y0 = c2; z.y1 = d; } }
  for (const z of K.rooms) { const f = CV_FURN[z.t]; if (f) f(K, z); }
  for (const f of K.todo) f();
  cvFixProps(K); cvFixNpcs(K);
  if (info.k === 'school' && !K.npcs.some(n => n.folk === 'secretary')) {   // every school keeps someone at the front to sign visitors in
    const S = K.cv.school; K.npc('secretary', F.ex + 2, F.ey - 2, 'Front office', CV_L.office, { r: 6, talk: S && typeof schoolOffice === 'function' ? () => schoolOffice(S.name) : null }); cvFixNpcs(K); }
  F.npcs.push(...K.npcs);
}
const cvClamp = (a, lo, hi) => Math.max(lo, Math.min(hi, a));
// a run of L cells into rooms about `size` wide, a wall between each
function cvSegs(a, b, size) { const L = b - a + 1; if (L < 3) return []; const k = Math.max(1, Math.round((L + 1) / (size + 1))), A = L - (k - 1), out = []; let u = a;
  for (let i = 0; i < k; i++) { const n = Math.floor(A / k) + (i < A % k ? 1 : 0); out.push([u, u + n - 1]); u += n + 1; } return out; }
function cvOneRoom(K, t) { const z = K.room(t, K.x0, K.y0, K.x1, K.y1); z.dd = 'down'; return z; }

// ---------- a school: entry and office up front, halls of classrooms, the gym, cafeteria and library across the back ----------
function cvSchool(K) {
  const { x0, x1, y0, y1, xs, info } = K, w = x1 - x0 + 1, d = y1 - y0 + 1, elem = info.v === 'elem', CL = elem ? 'eclass' : 'class';
  if (w < 12 || d < 16) { K.zone('vest', x0, y1 - 1, x1, y1); const r = K.room(CL, x0, y0, x1, y1 - 2); r.dd = 'down'; return; }
  const RD = elem ? 8 : 9, RW = elem ? 9 : 10;
  const fb = cvClamp(Math.round(d * 0.12), 6, 9), fw = y1 - fb;
  const vx0 = Math.max(x0, xs - 2), vx1 = Math.min(x1, xs + 2), sx0 = Math.max(x0, xs - 1), sx1 = Math.min(x1, xs + 1);
  let top = fw - 1; const S = [];
  const strip = (t, n, dd) => { const s = { t, v0: top - n + 1, v1: top, dd }; S.push(s); top -= n; return s; };
  const wrow = () => { const s = { t: 'w', v0: top, v1: top }; S.push(s); top--; return s; };
  const left = () => top - y0 + 1;
  strip('H', 3);
  const big = w >= 24 && left() >= 17, bigD = big ? cvClamp(Math.round(left() * 0.4), 14, 36) : 0, unit = 2 * RD + 6;
  while (left() - (big ? bigD + 1 : 0) >= unit) { wrow(); strip('R', RD, 'down'); wrow(); strip('R', RD, 'up'); wrow(); strip('H', 3); }
  if (big) { wrow().g = 1; strip('G', left(), 'down'); }
  else { const L = left();
    if (L >= 5) { wrow(); if (L - 1 > 2 * RD + 1) { strip('R', RD, 'down'); wrow(); strip('R', left(), 'spine'); } else strip('R', L - 1, 'down'); }
    else if (L > 0) { const h = S[S.length - 1]; h.v0 -= L; top -= L; } }
  const G = S.find(s => s.t === 'G'), spTop = G ? G.v1 + 2 : y0;
  // walls, the spine up the middle, the halls
  K.hwall(fw, x0, x1, null, [vx0, vx1]);
  for (const s of S) if (s.t === 'w') { if (s.g) K.hwall(s.v0, x0, x1); else K.hwall(s.v0, x0, x1, null, [sx0, sx1]); }
  K.zone('hall', sx0, spTop, sx1, fw - 1);
  const halls = S.filter(s => s.t === 'H'); for (const s of halls) K.zone('hall', x0, s.v0, x1, s.v1);
  K.zone('vest', vx0, fw, vx1, y1);
  // the classroom strips: rooms either side of the spine
  const pool = [];
  for (const s of S) if (s.t === 'R') {
    for (const [a, b2, side] of [[x0, sx0 - 2, -1], [sx1 + 2, x1, 1]]) {
      const sg = cvSegs(a, b2, RW);
      if (!sg.length) { if (b2 >= a) K.zone('hall', a, s.v0, b2, s.v1); continue; }
      K.vwall(side < 0 ? sx0 - 1 : sx1 + 1, s.v0, s.v1);
      sg.forEach(([u0, u1], j) => { if (j) K.vwall(u0 - 1, s.v0, s.v1);
        const adj = side < 0 ? j === sg.length - 1 : j === 0, cx = (u0 + u1) >> 1;
        const door = s.dd === 'down' ? [cx, s.v1 + 1] : s.dd === 'up' ? [cx, s.v0 - 1] : [side < 0 ? u1 + 1 : u0 - 1, (s.v0 + s.v1) >> 1];
        pool.push({ x0: u0, x1: u1, y0: s.v0, y1: s.v1, door, dd: s.dd, adj }); }); } }
  // the front: the office beside the entry, restrooms and the nurse, more rooms out to the ends
  const fr = [];
  for (const [a, b2, side] of [[x0, vx0 - 2, -1], [vx1 + 2, x1, 1]]) {
    const sg = cvSegs(a, b2, RW);
    if (!sg.length) { const za = side < 0 ? a : a - 1, zb = side < 0 ? b2 + 1 : b2; if (zb >= za) K.zone('vest', za, fw + 1, zb, y1); continue; }
    K.vwall(side < 0 ? vx0 - 1 : vx1 + 1, fw + 1, y1);
    sg.forEach(([u0, u1], j) => { if (j) K.vwall(u0 - 1, fw + 1, y1); fr.push({ x0: u0, x1: u1, y0: fw + 1, y1, door: [(u0 + u1) >> 1, fw], dd: 'up', adj: side < 0 ? j === sg.length - 1 : j === 0, side, near: side < 0 ? sg.length - 1 - j : j }); }); }
  fr.sort((p, q) => p.near - q.near || p.side - q.side);
  const mk = (t, r) => { const z = K.room(t, r.x0, r.y0, r.x1, r.y1, null, { dd: r.dd, door: r.door, side: r.side }); K.door(r.door[0], r.door[1]); return z; };
  const restPair = r => { if (r.x1 - r.x0 + 1 >= 7) { const m = (r.x0 + r.x1) >> 1; K.vwall(m, r.y0, r.y1);
      for (const [a, b2] of [[r.x0, m - 1], [m + 1, r.x1]]) mk('rest', { x0: a, x1: b2, y0: r.y0, y1: r.y1, dd: r.dd, door: [(a + b2) >> 1, r.door[1]] }); } else mk('rest', r); };
  const rest = fr.slice(); let office = null;
  if (rest.length) { const r = rest.shift(); office = mk('office', r);
    const pu = r.side < 0 ? vx0 - 1 : vx1 + 1, pv = y1 - 1; if (K.R[pv] && K.R[pv][pu] === 'W' && Math.abs(pu - xs) > 1) { K.R[pv][pu] = 'k'; office.pass = [pu, pv]; } }
  if (rest.length) restPair(rest.shift()); else if (pool.length) restPair(pool.splice(pool.length - 1, 1)[0]);
  if (rest.length) mk('nurse', rest.shift());
  pool.push(...rest);
  // the big rooms across the back
  const have = new Set();
  if (G) { const sh = elem ? (w >= 60 ? [['gym', 0.4], ['caf', 0.3], ['lib', 0.3]] : w >= 36 ? [['gym', 0.55], ['caf', 0.45]] : [['gym', 1]])
      : (w >= 90 ? [['gym', 0.35], ['aud', 0.25], ['caf', 0.25], ['lib', 0.15]] : w >= 60 ? [['gym', 0.4], ['caf', 0.35], ['lib', 0.25]] : w >= 36 ? [['gym', 0.55], ['caf', 0.45]] : [['gym', 1]]);
    let u = x0; const L = w - (sh.length - 1);
    sh.forEach(([t, f], i) => { const n = i === sh.length - 1 ? x1 - u + 1 : Math.max(8, Math.round(L * f)), a = u, b2 = Math.min(x1, u + n - 1); if (b2 - a < 4) return;
      if (i) K.vwall(a - 1, G.v0, G.v1);
      const z = K.room(t, a, G.v0, b2, G.v1, null, { dd: 'down' }); have.add(t);
      const ds = b2 - a >= 16 ? [a + Math.round((b2 - a) / 3), a + Math.round((b2 - a) * 2 / 3)] : [(a + b2) >> 1];
      if (xs >= a && xs <= b2) ds.push(xs); for (const du of ds) K.door(du, G.v1 + 1); z.door = [ds[0], G.v1 + 1];
      u = b2 + 2; }); }
  // the rest of the rooms: the big ones need the biggest rooms, the others take the nearest
  const dist = r => Math.abs(((r.x0 + r.x1) >> 1) - xs) + Math.abs(y1 - r.y1);
  pool.sort((p, q) => dist(p) - dist(q));
  const need = [];
  for (const t of ['gym', 'caf', 'lib']) if (!have.has(t)) need.push(t);
  need.push('music', 'art'); if (!elem) { need.push('lab'); if (info.v === 'high') need.push('lab'); }
  for (const t of need) { if (!pool.length) break;
    let k = 0; if (t === 'gym' || t === 'caf' || t === 'lib') pool.forEach((r, i) => { if ((r.x1 - r.x0 + 1) * (r.y1 - r.y0 + 1) > (pool[k].x1 - pool[k].x0 + 1) * (pool[k].y1 - pool[k].y0 + 1)) k = i; });
    else k = Math.min(pool.length - 1, 1 + (need.indexOf(t) % 3));
    mk(t, pool.splice(k, 1)[0]); }
  for (const r of pool) mk(CL, r);
  // the halls: lockers along the walls, a drinking fountain, bulletin boards; the entry: mats, trophy cases
  K.todo.push(() => {
    for (const s of halls) { for (let u = x0; u <= x1; u++) { const up = K.R[s.v0 - 1] && K.R[s.v0 - 1][u]; if (up !== 'W' || !K.fl(u, s.v0 + 1) || !K.fl(u, s.v0 + 2)) continue;
        const k = (u + K.seed) % 13; if (k === 6) { K.deco(u, s.v0 - 1, 'cb'); continue; } if (k === 11 && (u + s.v0) % 3 === 0) { K.set(u, s.v0, 'c_wf'); continue; } K.set(u, s.v0, 'c_lk'); }
      for (let u = x0 + 1; u <= x1; u++) { const dn = K.R[s.v1 + 1] && K.R[s.v1 + 1][u]; if (dn === 'W' && (u + K.seed) % 17 === 3) K.set(u, s.v1, 'c_wf'); } }
    for (let v = y1 - 1; v <= y1; v++) for (let u = xs - 1; u <= xs + 1; u++) K.floor(u, v, 'c_mat');
    if (vx1 - vx0 >= 4) { K.set(vx0, fw + 1, 'c_tro'); K.set(vx1, fw + 1, 'c_tro'); K.set(vx0, y1, 'P'); K.set(vx1, y1, 'P'); }
    // the custodian, and kids between classes
    const hl = halls.slice().sort((p, q) => q.v0 - p.v0);
    if (hl.length) { const s = hl[hl.length - 1]; K.npc('cv_cust', x0 + ((x1 - x0) >> 2), s.v0 + 1, 'Custodian', CV_L.cust); }
    for (let i = 0; i < Math.min(3, halls.length); i++) { const s = halls[i], u = x0 + 2 + Math.floor(K.rnd() * Math.max(1, w - 4));
      if (Math.abs(u - xs) > 2) cvKid(K, u, s.v0 + 1, null); }
  });
}
function cvKid(K, u, v, zone) {
  const elem = K.info.v === 'elem', folk = elem ? 'cv_k' + (hash(u, v + K.seed) % 4) : 'cv_t' + (hash(u, v + K.seed) % 3);
  if (K.kids >= 14) return null; const n = K.npc(folk, u, v, 'Student', elem ? CV_L.kid : CV_L.teen, { r: 0, zone }); if (n) K.kids++; return n;
}
function cvKidsIn(K, r, n) { const rw = r.x1 - r.x0 + 1, rd = r.y1 - r.y0 + 1; for (let t = 0, got = 0; t < 10 && got < n; t++) if (cvKid(K, r.x0 + Math.floor(K.rnd() * rw), r.y0 + 2 + Math.floor(K.rnd() * Math.max(1, rd - 2)), r.i)) got++; }
function cvTeacher(K, r, u, v, lines, talk, folk, name) {
  if (K.staff >= 10) return null; const n = K.npc(folk || (hash(u, v) % 2 ? 'cv_tch' : 'b_teach'), u, v, name || 'Teacher', lines, { zone: r.i, talk }); if (n) K.staff++; return n;
}
const CV_L = {
  teach: ['Good morning! Come on in.', 'We\'re reading a chapter book together this week.', 'Find a seat. We\'re just about to start.', 'Today it\'s fractions. Everybody\'s favorite.'],
  hteach: ['Come on in. Quiz on Friday: chapters four and five.', 'Phones in the bin by the door, please.', 'Office hours are after school if you need help.'],
  kid: ['Is it lunch yet?', 'We have a spelling test on Friday.', 'I\'m reading a book about volcanoes.', 'Library day is the best day.', 'I can do a cartwheel. Not inside, though.'],
  teen: ['I\'ve got a lab report due tomorrow.', 'Practice after school, then homework.', 'I left my calculator in my locker.', 'Four minutes between classes. It\'s enough if you hurry.'],
  office: ['Welcome! Visitors sign in here, please.', 'Good morning. Sign in on the clipboard, please.'], lunch: ['Trays are on the end. Milk\'s in the cooler.', 'Today: chicken on a bun, green beans and an apple.'],
  lib: ['Welcome to the library. Returns go in the cart, please.', 'Nonfiction\'s along the back wall, by subject.'], coach: ['Grab a ball if you want to shoot around. Put it back when you\'re done.'],
  music: ['Mind the music stands. We\'re working on the spring concert.'], art: ['Smocks are on the hooks. The paint washes out, mostly.'],
  nurse: ['Come see me if you\'re not feeling well. There\'s a cot and a glass of water.'], cust: ['Floors got waxed over the summer. Still shining, mostly.', 'Wet floor by the fountain. Walk around, if you would.'],
  lab: ['Goggles on before anything else, please.', 'Today we\'re measuring how fast things cool. Bring a notebook.'],
};
// ---------- furnishing each room ----------
const CV_FURN = {
  class(K, r) { cvClass(K, r, false); }, eclass(K, r) { cvClass(K, r, true); },
  lab(K, r) { const cx = (r.x0 + r.x1) >> 1; for (let u = cx - 1; u <= cx + 1; u++) { K.deco(u, r.y0 - 1, 'wb'); K.set(u, r.y0 + 1, 'c_lab'); }
    K.deco(cx + 3, r.y0 - 1, 'clock'); K.deco(cx - 3, r.y0 - 1, 'cb'); K.set(r.x0, r.y0, 'c_hood'); K.set(r.x1, r.y0, 'c_flag');
    for (let v = r.y0 + 3; v <= r.y1 - 2; v += 3) for (let u = r.x0 + 1; u <= r.x1 - 1; u++) if ((u - r.x0) % 5 !== 0) K.set(u, v, 'c_lab');
    for (let v = r.y0 + 2; v <= r.y1 - 2; v += 2) K.set(r.x1, v, 'F');
    const S = K.cv.school; cvTeacher(K, r, cx, r.y0, CV_L.lab, S && typeof schoolTeacher === 'function' ? () => schoolTeacher(S.name, S.band) : null); cvKidsIn(K, r, 1); },
  art(K, r) { const cx = (r.x0 + r.x1) >> 1; K.deco(cx, r.y0 - 1, 'art'); K.deco(cx - 2, r.y0 - 1, 'art'); K.deco(cx + 2, r.y0 - 1, 'art'); K.set(r.x0, r.y0, 'c_rsink');
    for (let v = r.y0 + 2; v + 1 <= r.y1 - 1; v += 3) for (let u = r.x0 + 1; u + 1 <= r.x1 - 2; u += 4) for (const [a, e] of [[0, 0], [1, 0], [0, 1], [1, 1]]) K.set(u + a, v + e, 'T');
    for (let v = r.y0 + 1; v <= r.y1 - 1; v += 2) K.set(r.x1, v, 'c_easel'); cvTeacher(K, r, cx, r.y0 + 1, CV_L.art); cvKidsIn(K, r, 1); },
  music(K, r) { const cx = (r.x0 + r.x1) >> 1; for (let u = cx - 1; u <= cx + 1; u++) K.deco(u, r.y0 - 1, 'staff'); K.set(cx, r.y0 + 1, 'c_pod'); K.set(r.x0, r.y0, 'c_pno'); K.set(r.x1, r.y0, 'c_drm');
    for (let v = r.y0 + 3; v <= r.y1 - 2; v += 2) for (let u = r.x0 + 1; u <= r.x1 - 1; u++) if ((u - r.x0) % 5 !== 0 && u !== cx) K.set(u, v, 'c_mus');
    cvTeacher(K, r, cx + 1, r.y0 + 1, CV_L.music); },
  gym(K, r) { const rw = r.x1 - r.x0 + 1, rd = r.y1 - r.y0 + 1, cx = (r.x0 + r.x1) >> 1, nb = rd >= 16 ? 3 : rd >= 11 ? 2 : 0;
    for (let i = 0; i < nb; i++) for (let u = r.x0 + 2; u <= r.x1 - 2; u++) K.set(u, r.y0 + i, 'c_bl');
    K.deco(cx, r.y0 - 1, 'score'); for (let u = r.x0 + 2; u <= r.x1 - 2; u += 4) if (Math.abs(u - cx) > 1) K.deco(u, r.y0 - 1, 'pen');
    const c = { x0: r.x0 + 1, x1: r.x1 - 1, y0: r.y0 + nb + 1, y1: r.y1 - 1 }; c.hor = c.x1 - c.x0 >= c.y1 - c.y0; c.mx = (c.x0 + c.x1) / 2; c.my = (c.y0 + c.y1) / 2;
    if (c.x1 - c.x0 >= 8 && c.y1 - c.y0 >= 6) { r.court = c; const my = Math.round(c.my), mx = Math.round(c.mx);
      if (c.hor) { K.set(c.x0, my, 'c_hoop'); K.set(c.x1, my, 'c_hoop'); } else { K.set(mx, c.y0, 'c_hoop'); } }
    const S = K.cv.school;
    cvTeacher(K, r, r.x0 + 2, r.y1 - 1, CV_L.coach, S && typeof eduTree === 'function' ? () => say([['Gym teacher', 'Kids and teens need about an hour of moving a day. Adults, about two and a half hours a week. That\'s the federal guideline, not me yelling.']], () => eduTree({ lane: 'body', school: S.name })) : null, 'coach', 'Gym teacher');
    if (rw >= 14) { cvKid(K, Math.round(c.mx) + 3, Math.round(c.my), r.i); cvKid(K, Math.round(c.mx) - 4, Math.round(c.my) + 1, r.i); } },
  caf(K, r) { const n = Math.min(7, r.x1 - r.x0 - 2); for (let u = r.x0 + 1; u <= r.x0 + n; u++) K.set(u, r.y0 + 1, 'c_srv'); K.set(r.x0 + n + 1, r.y0 + 1, 'f');
    K.deco(r.x0 + 2, r.y0 - 1, 'menu'); K.deco(r.x0 + 4, r.y0 - 1, 'menu'); K.deco(r.x1 - 2, r.y0 - 1, 'clock');
    const ln = K.npc('lunch', r.x0 + 3, r.y0, 'Lunch line', CV_L.lunch, { r: 1 });
    for (let v = r.y0 + 4; v <= r.y1 - 2; v += 3) for (let u = r.x0 + 1; u + 3 <= r.x1 - 1; u += 6) for (let i = 0; i < 4; i++) K.set(u + i, v, 'c_ct');
    cvKidsIn(K, r, 2); },
  lib(K, r) { const rd = r.y1 - r.y0 + 1, mid = r.y0 + Math.max(2, Math.floor(rd * 0.45)), cx = (r.x0 + r.x1) >> 1;
    for (let u = r.x0; u <= r.x1; u++) K.set(u, r.y0, 'c_bk');
    for (let v = r.y0 + 2; v <= mid; v += 2) for (let u = r.x0 + 2; u <= r.x1 - 2; u++) if ((u - r.x0) % 6 !== 1) K.set(u, v, 'c_bk');
    for (let v = mid + 2; v <= r.y1 - 3; v += 3) for (let u = r.x0 + 2; u + 1 <= r.x1 - 2; u += 5) { K.set(u, v, 'T'); K.set(u + 1, v, 'T'); K.set(u, v - 1, 'h'); K.set(u + 1, v + 1, 'h'); }
    for (let v = mid + 2; v <= r.y1 - 2; v += 2) K.set(r.x0, v, 'M');
    const cu = r.x1 - 3; K.set(cu, r.y1 - 2, 'c'); K.set(cu + 1, r.y1 - 2, 'c'); K.set(cu + 2, r.y1 - 2, 'k');
    const S = K.cv.school;
    cvTeacher(K, r, cu + 1, r.y1 - 3, CV_L.lib, S && typeof eduTree === 'function' ? () => say([['Librarian', 'The library is where questions go to get answered. Books, databases, and me.']], () => eduTree({ sel: 'e_sources', school: S.name })) : null, 'librarian', 'Librarian');
    cvKidsIn(K, r, 1); },
  aud(K, r) { const sd = Math.min(4, (r.y1 - r.y0) >> 2), cx = (r.x0 + r.x1) >> 1; K.zone('stage', r.x0, r.y0, r.x1, r.y0 + sd - 1, null, { raised: 1 });
    for (let u = r.x0; u <= r.x1; u++) K.deco(u, r.y0 - 1, 'curt'); K.set(cx + 2, r.y0 + 1, 'c_lec');
    for (let v = r.y0 + sd + 2; v <= r.y1 - 2; v += 2) for (let u = r.x0 + 1; u <= r.x1 - 1; u++) if (u !== cx && (u - r.x0) % 10 !== 0) K.set(u, v, 'c_aud'); },
  rest(K, r) { const top = !(r.door && r.door[1] < r.y0), sv = top ? r.y0 : r.y1; for (let u = r.x0; u <= r.x1; u++) K.set(u, sv, 'c_stall');
    const su = r.door && Math.abs(r.door[0] - r.x0) < Math.abs(r.door[0] - r.x1) ? r.x1 : r.x0; for (let v = Math.min(r.y0, r.y1); v <= r.y1; v++) if (v !== sv && (v - r.y0) % 2 === 1) K.set(su, v, 'c_rsink'); },
  nurse(K, r) { K.set(r.x0, r.y1, 'c_cot'); K.set(r.x0 + 2, r.y1, 'c_cot'); K.set(r.x1, r.y1, 'F'); K.set(r.x1, r.y0 + 2, 'c_rsink'); K.set(r.x0, r.y0 + 2, 'h');
    K.npc('nurse', (r.x0 + r.x1) >> 1, r.y0 + 2, 'Nurse', CV_L.nurse, { zone: r.i }); },
  office(K, r) { for (let u = r.x0; u <= r.x1; u += 2) if (!r.pass || Math.abs(u - r.pass[0]) > 1) K.set(u, r.y1, 'F');
    for (let u = r.x0 + 1; u <= r.x1 - 1; u += 3) { K.set(u, r.y0 + 2, 'd'); K.set(u, r.y0 + 3, 'h'); }
    K.set(r.x0, r.y0, 'c_cpy'); K.set(r.x1, r.y0 + 1, 'P');
    const S = K.cv.school, talk = S && typeof schoolOffice === 'function' ? () => schoolOffice(S.name) : null;
    const at = r.pass ? [r.pass[0] + (r.side < 0 ? -1 : 1), r.pass[1]] : [(r.x0 + r.x1) >> 1, r.y1 - 1];
    K.npc('secretary', at[0], at[1], 'Front office', CV_L.office, { r: r.pass ? 0 : 2, talk }) || K.npc('secretary', (r.x0 + r.x1) >> 1, (r.y0 + r.y1) >> 1, 'Front office', CV_L.office, { r: 6, zone: r.i, talk }); },
  // church rooms
  fellow(K, r) { let y = r.y0; const w = r.x1 - r.x0 + 1, deep = r.y1 - r.y0 + 1;
    if (deep >= 11 && w >= 6) { const kv = r.y0 + 4; K.zone('kitchen', r.x0, r.y0, r.x1, kv - 1); K.hwall(kv, r.x0, r.x1);
      const du = r.x1 - 1 > r.x0 ? r.x1 - 1 : r.x0; K.door(du, kv); for (let u = r.x0 + 1; u <= Math.min(r.x1 - 3, r.x0 + 5); u++) if (K.R[kv][u] === 'W') K.R[kv][u] = 'c_pass';
      const seq = ['c_frg', 'c_stv', 'c_kc', 'c_ksk', 'c_kc', 'c_stv', 'c_kc', 'c_frg'];
      for (let u = r.x0, i = 0; u <= r.x1; u++, i++) K.set(u, r.y0, seq[i % seq.length]);
      K.npc('cv_vol', r.x0 + 2, r.y0 + 2, 'Volunteer', ['We\'re setting up for a potluck. Dessert bars are on that table.', 'The coffee\'s fresh. Help yourself.'], { r: 1 });
      y = kv + 1; }
    K.deco(r.x1 - 1, y - 1, 'clock'); K.deco(r.x0 + 1, y - 1, 'cb');
    K.set(r.x1, y + 1, 'c_cof');
    for (let v = y + 2; v <= r.y1 - 1; v += 3) for (let u = r.x0 + 1; u + 3 <= r.x1 - 1; u += 6) for (let i = 0; i < 4; i++) K.set(u + i, v, 'c_ft'); },
  croom(K, r) { const cx = (r.x0 + r.x1) >> 1, cy = (r.y0 + r.y1) >> 1; K.deco(cx, r.y0 - 1, 'cb'); K.deco(cx + 2, r.y0 - 1, 'art');
    for (const [a, e] of [[0, 0], [1, 0], [0, 1], [1, 1]]) K.set(cx - 1 + a, cy - 1 + e, 'T');
    for (const [a, e] of [[-2, 0], [2, 0], [-2, -1], [2, -1], [0, -2], [-1, 1]]) K.set(cx + a, cy + e, 'h');
    K.set(r.x0, r.y0, 'c_bk'); K.set(r.x1, r.y0, 'c_bk'); },
  cofc(K, r) { const cx = (r.x0 + r.x1) >> 1; K.set(cx, r.y0 + 1, 'd'); K.set(cx, r.y0 + 2, 'h'); K.set(r.x0, r.y0, 'F'); K.set(r.x1, r.y0, 'c_bk'); K.set(r.x0 + 1, r.y0, 'c_bk');
    K.set(r.x1, r.y1, 'P'); K.set(r.x0, r.y1, 'c_coat'); K.deco(cx + 2, r.y0 - 1, 'clock'); },
  nursery(K, r) { K.set(r.x0, r.y0, 'c_crib'); K.set(r.x0 + 2, r.y0, 'c_crib'); K.set(r.x1, r.y0, 'c_rock'); K.set(r.x1, r.y1, 'c_toy');
    const cx = (r.x0 + r.x1) >> 1, cy = (r.y0 + r.y1) >> 1; for (let v = cy; v <= cy + 1; v++) for (let u = cx - 1; u <= cx + 1; u++) K.floor(u, v, 'c_rug'); },
  sacr(K, r) { for (let u = r.x0; u <= r.x1; u += 2) K.set(u, r.y0, 'c_vest'); K.set(r.x1, r.y1, 'F'); },
  store(K, r) { for (let u = r.x0; u <= r.x1; u += 2) K.set(u, r.y0, 'B'); },
};
function cvClass(K, r, elem) {
  const cx = (r.x0 + r.x1) >> 1, rw = r.x1 - r.x0 + 1;
  for (let u = cx - 1; u <= cx + 1; u++) K.deco(u, r.y0 - 1, 'wb');
  K.deco(cx + 3, r.y0 - 1, 'clock'); K.deco(cx - 3, r.y0 - 1, elem ? 'art' : 'map'); K.deco(cx + 4, r.y0 - 1, elem ? 'art' : 'cb');
  K.set(r.x1, r.y0, 'c_flag'); K.set(r.x0 + (rw >= 6 ? 1 : 0), r.y0 + 1, 'c_td'); K.set(r.x1, r.y0 + 2, 'c_bk'); K.set(r.x1, r.y0 + 3, 'c_bk');
  if (elem) { for (let v = r.y0 + 1; v <= r.y0 + 2; v++) for (let u = cx - 1; u <= cx + 1; u++) K.floor(u, v, 'c_rug');
    for (let v = r.y0 + 4; v + 1 <= r.y1 - 2; v += 3) for (let u = r.x0 + 1; u + 1 <= r.x1 - 1; u += 3) for (const [a, e] of [[0, 0], [1, 0], [0, 1], [1, 1]]) K.set(u + a, v + e, 'c_sd');
    for (let u = r.x0; u <= r.x1; u++) K.set(u, r.y1, 'c_cub'); }
  else for (let v = r.y0 + 3; v <= r.y1 - 1; v += 2) for (let u = r.x0 + 1; u <= r.x1 - 1; u += 2) K.set(u, v, 'c_sd');
  const S = K.cv.school; if (hash(r.x0 + K.seed, r.y0) % 3 !== 2) cvTeacher(K, r, cx, r.y0 + 1, elem ? CV_L.teach : CV_L.hteach, S && typeof schoolTeacher === 'function' ? () => schoolTeacher(S.name, S.band) : null);
  cvKidsIn(K, r, elem ? 2 : 1);
}

// ---------- a church: the narthex, the nave, and rooms in the wings ----------
function cvChurch(K) {
  const { x0, x1, y0, y1, xs, info } = K, w = x1 - x0 + 1, d = y1 - y0 + 1, den = info.v;
  const nd = d >= 14 ? cvClamp(Math.round(d * 0.13), 3, 6) : 0, nwr = y1 - nd;
  const nw = w <= 30 ? w : cvClamp(Math.round(w * 0.45), 22, 34);
  let nx0 = cvClamp(xs - (nw >> 1), x0, x1 - nw + 1), nx1 = nx0 + nw - 1;
  if (nx0 - x0 < 6) nx0 = x0; if (x1 - nx1 < 6) nx1 = x1;
  const ac = cvClamp(xs, nx0 + 1, nx1 - 1), ny1 = nd ? nwr - 1 : y1; let ny0 = y0;
  const wings = nx0 > x0 || nx1 < x1, lit = den === 'cath' || den === 'litur' || den === 'luth';
  const NN = den === 'cath' || den === 'litur' ? ['NAVE', 'SANCTUARY'] : den === 'free' ? ['WORSHIP CENTER', 'STAGE'] : den === 'lds' ? ['CHAPEL', 'CHAPEL'] : ['SANCTUARY', 'CHANCEL'];
  if (nd) { const ds = [ac]; if (nx1 - nx0 >= 13) ds.push(nx0 + 1, nx1 - 1); K.hwall(nwr, x0, x1, ds); K.zone('narthex', x0, nwr, x1, y1, den === 'free' ? 'LOBBY' : den === 'lds' ? 'FOYER' : 'NARTHEX'); }
  // a deep, narrow church: an office and a classroom behind the front of the church
  if (!wings && ny1 - ny0 + 1 >= 34) { const bd = cvClamp(Math.round((ny1 - ny0 + 1) * 0.22), 7, 11), bw = y0 + bd;
    K.hwall(bw, nx0, nx1);
    if (nw >= 14) { const m = (nx0 + nx1) >> 1; K.vwall(m, y0, bw - 1);
      K.room(lit ? 'sacr' : 'cofc', nx0, y0, m - 1, bw - 1); K.door(nx0 + 1, bw); K.room(den === 'free' ? 'nursery' : 'croom', m + 1, y0, nx1, bw - 1); K.door(nx1 - 1, bw); }
    else { K.room('cofc', nx0, y0, nx1, bw - 1); K.door(nx0 + 1, bw); }
    ny0 = bw + 1; }
  const navD = ny1 - ny0 + 1, cd = cvClamp(Math.round(navD * 0.2), 3, 7);
  const nave = K.zone('nave', nx0, ny0, nx1, ny1, NN[0], { aisle: lit ? ac : -1, f: den === 'free' ? ['carpet', '#4a4a5a', '#444454'] : den === 'lds' ? ['carpet', '#6a6a5a', '#626252'] : null });
  const cf = den === 'free' ? ['wood', '#5a4a3a', '#4e4032'] : den === 'lds' ? ['wood', '#8a6a48', '#7a5c3c'] : null;
  // the wings: a corridor along the nave, rooms off it
  const W1 = den === 'cath' ? 'PARISH HALL' : null;
  if (nx0 > x0) { K.vwall(nx0 - 1, y0, ny1); cvWing(K, x0, nx0 - 2, y0, ny1, -1, nx1 < x1 ? ['fellow', 'croom', 'croom', 'rest', 'rest'] : ['fellow', 'cofc', 'croom', 'nursery', 'rest', 'rest'], W1); }
  if (nx1 < x1) { K.vwall(nx1 + 1, y0, ny1); cvWing(K, nx1 + 2, x1, y0, ny1, 1, nx0 > x0 ? [lit ? 'sacr' : 'cofc', 'cofc', 'croom', 'nursery', 'rest', 'croom'] : ['fellow', 'cofc', 'croom', 'nursery', 'rest', 'rest'], W1); }
  K.todo.push(() => cvNave(K, { nx0, nx1, ny0, ny1, ac, den, nwr, nd, nzi: nave.i, NN, cf }));
}
function cvWing(K, wx0, wx1, wy0, wy1, side, list, fname) {
  const ww = wx1 - wx0 + 1, D = wy1 - wy0 + 1; if (ww < 3 || D < 3) return;
  let rx0 = wx0, rx1 = wx1, cw = null;
  if (ww >= 9) { const c0 = side < 0 ? wx1 - 1 : wx0, c1 = c0 + 1; cw = side < 0 ? wx1 - 2 : wx0 + 2; K.zone('chall', c0, wy0, c1, wy1); K.vwall(cw, wy0, wy1); K.door(c0 + (side < 0 ? 0 : 1), wy1 + 1);
    rx0 = side < 0 ? wx0 : cw + 1; rx1 = side < 0 ? cw - 1 : wx1; }
  // slot depths: the fellowship hall gets the biggest, the rest about seven metres each
  const slots = []; let L = D;
  if (list[0] === 'fellow' && D >= 12) { const fd = D >= 22 ? Math.round(D * 0.45) : Math.round(D * 0.55); slots.push(['fellow', fd]); L -= fd + 1; list = list.slice(1); } else if (list[0] === 'fellow') list = list.slice(1);
  if (L >= 3) { const k = Math.max(1, Math.min(list.length || 1, Math.round((L + 1) / 7))), A = L - (k - 1); for (let i = 0; i < k; i++) slots.push([list[i] || 'croom', Math.floor(A / k) + (i < A % k ? 1 : 0)]); }
  else if (slots.length) slots[slots.length - 1][1] += Math.max(0, L + 1);
  let v = wy0; const made = [];
  slots.forEach(([t, n], i) => { const a = v, b2 = i === slots.length - 1 ? wy1 : v + n - 1; if (i) K.hwall(a - 1, rx0, rx1);
    const z = K.room(t, rx0, a, rx1, b2, t === 'fellow' ? fname || null : null); made.push(z);
    if (cw != null) { const ds = t === 'fellow' && b2 - a >= 8 ? [b2 - 2, a + ((b2 - a) >> 1)] : [(a + b2) >> 1]; for (const dv of ds) K.door(cw, dv); }
    v = b2 + 2; });
  if (cw == null) { // no corridor: the front room opens to the narthex, each room into the next
    const last = made[made.length - 1]; if (last) K.door((last.x0 + last.x1) >> 1, wy1 + 1);
    for (let i = 0; i < made.length - 1; i++) K.door(i % 2 ? made[i].x0 + 1 : made[i].x1 - 1, made[i].y1 + 1); }
}
function cvNave(K, o) {
  const { ny1, ac, den, nwr, nd, nzi } = o, R = K.R, W = K.W, lit = den === 'cath' || den === 'litur' || den === 'luth';
  // the nave as the outline really has it: its top up the center aisle, each row's width out from the aisle
  const isN = (u, v) => v >= 0 && v < K.H && u >= 0 && u < W && R[v][u] === '.' && K.cv.Z[v * W + u] === nzi;
  const ext = v => { let a = ac, b = ac; while (isN(a - 1, v)) a--; while (isN(b + 1, v)) b++; return [a, b]; };
  let ny0 = ny1; while (isN(ac, ny0 - 1)) ny0--;
  const cd = cvClamp(Math.round((ny1 - ny0 + 1) * 0.2), 3, 7), cy = ny0 + cd - 1;   // the chancel and its front row
  const [nx0, nx1] = ext(Math.min(ny1, ny0 + 1)), nw = nx1 - nx0 + 1, side = nw >= 16 ? 2 : 1;
  const ext2 = []; for (let v = ny0; v <= ny1; v++) ext2[v] = ext(v);
  K.zone('chancel', nx0, ny0, nx1, cy, o.NN[1], { raised: 1, f: o.cf });
  // the front of the church
  const deco = (u, t) => K.deco(u, ny0 - 1, t);
  if (den !== 'lds') deco(ac, den === 'cath' ? 'crux' : den === 'free' ? 'scr' : 'cross');
  if (den === 'free') { deco(ac - 1, 'scr'); deco(ac + 1, 'scr'); }
  if (lit) for (let u = nx0 + 2; u <= nx1 - 2; u += 4) if (Math.abs(u - ac) > 2) deco(u, 'glass');
  if (den !== 'free' && den !== 'lds' && nw >= 9) { deco(nx0 + 1, 'hymn'); deco(nx1 - 1, 'hymn'); }
  const L0 = nx0 + side, L1 = nx1 - side;
  if (den === 'cath' || den === 'litur' || den === 'luth') {
    for (let u = ac - 1; u <= ac + 1; u++) K.set(u, ny0 + 1, 'c_alt'); K.set(ac - 2, ny0 + 1, 'c_cnd'); K.set(ac + 2, ny0 + 1, 'c_cnd');
    for (let u = ext2[cy][0] + side; u <= ext2[cy][1] - side; u++) if (u !== ac) K.set(u, cy, 'c_rail');
    if (den === 'cath') { K.set(L0, cy - 1, 'c_amb'); K.set(L1, ny0, 'c_org'); }
    else { K.set(L0, cy - 1, 'c_pul'); K.set(L1, cy - 1, 'c_lec'); K.set(L1, ny0, 'c_org'); K.set(ac + 2, cy + 1, 'c_font'); }
  } else if (den === 'bapt') {
    for (let u = ac - 1; u <= ac + 1; u++) K.set(u, ny0, 'c_bap'); K.set(ac, ny0 + 2, 'c_pul'); if (cd >= 5) for (let u = ac - 1; u <= ac + 1; u++) K.set(u, cy, 'c_tab');
    K.set(L0, ny0 + 1, 'c_pno'); K.set(L1, ny0 + 1, 'c_org');
  } else if (den === 'free') {
    K.set(ac, ny0 + 1, 'c_lec'); K.set(L0, cy, 'c_spk'); K.set(L1, cy, 'c_spk'); K.set(L0 + 1, ny0, 'c_kbd'); K.set(L1 - 1, ny0, 'c_drm');
  } else if (den === 'lds') {
    K.set(ac, ny0 + 1, 'c_pul'); K.set(ac + 2, cy, 'c_tab'); K.set(ac + 3, cy, 'c_tab'); K.set(L1, ny0, 'c_org'); K.set(L0, ny0, 'c_pno');
  } else {   // the other Protestant churches: table, pulpit, font
    for (let u = ac - 1; u <= ac + 1; u++) K.set(u, cy, 'c_tab'); K.set(L0, ny0 + 1, 'c_pul');
    if (den !== 'coc') { K.set(L1, ny0 + 1, 'c_font'); K.set(L1, ny0, 'c_org'); K.set(L0, ny0, 'c_pno'); }
  }
  // the pews (chairs in a non-denominational church), a center aisle and side aisles; the Stations along the walls
  const seat = den === 'free' ? 'c_chr' : 'c_pew', rows = [];
  for (let v = cy + 2; v <= ny1 - 2; v += 2) rows.push(v);
  for (const v of rows) for (const [a, b2] of [[ext2[v][0] + side, ac - 1], [ac + 1, ext2[v][1] - side]].filter(([a, b2]) => b2 >= a)) { const long = b2 - a + 1 > 11, m = (a + b2) >> 1; for (let u = a; u <= b2; u++) if (!(long && u === m) && !(seat === 'c_chr' && (u - a) % 7 === 6)) K.set(u, v, seat); }
  if (den === 'cath' && side === 2 && rows.length) for (let i = 0; i < 7; i++) { const v = rows[Math.min(rows.length - 1, Math.round(i * (rows.length - 1) / 6))] + (i % 2 && rows.length < 7 ? 1 : 0); K.set(ext2[v][0], v, 'c_stn'); K.set(ext2[v][1], v, 'c_stn'); }
  if (den === 'cath') K.set(ac + 2, ny1, 'c_font');
  // the narthex: a table of bulletins, coats, a greeter
  if (nd) { const v = nwr + 1; K.set(ac + 3, v, 'c_wt'); K.set(ac - 3, v, 'c_coat'); K.set(ac - 4, v, 'c_coat');
    if (den === 'cath') { K.set(ac - 2, v, 'c_hwf'); K.set(ac + 2, v, 'c_hwf'); }
    K.deco(ac + 5, nwr, 'cb'); K.set(K.x0, K.y1, 'P'); K.set(K.x1, K.y1, 'P');
    for (let u = K.xs - 1; u <= K.xs + 1; u++) K.floor(u, K.y1, 'c_mat');
    K.npc('cv_greet', ac + 3, v + 1, 'Greeter', den === 'free' ? ['Hey, welcome! There\'s coffee in the back.'] : ['Good morning. Welcome in. The bulletins are on the table.', 'Welcome. Make yourself at home.'], { r: 2 }) || K.npc('cv_greet', ac - 2, v + 1, 'Greeter', ['Good morning. Welcome in.'], { r: 4 }); }
}
// a church's other building: an entry, the hall with its kitchen, classrooms down one side
function cvChurchHall(K) {
  const { x0, x1, y0, y1, xs } = K, w = x1 - x0 + 1, d = y1 - y0 + 1;
  const nd = d >= 12 ? 3 : 0, nwr = y1 - nd; if (nd) { K.hwall(nwr, x0, x1, [cvClamp(xs, x0 + 1, x1 - 1)]); K.zone('narthex', x0, nwr, x1, y1, 'ENTRY'); }
  const hy1 = nd ? nwr - 1 : y1; let hx0 = x0, hx1 = x1;
  if (w >= 20) { const far = xs > (x0 + x1) / 2 ? -1 : 1, sw = Math.min(9, Math.round(w * 0.35)), a = far < 0 ? x0 : x1 - sw + 1, b2 = far < 0 ? x0 + sw - 1 : x1, wx = far < 0 ? b2 + 1 : a - 1;
    K.vwall(wx, y0, hy1); if (far < 0) hx0 = wx + 1; else hx1 = wx - 1;
    const sg = cvSegs(y0, hy1, 7), types = ['croom', 'cofc', 'rest', 'croom', 'nursery', 'croom'];
    sg.forEach(([v0, v1], i) => { if (i) K.hwall(v0 - 1, a, b2); K.room(types[i % types.length], a, v0, b2, v1); K.door(wx, (v0 + v1) >> 1); }); }
  if (hy1 - y0 + 1 > 30) { const bd = hy1 - y0 + 1 - 22, bw = y0 + bd; K.hwall(bw, hx0, hx1); const sg = cvSegs(hx0, hx1, 9), types = ['croom', 'rest', 'croom', 'store'];
    sg.forEach(([u0, u1], i) => { if (i) K.vwall(u0 - 1, y0, bw - 1); K.room(types[i % types.length], u0, y0, u1, bw - 1); K.door((u0 + u1) >> 1, bw); });
    K.room('fellow', hx0, bw + 1, hx1, hy1); }
  else K.room('fellow', hx0, y0, hx1, hy1);
  if (nd) K.todo.push(() => { K.set(x0, y1, 'c_coat'); K.set(x1, y1, 'P'); for (let u = xs - 1; u <= xs + 1; u++) K.floor(u, y1, 'c_mat'); });
}

// ---------- the Legion Memorial: a lobby of plaques, a hall with a stage, a bar and a kitchen ----------
function cvLegion(K) {
  const { x0, x1, y0, y1, xs } = K, w = x1 - x0 + 1, d = y1 - y0 + 1;
  const nd = d >= 16 ? 4 : d >= 10 ? 3 : 0, nwr = y1 - nd, hy1 = nd ? nwr - 1 : y1;
  if (nd) { K.hwall(nwr, x0, x1, [cvClamp(xs, x0 + 1, x1 - 1)]); K.zone('llobby', x0, nwr, x1, y1); }
  const far = xs > (x0 + x1) / 2 ? -1 : 1; let hx0 = x0, hx1 = x1;
  if (w >= 14) { const sw = cvClamp(Math.round(w * 0.3), 4, 7), a = far < 0 ? x0 : x1 - sw + 1, b2 = far < 0 ? x0 + sw - 1 : x1, wx = far < 0 ? b2 + 1 : a - 1;
    K.vwall(wx, y0, hy1); if (far < 0) hx0 = wx + 1; else hx1 = wx - 1;
    const D = hy1 - y0 + 1, plan = D >= 22 ? [['kitchen', 7], ['cofc', 5], ['rest', 3], ['rest', 3], ['store', 99]] : [['kitchen', 6], ['cofc', 4], ['rest', 99]];
    let v = y0; for (let i = 0; i < plan.length && v <= hy1 - 2; i++) { const [t, n] = plan[i], b3 = Math.min(hy1, i === plan.length - 1 ? hy1 : v + n - 1); if (i) K.hwall(v - 1, a, b2);
      K.room(t, a, v, b2, b3); K.door(wx, (v + b3) >> 1); v = b3 + 2; } }
  const hall = K.zone('lhall', hx0, y0, hx1, hy1), sd = hy1 - y0 + 1 >= 14 ? 3 : 0;
  if (sd) K.zone('lstage', hx0, y0, hx1, y0 + sd - 1, null, { raised: 1 });
  K.todo.push(() => {
    const cx = (hx0 + hx1) >> 1;
    if (sd) { K.set(hx0, y0 + 1, 'c_flag'); K.set(hx1, y0 + 1, 'c_flag'); K.set(cx, y0 + 1, 'c_lec'); }
    for (let u = cx - 1; u <= cx + 1; u++) K.deco(u, y0 - 1, 'flagw'); for (const u of [hx0 + 1, hx1 - 1]) K.deco(u, y0 - 1, 'plq');
    // the bar, along the kitchen wall: back bar, the bartender's side, the counter, stools
    const bb = far < 0 ? hx0 : hx1, dir = far < 0 ? 1 : -1, b0 = y0 + sd + 2, bl = Math.min(6, hy1 - b0 - 2);
    const bar = bl >= 3 && hx1 - hx0 >= 8; if (bar) { for (let v = b0; v < b0 + bl; v++) { K.set(bb, v, 'c_bb'); K.set(bb + dir * 2, v, 'c_bar'); if ((v - b0) % 2 === 0) K.set(bb + dir * 3, v, 's'); }
      K.npc('bartender', bb + dir, b0 + 1, 'Bartender', ['Coffee\'s fresh. There\'s pop in the cooler, too.', 'Members and guests both welcome. Have a seat.'], { r: 1 }); }
    const tx0 = bar && far < 0 ? hx0 + 4 : hx0, tx1 = bar && far > 0 ? hx1 - 4 : hx1;
    for (let v = y0 + sd + 2; v <= hy1 - 2; v += 3) for (let u = tx0 + 1; u + 2 <= tx1; u += 5) { K.set(u, v, 'T'); K.set(u + 1, v, 'T'); K.set(u - 1, v, 'h'); K.set(u + 2, v, 'h'); }
    K.npc('cv_vet', tx0 + 3, y0 + sd + 3, 'Member', ['The plaques out front are for folks from around here who served.', 'This hall gets used for all sorts of things: meetings, receptions, community suppers.'], { r: 2 });
    if (nd) { for (let u = x0; u <= x1; u++) if (Math.abs(u - xs) > 1) { if ((u - x0) % 3 === 1) K.deco(u, nwr, 'plq'); if ((u - x0) % 3 === 0) K.set(u, nwr + 1, 'c_dc'); }
      K.set(x0, y1, 'c_flag'); K.set(x1, y1, 'c_flag'); for (let u = xs - 1; u <= xs + 1; u++) K.floor(u, y1, 'c_mat'); }
  });
  K.rooms.filter(z => z.t === 'kitchen').forEach(z => K.todo.push(() => { const seq = ['c_frg', 'c_stv', 'c_kc', 'c_ksk', 'c_kc', 'c_stv']; for (let u = z.x0, i = 0; u <= z.x1; u++, i++) K.set(u, z.y0, seq[i % seq.length]);
    K.npc('cv_vol', (z.x0 + z.x1) >> 1, z.y0 + 2, 'Volunteer', ['Coffee\'s on. Help yourself to a cookie.'], { r: 1 }); }));
}

// ---------- looking ----------
const CV_DECO = { wb: 'A whiteboard, half erased.', map: 'A pull-down map of the United States.', art: 'Kids\' artwork taped up in a row.', cb: 'A bulletin board: flyers and announcements.',
  clock: 'A clock. It\'s right, more or less.', pen: 'Pennants in school colors.', score: 'The scoreboard. HOME and GUEST, both zero.', menu: 'This week\'s lunch menu.', staff: 'A whiteboard with music staff lines.',
  curt: 'The stage curtain.', hymn: 'A hymn board with numbers slotted in.', cross: 'A cross on the wall.', crux: 'A crucifix above the altar.', glass: 'A tall window of colored glass.',
  scr: 'A projection screen.', plq: 'A bronze memorial plaque, in honor of those who served.', flagw: 'A large American flag on the wall.' };
function cvLook(Fm, x, y, t, n) {
  const cv = Fm.cv; if (!cv) return false;
  if (n) { if (n.talk) { n.talk(Fm, n); return true; } return false; }
  if (t === 'c_srv' || t === 'c_bar' || t === 'c_bb' || t === 'k' || t === 'c' || t === 'c_pass') { const s = Fm.npcs.find(q => Math.abs(q.x - x) <= 2 && Math.abs(q.y - y) <= 2 && !roomNpcGone(q)); if (s && s.talk) { s.talk(Fm, s); return true; } }
  if (t === 'M' && cv.school && typeof eduTree === 'function') { eduTree({ band: cv.school.band, school: cv.school.name }); return true; }
  if (t === 'W') { const d = cv.wd.get(y * Fm.W + x); if (d && CV_DECO[d]) { say([['', CV_DECO[d]]]); return true; } return false; }
  const den = cv.info.v, k = cv.info.k, lit = den === 'cath' || den === 'litur' || den === 'luth';
  const L = {
    c_lk: 'A row of lockers. A few have combination locks hanging open.', c_sd: den === 'elem' ? 'A small desk with a pencil box on it.' : 'A student desk, the chair attached.',
    c_td: 'The teacher\'s desk: a mug of pens, a stack of papers to grade.', c_bk: k === 'school' ? 'A bookshelf, sorted by subject.' : 'A shelf of books, crayons and paper.',
    c_cub: 'Cubbies, one for each kid: backpacks, lunch boxes, a stray mitten.', c_flag: k === 'legion' ? 'A flag on a stand, its fringe neatly brushed.' : 'The American flag on a short pole.',
    c_lab: 'A lab bench: a black top, a gas tap, a little sink.', c_hood: 'A fume hood. The glass is pulled down.', c_bl: 'Pull-out wooden bleachers.', c_hoop: 'A basketball hoop.',
    c_ct: 'A cafeteria table, benches attached.', c_srv: 'The serving line. Trays at one end, milk at the other.', c_mus: 'A chair and a music stand.', c_pno: 'An upright piano.',
    c_pod: 'A conductor\'s podium and stand.', c_drm: 'A drum set.', c_stall: 'A restroom stall.', c_rsink: 'A sink and a soap dispenser.', c_wf: 'A drinking fountain.',
    c_tro: 'A trophy case: plaques, team photos, a few gold trophies.', c_cot: 'A cot with a paper pillow cover.', c_easel: 'An easel with a painting in progress: a sun, a house, a tree.',
    c_cpy: 'A copier, warm from use.', c_aud: 'Rows of folding auditorium seats.', c_rug: k === 'school' ? 'A bright alphabet rug.' : 'A soft rug.',
    c_pew: den === 'cath' ? 'Rows of oak pews, kneelers folded up.' : 'Rows of oak pews. Hymnals in the racks.', c_chr: 'Rows of padded chairs.',
    c_alt: 'The altar, covered with a white cloth.', c_tab: den === 'lds' ? 'The sacrament table, covered with a white cloth.' : 'The communion table.',
    c_amb: 'The ambo, where the readings are read.', c_pul: 'The pulpit.', c_lec: k === 'legion' ? 'A lectern on the stage.' : 'A lectern.', c_font: 'The baptismal font.',
    c_bap: 'The baptistry, behind the pulpit.', c_cnd: 'A tall candle stand.', c_rail: 'The altar rail.', c_stn: 'One of the Stations of the Cross, along the side wall.',
    c_org: 'The organ.', c_spk: 'A speaker on a stand.', c_kbd: 'A keyboard on a stand.', c_wt: 'A table of bulletins and a guest book.', c_coat: 'A coat rack.',
    c_hwf: 'A small font of holy water by the door.', c_ft: 'A folding table, chairs pushed in.', c_kc: 'The kitchen counter.', c_stv: 'A big kitchen stove.', c_frg: 'A refrigerator.',
    c_ksk: 'A deep kitchen sink.', c_cof: 'Coffee urns and a stack of cups.', c_pass: 'A pass-through counter from the kitchen.', c_crib: 'A crib.', c_rock: 'A rocking chair.',
    c_toy: 'A basket of toys.', c_vest: lit ? 'A tall cabinet of linens and candles.' : 'A tall cabinet.', c_dc: 'A display case: a uniform, service caps and medals, each with a small typed card.',
    c_bar: 'The bar.', c_bb: 'The back bar: glasses, a coffee maker, a cooler of pop.', O: 'The street, through the window.',
  }[t];
  if (L) { say([['', L]]); return true; }
  return false;
}

// ---------- drawing: floors and walls ----------
function cvFloorKind(k, c1, c2, X, Y, h) {
  if (k === 'terr') { qp(c1, X, Y, 24, 24); for (let i = 0; i < 5; i++) { const q = hash(h + i, i); qp(i % 2 ? c2 : shade(c1, 0.1), X + q % 23, Y + (q >> 5) % 23, 1, 1); } qp(shade(c1, -0.05), X, Y + 23, 24, 1); qp(shade(c1, -0.05), X + 23, Y, 1, 24); return; }
  if (k === 'vct') { qp(c1, X, Y, 24, 24); if (h % 3 === 0) qp(c2, X + 1, Y + 1, 10, 10); if (h % 5 === 1) qp(c2, X + 13, Y + 13, 10, 10); qp(shade(c1, -0.08), X, Y + 11, 24, 1); qp(shade(c1, -0.08), X + 11, Y, 1, 24);
    if (h % 4 === 0) qp(shade(c1, 0.08), X + (h >> 3) % 20, Y + (h >> 7) % 20, 2, 1); return; }
  if (k === 'maple') { qp(c1, X, Y, 24, 24); for (let i = 0; i < 24; i += 4) qp(c2, X, Y + i + 3, 24, 1); qp(shade(c1, -0.1), X + ((Y / 24 * 5 + X / 24 * 3) % 3) * 8, Y, 1, 24); return; }
  homeFloorKind(k, c1, c2, X, Y, h);
}
function cvCourt(c, x, y, X, Y) {
  if (x < c.x0 || x > c.x1 || y < c.y0 || y > c.y1) return;
  const L = '#f4f0e4', P = 'rgba(168,40,40,.35)', my = Math.round(c.my), mx = Math.round(c.mx);
  // the lanes at each end
  if (c.hor) { if (y >= my - 2 && y <= my + 1 && (x <= c.x0 + 4 || x >= c.x1 - 4)) { qp(P, X, Y, 24, 24); if (x === c.x0 + 4) qp(L, X + 21, Y, 2, 24); if (x === c.x1 - 4) qp(L, X + 1, Y, 2, 24); if (y === my - 2) qp(L, X, Y + 1, 24, 2); if (y === my + 1) qp(L, X, Y + 21, 24, 2); } }
  else if (x >= mx - 2 && x <= mx + 1 && (y <= c.y0 + 4 || y >= c.y1 - 4)) { qp(P, X, Y, 24, 24); if (y === c.y0 + 4) qp(L, X, Y + 21, 24, 2); if (y === c.y1 - 4) qp(L, X, Y + 1, 24, 2); if (x === mx - 2) qp(L, X + 1, Y, 2, 24); if (x === mx + 1) qp(L, X + 21, Y, 2, 24); }
  if (x === c.x0) qp(L, X + 2, Y, 2, 24); if (x === c.x1) qp(L, X + 20, Y, 2, 24); if (y === c.y0) qp(L, X, Y + 2, 24, 2); if (y === c.y1) qp(L, X, Y + 20, 24, 2);
  const cx = c.mx + 0.5, cy = c.my + 0.5;
  if (c.hor) { if (Math.abs(x + 0.5 - cx) < 0.5) qp(L, X + Math.round((cx - x) * 24) - 1, Y, 2, 24); } else if (Math.abs(y + 0.5 - cy) < 0.5) qp(L, X, Y + Math.round((cy - y) * 24) - 1, 24, 2);
  if (Math.abs(x + 0.5 - cx) < 3.2 && Math.abs(y + 0.5 - cy) < 3.2) for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
    const dd = Math.hypot(x + (i + 0.5) / 6 - cx, y + (j + 0.5) / 6 - cy); if (Math.abs(dd - 2) < 0.1) qp(L, X + i * 4, Y + j * 4, 4, 4); else if (dd < 1.9) qp(P, X + i * 4, Y + j * 4, 4, 4); }
}
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    const cv = Fm.cv; if (!cv) return _ft(Fm, t, x, y);
    const W = Fm.W, X = x * 24, Y = y * 24; let zi = cv.Z[y * W + x]; if ((t === 'e' || zi < 0) && y > 0 && cv.Z[(y - 1) * W + x] >= 0) zi = cv.Z[(y - 1) * W + x];
    const z = zi >= 0 ? cv.zones[zi] : null, f = (z && z.f) || CZ[z ? z.t : CV_DEF[Fm.kind] || 'hall'].f, h = hash(x * 11 + Fm.seed, y * 7 + 5);
    cvFloorKind(f[0], f[1], f[2], X, Y, h);
    if (z) {
      if (z.court) cvCourt(z.court, x, y, X, Y);
      if (z.aisle === x && t !== 'e') { qp('#8a2a2a', X + 3, Y, 18, 24); qp('#a83a32', X + 4, Y, 1, 24); qp('#a83a32', X + 19, Y, 1, 24); }
      if (z.raised) { const zb = y + 1 < Fm.H ? cv.Z[(y + 1) * W + x] : -1; if (zb !== zi && Fm.R[y + 1] && ROOM_WALK.has(Fm.R[y + 1][x])) { qp(shade(f[1], 0.2), X, Y + 19, 24, 1); qp(shade(f[1], -0.35), X, Y + 20, 24, 4); } }
    }
    if (t === 'c_mat') { qp('#3a3a40', X, Y + 1, 24, 22); for (let i = 2; i < 22; i += 3) qp('#4a4a52', X, Y + 1 + i, 24, 1); }
    else if (t === 'c_rug') { const p = ['#e05a5a', '#f0c040', '#4aa0d8', '#5ab06a', '#a86ac8', '#f08a40']; qp(p[(x + y * 2) % 6], X + 1, Y + 1, 22, 22); qp('#f4f0e4', X + 8, Y + 7, 8, 10); qp(p[(x + y * 2 + 3) % 6], X + 10, Y + 9, 4, 6); }
    else if (t === 'c_dr') { const hz = roomT(Fm, x - 1, y) === 'W' || roomT(Fm, x + 1, y) === 'W'; qp('rgba(0,0,0,.12)', X, Y, 24, 24);
      if (hz) { qp('#7a6a5a', X, Y, 2, 24); qp('#7a6a5a', X + 22, Y, 2, 24); qp('#9a8a6a', X + 2, Y + 10, 20, 3); } else { qp('#7a6a5a', X, Y, 24, 2); qp('#7a6a5a', X, Y + 22, 24, 2); qp('#9a8a6a', X + 10, Y + 2, 3, 20); } }
    if (t === 'e') { qp('#3a3236', X + 2, Y + 3, 20, 14); qp('#4a4046', X + 3, Y + 4, 18, 12); }
  }; }
{ const _wf = roomWallFace; roomWallFace = function (Fm, x, y) {
    const cv = Fm.cv; if (!cv) return _wf(Fm, x, y);
    const W = Fm.W, X = x * 24, Y = y * 24, zi = y + 1 < Fm.H ? cv.Z[(y + 1) * W + x] : -1, z = zi >= 0 ? cv.zones[zi] : null, st = CZ[z ? z.t : CV_DEF[Fm.kind] || 'hall'].w;
    qp(st[0], X, Y - 9, 24, 33); qp(shade(st[0], -0.06), X, Y - 9, 24, 2); qp('#2a2224', X, Y - 9, 24, 1);
    if (z && (z.t === 'rest' || z.t === 'kitchen')) { qp('#dfe8ec', X, Y + 4, 24, 14); for (let i = 0; i < 24; i += 6) qp('#c8d4da', X + i, Y + 4, 1, 14); }
    if (z && (z.t === 'hall' || z.t === 'gym')) { qp(st[1], X, Y + 6, 24, 2); }
    qp(st[1], X, Y + 18, 24, 6); qp(shade(st[1], -0.3), X, Y + 23, 24, 1);
    const d = cv.wd.get(y * W + x); if (d) cvDeco(Fm, d, x, y, X, Y);
  }; }
function cvDeco(Fm, d, x, y, X, Y) {
  const q = (c, a, e, w, h) => qp(c, X + a, Y + e, w, h), same = dx => { const t = Fm.cv.wd.get(y * Fm.W + x + dx); return t === d; };
  switch (d) {
    case 'wb': q('#8a8e96', same(-1) ? 0 : 1, -6, same(-1) && same(1) ? 24 : 23, 17); q('#f4f6f4', same(-1) ? 0 : 2, -5, same(-1) && same(1) ? 24 : 21, 14); q('#8a8e96', 0, 9, 24, 2);
      if (hash(x, y) % 2) { q('#3a6ab8', 4, -2, 10, 1); q('#3a6ab8', 4, 1, 14, 1); } else { q('#c83a3a', 5, -1, 8, 1); q('#2a2a2e', 5, 3, 12, 1); } break;
    case 'staff': q('#8a8e96', 0, -6, 24, 17); q('#f4f6f4', 0, -5, 24, 14); for (let i = 0; i < 5; i++) q('#2a2a2e', 0, -3 + i * 2, 24, 1); q('#2a2a2e', 6 + (x % 3) * 4, -2, 3, 2); break;
    case 'map': q('#5a3a22', 2, -7, 20, 2); q('#e8dcb0', 3, -5, 18, 14); q('#7ab06a', 6, -3, 11, 8); q('#4a8ac8', 4, 4, 4, 3); q('#c8a050', 11, -2, 3, 3); break;
    case 'art': for (let i = 0; i < 2; i++) { const c = ['#f0c040', '#e05a5a', '#4aa0d8', '#5ab06a'][(x + i) % 4]; q('#f4f0e4', 2 + i * 11, -5 + i * 2, 9, 11); q(c, 3 + i * 11, -3 + i * 2, 6, 5); q('#3a3a3e', 4 + i * 11, 3 + i * 2, 5, 1); } break;
    case 'cb': q('#5a3a22', 2, -6, 20, 16); q('#c8945a', 3, -5, 18, 14); q('#f4f0e4', 5, -4, 6, 7); q('#f0d860', 12, -3, 6, 5); q('#9ac0e8', 8, 3, 7, 4); q('#c83a3a', 7, -4, 2, 1); break;
    case 'clock': q('#2a2224', 8, -4, 9, 9); q('#f4f2ea', 9, -3, 7, 7); q('#2a2224', 12, -2, 1, 3); q('#2a2224', 12, 0, 2, 1); break;
    case 'pen': q(['#a02828', '#2a4a8a', '#c8a040'][x % 3], 5, -6, 14, 3); q(['#a02828', '#2a4a8a', '#c8a040'][x % 3], 7, -3, 9, 3); q('#f4f0e4', 9, -5, 6, 1); break;
    case 'score': q('#1a1a1e', -6, -8, 36, 16); q('#e8c040', -5, -7, 34, 2); q('#e04a3a', -2, -3, 8, 6); q('#e04a3a', 18, -3, 8, 6); q('#f4f0e4', 9, -2, 6, 4); break;
    case 'menu': q('#1a3a2a', 1, -6, 22, 15); for (let r = 0; r < 4; r++) q('#f4f0e4', 3, -4 + r * 3, 8 + (x * 3 + r) % 10, 1); break;
    case 'curt': q('#8a1e22', 0, -9, 24, 33); for (let i = 2; i < 24; i += 6) q('#6a161a', X % 2 ? i : i + 1, -9, 2, 33); q('#c8a040', 0, -9, 24, 2); break;
    case 'hymn': q('#4a2e1a', 5, -8, 14, 20); q('#2a1a10', 6, -7, 12, 18); for (let r = 0; r < 4; r++) q('#f4f0e4', 8, -5 + r * 4, 8, 2); break;
    case 'cross': q('#6a4428', 10, -9, 4, 22); q('#6a4428', 5, -4, 14, 4); q('#8a5a30', 10, -9, 1, 22); break;
    case 'crux': q('#5a3a22', 10, -9, 4, 22); q('#5a3a22', 5, -4, 14, 4); q('#e8d8b8', 11, -3, 2, 9); q('#e8d8b8', 7, -3, 10, 2); q('#e8d8b8', 11, -5, 2, 2); break;
    case 'glass': { q('#3a2a2a', 6, -9, 12, 26); const p = ['#3a5ab0', '#c8a040', '#a83a3a', '#4a8a5a']; for (let j = 0; j < 5; j++) for (let i = 0; i < 2; i++) q(p[(i + j + x) % 4], 7 + i * 5, -8 + j * 5, 5, 5); q('#3a2a2a', 11, -9, 2, 26); q('#e8e0c0', 8, -9, 8, 2); break; }
    case 'scr': q('#3a3a40', 0, -9, 24, 2); q('#e8ecf0', 0, -7, 24, 18); if (!same(-1)) q('#3a3a40', 0, -7, 1, 18); if (!same(1)) q('#3a3a40', 23, -7, 1, 18); break;
    case 'plq': q('#5a3a22', 5, -6, 14, 14); q('#a8803a', 6, -5, 12, 12); q('#c8a050', 7, -4, 10, 1); for (let r = 0; r < 3; r++) q('#7a5a2a', 8, -1 + r * 3, 8, 1); break;
    case 'flagw': { const L = same(-1), Rr = same(1); for (let i = 0; i < 7; i++) q(i % 2 ? '#f4f0e8' : '#b8282e', 0, -8 + i * 3, 24, 3); if (!L) { q('#2a3a6a', 0, -8, 14, 12); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) q('#f4f0e8', 2 + i * 4, -6 + j * 4, 1, 1); q('#8a8e96', 0, -10, 1, 24); } if (!Rr) q('rgba(0,0,0,.1)', 20, -8, 4, 21); break; }
  }
}
// ---------- drawing: furniture ----------
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (Fm.cv && typeof t === 'string' && t.length > 2 && t[0] === 'c' && t[1] === '_') return cvProp(Fm, t, x, y); return _rp(Fm, t, x, y); }; }
function cvProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, q = (c, a, e, w, h) => qp(c, X + a, Y + e, w, h), h = hash(x * 5 + Fm.seed, y * 9 + 2), sh = () => q('rgba(0,0,0,.22)', 1, 19, 22, 4);
  const L = roomT(Fm, x - 1, y) === t, Rr = roomT(Fm, x + 1, y) === t, a0 = L ? 0 : 2, aw = 24 - (L ? 0 : 2) - (Rr ? 0 : 2), U = roomT(Fm, x, y - 1) === t, D = roomT(Fm, x, y + 1) === t;
  switch (t) {
    case 'c_lk': { const c = ['#3a5a8a', '#a83a32', '#c8a040', '#4a7a5a'][Fm.seed % 4]; q(shade(c, -0.3), 0, -16, 24, 36); q(c, 1, -15, 10, 34); q(c, 13, -15, 10, 34);
      for (const ox of [3, 15]) { for (let i = 0; i < 3; i++) q(shade(c, -0.25), ox, -12 + i * 2, 6, 1); q('#c8ccd2', ox + 5, -2, 2, 4); } if (h % 7 === 0) q('#2a2a2e', 8, -1, 3, 4); break; }
    case 'c_sd': { const el = Fm.cv.info.v === 'elem'; q('rgba(0,0,0,.2)', 3, 18, 18, 3); q('#c8a070', 3, 1, 18, el ? 8 : 9); q('#a8804a', 3, el ? 8 : 9, 18, 2); q('#8a8e96', 5, 11, 2, 7); q('#8a8e96', 17, 11, 2, 7);
      q(['#3a5a8a', '#4a7a5a', '#c83a3a', '#c8a040'][h % 4], 7, 13, 10, 4); if (h % 3 === 0) q('#f4f0e4', 6, 3, 6, 4); if (h % 4 === 1) q('#e8c040', 13, 4, 6, 1); break; }
    case 'c_td': sh(); q('#7a4a2a', 0, 1, 24, 18); q('#9a6a3a', 0, 1, 24, 3); q('#5a3418', 3, 8, 7, 10); q('#c8a050', 6, 12, 2, 1); q('#f4f0e4', 12, -2, 8, 5); q('#e8e4dc', 13, -3, 7, 1); q('#3a6ab8', 3, -5, 4, 6); q('#c83a3a', 17, -4, 4, 4); q('#3a7a3a', 19, -6, 1, 2); break;
    case 'c_bk': sh(); q('#5a3a22', 0, -14, 24, 34); q('#6a4428', 0, -14, 24, 2);
      for (let r = 0; r < 4; r++) { const sy = -11 + r * 8; q('#2e1c10', 1, sy + 6, 22, 1); for (let i = 0; i < 7; i++) { const z = hash(x * 7 + i + Fm.seed, y * 5 + r); if (z % 9 === 0) continue; q(ROOM_SPINE[z % 8], 1 + i * 3, sy + 1 + (z % 2), 2, 5 - (z % 2)); } } break;
    case 'c_cub': sh(); q('#c8a070', 0, -2, 24, 22); q('#a8804a', 0, -2, 24, 2); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { q('#8a6a3a', 1 + i * 12, 1 + j * 9, 10, 8); q(['#e05a5a', '#4aa0d8', '#f0c040', '#5ab06a', '#a86ac8'][(i + j * 2 + h) % 5], 3 + i * 12, 3 + j * 9, 6, 6); } break;
    case 'c_flag': { q('rgba(0,0,0,.2)', 6, 18, 12, 3); q('#6a4428', 7, 15, 10, 4); q('#c8c8c8', 11, -28, 2, 44); q('#e8c040', 10, -30, 4, 3);
      const wis = Fm.cv.info.k === 'legion' && x % 2; if (wis) { q('#2a4a9a', 13, -26, 11, 14); q('#e8c040', 16, -22, 5, 5); }
      else { for (let i = 0; i < 7; i++) q(i % 2 ? '#f4f0e8' : '#b8282e', 13, -26 + i * 2, 11, 2); q('#2a3a6a', 13, -26, 5, 7); } break; }
    case 'c_lab': sh(); q('#c8c4b8', a0, 2, aw, 17); q(shade('#c8c4b8', -0.2), a0, 17, aw, 2); q('#2a2a2e', a0 - (L ? 0 : 1), -2, aw + (L ? 0 : 1) + (Rr ? 0 : 1), 5); if (!L) q('#2a2a2e', 0, 2, 2, 17);
      if (h % 3 === 0) { q('#9aa0a8', 9, -6, 2, 5); q('#9aa0a8', 9, -6, 5, 1); } else if (h % 3 === 1) { q('#e8f0f4', 14, -6, 3, 5); q('#7ac87a', 14, -3, 3, 2); } break;
    case 'c_hood': q('rgba(0,0,0,.22)', 1, 19, 22, 4); q('#c8c4b8', 1, -18, 22, 38); q('#2a2a2e', 1, 0, 22, 3); q('rgba(200,225,240,.6)', 3, -14, 18, 13); q('#8a8e96', 3, -15, 18, 1); break;
    case 'c_bl': for (let i = 0; i < 3; i++) { q('#b8864a', 0, -6 + i * 8, 24, 5); q('#8a5a30', 0, -1 + i * 8, 24, 3); } q('#5a5e66', 2, -6, 1, 26); if (h % 5 === 0) q('#a02828', 6, -8, 8, 3); break;
    case 'c_hoop': q('rgba(0,0,0,.25)', 4, 18, 16, 4); q('#3a3c42', 10, -20, 4, 40); q('#f4f4f2', 3, -28, 18, 12); q('#a02828', 8, -24, 8, 6); q('#f4f4f2', 9, -23, 6, 4); q('#e06a20', 7, -16, 10, 2); q('#e8e8e8', 8, -14, 8, 4); break;
    case 'c_ct': q('rgba(0,0,0,.18)', a0, 18, aw, 3); q('#3a6ab0', a0, -1, aw, 3); q('#d8d4cc', a0, 3, aw, 9); q('#b8b4ac', a0, 11, aw, 2); q('#3a6ab0', a0, 14, aw, 3); q('#5a5e66', a0 + 2, 17, 2, 3);
      if (h % 4 === 0) { q('#f4f0e4', 6, 5, 6, 4); q('#e05a5a', 8, 5, 2, 2); } break;
    case 'c_srv': sh(); q('#a8acb4', 0, 2, 24, 17); q('#c8ccd2', 0, -2, 24, 5); q('#e8c040', 2, -1, 6, 3); q('#5ab06a', 9, -1, 6, 3); q('#a86a3a', 16, -1, 6, 3); q('rgba(200,225,240,.55)', 0, -12, 24, 8); q('#8a8e96', 0, -12, 24, 1); q('#5a5e66', 0, 8, 24, 2); break;
    case 'c_mus': q('rgba(0,0,0,.2)', 5, 18, 14, 3); q('#2a2a2e', 6, 9, 12, 5); q('#2a2a2e', 6, 2, 2, 8); q('#3a3a40', 7, 14, 2, 5); q('#3a3a40', 15, 14, 2, 5); q('#3a3a40', 17, -6, 1, 12); q('#2a2a2e', 14, -8, 8, 5); q('#f4f0e4', 15, -7, 6, 3); break;
    case 'c_pno': sh(); q('#3a2418', 0, -14, 24, 33); q('#4a3020', 0, -14, 24, 2); q('#f4f0e4', 2, 4, 20, 4); for (let i = 0; i < 6; i++) if (i !== 2) q('#16161a', 4 + i * 3, 4, 2, 2); q('#f4f0e4', 7, -10, 10, 7); q('#3a2418', 2, 17, 2, 3); q('#3a2418', 20, 17, 2, 3); break;
    case 'c_pod': sh(); q('#6a4428', 4, 6, 16, 13); q('#8a5a30', 4, 6, 16, 2); q('#2a2a2e', 11, -6, 2, 12); q('#2a2a2e', 6, -9, 12, 4); q('#f4f0e4', 7, -8, 10, 2); break;
    case 'c_drm': sh(); q('#c83a3a', 3, 4, 14, 14); q('#f4f0e4', 5, 6, 10, 10); q('#c83a3a', 15, -2, 8, 6); q('#e8e0d0', 16, -1, 6, 4); q('#c8a040', 1, -8, 10, 2); q('#8a8e96', 5, -6, 1, 10); break;
    case 'c_stall': q(shade('#9aa6b0', -0.25), 0, -16, 24, 36); q('#9aa6b0', 1, -15, 22, 33); q('#b4bec6', 1, -15, 22, 2); q('#6a7680', 18, 0, 2, 3); if (!Rr) q('#6a7680', 23, -16, 1, 36); q('rgba(0,0,0,.25)', 2, 18, 20, 2); break;
    case 'c_rsink': sh(); q('#e8ecf0', 2, 2, 20, 10); q('#f4f6f8', 4, 3, 16, 5); q('#9aa0a8', 11, -1, 2, 4); q('#9aa0a8', 4, -24, 16, 18); q('#cfe0e8', 5, -23, 14, 16); q('rgba(255,255,255,.4)', 6, -22, 3, 12); break;
    case 'c_wf': sh(); q('#a8acb4', 4, -4, 16, 18); q('#c8ccd2', 4, -4, 16, 3); q('#8a8e96', 6, 0, 12, 4); q('#5a6068', 11, -2, 2, 2); break;
    case 'c_tro': sh(); q('#5a3a22', 0, 6, 24, 14); q('#cfe0e8', 1, -18, 22, 25); q('#8a8e96', 1, -8, 22, 1); q('#e8c040', 4, -16, 4, 7); q('#e8c040', 14, -15, 5, 6); q('#c8a050', 9, -5, 6, 4); q('#f4f0e4', 4, -5, 4, 4); q('rgba(255,255,255,.35)', 2, -17, 2, 22); break;
    case 'c_cot': q('rgba(0,0,0,.18)', 2, 18, 20, 3); q('#9aa0a8', 3, -4, 18, 22); q('#f4f6f8', 4, -3, 16, 20); q('#e8ecf0', 6, -2, 12, 5); q('#9ac0e0', 4, 6, 16, 11); break;
    case 'c_easel': q('rgba(0,0,0,.18)', 4, 18, 16, 3); q('#8a5a30', 5, -10, 2, 29); q('#8a5a30', 17, -10, 2, 29); q('#f4f0e4', 4, -12, 16, 14); q('#f0c040', 6, -11, 4, 4); q('#c83a3a', 11, -6, 6, 5); q('#5ab06a', 5, -2, 14, 2); q('#8a5a30', 4, 2, 16, 2); break;
    case 'c_cpy': sh(); q('#c8ccd2', 1, -4, 22, 24); q('#e8eaec', 1, -4, 22, 4); q('#3a3c42', 4, -2, 10, 2); q('#7ac87a', 18, -2, 2, 2); q('#f4f6f8', 18, 4, 6, 8); q('#8a8e96', 3, 6, 14, 1); break;
    case 'c_aud': q('rgba(0,0,0,.2)', a0, 18, aw, 3); for (let i = 0; i < 2; i++) { q('#8a2a2a', 1 + i * 12, -2, 10, 12); q('#a83a3a', 1 + i * 12, -2, 10, 2); q('#5a1a1a', 1 + i * 12, 10, 10, 6); } q('#3a3a40', 0, 10, 24, 1); break;
    case 'c_pew': { const wd = Fm.cv.info.v === 'free' ? '#6a6a7a' : '#7a4e2a'; q('rgba(0,0,0,.2)', a0, 18, aw, 3); q(shade(wd, 0.15), a0, -2, aw, 3); q(wd, a0, 1, aw, 9); q(shade(wd, -0.25), a0, 10, aw, 6); q(shade(wd, 0.05), a0, 16, aw, 2);
      if (!L) { q(shade(wd, -0.35), 0, -4, 3, 24); q(shade(wd, 0.1), 0, -5, 3, 2); } if (!Rr) { q(shade(wd, -0.35), 21, -4, 3, 24); q(shade(wd, 0.1), 21, -5, 3, 2); }
      if (Fm.cv.info.v !== 'cath' && (x + y) % 3 === 0) { q('#3a3a5a', 8, 3, 3, 5); q('#7a2a2a', 12, 3, 3, 5); } break; }
    case 'c_chr': q('rgba(0,0,0,.2)', 4, 18, 16, 3); q('#3a3a42', 5, -2, 14, 9); q(['#5a6a8a', '#6a5a6a'][Fm.seed % 2], 6, -1, 12, 7); q(['#5a6a8a', '#6a5a6a'][Fm.seed % 2], 5, 8, 14, 5); q('#2a2a30', 6, 13, 2, 6); q('#2a2a30', 16, 13, 2, 6); break;
    case 'c_alt': sh(); q('#d8d0c0', a0, 4, aw, 15); q('#b8b0a0', a0, 16, aw, 3); q('#f4f2ea', a0 - (L ? 0 : 1), -1, aw + (L ? 0 : 1) + (Rr ? 0 : 1), 7); q('#c8a050', a0, 5, aw, 1);
      if (!L || !Rr) { q('#f4f0e4', 10, -9, 3, 8); q((frame >> 3) % 2 ? '#f0c040' : '#f0a030', 10, -11, 3, 2); } if (L && Rr) { q('#8a2a2a', 6, 0, 12, 1); q('#c8a050', 9, -3, 6, 3); } break;
    case 'c_tab': sh(); q('#7a4e2a', a0, 2, aw, 7); q('#6a4428', a0 + 1, 9, 2, 10); q('#6a4428', a0 + aw - 3, 9, 2, 10); q(Fm.cv.info.v === 'lds' ? '#f4f2ea' : '#e8e0d0', a0, 0, aw, 4);
      if (!L && !Rr) q('#c8a050', 9, -4, 6, 4); else if (L && Rr) q('#8a2a2a', 0, 1, 24, 2); break;
    case 'c_amb': case 'c_pul': case 'c_lec': { const big = t !== 'c_lec', wd = '#6a4428'; q('rgba(0,0,0,.25)', 3, 18, 18, 4);
      q(wd, big ? 3 : 6, big ? -6 : -2, big ? 18 : 12, big ? 25 : 21); q(shade(wd, 0.2), big ? 2 : 5, big ? -9 : -5, big ? 20 : 14, 4); q('#c8a050', big ? 4 : 7, big ? 0 : 3, big ? 16 : 10, 1);
      if (big) q(Fm.cv.info.v === 'cath' || Fm.cv.info.v === 'luth' ? '#4a7a3a' : '#8a2a2a', 8, 2, 8, 10); q('#f4f0e4', big ? 7 : 9, big ? -9 : -5, 8, 2); break; }
    case 'c_font': q('rgba(0,0,0,.22)', 4, 18, 16, 4); q('#b8b4ac', 9, 4, 6, 15); q('#a8a49c', 6, 16, 12, 3); q('#c8c4bc', 3, -4, 18, 8); q('#d8d4cc', 3, -4, 18, 2); q('#7aa8c8', 5, -3, 14, 3); break;
    case 'c_bap': q('#5a3a22', a0, -14, aw, 34); q('#8a5a30', a0, -14, aw, 3); q('#7aa8c8', a0 + (L ? 0 : 2), -9, aw - (L ? 0 : 2) - (Rr ? 0 : 2), 14); q('#9ac0d8', a0 + 2, -9, aw - 4, 2); q('#4a2e1a', a0, 6, aw, 12); break;
    case 'c_cnd': q('rgba(0,0,0,.2)', 7, 18, 10, 3); q('#c8a050', 11, -6, 2, 25); q('#c8a050', 7, 17, 10, 2); q('#c8a050', 8, -7, 8, 2); q('#f4f0e4', 10, -16, 4, 9); q((frame >> 3) % 2 ? '#f0c040' : '#f0a030', 11, -19, 2, 3); break;
    case 'c_rail': q('rgba(0,0,0,.2)', 0, 18, 24, 3); q('#7a4e2a', 0, -2, 24, 4); q('#9a6a3a', 0, -2, 24, 1); for (let i = 3; i < 24; i += 6) q('#6a4428', i, 2, 2, 12); q('#8a2a2a', 0, 14, 24, 4); break;
    case 'c_stn': q('rgba(0,0,0,.15)', 2, -16, 20, 16); q('#5a3a22', 3, -18, 18, 15); q('#d8ccb0', 5, -16, 14, 11); q('#a8987a', 8, -13, 3, 6); q('#a8987a', 13, -12, 3, 5); q('#5a3a22', 11, -22, 2, 4); q('#5a3a22', 9, -21, 6, 1); break;
    case 'c_org': sh(); q('#3a2418', 0, -8, 24, 27); q('#4a3020', 0, -8, 24, 2); q('#f4f0e4', 2, 2, 20, 2); q('#f4f0e4', 2, 6, 20, 2); for (let i = 0; i < 5; i++) q('#c8c4b8', 2 + i * 4, -20 - (i % 3) * 3, 3, 12 + (i % 3) * 3); break;
    case 'c_spk': q('rgba(0,0,0,.2)', 5, 18, 14, 3); q('#2a2a2e', 11, 4, 2, 15); q('#1e1e22', 5, -14, 14, 18); q('#3a3a40', 8, -11, 8, 8); q('#3a3a40', 9, -1, 6, 3); break;
    case 'c_kbd': q('rgba(0,0,0,.2)', 3, 18, 18, 3); q('#3a3a40', 5, 6, 2, 13); q('#3a3a40', 17, 6, 2, 13); q('#1e1e22', 1, 1, 22, 6); q('#f4f0e4', 2, 3, 20, 3); for (let i = 0; i < 6; i++) q('#16161a', 3 + i * 3, 3, 1, 2); break;
    case 'c_wt': sh(); q('#5a3a22', 1, 4, 22, 15); q('#e8e0d0', 0, 0, 24, 9); q('#f4f0e4', 3, -2, 7, 4); q('#f4f0e4', 4, -3, 7, 4); q('#7a2a2a', 14, -1, 7, 5); q('#c8a050', 16, 1, 3, 1); break;
    case 'c_coat': q('rgba(0,0,0,.2)', 4, 19, 16, 3); q('#5a3a22', 11, -14, 2, 33); q('#5a3a22', 6, -14, 12, 2); q(['#3a5a8a', '#8a3a3a', '#5a6a4a'][h % 3], 5, -12, 6, 16); q('#6a5a4a', 13, -11, 6, 13); break;
    case 'c_hwf': q('#c8c4bc', 6, -8, 12, 3); q('#b8b4ac', 8, -5, 8, 6); q('#7aa8c8', 7, -8, 10, 2); q('#8a8680', 11, -1, 2, 8); break;
    case 'c_ft': q('rgba(0,0,0,.18)', a0, 18, aw, 3); q('#7a7e86', a0, -2, aw, 3); q('#e8e4dc', a0, 3, aw, 9); q('#c8c4bc', a0, 11, aw, 2); q('#7a7e86', a0, 15, aw, 3); q('#5a5e66', a0 + 2, 13, 2, 6); if (h % 5 === 0) { q('#f4f0e4', 8, 5, 6, 4); q('#c8a050', 9, 5, 4, 2); } break;
    case 'c_kc': case 'c_ksk': sh(); q('#a8acb4', 0, 2, 24, 18); q('#c8ccd2', 0, -2, 24, 5); q('#8a8e96', 11, 4, 1, 14); if (t === 'c_ksk') { q('#6a6e76', 4, -1, 16, 3); q('#8a8e96', 11, -7, 2, 6); q('#8a8e96', 11, -7, 5, 1); } else if (h % 3 === 0) { q('#e8e4dc', 4, -6, 6, 5); q('#c8a050', 14, -5, 6, 4); } break;
    case 'c_stv': sh(); q('#8a8e96', 0, -2, 24, 22); q('#a8acb4', 0, -2, 24, 2); for (const [a, e] of [[2, 0], [13, 0], [2, 3], [13, 3]]) q('#2a2a2e', a, e, 8, 2); q('#3a3c42', 3, 8, 18, 9); q('#c8ccd2', 3, 7, 18, 1); q('#5a5e66', 0, -24, 24, 6); break;
    case 'c_frg': q('rgba(0,0,0,.22)', 1, 19, 22, 4); q('#b8bcc4', 1, -20, 22, 40); q('#d0d4da', 1, -20, 22, 1); q('#8a8e96', 12, -20, 1, 40); q('#6a6e76', 9, -10, 2, 10); q('#6a6e76', 14, -10, 2, 10); break;
    case 'c_cof': sh(); q('#5a3a22', 1, 4, 22, 15); q('#e8e0d0', 0, 1, 24, 5); q('#c8ccd2', 3, -10, 7, 12); q('#9aa0a8', 3, -10, 7, 2); q('#c8ccd2', 13, -8, 6, 10); q('#2a2a2e', 6, 0, 2, 2); q('#f4f0e4', 20, -1, 3, 4); break;
    case 'c_pass': { const st = CZ.kitchen.w; q(st[0], 0, -9, 24, 33); q('#2a2224', 0, -9, 24, 1); q('#3a3236', 2, -6, 20, 14); q('#c8ccd2', 0, 8, 24, 4); q('#a8acb4', 0, 12, 24, 10); if (h % 3 === 0) q('#e8e4dc', 6, 4, 6, 4); break; }
    case 'c_crib': sh(); q('#f4f0e4', 1, -6, 22, 4); q('#f4f0e4', 1, 14, 22, 3); for (let i = 1; i < 24; i += 4) q('#f4f0e4', i, -6, 2, 22); q('#c8d8f0', 3, 0, 18, 12); q('#f4d8e0', 5, 2, 8, 6); break;
    case 'c_rock': q('rgba(0,0,0,.2)', 4, 18, 16, 3); q('#8a5a30', 6, -8, 12, 14); q('#a87a4a', 6, 6, 12, 5); q('#6a4428', 3, 18, 18, 2); q('#6a4428', 7, 11, 2, 8); q('#6a4428', 15, 11, 2, 8); break;
    case 'c_toy': sh(); q('#c8a060', 3, 6, 18, 13); q('#a8804a', 3, 6, 18, 2); q('#e05a5a', 5, 1, 6, 6); q('#4aa0d8', 12, 2, 6, 5); q('#f0c040', 9, -2, 5, 5); break;
    case 'c_vest': q('rgba(0,0,0,.22)', 1, 19, 22, 4); q('#6a4428', 1, -18, 22, 38); q('#8a5a30', 1, -18, 22, 2); q('#5a3a22', 12, -16, 1, 34); q('#c8a050', 9, 0, 2, 3); q('#c8a050', 14, 0, 2, 3); break;
    case 'c_dc': sh(); q('#3a2a1a', 1, 8, 22, 11); q('#cfe0e8', 1, -10, 22, 18); q('rgba(255,255,255,.35)', 2, -9, 2, 16);
      if (h % 3 === 0) { q('#2a3a6a', 5, -2, 12, 6); q('#f4f0e8', 8, -1, 2, 2); } else if (h % 3 === 1) { q('#4a5a3a', 6, -6, 10, 6); q('#3a3a2a', 6, -1, 12, 2); } else { q('#c8a040', 7, -5, 3, 5); q('#a83a3a', 7, -8, 3, 3); q('#c8a040', 13, -4, 3, 5); q('#3a5ab0', 13, -7, 3, 3); } break;
    case 'c_bar': q('rgba(0,0,0,.2)', 1, 19, 22, 4); q('#5a3a22', 2, U ? -4 : 0, 20, D ? 28 : 19); q('#8a5a30', 1, U ? -4 : -3, 22, D ? 28 : 5); q('#c8a050', 1, 1, 1, 18); break;
    case 'c_bb': q('#3a2418', 1, -14, 22, 34); q('#4a3020', 1, -14, 22, 2); for (let r = 0; r < 3; r++) { q('#2a1810', 1, -6 + r * 8, 22, 1); for (let i = 0; i < 5; i++) q(r === 1 ? ['#e8e4dc', '#c8d8e8'][i % 2] : ['#3a6a3a', '#8a5a2a', '#c8c0a0'][(i + h) % 3], 2 + i * 4, -11 + r * 8, 3, 5); } break;
  }
}
