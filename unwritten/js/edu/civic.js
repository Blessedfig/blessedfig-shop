"use strict";
// =====================================================================
//  CITY HALL AND THE COURTHOUSE (Nov 16): how the city and the county are run and paid for, in the study window.
//  Christian, Nov 16: "We need an npc to explain how the funding and school boards and state/county/federal law work for the
//  schools and city as well, and county at each respective location." The schools' front offices do the schools (schools.js);
//  the city clerk at City Hall (700 Edison St) does the city; the county clerk at the courthouse (800 Clermont St) does the
//  county and the courts. The clerks are generic stand-ins (nobody real). The City Administrator is a role, not a person.
//  Sources: Wis. Const. art. VI s. 4, art. VII s. 7, art. XI s. 3; Wis. Stat. ch. 59 and 62, 19.31-19.39 (records), 19.81-19.98
//  (open meetings), 66.0602 (levy limits), 66.0615 (room tax), 66.1105 (tax incremental financing), 70.47 (board of review),
//  74.11 (paying property tax); Legislative Fiscal Bureau, Informational Paper 22 and its 2023 memo on County and Municipal Aid;
//  DOR, County and Municipal Aid (2025); DOR Tax Report 3-87 (Langlade's 0.5% county tax from April 1, 1988); PSC water rate
//  pages (Antigo Utilities is utility 180); Langlade County news (21 supervisory districts).
// =====================================================================
const TAX_BILL = [
  { t: 'idea', h: 'One bill, four governments', p: ['A property tax bill in Antigo carries four levies: the **City of Antigo**, **Langlade County**, the **Antigo school district** and **Northcentral Technical College**. Each sets its own; the bill just adds them up.', 'The city treasurer collects it and passes each government its share.'] },
  { t: 'idea', h: 'How your share is figured', p: ['The **assessor** values every property. Each government\'s levy is spread over all that value, so your share follows your property\'s value.', 'Think the value is wrong? Talk to the assessor first, then you can object at the **board of review** (Wis. Stat. 70.47).'] },
  { t: 'idea', h: 'Credits and due dates', p: ['The state takes some off the top: the **school levy tax credit** on every bill, and the **lottery and gaming credit** for a home you live in.', 'Bills go out in December. Pay it all, or the first installment, by **January 31**; the rest by **July 31**.'] },
  { t: 'real', h: 'Look it up yourself', p: 'Every rate on the bill is public, and so is every levy. The Department of Revenue publishes each city\'s and county\'s finances, and the assessor\'s records are open to anyone.' }];
