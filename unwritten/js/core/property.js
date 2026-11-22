"use strict";
// =====================================================================
//  BUYING PROPERTY AT CR REALTY, WITH A LOAN FROM A BANK (Nov 14). Christian: "Yes tie it in" (borrowing joins the game) and
//  "Yes real due dates". NOT FINAL. The listings are made up (no real address, no real home), every price and rate is a
//  placeholder, and what owning each place does waits on Christian. The steps follow a real Wisconsin purchase, in order:
//   1. An accepted offer, written on the form the state's Real Estate Examining Board approves (WB-11 for a home, WB-13 for vacant
//      land), and the seller's condition report (Wis. Stat. ch. 709).
//   2. A property loan. The Loan Estimate comes the day you apply. The Closing Disclosure must reach you at least 3 business days
//      before closing, and closing can't come sooner than 7 business days after the Loan Estimate (12 CFR 1026.19(e), (f)).
//      For those waits a business day is every day but Sundays and federal holidays (1026.2(a)(6)). The game uses the real calendar.
//   3. Closing at the realtor's: the down payment, the note and mortgage, and the deed, recorded with the county Register of Deeds.
//  A first mortgage is outside the Wisconsin Consumer Act (421.202(7)), so a property loan gets no 15-day cure notice (banks.js).
//  A kid needs the trenchcoat (bars.js) to sign an offer, as for any loan. Sources: claude/banking-framework.md.
// =====================================================================
const PROP = { down: 0.10, apr: 6.9, terms: [26, 52], costs: 500 };   // placeholders: 10% down, rate, weekly terms, $5.00 closing costs
const LISTINGS = {
  plot: { name: 'garden plot', price: 10000, form: 'WB-13 Vacant Land Offer to Purchase', report: 'vacant land disclosure report',
    about: ['A quarter acre of Antigo silt loam at the edge of town, fenced, with a water spigot.', 'Good dirt. This is potato country.'], perk: 'Once a week you can dig a sack of potatoes there.' },
  cabin: { name: 'cabin up north', price: 30000, form: 'WB-11 Residential Offer to Purchase', report: 'real estate condition report',
    about: ['One room, a woodstove, a little dock on a lake, and pines all around.', 'A place to get away on the weekends.'], perk: 'Once a day you can head up north and rest.' },
  house: { name: 'little house in town', price: 60000, form: 'WB-11 Residential Offer to Purchase', report: 'real estate condition report',
    about: ['Two bedrooms, a porch, and a maple out front.', 'Your own front door.'], perk: 'Home. You can rest there any time.' },
};
const propDown = id => Math.ceil(LISTINGS[id].price * PROP.down);
const propCash = id => propDown(id) + PROP.costs;   // cash to close: the down payment and the closing costs
for (const [id, L] of Object.entries(LISTINGS)) itemDef('deed_' + id, { name: 'Deed: ' + L.name, kind: 'deed', note: 'Made up for the game.' });
itemDef('potatoes', { name: 'Sack of potatoes', kind: 'food', from: 'your garden plot' });

// ---------- business days, the way the mortgage waiting periods count them ----------
function fedHolidays(y) {   // the legal public holidays in 5 U.S.C. 6103(a), on their own dates
  const nth = (m, wd, k) => { const d = new Date(y, m, 1); return new Date(y, m, 1 + (wd - d.getDay() + 7) % 7 + (k - 1) * 7); };
  const last = (m, wd) => { const d = new Date(y, m + 1, 0); return new Date(y, m, d.getDate() - (d.getDay() - wd + 7) % 7); };
  return [new Date(y, 0, 1), nth(0, 1, 3), nth(1, 1, 3), last(4, 1), new Date(y, 5, 19), new Date(y, 6, 4), nth(8, 1, 1), nth(9, 1, 2),
    new Date(y, 10, 11), nth(10, 4, 4), new Date(y, 11, 25)].map(d => d.toDateString());
}
function isBizDay(d) { return d.getDay() !== 0 && !fedHolidays(d.getFullYear()).includes(d.toDateString()); }
function addBizDays(ts, n) { const d = new Date(ts); d.setHours(0, 0, 0, 0); for (let k = 0; k < n;) { d.setDate(d.getDate() + 1); if (isBizDay(d)) k++; } return d.getTime(); }
function dayStr(ts) { return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); }
function owns(id) { return !!(G.props && G.props[id]); }

