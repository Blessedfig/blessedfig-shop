// ---- Philosophies explained: a plain-language glossary of the breakdown, every tradition,
// every philosophy (lens), the political and moral scales, and the everyday-values clusters. ----
// Loaded after the main script, so it uses its globals (D, R, GROUPS, GRADES, GRADE_TEXT, HOPE, HOPE_ORDER,
// MC_ANCHORS, BANDS, PLAIN, esc, tslug, loadReasons). Descriptions are neutral: what each view holds, in its own terms.
(function () {
const css = `
.xp{max-width:78ch}
.xp .jump{display:flex;flex-wrap:wrap;gap:6px}
.xp .jump a{font:600 .82rem var(--f-body);border:1px solid var(--rule);border-radius:999px;padding:6px 12px;color:var(--ink);text-decoration:none;background:var(--panel)}
.xp .jump a:hover{border-color:var(--accent);color:var(--accent)}
.xp section.xs{scroll-margin-top:80px;display:flex;flex-direction:column;gap:12px;padding-top:18px;border-top:1px solid var(--rule)}
.xp section.xs > h2{margin:0}
.xp dl{display:grid;gap:12px;margin:0}
.xp dt{font-weight:800;font-family:var(--f-display)}
.xp dd{margin:2px 0 0}
.xp .xcards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:10px}
.xp .xc{background:var(--panel);border:1px solid var(--rule);border-radius:10px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0}
.xp .xc h4{margin:0;font-family:var(--f-display);font-size:1rem}
.xp .xc p{margin:0;font-size:.92rem}
.xp .xc .eg{color:var(--muted);font-size:.86rem}
.xp .xc details summary{cursor:pointer;font:600 .82rem var(--f-body);color:var(--accent)}
.xp .xc details p{margin-top:6px}
.xp .ends{display:flex;justify-content:space-between;gap:8px;font:600 .78rem var(--f-body);color:var(--muted)}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);

// One short, neutral introduction per tradition, in its own terms. The fuller guide (beliefs, topics, sources)
// is on the How we grade page; "What it looks for in stories" is pulled from that same guide.
const TRAD = {
 'Techno-Puritan': 'A new, small movement started by Malcolm and Simone Collins. It describes itself as Puritan values rebuilt for a technological age: large families, hard work, self-denial and thrift, an embrace of science and technology, and each family deliberately passing on its own culture. Many of its views, especially on having many children and on reproductive technology, are widely debated.',
 'Christian (any)': 'Not a tradition of its own. Choosing it shows the middle grade across every Christian church below (including the other Christian traditions, as Pew counts them), and the range when they disagree.',
 'Catholic': 'The largest Christian church, led by the Pope and the bishops. It teaches that God\'s truth comes through Scripture and Sacred Tradition, taught by the Church, and centers life on the seven sacraments, above all the Mass. The Catechism sets out its teaching on morality, family and art.',
 'Eastern Orthodox': 'The ancient churches of Greece, Russia, Eastern Europe and the Middle East, in communion with one another under their own patriarchs. Orthodoxy stresses worship, icons, the Church Fathers and theosis: growing into union with God over a lifetime.',
 'Baptist': 'Protestant churches marked by baptism of believers by immersion, the Bible as the final authority, and the independence of each local congregation. Beliefs vary between conventions; many follow a statement such as the Baptist Faith and Message.',
 'Non-denominational Evangelical': 'Independent Bible churches and evangelical congregations not tied to a denomination. They stress personal faith in Jesus, being born again, the authority of the Bible and sharing the gospel.',
 'Pentecostal / Charismatic': 'Christians who stress the work of the Holy Spirit today: speaking in tongues, healing, prophecy and lively worship. Includes the Assemblies of God and charismatic groups inside other churches. Many take spiritual warfare seriously, which shapes how they see magic and demons in stories.',
 'Reformed / Presbyterian': 'Protestant churches in the line of John Calvin: God\'s sovereignty and grace, Scripture as the final authority, and confessions such as the Westminster Confession. Many hold that all of life, art included, can be done to God\'s glory.',
 'Lutheran': 'Churches following Martin Luther\'s teaching that people are saved by grace through faith, not by their own works. Lutherans keep a liturgy and sacraments and see a believer as at once a sinner and forgiven. Church bodies range from conservative to progressive.',
 'Methodist / Wesleyan': 'Churches from John Wesley\'s revival: God\'s grace offered to everyone, growth in personal holiness, and practical care for the poor. Includes United Methodist, Global Methodist, Wesleyan, Nazarene and holiness churches, which differ on some moral questions.',
 'Anglican / Episcopal': 'The Church of England and its worldwide family, including the Episcopal Church in the US. It holds Scripture, tradition and reason together and worships through the Book of Common Prayer. Views range widely, from Anglo-Catholic to evangelical and from conservative to progressive.',
 'Anabaptist (Mennonite, Amish, Brethren)': 'Mennonite, Amish, Hutterite and Brethren churches from the Radical Reformation. They stress adult baptism, following Jesus in daily life, nonviolence, simple living and a community set apart from the wider world. Old Order groups are the most separate.',
 'Latter-day Saint': 'The Church of Jesus Christ of Latter-day Saints. Members believe in living prophets and further scripture, including the Book of Mormon, alongside the Bible. Families are seen as eternal, and the Church gives clear standards for media, dress and language.',
 'Mainline progressive Protestant': 'Older Protestant churches and congregations with a progressive outlook, such as the United Church of Christ and many Presbyterian, Lutheran, Episcopal and Methodist congregations. They read Scripture alongside historical scholarship and stress justice, inclusion and care for the vulnerable.',
 'Seventh-day Adventist': 'A Protestant church that keeps the Sabbath on Saturday and looks for Christ\'s soon return. It stresses healthy living (many members avoid alcohol, tobacco and meat), and the writings of Ellen G. White guide many members\' choices about entertainment.',
 'Jehovah\'s Witness': 'A worldwide Christian movement that reads the Bible as God\'s word, does not hold the Trinity, and expects God\'s Kingdom to replace human governments. Witnesses avoid spiritism and magic and violent or immoral entertainment, and their publications give guidance on media.',
 'Christian Science': 'Founded by Mary Baker Eddy. It teaches that God is wholly good and spiritual, and that sickness and evil are not ultimately real and are overcome through prayer and right understanding. Its textbook is Science and Health with Key to the Scriptures.',
 'Orthodox Jewish': 'Judaism that holds the Torah, written and oral, as given by God at Sinai and fully binding. Daily life follows Jewish law (halakha): the Sabbath, kosher food, modesty and study. It ranges from Modern Orthodox to Haredi communities, which differ on secular culture.',
 'Conservative Jewish': 'Judaism that keeps Jewish law as binding while holding that it has always developed over history. Its rabbis rule on modern questions, and it values both tradition and scholarship.',
 'Reform Jewish': 'The largest Jewish movement in the US. It treats Jewish law as a guide rather than binding, stresses informed personal choice, and puts ethics and social justice (tikkun olam, repairing the world) at the center.',
 'Muslim': 'Islam teaches one God (Allah), with Muhammad as the final prophet and the Qur\'an as God\'s word. Life is guided by the Qur\'an, the Prophet\'s example (Sunnah) and Islamic law. Sunni and Shia Muslims, and different schools of law, vary on music, images and entertainment.',
 'Hindu': 'A family of traditions from India sharing ideas of dharma (right duty), karma, rebirth and liberation (moksha), with devotion to God in many forms. Practice varies widely between communities, many of which have rich traditions of epic storytelling.',
 'Buddhist': 'The Buddha\'s teaching that suffering comes from craving and can end through the Eightfold Path: ethical living, mental discipline and wisdom. Lay Buddhists keep the Five Precepts. Theravada, Mahayana (including Zen and Pure Land) and Vajrayana schools differ in practice.',
 'Sikh': 'A faith founded by Guru Nanak in Punjab and guided by the Guru Granth Sahib. It teaches one God, the equality of all people, honest work, sharing with others and remembering God. Initiated Sikhs keep the five articles of faith and avoid intoxicants.',
 'Bahá\'í': 'A faith founded by Bahá\'u\'lláh in the 1800s, teaching one God, the unity of the world\'s religions and of humanity, and the equality of women and men. Members avoid alcohol, drugs, backbiting and partisan politics, and value chastity and service.',
 'Shinto': 'Japan\'s native tradition of honoring kami, the spirits of nature, places, ancestors and great people, through shrines, festivals and purification. It has little fixed doctrine and is often practiced alongside Buddhism. Many manga draw on its imagery.',
 'Wiccan / Pagan': 'Modern nature-centered religions, including Wicca, Druidry and revived ancient polytheism. Many honor gods and goddesses, the seasons and the earth, and practice ritual and magic. A common Wiccan guide is "An it harm none, do what ye will."',
 'Scientologist': 'A religion founded by L. Ron Hubbard. It teaches that each person is a spiritual being (a thetan) who can recover their abilities through auditing and training, and it draws its ethics from Hubbard\'s writings.',
 'Progressive values': 'A non-religious outlook that stresses equality, inclusion, individual rights and reforming unjust systems. It values stories that represent people fairly and question prejudice and abuse of power.',
 'Historically Black Protestant': 'The churches that grew out of the Black church in America, such as the National Baptist conventions, the AME, AME Zion and CME churches and the Church of God in Christ. They preach salvation through Jesus Christ and God who delivers the oppressed, as in the Exodus, and the church stands at the center of family and community life.',
 'Atheist': 'People who do not believe in any god. There is no shared creed or leader; most look to reason and evidence and see this life as the one we have. They value honesty, kindness and fairness without religion.',
 'Agnostic': 'People who hold that whether God exists is unknown or cannot be known. Many stay open to a higher power or something spiritual; they value honest questions over certainty.',
 'Nothing in particular': 'People who belong to no religion and do not call themselves atheist or agnostic. Most still believe in God or a higher power, and many pray, but they set their own course rather than follow a church.',
 'Secular humanist': 'A non-religious philosophy holding that people can live ethical, meaningful lives through reason, science and compassion, without belief in God. It values free inquiry and human dignity.',
 'Traditional values': 'A values outlook, religious or not, that prizes family, faith, duty, love of country and inherited moral norms, and is cautious about rapid social change. It values stories that honor courage, loyalty and personal responsibility.',
 'Unitarian Universalist': 'A liberal religious community with no required creed, drawing on many faiths and on humanism. Members covenant around shared values such as the worth of every person, justice, the free search for truth and the interdependent web of life.',
 'Satanist': 'The non-theistic Satanism of the Church of Satan and The Satanic Temple, neither of which worships a literal devil. Both use Satan as a symbol of rebellion, personal freedom and reason. The Satanic Temple\'s tenets stress compassion, justice and bodily autonomy; the Church of Satan stresses self-interest and personal responsibility.'};

// Every philosophy (lens) the guide checks: what it holds, and how it tends to show up in a story.
const LENSES = [
 ['Faith and the spiritual', [
  ['Christian', 'God made the world good; people fell into sin; Jesus Christ brings forgiveness and new life.', 'Sacrifice for others, forgiving enemies, grace the hero did not earn, hope beyond death.'],
  ['Jewish', 'One God in covenant with a people, a life shaped by God\'s law, memory, honest argument and repairing the world.', 'Justice, keeping faith across generations, wrestling openly with God.'],
  ['Islamic', 'One God, submission to His will, and a life guided by revelation, prayer and community.', 'Patience in trials, trust in God\'s decree, mercy joined with justice.'],
  ['Hindu ideas', 'Life is ordered by dharma (right order and one\'s duty) and by karma, the soul passes through many births (samsara), and liberation (moksha) comes through right action, knowledge, or loving devotion (bhakti) to God, who can enter the world in forms called avatars.', 'Gods and demons drawn from Indian myth, reincarnated heroes and avatars, characters bound by caste or duty, or a hero told to do their duty without clinging to the result.'],
  ['Buddhist ideas', 'Life as usually lived is marked by suffering (dukkha) that comes from craving, everything is impermanent and there is no lasting self, and a path of ethics, meditation and wisdom (or, in Pure Land teaching, trust in Amida Buddha\'s vow) leads out of rebirth to nirvana, with compassion for all beings at its heart.', 'Monks and temples, karma following a character across lives, peace found by letting go of a grudge or attachment, mercy toward enemies, and in Japanese works, funerals, family altars, Obon visits from the dead, Zen training, and Buddhist hells judged by King Enma.'],
  ['Confucian ethics', 'A good life is built through relationships and roles: respect for parents and elders, loyalty, courtesy and lifelong self-improvement.', 'A student honoring a master, duty to family, a society kept in harmony.'],
  ['Pantheist/New Age', 'The divine is the universe itself; everything is one energy, and the mind can shape reality.', 'Cosmic oneness, spiritual energy, willing an outcome into being.'],
  ['Pagan/occult', 'A world of spirits, nature gods, curses and pacts, with magic worked through ritual.', 'Summoning, contracts with demons, shrines and spirit worlds treated as real.'],
  ['Feel-good faith', 'What sociologist Christian Smith calls moralistic therapeutic deism, a term for a common modern belief: God wants people to be nice and happy, and steps in mainly when needed.', 'A vague kindly higher power, and goodness as simply being pleasant.']]],
 ['Meaning and purpose', [
  ['Secular humanism', 'Reason, science and compassion are enough to live well; meaning and ethics are made by people.', 'People solving problems together without divine help, faith in human progress.'],
  ['Naturalism', 'Only the natural world exists; mind and morality have natural explanations.', 'Every mystery turns out to have a scientific cause.'],
  ['Existentialism', 'Life comes with no given meaning, so each person must choose one and take responsibility for it.', 'A hero who defines who they are by their choices, against fate.'],
  ['Absurdism', 'Albert Camus\'s idea: the world does not answer our hunger for meaning, and the response is to live fully and defiantly anyway.', 'Stubborn, even cheerful, persistence in a world that seems pointless.'],
  ['Nihilism', 'Nothing has real meaning or value; right and wrong are illusions.', 'Villains or narrators who say nothing matters. A story can voice nihilism in order to answer it.'],
  ['Anti-natalism', 'Bringing a child into the world is a harm, because every life involves suffering.', 'Characters who wish they had never been born, or who regret creating life.'],
  ['Transhumanism', 'Technology should carry people past human limits such as illness, aging and death.', 'Cyborg upgrades, uploaded minds, the question of what makes us human.']]],
 ['How to live and choose', [
  ['Classical virtue ethics', 'From Aristotle and others: a good life comes from good character, built by habit: courage, justice, honesty, self-control and practical wisdom.', 'A hero who grows in character through training and hard choices.'],
  ['Stoicism', 'Focus on what you can control, accept the rest calmly, and master your passions.', 'A calm mentor, endurance in suffering, duty done without complaint.'],
  ['Duty ethics (deontology)', 'Some acts are right or wrong in themselves, whatever their results: we must keep promises, tell the truth, and treat every person as an end and never merely as a tool, even when breaking the rule would bring a better outcome.', 'A character who will not lie or break a promise even to win, who refuses to sacrifice one innocent to save many, or who defends the law against a vigilante\'s results.'],
  ['Bushido / honor code', 'A warrior should live by a code of honor: loyalty to one\'s lord or cause above self, rectitude, courage, self-control and courtesy, and readiness to die rather than live in disgrace.', 'A swordsman who keeps his word at any cost, loyalty to a master or clan, duels fought by the rules, shame worse than death, ritual suicide, and stories asking whether the code is noble or a trap.'],
  ['Pacifism / nonviolence', 'Violence, and above all war, is wrong and should be refused on principle, even at cost to oneself, and conflicts should be met by nonviolent means such as forgiveness, persuasion, protest, or bearing wrong rather than doing it.', 'A hero who vows never to kill, a warrior who lays down the sword, characters who break a cycle of revenge, or a story showing the horror of war and calling for peace.'],
  ['Utilitarianism', 'The right act is whatever produces the most good for the most people.', 'Sacrificing a few to save many, and characters arguing over whether that is right.'],
  ['Pragmatism', 'Ideas are judged by whether they work in practice.', 'Practical problem-solvers who care about results more than theories.'],
  ['Expressive individualism', 'Your truest self is found inside, in your feelings and desires, and a good life is expressing it whatever others expect.', '"Be true to yourself" against family or society.'],
  ['Hedonism', 'Pleasure and enjoyment are the main good in life.', 'Characters who live for fun, comfort or indulgence, shown as freeing or as empty.'],
  ['Consumerism', 'Happiness comes from buying, owning and status.', 'Wealth, brands and fame as the goal.'],
  ['Strength rules', 'The strong deserve to win, rule and take what they want; the weak have no claim on them.', 'Villains or whole worlds where power decides everything, often challenged by the hero.']]],
 ['Society and politics', [
  ['Traditionalism', 'Inherited customs, roles, faith and institutions carry wisdom and should be kept.', 'Honoring ancestors, keeping old ways, respected elders.'],
  ['Progressivism', 'Society should keep reforming toward greater equality and freedom from old restrictions.', 'Breaking unjust rules, outsiders winning acceptance.'],
  ['Communitarianism', 'People flourish in strong communities built by free members who take responsibility for each other.', 'A found family, a team or a village pulling together.'],
  ['Authoritarianism', 'People should obey a ruler, state or system over their own conscience, with order enforced from above. (Putting the group first by free choice is a different idea: see communitarianism and Confucian ethics.)', 'A controlling regime, shown as necessary or as the enemy.'],
  ['Liberalism', 'Each person has equal rights and freedoms that government exists to protect, power is legitimate only with the consent of the governed and under the rule of law, and people of differing beliefs should tolerate one another.', 'Constitutions and elections defended against a tyrant, fair trials and rights for the accused, free speech and religious tolerance, and heroes who fight for a free republic rather than a good king.'],
  ['Libertarianism', 'As much personal freedom as possible, and as little control by governments or others.', 'Rebels against control, self-reliant heroes.'],
  ['Anarchism', 'No state or ruler has a rightful claim to govern others by force, and society should run instead on free agreement, mutual aid and local cooperation without coercive hierarchy.', 'Rebels and outlaws who want no rulers at all, not just better ones, free towns or crews without a chain of command, and stories showing a stateless society as freedom or as chaos.'],
  ['Patriotism / nationalism', 'Love of and loyalty to one\'s country and people, with a readiness to serve and sacrifice for it; in its fuller political form, nationalism, the belief that the nation is the main unit of political life, should govern itself, and has first claim on its members\' loyalty.', 'Heroes defending a homeland, soldiers serving their country, the founding or unification of a nation, rival peoples at war, and stories asking whether love of country is noble or has turned into hatred of others.'],
  ['Critical theory', 'Society is shaped by power: dominant groups hold others down, and the hidden structures should be exposed.', 'Unjust social systems, prejudice built into institutions.'],
  ['Marxism', 'Karl Marx\'s view of history as class struggle, with owners exploiting workers.', 'Exploited laborers, corrupt elites, revolution.'],
  ['Feminism', 'Challenging limits and harms placed on women and girls. Its many schools differ widely on what that means.', 'Women breaking out of narrow roles, critiques of sexism.'],
  ['Postmodernism', 'Doubt that any single big story explains the world; truth and identity are seen as built by people and cultures.', 'Unreliable narrators, stories about stories, no clear right side.'],
  ['Environmentalism', 'Nature has worth of its own and must be protected; people are its stewards or its threat.', 'Nature striking back, pollution, living in harmony with the land.']]]];

const AXES = [
 ['Economic', 'Collective', 'Free market', 'Does the story favor shared, community- or government-led answers to money and work, or private property and open competition?'],
 ['Social', 'Authority', 'Liberty', 'Does it side with strong authority that keeps order, or with personal freedom from control?'],
 ['Cultural', 'Traditional', 'Progressive', 'Does it hold to inherited ways and roles, or favor changing them?'],
 ['Community', 'Individual first', 'Community first', 'When the person and the group pull apart, which does the story put first?']];
const FOUND = [
 ['Care', 'Protecting the weak and easing suffering.'],
 ['Fairness', 'Justice, honesty and people getting what they deserve.'],
 ['Loyalty', 'Standing by your family, team, people or country.'],
 ['Authority', 'Respect for parents, elders, leaders and good order.'],
 ['Sanctity', 'Treating some things as sacred or pure, and recoiling from what degrades them.'],
 ['Liberty', 'Resisting domination and control by others.']];
const DIMS = {
 'Dignity vs honor': 'Is a person\'s worth built in and protected by fair rules (dignity), or earned and defended in the eyes of others (honor)?',
 'Order vs freedom': 'Does the community prize shared rules and good order, or being left alone to live as you choose?',
 'Civic vs kin': 'Is loyalty owed first to the wider public and impartial rules, or to family and clan?',
 'Equality vs hierarchy': 'Are people treated as equals, or are rank and position respected?',
 'Tradition vs secular-rational': 'From the World Values Survey: are faith, family and national pride central, or is life organized around secular reason?',
 'Survival vs self-expression': 'Also from the World Values Survey: are security and hard work the priority, or self-expression, tolerance and quality of life?'};
const CL_GROUPS = {
 'Folkway': 'David Hackett Fischer\'s Albion\'s Seed (1989) traced four waves of British settlers to colonial America (Puritans to New England, Cavaliers to Virginia, Quakers to the Delaware Valley and Borderers to the Appalachian backcountry) and argued that each brought customs that still shape American life.',
 'American nation': 'Colin Woodard\'s American Nations (2011) divides North America into eleven regional cultures, each rooted in the people who first settled it.',
 'World zone': 'The Inglehart-Welzel cultural map, built from the World Values Survey, groups countries into broad zones that share values on tradition and on self-expression.'};

const SECTIONS = [['breakdown', 'Reading a breakdown'], ['traditions', 'Traditions'], ['philosophies', 'Philosophies'], ['leanings', 'Political and moral leanings'], ['values', 'Everyday values and cultures'], ['hope', 'Where stories find hope']];

const dl = items => `<dl>${items.map(([t, d]) => `<div><dt>${t}</dt><dd>${d}</dd></div>`).join('')}</dl>`;

function breakdown() {
  return dl([
   ['What this story argues', 'One plain sentence at the top of each series on what it holds up as good and worth living for, drawn from who is rewarded, who changes and how it ends.'],
   ['Main idea and push', 'The one philosophy the story is most built around, and whether it <strong>argues for</strong> it, <strong>argues against</strong> it or only <strong>explores</strong> it. <strong>Push</strong> (1 to 10) is how hard it presses that idea: Light, Moderate or Strong. Push measures force, not approval.'],
   ['Champions and pushes back on', 'The other ideas the story holds up, and the one it most argues against, in plain words. The full list is under "Philosophies it leans toward".'],
   ['Where it finds hope', 'The one thing the story holds out as the way through, such as family, faith or hard work. See <a href="#explained-hope">the list below</a>.'],
   ['The S to F grade', `How well the story's <em>message</em> fits a tradition, judged by that tradition's own teaching. It is not lowered just because a story is intense.<ul>${GRADES.map(g => `<li><strong>${g}: ${esc(GRADE_TEXT[g][0])}.</strong> ${esc(GRADE_TEXT[g][1])}.</li>`).join('')}</ul>`],
   ['Dashed border on a grade', 'A provisional grade, worked out from the depiction concern (Minor gives A, Discuss B, Significant C) until someone grades the series directly for that tradition.'],
   ['Depiction concern', 'Separate from the grade: how a tradition views what is <em>shown</em> on the page. <strong>Minor</strong>: little to raise. <strong>Discuss</strong>: worth talking through. <strong>Significant</strong>: many families in that tradition would hold off or read together.'],
   ['Older combined grade', 'Written before Jewish was split into Orthodox, Conservative and Reform. It shows under all three until each is graded on its own.'],
   ['Mature content 0 to 10', `How much mature content is on the page, scored for violence, fear, sexuality and romance, language, substances, mental health, imitable behavior and commercialism. The headline is the highest category. Higher means more, not worse.<ul>${MC_ANCHORS.map(([n, t]) => `<li><strong>${esc(n)}:</strong> ${esc(t)}</li>`).join('')}</ul>`],
   ['Suggested age band', `${BANDS.join(', ')}. A series fits a band only if every mature content category is under that band's limit. Strong reader tags (horror, gore, abuse and similar) can set a minimum band.`],
   ['Publisher rating', 'The English publisher\'s own age rating, such as VIZ\'s T+. It shows in red when the publisher rates it older than our band.'],
   ['Content warning', 'A red box on series with something many parents would want to know before reading, such as sexual content involving characters who may be minors. They are shown with the warning, not hidden.'],
   ['18+', 'Adult titles. Hidden unless you tick "Show 18+ titles".'],
   ['How the message is delivered', '<strong>Style</strong>: Subtle, Woven in, Explicit or Heavy-handed. <strong>Preachiness</strong> 0 to 10. <strong>Opposing views</strong>: shown Fair, Mixed, as a Strawman, or not shown. Some series also name the characters who stand for an idea, and whether the story treats them sympathetically.'],
   ['Philosophies it leans toward', 'Each philosophy the story engages, with its <strong>strength</strong> (0 to 10, how central it is), its <strong>stance</strong> (Affirmed, Explored, Critiqued or Incidental) and its <strong>closeness</strong> from S (strongly affirms) through C (explores without settling) to F (strongly critiques). See <a href="#explained-philosophies">every philosophy below</a>.'],
   ['Political and moral leanings', 'Four 0 to 10 scales and six moral foundations. See <a href="#explained-leanings">below</a>.'],
   ['Everyday values and culture', 'Where the story\'s everyday values sit on six scales, and which cultural clusters it sits closest to. See <a href="#explained-values">below</a>.'],
   ['How we reached this grade', 'For each tradition, the topics the story touches and that tradition\'s usual position on each, with the teaching cited in deep entries.'],
   ['Confidence labels', '<strong>Not analyzed yet</strong>: database facts only. <strong>From summaries</strong>: built from synopses, publisher ratings, parent guides and reviews, with no pages read. <strong>Full read</strong>: checked against the official English edition. Each entry also says how confident it is: high, medium or low.']]) +
   `<p class="note">The full method, step by step, is on <a href="#method">How we grade</a>.</p>`;
}