const CITY_GOV = [
  { t: 'words', w: [['mayor', 'elected citywide; runs the council meetings and can veto'], ['alderperson', 'a council member, elected from one district'], ['common council', 'the alderpersons: they pass the laws and the budget'],
    ['city administrator', 'hired by the council to run the departments day to day'], ['ordinance', 'a city law'], ['levy', 'the property tax the city collects']] },
  { t: 'idea', h: 'Who decides', p: ['Antigo is a **city** under chapter 62 of the Wisconsin Statutes, with a **mayor and common council**. Voters elect the mayor citywide and an **alderperson** from each district, at the nonpartisan **spring election** in April.', 'The council passes **ordinances**, adopts the budget and sets the tax. The mayor presides and can veto; the council can override with a two-thirds vote.'] },
  { t: 'idea', h: 'Who does the work', p: ['The council hires a **city administrator** to run the departments day to day: police, fire and ambulance, streets and plowing, water and sewer, parks, building inspection and zoning, the clerk and the treasurer.', 'In Wisconsin cities a citizen **police and fire commission** hires the police and fire chiefs and hears discipline cases (Wis. Stat. 62.13).'] },
  { t: 'idea', h: 'What the state decides', p: ['A city\'s powers come from the state. The Wisconsin Constitution and chapter 62 let cities run their **local affairs** ("home rule"), but state law wins on matters of statewide concern.', 'The state sets the rules for elections, budgets, open meetings, public records, police and fire, zoning, and how fast the property tax may grow.'] },
  { t: 'idea', h: 'Where the money comes from', p: ['**Property tax** (the levy); **state aid**; **charges** for services such as ambulance runs and permits; **grants** for particular projects; and **borrowing** for big ones, repaid with interest.', 'Water and sewer pay their own way through their own bills. The water utility (Antigo Utilities, in the state\'s records) can\'t raise water rates without the state **Public Service Commission**\'s approval.'] },
  { t: 'idea', h: 'The levy limit', p: ['State law caps how much a city\'s levy may grow each year: by the same percentage its property value grew from **net new construction**, with exceptions such as payments on debt (Wis. Stat. 66.0602).', 'To go over the cap, the council has to ask the voters in a **referendum**.'] },
  { t: 'idea', h: 'State aid', p: ['The state\'s **County and Municipal Aid**, the old "shared revenue," sends some state tax money back to cities and counties. A 2023 law (Act 12) raised it: Antigo\'s went from about **$2.8 million** in 2023 to **$3.4 million** in 2024.', 'The new, supplemental part may be spent only on police, fire, ambulance, emergency dispatch, public works and transportation.'] },
  { t: 'idea', h: 'Building now, paying later', p: ['In a **tax incremental district** (TIF), the city pays for roads, sewers or cleanup to get a project built. For up to 20 to 27 years, depending on the kind of district, the tax on the **new value** pays that back instead of going to the city, county, schools and college.', 'All of them sit on a **joint review board** that must approve the district (Wis. Stat. 66.1105).'] },
  { t: 'idea', h: 'Room tax and federal money', p: ['Cities may charge a **room tax** of up to 8 percent on stays under a month. State law sends most of it to promoting tourism (Wis. Stat. 66.0615).', 'Federal money mostly arrives through the state: highway funds, community development grants, disaster aid. Federal law also sets rules the city must meet, such as drinking water standards, which the state DNR enforces.'] },
  { t: 'idea', h: 'Watch them work', p: ['Council meetings are open to the public, with the agenda posted at least **24 hours** ahead (Wis. Stat. 19.84). Most meetings set aside time for public comment.', 'Most city records are public. Ask the clerk, out loud or in writing; you don\'t have to say why (Wis. Stat. 19.31-19.39).'] },
  ...TAX_BILL.slice(0, 1),
  { t: 'real', h: 'Look it up yourself', p: 'Council agendas, minutes and the budget are public records. The Department of Revenue posts every city\'s finances, and the Legislative Fiscal Bureau explains state aid and levy limits in plain papers anyone can read.' }];
