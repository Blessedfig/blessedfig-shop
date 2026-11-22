"use strict";
// =====================================================================
//  THE FIELD MENU (FF6's main menu): ITEMS, SKILLS, EQUIP, STATUS, ORDER, BESTIARY, BATTLE LAB, CONFIG, SAVE.
//  Opens with the MENU key (C or Q, a gamepad's Start) from the town or any room. Every list ends in a way back.
//  The BATTLE LAB tries any fight at any level and then puts the party back exactly as it was.
// =====================================================================
let PMN = null;
const PM_CMDS = ['ITEMS', 'SKILLS', 'EQUIP', 'STATUS', 'ORDER', 'BESTIARY', 'BATTLE LAB', 'CONFIG', 'SAVE', 'CLOSE'];
function pmOpen(ret) { partyEnsure(); PMN = { ret: ret || mode, view: { kind: 'main', sel: 0 }, stack: [] }; setMode('pmenu'); }
function pmClose() { const r = PMN ? PMN.ret : 'walk'; PMN = null; saveGame(); setMode(r || 'walk'); }
function pmPush(v) { PMN.stack.push(PMN.view); PMN.view = v; }
function pmBack() { PMN.view = PMN.stack.pop() || null; if (!PMN.view) pmClose(); }
function pmList(title, rows, opt) { pmPush(Object.assign({ kind: 'list', title, rows, sel: 0, top: 0 }, opt || {})); }
function pmMsg(text) { pmPush({ kind: 'msg', text }); }
function pmWho(title, f) { pmList(title, partyIds().map(id => ({ t: memberName(id), right: 'LV ' + G.party.m[id].lv, f: () => f(id) }))); }
// ---------- the commands ----------
function pmDo(c) {
  if (c === 'ITEMS') return pmItems();
  if (c === 'SKILLS') return pmWho('SKILLS: WHOSE?', pmSkills);
  if (c === 'EQUIP') return pmWho('EQUIP: WHO?', pmEquip);
  if (c === 'STATUS') return pmPush({ kind: 'status', i: 0 });
  if (c === 'ORDER') return pmOrder();
  if (c === 'BESTIARY') return pmBest();
  if (c === 'BATTLE LAB') return pmLab();
  if (c === 'CONFIG') return pmConfig();
  if (c === 'SAVE') { saveGame(); return pmMsg('Saved.'); }
  return pmClose();
}
function pmItems() {
  const ids = Object.keys(G.bag || {}).filter(id => battleItemDef(id) || GEAR[id]);
  if (!ids.length) return pmMsg('No battle items or gear yet. The Fig Tree\'s snack shelf and apothecary sell some.');
  pmList('ITEMS', ids.map(id => { const d = battleItemDef(id), g = GEAR[id];
    return { t: d ? d.name : g.name, right: 'x' + G.bag[id], desc: d ? d.desc : g.desc + ' (Wear it from EQUIP.)', ok: !!(d && d.field),
      f: () => { if (!d || !d.field) return pmMsg(g ? 'Wear it from EQUIP.' : 'That one is for battle.'); fieldUse(d, id); } }; }));
}
function fieldUse(d, itemId, fromId) {   // an item or skill used outside battle
  const apply = ids => { const out = []; for (const id of ids) out.push(...fieldApply(d, id)); if (itemId) bagTake(itemId); if (fromId) G.party.m[fromId].cl = clOf(fromId) - skillCost(null, d); saveGame(); pmBack(); if (itemId && PMN.view && PMN.view.kind === 'list') { pmBack(); pmItems(); } pmMsg(out.join(' ') || 'Nothing changed.'); };
  if (d.tgt === 'allies') return apply(partyIds());
  if (d.tgt === 'self' && fromId) return apply([fromId]);
  pmWho('USE ' + d.name.toUpperCase() + ' ON?', id => apply([id]));
}
function fieldApply(d, id) {
  const M = G.party.m[id], st = memberStats(id), out = [];
  for (const p of d.fx) {
    const k = typeof p === 'string' ? p : p.k;
    if (k === 'heal') { const before = hpOf(id), n = p.full ? st.hpMax : p.flat || healRoll(p.p, st.heal); M.hp = Math.min(st.hpMax, before + n); if (M.hp >= st.hpMax) M.hp = null; out.push(memberName(id) + ' +' + (hpOf(id) - before) + ' HP.'); }
    if (k === 'clarity') { const before = clOf(id); M.cl = p.full ? null : Math.min(st.clMax, before + p.n); out.push(memberName(id) + ' +' + (clOf(id) - before) + ' Clarity.'); }
  }
  return out;
}
function pmSkills(id) {
  const L = memberSkills(id).map(s => { const sk = SKILLS[s], c = sk.cost || 0;
    return { t: sk.name, right: c ? c + ' CL' : '', desc: sk.desc + (sk.seq ? '  ' + sk.seq.map(d => B_ARROW[d]).join(' ') : ''), ok: !!sk.field,
      f: () => { if (!sk.field) return pmMsg(sk.name + ': ' + sk.desc); if (clOf(id) < c) return pmMsg('Not enough Clarity.'); fieldUse(sk, null, id); } }; });
  if (id === 'christian') L.push({ t: 'SECTIONS', right: memberSections(id).length + '/8', desc: 'The shelves Christian can RECOMMEND from.', f: () => pmMsg('RECOMMEND from: ' + memberSections(id).map(s => SECTIONS[s]).join(', ') + '. More come with levels, and with the books in town.') });
  pmList(memberName(id) + ': SKILLS', L);
}
function pmEquip(id) {
  const M = G.party.m[id], slots = [['hand', 'HAND'], ['body', 'BODY'], ['m1', 'BOOKMARK 1'], ['m2', 'BOOKMARK 2']];
  pmList(memberName(id) + ': EQUIP', slots.map(([s, lab]) => ({ t: lab, right: M.gear[s] ? GEAR[M.gear[s]].name : '-', desc: M.gear[s] ? GEAR[M.gear[s]].desc : 'Empty.',
    f: () => { const want = s === 'm1' || s === 'm2' ? 'mark' : s;
      const have = Object.keys(G.bag || {}).filter(g => GEAR[g] && GEAR[g].slot === want && canEquip(id, g));
      const rows = have.map(g => ({ t: GEAR[g].name, right: gearDelta(id, s, g), desc: GEAR[g].desc, f: () => { equip(id, s, g); saveGame(); pmBack(); pmBack(); pmEquip(id); } }));
      if (M.gear[s]) rows.unshift({ t: '(take it off)', right: '', desc: 'Back in the bag.', f: () => { equip(id, s, null); saveGame(); pmBack(); pmBack(); pmEquip(id); } });
      if (!rows.length) return pmMsg('Nothing in the bag fits there.');
      pmList(lab + ': CHOOSE', rows); } })));
}
function gearDelta(id, slot, g) {   // what changes if this is worn: the first stat it moves
  const M = G.party.m[id], old = M.gear[slot], a = memberStats(id); M.gear[slot] = g; const b = memberStats(id); M.gear[slot] = old;
  for (const k of ['atk', 'mag', 'def', 'res', 'hpMax', 'spd', 'heal']) if (a[k] !== b[k]) return STAT_LABEL[k] + ' ' + (b[k] > a[k] ? '+' : '') + (b[k] - a[k]);
  return GEAR[g].flag || GEAR[g].blocks ? 'RULE' : '';
}
function pmOrder() {
  pmList('ORDER AND ROWS', partyIds().map((id, i) => ({ t: memberName(id), right: (G.party.m[id].row || CLASSES[id].row).toUpperCase() + ' ROW', desc: 'A: switch rows. The back row takes and deals half physical damage.',
    f: () => { const M = G.party.m[id]; M.row = (M.row || CLASSES[id].row) === 'front' ? 'back' : 'front'; saveGame(); pmBack(); pmOrder(); PMN.view.sel = i; } })));
}
function pmBest() {
  const rows = [];
  for (const [g, ids] of FOE_GROUPS) for (const fid of ids) { const b = G.party.best[fid], f = FOES[fid];
    rows.push({ t: b && b.seen ? f.name : '?????', right: g.toUpperCase().slice(0, 12), desc: b && b.seen ? f.arch : 'Not met yet. (A: try it in the lab)', fid }); }
  pmList('BESTIARY', rows.map((r, i) => Object.assign(r, { f: () => pmPush({ kind: 'best', i, list: rows }) })));
}
function pmLab() {
  const rows = [];
  for (const [g, ids] of FOE_GROUPS) rows.push({ t: g.toUpperCase(), right: ids.length + '', desc: 'Fights in this group.', f: () => pmList('LAB: ' + g.toUpperCase(),
    ids.map(fid => ({ t: FOES[fid].name, right: 'LV ' + FOES[fid].lv, desc: FOES[fid].arch, f: () => pmLabLevel('f_' + fid) }))
      .concat(Object.keys(SHELF_FORMS).filter(s => SHELF_FORMS[s].some(f => FORMATIONS[f].foes.some(x => ids.includes(x)) && ids.includes(FORMATIONS[s + '_boss'].foes[0])))
        .flatMap(s => SHELF_FORMS[s].slice(0, 3).map((f, i) => ({ t: 'GROUP ' + (i + 1) + ': ' + FORMATIONS[f].foes.map(x => FOES[x].name.split(' ').slice(-1)[0]).join(', '), right: '', desc: 'A group fight from this shelf.', f: () => pmLabLevel(f) }))))) });
  pmList('BATTLE LAB', rows, { note: 'Try any fight. The party goes back exactly as it was afterward.' });
}
function pmLabLevel(form) {
  const lvs = ['NOW', 1, 3, 5, 8, 10, 12, 15, 20, 30];
  pmList('LAB: AT WHAT LEVEL?', lvs.map(L => ({ t: L === 'NOW' ? 'AS THEY ARE NOW' : 'EVERYONE AT LEVEL ' + L, right: '', desc: 'Items: the lab lends a few of each.', f: () => labStart(form, L) })));
}
function labStart(form, L) {
  const snapP = JSON.stringify(G.party), snapB = JSON.stringify(G.bag || {});
  if (L !== 'NOW') for (const id of partyIds()) { const M = G.party.m[id]; M.lv = L; M.und = RULES.need(L); M.hp = M.cl = null; M.picks = []; }
  for (const k of ['figcookie', 'cocoa', 'peppermint', 'chamomile', 'letter']) G.bag[k] = Math.max(G.bag[k] || 0, 3);
  battleStart(form, { practice: true, ret: 'pmenu', onEnd: () => { G.party = JSON.parse(snapP); G.bag = JSON.parse(snapB); saveGame(); } });
}
const CFG_ROWS = [
  ['atb', 'BATTLE MODE', ['wait', 'active'], { wait: 'WAIT', active: 'ACTIVE' }, 'WAIT: time stops while you choose. ACTIVE: it keeps running (FF6).'],
  ['speed', 'BATTLE SPEED', [1, 2, 3, 4, 5, 6], null, 'How fast the time gauges fill. 3 is the default.'],
  ['timing', 'TIMED PRESSES', ['on', 'assist', 'off'], { on: 'ON', assist: 'ASSIST', off: 'OFF' }, 'ON: press A as a hit lands, or as one comes at you. ASSIST: always a good press. OFF: no presses.'],
  ['roll', 'ROLLING HP', [1, 0], { 1: 'ON', 0: 'OFF' }, 'ON: HP rolls down after a hit (EarthBound), so a fast heal can still save someone.'],
  ['challenge', 'CHALLENGE', ['gentle', 'medium', 'hard'], { gentle: 'GENTLE', medium: 'MEDIUM', hard: 'HARD' }, 'GENTLE also heals the party after every fight. MEDIUM is the standard.'],
  ['msg', 'MESSAGES', [0, 1, 2], { 0: 'FAST', 1: 'NORMAL', 2: 'SLOW' }, 'How long battle messages stay up. A always hurries them.'],
  ['order', 'TURN ORDER', [1, 0], { 1: 'SHOWN', 0: 'HIDDEN' }, 'A bar that shows who acts next (Grandia, FFX).'],
];
function pmConfig() {
  const C = G.party.cfg;
  pmList('CONFIG', CFG_ROWS.map(([k, lab, vals, names, desc], i) => ({ t: lab, right: String(names ? names[C[k]] : C[k]), desc,
    f: () => { const j = vals.indexOf(C[k]); C[k] = vals[(j + 1) % vals.length]; saveGame(); const sel = PMN.view.sel; pmBack(); pmConfig(); PMN.view.sel = sel; } })));
}
// ---------- the mode ----------
MODES.pmenu = {
  update() {
    if (!PMN) { setMode('walk'); return; }
    const V = PMN.view;
    if (V.kind === 'main') {
      if (pressed.up) V.sel = (V.sel + PM_CMDS.length - 1) % PM_CMDS.length; if (pressed.down) V.sel = (V.sel + 1) % PM_CMDS.length;
      if (pressed.b || pressed.menu) return pmClose(); if (pressed.a) return pmDo(PM_CMDS[V.sel]); return;
    }
    if (V.kind === 'list') {
      const n = V.rows.length; if (!n) { if (pressed.a || pressed.b) pmBack(); return; }
      if (pressed.up) V.sel = (V.sel + n - 1) % n; if (pressed.down) V.sel = (V.sel + 1) % n;
      if (V.sel < V.top) V.top = V.sel; if (V.sel >= V.top + 12) V.top = V.sel - 11;
      if (V.onLR && (pressed.left || pressed.right)) return V.onLR(V.sel);
      if (pressed.b) return pmBack(); if (pressed.a && V.rows[V.sel].f) return V.rows[V.sel].f(); return;
    }
    if (V.kind === 'status') {
      const ids = partyIds(); if (pressed.left || pressed.up) V.i = (V.i + ids.length - 1) % ids.length; if (pressed.right || pressed.down) V.i = (V.i + 1) % ids.length;
      const id = ids[V.i], M = G.party.m[id];
      if (pressed.a && M.picks.length) return pmList(memberName(id) + ': WHAT GREW?', Object.keys(LEVEL_PICKS).map(k => ({ t: LEVEL_PICKS[k].name, right: '', desc: LEVEL_PICKS[k].desc, f: () => { applyPick(id, k); M.picks.shift(); saveGame(); pmBack(); } })));
      if (pressed.b) pmBack(); return;
    }
    if (V.kind === 'best') {
      const n = V.list.length; if (pressed.left || pressed.up) V.i = (V.i + n - 1) % n; if (pressed.right || pressed.down) V.i = (V.i + 1) % n;
      if (pressed.a) return pmLabLevel('f_' + V.list[V.i].fid); if (pressed.b) pmBack(); return;
    }
    if (V.kind === 'msg') { if (pressed.a || pressed.b) pmBack(); }
  },
  draw() {
    const g = ctx.createLinearGradient(0, 0, 0, SH); g.addColorStop(0, '#10143a'); g.addColorStop(1, '#06081a'); ctx.fillStyle = g; ctx.fillRect(0, 0, SW, SH);
    if (!PMN) return; const V = PMN.view;
    pmDrawMain(V.kind === 'main' ? V.sel : -1);
    if (V.kind === 'list') pmDrawList(V);
    if (V.kind === 'status') pmDrawStatus(partyIds()[V.i]);
    if (V.kind === 'best') pmDrawBest(V.list[V.i].fid);
    if (V.kind === 'msg') { const L = wrap(V.text, SW - 60); win(20, SH / 2 - 10 - L.length * 6, SW - 40, L.length * 12 + 26); L.forEach((l, i) => txt(l, 30, SH / 2 - L.length * 6 + i * 12, '#fff')); txt('A: OK', SW - 30, SH / 2 + L.length * 6 + 2, '#ffd860', 'right', SMALL); }
  },
};
function pmPortrait(id, x, y, s) {   // the battle idle frame, small, feet at (x, y)
  const art = CLASSES[id].art;
  if (art === 'kid') { const g = G.kid && G.kid.g === 'girl' ? 'girl' : 'boy', K = KID_BPOSE[g], im = BIMG.kid[g]; if (im.complete && im.naturalWidth) { const w = K.w / K.k * s, h = K.h / K.k * s; ctx.imageSmoothingEnabled = true; ctx.drawImage(im, 0, 0, K.w, K.h, x - w / 2, y - h, w, h); ctx.imageSmoothingEnabled = false; } return; }
  if (String(art).startsWith('folk:')) { ctx.save(); ctx.translate(x, y); ctx.scale(1.3 * s, 1.3 * s); if (FOLKS[art.slice(5)]) drawFolk(art.slice(5), 0, 0, frame); ctx.restore(); return; }
  const key = POSES[art].idle, d = ART_PARTY_RECTS[key], r = d.r[(frame >> 4) % d.r.length]; if (!BIMG.party.complete) return;
  const w = r[2] / d.k * s, h = r[3] / d.k * s; ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (POSE_FLIP[key]) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(BIMG.party, r[0], r[1], r[2], r[3], -w / 2, y - h, w, h); } else ctx.drawImage(BIMG.party, r[0], r[1], r[2], r[3], x - w / 2, y - h, w, h);
  ctx.restore(); ctx.imageSmoothingEnabled = false;
}
function pmDrawMain(sel) {
  win(6, 6, 252, SH - 12);
  partyIds().forEach((id, i) => { const M = G.party.m[id], st = memberStats(id), y = 14 + i * 88;
    pmPortrait(id, 40, y + 66, 0.95);
    txt(memberName(id), 72, y + 8, '#fff'); txt(CLASSES[id].title, 72, y + 20, '#a8c8ff', 'left', SMALL);
    txt('LV ' + M.lv, 200, y + 8, '#ffd860');
    txt('HP ' + hpOf(id) + '/' + st.hpMax, 72, y + 34, '#fff', 'left', SMALL); txt('CL ' + clOf(id) + '/' + st.clMax, 160, y + 34, '#a8c8ff', 'left', SMALL);
    const nx = M.lv < RULES.levelCap ? RULES.need(M.lv + 1) - M.und : 0; txt('NEXT LEVEL: ' + nx + ' UNDERSTANDING', 72, y + 46, '#c8c8e8', 'left', SMALL);
    txt((M.row || CLASSES[id].row).toUpperCase() + ' ROW', 72, y + 58, '#8a8ab8', 'left', SMALL);
    if (M.picks.length) txt(M.picks.length + ' PICK' + (M.picks.length > 1 ? 'S' : '') + ' WAITING (STATUS)', 150, y + 58, '#ffd860', 'left', SMALL); });
  win(264, 6, SW - 270, 152);
  PM_CMDS.forEach((c, i) => txt((i === sel ? '▶ ' : '  ') + c, 272, 14 + i * 14, i === sel ? '#ffd860' : '#fff', 'left', c.length > 9 ? SMALL : FONT));
  win(264, 164, SW - 270, 52); txt('LOOSE PAGES', 272, 172, '#c8c8e8', 'left', SMALL); txt(String(G.party.pages || 0), SW - 14, 184, '#fff', 'right');
  if (typeof cash === 'function') { txt('CASH', 272, 198, '#c8c8e8', 'left', SMALL); txt(money(cash()), SW - 14, 198, '#fff', 'right', SMALL); }
  win(264, 222, SW - 270, SH - 228); const C = G.party.cfg; txt(C.atb === 'wait' ? 'WAIT MODE' : 'ACTIVE MODE', 272, 230, '#a8c8ff', 'left', SMALL); txt('SPEED ' + C.speed + '  ' + C.challenge.toUpperCase(), 272, 242, '#a8c8ff', 'left', SMALL); txt('PRESSES ' + C.timing.toUpperCase(), 272, 254, '#a8c8ff', 'left', SMALL);
}
function pmDrawList(V) {
  win(24, 16, SW - 48, SH - 32); txt(V.title, 36, 24, '#ffd860');
  const rows = V.rows.slice(V.top, V.top + 12);
  rows.forEach((r, k) => { const i = V.top + k, on = i === V.sel; txt((on ? '▶ ' : '  ') + r.t, 36, 42 + k * 15, r.ok === false && !on ? '#9a9ab8' : on ? '#ffd860' : '#fff', 'left', r.t.length > 24 ? SMALL : FONT); if (r.right) txt(r.right, SW - 36, 42 + k * 15, '#a8c8ff', 'right', SMALL); });
  if (V.rows.length > 12) txt((V.top + 1) + '-' + Math.min(V.rows.length, V.top + 12) + ' OF ' + V.rows.length, SW - 36, 24, '#8a8ab8', 'right', SMALL);
  const d = V.rows[V.sel] && V.rows[V.sel].desc || V.note; if (d) { const L = wrap(d, SW - 72, SMALL).slice(0, 3); L.forEach((l, i) => txt(l, 36, SH - 50 + i * 9, '#c8c8e8', 'left', SMALL)); }
}
function pmDrawStatus(id) {
  const M = G.party.m[id], C = CLASSES[id], a = memberAttrs(id), st = memberStats(id);
  win(14, 14, SW - 28, SH - 28); pmPortrait(id, 54, 100, 1.2);
  txt(C.name, 96, 24, '#fff'); txt(C.title + '   LV ' + M.lv, 96, 36, '#ffd860', 'left', SMALL);
  txt('UNDERSTANDING ' + M.und + (M.lv < RULES.levelCap ? '  (NEXT AT ' + RULES.need(M.lv + 1) + ')' : ''), 96, 48, '#c8c8e8', 'left', SMALL);
  ATTRS.forEach((k, i) => { const y = 64 + i * 12, tr = Math.min(RULES.statCapTrain, M.train[k] || 0); txt(k, 96, y, '#a8c8ff', 'left', SMALL); txt(String(a[k]), 150, y, '#fff', 'right', SMALL); if (tr) txt('+' + tr + ' TRAINED', 158, y, '#7ae87a', 'left', SMALL); });
  const D = ['hpMax', 'clMax', 'atk', 'mag', 'def', 'res', 'heal', 'spd', 'acc', 'eva', 'crit', 'sres'];
  D.forEach((k, i) => { const y = 64 + (i % 6) * 12, x = 236 + Math.floor(i / 6) * 70; txt(STAT_LABEL[k].slice(0, 4), x, y, '#a8c8ff', 'left', SMALL); txt(String(st[k]), x + 60, y, '#fff', 'right', SMALL); });
  ['hand', 'body', 'm1', 'm2'].forEach((s, i) => txt(['HAND', 'BODY', 'MARK', 'MARK'][i] + '  ' + (M.gear[s] ? GEAR[M.gear[s]].name : '-'), 28, 156 + i * 12, '#fff', 'left', SMALL));
  const L = wrap(ATTR_INFO.STR.split('.')[0] ? 'Attributes come from the class and its level, the picks made at each level, and training at UMA (up to +12 each). Gear and bookmarks add on top.' : '', SW - 60, SMALL);
  L.forEach((l, i) => txt(l, 28, 210 + i * 9, '#8a8ab8', 'left', SMALL));
  txt(M.picks.length ? 'A: CHOOSE A LEVEL PICK (' + M.picks.length + ' WAITING)' : '← → OTHER MEMBERS   B: BACK', SW / 2, SH - 30, M.picks.length ? '#ffd860' : '#8a8ab8', 'center', SMALL);
}
function pmDrawBest(fid) {
  const f = FOES[fid], b = G.party.best[fid] || {}, seen = b.seen > 0;
  win(14, 14, SW - 28, SH - 28);
  const fake = { f, id: fid, slot: 0, seen: {}, seenRes: {} }; const A = foeArt(fake);
  if (A && seen) { ctx.save(); if (!seen) ctx.filter = 'brightness(0)'; ctx.imageSmoothingEnabled = !!A.smooth; const s = Math.min(1, 120 / A.w, 120 / A.h); ctx.drawImage(A.im, A.sx, A.sy, A.sw, A.sh, 80 - A.w * s / 2, 150 - A.h * s, A.w * s, A.h * s); ctx.restore(); ctx.imageSmoothingEnabled = false; }
  else if (!seen) txt('?', 80, 100, '#6a6a8a', 'center');
  txt(seen ? f.name : '?????', 156, 26, '#fff', 'left', f.name.length > 22 ? SMALL : FONT);
  txt(seen ? f.arch : '', 156, 40, '#ffd860', 'left', SMALL); txt('LV ' + f.lv + (f.boss ? '   BOSS' : ''), 156, 52, '#a8c8ff', 'left', SMALL);
  const w = f.weak.map(a => b.weak && b.weak[a] ? ASPECTS[a] : '???').join(', '), r = f.resist.filter(a => b.res && b.res[a]).map(a => ASPECTS[a]).join(', ');
  txt('WEAK: ' + (w || '-'), 156, 68, '#fff', 'left', SMALL); txt('RESISTS: ' + (r || (f.resist.length ? '???' : '-')), 156, 80, '#fff', 'left', SMALL);
  txt('NEEDS: ' + (b.need ? f.need.map(s => SECTIONS[s]).join(' OR ') : '???'), 156, 92, '#fff', 'left', SMALL);
  txt('MET ' + (b.seen || 0) + '   FREED ' + (b.freed || 0) + '   UNDERSTOOD ' + (b.und || 0), 156, 108, '#c8c8e8', 'left', SMALL);
  if (f.rule && seen) wrap('RULE: ' + f.rule.tell, SW - 60, SMALL).slice(0, 3).forEach((l, i) => txt(l, 28, 164 + i * 9, '#ffb0b0', 'left', SMALL));
  if (b.und) wrap(f.named, SW - 60, SMALL).slice(0, 3).forEach((l, i) => txt(l, 28, 196 + i * 9, '#e8e8ff', 'left', SMALL));
  txt('← → MORE   A: TRY IT IN THE LAB   B: BACK', SW / 2, SH - 30, '#8a8ab8', 'center', SMALL);
}
