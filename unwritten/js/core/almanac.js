"use strict";
// =====================================================================
//  THE ANTIGO ALMANAC
//  Real, sourced patterns of Antigo's year, for players and for local businesses.
//  Ported from v0.36 into the rebuild (Nov 10, 2026). Every page is open from the title screen,
//  or straight from a link ending in #almanac. (Leaves in the world come back once the town is walkable at full scale.)
//  Numbers describe the country, state, county or region, never a single business.
//  Sources: research notes of Nov 8, 2026 (reports/Antigo seasonal tourism and store trends.md).
// =====================================================================
const MN='JFMAMJJASOND';
const ALM_OCC=[35.5,33.5,16.1,15.4,38.4,50.0,65.0,57.7,45.6,35.7,32.5,29.7]; // Rhinelander STR occupancy %, Jan..Dec (Oct 2025 - Sep 2026)
const ALM_BOOK=[1.23,0.80,0.84,0.86,0.93,0.84,0.86,1.30,1.07,0.84,0.87,1.55]; // U.S. bookstore sales index by month, 2022-2025
const ALM=[
 {id:'how',t:'HOW TO READ IT',open:1,
  l:["This almanac holds real numbers about Antigo's year: when people come, what they do, and where money moves. Every page names its source at the bottom.",
   "The numbers describe the country, the state, the county or the region. None of them describes a single business.",
   "Where Antigo has no data of its own, the page says so and uses the nearest honest stand-in.",
   "Leaves are hidden at the real places their numbers describe. Find them by walking. It is not financial advice; it is a good place to start asking questions."],
  src:"Compiled for The Blessed Fig Tree, 800 Fifth Ave, Antigo, November 2026."},
 {id:'yearw',t:'WINTER IN ANTIGO',at:{ll:[45.12273,-89.15311]},h:'Look near the visitors center on South Superior Street.',
  c:{k:'strip',on:[11,0,1],col:'#a8d8ff',marks:[[11,'PARADE · NIGHT MARKETS'],[0,'TRAILS OPEN WHEN SNOW ALLOWS'],[1,'SATURDAY EVENTS UP NORTH']]},
  l:["Snowmobile trails open and close by county announcement. In 2025-26 they opened Jan 1 and closed Mar 3. The county keeps more than 500 miles of trail through about ten clubs.",
   "Winter events cluster on Saturdays from late January through February, mostly in the northern towns: vintage sled shows, polar bear jumps, ice-fishing jamborees.",
   "Downtown in December: the Christmas Parade and chili cook-off, Wednesday night markets until mid-month, and Santa at the historical museum on weekends. Muzzleloader deer season runs into early December."],
  src:"Langlade County trail reports and events calendar; Antigo Chamber; Wisconsin DNR. Dates are for 2025-26 and 2026."},
 {id:'years',t:'SPRING IN ANTIGO',at:{ll:[45.15321,-89.14467]},h:'Look near the fairgrounds on Neva Road.',
  c:{k:'strip',on:[2,3,4],col:'#80e080',marks:[[2,'TRAILS CLOSE'],[3,'TROUT · BOOKSTORE DAY'],[4,'OPENER · ATV · OFF-ROAD']]},
  l:["March and April are the quietest months for visitors up north (see WHEN THE NORTHWOODS FILLS).",
   "Inland trout streams opened to harvest on Apr 4, 2026, about a month earlier than before. The general fishing opener is the first Saturday in May (May 2, 2026). ATV trails, more than 106 miles of them, open May 1.",
   "The Antigo Off-Road National runs at the fairgrounds in late May (May 29-31, 2026), with a kickoff parade the evening before. Independent Bookstore Day is the last Saturday in April."],
  src:"Wisconsin DNR; Langlade County trail reports and events calendar; Champ Off-Road 2026 schedule; American Booksellers Association."},
 {id:'yearu',t:'SUMMER IN ANTIGO',at:{ll:[45.13819,-89.14913]},h:'Look near Peaceful Valley Park on Field Street.',
  c:{k:'strip',on:[5,6,7],col:'#ffd860',marks:[[5,'FARMERS MARKET SATURDAYS'],[6,'THE FOURTH · COUNTY FAIR'],[7,'TATER TROT · DIRT TRACK']]},
  l:["Farmers market: Saturdays 8 am to noon, early June to late September, at Peaceful Valley Park (420 Field St).",
   "July 4: parade at 7 pm and fireworks at 9:20 pm, ending at the fairgrounds. The Langlade County Fair runs Thursday to Sunday at the turn of July and August (July 30 - Aug 2, 2026, its 140th year).",
   "August adds the Tater Trot (Aug 8) and national dirt-track races at the fairgrounds (Aug 21-22). Nearby: the Crandon Brush Run (mid-June) and the Hodag Country Festival in Rhinelander (mid-July)."],
  src:"Langlade County events calendar; Antigo Chamber; Travel Wisconsin. Dates are for 2026."},
 {id:'yearf',t:'FALL IN ANTIGO',at:{ll:[45.14113,-89.15658]},h:'Look near the night market at 902 Fifth Avenue.',
  c:{k:'strip',on:[8,9,10],col:'#f08040',marks:[[8,'BOW SEASON · COLOR · HARVEST'],[9,'COLOR · YOUTH HUNT'],[10,'GUN DEER · HOLIDAY RUN']]},
  l:["Sept 12 opened archery and crossbow deer, fall turkey and grouse (2026). Gun deer season runs nine days from the Saturday before Thanksgiving (Nov 21-29, 2026).",
   "Fall color runs about mid-September to mid-October. The county grows about 11,000 acres of potatoes a year, mostly seed; in 2019 the harvest peaked in the week of Sept 23.",
   "The holiday run starts downtown: Christmas Market on Fifth Ave (Nov 14), Downtown Widows Weekend on the gun-deer opener, Small Business Saturday (Nov 28), and Wednesday night markets at 902 Fifth Ave from Nov 11. Crandon's Labor Day races draw tens of thousands."],
  src:"Wisconsin DNR; UW-Madison Extension; Langlade County events calendar; Antigo Chamber, 2026."},
 {id:'books',t:'WHEN BOOKSTORES SELL',at:{ll:[45.14081,-89.15443]},h:'Look outside the bookstore at 800 Fifth Avenue.',
  c:{k:'months',v:ALM_BOOK,ref:1,refl:'AVERAGE MONTH',fmt:v=>v.toFixed(2)+'x',cap:'U.S. BOOKSTORE SALES BY MONTH'},
  l:["Across U.S. bookstores, December sells about 1.55 times an average month. February is the quietest, at about 0.80.",
   "January and August also run high, mostly from textbook buying, since the count includes college stores. June and July together are 13 to 16 percent of the year, under the 16.7 percent an even split would give.",
   "As arithmetic: a shop that sold $100 on an average day and followed this pattern would sell about $155 on a December day and about $80 on a February day."],
  src:"U.S. Census Bureau, Monthly Retail Trade, book stores (NAICS 451211), not seasonally adjusted; average monthly shares 2022-2025 (FRED MRTSSM451211USN)."},
 {id:'north',t:'WHEN THE NORTHWOODS FILLS',at:{t:[705,725]},h:'Look along the Springbrook Trail.',
  c:{k:'months',v:ALM_OCC,fmt:v=>v+'%',cap:'RENTAL NIGHTS BOOKED, RHINELANDER'},
  l:["Nobody publishes monthly visitor counts for Antigo. The nearest stand-in is short-term rentals in Rhinelander, in Oneida County to the north.",
   "Occupancy peaks in July at 65 percent and bottoms out in March and April at about 15 to 16 percent. June to August brought about 43 percent of the year's rental revenue. Nightly prices barely move ($215 to $245); the season shows in nights booked, not in price.",
   "A 2002 study of 20 northern counties, Langlade among them, found summer brought about 52 percent of traveler spending."],
  src:"AirROI Rhinelander market report, Oct 2025 - Sep 2026 (35 listings); Davidson-Peterson Associates for the Wisconsin Dept. of Tourism, Northwoods tourism profile (2002 data)."},
 {id:'visit',t:'VISITOR DOLLARS',at:{ll:[45.13818,-89.15290]},h:'Look near the historical museum on Superior Street.',
  c:{k:'years',rows:[['2022',77,'$77M'],['2023',82,'$82M'],['2024',84,'$84M'],['2025',87,'$87M']],cap:'TOURISM, TOTAL ECONOMIC IMPACT'},
  l:["Tourism's total economic impact in Langlade County set a record each year from 2022 to 2025.",
   "In 2025 visitors spent $60.3 million directly. Tourism supported 439 jobs and $4.6 million in state and local taxes. That spending averages about $165,000 a day, though it is not spread evenly through the year.",
   "Visitor spending grew 2.8 percent in 2025, below the state's 4.4 percent and close to the 2.7 percent inflation rate."],
  src:"Wisconsin Department of Tourism (Travel Wisconsin), economic impact of tourism, county data 2022-2025."},
 {id:'neigh',t:'THE NEIGHBORS',at:{ll:[45.13937,-89.15473]},h:'Look near the post office on Clermont Street.',
  c:{k:'hbars',lw:78,vw:44,hl:5,rows:[['ONEIDA',302.8,'$302.8M'],['VILAS',302.6,'$302.6M'],['MARATHON',282.2,'$282.2M'],['SHAWANO',77.6,'$77.6M'],['LINCOLN',74.4,'$74.4M'],['LANGLADE',58.2,'$58.2M'],['FOREST',15.4,'$15.4M'],['MENOMINEE',3.4,'$3.4M']]},
  l:["Direct visitor spending in 2024, by county. Langlade ranked 46th of Wisconsin's 72 counties, with about 0.36 percent of the state total.",
   "The lake counties to the north, Oneida and Vilas, each drew about five times as much. Lincoln and Shawano drew 28 to 33 percent more than Langlade."],
  src:"Wisconsin Department of Tourism, county economic impact data, 2024; rank computed from the 72-county table."},
 {id:'cars',t:'CARS PAST THE DOOR',at:{ll:[45.14090,-89.15295]},h:'Look where Fifth Avenue crosses Superior Street.',
  c:{k:'hbars',lw:136,vw:62,hl:0,rows:[['DOWNTOWN, US 45/47/52/64',13200,'12,500-13,200'],['WI 52/64 EAST OF US 45',8500,'8,500'],['US 45 AT THE CITY EDGES',8400,'7,600-8,400'],['5TH AVE NEXT TO US 45',4900,'4,800-4,900'],['5TH AVE FARTHER OUT',3800,'2,100-3,800']]},
  l:["Average vehicles per day, 2025. The busiest count in the city is the downtown stretch where four highways share one road.",
   "Counts drop by a third or more at the city's edges. Monthly or seasonal swings on these roads were not available for this page."],
  src:"Wisconsin Department of Transportation, annual average daily traffic (AADT) counts, 2025."},
 {id:'homes',t:'SEASONAL HOMES',at:{p:'dam',d:[-10,-6]},h:'Look along the shore of Antigo Lake.',
  c:{k:'hbars',lw:84,vw:40,hl:3,rows:[['FOREST',49.6,'49.6%'],['VILAS',48.6,'48.6%'],['ONEIDA',36.7,'36.7%'],['LANGLADE',21.5,'21.5%'],['WISCONSIN',7.1,'7.1%']]},
  l:["Share of all housing held for seasonal or recreational use, 2010 Census. Langlade had 2,643 seasonal homes, three times the state's share, up from 2,158 in 2000.",
   "Newer counts need a Census data request and were not pulled for this page."],
  src:"U.S. Census Bureau, 2000 and 2010 Census, housing units vacant for seasonal, recreational or occasional use."},
 {id:'snow',t:'SNOW YEARS',at:{trail:0},h:'Look at the north end of the Springbrook Trail.',
  c:{k:'tiles',cols:3,rows:[['2023-24','LITTLE SNOW',''],['2024-25','ABOUT 1 WEEK','OF TRAIL RIDING'],['2025-26','JAN 1 - MAR 3','BEST IN 3 YEARS']]},
  l:["Winter visits here ride on snow. Trails open only when the county says there is enough.",
   "The winters of 2023-24 and 2024-25 had little snow; in 2024-25 Langlade had about one week of snowmobiling. 2025-26 was the strongest winter in three years.",
   "Planning for a winter with almost no trail days is part of the pattern."],
  src:"Langlade County trail reports; WXPR regional reporting, 2024-2026."},
 {id:'tax',t:"THE COUNTY'S HALF CENT",at:{t:[578,769]},h:'Look near the Palace Theatre on Fifth Avenue.',
  c:{k:'months',v:[0.868,1.107,0.781,0.655,1.069,0.807,1.224,1.255,0.985,1.253,0.992,1.004],ref:1,refl:'AVERAGE',fmt:v=>v.toFixed(2),cap:'COUNTY SALES TAX PAID OUT, BY MONTH'},
  l:["Each taxable sale adds half a cent per dollar for the county, on top of the state's five cents. A $20 sale sends $1.00 to the state and $0.10 to the county.",
   "The county received $2.35 million in 2024 and $2.50 million in 2025 (up 6.3 percent); January to October 2026 ran 3 percent ahead.",
   "Across 2024 and 2025, payouts ran highest in July, August and October and lowest in March, April and June. These are payout months, and the lag after a sale is not shown here, so read the shape as approximate."],
  src:"Wisconsin Department of Revenue, county sales tax distributions 2024-2026; index = month divided by that year's monthly average, 2024-2025."},
 {id:'pull',t:'WHERE SHOPPERS SPEND',at:{t:[728,222]},h:'Look near the bowling alley on the north side.',
  c:{k:'hbars',lw:118,vw:34,ref:1,hl:7,rows:[['GENERAL MERCHANDISE',2.443,'2.44'],['BUILDING & GARDEN',2.320,'2.32'],['GAS STATIONS',1.978,'1.98'],['CARS & PARTS',1.621,'1.62'],['HEALTH & PERSONAL',1.211,'1.21'],['FURNITURE',0.872,'0.87'],['MISC. STORES',0.813,'0.81'],['BOOK, HOBBY, MUSIC',0.729,'0.73'],['CLOTHING',0.670,'0.67']]},
  l:["A pull factor above 1 means a county sells more in a category than its own residents would be expected to buy; below 1 means residents buy part of it elsewhere.",
   "In 2022 Langlade's retail pull factor was 1.41, so the county draws shoppers from beyond its borders. The strongest categories were general merchandise, building supplies, fuel and cars.",
   "Book, hobby, sporting-goods and music stores scored 0.73: about 73 cents of sales here for every dollar the state pattern predicts."],
  src:"Deller and Zumbrunnen, UW-Madison Extension, A Trade Area Analysis of Wisconsin Retail and Service Markets (2022 data), August 2023."},
 {id:'jobs',t:'WHO WORKS HERE',at:{t:[600,196]},h:'Look among the plants on Amron Avenue.',
  c:{k:'hbars',lw:118,vw:40,hl:1,rows:[['TRADE & TRANSPORT',2177,'2,177'],['MANUFACTURING',1319,'1,319'],['EDUCATION & HEALTH',1223,'1,223'],['LEISURE & HOSPITALITY',645,'645'],['PUBLIC ADMINISTRATION',405,'405'],['PROFESSIONAL',383,'383'],['FARMS, FOREST, MINES',374,'374'],['FINANCE',301,'301'],['ALL OTHER',443,'443']]},
  l:["Jobs located in Langlade County, 2023 average: 7,268. Stores, trucking and utilities are the largest group; manufacturing is second, about one job in five.",
   "In 2024 the county's unemployment rate was 3.5 percent (state 3.1), and about 57 percent of adults were in the labor force (state 65.4)."],
  src:"Wisconsin DWD, Langlade County Workforce Profile (QCEW 2023), rev. May 2025; NCWRPC Langlade County profile, 2026."},
 {id:'income',t:'WHAT HOUSEHOLDS EARN',at:{t:[935,597]},h:'Look near the county services building on Langlade Road.',
  c:{k:'hbars',lw:84,vw:52,hl:0,rows:[['ANTIGO',45520,'$45,520'],['LANGLADE CO.',55878,'$55,878'],['WISCONSIN',77485,'$77,485']]},
  l:["Median household income, 2020-2024 survey estimates. Antigo's figure has a margin of error of about plus or minus $5,800.",
   "Poverty rates: Antigo 19.5 percent, the county 13.5, the state 10.6.",
   "Transfer payments such as Social Security and Medicare made up 31.6 percent of county personal income in 2022, against 18.9 percent statewide."],
  src:"U.S. Census Bureau, American Community Survey 5-year estimates, 2020-2024; U.S. Bureau of Economic Analysis, county personal income, 2022."},
 {id:'town',t:'THE TOWN IN NUMBERS',at:{t:[572,742]},h:'Look near the senior center on Edison Street.',
  c:{k:'tiles',cols:2,rows:[['8,100','PEOPLE, 2020 CENSUS',''],['1.93','PEOPLE PER HOUSEHOLD',''],['$104,800','MEDIAN HOME VALUE','STATE: $266,500'],['26%','AGE 65 AND OVER','']]},
  l:["Antigo counted 8,100 people in the 2020 Census. Estimates for 2025 put it at 8,036 (state) and 8,060 (Census Bureau).",
   "Household size and home value are 2020-2024 survey estimates. About one resident in four is 65 or older."],
  src:"U.S. Census Bureau: 2020 Census, ACS 2020-2024, QuickFacts, July 2025 estimate; Wisconsin DOA estimate, Jan 1, 2025."},
 {id:'people',t:'PEOPLE OVER TIME',at:{ll:[45.139881,-89.157369]},h:'Look near the old depot on Morse Street.',
  c:{k:'line',v:[4424,5145,7196,8451,8610,9495,9902,9691,9005,8653,8276,8560,8234,8100],lab:['1890','1900','1910','1920','1930','1940','1950','1960','1970','1980','1990','2000','2010','2020'],every:2,min:4000,hl:[6,13],fmt:v=>String(v).replace(/\B(?=(\d{3})+(?!\d))/g,','),cap:'ANTIGO, PEOPLE COUNTED EACH CENSUS'},
  l:["Antigo grew fast with the railroad and the sawmills: 4,424 people in 1890 and 8,451 by 1920. It peaked at 9,902 in 1950 and counted 8,100 in 2020.",
   "The county peaked earlier, at 23,227 in 1940, and has stayed between about 19,200 and 20,700 since 1960.",
   "The county is older now: its median age rose from 40 in 2000 to 49.5 in 2020, and the share 65 or older from 18.8 to 25.2 percent.",
   "Across rural America, counties have lost roughly a quarter or more of their expected young adults each decade since the 1970s, while gaining adults aged 55 to 74."],
  src:"U.S. Census Bureau decennial counts, 1890-2020 (county and city tables); 2000 and 2020 Census age data; Johnson and Winkler, Migration signatures across the decades, Demographic Research 32 (2015), 1065-1080."},
 {id:'value',t:'WHAT THE TOWN IS WORTH',at:{t:[582,686]},h:'Look near the courthouse on Clermont Street.',
  c:{k:'hbars',lw:96,vw:40,rows:[['RESIDENTIAL',63.4,'63.4%'],['COMMERCIAL',31.4,'31.4%'],['MANUFACTURING*',5.2,'5.2%']]},
  l:["The state values all taxable property in the City of Antigo at $599 million (2025), one fifth of the county's $3.0 billion. The city holds about 71 percent of the county's commercial value.",
   "Countywide, commercial property is 8.8 percent of value against 19.7 percent statewide; homes and forest land weigh more here.",
   "* The manufacturing row was unlabeled in the source; its numbers complete the table, so treat it as inferred."],
  src:"Wisconsin Department of Revenue, Statement of Equalized Values, 2025 (including TIF districts)."},
 {id:'aid',t:'WHEN PUBLIC MONEY MOVES',at:{t:[565,716]},h:'Look near the city offices on Edison Street.',
  c:{k:'strip',on:[1,2,6,10],col:'#c0b0ff',marks:[[1,'TAX SETTLEMENT'],[2,'LOTTERY CREDIT'],[6,'STATE AID 15%'],[10,'STATE AID 85%']]},
  l:["In the Town of Antigo, 70 percent of 2025 property taxes had come in by the February settlement.",
   "The state pays its lottery and gaming credit in March, and county and municipal aid in two parts: about 15 percent in late July and 85 percent in mid-November.",
   "In 2025 Langlade County received $710,324 in county and municipal aid and $547,388 in supplemental aid."],
  src:"Wisconsin Department of Revenue, local government payment schedules and settlement reports, 2025."},
 {id:'farm',t:'THE ANTIGO FLATS',at:{t:[1146,356]},h:'Look at the far east edge of the map, out in the fields.',
  c:{k:'hbars',lw:128,vw:44,hl:0,rows:[['VEGETABLES & POTATOES',67.7,'$67.7M'],['MILK',52.4,'$52.4M'],['ALL OTHER (COMPUTED)',25.6,'$25.6M']]},
  l:["The farmland around Antigo is an outwash plain capped with windblown silt. Its soil, Antigo silt loam, has been Wisconsin's state soil since 1983; its official type location lies just past the east edge of this map, near state historical marker 280.",
   "The 2022 Census of Agriculture counted 333 farms (down 23 percent since 2017) selling $145.7 million (up 42 percent). Potatoes covered 10,562 acres, and the county ranked 4th in Wisconsin for vegetable and potato sales.",
   "UW Extension calls the county first in the state for seed potatoes."],
  src:"USDA NASS, 2022 Census of Agriculture county profile; UW-Madison Extension; NRCS official series description, Antigo series; WGNHS Information Circular 52 (1986)."},
 {id:'buy',t:'WHAT BOOKS SELL',at:{t:[606,752]},h:'Look near the public library on Clermont Street.',
  c:{k:'hbars',lw:112,vw:46,rows:[['SELF-HELP',14.7,'+14.7%'],['RELIGION',5.4,'+5.4%'],['ALL PRINT BOOKS',0.3,'+0.3%'],['ADULT NONFICTION',-1.5,'-1.5%'],['BIOGRAPHY & MEMOIR',-7.0,'-7.0%']]},
  l:["U.S. print book sales held steady in 2025 at 762.4 million copies. Within nonfiction, self-help and religion grew while biography and memoir fell.",
   "Independent stores keep opening: the booksellers' association counted 3,417 member companies in May 2026, up 151 percent since 2020, and 605 new independent stores opened in 2025."],
  src:"Circana BookScan, via Publishers Weekly, January 2026; American Booksellers Association, May 2026."},
 {id:'tea',t:'TEA ON THE SHELF',at:{p:'figPlanter',d:[2,2]},h:'Look by the planter at the bookstore.',
  c:{k:'hbars',lw:118,vw:46,rows:[['U.S. TEA SALES ($)',2.6,'+2.6%'],['U.S. TEA VOLUME',0.9,'+0.9%'],['GREEN TEA IMPORTS',4.9,'+4.9%'],['BLACK TEA IMPORTS',-11.7,'-11.7%']]},
  l:["U.S. bag and loose-leaf tea sales rose 2.6 percent to $1.7 billion (year to April 2025) on volume up 0.9 percent. In 2025 green tea imports rose and black tea imports fell; tea from Japan rose 41 percent.",
   "The rules: a tea sold for taste is a food. A label or sign saying it treats a disease makes it an unapproved drug under FDA rules, and the FTC expects health claims to rest on solid trials."],
  src:"Circana via the Tea Association of the U.S.A.; U.S. FDA, structure/function claims (21 CFR 101.93); FTC Health Products Compliance Guidance (2022)."},
 {id:'local',t:'SHOP-LOCAL DAYS',at:{ll:[45.14096,-89.15307]},h:'Look near the veterans mural at 710 Fifth Avenue.',
  c:{k:'strip',on:[3,10],col:'#ffd860',marks:[[3,'INDEPENDENT BOOKSTORE DAY'],[10,'SMALL BUSINESS SATURDAY']]},
  l:["Independent Bookstore Day (last Saturday in April) drew more than 1,600 stores in 2025. No overall sales lift has been published; stores report it one by one.",
   "Small Business Saturday falls after Thanksgiving; its large national totals come from its sponsor's surveys. Passport programs grow: Chicago's bookstore-day passport went from about 150 finished in 2017 to more than 700 in 2023.",
   "The plainest measure is a shop's own count: the same day last year against the same day this year."],
  src:"Publishers Weekly, Independent Bookstore Day 2025; American Express (Small Business Saturday); Chicago Independent Bookstore Day reports."},
 {id:'sum',t:'WHAT THE YEAR SAYS',unlock:12,h:'Opens by itself after twelve leaves are found.',
  c:{k:'two',a:ALM_BOOK,b:ALM_OCC.map(v=>v/(ALM_OCC.reduce((s,x)=>s+x,0)/12)),an:'U.S. BOOKSTORE SALES',bn:'NORTHWOODS NIGHTS BOOKED'},
  l:["Side by side, as indexes where 1.0 is an average month: national bookstore sales peak in December, while Northwoods visitor stays peak in July.",
   "A shop here can see two busy seasons, summer visitors and holiday gifts. March and April are low on both lines.",
   "Events stack on Saturdays and on a few big weekends: the fishing opener, the Off-Road National, the Fourth, the Fair, the gun-deer opener and the holiday run. A shop's own records, kept month by month, will say more than any average here."],
  src:"Computed from two pages of this almanac: Census bookstore sales 2022-2025 and Rhinelander rental occupancy 2025-26."}
];
// ---------- state ----------
let ALMV=null;
function almCount(){return G&&G.alm?Object.keys(G.alm).length:0;}
function almIsOpen(p){return !!((ALMV&&ALMV.all)||p.open||(G&&G.alm&&G.alm[p.id])||(p.unlock&&almCount()>=p.unlock));}
const sfx=window.sfx||{sel(){},ok(){},bump(){},insight(){}};
// input, in the rebuild's terms
function almNav(){return pressed.up?'up':pressed.down?'down':pressed.left?'left':pressed.right?'right':null;}
// ---------- reader ----------
function almOpen(all){ALMV={all:!!all,sel:0,top:0,page:-1,scroll:0};}
function almTurn(dir){const V=ALMV;let i=V.page;for(let k=0;k<ALM.length;k++){i=(i+dir+ALM.length)%ALM.length;if(almIsOpen(ALM[i]))break;}
  if(i!==V.page){V.page=i;V.sel=i;V.scroll=0;sfx.sel();}}
