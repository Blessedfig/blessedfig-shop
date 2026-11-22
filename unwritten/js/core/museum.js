"use strict";
// =====================================================================
//  THE LANGLADE COUNTY HISTORICAL SOCIETY MUSEUM, 404 Superior Street (Nov 15). The 1905 Carnegie library, the Deleglise
//  cabin of 1878 on its grounds, and the 440 locomotive and its caboose under their roof just north of the cabin.
//  Laid out from the Clio walking tour of the museum (2022): a main floor (the foyer and its stairwell, the welcome center
//  with its 2021 vestibule, the old reading room's exhibits and front desk, the research room), the lower level (the
//  library's 1960s children's room) and the upper floor (the art gallery, the military room in the old auditorium, the
//  railroad room, the one-room school). Where things stand inside, and the particular objects in the cases, are stand-ins
//  until Christian has photos. The building's facts are from its 1978 National Register nomination; the hours from the
//  society's site; the 440 from the Mid-Continent Railway Museum; the collections from Recollection Wisconsin; John Bradley
//  from the Marine Corps' 2016 statement.
//  Everything is told in our own words. Quotes come only from Robert M. Dessureau's History of Langlade County (Antigo,
//  1922), which is in the public domain (each one checked against the scanned page); its photographs are the cards in
//  assets/museum (scripts/museum/archive_cards.py). The society's own articles are copyrighted and are not copied.
//  Staff and visitors are generic stand-ins with stand-in lines; nobody real is drawn.
// =====================================================================
const MUSEUM = BLD.find(b => b.landmark === 'museum') || null;
const MUS_OWN = b => /HISTORICAL/.test(b.owner || '');
// the cabin: the society's small log building just northwest of the library (NRHP); the train shed: its long roof north of
// that, in two outlines (the locomotive's end and the caboose's end; OpenStreetMap's locomotive point is in the north one)
const MUS_CABIN = MUSEUM && BLD.find(b => b !== MUSEUM && MUS_OWN(b) && b.area < 100 && b.pxMax <= MUSEUM.pxMin + 0.01 && b.pyMax <= MUSEUM.pyMin + 0.01 && b.pyMax > MUSEUM.pyMin - 2) || null;
const MUS_SHED = MUSEUM ? BLD.filter(b => b !== MUSEUM && b !== MUS_CABIN && MUS_OWN(b) && b.pyMax <= MUSEUM.pyMin - 1 + 0.01 && b.pxMin < MUSEUM.pxMin + 2 && b.pxMax > MUSEUM.pxMin - 2).sort((a, b) => a.pyMin - b.pyMin) : [];
const SHED_N = MUS_SHED[0] || null, SHED_S = MUS_SHED[1] || null;
if (MUSEUM) MUSEUM.addr = '404 SUPERIOR ST';   // the society's, the National Register's and the Chamber's address (the county's parcel list files it under 410)
if (MUS_CABIN) { MUS_CABIN.name = 'Deleglise Cabin'; MUS_CABIN.addr = '404 SUPERIOR ST'; MUS_CABIN.type = 'shed'; MUS_CABIN.face = 'S';
  MUS_CABIN.style = { m: 3.4, h: Math.round(3.4 * PM), floors: 1, roof: 'gable', roofCol: '#5c5852', wall: '#a39886', mat: 'logs', win: 'none' }; }
if (SHED_N) { SHED_N.name = 'The 440'; SHED_N.addr = '404 SUPERIOR ST'; }
if (SHED_S) { SHED_S.name = 'The caboose'; SHED_S.addr = '404 SUPERIOR ST'; }
const MUS_CR = 'Dessureau, 1922. Public domain.';
for (const k of ['lib1922', 'fifth1922', 'bird1886', 'school1879']) { LM_IMG[k] = new Image(); LM_IMG[k].src = 'assets/museum/' + k + '.png'; }

