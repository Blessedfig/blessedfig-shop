"use strict";
// =====================================================================
//  MUSIC (v0.36, ported to the rebuild Nov 26 2026 with a new track picker): an SNES-minded WebAudio engine and the game's original soundtrack.
//  Research notes: research_notes/Game music for The Unwritten/music_notes.md (Aristopoulos, The Game Music
//  Toolbox, 2023; SPC700 docs; FF6/Chrono Trigger practice; Upper Midwest polka, chorale and lumber-camp song).
//
//  ENGINE. A lookahead scheduler books notes on AudioContext time. Each of two crossfading buses owns eight
//  persistent voices, like the SNES S-DSP's eight channels: lead (two detunable oscillators for chorus), two
//  harmony voices, bass, kick/tom, and filtered-noise snare and hats. Playing a note only moves automation on
//  existing nodes. Per-voice low-pass filters (the soft, interpolated SNES sample sound, plus filter "blat" on
//  brass), wavetable instruments that stand in for SNES samples (flute, strings, organ, accordion with musette
//  detune, fiddle, horn, tuba, harp, music box), delayed vibrato and portamento on leads, swing, meter accents,
//  intros with loop points, an SNES-style feedback echo (<=240 ms, low-passed feedback) plus a small reverb send,
//  vertical layers (forest seasons, a counter-line and tempo lift as a battle nears its end), north-woods ambience
//  (wind in pines, river, marsh, loons, birds), and synchronous stingers (fact found, level up) in the key of
//  whatever is playing, with the music ducked under them. A soft limiter guards against clipping.
//  SOUNDTRACK. Four leitmotifs, transformed across the score (see LEITMOTIFS below).
//  Debug: MUSIC.current, MUSIC.want, MUSIC.force='id', MUSIC.list(), MUSIC.render(id,sec) (offline check).
// =====================================================================
const MUSIC=(()=>{
  // ---------------- notation ----------------
  // Melody: "E5:2 D5 C5:4 | r:2 ..." note+octave, ":n" length in grid steps (sticky), "r" rest; octave sticky.
  // "~" before a note glides into it from the previous one; "!" after a note accents it. "|" marks a bar and is
  // checked against the meter. Chords: one token per bar; "Am,E7" splits a bar evenly; "G/B" sets the bass note.
  const PC={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const QUAL={'':[0,4,7],m:[0,3,7],'7':[0,4,7,10],m7:[0,3,7,10],maj7:[0,4,7,11],mM7:[0,3,7,11],m6:[0,3,7,9],'6':[0,4,7,9],
    m9:[0,3,7,10,14],maj9:[0,4,7,11,14],dim:[0,3,6],aug:[0,4,8],sus4:[0,5,7],sus2:[0,2,7],'7sus4':[0,5,7,10],add9:[0,4,7,14],m7b5:[0,3,6,10]};
  const BAD=[];
  const acc=s=>s==='#'?1:s==='b'?-1:0;
  function parseMel(src,spb,id){const ev=[];let st=0,len=2,oct=5,bar=0,barStart=0;
    for(const tk of src.replace(/\|/g,' | ').trim().split(/\s+/)){
      if(tk==='|'){if(st-barStart!==spb)BAD.push(id+' bar '+(bar+1)+' has '+(st-barStart)+' steps');bar++;barStart=st;continue;}
      let m=/^r(?::(\d+))?$/.exec(tk);if(m){if(m[1])len=+m[1];st+=len;continue;}
      m=/^(~)?([A-G])([#b]?)(\d)?(?::(\d+))?(!)?$/.exec(tk);if(!m){BAD.push(id+' bad token '+tk);continue;}
      if(m[4])oct=+m[4];if(m[5])len=+m[5];
      ev.push([st,len,12*(oct+1)+PC[m[2]]+acc(m[3]),m[6]?1.22:1,m[1]?1:0]);st+=len;}
    if(st-barStart>0&&st-barStart!==spb)BAD.push(id+' last bar has '+(st-barStart)+' steps');
    return {ev,steps:st};}
  function parseChords(src,spb,id){const out=[];let bar=0;
    for(const tok of src.trim().split(/\s+/)){if(tok==='|')continue;const parts=tok.split(','),pl=spb/parts.length;
      if(pl%1)BAD.push(id+' chord split '+tok);
      parts.forEach((p,i)=>{const m=/^([A-G])([#b]?)([^/]*)(?:\/([A-G])([#b]?))?$/.exec(p);
        if(!m||!(m[3] in QUAL)){BAD.push(id+' bad chord '+p);return;}
        const r=(PC[m[1]]+acc(m[2])+12)%12;out.push({r,q:QUAL[m[3]],bp:m[4]?(PC[m[4]]+acc(m[5])+12)%12:r,st:bar*spb+Math.round(i*pl),len:Math.round(pl)});});
      bar++;}
    return {ch:out,bars:bar};}

  // =====================================================================
  //  LEITMOTIFS (all original)
  //  C  CURIOSITY, the player's theme: 1 up-a-sixth 5 #4 5 | 3 2. A rising question that ends on 2, unanswered;
  //     the #4 gives it a Lydian "wonder" color. Title (full, G Lydian), store (F, gentle), battle (A minor,
  //     diminished rhythm, the #4 becomes a tense leading tone), victory (fanfare, finally answered upward),
  //     gym (diminished, then phrase-modulated up a whole step), think (E Lydian, sparse), dream (inverted),
  //     FORAGING MAP (6/8), chapter end (the question resolves to 1), stingers (fact, level).
  //  H  HOME / ANTIGO: 3 5 1' | 6 5 4 | 3. A porch waltz. Town (seasonal waltzes), summer polka (2/4 with a
  //     trio in the subdominant), NTC shop (E Dorian work song), church chorale (augmented, four voices).
  //  D  DAIMON, the book that only says yes: 5 6 5 3 | 7 1 in minor, a charming music-box waltz that is too
  //     sure of itself. Daimon's talk, basement (slow, low), boss (C minor, fast, against Curiosity's motif),
  //     a borrowed minor chord that shadows the title.
  //  W  WOODS: 1 up-to 5 | 6 5 | 3 2 1, pentatonic, with loon-like glides. Gartzke (pines), Wolf River
  //     (rolling ostinato), Ackley (marsh, wide and slow), each with seasonal layers; the FORAGING MAP.
  // =====================================================================
  // m: grid steps per bar; g: steps per quarter note (2 = eighths, 4 = sixteenths); li: loop-in bar (intro
  // bars before it play once); k: key (pitch class) for stingers. h1/h2/bs: explicit harmony and bass lines.
  const SONG={
   // "The Unwritten": Curiosity's theme in G Lydian over a two-bar harp intro. Bars 15-16 let Daimon's borrowed
   // minor chord shadow it before the D7 lifts back to the top.
   title:{m:8,li:2,k:7,ch:'G A/G G Em7 Am7 Bm7 C Am7 G A/G G Em7 C D Cm G/B Am7 D7',
    mel:'r:8 | r:8 | G4:2 E5:3 D5:1 C#5:1 D5:1 | B4:3 A4:1 A4:4 | A4:2 F#5:3 E5:1 D#5:1 E5:1 | C#5:3 B4:1 B4:4 | E5:3 D5:1 C5:2 B4:2 | A4:3 G4:1 F#4:2 E4:2 | D4:2 G4:2 B4:2 D5:2 | C#5:6 r:2 |'+
        'G4:2 E5:3 D5:1 C#5:1 D5:1 | B4:3 A4:1 G4:2 E4:2 | C5:2 A5:3 G5:1 F#5:1 G5:1 | E5:3 D5:1 D5:4 | Eb5:3 D5:1 C5:2 G4:2 | D5:3 B4:1 G4:2 B4:2 | C5:3 B4:1 A4:2 E5:2 | D5:3 C5:1 A4:2 F#4:2 |'},
   // FORAGING MAP (title screen): the Woods motif and Curiosity's head in a 6/8 walking pastorale.
   fmap:{m:6,k:7,ch:'G C Em D G Em Am7 D C G/B Am D G C D G',
    mel:'G4:3 ~D5:3 | E5:5 D5:1 | B4:3 A4:2 G4:1 | A4:6 | G4:2 E5:2 D5:1 C#5:1 | D5:3 B4:3 | C5:3 E5:2 G5:1 | F#5:3 D5:3 |'+
        'E5:3 ~G5:3 | D5:5 B4:1 | C5:3 B4:2 A4:1 | A4:3 F#4:3 | G4:2 E5:2 D5:1 C#5:1 | E5:3 ~G5:3 | F#5:3 A5:2 F#5:1 | G5:6 |'},
   // Thinking: the town ledger, the Almanac, the library. Non-functional major-seventh chords a third apart hide
   // where the loop is (Toolbox ch. 8); Curiosity's motif in E Lydian with room to think between phrases.
   think:{m:8,k:4,ch:'Emaj7 Cmaj7 Amaj7 Fmaj7 Emaj7 Cmaj7 Dmaj7 Bsus4',
    mel:'E4:2 C#5:3 B4:1 A#4:1 B4:1 | G4:3 F#4:1 F#4:4 | r:4 E5:2 C#5:2 | C5:2 A4:6 | E4:2 C#5:3 B4:1 A#4:1 B4:1 | E5:3 D5:1 B4:4 | r:2 A4:2 C#5:2 F#5:2 | E5:4 r:4 |'},
   // Antigo: the Home motif as a Northwoods fiddle waltz, AABB-ish, 32 bars. Arranged per season.
   town:{m:6,k:7,ch:'G C G D Em C D D7 G C G Em C D G G Em C G D Em C Am D C D Bm Em C D G G',
    mel:'B4:2 D5:2 G5:2 | E5:3 D5:1 C5:2 | B4:2 D5:1 B4:1 G4:2 | A4:4 D5:2 | G5:3 F#5:1 E5:2 | G4:2 C5:2 E5:2 | D5:3 E5:1 F#5:2 | A5:4 r:2 |'+
        'B5:3 A5:1 G5:2 | C5:2 E5:2 G5:2 | D5:3 B4:1 G4:2 | E5:3 F#5:1 G5:2 | E5:2 D5:2 C5:2 | B4:2 A4:2 F#4:2 | G4:6 | r:4 D5:2 |'+
        'G5:3 F#5:1 E5:2 | E5:2 D5:2 C5:2 | D5:3 B4:1 G4:2 | A4:2 B4:2 C5:2 | B4:2 E5:2 G5:2 | G5:3 E5:1 C5:2 | A4:2 C5:2 E5:2 | F#5:4 D5:2 |'+
        'E5:3 F#5:1 G5:2 | D5:2 F#5:2 A5:2 | D5:3 C#5:1 B4:2 | E5:4 r:2 | G5:2 E5:2 C5:2 | D5:2 F#5:2 A5:2 | G5:6 | r:4 D5:2 |'},
   // Summer in Antigo: the Home motif as a Dutchman-style polka in 2/4 (sixteenth grid), AABB plus a trio in the
   // subdominant, the way polkas and marches modulate; a C7 secondary dominant leads home.
   polka:{m:8,g:4,k:5,ch:'F F C7 C7 F Bb C7 F C7 F C7 F Bb F C7 F Bb Bb F7 F7 F7 F7 Bb Bb Bb Eb Bb G7 Cm F7 Bb C7',
    mel:'A4:2 C5:2 F5:3 D5:1 | C5:3 Bb4:1 A4:4 | G4:2 Bb4:2 E5:3 C5:1 | Bb4:3 A4:1 G4:4 | A4:2 C5:2 F5:3 D5:1 | D5:2 F5:2 Bb5:3 G5:1 | F5:2 E5:2 D5:2 E5:2 | F5:4 r:2 C5:2 |'+
        'E5:1 F5:1 G5:2 G5:2 G5:2 | A5:2 G5:1 F5:1 C5:4 | E5:1 F5:1 G5:2 Bb5:2 G5:2 | A5:4 F5:4 | D5:2 F5:2 Bb5:2 A5:1 G5:1 | F5:2 C5:2 A4:2 F4:2 | G4:1 A4:1 Bb4:1 B4:1 C5:2 E5:2 | F5:4 r:4 |'+
        'D5:4 F5:4 | Bb5:6 G5:2 | F5:4 Eb5:2 D5:2 | C5:8 | C5:4 Eb5:4 | A5:6 F5:2 | F5:4 D5:2 Bb4:2 | D5:8 |'+
        'D5:4 F5:4 | G5:6 Eb5:2 | F5:4 D5:2 Bb4:2 | D5:4 B4:4 | C5:2 Eb5:2 G5:3 Eb5:1 | F5:2 Eb5:2 D5:2 C5:2 | Bb4:2 D5:2 F5:2 D5:2 | C5:2 E5:2 G5:2 Bb5:2 |'},
   // A wandering-monster battle in A minor: Curiosity's motif in diminution, its #4 now a biting leading tone.
   battle:{m:8,li:1,k:9,ch:'E Am Am F G Am Dm E7 E F G Em Am Dm G E E7',
    mel:'r:8 | A4:1 F5:2 E5:1 D#5:1 E5:1 C5:2 | A4:1 B4:1 C5:1 E5:1 D5:2 C5:1 B4:1 | A4:1 F5:2 E5:1 D#5:1 E5:1 A5:2 | G5:3 F5:1 D5:2 B4:2 | C5:1 E5:1 A5:2 G5:1 F5:1 E5:1 D5:1 | F5:3 E5:1 D5:2 A4:2 | G#4:1 B4:1 D5:1 F5:1 E5:2 D5:1 B4:1 | E5:4 B4:2 G#4:2 |'+
        'C5:2 F5:2 A5:3 G5:1 | B4:1 D5:1 G5:2 F5:1 E5:1 D5:2 | E5:1 G5:1 B5:2 A5:1 G5:1 E5:2 | A5:3 G5:1 E5:2 C5:2 | D5:1 F5:1 A5:2 G5:1 F5:1 D5:2 | G5:1 F5:1 D5:2 B4:2 G4:2 | G#5:3 F#5:1 E5:2 D5:2 | B4:2 D5:2 E5:2 G#4:2 |'},
   // An archetype boss: Daimon's motif in C minor, fast; Curiosity answers in the relative major (bars 10-13),
   // with a Neapolitan Db for the dark turn.
   boss:{m:8,li:1,k:0,ch:'G Cm Cm Ab G Cm Fm Db G7 Eb Cm Bb G Ab Fm Db G7',
    mel:'r:8 | G5:1 Ab5:1 G5:1 Eb5:1 B4:2 C5:2 | Eb5:1 D5:1 C5:1 B4:1 C5:2 G4:2 | G5:1 Ab5:1 G5:1 Eb5:1 C6:2 Bb5:1 Ab5:1 | G5:3 F5:1 D5:2 B4:2 | C6:2 B5:1 G5:1 Ab5:2 G5:1 Eb5:1 | F5:2 Ab5:2 C6:2 Ab5:1 F5:1 | F5:2 Ab5:1 F5:1 Db5:2 F5:2 | B4:2 D5:2 F5:2 G5:1 B4:1 |'+
        'Eb5:2 C6:3 Bb5:1 A5:1 Bb5:1 | G5:3 F5:1 F5:4 | Bb4:2 G5:3 F5:1 E5:1 F5:1 | D5:3 C5:1 B4:4 | C6:1 Bb5:1 Ab5:1 G5:1 Ab5:2 Eb5:2 | F5:1 G5:1 Ab5:1 F5:1 C6:2 Ab5:2 | Db6:2 C6:1 Bb5:1 Ab5:2 F5:2 | D5:1 Eb5:1 F5:1 G5:1 B4:2 G4:2 |'},
   // The Blessed Fig Tree: Curiosity's motif at rest in F major; in bar 3 it moves to Bb, where its #4 is just E.
   store:{m:8,k:5,ch:'F Am Bb C Dm Bb Gm7 C7 F Am Bb C Dm F Gm7 C',
    mel:'F4:2 D5:3 C5:1 B4:1 C5:1 | A4:3 G4:1 G4:4 | Bb4:2 G5:3 F5:1 E5:1 F5:1 | D5:3 C5:1 C5:4 | D5:3 E5:1 F5:2 A5:2 | G5:4 F5:2 D5:2 | Bb4:3 C5:1 D5:2 G5:2 | E5:6 r:2 |'+
        'F5:3 E5:1 F5:2 C5:2 | E5:3 D5:1 C5:2 A4:2 | D5:3 C5:1 Bb4:2 F5:2 | E5:6 C5:2 | D5:2 F5:2 A5:2 G5:2 | F5:4 C5:4 | Bb4:3 A4:1 G4:2 D5:2 | C5:6 r:2 |'},
   // The basement: Daimon's motif, slow and low, then dust, a dripping pipe, something honking far off.
   basement:{m:8,k:9,ch:'Am E7 Am E7 Dm Am Bb E Am F Am E Dm Am Bb E',
    mel:'E5:2 F5:2 E5:2 C5:2 | G#4:4 B4:2 D5:2 | A4:6 r:2 | G#4:4 B4:2 D5:2 | F4:4 A4:2 D5:2 | C5:3 B4:1 A4:4 | D5:4 F4:2 Bb4:2 | G#4:8 |'+
        'A4:2 C5:2 E5:4 | F5:3 E5:1 C5:4 | E5:2 D5:2 C5:2 B4:2 | B4:6 r:2 | D5:3 E5:1 F5:4 | E5:3 C5:1 A4:4 | Bb4:4 A4:2 F4:2 | E4:6 r:2 |'},
   // Daimon: the D motif's home, a sly music-box waltz over a creeping chromatic line.
   daimon:{m:6,k:4,ch:'Em EmM7 Em7 Em6 C B7 Em B7 Am Em F#dim B7 C Am B7 B7',
    mel:'B4:2 C5:1 B4:1 G4:2 | D#5:3 E5:1 B4:2 | D5:2 C#5:1 D5:1 B4:2 | C#5:4 G4:2 | E5:2 G5:2 E5:1 C5:1 | D#5:3 F#5:1 A5:2 | G5:2 F#5:1 E5:1 B4:2 | B4:2 A4:2 F#4:2 |'+
        'E5:3 C5:1 A4:2 | B4:3 G4:1 E4:2 | A4:2 C5:2 Eb5:2 | D#5:4 F#4:2 | G4:2 C5:2 E5:2 | ~A5:3 G5:1 E5:2 | F#5:2 D#5:2 B4:2 | A4:4 D#5:2 |'},
   // Freed! Curiosity's question, finally answered upward. Lands and stops.
   victory:{m:8,k:0,ch:'C F G7 C',
    mel:'G4:1 C5:1 A5:3 G5:1 F#5:1 G5:1 | A5:2 F5:1 A5:1 C6:4 | D5:1 E5:1 F5:1 G5:1 A5:1 B5:1 D6:2 | C6:8 |'},
   // Chapter's end: the Home motif as a hymn for the canoe on the water; in bar 13 Curiosity's question comes
   // back and, for once, resolves to the tonic.
   chapter:{m:8,k:2,ch:'D Bm G A D F#m G A Bm G D A G Em A D',
    mel:'F#4:2 A4:2 D5:4 | C#5:3 D5:1 B4:4 | B4:2 D5:2 G5:3 F#5:1 | E5:6 r:2 | F#5:3 E5:1 D5:2 A4:2 | C#5:3 E5:1 A5:4 | G5:3 F#5:1 E5:2 D5:2 | C#5:2 E5:2 A4:4 |'+
        'D5:3 C#5:1 B4:2 F#5:2 | G5:4 D5:4 | F#5:3 E5:1 D5:2 F#5:2 | E5:6 r:2 | G4:2 E5:3 D5:1 C#5:1 D5:1 | B4:3 A4:1 G4:2 B4:2 | C#5:2 E5:2 A5:2 G5:1 E5:1 | D5:8 |'},
   // Caught in a story (the captured houses, Nov 26). Built the way Chrono Trigger's forest music is built (Game Developer,
   // "Deconstructing Secret of the Forest"), with an original melody: two non-tonic minor-ninth chords (iv9, v9 of D minor)
   // trade every two bars so the ear never lands; a harp climbs four-note arpeggios; a flute's phrases each end in a
   // falling chromatic figure, and the second half of each phrase answers lower; a hand drum never changes; the recap
   // returns higher with a chord every bar; only the bridge reaches the tonic.
   captured:{m:8,li:2,k:2,ch:'Gm9 Am9 Gm9 Gm9 Am9 Am9 Gm9 Gm9 Am9 Am9 Gm9 Gm9 Am9 Am9 Gm9 Gm9 Am9 Am9 Bbmaj7 C Am7 Dm Gm9 C/E Am9 A7 Dm7 Bbmaj7 Gm7 A7',
    mel:'r:8 | r:8 |'+
        'A4:3 D5:1 F5:2 E5:1 D5:1 | G5:4 F5:1 E5:1 Eb5:1 D5:1 | C5:3 E5:1 A5:2 G5:2 | B5:4 A5:1 G#5:1 G5:1 F#5:1 | D4:3 G4:1 Bb4:2 A4:1 G4:1 | C5:4 Bb4:1 A4:1 Ab4:1 G4:1 | E4:3 A4:1 C5:2 B4:2 | E5:4 D5:1 C#5:1 C5:1 B4:1 |'+
        'F5:6 D5:2 | Bb4:2 D5:2 C5:3 Bb4:1 | E5:6 C5:2 | B4:2 E5:2 D5:3 C5:1 | F5:2 G5:2 A5:4 | G5:2 F5:1 E5:1 D5:4 | E5:2 G5:2 B5:4 | A5:1 G#5:1 G5:1 F#5:1 E5:4 |'+
        'D5:3 F5:1 A5:2 G5:1 F5:1 | G5:4 F5:1 E5:1 D5:1 C5:1 | C5:3 E5:1 A5:2 C6:2 | D6:4 C6:1 B5:1 Bb5:1 A5:1 | Bb5:3 A5:1 G5:2 F5:2 | E5:3 G5:1 C6:2 Bb5:2 | A5:4 G5:2 E5:2 | E5:2 G5:1 F5:1 E5:2 C#5:2 |'+
        'r:8 | r:8 | r:8 | r:8 |'},
   // Dreams: Curiosity's motif inverted (falling a sixth, then creeping up), over drifting major sevenths and a
   // chromatic-mediant E major that never quite explains itself.
   dream:{m:8,k:0,ch:'Cmaj7 Am7 Fmaj7 G7 Cmaj7 Am7 Fmaj7 E',
    mel:'E5:2 G4:3 A4:1 A#4:1 A4:1 | C5:3 D5:1 D5:4 | A5:2 C5:3 D5:1 D#5:1 D5:1 | F5:3 G5:1 G5:4 | E5:2 C6:3 B5:1 A#5:1 B5:1 | G5:3 F#5:1 E5:4 | A5:3 G5:1 E5:2 C5:2 | B4:4 G#4:4 |'},
   // The woods: the W motif in D, 6/8, with loon-like glides; the last four bars leave space for the wind.
   woods:{m:6,k:2,ch:'D G/D Bm A D G Em7 A Bm G D/F# G Em7 G Asus4 D G D Em7 A',
    mel:'D5:3 ~A5:3 | B5:5 A5:1 | F#5:3 E5:2 D5:1 | E5:6 | D5:3 ~A5:3 | B5:3 D6:2 B5:1 | A5:3 F#5:2 E5:1 | E5:3 r:3 |'+
        'F#5:3 ~B5:3 | A5:3 G5:2 F#5:1 | F#5:2 E5:1 D5:3 | B4:6 | E5:3 F#5:2 A5:1 | B5:3 ~D6:3 | A5:3 E5:3 | D5:6 | r:6 | r:6 | r:6 | r:6 |'},
   // The UMA gym: Curiosity's motif, punchy and major, over a Mixolydian bVII; then the whole phrase steps up a
   // tone (phrase modulation, Toolbox ch. 13) because you are getting stronger. Energetic, never angry.
   gym:{m:8,li:1,k:7,ch:'G G F C D G F C D A G D E A G D E D D7',
    mel:'r:8 | G4:1 E5:2 D5:1 C#5:1 D5:1 B4:2 | C5:1 A4:1 F4:2 A4:1 C5:1 F5:2 | E5:2 G5:2 E5:1 D5:1 C5:2 | D5:2 A4:1 D5:1 F#5:2 A5:2 | G4:1 E5:2 D5:1 C#5:1 D5:1 G5:2 | F5:2 E5:1 C5:1 A4:2 C5:2 | E5:1 F5:1 G5:2 E5:2 C5:2 | D5:4 r:2 D5:1 E5:1 |'+
        'A4:1 F#5:2 E5:1 D#5:1 E5:1 C#5:2 | D5:1 B4:1 G4:2 B4:1 D5:1 G5:2 | F#5:2 A5:2 F#5:1 E5:1 D5:2 | E5:2 B4:1 E5:1 G#5:2 B5:2 | A4:1 F#5:2 E5:1 D#5:1 E5:1 A5:2 | G5:2 F#5:1 D5:1 B4:2 D5:2 | F#5:1 G5:1 A5:2 F#5:2 D5:2 | E5:4 r:2 E5:1 F#5:1 |'+
        'F#5:2 E5:2 D5:2 C5:2 | A4:1 B4:1 C5:1 D5:1 E5:1 F#5:1 D5:2 |'},
   // The NTC wood shop: the Home motif in E Dorian as a work song, call and response, over a saw-stroke ostinato.
   workshop:{m:8,k:4,ch:'Em Em D D A Em7 A Bm Em D Em A G D A Bm',
    mel:'G4:2 B4:2 E5:3 C#5:1 | B4:2 A4:2 G4:4 | F#4:2 A4:2 D5:3 B4:1 | A4:2 G4:2 F#4:4 | E4:2 A4:2 C#5:2 E5:2 | D5:3 B4:1 G4:4 | C#5:2 E5:2 A5:2 G5:1 F#5:1 | F#5:6 r:2 |'+
        'E5:2 E5:1 E5:1 G5:2 E5:2 | F#5:2 E5:1 D5:1 A4:4 | E5:2 E5:1 E5:1 G5:2 B5:2 | A5:3 G5:1 F#5:2 E5:2 | D5:2 G5:2 B5:2 G5:2 | F#5:2 A5:2 D5:2 C#5:1 B4:1 | C#5:3 B4:1 A4:2 E5:2 | F#4:2 A4:2 B4:4 |'},
   // A quiet chorale for the churches: original, nondenominational, four voices (checked for parallel fifths
   // and octaves). The Home motif in long notes, phrases ABCA, then two bars of rest for the room to ring.
   chorale:{m:8,k:5,ch:'F,F,Bb,Bb C,C7,F,F F,Bb,C,Bb/D Am,G/B,C,C Bb,C,F/A,C/E F,A,Dm,Dm F,F,Bb,Bb C,C7,F,F F F',
    mel:'A4:2 C5 F5 D5 | C5 Bb4 A4:4 | C5:2 D5 E5 F5 | E5 D5 C5:4 | D5:2 E5 F5 G5 | F5 E5 D5:4 | A4:2 C5 F5 D5 | C5 Bb4 A4:4 | r:8 | r:8 |',
    h1:'F4:2 F4 F4 Bb4 | G4 G4 F4:4 | A4:2 Bb4 G4 Bb4 | C5 G4 G4:4 | Bb4:2 G4 A4 C5 | C5 C#5 A4:4 | F4:2 F4 F4 Bb4 | G4 G4 F4:4 | r:8 | r:8 |',
    h2:'C4:2 C4 D4 F4 | E4 E4 C4:4 | F4:2 F4 C4 F4 | C4 D4 E4:4 | F4:2 C4 C4 G4 | A4 A4 F4:4 | C4:2 C4 D4 F4 | E4 E4 C4:4 | r:8 | r:8 |',
    bs:'F2:2 A2 Bb2 Bb2 | C3 C3 F2:4 | F2:2 Bb2 C3 D3 | A2 B2 C3:4 | Bb2:2 C3 A2 E3 | F3 A2 D3:4 | F2:2 A2 Bb2 Bb2 | C3 C3 F2:4 | r:8 | r:8 |'}};

  // ---------------- instruments ----------------
  // w wave; a/d/r attack/decay/release s; s sustain level; v peak gain; vib cents, vd vibrato delay (s);
  // lp low-pass Hz, fe filter-envelope multiple (brass "blat"); ch chorus detune cents (second oscillator); gl glide s.
  const INST={
   lead25:{w:'p25',a:.01,d:.16,s:.7,v:.10,vib:10,vd:.22},
   lead25c:{w:'p25',a:.01,d:.16,s:.72,v:.08,vib:9,vd:.25,ch:7,gl:.07},
   lead50:{w:'p50',a:.012,d:.18,s:.6,v:.075,vib:8,vd:.25},
   lead12:{w:'p12',a:.008,d:.14,s:.65,v:.10,vib:11,vd:.2},
   sly12:{w:'p12',a:.02,d:.2,s:.7,v:.09,vib:22,vd:.12,gl:.11},
   flute:{w:'flute',a:.045,d:.2,s:.85,v:.16,vib:14,vd:.28,gl:.14,lp:5200},
   fiddle:{w:'saw',a:.03,d:.15,s:.8,v:.07,vib:16,vd:.16,lp:3000,ch:5,gl:.05},
   accord:{w:'reed',a:.012,d:.1,s:.85,r:.04,v:.075,ch:13,lp:4200},
   accordS:{w:'reed',a:.006,d:.08,s:.4,v:.04,ch:13,lp:3000},
   organ:{w:'organ',a:.035,d:.1,s:.95,r:.1,v:.065,lp:3600},
   organI:{w:'organ',a:.04,d:.1,s:.95,r:.1,v:.04,lp:2600},
   organB:{w:'organ',a:.05,d:.1,s:.95,r:.12,v:.13,lp:900},
   horn:{w:'saw',a:.02,d:.25,s:.6,v:.07,lp:1400,fe:3,vib:6,vd:.3},
   brass:{w:'saw',a:.005,d:.12,s:.3,v:.045,lp:1700,fe:3},
   str:{w:'str',a:.28,d:.4,s:.8,r:.3,v:.042,ch:9,vib:10,lp:3600},
   strL:{w:'str',a:.12,d:.3,s:.85,r:.2,v:.07,ch:8,vib:12,vd:.2,lp:4200,gl:.09},
   pluck12:{w:'p12',a:.004,d:.16,s:.18,v:.055},
   pluck25:{w:'p25',a:.004,d:.14,s:.25,v:.045},
   harp:{w:'harp',a:.003,d:.4,s:.1,v:.075,lp:5000},
   pad50:{w:'p50',a:.12,d:.3,s:.7,v:.03},
   box:{w:'box',a:.003,d:.3,s:.06,v:.11},
   chirp:{w:'box',a:.002,d:.1,s:.05,v:.05},
   saw12:{w:'p12',a:.004,d:.07,s:.3,v:.04,lp:1500},
   bass:{w:'tri',a:.006,d:.2,s:.8,v:.24},
   bassP:{w:'p50',a:.004,d:.08,s:.55,v:.05,lp:1800},
   bassG:{w:'saw',a:.004,d:.14,s:.55,v:.09,lp:650,fe:2.5},
   tuba:{w:'tuba',a:.02,d:.12,s:.55,v:.2,lp:900}};

  // ---------------- arrangements (what actually plays) ----------------
  // s song, bpm (quarter notes), tr transpose, lo lead octave shift; lead/harm/harm2/bass instruments;
  // hs/hs2 harmony styles (+ ht/ht2 chord tone, ho/ho2 octave, hp/hp2 ostinato pattern); bs bass style;
  // dr drum bars (cycled; k kick, s snare, h hat, o open hat, t tom/wood, x clank); dv drum volume; sw swing;
  // echo send, ed echo delay ms (SNES: up to 240), efb feedback; rev reverb send; amb ambience; lay layers;
  // gain: loudness trim so every track sits within about 1.5 dB of the others (measured with MUSIC.render).
  const TR={
   title:{s:'title',bpm:80,lead:'lead25c',harm:'harp',hs:'arp',harm2:'str',hs2:'pad',ht2:2,bass:'bass',bs:'half',dr:['k.......','k...s...'],dv:.45,echo:.35,ed:224,rev:.25},
   fmap:{s:'fmap',gain:1.1,bpm:120,lead:'flute',harm:'pluck25',hs:'arp3',harm2:'str',hs2:'pad',bass:'bass',bs:'waltz',dr:['h..h..','h..h.o'],dv:.3,echo:.25,rev:.2},
   think:{s:'think',bpm:72,lead:'box',lo:1,harm:'harp',hs:'arp4',harm2:'str',hs2:'pad',ht2:3,bass:'bass',bs:'root',dr:null,echo:.42,ed:240,efb:.42,rev:.3},
   town_spring:{s:'town',gain:1.35,bpm:112,lead:'lead25',harm:'pluck25',hs:'waltz',harm2:'chirp',hs2:'bird',bass:'bass',bs:'waltz',dr:['k.h.h.'],dv:.45,echo:.2},
   town_summer:{s:'polka',gain:1.25,bpm:116,lead:'accord',harm:'accordS',hs:'off',ht:1,harm2:'accordS',hs2:'off',ht2:2,bass:'tuba',bs:'oom',dr:['k.h.s.h.'],dv:.5,echo:.12,ed:128},
   town_fall:{s:'town',gain:1.25,bpm:100,tr:-2,lead:'fiddle',harm:'pad50',hs:'pad',harm2:'pluck12',hs2:'below',bass:'bass',bs:'waltz',dr:['k...h.'],dv:.35,echo:.28},
   town_winter:{s:'town',gain:0.85,bpm:88,tr:-5,lead:'flute',harm:'box',hs:'arp',ho:1,harm2:'str',hs2:'pad',bass:'bass',bs:'root',dr:['hhhhhh','hhhhho'],dv:.2,echo:.35,rev:.25,amb:'wind'},
   dusk:{s:'town',bpm:84,lo:-1,lead:'lead12',harm:'pad50',hs:'pad',harm2:'box',hs2:'bird',bass:'bass',bs:'root',dr:null,echo:.42},
   indoors:{s:'town',gain:1.35,bpm:96,lead:'lead50',harm:'box',hs:'arp',ho:1,harm2:'pad50',hs2:'pad',bass:'bass',bs:'waltz',dr:['h.....'],dv:.15,echo:.3},
   store:{s:'store',bpm:72,lead:'lead50',harm:'box',hs:'arp',ho:1,harm2:'str',hs2:'pad',ht2:2,bass:'bass',bs:'half',dr:null,echo:.38},
   basement:{s:'basement',bpm:66,lead:'lead12',harm:'box',hs:'drip',ho:1,harm2:'pad50',hs2:'pad',bass:'bass',bs:'pedal',dr:['h.......','h...h...'],dv:.2,echo:.5,ed:240,efb:.45},
   daimon:{s:'daimon',gain:1.25,bpm:96,lead:'sly12',harm:'box',hs:'waltz',ho:1,harm2:'str',hs2:'pad',bass:'bass',bs:'waltz',dr:['h.h.h.'],dv:.18,echo:.45},
   battle:{s:'battle',bpm:152,lead:'lead25',harm:'saw12',hs:'arp',harm2:'brass',hs2:'stab',bass:'bass',bs:'drive',dr:['kkskkhss','khskkhsh','khskkhsh','khskkhsh','khskkhsh','khskkhsh','khskkhsh','khskkhsh','ksksssss'],dv:.75,echo:.12,ed:144,fast:1,lay:'urgent'},
   boss:{s:'boss',gain:1.35,bpm:164,lead:'organ',harm:'pluck25',hs:'arp',harm2:'brass',hs2:'stab',bass:'bassP',bs:'drive',dr:['kssskkss','kkskkhsh','khskkhso','kkskkhsh','khskkhsh','kkskkhsh','khskkhso','kkskkhsh','kssskkss'],dv:.8,echo:.12,ed:144,fast:1,lay:'urgent'},
   victory:{s:'victory',gain:1.25,bpm:144,lead:'lead25c',harm:'pluck12',hs:'arp',harm2:'horn',hs2:'pad',bass:'bass',bs:'root',dr:['k...s...','k...s.s.','k.s.ssss','k.......'],dv:.7,echo:.25,loop:false,fast:1},
   chapter:{s:'chapter',bpm:76,lead:'lead50',harm:'harp',hs:'arp4',harm2:'str',hs2:'pad',bass:'bass',bs:'half',dr:null,echo:.4,rev:.3},
   captured:{s:'captured',gain:1.1,bpm:84,lead:'flute',harm:'harp',hs:'arp4',harm2:'str',hs2:'pad',ht2:3,bass:'bass',bs:'half',dr:['t...t.t.'],dv:.3,echo:.42,ed:240,efb:.4,rev:.3},
   dream:{s:'dream',gain:0.85,bpm:56,lead:'flute',harm:'box',hs:'arp',ho:1,harm2:'str',hs2:'pad',ht2:3,bass:'bass',bs:'root',dr:null,echo:.55,ed:240,efb:.45,rev:.4},
   forest_gartzke:{s:'woods',gain:0.85,bpm:120,lead:'flute',harm:'harp',hs:'arp3',harm2:'chirp',hs2:'bird',bass:'bass',bs:'root',dr:['h..h..'],dv:.25,echo:.3,rev:.3,amb:'pines',lay:'season'},
   forest_wolf:{s:'woods',gain:1.3,bpm:136,tr:-2,lead:'lead25c',harm:'str',hs:'pad',harm2:'pluck25',hs2:'arp3',ho2:1,bass:'bass',bs:'waltz',dr:['k..h.h','k.hh.h'],dv:.3,echo:.25,rev:.2,amb:'river',lay:'season'},
   forest_ackley:{s:'woods',bpm:100,tr:3,lo:-1,lead:'strL',harm:'pad50',hs:'pad',harm2:'box',hs2:'arp3',ho2:1,bass:'bass',bs:'root',dr:['t.....'],dv:.25,echo:.35,ed:240,rev:.35,amb:'marsh',lay:'season'},
   gym:{s:'gym',gain:1.55,bpm:138,lead:'lead25c',harm:'pluck25',hs:'off',ht:1,harm2:'str',hs2:'pad',ht2:2,bass:'bassG',bs:'synco',dr:['k.hsk.hs','k.hsk.hk','k.hsk.hs','kkhsk.ho'],dv:.6,echo:.15,ed:160},
   workshop:{s:'workshop',bpm:100,sw:.17,lead:'fiddle',harm:'pluck12',hs:'off',ht:1,harm2:'saw12',hs2:'ost',hp2:'a0b0a0b2',ho2:-1,bass:'bass',bs:'half',dr:['t.h.x.h.','t.h.x.ht'],dv:.5,echo:.15,ed:112},
   chorale:{s:'chorale',gain:1.25,bpm:63,lead:'organ',harm:'organI',harm2:'organI',bass:'organB',dr:null,echo:.1,ed:96,rev:.75,amb:'room'}};
  const TOWN={spring:'town_spring',summer:'town_summer',fall:'town_fall',winter:'town_winter'};
  // vertical layers by season: [lead, harmony, harmony 2, bass, drums]. Winter thins the woods to a few voices.
  const SEASON_LAY={spring:[1,1,.9,1,.5],summer:[1,1,1,1,1],fall:[1,1,.55,1,.3],winter:[.85,1,0,.8,0]};

  // ---------------- compile an arrangement into flat per-step event tables (once, cached) ----------------
  const ARP=[0,1,2,3,2,1,2,1],ARP3=[0,1,2,3,2,1];
  const CH_LEAD=0,CH_HARM=1,CH_HARM2=2,CH_BASS=3,CH_KICK=4,CH_SNARE=5,CH_HAT=6,CH_OHAT=7,CH_TOM=8,CH_CLANK=9;
  const DRUM={k:CH_KICK,s:CH_SNARE,h:CH_HAT,o:CH_OHAT,t:CH_TOM,x:CH_CLANK};
  const CACHE={};
  function compile(id){if(CACHE[id])return CACHE[id];const A=TR[id];if(!A){BAD.push('no arrangement '+id);return null;}
    const S=SONG[A.s],spb=S.m,g=S.g||2,tr=A.tr||0;
    const mel=parseMel(S.mel,spb,A.s),CP=parseChords(S.ch,spb,A.s),bars=CP.bars,total=bars*spb,ev=[];
    if(mel.steps!==total)BAD.push(A.s+' melody '+mel.steps+' steps vs '+total+' from chords');
    const CA=new Array(total);CP.ch.forEach(c=>{for(let s=c.st;s<c.st+c.len&&s<total;s++)CA[s]=c;});
    for(let s=0;s<total;s++)if(!CA[s])CA[s]=CP.ch[0];
    const lo=12*(A.lo||0);mel.ev.forEach(e=>ev.push([e[0],CH_LEAD,e[2]+tr+lo,e[1],e[3],e[4]]));
    const tones=(c,o)=>{const pc=(c.r+tr+120)%12;let hr=60+pc;if(pc>=7)hr-=12;hr+=12*(o||0);const T=c.q.map(i=>hr+i);if(T.length<4)T.push(hr+12);return T;};
    const lines={1:S.h1,2:S.h2};
    [[CH_HARM,A.hs,A.ht,A.ho,A.hp],[CH_HARM2,A.hs2,A.ht2,A.ho2,A.hp2]].forEach(([ch,style,ti,o,pat],vi)=>{
      if(lines[vi+1]){const L=parseMel(lines[vi+1],spb,A.s+'.h'+(vi+1));if(L.steps!==total)BAD.push(A.s+'.h'+(vi+1)+' length '+L.steps);L.ev.forEach(e=>ev.push([e[0],ch,e[2]+tr,e[1],e[3],e[4]]));return;}
      if(!style||style==='none')return;
      if(style==='below'){mel.ev.forEach(e=>{const c=CA[e[0]],m=e[2]+tr+lo;let best=-1;
          for(let n=m-3;n>=m-9;n--)if(c.q.some(i=>((c.r+tr+i)%12+12)%12===((n%12)+12)%12)){best=n;break;}
          if(best>0)ev.push([e[0],ch,best,e[1],.8,0]);});return;}
      for(let st=0;st<total;st++){const s=st%spb,c=CA[st],T=tones(c,o),t=ti==null?1:ti,bar=(st/spb)|0;
        if(style==='arp')ev.push([st,ch,T[ARP[s%8]],1,s%2?.8:1,0]);
        else if(style==='arp3')ev.push([st,ch,T[ARP3[s%6]],1,s%3?.8:1,0]);
        else if(style==='arp4'){if(s%2===0)ev.push([st,ch,T[ARP[(s>>1)%8]],2,1,0]);}
        else if(style==='waltz'){if(spb===6?(s===2||s===4):(s===2||s===6))ev.push([st,ch,T[(s===2?1:2)],2,s===2?1:.85,0]);}
        else if(style==='pad'){if(st===c.st)ev.push([st,ch,T[t],c.len,1,0]);}
        else if(style==='stab'){if(s%2===1)ev.push([st,ch,T[1+((s>>1)%2)],1,1,0]);}
        else if(style==='off'){if(s%g===g/2)ev.push([st,ch,T[t],Math.max(1,g/2),s%(2*g)===g/2?1:.85,0]);}
        else if(style==='ost'){const p=pat||'0.2.0.2.',k=p[s%p.length];if(k!=='.'){const lc=k>='a';const n=T[(lc?k.charCodeAt(0)-97:+k)%4]-(lc?12:0);ev.push([st,ch,n,1,s%2?.75:1,0]);}}
        else if(style==='bird'){const h=((bar*7919+s*104729)^(bar*31))%11;if(h===0||(h===5&&s>2))ev.push([st,ch,T[(bar+s)%3]+24,1,.7,0]);}
        else if(style==='drip'){if(s===0)ev.push([st,ch,T[2]+12,3,1,0]);if(s===5&&bar%2===1)ev.push([st,ch,T[1]+12,3,.7,0]);}}});
    // bass
    if(S.bs){const L=parseMel(S.bs,spb,A.s+'.bs');if(L.steps!==total)BAD.push(A.s+'.bs length '+L.steps);L.ev.forEach(e=>ev.push([e[0],CH_BASS,e[2]+tr,e[1],e[3],e[4]]));}
    else{const BR=c=>{const bp=(c.bp+tr+120)%12,br=40+((bp-4+12)%12);return [br,br+7>51?br-5:br+7];};
      for(let st=0;st<total;st++){const s=st%spb,c=CA[st],[br,fifth]=BR(c),bar=(st/spb)|0,cs=st===c.st;
        if(A.bs==='root'||A.bs==='pedal'){if(cs)ev.push([st,CH_BASS,br,c.len,A.bs==='pedal'&&bar%2?.8:1,0]);}
        else if(A.bs==='half'){const h=spb>>1;if(cs&&c.len<spb)ev.push([st,CH_BASS,br,c.len,1,0]);else if(c.len===spb&&(s===0||s===h))ev.push([st,CH_BASS,s?fifth:br,s?spb-h:h,s?.85:1,0]);}
        else if(A.bs==='waltz'){if(s===0)ev.push([st,CH_BASS,bar%2?fifth:br,2,1,0]);}
        else if(A.bs==='drive')ev.push([st,CH_BASS,s%2?br+12:br,1,s%2?.7:1,0]);
        else if(A.bs==='oom'){if(s%g===0)ev.push([st,CH_BASS,(s/g)%2?fifth:br,g,(s/g)%2?.8:1,0]);}
        else if(A.bs==='synco'){if(s===0)ev.push([st,CH_BASS,br,3,1,0]);else if(s===3)ev.push([st,CH_BASS,br,1,.7,0]);else if(s===4)ev.push([st,CH_BASS,br+12,2,.8,0]);else if(s===6)ev.push([st,CH_BASS,fifth,2,.85,0]);}}}
    // drums
    if(A.dr)for(let st=0;st<total;st++){const s=st%spb,pat=A.dr[((st/spb)|0)%A.dr.length],ch=DRUM[pat[s%pat.length]];if(ch!==undefined)ev.push([st,ch,0,1,1,0]);}
    // meter accents: downbeats a little stronger than offbeats (lead and harmony)
    ev.forEach(e=>{if(e[1]<=CH_HARM2){const s=e[0]%spb;e[4]*=s===0?1:(s%g===0?.93:.86);}});
    ev.sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
    const n=ev.length,idx=new Int32Array(total+1),eCh=new Uint8Array(n),eMidi=new Uint8Array(n),eLen=new Uint8Array(n),eVel=new Float32Array(n),eGl=new Uint8Array(n);
    let j=0;for(let s=0;s<total;s++){idx[s]=j;while(j<n&&ev[j][0]===s){const e=ev[j];eCh[j]=e[1];eMidi[j]=e[2];eLen[j]=Math.min(255,e[3]);eVel[j]=e[4];eGl[j]=e[5];j++;}}idx[total]=j;
    const I=[INST[A.lead],INST[A.harm]||INST.pluck25,INST[A.harm2]||INST.pad50,INST[A.bass]||INST.bass];
    I.forEach((x,i)=>{if(!x)BAD.push(id+' missing instrument '+i);});
    return CACHE[id]={id,A,S,total,spb,li:(S.li||0)*spb,sd0:60/A.bpm/g,sw:A.sw||0,idx,eCh,eMidi,eLen,eVel,eGl,loop:A.loop!==false,
      I,dv:A.dv||0,gain:A.gain||1,echo:(A.echo||0)*(A.gain||1),rev:(A.rev||0)*(A.gain||1),ed:Math.min(240,A.ed||176)/1000,efb:A.efb||.33,key:((S.k||0)+tr+120)%12,fast:!!A.fast,amb:A.amb||null,lay:A.lay||null};}

  // ---------------- audio engine (one per AudioContext; the live one plus any offline render) ----------------
  const FREQ=new Float32Array(128);for(let m=0;m<128;m++)FREQ[m]=440*Math.pow(2,(m-69)/12);
  // wavetables standing in for SNES samples: harmonic amplitudes, gently rolled off
  function spectrum(name){const N=32,re=new Float32Array(N),im=new Float32Array(N),roll=k=>1-k/(N*1.4);
    for(let k=1;k<N;k++){let a=0;
      if(name[0]==='p'){const d={p12:.125,p25:.25,p50:.5}[name];a=2*Math.sin(Math.PI*k*d)/(Math.PI*k);}
      else if(name==='tri')a=k%2?(((k-1)/2)%2?-1:1)*8/(Math.PI*Math.PI*k*k):0;
      else if(name==='saw')a=1/k;
      else if(name==='str')a=(1/k)*(k>8?.5:1);
      else if(name==='flute')a=[0,1,.32,.12,.06,.03,.015][k]||0;
      else if(name==='reed')a=[0,1,.75,.6,.5,.42,.36,.28,.22,.16,.12,.08,.05][k]||0;
      else if(name==='organ')a={1:1,2:.75,3:.45,4:.5,6:.28,8:.22,10:.08,12:.06}[k]||0;
      else if(name==='tuba')a=[0,1,.55,.28,.14,.07,.03][k]||0;
      else if(name==='harp')a=[0,1,.4,.22,.12,.06,.03,.015][k]||0;
      else if(name==='box')a={1:1,2:.12,4:.42,6:.08,8:.16,12:.05}[k]||0;
      im[k]=a*roll(k);}
    return [re,im];}
  const WAVE_NAMES=['p12','p25','p50','tri','saw','str','flute','reed','organ','tuba','harp','box'];
  function ramp(p,to,now,sec){p.cancelScheduledValues(now);p.setValueAtTime(p.value,now);p.linearRampToValueAtTime(to,now+Math.max(0.01,sec));}
  function mkEngine(ctx){const E={ctx,bus:[],bi:0,cur:null,C:null,step:0,nextT:0,ended:false,loops:0,notes:0,lay:[1,1,1,1,1],tm:1,stEnd:0,ambKind:null,nextCall:0};
    const W={};WAVE_NAMES.forEach(n=>{const [re,im]=spectrum(n);W[n]=ctx.createPeriodicWave(re,im);});E.W=W;
    const len=ctx.sampleRate|0,NOISE=ctx.createBuffer(1,len,ctx.sampleRate),nd=NOISE.getChannelData(0);
    let hold=0;for(let i=0;i<len;i++){if(i%3===0)hold=Math.random()*2-1;nd[i]=hold;} // slightly crunchy, chip-ish noise
    const pan=v=>{if(ctx.createStereoPanner){const p=ctx.createStereoPanner();p.pan.value=v;return p;}return ctx.createGain();};
    const G=v=>{const g=ctx.createGain();g.gain.value=v;return g;};
    // master: mix (music volume) -> soft limiter -> out
    E.mix=G(0);E.lim=ctx.createDynamicsCompressor();E.lim.threshold.value=-8;E.lim.knee.value=6;E.lim.ratio.value=14;E.lim.attack.value=0.003;E.lim.release.value=0.2;
    E.mix.connect(E.lim);E.out=G(1);E.lim.connect(E.out);E.out.connect(ctx.destination);
    E.duck=G(1);E.duck.connect(E.mix);
    // SNES-style echo: feedback delay with a low-passed (FIR-like) loop
    E.echoIn=G(1);E.delay=ctx.createDelay(1.0);E.delay.delayTime.value=0.176;E.elp=ctx.createBiquadFilter();E.elp.type='lowpass';E.elp.frequency.value=2600;
    E.efb=G(.33);const ewet=G(.5);E.echoIn.connect(E.delay);E.delay.connect(E.elp);E.elp.connect(E.efb);E.efb.connect(E.delay);E.elp.connect(ewet);ewet.connect(E.duck);
    // small room reverb: synthetic decaying-noise impulse (stereo, 1.6 s)
    try{const rl=Math.floor(ctx.sampleRate*1.6),IR=ctx.createBuffer(2,rl,ctx.sampleRate);
      for(let c=0;c<2;c++){const d=IR.getChannelData(c);let lp=0;for(let i=0;i<rl;i++){lp+=(Math.random()*2-1-lp)*0.35;d[i]=lp*Math.exp(-i/(ctx.sampleRate*0.42));}}
      E.rvIn=G(1);const pre=ctx.createBiquadFilter();pre.type='lowpass';pre.frequency.value=3800;E.conv=ctx.createConvolver();E.conv.buffer=IR;const rwet=G(.55);
      E.rvIn.connect(pre);pre.connect(E.conv);E.conv.connect(rwet);rwet.connect(E.duck);}catch(e){E.rvIn=G(0);}
    E.lfo=ctx.createOscillator();E.lfo.frequency.value=5.3;E.lfo.start();
    // ambience: noise -> filter -> gain, with a slow swell (wind in pines, river, marsh); a sine "whistle" for loons and birds
    E.ambSrc=ctx.createBufferSource();E.ambSrc.buffer=NOISE;E.ambSrc.loop=true;E.ambF=ctx.createBiquadFilter();E.ambF.type='bandpass';E.ambF.frequency.value=600;E.ambF.Q.value=.8;
    E.ambG=G(0);E.ambSrc.connect(E.ambF);E.ambF.connect(E.ambG);E.ambG.connect(E.mix);E.ambSrc.start();
    E.ambL=ctx.createOscillator();E.ambL.frequency.value=.07;E.ambLG=G(0);E.ambLF=G(0);E.ambL.connect(E.ambLG);E.ambLG.connect(E.ambG.gain);E.ambL.connect(E.ambLF);E.ambLF.connect(E.ambF.frequency);E.ambL.start();
    E.wh=ctx.createOscillator();E.wh.type='sine';E.whG=G(0);const whv=G(9);E.lfo.connect(whv);whv.connect(E.wh.detune);E.wh.connect(E.whG);E.whG.connect(E.mix);E.whG.connect(E.rvIn);E.wh.start();
    // stinger voices (outside the buses so the music can duck under them)
    E.stO=[];E.stG=[];const stOut=G(1);stOut.connect(E.mix);stOut.connect(E.echoIn);
    for(let i=0;i<2;i++){const o=ctx.createOscillator(),g=G(0);o.setPeriodicWave(W[i?'p25':'box']);o.connect(g);g.connect(stOut);o.start();E.stO.push(o);E.stG.push(g);}
    function mkBus(){const b={lastM:[0,0,0,0]};
      b.x=G(0);b.x.connect(E.duck);b.ex=G(0);b.ex.connect(E.echoIn);b.rv=G(0);b.rv.connect(E.rvIn);
      b.mel=G(1);b.mel.connect(b.x);b.mel.connect(b.ex);b.mel.connect(b.rv);
      b.o=[];b.g=[];b.f=[];b.cg=[];
      for(let c=0;c<4;c++){const o=ctx.createOscillator(),f=ctx.createBiquadFilter(),g=G(0),cg=G(1);f.type='lowpass';f.frequency.value=8000;f.Q.value=.6;
        o.connect(f);f.connect(g);g.connect(cg);
        if(c===CH_BASS)cg.connect(b.x);else{const p=pan(c===CH_HARM?-.3:c===CH_HARM2?.3:0);cg.connect(p);p.connect(b.mel);}
        o.start();b.o.push(o);b.f.push(f);b.g.push(g);b.cg.push(cg);}
      b.o2=ctx.createOscillator();b.o2g=G(0);b.o2.connect(b.o2g);b.o2g.connect(b.f[0]);b.o2.start();      // chorus partner for the lead
      b.vib=G(0);E.lfo.connect(b.vib);b.vib.connect(b.o[0].detune);b.vib.connect(b.o2.detune);
      b.vibH=G(0);E.lfo.connect(b.vibH);b.vibH.connect(b.o[1].detune);b.vibH.connect(b.o[2].detune);
      b.dg=G(1);b.dg.connect(b.x);                                                                      // drum layer
      b.kick=ctx.createOscillator();b.kick.type='triangle';b.kg=G(0);b.kick.connect(b.kg);b.kg.connect(b.dg);b.kick.start();
      const src=ctx.createBufferSource();src.buffer=NOISE;src.loop=true;
      const bp=ctx.createBiquadFilter();bp.type='bandpass';bp.frequency.value=1700;bp.Q.value=0.7;
      const hp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=6500;
      b.sg=G(0);b.hg=G(0);src.connect(bp);bp.connect(b.sg);b.sg.connect(b.dg);src.connect(hp);hp.connect(b.hg);b.hg.connect(b.dg);src.start();
      return b;}
    E.bus=[mkBus(),mkBus()];return E;}

  // ---------------- voices ----------------
  function env(p,t,dur,I,vel){const pk=I.v*vel,rel=Math.min(I.r||0.07,dur*0.35),sEnd=t+dur-rel,dEnd=Math.min(t+I.a+I.d,sEnd);
    p.setValueAtTime(0,t);p.linearRampToValueAtTime(pk,t+Math.min(I.a,dur*0.3));
    const sus=pk*I.s;if(dEnd>t+I.a){p.linearRampToValueAtTime(sus,dEnd);if(sEnd>dEnd)p.setValueAtTime(sus,sEnd);}
    p.linearRampToValueAtTime(0,t+dur);}
  function play(E,b,C,j,t,sd){const ch=C.eCh[j],vel=C.eVel[j];E.notes++;
    if(ch<=CH_BASS){const I=C.I[ch],m=C.eMidi[j],dur=Math.max(0.04,C.eLen[j]*sd*(ch===CH_BASS?0.95:0.92)-0.012),f=FREQ[m],fq=b.o[ch].frequency;
      if(C.eGl[j]&&I.gl&&b.lastM[ch]){fq.setValueAtTime(FREQ[b.lastM[ch]],t);fq.exponentialRampToValueAtTime(f,t+Math.min(I.gl,dur*.5));
        if(ch===0){b.o2.frequency.setValueAtTime(FREQ[b.lastM[ch]],t);b.o2.frequency.exponentialRampToValueAtTime(f,t+Math.min(I.gl,dur*.5));}}
      else{fq.setValueAtTime(f,t);if(ch===0)b.o2.frequency.setValueAtTime(f,t);}
      b.lastM[ch]=m;
      if(I.fe){const ff=b.f[ch].frequency,lp=I.lp||8000;ff.setValueAtTime(Math.min(12000,lp*I.fe),t);ff.exponentialRampToValueAtTime(lp,t+I.a+I.d);}
      if(ch===0&&I.vib){b.vib.gain.setValueAtTime(0,t);b.vib.gain.linearRampToValueAtTime(I.vib,t+(I.vd||.2)+.12);}  // delayed vibrato
      env(b.g[ch].gain,t,dur,I,vel);return;}
    const dv=C.dv*vel;
    if(ch===CH_KICK||ch===CH_TOM){const f=b.kick.frequency,g=b.kg.gain,tom=ch===CH_TOM;f.setValueAtTime(tom?320:160,t);f.exponentialRampToValueAtTime(tom?150:44,t+(tom?.09:.11));
      g.setValueAtTime(0,t);g.linearRampToValueAtTime((tom?.32:.42)*dv,t+0.004);g.linearRampToValueAtTime(0,t+(tom?.12:.16));}
    else if(ch===CH_SNARE||ch===CH_CLANK){const g=b.sg.gain;g.setValueAtTime(0,t);g.linearRampToValueAtTime(0.2*dv,t+0.003);g.linearRampToValueAtTime(0,t+(ch===CH_CLANK?.07:.13));
      if(ch===CH_CLANK){const h=b.hg.gain;h.setValueAtTime(0,t);h.linearRampToValueAtTime(0.16*dv,t+0.002);h.linearRampToValueAtTime(0,t+0.11);}}
    else{const g=b.hg.gain,open=ch===CH_OHAT;g.setValueAtTime(0,t);g.linearRampToValueAtTime(0.09*dv,t+0.002);g.linearRampToValueAtTime(0,t+(open?0.16:0.035));}}
  function quiet(b,now){for(let c=0;c<4;c++){b.g[c].gain.cancelScheduledValues(now);b.g[c].gain.setValueAtTime(0,now);b.o[c].frequency.cancelScheduledValues(now);b.f[c].frequency.cancelScheduledValues(now);b.lastM[c]=0;}
    b.o2.frequency.cancelScheduledValues(now);b.vib.gain.cancelScheduledValues(now);
    for(const g of [b.kg.gain,b.sg.gain,b.hg.gain]){g.cancelScheduledValues(now);g.setValueAtTime(0,now);}b.kick.frequency.cancelScheduledValues(now);}

  // ---------------- transport ----------------
  function switchTo(E,id,now){const old=E.cur?E.bus[E.bi]:null,N=id?compile(id):null,C=E.C;
    const fast=(N&&N.fast)||(C&&C.fast&&!N),fo=fast?0.18:0.9,fi=N&&N.fast?0.02:0.5;
    if(old){ramp(old.x.gain,0,now,fo);ramp(old.ex.gain,0,now,fo);ramp(old.rv.gain,0,now,fo);}
    E.cur=id;E.C=N;E.step=0;E.ended=false;E.loops=0;E.tm=1;
    ambSet(E,N?N.amb:null,now);
    if(!N)return;
    E.bi=old?1-E.bi:E.bi;const b=E.bus[E.bi];quiet(b,now);
    for(let c=0;c<4;c++){const I=N.I[c];b.o[c].setPeriodicWave(E.W[I.w]||E.W.p25);b.f[c].frequency.setValueAtTime(I.lp||8000,now);}
    const L=N.I[0];b.o2.setPeriodicWave(E.W[L.w]||E.W.p25);b.o2.detune.setValueAtTime(L.ch||0,now);b.o2g.gain.setValueAtTime(L.ch?1:0,now);
    b.vib.gain.setValueAtTime(0,now);b.vibH.gain.setValueAtTime(Math.max(N.I[1].vib||0,N.I[2].vib||0),now);
    E.lay=layersFor(N);for(let c=0;c<4;c++)b.cg[c].gain.setValueAtTime(E.lay[c],now);b.dg.gain.setValueAtTime(E.lay[4],now);
    E.delay.delayTime.setTargetAtTime(N.ed,now,0.08);E.efb.gain.setTargetAtTime(N.efb,now,0.1);
    ramp(b.x.gain,N.gain,now,fi);ramp(b.ex.gain,N.echo,now,fi);ramp(b.rv.gain,N.rev,now,fi);E.nextT=now+(fast?0.03:0.12);}
  function schedule(E,until,guard){const C=E.C;if(!C||E.ended)return;const b=E.bus[E.bi];
    while(E.nextT<until&&guard-->0){const sd=C.sd0/E.tm,t=E.nextT+(E.step%2?C.sw*sd:0);
      for(let j=C.idx[E.step],e=C.idx[E.step+1];j<e;j++)play(E,b,C,j,t,sd);
      E.nextT+=sd;if(++E.step>=C.total){if(C.loop){E.step=C.li;E.loops++;}else{E.ended=true;break;}}}}
  // vertical layers and tempo: forest seasons; a battle's counter-line and a 7% lift when the enemy is nearly free
  function urgent(){try{if(typeof BT==='undefined'||!BT||typeof foeUnits!=='function')return false;let h=0,m=0;for(const u of foeUnits()){m+=u.st.hpMax;if(!u.freed)h+=Math.max(0,u.hp);}return m>0&&h>0&&h/m<.34;}catch(e){return false;}}
  function season(){try{return typeof seasonNow==='function'?seasonNow():'spring';}catch(e){return 'spring';}}
  function layersFor(C){if(C.lay==='season')return SEASON_LAY[season()]||SEASON_LAY.spring;
    if(C.lay==='urgent')return urgent()?[1,1,1,1,1]:[1,1,.35,1,1];return [1,1,1,1,1];}
  function updateLayers(E,now){const C=E.C;if(!C||!C.lay)return;const L=layersFor(C),b=E.bus[E.bi];
    for(let c=0;c<5;c++)if(Math.abs(L[c]-E.lay[c])>1e-3)ramp(c<4?b.cg[c].gain:b.dg.gain,L[c],now,1.4);E.lay=L;
    E.tm=C.lay==='urgent'&&urgent()?1.07:1;
    if(C.amb&&E.ambSeason!==season())ambSet(E,C.amb,now);}
  // ---------------- ambience ----------------
  const AMB={pines:{f:520,q:.7,v:.045,d:.03,fd:220,r:.07},river:{f:900,q:.5,v:.05,d:.012,fd:120,r:.31},marsh:{f:700,q:.6,v:.028,d:.012,fd:160,r:.11},
    wind:{f:450,q:.9,v:.04,d:.03,fd:260,r:.06},room:{f:240,q:.5,v:.006,d:.002,fd:30,r:.05}};
  function ambSet(E,kind,now){const s=season();E.ambSeason=s;let k=kind;if(k&&k!=='room'&&s==='winter')k='wind';
    const P=k?AMB[k]:null;E.ambKind=kind;
    if(!P){ramp(E.ambG.gain,0,now,1.2);ramp(E.ambLG.gain,0,now,1.2);return;}
    E.ambF.frequency.setTargetAtTime(P.f,now,.3);E.ambF.Q.setTargetAtTime(P.q,now,.3);E.ambL.frequency.setTargetAtTime(P.r,now,.3);
    ramp(E.ambG.gain,P.v,now,2.5);ramp(E.ambLG.gain,P.d,now,2.5);ramp(E.ambLF.gain,P.fd,now,2.5);
    E.nextCall=now+4+Math.random()*6;}
  // loons on open water outside winter (they leave the lakes before freeze-up); birdsong in spring and summer
  function ambCalls(E,now,until){const k=E.ambKind;if(!k||k==='room'||k==='wind')return;const s=E.ambSeason;if(s==='winter')return;
    const loonP={marsh:.55,river:.35,pines:.2}[k]||0;
    while(E.nextCall<until){const t=Math.max(now,E.nextCall),f=E.wh.frequency,g=E.whG.gain;
      if(Math.random()<loonP){
        // a loon's wail: slide up, hold, fall back; answered once from across the water
        const a=392+Math.random()*30;for(let r=0;r<2;r++){const t0=t+r*2.6,b=a*(r?1.12:1),v=r?.018:.028;
          f.setValueAtTime(b,t0);f.exponentialRampToValueAtTime(b*1.5,t0+.45);f.setValueAtTime(b*1.5,t0+1.3);f.exponentialRampToValueAtTime(b*1.335,t0+1.8);
          g.setValueAtTime(0,t0);g.linearRampToValueAtTime(v,t0+.25);g.setValueAtTime(v,t0+1.5);g.linearRampToValueAtTime(0,t0+2.1);}
        E.nextCall=t+20+Math.random()*20;}
      else if(s==='spring'||s==='summer'){
        // two or three quick bird chirps
        const n=2+(Math.random()*2|0),b=2600+Math.random()*900;for(let i=0;i<n;i++){const t0=t+i*.16;f.setValueAtTime(b,t0);f.exponentialRampToValueAtTime(b*1.25,t0+.07);
          g.setValueAtTime(0,t0);g.linearRampToValueAtTime(.012,t0+.01);g.linearRampToValueAtTime(0,t0+.09);}
        E.nextCall=t+7+Math.random()*9;}
      else E.nextCall=t+12;}}
  // ---------------- stingers ----------------
  // Asynchronous to the player but synchronous to the music: they wait for the next eighth of the current track,
  // take its key, and duck the bed for a moment (Toolbox chs. 3, 13, 18). Rewards ascend.
  const STING={fact:{n:[[0,.075],[9,.075],[7,.075],[6,.075],[7,.12],[19,.42]],b:[[-12,.3],[7,.6]],v:.13},
               level:{n:[[0,.085],[4,.085],[7,.085],[9,.085],[12,.12],[16,.6]],b:[[-5,.34],[12,.6]],v:.12}};
  function sting(E,kind,now){const S=STING[kind];if(!S)return 0;const C=E.C;let t=now+0.03;
    if(C&&!E.ended){const sd=C.sd0/E.tm;let q=E.nextT;while(q-sd>now+0.03)q-=sd;t=Math.max(t,q);}
    if(E.cur==='victory'&&C&&!E.ended)t=Math.max(t,E.nextT+(C.total-E.step)*C.sd0);
    t=Math.max(t,E.stEnd+0.05);
    const root=72+(((C?C.key:0)+6)%12)-6;let tt=t;
    S.n.forEach(([iv,d],i)=>{const o=E.stO[0],g=E.stG[0].gain,last=i===S.n.length-1;o.frequency.setValueAtTime(FREQ[root+iv],tt);
      g.setValueAtTime(0,tt);g.linearRampToValueAtTime(S.v,tt+.006);g.linearRampToValueAtTime(S.v*(last?.5:.35),tt+d*.8);g.linearRampToValueAtTime(0,tt+d+(last?.3:0));tt+=d;});
    // a second voice: a low note under the start, then a harmony note under the last melody note
    const o=E.stO[1],g=E.stG[1].gain,tLast=tt-S.n[S.n.length-1][1];let t2=t;
    S.b.forEach(([iv,d],i)=>{const t0=i?tLast:t;o.frequency.setValueAtTime(FREQ[root+iv],t0);g.setValueAtTime(0,t0);g.linearRampToValueAtTime(S.v*.4,t0+.01);g.linearRampToValueAtTime(0,t0+d);t2=t0+d;});
    const end=Math.max(tt+.3,t2);ramp(E.duck.gain,1,t,0.01);E.duck.gain.linearRampToValueAtTime(.45,t+.06);E.duck.gain.setValueAtTime(.45,end);E.duck.gain.linearRampToValueAtTime(1,end+.5);
    E.stEnd=end;return end-now;}

  // ---------------- live player ----------------
  let L=null,lastVol=-1,frame=0;
  const LOOK=0.25;
  function vol(){let v=SET.musicVol;return (typeof v==='number'&&isFinite(v))?Math.max(0,Math.min(1,v)):0.6;}
  let wonBT=null,daimonLatch=false,lastPick=null;
  function mapName(m){try{return (typeof INT!=='undefined'&&INT[m]&&INT[m].name||'')+' '+m;}catch(e){return m;}}
  function pickMap(m){
    if(m==='int_gartzke')return'forest_gartzke';if(m==='int_wolf')return'forest_wolf';if(m==='int_ackley')return'forest_ackley';
    if(m==='basement')return'basement';
    if(m==='shop'||m==='canopy')return'store';
    if(typeof m==='string'&&m.indexOf('int_')===0){const nm=mapName(m),D=typeof INT!=='undefined'&&INT[m]||{};
      if(D.music&&TR[D.music])return D.music;                       // an interior may name its own track
      if(D.gym)return'gym';if(D.trades)return'workshop';if(D.faith||D.church)return'chorale';
      if(/gym|uma\b|_uma|martial|fitness|dojo/i.test(nm))return'gym';
      if(/ntc|northcentral|technical|wood ?shop|woodwork|trades?\b|garage|workshop|sawmill/i.test(nm))return'workshop';
      if(/church|chapel|parish|faith|lutheran|catholic|methodist|baptist|congregation|sanctuary|worship/i.test(nm))return'chorale';
      if(/forest|woods|flowage|river|wildlife|marsh|trail/i.test(nm))return'forest_gartzke';
      if(/library|museum|ledger|archive/i.test(nm))return'think';
      return'indoors';}
    return null;}
  function pick(){
    if(MUSIC.force)return MUSIC.force;
    if(typeof mode==='undefined')return null;
    if(mode==='title'||mode==='create')return'title';
    if(mode==='almanac'||mode==='study'||mode==='edutree')return'think';
    if(mode==='battle'&&typeof BT!=='undefined'&&BT){if(BT.phase==='win')return'victory';if(BT.phase==='lose')return null;return BT.boss?'boss':'battle';}
    if(mode==='pmenu'||mode==='map')return lastPick;
    if(mode==='store')return'store';
    if(mode==='kayak')return'forest_wolf';
    if(mode==='discgolf')return'forest_gartzke';
    if(mode==='hoops'||mode==='pickle')return'gym';
    if(typeof G==='undefined'||!G)return null;
    if(mode==='inside'&&G.inside){const f=G.inside.f,F=(typeof FIG_FLOORS!=='undefined'&&FIG_FLOORS[f])||{};
      if(F.room&&F.room.b&&typeof capOf==='function'&&capOf(F.room.b))return'captured';
      if(f==='mill')return'captured';if(f==='main'||f==='up')return'store';if(f==='base')return'basement';if(f==='myroom')return'dream';
      if(F.bld==='uma')return'gym';if(F.bld==='museum')return'think';
      const nm=((F.place||'')+' '+(F.name||'')+' '+((F.room&&F.room.kind)||''));
      if(/church|chapel|parish|lutheran|catholic|methodist|baptist|congregation|worship/i.test(nm))return'chorale';
      if(/library|museum|gallery|archive|court|law/i.test(nm))return'think';
      if(/garage|shop floor|mill|plant|factory|lumber|woodwork/i.test(nm))return'workshop';
      if(/gym|fitness|martial/i.test(nm))return'gym';
      return'indoors';}
    if(typeof SKY!=='undefined'&&SKY.elev<-4)return'dusk';
    return TOWN[season()]||'town_spring';}
  function tick(){if(typeof AC==='undefined'||!AC)return;
    if(!L){try{L=mkEngine(AC);}catch(e){L=null;return;}}
    const on=!!SET.music,want=on?pick():null;if(want)lastPick=want;MUSIC.want=on?want:pick();
    const tv=on?vol()*0.18:0;
    if(tv!==lastVol){ramp(L.mix.gain,tv,AC.currentTime,on?0.3:0.12);lastVol=tv;}
    if(want!==L.cur)switchTo(L,want,AC.currentTime);
    const now=AC.currentTime;
    if(++frame%15===0){updateLayers(L,now);ambCalls(L,now,now+1);}
    if(!L.C||L.ended)return;
    if(L.nextT<now-0.05)L.nextT=now+0.05; // fell behind (tab was hidden): resync
    schedule(L,now+LOOK,64);}
  function canSting(){return !!(L&&AC&&SET.music&&vol()>0.001&&AC.state==='running');}
  // offline check: render a track into an OfflineAudioContext and measure it
  function render(id,sec,opt){opt=opt||{};const OAC=window.OfflineAudioContext||window.webkitOfflineAudioContext,sr=22050;
    const oc=new OAC(2,Math.ceil(sr*sec),sr),E=mkEngine(oc);E.mix.gain.value=(opt.vol==null?0.8:opt.vol)*0.18;
    switchTo(E,id,0);if(opt.season)E.ambSeason=opt.season;if(opt.urgent)E.tm=1.07;
    schedule(E,sec,100000);ambCalls(E,0,sec);(opt.sting||[]).forEach(([k,t])=>sting(E,k,t));
    return oc.startRendering().then(buf=>{let pk=0,ss=0;const n=buf.length;
      for(let c=0;c<buf.numberOfChannels;c++){const d=buf.getChannelData(c);for(let i=0;i<n;i++){const v=d[i];if(v>pk)pk=v;else if(-v>pk)pk=-v;ss+=v*v;}}
      return {peak:pk,rms:Math.sqrt(ss/(n*buf.numberOfChannels)),notes:E.notes,loops:E.loops,ended:E.ended};});}
  function wake(){try{initAudio();if(AC&&AC.state==='suspended')AC.resume();}catch(e){}}
  ['keydown','pointerdown','touchstart','click'].forEach(ev=>addEventListener(ev,wake,{capture:true,passive:true}));
  return {tick,wake,force:null,want:null,bad:BAD,list:()=>Object.keys(TR),compile,render,pickMap,canSting,
    sting(kind){if(!canSting())return false;return sting(L,kind,AC.currentTime)>0;},
    markWin(){if(typeof BT!=='undefined'&&BT)wonBT=BT;},
    songs:()=>Object.keys(SONG),
    get current(){return L?L.cur:null;},get ready(){return !!L;},get step(){return L?L.step:0;},get notes(){return L?L.notes:0;},get loops(){return L?L.loops:0;},
    get ended(){return L?L.ended:false;},get gain(){return L?L.mix.gain.value:0;},get out(){return L?L.out:null;},get state(){return typeof AC!=='undefined'&&AC?AC.state:'none';},
    get tempo(){return L?L.tm:1;},get layers(){return L?L.lay.slice():null;},get amb(){return L?L.ambKind:null;}};
})();
// The rebuild's loop: tick the scheduler about 30 times a second (it books notes a quarter second ahead).
setInterval(()=>{try{MUSIC.tick();}catch(e){}},33);
