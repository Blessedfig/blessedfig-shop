"use strict";
// =====================================================================
//  BANKS AND THE CREDIT UNION (Nov 14). Christian: "a place to put money and take out loans following a process. Don't
//  finalize it but set up the framework and study the laws and policies." This is that framework, NOT FINAL:
//  open an account (or join, at the credit union), deposit, withdraw, interest at a placeholder rate, and a loan that follows
//  the real order of things: application, a decision (with reasons when it's no), the federal Truth in Lending disclosure box,
//  acceptance, then weekly payments, with the Wisconsin Consumer Act's ten-day default and fifteen-day right to cure.
//  Every rate and limit below is a placeholder, not any real bank's offer. The law study: project doc claude/banking-framework.md.
// =====================================================================
const BANKS = {   // the 'about' lines are checked facts (sources in banking-framework.md); rates are placeholders
  covantage: { name: 'CoVantage Credit Union', cu: true, apy: 0.50, apr: 9.9, about: ['CoVantage is a credit union: a not-for-profit cooperative owned by its members, who elect its board.',
    'It started here in Antigo in 1952 as the Antigo Co-op Credit Union, in the basement of the Antigo Co-op Oil Association.',
    'Your savings there are called shares. They are insured up to $250,000 by the National Credit Union Administration, a federal agency.'] },
  bmo: { name: 'BMO', apy: 0.50, apr: 11.9, about: ['BMO is the U.S. bank of BMO Financial Group, which is Bank of Montreal, a Canadian bank.',
    'It bought Wisconsin\'s M&I Bank in 2011, and it was called BMO Harris Bank until 2023.', 'Deposits are insured by the FDIC, a federal agency, up to $250,000 per depositor, per bank, for each kind of ownership.'] },
  chase: { name: 'Chase', apy: 0.50, apr: 11.9, about: ['Chase is JPMorgan Chase Bank, a national bank. Its main office is in Columbus, Ohio, and its parent company is in New York.', 'Deposits are insured by the FDIC, a federal agency, up to $250,000 per depositor, per bank, for each kind of ownership.'] },
  associated: { name: 'Associated Bank', apy: 0.50, apr: 11.9, about: ['Associated Bank belongs to Associated Banc-Corp of Green Bay, the largest bank holding company based in Wisconsin.', 'Deposits are insured by the FDIC, a federal agency, up to $250,000 per depositor, per bank, for each kind of ownership.'] },
  banner: { name: 'the bank', apy: 0.50, apr: 11.9, about: ['Deposits are insured by the FDIC, a federal agency, up to $250,000 per depositor, per bank, for each kind of ownership.'] },
};
const LOAN = { amounts: [2500, 5000, 10000], terms: [4, 8, 12], dueEvery: 7 * 864e5, lateAfter: 10 * 864e5, cure: 15 * 864e5 };   // placeholders: $25-$100, weekly payments
function bankId(b) { const n = b.name || ''; return /CoVantage/i.test(n) ? 'covantage' : /BMO/i.test(n) ? 'bmo' : /Chase/i.test(n) ? 'chase' : /Associated/i.test(n) ? 'associated' : 'banner'; }
function acct(id) { G.acct = G.acct || {}; return G.acct[id] || (G.acct[id] = { open: false, bal: 0, last: Date.now() }); }
function isMinor() { return ['girl', 'boy'].includes(G.kid && G.kid.g); }
// Christian, Nov 14: "Kids require talking to 2 kids in a trenchcoat outside to get a costume to get loans or go into bars."
// A kid in the trenchcoat passes for a grown-up (bars.js gives the coat). Grown-ups never need it.
function passesAsAdult() { return !isMinor() || !!G.disguise; }
const BANK_EXTRA = [];   // more teller options, added by later files (the property loan: property.js)
function accrue(id) {   // simple daily interest at the placeholder APY, credited when you visit
  const A = acct(id), B = BANKS[id], days = (Date.now() - A.last) / 864e5; if (A.open && A.bal > 0 && days >= 1) { const i = Math.floor(A.bal * B.apy / 100 * Math.floor(days) / 365); A.bal += i; A.interest = (A.interest || 0) + i; }
  if (days >= 1) A.last = Date.now();
}
function amountOpts(max, f) { const o = [100, 500, 1000, 2000].filter(c => c <= max).map(c => ({ t: money(c), f: () => f(c) })); if (max > 0) o.push({ t: 'All of it (' + money(max) + ')', f: () => f(max) }); o.push({ t: 'Never mind' }); return o; }
function bankTalk(b) {
  const id = bankId(b), B = BANKS[id], A = acct(id); accrue(id); loanCheck(id);
  if (!A.open) return ask('Teller: Welcome to ' + B.name + '. ' + (B.cu ? 'Would you like to become a member?' : 'Would you like to open a savings account?'), [
    { t: B.cu ? 'Become a member' : 'Open an account', f: () => bankOpen(id) }, { t: 'How does it work?', f: () => say(B.about.map(l => ['Teller', l]).concat([['', '(Rates and rules here are placeholders while this part of the game is designed.)']])) }, { t: 'Not today' }]);
  const L = (G.loans || []).find(q => q.inst === id && q.left > 0);
  const o = [{ t: 'Deposit', f: () => ask('How much? You have ' + money(cash()) + ' in cash.', amountOpts(cash(), c => { pay(c); A.bal += c; saveGame(); say([['Teller', 'Deposited ' + money(c) + '. Your balance is ' + money(A.bal) + '.']]); })) },
    { t: 'Withdraw', f: () => ask('How much? Your balance is ' + money(A.bal) + '.', amountOpts(A.bal, c => { A.bal -= c; earn(c); saveGame(); say([['Teller', 'Here\'s ' + money(c) + '. Your balance is ' + money(A.bal) + '.']]); })) },
    L ? { t: 'Make a loan payment', f: () => loanPay(id) } : { t: 'Apply for a loan', f: () => loanApply(id) },
    ...BANK_EXTRA.map(f => f(id)).filter(Boolean),
    { t: 'My account', f: () => say([['Teller', 'Balance: ' + money(A.bal) + '. Interest earned so far: ' + money(A.interest || 0) + ' at ' + B.apy.toFixed(2) + '% APY.'], ['', '(Placeholder rate, not ' + B.name + '\'s real rate.)']]) },
    { t: 'Bye' }];
  ask('Teller: Hello again! Your balance is ' + money(A.bal) + '.', o);
}
function bankOpen(id) {
  const B = BANKS[id], A = acct(id);
  const steps = [['Teller', 'First I need to know who you are. Federal rules say we have to verify a name, a birth date, an address and an ID number before opening an account.']];
  if (isMinor()) steps.push(['Teller', 'You\'re under 18, so a parent or guardian opens the account with you.']);
  if (B.cu) steps.push(['Teller', 'Membership is for people who share a common bond, like living or working in the area we serve. You do!'], ['Teller', 'Your first deposit buys your membership share. That makes you a member and part owner, with one vote, like everyone else.']);
  steps.push(['Teller', 'Here\'s the account disclosure: ' + B.apy.toFixed(2) + '% annual percentage yield, no monthly fee. That\'s a placeholder for now.']);
  say(steps, () => { A.open = true; A.opened = Date.now(); A.last = Date.now(); if (B.cu) A.member = true; saveGame(); say([['Teller', B.cu ? 'Welcome, member!' : 'Your account is open.'], ['', '(Deposits from your cash come next.)']]); });
}
// ---------- the loan: application, decision, disclosure, acceptance, payments ----------
function loanTerms(amt, apr, n) {   // weekly payments, fully amortizing; the last payment absorbs rounding
  const r = apr / 100 / 52, p = Math.ceil(amt * r / (1 - Math.pow(1 + r, -n))), bal = Array.from({ length: n }).reduce(b => b * (1 + r) - p, amt), last = p + Math.round(bal);
  const total = p * (n - 1) + last; return { pmt: p, last, total, fin: total - amt };
}
function loanApply(id) {
  const B = BANKS[id];
  if (!passesAsAdult()) return say([['Teller', 'I\'m sorry, you have to be 18 to take out a loan.'], ['Teller', 'In Wisconsin, a minor can usually undo a contract, so banks lend to grown-ups.']]);
  if (isMinor()) return say([['Teller', '...Oh! Sorry, sir. For a second there I thought you were a kid.'], ['', '(The trenchcoat holds. You lower your voice another notch.)']], () => loanAsk(id));
  loanAsk(id);
}
function loanAsk(id) {
  ask('Teller: How much would you like to borrow?', LOAN.amounts.map(a => ({ t: money(a), f: () => ask('Over how many weeks? One payment each week.', LOAN.terms.map(n => ({ t: n + ' weeks', f: () => loanDecide(id, a, n) }))) })).concat([{ t: 'Never mind' }]));
}
function loanDecide(id, amt, n) {
  const B = BANKS[id], reasons = [];
  if ((G.loans || []).some(q => q.left > 0)) reasons.push('you already have a loan that isn\'t paid off');
  if ((G.loans || []).some(q => q.defaulted && Date.now() - q.defaulted < 30 * DAY_MS)) reasons.push('a recent loan went into default');   // placeholder: 30 real days
  if (B.cu && !acct(id).member) reasons.push('loans are for members');
  if (reasons.length) return say([['Teller', 'I\'m sorry, we can\'t approve this one.'], ['', 'NOTICE OF ACTION TAKEN: your application was declined because ' + reasons.join(', and ') + '.'],   // Reg B, 12 CFR 1002.9
    ['', 'A lender has to tell you the real reasons. It can\'t turn you down for your race, color, religion, national origin, sex or marital status,'],
    ['', '...or your age (if you\'re old enough to sign a contract), or because your income comes from public assistance, or because you used your rights under consumer credit law.']]);
  const T = loanTerms(amt, B.apr, n);
  say([['Teller', 'You\'re approved! Before you sign, federal law says you get to see the cost of the loan, in the same terms every lender has to use.']], () => {
    LOANBOX = { inst: id, amt, n, apr: B.apr, ...T };
    ask('TRUTH IN LENDING DISCLOSURE · ' + B.name + ' (placeholder rate)', [{ t: 'Sign and accept', f: () => loanAccept() }, { t: 'Decline', f: () => { LOANBOX = null; say([['Teller', 'No problem. The offer stands if you change your mind.']]); } }]);
  });
}
let LOANBOX = null;   // the disclosure on screen while you decide
function loanAccept() {
  const X = LOANBOX; LOANBOX = null;
  (G.loans = G.loans || []).push({ inst: X.inst, amt: X.amt, n: X.n, apr: X.apr, pmt: X.pmt, lastPmt: X.last, total: X.total, paid: 0, left: X.n, start: Date.now(), late: 0 });
  earn(X.amt); saveGame();
  say([['Teller', 'Done. ' + money(X.amt) + ' is yours, in cash. Your first payment of ' + money(X.pmt) + ' is due in a week.'], ['Teller', 'You can pay it off early any time, and you won\'t be charged a penalty for that.']]);
}
function loanDue(L, k) { return L.start + (k + 1) * LOAN.dueEvery; }
const DAY_MS = 864e5;
function loanPmtAt(L, j) { return j === L.n - 1 ? L.lastPmt : L.pmt; }
function loanPastDue(L, now) { const o = []; for (let j = L.n - L.left; j < L.n; j++) if (loanDue(L, j) < now) o.push(j); return o; }   // unpaid payments whose due date has passed
function loanInDefault(L, now) {   // Wis. Stat. 425.103(2)(a), for payments less than 2 months apart (checked Nov 14, 2026; see banking-framework.md)
  const k = L.n - L.left;
  if (L.left >= 2 && now > loanDue(L, k + 1) + LOAN.lateAfter) return true;   // more than one full payment unpaid for more than 10 days
  if ((k === 0 || L.left === 1) && now > loanDue(L, k) + 40 * DAY_MS) return true;   // or the first or last payment unpaid 40 days after it was due
  return false;   // one missed payment alone is late, not default (Indianhead Motors v. Brooks, 2006 WI App 266)
}
function loanCheck(id) {   // default, then a written notice of the right to cure, then 15 days to catch up (Wis. Stat. 425.104, 425.105)
  const now = Date.now();
  for (const L of (G.loans || []).filter(q => q.inst === id && q.left > 0)) {
    if (L.kind === 'property') { propLoanCheck(L, now); continue; }   // a first mortgage is outside the Wisconsin Consumer Act (421.202(7))
    if (!L.notice && !L.defaulted && loanInDefault(L, now)) {
      L.notice = now; L.noCure = (L.cures || []).filter(t => now - t < 365 * DAY_MS).length >= 2;   // no right to cure after two cures in 12 months (425.105(3))
      G.credit = G.credit || {}; G.credit.late = (G.credit.late || 0) + 1; saveGame();
    }
    if (L.notice && !L.defaulted && (L.noCure || now > L.notice + LOAN.cure)) { L.defaulted = now; G.credit = G.credit || {}; G.credit.default = (G.credit.default || 0) + 1; saveGame(); }
  }
}
// a property loan (property.js) is a first mortgage: Wis. Stat. 421.202(7) leaves it outside chs. 421-427, so no 15-day cure notice.
// For a home the borrower lives in, federal servicing rules keep a lender from the first foreclosure filing until the loan is more
// than 120 days delinquent (12 CFR 1024.41(f)); Wisconsin foreclosure goes through the courts (ch. 846). In the game, nothing is taken.
function propLoanCheck(L, now) {
  const due = loanPastDue(L, now); if (!due.length) return;
  if (!L.defaulted && (now - loanDue(L, due[0])) / DAY_MS > 120) { L.defaulted = now; G.credit = G.credit || {}; G.credit.default = (G.credit.default || 0) + 1; saveGame(); }
}
function loanNotice(id, L) {   // pages of the notice; its contents follow 425.104(2): who, which loan, what's past due, the exact amount and date to cure
  const B = BANKS[id], due = loanPastDue(L, Date.now()), sum = due.reduce((s, j) => s + loanPmtAt(L, j), 0), n = due.length + (due.length === 1 ? ' payment is' : ' payments are');
  if (L.kind === 'property') return ['Your property loan from ' + B.name + ' is ' + Math.max(1, Math.floor((Date.now() - loanDue(L, due[0])) / DAY_MS)) + ' days behind: ' + n + ' past due, ' + money(sum) + ' in all.',
    'A first mortgage isn\'t covered by the Wisconsin Consumer Act, so there\'s no 15-day cure notice for it.',
    'For a home you live in, federal rules keep a lender from starting a foreclosure until the loan is more than 120 days behind.',
    L.defaulted ? 'This one is past 120 days. In real life the lender could go to court now. In this game, it stays on your record.' : 'In this game nothing is taken away, but late payments go on your record.'];
  if (L.noCure) return ['NOTICE OF DEFAULT, from ' + B.name + '. On your ' + money(L.amt) + ' loan, ' + n + ' past due.', 'You already caught up twice this year after a notice, so the law gives no third 15-day right to cure.'];
  if (L.defaulted) return ['This loan went into default and wasn\'t caught up within 15 days of the notice.', 'In real life, a lender could now ask for the whole balance. In this game, it stays on your record until it\'s paid.'];
  return ['NOTICE OF RIGHT TO CURE DEFAULT, from ' + B.name + '. On your ' + money(L.amt) + ' loan, ' + n + ' past due.', 'To cure it, pay ' + money(sum) + ' by ' + new Date(L.notice + LOAN.cure).toLocaleDateString() + '. Then the loan goes back to normal, as if you never fell behind. (No late fees in this game.)'];
}
function loanPay(id) {
  const L = (G.loans || []).find(q => q.inst === id && q.left > 0); if (!L) return;
  const amt = L.left === 1 ? L.lastPmt : L.pmt, k = L.n - L.left, due = loanDue(L, k), A = acct(id);
  const note = L.kind === 'property' ? (loanPastDue(L, Date.now()).length ? loanNotice(id, L) : null) : (L.notice || L.defaulted) ? loanNotice(id, L) : null;
  const back = loanPastDue(L, Date.now()), owed = back.reduce((s, j) => s + loanPmtAt(L, j), 0);
  const go = () => ask('Payment ' + (k + 1) + ' of ' + L.n + ': ' + money(amt) + ', due ' + new Date(due).toLocaleDateString() + '. Pay with:', [
    ...(back.length > 1 ? [{ t: 'Catch up all ' + back.length + ' (' + money(owed) + ')', f: () => { if (!pay(owed)) return say([['Teller', 'You don\'t have enough cash to catch up all at once.']]); back.forEach(j => loanPaid(L, loanPmtAt(L, j), true)); loanPaid(L, 0, false, true); } }] : []),
    { t: 'Cash (' + money(cash()) + ')', f: () => { if (!pay(amt)) return say([['Teller', 'You don\'t have enough cash for this payment.']]); loanPaid(L, amt); } },
    { t: 'Savings (' + money(A.bal) + ')', f: () => { if (A.bal < amt) return say([['Teller', 'There isn\'t enough in savings.']]); A.bal -= amt; loanPaid(L, amt); } },
    { t: 'Pay it all off now', f: () => { const rest = loanPayoff(L); ask('Payoff today: ' + money(rest) + '. No prepayment penalty.', [{ t: 'Pay with cash', f: () => { if (!pay(rest)) return say([['Teller', 'Not enough cash.']]); L.left = 0; L.paid += rest; G.credit = G.credit || {}; G.credit.paidOff = (G.credit.paidOff || 0) + 1; saveGame(); say([['Teller', 'Paid in full. Nice work.']]); } }, { t: 'Never mind' }]); } },
    { t: 'Not today' }]);
  if (note) say(note.map(t => ['Notice', t]), go); else go();
}
function loanPayoff(L) {   // the principal still owed: what the payments left would have repaid, without their future interest
  const r = L.apr / 100 / 52; let bal = L.amt; for (let i = 0; i < L.n - L.left; i++) bal = bal * (1 + r) - L.pmt;
  const weeks = Math.max(0, (Date.now() - loanDue(L, L.n - L.left - 1)) / LOAN.dueEvery); return Math.max(0, Math.round(bal * (1 + r * Math.min(1, weeks))));
}
function loanPaid(L, amt, quiet, wrap) {   // one payment; 'quiet' for each step of a catch-up, 'wrap' to finish one with no payment of its own
  const now = Date.now();
  if (!wrap) {
    const k = L.n - L.left, onTime = now <= loanDue(L, k) + LOAN.lateAfter; L.left--; L.paid += amt;
    G.credit = G.credit || {}; G.credit[onTime ? 'onTime' : 'late'] = (G.credit[onTime ? 'onTime' : 'late'] || 0) + 1;
  }
  if (L.notice && !L.defaulted && loanPastDue(L, now).length === 0) { L.curedNow = true; (L.cures = L.cures || []).push(now); L.notice = null; L.noCure = false; }   // all past-due paid: cured (425.105(2))
  saveGame(); if (quiet) return;
  const cured = L.curedNow; delete L.curedNow;
  const lines = [['Teller', L.left ? 'Thanks! ' + L.left + (L.left === 1 ? ' payment' : ' payments') + ' to go.' : 'That was the last payment. The loan is paid in full.']];
  if (cured) lines.push(['Teller', 'And that cures the default. Your loan is back in good standing, just as if you\'d never fallen behind.']);
  else if (L.notice && L.left) lines.push(['Teller', 'You still have ' + loanPastDue(L, now).length + ' past-due payment(s) to catch up.']);
  say(lines);
}
// the disclosure box, drawn over the choice while you decide: the four terms with the federal model form's own descriptions (Reg Z
// appendix H-2), the payment schedule and the prepayment line. 'Finance charge' and 'annual percentage rate' must stand out more than
// the other terms (12 CFR 1026.17(a)(2)), so their cells are brighter and their numbers gold.
{ const D0 = MODES.inside.draw; MODES.inside.draw = function () { D0.call(this); if (!LOANBOX || !DLG) return;
    const X = LOANBOX, x = 8, y = 20, w = SW - 16, h = 162; win(x, y, w, h);
    const cw = (w - 16) / 2 - 2;
    const cell = (i, head, val, sub) => { const cx = x + 6 + (i % 2) * (cw + 4), cy = y + 6 + Math.floor(i / 2) * 52, big = i < 2;
      F(big ? 'rgba(255,216,96,.18)' : 'rgba(255,255,255,.06)', cx, cy, cw, 48); if (big) { F('#ffd860', cx, cy, cw, 1); F('#ffd860', cx, cy + 47, cw, 1); }
      txt(head, cx + 4, cy + 4, big ? '#ffd860' : '#c8d0f0', 'left', SMALL); txt(val, cx + 4, cy + 13, big ? '#ffd860' : '#fff');
      wrap(sub, cw - 8, SMALL).slice(0, 3).forEach((l, j) => txt(l, cx + 4, cy + 24 + j * 8, '#c8d0f0', 'left', SMALL)); };
    cell(0, 'ANNUAL PERCENTAGE RATE', X.apr.toFixed(2) + '%', 'The cost of your credit as a yearly rate.');
    cell(1, 'FINANCE CHARGE', money(X.fin), 'The dollar amount the credit will cost you.');
    cell(2, 'AMOUNT FINANCED', money(X.amt), 'The amount of credit provided to you or on your behalf.');
    cell(3, 'TOTAL OF PAYMENTS', money(X.total), 'The amount you will have paid after you have made all payments as scheduled.');
    let ty = y + 112; const para = (t, c) => { wrap(t, w - 16, SMALL).forEach(l => { txt(l, x + 8, ty, c, 'left', SMALL); ty += 9; }); ty += 2; };
    para('YOUR PAYMENT SCHEDULE: ' + (X.n - 1) + ' weekly payments of ' + money(X.pmt) + ', then 1 of ' + money(X.last) + ', starting one week from today.', '#fff');
    para('Prepayment: If you pay off early, you will not have to pay a penalty.', '#c8d0f0');
    para('Placeholder numbers, not a real bank\'s offer.', '#f0a8a8'); }; }
