"use strict";
// =====================================================================
//  THE CITY ADMINISTRATOR (Nov 16): a summoner, after Final Fantasy's. Christian: "Have The City Administrator be a summoning
//  class that summons the various departments, based on Final Fantasy summoners." A role, not a person: the City Admin and
//  the Video Gamer stay generic (Christian, Nov 16). Joins at City Hall (700 Edison St).
//  SUMMON calls a city department onto the field, one summon for each of the city's departments (Christian's list, Nov 16,
//  checked against the DEPARTMENTS menu on antigo-city.org, which files the Street Department and Water Utilities under Public
//  Works). Each has a short scene and its own effect, and each answers once per fight (FF6's rule for espers).
//  The City Hall offices come with the job, by level:
//    PUBLIC RECORD (Clerk/Treasurer & Finance), FIRE & RESCUE (the fire department, same building, ambulance included),
//    INSPECTION (Building Inspection & Zoning), REBOOT (Information Technology), PROCLAMATION (Administration: the mayor's office)
//  The others go on call once you have been to them in town (real places, so the game sends you out the door):
//    POLICE             the Public Safety Building on Clermont (the police department's address is 840 Clermont St)
//    SNOWPLOW           the Street Department: the public works yard, 1020 W Pierce Ave
//    WATER TOWER        Public Works: the yard, the waterworks at 520 1st Ave, or Water Tower Park beside it
//    PARKS & REC        Parks, Recreation & Cemetery: any city park or cemetery
//    CLEAN WATER        Stormwater/Wastewater Treatment: look at Spring Brook, where the treated water goes
//    INTERLIBRARY LOAN  the Antigo Public Library: step inside
//    MUTUAL AID         all six, and level 12: every department at once, and the neighbors' crews
//  Facts used: the fire department works out of 700 Edison St and has provided emergency medical services since 1993, at the
//  paramedic level since 2008 (the city's fire department page); the police department, 840 Clermont St (the county resource
//  guide); the waterworks softens and disinfects well water (DNR permit notice WI-0066672); public works, 1020 W Pierce Ave;
//  since the city built its wastewater plant, trout have returned to the 12 miles of Spring Brook below town (DNR, Springbrook
//  Creek watershed page). The vehicles are generic: no real badge, patch, logo or person. Every line is a stand-in for Christian.
// =====================================================================
FOLKS.admin = { skin: '#d8a882', hair: '#5a4030', shirt: '#2c3a5c', shirt2: '#c8d8ee', pants: '#33363e', shoes: '#1a1a1a' };
{ const _df = drawFolk; drawFolk = function (who, cx, by, t) {
  _df(who, cx, by, t); if (who !== 'admin') return;
  const bob = (t >> 5) % 2, B = (c, x, y, w, h) => F(c, Math.round(cx + x), Math.round(by + y), w, h);
  B('#7a2434', -1, -22 + bob, 2, 9);                                                          // a tie over the shirt front
  B('#3a6ab8', -4, -23 + bob, 1, 6); B('#3a6ab8', 3, -23 + bob, 1, 6); B('#f4f4f0', 2, -17 + bob, 3, 4);   // lanyard and badge
  B('#1a1418', 8, -19 + bob, 6, 10); B('#b8915a', 9, -18 + bob, 4, 8); B('#f4f0e6', 10, -17 + bob, 2, 6);  // a clipboard at the side
}; }
// ---------- the skills ----------
Object.assign(SKILLS, {
  strike_ad:  { name: 'STRIKE', tgt: 'foe', kind: 'phys', aspect: 'force', power: 5, timed: 'strike', anim: 'attack', fx: ['dmg'], desc: 'A rolled-up agenda. Press A as it lands for more.' },
  delegate:   { name: 'DELEGATE', menu: 'sig', cost: 2, tgt: 'ally', anim: 'cast', fx: [{ k: 'atb', n: 450 }], desc: 'Hand it off: an ally acts sooner.' },
  budget:     { name: 'BUDGET', menu: 'sig', cost: 3, tgt: 'ally', anim: 'cast', fx: [{ k: 'clarity', n: 6 }], desc: 'Move the money to where it is needed: an ally gets +6 Clarity.' },
  // the summons, one per department. summon: the scene; dept: goes on call in town; needAll: every department first
  sm_record:  { name: 'PUBLIC RECORD', menu: 'sig', summon: 'record', cost: 4, tgt: 'foes', kind: 'mind', aspect: 'cite', power: 11, anim: 'cast', fx: ['dmg', { k: 'dispel' }], desc: 'SUMMON the clerk-treasurer\'s office: the files come out. Hits every foe as CITE SOURCE and strips a boost.' },
  sm_fire:    { name: 'FIRE & RESCUE', menu: 'sig', summon: 'fire', cost: 8, tgt: 'party_all', anim: 'cast', fx: [{ k: 'revive', pct: 0.3 }, { k: 'heal', p: 16 }, { k: 'cure', ids: ['dread', 'shaken', 'slowed'] }], desc: 'SUMMON the fire department: the engine and the ambulance. Raises the dazed, heals the party, clears DREAD, SHAKEN, SLOWED.' },
  sm_inspect: { name: 'INSPECTION', menu: 'sig', summon: 'inspect', cost: 4, tgt: 'foes', anim: 'cast', fx: [{ k: 'scan' }, { k: 'brk', n: 1 }], desc: 'SUMMON building inspection and zoning: every flaw, written up. Shows every foe and wears down their guards.' },
  sm_it:      { name: 'REBOOT', menu: 'sig', summon: 'it', cost: 4, tgt: 'allies', anim: 'cast', fx: [{ k: 'cure', ids: ['fogged', 'cliched', 'absorbed'] }, { k: 'atb', n: 300 }, { k: 'clarity', n: 2 }], desc: 'SUMMON information technology: turn it off and on again. Clears FOGGED, CLICHED, ABSORBED; gauges fill; +2 Clarity.' },
  sm_mayor:   { name: 'PROCLAMATION', menu: 'sig', summon: 'mayor', cost: 7, tgt: 'allies', anim: 'cast', fx: [{ k: 'status', id: 'pumped' }, { k: 'status', id: 'steady' }], desc: 'SUMMON the mayor\'s office: a proclamation for the whole party. PUMPED and STEADY.' },
  sm_police:  { name: 'POLICE', menu: 'sig', summon: 'police', dept: 'police', cost: 6, tgt: 'foes', anim: 'cast', fx: [{ k: 'status', id: 'slowed', ch: 0.8 }, { k: 'atb', n: -400 }, { k: 'status', id: 'quick', to: 'party' }], desc: 'SUMMON a patrol: lights on, traffic stopped. Foes may slow and lose ground; the party gets QUICK.' },
  sm_plow:    { name: 'SNOWPLOW', menu: 'sig', summon: 'plow', dept: 'streets', cost: 8, tgt: 'foes', kind: 'mind', aspect: 'force', power: 20, brk: 1, anim: 'cast', fx: ['dmg', { k: 'atb', n: -250 }], desc: 'SUMMON the street department at four in the morning. A heavy hit on every foe that knocks them back.' },
  sm_works:   { name: 'WATER TOWER', menu: 'sig', summon: 'works', dept: 'works', cost: 7, tgt: 'allies', anim: 'cast', fx: [{ k: 'status', id: 'steady' }, { k: 'status', id: 'clear' }, { k: 'clarity', n: 3 }], desc: 'SUMMON public works: water from the tower, roads that hold. STEADY, CLEAR and +3 Clarity for the party.' },
  sm_parks:   { name: 'PARKS & REC', menu: 'sig', summon: 'parks', dept: 'parks', cost: 5, tgt: 'allies', anim: 'cast', fx: [{ k: 'cure', ids: ['absorbed', 'hooked', 'fogged'] }, { k: 'heal', p: 8 }, { k: 'status', id: 'pumped' }], desc: 'SUMMON parks, recreation and cemetery: everybody outside. Shakes off ABSORBED, HOOKED, FOGGED; the party pumps up.' },
  sm_sewer:   { name: 'CLEAN WATER', menu: 'sig', summon: 'sewer', dept: 'sewer', cost: 6, tgt: 'allies', anim: 'cast', fx: [{ k: 'cure', ids: 'bad' }, { k: 'heal', p: 10 }, { k: 'status', id: 'rested' }], desc: 'SUMMON wastewater treatment: what goes down the drain goes back to the brook clean. Clears every status; RESTED.' },
  sm_library: { name: 'INTERLIBRARY LOAN', menu: 'sig', summon: 'library', dept: 'library', autoBook: 1, cost: 5, tgt: 'foe', kind: 'mind', aspect: 'book', power: 16, anim: 'cast', fx: ['dmg'], desc: 'SUMMON the library: whatever it needs, they will find it, even from another library. The right book, every time.' },
  sm_mutual:  { name: 'MUTUAL AID', menu: 'sig', summon: 'mutual', needAll: 1, cost: 16, tgt: 'party_all', anim: 'cast', fx: [{ k: 'revive', pct: 0.6 }, { k: 'heal', p: 40 }, { k: 'cure', ids: 'bad' }, { k: 'atb', n: 500 }], desc: 'SUMMON every department at once, and the neighbors\' crews. Raises and heals everyone, clears statuses, fills gauges.' },
});
CLASSES.admin = { name: 'ADMIN', title: 'CITY ADMINISTRATOR', medium: 'The city\'s departments', art: 'folk:admin', sig: 'SUMMON', strike: 'strike_ad', hand: 'clip', row: 'back', recruit: 'City Hall',
  base: { STR: 5, STA: 7, AGI: 6, DEX: 7, INT: 9, WIS: 10, CHA: 9 }, grow: { STR: 0.5, STA: 0.9, AGI: 0.7, DEX: 0.8, INT: 1.2, WIS: 1.4, CHA: 1.2 },
  pick: 'kind', start: { hand: 'clipboard', body: 'scarf' },
  learn: [[1, 'sm_record'], [1, 'sm_fire'], [1, 'delegate'], [3, 'sm_inspect'], [4, 'budget'], [5, 'sm_it'], [8, 'sm_mayor'], [12, 'sm_mutual']] };