// ---------- the realtor ----------
const HOW_BUY = [
  'First you find a place and make an offer. In Wisconsin it goes on a form the state\'s Real Estate Examining Board approves.',
  'If the seller signs, it\'s an accepted offer. The seller also gives you a report listing any problems they know about.',
  'Most people borrow most of the price. That loan is a mortgage. The bank owes you a Loan Estimate within 3 business days.',
  'At least 3 business days before closing you get a Closing Disclosure with the final numbers. Check it against the estimate.',
  'At closing you sign, pay your down payment, and get the deed. The deed is recorded at the county Register of Deeds.',
  '(In this game the places and prices are made up, and a property loan is paid weekly instead of monthly.)'];
function crTalk() {
  propTick();
  const D = G.deal, o = [];
  if (D) o.push({ t: 'My offer: the ' + LISTINGS[D.id].name, f: dealStatus });
  for (const [id, L] of Object.entries(LISTINGS)) if (!owns(id) && !(D && D.id === id)) o.push({ t: 'The ' + L.name + ' (' + money(L.price) + ')', f: () => listingShow(id) });
  if (G.props && Object.keys(G.props).length) o.push({ t: 'What I own', f: () => say(Object.keys(G.props).map(id => ['Realtor', 'The ' + LISTINGS[id].name + ', bought ' + new Date(G.props[id].bought).toLocaleDateString('en-US') + '. ' + LISTINGS[id].perk])) });
  o.push({ t: 'How does buying work?', f: () => say(HOW_BUY.map(s => ['Realtor', s])) }, { t: 'Bye' });
  ask('Realtor: Looking to buy? These are for sale. (Every listing here is made up for the game.)', o);
}
function listingShow(id) {
  const L = LISTINGS[id];
  say(L.about.map(s => ['Realtor', s]).concat([['', L.perk + ' (A placeholder until Christian decides.)']]), () =>
    ask('Realtor: The ' + L.name + ', ' + money(L.price) + '. Want to make an offer?', [{ t: 'Make an offer', f: () => propOffer(id) }, { t: 'Not yet' }]));
}
function propOffer(id) {
  const L = LISTINGS[id];
  if (G.deal) return say([['Realtor', 'Let\'s finish the deal you already have going first.']]);
  if (!passesAsAdult()) return say([['Realtor', 'Sorry, kiddo. An offer is a contract, and contracts are for grown-ups.']]);
  say([...(isMinor() ? [['Realtor', 'Sign right here, Mister... Mister. Love the mustache.']] : []),
    ['Realtor', 'In Wisconsin the offer goes on a state-approved form. For this place it\'s the ' + L.form + '.'],
    ['Realtor', 'The seller signs too, and then it\'s an accepted offer. They\'ll give you a ' + L.report + ' as well.'],
    ['', 'The seller accepts! (A made-up seller, and a made-up price.)']], () =>
    ask('Realtor: How will you pay? You have ' + money(cash()) + ' in cash.', [
      ...(cash() >= L.price + PROP.costs ? [{ t: 'Cash (' + money(L.price + PROP.costs) + ' with costs)', f: () => propCloseCash(id) }] : []),
      { t: 'A loan from a bank', f: () => { G.deal = { id, stage: 'offer', t: Date.now() }; saveGame();
        say([['Realtor', 'Take your accepted offer to a bank and apply for a property loan.'], ['Realtor', 'You\'ll need ' + money(propCash(id)) + ' of your own at closing: a 10% down payment, and closing costs.'],
          ['Realtor', 'Federal rules make a mortgage take about a week and a half, start to finish. Come back here to close.']]); } },
      { t: 'Never mind' }]));
}
function propOwn(id) { G.props = G.props || {}; G.props[id] = { bought: Date.now(), last: 0 }; bagAdd('deed_' + id); }
const CLOSE_LINES = id => [['Realtor', 'The seller signs the deed over to you. It gets recorded with the Register of Deeds, at the county courthouse.'],
  ['Realtor', 'In real life the seller also pays the state a transfer fee when the deed is recorded: 30 cents for every $100 of the price.'],
  ['', 'You own the ' + LISTINGS[id].name + '! The deed is in your bag. ' + LISTINGS[id].perk]];