function tradCard(n) {
  const G = R && R.frames ? R.frames[n] : null;
  const st = G && G.stories ? `<details><summary>What it looks for in stories</summary><p>${esc(G.stories)}</p></details>` : '';
  const full = n === 'Christian (any)' ? '' : `<a class="note" href="#method-${encodeURIComponent(n)}">Read the full guide</a>`;
  return `<div class="xc" id="xt-${tslug(n)}"><h4>${esc(n)}</h4><p>${esc(TRAD[n] || '')}</p>${st}${full}</div>`;
}
const tradBody = () => GROUPS.map(([g, items]) => `<h3>${esc(g)}</h3><div class="xcards">${items.map(tradCard).join('')}</div>`).join('') +
  (R ? '' : '<p class="note">Loading what each tradition looks for in stories…</p>');

function lensBody() {
  const known = new Set(LENSES.flatMap(g => g[1].map(x => x[0])));
  const extra = (D.lenses || []).filter(l => !known.has(l));
  return LENSES.map(([g, items]) => `<h3>${esc(g)}</h3><div class="xcards">${items.map(([n, d, eg]) => `<div class="xc"><h4>${esc(n)}</h4><p>${esc(d)}</p><p class="eg"><strong>In a story:</strong> ${esc(eg)}</p><a class="note" href="#ideas" data-idea="${esc(n)}">See manga that engage it</a></div>`).join('')}</div>`).join('') +
    (extra.length ? `<p class="note">Also checked: ${extra.map(esc).join(', ')}.</p>` : '');
}