Object.assign(GEAR, {
  clipboard:  { name: 'Clipboard', slot: 'hand', who: ['admin'], mods: [{ s: 'mag', add: 2 }, { s: 'heal', add: 2 }], price: 0, desc: 'MAG +2, HEAL +2.' },
  budgetbook: { name: 'Budget Binder', slot: 'hand', who: ['admin'], mods: [{ s: 'mag', add: 5 }, { s: 'heal', add: 3 }], price: 4000, desc: 'MAG +5, HEAL +3.' },
  tworadio:   { name: 'Two-Way Radio', slot: 'hand', who: ['admin'], mods: [{ s: 'mag', add: 8 }, { s: 'heal', add: 5 }], price: 12000, desc: 'MAG +8, HEAL +5.' },
  keyring:    { name: 'Master Key Ring', slot: 'hand', who: ['admin'], mods: [{ s: 'mag', add: 12 }, { s: 'heal', add: 7 }], price: 24000, desc: 'MAG +12, HEAL +7.' },
  citykey:    { name: 'Key to the City', slot: 'hand', who: ['admin'], mods: [{ s: 'mag', add: 16 }, { s: 'heal', add: 10 }], price: 0, desc: 'MAG +16, HEAL +10. Found, never sold.' } });
TEAMS.push({ name: 'MAIN STREET', need: ['christian', 'admin'], mods: [{ s: 'heal', mul: 1.1 }], desc: 'A downtown business and City Hall: healing +10%.' },
  { name: 'CIVIC PRIDE', need: ['robin', 'admin'], mods: [{ s: 'sres', add: 10 }], desc: 'The town and the people who run it: everyone shrugs off statuses more often.' });
