# Back-fill the "delivery" block on existing quick entries

Input: a list of AniList ids in /mnt/project-files/manga-quick/batches/delivery/dl-NN.json.
For each id, open /mnt/project-files/manga-quick/<id>.json and add the "delivery" block exactly as specified in QUICK-ENTRY-SPEC.md. Change nothing else in the file except appending a to_verify line if needed.

Sources, in order: the entry's own premise, life_message, winners_losers and frame notes; the cached Wikipedia text at /mnt/project-files/manga-sources/wikipedia/<id>.txt (look for Reception or Themes sections); the AniList description and tags (one batched GraphQL call via curl for the whole list); and, for at most 10 series per list where reception is the deciding fact, one review search (Anime News Network, publisher page, or a parent guide). Do NOT call the Wikipedia or Wikimedia APIs. Never open scanlation, aggregator or fan-translation sites. Never fill in facts from memory.

Rules: neutral voice. Say "Heavy-handed" or "Strawman" only when a review or summary supports it; otherwise use style "Woven in", preachiness 3, opposing_views as the sources allow, and mark evidence "(to verify)". Personified rows only where the sources show a character embodying a worldview. Add any new source you actually opened to "sources".
After writing each file, run python3 /mnt/project-files/manga-quick/validate.py <file> and fix any problems. /mnt/project-files is a network mount: re-read each file ~10 seconds after writing; never search the whole folder.
Final report: ids done, any marked Heavy-handed or Strawman with the evidence, and problems.
