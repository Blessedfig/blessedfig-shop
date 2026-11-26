# Philosophy of Media project archive

This branch holds the working files of the "Philosophy of media" project (the manga worldview guide live at https://www.theblessedfigtree.com/manga-guide/). It was copied on 2026-11-26 from the project's shared folder when the project was closed. It is an archive only: do not merge it into `main`, because GitHub Pages would publish it. It shares no history with `main`.

Left out: `uploads/` (files people uploaded) and anything that is a scan, credential or secret. No scans of manga pages were ever stored here.

## What is where

| Folder | What it holds |
|---|---|
| `manga-entries/` | Deep entries (one markdown file per series), plus the writing rules: `TEMPLATE-INSTRUCTIONS.md`, `AGENT-PROMPT-V3.md` (current writer prompt), `NEW-FRAMES-LENSES.md` (the 4 newer traditions and new lenses), `CULTURE-CLUSTERS.md`, and the queue `TOP-100-QUEUE.md`. |
| `frame-guides/` | One guide per tradition (31 frames) with its teaching on art and media; `frames.json` sets their order. |
| `manga-quick/` | Quick entries (one JSON per AniList id) for about 2,500 titles, the helper spec (`QUICK-ENTRY-SPEC.md`, `validate.py`), batches, `explicit-later.md` (titles set aside as explicit). |
| `manga-site/` | Catalog database (`catalog.db`, `full/full.db`), build and fetch scripts, `adult-overrides.json`, `content-warnings.json`, and `publish_deep.py` (publishes a deep entry into the store repo's `manga-guide/realign.json`). |
| `manga-sources/` | Cached Wikipedia text used as sources. |
| `held-ratings/` | Publisher age ratings checked for formerly held titles. |
| `guide-redesign/` | Screenshots and mockups from the site redesign. |
| `social/` | A social media image. |
| `exports/` | Project memory export, and `project-memory/` (the team memory notes as of closing). |

The live site's own files (data.json, realign.json, outlook.json, entries/) are on `main` under `manga-guide/`. About 590 deep entries written by another session exist only there, not in `manga-entries/`.

## Where the work stopped

- Deep entries: queue rows 1-213 are handled (done, or skipped with a warning only). Row 214 (My New Devil Wife) is next; rows 214-300 in `TOP-100-QUEUE.md` are still "todo".
- Popularity ranks down to about 820 already have deep entries on `main` (other session). Queue rows 201-300 are the next non-adult titles by popularity with no deep entry (ranks about 488-906).
- The 5 titles whose records pointed at the wrong series were fixed and graded on 2026-11-26.
- Rules that still apply: sources are metadata and summaries only (no scanlation or aggregator pages); score-driving facts need two sources; titles with sexual content involving minors get a content warning, not a hold; explicit-at-core titles with minors are skipped (warning + 18+ only).
