"use strict";
// =====================================================================
//  WHAT THE DOWNTOWN PLACES SELL AND SAY (Nov 14). Everything here except Dixie Lunch's menu (js/data/menus.js) is a stand-in
//  for Christian: item names are generic, prices are placeholders, and the facts are plain, general ones about the kinds of
//  things sold (how a washboard was used, what uranium glass is, what a bearing does). No business's sales are described.
// =====================================================================
const stockItem = ([id, name, c, kind, note]) => (itemDef(id, { name, price: c, kind: kind || 'goods', note }), { id, name, price: c });
// ---- each place's own menu (Christian, Nov 14: "each place has their own menu") ----
// None of these places posts a readable menu with prices online (bb Jack's posts photos of its menu, which can't be read from
// here). So each list holds what the place itself lists: the county's dining list (langladecounty.org/dine), its own site, its
// delivery listing, or dishes reviewers name. Prices are placeholders until Christian sends a photo of each menu.
const LISTED_NOTE = 'What this place lists. Prices are placeholders until we have its menu.';
// Banquet On A Bun (the county's dining list says 831 Fifth; its business points, which the map uses, say 829): hot dogs,
// burgers, Italian beef or steak sandwiches, to eat in, for delivery or to carry out
MENUS.banquet = { 'On a bun': [['bq_dog', 'Hot dog', 450], ['bq_burger', 'Burger', 900], ['bq_beef', 'Italian beef', 1050], ['bq_steak', 'Steak sandwich', 1200]] };
// the bakery at 1012 Fifth: the county lists its famous butter cookies, plus donuts, breads, pies and cakes
MENUS.pavek = { 'The case': [['pv_butter', 'Butter cookies, a dozen', 900], ['pv_donut', 'Donut', 150], ['pv_bread', 'Loaf of bread', 450], ['pv_pie', 'Pie', 1400], ['pv_cake', 'Cake', 1800]] };
// Woken Bear Coffee Company, 403 Superior: roasts its own coffee in-house; cold brew, Lotus energy drinks, refreshers shaken with
// coconut milk, smoothies, and scratch bakery that changes daily (its delivery listing); reviewers name the blueberry lemon
// scones, asiago bagels and sugar cookies
MENUS.wokenbear = { 'Coffee': [['wb_coffee', 'House coffee, roasted here', 300], ['wb_capp', 'Cappuccino', 450], ['wb_latte', 'Latte', 500], ['wb_shaken', 'Shaken espresso', 525], ['wb_cold', 'Cold brew', 450]],
  'Lotus, refreshers & smoothies': [['wb_lotus', 'Lotus energy drink', 550], ['wb_refresh', 'Refresher with coconut milk', 550], ['wb_smoothie', 'Strawberry smoothie', 600]],
  'Bakery (changes daily)': [['wb_scone', 'Blueberry lemon scone', 375], ['wb_bagel', 'Asiago bagel', 350], ['wb_cookie', 'Sugar cookie', 300]],
  'Beans to take home': [['wb_beans', 'Bag of fresh-roasted beans', 1500, 'goods', 'Roasted in Antigo. They\'ll grind it if you ask.']] };
// Be U Nutrition, 715 Fifth: "Downtown Antigo smoothie and juice bar"
MENUS.beu = { 'Smoothies & juice': [['bu_smoothie', 'Smoothie', 700], ['bu_juice', 'Juice', 500]] };
// Kastawayz Bar & Grill, 827 Fifth: burgers, sandwiches, panini, appetizers, weekday specials. A sit-down Wisconsin bar
// (Christian, Nov 14), so it opens through the bar code in bars.js.
MENUS.kastawayz = { 'Kitchen': [['kz_burger', 'Burger', 1000], ['kz_sand', 'Sandwich', 950], ['kz_panini', 'Panini', 1100], ['kz_app', 'Appetizer', 800]],
  'Weekday special': [['kz_special', 'Today\'s special', 1000]], __days: { 'Weekday special': [1, 2, 3, 4, 5] }, __board: 'The chalkboard says WEEKDAY SPECIALS.' };
