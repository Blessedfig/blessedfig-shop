---
name: philosophy-first-outlook
description: Guide leads each series with its philosophy line; 'where it finds hope' tag (hope field) and old outlook live in manga-guide/outlook.json; new entries need both
metadata:
  type: project
  modified: 2026-11-24T08:49:43.325Z
---

Since 2026-11-24 (PR #74), the live manga guide puts each series' life_message first, presented as "What this story argues". Below it are the ideas the series "Champions" and "Pushes back on", taken from its lenses and written in plain words. Maturity, age and publisher rating are now small badges. Christian asked for this because manga looked bleak when ratings and warnings led.

Outlook per graded series: h = Hopeful, m = Bittersweet, b = Bleak. It describes the story's view of life, not its quality. Stored in manga-guide/outlook.json, keyed by AniList id, or "e-<slug>" when a series has no id. A `msg` field fills in the line when the entry has no life_message. The file is kept separate from data.json so catalog rebuilds don't erase it. First pass: 1,890 h, 320 m, 102 b. Judged from title knowledge plus each series' life message and premise. Series below a heuristic darkness score (horror, tragedy, nihilism tags) defaulted to h, with known exceptions overridden by hand.

**How to apply:** when new graded entries are added, add an outlook for each to outlook.json. A missing outlook shows no tag, and the series is left out when the Hopeful filter is on. The filter and the "Most hopeful first" sort (the default on Find manga) depend on it. Related: [[grade-reasoning-layer]].

Deep entries (research thread, 2026-11-24): every rank 1-200 title already has an outlook from the first pass. Every rank 1-200 title also has a `hope` code except 104 (held). New deep entries end "## Life message" with "Outlook: ..." and "Hope source: <code> — reason" lines (AGENT-PROMPT-NEW.md); the research thread passes any difference from outlook.json (o and hope) to the site thread with the deploy note.

Main function layout (Christian approved 2026-11-24, PR #76): series pages and rows lead with mainFn(entry) = strongest lens (+0.5 tie bias toward Affirmed/Critiqued), direction for/against/explores, push = round(strength*0.6 + delivery style weight Subtle1/Woven2/Explicit3/Heavy4). Grade sits on the cover. Main idea filter + Strongest push sort. Computed in index.html, no data file.

Where it finds hope (Christian chose 2026-11-24, PR #78): it replaced the visible Hopeful/Bittersweet/Bleak tag. outlook.json entries now carry `hope`: one of G God/beyond, R forgiveness/redemption, F family/friends/community, L love between two people, E effort/growing stronger, S true to yourself, P protecting others, K knowledge/discovery, J small everyday joys, N little hope (tragedy). `hh: 1` means it was tagged by hand (the top 300). The rest are a keyword/genre/lens estimate, shown as "estimated" on the series page. `o` is kept but no longer shown. New entries need a hope code. Christian found the values-cluster table confusing and asked how accurate it is. Answer: the positions are our estimates from Fischer/Woodard/WVS descriptions and have not been verified. It is now shown as labeled bars.
