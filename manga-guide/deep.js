// ---- In-depth family profile: an optional, longer quiz across every category the guide grades. ----
// Loaded after the main script, so it uses its globals (D, ALL, state, esc, fitFor, ageBand, row, GROUPS, ...).
// Answers stay in this browser: sessionStorage while working, localStorage only if the parent saves.
(function () {
const css = `
.dq{max-width:820px}
.dq .prog{display:flex;gap:4px;flex-wrap:wrap;margin:2px 0}
.dq .prog button{flex:1 1 0;min-width:28px;height:8px;border:0;border-radius:4px;background:var(--tone);cursor:pointer;padding:0}
.dq .prog button.done{background:var(--accent)}
.dq .prog button.cur{background:var(--ink)}
.dq ol.qs{display:grid;gap:16px;padding-left:1.3em;margin:0}
.dq ol.qs p{margin:0 0 6px}
.dq .opts{display:flex;flex-wrap:wrap;gap:6px}
.dq .opts label{display:inline-flex;align-items:center;gap:6px;font:500 .84rem var(--f-body);border:1px solid var(--rule);border-radius:999px;padding:6px 11px;cursor:pointer;background:var(--panel);min-height:36px}
.dq .opts label:has(input:checked){border-color:var(--accent);background:var(--accent-soft);color:var(--accent);font-weight:700}
.dq .opts input{accent-color:var(--accent);margin:0}
.dq .lname{font-weight:700}
.dq .ldesc{color:var(--muted);font-size:.92rem}
.dq .nav{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between}
.dq .nav .pill.go{background:var(--accent);border-color:var(--accent);color:var(--panel)}
.dq .ctab{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px 14px;align-items:center}
.dq .ctab select{min-width:12rem}
.dq h3{margin-top:6px}
.mscore{flex:none;display:inline-grid;place-items:center;width:3.4rem;height:3.4rem;border-radius:12px;font:900 1.35rem/1 var(--f-display);color:var(--gN);background:var(--gN-bg)}
.mscore small{display:block;font:500 .6rem var(--f-mono);letter-spacing:.04em}
.mscore.m1{color:var(--gA);background:var(--gA-bg)} .mscore.m2{color:var(--gB);background:var(--gB-bg)} .mscore.m3{color:var(--gC);background:var(--gC-bg)} .mscore.m4{color:var(--gD);background:var(--gD-bg)}
.reasons{display:flex;flex-direction:column;gap:2px;margin-top:6px;font-size:.88rem}
.reasons .p{color:var(--gA)} .reasons .n{color:var(--gF)}
.prof{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));gap:10px}
.prof div{background:var(--paper);border:1px solid var(--rule);border-radius:10px;padding:10px 12px;font-size:.9rem}
.prof b{display:block;font-family:var(--f-display)}
@media (max-width:640px){.dq .ctab{grid-template-columns:minmax(0,1fr)}.dq .ctab select{min-width:0;width:100%}}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

const AG = ['Strongly disagree', 'Disagree', 'Not sure', 'Agree', 'Strongly agree'];
const IMP = [['0', 'Not at all'], ['1', 'A little'], ['2', 'Some'], ['3', 'A lot']];

// Worldview lenses, in plain words. Descriptions are neutral: what the idea says, not whether it is right.
const LENS_GROUPS = [
 ['Faith and the spiritual', [
  ['Christian', 'A Christian view: God, sin, grace and redemption through Christ'],
  ['Jewish', 'Jewish ideas: covenant, God\'s law, and repairing the world'],
  ['Islamic', 'Islamic ideas: submission to God and living by His guidance'],
  ['Hindu ideas', 'Dharma, karma and rebirth; devotion to God in many forms; liberation of the soul'],
  ['Buddhist ideas', 'Suffering comes from craving; nothing is permanent; compassion and letting go bring peace'],
  ['Confucian ethics', 'Duty to parents and elders, harmony, lifelong self-cultivation'],
  ['Pantheist/New Age', 'Spirit as the universe itself: energy, oneness, manifesting'],
  ['Pagan/occult', 'Magic, spirits and nature gods; rituals, curses and pacts'],
  ['Feel-good faith', 'Be nice and be happy; God is mainly there to help when needed']]],
 ['Meaning and purpose', [
  ['Secular humanism', 'Meaning and morality come from human reason and compassion, without God'],
  ['Naturalism', 'Only the natural world exists; nothing supernatural'],
  ['Existentialism', 'Life has no given meaning, so you must create your own'],
  ['Absurdism', 'Life is absurd, and the answer is to live fully anyway'],
  ['Nihilism', 'Nothing really matters; there is no real right or wrong'],
  ['Anti-natalism', 'Being born is a harm; it is better not to exist or have children'],
  ['Transhumanism', 'Technology should remake and improve human nature']]],
 ['How to live and choose', [
  ['Classical virtue ethics', 'Building character: courage, honesty, justice and self-control'],
  ['Stoicism', 'Accept what you cannot control and master your emotions'],
  ['Duty ethics (deontology)', 'Some things are right or wrong in themselves: keep your word, whatever it costs'],
  ['Bushido / honor code', 'Loyalty, courage and honor above life itself; better to die than live in disgrace'],
  ['Pacifism / nonviolence', 'Violence and war are wrong on principle; meet conflict without force'],
  ['Utilitarianism', 'The right choice is whatever does the most good overall, even if a few pay for it'],
  ['Pragmatism', 'What works is what counts; judge ideas by their results'],
  ['Expressive individualism', 'Be true to yourself; your inner feelings define who you are'],
  ['Hedonism', 'Pleasure and enjoyment are the main point of life'],
  ['Consumerism', 'Happiness through buying, owning and status'],
  ['Strength rules', 'The strong deserve to win and to rule']]],
 ['Society and politics', [
  ['Traditionalism', 'Keeping inherited customs, roles and faith'],
  ['Progressivism', 'Society should keep reforming toward greater equality'],
  ['Communitarianism', 'Community first, built by free people rather than imposed'],
  ['Authoritarianism', 'Obey the ruler, state or system over your own conscience'],
  ['Liberalism', 'Equal rights for each person, government by consent, the rule of law'],
  ['Libertarianism', 'As much personal freedom as possible, as little control as possible'],
  ['Anarchism', 'No ruler has the right to govern others by force; free cooperation instead'],
  ['Patriotism / nationalism', 'Love of country and readiness to serve and sacrifice for it'],
  ['Critical theory', 'Society is shaped by oppressor and oppressed groups'],
  ['Marxism', 'History as class struggle; owners exploit workers'],
  ['Feminism', 'Challenging limits placed on women and girls'],
  ['Postmodernism', 'No single truth; every big story about the world is suspect'],
  ['Environmentalism', 'Protecting nature; people as its stewards or its threat']]]];
window.LENS_GROUPS = LENS_GROUPS; // the By philosophy picker groups its list with these headings
// Message delivery. Series data: entry.delivery = {style, preachiness 0-10, opposing_views, personified[]}. Missing = unknown, not neutral.
const DELIVERY = [['subtle', 'Subtly: left for the reader to find'], ['woven', 'Woven into the story'], ['open', 'Openly: it says its message plainly'], ['embodied', 'Through characters who stand for an idea'], ['', 'No preference']];
const PREACH_TARGET = {subtle: 2, woven: 4.5, open: 7.5};
const FAIR_VAL = {fair: 1, mixed: 0, strawman: -1};
const LENS_OPTS = [['2', 'Glad if it\'s championed'], ['1', 'Good to see'], ['0', 'No preference'], ['-1', 'Only if shown critically'], ['-2', 'Avoid']];
// How each answer reacts to how the story treats the idea: [Affirmed, Explored, Critiqued].
const LENS_TABLE = {'2': [2, .8, -1.5], '1': [1, .4, -.7], '-1': [-1.5, -.5, .6], '-2': [-2, -1, -.3]};
const lensKey = n => { n = (n || '').toLowerCase(); const all = LENS_GROUPS.flatMap(g => g[1].map(x => x[0]));
  return all.find(x => x.toLowerCase() === n) || all.find(x => n.startsWith(x.toLowerCase().split(/[ /(]/)[0])) || null; };

const FOUND = ['care', 'fairness', 'loyalty', 'authority', 'sanctity', 'liberty'];
const FOUND_NAME = {care: 'Care', fairness: 'Fairness', loyalty: 'Loyalty', authority: 'Respect for authority', sanctity: 'Sacredness and purity', liberty: 'Liberty'};
const FOUND_Q = [
 ['Kindness to the weak and suffering should be at the heart of a good story.', 'care'],
 ['A story should never treat cruelty as funny or cool.', 'care'],
 ['Stories should show cheating and unfair treatment being set right.', 'fairness'],
 ['People in a story should get what they earned, no more and no less.', 'fairness'],
 ['Standing by your family, team or country is one of the highest virtues.', 'loyalty'],
 ['Betraying your own people is among the worst things a character can do.', 'loyalty'],
 ['Children should see parents, teachers and elders respected in what they read.', 'authority'],
 ['A story where kids defy every adult and are proven right bothers me.', 'authority'],
 ['Some things are sacred, and stories should not mock or degrade them.', 'sanctity'],
 ['I care whether a story treats the body, sex and the holy with reverence.', 'sanctity'],
 ['Stories should champion people who stand up to those who control them.', 'liberty'],
 ['Freedom to choose your own path is one of the highest goods.', 'liberty']];

const AXES = [['economic', 'Economy', 'Shared, government-led', 'Free market'], ['social', 'Freedom', 'Strong authority', 'Personal liberty'], ['cultural', 'Culture', 'Traditional', 'Progressive'], ['community', 'Who comes first', 'The individual', 'The community']];
const AXES_Q = [
 ['People and businesses should be free to earn and keep what they make, with little government involvement.', 'economic', 1],
 ['Wealth should be shared more evenly, even if that takes strong government action.', 'economic', -1],
 ['Adults should be free to make their own choices even when others think they are wrong.', 'social', 1],
 ['Society needs strong authority to keep people from doing harm.', 'social', -1],
 ['Society\'s views on family, gender and morality should keep changing with the times.', 'cultural', 1],
 ['Time-tested moral traditions should be kept, even when they are unpopular.', 'cultural', -1],
 ['The good of the community comes before what any one person wants.', 'community', 1],
 ['Each person\'s own goals and choices come first.', 'community', -1]];

// Six everyday-values dimensions (same as "Our family's values"), three statements each. [text, dim index, direction]
const FOLK_Q = [
 ['If someone insults my family in public, it should be answered, not ignored.', 0, 1],
 ['Children should be taught to settle fights through teachers or rules, not on their own.', 0, -1],
 ['Standing up for your family\'s good name is a mark of character.', 0, 1],
 ['A good community has clear rules that everyone is expected to follow.', 1, -1],
 ['People should be left alone to live as they choose as long as they harm no one.', 1, 1],
 ['Respect for the law should come before my own sense of what is right.', 1, -1],
 ['I would bend a rule to help a family member before I would for a stranger.', 2, 1],
 ['Family comes first, even before what is fair to outsiders.', 2, 1],
 ['I trust public institutions like schools and courts to treat my family fairly.', 2, -1],
 ['Elders and leaders deserve respect because of their position, not only because they earned it.', 3, 1],
 ['Decisions in a group work best when everyone has an equal say.', 3, -1],
 ['Some people are simply better suited to lead, and others to follow.', 3, 1],
 ['Our family\'s traditions and faith should guide how my children live.', 4, -1],
 ['Science and reason, not tradition, should have the final word on how we live.', 4, 1],
 ['Religious faith is at the center of our family life.', 4, -1],
 ['Hard work and financial security matter more than self-expression.', 5, -1],
 ['Being free to be yourself, and tolerant of others who differ, matters most.', 5, 1],
 ['Getting by and staying safe come before following your dreams.', 5, -1]];

// About the reader, not the parent. Temperament only nudges genre and tone; it never outweighs values.
const BIG5_Q = [
 ['Loves strange ideas, other worlds and big what-if questions.', 'O', 1],
 ['Prefers familiar, down-to-earth stories.', 'O', -1],
 ['Likes order and plans, and finishes what they start.', 'C', 1],
 ['Gets bored quickly with rules and routine.', 'C', -1],
 ['Draws energy from friends, noise and action.', 'E', 1],
 ['Prefers quiet time alone.', 'E', -1],
 ['Is soft-hearted and upset by cruelty, even in stories.', 'A', 1],
 ['Enjoys rivalry, trash talk and competition.', 'A', -1],
 ['Scares or worries easily, and tense scenes stay with them.', 'N', 1],
 ['Shrugs off creepy or tense moments.', 'N', -1]];
const BIG5_GENRE = {
 O: {'Sci-Fi': 1, 'Fantasy': 1, 'Mystery': 1, 'Psychological': 1, 'Supernatural': 1, 'Mecha': 1, 'Slice of Life': -1, 'Sports': -.5},
 C: {'Sports': 1, 'Mystery': .5, 'Comedy': -.3},
 E: {'Action': 1, 'Sports': 1, 'Adventure': 1, 'Comedy': .5, 'Slice of Life': -.7, 'Psychological': -.5},
 A: {'Romance': .7, 'Slice of Life': 1, 'Comedy': .5, 'Horror': -1, 'Thriller': -.7, 'Psychological': -.5},
 N: {'Horror': -1.2, 'Thriller': -1, 'Psychological': -.8, 'Slice of Life': .6, 'Comedy': .6}};

const CATS = ['Violence', 'Fear and intensity', 'Sexuality and romance', 'Language', 'Substances', 'Mental health and self-harm', 'Imitable behavior', 'Commercial'];
const LEVELS = [[0, 'None at all'], [2, 'Very mild'], [3, 'Mild'], [4, 'Mild to moderate'], [5, 'Moderate'], [6, 'Moderate to strong'], [7, 'Strong'], [8, 'Very strong'], [10, 'No limit']];
const CAT_HINT = {'Violence': 'Fights, blood, injury, gore', 'Fear and intensity': 'Horror, peril, disturbing scenes', 'Sexuality and romance': 'Kissing, fan service, nudity, sexual content', 'Language': 'Swearing and slurs', 'Substances': 'Alcohol, smoking, drugs', 'Mental health and self-harm': 'Depression, suicide, self-harm', 'Imitable behavior': 'Dangerous stunts or habits kids might copy', 'Commercial': 'Merchandise and product tie-ins'};

const PARTS = [['trad', 'Your faith or philosophy'], ['content', 'Mature content limits'], ['lens', 'Big ideas and worldviews'], ['found', 'Moral priorities'], ['axes', 'Society and politics'], ['folk', 'Everyday culture'], ['big5', 'Your reader\'s temperament']];
const DEF_W = {trad: 3, content: 3, lens: 2, found: 2, axes: 1, folk: 1, big5: 1};
const STEPS = ['intro', 'reader', 'trad', 'content', 'lens', 'found', 'axes', 'folk', 'big5', 'weights', 'results'];
const STEP_NAME = {intro: 'Start', reader: 'Your reader', trad: 'Faith or philosophy', content: 'Mature content', lens: 'Big ideas', found: 'Moral priorities', axes: 'Society and politics', folk: 'Everyday culture', big5: 'Reader\'s temperament', weights: 'What matters most', results: 'Your matches'};

let A = {step: 0, a: {}, w: {}, n: 20, saved: false};
const KEY = 'mwg-deep';
try { const s = sessionStorage.getItem(KEY) || localStorage.getItem(KEY); if (s) { A = Object.assign(A, JSON.parse(s)); } } catch (e) {}
try { if (localStorage.getItem(KEY)) A.saved = true; } catch (e) {}
const keep = () => { try { sessionStorage.setItem(KEY, JSON.stringify(A)); if (A.saved) localStorage.setItem(KEY, JSON.stringify(A)); } catch (e) {} };
const ans = k => A.a[k];

// ---- Building blocks ----
const radios = (name, opts, cur) => `<div class="opts" role="radiogroup">${opts.map(([v, l]) => `<label><input type="radio" name="${esc(name)}" value="${esc(v)}" data-dq="${esc(name)}" ${String(cur) === String(v) ? 'checked' : ''}> ${esc(l)}</label>`).join('')}</div>`;
const agreeList = (prefix, qs) => `<ol class="qs">${qs.map((q, i) => `<li><p>${esc(q[0])}</p>${radios(`${prefix}${i}`, AG.map((l, j) => [j, l]), ans(`${prefix}${i}`))}</li>`).join('')}</ol>`;
const answered = prefix => Object.keys(A.a).filter(k => k.startsWith(prefix) && A.a[k] !== '' && A.a[k] != null).length;

function capsFor(age) {
  const band = age ? (AGES.find(a => a[0] === age) || [])[1] : null;
  const caps = band && BAND_CAPS[band] ? BAND_CAPS[band] : null;
  return CATS.map(c => caps ? (caps[c] ?? 10) : 10);
}
const limit = (c, i) => { const v = ans('lim:' + c); return v != null && v !== '' ? +v : capsFor(ans('age'))[i]; };

// ---- Each step ----
function stepIntro() {
  const n = D.series.filter(s => s.entry).length;
  return `<h1>In-depth family profile</h1>
  <p class="lede">A longer, optional quiz that covers every category this guide grades: your faith or philosophy, mature content limits by category, the big ideas a story can push, moral priorities, society and politics, everyday culture, and your reader's temperament. It then ranks the ${n} graded series by how well each one fits your whole profile, and says why.</p>
  <div class="banner">About 10 to 15 minutes. Every question can be skipped, and you can jump to your matches at any time. Answers stay in this browser and are not sent anywhere. Nothing here asks about ancestry, race or genetics, and no answer is better than another.</div>
  <p class="note">Want something quicker? <a href="#start">Find manga</a> asks just two questions.</p>`;
}
function stepReader() {
  return `<h2>How old is your reader?</h2><p class="note">This sets starting limits for mature content. You can change each one on the content step.</p>
  ${radios('age', [['', 'Skip'], ...AGES.map(a => [a[0], a[0]])], ans('age') ?? '')}
  <h3>Some series are rated by their publisher for older kids than yours. Hide them, or still show them further down the list?</h3>
  <p class="note">Publishers like VIZ and Yen Press put an age rating on each book, for example "Teen 13+". This only matters if that rating is older than your reader.</p>
  ${radios('pubage', [['1', 'Hide them'], ['0', 'Show them lower down']], ans('pubage') ?? '1')}`;
}
function stepTrad() {
  const opt = (id, cur, none) => `<select id="${id}" data-dqs="${id}" aria-label="Tradition"><option value="">${none}</option>${GROUPS.map(([g, items]) => `<optgroup label="${esc(g)}">${items.map(v => `<option ${v === cur ? 'selected' : ''}>${esc(v)}</option>`).join('')}</optgroup>`).join('')}</select>`;
  return `<h2>Your faith or philosophy</h2><p class="note">Each series is graded S to F by the message, judged by each tradition's own teaching. Pick the one closest to your household. All 31 are treated the same way.</p>
  <label class="eyebrow" for="t1">Main tradition</label>${opt('t1', ans('t1'), 'Skip')}
  <label class="eyebrow" for="t2">A second tradition in your home (optional)</label>${opt('t2', ans('t2'), 'None')}
  <p class="note">For a mixed household, both grades count equally.</p>
  <h3>How should a tradition's "Depiction concern" count?</h3><p class="note">Separate from the grade, each tradition notes whether what is shown (not the message) is a Minor, Discuss or Significant concern.</p>
  ${radios('dep', [['0', 'Ignore it, grade only'], ['1', 'Count it a little'], ['2', 'Count it a lot']], ans('dep') ?? '1')}`;
}
function stepContent() {
  const caps = capsFor(ans('age'));
  return `<h2>Mature content limits</h2><p class="note">The highest level you are comfortable with in each category, on the guide's 0 to 10 scale. ${ans('age') ? `Starting points are set for ${esc(ans('age'))}.` : 'With no age chosen, there is no limit until you set one.'} <a href="#method">What the levels mean</a></p>
  <div class="ctab">${CATS.map((c, i) => { const cur = ans('lim:' + c); const v = cur != null && cur !== '' ? +cur : caps[i];
    return `<div><span class="lname">${esc(c)}</span><div class="ldesc">${esc(CAT_HINT[c])}</div></div><select data-dqs="lim:${esc(c)}" aria-label="${esc(c)} limit">${LEVELS.map(([n, l]) => `<option value="${n}" ${n === v || (!LEVELS.some(x => x[0] === v) && n === 10) ? 'selected' : ''}>${n} · ${esc(l)}${n === caps[i] && ans('age') ? ' (age default)' : ''}</option>`).join('')}</select>`; }).join('')}</div>
  <h3>When a series goes over a limit</h3>
  ${radios('over', [['hide', 'Leave it out'], ['lower', 'Keep it, but rank it lower']], ans('over') ?? 'hide')}
  <h3>Does it matter how the story treats it?</h3><p class="note">For example, violence shown with real consequences, or condemned, versus violence shown as cool.</p>
  ${radios('framing', [['1', 'Yes, give a little room when it is condemned, less when it is glorified'], ['0', 'No, the amount is what matters']], ans('framing') ?? '1')}`;
}
function stepLens() {
  return `<h2>Big ideas and worldviews</h2><p class="note">Stories can champion an idea, explore it without a verdict, or show it critically. For each idea, how would you feel about it appearing in your reader's books? Skip any you have no view on. The wording describes each idea; it does not endorse it.</p>
  <h3>How a story delivers its message</h3>
  <p class="note">Some stories teach openly, some leave it underneath, and some put an idea into a villain or hero who stands for it. Which do you prefer for your reader?</p>
  ${radios('style', DELIVERY.map(d => [d[0], d[1]]), ans('style') ?? '')}
  <p class="note" style="margin-top:6px">And when a story argues against a view, does it matter that the other side is shown fairly, not as a strawman?</p>
  ${radios('fair', [['2', 'Yes, a lot'], ['1', 'Somewhat'], ['0', 'Not really']], ans('fair') ?? '')}
  ${LENS_GROUPS.map(([g, ls]) => `<h3>${esc(g)}</h3><ol class="qs">${ls.map(([k, d]) => `<li><p><span class="lname">${esc(k.replace('/', ' / '))}</span> <span class="ldesc">${esc(d)}</span></p>${radios('lens:' + k, LENS_OPTS, ans('lens:' + k))}</li>`).join('')}</ol>`).join('')}`;
}
function stepFound() {
  return `<h2>Moral priorities</h2><p class="note">Twelve statements about what you hope stories teach. These follow six widely studied moral foundations: care, fairness, loyalty, authority, sacredness and liberty. Families of every faith and politics weigh them differently.</p>${agreeList('mf', FOUND_Q)}`;
}
function stepAxes() {
  return `<h2>Society and politics</h2><p class="note">Eight statements. Stories carry views on these too, often quietly. This compares the story's leanings with yours; it does not rate either.</p>${agreeList('ax', AXES_Q)}`;
}
function stepFolk() {
  const saved = typeof VALS !== 'undefined' && VALS && VALS.pos;
  return `<h2>Everyday culture</h2><p class="note">Eighteen statements on honor, order, family loyalty, rank, tradition and self-expression. Answer as your household lives, not as you think you should. Only some series are placed on these values so far, so this counts only where we have data.</p>
  ${saved ? `<p><button type="button" class="linkbtn" id="dqvals">Use the values profile you saved on "Our family's values" instead</button></p>` : ''}${ans('folkFrom') ? '<p class="note"><strong>Using your saved values profile.</strong> Answer below to replace it.</p>' : ''}${agreeList('fw', FOLK_Q)}`;
}
function stepBig5() {
  return `<h2>Your reader's temperament (optional)</h2><p class="note">Ten statements about your reader, not you. Personality says little about beliefs, so this only nudges genre and tone, for example fewer horror titles for a reader who scares easily. It is the smallest part of the match.</p>${agreeList('b5', BIG5_Q)}`;
}
function stepWeights() {
  return `<h2>What matters most to you?</h2><p class="note">How much each part should count in the match. Parts you skipped do not count either way.</p>
  <ol class="qs">${PARTS.map(([k, l]) => `<li><p class="lname">${esc(l)}</p>${radios('w:' + k, IMP, A.w[k] ?? DEF_W[k])}</li>`).join('')}</ol>`;
}

// ---- Turning answers into a profile ----
function profile() {
  const P = {};
  P.trad = [ans('t1'), ans('t2')].filter(Boolean);
  P.dep = +(ans('dep') ?? 1);
  P.limits = CATS.map((c, i) => limit(c, i));
  P.anyLimit = !!ans('age') || CATS.some(c => ans('lim:' + c) != null && ans('lim:' + c) !== '');
  P.hide = (ans('over') ?? 'hide') === 'hide';
  P.framing = (ans('framing') ?? '1') === '1';
  P.band = ans('age') ? (AGES.find(a => a[0] === ans('age')) || [])[1] : null;
  P.pubHide = (ans('pubage') ?? '1') === '1';
  P.style = ans('style') || ''; P.fair = +(ans('fair') || 0);
  P.lens = {}; LENS_GROUPS.forEach(g => g[1].forEach(([k]) => { const v = ans('lens:' + k); if (v != null && v !== '' && v !== '0') P.lens[k] = v; }));
  const agreeAvg = (prefix, qs, keyOf, dirOf) => { const s = {}, n = {};
    qs.forEach((q, i) => { const a = ans(prefix + i); if (a == null || a === '') return; const k = keyOf(q), v = +a * 2.5; s[k] = (s[k] || 0) + (dirOf(q) < 0 ? 10 - v : v); n[k] = (n[k] || 0) + 1; });
    const o = {}; Object.keys(s).forEach(k => o[k] = Math.round(s[k] / n[k] * 10) / 10); return o; };
  P.found = agreeAvg('mf', FOUND_Q, q => q[1], () => 1);
  P.axes = agreeAvg('ax', AXES_Q, q => q[1], q => q[2]);
  const fw = agreeAvg('fw', FOLK_Q, q => q[1], q => q[2]);
  P.folk = Object.keys(fw).length ? fw : (ans('folkFrom') || {});
  P.big5 = agreeAvg('b5', BIG5_Q, q => q[1], q => q[2]);
  P.w = Object.fromEntries(PARTS.map(([k]) => [k, +(A.w[k] ?? DEF_W[k])]));
  P.has = {trad: P.trad.length > 0, content: P.anyLimit, lens: Object.keys(P.lens).length > 0 || !!P.style || P.fair > 0, found: Object.keys(P.found).length > 0, axes: Object.keys(P.axes).length > 0, folk: Object.keys(P.folk).length > 0, big5: Object.keys(P.big5).length > 0};
  return P;
}

const GPTS = {S: 100, A: 88, B: 72, C: 52, D: 28, F: 5};
const DEP_PEN = {Minor: 0, Discuss: 6, Significant: 14};
const stanceIdx = s => { const k = stanceKey(s); return k === 'Affirmed' ? 0 : k === 'Critiqued' ? 2 : k === 'Explored' ? 1 : -1; };
const STANCE_WORD = ['Champions', 'Explores', 'Critiques'];
const short = c => c.split(' and ')[0];

function scoreSeries(s, P) {
  const e = s.entry, parts = {}, why = [];
  let out = null;
  // Faith or philosophy
  if (P.has.trad) {
    const xs = P.trad.map(t => { const f = fitFor(e, t); if (!f) return null;
      const pen = P.dep ? (f.all || []).reduce((t2, x) => t2 + (DEP_PEN[x.f.weight] || 0), 0) / Math.max(1, (f.all || []).length) * (P.dep === 2 ? 1.6 : 1) : 0;
      return {t, f, v: Math.max(0, GPTS[f.g] - pen)}; }).filter(Boolean);
    if (xs.length) { parts.trad = xs.reduce((t, x) => t + x.v, 0) / xs.length;
      xs.forEach(x => why.push([x.v >= 70 ? 1 : x.v < 45 ? -1 : 0, `${x.t === 'Christian (any)' ? 'Christian (middle of all churches)' : x.t}: grade ${x.f.g}${x.f.f.weight ? `, depiction concern ${x.f.f.weight.toLowerCase()}` : ''}`, Math.abs(x.v - 60) * P.w.trad])); }
  }
  // Mature content
  const sc = {}; (e.content || []).forEach(c => sc[c.category] = c);
  if (P.has.content) {
    let pen = 0;
    CATS.forEach((c, i) => { const x = sc[c]; if (!x) return; let over = (x.score || 0) - P.limits[i];
      if (P.framing) { const f = (x.framing || '').toLowerCase(); if (/condemn|consequence/.test(f)) over -= 1; else if (/endorse/.test(f)) over += 1; }
      if (over > 0) { if (P.hide && (x.score || 0) > P.limits[i] + (P.framing ? 1 : 0)) out = out || `${short(c)} ${x.score} is over your limit of ${P.limits[i]}`;
        pen += 16 * over; why.push([-1, `${c} ${x.score}, your limit ${P.limits[i]}${P.framing && /endorse/i.test(x.framing || '') ? ' (shown approvingly)' : ''}`, 16 * over * P.w.content]); } });
    if (P.band) { if (BANDS.indexOf(ageBand(s)) > BANDS.indexOf(P.band) && !P.hide) pen += 10;
      if (s.pubrating && s.pubrating.min_age > BAND_AGE[P.band]) { if (P.pubHide) out = out || `${s.pubrating.publisher} rates it ${s.pubrating.rating}`; else { pen += 20; why.push([-1, `${s.pubrating.publisher} rates it ${s.pubrating.rating}`, 20 * P.w.content]); } } }
    parts.content = Math.max(0, 100 - pen);
    if (!pen) why.push([1, 'Within all your content limits', 12 * P.w.content]);
    if ((e.understated || []).length) why.push([-1, 'Intensity may be understated: check', 5]);
  }
  // Big ideas
  if (P.has.lens) {
    let t = 0;
    (e.lenses || []).forEach(l => { const k = lensKey(l.lens), pref = k && P.lens[k], si = stanceIdx(l.stance); if (!pref || si < 0) return;
      const v = LENS_TABLE[pref][si] * (l.strength || 0) / 10; t += v;
      if (Math.abs(v) >= .25) why.push([v > 0 ? 1 : -1, `${STANCE_WORD[si]} ${k.replace('/', ' / ')} (strength ${l.strength})`, Math.abs(v) * 30 * P.w.lens]); });
    let dv = 0; const dl = e.delivery;
    if (dl && P.style) {
      if (P.style === 'embodied') { const n = (dl.personified || []).length; dv += n ? .5 : -.2; if (n) why.push([1, `Ideas carried by characters (${dl.personified.slice(0, 2).map(x => x.character).join(', ')})`, 10 * P.w.lens]); }
      else if (dl.preachiness != null) { const c = 1 - Math.min(1, Math.abs(+dl.preachiness - PREACH_TARGET[P.style]) / 4); dv += (c - .5) * 1.2;
        if (c >= .75 || c <= .25) why.push([c >= .75 ? 1 : -1, `Message delivery: ${(dl.style || '').toLowerCase() || 'preachiness ' + dl.preachiness}`, 10 * P.w.lens]); } }
    if (dl && P.fair) { const ov = FAIR_VAL[(dl.opposing_views || '').toLowerCase()]; const straw = (dl.personified || []).filter(x => /strawman/i.test(x.treatment || '')).length;
      const f = ov != null ? ov - (straw && ov >= 0 ? .5 : 0) : straw ? -.5 : null;
      if (f != null) { dv += f * P.fair * .4; if (f) why.push([f > 0 ? 1 : -1, f > 0 ? 'Shows opposing views fairly' : 'Opposing views shown as strawmen', 10 * P.w.lens]); } }
    parts.lens = 50 + 50 * Math.tanh(t / 1.5 + dv);
  }
  // Moral priorities: closeness between what you stress and what the story stresses
  const near = (mine, theirs) => { const ks = Object.keys(mine).filter(k => theirs[k] != null); if (!ks.length) return null;
    return {v: 100 - 10 * ks.reduce((t, k) => t + Math.abs(mine[k] - theirs[k]), 0) / ks.length, ks}; };
  if (P.has.found && e.foundations) { const r = near(P.found, e.foundations);
    if (r) { parts.found = r.v; const top = r.ks.filter(k => P.found[k] >= 7).sort((a, b) => e.foundations[b] - e.foundations[a]);
      if (top.length && e.foundations[top[0]] >= 7) why.push([1, `Stresses ${FOUND_NAME[top[0]].toLowerCase()}, which you rank high`, 8 * P.w.found]);
      const gap = r.ks.filter(k => P.found[k] >= 7 && e.foundations[k] <= 2)[0]; if (gap) why.push([-1, `Little ${FOUND_NAME[gap].toLowerCase()}, which you rank high`, 8 * P.w.found]); } }
  if (P.has.axes && e.axes) { const r = near(P.axes, e.axes); if (r) { parts.axes = r.v;
    const far = r.ks.map(k => [k, e.axes[k] - P.axes[k]]).filter(x => Math.abs(x[1]) >= 4)[0];
    if (far) { const ax = AXES.find(a => a[0] === far[0]); why.push([-1, `Leans ${far[1] > 0 ? ax[3] : ax[2]} on ${ax[1].toLowerCase()}, away from you`, 6 * P.w.axes]); } } }
  if (P.has.folk && e.folkways && e.folkways.dims) { const mine = {}, theirs = {};
    D.dims.forEach((d, i) => { if (P.folk[i] != null && e.folkways.dims[d]) { mine[i] = P.folk[i]; theirs[i] = e.folkways.dims[d].pos; } });
    const r = near(mine, theirs); if (r) { parts.folk = r.v; if (r.v >= 80) why.push([1, 'Everyday values close to yours', 6 * P.w.folk]); } }
  // Reader's temperament: a small genre and tone nudge
  if (P.has.big5) { let t = 0, n = 0;
    Object.entries(P.big5).forEach(([tr, v]) => { const m = BIG5_GENRE[tr]; (s.genres || []).forEach(g => { if (m[g] != null) { t += m[g] * (v - 5) / 5; n++; } }); });
    if (P.big5.N != null && sc['Fear and intensity']) { const f = sc['Fear and intensity'].score || 0; if (P.big5.N >= 6.5 && f >= 6) { t -= (f - 5) * (P.big5.N - 5) / 5; n++; why.push([-1, `Fear and intensity ${f}, for a reader who scares easily`, 6 * P.w.big5]); } }
    parts.big5 = 50 + 50 * Math.tanh(n ? t / Math.sqrt(n) : 0);
    if (parts.big5 >= 70) why.push([1, `Genres suit your reader (${(s.genres || []).slice(0, 2).join(', ')})`, 4 * P.w.big5]); }
  let tw = 0, tv = 0; Object.entries(parts).forEach(([k, v]) => { tw += P.w[k]; tv += P.w[k] * v; });
  const score = tw ? Math.round(tv / tw) : null;
  why.sort((a, b) => b[2] - a[2]);
  return {score, parts, why, out};
}

function results() {
  const P = profile();
  const pool = D.series.filter(s => s.entry);
  const scored = pool.map(s => ({s, ...scoreSeries(s, P)})).filter(x => x.score != null);
  const keep = scored.filter(x => !x.out).sort((a, b) => b.score - a.score || (+b.s.popularity || 0) - (+a.s.popularity || 0));
  const left = scored.filter(x => x.out);
  return {P, keep, left, pool};
}
const mTile = v => `<span class="mscore ${v >= 80 ? 'm1' : v >= 65 ? 'm2' : v >= 50 ? 'm3' : 'm4'}" title="Match with your whole profile, 0 to 100">${v}<small>MATCH</small></span>`;
function profileCards(P) {
  const lensW = Object.entries(P.lens);
  const items = [
   ['Reader', [ans('age') ? `Age ${ans('age')}` : 'Any age', P.hide ? 'Over-limit series left out' : 'Over-limit series ranked lower'].join(' · ')],
   ['Faith or philosophy', P.trad.length ? P.trad.join(' and ') : 'Skipped'],
   ['Content limits', P.anyLimit ? CATS.slice(0, 7).map((c, i) => `${short(c)} ${P.limits[i]}`).join(', ') : 'Skipped'],
   ['Big ideas', lensW.length ? [lensW.filter(x => +x[1] > 0).map(x => x[0]).slice(0, 4).join(', ') && `Welcome: ${lensW.filter(x => +x[1] > 0).map(x => x[0]).slice(0, 4).join(', ')}`, lensW.filter(x => +x[1] < 0).length && `Wary of: ${lensW.filter(x => +x[1] < 0).map(x => x[0]).slice(0, 4).join(', ')}`].filter(Boolean).join('. ') : 'Skipped'],
   ['Moral priorities', Object.keys(P.found).length ? Object.entries(P.found).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k]) => FOUND_NAME[k]).join(', ') + ' first' : 'Skipped'],
   ['Society and politics', Object.keys(P.axes).length ? AXES.filter(a => P.axes[a[0]] != null).map(a => `${a[1]}: ${P.axes[a[0]] > 6 ? a[3] : P.axes[a[0]] < 4 ? a[2] : 'middle'}`).join(', ') : 'Skipped'],
   ['Everyday culture', Object.keys(P.folk).length ? (typeof nearest === 'function' ? 'Closest clusters: ' + nearest(D.dims.map((_, i) => P.folk[i] ?? 5), 2).map(x => x.c.name).join(', ') : 'Answered') : 'Skipped'],
   ['Reader\'s temperament', Object.keys(P.big5).length ? 'Answered (light genre nudge)' : 'Skipped']];
  return `<div class="prof">${items.map(([t, v]) => `<div><b>${esc(t)}</b>${esc(v)}</div>`).join('')}</div>`;
}
function stepResults() {
  const {P, keep, left, pool} = results();
  const used = PARTS.filter(([k]) => P.has[k] && P.w[k] > 0).map(([, l]) => l);
  const n = A.n || 20;
  return `<h1>Your matches</h1>
  <p class="lede">${keep.length} of ${pool.length} graded series ranked against your whole profile${left.length ? `, and ${left.length} left out for going over your limits` : ''}. ${used.length ? `Based on: ${used.join(', ')}.` : 'Answer a few questions to rank them.'}</p>
  <details class="panel"><summary>Your answers, in short</summary>${profileCards(P)}<p class="note">Change any part from the bar at the top.</p></details>
  <section class="stack" style="gap:10px"><div class="list">${keep.slice(0, n).map(x => row(x.s, mTile(x.score), `<div class="reasons">${x.why.slice(0, 4).map(([s, t]) => `<span class="${s > 0 ? 'p' : s < 0 ? 'n' : ''}">${s > 0 ? '+ ' : s < 0 ? '− ' : '· '}${esc(t)}</span>`).join('')}</div>`)).join('') || '<p class="empty">Nothing fits every limit. Try a higher limit, or choose "rank it lower" on the content step.</p>'}</div>
  ${keep.length > n ? `<button type="button" class="pill more" id="dqmore">Show 20 more</button>` : ''}</section>
  ${left.length ? `<details class="panel"><summary>Left out (${left.length})</summary><p class="note">Over one of your limits. Change limits on the <button type="button" class="linkbtn" data-dqgo="content" style="padding:0">content step</button>.</p><div class="list">${left.sort((a, b) => (+b.s.popularity || 0) - (+a.s.popularity || 0)).slice(0, 40).map(x => row(x.s, mTile(x.score), `<div class="reasons"><span class="n">− ${esc(x.out)}</span></div>`)).join('')}</div></details>` : ''}
  <details class="panel"><summary>How the match works</summary><div class="stack" style="gap:8px">
   <p>Each part gives a score from 0 to 100, and the match is their average, weighted by what you said matters most. Parts you skipped, or that a series has no data for yet, are left out rather than counted as zero.</p>
   <ul><li><strong>Faith or philosophy:</strong> the series' S to F grade for your tradition (S 100, A 88, B 72, C 52, D 28, F 5), minus a little for depiction concerns if you asked for that.</li>
   <li><strong>Mature content:</strong> 100, minus 16 for each point over a limit. A condemned depiction gets one point of room and a glorified one loses a point, if you chose that.</li>
   <li><strong>Big ideas:</strong> each idea you answered, times how strongly the series carries it and whether it champions, explores or critiques it. Where a series is marked for how it delivers its message, and how fairly it shows the other side, that counts here too.</li>
   <li><strong>Moral priorities, society and politics, everyday culture:</strong> how close the series' profile is to yours on each scale.</li>
   <li><strong>Temperament:</strong> a small nudge by genre, and by fear and intensity for a reader who scares easily.</li></ul>
   <p class="note">Most entries are quick reads built from summaries, so treat the match as a starting point. It describes fit with your answers; it does not say a series is good or bad.</p></div></details>
  <div class="nav"><span><button type="button" class="pill" id="dqsave">${A.saved ? 'Saved on this device ✓' : 'Save my answers on this device'}</button></span><button type="button" class="linkbtn" id="dqreset">Start over</button></div>`;
}

