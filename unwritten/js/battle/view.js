"use strict";
// =====================================================================
//  DRAWING THE BATTLE, and THE ART SLOTS.
//  Monsters are stills (Christian, Nov 10): FF6 moves them by flashing, shaking and fading, never by animation frames.
//  To use Christian's art for a monster: put the still at assets/battle/foes/<id>.png and add the id to FOE_ART below.
//  To use new party art: add an entry to PARTY_ART (an image, and frame rects per pose). Until then the stand-ins draw.
// =====================================================================
const FOE_ART = { tater: 'assets/monsters/potato.png' };   // id -> still
// Nov 27: the ChatGPT-painted FF6-style stills (Daimon as the style anchor), snapped to their own pixel grid.
// All share one pixel size on screen (FOE_PX logical px per art px), so their pixels match; at phone/retina density they draw near 1:1.
const FOE_STILLS = ['wisp','cliff','doubt','hook','echo','herring','golem','narrator','suspicion','gesture','triangle','waiting','sweet','prophecy','possessive','door','lordling','drone','jump','edgemap','tghost','upgrade','dread','bridge','double','gavel','b_detective','b_suitor','b_wild','b_chosen','b_countdown','b_dark','daimon','answer'];
for (const id of FOE_STILLS) FOE_ART[id] = 'assets/battle/foes/' + id + '.png';
const FOE_PX = { foe: 0.48, boss: 0.72 };
const PARTY_ART = {};   // e.g. christian: { src: 'assets/battle/party/christian.png', k: 2, poses: { idle: [[x,y,w,h], ...], attack: [...], ... } }
const BIMG = { party: new Image(), standin: new Image(), foe: {}, party2: {} };
BIMG.party.src = 'assets/battle/party.png'; BIMG.standin.src = 'assets/battle/foes_standin.png';
BIMG.kid = { boy: new Image(), girl: new Image() }; BIMG.kid.boy.src = 'assets/kid/boy_poses.png'; BIMG.kid.girl.src = 'assets/kid/girl_poses.png';
// the hero's battle poses: the boy's pose strip (idle, hurt, kneel, collapsed, cheer, cast, use item, read; 170 x 248 each, his 8x art)
const KID_BPOSE = { boy: { w: 170, h: 248, k: 4.6, idle: 0, hurt: 1, low: 2, ko: 3, victory: 4, cast: 5, attack: 5, kick: 5, power: 5, item: 6, guard: 0, run: 0 },
  girl: { w: 170, h: 248, k: 4.6, idle: 0, hurt: 1, low: 2, ko: 3, victory: 4, cast: 5, attack: 5, kick: 5, power: 5, item: 6, guard: 0, run: 0 } };   // Nov 22: her own 8 poses, matched to his
for (const [id, src] of Object.entries(FOE_ART)) { const im = new Image(); im.src = src; BIMG.foe[id] = im; }
for (const [id, d] of Object.entries(PARTY_ART)) { const im = new Image(); im.src = d.src; BIMG.party2[id] = im; }
// the stand-in party poses (cut from Christian's sheets for the Nov 10 teaser) and which way each row faces
const POSES = {
  ch: { idle: 'ch_idle', attack: 'ch_attack', kick: 'ch_attack', cast: 'ch_cast', power: 'ch_cast', guard: 'ch_idle', hurt: 'ch_hurt', ko: 'ch_ko', victory: 'ch_vic', run: 'ch_right' },
  dn: { idle: 'dn_guard', attack: 'dn_punch', kick: 'dn_kick', cast: 'dn_power', power: 'dn_power', guard: 'dn_guard', hurt: 'dn_hurt', ko: 'dn_ko', victory: 'dn_vic', run: 'dn_runr' },
  rb: { idle: 'rb_idle', attack: 'rb_attack', kick: 'rb_attack', cast: 'rb_cast', power: 'rb_cast', guard: 'rb_idle', hurt: 'rb_hurt', ko: 'rb_ko', victory: 'rb_cast', run: 'rb_right' } };
