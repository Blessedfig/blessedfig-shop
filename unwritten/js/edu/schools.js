"use strict";
// =====================================================================
//  THE SCHOOLS (Nov 16): West, East and North Elementary, the Middle School, the High School, Saint John Grade School and
//  Peace Lutheran School, each with the skill tree inside. Their people are generic stand-ins (nobody real): the front office,
//  a teacher, the librarian, the gym teacher, the counselor, the lunch line, the shop teacher. Grade spans follow the 2023-24
//  federal school data (NCES); the district sets them and they change, so the lines say "these days".
//  Christian, Nov 16: "We need an npc to explain how the funding and school boards and state/county/federal law work for the
//  schools" — the front office explains it in the study window (sources: DPI School Financial Services; Legislative Fiscal
//  Bureau papers on revenue limits and state aid; Wis. Stat. 118.33, 120.44(2), 65.90; Legislative Council issue briefs).
// =====================================================================
Object.assign(FOLKS, {
  secretary: { skin: '#ecc19c', hair: '#8a5a2a', shirt: '#c85a7a', shirt2: '#b84a6a', pants: '#3a3a44', shoes: '#2a2224', glasses: 1 },
  coach: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#a02828', shirt2: '#f0ece2', pants: '#2a2c34', shoes: '#e8e8ea', extra: 'cap' },
  counselor: { skin: '#c99878', hair: '#2e2018', shirt: '#4a7a8a', shirt2: '#3a6a7a', pants: '#3a3a44', shoes: '#2a2224' },
  lunch: { skin: '#f0c8a0', hair: '#c8c4bc', shirt: '#f4f2ea', shirt2: '#f4f2ea', pants: '#3a3a44', shoes: '#2a2224', apron: '#5a9ae8' },
  shopteach: { skin: '#e2b48e', hair: '#5a3a24', shirt: '#3a4a3a', shirt2: '#2e3a2e', pants: '#3a4a6a', shoes: '#2a2224', glasses: 1 } });
// which band each building starts on, and what to say about it
const SCHOOLS = {
  'West Elementary': { band: 'K2', kind: 'elem', about: 'West Elementary, on Seventh Avenue: one of the district\'s elementary schools, from pre-kindergarten up.' },
  'East Elementary': { band: 'K2', kind: 'elem', about: 'East Elementary, 220 Seventh Avenue. In recent federal school data it serves pre-kindergarten through grade 3.' },
  'North Elementary': { band: 'K2', kind: 'elem', about: 'North Elementary, 506 Graham Avenue. In recent federal school data it serves pre-kindergarten through grade 3.' },
  'Antigo Middle School': { band: '35', kind: 'mid', about: 'Antigo Middle School, 815 Seventh Avenue. In the 2023-24 federal data it served grades 4 through 7; the district sets the grades and has changed them before.' },
  'Antigo High School': { band: 'HS', kind: 'high', about: 'Antigo High School, home of the Red Robins, on Tenth Avenue. In the 2023-24 federal data it served grades 8 through 12.' },
  'Saint John Grade School': { band: 'K2', kind: 'elem', faith: 1, about: ['Saint John Grade School, 412 Hudson Street: a grade school run by its congregation.', 'Private schools in Wisconsin set their own curriculum, and many teach their faith alongside it.'] },
  'Peace Lutheran School': { band: 'K2', kind: 'elem', faith: 1, about: ['Peace Lutheran School, 300 Lincoln Street, run by Peace Lutheran Church.', 'Private schools in Wisconsin set their own curriculum, and many teach their faith alongside it.'] } };
// the high school and the middle school are several buildings at one address: the entrances get the school's name
{ const name = (addr, n) => BLD.filter(b => b.addr === addr && b.door && ['school', 'civic'].includes(b.type)).forEach(b => { if (!b.name) b.name = n; });
  name('2030 10TH AVE', 'Antigo High School'); name('1914 10TH AVE', 'Antigo High School'); name('815 7TH AVE', 'Antigo Middle School'); name('506 GRAHAM AVE', 'North Elementary'); }