function leaningsBody() {
  return `<p>Four scales place the story, not its author. Each runs 0 to 10; 5 means the story takes no side.</p>
  ${dl(AXES.map(([n, a, b, q]) => [esc(n), `<div class="ends"><span>0 ${esc(a)}</span><span>10 ${esc(b)}</span></div>${esc(q)}`]))}
  <h3>Moral foundations</h3><p>From Jonathan Haidt's Moral Foundations Theory: six moral instincts people weigh differently. Each is scored 0 to 10 for how much the story leans on it. A high score is not a better score.</p>
  ${dl(FOUND.map(([n, d]) => [esc(n), esc(d)]))}`;
}

function valuesBody() {
  const cl = D.clusters || [];
  const groups = [...new Set(cl.map(c => c.group))];
  return `<p>An optional layer about everyday values, separate from religion: how people handle honor, rules, family loyalty, rank, tradition and self-expression. Each series and each cultural cluster sits somewhere on six scales. No position is better than another.</p>
  ${dl((D.dims || Object.keys(DIMS)).map(d => { const [l, r] = d.split(' vs '); return [esc(d), `<div class="ends"><span>0 ${esc(l)}</span><span>10 ${esc(r)}</span></div>${esc(DIMS[d] || '')}`]; }))}
  ${groups.map(g => `<h3>${esc(g === 'Folkway' ? 'The four British folkways' : g === 'American nation' ? 'The eleven American nations' : g === 'World zone' ? 'World culture zones' : g)}</h3>${CL_GROUPS[g] ? `<p>${esc(CL_GROUPS[g])}</p>` : ''}
    <div class="xcards">${cl.filter(c => c.group === g).map(c => `<div class="xc"><h4>${esc(c.name)}</h4><p>${esc(c.values)}</p></div>`).join('')}</div>`).join('')}
  <h3>Cultural heritage</h3><p>In the <a href="#values">quick version of the Family match quiz</a> you can start from a heritage your family identifies with (${(D.heritage || []).length} to choose from). Each heritage only points to the clusters its people commonly settled into or came from. It is a starting point, never a description of your family, and nothing about it is genetic.</p>
  <p class="note">Cluster positions are our estimates from each book's description, not scores printed in the books, and are still being checked.</p>`;
}

