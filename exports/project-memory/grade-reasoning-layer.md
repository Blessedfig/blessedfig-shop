---
name: grade-reasoning-layer
description: How the live guide explains each grade (reasons.json, reasons.py) and what reasoning is and isn't stored per tier
metadata:
  type: project
---

Built 2026-11-23 after Christian asked for an in-depth explanation of how each grade was reached (PR Blessedfig/blessedfig-shop#25, merged and verified live).
- Each graded series page has "How we reached this grade": per tradition, the story facts (aligns/concerns), the teaching applied, why the letter, the depiction concern, then the content evidence, sources, confidence and open checks. "How we grade" lists each tradition's full standard; `#method-<Tradition>` opens one.
- Data: manga-guide/reasons.json, built by `python3 /mnt/project-files/manga-site/reasons.py manga-guide/reasons.json` (run from the repo root). It reads frame-guides/*.md and manga-entries/*.md. The catalog thread's deploy.sh runs it.
- Gap: quick reads (most grades) never recorded which teaching each grade rested on. The page shows guide positions matched by topic keywords and labels them that way. Deep entries carry the cited teaching ("Talking points"). To close the gap, future quick-read prompts should add a short "teaching" field per frame.
- All 31 frame guides are still "draft from general knowledge", and the site says so.

Related: [[family-frames-list]], [[manga-site-prototype]], [[frame-guides-system]]
