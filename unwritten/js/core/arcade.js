"use strict";
// ---------- Cecil at Respawn Gaming Lounge (725 5th Ave) (Nov 13): Christian's friend runs the arcade. Talk to him to play
// open-source games inside the game (Doom with Freedoom's levels, Racer, Hextris, 2048: arcade/, each under its own
// license, see arcade/licenses.html), take the retro gaming quiz, or hear what Respawn has (from respawnantigo.com).
// Cecil's own lines are kept short and plain; Christian writes the characters. ----------
const RESPAWN = BLD.find(b => b.addr === '725 5TH AVE') || null;   // its own building since Nov 13 (scripts/town/split_respawn.py)
// Cecil works the front desk inside (respawn.js); the door on Fifth goes in.
const ARCADE_GAMES = [['Doom (Freedoom)', 'doom.html', 'A big download the first time. Arrows move, Ctrl fires, Space opens doors. On a phone, use the buttons on screen.'],
  ['Racer', 'racer/index.html', 'Arrows to drive. Stay on the road.'], ['Hextris', 'hextris/index.html', 'Left and right turn the hexagon. Match three colours.'],
  ['2048', '2048/index.html', 'Slide the tiles with the arrows. Match numbers until you reach 2048.']];
let ARCADE = null;
// the arcade window: a full-window frame with a bar (back to the town, the library, licences) over one of the arcade/ pages
function arcadeShow(url, title) {
  if (ARCADE) return;
  const w = document.createElement('div'); w.id = 'arcade';
  w.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;flex-direction:column;font:14px system-ui,sans-serif';
  const bar = document.createElement('div'); bar.style.cssText = 'display:flex;align-items:center;gap:10px;padding:6px 10px;background:#1c1e26;color:#e8e8f0';
  const btn = (t, bg) => { const b = document.createElement('button'); b.textContent = t; b.style.cssText = 'font:inherit;padding:6px 12px;border:0;border-radius:6px;background:' + bg + ';color:#fff;cursor:pointer'; return b; };
  const back = btn('◀ Back to Antigo', '#3a6ad0'), lib = btn('Game library', '#3e6a2c');
  const name = document.createElement('span'); name.textContent = title; name.style.cssText = 'flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis';
  const lic = document.createElement('a'); lic.textContent = 'Licenses'; lic.href = 'arcade/licenses.html'; lic.target = '_blank'; lic.rel = 'noopener'; lic.style.color = '#9ec8ff';
  bar.append(back, lib, name, lic);
  const fr = document.createElement('iframe'); fr.src = 'arcade/' + url; fr.allow = 'autoplay; fullscreen; gamepad'; fr.style.cssText = 'flex:1;border:0;width:100%;background:#000';
  fr.addEventListener('load', () => { try { const t = fr.contentDocument.title; if (t) name.textContent = t; fr.contentWindow.focus(); } catch (e) { } });
  w.append(bar, fr); document.body.appendChild(w); ARCADE = w;
  back.onclick = arcadeClose; lib.onclick = () => { fr.src = 'arcade/library.html#all'; };
  setTimeout(() => { try { fr.focus(); } catch (e) { } }, 300);
}
function arcadeOpen(i) { const [name, url] = ARCADE_GAMES[i]; arcadeShow(url, name + ' — Respawn arcade'); }
function arcadeLibrary(tab) { arcadeShow('library.html#' + (tab || 'all'), 'Respawn game library'); }
function arcadeClose() { if (!ARCADE) return; ARCADE.remove(); ARCADE = null; try { cv.focus(); } catch (e) { } }
addEventListener('keydown', e => { if (ARCADE && e.key === 'Escape') arcadeClose(); });
function arcadeMenu() { arcadeLibrary('all'); }   // Cecil's games are the whole library now (arcade/library.html)
// ---- the retro gaming quiz: eight questions a round, drawn from these ----
const RETRO_Q = [
  ['Which company made Pac-Man (1980)?', 'Namco', ['Atari', 'Taito', 'Sega']],
  ['What was Mario called in Donkey Kong (1981)?', 'Jumpman', ['Mr. Video', 'Hammerman', 'Plumber Joe']],
  ['Who created Tetris?', 'Alexey Pajitnov', ['Shigeru Miyamoto', 'Hideo Kojima', 'John Romero']],
  ['Which game came with the Game Boy in North America?', 'Tetris', ['Super Mario Land', 'Pokémon Red', 'Kirby\'s Dream Land']],
  ['When did the NES launch in North America?', '1985', ['1983', '1987', '1989']],
  ['Which studio made Doom (1993)?', 'id Software', ['Epic MegaGames', 'Apogee', 'Blizzard']],
  ['What is Doom\'s first episode called?', 'Knee-Deep in the Dead', ['The Shores of Hell', 'Inferno', 'Hell on Earth']],
  ['Sonic the Hedgehog first came out on which console?', 'Sega Genesis', ['Super Nintendo', 'TurboGrafx-16', 'Atari Jaguar']],
  ['What is the name of Sonic\'s two-tailed fox friend?', 'Tails', ['Knuckles', 'Shadow', 'Amy']],
  ['Pac-Man\'s ghosts are Blinky, Pinky, Inky and...?', 'Clyde', ['Sue', 'Funky', 'Spooky']],
  ['What colour is Blinky?', 'Red', ['Pink', 'Cyan', 'Orange']],
  ['Which Atari game is famously buried in a New Mexico landfill?', 'E.T. the Extra-Terrestrial', ['Pong', 'Pitfall!', 'Asteroids']],
  ['In The Oregon Trail, which illness ends many a trip?', 'Dysentery', ['Scurvy', 'The flu', 'Gout']],
  ['How does the Konami Code begin?', 'Up, Up, Down, Down', ['Left, Right, Left, Right', 'A, B, A, B', 'Down, Up, Down, Up']],
  ['In which game did the Konami Code first appear?', 'Gradius', ['Contra', 'Castlevania', 'Metal Gear']],
  ['What is the hero\'s name in The Legend of Zelda?', 'Link', ['Zelda', 'Ganon', 'Epona']],
  ['"It\'s dangerous to go alone! Take this." What does the old man give you?', 'A sword', ['A shield', 'A potion', 'A map']],
  ['Who made the Intellivision?', 'Mattel', ['Coleco', 'Magnavox', 'Hasbro']],
  ['Which Final Fantasy VI party member is a moogle?', 'Mog', ['Umaro', 'Gau', 'Relm']],
  ['What does the party travel through in Chrono Trigger?', 'Time', ['Dreams', 'Space', 'Books']],
  ['When did Pong come out?', '1972', ['1968', '1977', '1980']],
  ['Mario\'s brother, the one in green, is...?', 'Luigi', ['Wario', 'Toad', 'Yoshi']],
  ['Which company made Space Invaders (1978)?', 'Taito', ['Namco', 'Atari', 'Nintendo']],
  ['Before the Game Boy, Nintendo sold one-game handhelds with a clock called...?', 'Game & Watch', ['Game Gear', 'Lynx', 'Pocket Pal']],
  ['Which two Street Fighter II fighters throw a Hadoken?', 'Ryu and Ken', ['Guile and Blanka', 'Zangief and Dhalsim', 'Sagat and Vega']],
  ['GoldenEye 007 (1997) came out on which console?', 'Nintendo 64', ['PlayStation', 'Sega Saturn', 'Dreamcast']],
  ['What surprised players at the end of Metroid (1986)?', 'Samus is a woman', ['Ridley was a robot', 'It was all a dream', 'Zebes was Earth']],
  ['Which Super Mario Bros. 3 suit lets Mario turn to stone?', 'Tanooki Suit', ['Frog Suit', 'Hammer Suit', 'Raccoon Leaf']],
  ['Duck Hunt was played with which NES accessory?', 'The Zapper', ['The Power Glove', 'R.O.B.', 'The Power Pad']],
  ['Who made the Virtual Boy (1995)?', 'Nintendo', ['Sega', 'Sony', 'Atari']],
  ['The first Pokémon games in Japan (1996) were Red and...?', 'Green', ['Blue', 'Yellow', 'Gold']],
  ['Which company made Galaga (1981)?', 'Namco', ['Konami', 'Capcom', 'Williams']],
];
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }
function quizStart(who) {
  who = who === undefined ? 'Cecil' : who;
  const qs = shuffle(RETRO_Q.slice()).slice(0, 8); let i = 0, right = 0;
  const next = () => {
    if (i >= qs.length) {
      G.quiz = G.quiz || {}; const best = Math.max(G.quiz.retro || 0, right); const nb = right > (G.quiz.retro || 0); G.quiz.retro = best; saveGame();
      return say([[who, right + ' out of ' + qs.length + '.' + (nb ? ' That\'s your best yet.' : ' Your best is ' + best + '.')]]);
    }
    const [q, a, wrong] = qs[i++], opts = shuffle([a].concat(wrong));
    ask((i) + '/' + qs.length + '  ' + q, opts.map(o => ({ t: o, f: () => { if (o === a) right++; say([[who, o === a ? 'Right!' : 'It was ' + a + '.']], next); } })));
  };
  next();
}
function cecilTalk() {
  ask('Cecil: Welcome to Respawn.', [
    { t: 'Browse the game library', f: () => say([['Cecil', 'PC games, NES, Game Boy and GBA. All free. Pick anything.']], () => arcadeLibrary('all')) },
    { t: 'Retro gaming quiz', f: () => say([['Cecil', 'Eight questions on old games. Ready?']], () => quizStart('Cecil')) },
    { t: 'What\'s at Respawn?', f: () => say([['Cecil', 'PC gaming stations, modern and retro consoles, VR, racing simulators, rhythm games, and a golf and multi-sport simulator.'],
      ['Cecil', 'Board and card games too. It\'s family friendly and open to all ages.'], ['', 'Hours and prices: respawnantigo.com.']]) },
    { t: 'Bye' }]);
}