// Animals Bar & Grill, 911 Fifth: "Sandwiches * Burgers"
MENUS.animals = { 'Sandwiches & burgers': [['an_burger', 'Burger', 1000], ['an_sand', 'Sandwich', 950]] };
// Hix's Hoffman House, 1015 Fifth: open Wednesday through Saturday for supper (Travel Wisconsin); reviewers name the honey
// butter chicken, and pasta with meatballs and marinara and lasagna on Wednesday's Italian night
MENUS.hoffman = { 'Supper': [['hh_chicken', 'Honey butter chicken', 1600]], 'Italian night': [['hh_pasta', 'Pasta with meatballs and marinara', 1400], ['hh_lasagna', 'Lasagna', 1500]],
  __days: { 'Supper': [3, 4, 5, 6], 'Italian night': [3] }, __closed: 'The kitchen\'s open Wednesday through Saturday for supper.', __board: 'The chalkboard says WEDNESDAY IS ITALIAN NIGHT.', __note: 'Dishes reviewers name. Prices are placeholders until we have the menu.' };
// bb Jack's Pizza & Sandwich Lounge, 523 Superior: homemade pizza, sandwiches, salads, wraps, burgers, soup, chili, daily
// specials and frozen homemade pizzas (county list); a children's menu (Travel Wisconsin)
MENUS.bbjacks = { 'Homemade pizza': [['bj_pizza', 'Homemade pizza', 1400]], 'Sandwiches, wraps & burgers': [['bj_sand', 'Sandwich', 900], ['bj_wrap', 'Wrap', 850], ['bj_burger', 'Burger', 950]],
  'Soup, chili & salad': [['bj_soup', 'Soup', 450], ['bj_chili', 'Chili', 550], ['bj_salad', 'Salad', 800]], 'Daily special': [['bj_special', 'Today\'s special', 1000]],
  'Kids\' menu': [['bj_kids', 'Kids\' meal', 600]], 'To take home': [['bj_frozen', 'Frozen homemade pizza', 1200, 'goods', 'Homemade, frozen. Bake it at home.']], __board: 'The chalkboard says DAILY SPECIALS.' };
