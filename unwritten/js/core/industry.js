"use strict";
// =====================================================================
//  POTATOES, LOGGING AND WOOD (Nov 14). Christian: "Research the potato industry for Volm and the farms to the most minute
//  details, that runs a big part of this town, logging too, we need to add that in, in some way. Including wood sciences at NTC."
//  Places open to visitors (Christian, later on Nov 14: "They should open their factories and labs and classrooms too"):
//    · Volm Companies, 1804 Edison St: a lobby with the bag story and a demonstration bagger, and through a door, a plant floor.
//      The real floor isn't public, so it's imagined: the general steps of making produce bags, and the machines Volm builds.
//    · NTC's Wood Technology Center of Excellence, 312 Forrest Ave: a classroom, a wood lab, the training sawmill, the saw filing room.
//    · NTC's Antigo campus building next door: the commons, a classroom, the welding lab, the machine shop, the nursing lab.
//  Each opens a box of set size behind its door, not the whole building; safety gear goes on at the shop-floor doors.
//  The museum gains railroad, logging, forest and soil facts. Every fact here was checked against a source on Nov 14, 2026;
//  the sources are in the project doc claude/potatoes-and-timber.md. People stay generic: nobody real is named, no business's
//  sales or earnings appear, and the staff lines are stand-ins for Christian to rewrite.
// =====================================================================
Object.assign(ROOM_STYLE, {
  plant: [['terrazzo', '#d8d4ca', '#c4beb0'], ['#eceae2', '#3a6a4a']],
  mill: [['concrete', '#8e8a84', '#7e7a74'], ['#d8d0c0', '#b8862a']],
});
Object.assign(KIND_ZONE, { plant: 'LOBBY', mill: 'TRAINING SAWMILL' });
Object.assign(FOLKS, {
  instructor: { skin: '#e2b48e', hair: '#6a4a2a', shirt: '#4a6a3a', shirt2: '#3a5a2e', pants: '#4a4a52', shoes: '#5a3a24', glasses: 1, vest: '#e8a030' },
  receptionist: { skin: '#c99878', hair: '#2a1e18', shirt: '#e8e4dc', shirt2: '#3a6a4a', pants: '#2a2c34', shoes: '#141416' },
});
// a hook may open a building the usual rules keep shut (a plant typed as a garage, an address off Fifth Avenue)
{ const _re = roomEligible; roomEligible = function (b) { if (b && !roomSkip(b) && roomHook(b).enter) return true; return _re(b); }; }

// ---------- new things to stand in a room ----------
const IND_PROP = {
  u(X, Y, h) {   // produce bags on a pallet: mesh you can see the potatoes through, and a label band
    qp('rgba(0,0,0,.22)', X + 1, Y + 19, 22, 4); qp('#a07a4a', X + 1, Y + 14, 22, 5); qp('#7a5a34', X + 1, Y + 18, 22, 1);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 3; i++) { const bx = X + 2 + i * 7, by = Y + 4 - j * 9;
      qp(j ? '#c8a878' : '#d8c8a0', bx, by, 7, 10);
      for (let k = 0; k < 4; k++) qp(['#b07850', '#9a6440', '#c08a5a', '#8a5a3a'][(h + i + j + k) % 4], bx + 1 + (k % 2) * 3, by + 2 + (k >> 1) * 4, 2, 3);
      qp(['#3a7a3a', '#c83a3a', '#3a5aa8'][(h + i) % 3], bx, by + 3, 7, 2); }
  },
  m(X, Y) {   // a demonstration bagger: a hopper, a scale with a lit display, a spout, a bag, a short conveyor
    qp('rgba(0,0,0,.25)', X - 2, Y + 18, 28, 4); qp('#5a5e66', X + 2, Y - 4, 4, 22); qp('#5a5e66', X + 18, Y - 4, 4, 22);
    qp('#8a8e96', X, Y - 16, 24, 10); qp('#a8acb4', X, Y - 16, 24, 2); qp('#6a6e76', X + 6, Y - 6, 12, 4);
    qp('#1a2a1a', X + 3, Y - 13, 9, 5); qp((frame >> 4) % 2 ? '#60f080' : '#40c060', X + 4, Y - 12, 7, 3);
    qp('#d8c8a0', X + 8, Y - 2, 8, 12); qp('#b07850', X + 9, Y + 4, 2, 2); qp('#9a6440', X + 12, Y + 6, 2, 2);
    qp('#2a2c30', X - 2, Y + 12, 28, 4); for (let i = 0; i < 7; i++) qp('#4a4c52', X - 2 + i * 4 + ((frame >> 2) % 4), Y + 13, 2, 2);
  },
  b(X, Y) {   // a band saw headrig: two big wheel housings, the blade between them, a log on the carriage
    qp('rgba(0,0,0,.25)', X - 4, Y + 18, 32, 4); qp('#5a5e66', X + 9, Y - 22, 6, 42);
    qp('#e8b830', X + 2, Y - 26, 20, 12); qp('#c89a20', X + 2, Y - 16, 20, 2); qp('#e8b830', X + 2, Y + 4, 20, 12); qp('#c89a20', X + 2, Y + 14, 20, 2);
    qp('#d8dce4', X + 11, Y - 14, 2, 18); qp('#4a3a2a', X - 6, Y + 6, 14, 8); qp('#c8a878', X - 6, Y + 6, 3, 8); qp('#e0c898', X - 5, Y + 8, 1, 4);
  },
  L(X, Y, h) {   // a log deck: three hardwood logs, bark on the side and rings on the end
    qp('rgba(0,0,0,.22)', X, Y + 19, 24, 4);
    for (let i = 0; i < 3; i++) { const ly = Y + 10 - i * 7, lx = X + (i === 2 ? 4 : i * 2);
      qp(['#5a4232', '#6a4a36', '#4e3a2c'][(h + i) % 3], lx, ly, 20 - (i === 2 ? 4 : 0), 8); qp('#3a2a20', lx, ly + 7, 20 - (i === 2 ? 4 : 0), 1);
      qp('#d8b880', lx, ly, 4, 8); qp('#b8946a', lx + 1, ly + 2, 2, 4); }
  },
  C(X, Y) {   // a dry kiln: an insulated steel box, a big door, a control panel with two lights
    qp('rgba(0,0,0,.25)', X, Y + 19, 24, 4); qp('#9aa0a8', X, Y - 20, 24, 40); qp('#b8bec6', X, Y - 20, 24, 2);
    qp('#7a8088', X + 3, Y - 14, 18, 32); qp('#5a6068', X + 11, Y - 14, 2, 32); for (let r = 0; r < 4; r++) qp('#c8ced6', X + 4, Y - 10 + r * 8, 1, 1);
    qp('#2a2c30', X + 15, Y - 18, 6, 4); qp('#e04040', X + 16, Y - 17, 1, 2); qp((frame >> 5) % 2 ? '#40e060' : '#208a30', X + 19, Y - 17, 1, 2);
  },
  J(X, Y) {   // a stickered lumber stack: boards with thin strips between the layers
    qp('rgba(0,0,0,.22)', X, Y + 19, 24, 4); qp('#5a5048', X + 1, Y + 16, 22, 3);
    for (let r = 0; r < 4; r++) { const ly = Y + 12 - r * 6; qp('#d8c094', X + 1, ly, 22, 4); qp('#c0a678', X + 1, ly + 3, 22, 1);
      for (let i = 0; i < 4; i++) qp('#b89a6a', X + 2 + i * 6, ly, 1, 3); qp('#4a3a2a', X + 3, ly - 2, 2, 2); qp('#4a3a2a', X + 11, ly - 2, 2, 2); qp('#4a3a2a', X + 19, ly - 2, 2, 2); }
  },
};
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) {
    if ((Fm.kind === 'plant' || Fm.kind === 'mill') && IND_PROP[t]) return IND_PROP[t](x * 24, y * 24, hash(x * 5 + Fm.seed, y * 9 + 2));
    return _rp(Fm, t, x, y); }; }

// ---------- Volm Companies: the lobby ----------
const VOLM_STORY = [
  'Volm Companies started in 1954 as a family-run general store in Bryant, a small community in Langlade County.',
  'The store sold groceries and hardware to dairy and potato farmers. Potato growers needed bags, so it began stocking burlap potato bags.',
  'The business moved to Antigo and began making bags of its own. Bags went from burlap to paper, then to plastic and mesh.',
  'Today it also builds packing machines, like baggers and balers, and makes mesh and other products besides bags.',
  'It is still a family business, headquartered here in Antigo.'];