// ---------- the calendar: hours, and the cabin's summer season ----------
function musMonth() {   // 0-11 in Antigo; a ?season= preview counts as that season's middle month
  const q = SKY.phase && new URLSearchParams(location.search).get('season');
  if (q) return { snow: 0, spring: 3, leafout: 4, early: 5, summer: 6, late: 7, color: 9, bare: 10 }[q] ?? new Date().getMonth();
  try { return +new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', month: 'numeric' }).format(new Date()) - 1; } catch (e) { return new Date().getMonth(); }
}
const musSummer = () => { const m = musMonth(); return m >= 4 && m <= 8; };   // May through September (the society's summer season)
const musToday = () => new Date().toDateString();
const MUS_HOURS = ['May through September: Tuesday to Saturday, 10 to 4.', 'October through April: Thursday to Saturday, 10 to 4.'];

// ---------- quotes from the 1922 History (public domain), each checked against the scanned page ----------
const MUS_PAGES = [
  { pg: 99, l: ['"Superior—Leading thoroughfare, north and south—on highway to Lake Superior."', '"Clermont—In honor of Robert Fulton\'s steamboat, The Clermont." "Fulton—After Robert Fulton, inventor of the steam boat."'] },
  { pg: 99, l: ['"Watson—Named after an eminent Wisconsin astronomer, discoverer of the planet Vulcan and others."', '(A note in the margin, in pencil: James Craig Watson found 22 real asteroids. Nobody ever confirmed Vulcan. It isn\'t there.)'] },
  { pg: 99, l: ['"Field—Named after C. H. Field to whose perseverance mankind owes the laying of the Atlantic cable."', '(Pencil in the margin: it was Cyrus W. Field. Even a history book gets a name wrong now and then.)'] },
  { pg: 99, l: ['"F. A. Deleglise began his first survey of the intended village of Antigo at the south end of what is known today as Virginia street on October 12, 1878,"', '"with the single assistance of his daughter, Virginia, who was born after the return of F. A. Deleglise from the Civil War."'] },
  { pg: 99, l: ['"Antigo received its name from Nequi-Antigo-Seebeh, the Chippewa Indian name of Spring River, signifying balsam evergreen river from the balsam evergreen that bordered the river."'] },
  { pg: 101, l: ['"In 1878, there were just eighteen people, including laborers and transients in Antigo."', '"The village of Antigo was originally included within the Town of Langlade, Oconto County. The nearest town officers were twenty-one miles away."'] },
  { pg: 101, l: ['THE SURPRISE VOTERS. "The Antigo citizens, starting the day before election, in that fine spring of 1879, camped out during the night along the road"', '"and put in their appearance late in the afternoon of the following day and won by superior numbers."'] },
  { pg: 26, l: ['"August 15, 1881, the first train pulled into Antigo..." "Antigo was then a strong temperance village."', '"Instead a great barrel of lemonade was provided by the womenfolk and the feasting on sandwiches and the rejoicing and merriment of the pioneers centered about the large barrel."'] },
  { pg: 38, l: ['"The first Antigo school was typical of the pioneer. It had only two half windows in which to let light. The floor was made of rough odds and ends boards."', '"The seats were made of basswood trees, \'split in twain.\'" "Back rests and book shelves were absent."'] },
  { pg: 41, l: ['THE FIRST FREE LIBRARY, 1897. "The library was open two times a week, Tuesdays and Saturdays."', '"Rules were: 1.—No one allowed behind desk except librarian. 2.—No cards issued to children under 12. 3.—Unnecessary conversation prohibited."'] },
  { pg: 11, l: ['"With all its drawbacks the pioneer log cabin was a happy home."', '"It was not uncommon for the pioneer settlers to sleep out under the boughs of a forest tree during the time when a cabin was being \'rolled up.\'"'] },
  { pg: 11, l: ['"If they subscribed to a paper the editor often allowed them to pay for the subscription in some product of the homestead."', '"And it was for a long time that produce was regarded equally with money as the standard of value."'] },
  { pg: 8, l: ['"Langlade County raises about twenty-five bushels of potatoes for each inhabitant every year."', '"The principal potatoes cultivated in the county are the Rural New Yorkers, Russetts, Triumph, Irish Cobbler, Green Mountain and Early Ohio\'s and other varieties."'] },
  { pg: 149, l: ['A footnote: "In 1880 mass was celebrated in F. A. Deleglise\'s log cabin, now preserved on the library grounds. Many Antigo settlers attended mass in the old cabin."'] },
  { pg: 41, l: ['"The Langlade County Historical Society was organized at the City Hall, May 14, 1921."', '"Besides collecting historical data the society will place markers and tablets at locations of historical note in Langlade County."'] },
];
function musReadPage(last) {
  let i; do { i = Math.floor(Math.random() * MUS_PAGES.length); } while (MUS_PAGES.length > 1 && i === last);
  const P = MUS_PAGES[i];
  say(P.l.map((s, k) => ['', (k ? '' : 'Page ' + P.pg + '. ') + s]), () => ask('Read another page?', [{ t: 'Another page', f: () => musReadPage(i) }, { t: 'Close the book' }]));
}
function musHistoryBook() {
  ask('An old copy of Robert M. Dessureau\'s History of Langlade County, printed in Antigo in 1922. It is in the public domain now.', [
    { t: 'Read a page', f: () => musReadPage(-1) }, { t: 'Leave it' }]);
}

// ---------- the exhibits: what each case, picture and sign says ----------
const MUS_EX = {
  // main floor: the welcome center and the vestibule
  fireplace: { l: ['The welcome center\'s fireplace. It was bricked up for decades before somebody opened it again. It doesn\'t work anymore.'] },
  countymap: { l: ['A big map of Langlade County, its lakes, trails and towns marked for visitors.'] },
  bird1886: { ph: 'bird1886', l: ['A framed print: "A bird\'s eye view of Antigo, showing industrial, commercial and residential sections as they were in 1886, one year after incorporation as a city."',
    'Its key lists Weed\'s saw and planing mill, a broom handle factory, a hub and spoke factory, the Pioneer Iron Works, and the railroad\'s roundhouse.'] },
  baubles: { l: ['A small case of odds and ends from around the county: buttons, a pocket watch, old tokens and pins.'] },
  brochures: { l: ['Racks of brochures: trails, lakes, festivals, places to eat and stay. Take what you like.'] },
  vposters: { l: ['Posters for local businesses and events, and maps. This little entry was added in 2021, and it stays open around the clock.'] },
  sdoor: { l: ['The south door. The vestibule stays open day and night. The museum keeps hours:'].concat(MUS_HOURS) },
  // the foyer
  hairwreath: { l: ['A Victorian wreath of flowers. Every petal is made of braided human hair, a custom that started in England.'] },
  register: { l: ['A framed card: ANTIGO PUBLIC LIBRARY AND DELEGLISE CABIN. On the National Register of Historic Places since December 18, 1978.',
    'Allan D. Conover designed the library; Dallman and Peterson built it. Andrew Carnegie\'s gift paid for it, and it opened on November 7, 1905.'] },
  fifth1922: { ph: 'fifth1922', l: ['A framed photograph: LOOKING EAST ON FIFTH AVENUE FROM EDISON STREET, ANTIGO, WIS., IN 1922.',
    '"Where the oxen slowly trudged in 1879, the modern automobile spins in 1922."'] },
  upstairs: { l: ['The central stair, in the building\'s first woodwork. Framed photographs, portraits and maps climb the walls beside it.'] },
  downstairs: { l: ['Stairs down to the lower level. The library built its children\'s room down there in the 1960s.'] },
  elevator: { l: ['An elevator. It serves all three floors.'] },
  // the main room: the library's old reading room
  lib1922: { ph: 'lib1922', l: ['A framed page: THE ANTIGO PUBLIC LIBRARY ERECTED IN 1904. "Equipped then with but 1529 volumes, it now has 11,525 volumes at the command of the Langlade County reading public."',
    'That was 1922. This room was the library\'s reading room until the library moved out, in 1997.'] },
  rules1897: { l: ['A framed card: THE FIRST FREE LIBRARY, 1897. It opened on April 17 in the F. A. Millard building, with 172 volumes.',
    '"Rules were: 1.—No one allowed behind desk except librarian. 2.—No cards issued to children under 12. 3.—Unnecessary conversation prohibited."'] },
  logging: { l: ['Logging tools under glass: a bucksaw, an axe, and a marking hammer for stamping a company\'s brand into the ends of its logs.',
    'From the 1922 History: "Only pine was cut." The logs went down the Wolf River to Shawano and Oshkosh, and down the Eau Claire to Wausau.'] },
  saw: { l: ['A crosscut saw taller than a person, on a stand. Two sawyers pulled it, one on each end.',
    'Railroads let the lumber companies reach hardwoods like maple, which couldn\'t be floated down rivers the way pine was.'] },
  logphoto: { l: ['A photograph of a logging crew on a sled behind a horse team. The numbers on the log ends are the board feet in each log.',
    'The society keeps hundreds of logging and railroad photographs, from the 1800s to the 1990s.'] },
  beadwork: { l: ['Native American beadwork: flowers and vines in tiny glass beads.',
    'The Menominee and the Ojibwe lived on this land long before the logging camps. The Menominee Nation\'s reservation lies just over the county line, to the southeast.'] },
  thename: { l: ['A framed card about the town\'s name. The 1922 History says "Antigo received its name from Nequi-Antigo-Seebeh, the Chippewa Indian name of Spring River,"',
    '"signifying balsam evergreen river from the balsam evergreen that bordered the river."'] },
  kingsbury: { l: ['A postcard by A. J. Kingsbury, an Antigo photographer. In the early 1900s he photographed Ojibwe and Menominee people across northeast Wisconsin and the Upper Peninsula.',
    'The society keeps his picture postcards. He worked on glass plates.'] },
  medical: { l: ['Twentieth-century medical equipment: a doctor\'s black bag, steel instruments in a tray, and brown glass bottles.'] },
  exam: { l: ['An old examination chair, all leather and chrome cranks.'] },
  // the research room
  archive: { l: ['Archive boxes and binders: photographs, letters, maps and family files. Volunteers help researchers when they can.'] },
  files: { l: ['Filing cabinets of clippings and photographs.'] },
  pc: { l: ['A computer for searching the society\'s photographs. Hundreds of them are online through Recollection Wisconsin.'] },
  rtable: { l: ['A research table. Somebody left a magnifying glass on a stack of old plat maps.'] },
  // the lower level
  low: { l: ['This was the library\'s children\'s room, built down here in the 1960s. Now it holds the county\'s farms, woods and workshops.'] },
  plow: { l: ['A walking plow. The farmer walked behind it, steering by the handles, while a horse pulled.', 'From the 1922 History: "42 tractors were in use in the county in May, 1920."'] },
  potato: { l: ['A case about potatoes, and the dirt they grow in. Antigo silt loam, named for this city, became Wisconsin\'s state soil in 1983.',
    'Langlade County grows more seed potatoes than any other county in the state. In 1922 it raised "about twenty-five bushels of potatoes for each inhabitant every year."'] },
  separator: { l: ['A cream separator. Turn the crank and it spins the cream out of whole milk.', 'From the 1922 History: "Recent statistics produce the fact that 446 silos are being used in Langlade County."'] },
  milkcans: { l: ['Steel milk cans, the kind farmers set out by the road for the dairy truck.'] },
  workbench: { l: ['A woodworker\'s bench: hand planes, chisels, and a brace and bit.'] },
  peavey: { l: ['A peavey: a stout pole with a spike on the end and a hinged hook, for rolling logs.'] },
  canoe: { l: ['A wooden canoe, and a case of old lures and reels.',
    'In 1891 the Antigo Pioneer Club formed, as the 1922 History puts it, to "maintain and manage fishing and sporting facilities at Moose Lake, Norwood township."'] },
  making: { l: ['Things made in Antigo. The 1886 bird\'s-eye view lists a broom handle factory, a hub and spoke factory and the Pioneer Iron Works.',
    'The Crocker Chair Company built its own rail line to bring timber from the Crocker Hills, about 15 miles away.'] },
  camera: { l: ['An antique camera on a wooden tripod, with a black cloth to duck under.', 'A. J. Kingsbury of Antigo made pictures like these on glass plates, between about 1900 and 1920.'] },
  curios: { l: ['Curios: a stereoscope and its picture cards, a churn dasher, and a child\'s tin toys.'] },
  // the upper floor
  attic: { l: ['A framed note: the society\'s first museum was a room up here, finished in 1940 and 1941. In 1997 the society got the whole building.'] },
  ava: { l: ['ANTIGO VISUAL ARTS. The local art group has shown here with the historical society for years. The art changes with its shows and sales.'] },
  painting: { f: (x, y) => { const s = ['a snowy pine woods at dusk', 'a lake at sunrise, mist on the water', 'a red barn beside a potato field', 'a heron standing in the shallows', 'Fifth Avenue at night, the windows lit', 'birches in October'][(x * 7 + y * 3) % 6];
    say([['', 'A painting by a local artist: ' + s + '.'], ['', 'A small tag gives the price. Art up here is paid for at the front desk downstairs.']]); } },
  dress: { l: ['A dress on a dress form, high-collared, with a long skirt.'] },
  domestic: { l: ['Things from home: a flatiron that was heated on the stove, a washboard, and a coffee grinder.'] },
  school: { l: ['This room is set up like a one-room school of the mid-1900s. Schools like it were common around here until the 1960s. It isn\'t any one school.'] },
  chalk: { f: () => ask('The chalkboard says: TODAY\'S LESSON, LANGLADE COUNTY. Take the lesson?', [{ t: 'Take the lesson', f: () => runQuiz(MUS_QUIZ, 'Lesson', 'museum') }, { t: 'Not today' }]) },
  desk: { l: ['A student desk with an inkwell and a fold-down seat.'] },
  tdesk: { l: ['The teacher\'s desk: a hand bell, a grade book and a jar of pencils.'] },
  stove: { l: ['A box stove. The 1922 History says the first Antigo school, in 1879, "was warmed by a box stove that drove out the frost in the long dreary winters"',
    '"and smudged out the mosquito and fly in the spring and summer."'] },
  normal: { l: ['A framed card: "The County Normal is located in the library building, second floor." (1922)', 'The county normal school trained teachers. In the 1920s its classrooms were up here, on this floor.'] },
  school1879: { ph: 'school1879', l: ['A framed photograph: THE FIRST SCHOOL HOUSE IN ANTIGO, opened in 1879, with an ox team in front.',
    '"The seats were made of basswood trees, \'split in twain.\'" "Back rests and book shelves were absent."'] },
  clock: { l: ['A schoolroom clock. It still ticks.'] },
  flag: { l: ['A flag on the wall, beside the chalkboard.'] },
  milsign: { l: ['This was the library\'s auditorium. Now it holds uniforms, weapons, posters and portraits from the Civil War through Desert Storm.'] },
  civilwar: { l: ['Letters and a diary from the Civil War. Francis Deleglise, who founded Antigo, served in the Iron Brigade.',
    'The society keeps his letters home: training at Camp Randall, and getting well after Gettysburg. It also keeps the 1863-65 diary of Ruben Sweet, a Manitowoc soldier.'] },
  wwi: { l: ['World War I. Antigo\'s 107th Trench Mortar Battery went to France.',
    'William Wessa photographed the unit drilling in Antigo, training in Wisconsin and Texas, fighting in France, and coming home in 1919.'] },
  weapons: { l: ['Rifles in a locked case, from the Civil War on.'] },
  poster: { l: ['A poster from wartime: BUY WAR BONDS.'] },
  portraits: { l: ['Portraits of men and women from the county who served.'] },
  bradley: { l: ['The stage tells of World War II, and of John Bradley of Antigo, a Navy corpsman with the Marines on Iwo Jima in 1945.',
    'He earned the Navy Cross there for treating wounded men under fire.',
    'For decades he was named as one of the six men in Joe Rosenthal\'s famous photograph of the flag raising on Mount Suribachi.',
    'In 2016 the Marine Corps found he wasn\'t in that photograph. He had helped raise the first, smaller flag on the mountain, hours before.',
    'He came home to Antigo and ran a funeral home here. He died in 1994. His son James wrote the book Flags of Our Fathers about the flag raisers.'] },
  stageflag: { l: ['A flag hangs across the back of the stage.'] },
  uniform: { f: (x, y) => say([['', ['A Union soldier\'s uniform: a dark blue wool coat and sky blue trousers.', 'A World War I uniform, olive drab, with wrapped leggings.',
    'A World War II Navy uniform, dress blues.', 'Desert camouflage from the Gulf War, 1991.'][(x > 15 ? 2 : 0) + (y > 4 ? 1 : 0)]]]) },
  rrsign: { l: ['THE RAILROAD ROOM. Antigo grew up as a railroad town on the Chicago & North Western: uniforms, dioramas, maps and photographs.'] },
  railmap: { l: ['A railroad map of northern Wisconsin, with Antigo circled in red.'] },
  depot: { l: ['A photograph of the Antigo depot, built in 1907 for the Chicago & North Western, of brick made nearby. It was a division headquarters too.'] },
  lemonade: { l: ['A framed page from the 1922 History, about the first train, on August 15, 1881. "Antigo was then a strong temperance village."',
    '"Instead a great barrel of lemonade was provided by the womenfolk and the feasting on sandwiches and the rejoicing and merriment of the pioneers centered about the large barrel."'] },
  survey: { l: ['A framed card: Deleglise talked the Milwaukee, Lake Shore & Western into moving its survey, which first ran two miles west of town, and gave the railroad eight blocks of his plat.',
    'The line was sold to the Chicago & North Western on August 19, 1893.'] },
  diorama: { l: ['A diorama of the Antigo rail yards in their busy years: the depot, the roundhouse, and trains of logs and potatoes.', 'In their day the yards reached from Tenth Avenue to north of the courthouse.'] },
  conductor: { l: ['A conductor\'s uniform: a dark blue suit, a vest with a watch chain, and a cap with a badge.'] },
  rrcase: { l: ['A brakeman\'s lantern, a conductor\'s ticket punch, and a telegraph key.'] },
  // the cabin
  loft: { l: ['A steep stair to the loft. It was added in 1879, the year the cabin got its peaked roof of cedar shingles.'] },
  altar: { l: ['A chest of drawers with a crucifix on it, a family heirloom.', 'It served as the altar on May 2, 1880, when Father Philip St. Louis offered the first Mass in Antigo, here in the cabin.'] },
  ctable: { l: ['Furniture of the period: a table, chairs, and picture frames on the log walls.'] },
  office: { l: ['Deleglise\'s office, with its own door to the street. "Mr. Deleglise was an able civil engineer," says the 1922 History.',
    'The county\'s first newspaper, the New County Republican, began here, in the cabin, in 1880.'] },
  odoor: { l: ['The office\'s own door, facing the street.'] },
  cabinquote: { l: ['A framed line from the 1922 History: "With all its drawbacks the pioneer log cabin was a happy home."'] },
  cabinhist: { l: ['Deleglise built the cabin in 1878 with help from Charles Gowan, John Doersch, George Eckhart and Lawrence Weix, as his daughter Sophie remembered it.',
    'It stood two blocks north. In 1913 the Antigo Daily Journal campaigned to save it, and in 1914 it was moved here to the library grounds.'] },
  logs: { l: ['Walls of elm logs, chinked with lime and cement. In 1930 the cabin was raised onto a concrete foundation.'] },
};
function musShow(key, x, y) {
  const e = MUS_EX[key]; if (!e) return false;
  if (e.f) { e.f(x, y); return true; }
  say(e.l.map(s => ['', s])); if (e.ph && DLG) { DLG.photos = [e.ph]; DLG.credit = MUS_CR; }
  return true;
}
const MUS_QUIZ = [
  ['In 1879, what were the seats in Antigo\'s first school made of?', 'Basswood logs split in half', ['Pine benches with backs', 'Iron school chairs', 'Bales of hay'], 'The 1922 History says basswood trees "split in twain," with no backs.'],
  ['What did the village serve when the first train pulled into Antigo in 1881?', 'A great barrel of lemonade', ['A keg of beer', 'Hot cider', 'Nothing at all'], 'Antigo was a temperance village then. The lemonade was the party.'],
  ['Watson Street is named for an astronomer. What did he claim to find?', 'A planet called Vulcan', ['Halley\'s Comet', 'The rings of Saturn', 'A new moon of Mars'], 'James Craig Watson found 22 real asteroids, but Vulcan was never confirmed. It isn\'t there.'],
  ['When did this building open as Antigo\'s library?', '1905', ['1881', '1922', '1957'], 'It opened on November 7, 1905, and was the library until 1997.'],
  ['Where does the name Antigo come from, by the 1922 History?', 'An Ojibwe name for the Spring River', ['A French fur trader', 'A railroad president', 'The Portuguese word for old'], 'Nequi-Antigo-Seebeh: balsam evergreen river.'],
  ['Which railroad bought the line through Antigo in 1893?', 'The Chicago & North Western', ['The Union Pacific', 'The Soo Line', 'The Milwaukee Road'], 'The Milwaukee, Lake Shore & Western was sold to the North Western on August 19, 1893.'],
  ['The 440 was built as a compound. What did that mean?', 'It used its steam twice', ['It burned wood and coal', 'It had two boilers', 'It ran on two kinds of track'], 'First in small high-pressure cylinders, then in big low-pressure ones.'],
  ['What is Wisconsin\'s state soil?', 'Antigo silt loam', ['Northwoods sand', 'Prairie clay', 'Lake muck'], 'It became the state soil in 1983, and it carries this city\'s name.'],
  ['By the 1922 History, how many people lived in Antigo in 1878?', 'Eighteen', ['About two hundred', 'About two thousand', 'Nobody yet'], 'Eighteen, counting laborers and people passing through.'],
  ['What did the library\'s rules forbid in 1897?', 'Unnecessary conversation', ['Newspapers', 'Lamps', 'Coats'], 'They also kept everyone but the librarian from behind the desk, and gave no cards to children under 12.'],
  ['Who began surveying the village of Antigo in 1878, with his daughter\'s help?', 'Francis Deleglise', ['Charles de Langlade', 'Andrew Carnegie', 'Henry Hudson'], 'He started at the south end of Virginia Street on October 12, 1878, with his daughter Virginia.'],
  ['Where was the first Mass in Antigo offered, in 1880?', 'In the Deleglise cabin', ['In the courthouse', 'At the depot', 'In this library'], 'A chest of drawers in the cabin was the altar. The cabin stands outside, on the museum grounds.'],
];

// ---------- the people (generic stand-ins; Christian writes who they are) ----------
Object.assign(FOLKS, {
  curator: { skin: '#ecc19c', hair: '#a8a49c', shirt: '#4a6a5a', shirt2: '#3a5a4a', pants: '#3a3a44', shoes: '#2a2224', glasses: 1 },
  docent: { skin: '#d9a77c', hair: '#5a3a24', shirt: '#c8a060', shirt2: '#b08a4a', pants: '#3a4a6a', shoes: '#2a2224' },
  edc: { skin: '#e2b48e', hair: '#2a1e18', shirt: '#2a4a7a', shirt2: '#1e3a64', pants: '#3a3a44', shoes: '#141416' },
  visitor: { skin: '#f0c8a0', hair: '#c87a3a', shirt: '#8a3a4a', shirt2: '#7a2a3a', pants: '#3a4a6a', shoes: '#e8e8ea' },
});
function musStandIn(lines) { if (G.musMet) return lines; G.musMet = 1; return lines.concat([['', '(Stand-in staff. Christian will write who they are.)']]); }
function musCurator() {
  ask('Curator: Welcome to the historical society\'s museum! Admission is free. What can I tell you?', [
    { t: 'About the museum', f: () => say(musStandIn([['Curator', 'This was the Antigo Public Library. Andrew Carnegie\'s gift built it, it opened in 1905, and the library stayed until 1997.'],
      ['Curator', 'Then the historical society took the whole building. Downstairs: farms, logging, fishing and old cameras.'],
      ['Curator', 'Upstairs: the art gallery, the military room, the railroad room and a one-room school. Out back: the Deleglise cabin and the 440.']])) },
    { t: 'Hours', f: () => say([['Curator', MUS_HOURS[0]], ['Curator', MUS_HOURS[1]], ['Curator', 'Admission is free. Donations keep the lights on.']]) },
    { t: 'The cabin and the train', f: musCabinAsk },
    { t: 'Can I take pictures?', f: () => say([['Curator', 'Go right ahead. Photography is allowed.']]) },
    { t: 'Reading more', f: () => say([['Curator', 'The society writes history articles for the Antigo Daily Journal. Some of them are on the county\'s website, langladecounty.org.'], ['Curator', 'The society\'s own site is langladehistory.org.']]) },
    { t: 'Bye' }]);
}
function musCabinAsk() {
  if (!musSummer()) return say([['Curator', 'The cabin and the train close for the winter. They open on request from May through September.'],
    ['Curator', 'You can still see the 440 and the caboose under their roof, and look in the cabin\'s window.']]);
  if (G.musCabin === musToday()) return say([['Curator', 'The cabin\'s open for you today. It\'s out back, northwest of the building. The door is on the south side.']]);
  ask('Curator: In summer the cabin and the train open on request. Want me to open the cabin for you?', [
    { t: 'Yes, please', f: () => { G.musCabin = musToday(); saveGame(); say([['Curator', 'All set. It\'s out back, northwest of the building. The door is on the south side.']]); } },
    { t: 'Not now' }]);
}
function musVolunteer() {
  ask('Volunteer: Doing some research? Volunteers help in here when we can. What do you need?', [
    { t: 'Look something up', f: musLookUp },
    { t: 'What\'s in the archive?', f: () => say([['Volunteer', 'Photographs, mostly, and letters and diaries. Hundreds of the photos are online through Recollection Wisconsin.'],
      ['Volunteer', 'A. J. Kingsbury\'s postcards. The 107th Trench Mortar Battery in World War I. Logging camps, rail yards and train wrecks. The Elcho CCC camp.'],
      ['Volunteer', 'Francis Deleglise\'s letters from the Civil War, the diary of Ruben Sweet, a Manitowoc soldier, and views of Antigo street by street.']]) },
    { t: 'Bye' }]);
}
const MUS_STREETS = [
  ['Superior', ['"Superior—Leading thoroughfare, north and south—on highway to Lake Superior."']],
  ['Clermont and Fulton', ['"Clermont—In honor of Robert Fulton\'s steamboat, The Clermont."', '"Fulton—After Robert Fulton, inventor of the steam boat."']],
  ['Edison and Morse', ['"Edison—After the great inventor, Thomas A. Edison."', '"Morse—After Samuel F. B. Morse, inventor of the telegraph system."']],
  ['Watson', ['"Watson—Named after an eminent Wisconsin astronomer, discoverer of the planet Vulcan and others."', 'That\'s James Craig Watson. His 22 asteroids were real, but the planet Vulcan he thought he saw in 1878 was never confirmed. It isn\'t there.']],
  ['Field and Milton', ['"Field—Named after C. H. Field to whose perseverance mankind owes the laying of the Atlantic cable." (It was Cyrus W. Field. The book has his initials wrong.)', '"Milton—After the famous English poet, author of Paradise Lost and Paradise Regained."']],
  ['Virginia', ['"Virginia—Named after Virginia Deleglise, daughter born to F. A. and Mary Deleglise after the return of the former from Virginia, where he had served under General Bragg in the Civil War."',
    'General Edward S. Bragg led Wisconsin\'s Iron Brigade. Virginia later helped her father survey the village, in 1878.']],
  ['Atlantic and Pacific', ['"The Atlantic was the block between Fifth and Sixth Avenues east of the Milwaukee, Lake Shore & Western railroad depot."', '"The Pacific was the street between the same avenues on the west side of the depot. Both streets... and the territory between... were called America."']],
  ['Aurora and Arctic', ['"Aurora—East boundary of original plat—meaning dawn of day."', '"Arctic—Most northern street in the Village of Antigo."']],
];
function musLookUp() {
  const page = (pg, lines) => () => say([['Volunteer', 'Here it is, in the 1922 History, page ' + pg + '.']].concat(lines.map(s => ['', s])), musLookUp);
  ask('Volunteer: What would you like to look up?', [
    { t: 'Where a street got its name', f: musStreets },
    { t: 'The first school', f: page(38, ['"The first school in Antigo was constructed of logs by a young man named Joseph Krause." It opened in 1879, at Third Avenue and Superior Street.', MUS_PAGES[8].l[1]]) },
    { t: 'The first train', f: page(26, MUS_PAGES[7].l) },
    { t: 'The town\'s name', f: page(99, MUS_PAGES[4].l) },
    { t: 'The historical society', f: page(41, MUS_PAGES[14].l) },
    { t: 'Potatoes', f: page(8, MUS_PAGES[12].l) },
    { t: 'That\'s all' }]);
}
function musStreets() {
  ask('Volunteer: The 1922 History lists how the old village\'s streets got their names. Which one?', MUS_STREETS.map(([n, L]) => ({ t: n, f: () => say([['Volunteer', 'Page 99:']].concat(L.map(s => ['', s])), musStreets) })).concat([{ t: 'Back', f: musLookUp }]));
}
function musWelcome() {
  ask('Welcome Center: Hi there! Visiting Langlade County? I can point you around.', [
    { t: 'What happens here this year?', f: () => { if (typeof ALM_RETURN !== 'undefined') ALM_RETURN = 'inside'; setMode('almanac'); } },
    { t: 'Where are the cabin and the train?', f: () => say([['Welcome Center', 'The cabin is out back, northwest of the building. The 440 and the caboose sit under the long roof just north of it.']]) },
    { t: 'About this room', f: () => say([['Welcome Center', 'The county\'s Economic Development Commission runs the welcome center. We hold meetings and events in here too.']]) },
    { t: 'Bye' }]);
}
function musVisitor() { say([['Visitor', 'My great-grandpa served in France in the first war. I keep looking for him in that case.'], ['', '(A stand-in visitor.)']]); }
function musDonate() {
  ask('A donation box. Admission is free; gifts keep the museum going.', [1, 5, 20].map(d => ({ t: 'Give $' + d, f: () => {
    if (!pay(d * 100)) return say([['', 'You check your pockets. Not today.']]);
    G.musGave = (G.musGave || 0) + d * 100; saveGame(); say([['', 'You slip $' + d + ' into the box. Thank you!']]); } })).concat([{ t: 'Not now' }]));
}
MUS_EX.donate = { f: () => musDonate() };
MUS_EX.downstairs2 = { l: ['The stair down to the front hall.'] };
MUS_EX.upstairs0 = { l: ['The stair up to the front hall.'] };
MUS_EX.langlade = { l: ['A framed card: the county is named for Charles de Langlade, an 18th-century fur trader and soldier often called the father of Wisconsin.',
  'It was created in 1879 as New County, and renamed Langlade County in 1880.'] };

// ---------- the floors: 1 m tiles, the front door at the bottom. The building faces east onto Superior Street, so north is
// on the right and the south door (the 2021 vestibule) is on the left wall. The main floor follows the real outline: the main
// block, 24 m by 16 m, and the wing behind it (the research room). The other floors are the main block. ----------
function musGrid(W, H) { const R = []; for (let y = 0; y < H; y++) R.push(new Array(W).fill(' ')); return R; }
function musBox(R, x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) R[y][x] = x === x0 || x === x1 || y === y0 || y === y1 ? 'W' : '.'; }
function musPut(R, x, y, s) { for (let i = 0; i < s.length; i++) R[y][x + i] = s[i]; }
function musCol(R, x, y0, y1, c) { for (let y = y0; y <= y1; y++) R[y][x] = c; }
function musRow(R, y, x0, x1, c) { for (let x = x0; x <= x1; x++) R[y][x] = c; }
function musFloor(id, kind, W, H, build) {
  const R = musGrid(W, H), Fm = { id, kind, mus: 1, W, H, R, seed: 404, npcs: [], ex: {}, art: {}, artA: {}, caseKind: {}, b: MUSEUM };
  const ex = (x, y, k) => { Fm.ex[x + ',' + y] = k; };
  const art = (x, y, k, look) => { Fm.art[x + ',' + y] = k; if (look !== null) ex(x, y, look || k); };
  const cs = (x, y, n, kind, look) => { for (let i = 0; i < n; i++) { R[y][x + i] = 'E'; Fm.caseKind[(x + i) + ',' + y] = kind; ex(x + i, y, look); } };
  build(R, ex, art, cs, Fm);
  Fm.rows = R.map(r => r.join(''));
  return Fm;
}
const MUS1 = musFloor('mus1', 'mus1', 24, 23, (R, ex, art, cs, Fm) => {
  musBox(R, 5, 0, 16, 6); musBox(R, 0, 6, 23, 22); musPut(R, 11, 6, '..');                  // the wing (research room) and the main block
  musCol(R, 8, 7, 21, 'W'); for (const y of [10, 11, 18, 19]) R[y][8] = '.';                 // welcome center | main room, foyer
  musRow(R, 15, 8, 15, 'W'); musCol(R, 15, 15, 21, 'W'); R[18][15] = '.'; R[19][15] = '.';   // the foyer
  musRow(R, 17, 1, 4, 'W'); musCol(R, 4, 17, 21, 'W'); R[19][4] = '.'; R[20][0] = 's';        // the vestibule and the south door
  musPut(R, 1, 22, 'OOO'); musPut(R, 5, 22, 'OOO'); musPut(R, 10, 22, 'OeeO'); musPut(R, 16, 22, 'OOO'); musPut(R, 20, 22, 'OOO');
  // the research room
  musPut(R, 6, 1, 'KKKKFFKKKK'); musPut(R, 7, 3, 'TT'); musPut(R, 13, 3, 'TT'); musPut(R, 7, 4, 'hh'); musPut(R, 13, 4, 'hh'); R[3][10] = '!'; R[5][6] = 'd'; R[5][15] = 'P';
  for (let x = 6; x <= 15; x++) ex(x, 1, R[1][x] === 'F' ? 'files' : 'archive');
  for (const [x, y] of [[7, 3], [8, 3], [13, 3], [14, 3]]) ex(x, y, 'rtable'); ex(6, 5, 'pc'); ex(10, 3, 'book');
  Fm.npcs.push({ x: 11, y: 2, folk: 'docent', talk: musVolunteer, name: 'Volunteer' });
  // the welcome center
  musPut(R, 3, 7, 'CC'); R[7][7] = 'P'; for (let y = 9; y <= 12; y++) { R[y][1] = 'b'; ex(1, y, 'brochures'); } musPut(R, 4, 14, 'cck');
  cs(6, 9, 1, 'baubles', 'baubles'); ex(3, 7, 'fireplace'); ex(4, 7, 'fireplace');
  art(1, 6, 'bird1886'); art(5, 6, 'countymap'); art(6, 6, 'countymap');
  Fm.npcs.push({ x: 5, y: 13, folk: 'edc', talk: musWelcome, name: 'Welcome Center' });
  // the vestibule (2021): brochures, posters, the south door
  R[18][1] = 'b'; R[18][2] = 'b'; ex(1, 18, 'brochures'); ex(2, 18, 'brochures'); art(3, 17, 'vposters'); ex(0, 20, 'sdoor');
  // the foyer: the elevator, the stair up, the stair down
  R[16][9] = 'L'; musPut(R, 11, 16, '^^'); musPut(R, 13, 16, 'vv'); cs(9, 21, 1, 'hair', 'hairwreath'); R[21][14] = '&';
  ex(9, 16, 'elevator'); ex(11, 16, 'upstairs'); ex(12, 16, 'upstairs'); ex(13, 16, 'downstairs'); ex(14, 16, 'downstairs'); ex(14, 21, 'register');
  art(10, 15, 'fifth1922'); for (const x of [11, 12, 13, 14]) art(x, 15, 'portraits', null);
  // the main room, the library's old reading room
  cs(9, 8, 2, 'logging', 'logging'); R[8][14] = '9'; ex(14, 8, 'saw'); cs(17, 8, 2, 'beads', 'beadwork'); cs(17, 11, 2, 'medical', 'medical'); R[11][21] = '%'; ex(21, 11, 'exam');
  musPut(R, 12, 11, 'HH'); R[9][22] = 'A'; R[13][22] = 'A'; Fm.artA['22,9'] = 'card'; Fm.artA['22,13'] = 'card'; ex(22, 9, 'thename'); ex(22, 13, 'langlade');
  R[7][22] = 'P'; R[21][22] = 'P'; musPut(R, 17, 17, 'cck'); R[20][17] = '$'; ex(17, 20, 'donate');
  art(14, 6, 'rules1897'); art(16, 6, 'lib1922'); art(19, 6, 'logphoto'); art(21, 6, 'kingsbury');
  Fm.npcs.push({ x: 18, y: 16, folk: 'curator', talk: musCurator, name: 'Curator' });
});
MUS_EX.book = { f: () => musHistoryBook() };
const MUS2 = musFloor('mus2', 'mus2', 24, 17, (R, ex, art, cs, Fm) => {
  musBox(R, 0, 0, 23, 16);
  musRow(R, 9, 1, 22, 'W'); for (const x of [3, 4, 13, 14]) R[9][x] = '.';                   // back rooms | front rooms
  musCol(R, 8, 1, 8, 'W'); musCol(R, 8, 10, 15, 'W'); R[12][8] = '.'; R[13][8] = '.'; musCol(R, 15, 10, 15, 'W'); R[12][15] = '.'; R[13][15] = '.';
  musPut(R, 1, 16, 'OOOOOOO'); musPut(R, 10, 16, 'OOOO'); musPut(R, 16, 16, 'OOOOOOO');
  // the upper hall
  R[10][9] = 'L'; musPut(R, 10, 10, 'vv'); ex(9, 10, 'elevator'); ex(10, 10, 'downstairs2'); ex(11, 10, 'downstairs2'); art(12, 9, 'attic');
  // the school room
  art(1, 0, 'clock'); art(2, 0, 'chalk'); art(3, 0, 'chalk'); art(4, 0, 'chalk'); art(6, 0, 'flag');
  R[1][4] = 'h'; R[2][4] = '2'; ex(4, 1, 'tdesk'); ex(4, 2, 'tdesk'); R[3][7] = '3'; ex(7, 3, 'stove');
  for (const [x, y] of [[2, 4], [4, 4], [6, 4], [2, 6], [4, 6], [6, 6]]) { R[y][x] = '1'; ex(x, y, 'desk'); }
  R[5][1] = 'A'; Fm.artA['1,5'] = 'card'; ex(1, 5, 'normal'); R[8][1] = 'A'; Fm.artA['1,8'] = 'school1879'; ex(1, 8, 'school1879'); R[8][7] = 'K'; ex(7, 8, 'school');
  // the military room, in the old auditorium; its stage at the back
  musPut(R, 12, 1, 'JJJJJJJJ'); musPut(R, 12, 2, 'JJJJJJJJ'); cs(15, 1, 2, 'bradley', 'bradley');
  art(9, 0, 'milsign'); art(10, 0, 'milsign'); art(11, 0, 'milsign'); art(13, 0, 'portrait', 'portraits'); art(15, 0, 'stageflag'); art(16, 0, 'stageflag'); art(18, 0, 'portrait', 'portraits'); art(20, 0, 'poster'); art(22, 0, 'poster');
  for (const [x, y] of [[10, 3], [10, 6], [21, 3], [21, 6]]) { R[y][x] = '5'; ex(x, y, 'uniform'); }
  cs(13, 5, 2, 'civil', 'civilwar'); cs(17, 5, 2, 'wwi', 'wwi'); cs(17, 7, 2, 'rifles', 'weapons');
  Fm.npcs.push({ x: 19, y: 6, folk: 'visitor', talk: musVisitor, name: 'Visitor' });
  // the art gallery (Antigo Visual Arts) and the clothes and things from home
  art(1, 9, 'paint', 'painting'); art(2, 9, 'paint', 'painting'); art(5, 9, 'avasign', 'ava'); art(6, 9, 'avasign', 'ava'); art(7, 9, 'paint', 'painting');
  R[11][1] = '4'; R[11][6] = '4'; ex(1, 11, 'painting'); ex(6, 11, 'painting'); R[13][1] = 'A'; Fm.artA['1,13'] = 'paint'; ex(1, 13, 'painting');
  R[14][3] = '7'; R[14][5] = '7'; ex(3, 14, 'dress'); ex(5, 14, 'dress'); cs(1, 15, 2, 'domestic', 'domestic');
  // the railroad room
  for (const x of [16, 17, 18]) art(x, 9, 'rrsign'); art(20, 9, 'railmap'); art(21, 9, 'depot'); art(22, 9, 'lemonade');
  musPut(R, 18, 12, '66'); musPut(R, 18, 13, '66'); for (const [x, y] of [[18, 12], [19, 12], [18, 13], [19, 13]]) ex(x, y, 'diorama');
  R[11][22] = '5'; ex(22, 11, 'conductor'); R[11][16] = 'A'; Fm.artA['16,11'] = 'card'; ex(16, 11, 'survey'); cs(21, 14, 2, 'rr', 'rrcase');
});
const MUS0 = musFloor('mus0', 'mus0', 24, 17, (R, ex, art, cs, Fm) => {
  musBox(R, 0, 0, 23, 16);
  musPut(R, 2, 16, 'OO'); musPut(R, 7, 16, 'OO'); musPut(R, 15, 16, 'OO'); musPut(R, 20, 16, 'OO');   // high basement windows
  R[1][9] = 'L'; musPut(R, 11, 1, '^^'); ex(9, 1, 'elevator'); ex(11, 1, 'upstairs0'); ex(12, 1, 'upstairs0'); for (const x of [4, 5, 6]) art(x, 0, 'lowsign', 'low');
  art(15, 0, 'snowshoes'); art(20, 0, 'fish');
  // farm and dairy
  R[1][1] = '8'; ex(1, 1, 'plow'); cs(3, 1, 2, 'potato', 'potato'); R[1][6] = 'z'; ex(6, 1, 'separator'); R[1][7] = 'u'; ex(7, 1, 'milkcans');
  musPut(R, 1, 6, '++'); ex(1, 6, 'workbench'); ex(2, 6, 'workbench'); R[4][5] = 'j'; ex(5, 4, 'churn'); musPut(R, 2, 10, '=='); ex(2, 10, 'digger'); ex(3, 10, 'digger'); R[14][1] = 'P';
  // woods and water
  R[1][14] = '9'; ex(14, 1, 'peavey'); musPut(R, 16, 1, '~~~'); for (const x of [16, 17, 18]) ex(x, 1, 'canoe'); cs(20, 1, 2, 'lures', 'canoe');
  cs(20, 7, 2, 'making', 'making'); R[7][22] = 'P'; musPut(R, 17, 4, '@@'); ex(17, 4, 'sled'); ex(18, 4, 'sled'); R[14][22] = 'P';
  // cameras and curios, in the middle
  R[6][10] = '0'; R[6][13] = '0'; ex(10, 6, 'camera'); ex(13, 6, 'camera'); cs(9, 9, 2, 'curio', 'curios'); cs(13, 9, 2, 'curio', 'curios');
  musPut(R, 11, 13, 'HH');
});
const MUSC = musFloor('cabin', 'cabin', 9, 7, (R, ex, art, cs, Fm) => {
  musBox(R, 0, 0, 8, 6); musCol(R, 5, 1, 5, 'W'); R[3][5] = '.'; R[6][3] = 'e'; R[3][8] = 'D'; R[6][1] = 'O'; R[6][6] = 'O';
  R[1][1] = '/'; ex(1, 1, 'loft'); R[1][3] = '#'; ex(3, 1, 'altar'); musPut(R, 2, 3, 'TT'); ex(2, 3, 'ctable'); ex(3, 3, 'ctable'); R[4][2] = 'h'; R[4][3] = 'h';
  R[1][7] = '2'; ex(7, 1, 'office'); R[2][7] = 'h'; ex(8, 3, 'odoor');
  art(2, 0, 'cquote', 'cabinquote'); art(4, 0, 'cframe', 'cabinhist'); art(6, 0, 'cframe', 'office');
});
const MUS_FLOORS = { mus1: MUS1, mus2: MUS2, mus0: MUS0, cabin: MUSC };
const MUS_WALK = new Set(['.', 'e', 's', '^', 'v', 'L', 'J']);
function musFree(Fm, x, y) { return MUS_WALK.has(roomT(Fm, x, y)) && !roomNpcAt(Fm, x, y); }
function musZone(Fm, x, y) {
  if (Fm.id === 'mus1') { if (y <= 5) return 'RESEARCH ROOM'; if (x <= 7) return x <= 3 && y >= 18 ? 'VESTIBULE' : 'WELCOME CENTER'; if (x >= 9 && x <= 14 && y >= 16) return 'FOYER'; return 'MAIN ROOM'; }
  if (Fm.id === 'mus2') { if (y <= 8) return x <= 7 ? 'SCHOOL ROOM' : 'MILITARY ROOM'; if (x <= 7) return 'ART GALLERY'; if (x >= 16) return 'RAILROAD ROOM'; return 'UPPER HALL'; }
  if (Fm.id === 'mus0') return 'LOWER LEVEL';
  return x >= 6 ? 'OFFICE' : 'CABIN';
}
function musLook(Fm, x, y, t) {
  const n = roomNpcAt(Fm, x, y); if (n) return n.talk ? n.talk(Fm, n) : say([[n.name || '', 'Hello there.']]);
  if (t === 'c' || t === 'k') { const s = Fm.npcs.find(q => Math.abs(q.x - x) <= 2 && Math.abs(q.y - y) <= 1); if (s && s.talk) return s.talk(Fm, s); }
  const k = Fm.ex[x + ',' + y]; if (k && musShow(k, x, y)) return;
  if (Fm.kind === 'cabin' && t === 'W') return musShow('logs');
  const L = { W: 'Plaster walls and dark wood trim.', O: Fm.id === 'mus1' ? 'Superior Street, through the front windows.' : Fm.id === 'mus2' ? 'Superior Street from upstairs.' : Fm.id === 'mus0' ? 'A high window, level with the lawn outside.' : 'Through the little window: the lawn, and the library\'s brick wall.',
    T: 'A table.', h: 'A chair.', H: 'A bench to sit and look.', P: 'A potted plant.', E: 'A glass case.', A: 'A framed picture.', K: 'A bookcase.', d: 'A desk with a computer.', J: 'The stage.' }[t];
  if (L) say([['', L]]);
}
function musLeave(Fm) { if (Fm.id === 'cabin') return musLeaveCabin(); roomLeave(Fm); }
function musLeaveSouth() { const d = musSouthDoor(); G.inside = null; G.x = d.x; G.y = d.y + 1; G.dir = 'down'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('walk'); }
function musLeaveCabin() { const d = musCabinDoor(); G.inside = null; G.x = d.x; G.y = d.y + 1; G.dir = 'down'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('walk'); }
function musElevator() {
  const here = G.inside.f, D = [['mus2', 'Upper floor: art, military, railroad, school', 9, 11], ['mus1', 'Main floor: front hall, welcome center', 9, 17], ['mus0', 'Lower level: farms, woods, workshops', 9, 2]];
  ask('The elevator. Which floor?', D.filter(d => d[0] !== here).map(([f, t, x, y]) => ({ t, f: () => figGo(f, x, y, 'The doors slide open on the ' + t.split(':')[0].toLowerCase() + '.') })).concat([{ t: 'Stay here' }]));
}
const MUS_PLACE = 'HISTORICAL SOCIETY MUSEUM';
FIG_FLOORS.mus1 = { links: { '^': ['mus2', 10, 11, 'Up the stairs, past the framed photographs, to the upper floor.'], v: ['mus0', 11, 2, 'Down the stairs to the lower level, the library\'s old children\'s room.'] } };
FIG_FLOORS.mus2 = { links: { v: ['mus1', 12, 17, 'Down the stairs to the front hall.'] } };
FIG_FLOORS.mus0 = { links: { '^': ['mus1', 13, 17, 'Up the stairs to the front hall.'] } };
FIG_FLOORS.cabin = {};
for (const [id, Fm] of Object.entries(MUS_FLOORS))
  Object.assign(FIG_FLOORS[id], { name: KIND_ZONE[Fm.kind] || 'INSIDE', place: id === 'cabin' ? 'DELEGLISE CABIN' : MUS_PLACE, bld: 'museum', rows: Fm.rows, room: Fm,
    paint: (ox, oy, kx, ky) => roomPaint(Fm, ox, oy, kx, ky), look: (x, y, t) => musLook(Fm, x, y, t), free: (x, y) => musFree(Fm, x, y),
    leave: () => musLeave(Fm), zone: (x, y) => musZone(Fm, x, y) });