// Spud City Creamery, in the back of Harper's Mercantile (826 Fifth): "artisan ice cream and specialty drinks including Boba"
MENUS.creamery = { 'Artisan ice cream': [['sc_1', 'One scoop', 350], ['sc_2', 'Two scoops', 525]], 'Specialty drinks': [['sc_boba', 'Boba tea', 600]] };
// ---- stand-in shop stock ----
const SHOPS = {
  harpers: [['hm_honey', 'Jar of Local Honey', 900], ['hm_candle', 'Soy Candle', 1400], ['hm_soap', 'Handmade Soap', 700], ['hm_card', 'Greeting Card', 500], ['hm_mug', 'Wisconsin Mug', 1600], ['hm_post', 'Postcards of Antigo', 200], ['hm_jam', 'Jar of Jam', 800]],
  lakeGroc: [['lk_bread', 'Loaf of Bread', 350, 'food'], ['lk_milk', 'Gallon of Milk', 400, 'drink'], ['lk_apples', 'Bag of Apples', 500, 'food'], ['lk_cheese', 'Block of Wisconsin Cheddar', 600, 'food'], ['lk_potato', 'Bag of Potatoes', 450, 'food'], ['lk_pop', 'Bottle of Pop', 250, 'drink']],
  lakeDrug: [['lk_bandage', 'Box of Bandages', 450, 'goods', 'For scrapes. +45 HP in a fight, or from the bag.'], ['lk_cough', 'Cough Drops', 300, 'goods', 'Honey and menthol.'], ['lk_sun', 'Sunscreen', 900, 'goods'], ['lk_ice', 'Instant Cold Pack', 400, 'goods', 'Squeeze it and it gets cold.'], ['lk_vit', 'Vitamins', 900, 'goods']],
  salon731: [['s7_clips', 'Sparkly Hair Clips', 600], ['s7_scrunch', 'Velvet Scrunchie', 500], ['s7_balm', 'Lip Balm', 400], ['s7_charm', 'Phone Charm', 800], ['s7_mirror', 'Pocket Mirror', 700]],
  flowers: [['fl_rose', 'A Red Rose', 400], ['fl_daisy', 'Bunch of Daisies', 900], ['fl_sunflower', 'Sunflower', 500], ['fl_tulip', 'Bunch of Tulips', 1200], ['fl_lily', 'White Lily', 600]],
  crafts: [['cr_yarn', 'Skein of Yarn', 600], ['cr_paint', 'Set of Paints', 1200], ['cr_beads', 'Jar of Beads', 500], ['cr_quilt', 'Quilted Potholder', 800], ['cr_wood', 'Carved Wooden Loon', 2500], ['cr_soap', 'Goat Milk Soap', 700]],
};
// ---------- the vintage and resale stores (Christian, Nov 13: "I will set them up but I need some interactivity") ----------
const VINTAGE = {
  'Simply Vintage And Primitive': { pitch: 'Old tools and household things. Every one of them did a job once.', quiz: 'whatisit',
    stock: [['sv_crock', 'Stoneware Crock', 2500, 'curio', 'Salt-glazed stoneware for pickles, butter or sauerkraut.'], ['sv_board', 'Washboard', 1800, 'curio', 'Wood frame, ridged metal. Before washing machines, laundry was scrubbed on these.'],
      ['sv_lantern', 'Railroad Lantern', 4500, 'curio', 'Railroad workers signaled trains by swinging lanterns like this.'], ['sv_iron', 'Sad Iron', 1500, 'curio', 'Solid iron, heated on a stove to press clothes.'], ['sv_peeler', 'Apple Peeler', 2200, 'curio', 'Clamp it to a table and turn the crank.']] },
  'Vintage Addiction Interiors': { pitch: 'Furniture and decor from every decade. Can you tell which is which?', quiz: 'decade',
    stock: [['va_clock', 'Starburst Wall Clock', 4500, 'curio', 'Brass rays around a small face, very 1950s.'], ['va_lamp', 'Lava Lamp', 3000, 'curio', 'Wax rising and falling in colored water.'],
      ['va_bowl', 'Patterned Glass Mixing Bowl', 2000, 'curio', 'Mid-century kitchen glass.'], ['va_chair', 'Mid-Century Armchair', 12000, 'curio', 'Tapered wooden legs, low and wide.']] },
  "Christian's Upscale Resale": { pitch: 'Gently used clothes, shoes and jewelry. And we buy things, too.', sell: true,
    stock: [['cu_coat', 'Wool Coat', 3500, 'curio', 'Heavy enough for a Northwoods January.'], ['cu_boots', 'Leather Boots', 3000, 'curio'], ['cu_scarf', 'Silk Scarf', 1200, 'curio'], ['cu_ring', 'Costume Ring', 800, 'curio']] },
  'Mr. Interchange': { pitch: 'Comics, toys, old games, and glassware you won\'t see anywhere else.', quiz: 'oddity',
    stock: [['mi_comic', 'Old Comic Book', 800, 'curio'], ['mi_cart', 'Game Cartridge', 2000, 'curio', 'Don\'t blow in it.'], ['mi_uranium', 'Uranium Glass Dish', 3000, 'curio', 'It glows green under a black light.'],
      ['mi_carnival', 'Carnival Glass Bowl', 2500, 'curio', 'An oily rainbow shine on pressed glass.'], ['mi_robot', 'Wind-Up Robot', 1500, 'curio']] },
};
const VINTAGE_QUIZ = {
  whatisit: [['A heavy wedge of solid iron with a handle. It sat on the wood stove until it was hot, and then...', 'It pressed wrinkles out of clothes', ['It cracked walnuts', 'It weighed flour', 'It held a door open'], 'That\'s a sad iron. "Sad" is an old word for heavy. Families kept several, heating one while using another.'],
    ['A wooden frame holding a sheet of ridged metal.', 'Scrubbing laundry by hand', ['Grating cheese', 'Making music', 'Drying dishes'], 'A washboard. Clothes were rubbed against the ridges in a tub of soapy water. Some bands still play them as instruments.'],
    ['A tall crock with a lid, and a wooden plunger through a hole in the lid.', 'Turning cream into butter', ['Mashing potatoes', 'Pressing apples', 'Storing coal'], 'A butter churn. Working the plunger sloshes the cream until the fat clumps into butter, leaving buttermilk behind.'],
    ['A wooden pole with a spike on the end and a hooked arm that swings.', 'Rolling and steering logs', ['Hanging laundry', 'Hooking fish', 'Climbing poles'], 'A peavey. Loggers used them to roll logs at landings and break up jams on the rivers, and logging is how this county got started.'],
    ['A long saw with a handle at each end.', 'Cutting big logs with two people', ['Trimming hedges', 'Cutting ice for two', 'Sawing boards for one'], 'A crosscut saw. Two sawyers pulled it back and forth between them, and it cut on the pull.'],
    ['A small iron machine that clamps to a table, with a crank and a fork.', 'Peeling apples', ['Grinding coffee', 'Sharpening pencils', 'Winding yarn'], 'An apple peeler. The crank turns the apple against a blade. Inventors patented many designs of them in the 1800s.']],
  decade: [['A wall clock with brass rays bursting out of it like a star.', 'The 1950s and 60s', ['The 1890s', 'The 1920s', 'The 1990s'], 'Starburst clocks went with the space-age look of the 1950s and early 60s.'],
    ['Kitchen appliances in avocado green and harvest gold.', 'The 1970s', ['The 1940s', 'The 1980s', 'The 1950s'], 'Avocado green and harvest gold were the 1970s kitchen colors.'],
    ['A lamp with blobs of colored wax rising and sinking in a glass.', 'The 1960s and 70s', ['The 1930s', 'The 1910s', 'The 2000s'], 'The lava lamp was invented in Britain in 1963 and became an icon of the late 60s and 70s.'],
    ['Dark carved wood, a horsehair settee, heavy velvet curtains.', 'The late 1800s', ['The 1960s', 'The 1930s', 'The 1700s'], 'That\'s a Victorian parlor. Queen Victoria reigned from 1837 to 1901, and so did this taste for dark, heavy, ornate rooms.'],
    ['A vanity in chrome and black, all zigzags and sunbursts.', 'The 1920s and 30s', ['The 1870s', 'The 1960s', 'The 1990s'], 'Art Deco. The style took its name from a 1925 design exhibition in Paris.']],
  oddity: [['Glass that glows bright green under a black light.', 'Uranium glass', ['Milk glass', 'Carnival glass', 'Sea glass'], 'A little uranium in the mix makes the glass fluoresce under ultraviolet light. Most of it was made before World War II.'],
    ['Pressed glass with an oily rainbow shine.', 'Carnival glass', ['Depression glass', 'Crystal', 'Cut glass'], 'Carnival glass was cheap and popular in the early 1900s and was often handed out as fair prizes, which is where the name came from.'],
    ['Thin pink or green see-through dishes from the 1930s, sometimes given away free.', 'Depression glass', ['Uranium glass', 'Stained glass', 'Milk glass'], 'Factories made it cheaply during the Great Depression. Some was given away with movie tickets or boxes of oatmeal.'],
    ['A game cartridge that won\'t start. The old trick everybody used was...', 'Blowing in it, which didn\'t really help', ['Freezing it', 'Shaking it', 'Licking the contacts'], 'Blowing into cartridges was a famous habit. What actually helped was reseating the cartridge, and the moisture in your breath could corrode the contacts over time.']],
};
function vintageTalk(n) {
  const V = VINTAGE[n], o = [{ t: 'Browse', f: () => shopOpen(n.toUpperCase(), V.stock.map(stockItem), { note: STANDIN_NOTE }) }];
  if (V.quiz) o.push({ t: { whatisit: 'Play "What is it?"', decade: 'Play "Date the room"', oddity: 'Play "Name that oddity"' }[V.quiz], f: () => runQuiz(VINTAGE_QUIZ[V.quiz], 'Clerk', 'vintage_' + V.quiz) });
  if (V.sell) { o.push({ t: 'Sell something', f: () => resaleSell(false) }, { t: 'Consign something', f: () => resaleSell(true) }); if ((G.consign || []).length) o.push({ t: 'Check my consignments', f: resaleCollect }); }
  o.push({ t: 'Bye' }); ask('Clerk: ' + V.pitch, o);
}
function vintageLook(n, x, y) { const S = VINTAGE[n].stock, it = S[(x * 5 + y * 3) % S.length]; say([['', it[1] + ', tagged ' + money(it[2]) + '.' + (it[4] ? ' ' + it[4] : '')]]); }
// resale: sell now for a little, or consign for more after a real day (placeholders: 40% now, 70% on consignment)
function resaleSell(consign) {
  const ids = Object.keys(G.bag || {}).filter(id => ITEMS[id] && ITEMS[id].price);
  if (!ids.length) return say([['Clerk', 'Your bag\'s empty. Bring me something and I\'ll make you an offer.']]);
  shopOpen(consign ? 'CONSIGN · PAID AFTER A DAY' : 'SELL · PAID NOW', ids.map(id => ({ id, name: ITEMS[id].name + ' x' + G.bag[id], right: money(Math.round(ITEMS[id].price * (consign ? 0.7 : 0.4))) })),
    { note: (consign ? 'We sell it for you and you get 70% after a real day. ' : 'We pay 40% now. ') + 'Placeholder rates.', hint: consign ? 'A: CONSIGN   B: DONE' : 'A: SELL   B: DONE', doneLabel: 'Done', onPick: (it, S) => {
      const c = Math.round(ITEMS[it.id].price * (consign ? 0.7 : 0.4)); bagTake(it.id);
      if (consign) { (G.consign = G.consign || []).push({ id: it.id, c, at: Date.now() }); S.msg = 'Consigned. Check back after a day.'; } else { earn(c); S.msg = 'Sold for ' + money(c) + '.'; }
      saveGame(); S.items = S.items.filter(q => q.id !== it.id || (G.bag && G.bag[it.id])); if (!S.items.some(q => !q.done)) { SHOP = null; say([['Clerk', 'Pleasure doing business.']]); } } });
}
function resaleCollect() {
  const now = Date.now(), due = (G.consign || []).filter(q => now - q.at >= 864e5), wait = (G.consign || []).length - due.length;
  const sum = due.reduce((s, q) => s + q.c, 0); G.consign = (G.consign || []).filter(q => now - q.at < 864e5); if (sum) earn(sum); saveGame();
  say([['Clerk', (sum ? 'Your things sold. Here\'s ' + money(sum) + '.' : 'Nothing has sold yet.') + (wait ? ' ' + wait + ' still on the rack.' : '')]]);
}
// ---------- a general quiz runner: [question, answer, [wrong...], explanation] ----------
function runQuiz(Q, who, key) {
  const qs = shuffle(Q.slice()).slice(0, Math.min(5, Q.length)); let i = 0, right = 0;
  const next = () => {
    if (i >= qs.length) { G.quiz = G.quiz || {}; const best = Math.max(G.quiz[key] || 0, right); G.quiz[key] = best; saveGame(); return say([[who, right + ' out of ' + qs.length + '. Your best: ' + best + '.']]); }
    const [q, a, wrong, why] = qs[i++], opts = shuffle([a].concat(wrong));
    ask(q, opts.map(o => ({ t: o, f: () => { if (o === a) right++; say([[who, (o === a ? 'Right! ' : 'Not quite. ') + why]], next); } })));
  };
  next();
}
// ---------- Kegler's: what's that noise? ----------
const NOISES = [['A high squeal when you press the brakes, that stops when you let off.', 'Brake pads wearing thin', ['Low tire pressure', 'A loose gas cap', 'Old wiper blades'], 'Many brake pads have a small metal tab that squeals against the rotor once the pad wears down. It\'s a built-in warning.'],
  ['A grinding, metal-on-metal sound when you brake.', 'Pads worn down to the metal', ['A slipping belt', 'A dead battery', 'Too much oil'], 'The pad material is gone and steel is scraping the rotor. Braking is weaker and the rotors get chewed up. Stop driving on it.'],
  ['A clunk from underneath when you go over bumps.', 'Worn suspension parts', ['A clogged air filter', 'Low coolant', 'A bad spark plug'], 'Worn or loose suspension parts, like sway bar links, ball joints or strut mounts, knock when the wheels move up and down.'],
  ['A clicking from the front when you turn sharply, faster as you speed up.', 'A worn CV joint', ['A loose hubcap', 'A cracked windshield', 'A bad radio'], 'Front-wheel-drive cars send power to the wheels through CV joints. When the rubber boot tears and the grease leaks out, the joint wears and clicks in tight turns.'],
  ['A hum or growl that gets louder the faster you drive, and changes when you swerve.', 'A worn wheel bearing', ['Bald tires only', 'A loud exhaust', 'An empty washer tank'], 'That\'s a bearing in a wheel hub wearing out. Gene\'s down the street sells them.'],
  ['A squeal when you start the engine, rising and falling with the engine\'s speed.', 'A slipping drive belt', ['Worn brake pads', 'A flat tire', 'A bad horn'], 'The rubber belt that turns the alternator and other parts can loosen or glaze and slip on its pulleys, especially when it\'s cold or wet.'],
  ['Fast clicking when you turn the key, but the engine won\'t turn over.', 'A weak battery or a bad connection', ['Bad shocks', 'Too much gas', 'A worn wheel bearing'], 'The starter needs a big jolt of current. With a weak battery or corroded cables, its switch just clicks on and off.'],
  ['A sweet smell, and a puddle of green or orange fluid under the car.', 'A coolant leak', ['An oil change coming due', 'New tires', 'Brake dust'], 'Antifreeze smells sweet. A leak can overheat the engine, and it\'s poisonous to pets, who like the taste. Clean it up.']];
