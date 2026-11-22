# The Unwritten: rebuild (started Nov 10, 2026)

Christian, Nov 10, 12:40 pm: "We are going to have to rebuild the game, it's a bit too much and chaotic at the moment. Start with the town rebuild." Then: "We need to work on the main quest with me, but we can build up the town with all the data we have like a GIS game first to build the world. Worldbuilding here is the real world."

## Decisions (Nov 10)
- **Scale: hybrid.** A real-scale town (4 m per tile) for travel and the map layers; downtown and key places become larger, detailed JRPG-scale areas you walk into.
- **Rebuild: fresh core, port content.** A new, small, clean engine; art, research, text and the best systems from v0.36 (`/home/claude/figtree`, live at the old artifact) come over one at a time, each tested.
- **First rebuilt version includes:** the main story (written with Christian), sandbox exploring, forests and foraging, and town life systems.
- **Order:** the world first (a GIS game of real Antigo), then the main quest with Christian.
- **Townspeople sprite sheet: not used for now** (Christian, 12:48 pm). Curiosity's fairy sheet is used for the player.

## Rebuild 0.1 (Nov 10, ~12:55 pm), artifact https://claude.ai/artifact/Q6EWiSJ1ZiArzy3V6e31bH
- **Data pipeline** (`/home/claude/scripts/town/`):
  - `build_town.py`: 5,360 real buildings. OpenStreetMap outlines (701, newer and named) plus Microsoft US Building Footprints (2021, uploaded by Christian) for the rest; attached downtown rows split into storefront strips along 2025 parcel frontage; parcel class and organizational owners (private owners never named); 2017 county address points; the checked business list (132 of 138 placed; invented businesses dropped); type by evidence; door faces the street named in the address. Output: `town.json` and `figtree/reference/antigo_buildings_2026-11.geojson`.
  - `make_tiles.py`: 1,452 x 1,937 tiles at 4 m (WTM83/91); land use (county 2025), OSM water, woods, parks, pitches, parking, sidewalks, roads by class, rail; 5,056 buildings with doors. Cemeteries are plain lawn with no label. Output `js/data/town.js` (1.26 MB).
  - `proj.py` (WTM83/91 without libraries), `preview.py` (review renders).
- **Engine** (`js/core/`): `base.js` (screen, text, windows, input with gamepad, fixed-step loop, modes), `town.js` (decode, collision, procedural tiles: pitched and flat roofs, storefront walls on the facing side, awnings, doors, curbs, sidewalks, rail, water; labels without overlap), `play.js` (Curiosity, smooth walking, dialog and choices, looking at buildings, save), `screens.js` (title, whole-town map with zoom).
- Tests: `tools/shot.py` (screenshots, page errors).

## Rebuild 0.2 (Nov 10, ~1:05 pm): buildings drawn whole, smooth streets
- Christian: "it needs some serious polish with how the graphics represent each building."
- `js/core/buildings.js` (new): each real outline (simplified to 0.4 m, exported by make_tiles.py) is painted once into a cached image in 3/4 view.
  - Walls rise on every edge facing the viewer. Heights and materials come from the building type: brick storefronts with display windows, upper windows and awnings; siding houses with windows and shutters' trim; garages with doors; churches with arched windows and a steeple at the street end; schools, hospitals and civic buildings with window bands; factories with ribbed metal.
  - Roofs follow the footprint. Flat commercial roofs get a parapet, gravel and rooftop units; pitched roofs get a ridge along the long axis, a lit and a shaded side, shingle courses and chimneys; barns get gambrels.
  - Doors sit on the street-facing wall. North-facing storefronts show their awning along the roof edge. Shadows fall to the southeast.
  - Buildings and the player are drawn in depth order; a building in front of Curiosity turns see-through where it would hide her.
- Streets, sidewalks, service drives, rail, footpaths, streams and parking lots are drawn as smooth shapes from the OpenStreetMap centre lines (curbs, asphalt, yellow centre dashes on main roads), so diagonal streets no longer stair-step. Collision stays on the 4 m tiles.
- Published 1794337416-d1fe.

## Rebuild 0.3 — squared buildings, straight streets (2026-11-10)
- Every footprint is squared (scripts/town/square.py). It finds the building's main angle and snaps it to the street grid when it is within 12°. Simple shapes become clean rectangles. L- and T-shapes are traced on a 1 m raster, so all their corners are 90°, with small stair steps collapsed. Parking lots are squared the same way.
- Streets are straightened. Each way is split into straight runs. Runs within 7° of the grid axis are snapped, and runs of the same street within 6 m are averaged so the two halves of a street line up. Each way keeps its own line at shared nodes, so real jogs stay crisp instead of slanting.
- Slivers are folded. Strip splitting and the lot pass left some 3–4 m strips wedged into downtown rows, many of them typed "garage". A sliver that shares its long wall with a neighbour is merged into it. The named or business building survives, and two named businesses are never merged. 23 were folded, leaving 5,337 buildings.