Object.assign(ROOM_STYLE, {
  mus1: [['wood', '#8a6038', '#7a5430'], ['#ece2cc', '#5a3a22']], mus2: [['wood', '#946a42', '#845c38'], ['#efe6d2', '#6a4a2a']],
  mus0: [['tile', '#cfc8b8', '#bdb6a6'], ['#e2dccc', '#6a5a4a']], cabin: [['wood', '#a8865a', '#987650'], ['#a89e8c', '#5a4430']] });
Object.assign(KIND_ZONE, { mus1: 'MAIN FLOOR', mus2: 'UPPER FLOOR', mus0: 'LOWER LEVEL', cabin: 'CABIN' });
{ const _ar = MODES.inside.arrive; MODES.inside.arrive = function () {   // the elevator and the south door
    const f = G.inside && G.inside.f; if (MUS_FLOORS[f]) { const t = figTile(G.inside.x, G.inside.y); if (t === 'L') return musElevator(); if (t === 's') return musLeaveSouth(); }
    return _ar.call(this); }; }

// ---------- painting the floors: the museum's walls, its art, its cases and furniture ----------
{ const _wf = roomWallFace; roomWallFace = function (Fm, x, y) {
    if (!Fm.mus) return _wf(Fm, x, y);
    const st = ROOM_STYLE[Fm.kind], wall = st[1][0], trim = st[1][1], X = x * 24, Y = y * 24;
    if (Fm.kind === 'cabin') musLogs(X, Y - 9, 33);
    else { qp(wall, X, Y - 9, 24, 33); qp(shade(wall, -0.06), X, Y - 9, 24, 2); qp('#2a2224', X, Y - 9, 24, 1); qp(trim, X, Y + 18, 24, 6); qp(shade(trim, -0.3), X, Y + 23, 24, 1); }
    const a = Fm.art[x + ',' + y]; if (a) musArt(Fm, a, x, y, X, Y);
  }; }
{ const _rc = roomCap; roomCap = function (Fm, x, y) { if (!Fm.mus || Fm.kind !== 'cabin') return _rc(Fm, x, y); const X = x * 24, Y = y * 24; qp('#1c1618', X, Y, 24, 24); musLogs(X + 4, Y, 24, 16); }; }
{ const _rp = roomProp; roomProp = function (Fm, t, x, y) { if (Fm.mus && musProp(Fm, t, x, y)) return; return _rp(Fm, t, x, y); }; }
function musLogs(X, Y, H, W) {   // a wall of whitewashed logs with pale chinking
  W = W || 24; for (let yy = 0; yy < H; yy += 6) { qp('#a89e8c', X, Y + yy, W, Math.min(5, H - yy)); qp('#c4bba8', X, Y + yy, W, 1); if (yy + 5 < H) qp('#e2dac8', X, Y + yy + 5, W, 1); }
  qp('#8a806e', X, Y, 1, H);
}
function musPhoto(key, x, y, w, h) {   // a tiny copy of a real photo card in a frame
  const im = LM_IMG[key]; if (!im || !im.complete || !im.naturalWidth) { qp('#c8b898', x, y, w, h); return; }
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, QX + x, QY + y, w, h); ctx.imageSmoothingEnabled = false;
}
function musFrame(kind, x, y, w, h, seed) {   // a framed thing on a wall
  const s = seed || 0;
  if (kind === 'card') { qp('#5a3a22', x, y, w, h); qp('#f2ead6', x + 2, y + 2, w - 4, h - 4); for (let r = 0; r < 4; r++) qp('#7a6a5a', x + 4, y + 4 + r * 3, w - 8 - (r === 3 ? 4 : 0), 1); return; }
  if (kind === 'paint') { const P = [['#6a8ab8', '#e8d8a8', '#3a6a3a'], ['#f0b070', '#5a7ab0', '#2a3a5a'], ['#9ac8e8', '#a83a2a', '#c8a050'], ['#3a5a7a', '#e8e4dc', '#5a8a5a'], ['#2a2440', '#f0d070', '#8a5a3a'], ['#e8c050', '#c86a2a', '#f4f0e4']][s % 6];
    qp(s % 2 ? '#c8a050' : '#3a2a1e', x - 1, y - 1, w + 2, h + 2); qp(P[0], x + 1, y + 1, w - 2, (h - 2) >> 1); qp(P[2], x + 1, y + 1 + ((h - 2) >> 1), w - 2, h - 2 - ((h - 2) >> 1));
    qp(P[1], x + 3 + s % 5, y + 3 + (s >> 2) % 3, 4, 3); qp(shade(P[2], -0.2), x + 1, y + h - 4, w - 2, 2); return; }
  if (kind === 'portrait') { qp('#5a3a22', x, y, w, h); qp('#8a7a62', x + 2, y + 2, w - 4, h - 4); qp('#3a3028', x + (w >> 1) - 3, y + 4, 6, 6); qp('#3a3028', x + (w >> 1) - 5, y + 10, 10, h - 12); return; }
  if (LM_IMG[kind]) { qp('#c8a050', x - 1, y - 1, w + 2, h + 2); qp('#3a2414', x, y, w, h); musPhoto(kind, x + 1, y + 1, w - 2, h - 2); return; }
  qp('#5a3a22', x, y, w, h); qp('#c8b898', x + 2, y + 2, w - 4, h - 4); qp('#8a7a5a', x + 4, y + 6, w - 8, 4); qp('#5a4a3a', x + 7, y + 3, 3, 3);   // a sepia photograph
}
function musSign(x, y, w, text) { qp('#3a2a1e', x, y, w, 11); qp('#e8dcc0', x + 1, y + 1, w - 2, 9); txt(text, QX + x + w / 2, QY + y + 3, '#3a2a1e', 'center', SMALL); }
const MUS_WIDE = new Set(['countymap', 'chalk', 'stageflag', 'milsign', 'avasign', 'rrsign', 'lowsign']);
function musArt(Fm, a, x, y, X, Y) {
  const same = dx => Fm.art[(x + dx) + ',' + y] === a, s = x * 7 + y * 3;
  if (MUS_WIDE.has(a)) {   // a piece several tiles wide is drawn once, from its rightmost tile, after the walls under it
    if (same(1)) return; let n = 1; while (same(-n)) n++; X -= (n - 1) * 24; const W = n * 24;
    switch (a) {
      case 'countymap': qp('#3a2414', X + 2, Y - 7, W - 4, 22); qp('#e8dcb8', X + 4, Y - 5, W - 8, 18);
        for (let i = 0; i < 9; i++) { const q = hash(i * 3 + 7, 52); qp('#6a9ad0', X + 6 + q % (W - 14), Y - 3 + (q >> 5) % 13, 3 + q % 3, 2); }
        for (let i = 0; i < 5; i++) { const q = hash(i * 5 + 1, 77); qp('#8ab070', X + 5 + q % (W - 18), Y - 4 + (q >> 4) % 12, 8, 4); }
        qp('#c83a2a', X + (W >> 1), Y - 5, 1, 18); qp('#c83a2a', X + 4, Y + 4, W - 8, 1); qp('#2a2224', X + (W >> 1) - 1, Y + 3, 3, 3); return;   // the highways, Antigo where they cross
      case 'chalk': qp('#6a4428', X + 1, Y - 8, W - 2, 22); qp('#24342c', X + 3, Y - 6, W - 6, 17); qp('#8a6a44', X + 1, Y + 13, W - 2, 2);
        txt('TODAY:', QX + X + 6, QY + Y - 3, '#e8ece4', 'left', SMALL); txt('LANGLADE', QX + X + 6, QY + Y + 4, '#e8ece4', 'left', SMALL);
        qp('#e8ece4', X + W - 18, Y - 2, 12, 1); qp('#e8ece4', X + W - 18, Y + 2, 9, 1); qp('#f4f4f0', X + W - 12, Y + 12, 4, 1); return;
      case 'stageflag': musFlag(X + 2, Y - 8, W - 4, 22); return;
      case 'milsign': musSign(X + 3, Y - 5, W - 6, 'MILITARY'); return;
      case 'avasign': musSign(X + 3, Y - 5, W - 6, 'GALLERY'); return;
      case 'rrsign': musSign(X + 3, Y - 5, W - 6, 'RAILROAD'); return;
      case 'lowsign': musSign(X + 3, Y - 5, W - 6, 'LOWER LEVEL'); return;
    }
  }
  switch (a) {
    case 'bird1886': qp('#3a2414', X + 1, Y - 6, 22, 18); qp('#c8a050', X + 2, Y - 5, 20, 16); musPhoto('bird1886', X + 3, Y - 4, 18, 13); return;
    case 'fifth1922': case 'lib1922': case 'school1879': musFrame(a, X + 3, Y - 5, 18, 14); return;
    case 'rules1897': musFrame('card', X + 4, Y - 6, 16, 16); qp('#a8322a', X + 15, Y + 5, 3, 3); return;
    case 'logphoto': case 'kingsbury': case 'depot': case 'attic': musFrame(a === 'attic' ? 'card' : 'photo', X + 4, Y - 6, 16, 14); return;
    case 'portraits': musFrame('portrait', X + 2, Y - 7, 9, 11); musFrame('portrait', X + 13, Y - 3, 9, 11); return;
    case 'portrait': musFrame('portrait', X + 5, Y - 7, 14, 17); return;
    case 'vposters': for (let i = 0; i < 3; i++) { qp(['#e04a3a', '#3a7ad8', '#f0c040'][i], X + 1 + i * 8, Y - 6 + (i % 2) * 3, 7, 10); qp('#f4f0e4', X + 2 + i * 8, Y - 4 + (i % 2) * 3, 5, 2); } return;
    case 'flag': musFlag(X + 3, Y - 6, 18, 11); return;
    case 'clock': qp('#3a2414', X + 7, Y - 6, 11, 11); qp('#f4f0e4', X + 8, Y - 5, 9, 9); qp('#1c1618', X + 12, Y - 4, 1, 4); qp('#1c1618', X + 12, Y - 1, 3, 1); return;
    case 'paint': musFrame('paint', X + 3, Y - 6, 18, 14, s); return;
    case 'poster': { const c = ['#a8322a', '#2a4a7a', '#3a5a3a'][s % 3]; qp('#1c1618', X + 5, Y - 7, 14, 18); qp(c, X + 6, Y - 6, 12, 16); qp('#f0e8d0', X + 7, Y - 4, 10, 3); qp('#f0e8d0', X + 8, Y + 5, 8, 2); qp('#d8b040', X + 10, Y, 4, 4); return; }
    case 'railmap': qp('#3a2414', X + 1, Y - 7, 22, 18); qp('#e8dcb8', X + 2, Y - 6, 20, 16); qp('#1c1618', X + 3, Y + 2, 18, 1); qp('#1c1618', X + 11, Y - 5, 1, 14); qp('#1c1618', X + 5, Y - 4, 1, 7); qp('#c83a2a', X + 10, Y + 1, 3, 3); return;
    case 'lemonade': musFrame('card', X + 4, Y - 7, 16, 18); qp('#e8d040', X + 8, Y + 5, 4, 4); return;
    case 'snowshoes': for (const dx of [4, 13]) { qp('#8a6440', X + dx, Y - 7, 7, 18); qp('#d8c8a0', X + dx + 1, Y - 6, 5, 15); for (let r = 0; r < 5; r++) qp('#8a6440', X + dx + 1, Y - 4 + r * 3, 5, 1); } return;
    case 'fish': qp('#5a3a22', X + 1, Y - 6, 22, 14); qp('#7a8a5a', X + 3, Y - 2, 15, 6); qp('#5a6a3a', X + 3, Y - 2, 15, 1); qp('#7a8a5a', X + 17, Y - 4, 4, 10); qp('#1c1618', X + 5, Y - 1, 1, 1); for (let i = 0; i < 4; i++) qp('#4a5a2a', X + 7 + i * 3, Y + 1, 1, 2); return;
    case 'cquote': case 'cframe': musFrame(a === 'cquote' ? 'card' : 'photo', X + 5, Y - 6, 14, 12); return;
  }
}
function musFlag(x, y, w, h) {   // the flag: thirteen stripes, the blue field with its stars
  for (let i = 0; i < 13; i++) qp(i % 2 ? '#f4f4f4' : '#b22234', x, y + Math.floor(i * h / 13), w, Math.max(1, Math.floor((i + 1) * h / 13) - Math.floor(i * h / 13)));
  const cw = Math.round(w * 0.4), ch = Math.round(h * 7 / 13); qp('#3c3b6e', x, y, cw, ch);
  for (let j = 1; j < ch - 1; j += 2) for (let i = 1 + (j >> 1) % 2; i < cw - 1; i += 3) qp('#ffffff', x + i, y + j, 1, 1);
}
function musCase(kind, X, Y, h) {   // what sits inside a glass case (the particular objects are stand-ins)
  switch (kind) {
    case 'logging': qp('#8a8e96', X + 3, Y - 1, 16, 3); for (let i = 0; i < 8; i++) qp('#5a5e66', X + 3 + i * 2, Y + 2, 1, 1); qp('#7a5434', X + 17, Y - 3, 2, 8); qp('#5a5e66', X + 14, Y + 3, 6, 3); break;
    case 'beads': qp('#2a2440', X + 3, Y - 3, 18, 9); for (let i = 0; i < 12; i++) qp(['#e04a6a', '#f0d040', '#4ab0e0', '#f4f0f0', '#4aa05a'][(i + h) % 5], X + 4 + (i * 5) % 16, Y - 2 + ((i * 3) % 7), 2, 2); break;
    case 'medical': qp('#16161a', X + 3, Y, 9, 6); qp('#3a3a42', X + 5, Y - 1, 5, 1); for (let i = 0; i < 3; i++) qp('#6a3a14', X + 14 + i * 3, Y - 1 + (i % 2), 2, 6); break;
    case 'baubles': for (let i = 0; i < 7; i++) qp(i % 2 ? '#d8b040' : '#c8ccd2', X + 4 + i * 2 + (i % 3), Y + (i % 3) * 2, 2, 2); break;
    case 'hair': qp('#f0e8d6', X + 4, Y - 4, 16, 11); qp('#6a4a2a', X + 7, Y - 3, 10, 2); qp('#6a4a2a', X + 6, Y - 1, 2, 5); qp('#6a4a2a', X + 16, Y - 1, 2, 5); qp('#6a4a2a', X + 8, Y + 4, 8, 2); qp('#a8784a', X + 10, Y - 2, 2, 2); break;
    case 'potato': for (let r = 0; r < 3; r++) qp(['#5a3a22', '#7a5a3a', '#a08060'][r], X + 3, Y - 3 + r * 3, 7, 3); for (let i = 0; i < 4; i++) qp('#b88a58', X + 12 + (i % 2) * 4, Y - 2 + (i >> 1) * 4, 4, 3); break;
    case 'making': for (let i = 0; i < 4; i++) qp('#d8b880', X + 3 + i * 2, Y - 3, 1, 9); qp('#5a3a22', X + 13, Y - 2, 8, 8); qp('#c8a050', X + 16, Y + 1, 2, 2); break;
    case 'curio': qp('#6a4428', X + 3, Y - 1, 8, 5); qp('#1c1618', X + 4, Y, 2, 2); qp('#1c1618', X + 8, Y, 2, 2); qp('#c83a2a', X + 14, Y, 5, 4); qp('#3a7ad8', X + 15, Y - 2, 3, 2); break;
    case 'civil': qp('#f0e8d0', X + 3, Y - 2, 6, 7); qp('#e8dcc0', X + 6, Y - 1, 6, 7); qp('#5a3a22', X + 14, Y - 2, 6, 8); qp('#3a2414', X + 14, Y - 2, 1, 8); break;
    case 'wwi': qp('#5a6040', X + 4, Y - 1, 8, 4); qp('#4a5034', X + 3, Y + 2, 10, 2); qp('#c8b898', X + 15, Y - 3, 5, 6); break;
    case 'rifles': qp('#6a4428', X + 2, Y - 2, 10, 2); qp('#3a3a42', X + 12, Y - 2, 10, 1); qp('#6a4428', X + 2, Y + 3, 9, 2); qp('#3a3a42', X + 11, Y + 3, 11, 1); break;
    case 'bradley': qp('#3c3b6e', X + 4, Y - 2, 8, 6); qp('#f4f4f4', X + 6, Y, 1, 1); qp('#f4f4f4', X + 9, Y - 1, 1, 1); qp('#b22234', X + 4, Y + 4, 8, 1);
      qp('#2a4a8a', X + 15, Y - 3, 3, 4); qp('#a87a3a', X + 14, Y + 1, 5, 5); break;   // a folded flag and a medal
    case 'domestic': qp('#1c1c20', X + 3, Y + 1, 7, 4); qp('#3a3a42', X + 5, Y - 1, 3, 2); qp('#c8a878', X + 13, Y - 3, 7, 9); for (let i = 0; i < 4; i++) qp('#8a6a44', X + 13, Y - 1 + i * 2, 7, 1); break;
    case 'rr': qp('#c83a2a', X + 4, Y - 2, 5, 6); qp('#3a3a42', X + 5, Y - 4, 3, 2); qp('#8a8e96', X + 13, Y, 6, 2); qp('#5a3a22', X + 15, Y + 2, 2, 3); break;
    case 'lures': for (let i = 0; i < 5; i++) qp(['#e04a3a', '#f0d040', '#4aa05a', '#f4f0f0', '#3a7ad8'][i], X + 3 + i * 4, Y - 1 + (i % 2) * 2, 3, 2); qp('#5a5e66', X + 4, Y + 4, 14, 1); break;
    default: qp(['#8a6a4a', '#c8b898', '#5a5a62'][h % 3], X + 6, Y - 1, 12, 5);
  }
}
function musProp(Fm, t, x, y) {
  const X = x * 24, Y = y * 24, h = hash(x * 5 + 404, y * 9 + 2), sh = () => qp('rgba(0,0,0,.22)', X + 1, Y + 19, 22, 4), same = (dx, dy, c) => roomT(Fm, x + dx, y + dy) === c;
  switch (t) {
    case '^': {   // a stair climbing toward the back: treads lighter as they rise, a red runner up the middle
      qp('#1a1214', X, Y - 9, 24, 4);
      for (let i = 0; i < 8; i++) { const yy = Y + 20 - i * 4; qp(shade('#7a5030', i * 0.04), X, yy, 24, 4); qp(shade('#5a3a22', i * 0.03), X, yy + 3, 24, 1); }
      if (Fm.id !== 'mus0') { qp('#7a1e24', X + 6, Y - 8, 12, 32); for (let i = 0; i < 8; i++) qp('#5e161c', X + 6, Y + 23 - i * 4, 12, 1); qp('#c8a050', X + 6, Y - 8, 1, 32); qp('#c8a050', X + 17, Y - 8, 1, 32); }
      if (!same(-1, 0, '^')) { qp('#4a2e1a', X, Y - 10, 3, 34); qp('#7a5434', X, Y - 12, 3, 3); }
      if (!same(1, 0, '^')) { qp('#4a2e1a', X + 21, Y - 10, 3, 34); qp('#7a5434', X + 21, Y - 12, 3, 3); }
      return true; }
    case 'v': {   // a stair going down: a dark well, the treads fading as they drop away
      qp('#140e10', X, Y - 6, 24, 30);
      for (let i = 0; i < 7; i++) qp(shade('#6a4428', -0.65 + i * 0.09), X + 2, Y - 4 + i * 4, 20, 3);
      if (!same(-1, 0, 'v')) qp('#4a2e1a', X, Y - 8, 3, 32); if (!same(1, 0, 'v')) qp('#4a2e1a', X + 21, Y - 8, 3, 32);
      qp('#8a6a44', X, Y + 21, 24, 3); return true; }
    case 'L': {   // the elevator: steel doors in a frame, the floor light above
      qp('#4a4e56', X + 1, Y - 14, 22, 36); qp('#2a2c32', X + 1, Y - 14, 22, 2);
      qp('#b8bcc4', X + 3, Y - 9, 9, 29); qp('#a8acb4', X + 12, Y - 9, 9, 29); qp('#6a6e76', X + 11, Y - 9, 2, 29); qp('rgba(255,255,255,.35)', X + 4, Y - 8, 2, 27);
      qp('#1a1a1e', X + 8, Y - 13, 8, 3); qp('#ffb040', X + 9 + ((frame >> 5) % 3) * 2, Y - 13, 2, 2); qp('#e8e0c8', X + 22, Y + 2, 2, 4); return true; }
    case 's': {   // the south door, in the left wall: the jambs, a mat, the glass door standing open
      qp('#1c1618', X, Y - 2, 24, 3); qp('#1c1618', X, Y + 22, 24, 2); qp('#5a5e66', X + 1, Y + 1, 3, 21); qp('#9ab8d0', X + 4, Y + 2, 4, 19); qp('rgba(255,255,255,.4)', X + 5, Y + 3, 1, 17);
      qp('#3a3236', X + 9, Y + 4, 13, 15); qp('#4a4046', X + 10, Y + 5, 11, 13); return true; }
    case 'C': {   // the fireplace, two tiles wide: a brick breast, the mantel, a dark firebox
      if (same(-1, 0, 'C')) return true;
      qp('#8a4a36', X + 4, Y - 33, 40, 34); for (let r = 0; r < 9; r++) { qp('#6e3a2a', X + 4, Y - 33 + r * 4 + 3, 40, 1); qp('#6e3a2a', X + 4 + (r % 2) * 6 + 2, Y - 33 + r * 4, 1, 3); }
      qp('#ece2cc', X + 1, Y - 3, 46, 4); qp('#c8b898', X + 1, Y + 1, 46, 2); qp('#5a3a22', X + 20, Y - 12, 8, 9); qp('#f0e8d0', X + 21, Y - 11, 6, 6); qp('#c8a050', X + 8, Y - 10, 2, 7); qp('#c8a050', X + 38, Y - 10, 2, 7);
      qp('#8a4a36', X + 6, Y + 3, 36, 16); qp('#1e1614', X + 13, Y + 5, 22, 14); qp('#2a2220', X + 15, Y + 7, 18, 12); qp('#7a746c', X + 3, Y + 18, 42, 6); qp('#5a5650', X + 3, Y + 23, 42, 1); return true; }
    case 'b': { sh(); qp('#5a5e66', X + 3, Y - 10, 18, 30); qp('#3a3c42', X + 3, Y - 10, 18, 2);
      for (let r = 0; r < 4; r++) for (let i = 0; i < 3; i++) qp(['#e04a3a', '#3a7ad8', '#f0c040', '#4aa05a', '#f4f0e4', '#c86a2a'][(r * 3 + i + h) % 6], X + 4 + i * 6, Y - 8 + r * 7, 4, 6);
      return true; }
    case 'E': { sh(); const L = !same(-1, 0, 'E'), R = !same(1, 0, 'E');
      qp('#5a3a22', X, Y + 8, 24, 12); qp('#3a2414', X, Y + 19, 24, 1); qp('#cfe0e8', X + (L ? 1 : 0), Y - 6, 24 - (L ? 1 : 0) - (R ? 1 : 0), 15); qp('rgba(255,255,255,.4)', X + 2, Y - 5, 20, 1);
      if (L) qp('#7a8a92', X, Y - 6, 1, 15); if (R) qp('#7a8a92', X + 23, Y - 6, 1, 15); qp('#6a7a82', X, Y + 8, 24, 1);
      musCase(Fm.caseKind[x + ',' + y] || 'curio', X, Y, h); return true; }
    case 'A': musFrame(Fm.artA[x + ',' + y] || 'photo', X + 3, Y - 8, 18, 15, x * 7 + y * 3); return true;
    case 'K': if (Fm.id !== 'mus1') return false;   // the archive: shelves of grey boxes and binders
      sh(); qp('#4a4e56', X, Y - 14, 24, 34); qp('#6a6e76', X, Y - 14, 24, 2);
      for (let r = 0; r < 4; r++) { const sy = Y - 11 + r * 8; qp('#2a2c32', X + 1, sy + 6, 22, 1); for (let i = 0; i < 3; i++) qp(['#c8c0b0', '#a8a49c', '#d8ccb0', '#8a9aaa'][(i + r + h) % 4], X + 2 + i * 7, sy, 6, 6); }
      return true;
    case '!': { qp('rgba(0,0,0,.2)', X + 6, Y + 18, 12, 3); qp('#5a3a22', X + 10, Y + 4, 4, 15); qp('#3a2414', X + 6, Y + 18, 12, 2); qp('#6a4428', X + 3, Y - 2, 18, 8);
      qp('#f4f0e4', X + 4, Y - 4, 8, 7); qp('#e8e0cc', X + 12, Y - 4, 8, 7); qp('#3a2a1e', X + 11, Y - 4, 1, 7); for (let r = 0; r < 3; r++) { qp('#8a7a6a', X + 5, Y - 3 + r * 2, 6, 1); qp('#8a7a6a', X + 13, Y - 3 + r * 2, 6, 1); } return true; }
    case '$': { sh(); qp('#5a3a22', X + 9, Y + 6, 6, 13); qp('#7a5434', X + 5, Y - 4, 14, 11); qp('#8a6440', X + 5, Y - 4, 14, 2); qp('#1c1618', X + 9, Y - 3, 6, 1); qp('#e8dcc0', X + 7, Y + 1, 10, 4); return true; }
    case '&': { qp('rgba(0,0,0,.2)', X + 5, Y + 18, 14, 3); qp('#5a3a22', X + 6, Y + 2, 2, 17); qp('#5a3a22', X + 16, Y + 2, 2, 17); qp('#3a2414', X + 3, Y - 7, 18, 14); qp('#f2ead6', X + 5, Y - 5, 14, 10); qp('#7a6a5a', X + 7, Y - 3, 10, 1); qp('#7a6a5a', X + 7, Y, 8, 1); qp('#c8a050', X + 15, Y + 2, 3, 3); return true; }
    case '1': { qp('rgba(0,0,0,.2)', X + 4, Y + 18, 16, 3); qp('#7a5434', X + 4, Y, 16, 7); qp('#8a6440', X + 4, Y, 16, 2); qp('#1c1618', X + 16, Y + 1, 2, 2); qp('#2a2a30', X + 5, Y + 7, 2, 11); qp('#2a2a30', X + 17, Y + 7, 2, 11); qp('#7a5434', X + 6, Y + 12, 12, 4); return true; }
    case '2': { sh(); qp('#6a4428', X + 1, Y + 1, 22, 17); qp('#8a5a30', X + 1, Y + 1, 22, 3); qp('#c8a050', X + 4, Y - 3, 4, 4); qp('#5a3a22', X + 5, Y - 5, 2, 2); qp('#3a6a3a', X + 12, Y - 2, 8, 3); qp('#a8322a', X + 12, Y - 4, 7, 2); return true; }
    case '3': { qp('rgba(0,0,0,.25)', X + 3, Y + 18, 18, 3); qp('#2a2a2e', X + 4, Y + 2, 16, 13); qp('#3a3a42', X + 4, Y + 2, 16, 2); qp('#1c1c20', X + 5, Y + 15, 2, 4); qp('#1c1c20', X + 17, Y + 15, 2, 4);
      qp('#3a3a42', X + 10, Y - 30, 4, 32); qp('#8a3a20', X + 7, Y + 8, 4, 3); return true; }
    case '4': { qp('rgba(0,0,0,.2)', X + 4, Y + 18, 16, 3); qp('#8a6440', X + 5, Y - 4, 2, 23); qp('#8a6440', X + 17, Y - 4, 2, 23); qp('#8a6440', X + 11, Y - 8, 2, 24); musFrame('paint', X + 3, Y - 6, 18, 13, x * 3 + y); return true; }
    case '5': {   // a figure in uniform on a stand
      const rr = Fm.id === 'mus2' && x >= 16 && y >= 10, i = rr ? 4 : (x > 15 ? 2 : 0) + (y > 4 ? 1 : 0);
      const [coat, pants, hat] = [['#2a3a6a', '#7aa0c8', '#2a3a6a'], ['#5a6040', '#5a6040', '#4a5034'], ['#1e2a4a', '#1e2a4a', '#f4f4f4'], ['#c8b088', '#c8b088', '#b8a078'], ['#1e2a4a', '#1e2a4a', '#1e2a4a']][i];
      qp('rgba(0,0,0,.25)', X + 5, Y + 18, 14, 3); qp('#3a3a42', X + 11, Y + 12, 2, 7); qp('#3a3a42', X + 7, Y + 18, 10, 2);
      qp(pants, X + 8, Y + 2, 8, 11); qp(coat, X + 6, Y - 10, 12, 13); qp(shade(coat, -0.25), X + 11, Y - 10, 2, 13); qp('#d8c8a8', X + 10, Y - 15, 4, 5);
      qp(hat, X + 8, Y - 18, 8, 4); if (i === 1) qp(hat, X + 6, Y - 15, 12, 2); if (i === 4) qp('#c8a050', X + 11, Y - 17, 2, 2);
      if (i === 0 || i === 4) for (let k = 0; k < 3; k++) qp('#c8a050', X + 11, Y - 8 + k * 4, 1, 1);
      return true; }
    case '6': {   // the diorama, two by two: drawn from its top-left tile
      if (same(-1, 0, '6') || same(0, -1, '6')) return true;
      qp('rgba(0,0,0,.25)', X + 2, Y + 42, 46, 4); qp('#5a3a22', X, Y + 2, 48, 42); qp('#6a8a4a', X + 2, Y, 44, 38); qp('#7a9a5a', X + 2, Y, 44, 3);
      qp('#8a8478', X + 2, Y + 20, 44, 6); for (let i = 0; i < 11; i++) qp('#5e4430', X + 3 + i * 4, Y + 21, 2, 4); qp('#a8aeb6', X + 2, Y + 21, 44, 1); qp('#a8aeb6', X + 2, Y + 24, 44, 1);
      qp('#a24e3a', X + 6, Y + 6, 12, 8); qp('#5a5450', X + 6, Y + 4, 12, 3); qp('#8a8478', X + 26, Y + 5, 14, 9); qp('#5a5a62', X + 26, Y + 3, 14, 3);
      qp('#1c1c20', X + 10, Y + 19, 14, 5); qp('#5a5e66', X + 10, Y + 18, 6, 2); qp('#8c3a2c', X + 26, Y + 19, 10, 5); qp('#c8b088', X + 37, Y + 19, 8, 5);
      for (const [a, b] of [[4, 30], [16, 32], [40, 6], [42, 31]]) { qp('#2e5a2e', X + a, Y + b, 4, 5); qp('#4a7a3a', X + a + 1, Y + b - 2, 2, 3); }
      return true; }
    case '7': { const c = ['#5a2a4a', '#2a3a5a', '#e8e0cc', '#3a5a4a'][(x + y) % 4]; qp('rgba(0,0,0,.2)', X + 5, Y + 18, 14, 3); qp('#3a3a42', X + 11, Y + 12, 2, 7);
      qp(c, X + 9, Y - 12, 6, 6); qp(c, X + 7, Y - 6, 10, 8); qp(c, X + 5, Y + 2, 14, 12); qp(shade(c, -0.2), X + 5, Y + 12, 14, 2); qp('#f0e8d6', X + 10, Y - 13, 4, 2); return true; }
    case '8': { qp('rgba(0,0,0,.2)', X + 2, Y + 18, 20, 3); qp('#7a5434', X + 4, Y - 6, 2, 14); qp('#7a5434', X + 9, Y - 6, 2, 14); qp('#7a5434', X + 5, Y + 6, 12, 3);
      qp('#5a5e66', X + 14, Y + 4, 8, 10); qp('#7a7e86', X + 14, Y + 4, 8, 2); qp('#3a3a42', X + 18, Y + 13, 4, 3); return true; }
    case '9': { qp('rgba(0,0,0,.2)', X + 2, Y + 18, 20, 3); qp('#5a3a22', X + 3, Y + 6, 2, 13); qp('#5a3a22', X + 19, Y + 6, 2, 13);
      qp('#8a8e96', X + 1, Y + 2, 22, 4); for (let i = 0; i < 11; i++) qp('#5a5e66', X + 1 + i * 2, Y + 6, 1, 2); qp('#7a5434', X - 1, Y, 3, 7); qp('#7a5434', X + 22, Y, 3, 7); return true; }
    case '0': { qp('rgba(0,0,0,.2)', X + 4, Y + 18, 16, 3); qp('#6a4428', X + 6, Y + 4, 2, 15); qp('#6a4428', X + 16, Y + 4, 2, 15); qp('#6a4428', X + 11, Y + 4, 2, 15);
      qp('#7a5434', X + 6, Y - 6, 12, 10); qp('#1c1618', X + 14, Y - 4, 6, 6); qp('#c8a050', X + 7, Y - 5, 2, 2); qp('#1c1c20', X + 2, Y - 8, 8, 12); return true; }
    case 'z': { qp('rgba(0,0,0,.2)', X + 4, Y + 18, 16, 3); qp('#a8322a', X + 8, Y + 4, 8, 15); qp('#c8ccd2', X + 5, Y - 6, 14, 10); qp('#e8ecf0', X + 6, Y - 6, 12, 2); qp('#3a3a42', X + 17, Y + 4, 6, 1); qp('#3a3a42', X + 22, Y + 1, 1, 4); return true; }
    case 'u': { for (const dx of [3, 13]) { qp('rgba(0,0,0,.2)', X + dx, Y + 18, 9, 3); qp('#9aa0a8', X + dx, Y - 2, 8, 20); qp('#b8bec6', X + dx, Y - 2, 8, 2); qp('#7a8088', X + dx + 2, Y - 5, 4, 3); } return true; }
    case '+': { sh(); qp('#8a6440', X, Y + 2, 24, 6); qp('#6a4428', X, Y + 8, 24, 2); qp('#5a3a22', X + 2, Y + 10, 3, 9); qp('#5a3a22', X + 19, Y + 10, 3, 9);
      if (!same(-1, 0, '+')) { qp('#5a5e66', X + 4, Y, 8, 3); qp('#7a5434', X + 13, Y - 1, 6, 3); } else { qp('#8a8e96', X + 3, Y, 2, 6); qp('#5a3a22', X + 8, Y - 1, 10, 2); } return true; }
    case '~': {   // the canoe, three tiles long, on two sawhorses
      if (same(-1, 0, '~')) return true;
      qp('rgba(0,0,0,.2)', X + 4, Y + 18, 64, 3); for (const dx of [12, 52]) { qp('#7a5434', X + dx, Y + 6, 2, 13); qp('#7a5434', X + dx + 6, Y + 6, 2, 13); qp('#8a6440', X + dx - 2, Y + 5, 12, 2); }
      qp('#a8683a', X + 6, Y - 2, 60, 8); qp('#c8884a', X + 8, Y - 2, 56, 2); qp('#8a5028', X + 2, Y, 4, 4); qp('#8a5028', X + 66, Y, 4, 4); qp('#5a3a22', X + 20, Y - 1, 2, 6); qp('#5a3a22', X + 48, Y - 1, 2, 6); return true; }
    case 'j': { qp('rgba(0,0,0,.2)', X + 6, Y + 18, 12, 3); qp('#8a6440', X + 7, Y + 2, 10, 17); qp('#6a4428', X + 7, Y + 6, 10, 1); qp('#6a4428', X + 7, Y + 14, 10, 1); qp('#a07a50', X + 8, Y + 1, 8, 2); qp('#c8a878', X + 11, Y - 8, 2, 10); qp('#c8a878', X + 9, Y - 9, 6, 2); return true; }
    case '=': {   // a horse-drawn potato digger, two tiles long: drawn from its left tile
      if (same(-1, 0, '=')) return true;
      qp('rgba(0,0,0,.2)', X + 2, Y + 18, 44, 3); qp('#a8322a', X + 6, Y + 2, 30, 8); qp('#7a2420', X + 6, Y + 9, 30, 2); qp('#5a5e66', X + 36, Y + 6, 10, 4); for (let i = 0; i < 5; i++) qp('#3a3a42', X + 9 + i * 6, Y + 11, 2, 6);
      for (const dx of [4, 30]) { qp('#2a2a30', X + dx, Y + 4, 8, 14); qp('#5a5e66', X + dx + 3, Y + 9, 2, 2); } qp('#7a5434', X - 2, Y + 4, 10, 2); qp('#e8dcc0', X + 18, Y + 3, 6, 2); return true; }
    case '@': {   // a logging sled with its load, two tiles long: drawn from its left tile
      if (same(-1, 0, '@')) return true;
      qp('rgba(0,0,0,.22)', X + 2, Y + 18, 44, 3); qp('#5a3a22', X + 2, Y + 14, 44, 3); qp('#3a2414', X, Y + 16, 4, 2); qp('#3a2414', X + 44, Y + 16, 4, 2);
      for (const [dx, dy] of [[4, 6], [16, 6], [28, 6], [10, -2], [22, -2]]) { qp('#7a5434', X + dx, Y + dy, 14, 9); qp('#c8a070', X + dx + 10, Y + dy + 1, 4, 7); qp('#8a6440', X + dx, Y + dy, 10, 1); qp('#3a2414', X + dx + 11, Y + dy + 3, 2, 2); }
      return true; }
    case '%': { sh(); qp('#c8ccd2', X + 10, Y + 8, 4, 11); qp('#e8dcc0', X + 4, Y - 4, 16, 12); qp('#d8ccb0', X + 4, Y - 4, 16, 2); qp('#c8ccd2', X + 2, Y + 2, 3, 2); qp('#c8ccd2', X + 19, Y + 2, 3, 2); return true; }
    case '/': { qp('#3a2414', X + 2, Y - 14, 20, 38); for (let i = 0; i < 9; i++) qp(i % 2 ? '#8a6a44' : '#7a5a3a', X + 4, Y + 20 - i * 4, 16, 3); qp('#5a4430', X + 3, Y - 14, 2, 38); qp('#5a4430', X + 19, Y - 14, 2, 38); return true; }
    case '#': {   // the chest of drawers that served as the altar, and the crucifix on it
      sh(); qp('#6a4428', X + 3, Y - 4, 18, 22); for (let r = 0; r < 3; r++) { qp('#4a2e1a', X + 4, Y + 1 + r * 6, 16, 1); qp('#c8a050', X + 11, Y - 1 + r * 6, 2, 1); }
      qp('#8a5a30', X + 3, Y - 4, 18, 2); qp('#f0e8d6', X + 5, Y - 6, 14, 2); qp('#c8a050', X + 11, Y - 15, 2, 9); qp('#c8a050', X + 8, Y - 13, 8, 2); return true; }
    case 'J': { const front = !same(0, 1, 'J'); qp('#8a6440', X, Y, 24, 24); qp('#9a7450', X, Y, 24, 1); qp('#7a5434', X + ((x * 7) % 3) * 8, Y, 1, 24);
      if (front) { qp('#5a3a22', X, Y + 17, 24, 7); qp('#3a2414', X, Y + 23, 24, 1); } return true; }
    case 'D': if (Fm.kind !== 'cabin') return false; qp('#1c1618', X, Y, 24, 24); musLogs(X + 4, Y, 24, 16); qp('#5a3e26', X + 6, Y + 2, 12, 20); qp('#4a3220', X + 10, Y + 2, 1, 20); qp('#c8b070', X + 7, Y + 11, 2, 2); return true;
  }
  return false;
}