const POSE_FLIP = { rb_idle: 1, ch_attack: 0, rb_ko: 0, ch_ko: 0 };   // 1 = mirror so it faces the foes (to the right)
const FH = 196;   // the battlefield's height; the windows sit below
const PSLOT = [[98, 120], [74, 148], [110, 176]];
const FSLOT = { 1: [[280, 156]], 2: [[244, 132], [320, 172]], 3: [[238, 112], [322, 140], [254, 182]], 4: [[232, 104], [316, 116], [248, 170], [330, 184]], 5: [[228, 96], [304, 104], [362, 140], [244, 166], [318, 186]] };
function partyPos(u) { const [x, y] = PSLOT[u.slot] || PSLOT[0]; return [x - (u.row === 'back' ? 16 : 0) + u.dx * 70, y]; }
function foePos(u) { const L = FSLOT[Math.min(5, foeUnits().length)] || FSLOT[5]; return L[u.slot] || L[0]; }
// where a foe's still comes from, and how big it is on screen
function foeArt(u) {
  const id = u.f.art, im = BIMG.foe[id];
  if (im && im.complete && im.naturalWidth && FOE_STILLS.includes(id)) { const k = u.f.boss ? FOE_PX.boss : FOE_PX.foe;
    return { im, sx: 0, sy: 0, sw: im.naturalWidth, sh: im.naturalHeight, w: im.naturalWidth * k, h: im.naturalHeight * k, smooth: false }; }
  if (im && im.complete && im.naturalWidth) { const box = u.f.boss ? [150, 140] : [116, 104], s = Math.min(box[0] / im.naturalWidth, box[1] / im.naturalHeight, 2);
    return { im, sx: 0, sy: 0, sw: im.naturalWidth, sh: im.naturalHeight, w: Math.round(im.naturalWidth * s), h: Math.round(im.naturalHeight * s), smooth: s < 1 }; }
  const r = ART_FOE_STANDIN[id];
  if (r && BIMG.standin.complete) return { im: BIMG.standin, sx: r[0], sy: r[1], sw: r[2], sh: r[3], w: r[2], h: r[3] };
  return null;
}
// ---------- backdrops (generic places: no real signs) ----------
function bgDraw(kind) {
  const t = BT.t, g = (y0, y1, a, b) => { const gr = ctx.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, a); gr.addColorStop(1, b); ctx.fillStyle = gr; ctx.fillRect(0, y0, SW, y1 - y0); };
  const letters = (n, col) => { ctx.font = SMALL; ctx.fillStyle = col; for (let i = 0; i < n; i++) { const h = hash(i, 7), x = (h % SW + t * (0.2 + (h % 5) / 10)) % SW, y = (h >> 9) % FH; ctx.fillText(String.fromCharCode(65 + (h >> 3) % 26), x, y); } };
  if (kind === 'street') { g(0, FH, '#0e1230', '#2a2850'); for (let i = 0; i < 9; i++) { const h = hash(i, 3), w = 30 + h % 30, bh = 50 + (h >> 4) % 60, x = i * 44 - 10; R(x, 120 - bh, w, bh, '#16163a'); for (let wy = 124 - bh; wy < 112; wy += 10) for (let wx = x + 4; wx < x + w - 6; wx += 9) if (hash(wx, wy) % 3 === 0) R(wx, wy, 4, 5, '#e8c870'); } g(120, FH, '#2a2a3a', '#3a3a4a'); for (let x = 0; x < SW; x += 40) R(x + ((t >> 2) % 40) * 0, 150, 20, 2, '#8a8a6a'); return; }
  if (kind === 'library') { g(0, FH, '#2a1a12', '#3a2618'); for (let y = 10; y < 120; y += 22) { R(0, y + 18, SW, 3, '#1a0e08'); for (let x = 2; x < SW; x += 5 + hash(x, y) % 4) { const h = hash(x, y); R(x, y + 2 + h % 4, 4, 16 - h % 4, ['#6a2a2a', '#2a4a6a', '#5a5a2a', '#3a5a3a', '#6a4a2a'][h % 5]); } } g(124, FH, '#4a3020', '#2a1a10'); return; }
  if (kind === 'park') { g(0, 120, '#3a2a5a', '#c87a5a'); for (let i = 0; i < 8; i++) { const h = hash(i, 11), x = i * 52 - 10, r = 20 + h % 14; ctx.fillStyle = '#1a2a1a'; ctx.beginPath(); ctx.arc(x, 110 - (h >> 5) % 20, r, 0, 7); ctx.fill(); R(x - 2, 110, 4, 14, '#1a120a'); } g(118, FH, '#2a4a2a', '#1a3a1a'); return; }
  if (kind === 'void') { R(0, 0, SW, FH, '#08060e'); letters(60, 'rgba(160,140,200,.18)'); const gr = ctx.createRadialGradient(SW * 0.7, FH * 0.55, 10, SW * 0.7, FH * 0.55, 160); gr.addColorStop(0, 'rgba(70,40,110,.35)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, SW, FH); return; }
  if (kind === 'grid') { g(0, FH, '#060a1a', '#0a1a3a'); ctx.strokeStyle = 'rgba(80,200,255,.35)'; ctx.lineWidth = 1; for (let i = -12; i <= 12; i++) { ctx.beginPath(); ctx.moveTo(SW / 2 + i * 8, 90); ctx.lineTo(SW / 2 + i * 60, FH); ctx.stroke(); } for (let k = 0; k < 8; k++) { const y = 90 + Math.pow((k + (t % 40) / 40) / 8, 2) * (FH - 90); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SW, y); ctx.stroke(); } return; }
  if (kind === 'lake') { g(0, 96, '#5a7ab8', '#e8c8a0'); R(0, 86, SW, 10, '#2a3a2a'); g(96, FH, '#2a5a8a', '#0e2a4a'); ctx.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 30; i++) { const h = hash(i, 5); ctx.fillRect((h % SW + t * 0.3) % SW, 100 + (h >> 7) % 90, 10 + h % 12, 1); } return; }
  if (kind === 'civic') { g(0, FH, '#3a3a48', '#5a5a68'); for (let x = 20; x < SW; x += 56) { R(x, 20, 18, 110, '#8a8a96'); R(x - 4, 16, 26, 6, '#9a9aa6'); R(x - 4, 128, 26, 6, '#9a9aa6'); } g(134, FH, '#6a6a72', '#4a4a52'); return; }
  if (kind === 'garage') { g(0, FH, '#2a2a2a', '#4a4a44'); for (let x = 10; x < SW; x += 34) R(x, 30, 26, 60, '#3a3a36'); g(120, FH, '#5a5a56', '#3a3a38'); return; }
  if (kind === 'trail') { g(0, 110, '#2a4a3a', '#6a8a5a'); for (let i = 0; i < 14; i++) { const h = hash(i, 9), x = i * 30 - 8; R(x, 20 + h % 20, 6, 100, '#2a1a10'); ctx.fillStyle = '#1a3a1a'; ctx.beginPath(); ctx.arc(x + 3, 24 + h % 20, 18, 0, 7); ctx.fill(); } g(110, FH, '#5a4a2a', '#3a2a1a'); return; }
  if (kind === 'gym') { R(0, 0, SW, 104, '#3a3a40'); R(0, 96, SW, 3, '#a02828'); g(104, FH, '#a83030', '#7a2020'); for (let x = 0; x < SW; x += 64) R(x, 104, 1, FH, 'rgba(0,0,0,.25)'); ctx.strokeStyle = 'rgba(235,235,230,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(SW / 2, 150, 120, 30, 0, 0, 7); ctx.stroke(); return; }
  // page (the default inward place): a book's page, ruled, with letters drifting off it
  g(0, FH, '#e8dcc0', '#c8b48c'); for (let y = 14; y < FH; y += 12) R(0, y, SW, 1, 'rgba(90,70,40,.18)'); R(30, 0, 1, FH, 'rgba(160,60,60,.3)'); letters(36, 'rgba(60,40,20,.25)');
}
// ---------- sprites ----------
function drawFoe(u) {
  const [x, y] = foePos(u), A = foeArt(u); let dx = u.shake ? (u.shake % 2 ? 3 : -3) : 0;
  if (u.freed && u.fade >= 40) return;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, (A ? A.w : 40) * 0.38, 5, 0, 0, 7); ctx.fill();
  if (u.freed) { ctx.globalAlpha = Math.max(0, 1 - u.fade / 40); ctx.filter = 'brightness(' + (1 + u.fade / 12) + ')'; }
  else if (u.flash && (u.flash >> 1) % 2) ctx.filter = 'brightness(2.6)';
  else if (u.status.open) ctx.filter = 'saturate(0.4) brightness(1.15)';
  const lift = u.freed ? u.fade * 0.8 : 0;
  if (u.id === 'heavybag') drawHeavyBag(x + dx, y - lift);
  else if (A) { ctx.imageSmoothingEnabled = !!A.smooth; ctx.drawImage(A.im, A.sx, A.sy, A.sw, A.sh, x - A.w / 2 + dx, y - A.h - lift, A.w, A.h); ctx.imageSmoothingEnabled = false; }
  else R(x - 20, y - 40, 40, 40, '#6a4a8a');
  ctx.restore();
  if (u.freed) { for (let i = 0; i < 6; i++) { const h = hash(i, u.slot * 7 + 1); R(x - 20 + h % 40, y - 20 - ((u.fade * (1 + h % 3)) % 70), 2, 2, 'rgba(255,250,210,' + (1 - u.fade / 40) + ')'); } return; }
  // its guard pips, its weakness slots (? until found) and, for the countdown, its hands
  const h = A ? A.h : 40; let px = x - u.guardMax * 4;
  for (let i = 0; i < u.guardMax; i++) { R(px + i * 8, y + 3, 6, 6, '#101018'); R(px + i * 8 + 1, y + 4, 4, 4, i < u.guard ? '#d8d8f0' : '#3a3a4a'); }
  if (u.status.open) txt('OPEN', x, y + 11, '#ffffff', 'center', SMALL);
  else { const ws = u.f.weak.map(a => u.seen[a] ? ASPECT_ABBR[a] : '?'); if (ws.length) { const s = ws.join(' '); ctx.font = SMALL; const w = ctx.measureText(s).width + 6; R(x - w / 2, y + 11, w, 9, 'rgba(10,10,30,.75)'); txt(s, x, y + 12, '#ffe080', 'center', SMALL); } }
  if (u.f.rule && u.f.rule.countdown) { R(x - 9, y - h - 16, 18, 13, 'rgba(10,10,30,.8)'); txt(String(u.counter), x, y - h - 13, u.counter <= 1 ? '#ff6060' : '#fff', 'center'); }
}
const ASPECT_ABBR = { force: 'FRC', question: 'QST', listen: 'LSN', name: 'NAM', reflect: 'RFL', step: 'STP', cite: 'CIT', aloud: 'ALD', hold: 'HLD', book: 'BK' };
function drawHeavyBag(x, y) {
  const sw = Math.sin(BT.t / 14) * 3; R(x - 1 + sw / 2, y - 120, 2, 20, '#8a8a8a');
  ctx.fillStyle = '#7a1e1e'; ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - 16 + sw, y - 102, 32, 96, 10) : ctx.rect(x - 16 + sw, y - 102, 32, 96); ctx.fill();
  R(x - 16 + sw, y - 90, 32, 3, '#5a1414'); R(x - 16 + sw, y - 22, 32, 3, '#5a1414'); R(x - 8 + sw, y - 96, 3, 80, 'rgba(255,255,255,.12)');
}
function partyFrame(u) {
  const C = u.C, custom = PARTY_ART[u.id], img = custom ? BIMG.party2[u.id] : BIMG.party;
  const A = BT.act && BT.act.u === u ? BT.act : null, far = A && A.sk.kind === 'phys' && A.sk.tgt === 'foe';
  let poseKey = u.status.dazed ? 'ko' : (BT.phase === 'win' ? 'victory' : u.pose) || 'idle';
  // Nov 16: a member running to a foe and back shows the run row (FF6 steps out), then the whole attack plays where it lands
  const running = far && (A.stage === 'move' || A.stage === 'back') && poseKey !== 'ko';
  if (running) poseKey = 'run';
  let rects, k, ks = null, flip = 0, key;
  if (custom && img.complete && img.naturalWidth) { rects = custom.poses[poseKey] || custom.poses.idle; k = custom.k || 1; }
  else { key = POSES[C.art][poseKey] || POSES[C.art].idle; const d = ART_PARTY_RECTS[key]; rects = d.r; k = d.k; ks = d.ks || null; flip = POSE_FLIP[key] || 0; }
  let f;
  if (poseKey === 'ko') f = rects.length - 1;
  else if (running) { f = (BT.t >> 2) % rects.length; if (A.stage === 'back') flip = flip ? 0 : 1; }   // running back faces home
  else if (poseKey === 'idle' || poseKey === 'victory' || poseKey === 'guard') f = (BT.t >> 3) % rects.length;
  else if (A) { const p = far ? (A.stage === 'impact' ? Math.min(1, A.t / Math.max(1, A.impactAt + 8)) : 1)
      : A.stage === 'move' ? A.t / 10 * 0.5 : A.stage === 'impact' ? 0.5 + Math.min(1, A.t / Math.max(1, A.impactAt + 8)) * 0.5 : A.stage === 'input' ? 0.1 : 1;
    f = Math.min(rects.length - 1, Math.floor(p * rects.length)); }
  else f = Math.min(rects.length - 1, (BT.t >> 2) % rects.length);
  return { img, r: rects[f], k: ks ? ks[f] : k, flip };
}
function drawStandin(u, x, y) {   // Cecil, Daniel and Vox until their sheets come: the town's folk sprite, scaled up; the hero: the kid's poses
  const art = u.C.art, pose = u.status.dazed ? 'ko' : BT.phase === 'win' ? 'victory' : u.pose || 'idle';
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, 13, 4, 0, 0, 7); ctx.fill();
  ctx.save(); if (u.pose === 'hurt' && u.poseT % 4 < 2) ctx.globalAlpha = 0.6;
  if (art === 'kid') {
    const g = G.kid && G.kid.g === 'girl' ? 'girl' : 'boy', K = KID_BPOSE[g], im = BIMG.kid[g], i = K[pose] != null ? K[pose] : 0;
    if (im.complete && im.naturalWidth) { const w = K.w / K.k, h = K.h / K.k; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(im, i * K.w, 0, K.w, K.h, Math.round(x - w / 2), Math.round(y - h + 2), w, h); }
  } else {
    const who = art.slice(5); ctx.translate(Math.round(x), Math.round(y));
    if (pose === 'ko') { ctx.rotate(-Math.PI / 2); ctx.translate(6, 14); }
    else if (pose === 'attack' || pose === 'cast' || pose === 'power' || pose === 'kick') ctx.translate(0, -Math.abs(Math.sin(BT.t / 4)) * 3);
    ctx.scale(1.45, 1.45); if (typeof drawFolk === 'function' && FOLKS[who]) drawFolk(who, 0, 0, BT.t);
  }
  ctx.restore(); ctx.imageSmoothingEnabled = false;
}
function drawMember(u) {
  const [x, y] = partyPos(u);
  if (u.C.art === 'kid' || String(u.C.art).startsWith('folk:')) { drawStandin(u, x, y); const st = Object.keys(u.status).filter(id => id !== 'dazed' && STATUSES[id]); if (st.length) { const s = STATUSES[st[(BT.t >> 5) % st.length]]; txt(s.name, x, y - 70, s.col, 'center', SMALL); } return; }
  const F = partyFrame(u); if (!F.img.complete) return;
  const [sx, sy, sw, sh] = F.r, w = sw / F.k, h = sh / F.k;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, y, 13, 4, 0, 0, 7); ctx.fill();
  ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  if (u.pose === 'hurt' && u.poseT % 4 < 2) ctx.globalAlpha = 0.6;
  if (F.flip) { ctx.translate(Math.round(x), 0); ctx.scale(-1, 1); ctx.drawImage(F.img, sx, sy, sw, sh, Math.round(-w / 2), Math.round(y - h), w, h); }
  else ctx.drawImage(F.img, sx, sy, sw, sh, Math.round(x - w / 2), Math.round(y - h), w, h);
  ctx.restore(); ctx.imageSmoothingEnabled = false;
  const st = Object.keys(u.status).filter(id => id !== 'dazed' && STATUSES[id]); if (st.length) { const s = STATUSES[st[(BT.t >> 5) % st.length]]; txt(s.name, x, y - h - 8, s.col, 'center', SMALL); }
}
function unitTop(u) { if (u.side === 'f') { const [x, y] = foePos(u), A = foeArt(u); return [x, y - (A ? A.h : (u.id === 'heavybag' ? 104 : 40)) * 0.6]; } const [x, y] = partyPos(u); return [x, y - 52]; }
// ---------- the whole screen ----------
function btDraw() {
  const B = BT; ctx.save();
  if (B.shake) ctx.translate(B.shake % 2 ? 2 : -2, 0);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, SW, FH); ctx.clip(); bgDraw(B.bg);
  const order = B.units.slice().sort((a, b) => (a.side === 'p' ? partyPos(a)[1] : foePos(a)[1]) - (b.side === 'p' ? partyPos(b)[1] : foePos(b)[1]));
  for (const u of order) u.side === 'f' ? drawFoe(u) : drawMember(u);
  drawPrompts(); drawPops(); drawCursor(); if (pcfg().order) drawTurnOrder();
  if (B.flash) R(0, 0, SW, FH, 'rgba(255,255,255,' + B.flash / 10 + ')');
  ctx.restore(); ctx.restore();
  drawWindows();
  if (B.label && !B.msg) { ctx.font = FONT; const w = ctx.measureText(B.label.text).width + 20; win((SW - w) / 2, 4, w, 18); txt(B.label.text, SW / 2, 9, '#fff', 'center'); }
  const m = B.msg || (B.phase === 'intro' ? null : null);
  if (m) { const L = wrap(m.text, SW - 28); const f = L.length > 3 ? SMALL : FONT, LL = L.length > 3 ? wrap(m.text, SW - 28, SMALL).slice(0, 5) : L; win(4, 4, SW - 8, 10 + LL.length * (f === SMALL ? 8 : 11)); LL.forEach((l, i) => txt(l, 14, 9 + i * (f === SMALL ? 8 : 11), '#fff', 'left', f)); }
  if (B.menu && (B.menu.lvl === 'sub' || B.menu.lvl === 'cmd') && !m) { const e = B.menu.lvl === 'sub' ? B.menu.slist[B.menu.si] : null; const d = e ? e.desc : null; if (d) { const L = wrap(d, SW - 28, SMALL).slice(0, 3); win(4, 4, SW - 8, 8 + L.length * 8); L.forEach((l, i) => txt(l, 14, 8 + i * 8, '#e8e8ff', 'left', SMALL)); } }
  if (B.phase === 'win') drawResults();
  if (B.phase === 'lose') { win(40, 90, SW - 80, 70); txt('The story closes over you', SW / 2, 104, '#fff', 'center'); txt('like warm water...', SW / 2, 118, '#fff', 'center'); if (B.endT > 40) txt('A: CONTINUE', SW / 2, 140, '#ffd860', 'center', SMALL); }
  if (B.phase === 'fled' && B.endT > 20) { win(80, 110, SW - 160, 36); txt('A: CONTINUE', SW / 2, 124, '#ffd860', 'center', SMALL); }
}
// who acts next: each living unit's time to a full gauge at its current rate, then every full gauge after that
function drawTurnOrder() {
  const ev = [];
  for (const u of BT.units) { if (!alive(u)) continue; let rate = RULES.atbFill(bS(u, 'spd'), pcfg().speed); for (const id in u.status) { const d = STATUSES[id]; if (d && d.atb) rate *= d.atb; }
    const first = u.ready || u.queued ? 0 : (RULES.atbFull - u.atb) / rate; for (let k = 0; k < 3; k++) ev.push({ u, t: first + k * RULES.atbFull / rate }); }
  ev.sort((a, b) => a.t - b.t); const L = ev.slice(0, 7); let x = 6; const y = FH - 13;
  ctx.font = SMALL; R(2, y - 2, SW - 4, 12, 'rgba(8,10,30,.55)'); txt('NEXT', x, y + 1, '#8a8ab8', 'left', SMALL); x += 30;
  for (const e of L) { const n = (e.u.side === 'p' ? e.u.name : e.u.name.replace(/^THE /, '')).slice(0, 7); const w = ctx.measureText(n).width + 6;
    R(x, y - 1, w, 10, e.u.side === 'p' ? 'rgba(60,90,180,.85)' : 'rgba(150,50,60,.85)'); txt(n, x + 3, y + 1, '#fff', 'left', SMALL); x += w + 3; if (x > SW - 40) break; }
}
function drawPops() {
  for (const p of BT.pops) {
    if (!p.u) continue; const [x, y] = unitTop(p.u), up = Math.min(p.t, 24) * 0.7 + (p.t < 12 ? Math.sin(p.t / 12 * Math.PI) * 6 : 0);
    const a = p.t > 50 ? (70 - p.t) / 20 : 1; ctx.globalAlpha = Math.max(0, a);
    txt(p.text, x, y - up - p.dy, p.col, 'center', p.big ? FONT : SMALL); ctx.globalAlpha = 1;
  }
}
function drawCursor() {
  const m = BT.menu; if (!m || m.lvl !== 'tgt') return;
  const blink = (BT.t >> 3) % 2, L = m.all ? m.tl : [m.tl[m.ti]];
  for (const u of L) { if (m.all && !blink) continue; const [x, y] = u.side === 'f' ? foePos(u) : partyPos(u), A = u.side === 'f' ? foeArt(u) : null;
    const cx = u.side === 'f' ? x - (A ? A.w / 2 : 20) - 12 : x + 18, cy = u.side === 'f' ? y - (A ? A.h / 2 : 20) : y - 30;
    txt(u.side === 'f' ? '▶' : '◀', cx, cy, '#fff', 'center'); }
}
function drawPrompts() {
  const a = BT.act; if (!a) return;
  if (a.stage === 'impact' && a.window && !a.tres) {
    const t = a.window === 'block' ? a.tgts[0] : a.tgts[0]; if (!t) return;
    const [x, y] = unitTop(t), r = 9 + Math.max(0, a.impactAt - a.t) * 2.6;
    ctx.strokeStyle = a.window === 'block' ? '#ff9060' : '#ffe080'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y + 10, r, 0, 7); ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.beginPath(); ctx.arc(x, y + 10, 9, 0, 7); ctx.stroke();
    if (a.hit === 0) txt(a.window === 'block' ? 'A: BLOCK' : 'A', x, y + 24 + (a.window === 'block' ? 0 : 0), '#fff', 'center', SMALL);
  }
  if (a.stage === 'input' && a.inputKind === 'seq') {
    const [x, y] = partyPos(a.u), seq = a.sk.seq, w = seq.length * 16 + 12; win(x - w / 2 + 30, y - 92, w, 28);
    seq.forEach((d, i) => txt(B_ARROW[d], x - w / 2 + 38 + i * 16, y - 86, i < a.seqI ? '#7ae87a' : '#fff', 'left'));
    R(x - w / 2 + 34, y - 72, (w - 8) * Math.max(0, 1 - a.seqT / RULES.timed.seqFrames), 2, '#ffd860');
  }
  if (a.stage === 'input' && a.inputKind === 'mash') {
    const [x, y] = partyPos(a.u); win(x - 6, y - 96, 92, 32); txt('MASH A!', x + 40, y - 90, (BT.t >> 2) % 2 ? '#ffd860' : '#fff', 'center');
    R(x + 2, y - 76, 76, 4, '#101028'); R(x + 3, y - 75, Math.round(74 * Math.min(1, a.presses / (a.partners ? 27 : 24))), 2, '#7ae87a');
    R(x + 2, y - 70, Math.round(76 * Math.max(0, 1 - a.mashT / RULES.timed.mashFrames)), 2, '#ffd860');
  }
  if (a.stage === 'input' && a.inputKind === 'charge') {
    const [x, y] = partyPos(a.u); win(x - 6, y - 96, 92, 32); txt(a.held ? 'LET GO WHEN SHARP' : 'HOLD A', x + 40, y - 90, '#fff', 'center', SMALL);
    R(x + 2, y - 78, 76, 8, '#101028'); R(x + 3 + 74 * 0.86, y - 79, 74 * 0.14, 10, 'rgba(255,224,128,.35)'); R(x + 3, y - 77, Math.round(74 * a.focus), 6, a.focus > 0.86 ? '#ffd860' : '#7ab8e8');
  }
  if (a.stage === 'input' && a.inputKind === 'tune') {
    const [x, y] = partyPos(a.u); win(x - 6, y - 96, 92, 32); txt('TUNE IN: A', x + 40, y - 90, '#fff', 'center', SMALL);
    const nd = 1 - Math.abs(((a.tuneT % 90) / 45) - 1); R(x + 2, y - 78, 76, 8, '#101028'); for (let i = 0; i < 12; i++) R(x + 5 + i * 6, y - 76, 1, 4, '#4a4a6a');
    R(x + 2 + 76 * a.station - 4, y - 79, 8, 10, 'rgba(255,224,128,.45)'); R(x + 2 + Math.round(76 * nd), y - 80, 2, 12, '#ff6060');
  }
  if (a.stage === 'input' && a.inputKind === 'rhythm') {
    const [x, y] = partyPos(a.u), n = a.sk.rhythm, w = n * 18 + 16; win(x - w / 2 + 30, y - 92, w, 28);
    for (let i = 0; i < n; i++) { const h = a.beatHit[i], c = h === 'hit' ? '#ffd860' : h === 'off' ? '#8a5a5a' : i === a.beat ? '#fff' : '#6a6a8a'; R(x - w / 2 + 40 + i * 18, y - 82, 8, 8, c); }
    if (a.beat < n) { const p = Math.min(1, a.beatT / RULES.timed.beat); R(x - w / 2 + 40 + a.beat * 18 + 3, y - 74 + 0, 2, -Math.round(8 * p), '#ffffff'); }
  }
}
function drawWindows() {
  const B = BT, y0 = FH, m = B.menu;
  // the foes (left)
  win(0, y0, 140, SH - y0);
  const names = []; for (const u of livingFoes()) { const e = names.find(n => n.n === u.name); if (e) e.c++; else names.push({ n: u.name, c: 1 }); }
  names.slice(0, 6).forEach((e, i) => { const s = e.n.length > 15 ? e.n.slice(0, 14) + '.' : e.n; txt(s + (e.c > 1 ? ' x' + e.c : ''), 8, y0 + 8 + i * 13, '#fff', 'left', e.n.length > 13 ? SMALL : FONT); });
  // the party (right): name, HP (rolling), Clarity, the time gauge
  win(140, y0, SW - 140, SH - y0);
  partyUnits().forEach((u, i) => {
    const y = y0 + 7 + i * 28, ready = u.ready || (m && m.u === u), dz = u.status.dazed;
    txt(u.name, 150, y, dz ? '#8a8a9a' : ready ? '#ffd860' : '#fff');
    const hp = Math.max(0, Math.ceil(u.hpShown)), low = hp < u.st.hpMax / 4;
    txt(hp + '/' + u.st.hpMax, SW - 10, y, dz ? '#8a8a9a' : low ? '#ff9a6a' : '#fff', 'right');
    txt('CL ' + u.cl + '/' + u.st.clMax, 150, y + 12, '#a8c8ff', 'left', SMALL);
    const bw = 70, bx = SW - 10 - bw; R(bx, y + 13, bw, 5, '#101028'); R(bx + 1, y + 14, Math.round((bw - 2) * Math.min(1, u.atb / RULES.atbFull)), 3, u.atb >= RULES.atbFull ? '#ffd860' : '#7ab8e8');
    if (u.hp < u.hpShown && pcfg().roll && !dz) txt('▼', bx - 8, y + 12, '#ff9a6a', 'left', SMALL);
  });
  if (!m) return;
  // the command list over the foe window, then the lists that replace the bottom windows
  if (m.lvl === 'cmd' || m.lvl === 'tgt' && !m.fromSub) {
    win(0, y0, 140, SH - y0);
    const sp = m.list.length > 6 ? 12 : 13; m.list.forEach((c, i) => txt((i === m.i ? '▶ ' : '  ') + c.t, 8, y0 + 5 + i * sp, i === m.i ? '#ffd860' : '#fff', 'left'));
  }
  if (m.lvl === 'sub' || m.lvl === 'sec' || (m.lvl === 'tgt' && m.fromSub)) {
    const L = m.lvl === 'sec' || (m.lvl === 'tgt' && m.sk && m.sk.pickSection) ? m.secs.map((s, i) => ({ t: SECTIONS[s], right: '', ok: true })) : m.slist;
    const sel = m.lvl === 'sec' || (m.lvl === 'tgt' && m.sk && m.sk.pickSection) ? m.ci : m.si;
    win(0, y0, SW, SH - y0);
    const rows = 6, top = Math.max(0, Math.min(sel - rows + 1, L.length - rows * 2)), cols = 2, cw = (SW - 12) / cols;
    for (let k = 0; k < rows * cols; k++) { const i = top + k, e = L[i]; if (!e) break; const cx = 8 + Math.floor(k / rows) * cw, cy = y0 + 8 + (k % rows) * 13;
      txt((i === sel ? '▶' : ' ') + e.t, cx, cy, !e.ok ? '#6a6a8a' : i === sel ? '#ffd860' : '#fff', 'left', e.t.length > 14 ? SMALL : FONT);
      if (e.right) txt(e.right, cx + cw - 12, cy, !e.ok ? '#6a6a8a' : '#a8c8ff', 'right', SMALL); }
  }
}
function drawResults() {
  const B = BT; win(20, 24, SW - 40, FH + 40);
  txt(B.F.boss ? 'THE STORY LETS GO' : 'FREED', SW / 2, 32, '#ffd860', 'center');
  const lines = []; for (const s of B.res) wrap(s, SW - 64, SMALL).forEach(l => lines.push(l));
  const n = 24, scroll = Math.max(0, Math.min(lines.length - n, Math.floor(Math.max(0, B.endT - 90) / 40)));
  lines.slice(scroll, scroll + n).forEach((l, i) => txt(l, 32, 48 + i * 8, '#fff', 'left', SMALL));
  if (B.picks.length && B.endT > 30) {
    const id = B.picks[0], keys = Object.keys(LEVEL_PICKS); win(60, 120, SW - 120, 96);
    txt(CLASSES[id].name + ': WHAT GREW?', SW / 2, 128, '#ffd860', 'center', SMALL);
    keys.forEach((k, i) => { const d = LEVEL_PICKS[k], on = i === (B.pickI == null ? keys.indexOf(CLASSES[id].pick) : B.pickI); txt((on ? '▶ ' : '  ') + d.name, 72, 144 + i * 20, on ? '#ffd860' : '#fff'); txt(d.desc, 90, 154 + i * 20, '#a8c8ff', 'left', SMALL); });
  } else if (B.endT > 40) txt('A: CONTINUE', SW / 2, FH + 52, '#ffd860', 'center', SMALL);
}