const FIELD_TO_BAG = [
  'It starts with seed, but not the kind from a flower. Farmers plant seed potatoes: small potatoes, or pieces of one, each with eyes that sprout.',
  'Langlade County grows more seed potatoes than any other county in Wisconsin. Most of its 11,000 or so potato acres a year are seed.',
  'A new line starts clean in a university lab as tiny plantlets. Greenhouses near Rhinelander grow them into minitubers, then fields multiply them.',
  'Seed certification inspectors walk the fields during the season, looking for disease and for mixed-up varieties.',
  'In spring, seed potatoes are warmed and cut into pieces of 2 to 3 ounces, then planted.',
  'Many fields grow oats in the year between potato crops, to let the soil rebuild.',
  'At harvest the diggers lift the crop. Growers want the potatoes about 50 to 60 degrees inside, because cold potatoes bruise easily.',
  'Storage starts with curing: a week or two at about 50 to 60 degrees in very damp air, so cuts and scrapes heal over.',
  'Then they\'re cooled to hold. Seed and table potatoes are kept cold, around 38 to 45 degrees.',
  'Chip potatoes are kept warmer still, around 50 degrees. Cold turns starch to sugar, and sugar makes chips fry dark.',
  'At the packing shed, potatoes are washed, sorted and graded. Then a bagger weighs each bag, closes it, and they\'re stacked for the trucks.'];
const POTATO_QUIZ = [
  ['What do potato farmers plant?', 'Pieces of potato', ['Tiny potato seeds', 'Potato flowers', 'Potato leaves'], 'They plant seed potatoes: small whole potatoes or cut pieces, each with eyes that sprout.'],
  ['Langlade County leads Wisconsin in growing which kind of potato?', 'Seed potatoes', ['Sweet potatoes', 'Chip potatoes', 'Purple potatoes'], 'Most of the county\'s potato fields grow seed for other farms.'],
  ['Wisconsin\'s state soil is named for which city?', 'Antigo', ['Wausau', 'Madison', 'Green Bay'], 'Antigo silt loam has been the state soil since 1983. It formed in wind-blown silt over glacial sand and gravel.'],
  ['Why are chip potatoes stored warmer than table potatoes?', 'Cold turns starch to sugar, and chips fry dark', ['Warm potatoes are crunchier', 'Cold makes them sprout', 'Chips need soft potatoes'], 'Potatoes stored cold build up sugar, and sugar browns in the fryer. So chip stock is kept around 50 degrees.'],
  ['What happens during curing?', 'Cuts and scrapes heal over', ['The potatoes get washed', 'They get cooked', 'They turn green'], 'For a week or two after harvest, warm, damp storage lets the skin heal, so rot can\'t get in.'],
  ['What often grows between potato years on the Antigo Flats?', 'Oats', ['Rice', 'Cotton', 'Sugar cane'], 'Oats grow in the off year so the potato fields can rebuild.'],
  ['Where does a new Wisconsin seed potato line start?', 'In a lab, as tiny clean plants', ['In a grocery store', 'In the ocean', 'On a mountaintop'], 'A UW lab keeps clean plantlets. Greenhouses near Rhinelander grow minitubers, and fields multiply them.'],
  ['Where does Wisconsin rank among potato-growing states?', 'Third', ['First', 'Tenth', 'Last'], 'In 2025 Idaho grew the most, then Washington, then Wisconsin.'],
  ['After burlap and paper, potato bags moved to...', 'Plastic and mesh', ['Glass jars', 'Wooden barrels', 'Tin cans'], 'Half-and-half bags mix plastic, for printing, with mesh, to see the potatoes and let air through.']];
// Christian, Nov 14: "They should open their factories and labs and classrooms too." The lobby now has a door to a plant floor.
// The real plant's layout isn't public, so the floor is imagined: the general steps of making mesh and plastic produce bags, and the
// machines Volm is known to build (baggers, balers). Safety gear goes on at the door.
ROOM_HOOK['Volm Companies'] = { enter: true, gateD: true, kind: 'plant', lobby: [36, 30], title: 'VOLM COMPANIES',
  line: 'Volm Companies. A bright lobby with a wall of produce bags, from burlap to mesh, and a door to the plant floor.',
  zone: (F, x, y) => { const z = zoneAt(F, x, y); return z ? z.name : 'LOBBY'; },
  layout: (F, c) => {
    const { fx0, fx1, fy0, fy1, xs, put } = c, kv = fy1 - 11, ly = kv + 1;
    for (let u = fx0; u <= fx1; u++) if (F.R[kv][u] === '.') F.R[kv][u] = u === xs ? 'D' : 'W';   // the wall to the floor, and its door
    addZone(F, 'PLANT FLOOR', fx0, fy0, fx1, kv - 1, 'shopfloor', xs);
    // the lobby
    for (let v = ly + 1; v <= fy1 - 2; v += 2) { put(fx0, v, 'u'); put(fx1, v, 'K'); }   // bags down one wall, rolls and fence on the other
    for (let u = fx0 + 2; u <= fx1 - 2; u += 3) if (Math.abs(u - xs) > 3) put(u, ly, 'A');   // photos along the wall
    put(xs + 2, ly, '+');                                                                   // the safety station by the door
    put(fx0 + 3, ly + 3, 'E'); put(fx0 + 5, ly + 3, 'E'); put(fx1 - 3, ly + 3, 'm');        // history cases, the demonstration bagger
    const cx = Math.min(fx1 - 3, xs + 4); put(cx, ly + 6, 'c'); put(cx + 1, ly + 6, 'k');
    hookNpc(F, 'receptionist', cx, ly + 5, volmTalk, 'Receptionist');
    // the floor: making bags on the left of the walkway, the machine shop and shipping on the right
    const L0 = fx0, L1 = xs - 3, R0 = xs + 3, R1 = fx1;
    for (let u = L0; u <= L1; u += 2) put(u, fy0, '7');                                    // resin silos
    for (let u = L0 + 1; u <= L1 - 1; u += 3) put(u, fy0 + 3, '8');                        // extruders
    for (const v of [fy0 + 6, fy0 + 8]) for (let u = L0 + 1; u <= L1; u += 2) put(u, v, '9');   // looms
    for (let u = L0 + 1; u <= L1 - 1; u += 3) put(u, fy0 + 11, '@');                       // printing presses
    for (let u = L0 + 1; u <= L1; u += 2) put(u, fy0 + 14, '#');                           // converting: cutting and sewing
    for (let u = R0 + 1; u <= R0 + 4; u++) put(u, fy0 + 2, 'T');                           // the machine shop's benches
    for (let v = fy0; v <= fy0 + 3; v++) put(R1, v, 'q');
    put(R0 + 7, fy0 + 3, 'm'); put(R0 + 10, fy0 + 3, 'm');                                  // baggers being built and tested
    put(R0 + 3, fy0 + 8, '%');                                                              // the robot palletizer
    for (let u = R0 + 6; u <= R1 - 1; u += 2) put(u, fy0 + 8, 'u');
    for (let v = fy0 + 11; v <= fy0 + 15; v += 2) for (let u = R1 - 5; u <= R1; u += 2) put(u, v, 'u');   // finished bags, waiting for the trucks
    put(R0 + 1, fy0 + 13, '$'); put(R0 + 3, fy0 + 13, '$');                                 // wicketed bags
    put(R0 + 1, fy0 + 11, '&');                                                             // a forklift
    put(L1, kv - 1, '='); put(R0, kv - 1, '=');                                             // safety signs
    hookNpc(F, 'lead', xs + 2, kv - 2, floorLeadTalk, 'Floor lead');
  },
  look: (F, x, y, t) => {
    if (t === 'D') { ppeDoor(F, x, y, 'The door to the plant floor. Safety glasses and hearing protection from here on.'); return true; }
    const L = {
      u: ['Produce bags: all mesh, half plastic and half mesh, and printed plastic.', 'Mesh lets you see the potatoes and lets air through. Plastic takes printing: the brand, the weight, the variety.'],
      K: ['Not only potato bags. Rolls of mesh, and things like snow fence, garden fence and shade cloth, made for farm and hardware stores.'],
      A: ['An old photo: the company\'s Seventh Avenue office and warehouse in Antigo, in 1966.'],
      E: (x + y) % 2 ? ['A case of old bags: burlap first, then paper bags with a little window to see the potatoes through.'] : [VOLM_STORY[0], VOLM_STORY[1]],
      m: ['A bagger. On a packing line it weighs out each bag of potatoes, fills it through the spout and closes it.', 'A baler then packs filled bags into bigger bales for shipping.'],
      ...FLOOR_LOOK }[t];
    if (L) { say(L.map(s => ['', s])); return true; }
  } };