// ---------- outside: the doors, the cabin, the 440 and the caboose under their roof, the little railroad park ----------
let MUS_SD = null, MUS_CD = null;
function musSouthDoor() {   // the south door: the museum's south-wall cell nearest 782 (the vestibule is near the south-east corner)
  if (MUS_SD || !MUSEUM) return MUS_SD; let best = null;
  for (let y = Math.floor(MUSEUM.pyMax) + 1; y >= Math.floor(MUSEUM.pyMin); y--) for (let x = Math.floor(MUSEUM.pxMin); x <= Math.ceil(MUSEUM.pxMax); x++)
    if (bldgAtM(x, y) === MUSEUM && !bldgAtM(x, y + 1) && !solidM(x, y + 1) && (!best || y > best.y || (y === best.y && Math.abs(x - 782) < Math.abs(best.x - 782)))) best = { x, y };
  return (MUS_SD = best);
}
function musCabinDoor() {   // the cabin's door: its south wall (the NRHP's "board door ... into the south wall"), westmost cell
  if (MUS_CD || !MUS_CABIN) return MUS_CD; let best = null;
  for (let y = Math.floor(MUS_CABIN.pyMin); y <= Math.ceil(MUS_CABIN.pyMax); y++) for (let x = Math.floor(MUS_CABIN.pxMin); x <= Math.ceil(MUS_CABIN.pxMax); x++)
    if (bldgAtM(x, y) === MUS_CABIN && !bldgAtM(x, y + 1) && (!best || y > best.y || (y === best.y && x < best.x))) best = { x, y };
  return (MUS_CD = best);
}
const musAtSouthDoor = (x, y) => { const d = musSouthDoor(); return !!d && x === d.x && y === d.y; };
const musAtCabinDoor = (x, y) => { const d = musCabinDoor(); return !!d && y === d.y && (x === d.x || x === d.x + 1) && bldgAtM(x, y) === MUS_CABIN; };
const musCabinOpen = () => musSummer() && G.musCabin === musToday();
function musEnter(how) {
  const south = how === 'south'; G.inside = south ? { f: 'mus1', x: 1, y: 20 } : { f: 'mus1', x: 11, y: 21 }; G.dir = south ? 'right' : 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  say([['', south ? 'The vestibule on the south side: brochures and posters, and a door into the welcome center. It stays open around the clock.'
    : 'The Langlade County Historical Society Museum, in the old Carnegie library. A stair of fine old woodwork climbs from the middle of the front hall.']]);
}
function musEnterCabin() {
  G.inside = { f: 'cabin', x: 3, y: 5 }; G.dir = 'up'; P.t = 0; P.mx = P.my = 0; saveGame(); setMode('inside');
  say([['', 'The Deleglise cabin, built in 1878: the first house in Antigo. Elm log walls, a hemlock floor, and the smell of old wood.']]);
}
function musCabinLook() {
  if (musCabinOpen()) return musEnterCabin();
  say([['', 'THE DELEGLISE CABIN · built in 1878 by Francis A. Deleglise, who founded Antigo. It is the first house in Antigo.'],
    ['', musSummer() ? 'The door is locked. In summer the cabin opens on request: ask at the museum\'s front desk.' : 'The door is locked. The cabin and the train close for the winter.'],
    ['', 'Through the window: a table and chairs, a chest of drawers with a crucifix on it, and a steep stair to the loft.']]);
  DLG.photos = ['cabin']; DLG.credit = 'Photo: Wikimedia Commons, public domain';
}
function musTrainLook(which) {
  if (which === 'caboose') return say([['', 'THE CABOOSE · from 1955 or 1956; the sources differ. Its bay windows stick out from the sides, so the crew could watch down the length of the train.'],
    ['', 'The historical society bought it in 2001 and set it on rails here, before the 440 came. The roof over the two went up in 2006.'],
    ['', 'A little railroad park followed in 2008: benches, a clock, luggage carts and plaques for the donors.']]);
  say([['', 'THE 440 · a 2-8-0 steam locomotive, built by Baldwin in December 1900 as Union Pacific No. 1660.'],
    ['', 'It was a compound: it used its steam twice, first in small high-pressure cylinders, then in big low-pressure ones. Rebuilt as a simple engine, it became No. 440 in 1915.'],
    ['', 'It ran branch lines in Kansas and Nebraska until 1955, then sat at the fairgrounds in Lincoln, Nebraska, and from 1975 at a railroad museum in North Freedom, Wisconsin.'],
    ['', 'The historical society bought it, and it arrived on October 31, 2005. It wears Chicago & North Western colors for Antigo\'s railroad, though it never ran on the North Western.'],
    ['', 'It\'s a close cousin of North Western No. 175, the last steam engine through Antigo, in 1957.']],
    () => ask('A cord hangs from the whistle. Pull it?', [{ t: 'Pull the cord', f: () => say([['', 'You think better of it. The whistle runs on air now, from two compressors, and it opens the historical society\'s summer picnic.']]) }, { t: 'Leave it' }]));
}
// the doors: walking up into the south door or the cabin's door goes in (the cabin only when it's open)
{ const _de = doorEnter; doorEnter = function (x, y) { const r = _de(x, y); if (r) return r;
    if (musAtSouthDoor(x, y)) return () => musEnter('south');
    if (musAtCabinDoor(x, y) && musCabinOpen()) return musEnterCabin;
    return null; }; }
{ const _er = enterRoom; enterRoom = function (b) { if (b === MUSEUM) return musEnter('east'); return _er(b); }; }
{ const _lg = loadGame; loadGame = function () { const s = _lg(); if (s && s.inside && MUSEUM && s.inside.f === 'room' + MUSEUM.id) s.inside = { f: 'mus1', x: 11, y: 21 }; return s; }; }
// looking at the cabin, the train, the railroad park
const MUS_LOCO = (typeof PB !== 'undefined' ? PB.show : []).find(s => s[2] === 'locomotive');
{ const _look = lookAt; lookAt = function (x, y) {
    if (mode === 'walk' && !DLG) {
      const b = bldgAtM(x, y);
      if (b && b === MUS_CABIN) { G.seen[b.id] = 1; return musCabinLook(); }
      if (b && (b === SHED_N || b === SHED_S)) { G.seen[b.id] = 1; return musTrainLook(b === SHED_S ? 'caboose' : 'loco'); }
      const cx = (x + 0.5) / CPD, cy = (y + 0.5) / CPD, p = PROPS.find(q => q.mus && Math.hypot(q.x - cx, q.y + 0.3 - cy) < 1.0);
      if (p && !b) return say([['', p.mus]]);
      if (!b && MUS_LOCO && Math.hypot(MUS_LOCO[0] - cx, MUS_LOCO[1] - cy) < 2.5) return musTrainLook('loco');
    }
    return _look(x, y); }; }