## Rebuild 0.3.1 — store units and street widths (2026-11-10)
- Buildings that cover several lots are now split along the real lot lines (rasterised at 0.5 m in the building's own frame), not along straight strips. This replaces the strip split. 79 footprints became 200 units.
- The Fig Tree is now its own unit, from county parcel 800 5th Ave: about 8 m of frontage on 5th Ave at the Clermont St corner, about 27 m deep. 802 5th Ave is a separate unit that wraps around its north side.
- Street straightening now uses complete-link clustering. The old single-link chaining had pulled downtown 5th Ave 13 m south, onto the lots, which left grass where the street should be. Runs that are more than 2 tiles off straight keep their real line.
- Road width now follows the OSM lane count where one is given: 3.6 m per lane plus 5 m for parking. Downtown 5th Ave (4 lanes) is about 19 m wide and gets a centre line.
- On north-facing buildings the door now shows as a front step at the roof's far edge, instead of a brown stub sitting on the street.

## Rebuild 0.3.2 — the Fig Tree storefront, from Christian's photo (2026-11-10)
- paintFigFront (buildings.js) draws the Fig Tree's own front, using reference_fig_storefront.jpg:
  - Lower floor: dark green-gray lap siding, white-framed windows with OPEN and BOOK neon, a cedar knee wall, book racks and a shelf on a small deck.
  - Corner: the open door on the cut corner, with the 800 plaque.
  - Canopy: white wraparound soffit under a copper-toned pent roof.
  - Sign: the hanging open-book sign with the fig tree.
  - Upper storey: tan lap siding with the old brick pilaster and arch.
- The Fig Tree's door tile is now its corner tile.
- Downtown Fifth Ave streetscape:
  - A red concrete band along the curb.
  - Black lamp posts with bell lamps every 6 tiles, skipped at cross streets.
  - A hydrant, bench and trash can by the Fig Tree corner.
  - Props draw in depth order with buildings and the player (PROPS, visibleProps, drawProp).
- Labels on south-facing buildings now sit on the roof edge, so they don't cover the storefront.
- Known limit: lamps on the south side of the street are hidden behind the roofs of the north-facing row. That is inherent to the 3/4 view.

## Rebuild 0.4 — the kid, the aerial (2026-11-10)
**Decisions (Christian, 13:48–13:58):**
- The main character is a kid, girl or boy, and the player picks which.
- A Standard / Mature choice at the start. Mature makes the inward fights hit harder: horror, drinking, grief, and faith argued hard. Hard line in both modes: nothing romantic or sexual ever involves the kid. Romance-genre tropes stay stories the kid sees through.
- No fairy in the town: the town stays grounded. Fantasy appears only when the story goes inward, and the inward fights are the Jungian ones. Curiosity's sheet (assets/fairy) is kept for those places.

**The kid:**
- Christian's two sheets (reference/kid_*_sheet_source.png) are cut by /home/claude/scripts/kid/cut_kid.py:
  - The background is keyed out at a low threshold so the dark outlines survive.
  - Box-downscaled to a 32 px walker, about two tiles tall (Chrono Trigger field scale).
  - One 32-colour palette per kid.
  - The walk sheet has rows down, up, left and right, 5 frames each, in 30×36 cells.
  - The poses sheet holds 25–26 story and battle poses at 72×44.
- The new-game screen "WHO ARE YOU?" has: KID (girl or boy), NAME (typed; defaults Wren and Eli), STORY (Standard or Mature), BEGIN. There is a three-times-size preview that turns and walks.
- Saves are now v3, with `kid` and `mature`. Old v2 saves upgrade to the girl.
- Open question: the kid is nearly as tall as a storefront wall, so building heights should probably go up about 1.4× to match the new scale.

**The aerial:**
- Christian uploaded the WROC 2025 orthophoto (1 ft, RGB, JPG with no world file).
- /home/claude/scripts/aerial/register.py placed it by matching its road mask to OSM: north-up in WTM, 0.3048 m pixels, X0 583776.2, Y0 524202.7, about ±2 m. Details are in /home/claude/aerial/georef.json, and the overlay check is /home/claude/aerial/overlay_downtown.jpg.
- make_tiles step 4b turns green tiles into the new tile type PAVED (14) where the photo shows even, low-saturation grey: lots, alleys and drives. That was about 56,000 tiles.
- The aerial has no near-infrared band, and it's spring with the trees bare, so tree canopy isn't classified yet.

## Rebuild 0.4.1–0.5 — the Almanac, FF6 scale, the kid as drawn (2026-11-10, 2 pm)
- **The Almanac is back** on the title screen, and at the `#almanac` link: all 25 pages from v0.36 (js/core/almanac.js), every page open. Leaves in the world come back later.
- **FF6 scale everywhere.** Christian: "keep the same style everywhere." FF6 field sprites are 16×24, so one 16 px tile is about 1 m.
  - base.js sets PM = 16 px per metre. A 4 m data cell is T = 64 px.
  - The ground is drawn as one-metre texture tiles.
  - Buildings use real heights: a 1-storey house is 3.2 m, a 2-storey house 5.8 m, a downtown store 7.5 m, a church 8.5 m plus its steeple, a garage 2.7 m.
  - Doors are 1 m × 2.2 m. Store windows, sign bands, cornices and awnings are all sized in metres.
  - Buildings are drawn straight to the screen each frame, with world-anchored pattern textures. A full walk frame takes about 3 ms to draw.
  - The kid walks on a one-metre grid (G.x and G.y are metres; saves are v4, and older saves convert). Walking is 12 frames per metre; holding B runs at 6.
  - Collision is the real building outline (point in polygon), plus water and woods.
  - The Fig Tree front was redrawn at the new scale.
  - The map (M) now has a cursor: A rides you there, C zooms.
- **The kid as drawn.** Christian sent the boy as a true pixel sheet (4-frame walk down, up and left, plus 8 poses, on #FF00FF). He asked: "could you just keep what I gave you?"
  - scripts/kid/keep_sheet.py only crops each frame and clears the pink background. It never redraws or resamples his pixels. The right-facing row is his left row mirrored.
  - The game draws his 8× art at 1/8 size, at the screen's full pixel density.
  - The earlier pixel-snapping cutter (cut_pixel_sheet.py) got about a fifth of the face pixels wrong, so it is not used.
  - The girl is still the earlier soft sheet, shrunk, until Christian sends her in the same 16×24 format.

## Rebuild 0.5.1 — trees, FF6 finish, north fronts (2026-11-10, 2:30 pm)
- **Trees from the aerial** (make_tiles step 4c). In the May 2025 photo, evergreens show dark and green, and bare deciduous crowns show as a rough, warm-grey texture.
  - Only open ground counts, never a cell touching a building. That gives about 101,000 cells, one crown per 4 m cell, stored as RLE rows in TOWN.TR.
  - They're drawn as FF6-style sprites: deciduous crowns built from clumps with a dark outline, evergreens as stacked tiers. They depth-sort with the kid, turn see-through in front of her, and their trunks block.
- **FF6 finish on buildings:** dark outlines on wall ends and roofs, a shadow under the eaves, and a heavier base line.
- **North-facing fronts:** from above you now see the awning reaching over the sidewalk, a lettered sign board on the parapet, and shop light on the pavement.
- **Front-view cards:** press A at any shop or public building to get an FF6-style painted card of its front, as seen from its sidewalk. This works for north-facing fronts too.
  - Cards are generated from the building's style. The Fig Tree card uses the photo painter.
  - Christian chose "no preference" among front cards, turning fronts to the camera, or flipping the view, so front cards were kept as the default.
- **Next — landmarks recognizable from photos** (Christian, 2:28 pm). Each landmark gets its own painter, like paintFigFront, for both the street front and the card, built from his photos.
- **Data fix needed:** "Cavalry Lutheran Church" should be "Calvary". The typo comes from the business list.

## Rebuild 0.5.2 — grid town (2026-11-10, 2:35 pm)
Christian: "stick to the aerial maps of the town and make them work, keep a grid design, the diagonal buildings don't work well, get close to the originals but the game world has to be coherent and sane."
- **Every building is on the grid.** square(grid=True) squares each building in its own frame, then keeps it axis-aligned at its own centre, with its real size kept. Before, only buildings within 12° of the grid were snapped.
- **No overlaps, nothing in the street.** Street carriageways (less 0.5 m each side) claim their 1 m cells first. Then buildings claim theirs in order of importance: named places first, then by size. Each later building keeps only the free cells, re-traced to a right-angled outline. 73 buildings were trimmed and 55 duplicate outlines dropped, leaving 5,307 buildings.
- **Checked against the WROC aerial.** Downtown and a residential block line up with the real roofs (/home/claude/scripts/aerial/overlay_game.py <cx> <cy> <half-metres> <out>).
- **Known gaps:**
  - A few houses visible in the aerial are missing from the 2021 Microsoft footprints. Roofs could be detected from the photo next.
  - Diagonal streets, like the railroad corridor and the angled roads on the edge of town, stay diagonal because that's where they really run. The buildings along them are now on the grid.

## Rebuild 0.5.3 — the map at half size (2026-11-10, 2:43 pm)
- Christian: "Shrink the map by half."
  - One 16 px tile is now 2 m of real town (PM = 8 px per metre; a 4 m data cell is T = 32 px).
  - The kid keeps his sprite size and steps one 16 px tile, which is 2 m (CELL = 2; CPD = 2 walking cells per data cell).
  - He walks 1 px a frame (16 frames a step) and dashes at 2 px a frame holding B, like FF6.
  - Saves are v5, with positions in walking cells; v4 saves convert.
- Doors keep a character-scale minimum (14 × 26 px), so the kid still fits through them. Tree sprites scale with PM.
- The town now shows about twice as much per screen, and every distance takes half the steps.

## Rebuild 0.5.4 — faster walking (2026-11-10, 2:56 pm)
- Christian: "The characters feel way too slow." Walking is now 8 frames a step (2 px a frame, about 7.5 tiles a second); holding B dashes at 4 frames a step. The walk animation speeds up while dashing.

## Rebuild 0.5.5 — the map at a quarter size (2026-11-10, 3:19 pm)
- Christian: "Shrink the map by another half." One 16 px tile is now 4 m of real town (PM = 4), the same as one cell of the town data (T = 16, CELL = 4, CPD = 1). The kid steps one whole cell at a time. Saves are v6 and older saves convert.
- At this size trees no longer block movement (a 4 m cell is too big to lose to one trunk). Chimneys, rooftop units, roof outlines and eave shadows scale down with the map. Doors are at least 6 × 10 px and never taller than their wall.

## Rebuild 0.5.6 — Fifth Ave flush (2026-11-10, 3:31 pm)
- Christian: "the buildings on 5th ave should be flush." In make_tiles, before the overlap pass, downtown Fifth Ave (the Fig Tree x range, -76 to +54 cells) becomes a street wall. On each side of the street, every storefront within 2.5 cells (10 m) of the median front line has its street edge moved onto that line; 62 fronts were lined up. Gaps under 10 m between neighbours close, each neighbour reaching halfway. Cross streets and wider lots stay open. The aerial overlay (/home/claude/aerial/game_fifth.jpg) still matches the real fronts.
- The north-facing sign boards are now plain colored boards, because the clipped lettering duplicated the labels.

## Rebuild 0.6 — phone controls (2026-11-10, 7:11 pm)
- js/core/touch.js, shown only on touch screens:
  - An SNES-style D-pad you can slide your thumb around on.
  - A and B buttons; hold B to run.
  - Two pills that relabel by screen: MAP/SAVE while walking, BACK/ZOOM on the map.
  - A tap on the game is A, for paging through dialogue. Buttons give a light buzz where the phone supports it.
- Phone upright: the game sits at the top and fit() keeps 230 px below it for the pad. Phone sideways: the pad floats half see-through over the sides.
- The name row on the new-game screen opens the phone keyboard when you tap A. The walk hint reads HOLD B TO RUN on phones.
- Tested in iPhone 13 emulation, upright and sideways: the touch D-pad walked the kid 7 tiles in 0.8 s.

## Rebuild 0.6.1 — Superior Street lines (2026-11-10, 7:18 pm)
- Christian: "Fix the lines in Superior Street to match the aerial photos."
- OpenStreetMap draws downtown Superior as two one-way lines about 9 m apart, so the game drew two overlapping streets, each with its own yellow centre line. The 2025 aerial shows one street about 18-19 m wide: two lanes each way around a centre turn lane.
- make_tiles now joins paired one-way lines of the same street (parallel, 0.8-3.5 cells apart, overlapping) onto one shared centre line with the whole width (18.5 m), marked "turn". Every 4+ lane two-way stretch of Superior gets the same marking. VEC entries now carry lanes, oneway and a marking.
- Drawing a "turn" street: a solid yellow line with a dashed yellow line inside it on each side of a 4 m centre lane, and white dashed lane lines 5.6 m out. Street markings now stop at intersections: where a street end meets another street, the box is cleared to plain asphalt. One-way streets no longer get a yellow centre line.
- The same joining also fixed paired one-way lines on Neva Road and Century Avenue.

## Rebuild 0.6.2 — Flock cameras marked (2026-11-10, 7:22 pm)
- Christian asked to mark the "flak" (Flock) cameras. The OpenStreetMap extract has 4 nodes tagged surveillance:type=ALPR, manufacturer=Flock Safety, each with the direction it faces: two on Neva Road on the north side, one by Superior Street downtown near Associated Bank and Christ Central, and one on the south side of town. make_tiles exports them as TOWN.CAM.
- On the street: a slim pole with a small solar panel and a camera box turned the way it faces. Press A next to one for a neutral note. It says what the camera does, then one sentence each for supporters (stolen cars, missing people) and critics (how long data is kept, who can search it). It adds that some Wisconsin towns dropped them while others kept them under new rules, and that the spots come from OpenStreetMap. No operator is named because the data gives none.
- On the map: red markers, a PLATE CAMERAS (4) legend, and a label under the cursor.
- These are volunteer-mapped spots, so cameras missing from OpenStreetMap are missing here too.

## Rebuild 0.6.3 — Christian and Robin playable (2026-11-10, 8:14 pm)
- Christian: "bring back my sprite and the Antigo Robin sprite as options for the boy and girl for now. Do not alter them."
- assets/christian/sheet.png and assets/robin/sheet.png are byte-for-byte copies of the v0.36 files (checked with cmp). The game uses their own 4-frame field walks (f_walk_down, up, left and right; frame boxes copied from v0.36 sheets_data.js). They are only drawn smaller, 1/1.5 with smoothing at full screen density, so they stand at about kid height.
- The new-game WHO row now cycles GIRL, BOY, CHRISTIAN, ROBIN. Default names are Wren, Eli, Christian and Robin. kidFrame now places every sprite by its feet (centre x, bottom y), whatever its frame size.

## Kinesiology for Danny (2026-11-10, 8:46 pm)
- Christian sent Floyd & Thompson, *Manual of Structural Kinesiology* (2023 ISE). I read the structure and the key chapters: 1-3 foundations, the chapter 11 core section, and all of chapter 12 (conditioning principles and its 14 exercise analyses).
- reference/kinesiology_danny.md (also the project doc claude/kinesiology-danny.md) covers:
  - the Body Map: eight regions, one per chapter 4-11, each leveling separately and feeding the seven stats;
  - Danny training rules as game rules, from chapter 12 (overload/FITT, progression and recovery with a SORE status, early nerve-driven gains to DEX, SAID/specificity, periodization by season, the breath-holding warning, skill phases, open and closed chain);
  - 14 exercise cards with prime movers by phase, plus the "form check" minigame;
  - the mats through chapter 3 (balance factors as BJJ base, levers as joint locks, Newton for striking, phases for strikes);
  - a 12-lesson curriculum, and safety and voice rules.
- js/data/kines.js holds the same data for the game. It is not loaded yet; it goes in when the UMA gym is ported into the rebuild.
- All of it is paraphrased: no book text, tables or figures are reproduced.

## Fig Tree interior (v 1794365865-890a)
- js/core/inside.js: MODES.inside, three floors (main, up, base), each 8 x 27 tiles = the store's game footprint (8 m on Fifth x 27 m deep, 1 tile = 1 m).
- Enter: A facing the corner door, or walking up into it (figDoorAt in play.js; the door sits half on the sidewalk at the 4 m step). Exit: the mat 'e' at the front-right corner.
- Stairs: main U(6,1) -> up (6,2); main V(1,1) -> base (1,2); back via d/u. Layouts are placeholders until Christian sends floor photos.
- Christian stands behind the counter at (5,17), his own v0.36 idle frames, unaltered, k 1.5; hidden if the player picked Christian. The counter opens the Almanac (ALM_RETURN brings you back inside).
- Basement: stone goose statue from assets/goose/dungeon.png frame 0, greyed by canvas filter (file unaltered). Story hook for later.
- Save: G.inside {f,x,y}; Continue resumes inside.

## Bigger scale (v 1794366173-0749)
- Christian: "increase the game size slightly so the sprites don't have to be altered as much".
- PM 4 -> 6 (T = 24 px per 4 m cell); screen 320x240 -> 384x288 so the view still holds 16 x 12 tiles.
- Kid k: christian 1 and robin 1 (exact pixels, no scaling); boy 16/3 (was 8); girl 2/3 (placeholder, upscaled).
- Interior tiles IT = 24 (1 m); tile art still written on a 16-unit grid and drawn through Q() with whole-pixel rounding. Christian NPC at k = 1, goose at 1/2.
- Ground textures: 16 px tiles cut to fit the 24 px cell.

## Outdoor scale up (Nov 10, later)
- "make the map outside slightly bigger too": PM 6 -> 8, T = 32 px per 4 m walking step. Indoors unchanged (IT = 24 px per metre).
- drawKid takes the tile size underfoot (ts), so the store passes IT.

## No see-through on the kid (Nov 10, later)
- Christian: "make sure it doesn't clip through him, I am getting a lot of background in his body" (the Robin, behind roofs).
- drawBuildingsWith: anything drawn after the kid that overlaps her box (buildings, or trees/lamps/cameras via overKid) sets covered;
  those stay at 45% around her, then the kid is drawn again on top, solid (drawKid noShadow). Player box widened to 40 x 52 for the
  wider sprites. The Robin sheet itself is untouched (it has a few 2-13 px gaps per frame, as drawn).

## Christian re-cut, battle teaser, Clermont neighbors (Nov 10, late)
- Christian: assets/christian/field.png cut from figtree/tools/src/christian_sheet.png by scripts/kid/cut_from_source.py
  (edge-connected background only; 0 holes; no resampling). Drawn at k 2.3. Counter row redrawn in depth order so it hides his legs.
- Battle teaser video: scripts/battle_video/ (cut.py frames from the original sheets; render.py; audio.py original chiptune).
  v2: Robin idle mirrored to face the monster, punch unmirrored, tighter background tolerance (legs kept);
  Danny cut from his file's own alpha with the pale halo trimmed (no white between legs).
- js/core/npcs.js: Jeremy (first name only; he asked publicly to be in the game) out front of his house on Clermont, talks
  about the season's weather by the player's date and hour; his two girls (unnamed) wander a 2-cell yard area. No address shown.
  Sprites: assets/npc/{dad,big,small}.png via scripts/kid/cut_family.py. NPCs are depth-sorted props, block movement, face you to talk.

## Party picks + Tater Thug (Nov 10, late)
- NEW GAME choices: Christian, Danny, the Robin (KID_CHOICES); girl/boy kept in KID_META for old saves.
  Danny and the Robin walk frames cut from their original sheets (scripts/kid/cut_party_field.py): danny k 2.15, robin k 2.25.
- Jeremy greets each pick by name.
- Monster stills: assets/monsters/potato.png (Christian's still, background cleared only). Battle teaser re-rendered with it as
  TATER THUG (placeholder name): flash/shake on hits, blink before acting, fade + light when freed.

## Consistent sizes (Nov 10, late)
- "our sprites get smaller when they move and do certain moves": the AI sheets draw rows at different scales (Christian's walk row
  ~79% of his standing row, Danny's run ~83%). Each row is now scaled by sqrt(median opaque area / standing row's area).
  Game: Christian walk k 2.3, idle (shop counter) 2.9; Danny walk 2.38; Robin walk 2.58. Video: render.py set_ratio().

## UMA Martial Arts on Fifth (Nov 10, 22:05)
- The old game's gym footprint (OSM way 1177704288, 45.140845 / -89.155819) lands on the county's 832 5th Ave storefront
  (2 cells west-east x 31 m deep); that building gets the sign "UMA Martial Arts" at load (npcs.js). Address match to confirm with Christian.
- Danny stands on the sidewalk beside the door (his own field frames, k 2.38). Talk: welcome, ANY TIPS? / SEE YOU AROUND.
  Hidden when the player is Danny. Interior not ported yet.
- Sign: assets/signs/uma.jpg (the gym's logo as Christian sent it, unaltered), drawn on the 832 5th Ave front wall above the
  storefront with a thin frame (npcs.js drawUmaSign, wraps drawBuilding). Label renamed "Unified Martial Arts".

## Inside Unified Martial Arts (Nov 10, 22:09)
- inside.js floors uma1 (WEIGHTS) and uma2 (MATS), 10 x 31 tiles = the 832 5th Ave footprint (10 m x 31 m). Door at (7,30) under the
  real door cell; stairs U (1,1) <-> d (1,1), landing (2,1). Floor style 'rubber'; mats 'M' walkable; gym logo on the mat room's back wall.
- Floors now carry place/bld/style/links; figTile and draw use each floor's own size. doorEnter() in play.js handles both doors.
- Danny moved from the sidewalk to the front desk (5,25); the desk row is redrawn in depth order. Talking shows his portrait
  (assets/danny/portrait.png, the framed portrait from his sheet as given) at the left of the dialog box: sayFace/askFace.

## Jeremy the local champ + the mat room from the photo (Nov 10, 22:12)
- Jeremy (first name only), Christian's MMA sheet: guard + punch frames and portrait (scripts/kid/cut_champ.py; white cleared from the
  edge, enclosed white gaps removed, greyish-white fringe trimmed 3 px). On the mats at (7,10) working the bag at (8,10): combo, jab
  lands at tick 24 and the bag sways, then a breath in guard; 150-tick loop. Talk shows his portrait (askFace 'champ').
- Mat room restyled after Christian's photo: dark green mats with a white circle and line, black wall pads (tile p), the gym's
  name painted across the back wall in its flag colours, the logo on two pads, a chain-link cage at the back (C), black teardrop bags.
- Correction (22:16): UMA is one floor and a basement. uma1 = MATS (you walk in here; Danny's front desk, Jeremy on the bag, cage,
  gym name on the back wall; stairs V at (1,1)). uma2 = WEIGHT ROOM basement after Christian's photo: block walls (b), green carpet
  with black rubber under the equipment (style 'carpet'), mirrors on the right wall, white power racks, dumbbells, benches, cable
  machines (q), treadmills (n), ellipticals (l), warm dim light; stairs u at (1,1).
- Jeremy's white rim (22:30): cut_champ.py now peels light edge pixels (luminance > 120) up to 6 times, so every frame's rim is his
  dark outline. 0 light rim pixels left.

## Champ renamed (Nov 11, 15:24)
- Christian: remove Jeremy the champ; "Have him be Big Ego Champ" with the line about asking before using his likeness
  (Christian typed "lioness"; read as "likeness"). No name anywhere in the game, portrait removed from the game and the artifact.
  The bag-work sprite is still cut from that sheet; replace it if the real person wants out entirely.
- Nov 11, 17:04: "Have the sprite photo removed." The champ is gone from the gym (champHere() false), assets/champ/fight.png
  deleted locally and from the artifact. The heavy bag hangs on its own. scripts/kid/cut_champ.py kept but its outputs are gone.

## Geography first (Nov 12)
- Calvary Lutheran Church (310 S Superior St): OSM spells it "Cavalry"; NAME_FIX in build_town.py, town.js patched.
- Missing houses: tried finding them from the WROC 2025 photo alone (scripts/aerial/find_houses.py: smooth, non-green blobs in
  residential/commercial parcels, away from known outlines). Leaf-off woods and then parking lots swamp it; without height,
  pavement and flat roofs look the same. Next: the 2017 county lidar (first return minus bare earth) for outlines and heights.
- County 2017 address points are not building locations (many sit on vacant lots or at the road); do not use them to make houses.
- web.s3.wisc.edu / gisdata.wisc.edu were still blocked in this chat after Christian allowed them (needs a new chat).

## The real town, from open data (Nov 12, night)
- Terrain: USGS 3DEP 1 m DEM (Langlade 2017, tiles x32-33 y500-501, rockyweb) -> scripts/terrain/dem_town.py -> js/data/terrain.js
  (deflate+base64, 1 byte/cell: hillshade tone 0-6 from 8 m-smoothed relief x2.5, +8 for steep banks >= 20 deg in runs of 6+;
  elevation 0.5 m steps). town.js drawTerrainLayer: one smooth layer (pixel per cell, scaled with smoothing) + ledges on banks.
- Lidar points: USGS public EPT copy (s3 usgs-lidar-public/USGS_LPC_WI_Langlade_2017_LAS_2019) to depth 8, 44 M points
  (scripts/lidar/ept_fetch.py, lidar_raster.py). rockyweb LAZ downloads were rate-limited (429).
- scripts/lidar/attach.py in build_town step 1b/5b: 314 buildings the footprints missed (lidar class 6, >= 35 m2, grid-aligned,
  >= 4 m wide, not long-narrow vehicles, still roofed with a shadow in the 2025 photo); every building gets lh (p90 height),
  lflat, rc (median 2025 roof colour). bstyle uses them (walls 80% of peak on pitched roofs; roofTone snaps colours).
- Landmarks (js/core/landmarks.js): the five NRHP places by point-in-outline; styles from public-domain Commons photos; photo
  postcards (assets/landmarks, 192x144, 40 colours) on the dialog; courthouse tower over the west entrance; museum portico.
- Water: OSM lakes/riverbanks as smooth outlines (TOWN.WA, simplified 1 m) with a mud bank and sand line; streams likewise;
  water tiles draw as grass beneath. Water line text fixed (Antigo Lake, not "mill pond").
- Not used, by rule: Google Street View, Zillow/realtor photos.
- 800 block (Nov 12, 22:41): Christian sent a street photo of 800 5th Ave. Used as reference for facts only (colours, features),
  nothing traced: 802 (the corner building the Fig is part of) buff brick with a corbelled cornice and finials (FACADES +
  drawCornice in landmarks.js); 808 next door white with large upper windows.
- 830s (Nov 12, 22:42), from a second reference photo (facts only): 836 white-painted brick, HILL in a stepped parapet, peach trim
  and diamond keystones, ribbed white metal band over the shop windows (drawPediment, drawMetalBand); 832 UMA brown brick with a
  shingled awning (the photo confirms UMA is at 832); 824 Harper's Mercantile red brick, dark awning, cornice.
- Edison & Fifth (Nov 12, 22:43), reference photo facing west: 902 (NW corner) coral-red brick over a grey ribbed metal storefront
  band with a coral sign box; 907 (SW corner) blue-grey. The photo's sign reads Pallet Pickers; the business list says Colleen's
  Craft Shed at 902: asked Christian which is current.

## Nov 12 (late): street-photo facades, block by block
- New js/data/facades.js: FACADES by address (or '@x,y' for unaddressed buildings) + applyFacades(). An address entry styles
  the tallest building at that address (fixes lidar houses the county typed as garages); `all: 1` styles every one.
- New painter features in buildings.js: house porches (full/L/R/C, posts, rail, lattice), stone bases, garage doors,
  window awnings; storefront window-door-window (`shop: 'wdw'`), upper-window count, recessed panels, parapet accents,
  rounded plaque parapet, chimney stack, corner piers, a different lower storey (baseCol/baseMat), classical bank front (`temple`).
- Unified Martial Arts is now one storey, window / glass door / window, stone accents in the parapet (owner's photo).
- Renames from signs/official listings: 1004 footprint -> Pavek's Antigo Bakery, 1012 5th Ave (Chamber); 918 Pampered Paws
  Pet Grooming (its sign); 1015 Hix's Hoffman House (Chamber); 1029 Antigo Family Chiropractic Center (NPI registry);
  716 Dixie Lunch (Chamber); 710's old label removed (the Fifth Avenue Restaurant is at 714, in the Dixie building);
  536 Lakeside Market (its sign).
- Street View orientation: the compass needle says which side is shown; the address label is the camera's nearest address,
  not necessarily the building in view. Two URLs carried camera coordinates (1524, 1635) and confirmed the mapping.

## Nov 13: sidewalks from the 2025 aerial
- OSM only maps sidewalks in the older core. scripts/town/sidewalks.py reads a cross-section of the WROC 2025 photo every 2 m
  along each side of every street: a 1.0-2.6 m bright grey strip, darker on both sides, with planted terrace (not asphalt)
  between it and the street (rules out shoulders and edge lines). Each side's distance is set from the photo's own street
  centre, so walks sit right beside the game's (straightened) streets. Gaps up to 24 m bridged; OSM-covered stretches,
  crossing streets and buildings cut out. Output js/data/sidewalks.js (13.6 km added), loaded after town.js.
- Limits: the aerial ends around cell row 1409 (far south edge); heavy tree shade can hide a walk.

## Nov 13: real trees from the 2017 lidar
- scripts/lidar/trees.py: 1 m canopy height model from class 5 (high vegetation) minus the 2 m ground; tops are local
  maxima (window 5/7/9 m by height); crowns by watershed, radius from crown area. 84k tops -> 33k kept: dropped where the
  2025 aerial now shows pavement/roof or smooth lawn (tree since removed), on streets/lots/water/pitches, inside buildings,
  and deep in woods (the woods ground draws those). Evergreen where the crown is still green and dark in the May photo.
- js/data/trees.js (TOWN.TP, flat x2,y2,r2,h,ev). buildings.js draws each at its own crown size and height
  (treeImgSized, cached by 0.5 m radius / 2 m height); trunks still block walking. Old photo-grid trees are the fallback.
- Trunks kept off walks and streets (owner, Nov 13): any trunk on a drawn street, alley, sidewalk/path, rail, parking lot,
  paved tile or building moves to the nearest clear ground within 3.5 m (2,259 moved), else is dropped (713). 32,345 trees.

## Nov 13: the Survey page (look at any building -> "Survey this place")
- Three pages from public data: THE BUILDING (address, kind, county property class, owner TYPE for non-homes, footprint,
  lidar height + storey estimate, flat/pitched roof + its colour in the 2025 photo, outline source, whether the look is from
  street photos), THE GROUND (USGS elevation, NRCS soil + farmland class, WGNHS glacial deposit, nearest named water,
  distance to the Fig Tree), THE NEIGHBORHOOD (2020 Census block-group people and homes, ACS 2020-2024 B25035 median year built).
- Privacy: homes get physical facts only; Census only at block-group level; no owner names, values or sales anywhere.
  Also fixed: the look line used to say "Owned by <owner>" for non-home buildings; now only public bodies, congregations,
  health care and utilities are named.
- Build: scripts/town/survey.py -> js/data/survey.js (121 KB). Inputs: town_z4m.npy, SSURGO WI067, WGNHS IC52 gdb,
  TIGER2020 tabblock20 (WI, POP20/HOUSING20; /home/claude/gisdata/census), ACS 2024 5-yr B25035 .dat, town.json, OSM.
  Census API needs a key now (api.census.gov -> missing_key); the www2.census.gov files don't.

## Nov 13: player-friendly town, from the JRPG books (real data underneath)
- Map (screens.js MODES.map, replaced in js/core/mapplus.js): street names along each street's longest straight run
  (OSM), place icons + names (js/data/places.js: 47 places from the county reference landmarks + OSM; no cemeteries),
  Fig Tree star, bus stops, water towers, plate cameras, legend, "Found n/47". M opens PLACES (sorted by kind, with
  distance); A rides there (parks/lakes: from their nearest street). A on a place icon rides to it too. Touch: PLACES/ZOOM.
- Walking: FF-style area banner when you reach a place ("NEW PLACE · n of 47 found", saved in G.visited) and a small
  street-name banner when you change streets; bobbing arrows over doors you can enter (Fig Tree, UMA).
- Street furniture (scripts/town/furniture.py -> js/data/furniture.js, js/core/furniture.js), all from OSM, fitted to
  the game's straightened streets: 38 painted crosswalks (marked/uncontrolled/zebra/signal crossings only), 8 signal
  poles at 4 signal intersections (lights cycle), 72 lamp posts, 380 green corner street signs (read with A),
  18 Langlade County Public Transit stops (read with A; no fast travel by bus, no schedules claimed),
  3 water towers: positions/heights from the 2017 lidar (50.7 m and 48.4 m spheres, 22.9 m legged tower), looks from
  the 2025 aerial (Water Tower Park: white sphere on a red-brown pedestal + older legged tower with tan tank).
- visibleProps: props with a 'reach' (towers) are drawn while their base is below the screen.
- Name fixes: BMO Bank (734 5th Ave), KFC / Taco Bell. Facade entries with only a name don't count as "from photos".

## Nov 13: missing homes, apartments, parking lots, cemeteries
- Missing homes (scripts/census/*): residential parcels on the 2025 tax roll with buildings but no home in the game (97),
  checked one by one on contact sheets against the 2025 photo. 84 outlines added through build_town step 1c
  (scripts/town/homes_added.json): 73 from Microsoft Global ML Building Footprints (2026-02 release, ODbL; downloaded
  quadkey 030220223 to gisdata/msgb), 5 from the 2017 lidar, 6 traced from the photo. 11 homes the old typing called
  garages/sheds retyped; one green-roofed pole building kept as a garage.
- 2020 Census blocks (HOUSING20) vs home buildings: the unnamed 'store' buildings in four apartment complexes,
  two manufactured-home parks and a few duplex blocks were retyped (51 apartments, 52 homes, 5 garage rows);
  each block checked on the photo (the grain elevator and shopping-centre blocks left alone).
- make_tiles 2b: developed home lots where the county's 2020 land use still said woods/farm are cleared to grass
  (3,225 lots); the lidar trees still stand where the real ones are.
- Parking (scripts/town/parking.py, run after make_tiles): 851 lots traced on the photo at 0.3 m (anything not
  vegetation inside the lot patch: pavement, paint, cars, shadows; buildings and streets cut out) replace the 4 m
  tile blocks (TOWN.PK); 28 OSM lots off the photo kept. Stall lines: Hough segments 3-7.5 m, thin and bright with
  plain pavement both sides, grouped into rows, stalls hidden under cars filled in at the row's spacing. 736 lines:
  PARTIAL - full rows of parked cars and faint paint are missed; next step is a period (FFT) row finder.
- Cemeteries back on the map (Christian: "Cemeteries can be added ... they are historical"): OSM outlines
  (js/data/cemeteries.js), headstone rows drawn in (js/core/groundplus.js), name + sourced note when you look, in the
  Places list. No grave is ever named. Notes: Elmwood - city set aside 80 acres in 1905 (Dessureau 1922), veterans
  memorial (HMDB 78878); Queen of Peace - Catholic cemetery; Bohemian - Czech cemetery society (FamilySearch 94815),
  Czech settlers came to Langlade County in the 1880s (WHS Turning Points).
- Pipeline order now: build_town -> make_tiles -> parking -> trees, survey, sidewalks, furniture, places, cemeteries.
- Historic graves (Christian: "Yes, add all the historic graves"): js/data/cemeteries.js now also holds CEM_HISTORIC (told
  in a "Historic graves here" choice when you look in a cemetery) and MEMORIALS (placed at their HMDB coordinates and
  readable): the 1905 Grand Army of the Republic monument at the Soldiers' Circle, Antigo Cemetery (HMDB 78924), and the
  Elmwood Veterans Memorial (HMDB 78878); both also in the Places list. People: Francis A. Deleglise in Queen of Peace
  (Wikipedia, Dessureau 1922), and the six settlers of the county's 2022 "Presenting the Past" tour of Antigo and Queen
  of Peace cemeteries (langladecounty.org). No individual grave is placed: no public source gives the plots.
  Queen of Peace and Antigo Cemetery notes use a Find a Grave volunteer's note (approved by Christian).

## Nov 13 (evening) — Colleen's Craft Shed, Water Tower Park, fields and woods
- 902 Fifth Ave is Colleen's Craft Shed (Christian). Water Tower Park: the legged tower was torn down, so only the sphere stands; it carries Christian's Robin art (first "down" frame of assets/robin/field.png, clipped to the tank).
- Fields: USDA NASS Cropland Data Layer 2025 (10 m), fetched from the CroplandCROS image service straight onto the town grid (gisdata/cdl/cdl_2025.tif). scripts/town/crops.py keeps it to cells the county already calls farmland or woods, takes the majority crop over 7x7 cells, merges slivers under ~1 ha, and reads row direction from the stripes in the May 2025 aerial (47 fields) or the field's long axis. Output js/data/crops.js (deflated bytes, class | 128 for north-south rows).
- js/core/fields.js draws midsummer textures for potatoes, corn, oats, wheat, triticale, barley, rye, dry beans, soybeans, alfalfa, clover, hay, pasture, Christmas trees, vegetables, fallow; woods as hardwoods, pines and spruce, mixed, swamp woods, brush, marsh. Grass margins at field edges, a furrow between crops. Looking at a field names the crop ("USDA crop map, 2025"). The town map colours fields by crop. The nassgeodata CropScape server failed TLS, so CroplandCROS was used.

## Nov 13 (evening, cont.) — parks and fields, ER entrance, parked cars, background life
- scripts/town/sports.py -> js/data/sports.js, js/core/sports.js: OpenStreetMap pitches drawn with real markings at real size: 14 tennis courts (green courts, nets), 3 basketball courts (one half court), 2 soccer fields, Schofield Stadium's football field (yard lines, hashes, goalposts), 2 sand volleyball courts, the Optimist Skate Park (generic ramps), 2 pools, the hospital helipad (OSM aeroway=helipad), the dog park fence. Six ball diamonds turned the way their skinned infields sit in the May 2025 aerial (home plate at the back of the dirt; on the big grass-infield field, the home-plate circle), 90 ft or 60 ft bases by field size, fences from the OSM outlines. 12 OSM playgrounds get wood chips, a play structure and swings (generic: OSM says where, not what). No beach or fairground track drawn: OSM has neither. The aerial photo has not been checked for them yet (correction: an earlier note said it had).
- ER entrance: a canopy on posts over the drop-off at the hospital's north-east corner (aerial: a separate lower roof with cars at it, off the Langlade Rd drive), red fascia reading EMERGENCY as in Christian's photo.
- scripts/town/parked.py -> js/data/parked.js: stall rows (lines of one angle on one line, median spacing) filled across gaps and carried outward while inside the traced lot, off buildings, clear of other rows (+446 lines). Cars from the photo: stalls whose middle differs from the lot's own pavement (80), plus single car-shaped blobs inside lots (strict; cars packed side by side merge and are skipped). 489 cars in their photo colours. Recall is partial by design; a looser window search was tried and gave too many false cars at lot edges.
- js/core/life.js: up to 12 cars drive the OSM roads (right lane, one-ways one way, stop for you and for the car ahead, hand off to a meeting way at a way's end); robins, sparrows, crows on lawns, geese near water, flying off when you come within ~4-6 m; a V of geese over town every minute or two; mallards on the lakes. No people.

## Nov 13 (night) — season and clock, signals, park details, map layers, speed, packed lots
- Correction: the aerial was checked for a beach and the fairground track. No beach at Antigo Lake, Lake Park or Remington Lake. The fairgrounds has a red clay oval (OSM has none): scripts/town/fairtrack.py traces it (outer and infield edges) -> scripts/town/fairtrack.json -> sports.py kind 'track', drawn even-odd.
- js/core/sky.js: sun height over Antigo from the real clock (NOAA approximation); night = multiply overlay, then lamp pools (OSM street lamps), lit windows (glass rects recorded through F during the frame; fewer after 11 pm), headlights and tail lights, a soft light around the player. Season from the real Antigo date: snow Dec 1–Mar 20 (by the calendar, not the weather), lake ice ~Dec 10–Apr 9, bare hardwoods Oct 21–May 14, fall colour Sep 26–Oct 20, harvest/stubble/tilled fields by crop and phase, dormant grass, snow on roofs and evergreens, thin shadows under bare trees. Robins leave for winter, geese need open water, no ducks on ice, birds roost at night. Preview with ?season=snow|spring|leafout|early|summer|late|color|bare and ?sun=<deg>.
- life.js: cars stop on red at the OSM-signalled corners using the same 17 s cycle the signal heads show (3 clusters), slow through junctions, and sometimes turn (30%) with no U-turns. OSM maps no stop signs in Antigo, so none are drawn or obeyed.
- scripts/town/parkbits.py -> js/data/parkbits.js, js/core/parkbits.js: 4 OSM flagpoles, the M60A3 tank on display, the OSM historic-locomotive spot (look text only; the photo shows a roofed structure), 3 OSM shelters with no building outline, 2 communication towers and a mast at lidar heights (74.6, 69.1, 53.5 m) with red lights, and the Remington Lake walkway (placed by eye from the photo; walkable). An automatic dock search mostly found bridge ends and stony shore, so it was dropped. OSM maps no benches or picnic tables.
- scripts/town/maplayers.py -> js/data/maplayers.js, js/core/maplayers.js: L / LAYER on the map cycles Town, Soils (SSURGO, 18 map units), Glacial deposits (IC52 plain labels), Elevation (lidar, 4-ft bands), People per sq mi (2020 Census block groups); a legend names what's under the cursor. 108 KB.
- js/core/speed.js: the terrain shading was rebuilt and smoothly enlarged every frame (~10 ms of a 17 ms frame downtown in headless Chromium). Now cached per 4 m camera step; pixel-identical; frames 17 -> 10 ms downtown, 12 -> 6 ms in the neighbourhoods.
- scripts/town/cars_ml.py: candidates = car-sized boxes along each lot's axes that differ from the pavement (443k); labels = the 489 cars already placed, 96 candidates marked by eye on a sheet from the hospital lot (24 cars), half-on-a-car boxes and weak boxes far from cars as negatives; HistGradientBoosting; boxes over 0.6 kept 2.2 m apart: +3,230 cars, checked on the hospital lot and downtown. Run order: parked.py, then cars_ml.py candidates/train/merge. Angled-parking rows (the hospital's east lot) are still missed: candidates only run along each lot's two axes.

## Nov 13 (late) — Cecil and the Respawn arcade, Tanner and the kayak trip
- Respawn Gaming Lounge, 725 5th Ave (Christian; respawnantigo.com and the county directory give the address). The parcel data has no 725, so it sits in the narrow storefront between Salon 731 and CR Realty (the '727 5TH AVE' footprint, shown as 725), styled from Respawn's own contact-page photo Christian sent: cream upstairs with two windows, red brick storefront, green-and-yellow striped awning (new facade key awnStripe).
- js/core/folks.js: Cecil and Tanner drawn in code (Christian chose "You draw them"), generic looks, first names only.
- js/core/arcade.js: Cecil on the sidewalk at Respawn. Menu: play a game (Doom with Freedoom, Racer, Hextris, 2048 in a full-window iframe with a Back to Antigo bar; Esc also closes), the retro gaming quiz (8 of 32 questions per round, best score in G.quiz.retro), what's at Respawn (from its website; hours left to the website).
- arcade/: doom.html runs EmulatorJS 4.2.3 (GPL-3.0; its source files joined unminified as emulator.min.js) with the PrBoom core (@emulatorjs/core-prboom 4.2.3, GPL-2.0) and Freedoom: Phase 1 0.13.0 (BSD; from Debian's freedoom_0.13.0-3 package, zipped to 10 MB). Racer (MIT, v4), Hextris (GPL-3.0; Google Analytics, two copies of an outside ad script, a score beacon and share widgets removed), 2048 (MIT). arcade/licenses.html lists each license and source. No outside requests from any game (EmulatorJS only checks its CDN for updates when run on localhost).
- js/core/kayak.js: Tanner on the store's main floor (2, 23). The kayak trip is a summer paddle on a made-up Northwoods lake (fixed seed, 360 x 264 m): basins, two islands, the east marsh with a beaver lodge, water lilies in the north bay, six logs of painted turtles (they slide off if you come in fast and climb back after 25 s), two common loons (surface 20-40 s, dive 8-16 s and come up 25-55 m away; within 22 m they dive at once), Tanner paddling ~10 m behind. Demands in order: three turtle logs, both loons, the lilies, the beaver lodge, a full circle of the big island; then the landing gives the reward. TANNER_LINES holds plain stand-ins for Christian to replace with Tanner's real words. Reward: GooseGoose's turtle outfit (drawn: shell with hex plates, a hood with eyes), saved as G.outfits.turtle; he wears it once the GooseGoose follower is ported. Trees there use summer sprites whatever the real season (treeImgSized.summer).
- Set aside (Christian): Tanner's second quest at his house (anime and manga quiz).

## Nov 13 (late, cont.) — inside Respawn, its own building, a neighbour pointing the way
- Correction: the county parcels do have 725 5TH AVE (x 767.56-769.57 cells, 8.1 m wide, 35.4 m deep). The footprint data had one outline for 721-725. scripts/town/split_respawn.py cuts it on the parcel line at 769.5 cells: the west 8 m becomes building 5704 (725 5TH AVE, no owner name), the east 11 m stays 721 / CR Realty; footprint area split by width (243 / 334 m2); TOWN.bid cells and a SURVEY.R row follow. Idempotent; run after make_tiles.py and survey.py. The Respawn facade is keyed '725 5TH AVE' now; 727 is plain again.
- js/core/respawn.js: the inside, 8 x 37 tiles at the interiors' 1 m tile (the building is 8 m x 37 m). Laid out from Christian's two photos and notes; photos used as reference only, nothing traced, no people from them drawn. Top of the screen is the back of the store (FF6 rooms are walked into from the bottom). Back to front: golf simulator (black curtains, teal turf, hitting mat, projector, a course on the screen that now and then replays a shot), game room (pool table, air hockey, foosball, three racing rigs on the wall, cue rack, yellow tape round the pool table), the long PC row on the left wall (14 stations: RGB towers on a wire shelf, monitors, black and red chairs, tape along the chairs), three offices behind wood-framed doors on the right, from the back: workout room (mirrors, squat rack, dumbbells, bench, treadmill, rubber floor), meeting room (round table, chairs, a bracket on the screen), classic gaming lounge (game shelves, tube TV with consoles, arcade cabinet, couch); then the console TV and beanbags in a taped play area, board games, a snack machine and a drink machine, the front desk (Cecil; RESPAWN on its front), a small lounge (couch, coffee table, armchair) and the front windows on Fifth with the awning's edge showing. Wood paneling, dark green patterned carpet, soft light pools for the drop-ceiling panels. Header names the room you're in.
- Cecil moved inside to the front desk (his menu is unchanged). PCs offer Doom, Hextris, 2048; the racing rigs Racer; the arcade cabinet Hextris and 2048; the tube TV the retro quiz and Doom. quizStart(who) takes the speaker.
- Door: faces north onto Fifth, so walking down into it (or facing it and pressing A) goes in; the mat at the bottom leaves, facing up on the sidewalk. The key has to be let go before the door takes you back in.
- js/core/inside.js: generic hooks so a floor can bring its own painter (paint), look lines (look), walking rule (free), way out (leave) and room names (zone). The bookstore and gym are unchanged.
- Across the street (Christian): a passerby with a beanie and a handheld game stands on the north sidewalk against the storefronts, facing Respawn, and says to go down and check out the gaming south of us. Not anyone real; drawn by drawFolk (new 'beanie' and 'handheld' extras). The lines are stand-ins for Christian.
- Labels: places you can go into get their name first (Respawn's label now shows). Map: Respawn Gaming Lounge added to places (category Games; places.py and places.js).
- Christian (21:44): desk on the right as you walk in; vending machines and the lounge chairs on the left by the entrance. Front rows now: snack machine (0,31) and drink machine (0,33) on the left wall, the couch along the left wall (0,34-35) facing right with the coffee table (1,34-35) and an armchair (2,35) turned to it; the desk at (4-6,33) with Cecil at (5,32); board games moved to the right wall (7,29-30); the door is tile 3 of the front row.
- Christian (21:55): the offices run right up to behind the desk. Office block now rows 13-31, each room 5 m deep: workout (rack, dumbbells, bench, kettlebells, two treadmills, mirrors), meeting (a long table with five chairs, the bracket screen), classic gaming lounge (game shelves, tube TV and consoles, two arcade cabinets, couch). The offices' front wall is right behind Cecil, with a split-screen TV on it. The console corner, beanbags and board-game shelf I had added in that gap are gone (board games are on the retro lounge's shelves). Wall faces now go into the depth sort on their own, so a wall never paints over the thing in front of it.
- Christian (21:59): day and night on demand. js/core/daynight.js: N (or the SKY button on a phone, shown in town and indoors) steps the sky through real time, day (sun at 40 degrees) and night (-20); the choice is kept on the device (localStorage unwritten2_sky) and a small SKY: ... note shows top right. A ?sun= preview link still decides the sky while it's on real time. Town hint reads B: RUN  M: MAP  N: SKY  C: SAVE.

## Nov 13 (late, cont.) — the Respawn game library
- Christian (22:34): "a more robust game database to play on these, like an emulator". arcade/library.html (cards by system, search, arrows/Enter, Esc back) and arcade/emu.html (unpacks a game and starts EmulatorJS; ?own=<system> lets a player open a file of their own, read in the browser and never uploaded). Cecil's "Browse the game library", the PCs and the arcade cabinets open it; the retro lounge TV opens its NES tab; the racing rigs still open Racer. The arcade bar has a Game library button and takes each page's title.
- 42 homebrew games from Homebrew Hub (hh.gbdev.io): 3 NES, 22 Game Boy, 13 Game Boy Color, 4 GBA, plus the 4 PC games. scripts/library/: hh_fetch.py (catalogue metadata), picks.py (the picks and every exclusion with its reason), fetch.py (ROMs and screenshots), licscan.py (reads each repository's README and licence for narrowing terms), build.py (arcade/lib/catalog.json, lib/roms/<id>.json deflated and base64'd because the host takes no ROM file types, lib/shots/<id>.png), licenses.py (cores and per-game credits into arcade/licenses.html).
- Every licence was confirmed at the game's own source; the database's labels were wrong for Tuff (art "all rights reserved") and incomplete for others. Out: Tuff, MeteoRain (CC BY-NC-SA music), Skyland (font and music licensed to the author personally), uCity Advance (CC BY-NC-SA art), Shock Lobster (third-party font/art, terms unstated), The Purple Night (music terms unstated), fan games and clones of others' games, and seven whose licence could not be confirmed. The Hat Chooses the Wizard's music is "Sylvan Waltz" by Otto Halmén, CC BY 3.0 (credited).
- Cores (EmulatorJS 4.2.3 builds, npm @emulatorjs/core-*): FCEUmm (NES, GPL-2.0), Gambatte (GB/GBC, GPL-2.0), mGBA (GBA, MPL-2.0), Stella 2014 (Atari 2600, own files), Beetle PCE (PC Engine, own files), regular and legacy builds. Not offered: Snes9x, Genesis Plus GX and PicoDrive, whose licences forbid commercial use (a business's website).
- ejs/emulator.min.js: the update check and the download-from-emulatorjs.org fallback are switched off, so nothing is fetched from outside. Headless check: NES, GB, GBC and GBA games all boot; the only outside requests are the Google font the game already uses.

## Nov 13–14 (night) — the McKenzie Palace Theatre and its two films
- Christian (22:50–22:52): snack counter on the left inside, two theaters with a drink area between them, a staircase on the right, and "the 2 most iconic" old open-source movies. js/core/palace.js: the theater (823 Fifth Ave publicly; the county files the 17 m x 53 m outline under 827, so the facade key is '@730.1,968.9'). The inside is 17 x 53 tiles: stage, two auditoriums of seats with aisles, a cross aisle, the lobby with the counter, menu board, drink station, stairs and posters. The theater photos were reference only: nothing traced, no people, no brand mascots or logos.
- The films: A Trip to the Moon (1902, Méliès, d. 1938; Wikimedia Commons copy) and The Great Train Robbery (1903, Porter, d. 1941; a US 1903 publication; archive.org copy posted by The Public Domain Review). Both are re-encoded to 384x288 H.264 (denoised, two-pass), at 16.5 MB and 9.7 MB, and shipped as cinema/films/*.wasm (the artifact host allows .wasm, not .mp4). cinema/player.html reads the bytes and plays them through a Blob URL, with a progress meter, start and end cards, a projector clatter (WebAudio, toggle) and Esc back. Outside: a marquee with both titles in a 3x5 pixel font, a vertical PALACE sign, and lit glass at night.
- js/core/overlay.js: pageShow(src, title, link) opens any page in the arcade's full-window frame (used by the films and the law library).

## Nov 14 (night) — every downtown storefront enterable
- Christian (23:25–00:03): a room the shape and size of each Fifth Avenue building, the banks, CoVantage, the library; and one idea per store. js/core/rooms.js: the real outline at 1 m per tile, turned so the door is at the bottom (N rotates 180, E and W turn), the front wall windowed, a door at the nearest column to the real door. Stand-in furniture by kind (shop, cafe, bar, bakery, salon, office, bank, library, post, museum, court, laundry, garage, florist, pharmacy, vintage). A reachability check rejects rooms too small to stand in. Doors are registered for every face, and saves inside a room rebuild on load.
- js/core/rooms2.js: generic staff (clerk, server, bartender, teller, librarian, stylist, mechanic, groomer, baker, chiro, realtor, creamery, vendor, petkeeper, the laundromat regulars, a stranger), and each place's hook: what its people say and what its counters, shelves and machines do. Full list: notes/downtown-plan.md (project doc claude/downtown-plan.md).
- js/data/menus.js: Dixie Lunch's real menu (names and prices from its Toast ordering page, read Nov 13–14, 2026; "Arnold Palmer" is renamed). js/core/money.js: cash in cents ($25 to start, placeholder), the bag (I), menus and shops, eating and drinking with an empty buff slot per item. js/core/shops.js: stand-in menus and stock, the vintage stores' pitch, quiz and consignment, the noise quiz, the bearings talk, Dewey, the museum facts, old jokes. js/core/games.js: the dog wash and the flower match.
- js/core/banks.js: accounts, deposits, withdrawals and loans for Associated, BMO, Chase, CoVantage. The study is in claude/banking-framework.md. Corrected on Nov 14: default now follows Wis. Stat. 425.103(2)(a) (more than one full payment 10+ days late, or the first or last payment 40 days late; one late payment alone isn't default). The written notice comes in pages, a "catch up all" option cures, there's no third cure in 12 months, an uncured default is flagged, and the Truth in Lending box is a 2x2 grid with APR and finance charge made conspicuous.
- js/core/play.js: the choice window now widens to fit its longest choice. /tmp/qlong.py and /tmp/qbankdlg.py check that no dialog page or choice overflows its window.

## Nov 14 (night) — the law library, the hospital, potatoes and timber
- law/index.html, opened from the shelves at Winter, Winter & Behrens: how law fits together (the ladder, statutes, agency rules, ordinances, home rule, preemption, who makes the rules here), courts (Langlade County circuit court, District III, small claims $10,000 and $15,000 from Jan 1, 2027 under 2025 Act 105), all 25 county code chapters with the big ones in plain English, the City of Antigo (Municode code, zoning Chapter 14 districts, dogs, winter, ATV/UTV), and how to read a cite. It says on every view that it is general information, not legal advice, and not from the firm. Sources: the Legislature, the court system, the county's own ordinance page, Municode, the State Law Library.
- rooms.js: a hook can now open a building the default rules keep shut (enter: true), and big buildings open only a front lobby box (lobby: [width, depth]); the plan is cropped to it.
- Aspirus Langlade Hospital (Christian: "some nice staff"): the main lobby only, with a front desk ("in an emergency, call 911"), a nurse who lets you rest (flag only) and a volunteer. Stand-ins, nobody real, no medical advice.
- js/core/industry.js (Christian: potatoes, Volm, logging, NTC wood science). Volm Companies (1804 Edison St, sign name via facades.js; a new Work map pin) opens its lobby: bag wall, history cases, a demonstration bagger, the receptionist's "from the field to the bag", the company story and a potato quiz. NTC's Wood Technology Center of Excellence opens a training-sawmill floor: log deck, band-saw headrig, kilns, stickered lumber, workbenches, an instructor's tour, the forests and a wood quiz. Six new props (bags, bagger, band saw, log deck, kiln, lumber) and two room styles. The museum gains six facts (1881 railroad, hardwoods and rails, the Crocker Chair Co. line, the 1928 county forest vote, the state soil, seed potatoes). Research and sources: claude/potatoes-and-timber.md. No owners named, no business's sales or earnings.

## Nov 14 (morning) — bars, the trenchcoat, property, open floors
- Christian (5:12 am): the Opera House and Hoffman House have low-income apartments, "oh yeah the bars!", made-up hospital staff for now, "Kids require talking to 2 kids in a trenchcoat outside to get a costume to get loans or go into bars", "Yes tie it in", "Yes real due dates", "They should open their factories and labs and classrooms too".
- js/core/bars.js (new):
  - **The Opera House** no longer opens (apartments). Its landmark lines add its history.
  - **The bars:** Hix's Hoffman House, Animals Bar & Grill and bb Jack's (523 Superior, opened via a hook). Each gets:
    - a pool table, dartboard, jukebox, TV and fish fry board (BAR_PROP);
    - the bartender's menu, 12 trivia questions and darts (MINIS.darts).
  - **The kid gate:** an enterRoom wrapper keeps a kid out of a bar unless G.disguise is set.
  - **The trenchcoat kids:** an outdoor NPC 3 cells from the Hoffman House door, drawn in code. They hand over the trenchcoat item (kind 'wear'), which the bag puts on and takes off.
  - **Drinks:** alcohol shows on bar menus only for a grown-up in the Mature story.
- js/core/banks.js:
  - passesAsAdult(). Loans need an adult, or a kid in the coat; the old co-signer stand-in is gone.
  - BANK_EXTRA, for options added by other files.
  - Property loans (kind 'property'): no WCA cure process (421.202(7)). They get a 120-day note instead, and a loan more than 120 days behind is marked defaulted.
- js/core/property.js (new):
  - **The realtor:** CR Realty's realtor (crTalk) sells three made-up listings.
  - **The offer:** WB-11 or WB-13, with the condition report named.
  - **Paying:** cash, or a property loan at any bank.
  - **The loan:** a Loan Estimate the day you apply, the Closing Disclosure 4 business days later, and closing no sooner than 7 business days after the Loan Estimate and 3 after the Closing Disclosure.
  - **Business days:** every day but Sundays and federal holidays (fedHolidays, addBizDays).
  - **On screen:** PROPBOX draws both forms. Deeds in the bag give the placeholder perks.
- js/core/industry.js:
  - **Tools:** innerWalls, addZone and zoneAt make rooms inside a room, each with its own floor and name; yellow walkway lines; ppeDoor; XPROP (25 new props) and FLOOR_LOOK.
  - **Volm:** lobby [36, 30] with a plant floor behind a safety door, and a floor lead (tour, safety, quiz).
  - **Wood Center:** [36, 30] with a hall, a classroom (Wood 101 lesson and quiz), a wood lab (moisture game, end-grain quiz), the sawmill line and the saw filing room. A teacher, a lab tech and a sawyer.
  - **NTC main building:** a new hook, [34, 26], with the commons and four rooms (classroom, welding, machine shop, nursing).
- js/core/games.js: the MINIS registry, so new small games plug in.
- Tests:
  - /tmp/qnew.py checks look text on every new tile, the kid gate, the trenchcoat, the bar talk, a full property purchase with the clock moved, a cash purchase, late and 120-day property payments, the PPE door and the moisture game.
  - /tmp/qlong.py: 51 rooms, 0 issues. All earlier tests still pass.

## Nov 14 (8 am) — each place's own menu, Kastawayz the bar, and the Bookstore playstyle
- Christian, 7:51: "No, each place has their own menu." 7:57: no "done shopping" option at Kastawayz, and "it is also a sit down wisocnsin bar for drinking." 7:51 and 8:00: a bookstore simulator with limited money, set at the checkout, with the store's picture in the middle and the options around it. His photos are coming.
- js/core/money.js:
  - **shopOpen:** every list gets a closing row (`doneLabel`; `noDone` to skip). A on the row is the same as B. The footer shows the note, then the button hint (`hint`). `cashFn` lets the store mode show its own cash.
  - **menuOpen:** a one-section menu used to reopen itself on B (the Kastawayz trap). Now it closes. Items can carry their own kind and note (a bag of beans is goods, not food). Section keys starting with `__` are settings, not sections.
- js/core/shops.js: **each place's own menu** from its county dining listing, its site, its delivery listing or dishes reviewers name. Prices are placeholders (`LISTED_NOTE`). This covers Banquet On A Bun, the bakery, Woken Bear, Be U, Kastawayz, Animals, the Hoffman House, bb Jack's and Spud City Creamery. Item ids no longer collide (bq_ for Banquet, bj_ for bb Jack's).
- js/core/bars.js:
  - **barMenu** honors `__days` (Hoffman supper Wednesday to Saturday, Italian night Wednesday, Kastawayz's weekday special), `__closed`, `__fishfry` (none for now) and `__note`.
  - **Kastawayz** is a bar (kind 'bar': the kid gate, the props and the bartender).
  - The specials easel shows only where a place lists specials, with its own words (`board`).
- js/core/rooms2.js: the old food hooks point at the new menus. The bakery's line is the butter cookies (the county's own words). Woken Bear and Be U get greetings.
- js/core/play.js: saveGame does nothing when there's no adventure game (store mode), so it can't write an empty save over one.
- **The Bookstore playstyle** (js/core/store.js, js/data/storebooks.js; design and research in notes/bookstore-sim.md):
  - **Where:** MODES.store. A PLAY row on the new-game screen, and THE STORE on the title. Its own save key: SAVE_KEY + '_store'.
  - **Screen:** the picture is 224 x 144 at (80, 22), with eight choices around it (`SB`). Customers draw at the counter with drawFolk at 1.6x. Mouse and touch can tap a choice.
  - **Rooms:** checkout, front, back, up, base. They're painted for now (stPaint). A room listed in STORE_PHOTOS draws assets/store/ROOM.png instead. `scripts/store/photo_to_pixel.py PHOTO ROOM [--box] [--colors]` makes them.
  - **Engine:** storeMorning (news, deliveries, Monday bills, tax on the 1st, classifieds), stQueue (customers by weekday, month, reputation and weather, plus regulars, pickups, events and store events), and ENC handlers (browse, ask, gift, seek, pickup, credit, sell, haggle, kid, reg, story, club, event).
  - **More engine:** stSell (stock, 5.5% tax, card fees, the week's books), stHandsell (three books, read the back, recommend; scored by tags), and storeClose with the day report.
  - **Data:** STORE_SECS (8 sections), STORE_BOOKS (52 public-domain classics with tags and new blurbs), STORE_ASKS (32 requests, each with a gift wording), STORE_REGS (6 made-up regulars with their real-world questions) and STORE_EVENTS (Christian's experiences go here; 3 stand-ins for now).
  - **Balance:** bots over 75 days. A careful owner ends at about $2,700. A careless one is at about $320 by late January.
- Tests:
  - /tmp/qmenus.py walks every menu: the Done rows, one-section menus closing, the day-gated sections, Kastawayz as a bar (the kid gate and its board), the bag and the sell list.
  - /tmp/qstore.py runs every store menu and room, checks every dialog's fit, and plays N days with a good or a naive bot.
  - /tmp/qstoreshots.py writes screenshots to shots/store_*.png.

## Nov 15 (10 am) — the Langlade County Historical Society Museum
- Christian, 10:05: "Ok, we need to build the historical society now. Is the history societies page for antigo open sourc epublic info for articles?"
  - The articles aren't open: they're copyrighted.
  - Facts are free, and quotes come only from the public-domain 1922 History (notes/museum.md).
- **js/core/museum.js** (new; loads after property.js):
  - **Buildings.** The museum keeps its landmark and gets addr 404 SUPERIOR ST. The society's small log building NW of it is the **Deleglise Cabin** (type shed, face S, a 'logs' wall pattern added to `pat`). The two outlines north of the cabin are the train shed: **The 440** (north) and **The caboose** (south). Found by owner and position, not by id.
  - **Floors.** `musFloor` builds `MUS1` (24 x 23: the main block plus the wing), `MUS2` and `MUS0` (24 x 17), and `MUSC` (the cabin, 9 x 7). Each has `ex` (look keys), `art` (wall art keys), `artA` (side-wall frames) and `caseKind` (what's in each glass case).
  - **Painting.** The floors are drawn by `roomPaint`. Wrappers on `roomWallFace`, `roomCap` and `roomProp` handle `Fm.mus`.
  - **Wall art several tiles wide** (MUS_WIDE: signs, the county map, the chalkboard, the stage flag) is drawn once, from its rightmost tile, so the next wall can't cover it.
  - **Moving around.**
    - Stairs are `links` ('^' up, 'v' down).
    - The elevator 'L' and the south door 's' go through a wrapper on `MODES.inside.arrive`.
    - `enterRoom(MUSEUM)` goes to the front hall.
    - `doorEnter` adds the south door, and the cabin door when it's open.
    - `lookAt` adds the cabin, the 440, the caboose and the park props.
    - `loadGame` moves an old save from the generic room ('room130') to the front hall.
  - **Exhibits.** `MUS_EX` holds every case, card and sign; `musShow` opens it, with a photo card when it has one.
  - **The 1922 book.**
    - `MUS_PAGES` holds 15 pages of public-domain quotes, each checked against its scan.
    - `musReadPage` reads them on the stand.
    - The volunteer's `musLookUp` and `musStreets` look things up in it.
  - **People and things.**
    - `MUS_QUIZ` holds 12 questions for the school's chalkboard.
    - Curator, volunteer, welcome-center staff and a visitor: FOLKS curator, docent, edc, visitor.
    - The donation box gives game money.
  - **Outside.** `drawTrainShed` draws ballast, ties and rails, posts, `drawLoco` and `drawCaboose`, and a see-through roof. `drawCabinFront` draws the board door and window; `drawMuseumSouth` the glass doors and canopy. The railroad park props are `musclock`, `muscart` and `mussign`.
  - **Calendar.** `musSummer` is May to September, America/Chicago. A `?season=` preview counts too. The cabin opens only in summer, and only after the curator opens it that day (`G.musCabin`).
- **js/core/rooms2.js:** the old museum hook (MUSEUM_FACTS on any case) is gone.
- **assets/museum/** (new): lib1922, fifth1922, bird1886 and school1879, all 192 x 144 in 16 warm greys. `scripts/museum/archive_cards.py PAGES_DIR` makes them from the archive.org page scans.
- **Tests:**
  - /tmp/qmus7.py [summer] does three things.
    - **Fit:** every museum line fits its box.
    - **Moving around:** stairs both ways, the elevator to every floor, the front and south doors both ways, the cabin locked in winter and opened in summer.
    - **Talk and reading:** every menu of the curator, volunteer, welcome center and visitor; the book; the quiz; the donation box; every tile's look; and the old-save move.
  - /tmp/qmus9.py walks through every door with key presses.
  - /tmp/qmus4.py, /tmp/qmus8.py and /tmp/qmus10.py take screenshots to shots/mus_*.png. shots/museum_base.png is the captioned sheet.
  - Regression: qnew BAD 0, qlong 0 issues, qmenus BAD 0, qbankdlg ok, qloan ok, qshops ok.

## Nov 16 — battle sprites at even sizes, the K-12 schools, City Hall and the courthouse
- **Sprite sizes** (Christian: "Make sure my characters stay same sizes across sprites as they move and attack"):
  - `scripts/battle/build_art.py` now scales each pose row by its standing frame's height (62 px; the Robin 65.2), with fixed scales for the run rows.
  - `partyFrame` shows the run row on the way to a far physical attack and back.
  - `even_robin.py` must run after any rebuild of party.png.
  - Details: notes/battle-system.md. Published as v71.
- **The K-12 skill tree** (js/edu/: edu, study, figs, gen, content_math, content_ela, content_sci, civics, content_ss, content_more):
  - 130 skills in eight lanes and four grade bands. Each has lessons, a tutor with fading worked examples, and a mastery test (test out anytime).
  - High school credits follow Wis. Stat. 118.33, including personal finance from the class of 2028. The civics test uses the 92 stable USCIS questions, 60 to pass.
  - The study window is an HTML panel, not the dialog box.
  - Real-place projects are checked by `eduVisited`. The bookstore counter counts through a `figLook` wrapper.
  - `eduQ` takes a list of makers. `eduTestSet` no longer drops picture questions that share their words (clocks, coins, tapes).
- **The schools** (js/edu/schools.js):
  - Seven buildings with the tree inside, generic staff, and the front office's "how schools are run and paid for".
  - The private schools' intro lines are now two lines each, so they fit the box.
- **City Hall and the courthouse** (js/edu/civic.js):
  - City Hall (700 Edison) opens. Its clerk explains the city: council, administrator (a role), money, levy limit, state aid, TIF, room tax, records.
  - The courthouse gets a county clerk: board, elected officers, money, the courts. The clerk's counter is placed on real floor by `civicCounter`, because the courthouse plan has an entry hall.
  - The judge's bench opens the courts cards.
- **Fixes:**
  - The project checks now use the town's real names: "City Hall", and "Langlade County Historical Society Museum".
  - The finance map tag is FINLIT (6 characters fit a box).
- **Notes:** notes/k12-schools.md (how it works, files, how to add a skill, sources).
- **Tests:** tests/qedu.py, now in tests/run.sh. It checks every skill's wiring, builds each test three times, checks that every project's place is in town, and walks the map, the study window and both civic explainers.
- **Regression:** qnew BAD 0, qmenus BAD 0, qshops ok, qbankdlg ok, qloan ok, qstore BAD 0, qmus7 BAD 0, qmus9 ok, qlong 0 issues (after the fix), qedu BAD 0, qbattle ok, qdisc ok, qstart ok; no errors.
- **Published** as v72 (1794878490-df75): index.html and js/edu/ (13 files).

## Nov 16 (evening): the City Administrator, a summoner
Christian asked: "Have The City Administrator be a summoning class that summons the various departments, based on Final Fantasy summoners."

**js/battle/summon.js** (new; loads last):
- **The ADMIN class.** A generic role, drawn in code. They join at City Hall, where they stand by the desks, and their desk empties once they join.
- **SUMMON.** Nine department summons, each with its own scene, and each callable once per fight.
  - Four come with the job, by level.
  - Four unlock in town:
    - the Public Safety Building (police);
    - 1020 W Pierce (public works);
    - 520 1st Ave or Water Tower Park (water);
    - any park.
  - MUTUAL AID needs all four, and level 12.
- **Also:**
  - DELEGATE and BUDGET;
  - five hand items;
  - MAIN STREET and CIVIC PRIDE team bonuses;
  - TOWN HALL MEETING, a combo with Christian.
- **Two unnamed city buildings get names:** Antigo Waterworks (520 1st Ave, from the DNR permit notice) and Public Works (1020 W Pierce Ave).
- **Looking at the department buildings now says what goes on there:**
  - the police and the county's 911 dispatch center;
  - the street department's yard;
  - well water softened and disinfected;
  - the fire department sharing City Hall.

**js/edu/civic.js:** the City Hall clerk now knows where the administrator is.

**Notes:** notes/battle-system.md.

**Test:** tests/qsummon.py, now in tests/run.sh.

**Regression:** the full suite (qnew, qmenus, qshops, qbankdlg, qloan, qstore, qmus7, qmus9, qlong, qedu, qsummon, qbattle, qdisc, qstart) passes with no errors.

**Published** as v73 (1794881709-db2f): index.html, js/battle/summon.js, js/edu/civic.js.

**Later the same evening: one summon per real department.** Christian listed the city's departments, which matches the DEPARTMENTS menu on antigo-city.org. The summons were reworked to match:
- AMBULANCE folded into FIRE & RESCUE.
- New: REBOOT (IT), PROCLAMATION (the mayor's office), CLEAN WATER (wastewater; unlocks when you look at Spring Brook, with the DNR's trout fact), INTERLIBRARY LOAN (the library; it finds the foe's needed book).
- WATER TOWER now stands for Public Works.
- MUTUAL AID needs all six place-based departments.

Tests: qsummon BAD 0, qbattle ok, qlong 0 issues.

**Published** as v74 (1794882320-f254).


## Palace films: silent-film piano music (Nov 16-17, 2026, live v1794893538-fe59, seq 75)
- Christian asked for the music once played with the two films. Neither came with a score: theaters chose their own (Méliès required none; the 1902 Olympia score is lost; Ezra Read's 1903 piano fantasia exists on IMSLP; The Great Train Robbery had none). Modern scores (Air 2011, Robert Israel, Frederick Hodges) are copyrighted and not used.
- New: cinema/score.js (generated by scripts/cinema/score.py, which checks every bar's length) and a Web Audio upright-piano engine in cinema/player.html. A "Music: on/off" button sits beside "Projector sound"; music is on by default and follows play, pause and seeking.
- 14 pieces: originals in period style (march, foundry ostinato, galop, hurry, misterioso, snowstorm, saloon rag, tender theme, train, minor march, rising tremolo, fanfare) plus Grieg's Hall of the Mountain King (1875) and Brahms's Lullaby (1868), both public domain. Cue times come from ffmpeg scene cuts in these copies (Trip 766 s; GTR 690 s), with chord hits for the cannon, the eye, the Selenite king, the safe blast and the final gunshots.
- If Christian attaches Ezra Read's 1903 score PDF from IMSLP, transcribe it and use it for the moon film.

## Street View survey, first wave (Nov 17, 2026, ~10:10 am)
- Christian: "lets do google maps and pictures just to make art in the town of each building we can … do this for the whole city … Especially when facing north."
- Survey kit in /home/claude/streetview: planner.py and stations.py split 4,229 buildings into 41 packages of Street View stops; RECIPE.md is the surveyors' rulebook (stop on any human check, never save images, homes styled only); facts/*.jsonl hold plain facts judged by eye; tools/merge.py writes js/data/survey_facades.js.
- SURVEY_FACADES is keyed by each building's own bbox centre ('@x,y'), never by address, and is applied before FACADES, so every hand-made entry still wins.
- Painter (buildings.js): real front-window counts per floor (winN), shutters, door colours, dormers on story-and-a-half houses, stucco and log walls. Front details draw only on south-facing fronts: the camera looks north.
- Downtown Fifth: lamp posts carry US flags and hanging flower baskets (baskets hidden in bare and snow seasons), black benches and trash cans, wooden barrel planters, and a red brick paver band at the curb.
- Palace text corrected from "since 1916" to 1907 / Christmas Day 1913 (library newspaper archive).
- Published with packages 00a, 00b, 01a, 01b, 02a, 03b: 575 buildings styled. Sign names read by the surveyors are kept in /home/claude/streetview/merge_review.json for Christian's review; none are applied yet.

## Street View survey complete (Nov 17, 2026, evening)
- All 41 packages surveyed (2,305 stations, 4,228 building lines, 2,825 street-detail lines). No Google human check was ever hit.
- 3,848 buildings styled in js/data/survey_facades.js (17 survey keys matched no game building and are skipped).
- Not yet applied, waiting on Christian: 197 business names read from signs, and the surveyors' building-type corrections (garages, sheds, farmhouses, churches that are houses and so on). Both are in /home/claude/streetview/merge_review.json and the facts' notes.
- Open questions for Christian: 902 Fifth (archive: Senior Center and small shops since 2021; game: Colleen's Craft Shed); the BRADLEY building where the data has Ascension Lutheran; 329 Forrest Rd and 924 Deresch St listed as churches but showing homes.

## Street life from the survey (Nov 17, 2026, ~8:30 pm)
- Christian: "keep doing it for parts of the town, not just buildings."
- /home/claude/streetview/tools/details.py classifies the surveyors' 2,825 street-detail lines and places each at the point its view looked at; tools/street_js.py writes js/data/survey_street.js (3,039 items after thinning to one of a kind per ~12 m).
- js/core/streetlife.js turns them into props with the game's own tiles: wooden utility poles (797) strung with wires to the next pole along the street, curbside mailboxes, bumpy foundation hedges, flagpoles, side-yard fences (chain-link, picket, privacy, rail, iron), flower beds, vegetable gardens, basketball hoops, swing sets, campers, boats, lawn statues, woodpiles, benches, utility boxes. Snow caps and bare-season colours follow SKY.phase.
- Places survey (parks, fields, playgrounds, cemeteries, schoolyards, the lake and ponds, streams, bridges, the old rail line) planned by tools/places_planner.py: 262 stops in places/pkg_P0-P3.json, rules in PLACES.md (no names or dates from headstones, nothing about people at schools).

## Courts minigames (Nov 17, 2026, ~9 pm)
- Christian: "we need a simple pickleball and basketball game at each park" ... "well, where those courts are".
- js/core/courts.js (PLAYCOURTS; renamed from COURTS, which civic.js already uses, and PKB/HPS state to avoid parkbits.js's PB):
  - Krueger Pickleball Courts at Jaycee Park (16 courts, permanent nets, opened 2025: pickleheads.com, bounce.game, Travel Wisconsin) - pickleball.
  - Elleson Courts at the high school, 10th Ave (lighted; open play) - pickleball.
  - Mendik Park (OSM basketball polygons; places survey: fenced asphalt court) - basketball, and pickleball with a portable net (bounce.game: bring your own nets).
  - North Clermont Playground (places survey: a hoop on the lawn) - basketball.
- Basketball: a half court from above; Shootaround (60 s around nine spots, 3s worth 3) or ten free throws; a sweeping release meter whose green window narrows with distance. Bests saved in G.courts.hoops.
- Pickleball: singles to 11, win by 2, rally scoring, against a generic park regular. Diagonal underhand serve past the kitchen, the two-bounce rule, no volleys from the kitchen, faults for net, out and double bounce. UP drives, DOWN dinks, LEFT/RIGHT aims. Record in G.courts.pb.
- Places survey finished (262 stops in 4 packages): survey_places.js rebuilt with all four.

## More map polish (Nov 17, 2026, ~9:30 pm)
- Christian: "more antigo map polishing from google maps for details around town".
- Spring Brook downtown and below the Faust dam: fieldstone channel walls along the water's edge (streetlife.js, ZONES); a black globe lamp at the lake's stone bridge (the other survey spots were water or taken).
- Water towers (js/data/furniture.js WT): the north industrial park tower's globe pale blue on a white stem; Water Tower Park's older tower on legs added at 850.3,768.0, ~34 m (a lidar return cluster about 70 m north of the globe tower; position is a best fit).
- The surveyors' 146 corrected types now show: garages get garage doors, barns barn doors, sheds plain walls, factories high windows (merge.py).
- Backs survey (BACKS.md, places/pkg_B0.json): 38 north-facing downtown buildings, viewed from the street or lot behind; Street View mostly lacks alleys, so only 7 backs were usable (uncertain matches skipped). The painter's backStyle/backExtras draw a surveyed back wall: its own wall and material, rear windows per floor, a back door, outside stairs, a faded painted sign, meters.
- Second backs pass (BACKS.md "Second pass", places/pkg_B1.json): 31 unseen backs tried from the street to the south and from the alley/lot mouths. Street View rarely enters alleys and the points often snapped to Fifth Ave, so 4 more were usable (seen 1; e.g. the Senior Center of Langlade County's sign on its south wall). 11 backs styled in all.
- From the surveyors' notes on south-facing fronts: bay windows (62), porch flags on brackets (118), balconies (10), satellite dishes (25), wraparound porches (houseExtras in buildings.js; merge.py).

## Quality check (Nov 17, 2026, ~10:40 pm)
- Survey accuracy: 8 random clearly-seen buildings re-checked against Street View by hand (Chrome): 8 of 8 facts match (colour, material, storeys, roof, porch, garage, notes); all 8 keys resolve to the right game building (within 0.14 cells) with the surveyed style applied.
- Props: none of the ~3,900 survey props stand on a road, water or a building; 90 near-duplicate yard items (within 0.6 cells) removed by a spacing rule; 60 frames a second downtown and on a residential street.
- Courts: the basketball meter moved too fast for threes (the green window passed in under 2 frames); now slower with wider windows (a perfect release makes ~90%). The pickleball regular missed too often against ordinary shots; now errs mostly against drives. A scripted player loses 5-11, so a human who moves forward and back can win.
- Known limits: 11 of 38 downtown backs surveyed; 17 survey keys match no game building; houses facing east, west or north show only colours and shapes from the camera; sign names and building-type changes await Christian.

## Nov 18 — parked cars kept sane, sidewalks linked
- js/core/parksane.js (new, after sports.js): checks every car from the May 2025 aerial at load. Street cars move to the curb and run with the street (none near intersections, on lanes too narrow, or on Superior's four lanes). Lot cars line up with painted stalls, or nose in along a mapped aisle, or square to the street on a 2.7 × 5.6 m stall grid. Cars on lawns move onto the pavement beside them or are left out. No car body may touch a building, water or woods. One car per space. Of 3,719 cars, 2,393 kept (window.PARKSANE has the counts).
- town.js: sidewalks are drawn in two passes (all edges, then all surfaces), so walks join instead of stacking edge lines and round caps on each other. linkWalks() carries loose ends within 6 m onto the walk or street they were meant to meet (409 links), runs in-line walks straight on instead of slanting, and never lays a link through a building. Ends that meet a walk are rounded; ends that stop on their own are cut square with an edge line.
- Checked: shots/swk_final.png, shots/swj_after3.png, shots/rand_c.png; prop audit clean; 16.6 ms/frame.

## Nov 18 (afternoon) — Christian's answers: sign names, survey types, the Craft Shed's vendors
- "1. yea 2. yea 3. its that and booths of other vendors".
- Sign names: merge.py now writes each sign reading (cleaned to normal capitals, typos fixed, pump labels, word fragments and still-open readings like BRADLEY left out; homes and apartments never) as `sign`. applyFacades puts it up only where the game had no name: 118 buildings newly named. Hand-made and OSM names win.
- Survey types now count in play: `stype` sets b.type (b.typeWas keeps the old one) for 140 buildings — store→factory 27, house→garage 20, house→farmhouse 15, house→shed 8 and so on. Not on landmarks, the Fig Tree, or hand-named places, except fixes to civic, hospital or barn.
- 902 Fifth stays Colleen's Craft Shed; the middle of the floor is now a market of six vendor booths (knitter, woodworker, candle maker, beader, beekeeper, painter), each with a back shelf, the vendor and a table, and its own stand-in stock. Supplies stay up front, pets in back. The newspapers' Senior Center sign is on the Edison side (623 Edison), already its own building in the game.
- Checked: no errors, prop audit clean, 16.5 ms/frame; shots/craftshed3.png, shots/swj_names.png.

## Nov 18 (afternoon, 2) — lots checked against the photo; a second pass of Street View details
- Christian's phone shot of Anderson Drive ("that grey asphalt area is all uneven, is that accurate?"): no. The WROC 2025 photo shows the street about 4 m north of its OSM line; the tracer took the leftover edge of the street as a lot.
- town.js: PK_FALSE drops 48 traced "lots" that are thin strips along streets (checked on a photo contact sheet: terraces, sidewalks, shoulders, street edges, a dirt field). Their pavement tiles go back to the surrounding ground. Kept: Fifth/Superior parking lanes (858+), alleys, real pads (124, 127, 275, 434, 507, 658, 662, 669). Audit scripts: /home/claude/audit (lots.py, slivers.py, sheet.py).
- Every other lot outline is cleaned: spike removal, then Douglas-Peucker at 2.4 m (the tracer stepped in 4 m blocks).
- looseTiles(): 3,040 lone 1–2 tile pavement bits touching a street, outside lots and buildings, become the ground beside them (the grey squares on curb corners). Driveway aprons connect to longer runs and stay.
- The intersection patch that clears lane marks is now round and in the street's own asphalt colour (it was a darker square that stuck out past the curb on bends).
- Street details, second pass (street_js.py EXTRA; streetlife.js): hydrants 67, trash carts 67, dumpsters 24, boulders 20, bollards 21, speed-limit signs 19, stop signs 15, no-parking signs 12, church sign boards 6, billboards 5 (generic, no ads), silos 5, trampolines 4, above-ground pools 4, newspaper boxes 4, gazebos 3, propane tanks 3, a tire swing, a bike rack, a children-at-play sign.
- House fronts from the notes (merge.py, houseExtras): decks 175, carports 26, front steps 23, ramps 18, TV antennas 19.
- fuelcanopies.js: 12 pump canopies that OSM drew as buildings are now open canopies in their seen fascia colours (no logos).
- Checked: no errors, prop audit clean, 16.6 ms/frame; shots/anderson_after2.png, shots/swj_gas.png, shots/rand_lots2.png.

## Nov 18 (afternoon, 3) — sidewalks that taper; the Krueger courts as built
- Christian: "some of the sidewalks are triangle shapes that get narrower until the grass takes over"; "We need this as accurate as possible".
- Two causes, both fixed in town.js:
  - The 4 m road grid runs wider than the drawn streets, and its uncovered squares were painted as concrete slabs; along slanted streets they stepped into sawtooth wedges, and half-covered squares made fake slab strips past the curb (Anderson Dr had a "sidewalk" the photo doesn't show). Now road squares outside every street are the ground beside them (roadFringe, 1,551), and road squares a street only partly covers are drawn as ground (ROAD_GROUND), except within 2 tiles of shops, offices, churches, schools, apartments and factories, where the curb-to-door walk is real.
  - linkWalks rewritten: a loose walk end is carried on only straight ahead (ray within 6 m to a walk or street; or an in-line walk end offset under a walk's width), never sideways; sharp V folds under 6 m clipped. Sharp V's in walks: 50 → 2 (both real bends).
- Photo can't separate concrete from street here (Antigo's streets are pale in the May 2025 photo), so the fix uses the map: real sidewalks are the mapped walk lines.
- js/core/krueger.js (after courts.js), from the May 2025 photo and Christian: the 6 OSM tennis courts replaced by the 16 pickleball courts as built (two rows of five, two of three; 6.1 x 13.4 m, light kitchen, nets) on green pads; the asphalt drive along the north side to S Clermont; a plank footbridge over Spring Brook at the north-west corner (walkable); the gravel lot on 10th Ave north of the brook; a chain-link fence on the pads' edge with gates by the shelter and onto the drive. The pickleball game starts by the first row's second court.
- Checked: no errors, prop audit clean, 16.5 ms/frame; shots/swj_fringe2.png, shots/swj_jaycee3.png, shots/swj_dtown.png.

## Nov 18 (evening) — the game checked against the 2025 photo, layer by layer
Christian: "what else in game doesn't seem to match up with the satellite? Find inconsistencies". Scripts in /home/claude/audit.
- Streets (roads.py, sheet_roads.py): 15,462 profiles; 77% within 3 m by the numbers, and the 24 worst stretches all sit on the real street when looked at (the score is pulled by sidewalks and shoulders). No change. Correction: Anderson Dr is ~1 m off, not 4 m; the false lot there was traced over grass and curb.
- Sidewalks (walkshift.py, walkpieces.py, build_walkfix.py -> js/data/walkfix.js): no town-wide offset (median -0.25 m E-W, -0.5 m N-S). 249 segments on 132 walk lines moved 0.75-3.3 m onto the sidewalk the photo shows (only where the photo agrees along the segment). Park trails at the high school fields and one more (8 stretches, ~1.4 km) are gravel/dirt and now drawn tan. The photo can't tell asphalt from shaded concrete, so no walk was recoloured asphalt.
- Buildings (bldgs.py): 35 footprints are plain lawn in the photo (green metal roofs excluded, each checked on a sheet); removed at load (goneBuildings in town.js), ground back to lawn. None named.
- Courts and diamonds (sports.js data): all match except the old Krueger tennis courts (already replaced).
- Water: pond #6 traced to its real shore (about a third of the old outline; the rest is dry marsh); #21 and #22 are dry grassy swales by parking lots, now grass. The lagoon (#18) and pale settling pond (#17) are real water.
- Checked: no errors, prop audit clean, 16.5 ms/frame.

## Nov 18 (evening, 2) — newer buildings from the photo; lawns without stair steps
Christian: "do both, we need this being very identifiable from people in town".
- Lawn/grass stair steps: lawn, yard and rough grass were three tile textures in 4 m squares. All now share one grass texture, and the mown-lawn lightness is drawn as a small per-tile tint canvas scaled up smoothly (drawGreenWash, cached per camera tile), so lawn fades into grass. Field tiles are plain lawn; mowing stripes are drawn on the real soccer and football field shapes (mowStripes in sports.js).
- New buildings (audit/newbldg.py, sheet_new.py, accept.json, build_new.py -> js/data/newbldgs.js; newBuildings() in town.js): a roof search on the photo (uniform, not lawn, not street/lot/building, rectangular, a shadow on its west or north side) gave 254 candidates; 52 checked as real by eye on photo sheets (self-storage rows, barns, pole sheds, garages and sheds, commercial additions, two new houses), drawn as the photo's min-area rectangles with the photo's roof colour.
- The new apartment complex at the east edge (cells ~447-490, 680-723), absent from every map source: seven two-storey buildings measured on a 10 m grid off the photo, its U-shaped street onto the main road, and lawn in place of the old farmland tiles.
- Not done: the solar farm south of Forrest Ave runs off the photo's south edge (game y 5638 m), so it isn't measurable from this photo. bigcrop.py stretches crops that run past the photo edge; a 28 m "road offset" seen there was that artefact, not a real error.
- Checked: no errors, prop audit clean, 16.6 ms/frame; shots/swj_fields2.png, shots/swj_devel.png.

## Nov 18 (evening, 3) — playgrounds, the quarry, Springbrook's marsh and boardwalk, the hospital grounds
Christian: Cherry Street and most parks lack playground equipment; the gravel quarry was drawn as a parking lot; "this area is all wrong in front of the hospital"; the trail north of the hospital, a wooden gazebo and a power/dumpster area; "Springbrook trail is all wrong, you have the wetlands and boardwalk as just more trail and parking lots, figure out the difference with GIS".
- playgrounds.js: OSM's 12 generic spots replaced by 21 play areas measured off the photo (surface sand/chips/rubber, equipment where it stands), incl. Cherry Street, Lake Park's five pads, Hudson, City Park East and West, Peaceful Valley, Mendik, Saratoga, Third Ward, North Clermont.
- Lots rechecked (audit/lotaudit.py, lotsheet.py, lotfix.py): every traced lot scored for pavement vs vegetation and OSM parking; ~450 suspects checked by eye on sheets. 297 removed (woods, marsh, quarry, a lot on the hospital's roof); each tile under them set from the photo + WiscLand 2 (woods, marsh, lawn, grass, gravel).
- New ground type MARSH (15): town-wide where WiscLand 2 maps wetland and the photo shows open marsh (brown, fine cattail grain, not leafless woods: high-pass texture > 18.5), clusters of 6+ tiles: 21,503 tiles.
- Stray pavement tiles outside real lots that the photo or WiscLand show are grass, trees or wetland: 11,037 changed; small isolated pavement scraps (up to 6 tiles, off by themselves) cleared.
- PHOTO_LAWN / PHOTO_ASPH: slab and road-grid squares the photo shows are lawn (4,210) or asphalt drive (19,868) now draw that way.
- quarry.js: the pit floor traced off the photo as one gravel shape, three settling ponds, five stockpiles, the conveyor plant.
- springbrook.js: Spring Brook's open water along the trail traced off the photo (4 shapes; the map had a 5 m line), the OSM boardwalk and wooden bridge drawn as plank decks with rails, walkable, replacing the concrete trail line.
- hospitalgrounds.js: the walled transformer/dumpster enclosure at the west lot; a wooden gazebo by the west garden (placement from the photo, to confirm).
- Checked: no errors, prop audit clean, 16.6 ms/frame.

## Nov 18 (night) — parking stalls in every lot, from the photo
Christian: "The parking lots dont look right, they have parking spaces in them, we need to update all of those."
- audit/lotlayout.py -> js/data/lotstalls.js (replaces STALLS and PARKED at load). Paint lines are too thin to trace reliably on the 0.3 m photo, so:
  - lots with cars (115): rows found from the cars the May 8, 2025 photo shows (heading = stall direction, squared to the lot when within 12 deg; rows = peaks of the cars' depth positions), pitch and phase fitted to the cars; a row is kept only if paint shows between its cars (no stalls for drive-thru queues or loose gravel parking); rows carried out to the lot edge only while paint continues; each car snapped into its stall; leftover cars into the nearest free stall or left out.
  - lots with no cars (47): a grid squared to the nearest street and the town grid, kept only where >= 55% of its dividers land on paint, each row only between its first and last painted divider, stalls on pavement only.
  - 36 lots keep the stall lines traced earlier; overlapping lot outlines get one layout (lots with most cars first).
  - 3,675 dividers; 3,331 cars.
- facades.js: a hand-traced outline (polyQ) now frees the old 4 m box cells outside it. The hospital's 122 x 154 m box had made its own lot and drives "building"; they are lot and drive again.
- Not done: angled-parking rows (Pick 'n Save, Walmart-type lots) are drawn square or left bare; lots where paint is too faint to read stay plain.
- Checked: no errors, 16.6 ms/frame; shots/swj_stalls3.png.

## Nov 19 — area sweeps, 2,000 townsfolk, bridges, boardwalk, clean lots
- Fix queue: js/data/fixq.js + js/data/fixes/{nw,ne,sw,se,user}.js, merged by fixmerge.js (tiles, lots, buildings) and fixstalls.js (stall lines).
  - NW: 186 hand-traced stalls (plant lot 102, angled strip 142), 339 tiles; gravel lot 332's south half is woods.
  - NE: Walmart lot redrawn as ~30° angled stalls (422 lines); fairgrounds dirt race oval.
  - SW: downtown: bank lot at 420 Clermont (5 old buildings gone, photo shows one paved lot), angled curb parking on Fifth both sides, two lots behind Fifth.
  - SE: hospital front lawn/drop-off/entrance tiles (facades.js now lets photo tiles win inside the old hospital box); walk 1313 cut, 1317/1318 hidden; transformer pad moved to 4141,3662; gazebo moved to 4246,3562 (likely; to confirm).
- Townsfolk: js/core/townfolk.js + js/data/townfolk_data.js + assets/townfolk/sprites.png (Christian's townsfolk sheet); generator /home/claude/npcgen. 2,000 generic people tell where they stand; ~1 in 4 add place-tied town talk from the Antigo information group (no names, politics, crime). Anyone left on blocked ground is nudged to open ground.
- Hudson Street Bridge (springbrook.js): west walk runs straight along the curb across the deck; stone parapets, flared wingwalls, piers and globe lamps; old walk cells over the water are water.
- Springbrook: marsh is no longer walkable except where the boardwalk, overlooks or trails cross; deck drawn 3.6 m wide with cross planks, rails and posts; 4 square overlooks with benches (4213,3170 is in the photo; the others are artistic).
- Lots (town.js pkClean): every lot outline is redrawn on a 1 m grid turned to the lot's own direction; notches under 8 m fill where the photo or tiles show pavement; edge asphalt tiles join; slants become square corners. 559 of 564 lots cleaned.
- Facebook round 2: /home/claude/antigo/fb_round2.md (10 pages + 1 group; ~70 place facts).
- Brands (Nov 19, later): js/core/brandsigns.js draws BRANDSIGNS (pole / pylon / monument; talk to read). fixes/retail.js (Walmart, Pick 'n Save, Fleet Farm, Menards, plaza: T.J.maxx, Dunham's, Goodwill, Dollar Tree; Walgreens, Auto Value, O'Reilly; generator /home/claude/rtgen/gen.py), fixes/food.js (Taco John's, DQ, McDonald's Neva Rd, Arby's, Burger King lane; signs for Culver's, Pizza Hut, Subway, Little Caesars), fixes/gas.js + fuelcanopies.js (11 station signs, Kwik Trip canopy added, Fleet Farm store/canopies corrected, concrete forecourts). PAVED tiles in these files draw as concrete (userspots.js). Checked: 16.6–17.3 ms/frame, no errors. Published 1795104238-8fcf.
- Open: McDonald's on Superior St (photo shows a cleared site), Woken Bear Coffee, Aldi / Dollar General / Family Dollar / Tractor Supply not found, Lakeside Pharmacy and south-side Sentry, Fast Stop and Fleet Farm forecourts (in shared lots), Remington truck stop (off photo), Hwy 45 north station name, triangle by Taco John's dumpster.
- Dollar General at 332 Superior St (fixes/dg.js) replaces the old McDonald's (gone by the 2025 photo); layout is the usual DG one, no photo of the new store yet. NEWBLD entries can now carry name/addr. McDonald's north (2115 Neva Rd, by Kwik Trip) confirmed. Published 1795104990-7c10.
- Interiors (Nov 20): js/core/rooms_food.js (21: 10 fast food + 11 gas-station stores, 'f_' tiles, generic menus with placeholder prices; drive-thru side guessed from pavement) and js/core/rooms_retail.js (14 chains incl. Walmart 176x104 m, Menards, Fleet Farm, Pick 'n Save, Sentry, Dunham's/T.J.maxx split by a wall, Goodwill, Dollar Tree, Dollar General, Walgreens, O'Reilly, Auto Value, Cellcom, Fastenal; 'r_' tiles, department signs). Real outlines at 1 m; 16.6 ms inside Walmart. Skipped: Cenex, Shell 606 Forrest (too narrow), Hardee's/Aldi/Family Dollar/Tractor Supply (not in data). Published 1795234231-f345.
- Interiors (Nov 21): js/core/rooms_biz.js (537 more businesses: offices, shops, garages, factories, warehouses, clinics, hospital, motels, gyms, daycare, funeral home, etc.; 'b_' tiles, ~2,000 generic staff/customers) and js/core/rooms_homes.js (3,374 homes: 3,353 houses + 21 farmhouses; generic titled 'A HOUSE', no addresses/names; 4 décor styles seeded by id; ~40% have a generic resident; door table builds when idle). 4,065 buildings enterable. Left shut: schools, churches/Legion Memorial, housing authority, apartments, garages/sheds/barns, salt dome, ~20 odd house outlines; no fire station bay (no building named as one). Published 1795272907-54ab.
- Interiors (Nov 21, later): Christian asked to open schools (overrides the earlier grounds-only rule), churches, the Legion Memorial, apartments (incl. housing authority, generic), garages, sheds, barns. js/core/rooms_civic.js ('c_': 14 school buildings, 20 churches furnished by tradition, Legion Memorial; NTC keeps its own campus) and js/core/rooms_out.js ('o_': 79 apartment buildings, 1,000 garages, 484 sheds, 61 barns; 2 garages + 13 sheds too small stay locked). 5,728 of 5,768 buildings enterable. 16.6 ms/frame. Published 1795280035-7fae.
- Sweep (Nov 21 evening): js/core/sweep.js (loads last; ?nosweep disables) moves 614 props off roads, drops 33 lake walls, 57 overlapping/in-lane parked cars, 7 bad lot shapes (SWEEP.lotTable); life.js traffic queues/yields/stops clear of crossings (overlaps 1146 -> ~50 in test); townfolk.js N/S Lincoln naming (43 lines, 17 corner signs). js/core/roomsweep.js: post-build reachability pass on every interior (248 had cut-off floor -> 0); Lakeside Market re-laid. Audit: scripts/qa/roomsweep_audit.py. Open: apartment lot and road tangle from Christian's screenshots not located; Uma unclear; Love coffee shop awaiting name/side/story. Published 1795312837-57c6.
- Intersections (Nov 21 night): js/core/sweep_ix_w.js + fixes/ix_w.js (?noixw disables; 260 junctions scored, 45 lot clusters redrawn 107->57, 15 street ends to centre lines, 2 Superior St hooks removed, 2,271 grey shoulder squares to grass; High School west lot tangle fixed) and js/core/sweep_ix_e.js + fixes/ix_e.js (641 junctions + 46 apartment lots; lot corners snapped to curbs, 2,134 grass notches paved, diagonal walks across lots cut, Spring Brook city lot behind 5th/Superior hand-traced). Open: hospital/Langlade Rd lots (~4224,3744), Neva Rd shopping-centre lane slivers (~3496,1348), Superior St width changes at junctions, Hwy 64 median. Load +0.65 s. Published 1795314330-d5ca.
- The Kove (Nov 21): 610 Century Ave split (fixes/kove.js): Gina's Pizzeria west half, The Kove east half (first guess; swap names to flip). kove_facade.js gives each half its sign; monument THE KOVE sign on the lawn. js/core/kove.js: inside laid out from Christian's 3 photos (sage shiplap counter, 3 menu boards, sign, bakery case, espresso/brewer, walnut tables, olive armchairs, globe lamp, plants, window ledge, corkboard, 2 restrooms, cooler); menu from the board categories (generic items, placeholder prices); generic barista and 2 regulars (the people in the photo are NOT in the game). Story hook: KOVE_STORY.onEnter / .board / .barista for Christian's story. Removed buildings (b.gone) are never enterable now. Published 1795314869-4bed.
- Nov 22: js/core/sprites.js — one procedural FF6-style people generator for all NPCs (outdoor adult 28 px, teen 25, kid 20; indoor 34 px; 4 directions, walk + idle; seasonal coats; cached per look); townfolk.js, folks.js, bars.js rewired, assets/townfolk/sprites.png no longer loaded. Jeremy and his girls now generic (Christian's family-sheet art may be wanted back — asked). Antigo High School lots rebuilt from photo (fixes/hs.js via /home/claude/hsgen/gen.py + campus block in sweep_ix_w.js): diagonal east lot (owner's spot), south lot on 10th Ave, hatched drop-off lane, west lot; 455 stall/hatch lines, 3 crosswalks, lamps on islands. Middle School lots: stepped edges, no stalls (left). Published 1795366651-6c90.
- Parked cars (Nov 22, Amron): sweep.js now drops cars with 2+ body points on grass/lawn/yard/woods/field/marsh outside a drawn lot (114), snaps cars into the nearest free painted space within 6 m (spaces = neighbouring parallel stall lines from STL; 8–13 m lines count as two spaces) (140 moved), drops cars among spaces with none free (72), and drops cars with a painted line through the body (47). 1,801 parked cars remain. Published 1795368106-9d50.
- Story mode unstuck (Nov 22): leaving YOUR ROOM put you on the sidewalk 26 m east of the Fig Tree, right behind the Respawn fan (respfan, r=0) who never moves, and the sidewalk west was blocked. townfolk.js now wraps tryMove: walk into a townsperson and they step aside (side first, then ahead, else swap); keep walking into a named NPC ~14 frames and you squeeze past (swap), and they step back to their home spot once it is clear. Christian's join adds two stand-in "where next" lines (fiction shelf, map, where the others join). Room exit line now says the store is just down Fifth Avenue to the west. Real-key test: room -> sidewalk -> Fig Tree -> counter -> Christian joins. Published 1795381102-0a4a.
- Work-in-progress label (Nov 22): the title screen now says "A HUGE WORK IN PROGRESS · EARLY BUILD" along the bottom (screens.js), per Christian. The same build is now live on theblessedfigtree.com at /unwritten/ (repo Blessedfig/blessedfig-shop, commit bf1b339), linked from a "Play the game" section with a matching work-in-progress notice.
- Invisible player in YOUR ROOM fixed (Nov 22): Christian: "in the story mode I cant move around or leave." Walking worked, but MODES.inside.draw skipped the whole character list when a floor has its own paint() (only myroom does), so the player was never drawn and the room looked frozen. inside.js now draws the player after fl.paint. The bedroom door is now a visible panel with a handle and hallway light under it. Real-key test: room -> door -> sidewalk -> Fig Tree.