function volmTalk() {
  ask('Receptionist: Welcome to Volm Companies! The lobby tells the story, and the plant floor is through that door. What would you like to know?', [
    { t: 'How a potato gets to the store', f: () => say(FIELD_TO_BAG.map(s => ['Receptionist', s])) },
    { t: 'The company\'s story', f: () => say(VOLM_STORY.map(s => ['Receptionist', s])) },
    { t: 'Potato quiz', f: () => runQuiz(POTATO_QUIZ, 'Receptionist', 'potato') },
    { t: 'Bye' }]);
}

// ---------- NTC's Wood Technology Center of Excellence ----------
const WOOD_TOUR = [
  'This is Northcentral Technical College\'s Wood Technology Center of Excellence. It opened in 2011 on the Antigo campus.',
  'It\'s about 27,000 square feet. Langlade County, the City of Antigo, local schools and wood manufacturers helped build it.',
  'Its wood programs aren\'t offered at any other technical college in Wisconsin: a Wood Science degree, a one-year Wood Technology diploma, and shorter certificates.',
  'People already working in the industry train here too: kiln drying, setting up moulders, and grading and scaling hardwood logs.',
  'The National Hardwood Lumber Association runs its lumber inspector school here too.',
  'The training sawmill opened in 2025. It\'s built at full commercial scale, the first training sawmill like it in the country.',
  'NTC\'s Antigo campus began as the Antigo Vocational School, which merged with the college in 1969 and became its first regional campus.'];
const FOREST_TALK = [
  'Langlade County is about three-quarters forest, roughly 420,000 acres.',
  'Antigo grew up with the railroad, which arrived in 1881. Logging rail lines let lumber companies reach the hardwoods, which won\'t float down rivers like pine.',
  'By the 1920s, much of the logged-off land had been abandoned for back taxes. In 1928, county voters approved starting a county forest, 4,486 to 2,382.',
  'Today the Langlade County Forest covers about 130,000 acres. It\'s logged under plans, and it stays open to the public.',
  'Private owners can join Wisconsin\'s Managed Forest Law, from 1985: they follow a forest plan, and they pay lower property taxes.'];
const WOOD_QUIZ = [
  ['How big is one board foot?', '12 by 12 by 1 inch', ['1 foot by 1 inch by 1 inch', 'Any board a foot long', '12 by 12 by 12 inches'], 'A board foot is 144 cubic inches: a foot square and an inch thick. Hardwood lumber is sold by it.'],
  ['How thick is 8/4 ("eight quarter") lumber?', 'Two inches', ['Eight inches', 'Half an inch', 'Four inches'], 'Rough lumber is counted in quarters of an inch. Eight quarters make two inches.'],
  ['About how dry is lumber for furniture kiln-dried?', '6 to 8 percent moisture', ['0 percent', '30 percent', '50 percent'], 'That\'s close to where wood settles inside a heated home, so the piece won\'t shrink much later.'],
  ['When wood dries below about 30 percent moisture, it starts to...', 'Shrink', ['Grow', 'Glow', 'Rot right away'], 'That\'s the fiber saturation point. The cell walls start giving up water, and the wood shrinks.'],
  ['What does a hardwood lumber grade measure?', 'How much clear wood a board yields', ['How strong it is', 'How old the tree was', 'How heavy it is'], 'Grades count clear, defect-free cuttings. The top grade, FAS, needs 83 1/3 percent.'],
  ['What are stickers in a lumber stack?', 'Thin strips that let air between boards', ['Price tags', 'Glue', 'Nails'], 'Stickers space the layers so air can dry every board evenly.'],
  ['What does a dry kiln control to dry lumber safely?', 'Heat and humidity', ['Sunlight only', 'Music', 'The color'], 'Dry it too fast and it cracks or warps, so kilns follow schedules, step by step.'],
  ['About how much of Langlade County is forest?', 'About three-quarters', ['About a tenth', 'None', 'All of it'], 'Roughly 420,000 acres, about 74 percent of the county.']];
// The Wood Center (Christian, Nov 14: "open their ... labs and classrooms too"): a hall at the front with a classroom on one side
// and a wood lab on the other, and the training sawmill behind a door. The room layout is imagined; the facts are checked.
ROOM_HOOK['Wood Technology Center of Excellence'] = { enter: true, gateD: true, kind: 'mill', lobby: [36, 30], title: 'WOOD TECHNOLOGY CENTER',
  line: 'NTC\'s Wood Technology Center of Excellence. Sawdust, machine oil, and the smell of fresh-cut maple.',
  zone: (F, x, y) => { const z = zoneAt(F, x, y); return z ? z.name : 'HALL'; },
  layout: (F, c) => {
    const { fx0, fx1, fy0, fy1, xs, put } = c, kv = fy1 - 12, cl = xs - 4, lb = xs + 4, dv = fy1 - 3;
    for (let u = fx0; u <= fx1; u++) if (F.R[kv][u] === '.') F.R[kv][u] = u === xs ? 'D' : 'W';
    innerWalls(F, fx0 - 1, kv, cl, fy1 + 1, [[cl, dv]]); innerWalls(F, lb, kv, fx1 + 1, fy1 + 1, [[lb, dv]]);
    addZone(F, 'CLASSROOM', fx0, kv + 1, cl - 1, fy1, 'classroom'); addZone(F, 'WOOD LAB', lb + 1, kv + 1, fx1, fy1, 'lab');
    addZone(F, 'TRAINING SAWMILL', fx0, fy0, fx1, kv - 1, null, xs);
    // the hall: sample cases and the instructor
    put(xs - 2, kv + 5, 'E'); put(xs + 2, kv + 5, 'E'); put(xs - 2, kv + 8, 'E');
    hookNpc(F, 'instructor', xs + 2, kv + 2, woodTalk, 'Instructor');
    // the classroom: a whiteboard, the teacher in front of it, two rows of desks
    for (let u = fx0 + 1; u <= cl - 2; u++) put(u, kv + 1, '<');
    for (const v of [kv + 4, kv + 7]) for (let u = fx0 + 1; u <= cl - 2; u += 2) { put(u, v, 'T'); put(u, v + 1, 'h'); }
    for (let u = fx0; u <= cl - 4; u += 2) put(u, fy1, 'K', true);
    hookNpc(F, 'teacher', (fx0 + cl) >> 1, kv + 2, () => classTalk(), 'Teacher');
    // the wood lab: the moisture meter, the hand lens, sample shelves, the vacuum kiln
    put(lb + 2, kv + 2, '['); put(lb + 3, kv + 2, 'T'); put(lb + 5, kv + 2, '?'); put(lb + 6, kv + 2, 'T');
    for (let v = kv + 2; v <= fy1 - 1; v++) put(fx1, v, 'K');
    put(fx1 - 3, kv + 7, ';');
    hookNpc(F, 'labtech', lb + 4, kv + 4, () => labTalk(), 'Lab tech');
    // the sawmill: logs in, the headrig, the kilns, lumber out; the saw filing room and the grading table
    for (let u = fx0; u <= Math.min(fx0 + 4, xs - 3); u++) put(u, fy0, 'L');
    put(fx0 + 2, fy0 + 3, '(');                                                             // the debarker
    put(Math.min(fx0 + 6, xs - 3), fy0 + 3, 'b');                                           // the headrig
    for (let u = fx0 + 4; u <= xs - 3; u++) put(u, fy0 + 7, u === fx0 + 8 ? ')' : u === fx0 + 12 ? '*' : '^');   // rollers, the edger, the trimmer
    for (let u = xs + 4; u <= fx1 - 1; u += 3) put(u, fy0 + 11, 'J');                       // more lumber, air-drying
    put(xs + 3, fy0 + 13, '&');
    for (let u = fx1; u >= Math.max(fx1 - 8, xs + 3); u -= 2) put(u, fy0, 'C');
    for (let u = fx1 - 1; u >= Math.max(fx1 - 9, xs + 3); u -= 2) put(u, fy0 + 4, 'J');
    put(xs + 4, fy0 + 8, ':'); put(xs + 5, fy0 + 8, ':');
    const sf = Math.min(xs - 4, fx0 + 8); innerWalls(F, fx0 - 1, kv - 6, sf, kv, [[sf, kv - 3]]);
    addZone(F, 'SAW FILING ROOM', fx0, kv - 5, sf - 1, kv - 1, 'shopfloor');
    put(fx0 + 1, kv - 5, '~'); put(fx0 + 3, kv - 5, '~'); put(fx0, kv - 2, 'q');
    hookNpc(F, 'sawyer', xs + 2, kv - 2, () => sawyerTalk(), 'Sawyer');
  },
  look: (F, x, y, t) => {
    if (t === 'D') { ppeDoor(F, x, y, 'The door to the training sawmill. Safety glasses and hearing protection from here on.'); return true; }
    const L = {
      b: ['The training sawmill\'s headrig: a band saw, a loop of steel blade running over two big wheels.', 'The log rides past on a carriage, and each pass cuts off a board. Scanners read the log\'s shape so the sawyer can plan the best cuts.'],
      L: ['Hardwood logs, mostly northern hardwoods like maple and birch.', 'Lumber is measured in board feet. One board foot is 12 by 12 by 1 inch, or 144 cubic inches.', 'Rough lumber thickness is counted in quarters of an inch: 4/4 is one inch, and 8/4 is two.'],
      C: ['A dry kiln: an insulated room where heat, fans and steam control how fast lumber dries.', 'Wood starts to shrink once its moisture falls below about 30 percent, the fiber saturation point. Dry it too fast and it cracks or warps.', 'Lumber for furniture and cabinets is dried to about 6 to 8 percent, close to where it settles indoors.'],
      J: ['Kiln-dried lumber, stacked with stickers: thin strips between the layers so air reaches every board.', 'Hardwood is graded by how much clear wood a board yields. The top grade, FAS, needs boards at least 6 inches wide and 8 feet long with 83 1/3 percent clear cuttings.', 'No. 1 Common, the cabinet grade, needs at least 66 2/3 percent. Hardwood grades say nothing about strength, only clear wood.'],
      T: (zoneAt(F, x, y) || {}).name === 'CLASSROOM' ? ['A student desk. Somebody carved a tiny tree into the corner. Of course they did.'] : ['A workbench, with a moisture meter, a notebook and a stack of sample boards.'],
      E: ['A case of wood samples from northern Wisconsin trees, each labeled with its species.'],
      K: (zoneAt(F, x, y) || {}).name === 'WOOD LAB' ? ['Shelves of labeled wood samples: maple, oak, birch, ash, basswood, aspen, pine.'] : ['Shelves of textbooks: wood science, sawmilling, drying, grading.'],
      ...FLOOR_LOOK }[t];
    if (L) { say(L.map(s => ['', s])); return true; }
  } };