// the railroad park the society added in 2008: a station clock, a baggage cart, the ANTIGO sign
if (SHED_S && MUSEUM) {
  const sx = SHED_S.pxMax, sy = SHED_S.pyMax;
  PROPS.push({ x: sx + 0.35, y: sy + 0.55, k: 'musclock', reach: 3, mus: 'A railroad clock on a post, in the little railroad park the historical society added here in 2008.' });
  PROPS.push({ x: sx + 1.3, y: sy + 0.35, k: 'muscart', reach: 2, mus: 'An old baggage cart, the kind that waited on a depot platform for the train.' });
  PROPS.push({ x: (SHED_N || SHED_S).pxMax + 0.35, y: (SHED_N || SHED_S).pyMin + 0.4, k: 'mussign', reach: 3, mus: 'A station sign: ANTIGO. The society set up this end of the grounds like the old stop on the North Western.' });
  PROPS.sort((a, b) => a.y - b.y);
}
{ const _dp = drawProp; drawProp = function (p) {
    const x = Math.round(p.x * T), y = Math.round(p.y * T), m = v => Math.round(v * PM);
    if (p.k === 'musclock') { F('rgba(0,0,0,.22)', x - 4, y - 1, 9, 3); F('#1e2a22', x - 1, y - m(3.0), 3, m(3.0)); F('#1e2a22', x - 6, y - m(3.0) - 12, 13, 13);
      F('#f4f0e4', x - 5, y - m(3.0) - 11, 11, 11); F('#1c1618', x, y - m(3.0) - 9, 1, 5); F('#1c1618', x, y - m(3.0) - 5, 3, 1); F('#c8a050', x - 1, y - m(3.0) - 14, 3, 2); return; }
    if (p.k === 'muscart') { F('rgba(0,0,0,.22)', x - m(1.1), y - 1, m(2.2), 3); for (const s of [-1, 1]) F('#2a2a30', x + s * m(0.75) - 3, y - m(0.7), 6, m(0.7));
      F('#6a4a2e', x - m(1.1), y - m(1.0), m(2.2), m(0.45)); F('#8a6a44', x - m(1.1), y - m(1.0), m(2.2), 2); F('#5a4430', x + m(1.1) - 1, y - m(1.6), 2, m(0.7)); F('#5a4430', x + m(1.1) - 5, y - m(1.6), 6, 2); return; }
    if (p.k === 'mussign') { F('rgba(0,0,0,.2)', x - m(1.7), y - 1, m(3.4), 3); F('#3a2a1e', x - m(1.5), y - m(2.4), 2, m(2.4)); F('#3a2a1e', x + m(1.5) - 2, y - m(2.4), 2, m(2.4));
      F('#1c1618', x - m(1.8) - 1, y - m(2.4) - 11, m(3.6) + 2, 12); F('#f0ece2', x - m(1.8), y - m(2.4) - 10, m(3.6), 10); palWord('ANTIGO', x, y - m(2.4) - 8, '#1c1618', 1); return; }
    return _dp(p); }; }