// ---------- what the front office says ----------
const SCHOOL_MONEY = [
  { t: 'words', w: [['revenue limit', 'the most a district may raise from general state aid and property taxes together'], ['equalization aid', 'the state\'s main school aid; more goes where there is less property value per student'],
    ['levy', 'the property tax the district collects'], ['referendum', 'a vote of the district\'s residents, needed to go over the limit or to borrow for buildings'], ['school board', 'the elected members who run the district']] },
  { t: 'idea', h: 'Four streams of money', p: ['Wisconsin public schools get their money from four places: **state aid**, **property taxes**, **federal aid**, and other local money such as fees and interest.', 'Most of it is the first two.'],
    fig: ['money', [['state aid', 4], ['property taxes', 4], ['federal aid', 1], ['fees and other', 0.6]]] },
  { t: 'idea', h: 'The revenue limit', p: ['Since 1993, state law caps how much a district may raise from **general state aid and property taxes combined**, mostly per student.', 'So the two move against each other: when the state sends more general aid, the district\'s room to tax property shrinks by the same amount, and the other way around.'] },
  { t: 'idea', h: 'Equalization aid', p: ['The biggest general aid program tries to even out what districts can afford. It looks at three things: **property value per student**, what the district spends, and how many students it has.', 'A district with less property value behind each student gets a bigger share from the state.'] },
  { t: 'idea', h: 'Going over the limit takes a vote', p: ['To raise more than the limit allows, a district asks its residents in a **referendum**. Some pay for operating costs for a set number of years; others let the district borrow for buildings.', 'If the vote fails, the limit stands.'] },
  { t: 'idea', h: 'Federal money comes with strings', p: ['Federal aid pays for particular things: **Title I** for schools with many students from low-income families, **IDEA** for special education, and school meals through the USDA.', 'Federal law (ESSA) also requires yearly reading and math tests in grades 3-8 and once in high school. Wisconsin gives the **Forward Exam** in grades 3-8 and the **ACT** in grade 11.'] },
  { t: 'idea', h: 'The school board', p: ['Board members are elected at the nonpartisan **spring election** to three-year terms. The board hires the superintendent and sets policy.', 'Antigo\'s is a **unified** school district, so there is no annual meeting of voters: the board holds the powers of both (Wis. Stat. 120.44). It holds a public budget hearing, adopts the budget and sets the levy by **November 1**, and certifies it to the towns and city by November 10.'] },
  { t: 'idea', h: 'Who writes the rules', p: ['The **Legislature** writes school law (Wisconsin Statutes, chapters 115 to 121) and sets state aid in each two-year budget. The **Department of Public Instruction**, led by the elected State Superintendent, carries it out.', 'Federal law adds conditions to federal money. Counties don\'t run schools in Wisconsin; regional service agencies (CESAs) help districts share specialists and services. The board decides the rest, in meetings open to the public.'] },
  { t: 'idea', h: 'The diploma', p: ['State law sets the floor for a diploma: 4 credits of English, 3 of math, 3 of science, 3 of social studies (with state and local government), 1.5 of physical education, 0.5 of health and, starting with the class of 2028, 0.5 of personal financial literacy.', 'Students also take a 100-question civics test, the same questions used for U.S. citizenship, and must get **65 right**. School boards may require more.'] },
  { t: 'real', h: 'Look it up yourself', p: 'Budgets, minutes and votes are public records. The Department of Public Instruction posts every district\'s finances, and the Legislative Fiscal Bureau explains the whole system in plain papers anyone can read.' }];