function propCloseCash(id) {
  const L = LISTINGS[id]; if (!pay(L.price + PROP.costs)) return say([['Realtor', 'Hmm, that\'s more cash than you have on you.']]);
  propOwn(id); saveGame(); say([['Realtor', 'A cash closing. You pay the price and the closing costs, and sign.']].concat(CLOSE_LINES(id)));
}
function dealStatus() {
  const D = G.deal, L = LISTINGS[D.id], B = D.inst ? BANKS[D.inst] : null, now = Date.now();
  if (D.stage === 'offer') return ask('Realtor: Your offer on the ' + L.name + ' is accepted. Next: a property loan from a bank.', [{ t: 'Okay' }, { t: 'Cancel the deal', f: dealCancel }]);
  if (D.stage === 'le') return ask('Realtor: ' + B.name + ' gave you a Loan Estimate. Your Closing Disclosure is ready there ' + dayStr(D.cdReady) + '.', [{ t: 'Okay' }, { t: 'Cancel the deal', f: dealCancel }]);
  if (now < D.closeAt) return say([['Realtor', 'You have your Closing Disclosure. The earliest we can close is ' + dayStr(D.closeAt) + '. See you then!']]);
  if (!passesAsAdult()) return say([['Realtor', 'Hi there! I\'m waiting on a tall gentleman with a mustache. If you see him, send him in.']]);
  if (cash() < propCash(D.id)) return say([['Realtor', 'It\'s closing day! You\'ll need ' + money(propCash(D.id)) + ' for the down payment and costs. You have ' + money(cash()) + '.']]);
  pay(propCash(D.id));
  (G.loans = G.loans || []).push({ kind: 'property', prop: D.id, inst: D.inst, amt: D.amt, n: D.n, apr: D.apr, pmt: D.pmt, lastPmt: D.last, total: D.total, paid: 0, left: D.n, start: Date.now(), late: 0 });
  propOwn(D.id); G.deal = null; saveGame();
  say([['Realtor', 'Closing day! Sign here: that\'s the note, your promise to pay. And here: the mortgage, which puts up the property as security.'],
    ['Realtor', 'You pay ' + money(propCash(D.id)) + ', and ' + B.name + ' pays the seller the rest.']].concat(CLOSE_LINES(D.id),
    [['', 'Your first payment of ' + money(D.pmt) + ' is due in a week, at ' + B.name + '.']]));
}
function dealCancel() {
  const D = G.deal; G.deal = null; saveGame();
  say([['Realtor', 'Okay, the deal\'s off. ' + (D.stage === 'offer' ? 'No harm done.' : 'In real life, an offer usually lets you back out if the loan falls through.')]]);
}