function almUpdate(){const V=ALMV;if(!V)return true;const menuNav=almNav(),pressA=pressed.a,pressB=pressed.b;
  if(V.page>=0){if(pressB){V.page=-1;sfx.sel();return false;}
    if(menuNav==='left')almTurn(-1);else if(menuNav==='right'||pressA)almTurn(1);
    if(menuNav==='down')V.scroll++;if(menuNav==='up')V.scroll=Math.max(0,V.scroll-1);return false;}
  if(pressB){ALMV=null;return true;}
  if(menuNav==='up'){V.sel=(V.sel+ALM.length-1)%ALM.length;sfx.sel();}if(menuNav==='down'){V.sel=(V.sel+1)%ALM.length;sfx.sel();}
  if(pressA){if(almIsOpen(ALM[V.sel])){V.page=V.sel;V.scroll=0;sfx.ok();}else sfx.bump();}
  const vis=13;if(V.sel<V.top)V.top=V.sel;if(V.sel>=V.top+vis)V.top=V.sel-vis+1;return false;}
function almDraw(){const V=ALMV;if(!V)return;R(0,0,SW,SH,'#0a0c1c');if(V.page>=0){almDrawPage(ALM[V.page]);return;}
  win(4,4,SW-8,SH-8);txt('THE ANTIGO ALMANAC',14,12,'#ffd860');
  txt(V.all?'ALL PAGES OPEN':'PAGES '+ALM.filter(almIsOpen).length+'/'+ALM.length,SW-14,13,'#a8e0a0','right',SMALL);
  txt("Real numbers about Antigo's year. A source on every page.",14,26,'#aab','left',SMALL);
  const vis=13;for(let r=0;r<vis;r++){const i=V.top+r;if(i>=ALM.length)break;const p=ALM[i],y=40+r*12,open=almIsOpen(p),s=i===V.sel;
    if(s)txt('▶',10,y,'#ffd860');txt(open?p.t:'· · · · ·',22,y,open?(s?'#fff':'#c8c8dc'):'#5a5a70');}
  if(V.top>0)txt('▲',SW-14,40,'#ffd860','right',SMALL);if(V.top+vis<ALM.length)txt('▼',SW-14,184,'#ffd860','right',SMALL);
  const cur=ALM[V.sel];if(!almIsOpen(cur))wrap(cur.h||'',SW-32,SMALL).slice(0,2).forEach((l,k)=>txt(l,16,198+k*9,'#a8e0a0','left',SMALL));
  txt('A READ   B BACK',SW-14,SH-16,'#889','right',SMALL);}