COMBOS.townhall = { name: 'TOWN HALL MEETING', who: { christian: 'teabreak', admin: 'delegate' }, cost: { christian: 3, admin: 2 }, tgt: 'allies', fx: [{ k: 'heal', p: 14 }, { k: 'atb', n: 350 }, { k: 'clarity', n: 3 }], desc: 'Everyone gets a turn at the microphone: heals the party, fills gauges, +3 Clarity each.' };
// ---------- which departments are on call ----------
const ADMIN_DEPTS = ['police', 'streets', 'works', 'parks', 'sewer', 'library'];
const ADMIN_DEPT_NAME = { police: 'The police department', streets: 'The street department', works: 'Public works', parks: 'Parks and Rec', sewer: 'Wastewater treatment', library: 'The library' };
function adminCall() { G.admin = G.admin || {}; G.admin.call = G.admin.call || {}; G.admin.told = G.admin.told || {}; return G.admin; }
function adminOnCall(d) {
  const A = (G && G.admin && G.admin.call) || {}, V = (G && G.visited) || {};
  if (d === 'parks') return !!A.parks || (typeof PLACES !== 'undefined' && PLACES.some(p => (p[1] === 'park' || p[1] === 'cemetery') && V[p[0]]));
  if (d === 'works') return !!A.works || !!V['Water Tower Park'];
  if (d === 'library') return !!A.library || !!(G.edu && G.edu.v && G.edu.v['Antigo Public Library']);
  return !!A[d];
}
{ const _ms = memberSkills; memberSkills = function (id, menu) {
  const out = _ms(id, menu);
  if (id !== 'admin' || (menu && menu !== 'sig')) return out;
  for (const s of Object.keys(SKILLS)) if (SKILLS[s].dept && adminOnCall(SKILLS[s].dept) && !out.includes(s)) out.push(s);
  const ok = out.filter(s => !SKILLS[s].needAll || ADMIN_DEPTS.every(adminOnCall));
  return ok.filter(s => SKILLS[s].summon).concat(ok.filter(s => !SKILLS[s].summon));   // the summons first, then the rest
}; }
// newly on call (in town) and not yet announced; level-learned summons are announced by the level-up itself
function adminNews() {
  if (!G || typeof partyHas !== 'function' || !partyHas('admin')) return [];
  const A = adminCall(), out = [];
  for (const s of memberSkills('admin', 'sig')) { const k = SKILLS[s]; if ((k.dept || k.needAll) && !A.told[s]) { A.told[s] = 1; out.push(s); } }
  return out;
}
function adminNewsLine(s) { const k = SKILLS[s]; return k.needAll ? 'Every department knows you now. When it counts, I can call them all at once. (New summon: MUTUAL AID.)' : ADMIN_DEPT_NAME[k.dept] + ' is on call now. (New summon: ' + k.name + '.)'; }
{ const _pj = partyJoin; partyJoin = function (id) { const r = _pj(id); if (r && id === 'admin') { const A = adminCall(); memberSkills('admin', 'sig').forEach(s => A.told[s] = 1); } return r; }; }
// the department buildings: a line about what goes on inside, and the department goes on call
const DEPT_BLDG = [
  { d: 'police', test: b => b.name === 'Langlade County Public Safety Building', line: 'The Antigo Police Department works out of this building, and so does the county\'s 911 dispatch center.' },
  { d: ['streets', 'works'], test: b => b.addr === '1020 W PIERCE AVE', line: 'The city\'s public works yard: the street department\'s garages and trucks.' },
  { d: 'works', test: b => b.addr === '520 1ST AVE', line: 'The city\'s water comes from wells. It is softened and disinfected here before it goes out to the mains.' },
  { d: 'library', test: b => b.name === 'Antigo Public Library', line: null },
  { d: null, test: b => b.name === 'City Hall', line: 'The fire department shares the building: its engines and ambulances roll out of the bays here.' }];
