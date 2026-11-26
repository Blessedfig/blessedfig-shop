---
name: deep-entries-pipeline
description: How deep manga entries are written and published since 2026-11-26 (35 frames, realign.json, publish_deep.py), and who covered which ranks
metadata:
  type: project
---

State 2026-11-26: a separate session of Christian's (outside this project, "Antigo town JRPG prologue") wrote ~590 deep entries straight to blessedfig-shop main (manga-guide/entries/*.md + realign.json), covering nearly every non-adult title down to popularity rank ~820. Those entries are NOT in /mnt/project-files/manga-entries/. So queue rows 201-300 (TOP-100-QUEUE.md) are the next 100 non-adult titles by popularity with no deep entry anywhere (ranks ~488-906). Check manga-guide/entries/ before choosing any new rows.

Current entry standard: 35 frame rows (31 + Historically Black Protestant, Atheist, Agnostic, Nothing in particular), 'Dharmic' lens retired for 'Hindu ideas'/'Buddhist ideas', new lenses (Taoist ideas, Bushido, Patriotism, Pacifism, Duty ethics, Liberalism, Anarchism). Writer prompt: manga-entries/AGENT-PROMPT-V3.md + NEW-FRAMES-LENSES.md.

Publishing (old catalog container is gone): /mnt/project-files/manga-site/publish_deep.py SLUG:ID ... copies the md into the repo, parses it into realign.json entries/reasons/outlook, and sets data.json warning from a "**Content warning.**" paragraph. 18+ goes in realign.json "adult" (id -> reason). Then PR + merge + verify live (standing permission, [[site-update-permission]]).

5 wrong-record ids fixed 2026-11-26: 35377 -> 34334 (Shiina's Crazy For You), 93916 -> 85503, 170653 -> 152867, 111564 relabeled as The Push Man and Other Stories, 116723 was correct (Takatsu = Misaki Takamatsu).