function woodTalk() {
  ask('Instructor: Welcome to the Wood Technology Center! Want the tour?', [
    { t: 'The tour', f: () => say(WOOD_TOUR.map(s => ['Instructor', s])) },
    { t: 'The forests around Antigo', f: () => say(FOREST_TALK.map(s => ['Instructor', s])) },
    { t: 'Wood quiz', f: () => runQuiz(WOOD_QUIZ, 'Instructor', 'wood') },
    { t: 'Bye' }]);
}

// ---------- rooms inside a room: inner walls with doorways, and zones with their own floor and name ----------
function innerWalls(F, u0, v0, u1, v1, gaps) {   // walls along a rectangle's edges (the outer walls are already there), doorways left open
  for (let v = v0; v <= v1; v++) for (let u = u0; u <= u1; u++) {
    if (v !== v0 && v !== v1 && u !== u0 && u !== u1) continue;
    const t = F.R[v] && F.R[v][u]; if (t == null || t === ' ' || t === 'W' || t === 'O' || t === 'e') continue;
    F.R[v][u] = gaps.some(([a, b]) => a === u && b === v) ? '.' : 'W';
  }
}
function addZone(F, name, u0, v0, u1, v1, floor, walk) {   // floor: a ROOM_STYLE key; walk: a walkway's middle column, edged in yellow
  (F.zones = F.zones || []).push({ name, u0, v0, u1, v1, walk, fm: floor ? Object.assign(Object.create(F), { kind: floor }) : null });
}
function zoneAt(F, x, y) { return (F.zones || []).find(z => x >= z.u0 && x <= z.u1 && y >= z.v0 && y <= z.v1) || null; }
{ const _ft = roomFloorTile; roomFloorTile = function (Fm, t, x, y) {
    const z = Fm.zones && zoneAt(Fm, x, y); _ft(z && z.fm ? z.fm : Fm, t, x, y);
    if (z && z.walk != null) { if (x === z.walk - 1) qp('#e8c020', x * 24, y * 24, 2, 24); if (x === z.walk + 1) qp('#e8c020', x * 24 + 22, y * 24, 2, 24); } }; }
Object.assign(ROOM_STYLE, {
  shopfloor: [['concrete', '#8e8e8a', '#7e7e7a'], ['#d8d8d2', '#3a6a4a']], classroom: [['carpet', '#4e5e7a', '#5e6e8a'], ['#ece8dc', '#4a6a8a']],
  lab: [['tile', '#e6e8e4', '#cfd4cf'], ['#f0f2ee', '#3a8a7a']], school: [['terrazzo', '#dcdcd4', '#c4c4bc'], ['#eceee6', '#2a5a8a']] });
Object.assign(KIND_ZONE, { school: 'COMMONS' });
// a door to a shop floor: the safety gear goes on, then the door opens for this visit
function ppeDoor(F, x, y, what) {
  ask(what, [{ t: 'Gear up and go in', f: () => { F.R[y][x] = '.'; F.rows[y] = F.R[y].join(''); say([['', 'Safety glasses on, earplugs in. The roar drops to a hum. In you go.']]); } }, { t: 'Not now' }]);
}

// ---------- the people on the floors (generic, made up) ----------
Object.assign(FOLKS, {
  lead: { skin: '#d9a77c', hair: '#3a2a20', shirt: '#c8e040', shirt2: '#e8e8e8', pants: '#3a4a6a', shoes: '#5a3a24', glasses: 1, hardhat: '#f0c020' },
  sawyer: { skin: '#e2b48e', hair: '#8a5a2a', shirt: '#e86a20', shirt2: '#e8e8e8', pants: '#3a4a6a', shoes: '#5a3a24', glasses: 1, hardhat: '#f4f4f0' },
  teacher: { skin: '#ecc19c', hair: '#5a3a24', shirt: '#6a7a4a', shirt2: '#5a6a3a', pants: '#3a3a44', shoes: '#2a2224', glasses: 1 },
  labtech: { skin: '#c99878', hair: '#1e1612', shirt: '#f4f4f8', shirt2: '#e4e4ec', pants: '#3a4a6a', shoes: '#2a2224', glasses: 1 },
  welder: { skin: '#e2b48e', hair: '#3a2a20', shirt: '#5a4a3a', shirt2: '#4a3a2a', pants: '#3a4a6a', shoes: '#2a2224', extra: 'cap' },
});
{ const _df = drawFolk; drawFolk = function (who, cx, by, t) {   // a hard hat
    _df(who, cx, by, t); const S = FOLKS[who]; if (!S || !S.hardhat) return; const bob = (t >> 5) % 2, R = (c, x, y, w, h) => F(c, Math.round(cx + x), Math.round(by + y), w, h);
    R('#1a1418', -9, -43 + bob, 18, 7); R(S.hardhat, -8, -42 + bob, 16, 6); R(shade(S.hardhat, -0.2), -10, -37 + bob, 20, 2); R(shade(S.hardhat, 0.25), -5, -41 + bob, 4, 1); }; }