function almDrawPage(p){const V=ALMV;win(4,4,SW-8,SH-8);txt(p.t,12,11,'#ffd860');txt((ALM.indexOf(p)+1)+'/'+ALM.length,SW-12,12,'#889','right',SMALL);
  if(p.c)almChart(p.c,10,23,SW-20,80);
  const ty=p.c?108:28,L=[];
  p.l.forEach((s,k)=>{if(k)L.push({s:'',h:4});wrap(s,SW-28,SMALL).forEach(x=>L.push({s:x,c:'#e8e4f0',h:9}));});
  L.push({s:'',h:5});wrap('SOURCE: '+p.src,SW-28,SMALL).forEach(x=>L.push({s:x,c:'#8a8aa8',h:9}));
  const room=SH-28-ty;let tot=0,maxs=0;for(let i=L.length-1;i>=0;i--){tot+=L[i].h;if(tot>room){maxs=i+1;break;}}
  V.scroll=Math.min(V.scroll,maxs);let y=ty;for(let i=V.scroll;i<L.length;i++){if(y+L[i].h>SH-26)break;if(L[i].s)txt(L[i].s,13,y,L[i].c,'left',SMALL);y+=L[i].h;}
  if(maxs>0)txt(V.scroll<maxs?'▼ MORE':'▲',SW-12,SH-26,'#ffd860','right',SMALL);
  txt('◀ ▶ TURN    ▲ ▼ SCROLL    B BACK',SW/2,SH-16,'#778','center',SMALL);}