const VIEWS = {intro: stepIntro, reader: stepReader, trad: stepTrad, content: stepContent, lens: stepLens, found: stepFound, axes: stepAxes, folk: stepFolk, big5: stepBig5, weights: stepWeights, results: stepResults};
window.viewDeep = function () {
  const i = Math.min(Math.max(0, A.step | 0), STEPS.length - 1), k = STEPS[i];
  const prog = `<div class="prog" aria-label="Progress">${STEPS.map((s, j) => `<button type="button" data-dqgo="${s}" title="${esc(STEP_NAME[s])}" aria-label="${esc(STEP_NAME[s])}" class="${j < i ? 'done' : j === i ? 'cur' : ''}"></button>`).join('')}</div>`;
  const head = `<div class="eyebrow">${k === 'intro' ? 'Optional · about 10 to 15 minutes' : k === 'results' ? 'Your in-depth profile' : `Step ${i} of ${STEPS.length - 2}: ${esc(STEP_NAME[k])}`}</div>`;
  const nav = k === 'results' ? `<div class="nav"><button type="button" class="pill" id="dqback">← Back</button></div>` :
    `<div class="nav"><span style="display:flex;gap:10px;flex-wrap:wrap">${i ? '<button type="button" class="pill" id="dqback">← Back</button>' : ''}<button type="button" class="pill go" id="dqnext">${k === 'intro' ? 'Start' : k === 'weights' ? 'See my matches' : 'Next'}</button></span>${i && k !== 'weights' ? '<button type="button" class="linkbtn" id="dqskip">Skip this part</button>' : ''}${i ? '<button type="button" class="linkbtn" data-dqgo="results">Jump to my matches</button>' : ''}</div>`;
  return `<div class="dq stack" style="gap:18px">${prog}${head}<section class="step">${VIEWS[k]()}</section>${nav}</div>`;
};
const go = i => { A.step = typeof i === 'string' ? STEPS.indexOf(i) : i; A.n = 20; keep(); render(); window.scrollTo(0, 0); };
const clearPart = k => { const pre = {reader: ['age', 'pubage'], trad: ['t1', 't2', 'dep'], content: ['lim:', 'over', 'framing'], lens: ['lens:', 'style', 'fair'], found: ['mf'], axes: ['ax'], folk: ['fw', 'folkFrom'], big5: ['b5']}[k] || [];
  Object.keys(A.a).forEach(x => { if (pre.some(p => x === p || (p.endsWith(':') || /^(mf|ax|fw|b5)$/.test(p)) && x.startsWith(p))) delete A.a[x]; }); };