function noiseQuiz() { runQuiz(NOISES, 'Mechanic', 'noises'); }
// ---------- Gene's: what a bearing is, and why a bearing shop makes sense here ----------
const BEARINGS_TALK = [['Counter', 'A bearing lets one part turn or slide against another with as little friction as possible.'],
  ['Counter', 'The common kind is a ring of hardened steel balls or rollers held between two smooth rings, called races.'],
  ['Counter', 'The balls roll instead of rubbing, so a shaft turns easily and the metal doesn\'t grind itself away.'],
  ['Counter', 'Every wheel on a car, truck or trailer turns on bearings. So do alternators, water pumps, fans, electric motors, conveyor belts and farm machines.'],
  ['Counter', 'They wear out from heat, dirt, lost grease and heavy loads. A worn wheel bearing usually starts as a hum that gets louder with speed.']];
const BEARINGS_WHY = [['Counter', 'Around here, a lot of what keeps the county working turns on bearings: potato harvesters and tractors, logging equipment,'],
  ['Counter', '...sawmill and factory conveyors, and the trucks that haul it all.'],
  ['Counter', 'When a bearing fails in the middle of harvest, nobody can wait a week for shipping.'],
  ['Counter', 'A shop that keeps hundreds of sizes on the shelf, with seals, belts and grease, gets a machine running the same day.'],
  ['Counter', 'That\'s the business: knowing part numbers, stocking what the machines around here use, and being close by.']];