// the cabin's logs, a texture for its walls
{ const _pat = pat; pat = function (kind, col) {
    if (kind !== 'logs') return _pat(kind, col);
    const key = 'logs' + col; let p = PAT.get(key); if (p) return p;
    const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 16; c.height = 6; const Fl = (cc, x, y, w, h) => { g.fillStyle = cc; g.fillRect(x, y, w, h); };
    Fl(col, 0, 0, 16, 6); Fl(shade(col, 0.16), 0, 0, 16, 1); Fl(shade(col, -0.28), 0, 3, 16, 1); Fl('#e6dfcd', 0, 4, 16, 2); Fl(shade(col, -0.12), 9, 1, 3, 1);
    p = ctx.createPattern(c, 'repeat'); PAT.set(key, p); return p; }; }
const MUS_TRACK_X = MUS_SHED.length ? (Math.min(...MUS_SHED.map(b => b.pxMin)) + Math.max(...MUS_SHED.map(b => b.pxMax))) / 2 : 0;
{ const _db = drawBuilding; drawBuilding = function (b) {
    if (b === SHED_N || b === SHED_S) return drawTrainShed(b);
    _db(b);
    if (b === MUS_CABIN) drawCabinFront(b);
    if (b === MUSEUM) drawMuseumSouth(b);
  }; }
