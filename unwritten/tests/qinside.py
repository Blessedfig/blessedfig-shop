# Every indoor place: walk in the way a player does, then check you can (1) take a step and (2) reach a way out.
# Nov 27, Christian: a customer walked into the library and could not move or get out. For every building that can be
# entered (rooms.js and its layers, plus the bookstore, Uma, Respawn, the Palace and the museum) at several times of day:
#   STUCK  no neighbouring tile is free (the player cannot move at all)
#   NOEXIT the floor's exits (front door 'e', stairs, links) cannot be reached from where you step in
#   SMALL  fewer than 6 tiles can be reached
#   DRAWERR drawing the room throws (before Nov 27 any error stopped the game loop, freezing the game)
# A real key press is also simulated for each direction (MODES.inside.update), so wrappers on movement are covered.
# Watch "BAD n" (0) and "errors []".
import json, sys
from playwright.sync_api import sync_playwright
HOURS = [int(h) for h in sys.argv[1].split(',')] if len(sys.argv) > 1 else [8, 13, 19, 23]
CHECK = r"""(hour)=>{
  const out = [], seen = new Set();
  const enterers = [];
  for (const b of BLD) if (roomEligible(b)) enterers.push([b.name || b.addr || ('#' + b.id), () => enterRoom(b)]);
  enterers.push(['The Blessed Fig Tree', () => enterFig()]);
  if (typeof enterUma === 'function') enterers.push(['Unified Martial Arts', () => enterUma()]);
  if (typeof enterRespawn === 'function') enterers.push(['Respawn', () => enterRespawn()]);
  if (typeof enterPalace === 'function') enterers.push(['Palace', () => enterPalace()]);
  const exitsOf = (fl) => { const lk = fl.links || {}; return t => t === 'e' || !!lk[t] || 'UVud'.includes(t) && t !== ''; };
  const probe = (name, how) => {
    G = newGame({g:'boy',name:'Eli'}, false); G.seenCtl = 1; G.story = 1; if (typeof setHour === 'function') setHour(hour); else if ('min' in G) G.min = hour * 60;
    setMode('walk'); DLG = null;
    try { how(); } catch (e) { out.push({name, bad:'ERROR', e:String(e)}); return; }
    for (let i = 0; i < 6 && DLG; i++) DLG = null;
    if (mode !== 'inside' || !G.inside) { out.push({name, bad:'', note:'not entered (' + mode + ')'}); return; }
    const f = G.inside.f, fl = FIG_FLOORS[f], sx = G.inside.x, sy = G.inside.y;
    const key = f + '@' + sx + ',' + sy; if (seen.has(key)) return; seen.add(key);
    const isExit = exitsOf(fl), q = [[sx, sy]], vis = new Set([sx + ',' + sy]); let exits = 0;
    while (q.length) { const [x, y] = q.shift(); if (isExit(figTile(x, y))) exits++;
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const a = x + dx, c = y + dy, k = a + ',' + c; if (vis.has(k) || !figFree(a, c)) continue; vis.add(k); q.push([a, c]); } }
    // real key presses
    let moved = 0;
    for (const d of ['up','down','left','right']) { G.inside.x = sx; G.inside.y = sy; P.t = 0; P.mx = P.my = 0; DLG = null;
      for (const k in held) held[k] = false; held[d] = true; MODES.inside.update(); held[d] = false;
      if (mode === 'inside' && G.inside && (G.inside.x !== sx || G.inside.y !== sy)) moved++;
      if (mode !== 'inside') { moved++; setMode('inside'); }
      if (!G.inside) break; }
    let drawErr = ''; G.inside.x = sx; G.inside.y = sy; P.t = 0; if (mode !== 'inside') setMode('inside');
    for (const t of [0, 37]) { frame = t; try { MODES.inside.draw(); } catch (e) { drawErr = String(e).slice(0, 120) + ' @ ' + String(e.stack || '').split('\n')[1]; break; } }
    const bad = drawErr ? 'DRAWERR' : !moved ? 'STUCK' : !exits ? 'NOEXIT' : vis.size < 6 ? 'SMALL' : '';
    out.push({name, f, at:[sx, sy], tile: figTile(sx, sy), reach: vis.size, exits, moved, bad,
      derr: drawErr, rows: bad && !drawErr ? fl.rows.map((r, y) => y === sy ? r.slice(0, sx) + '@' + r.slice(sx + 1) : r) : undefined,
      npcs: bad && fl.room ? fl.room.npcs.filter(n => Math.abs(n.x - sx) + Math.abs(n.y - sy) <= 2).map(n => [n.folk, n.x, n.y]) : undefined });
  };
  for (const [n, h] of enterers) probe(n, h);
  return out;
}"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1152, 'height': 864}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    BAD = 0
    for h in HOURS:
        pg.goto('http://127.0.0.1:8766/index.html?sun=%d&season=summer' % (h * 100 // 24)); pg.wait_for_timeout(2500)
        res = pg.evaluate(CHECK, h)
        bad = [r for r in res if r.get('bad')]
        print('hour', h, 'places', len(res), 'not entered', sum(1 for r in res if r.get('note')), 'bad', len(bad))
        for r in bad:
            BAD += 1; print(' ', r['bad'], r['name'], r.get('f'), r.get('at'), 'tile', r.get('tile'), 'reach', r.get('reach'), 'exits', r.get('exits'), r.get('npcs'), r.get('e', ''), r.get('derr', ''))
            if r.get('rows'): print('    ' + '\n    '.join(r['rows']))
        lib = [r for r in res if 'Library' in r['name']]
        print('  library:', [(r.get('f'), r.get('at'), r.get('reach'), r.get('exits'), r.get('moved')) for r in lib])
    print('BAD', BAD); print('errors', errs[:5])