const hopeBody = () => `<p>Each series is tagged with the one thing it holds out as the way through. It says what kind of hope the story offers, not whether that fits your family or how good the story is.</p>
  ${dl(HOPE_ORDER.map(k => [esc(HOPE[k][0]), esc(HOPE[k][1])]))}
  <p class="note">The 300 most-read series were tagged by hand; the rest are estimated and marked so on the series page.</p>`;

window.viewExplained = function () {
  const body = {breakdown, traditions: () => `<p>Every grade is read from inside a tradition, using its own teaching. Each is described here in its own terms, in a sentence or two. None is ranked above another.</p><div id="xtrads" class="stack" style="gap:10px">${tradBody()}</div>`,
    philosophies: () => `<p>Beyond the traditions, each series is checked against ${(D.lenses || []).length} philosophies and worldviews. These describe what a story argues, not whether it is right. A story can give voice to an idea in order to reject it.</p>${lensBody()}`,
    leanings: leaningsBody, values: valuesBody, hope: hopeBody};
  return `<div class="stack xp"><div class="stack" style="gap:8px"><h1>Glossary</h1>
  <p class="lede">What every part of a series breakdown means, and a plain description of each tradition, philosophy and culture the guide uses. Every description is written to be fair to the people who hold it.</p>
  <nav class="jump" aria-label="On this page">${SECTIONS.map(([k, t]) => `<a href="#explained-${k}">${esc(t)}</a>`).join('')}</nav></div>
  ${SECTIONS.map(([k, t]) => `<section class="xs" id="x-${k}"><h2>${esc(t)}</h2>${body[k]()}</section>`).join('')}</div>`;
};

window.bindExplained = function (h) {
  const sec = h.startsWith('explained-') ? h.slice(10) : '';
  if (sec) setTimeout(() => document.getElementById('x-' + sec)?.scrollIntoView(), 0);
  document.querySelectorAll('.xp a[data-idea]').forEach(a => a.addEventListener('click', () => { state.idea = a.dataset.idea; save(); }));
  if (!R) loadReasons().then(d => { const el = document.getElementById('xtrads'); if (d && el) el.innerHTML = tradBody(); });
};
})();