// ---------- at the bank: the property loan ----------
let PROPBOX = null;   // the Loan Estimate or Closing Disclosure on screen while you read it
BANK_EXTRA.push(id => {
  const D = G.deal; if (!D) return null;
  if (D.stage === 'offer') return { t: 'Apply for a property loan', f: () => propApply(id) };
  if (D.inst === id && D.stage === 'le') return { t: 'Pick up closing papers', f: () => propCD(id) };
  return null;
});
function propApply(id) {
  if (!passesAsAdult()) return say([['Teller', 'I\'m sorry, you have to be 18 to take out a loan.'], ['Teller', 'In Wisconsin, a minor can usually undo a contract, so banks lend to grown-ups.']]);
  const D = G.deal, L = LISTINGS[D.id], B = BANKS[id], reasons = [];
  if ((G.loans || []).some(q => q.left > 0)) reasons.push('you already have a loan that isn\'t paid off');
  if ((G.loans || []).some(q => q.defaulted && Date.now() - q.defaulted < 30 * DAY_MS)) reasons.push('a recent loan went into default');
  if (B.cu && !acct(id).member) reasons.push('loans are for members');
  if (cash() < propCash(D.id)) reasons.push('you don\'t have the ' + money(propCash(D.id)) + ' you\'ll need at closing yet');
  if (reasons.length) return say([['Teller', 'I\'m sorry, we can\'t approve this one yet.'], ['', 'NOTICE OF ACTION TAKEN: your application was declined because ' + reasons.join(', and ') + '.'],
    ['', 'A lender has to tell you the real reasons, and it can\'t turn you down for your race, color, religion, national origin, sex or marital status.']]);
  const amt = L.price - propDown(D.id);
  ask('Teller: A property loan of ' + money(amt) + '. Over how many weeks? (Real mortgages are monthly, often for 30 years.)', PROP.terms.map(n => ({ t: n + ' weeks', f: () => {
    const T = loanTerms(amt, PROP.apr, n);
    PROPBOX = { doc: 'LOAN ESTIMATE', inst: id, id: D.id, amt, n, apr: PROP.apr, ...T };
    ask('LOAN ESTIMATE · ' + B.name + ' (placeholder numbers)', [{ t: 'I want to go ahead', f: () => {
      const X = PROPBOX; PROPBOX = null; Object.assign(D, { stage: 'le', inst: id, amt, n, apr: X.apr, pmt: X.pmt, last: X.last, total: X.total, le: Date.now() });
      D.cdReady = addBizDays(D.le, 4); D.closeAt = addBizDays(D.le, 7); saveGame();
      say([['Teller', 'Here\'s your Loan Estimate to keep. The law says you get it within 3 business days of applying. You got it today.'],
        ['Teller', 'Your Closing Disclosure will be ready ' + dayStr(D.cdReady) + '. Come pick it up then.'],
        ['Teller', 'You can close 3 business days after you get it, at the realtor\'s.']]); } },
      { t: 'Not now', f: () => { PROPBOX = null; say([['Teller', 'No problem. Come back when you\'re ready.']]); } }]); } })).concat([{ t: 'Never mind' }]));
}
function propCD(id) {
  const D = G.deal, B = BANKS[id];
  if (Date.now() < D.cdReady) return say([['Teller', 'Your Closing Disclosure isn\'t ready yet. It will be ' + dayStr(D.cdReady) + '.']]);
  const closeAt = Math.max(addBizDays(Date.now(), 3), addBizDays(D.le, 7));
  PROPBOX = { doc: 'CLOSING DISCLOSURE', inst: id, id: D.id, amt: D.amt, n: D.n, apr: D.apr, pmt: D.pmt, last: D.last, total: D.total, fin: D.total - D.amt, closeAt };
  ask('CLOSING DISCLOSURE · ' + B.name + ' (placeholder numbers)', [{ t: 'Got it', f: () => {
    PROPBOX = null; D.stage = 'cd'; D.cd = Date.now(); D.closeAt = closeAt; saveGame();
    say([['Teller', 'Compare it with your Loan Estimate. The law gives you at least 3 business days with it before you close.'],
      ['Teller', 'You can close ' + dayStr(closeAt) + ' or after, at the realtor\'s. Bring ' + money(propCash(D.id)) + '.']]); } }]);
}
// the two forms, drawn over the choice while you read: the loan terms in the boxes the real forms use, and their yes/no questions
{ const D0 = MODES.inside.draw; MODES.inside.draw = function () { D0.call(this); if (!PROPBOX || !DLG) return;
    const X = PROPBOX, L = LISTINGS[X.id], x = 8, y = 20, w = SW - 16, h = 162; win(x, y, w, h);
    const cw = (w - 16) / 2 - 2;
    const cell = (i, head, val, sub) => { const cx = x + 6 + (i % 2) * (cw + 4), cy = y + 6 + Math.floor(i / 2) * 46, big = i === 1;
      F(big ? 'rgba(255,216,96,.18)' : 'rgba(255,255,255,.06)', cx, cy, cw, 42); if (big) { F('#ffd860', cx, cy, cw, 1); F('#ffd860', cx, cy + 41, cw, 1); }
      txt(head, cx + 4, cy + 4, big ? '#ffd860' : '#c8d0f0', 'left', SMALL); txt(val, cx + 4, cy + 13, big ? '#ffd860' : '#fff');
      wrap(sub, cw - 8, SMALL).slice(0, 2).forEach((l, j) => txt(l, cx + 4, cy + 24 + j * 8, '#c8d0f0', 'left', SMALL)); };
    cell(0, 'LOAN AMOUNT', money(X.amt), 'Can it go up after closing? NO');
    cell(1, 'INTEREST RATE', X.apr.toFixed(2) + '%', 'Can it go up after closing? NO');
    cell(2, 'WEEKLY PAYMENT', money(X.pmt), (X.n - 1) + ' payments, then 1 of ' + money(X.last));
    cell(3, 'CASH TO CLOSE', money(propCash(X.id)), 'Down payment and closing costs');
    let ty = y + 100; const para = (t, c) => { wrap(t, w - 16, SMALL).forEach(l => { txt(l, x + 8, ty, c, 'left', SMALL); ty += 9; }); ty += 2; };
    para(X.doc + ': the ' + L.name + ', price ' + money(L.price) + '. Down payment ' + money(propDown(X.id)) + ', closing costs ' + money(PROP.costs) + '.', '#fff');
    para('Prepayment penalty? NO. Balloon payment? NO.' + (X.closeAt ? ' Closing on or after ' + dayStr(X.closeAt) + '.' : ''), '#c8d0f0');
    para('Placeholder numbers, not a real bank\'s offer.', '#f0a8a8'); }; }