function schoolMoney() { studyCards('HOW SCHOOLS ARE RUN AND PAID FOR', 'THE FRONT OFFICE · Wisconsin public schools', '#e8b84a', SCHOOL_MONEY, 0, {}); }
function schoolOffice(name) {
  const S = SCHOOLS[name] || {}; eduState(); G.edu.school = name;
  ask('Front office: Welcome to ' + name + '! Sign in, please. What can I help you with?', [
    { t: 'The skill tree', f: () => eduTree({ band: S.band, school: name }) },
    { t: 'My report card', f: () => studyReport() },
    { t: 'How schools are run and paid for', f: schoolMoney },
    { t: 'About this school', f: () => say([...[].concat(S.about || name + '.').map(a => ['Front office', a]), ['Front office', 'Everything here runs on the skill tree: you pick what to learn next, prove it, and it opens the next thing. Anybody can test out of anything.'], ['', '(Stand-in staff. Christian will say who works here.)']]) },
    ...(G.edu.diploma ? [{ t: 'My diploma', f: () => say([['Front office', 'Every Wisconsin requirement, met. Your diploma\'s right here.'], ['', 'It says your name, and the date. That\'s all a diploma ever says. What you can do is the part that counts.']]) }] : []),
    { t: 'Bye' }]);
}
function schoolTeacher(name, band, lane) {
  say([['Teacher', 'Morning! Here nobody lectures the whole room. You pick a skill on the tree, learn it your way, and prove it.'], ['Teacher', 'Stuck? Every skill has worked examples. Already know it? Test out.']], () => eduTree({ band, lane, school: name }));
}
// ---------- the building: an entry commons with the office, a hall, rooms across the back ----------
function schoolLayout(name) {
  const S = SCHOOLS[name] || { kind: 'elem', band: 'K2' };
  return (F, c) => {
    const { fx0, fx1, fy0, fy1, xs, put } = c, hv = fy0 + 8, rooms = S.kind === 'elem' ? [['CLASSROOM', 'classroom'], ['LIBRARY', 'library'], ['GYM', 'gym'], ['CAFETERIA', 'school']]
      : [['CLASSROOM', 'classroom'], ['LIBRARY', 'library'], ['GYM', 'gym'], ['SHOP', 'shopfloor'], ['COUNSELING', 'classroom']];
    const n = Math.min(rooms.length, Math.max(2, Math.floor((fx1 - fx0 + 2) / 6))), w = Math.floor((fx1 - fx0 + 2) / n);
    for (let i = 0; i < n; i++) {
      const u0 = fx0 - 1 + i * w, u1 = i === n - 1 ? fx1 + 1 : fx0 - 1 + (i + 1) * w, du = (u0 + u1) >> 1, a = u0 + 1, b = u1 - 1, [rn, st] = rooms[i];
      innerWalls(F, u0, fy0 - 1, u1, hv, [[du, hv]]); addZone(F, rn, a, fy0, b, hv - 1, ROOM_STYLE[st] ? st : 'classroom');
      if (rn === 'CLASSROOM') { for (let u = a; u <= b; u++) put(u, fy0, '<'); for (const v of [fy0 + 3, fy0 + 5]) for (let u = a; u <= b - 1; u += 2) { put(u, v, 'T'); put(u, v + 1, 'h'); }
        hookNpc(F, 'teacher', du, fy0 + 1, () => schoolTeacher(name, S.band), 'Teacher'); }
      if (rn === 'LIBRARY') { for (let u = a; u <= b; u += 2) put(u, fy0, 'K'); put(a, fy0 + 4, 'M'); put(Math.min(b, a + 2), fy0 + 4, 'M');
        hookNpc(F, 'librarian', du, fy0 + 2, () => say([['Librarian', 'The library is where questions go to get answered. Books, databases, and me.'], ['Librarian', 'Want to practice finding and checking sources? It\'s on the tree.']], () => eduTree({ sel: 'e_sources', school: name })), 'Librarian'); }
      if (rn === 'GYM') { for (let u = a; u <= b; u += 3) put(u, fy0, 'g');
        hookNpc(F, 'coach', du, fy0 + 3, () => say([['Gym teacher', 'Kids and teens need about an hour of moving a day. Adults, about two and a half hours a week. That\'s the federal guideline, not me yelling.'], ['Gym teacher', 'Health and PE are on the tree. Some of it you finish outside: Springbrook has a disc golf course.']], () => eduTree({ lane: 'body', school: name })), 'Gym teacher'); }
      if (rn === 'CAFETERIA') { for (const v of [fy0 + 2, fy0 + 4]) for (let u = a; u <= b - 1; u += 3) { put(u, v, 'T'); put(u + 1, v, 'T'); }
        hookNpc(F, 'lunch', du, fy0 + 1, () => say([['Lunch line', 'Today: chicken on a bun, green beans, an apple, and milk. Same as half the schools in the state, probably.'], ['', '(A stand-in menu.)']]), 'Lunch line'); }
      if (rn === 'SHOP') { for (let u = a; u <= b; u += 3) put(u, fy0 + 1, '}');
        hookNpc(F, 'shopteach', du, fy0 + 4, () => say([['Shop teacher', 'Safety glasses on before anything else. Then: measure twice, cut once.'], ['Shop teacher', 'Building, wiring, coding, wood: it\'s all under MAKE on the tree. The NTC wood center\'s across town if you want the real sawmill.']], () => eduTree({ lane: 'make', school: name })), 'Shop teacher'); }
      if (rn === 'COUNSELING') { put(a, fy0 + 1, 'T'); put(a + 1, fy0 + 1, 'h');
        hookNpc(F, 'counselor', du, fy0 + 3, () => say([['Counselor', 'I help people figure out what they want to do and how to get there. Classes, careers, college, the trades.'], ['Counselor', 'Start with what you\'re good at and what problems you\'d like to work on. PEOPLE & SELF on the tree has a skill for that.']], () => eduTree({ sel: 'ps_purpose', school: name })), 'Counselor'); }
    }
    for (let v = hv + 3; v <= fy1 - 3; v += 2) put(fx0, v, 'M');   // the commons' computers: the tree
    const cx = Math.min(fx1 - 4, xs + 3); put(cx, fy1 - 3, 'c'); put(cx + 1, fy1 - 3, 'c'); put(cx + 2, fy1 - 3, 'k');
    hookNpc(F, 'secretary', cx + 1, fy1 - 4, () => schoolOffice(name), 'Front office');
  };
}
for (const name of Object.keys(SCHOOLS)) {
  const S = SCHOOLS[name];
  ROOM_HOOK[name] = { enter: true, kind: 'school', lobby: S.kind === 'elem' ? [30, 22] : [36, 26], title: name.toUpperCase(),
    line: name + '. Lockers, a trophy case, artwork taped up by the office, and that school smell: floor wax and pencils.',
    zone: (F, x, y) => { const z = zoneAt(F, x, y); return z ? z.name : 'COMMONS'; },
    layout: schoolLayout(name),
    look: (F, x, y, t) => {
      if (t === 'M') { eduTree({ band: S.band, school: name }); return true; }
      const z = (zoneAt(F, x, y) || {}).name;
      const L = { '<': ['A whiteboard. Somebody drew the skill tree on it and circled one box: START HERE.'], T: [z === 'CAFETERIA' ? 'A cafeteria table, the bench attached.' : 'A student desk. Initials carved under the lip, decades of them.'],
        K: ['Shelves of books: the encyclopedias nobody moves, a run of graphic novels everybody does.'], g: ['The gym floor. A painted Red Robin at center court.'], '}': ['A drill press and a band saw, guards down, a sign: ASK FIRST.'], ...FLOOR_LOOK }[t];
      if (L) { say(L.map(s => ['', s])); return true; }
    } };
}
for (const b of BLD) if (b.name && SCHOOLS[b.name]) b.enter = b.enter || 1;
// a record of real places visited, for the projects (the museum, the library, the wood lab...)
{ const _er = enterRoom; enterRoom = function (b) { if (G) { eduState(); G.edu.v = G.edu.v || {}; if (b && b.name) G.edu.v[b.name] = 1; } return _er(b); }; }
function eduVisited(name) { return !!(G && G.edu && G.edu.v && G.edu.v[name]); }
// the bookstore isn't a room (enterFig has its own floors): a word with Christian at the counter counts as the sales visit
{ const _fl = figLook; figLook = function (x, y) {
  try { if (G && G.inside && G.inside.f === 'main' && figChristianHere()) { const t = figTile(x, y);
    if (t === 'X' || ((t === 'c' || t === 'k') && y === 18)) { eduState(); G.edu.v = G.edu.v || {}; G.edu.v['The Blessed Fig Tree'] = 1; } } } catch (e) {}
  return _fl(x, y); }; }