const COUNTY_GOV = [
  { t: 'words', w: [['supervisor', 'a county board member, elected from one district'], ['county board', 'the supervisors: they pass the budget and the county\'s ordinances'], ['sheriff', 'the county\'s elected chief law officer; runs the jail'],
    ['register of deeds', 'keeps land records, plus births, deaths and marriages'], ['clerk of circuit court', 'the elected keeper of the court\'s files and fines'], ['town', 'a rural local government, run by a town board']] },
  { t: 'idea', h: 'The county board', p: ['Langlade County is run by a **board of supervisors**: **21** members, each elected from a district for two years at the April spring election. The board picks its own chair.', 'It passes ordinances, adopts the budget, sets the county tax and oversees the departments through committees.'] },
  { t: 'idea', h: 'Officers you elect', p: ['Some county officers are elected directly, in November, for four-year terms: the **sheriff**, **clerk**, **treasurer**, **register of deeds**, **clerk of circuit court** and **district attorney**, plus a coroner where a county hasn\'t switched to an appointed medical examiner.', 'The district attorney is elected by the county but paid by the state.'] },
  { t: 'idea', h: 'What the county does', p: ['The **sheriff\'s office** and the jail; the **courts**, with the state; the **highway department**, which keeps the lettered county roads and plows state highways under contract; **human services**, such as child protection, mental health and help for older people; **public health**.', 'Land records, and **zoning** outside the city and villages; the **county forest**, 130,003 acres; elections and marriage licenses through the clerk; the UW Extension office.'] },
  { t: 'idea', h: 'Where the money comes from', p: ['**Property tax** (capped like the city\'s); a **0.5 percent county sales tax**, on top of the state\'s 5 percent, in Langlade since April 1988; **state aid**, including County and Municipal Aid (about $1.2 million in 2024, up from $0.7 million) and money for human services and highways.', '**Federal** money, mostly passed through the state, for programs such as child support enforcement; **timber sales** from the county forest; and **fees**, such as for recording a deed.'] },
  { t: 'idea', h: 'Doing the state\'s work', p: ['The state writes county law (chapter 59) and gives counties jobs to do for it: courts, human services, elections, highways. Much of what a county does, the state or federal government decided; the county carries it out, with a mix of its own taxes and their money.', 'Day to day, Wisconsin counties are managed by an elected **county executive**, an appointed **administrator**, or an **administrative coordinator** the board names (Wis. Stat. 59.17-59.19).'] },
  { t: 'idea', h: 'Towns, villages and the city', p: ['Outside Antigo, the county is made up of **towns**, rural governments with a town board, and the **village** of White Lake.', 'Towns hold an **annual meeting** where the voters themselves can vote on some matters directly.'] },
  ...TAX_BILL.slice(0, 1),
  { t: 'real', h: 'Look it up yourself', p: 'County board agendas, minutes and the budget are public records. The register of deeds keeps land records, and Wisconsin\'s circuit court records are searchable online (Wisconsin Circuit Court Access).' }];
const COURTS = [
  { t: 'idea', h: 'A state court in a county building', p: ['The **circuit court** that sits in the courthouse is part of the **state** court system. Its judges are elected in April, without party labels, to **six-year** terms, and the state pays them.', 'The county supplies the courtrooms, and the elected **clerk of circuit court** keeps the files and collects the fines.'] },
  { t: 'idea', h: 'Kinds of cases', p: ['**Criminal** cases: the state, through the district attorney, charges someone with a crime. **Civil** cases: people or businesses sue over money, property or contracts. Also family, juvenile, probate (wills and estates) and **small claims**, for smaller amounts, where many people speak for themselves.'] },
  { t: 'idea', h: 'Up the ladder', p: ['Lose in circuit court and you can appeal to the **Court of Appeals**, then ask the **Wisconsin Supreme Court**. Federal crimes and many federal-law cases go to the **federal** courts instead, whose judges are appointed for life.'] },
  { t: 'real', h: 'Watch a hearing', p: 'Most court hearings are open to the public. Sit in the back, silence your phone, and stand when the judge comes in.' }];
