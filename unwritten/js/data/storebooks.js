"use strict";
// =====================================================================
//  THE BOOKSTORE PLAYSTYLE: books, customers' requests, regulars and store events (Nov 14).
//  The titles are real classics, all published before 1930, so every one is in the public domain in the US. Each blurb is
//  written fresh for the game. Stock is counted by section (as in Tiny Bookshop); a title only matters when you hand-sell it.
//  Tags drive the match: a customer asks for two tags, and the book you pick is scored by how many it has.
// =====================================================================
// the sections on the floor: the five shelf classes of the main game, plus classics, kids and nonfiction
// list: average cover price in cents (placeholders); color: spine color in the pictures
const STORE_SECS = [
  { k: 'fantasy', name: 'Fantasy', cls: 'Questor', list: 1800, color: '#4a8a5a' },
  { k: 'mystery', name: 'Mystery', cls: 'Sleuth', list: 1700, color: '#3a4a8a' },
  { k: 'romance', name: 'Romance', cls: 'Devotee', list: 1600, color: '#c85a7a' },
  { k: 'scifi', name: 'Sci-Fi', cls: 'Futurist', list: 1800, color: '#4aa8c8' },
  { k: 'horror', name: 'Horror', cls: 'Nightreader', list: 1700, color: '#5a2a3a' },
  { k: 'classics', name: 'Classics', cls: '', list: 1400, color: '#a8823a' },
  { k: 'kids', name: 'Kids', cls: '', list: 900, color: '#e8b040' },
  { k: 'nonfiction', name: 'Nonfiction', cls: '', list: 2000, color: '#8a6a4a' },
];
// [id, title, author, year, section, tags, blurb]
const STORE_BOOKS = [
  ['oz', 'The Wonderful Wizard of Oz', 'L. Frank Baum', 1900, 'fantasy', ['magic', 'journey', 'kids', 'short'], 'A Kansas girl, a cyclone, and a yellow brick road to a wizard who may not be what he seems.'],
  ['alice', 'Alice\'s Adventures in Wonderland', 'Lewis Carroll', 1865, 'fantasy', ['dream', 'funny', 'kids', 'short'], 'A girl follows a white rabbit down a hole into a world where nothing makes sense, on purpose.'],
  ['goblin', 'The Princess and the Goblin', 'George MacDonald', 1872, 'fantasy', ['magic', 'monster', 'kids'], 'Goblins dig under a mountain castle. A miner\'s boy and a princess are all that stand in their way.'],
  ['elfland', 'The King of Elfland\'s Daughter', 'Lord Dunsany', 1924, 'fantasy', ['magic', 'romance', 'dream'], 'A prince marries a princess out of Elfland, and the border between the worlds won\'t stay put.'],
  ['phantastes', 'Phantastes', 'George MacDonald', 1858, 'fantasy', ['dream', 'magic', 'journey'], 'A young man wakes to find his bedroom turning into a forest, and walks on into fairyland.'],
  ['ouroboros', 'The Worm Ouroboros', 'E. R. Eddison', 1922, 'fantasy', ['war', 'long', 'magic'], 'Lords of rival kingdoms fight a long, grand war, told in rich old-style English.'],
  ['hound', 'The Hound of the Baskervilles', 'Arthur Conan Doyle', 1902, 'mystery', ['detective', 'spooky', 'short'], 'Sherlock Holmes, a family curse, and something howling on the moor at night.'],
  ['scarlet', 'A Study in Scarlet', 'Arthur Conan Doyle', 1887, 'mystery', ['detective', 'short'], 'The first Holmes story: how he met Watson, and a murder with a word written in red on the wall.'],
  ['moonstone', 'The Moonstone', 'Wilkie Collins', 1868, 'mystery', ['detective', 'twist', 'long'], 'A stolen diamond, a country house, and the story told in turn by everyone who was there.'],
  ['ackroyd', 'The Murder of Roger Ackroyd', 'Agatha Christie', 1926, 'mystery', ['detective', 'twist', 'small-town'], 'Poirot in a quiet English village, and an ending readers still argue about.'],
  ['steps', 'The Thirty-Nine Steps', 'John Buchan', 1915, 'mystery', ['chase', 'spy', 'short'], 'A man on the run across Scotland, with a secret and a dead man\'s notebook.'],
  ['whitewoman', 'The Woman in White', 'Wilkie Collins', 1859, 'mystery', ['twist', 'long', 'spooky'], 'A woman in white on a moonlit road starts a plot of swapped names and stolen fortunes.'],
  ['pride', 'Pride and Prejudice', 'Jane Austen', 1813, 'romance', ['funny', 'sisters', 'slow-burn'], 'Elizabeth Bennet and Mr. Darcy get each other wrong, then right. Sharp and very funny.'],
  ['persuasion', 'Persuasion', 'Jane Austen', 1817, 'romance', ['second-chance', 'short'], 'Eight years after she turned him down, Anne meets him again. A quiet second chance.'],
  ['eyre', 'Jane Eyre', 'Charlotte Bronte', 1847, 'romance', ['dark', 'gothic', 'slow-burn'], 'An orphan turned governess, a brooding employer, and a secret locked in the attic.'],
  ['wuthering', 'Wuthering Heights', 'Emily Bronte', 1847, 'romance', ['dark', 'obsession', 'gothic'], 'Love that turns into revenge across two generations on the Yorkshire moors.'],
  ['northsouth', 'North and South', 'Elizabeth Gaskell', 1855, 'romance', ['slow-burn', 'work', 'class'], 'A minister\'s daughter and a mill owner clash over strikes, pride and the town they share.'],
  ['roomview', 'A Room with a View', 'E. M. Forster', 1908, 'romance', ['funny', 'travel', 'short'], 'A young Englishwoman in Florence chooses between what is proper and what is true.'],
  ['timemachine', 'The Time Machine', 'H. G. Wells', 1895, 'scifi', ['time', 'short', 'future'], 'An inventor rides 800,000 years ahead and finds humanity split in two.'],
  ['worlds', 'The War of the Worlds', 'H. G. Wells', 1898, 'scifi', ['aliens', 'invasion', 'monster'], 'Cylinders from Mars land outside London. Then the tripods stand up.'],
  ['leagues', 'Twenty Thousand Leagues Under the Seas', 'Jules Verne', 1870, 'scifi', ['sea', 'adventure', 'long'], 'Captain Nemo and his submarine, the Nautilus, under every ocean on Earth.'],
  ['center', 'Journey to the Center of the Earth', 'Jules Verne', 1864, 'scifi', ['underground', 'adventure', 'journey'], 'A professor, his nephew and a guide climb down a volcano in Iceland and keep going.'],
  ['moreau', 'The Island of Doctor Moreau', 'H. G. Wells', 1896, 'scifi', ['island', 'monster', 'dark'], 'A shipwrecked man reaches an island where a scientist is reshaping animals into people.'],
  ['herland', 'Herland', 'Charlotte Perkins Gilman', 1915, 'scifi', ['utopia', 'funny', 'short'], 'Three explorers find a country of women, and their ideas fall apart one by one.'],
  ['dracula', 'Dracula', 'Bram Stoker', 1897, 'horror', ['vampire', 'letters', 'long'], 'Letters and diaries tell of a trip to Transylvania, and of what follows the traveler home.'],
  ['screw', 'The Turn of the Screw', 'Henry James', 1898, 'horror', ['ghost', 'short', 'spooky'], 'A governess, two children, and ghosts that only she can see. Or are they there at all?'],
  ['carmilla', 'Carmilla', 'J. Sheridan Le Fanu', 1872, 'horror', ['vampire', 'short', 'gothic'], 'A lonely girl in a castle, and the strange guest who arrives after a carriage crash.'],
  ['jekyll', 'Strange Case of Dr Jekyll and Mr Hyde', 'Robert Louis Stevenson', 1886, 'horror', ['double', 'short', 'monster'], 'A respected doctor, a brutal man named Hyde, and the lawyer who finds out what links them.'],
  ['sleepy', 'The Legend of Sleepy Hollow', 'Washington Irving', 1820, 'horror', ['ghost', 'autumn', 'short'], 'A jumpy schoolmaster, a harvest party, and a headless rider on the road home.'],
  ['frankenstein', 'Frankenstein', 'Mary Shelley', 1818, 'horror', ['monster', 'science', 'dark'], 'A student builds a living man, then runs from what he made. Horror, and early science fiction.'],
  ['mainstreet', 'Main Street', 'Sinclair Lewis', 1920, 'classics', ['small-town', 'midwest', 'funny'], 'A young wife sets out to remake a Minnesota prairie town. The town has other ideas.'],
  ['antonia', 'My Antonia', 'Willa Cather', 1918, 'classics', ['midwest', 'prairie', 'family'], 'An immigrant girl on the Nebraska prairie, remembered by the boy who grew up beside her.'],
  ['huck', 'Adventures of Huckleberry Finn', 'Mark Twain', 1884, 'classics', ['river', 'journey', 'funny'], 'A boy and a man escaping slavery ride a raft down the Mississippi.'],
  ['moby', 'Moby-Dick', 'Herman Melville', 1851, 'classics', ['sea', 'obsession', 'long'], 'Captain Ahab hunts the white whale that took his leg. Huge, strange and stormy.'],
  ['littlewomen', 'Little Women', 'Louisa May Alcott', 1868, 'classics', ['sisters', 'family', 'warm'], 'Four sisters grow up in Massachusetts while their father is away at war.'],
  ['gatsby', 'The Great Gatsby', 'F. Scott Fitzgerald', 1925, 'classics', ['money', 'short', 'dark'], 'A rich man throws parties across the bay from the woman he lost.'],
  ['winesburg', 'Winesburg, Ohio', 'Sherwood Anderson', 1919, 'classics', ['small-town', 'midwest', 'short'], 'Linked stories of lonely people in one small Ohio town, seen by a young reporter.'],
  ['garden', 'The Secret Garden', 'Frances Hodgson Burnett', 1911, 'kids', ['nature', 'friends', 'warm'], 'A sour orphan finds a locked garden, and brings it, and herself, back to life.'],
  ['anne', 'Anne of Green Gables', 'L. M. Montgomery', 1908, 'kids', ['funny', 'family', 'warm'], 'A talkative red-haired orphan arrives at a farm that had asked for a boy.'],
  ['willows', 'The Wind in the Willows', 'Kenneth Grahame', 1908, 'kids', ['animals', 'river', 'friends'], 'Mole, Rat, Badger and the reckless Mr. Toad, along the river.'],
  ['beauty', 'Black Beauty', 'Anna Sewell', 1877, 'kids', ['animals', 'horse'], 'A horse tells his own life story, from a kind farm to the cab stands of London.'],
  ['treasure', 'Treasure Island', 'Robert Louis Stevenson', 1883, 'kids', ['adventure', 'pirates', 'sea'], 'A boy, a treasure map, and the one-legged cook Long John Silver.'],
  ['velveteen', 'The Velveteen Rabbit', 'Margery Williams', 1922, 'kids', ['short', 'toys', 'warm'], 'A stuffed rabbit learns what it takes to become real.'],
  ['justso', 'Just So Stories', 'Rudyard Kipling', 1902, 'kids', ['animals', 'funny', 'short'], 'How the leopard got his spots, and other tall tales for bedtime.'],
  ['walden', 'Walden', 'Henry David Thoreau', 1854, 'nonfiction', ['nature', 'simple', 'woods'], 'Two years in a cabin by a pond, and what Thoreau learned about needing less.'],
  ['origin', 'On the Origin of Species', 'Charles Darwin', 1859, 'nonfiction', ['science', 'nature'], 'Darwin makes his case for natural selection with pigeon breeders, barnacles and island birds.'],
  ['douglass', 'Narrative of the Life of Frederick Douglass', 'Frederick Douglass', 1845, 'nonfiction', ['memoir', 'freedom', 'short'], 'Douglass tells how he learned to read and escaped slavery, in his own words.'],
  ['franklin', 'The Autobiography of Benjamin Franklin', 'Benjamin Franklin', 1791, 'nonfiction', ['memoir', 'history', 'work'], 'A printer\'s apprentice becomes a scientist and a founder, and keeps a chart of his own virtues.'],
  ['types', 'Psychological Types', 'C. G. Jung', 1921, 'nonfiction', ['psychology', 'mind'], 'Jung on introverts, extraverts, and the different ways people take in the world.'],
  ['jamespsy', 'The Principles of Psychology', 'William James', 1890, 'nonfiction', ['psychology', 'mind', 'long'], 'Habit, attention, emotion and the stream of consciousness, from one of the founders of American psychology.'],
  ['riis', 'How the Other Half Lives', 'Jacob Riis', 1890, 'nonfiction', ['history', 'city', 'work'], 'A reporter photographs New York\'s tenements and the people crowded into them.'],
  ['meditations', 'Meditations', 'Marcus Aurelius', 180, 'nonfiction', ['stoic', 'short', 'mind'], 'A Roman emperor\'s private notes to himself on staying steady.'],
];
// what walk-ins ask for: [section, tags, the line they say, the same wish said about someone else, for gifts]
const STORE_ASKS = [
  ['fantasy', ['magic'], 'Something with real magic in it.', 'loves anything with real magic in it'], ['fantasy', ['kids', 'journey'], 'A fantasy I can read out loud to my kids.', 'reads out loud to the kids every night'],
  ['fantasy', ['dream'], 'Something dreamy and strange.', 'likes books that are dreamy and strange'], ['fantasy', ['long', 'war'], 'A big long epic for the winter.', 'wants a big long epic for the winter'],
  ['mystery', ['twist'], 'A mystery where I won\'t guess the ending.', 'always guesses the ending, and hates that'], ['mystery', ['detective', 'short'], 'A detective story I can finish tonight.', 'likes a detective story in one sitting'],
  ['mystery', ['spooky'], 'A mystery with something creepy in it.', 'likes a mystery with something creepy in it'], ['mystery', ['chase'], 'Something with a chase in it.', 'loves a good chase'],
  ['romance', ['dark'], 'Something romantic, but dark.', 'likes romance on the dark side'], ['romance', ['funny'], 'A love story that\'s funny too.', 'wants a love story that\'s funny too'],
  ['romance', ['second-chance'], 'A second-chance love story.', 'is a sucker for second chances'], ['romance', ['slow-burn'], 'A slow burn. I like the waiting.', 'loves a slow burn'],
  ['scifi', ['time'], 'Got anything with time travel?', 'is into time travel'], ['scifi', ['aliens'], 'Aliens. The scary kind.', 'loves alien invasions'],
  ['scifi', ['sea'], 'Science fiction under the sea?', 'loves anything under the sea'], ['scifi', ['utopia'], 'Something that imagines a better world.', 'likes stories that imagine a better world'],
  ['horror', ['ghost', 'short'], 'A ghost story I can read in one night.', 'likes a short ghost story'], ['horror', ['vampire'], 'Vampires. The old-fashioned kind.', 'loves old-fashioned vampires'],
  ['horror', ['monster'], 'A real monster, please.', 'wants a real monster'], ['horror', ['autumn'], 'Something for a dark fall evening.', 'loves a dark fall evening with a book'],
  ['classics', ['midwest'], 'Something about the Midwest.', 'likes books about the Midwest'], ['classics', ['small-town'], 'A book about a town like this one.', 'likes books about small towns'],
  ['classics', ['sea'], 'A big sea story.', 'loves a big sea story'], ['classics', ['short'], 'A classic that isn\'t a doorstop.', 'wants a classic that isn\'t a doorstop'],
  ['kids', ['animals'], 'My granddaughter loves animals.', 'loves animals'], ['kids', ['funny'], 'Something that\'ll make my son laugh.', 'needs something funny'],
  ['kids', ['adventure'], 'An adventure for a ten-year-old.', 'is ten and wants an adventure'], ['kids', ['short'], 'A bedtime book, please.', 'needs a bedtime book'],
  ['nonfiction', ['nature'], 'Something true about nature.', 'likes true books about nature'], ['nonfiction', ['memoir'], 'A true story about somebody\'s life.', 'likes true stories about real lives'],
  ['nonfiction', ['psychology'], 'Why do people do what they do?', 'wonders why people do what they do'], ['nonfiction', ['science'], 'Real science, but readable.', 'likes real science, if it\'s readable'],
];
// the regulars: made-up townsfolk (no real people), each reading in one section. After you've matched them well three
// times, they ask a question about the real world, and the right nonfiction book brings them back to it (the main game's
// thread: fiction's archetypes, met, then reality).
const STORE_REGS = [
  { id: 'teacher', name: 'the retired teacher in the cardigan', sec: 'mystery', look: 'c_cardigan', ask: ['psychology'],
    q: 'All these mysteries... why do people really do what they do? Is there a book about that? A true one?' },
  { id: 'mechanic', name: 'the snowmobile mechanic', sec: 'scifi', look: 'c_mechanic', ask: ['science'],
    q: 'I keep reading about other worlds. How do we know how this one works? The real one.' },
  { id: 'nurse', name: 'the nurse off the night shift', sec: 'romance', look: 'c_scrubs', ask: ['memoir'],
    q: 'Those old love stories... how did real people actually live back then? Somebody\'s real life, I mean.' },
  { id: 'teen', name: 'the high school kid with headphones', sec: 'horror', look: 'c_hoodie', ask: ['psychology'],
    q: 'Okay, weird question. Why do I like being scared? Is there a real answer?' },
  { id: 'collegekid', name: 'the college kid home for break', sec: 'fantasy', look: 'c_student', ask: ['nature'],
    q: 'Are there real places like the ones in these books? Somewhere you can actually walk into and get lost?' },
  { id: 'trucker', name: 'the trucker on his Antigo route', sec: 'classics', look: 'c_trucker', ask: ['history'],
    q: 'These old novels about towns. What really happened in places like that? The true history.' },
];
// the store's own events. Christian (Nov 14): "I have personal experiences with owning the bookstore that I think should
// occur too." His go here when he sends them. Until then, three stand-ins of ordinary bookstore moments, marked standin.
// when: 'morning' or 'day'; once: happens only once a game; each choice: t, lines said after, and the effect (cash in cents,
// rep, used books added by section)
const STORE_EVENTS = [
  { id: 'step_box', standin: true, when: 'morning', chance: 0.06,
    lines: ['There\'s a cardboard box of books on the front step. No note.'],
    choices: [{ t: 'Shelve them', lines: ['Mostly paperbacks. A few are worth something.'], fx: { used: 10 } },
              { t: 'Keep them in back a week, in case', lines: ['You write the date on the box and set it in the back room.'], fx: { rep: 1, usedLater: 10 } }] },
  { id: 'armchair', standin: true, when: 'day', chance: 0.07,
    lines: ['Someone has been reading in an upstairs armchair since you opened. Same book, a hundred pages in.'],
    choices: [{ t: 'Let them read', lines: ['They wave on the way out. "Best chair in town."'], fx: { rep: 2 } },
              { t: 'Ask if they\'d like to buy it', lines: ['"Oh! Yes, sure." They buy it, a little embarrassed.'], fx: { sale: 1, rep: -1 } }] },
  { id: 'letter', standin: true, when: 'day', chance: 0.05, once: true,
    lines: ['Tucked inside a trade-in from last week: an old letter, folded small, from 1962.'],
    choices: [{ t: 'Call the seller to give it back', lines: ['She comes in an hour later and reads it at the counter. Then she hugs you.'], fx: { rep: 3 } },
              { t: 'Pin it to the corkboard', lines: ['It stays there. People stop to read it.'], fx: { rep: 1 } }] },
];
