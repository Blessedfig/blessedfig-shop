"use strict";
// =====================================================================
//  THE BATTLE ENGINE.
//  battleStart(formationId | {foes:[ids], bg, boss, noEscape, practice}, {onWin, onLose, first, ret})
//  - Time gauges (FF6 ATB): every unit's gauge fills by SPD; a full gauge is a turn. WAIT stops time while a menu is open;
//    ACTIVE keeps it running. Time always stops while an action plays.
//  - An action is a skill (or item) aimed at targets; it runs as stages: name -> input (techniques, cheers) -> move ->
//    impact (timed press windows) -> return. Its effects are pieces from FX, applied in order.
//  - Foes choose from their AI rules (data_foes.js). Bosses have one readable rule (FOES[id].rule).
//  - Freed, not slain: at 0 HP a foe lets go. Freed with understanding (a weakness, OPEN, or the right book) pays +50%.
// =====================================================================
let BT = null;
// ---------- units ----------
function unitFromMember(id, slot) {
  const C = CLASSES[id], M = G.party.m[id], st = memberStats(id), fl = memberFlags(id);
  return { side: 'p', id, name: memberName(id), C, slot, lv: M.lv, st, hp: hpOf(id), hpShown: hpOf(id), cl: clOf(id), atb: 0, status: {},
    flags: fl.flags, blocks: fl.blocks, row: M.row || C.row, pose: 'idle', poseT: 0, dx: 0, lifeUsed: 0, last: null };
}
function foeStats(f, n) {
  const L = f.lv, m = f.m || {}, ch = RULES.challenge[pcfg().challenge] || RULES.challenge.medium, ps = f.practice ? 1 : RULES.partyScale(n);
  return { hpMax: Math.round((50 + 22 * L) * (m.hp || 1) * (f.boss ? 3.2 : 1) * ch.hp * ps), clMax: 0,
    atk: Math.round((6 + 2.4 * L) * (m.atk || 1)), mag: Math.round((6 + 2.4 * L) * (m.mag || 1)),
    def: Math.round((3 + 1.6 * L) * (m.def || 1)), res: Math.round((3 + 1.6 * L) * (m.res || 1)), heal: 4 + L,
    spd: Math.round((6 + 0.6 * L) * (m.spd || 1)), acc: 95, eva: 3 + (L >> 1), crit: 3, sres: Math.min(60, 10 + 2 * L) };
}
function unitFromFoe(fid, slot, n) {
  const f = FOES[fid], st = foeStats(f, n), b = bestNote(fid);
  return { side: 'f', id: fid, f, name: f.name, slot, lv: f.lv, st, hp: st.hpMax, hpShown: st.hpMax, atb: 0, status: {},
    guard: f.guard, guardMax: f.guard, turn: 0, counter: (f.rule && f.rule.countdown) || 0, grow: 0, lastAspect: null,
    seen: Object.assign({}, b.weak), seenRes: Object.assign({}, b.res), scanned: b.scan, flash: 0, shake: 0, fade: 0, freed: 0, understood: 0 };
}
// a stat in battle: the unit's stats with its statuses on top
function bS(u, k) {
  let v = u.st[k];
  for (const id in u.status) { const d = STATUSES[id]; if (d && d.mods) for (const m of d.mods) if (m.s === k) { if (m.add) v += m.add; if (m.mul) v *= m.mul; } }
  if (u.grow && (k === 'atk' || k === 'mag')) v *= 1 + u.grow;
  return v;
}
const alive = u => !u.freed && !u.status.dazed;
const partyUnits = () => BT.units.filter(u => u.side === 'p');
const foeUnits = () => BT.units.filter(u => u.side === 'f');
const livingFoes = () => foeUnits().filter(alive);
const livingParty = () => partyUnits().filter(alive);
// ---------- starting ----------
function battleStart(form, opt) {
  partyEnsure(); opt = opt || {};
  const F = typeof form === 'string' ? Object.assign({ id: form }, FORMATIONS[form]) : form;
  const ids = partyIds(), units = [];
  ids.forEach((id, i) => units.push(unitFromMember(id, i)));
  const teams = teamBonuses(ids);   // who fights together (data_core.js TEAMS)
  for (const u of units) for (const T of teams) for (const m of T.mods) { applyMod(u.st, m); if (m.s === 'clMax') u.cl = Math.min(u.st.clMax, u.cl + (m.add || 0)); }
  F.foes.forEach((fid, i) => units.push(unitFromFoe(fid, i, ids.length)));
  BT = { F, units, t: 0, phase: 'intro', queue: [], ready: [], menu: null, act: null, msgs: [], msg: null, pops: [], fx: [],
    ret: opt.ret || mode, onWin: opt.onWin, onLose: opt.onLose, practice: !!(opt.practice || F.practice || F.foes.every(f => FOES[f].practice)),
    boss: !!F.boss, noEscape: !!F.noEscape, bg: F.bg || 'page', teams: [], flash: 0, shake: 0, log: [], freedOrder: [], introI: 0, first: opt.first || null };
  for (const u of units) {
    u.atb = RULES.atbStart();
    if (u.side === 'p' && (BT.first === 'party' || u.flags.firstFull)) u.atb = RULES.atbFull - 1;
    if (u.side === 'f' && BT.first === 'party') u.atb = 0;
    if (u.side === 'f' && BT.first === 'foes') u.atb = RULES.atbFull - 1;
    if (u.side === 'f') { const b = bestNote(u.id); b.seen++; if (partyFlag('seeWeak')) u.f.weak.forEach(a => u.seen[a] = 1); }
  }
  // the opening: each foe's intro, its rule if it has one, and who got the jump
  BT.teams = teams; BT.onEnd = opt.onEnd || null;
  const intro = []; const seenNames = {};
  if (teams.length) intro.push('Together: ' + teams.map(t => t.name).join(', ') + '.');
  for (const u of foeUnits()) { if (seenNames[u.id]) continue; seenNames[u.id] = 1; intro.push(...u.f.intro.slice(0, 2)); if (u.f.rule && u.f.rule.tell) intro.push('RULE: ' + u.f.rule.tell); }
  if (BT.first === 'party') intro.push('You caught it from behind. You move first!');
  if (BT.first === 'foes') intro.push('It caught you off guard!');
  BT.intro = intro;
  if (typeof SND !== 'undefined') SND.battle(BT.boss);
  setMode('battle');
}
// ---------- messages (the window at the top). Auto-advance by length and the MESSAGES setting; A hurries them. ----------
function bmsg(text, opt) { BT.msgs.push(Object.assign({ text, t: 0 }, opt || {})); }
function msgDur(m) { const sp = [0.6, 1, 1.4][pcfg().msg] || 1; return Math.round((40 + m.text.length * 1.6) * sp); }
// ---------- statuses ----------
function addStatus(u, id, ch, src) {
  if (!u || u.freed) return false; const d = STATUSES[id]; if (!d) return false;
  if (u.status.dazed && id !== 'dazed') return false;
  if (d.bad && u.side === 'p' && (u.blocks === 'all' || (u.blocks && u.blocks.includes(id)))) { pop(u, 'BLOCKED', '#c8c8ff'); return false; }
  if (d.bad && ch != null && ch < 1 && Math.random() > ch * (1 - Math.min(0.6, bS(u, 'sres') / 100))) { if (u.side === 'p') pop(u, 'RESISTED', '#c8c8ff'); return false; }
  u.status[id] = { t: d.turns || 0, fresh: 1, by: src || null };
  if (id !== 'dazed' && !d.oneHit) pop(u, d.name, d.col);
  return true;
}
function cureStatus(u, ids) {
  let n = 0; for (const id of Object.keys(u.status)) { const d = STATUSES[id]; if (id === 'dazed') continue; if (ids === 'bad' ? d.bad : ids.includes(id)) { delete u.status[id]; n++; } }
  return n;
}
function tickStatuses(u) {   // at the end of the unit's own turn
  for (const id of Object.keys(u.status)) {
    const s = u.status[id], d = STATUSES[id]; if (!d || d.perm || d.oneHit || id === 'open') continue;
    if (d.tick && alive(u)) { const n = Math.round(u.st.hpMax * d.tick.hpPct); if (n < 0) hurt(u, -n, null, '#b48ae0'); else healUnit(u, n); }
    if (s.fresh) { delete s.fresh; continue; }
    if (d.turns && --s.t <= 0) delete u.status[id];
  }
}
// ---------- hit points ----------
function pop(u, text, col, big) { BT.pops.push({ u, text: String(text), col: col || '#fff', t: 0, big: !!big, dy: BT.pops.filter(p => p.u === u && p.t < 30).length * 10 }); }
function hurt(u, n, from, col) {
  u.hp = Math.max(u.side === 'p' ? -9999 : 0, u.hp - n); pop(u, n, col || '#ffffff', true);
  if (u.side === 'f') { u.flash = 8; u.shake = 10; } else { u.pose = 'hurt'; u.poseT = 24; BT.shake = 6; }
  if (u.status.absorbed && STATUSES.absorbed.wakeOnHit) delete u.status.absorbed;
  if (u.side === 'p' && !pcfg().roll) u.hpShown = Math.max(0, u.hp);
  if (u.side === 'f' && u.hp <= 0) freeFoe(u);
}
function healUnit(u, n) { if (!u || u.freed || u.status.dazed) return 0; const before = u.hp; u.hp = Math.min(u.st.hpMax, Math.max(0, u.hp) + n); const g = u.hp - Math.max(0, before); pop(u, g, '#7ae87a', true); if (u.side === 'p' && (!pcfg().roll || u.hpShown < u.hp)) u.hpShown = Math.max(u.hpShown, Math.min(u.hp, u.hpShown + g)); return g; }
function freeFoe(u) {
  if (u.freed) return; u.freed = 1; u.fade = 1; u.hp = 0;
  u.understood = u.understood || !!(u.lastWeak || u.status.open || u.rightBook);
  BT.freedOrder.push(u);
  const b = bestNote(u.id); b.freed++; if (u.understood) b.und++;
  bmsg(u.name + (u.understood ? ' lets go. Understood.' : ' lets go.'));
  if (typeof SND !== 'undefined') SND.play('free');
}
function daze(u) { // party member out: no death, only down
  if (u.flags.autoLife && !u.lifeUsed) { u.lifeUsed = 1; u.hp = u.hpShown = Math.round(u.st.hpMax * 0.25); pop(u, 'SECOND WIND', '#f0f0a0'); return; }
  u.status = { dazed: { t: 0 } }; u.hp = 0; u.hpShown = 0; u.atb = 0; u.ready = 0; u.pose = 'ko';
  BT.ready = BT.ready.filter(r => r !== u); if (BT.menu && BT.menu.u === u) BT.menu = null;
  BT.queue = BT.queue.filter(a => a.u !== u);
  bmsg(u.name + ' is dazed.');
}
// ---------- effect pieces. c: {act, u, t, sk, hit, mult}. Add a new piece here and use it from any skill or item. ----------
const FX = {
  dmg(c) {
    const { u, t, sk } = c; if (!alive(t)) return;
    const kind = sk.kind || 'mind', aspects = [].concat(sk.aspect || (kind === 'phys' ? 'force' : 'question'));
    let aspect = aspects[0];
    if (t.side === 'f') { const w = aspects.find(a => a !== 'book' && t.f.weak.includes(a)); if (w) aspect = w; else if (aspects.includes('book') && c.act.section) aspect = 'book'; }
    if (kind === 'phys' && Math.random() > RULES.hitChance({ st: { acc: bS(u, 'acc') } }, { st: { eva: bS(t, 'eva') } }, kind)) { pop(t, 'MISS', '#c8c8c8'); return; }
    let A = kind === 'phys' ? bS(u, 'atk') : bS(u, 'mag'); let D = kind === 'phys' ? bS(t, 'def') : bS(t, 'res');
    if (c.act.partners) A = (A + c.act.partners.reduce((s2, p) => s2 + (kind === 'phys' ? bS(p, 'atk') : bS(p, 'mag')), 0)) * (0.6 + 0.05 * c.act.partners.length);
    if (c.pierce) D *= 1 - c.pierce;
    let M = c.mult || 1, weakHit = false, tag = null;
    if (t.side === 'f') {
      const f = t.f;
      if (aspect === 'book') {
        if (f.need.includes(c.act.section)) { M *= 2; weakHit = true; t.rightBook = 1; tag = 'JUST WHAT IT NEEDED'; bestNote(t.id).need = 1; }
        else M *= 0.7;
      } else if (f.weak.includes(aspect)) { M *= RULES.mult.weak; weakHit = true; t.seen[aspect] = 1; bestNote(t.id).weak[aspect] = 1; }
      else if (f.resist.includes(aspect)) { M *= RULES.mult.resist; t.seenRes[aspect] = 1; bestNote(t.id).res[aspect] = 1; tag = 'RESISTED'; }
      if (f.rule && f.rule.adapt && t.lastAspect === aspect) { M *= 0.25; tag = 'IT SAW THAT COMING'; }
      if (t.status.open) M *= RULES.mult.open;
      if (f.absorb && f.absorb.includes(aspect)) { const h = dmgRoll(sk.power || 8, A, D, M); healUnit(t, h); pop(t, 'IT LIKES THAT', '#e8a8c8'); return; }
      t.lastAspect = aspect;
      if (f.rule && f.rule.shrink && aspect === 'name') { t.st.res = Math.max(1, Math.round(t.st.res * 0.6)); tag = 'IT SHRINKS'; }
      if (f.rule && f.rule.grow && aspect === 'name' && t.grow) { t.grow = 0; tag = 'NAMED, IT STOPS GROWING'; }
      if (f.rule && f.rule.countdown && (aspect === 'reflect' || aspect === 'step')) { t.counter = Math.min(f.rule.countdown, t.counter + 1); tag = 'THE HANDS SLOW'; }
    }
    if (u.status.focused) { M *= RULES.mult.focused; delete u.status.focused; }
    if (u.side === 'f' && u.status.softened) { M *= RULES.mult.softened; delete u.status.softened; }
    if (t.status.guarding) M *= RULES.mult.guard;
    if (kind === 'phys' && ((u.side === 'p' && u.row === 'back') || (t.side === 'p' && t.row === 'back'))) M *= RULES.mult.backRow;
    if (u.side === 'p' && u.flags.physUp && kind === 'phys') M *= 1.25;
    if (u.side === 'p' && u.flags.mindUp && kind === 'mind') M *= 1.25;
    if (u.side === 'f') M *= (RULES.challenge[pcfg().challenge] || RULES.challenge.medium).dmg;
    if (c.block) M *= c.block;
    let crit = false; if (kind === 'phys' && Math.random() < RULES.critChance({ st: { crit: bS(u, 'crit') } })) { M *= RULES.mult.crit; crit = true; }
    let n = dmgRoll(sk.power || 0, A, D, M);
    // SPOT: hits meant for a covered ally go to the spotter
    if (t.side === 'p' && t.status.covered && t.status.covered.by && alive(t.status.covered.by) && t.status.covered.by !== t) { const sp = t.status.covered.by; pop(t, 'SPOTTED', '#a8d8a8'); c.t = sp; return FX.dmg(Object.assign({}, c, { t: sp, block: null })); }
    c.dealt = (c.dealt || 0) + n;
    hurt(t, n, u);
    if (crit) pop(t, 'CRITICAL', '#ffe080');
    if (tag) pop(t, tag, '#e8e8ff');
    if (t.side === 'f') {
      t.lastWeak = weakHit;
      const brk = (weakHit ? 1 : 0) + (c.hit === 0 ? (sk.brk || 0) : 0);
      if (brk && t.guard > 0 && !t.freed) { t.guard = Math.max(0, t.guard - brk); if (t.guard === 0) { t.status.open = { t: RULES.openTurns }; pop(t, 'OPEN!', '#ffffff', true); BT.flash = 6; if (typeof SND !== 'undefined') SND.play('break'); } }
      if (weakHit && typeof SND !== 'undefined') SND.play('weak');
    }
    // counters: Danny's BASE, the Rebuttal bookmark, a boss's rule
    if (!t.freed && alive(t) && u !== t && !c.act.counter) {
      if (kind === 'phys' && t.status.based) { delete t.status.based; BT.queue.unshift({ u: t, sk: SKILLS[t.C.strike], tgts: [u], counter: 1 }); }
      else if (kind === 'phys' && t.side === 'p' && t.flags.counter && Math.random() < 0.4) BT.queue.unshift({ u: t, sk: SKILLS[t.C.strike], tgts: [u], counter: 1 });
      const r = t.side === 'f' && t.f.rule && t.f.rule.counter;
      if (r && !t.status.open && (r.on === 'any' || r.on === aspect) && !(r.unless && t.status[r.unless])) BT.queue.unshift({ u: t, sk: FSKILLS[r.use], sid: r.use, tgts: [u], counter: 1 });
    }
  },
  heal(c, p) { const tg = p.to === 'self' ? c.u : c.t; if (!alive(tg)) return; let H = bS(c.u, 'heal'); if (c.act.partners) H = (H + c.act.partners.reduce((a, q) => a + bS(q, 'heal'), 0)) * 0.65;
    const n = p.full ? tg.st.hpMax : p.flat ? Math.round(p.flat * (c.mult || 1)) : healRoll(p.p, H, c.mult); healUnit(tg, n); },
  clarity(c, p) { if (p.to === 'party') { if (c.partyDone && c.partyDone.clarity) return; (c.partyDone = c.partyDone || {}).clarity = 1; return livingParty().forEach(q => FX.clarity(Object.assign({}, c, { t: q }), Object.assign({}, p, { to: null }))); }
    const tg = p.to === 'self' ? c.u : c.t; if (!tg || tg.side !== 'p' || !alive(tg)) return; const n = p.full ? tg.st.clMax : p.n; const b = tg.cl; tg.cl = Math.max(0, Math.min(tg.st.clMax, tg.cl + n)); if (tg.cl !== b) pop(tg, (n > 0 ? '+' : '') + (tg.cl - b) + ' CL', '#8ac8ff'); },
  status(c, p) {
    if (p.to === 'party') { if (c.act.partyDone && c.act.partyDone[p.id]) return; (c.act.partyDone = c.act.partyDone || {})[p.id] = 1; return livingParty().forEach(q => addStatus(q, p.id, 1, c.u)); }
    const tg = p.to === 'self' ? c.u : c.t; if (!tg || tg.freed) return;
    if (p.ch === 'rhythm') { if ((c.act.beats || 0) < 3) return; return addStatus(tg, p.id, 1, c.u); }
    addStatus(tg, p.id, p.ch == null ? 1 : p.ch, c.u);
  },
  cure(c, p) { const list = p.to === 'party' ? livingParty() : [p.to === 'self' ? c.u : c.t]; for (const tg of list) if (tg && cureStatus(tg, p.ids)) pop(tg, 'CLEARED', '#c8f0c8'); },
  revive(c, p) { const tg = c.t; if (!tg || !tg.status.dazed) return; delete tg.status.dazed; tg.hp = tg.hpShown = Math.max(1, Math.round(tg.st.hpMax * p.pct)); tg.pose = 'idle'; tg.atb = 0; pop(tg, 'BACK UP', '#f0f0a0', true); c.revived = 1; },
  scan(c, p) {
    const t = c.t; if (!t || t.side !== 'f') return; const f = t.f, b = bestNote(t.id);
    if (p.part === 'weak1') { const w = f.weak.find(a => !t.seen[a]); if (w) { t.seen[w] = 1; b.weak[w] = 1; bmsg('Its source shows a weak spot: ' + ASPECTS[w] + '.'); } return; }
    t.scanned = 1; b.scan = 1; b.need = 1; f.weak.forEach(a => { t.seen[a] = 1; b.weak[a] = 1; }); f.resist.forEach(a => { t.seenRes[a] = 1; b.res[a] = 1; });
    bmsg(t.name + ': HP ' + t.hp + '/' + t.st.hpMax + '. Weak to ' + (f.weak.map(a => ASPECTS[a]).join(', ') || 'nothing') + '. Needs ' + f.need.map(s => SECTIONS[s]).join(' or ') + '.');
  },
  atb(c, p) { const t = c.t; if (!alive(t) || t.ready) return; t.atb = Math.max(0, Math.min(RULES.atbFull - 1, t.atb + p.n)); },
  dispel(c) { const t = c.t; for (const id of Object.keys(t.status)) { const d = STATUSES[id]; if (d && !d.bad && id !== 'open') { delete t.status[id]; pop(t, 'STRIPPED', '#c8c8ff'); return; } } if (t.grow) { t.grow = 0; pop(t, 'STRIPPED', '#c8c8ff'); } },
  brk(c, p) { const t = c.t; if (t.side !== 'f' || !alive(t) || !t.guard) return; t.guard = Math.max(0, t.guard - p.n); if (!t.guard) { t.status.open = { t: RULES.openTurns }; pop(t, 'OPEN!', '#fff', true); } },
  weakOnly(c, p) {   // LISTEN, REFLECT, STEP BACK: they only hurt a foe that is weak to them (or that drinks them up)
    const t = c.t; if (!t || t.side !== 'f' || !alive(t)) return; const a = c.sk.aspect;
    if (t.f.absorb && t.f.absorb.includes(a)) { healUnit(t, Math.round(p.p * 2)); pop(t, 'IT LIKES THAT', '#e8a8c8'); return; }
    if (t.f.weak.includes(a) || (t.f.rule && t.f.rule.countdown && (a === 'reflect' || a === 'step'))) FX.dmg(Object.assign({}, c, { sk: Object.assign({}, c.sk, { power: p.p, kind: 'mind' }) }));
    else if (a === 'listen' && t.f.listen && !t.heard) { t.heard = 1; }
  },
  pierce(c, p) { c.pierce = p.pct; },
  cover(c) { const t = c.t; if (!t || t === c.u || !alive(t)) return; t.status.covered = { t: 3, fresh: 1, by: c.u }; pop(t, 'SPOTTED', '#a8d8a8'); },
  drain(c, p) { if (c.dealt) healUnit(c.u, Math.round(c.dealt * p.pct)); },
  flee(c) {
    if (BT.noEscape) { bmsg('There is no leaving this one.'); return; }
    const ps = livingParty().reduce((s, u) => s + bS(u, 'spd'), 0) / Math.max(1, livingParty().length), fs = livingFoes().reduce((s, u) => s + bS(u, 'spd'), 0) / Math.max(1, livingFoes().length);
    if (BT.practice || Math.random() < RULES.fleeChance(ps, fs)) { BT.fled = 1; bmsg('You close the book and step out.'); } else bmsg('The story holds on. You could not get away.');
  },
  savestate(c) { BT.saveState = partyUnits().map(q => ({ q, hp: q.hp, cl: q.cl, dz: !!q.status.dazed })); bmsg('Saved. Everyone\'s HP and Clarity are remembered.'); },
  loadstate(c) {
    if (!BT.saveState) { bmsg('There is no save state yet.'); return; }
    for (const s0 of BT.saveState) { const q = s0.q; if (s0.dz) continue; if (q.status.dazed) delete q.status.dazed; q.hp = Math.max(q.hp, s0.hp); q.hpShown = Math.max(q.hpShown, q.hp); q.cl = Math.max(q.cl, s0.cl); q.pose = 'idle'; pop(q, 'LOADED', '#a8f0ff'); }
    BT.saveState = null; },
  credits(c, p) { const t = c.t; if (!t || t.side !== 'f' || !alive(t)) return; if (t.hp <= t.st.hpMax * p.pct && !t.f.boss) { pop(t, 'THE END', '#ffffff', true); t.hp = 0; freeFoe(t); } else if (t.hp <= t.st.hpMax * p.pct * 0.5) { pop(t, 'THE END', '#ffffff', true); t.hp = 0; freeFoe(t); } },
  share(c) {   // SHARE THE LOAD: the party's HP evens out (as a share of each one's max), plus a little from the beat
    if (c.act.shared) return; c.act.shared = 1; const P = livingParty(); if (P.length < 2) return;
    const avg = P.reduce((a, q) => a + Math.max(0, q.hp) / q.st.hpMax, 0) / P.length, bonus = 0.03 * (c.act.beats || 0);
    for (const q of P) { const want = Math.round(q.st.hpMax * Math.min(1, avg + bonus)); if (want > q.hp) healUnit(q, want - Math.max(0, q.hp)); else if (want < q.hp) { q.hp = want; pop(q, 'SHARED', '#c8e8c8'); } } },
  none() {},
};
// ---------- choosing for the foes ----------
function foeTargets(u, fs) {
  const P = livingParty(); if (!P.length) return [];
  if (fs.tgt === 'self') return [u];
  if (fs.tgt === 'all') return P;
  if (fs.tgt === 'weakest') return [P.slice().sort((a, b) => a.hp / a.st.hpMax - b.hp / b.st.hpMax)[0]];
  const w = P.map(p => p.row === 'back' ? 1 : 2), sum = w.reduce((a, b) => a + b, 0); let r = Math.random() * sum;   // the front row draws more
  for (let i = 0; i < P.length; i++) { r -= w[i]; if (r <= 0) return [P[i]]; } return [P[0]];
}
function foeChoose(u) {
  const f = u.f; u.turn++;
  const big = f.skills.find(s => /_big$/.test(s));
  if (f.rule && f.rule.countdown) {
    u.counter--;
    if (u.counter <= 0) { u.counter = f.rule.countdown; return { u, sk: FSKILLS[big], sid: big, tgts: foeTargets(u, FSKILLS[big]) }; }
    if (u.counter === 1) u.tellNext = 1;
  }
  for (const r of f.ai) {
    if (r.every && u.turn % r.every !== 0) { if (r.every && (u.turn + 1) % r.every === 0 && r.use !== '_grow' && r.use === big) u.tellNext = 1; continue; }
    if (r.use === '_grow') { return { u, sk: { name: 'IT GROWS', line: u.name + ' feeds on the mystery. It grows.', tgt: 'self', fx: [{ k: 'grow' }] }, tgts: [u], grow: 1 }; }
    let sid = r.use;
    if (sid === 'random') { const pool = f.skills.filter(s => s !== big); sid = pool[Math.floor(Math.random() * pool.length)]; }
    const fs = FSKILLS[sid]; if (!fs) continue;
    return { u, sk: fs, sid, tgts: foeTargets(u, fs) };
  }
  return null;
}
// ---------- the clock ----------
function tickATB() {
  for (const u of BT.units) {
    if (!alive(u) || u.ready || u.queued) continue;
    let rate = RULES.atbFill(bS(u, 'spd'), pcfg().speed);
    for (const id in u.status) { const d = STATUSES[id]; if (d && d.atb) rate *= d.atb; }
    u.atb += rate;
    if (u.atb >= RULES.atbFull) { u.atb = RULES.atbFull; turnStart(u); }
  }
}
function turnStart(u) {
  if (u.status.absorbed) { bmsg(u.name + ' is lost in the story.'); tickStatuses(u); u.atb = 0; return; }
  if (u.side === 'f') {
    if (u.status.open) { delete u.status.open; u.guard = u.guardMax; u.atb = 0; bmsg(u.name + ' pulls itself back together.'); tickStatuses(u); return; }
    const a = foeChoose(u); if (!a) { u.atb = 0; return; }
    u.queued = 1; BT.queue.push(a); return;
  }
  if (u.status.hooked) { const F = livingFoes(); if (F.length) { u.queued = 1; BT.queue.push({ u, sk: SKILLS[u.C.strike], tgts: [F[Math.floor(Math.random() * F.length)]], auto: 1 }); bmsg(u.name + ' swings without thinking.'); return; } }
  u.ready = 1; BT.ready.push(u); if (typeof SND !== 'undefined') SND.play('ready');
}
// ---------- running an action ----------
function startAction(a) {
  if (!alive(a.u) && !a.counter) { a.u.queued = 0; return; }
  const sk = a.sk; a.t = 0; a.stage = 'name'; a.hit = 0;
  a.hits = sk.hits || 1; a.mult = 1;
  if (a.u.side === 'p' && sk === SKILLS[a.u.C.strike] && a.u.flags.fourHits) { a.hits = 4; a.mult = 0.5; }
  // targets that went away since the command was chosen: pick the next living one
  if (sk.tgt === 'foe' || (a.u.side === 'f' && sk.tgt === 'one')) a.tgts = a.tgts.map(t => alive(t) ? t : (a.u.side === 'p' ? livingFoes()[0] : livingParty()[0])).filter(Boolean);
  if (sk.tgt === 'foes') a.tgts = livingFoes();
  if (sk.tgt === 'allies' && !sk.fx.some(p => p.k === 'revive')) a.tgts = livingParty();
  if (sk.tgt === 'party_all') a.tgts = partyUnits();
  if (!a.tgts.length && sk.tgt !== 'self') { a.u.queued = 0; a.u.atb = 0; return; }
  // costs (paid when the action starts)
  if (a.u.side === 'p') {
    if (a.partners) {   // a combo: everyone named must still be up, and each pays their own part
      const all = [a.u].concat(a.partners);
      if (all.some(q => !alive(q))) { bmsg('The combo falls apart: someone is down.'); return endAction(a); }
      if (all.some(q => (sk.cost[q.id] || 0) > q.cl)) { bmsg('Not enough Clarity between them.'); return endAction(a); }
      all.forEach(q => q.cl -= skillCost(q, { cost: sk.cost[q.id] || 0 }));
    } else {
    const cost = a.free ? 0 : skillCost(a.u, sk);
    if (cost && a.u.status.cliched) { bmsg(a.u.name + ' reaches for the words and finds only stock phrases.'); return endAction(a); }
    if (cost > a.u.cl) { bmsg('Not enough Clarity.'); return endAction(a); }
    a.u.cl -= cost; }
    if (a.item) bagTake(a.item);
  }
  a.inputKind = a.u.side === 'p' && !a.counter ? (sk.seq ? 'seq' : sk.rhythm ? 'rhythm' : sk.mash ? 'mash' : sk.charge ? 'charge' : sk.tune ? 'tune' : null) : null;
  if (a.partners) a.line = null;
  // the line that goes with it (the understanding commands keep their v0.36 lines; foes say theirs)
  let line = null;
  if (a.u.side === 'f') line = sk.line || null;
  else if (sk.lines && LINES[sk.lines]) { const L = LINES[sk.lines]; line = L[Math.floor(Math.random() * L.length)]; }
  else if (sk === SKILLS.listen && a.tgts[0] && a.tgts[0].f && !a.tgts[0].heardOnce) { a.tgts[0].heardOnce = 1; line = 'You listen. ' + a.tgts[0].f.listen; }
  else if (sk === SKILLS.nameit && a.tgts[0] && a.tgts[0].f && !a.tgts[0].namedOnce) { a.tgts[0].namedOnce = 1; line = 'You see it: ' + a.tgts[0].f.arch + '. ' + a.tgts[0].f.named; }
  else if (a.section) line = 'You hand it something from ' + SECTIONS[a.section] + '.';
  a.line = a.partners ? [a.u].concat(a.partners).map(q => q.name).join(' + ') + ': ' + sk.name + '!' : line;
  BT.act = a;
}
function stageLen(a, st) {
  return { name: a.sk.quiet ? 4 : 22, move: a.u.side === 'p' ? 10 : 14, impact: 16, back: 12 }[st] || 10;
}
function actUpdate() {
  const a = BT.act; a.t++;
  const u = a.u, isP = u.side === 'p', cfgT = pcfg().timing;
  if (a.stage === 'name') {
    if (a.t === 1 && (a.line || !a.sk.quiet)) BT.label = { text: a.item ? BITEMS[a.item].name : a.sk.name, t: 0, side: u.side };
    if (a.t === 1 && a.line) bmsg(a.line);
    if (a.t === 1 && !isP) u.flash = 10;   // FF6: a foe blinks before it acts
    if (a.t >= stageLen(a, 'name')) { a.stage = a.inputKind ? 'input' : 'move'; a.t = 0; if (a.inputKind) inputBegin(a); }
    return;
  }
  if (a.stage === 'input') { if (inputUpdate(a)) { a.stage = 'move'; a.t = 0; } return; }
  if (a.stage === 'move') {
    if (isP) { u.pose = poseFor(a); const far = a.sk.kind === 'phys' && a.sk.tgt === 'foe'; u.dx = far ? Math.min(1, a.t / stageLen(a, 'move')) : Math.min(0.3, a.t / 30);
      if (a.partners) a.partners.forEach(q => { q.pose = a.sk.kind === 'phys' ? 'attack' : 'cast'; q.dx = Math.min(0.5, a.t / 20); }); }
    if (a.t >= stageLen(a, 'move')) { a.stage = 'impact'; a.t = 0; timingBegin(a); }
    return;
  }
  if (a.stage === 'impact') {
    timingUpdate(a);
    if (a.t === a.impactAt) { applyHit(a); a.hit++; if (a.hit < a.hits) { a.t = 0; timingBegin(a); a.impactAt = 10; } }
    if (a.hit >= a.hits && a.t >= a.impactAt + stageLen(a, 'impact')) { a.stage = 'back'; a.t = 0; }
    return;
  }
  if (a.stage === 'back') {
    if (isP) { u.dx = Math.max(0, u.dx - 1 / stageLen(a, 'back')); if (a.partners) a.partners.forEach(q => q.dx = Math.max(0, q.dx - 1 / stageLen(a, 'back'))); }
    if (a.t >= stageLen(a, 'back')) endAction(a);
  }
}
function poseFor(a) { const an = a.sk.anim || 'attack'; return { punch: 'attack', kick: 'kick', power: 'power', guard: 'guard', run: 'run', idle: 'idle' }[an] || an; }
// ---------- timed presses ----------
function timingBegin(a) {
  a.impactAt = a.impactAt || 14; a.tres = null; a.pressedAt = null;
  const u = a.u, cfgT = pcfg().timing;
  const strike = u.side === 'p' && a.sk.timed === 'strike' && !a.auto;
  const block = u.side === 'f' && a.tgts.some(t => t.side === 'p') && (a.sk.kind === 'phys' || a.sk.kind === 'mind') && a.sk.power > 0;
  a.window = cfgT === 'off' ? null : strike ? 'strike' : block ? 'block' : null;
  if (a.window && cfgT === 'assist') a.tres = 'good';
}
function timingUpdate(a) {
  if (!a.window || a.tres) return;
  const W = RULES.timed.win, WG = RULES.timed.winGreat, d = a.t - a.impactAt;
  if (pressed.a) { a.tres = Math.abs(d) <= WG ? 'great' : Math.abs(d) <= W ? 'good' : 'early'; }
  else if (d > W) a.tres = 'miss';
}
function applyHit(a) {
  const u = a.u, sk = a.sk; let mult = a.mult || 1, block = null;
  if (a.window === 'strike') { if (a.tres === 'great') { mult *= RULES.timed.great; popT(a, 'GREAT!'); } else if (a.tres === 'good') { mult *= RULES.timed.good; popT(a, 'GOOD'); } }
  if (a.window === 'block') { if (a.tres === 'great') { block = RULES.timed.blockGreat; popT(a, 'BLOCK!'); } else if (a.tres === 'good') { block = RULES.timed.block; popT(a, 'BLOCK'); } }
  if (a.inputKind === 'seq' && a.fumble) mult *= 0.4;
  if (a.inputKind === 'rhythm') mult *= 0.6 + 0.15 * (a.beats || 0);
  if (a.grow) { u.grow = (u.grow || 0) + 0.15; pop(u, 'GROWS', '#e87a5a'); return; }
  for (const t of a.tgts) {
    const c = { act: a, u, t, sk, hit: a.hit, mult, block, pierce: 0, dealt: 0 };
    for (const p of sk.fx) {
      const k = typeof p === 'string' ? p : p.k;
      if (a.hit > 0 && k !== 'dmg') continue;   // a multi-hit repeats its damage only
      if (FX[k]) FX[k](c, typeof p === 'string' ? {} : p);
    }
  }
  if (typeof SND !== 'undefined') SND.play(sk.kind === 'phys' ? 'hit' : sk.fx.some(p => p.k === 'heal' || p.k === 'revive') ? 'heal' : 'cast');
}
function popT(a, s) { const t = a.window === 'block' ? a.tgts[0] : a.u; if (t) pop(t, s, '#ffe080'); }
// ---------- Danny's techniques (enter the moves) and the Robin's cheers (press A on the beat) ----------
function inputBegin(a) {
  const cfgT = pcfg().timing;
  if (a.inputKind === 'seq') { a.seqI = 0; a.seqT = 0; a.fumble = 0; if (cfgT !== 'on') { a.seqI = a.sk.seq.length; } }
  if (a.inputKind === 'rhythm') { a.beat = 0; a.beats = 0; a.beatT = 0; a.beatHit = []; if (cfgT !== 'on') { a.beats = 3; a.beat = a.sk.rhythm; } }
  if (a.inputKind === 'mash') { a.mashT = 0; a.presses = 0; if (cfgT !== 'on') { a.presses = 12; a.mashT = RULES.timed.mashFrames; } }
  if (a.inputKind === 'charge') { a.chT = 0; a.held = 0; a.focus = 0; if (cfgT !== 'on') { a.focus = 0.8; a.chDone = 1; } }
  if (a.inputKind === 'tune') { a.tuneT = 0; a.station = 0.25 + Math.random() * 0.5; a.tuned = null; if (cfgT !== 'on') a.tuned = 0.8; }
}
// how each input turns into power: mash -> hits, charge -> focus, tune -> signal
function inputResult(a) {
  if (a.inputKind === 'mash') { const per = a.partners ? 3 : 4, mx = a.partners ? 9 : 7; a.hits = Math.max(1, Math.min(mx, 1 + Math.floor(a.presses / per))); }
  if (a.inputKind === 'charge') { a.mult *= 0.55 + 0.75 * a.focus; if (a.focus > 0.92) bmsg('In focus.'); }
  if (a.inputKind === 'tune') { a.mult *= 0.55 + 0.7 * (a.tuned || 0); a.beats = a.tuned >= 0.75 ? 4 : a.tuned >= 0.5 ? 3 : 1; if (a.tuned >= 0.9) bmsg('Clear signal.'); }
}
function inputUpdate(a) {
  if (a.inputKind === 'seq') {
    const S0 = a.sk.seq; if (a.seqI >= S0.length) return true;
    a.seqT++;
    const d = ['up', 'down', 'left', 'right'].find(k => pressed[k]);
    if (d) { if (d === S0[a.seqI]) { a.seqI++; if (typeof SND !== 'undefined') SND.play('tick'); } else { a.fumble = 1; bmsg('Danny fumbles the combination.'); return true; } }
    if (a.seqT > RULES.timed.seqFrames) { a.fumble = 1; bmsg('Too slow. Danny falls back on the basics.'); return true; }
    return a.seqI >= S0.length;
  }
  if (a.inputKind === 'mash') {
    if (a.mashT >= RULES.timed.mashFrames) { inputResult(a); return true; }
    a.mashT++; if (pressed.a) { a.presses++; if (typeof SND !== 'undefined' && a.presses % 2) SND.play('tick'); }
    return false;
  }
  if (a.inputKind === 'charge') {   // hold A: the picture comes into focus and drifts back out; let go when it is sharp
    if (a.chDone) { inputResult(a); return true; }
    a.chT++; if (held.a) a.held = 1;
    if (a.held) a.focus = 1 - Math.abs(((a.chT % 120) / 60) - 1);
    if ((a.held && !held.a) || a.chT > 300) { a.chDone = 1; }
    return false;
  }
  if (a.inputKind === 'tune') {   // the needle sweeps; press A when it is on the station
    if (a.tuned != null) { inputResult(a); return true; }
    a.tuneT++; const needle = 1 - Math.abs(((a.tuneT % 90) / 45) - 1);
    if (pressed.a) { const d = Math.abs(needle - a.station); a.tuned = Math.max(0, 1 - d * 4); }
    if (a.tuneT > 270) a.tuned = 0.2;
    return false;
  }
  if (a.inputKind === 'rhythm') {
    const B = RULES.timed.beat, n = a.sk.rhythm; if (a.beat >= n) return true;
    a.beatT++; const d = a.beatT - B;
    if (pressed.a && !a.beatHit[a.beat]) { a.beatHit[a.beat] = Math.abs(d) <= 6 ? 'hit' : 'off'; if (Math.abs(d) <= 6) { a.beats++; if (typeof SND !== 'undefined') SND.play('beat'); } }
    if (d > 6) { a.beat++; a.beatT = 0; }
    return a.beat >= n;
  }
  return true;
}
function endAction(a) {
  const u = a.u; u.queued = 0; u.ready = 0; u.atb = 0; u.dx = 0; u.pose = alive(u) ? 'idle' : u.pose;
  if (a.partners) for (const q of a.partners) { q.queued = 0; q.ready = 0; q.atb = 0; q.dx = 0; if (alive(q)) q.pose = 'idle'; tickStatuses(q); }
  if (!a.counter) { tickStatuses(u); if (u.side === 'p') u.last = a.sk; }
  // Double Feature: an understanding command acts twice
  if (u.side === 'p' && u.flags.twice && a.sk.menu === 'und' && !a.second && !a.counter && alive(u)) BT.queue.unshift(Object.assign({}, a, { second: 1, free: 1, t: 0 }));
  if (u.tellNext && alive(u)) { u.tellNext = 0; bmsg(u.name + ' draws itself up. Something big is coming.'); }
  BT.act = null; BT.label = null;
}
// ---------- the end ----------
function checkEnd() {
  if (BT.fled) { BT.phase = 'fled'; BT.endT = 0; return true; }
  if (!livingFoes().length) { battleWon(); return true; }
  if (!partyUnits().some(u => !u.status.dazed)) { battleLost(); return true; }
  return false;
}
function battleWon() {
  BT.phase = 'win'; BT.endT = 0; BT.res = []; BT.picks = [];
  if (typeof SND !== 'undefined') SND.win();
  let und = 0, pages = 0;
  for (const u of foeUnits()) { const f = u.f; let x = RULES.foeUnd(f.lv, f.boss); if (u.understood) x *= RULES.understoodBonus; und += x; pages += RULES.foePages(f.lv, f.boss); }
  if (BT.practice) { const day = new Date().toDateString(); if (G.party.practiceDay === day) und = 0; else { G.party.practiceDay = day; und = Math.min(und, 6); } pages = 0; }
  const lines = BT.res;
  for (const u of BT.freedOrder) lines.push(u.understood ? u.f.freed : u.name + ' lets go, but you never saw what it was. Its story stays with you.');
  let pagesGot = 0;
  for (const u of partyUnits()) {
    let x = und * (u.flags.undUp ? 1.25 : 1) * (u.flags.pages ? 0.5 : 1) * (u.status.dazed ? 0.5 : 1);
    pagesGot = Math.max(pagesGot, pages * (u.flags.pages ? 2 : 1));
    const ups = giveUnd(u.id, x);
    if (x > 0) lines.push(u.name + ' +' + Math.round(x) + ' UNDERSTANDING');
    for (const L of ups) { lines.push(u.name + ' reached level ' + L.lv + '!'); BT.picks.push(u.id); if (L.learned && L.learned.length) lines.push('Learned: ' + L.learned.join(', ') + '.'); }
  }
  if (pagesGot) { G.party.pages = (G.party.pages || 0) + pagesGot; lines.push('+' + pagesGot + ' LOOSE PAGES'); }
  for (const u of foeUnits()) for (const [id, ch] of u.f.drops || []) if (Math.random() < ch) {
    const name = BITEMS[id] ? BITEMS[id].name : GEAR[id] ? GEAR[id].name : id;
    if (BITEMS[id] && (G.bag[id] || 0) >= RULES.itemCap) continue;
    if (GEAR[id] && GEAR[id].price === 0 && (G.bag[id] || ownsGear(id))) continue;   // one of each found piece
    bagAdd(id); lines.push('Found: ' + name + '.');
  }
  writeBack(true);
}
function ownsGear(id) { return Object.values(G.party.m).some(M => Object.values(M.gear).includes(id)); }
function battleLost() {
  BT.phase = 'lose'; BT.endT = 0;
  if (typeof SND !== 'undefined') SND.lose();
}
// HP and Clarity go back to the party; dazed members get up with 1 HP (statuses never outlast a battle)
function writeBack(won) {
  const ch = RULES.challenge[pcfg().challenge] || RULES.challenge.medium;
  for (const u of partyUnits()) {
    const M = G.party.m[u.id];
    if (won && ch.healAfter) { M.hp = null; M.cl = null; continue; }
    M.hp = u.status.dazed || u.hp <= 0 ? 1 : Math.min(u.hp, u.st.hpMax); M.cl = u.cl;
    if (M.hp >= memberStats(u.id).hpMax) M.hp = null;
  }
}
function battleExit() {
  const B = BT; BT = null;
  if (typeof SND !== 'undefined') SND.resume();
  if (B.phase === 'lose' && !B.practice) partyRestore();
  saveGame && saveGame();
  setMode(B.ret || 'walk');
  if (B.onEnd) B.onEnd(B.phase);
  if (B.phase === 'win' && B.onWin) B.onWin();
  else if (B.phase === 'lose' && B.onLose) B.onLose();
  else if (B.phase === 'lose' && !B.practice) say([['', 'The story closes over you like warm water...'], ['', '...and you come to, back on your own feet. Nothing lost but the moment.']]);
}
// ---------- the mode ----------
MODES.battle = {
  update() {
    const B = BT; if (!B) return; B.t++;
    animateUnits();
    if (B.phase === 'intro') { introUpdate(); return; }
    if (B.phase === 'win' || B.phase === 'lose' || B.phase === 'fled') { endUpdate(); return; }
    if (B.msg) { B.msg.t++; if (pressed.a && B.msg.t > 8 && !B.act) B.msg.t = 9999; if (B.msg.t > msgDur(B.msg)) B.msg = null; }
    if (!B.msg && B.msgs.length) B.msg = B.msgs.shift();
    if (B.act) { actUpdate(); return; }
    if (B.msg) return;
    if (checkEnd()) return;
    if (B.queue.length) { startAction(B.queue.shift()); return; }
    B.ready = B.ready.filter(u => alive(u) && u.ready);
    if (B.menu && (!alive(B.menu.u) || !B.menu.u.ready)) B.menu = null;
    if (!B.menu && B.ready.length) btMenuOpen(B.ready[0]);
    if (B.menu) { btMenuUpdate(); if (pcfg().atb === 'wait') return; }
    tickATB();
  },
  draw() { if (BT) btDraw(); },
};
function animateUnits() {
  for (const u of BT.units) {
    if (u.flash > 0) u.flash--; if (u.shake > 0) u.shake--; if (u.poseT > 0 && --u.poseT === 0 && alive(u)) u.pose = 'idle';
    if (u.freed && u.fade < 40) u.fade++;
    if (u.side === 'p') {
      if (!pcfg().roll) u.hpShown = Math.max(0, u.hp);
      else if (u.hpShown > u.hp) u.hpShown = Math.max(Math.max(0, u.hp), u.hpShown - RULES.rollRate(u));
      else if (u.hpShown < u.hp) u.hpShown = Math.min(u.hp, u.hpShown + RULES.rollRate(u) * 3);
      if (!u.status.dazed && u.hp <= 0 && u.hpShown <= 0) daze(u);
    }
  }
  if (BT.shake > 0) BT.shake--; if (BT.flash > 0) BT.flash--;
  for (const p of BT.pops) p.t++; BT.pops = BT.pops.filter(p => p.t < 70);
  if (BT.label) BT.label.t++;
}
function introUpdate() {
  const B = BT; if (B.t < 20) return;
  if (!B.msg && B.introI < B.intro.length) { B.msg = { text: B.intro[B.introI++], t: 0, intro: 1 }; return; }
  if (B.msg) { B.msg.t++; if (pressed.a && B.msg.t > 8) B.msg.t = 9999; if (B.msg.t > msgDur(B.msg) * 1.3) B.msg = null; return; }
  B.phase = 'run';
}
function endUpdate() {
  const B = BT; B.endT++;
  if (B.phase === 'win' && B.picks.length && B.endT > 30) { pickUpdate(); return; }
  if (B.endT > 40 && (pressed.a || pressed.b)) battleExit();
}
// the level-up choice after a win (one per level gained); A takes the class's own pick
function pickUpdate() {
  const B = BT, id = B.picks[0], M = G.party.m[id], keys = Object.keys(LEVEL_PICKS);
  if (B.pickI == null) B.pickI = keys.indexOf(CLASSES[id].pick);
  if (pressed.up) B.pickI = (B.pickI + keys.length - 1) % keys.length;
  if (pressed.down) B.pickI = (B.pickI + 1) % keys.length;
  if (pressed.a) { applyPick(id, keys[B.pickI]); M.picks.shift(); B.picks.shift(); B.pickI = null; B.endT = 31; if (typeof SND !== 'undefined') SND.play('ok'); }
}