function almChart(c,x,y,w,h){R(x,y,w,h,'rgba(140,150,220,0.07)');R(x,y+h-1,w,1,'rgba(140,150,220,0.25)');
  if(c.k==='months'){const v=c.v,top=Math.max(...v),mx=top*1.18,bw=Math.floor((w-6)/12),base=y+h-10,sc=(h-24)/mx,hi=v.indexOf(top),lo=v.indexOf(Math.min(...v));
    if(c.ref!=null){const ry=Math.round(base-c.ref*sc);for(let i=x+2;i<x+w-2;i+=4)R(i,ry,2,1,'#9a9ac0');if(c.refl)txt('DASHED LINE = '+c.refl,x+4,y+12,'#9a9ac0','left',SMALL);}
    v.forEach((val,i)=>{const bx=x+3+i*bw,bh=Math.max(1,Math.round(val*sc)),col=i===hi?'#ffd860':i===lo?'#e07a6a':'#6f8fd0';
      R(bx+2,base-bh,bw-4,bh,col);R(bx+2,base-bh,bw-4,1,'rgba(255,255,255,.35)');txt(MN[i],bx+bw/2,base+2,'#aab','center',SMALL);});
    [[hi,'#ffd860'],[lo,'#e07a6a']].forEach(([i,col])=>txt(c.fmt?c.fmt(v[i]):String(v[i]),x+3+i*bw+bw/2,base-Math.round(v[i]*sc)-8,col,'center',SMALL));
    if(c.cap)txt(c.cap,x+4,y+3,'#aab','left',SMALL);return;}
  if(c.k==='hbars'){const rows=c.rows,n=rows.length,rh=Math.min(12,Math.floor((h-4)/n)),lw=c.lw||110,vw=c.vw||46,bx0=x+lw,bw=w-lw-vw-6;
    const vals=rows.map(r=>r[1]),mn=Math.min(0,...vals),mx=Math.max(0,c.ref||0,...vals),span=(mx-mn)||1,zx=bx0+Math.round((-mn/span)*bw),oy=y+Math.max(2,Math.floor((h-n*rh)/2));
    if(c.ref!=null){const rx=bx0+Math.round(((c.ref-mn)/span)*bw);for(let j=y+2;j<y+h-2;j+=4)R(rx,j,1,2,'#9a9ac0');}
    if(mn<0)R(zx,y+2,1,h-4,'#667');
    rows.forEach((r,i)=>{const ry=oy+i*rh,val=r[1],len=Math.max(1,Math.round(Math.abs(val)/span*bw)),col=val<0?'#e07a6a':i===c.hl?'#ffd860':'#6f8fd0',ty2=ry+Math.floor((rh-6)/2);
      txt(r[0],x+4,ty2,i===c.hl?'#fff':'#ccd','left',SMALL);R(val<0?zx-len:zx,ry+2,len,rh-4,col);txt(r[2],x+w-4,ty2,i===c.hl?'#ffd860':'#ccd','right',SMALL);});return;}
  if(c.k==='years'){const rows=c.rows,n=rows.length,bw=Math.floor((w-10)/n),base=y+h-10,mx=Math.max(...rows.map(r=>r[1]))*1.2,sc=(h-26)/mx;
    rows.forEach((r,i)=>{const bx=x+5+i*bw,bh=Math.round(r[1]*sc),col=i===n-1?'#ffd860':'#6f8fd0';R(bx+Math.round(bw*0.25),base-bh,Math.round(bw*0.5),bh,col);
      txt(r[0],bx+bw/2,base+2,'#aab','center',SMALL);txt(r[2],bx+bw/2,base-bh-8,i===n-1?'#ffd860':'#ccd','center',SMALL);});
    if(c.cap)txt(c.cap,x+4,y+3,'#aab','left',SMALL);return;}
  if(c.k==='strip'){const cw=Math.floor((w-4)/12);for(let i=0;i<12;i++){const on=c.on.includes(i),cx=x+2+i*cw;R(cx+1,y+6,cw-2,20,on?(c.col||'#9ad08a'):'#24263c');txt(MN[i],cx+cw/2,y+12,on?'#101020':'#5a5a70','center');}
    (c.marks||[]).forEach(([mi,label],k)=>{const cx=x+2+mi*cw+Math.floor(cw/2),row=k%3,ly=y+34+row*14;R(cx,y+27,1,ly-y-26,'#ffd860');
      const al=cx>x+w*0.62?'right':cx<x+w*0.38?'left':'center';txt(label,al==='right'?cx+2:al==='left'?cx-2:cx,ly,'#ffd860',al,SMALL);});return;}
  if(c.k==='tiles'){const n=c.rows.length,cols=c.cols||2,rws=Math.ceil(n/cols),tw=Math.floor((w-6)/cols),th=Math.floor((h-6)/rws);
    c.rows.forEach((r,i)=>{const tx=x+3+(i%cols)*tw,ty2=y+3+Math.floor(i/cols)*th;R(tx+2,ty2+2,tw-4,th-4,'rgba(120,140,220,0.14)');
      txt(r[0],tx+tw/2,ty2+Math.max(5,th/2-12),'#ffd860','center');txt(r[1],tx+tw/2,ty2+Math.max(17,th/2),'#ccd','center',SMALL);if(r[2])txt(r[2],tx+tw/2,ty2+Math.max(26,th/2+9),'#889','center',SMALL);});return;}
  if(c.k==='line'){const v=c.v,n=v.length,lo=c.min!=null?c.min:Math.min(...v)*0.9,hi=Math.max(...v)*1.12,X=i=>Math.round(x+16+i*((w-32)/(n-1))),Y=val=>Math.round(y+h-12-(val-lo)/(hi-lo)*(h-28));
    for(let i=0;i<n-1;i++){const x0=X(i),y0=Y(v[i]),x1=X(i+1),y1=Y(v[i+1]),st=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))||1;for(let s=0;s<=st;s++)R(Math.round(x0+(x1-x0)*s/st),Math.round(y0+(y1-y0)*s/st),1,2,'#6f8fd0');}
    v.forEach((val,i)=>{const hl=(c.hl||[]).includes(i);R(X(i)-1,Y(val)-1,3,3,hl?'#ffd860':'#9ab4f0');if(i%(c.every||1)===0||i===n-1)txt(c.lab[i],X(i),y+h-9,'#aab','center',SMALL);
      if(hl)txt(c.fmt?c.fmt(val):String(val),Math.min(x+w-20,Math.max(x+20,X(i))),Y(val)-9,'#ffd860','center',SMALL);});
    if(c.cap)txt(c.cap,x+4,y+3,'#aab','left',SMALL);return;}
  if(c.k==='two'){const A=c.a,B=c.b,mx=Math.max(...A,...B)*1.12,bw=Math.floor((w-6)/12),base=y+h-10,sc=(h-26)/mx,hb=Math.floor(bw/2)-1,ry=Math.round(base-sc);
    for(let i=x+2;i<x+w-2;i+=4)R(i,ry,2,1,'#9a9ac0');
    A.forEach((v,i)=>{const bx=x+3+i*bw;R(bx+1,base-Math.round(v*sc),hb,Math.round(v*sc),'#6f8fd0');R(bx+1+hb,base-Math.round(B[i]*sc),hb,Math.round(B[i]*sc),'#9ad08a');txt(MN[i],bx+bw/2,base+2,'#aab','center',SMALL);});
    R(x+5,y+4,6,6,'#6f8fd0');txt(c.an,x+14,y+4,'#ccd','left',SMALL);R(x+5,y+13,6,6,'#9ad08a');txt(c.bn,x+14,y+13,'#ccd','left',SMALL);return;}}

// the reader as a mode of its own (from the title, or #almanac)
let ALM_RETURN='title';   // the Almanac can be opened from the title or from the bookstore counter
MODES.almanac={enter(){almOpen(true);},update(){if(almUpdate()){ALMV=null;const r=ALM_RETURN;ALM_RETURN='title';setMode(r);}},draw(){almDraw();}};