// ---------- owning a place: the deed in your bag ----------
function propTick() {}   // owning has no income yet; a hook for whatever Christian decides
{ const _bu = bagUse; bagUse = function (id) {
    const d = ITEMS[id]; if (!d || d.kind !== 'deed') return _bu(id);
    const pid = id.slice(5), L = LISTINGS[pid], P = (G.props || {})[pid] || {}, now = Date.now(), o = [];
    if (pid === 'plot') o.push({ t: 'Dig potatoes', f: () => { if (now - (P.last || 0) < 7 * DAY_MS) return say([['', 'You dug here this week. Give the plants time. Next dig: ' + dayStr(P.last + 7 * DAY_MS) + '.']], bagOpen);
      P.last = now; bagAdd('potatoes'); saveGame(); say([['', 'You dig along the row. Antigo silt loam, soft and dark. A good sack of potatoes!']], bagOpen); } });
    if (pid === 'cabin') o.push({ t: 'Head up north', f: () => { if (now - (P.last || 0) < DAY_MS) return say([['', 'You were just up there. The cabin will keep until tomorrow.']], bagOpen);
      P.last = now; G.rested = now; saveGame(); say([['', 'A loon calls across the lake. The woodstove ticks. You sleep like a log.'], ['', '(A rest. Everyone in the party is back to full.)']], bagOpen); } });
    if (pid === 'house') o.push({ t: 'Go home and rest', f: () => { G.rested = now; saveGame(); say([['', 'You kick off your shoes on the porch. Home.'], ['', '(A rest. Everyone in the party is back to full.)']], bagOpen); } });
    o.push({ t: 'Read the deed', f: () => say([['', 'A deed to the ' + L.name + ', recorded with the Langlade County Register of Deeds. Made up for the game.']], bagOpen) }, { t: 'Close', f: bagOpen });
    ask('Deed: the ' + L.name + '.', o); }; }

// the realtor's desk now sells; both of CR Realty's storefronts share the hook
ROOM_HOOK['CR Realty'] = { line: 'CR Realty. Listing sheets on the wall, a map of the county, two desks.',
  layout: F => { for (const n of F.npcs) n.folk = 'realtor'; hookTalk(F, 'realtor', crTalk); } };