for (const b of BLD) { if (b.addr === '520 1ST AVE' && !b.name) b.name = 'Antigo Waterworks'; if (b.addr === '1020 W PIERCE AVE' && !b.name) b.name = 'Public Works'; }
{ const _la = lookAt; lookAt = function (x, y) {
  const b = typeof bldgAtM === 'function' ? bldgAtM(x, y) : null, r = _la(x, y), D = b && DEPT_BLDG.find(e => e.test(b));
  if (D && DLG && DLG.lines && mode !== 'inside') {   // before the survey offer's choices, which show on the last line
    if (D.line) DLG.lines.push(['', D.line]);
    if (D.d) { for (const d of [].concat(D.d)) adminCall().call[d] = 1; for (const s of adminNews()) DLG.lines.push(['Admin', adminNewsLine(s)]); }
  }
  // Spring Brook: where the city's treated wastewater goes back
  if (!b && DLG && DLG.lines && mode === 'walk' && typeof tAt === 'function' && tAt(Math.floor(x / CPD), Math.floor(y / CPD)) === TL.WATER) {
    DLG.lines.push(['', 'The city\'s wastewater plant cleans what goes down the drains before it goes back into this brook. Since it was built, trout have come back to twelve miles of Spring Brook below town.']);
    adminCall().call.sewer = 1; for (const s of adminNews()) DLG.lines.push(['Admin', adminNewsLine(s)]);
  }
  return r;
}; }
{ const _er = enterRoom; enterRoom = function (b) { const r = _er(b); if (b && b.name === 'Antigo Public Library' && DLG && DLG.lines) { adminCall().call.library = 1; for (const s of adminNews()) DLG.lines.push(['Admin', adminNewsLine(s)]); } return r; }; }
let ADMIN_LASTV = -1;   // places reached on foot (parks, Water Tower Park): checked when the count of places found changes
{ const _mt = mapplusTick; mapplusTick = function () {
  _mt(); if (!G || !G.visited) return; const n = Object.keys(G.visited).length; if (n === ADMIN_LASTV) return; ADMIN_LASTV = n;
  if (mode !== 'walk' || DLG) { ADMIN_LASTV = -1; return; }
  const news = adminNews(); if (news.length) say(news.map(s => ['Admin', adminNewsLine(s)]));
}; }
// ---------- City Hall: the administrator, between meetings, until they join ----------
function adminTalk() {
  ask('City Administrator: Between meetings, for once. You\'re the one asking how this town actually runs? (Stand-in lines: Christian writes this scene.)', [
    { t: 'Come along? (join)', f: adminJoin },
    { t: 'What does a city administrator do?', f: () => say([['City Administrator', 'The council decides; my office carries it out. The department heads report to me day to day.'],
      ['City Administrator', 'In a lot of cities the administrator also puts together the budget the council votes on. Ask the clerk how the money works.']]) },
    { t: 'Back to work' }]);
}
function adminJoin() {
  say([['City Administrator', 'Every department in this city answers to my office. In a fight, I can call them in.'],
    ['City Administrator', 'Most of them have to know your face first. The police on Clermont, the street crews and public works out on West Pierce, the parks, the library. Go meet them.'],
    ['City Administrator', 'And go look at Spring Brook sometime. That is where the wastewater plant\'s work ends up.']], () => {
    partyJoin('admin');
    const R = G.inside && ROOMS[G.inside.f], i = R ? R.npcs.findIndex(n => n.folk === 'admin') : -1;   // the desk is empty now
    if (i >= 0) { const n = R.npcs[i]; R.npcs.splice(i, 1); R.R[n.y][n.x] = '.'; R.rows[n.y] = R.R[n.y].join(''); }
    const on = memberSkills('admin', 'sig').filter(s => SKILLS[s].summon).map(s => SKILLS[s].name);
    say([['', 'ADMIN joined the party. (CITY ADMINISTRATOR: the city\'s departments.)'], ['', partyIds().includes('admin') ? 'They fight with you now.' : 'They will wait at the Fig Tree. Change who comes along there.'], ['', 'On call: ' + on.join(', ') + '.']]);
  });
}
{ const H = ROOM_HOOK['City Hall']; if (H) { const _lay = H.layout;
  H.layout = (F, c) => { if (_lay) _lay(F, c); if (!isRPG() || partyHas('admin')) return;
    const cl = F.npcs.find(n => n.folk === 'clerk'), x = cl ? Math.max(2, Math.min(F.W - 3, cl.x + (cl.x > F.W / 2 ? -5 : 5))) : 4, y = cl ? Math.max(2, cl.y - 3) : 4;
    hookNpc(F, 'admin', x, y, adminTalk, 'City Administrator'); }; } }