// ---------- machines and fittings for the plant, the sawmill and the campus ----------
const XPROP = {
  A(X, Y) { qp('#5a3a22', X + 3, Y - 16, 18, 15); qp('#d8d0b8', X + 5, Y - 14, 14, 11); qp('#9a927e', X + 6, Y - 9, 12, 5); qp('#6a6252', X + 9, Y - 12, 4, 3); },   // a framed photo
  '7'(X, Y) { qp('rgba(0,0,0,.25)', X + 1, Y + 18, 22, 4); qp('#a8aeb6', X + 3, Y - 30, 18, 48); qp('#c8ced6', X + 3, Y - 30, 18, 3); qp('#8a9098', X + 3, Y - 8, 18, 2); qp('#7a8088', X + 10, Y + 10, 4, 8); qp('#5a6068', X + 6, Y + 16, 12, 3); },   // a resin silo
  '8'(X, Y) { qp('rgba(0,0,0,.25)', X - 2, Y + 18, 28, 4); qp('#5a6a7a', X - 2, Y + 2, 28, 10); qp('#7a8a9a', X - 2, Y + 2, 28, 2);   // an extruder: barrel, heater bands, hopper
    for (let i = 0; i < 4; i++) qp((frame >> 4) % 2 ? '#f08a30' : '#d86a20', X + 1 + i * 6, Y + 4, 3, 8);
    qp('#c8ccd2', X + 2, Y - 12, 10, 14); qp('#e8ecf0', X + 3, Y - 12, 8, 2); qp('#3a3c42', X - 2, Y + 12, 4, 7); qp('#3a3c42', X + 20, Y + 12, 4, 7); },
  '9'(X, Y) { qp('rgba(0,0,0,.22)', X, Y + 18, 24, 4); qp('#4a5a6a', X + 1, Y - 14, 2, 32); qp('#4a5a6a', X + 21, Y - 14, 2, 32); qp('#6a7a8a', X + 1, Y - 14, 22, 3);   // a loom
    for (let i = 0; i < 7; i++) qp('#f0ece0', X + 4 + Math.round(i * 2.5), Y - 10, 1, 22); qp('#d8a030', X + 3, Y - 6 + (frame >> 2) % 16, 18, 2); qp('#3a7a3a', X + 3, Y + 12, 18, 4); },
  '@'(X, Y) { qp('rgba(0,0,0,.25)', X - 1, Y + 18, 26, 4); qp('#3a4a5a', X, Y - 10, 24, 28);   // a printing press: rollers, four inks, the film
    for (let r = 0; r < 4; r++) { qp('#8a8e96', X + 2, Y - 8 + r * 6, 20, 4); qp(['#d83a3a', '#3a5ad8', '#e8c030', '#2a8a4a'][r], X + 2, Y - 8 + r * 6, 20, 1); } qp('#f0ece0', X + 4, Y + 14, 16, 4); },
  '#'(X, Y) { qp('rgba(0,0,0,.2)', X, Y + 18, 24, 4); qp('#8a8e96', X, Y + 2, 24, 10); qp('#a8acb4', X, Y + 2, 24, 2); qp('#c8b070', X + 2, Y - 2, 12, 6);   // converting: a sewing head and mesh
    for (let i = 0; i < 4; i++) qp('#a8904a', X + 3 + i * 3, Y - 2, 1, 6); qp('#3a3c42', X + 16, Y - 10, 6, 10); qp('#e8e8ea', X + 18, Y - 1 + (frame >> 2) % 3, 1, 3); qp('#4a4c52', X + 2, Y + 12, 3, 7); qp('#4a4c52', X + 19, Y + 12, 3, 7); },
  '$'(X, Y) { qp('rgba(0,0,0,.2)', X + 2, Y + 18, 20, 4); qp('#5a5e66', X + 11, Y - 12, 2, 30); for (let i = 0; i < 6; i++) qp(i % 2 ? '#e8e4dc' : '#d8d0c0', X + 4, Y - 6 + i * 3, 16, 2); qp('#c83a3a', X + 6, Y - 2, 12, 2); },   // wicketed bags
  '%'(X, Y) { const a = Math.round(Math.sin(frame / 25) * 8); qp('rgba(0,0,0,.25)', X - 4, Y + 18, 32, 4); qp('#e8b830', X + 8, Y + 4, 8, 14); qp('#c89a20', X + 8, Y + 16, 8, 2);   // a robot arm and a pallet
    qp('#e8b830', X + 10, Y - 10, 4, 16); qp('#e8b830', X + 10 + (a >> 1), Y - 14, 10, 4); qp('#3a3c42', X + 16 + a, Y - 12, 4, 6); qp('#a07a4a', X - 4, Y + 10, 10, 8); qp('#d8c8a0', X - 3, Y + 4, 8, 6); },
  '&'(X, Y) { qp('rgba(0,0,0,.25)', X, Y + 18, 26, 4); qp('#e8b020', X + 4, Y + 2, 16, 12); qp('#3a3c42', X + 6, Y - 8, 10, 10); qp('#9ad0f0', X + 7, Y - 7, 8, 5);   // a forklift
    qp('#5a5e66', X + 20, Y - 12, 2, 28); qp('#5a5e66', X + 20, Y + 14, 6, 2); qp('#141416', X + 5, Y + 14, 5, 5); qp('#141416', X + 14, Y + 14, 5, 5); },
  '+'(X, Y) { qp('#2a8a4a', X + 3, Y - 18, 18, 16); qp('#f4f4f0', X + 10, Y - 15, 4, 10); qp('#f4f4f0', X + 7, Y - 12, 10, 4);   // the safety station
    qp('#c8ccd2', X + 4, Y - 1, 16, 4); qp('#1a1418', X + 6, Y, 4, 2); qp('#1a1418', X + 12, Y, 4, 2); qp('#f0c020', X + 17, Y - 1, 3, 3); },
  '='(X, Y) { qp('rgba(0,0,0,.2)', X + 6, Y + 18, 12, 3); qp('#5a5e66', X + 11, Y - 2, 2, 20); qp('#f0c020', X + 3, Y - 16, 18, 14);   // a safety sign on a post
    qp('#1a1418', X + 4, Y - 15, 16, 1); qp('#1a1418', X + 4, Y - 4, 16, 1); for (let i = 0; i < 3; i++) qp('#1a1418', X + 6, Y - 12 + i * 3, 12 - i * 3, 1); },
  '<'(X, Y) { qp('#c8ccd2', X, Y - 20, 24, 16); qp('#f4f6f4', X + 1, Y - 19, 22, 14); qp('#8a8e96', X, Y - 4, 24, 2); const h = (X / 24 | 0) % 3;   // a whiteboard
    if (h === 0) { qp('#3a5ad8', X + 4, Y - 16, 12, 1); qp('#3a5ad8', X + 4, Y - 13, 9, 1); } else if (h === 1) { qp('#c83a3a', X + 5, Y - 15, 10, 8); qp('#f4f6f4', X + 7, Y - 13, 6, 4); } else qp('#2a8a4a', X + 3, Y - 16, 14, 1); },
  '['(X, Y) { qp('rgba(0,0,0,.2)', X + 1, Y + 17, 22, 4); qp('#8a6a44', X + 1, Y + 2, 22, 15); qp('#a8885a', X + 1, Y + 2, 22, 3); qp('#d8c094', X + 3, Y - 2, 16, 4);   // the moisture meter bench
    qp('#2a2c34', X + 14, Y - 8, 6, 9); qp('#9ad07a', X + 15, Y - 7, 4, 3); qp('#c8ccd2', X + 16, Y + 1, 1, 3); },
  '?'(X, Y) { qp('rgba(0,0,0,.2)', X + 1, Y + 17, 22, 4); qp('#8a6a44', X + 1, Y + 2, 22, 15); qp('#a8885a', X + 1, Y + 2, 22, 3);   // a microscope bench
    qp('#2a2c34', X + 9, Y - 12, 4, 14); qp('#2a2c34', X + 7, Y - 2, 9, 3); qp('#5a5e66', X + 10, Y - 15, 6, 4); qp('#d8b880', X + 3, Y - 1, 4, 3); },
  ';'(X, Y) { qp('rgba(0,0,0,.25)', X - 2, Y + 18, 28, 4); qp('#8a9098', X - 2, Y - 8, 28, 26); qp('#a8aeb6', X - 2, Y - 8, 28, 3); qp('#5a6068', X + 8, Y - 2, 8, 8);   // a vacuum kiln
    qp('#c8ccd2', X + 11, Y + 1, 2, 2); qp('#2a2c30', X + 18, Y - 5, 5, 4); qp((frame >> 5) % 2 ? '#40e060' : '#208a30', X + 19, Y - 4, 1, 2); },
  '~'(X, Y) { qp('rgba(0,0,0,.2)', X, Y + 18, 24, 4); qp('#5a5e66', X + 1, Y + 4, 22, 14); qp('#7a7e86', X + 1, Y + 4, 22, 2);   // a saw filing bench with a blade on it
    qp('#c8ccd2', X + 3, Y - 14, 18, 2); qp('#c8ccd2', X + 3, Y - 2, 18, 2); qp('#c8ccd2', X + 3, Y - 14, 2, 14); qp('#c8ccd2', X + 19, Y - 14, 2, 14); qp('#3a3c42', X + 9, Y - 8, 6, 6); if ((frame >> 2) % 4 === 0) qp('#f0d040', X + 12, Y - 3, 2, 2); },
  ':'(X, Y) { qp('rgba(0,0,0,.2)', X, Y + 17, 24, 4); qp('#6a4a2a', X, Y + 3, 24, 14); qp('#8a6a44', X, Y + 3, 24, 2); qp('#d8c094', X + 1, Y - 1, 22, 5); qp('#c0a678', X + 1, Y + 3, 22, 1); qp('#e8e4dc', X + 6, Y, 1, 3); qp('#e8e4dc', X + 15, Y, 1, 3); },   // the grading table
  ']'(X, Y) { qp('#6a6e76', X, Y - 18, 24, 36); qp('#8a8e96', X, Y - 18, 24, 2); qp('#d86a20', X + 2, Y - 14, 9, 30); qp('#b8541a', X + 4, Y - 14, 1, 30); qp('#b8541a', X + 8, Y - 14, 1, 30);   // a welding booth
    if ((frame >> 1) % 9 === 0) qp('#cfe8ff', X + 15, Y - 2, 4, 4); qp('#3a3c42', X + 13, Y + 4, 9, 10); },
  '}'(X, Y) { qp('rgba(0,0,0,.25)', X - 2, Y + 18, 28, 4); qp('#3a6a8a', X - 2, Y + 2, 28, 12); qp('#4a7a9a', X - 2, Y + 2, 28, 2); qp('#5a5e66', X, Y - 6, 8, 8);   // a lathe
    qp('#c8ccd2', X + 8, Y - 3, 12, 3); qp('#5a5e66', X + 20, Y - 6, 4, 8); qp('#3a3c42', X, Y + 14, 4, 5); qp('#3a3c42', X + 20, Y + 14, 4, 5); },
  '|'(X, Y) { qp('rgba(0,0,0,.25)', X + 1, Y + 18, 22, 4); qp('#3a6a8a', X + 3, Y + 4, 18, 14); qp('#4a7a9a', X + 6, Y - 20, 10, 24); qp('#5a5e66', X + 9, Y - 2, 4, 6); qp('#c8ccd2', X + 4, Y + 2, 16, 3); },   // a milling machine
  '('(X, Y) { qp('rgba(0,0,0,.25)', X - 2, Y + 18, 28, 4); qp('#3a5a7a', X - 2, Y - 6, 28, 24); qp('#4a6a8a', X - 2, Y - 6, 28, 2); qp('#1a1c22', X + 4, Y - 1, 16, 12);   // a debarker
    const r = (frame >> 2) % 4; for (let i = 0; i < 4; i++) qp('#c8ccd2', X + 6 + i * 4, Y + 1 + ((i + r) % 4) * 2, 2, 2); qp('#5a4232', X - 2, Y + 4, 6, 6); },
  ')'(X, Y) { qp('rgba(0,0,0,.25)', X - 1, Y + 18, 26, 4); qp('#e8b830', X, Y - 8, 24, 22); qp('#c89a20', X, Y + 12, 24, 2); qp('#2a2c30', X + 4, Y - 4, 16, 8);   // an edger
    qp('#d8dce4', X + 7, Y - 3, 1, 6); qp('#d8dce4', X + 16, Y - 3, 1, 6); qp('#d8c094', X - 2, Y + 15, 28, 3); },
  '*'(X, Y) { qp('rgba(0,0,0,.25)', X - 1, Y + 18, 26, 4); qp('#e8b830', X + 2, Y - 14, 20, 28); qp('#c89a20', X + 2, Y + 12, 20, 2); qp('#2a2c30', X + 6, Y - 10, 12, 10);   // a trimmer
    qp('#d8dce4', X + 9, Y - 8, 6, 6); qp('#d8c094', X - 2, Y + 15, 28, 3); },
  '^'(X, Y) { qp('#3a3c42', X, Y + 6, 24, 12); for (let i = 0; i < 4; i++) qp('#8a8e96', X + 1 + i * 6, Y + 7, 4, 10); qp('#d8c094', X, Y + 8 + ((frame >> 3) % 2), 24, 3); qp('#3a3c42', X + 2, Y + 18, 3, 2); qp('#3a3c42', X + 19, Y + 18, 3, 2); },   // log and board rollers
  '{'(X, Y) { qp('rgba(0,0,0,.22)', X - 1, Y + 18, 26, 4); qp('#c8ccd2', X, Y - 8, 24, 26); qp('#f4f6f8', X + 2, Y - 6, 20, 22); qp('#e8e4f0', X + 4, Y - 6, 16, 6);   // a practice bed and its mannequin
    qp('#d8c8b8', X + 9, Y - 5, 6, 5); qp('#9ab8d8', X + 2, Y + 4, 20, 12); qp('#5a5e66', X, Y + 16, 2, 4); qp('#5a5e66', X + 22, Y + 16, 2, 4); },
};
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (['plant', 'mill', 'school'].includes(Fm.kind) && XPROP[t]) return XPROP[t](x * 24, y * 24); return _rp(Fm, t, x, y); }; }
const FLOOR_LOOK = {
  '7': ['A resin silo. Plastic bags start as resin: little plastic pellets, delivered by the truckload.'],
  '8': ['An extruder. It melts the pellets and pushes the melt out through a die, as thin film or as flat tape.', 'The orange bands are heaters.'],
  '9': ['A loom, weaving plastic tape into mesh.', 'In a leno weave the strands run in pairs that twist around each other, so the mesh holds its shape.'],
  '@': ['A printing press. It prints the label onto the film: the brand, the weight, the variety.', 'Flexographic presses print from flexible plates wrapped around rollers.'],
  '#': ['Converting: rolls of mesh and film get cut, folded, and sewn or sealed into bags.'],
  '$': ['Wicketed bags, stacked on a wire wicket through holes at the top, so a bagging machine can pull them off one at a time.'],
  '%': ['A robot arm stacking cases of finished bags onto a pallet. It never gets tired, and nobody stands inside its reach.'],
  '&': ['A forklift. On a plant floor, forklifts get the right of way.'],
  '+': ['The safety station: safety glasses, earplugs and a first-aid kit.'],
  '=': ['A safety sign: STAY IN THE WALKWAY. EYE AND EAR PROTECTION REQUIRED.'],
  '<': ['A whiteboard. Somebody drew a tree\'s growth rings on it, with arrows: EARLYWOOD, LATEWOOD.'],
  '[': ['A moisture meter and a stack of sample boards. (Ask the lab tech.)'],
  '?': ['A hand lens and a microscope, for reading the end grain of wood. (Ask the lab tech.)'],
  ';': ['A vacuum kiln. Lower the air pressure and water boils off at a lower temperature, so some wood dries faster and gentler.'],
  '~': ['A saw filing bench. Band saw blades get sharpened, leveled and tensioned here, so they cut straight.'],
  ':': ['The grading table. Graders look over every board and mark its grade by how much clear wood it holds.', 'The National Hardwood Lumber Association trains its lumber inspectors right here.'],
  ']': ['A welding booth, with a curtain to block the light of the arc. Never look at an arc without a welding helmet.'],
  '}': ['A metal lathe. It spins the metal while a cutting tool shapes it.'],
  '|': ['A milling machine. It holds the metal still while a spinning cutter carves it.'],
  '(': ['A debarker. It strips the bark off each log first, so the grit in the bark won\'t dull the saws.'],
  ')': ['An edger. It trims the rough, bark-covered edges off each board so its sides run straight and parallel.'],
  '*': ['A trimmer. It cuts the boards to length and squares off the ends.'],
  '^': ['Rollers that carry boards from the headrig down the line, to the edger and the trimmer.'],
  '{': ['A practice hospital bed with a training mannequin.', 'Nursing assistant students practice here: taking vital signs, making a bed, helping someone move safely.'],
};

