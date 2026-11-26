# Quick-entry batch task (for helper agents)

Write quick worldview entries for the series in the batch file you were given (/mnt/project-files/manga-quick/batches/batch-NN.json).

Read these in full first and follow them exactly:
- /mnt/project-files/manga-quick/HELPER-BRIEF.md: rules, sourcing, neutrality and the fetch budget.
- /mnt/project-files/manga-quick/QUICK-ENTRY-SPEC.md: the JSON format, including the "folkways" block and the "delivery" block (how heavy-handed or subtle the message is, and whether opposing views are personified fairly or as strawmen), both required.
- /mnt/project-files/frame-guides/FRAMES.md and every guide it lists (31 traditions).
- /mnt/project-files/manga-entries/CULTURE-CLUSTERS.md: the six value dimensions and the "Cluster positions" table.

## Grading
- **grade:** how well the series' MESSAGE fits each tradition, judged from that tradition's guide, including its "Teaching on art, media and depiction". Never lower a grade for intensity alone.
- **weight:** the depiction concern (Minor / Discuss / Significant), judged separately from the grade.
- **frame rows:** write all 31 by hand, each specific to the series.

## Folkways
- Give six dimensions from 0 to 10, each with evidence.
- "closest" is the 2 or 3 nearest clusters by distance from the table, using exact names.
- Add one neutral sentence on Japanese source-culture context.

## Sources
- Use metadata and summaries only: AniList, MangaUpdates, MangaDex metadata, Wikipedia, publisher pages, parent guides and reviews.
- Never open scanlation, aggregator or fan-translation sites.
- Use fan wikis for plot facts only, and never quote them.
- Wikipedia: first read the cached copy at /mnt/project-files/manga-sources/wikipedia/<anilist_id>.txt (first line is the article URL or 'not found'). Do not call the Wikipedia or Wikimedia APIs yourself (they rate-limit this machine); if there is no cached file, use the other approved sources: AniList, MangaUpdates, MangaDex metadata, publisher pages, parent guides and reviews (Common Sense Media, Anime News Network reviews), and fan wikis for plot facts only. Never fill plot details from memory: if no summary source is available, leave the detail out, lower confidence, and say so in to_verify.

- Any fact that drives a score needs two independent sources of different kinds. If you can't verify it, keep the score conservative, set confidence to low and add a to_verify item.
- A real person's legal or private matters only with a cited reputable source.
- List only pages you actually opened.
- Keep series whose license_note says the English license is partial or lapsed, and note this in to_verify.
- The web budget is shared: about 100 fetches per hour across all agents. Aim for 2 or fewer fetches per series.

## Files
- Skip any series that already has /mnt/project-files/manga-quick/<anilist_id>.json. Write each entry to that path.
- Run `python3 /mnt/project-files/manga-quick/validate.py <file>` until it prints OK.
- /mnt/project-files is a network mount: use full paths, and re-read each file about 10 seconds after writing it.
- If a write fails, stop and report. Never save entries anywhere else.
- Keep scratch tools in a folder named after your batch number, so you don't collide with other helpers.

## Report
List:
- the entries you wrote;
- entries with low confidence or possibly understated intensity;
- any source problems.

- Skip rule addition (2026-11-23): a title on Seven Seas' Ghost Ship imprint that MangaUpdates lists under the Adult genre counts as sexual content at its core; skip it.