// ---------- in battle: once per fight, and the summon scene between the cast and the effect ----------
const SUMMON_T = 70;
const SUMMON_NAME = { record: 'CLERK/TREASURER & FINANCE', inspect: 'BUILDING INSPECTION & ZONING', fire: 'FIRE DEPARTMENT', it: 'INFORMATION TECHNOLOGY', mayor: 'ADMINISTRATION', police: 'POLICE DEPARTMENT', plow: 'STREET DEPARTMENT', works: 'PUBLIC WORKS', parks: 'PARKS, RECREATION & CEMETERY', sewer: 'WASTEWATER TREATMENT', library: 'ANTIGO PUBLIC LIBRARY', mutual: 'MUTUAL AID' };
const SUMMON_LINE = { record: 'The clerk pulls every file on it.', inspect: 'The inspector walks the whole thing with a clipboard.', fire: 'The engine and the ambulance roll out of the bays at City Hall.',
  it: 'Have you tried turning it off and on again?', mayor: 'The mayor\'s office issues a proclamation.', police: 'Lights on. Traffic stops.', plow: 'Four in the morning. The plow comes through.',
  works: 'The tower over the park opens up.', parks: 'Everybody outside!', sewer: 'Down the drain, through the plant, back to the brook. Clean.', library: 'The librarian makes a call to another library.',
  mutual: 'Every department rolls, and the neighbors\' crews right behind.' };
{ const _bs = btSubList; btSubList = function (u, sub) {
  const L = _bs(u, sub);
  if (sub === 'sig' && BT && BT.summoned) for (const e of L) if (e.sk && e.sk.summon && BT.summoned[u.id + ':' + e.sk.summon]) { e.ok = false; e.right = 'CALLED'; e.desc = e.sk.desc + '  (Already called: once per fight.)'; }
  return L;
}; }
{ const _sa = startAction; startAction = function (a) {
  _sa(a);
  if (BT && BT.act === a && a.sk && a.sk.summon && a.u.side === 'p') { (BT.summoned = BT.summoned || {})[a.u.id + ':' + a.sk.summon] = 1; if (!a.line) a.line = SUMMON_LINE[a.sk.summon] || null;
    const t = a.tgts && a.tgts[0]; if (a.sk.autoBook && t && t.f && t.f.need && t.f.need.length) a.section = t.f.need[0]; }   // the library finds the book it needs
}; }
{ const _au = actUpdate; actUpdate = function () {
  const a = BT.act;
  if (a && a.stage === 'summon') { a.t++; if (a.t >= SUMMON_T) { a.stage = 'impact'; a.t = 0; timingBegin(a); } return; }
  _au();
  const b = BT.act;
  if (b && b === a && b.sk && b.sk.summon && b.stage === 'impact' && b.t === 0 && !b.called) { b.called = 1; b.stage = 'summon'; b.t = 0; }
}; }
{ const _bd = btDraw; btDraw = function () {
  _bd(); const a = BT && BT.act; if (!a || a.stage !== 'summon') return;
  drawSummon(a.sk.summon, a.t);
  const m = BT.msg; if (m) { const L = wrap(m.text, SW - 28).slice(0, 3); win(4, 4, SW - 8, 10 + L.length * 11); L.forEach((l, i) => txt(l, 14, 9 + i * 11, '#fff', 'left')); }   // the line stays readable over the scene
}; }
// ---------- the scenes: generic vehicles and things, drawn in blocks ----------
function sBox(ox, oy, s) { return (c, x, y, w, h) => R(Math.round(ox + x * s), Math.round(oy + y * s), Math.max(1, Math.round(w * s)), Math.max(1, Math.round(h * s)), c); }
function sWheel(b, x, y) { b('#141418', x, y, 6, 6); b('#8a8e98', x + 2, y + 2, 2, 2); }
function sumFire(ox, oy, s, t) {   // a pumper: red body, white stripe, a ladder on top, lights on the cab
  const b = sBox(ox, oy, s), lit = (t >> 2) % 2;
  b('#2a0c0c', 0, 4, 46, 13); b('#c82828', 1, 5, 44, 11); b('#e8e8e8', 1, 12, 44, 1);
  b('#b8b8c0', 2, 2, 30, 2); for (let i = 4; i < 32; i += 4) b('#6a6a72', i, 2, 1, 2);
  b('#c82828', 34, 1, 12, 6); b('#a8d0f0', 37, 2, 7, 4);
  b(lit ? '#ff4040' : '#ffffff', 36, 0, 4, 1); b(lit ? '#ffffff' : '#ff4040', 41, 0, 4, 1);
  b('#d0d0d4', 3, 7, 7, 4); b('#d0d0d4', 13, 7, 7, 4); b('#d0d0d4', 23, 7, 7, 4); b('#ffe080', 45, 9, 1, 2);
  sWheel(b, 5, 14); sWheel(b, 34, 14);
}
function sumAmb(ox, oy, s, t) {   // a box ambulance: white, a red stripe, lights flashing
  const b = sBox(ox, oy, s), lit = (t >> 2) % 2;
  b('#2a2a30', 0, 2, 40, 14); b('#f2f2f2', 1, 3, 26, 12); b('#f2f2f2', 27, 7, 12, 8); b('#a8d0f0', 30, 8, 6, 3);
  b('#c82828', 1, 11, 38, 2); b('#e8862a', 1, 9, 26, 1);
  b(lit ? '#ff4040' : '#802020', 2, 2, 4, 1); b(lit ? '#802020' : '#ff4040', 21, 2, 4, 1); b('#ffe080', 38, 12, 1, 2);
  sWheel(b, 5, 13); sWheel(b, 28, 13);
}
function sumPolice(ox, oy, s, t) {   // a patrol car: black and white, the light bar going
  const b = sBox(ox, oy, s), lit = (t >> 2) % 2;
  b('#101216', 0, 6, 38, 7); b('#101216', 9, 2, 18, 5); b('#f0f0f0', 11, 7, 14, 5);
  b('#a8d0f0', 11, 3, 6, 3); b('#a8d0f0', 19, 3, 6, 3);
  b(lit ? '#ff3030' : '#601818', 13, 1, 5, 1); b(lit ? '#183060' : '#3070ff', 18, 1, 5, 1);
  b('#ffe080', 37, 8, 1, 2); b('#c82828', 0, 8, 1, 2);
  sWheel(b, 4, 10); sWheel(b, 27, 10);
}
function sumPlow(ox, oy, s, t) {   // a plow truck: orange, an amber light, the blade out front
  const b = sBox(ox, oy, s), lit = (t >> 3) % 2;
  b('#3a2208', 0, 3, 30, 12); b('#e8862a', 1, 4, 28, 10); b('#c86a1a', 1, 4, 28, 2);
  b('#3a2208', 29, 5, 12, 10); b('#e8862a', 30, 6, 10, 8); b('#a8d0f0', 32, 7, 6, 3); b(lit ? '#ffc020' : '#805a10', 33, 4, 4, 1);
  for (let i = 0; i < 9; i++) b(i % 2 ? '#c8ccd4' : '#e0e4ea', 42 + (i >> 1), 6 + i, 3, 1);
  b('#6a6e78', 40, 10, 2, 3);
  sWheel(b, 4, 13); sWheel(b, 31, 13);
}
function sumTower(cx, by, h) {   // a sphere on a column, like the new tower that carries the Robin
  R(cx - 6, by - h, 12, h, '#c8d2dc'); R(cx - 6, by - h, 3, h, '#e0e8f0');
  ctx.fillStyle = '#e8eef6'; ctx.beginPath(); ctx.arc(cx, by - h - 22, 26, 0, 7); ctx.fill();
  ctx.strokeStyle = '#9aa8b8'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, by - h - 22, 26, 0, 7); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(cx - 9, by - h - 31, 7, 0, 7); ctx.fill();
}
function sumTree(x, by, k) { R(x - 2, by - 14, 4, 14, '#6a4a2a'); ctx.fillStyle = k ? '#3a8a3a' : '#2e7a40'; ctx.beginPath(); ctx.arc(x, by - 22, 13, 0, 7); ctx.fill(); ctx.fillStyle = '#5aa84a'; ctx.beginPath(); ctx.arc(x - 4, by - 26, 6, 0, 7); ctx.fill(); }
function sumLedger(cx, cy) { R(cx - 40, cy - 22, 80, 44, '#3a2a1a'); R(cx - 38, cy - 20, 37, 40, '#f4f0e4'); R(cx + 1, cy - 20, 37, 40, '#f4f0e4'); for (let i = 0; i < 8; i++) { R(cx - 34, cy - 14 + i * 4, 29, 1, '#9a9488'); R(cx + 5, cy - 14 + i * 4, 29, 1, '#9a9488'); } }
function sumClip(cx, cy) { R(cx - 24, cy - 30, 48, 60, '#8a6a3a'); R(cx - 20, cy - 24, 40, 50, '#f6f4ee'); R(cx - 8, cy - 34, 16, 8, '#b8b8c0');
  for (let i = 0; i < 5; i++) { R(cx - 16, cy - 18 + i * 9, 5, 5, '#3a3a44'); R(cx - 15, cy - 17 + i * 9, 3, 3, '#f6f4ee'); R(cx - 8, cy - 16 + i * 9, 22, 1, '#9a9488'); } }