// ---------- Volm's plant floor: how a bag gets made (the general steps; the real floor isn't public) ----------
const BAG_STEPS = [
  'Plastic bags start as resin: little plastic pellets, delivered by the truckload and stored in silos.',
  'An extruder melts the pellets and pushes the melt out through a die, as a thin film or as flat tape.',
  'Tape gets stretched to make it stronger, then wound onto spools for the looms.',
  'Looms weave the tape into mesh. In a leno weave the strands run in pairs that twist around each other, so the mesh holds its shape.',
  'A printing press puts the label on: the brand, the weight, the variety. Flexographic presses print from flexible plates on rollers.',
  'Converting turns rolls into bags: cutting, folding, and sewing or sealing the seams.',
  'Some bags get stacked on a wire wicket, so a bagging machine can pull them off one at a time.',
  'In the shop, crews build and test the machines that fill the bags: baggers that weigh and fill, and balers that pack bags into bales.',
  'At the end of a line, a robot arm can stack the cases on pallets, and forklifts carry them out to the trucks.'];
const FLOOR_SAFETY = [
  'Stay between the yellow lines. Federal rules say aisles where forklifts run have to be clearly marked. Here, forklifts always get the right of way.',
  'Keep your earplugs in. When noise on the job averages 85 decibels over a shift, the employer has to run a hearing conservation program.',
  'Never reach into a machine that can move. Before anyone works on one, its power gets shut off and locked, with a tag on the lock. That\'s lockout/tagout.',
  'And the glasses stay on. Little bits of plastic fly when tape gets cut.'];