function cityClerk() {
  ask('Clerk: City Hall. Paying a bill, pulling a permit, or just curious how all this works?', [
    { t: 'How the city is run and paid for', f: () => studyCards('HOW THE CITY IS RUN AND PAID FOR', 'CITY HALL · the City of Antigo', '#5a9ae8', CITY_GOV, 0, {}) },
    { t: 'My property tax bill', f: () => studyCards('YOUR PROPERTY TAX BILL', 'CITY HALL · one bill, four governments', '#5a9ae8', TAX_BILL, 0, {}) },
    { t: 'When does the council meet?', f: () => say([['Clerk', 'The common council meets in the chambers here. The agenda is posted at least a day ahead, and anybody can walk in and sit down.'], ['Clerk', 'There\'s usually time for public comment. Say your name and your piece. Short is better.'], ['', '(Stand-in staff. Christian will say who works here.)']]) },
    { t: 'Where\'s the city administrator?', f: () => say([['Clerk', typeof partyHas === 'function' && partyHas('admin') ? 'Out with you, I hear. Have them back for the budget meeting.' : typeof isRPG === 'function' && isRPG() ? 'Between meetings, for once. Over by the desks.' : 'At a meeting. Always at a meeting.'], ['Clerk', 'Police, fire, streets, water, parks, the inspectors: every department head answers to that office, and that office answers to the mayor and council.']]) },
    { t: 'Bye' }]);
}
function countyClerk() {
  ask('County clerk: Langlade County Clerk. Marriage licenses, election questions, the county board\'s papers. What do you need?', [
    { t: 'How the county is run and paid for', f: () => studyCards('HOW THE COUNTY IS RUN AND PAID FOR', 'THE COURTHOUSE · Langlade County', '#5ac878', COUNTY_GOV, 0, {}) },
    { t: 'The courts', f: () => studyCards('THE COURTS', 'THE COURTHOUSE · Wisconsin circuit court', '#5ac878', COURTS, 0, {}) },
    { t: 'My property tax bill', f: () => studyCards('YOUR PROPERTY TAX BILL', 'THE COURTHOUSE · one bill, four governments', '#5ac878', TAX_BILL, 0, {}) },
    { t: 'Bye' }]);
}
// a counter and its clerk on clear floor nearest the front, on the side away from the door (rooms aren't always boxes:
// the courthouse plan has an entry hall, so the bounding box's corners can be outside the building)
function civicCounter(F, c, talk, name) {
  const R = F.R, ok = (u, v) => !!(R[v] && R[v][u] === '.' && Math.abs(u - c.xs) > 1), us = [];
  for (let i = 0; i <= c.fx1 - c.fx0; i++) us.push(c.far < 0 ? c.fx0 + 1 + i : c.fx1 - 2 - i);
  for (let v = c.fy1 - 1; v > c.fy0 + 1; v--) for (const u of us)
    if (ok(u, v) && ok(u + 1, v) && ok(u, v - 1) && ok(u, v + 1) && ok(u + 1, v + 1)) { R[v][u] = 'c'; R[v][u + 1] = 'k'; hookNpc(F, 'clerk', u, v - 1, talk, name); return true; }
  return false;
}
// City Hall opens (an office: the clerk's counter, desks, the files); the courthouse gets a clerk's counter by the door
ROOM_HOOK['City Hall'] = { enter: true, title: 'CITY HALL',
  line: 'City Hall. A clerk\'s window, a rack of forms, and a corkboard of notices: the next council agenda, a public hearing on the budget.',
  layout: F => hookTalk(F, 'clerk', cityClerk),
  look: (F, x, y, t) => {
    if (t === 'F') { say([['', 'File cabinets: ordinances, minutes, budgets, permits. Public records, most of them. Ask the clerk.']]); return true; }
    if (t === 'd') { say([['', ['A desk with a nameplate: CITY ADMINISTRATOR. Budget binders, three coffee cups, a note: BACK AFTER THE MEETING.', 'A desk stacked with building permits waiting for a signature.', 'A desk with a radio scanner turned low, and a map of the snowplow routes.'][(x + y) % 3]]]); return true; }
  } };
{ const H = ROOM_HOOK['Langlade County Courthouse'] = ROOM_HOOK['Langlade County Courthouse'] || {}, _lay = H.layout, _look = H.look;
  H.layout = (F, c) => { if (_lay) _lay(F, c); civicCounter(F, c, countyClerk, 'County clerk'); };
  H.look = (F, x, y, t) => {
    if (_look && _look(F, x, y, t)) return true;
    if (t === 'j') { ask('The judge\'s bench, empty this afternoon. A brass plate: CIRCUIT COURT.', [{ t: 'Read about the courts', f: () => studyCards('THE COURTS', 'THE COURTHOUSE · Wisconsin circuit court', '#5ac878', COURTS, 0, {}) }, { t: 'Leave it' }]); return true; }
    if (t === 'p') { say([['', 'A courtroom pew, worn smooth. Most hearings are open to anyone who wants to sit and watch.']]); return true; }
  }; }
for (const b of BLD) if (b.name === 'City Hall') b.enter = b.enter || 1;