function sumTag(x, y) { R(x - 5, y - 8, 10, 14, '#c82828'); R(x - 1, y - 6, 2, 2, '#f0f0f0'); R(x - 3, y - 1, 6, 1, '#f0b0b0'); R(x - 3, y + 2, 6, 1, '#f0b0b0'); }
function sumSpray(x, y, t, col) { for (let i = 0; i < 14; i++) { const k = (i * 7 + t * 3) % 60; R(x + k * 1.6, y - Math.sin(k / 60 * Math.PI) * 26, 2, 2, col); } }
function sumSnow(x, y, t) { for (let i = 0; i < 18; i++) { const k = (i * 11 + t * 4) % 40; R(x + k * 1.2 + (i % 3) * 3, y - k * 0.9 - (i % 5) * 3, 2, 2, i % 3 ? '#ffffff' : '#d8e8ff'); } }
function sumSparkle(t, col) { for (const u of partyUnits()) { const [x, y] = partyPos(u); for (let i = 0; i < 5; i++) { const k = (t * 2 + i * 13) % 30; R(x - 10 + (i * 7) % 20, y - 10 - k * 1.5, 2, 2, col); } } }
function sumRain(t) { for (const u of partyUnits()) { const [x, y] = partyPos(u); for (let i = 0; i < 6; i++) { const k = (t * 3 + i * 9) % 40; R(x - 12 + i * 5, y - 70 + k * 1.6, 1, 4, '#9ad0ff'); } } }
function sumPapers(e) { const p = Math.min(1, (e - 0.25) / 0.6);
  for (const u of livingFoes()) { const [fx, fy] = foePos(u); for (let i = 0; i < 3; i++) { const q = Math.max(0, Math.min(1, p * 1.3 - i * 0.12)), x = SW / 2 + (fx - SW / 2) * q, y = 64 + (fy - 104) * q - Math.sin(q * Math.PI) * 20;
    R(x - 4, y - 5, 8, 10, '#f4f0e4'); R(x - 3, y - 3, 6, 1, '#9a9488'); R(x - 3, y, 6, 1, '#9a9488'); } } }