// ---------- the library's ten main classes (Dewey Decimal Classification) ----------
const DEWEY = [['000', 'Computer science, information and general works', 'Encyclopedias, libraries, news and computers.'], ['100', 'Philosophy and psychology', 'How people think and why they do what they do. Jung is around 150.'],
  ['200', 'Religion', 'The world\'s faiths and their scriptures.'], ['300', 'Social sciences', 'Government, law, money, schools and customs. Law books are around 340.'],
  ['400', 'Language', 'Dictionaries, grammar and learning other languages.'], ['500', 'Science', 'Math, stars, rocks, plants and animals.'],
  ['600', 'Technology', 'Medicine, farming, engines and cooking: science put to work.'], ['700', 'Arts and recreation', 'Painting, music, sports and games.'],
  ['800', 'Literature', 'Poetry, plays and essays. Many libraries shelve novels in their own fiction section.'], ['900', 'History and geography', 'Travel, biography and the past. Wisconsin history is around 977.5.']];
const MUSEUM_FACTS = ['This museum is in Antigo\'s 1905 library building, which is on the National Register of Historic Places.',
  'The county is named for Charles de Langlade, an 18th-century fur trader and soldier often called the father of Wisconsin.',
  'Antigo silt loam, the soil of the farms around town, is Wisconsin\'s official state soil.',
  'Logging and the railroad built this county in the late 1800s and early 1900s.',
  'Antigo\'s founder, Francis Deleglise, came here in the 1870s. His log cabin is kept on the museum grounds.'];