const BAG_QUIZ = [
  ['What do plastic bags start out as?', 'Resin pellets', ['Sand', 'Wood chips', 'Cotton'], 'Little plastic pellets, melted down in an extruder.'],
  ['What does an extruder do?', 'Melts plastic and pushes it out in a shape', ['Weaves mesh', 'Prints labels', 'Stacks pallets'], 'The melt comes out through a die as film or flat tape.'],
  ['In a leno weave, the strands...', 'Run in pairs and twist around each other', ['Are glued together', 'Are knotted by hand', 'Melt into one sheet'], 'That twist keeps the mesh from sliding out of shape.'],
  ['Why put bags on a wire wicket?', 'So a machine can pull them off one at a time', ['To dry the ink', 'To keep birds off', 'To make them pretty'], 'A bagging machine grabs the next bag right off the wicket.'],
  ['What do the yellow lines on a plant floor mark?', 'The walkways', ['Parking spots', 'A race track', 'Nothing at all'], 'Aisles where forklifts run have to be clearly marked.'],
  ['What is lockout/tagout?', 'Shutting off and locking a machine\'s power first', ['A fire drill', 'Locking the front door', 'A lunch break'], 'Nobody can switch a machine on while someone\'s hands are in it.']];
function floorLeadTalk() {
  ask('Floor lead: Welcome to the floor! Stay between the yellow lines, and keep your glasses on.', [
    { t: 'How a bag gets made', f: () => say([['', '(This floor is imagined for the game. The real plant floor isn\'t shown.)']].concat(BAG_STEPS.map(s => ['Floor lead', s]))) },
    { t: 'Safety on the floor', f: () => say(FLOOR_SAFETY.map(s => ['Floor lead', s])) },
    { t: 'Bag quiz', f: () => runQuiz(BAG_QUIZ, 'Floor lead', 'bags') },
    { t: 'Bye' }]);
}

// ---------- the Wood Center's classroom, lab and sawmill ----------
const WOOD101 = [
  'Hardwoods come from broad-leaved trees, like maple, oak and birch. Softwoods come from conifers, like pine and spruce.',
  'The names don\'t mean hard and soft. Balsa, one of the lightest woods there is, is a hardwood.',
  'Each year a tree adds a growth ring: lighter earlywood in spring, and denser latewood in summer.',
  'Sapwood, out near the bark, carries water up the tree. Heartwood, in the middle, doesn\'t anymore, and in many trees it\'s darker.',
  'As wood dries it shrinks most along the growth rings, about half as much across them, and hardly at all along the grain.',
  'That\'s why a flat-sawn board can cup as it dries, while a quarter-sawn board stays flatter.',
  'And wood never stops trading moisture with the air. In a dry winter house it shrinks a little. In a humid summer it swells.'];
const WOOD101_QUIZ = [
  ['Hardwoods come from which kind of tree?', 'Broad-leaved trees', ['Trees with needles', 'Only very old trees', 'Only very hard trees'], 'Maple, oak and birch are hardwoods. Pine and spruce, with needles, are softwoods.'],
  ['Balsa, one of the lightest woods there is, counts as a...', 'Hardwood', ['Softwood', 'Grass', 'Cork'], 'It grows on a broad-leaved tree, so it\'s a hardwood, soft as it is.'],
  ['A growth ring has lighter wood from spring and denser wood from...', 'Summer', ['Winter', 'The roots', 'The bark'], 'Earlywood grows fast in spring. Latewood grows slower and denser in summer.'],
  ['Which part of a log still carries water up the tree?', 'Sapwood', ['Heartwood', 'The pith', 'The knots'], 'Sapwood is the outer part. Heartwood, in the middle, no longer does.'],
  ['As wood dries, it shrinks the least...', 'Along the grain', ['Along the rings', 'Across the rings', 'Equally every way'], 'Lengthwise it barely shrinks at all. Most of the shrinking runs along the rings.'],
  ['Which board stays flatter as it dries?', 'Quarter-sawn', ['Flat-sawn', 'Painted', 'Wet'], 'Its growth rings run up and down through its thickness, so it shrinks more evenly.']];
const ENDGRAIN_QUIZ = [
  ['Big open pores in a band at the start of each ring. Which wood?', 'Red oak', ['Sugar maple', 'White pine', 'Basswood'], 'Oak is ring-porous: its springwood pores are big enough to see without a lens.'],
  ['Tiny pores spread evenly across each ring. Which wood?', 'Sugar maple', ['Red oak', 'White ash', 'White pine'], 'Maple is diffuse-porous. Its pores are too small to see without a lens.'],
  ['No pores at all, just little dots of resin canals. What kind of wood?', 'A softwood, like pine', ['A hardwood, like oak', 'Plywood', 'Balsa'], 'Softwoods don\'t have pores. Pines have resin canals instead.'],
  ['Oak and ash both have a band of big pores in each ring. That\'s called...', 'Ring-porous', ['Diffuse-porous', 'Pore-free', 'Spongy'], 'In ring-porous woods, the biggest pores grow each spring.'],
  ['The pale outer wood of a log is called...', 'Sapwood', ['Heartwood', 'Barkwood', 'Pith'], 'Heartwood is the middle, often darker. Sapwood is the outer, younger wood.'],
  ['Baseball bats are usually made from ash or...', 'Maple', ['Pine', 'Balsa', 'Cedar'], 'Both are tough hardwoods that take a hit without splitting.']];
const SAW_FLOW = [
  'Logs come in by truck and get scaled: measured to figure how much lumber is in them.',
  'A debarker strips the bark, so the grit in it won\'t dull the saws.',
  'The headrig makes the first cuts. Scanners read each log so the sawyer can get the most good boards out of it.',
  'An edger squares up the rough edges, and a trimmer cuts the boards to length.',
  'Then graders sort the boards, and they get stacked with stickers to air-dry or go in the kiln.',
  'Back in the saw filing room, the blades get kept sharp, level and tensioned, so they cut straight.'];
