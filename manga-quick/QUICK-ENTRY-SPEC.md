# Quick entry (summary tier) spec

One JSON file per series: /mnt/project-files/manga-quick/<anilist_id>.json. A deep entry in ../manga-entries/ always overrides it.
Inputs, per series: the catalog row (catalog.db or ../manga-sources/series-list.csv), AniList tags and MangaUpdates categories, and the Wikipedia text in ../manga-sources/wikipedia/<anilist_id>.txt. General knowledge may fill gaps but must be marked "(to verify)".
Sources: use as many as possible (Christian, 2026-11-22). Reachable directly: AniList, MangaUpdates, MangaDex (metadata only), English Wikipedia. Also use web search for MyAnimeList, Anime News Network, publisher pages (age rating), Common Sense Media, Plugged In, reviews and fan wikis (plot facts only). List every source actually used in "sources"; confidence rises only when independent sources agree.
Rules: neutral voice (never good/bad/wholesome/dangerous in our voice); each tradition in its own vocabulary; equal care for every frame; facts only from wikis, never quotes; a content score of 4+ needs two independent sources of different kinds (e.g. Wikipedia plus database tags), else cap it at 3 and add "(to verify)" to the note; confidence is "low" unless two sources agree on every score of 4+, then "low to medium". Never invent chapter numbers.

{
  "anilist_id": 0,
  "title": "",
  "label": "Quick read (from summaries)",
  "confidence": "low",
  "sources": ["https://en.wikipedia.org/wiki/...", "https://anilist.co/manga/..."],
  "premise": "2-3 neutral sentences in our own words",
  "life_message": "One sentence: what it holds up as a good life.",
  "overall": 0,                       // = highest content score
  "content": [ {"category": "Violence", "score": 0, "framing": "Endorsed|Neutral|Shown with consequences|Condemned", "note": "short evidence"} ],
     // all 8: Violence; Fear and intensity; Sexuality and romance; Language; Substances; Mental health and self-harm; Imitable behavior; Commercial
  "lenses": [ {"lens": "<one of the lens names below>", "strength": 0, "stance": "Affirmed|Explored|Critiqued"} ],   // only those 1+, max 10
  "dominant": "short list of the 2-4 strongest lenses",
  "axes": {"economic": 5, "social": 5, "cultural": 5, "community": 5},  // 5 = takes no side; community: 0 individual first, 10 community first
  "foundations": {"care": 0, "loyalty": 0, "fairness": 0, "sanctity": 0, "authority": 0, "liberty": 0},
  "frames": [ {"frame": "<exact name from /mnt/project-files/frame-guides/FRAMES.md>", "grade": "S|A|B|C|D|F", "weight": "Minor|Discuss|Significant", "aligns": "max 20 words", "concerns": "max 20 words"} ],
     // ALL 31 frames, in FRAMES.md order. Grade = how well the series' MESSAGE fits that tradition, using its guide file (incl. its "Teaching on art, media and depiction"):
     // S affirms its core values, little to raise; A strong fit, minor concerns; B good, some talking points;
     // C mixed, real concerns; D significant concerns, many would wait or read together; F conflicts with core teaching throughout.
     // Do not lower the grade for intensity alone. "weight" = Depiction concern, judged separately: how much this tradition would raise about what is SHOWN (Minor / Discuss / Significant). A series can be B with Significant concern. Equal care and length for every frame.
  "folkways": {  // required for new entries (2026-11-22); see /mnt/project-files/manga-entries/CULTURE-CLUSTERS.md
    "dims": {"Dignity vs honor": {"pos": 5, "evidence": "max 25 words"}, "Order vs freedom": {...}, "Civic vs kin": {...},
             "Equality vs hierarchy": {...}, "Tradition vs secular-rational": {...}, "Survival vs self-expression": {...}},
    "closest": ["2-3 exact cluster names from the Cluster positions table, nearest by distance"],
    "japan": "one sentence on Japanese source-culture norms in the series (senpai-kohai, group harmony), described not judged"
  },
  "delivery": {  // required for new entries (2026-11-23, Christian): HOW the message is delivered, not what it is
    "style": "Subtle|Woven in|Explicit|Heavy-handed",   // Subtle = readers must infer it; Woven in = carried by plot and character choices; Explicit = characters state it outright at key moments; Heavy-handed = repeated speeches or narration tell the reader what to think
    "preachiness": 0,                 // 0 none to 10 sermon-like; 1-3 subtle, 4-6 woven/explicit, 7-10 heavy-handed
    "evidence": "max 25 words: what in the sources shows the style (e.g. reviewers call it preachy)",
    "personified": [ {"character": "name or role", "ideology": "the view they embody, short", "role": "Hero|Villain|Mentor|Foil|Other", "treatment": "Sympathetic|Fair|Mixed|Strawman"} ],   // 0-4 rows; only where a character clearly embodies a worldview
    "opposing_views": "Fair|Mixed|Strawman|None shown",   // how the story treats the views it disagrees with; Strawman = the opposing view is given only through hateful or foolish characters and never its best case
    "note": "one sentence, neutral voice"
  },   // If the sources say nothing about delivery, use style "Woven in", preachiness 3, and add "(to verify)" to evidence. Use the same two-source caution: say "Heavy-handed" or "Strawman" only when a review or summary supports it.
  "winners_losers": "1-2 sentences: who wins, who loses, which worldview gets sympathy",
  "to_verify": ["claims a full read should check"]
}
Lens names: Christian, Jewish, Islamic, Dharmic (Hindu/Buddhist), Pantheist/New Age, Pagan/occult, Moralistic therapeutic deism, Secular humanism, Naturalism, Classical virtue ethics, Stoicism, Utilitarianism, Critical theory, Marxism, Feminism, Postmodernism, Environmentalism, Existentialism, Absurdism, Nihilism, Anti-natalism, Expressive individualism, Hedonism, Consumerism, Might makes right, Traditionalism, Progressivism, Libertarianism, Collectivism/authoritarianism, Transhumanism, Pragmatism, Communitarianism, Confucian ethics.
Content anchors: 0 none; 1-3 mild; 4-6 moderate; 7-8 strong/explicit; 9-10 extreme.