function drawCabinFront(b) {   // the board door in the south wall and a six-over-six window
  const d = musCabinDoor(); if (!d) return; const by = b.pyMax * T, m = v => v * PM, dx = Math.round((d.x + 0.6) * T);
  F('#3a2a1e', dx - m(0.5) - 1, by - m(2.0) - 1, m(1.0) + 2, m(2.0) + 1); F('#6a4a2e', dx - m(0.5), by - m(2.0), m(1.0), m(2.0));
  for (let i = 1; i < 3; i++) F('#523820', dx - m(0.5) + i * m(0.33), by - m(2.0), 1, m(2.0)); F('#c8b070', dx + m(0.3), by - m(1.1), 2, 2);
  const wx = Math.round(Math.min(b.pxMax * T - m(1.0), dx + m(2.4))), wy = by - m(2.3);
  F('#e8e2d4', wx - m(0.55) - 1, wy - 1, m(1.1) + 2, m(1.2) + 2); F('#2a3a52', wx - m(0.55), wy, m(1.1), m(1.2)); F('#e8e2d4', wx - 1, wy, 1, m(1.2)); F('#e8e2d4', wx - m(0.55), wy + m(0.6), m(1.1), 1);
}
function drawMuseumSouth(b) {   // the south door, in the 2021 vestibule: glass doors under a small flat canopy
  const d = musSouthDoor(); if (!d) return; const by = b.pyMax * T, cx = Math.round((d.x + 0.5) * T), m = v => v * PM;
  F('#e8e4dc', cx - m(1.1) - 2, by - m(2.6) - 2, m(2.2) + 4, m(2.6) + 2); F('#2a3a52', cx - m(1.1), by - m(2.6), m(2.2), m(2.6)); F('#e8e4dc', cx - 1, by - m(2.6), 2, m(2.6));
  F('rgba(255,255,255,.2)', cx - m(1.0), by - m(2.5), 2, m(2.3)); F('#6a6e76', cx - m(1.6), by - m(3.1), m(3.2), m(0.35)); F('rgba(0,0,0,.25)', cx - m(1.6), by - m(2.75), m(3.2), 2);
}
function drawTrainShed(b) {
  const m = v => v * PM, X0 = b.pxMin * T, X1 = b.pxMax * T, Y0 = b.pyMin * T, Y1 = b.pyMax * T, cx = Math.round(MUS_TRACK_X * T), roofH = m(6.2);
  F('rgba(0,0,0,.18)', X0, Y0, X1 - X0, Y1 - Y0);                                            // the roof's shade on the ground
  F('#8c8478', cx - m(1.7), Y0, m(3.4), Y1 - Y0); for (let y = Y0 + 2; y < Y1 - 1; y += 5) F('#5e4430', cx - m(1.35), y, m(2.7), 2);   // ballast and ties
  F('#a8aeb6', cx - m(0.72) - 1, Y0, 2, Y1 - Y0); F('#a8aeb6', cx + m(0.72) - 1, Y0, 2, Y1 - Y0);   // rails
  const post = (x, y) => { F('#3a2a1e', x, y - roofH, 3, roofH); F('#5a4430', x, y - roofH, 1, roofH); };
  post(X0 + 2, Y0 + 3); post(X1 - 5, Y0 + 3); post(X0 + 2, (Y0 + Y1) / 2); post(X1 - 5, (Y0 + Y1) / 2);
  if (b === SHED_S) drawCaboose(cx, Y0); else drawLoco(cx, Y0);
  post(X0 + 2, Y1 - 1); post(X1 - 5, Y1 - 1);
  // the roof, see-through so the train shows: a light frame of rafters
  const s = bstyle(b), P = b.poly.map(p => [p[0] * T, p[1] * T - roofH]);
  ctx.save(); ctx.globalAlpha = 0.3; path(P); ctx.fillStyle = s.roofCol; ctx.fill(); ctx.restore();
  const ys = P.map(p => p[1]), xs = P.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  ctx.save(); path(P); ctx.clip(); ctx.globalAlpha = 0.35; for (let y = y0 + 7; y < y1; y += 16) F(shade(s.roofCol, -0.35), x0, y, x1 - x0, 2); F(shade(s.roofCol, -0.35), (x0 + x1) / 2 - 1, y0, 2, y1 - y0); ctx.restore();
  path(P); ctx.strokeStyle = '#1c1618'; ctx.lineWidth = 2; ctx.stroke();
  F(shade(s.roofCol, -0.2), x0, y1 - 1, x1 - x0, 4); F('#1c1618', x0, y1 + 3, x1 - x0, 1);       // the roof's front edge, seen face on
}
function drawLoco(cx, Y0) {   // the 440, heading north: pilot, boiler, stack and domes, cab, tender. Black, the smokebox graphite.
  const m = v => v * PM, gy = v => Y0 + m(v);
  const box = (a, b, hw, h, top, front) => { F(top, cx - m(hw), gy(a) - m(h), m(hw * 2), gy(b) - gy(a)); if (front) F(front, cx - m(hw), gy(b) - m(h), m(hw * 2), m(h)); };
  for (const v of [3.0, 4.5, 6.0, 7.5]) for (const sx of [-1, 1]) { F('#141416', cx + sx * m(1.5) - 2, gy(v) - m(1.4), 4, m(1.4)); F('#e8e4dc', cx + sx * m(1.5) - 2, gy(v) - m(1.4), 4, 1); }   // drivers, white rims
  F('#2a2a30', cx - m(1.2), gy(0.2) - m(1.0), m(2.4), m(0.6));                                   // the pilot
  box(0.8, 9.4, 1.5, 1.7, '#1e1e22', '#141416'); F('#34343c', cx - m(1.5), gy(0.8) - m(1.7), m(3.0), 2);   // frame and running boards
  F('#1a1a1e', cx - m(0.95), gy(1.0) - m(3.9), m(1.9), gy(9.2) - gy(1.0)); F('#34343c', cx - m(0.5), gy(1.0) - m(3.9), m(1.0), gy(9.2) - gy(1.0)); F('#50505a', cx - 1, gy(1.0) - m(3.9), 2, gy(9.2) - gy(1.0));   // the boiler
  F('#5a5e66', cx - m(0.95), gy(1.0) - m(3.9), m(1.9), m(1.5)); F('#7a7e86', cx - m(0.4), gy(1.0) - m(3.9), m(0.8), m(1.5));   // the smokebox, graphite
  F('#e8e0b0', cx - m(0.25), gy(0.9) - m(4.1), m(0.5), 3);                                        // the headlight
  F('#141416', cx - m(0.45), gy(1.8) - m(4.8), m(0.9), gy(2.6) - gy(1.8)); F('#000', cx - m(0.25), gy(1.9) - m(4.8), m(0.5), 3); F('#1e1e22', cx - m(0.45), gy(2.6) - m(4.8), m(0.9), m(0.9));   // the stack
  F('#c8a050', cx - 2, gy(3.6) - m(4.3), 4, 4);                                                    // the bell
  for (const [v, hh] of [[4.8, 4.4], [6.4, 4.5]]) { F('#26262c', cx - m(0.45), gy(v) - m(hh), m(0.9), m(0.8)); F('#5a5a64', cx - m(0.2), gy(v) - m(hh), m(0.4), 2); }   // sand and steam domes
  box(9.2, 11.9, 1.55, 4.5, '#26262c', '#18181c'); F('#3e3e48', cx - m(1.55), gy(9.2) - m(4.5), m(3.1), 2); F('#0c0c0e', cx - m(1.1), gy(11.9) - m(4.2), m(2.2), m(1.0));   // the cab
  box(12.3, 17.0, 1.5, 3.6, '#1e1e22', '#141416');                                                 // the tender
  for (let i = 0; i < 16; i++) { const q = hash(i * 13, 440); F(i % 3 ? '#0c0c0e' : '#30303a', cx - m(1.3) + q % Math.round(m(2.6) - 3), gy(12.6) - m(3.6) + (q >> 5) % Math.round(m(2.0)), 3, 2); }   // coal
  F('#3a3a42', cx - m(0.5), gy(15.0) - m(3.6), m(1.0), m(0.9)); F('#5a5a64', cx - m(0.5), gy(15.0) - m(3.6), m(1.0), 1);   // the water hatch
  for (const xx of [-0.9, -0.4]) F('#4a4a54', cx + m(xx), gy(17.0) - m(3.2), 1, m(2.8)); for (let r = 0; r < 5; r++) F('#4a4a54', cx - m(0.9), gy(17.0) - m(3.0) + r * 4, m(0.5), 1);   // a ladder
  for (const sx of [-1, 1]) F('#141416', cx + sx * m(1.2) - 3, gy(17.0) - m(0.6), 6, m(0.6));     // the tender's back truck
}
function drawCaboose(cx, Y0) {   // the bay-window caboose (its colour is a stand-in until Christian's photo)
  const m = v => v * PM, gy = v => Y0 + m(v), RED = '#8c3a2c', RED2 = '#6a2a20', ROOF = '#4a4644';
  for (const v of [2.6, 3.8, 10.2, 11.4]) for (const sx of [-1, 1]) F('#141416', cx + sx * m(1.35) - 2, gy(v) - m(0.9), 4, m(0.8));
  for (const [a, b] of [[1.5, 2.3], [11.7, 12.5]]) F('#3a3a40', cx - m(1.45), gy(a) - m(1.2), m(2.9), gy(b) - gy(a));       // the end platforms
  F(ROOF, cx - m(1.45), gy(2.3) - m(4.0), m(2.9), gy(11.7) - gy(2.3)); F('#5e5a58', cx - m(1.45), gy(2.3) - m(4.0), m(2.9), 2);
  F('#7a5a3a', cx - m(0.3), gy(2.3) - m(4.0), m(0.6), gy(11.7) - gy(2.3));                       // the roof walk
  for (const sx of [-1, 1]) { const bx = sx < 0 ? cx - m(1.85) : cx + m(1.45); F(RED, bx, gy(6.3) - m(3.2), m(0.4), gy(7.7) - gy(6.3)); F(RED2, bx, gy(7.7) - m(3.2), m(0.4), m(3.2)); F('#9ab8d0', bx, gy(7.7) - m(2.6), m(0.4), m(0.7)); }   // bay windows
  F(RED, cx - m(1.45), gy(11.7) - m(4.0), m(2.9), m(4.0)); F(RED2, cx - m(1.45), gy(11.7) - m(0.4), m(2.9), m(0.4));     // the south end
  F('#2a2226', cx - m(0.4), gy(11.7) - m(2.6), m(0.8), m(2.2)); F('#9ab8d0', cx - m(0.3), gy(11.7) - m(2.4), m(0.6), m(0.6));
  F('#9ab8d0', cx - m(1.2), gy(11.7) - m(2.5), m(0.5), m(0.6)); F('#9ab8d0', cx + m(0.7), gy(11.7) - m(2.5), m(0.5), m(0.6));
  F(ROOF, cx - m(1.55), gy(11.7) - m(4.1), m(3.1), 3);
  F('#d8c040', cx - m(1.45), gy(12.5) - m(1.1), m(2.9), 1); F('#d8c040', cx - m(1.45), gy(12.5) - m(1.1), 1, m(1.0)); F('#d8c040', cx + m(1.45) - 1, gy(12.5) - m(1.1), 1, m(1.0));
  F('#2a2a30', cx - m(1.45), gy(12.5) - m(0.3), m(2.9), m(0.3));
}
Object.assign(MUS_EX, {
  churn: { l: ['A dash churn. You worked the dasher up and down until the cream turned to butter.'] },
  digger: { l: ['A horse-drawn potato digger. Its blade lifted the row, and the shaker behind it let the dirt fall through and left the potatoes on top.'] },
  sled: { l: ['A logging sled loaded with logs. The numbers marked on the log ends are the board feet in each log.', 'Logging crews hauled loads like this out of the woods over iced roads in winter.'] },
  snowshoes: { l: ['Snowshoes: rawhide laced across bent wooden frames.'] },
  fish: { l: ['A mounted muskellunge, Wisconsin\'s state fish.'] },
});