function classTalk() {
  ask('Teacher: Today\'s lesson is Wood 101. Want to sit in?', [
    { t: 'Sit in on the lesson', f: () => say(WOOD101.map(s => ['Teacher', s])) }, { t: 'Take the quiz', f: () => runQuiz(WOOD101_QUIZ, 'Teacher', 'wood101') }, { t: 'Bye' }]);
}
function labTalk() {
  ask('Lab tech: This is the wood lab. Want to try the moisture meter, or read some end grain?', [
    { t: 'Moisture check', f: moistureCheck }, { t: 'End-grain ID', f: () => runQuiz(ENDGRAIN_QUIZ, 'Lab tech', 'endgrain') }, { t: 'Bye' }]);
}
function moistureCheck() {
  const boards = Array.from({ length: 5 }, () => [6, 7, 8, 9, 11, 13, 16, 22][Math.random() * 8 | 0]); let i = 0, right = 0;
  const next = () => {
    if (i >= boards.length) { G.quiz = G.quiz || {}; G.quiz.moisture = Math.max(G.quiz.moisture || 0, right); saveGame(); return say([['Lab tech', right + ' out of 5 sorted right. Your best: ' + G.quiz.moisture + '.']]); }
    const mc = boards[i++], ready = mc <= 8;
    ask('Board ' + i + ' of 5. The meter reads ' + mc + ' percent. A cabinet shop wants 6 to 8. This board is...', [
      { t: 'Ready to ship', f: () => { if (ready) right++; say([['Lab tech', ready ? 'Right. Dry enough to stay put in somebody\'s kitchen.' : 'Too wet. It would shrink and crack after it\'s built into something.']], next); } },
      { t: 'Back in the kiln', f: () => { if (!ready) right++; say([['Lab tech', !ready ? 'Right. A few more days in the kiln.' : 'It\'s already in range. More drying just costs time and fuel.']], next); } }]);
  };
  say([['Lab tech', 'Lumber for furniture and cabinets gets dried to about 6 to 8 percent moisture. Sort these boards with the meter.']], next);
}
function sawyerTalk() {
  ask('Sawyer: Stay behind the rail when the carriage runs. Want to know how a log turns into lumber?', [
    { t: 'From log to lumber', f: () => say(SAW_FLOW.map(s => ['Sawyer', s])) }, { t: 'Bye' }]);
}

// ---------- NTC's Antigo campus: the commons, a classroom, the welding lab, the machine shop, the nursing lab ----------
// Facts from NTC's own Antigo campus page, read Nov 14, 2026. The rooms' layout is imagined.
const NTC_CAMPUS = [
  'This campus started as the Antigo Vocational School. It joined Northcentral Technical College in 1969, as the college\'s first regional campus.',
  'About 900 people take at least one class here every year.',
  'The Community Technology Center has free high-speed internet, an internet café, and space to work.',
  'The testing room is a Pearson VUE test center, with booths, computers and webcams, for certification exams.',
  'The College Prep Center gets you ready for college classes, and the Academic Resource Center helps once you\'ve started.',
  'And the Wood Technology Center of Excellence is right next door.'];
const NTC_PROGRAMS = [
  'More than 70 degrees and diplomas, and over 30 certificates, can be finished right here on this campus.',
  'Popular ones: Wood Science, Business Management, Welding, Industrial Electronics and Maintenance, Human Services, and Accounting.',
  'Also Small Business Entrepreneurship, Machine Tool Operation, Information Technology, Medical Assistant, and Nursing Assistant.'];
function ntcTalk() {
  ask('Front desk: Welcome to NTC\'s Antigo campus! What can I help you find?', [
    { t: 'About the campus', f: () => say(NTC_CAMPUS.map(s => ['Front desk', s])) }, { t: 'What can I study here?', f: () => say(NTC_PROGRAMS.map(s => ['Front desk', s])) }, { t: 'Bye' }]);
}
function weldTalk() {
  say([['Welding instructor', 'Welding joins metal by melting the edges together. An electric arc gets thousands of degrees hot.'],
    ['Welding instructor', 'Its light can burn your eyes, even from across the room. That\'s why welders wear helmets with dark lenses, and the booths have curtains.'],
    ['Welding instructor', 'Rule one in here: never look at the arc without a helmet.']]);
}
ROOM_HOOK['Northcentral Technical College'] = { enter: true, kind: 'school', lobby: [34, 26], title: 'NTC · ANTIGO CAMPUS',
  line: 'Northcentral Technical College, Antigo campus. A bright commons, a front desk, and doors to the classrooms and labs.',
  zone: (F, x, y) => { const z = zoneAt(F, x, y); return z ? z.name : 'COMMONS'; },
  layout: (F, c) => {
    const { fx0, fx1, fy0, fy1, xs, put } = c, hv = fy0 + 9, n = 4, w = Math.floor((fx1 - fx0 + 2) / n);
    const rooms = [['CLASSROOM', 'classroom'], ['WELDING LAB', 'shopfloor'], ['MACHINE SHOP', 'shopfloor'], ['NURSING LAB', 'lab']];
    for (let i = 0; i < n; i++) {
      const u0 = fx0 - 1 + i * w, u1 = i === n - 1 ? fx1 + 1 : fx0 - 1 + (i + 1) * w, du = (u0 + u1) >> 1, a = u0 + 1, b = u1 - 1;
      innerWalls(F, u0, fy0 - 1, u1, hv, [[du, hv]]); addZone(F, rooms[i][0], a, fy0, b, hv - 1, rooms[i][1]);
      if (i === 0) { for (let u = a; u <= b; u++) put(u, fy0, '<'); for (const v of [fy0 + 3, fy0 + 6]) for (let u = a; u <= b - 1; u += 2) { put(u, v, 'T'); put(u, v + 1, 'h'); }
        hookNpc(F, 'teacher', du, fy0 + 1, () => say([['Instructor', 'Class starts in five minutes. Grab any seat you like.'], ['', '(A stand-in. Christian can decide what gets taught in here.)']]), 'Instructor'); }
      if (i === 1) { for (let u = a; u <= b; u += 2) put(u, fy0, ']'); put(b, fy0 + 5, 'q'); hookNpc(F, 'welder', du, fy0 + 4, weldTalk, 'Welding instructor'); }
      if (i === 2) { for (let u = a; u <= b; u += 3) put(u, fy0 + 1, '}'); for (let u = a + 1; u <= b; u += 3) put(u, fy0 + 5, '|'); put(b, fy0 + 7, 'q'); }
      if (i === 3) { for (let u = a; u <= b; u += 3) put(u, fy0, '{');
        hookNpc(F, 'nurse', du, fy0 + 5, () => say([['Nursing instructor', 'Nursing assistant students practice on mannequins first: vital signs, making a bed with someone in it, helping a person move safely.'],
          ['Nursing instructor', 'Then they practice with real patients, with a nurse watching over them.']]), 'Nursing instructor'); }
    }
    for (let v = hv + 3; v <= fy1 - 2; v += 2) put(fx0, v, 'M');                    // the Community Technology Center's computers
    for (const v of [hv + 4, hv + 7]) for (let u = fx0 + 3; u + 2 <= Math.min(xs - 3, fx0 + 11); u += 4) { put(u, v, 'h'); put(u + 1, v, 'T'); put(u + 2, v, 'h'); }   // café tables
    put(fx1, hv + 4, 'D');                                                             // the testing room
    const cx = Math.min(fx1 - 4, xs + 4); put(cx, fy1 - 3, 'c'); put(cx + 1, fy1 - 3, 'c'); put(cx + 2, fy1 - 3, 'k');
    hookNpc(F, 'receptionist', cx + 1, fy1 - 4, ntcTalk, 'Front desk');
  },
  look: (F, x, y, t) => {
    if (t === 'D') { say([['', 'The testing room: booths with computers and webcams. Quiet, please. Somebody is taking an exam.']]); return true; }
    const z = (zoneAt(F, x, y) || {}).name;
    const L = { T: z === 'CLASSROOM' ? ['A student desk with a fold-down top.'] : ['A café table in the commons.'], M: ['A computer in the Community Technology Center. Free high-speed internet, for anyone.'],
      ...FLOOR_LOOK, '<': ['A whiteboard. Somebody wrote THIS WEEK across the top and nothing else.'] }[t];
    if (L) { say(L.map(s => ['', s])); return true; }
  } };

// ---------- the museum: railroad, logging, the county forest, the soil, the potatoes ----------
MUSEUM_FACTS.push(
  'The first train reached Antigo on August 15, 1881, on the Milwaukee, Lake Shore and Western line.',
  'Railroads let lumber companies reach hardwoods like maple, which couldn\'t be floated down rivers the way pine logs were.',
  'The Crocker Chair Company built its own rail line to bring timber from the Crocker Hills, about 15 miles away.',
  'In 1928, Langlade County voters approved a county forest on logged-off land, 4,486 to 2,382. It now covers about 130,000 acres.',
  'Antigo silt loam, named for this city, became Wisconsin\'s state soil in 1983. A marker for it stands northeast of town on Highway 52.',
  'Langlade County grows more seed potatoes than any other county in Wisconsin.');

for (const b of BLD) if (b.name && roomHook(b).enter) b.enter = b.enter || 1;