function sumTags(e) { const p = Math.min(1, (e - 0.35) / 0.4); for (const u of livingFoes()) { const [fx, fy] = foePos(u); sumTag(fx, fy - 60 - (1 - p) * 60); } }
function sumCone(x, by) { R(x - 5, by - 2, 10, 2, '#1a1a1a'); for (let i = 0; i < 6; i++) R(x - 3 + (i >> 1), by - 4 - i * 2, 6 - (i >> 1) * 2 || 1, 2, i % 3 === 1 ? '#f4f4f4' : '#f0782a'); }
function sumScroll(x, y, open) {   // a proclamation: paper unrolling, lines of text, a gold seal
  const h = Math.round(110 * open); R(x - 4, y - 6, 108, 8, '#a8844a'); R(x - 4, y + h - 2, 108, 8, '#a8844a');
  if (h > 4) { R(x, y, 100, h, '#f4ecd2'); for (let i = 0; i < 8 && 12 + i * 11 < h - 10; i++) R(x + 12, y + 12 + i * 11, i ? 76 : 50, 2, '#7a6a4a'); }
  if (open > 0.8) { ctx.fillStyle = '#e8b830'; ctx.beginPath(); ctx.arc(x + 80, y + h - 18, 9, 0, 7); ctx.fill(); R(x + 76, y + h - 10, 3, 10, '#c82828'); R(x + 82, y + h - 10, 3, 10, '#c82828'); } }
function sumMonitor(x, y, p, t) {   // an office monitor rebooting: a progress bar fills
  R(x, y, 140, 96, '#2a2c34'); R(x + 6, y + 6, 128, 78, '#0c1a12'); R(x + 60, y + 96, 20, 10, '#2a2c34'); R(x + 40, y + 104, 60, 5, '#2a2c34');
  txt(p < 1 ? 'REBOOTING' + '...'.slice(0, (t >> 3) % 4) : 'READY', x + 70, y + 26, '#5ad87a', 'center', SMALL); R(x + 20, y + 50, 100, 10, '#1e3a28'); R(x + 21, y + 51, Math.round(98 * p), 8, '#5ad87a'); }
function sumCart(x, by) { R(x, by - 34, 60, 30, '#7a4a2a'); R(x + 2, by - 32, 56, 12, '#5a3420'); R(x + 2, by - 18, 56, 12, '#5a3420');
  const C = ['#c83a3a', '#3a6ab8', '#e8b830', '#3a9a5a', '#8a4ab8', '#e8862a']; for (let i = 0; i < 9; i++) { R(x + 4 + i * 6, by - 32 + (i % 2), 5, 11 - (i % 2), C[i % 6]); R(x + 4 + i * 6, by - 18 + ((i + 1) % 2), 5, 11 - ((i + 1) % 2), C[(i + 3) % 6]); }
  R(x + 6, by - 4, 6, 6, '#1a1a1a'); R(x + 48, by - 4, 6, 6, '#1a1a1a'); }
function sumBook(x, y) { R(x - 9, y - 6, 18, 13, '#3a1a10'); R(x - 8, y - 5, 8, 11, '#f4f0e4'); R(x, y - 5, 8, 11, '#f4f0e4'); R(x - 6, y - 2, 5, 1, '#9a9488'); R(x + 2, y - 2, 5, 1, '#9a9488'); R(x - 6, y + 1, 5, 1, '#9a9488'); R(x + 2, y + 1, 5, 1, '#9a9488'); }
function sumStream(t, p) {   // clean water out of the plant's outfall, running into the brook
  R(0, FH - 40, 40, 18, '#6a6e78'); R(36, FH - 42, 8, 22, '#8a8e98');
  const w = Math.round((SW - 40) * p); R(40, FH - 24, w, 24, '#2a6ab8'); for (let i = 0; i < 24; i++) { const k = (t * 4 + i * 29) % Math.max(1, w); R(40 + k, FH - 20 + (i % 4) * 5, 6, 1, '#9ad0ff'); } }
function sumTrout(x, y, t) {   // a brook trout: olive back, pale spots, red spots, white-edged fins
  ctx.fillStyle = '#5a6a3a'; ctx.beginPath(); ctx.ellipse(x, y, 22, 7, -0.25, 0, 7); ctx.fill(); ctx.fillStyle = '#e8a060'; ctx.beginPath(); ctx.ellipse(x + 2, y + 3, 16, 3, -0.25, 0, 7); ctx.fill();
  for (let i = 0; i < 6; i++) R(x - 14 + i * 5, y - 3 + (i % 2) * 2, 2, 2, i % 3 ? '#e8e0a0' : '#e83a3a');
  R(x - 26, y + 3, 6, 6, '#5a6a3a'); R(x + 6, y + 5, 4, 3, '#f4f4f4'); }