window.bindDeep = function () {
  const root = document.querySelector('.dq'); if (!root) return;
  root.querySelectorAll('input[data-dq]').forEach(r => r.addEventListener('change', () => { const k = r.dataset.dq; if (k.startsWith('w:')) A.w[k.slice(2)] = +r.value; else A.a[k] = r.value; if (k.startsWith('fw')) delete A.a.folkFrom; keep(); }));
  root.querySelectorAll('select[data-dqs]').forEach(s => s.addEventListener('change', () => { A.a[s.dataset.dqs] = s.value; keep(); }));
  root.querySelectorAll('[data-dqgo]').forEach(b => b.addEventListener('click', () => go(b.dataset.dqgo)));
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
  on('dqnext', () => go(A.step + 1));
  on('dqback', () => go(A.step - 1));
  on('dqskip', () => { clearPart(STEPS[A.step]); go(A.step + 1); });
  on('dqmore', () => { A.n = (A.n || 20) + 20; keep(); const y = scrollY; render(); scrollTo(0, y); });
  on('dqvals', () => { Object.keys(A.a).forEach(x => { if (x.startsWith('fw')) delete A.a[x]; }); A.a.folkFrom = Object.fromEntries(VALS.pos.map((v, i) => [i, v])); keep(); render(); });
  on('dqsave', () => { A.saved = !A.saved; try { if (A.saved) localStorage.setItem(KEY, JSON.stringify(A)); else localStorage.removeItem(KEY); } catch (e) {} render(); });
  on('dqreset', () => { A = {step: 0, a: {}, w: {}, n: 20, saved: false}; try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {} render(); window.scrollTo(0, 0); });
};
// Prefill from the two-question start, if the parent already answered it.
if (!A.a.age && state.age) A.a.age = state.age;
if (!A.a.t1 && state.picked && state.profile) A.a.t1 = state.profile;
})();