// ---------- the laundromat regulars (Christian: "people hanging out there doing laundry in funny outfits, and use old jokes") ----------
const OLD_JOKES = [['Why did the scarecrow win an award?', 'Because he was outstanding in his field.'], ['What did one wall say to the other wall?', '"I\'ll meet you at the corner."'],
  ['Why did the bicycle fall over?', 'It was two tired.'], ['What do you call a bear with no teeth?', 'A gummy bear.'], ['Why don\'t skeletons fight each other?', 'They don\'t have the guts.'],
  ['What\'s brown and sticky?', 'A stick.'], ['I tried to catch some fog yesterday.', 'Mist.'], ['Why did the cookie go to the doctor?', 'It was feeling crummy.'],
  ['What do you call cheese that isn\'t yours?', 'Nacho cheese.'], ['How do you make a tissue dance?', 'You put a little boogie in it.']];
const OUTFIT_LINE = { robe: 'Every single thing I own is in that dryer. Hence the robe.', snorkel: 'All my clothes are in the wash. This is what was left.', tux: 'It\'s a T-shirt with a tuxedo printed on it. Laundry day, but make it formal.' };
function laundryJoke(f) { const j = OLD_JOKES[(Math.floor(Date.now() / 7000) + f.length) % OLD_JOKES.length]; say([['', OUTFIT_LINE[f]], ['', j[0]], ['', j[1]]]); }
// ---------- the stranger (made up; the shadiness is his, not the building's or its owners') ----------
function strangerTalk(opera) {
  const L = opera ? ['They say this place was packed every night, once. Now it\'s just me and the dust.', 'Keep your eyes open, kid. Not everything in this town is what the signs say.']
    : ['You didn\'t see me here.', 'Funny thing about old buildings. They remember more than people do.', 'Some stories in this town aren\'t written in any book. Not yet.'];
  say(L.map(l => ['Stranger', l]));
}