const SUMMON_DRAW = {
  fire: (t, e) => { const x = -150 + e * (SW + 300); sumFire(x, 118, 3, t); sumAmb(x - 140, 124, 3, t); if (e > 0.25 && e < 0.92) sumSpray(x + 140, 132, t, '#a8d8ff'); if (e > 0.4) sumSparkle(t, '#a8f0b0'); },
  police: (t, e) => { sumPolice(-120 + Math.min(1, e * 1.6) * 230, 134, 3, t); if (e > 0.5) R(196, 0, SW - 196, FH, (t >> 2) % 2 ? 'rgba(255,40,40,.13)' : 'rgba(40,90,255,.13)'); },
  plow: (t, e) => { const x = -150 + e * (SW + 180); sumPlow(x, 122, 3, t); sumSnow(x + 142, 150, t); },
  works: (t, e) => { sumTower(150, FH + 4, 66 * Math.min(1, e * 2)); if (e > 0.45) sumRain(t); for (let i = 0; i < 5; i++) sumCone(40 + i * 24, FH - 6 - (i % 2) * 4); },
  mayor: (t, e) => { sumScroll(SW / 2 - 50, 40, Math.min(1, e * 1.8)); if (e > 0.55) sumSparkle(t, '#ffe680'); },
  it: (t, e) => { sumMonitor(SW / 2 - 70, 46, Math.min(1, e * 1.5), t); for (let i = 0; i < 16; i++) { const k = (t * 3 + i * 17) % FH; txt(i % 2 ? '1' : '0', 12 + (i * 23) % (SW - 24), k, '#5ad87a', 'left', SMALL); } },
  library: (t, e) => { const tg = (BT.act && BT.act.tgts && BT.act.tgts[0]) || livingFoes()[0]; sumCart(-80 + Math.min(1, e * 1.4) * 170, 150); if (tg && e > 0.45) { const [fx, fy] = foePos(tg), q = Math.min(1, (e - 0.45) / 0.4), x = 120 + (fx - 120) * q, y = 140 + (fy - 60 - 140) * q - Math.sin(q * Math.PI) * 40; sumBook(x, y); } },
  sewer: (t, e) => { sumStream(t, Math.min(1, e * 1.6)); if (e > 0.5) sumTrout(SW / 2 + 40, FH - 30 - Math.sin(Math.min(1, (e - 0.5) / 0.35) * Math.PI) * 60, t); },
  parks: (t, e) => { R(0, 0, SW, FH, 'rgba(120,200,255,' + (0.18 * Math.min(1, e * 3)) + ')');
    ctx.fillStyle = '#ffe680'; ctx.beginPath(); ctx.arc(40, 34, 14, 0, 7); ctx.fill(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + t / 30; R(40 + Math.cos(a) * 22 - 1, 34 + Math.sin(a) * 22 - 1, 3, 3, '#ffe680'); }
    for (let i = 0; i < 7; i++) sumTree(((i * 70 + e * 260) % (SW + 60)) - 30, FH - 2, i % 2);
    for (let i = 0; i < 12; i++) { const k = (t * 2 + i * 23) % 120; R((i * 37 + k) % SW, (k * 1.4 + i * 11) % FH, 2, 2, i % 2 ? '#e8c040' : '#6ab84a'); } },
  record: (t, e) => { sumLedger(SW / 2, 64); if (e > 0.25) sumPapers(e); },
  inspect: (t, e) => { sumClip(SW / 2 - 40, 84); if (e > 0.35) sumTags(e); },
  mutual: (t, e) => { const x = -380 + e * (SW + 440); sumPlow(x - 40, 134, 2, t); sumAmb(x + 80, 138, 2, t); sumFire(x + 180, 132, 2, t); sumPolice(x + 300, 148, 2, t);
    if (e > 0.85) R(0, 0, SW, FH, 'rgba(255,255,255,' + ((e - 0.85) / 0.15 * 0.6) + ')'); },
};
function drawSummon(kind, t) {
  const k = Math.max(0, Math.min(1, t / 8, (SUMMON_T - t) / 8)), p = Math.max(0, Math.min(1, (t - 6) / (SUMMON_T - 16))), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SW, FH); ctx.clip();
  R(0, 0, SW, FH, 'rgba(6,8,20,' + (0.62 * k) + ')');
  const D = SUMMON_DRAW[kind]; if (D) { ctx.globalAlpha = Math.min(1, k * 1.5); D(t, e); ctx.globalAlpha = 1; }
  const name = SUMMON_NAME[kind] || ''; ctx.font = FONT; const w = Math.round(ctx.measureText(name).width) + 24, x = Math.round(-w + Math.min(1, t / 10) * (w + (SW - w) / 2));
  win(x, FH - 28, w, 18); txt(name, x + w / 2, FH - 23, '#ffd860', 'center');
  ctx.restore();
}
