# Series entry template (neutral parents' guide)

Write a markdown entry with EXACTLY these sections, in this order. Model: https://claude.ai/artifact/Ceu3wrEsEdV9eWBGhCqUeX (Frieren).

Opening line: "Built from summaries, databases and reviews (From summaries); no pages were read." plus confidence (low/medium/high).

## Series facts
Table: Title (English and Japanese), Creators, Origin (magazine, publisher, demographic, years, status), English edition (publisher, publisher age rating, volume count JP and EN), Anime (studio, years, TV rating), Recognition, Other guides (Common Sense Media age etc.), Entry tier. Then a short **Premise** paragraph.

## Life message
One bold line: what it promotes as a good life. Then a table with four meta lenses: Evolutionary biology, Pragmatic, Religious, Socio-cultural (how each reads the series' romance, fighting, family, power, death).

## Content scores
"Overall content level: N out of 10", set by the highest category. Content scores measure intensity only: higher = more of it, not better or worse.
Table: Category | Intensity (0 to 10) | Frequency | Framing (Endorsed / Neutral / Shown with consequences / Condemned) | Evidence (with chapter numbers where known).
Categories: Violence; Fear and intensity; Sexuality and romance (incl. fan service, manga art vs anime); Language; Substances; Mental health and self-harm; Imitable behavior; Commercial.
Anchors: 0 none; 1-3 mild; 4-6 moderate; 7-8 strong/explicit; 9-10 extreme.
Second table: Values theme | Presence (Not present/Incidental/Recurring/Central) | Portrayal — for Family and authority; Religion and spirituality; Gender and identity (incl. LGBTQ); Politics and social issues.
**Virtues shown:** list.

## Family frames
Table with one row per frame, in this order and with these exact names (the website picker matches them; guide files in /mnt/project-files/frame-guides/ are the source of truth; the file's first heading is the exact frame name):
Order = /mnt/project-files/frame-guides/frames.json (source of truth):
Christian: Catholic; Eastern Orthodox; Baptist; Non-denominational Evangelical; Pentecostal / Charismatic; Reformed / Presbyterian; Lutheran; Methodist / Wesleyan; Anglican / Episcopal; Anabaptist (Mennonite, Amish, Brethren); Latter-day Saint; Mainline progressive Protestant; Seventh-day Adventist; Jehovah's Witness; Christian Science.
Other faiths: Orthodox Jewish; Conservative Jewish; Reform Jewish; Muslim; Hindu; Buddhist; Sikh; Bahá'í; Shinto; Wiccan / Pagan; Scientologist.
Non-theistic and philosophical: Secular progressive; Secular humanist; Conservative / traditional; Unitarian Universalist; Satanist.
(31 frames. Satanist = the non-theistic Church of Satan / The Satanic Temple, from their published texts. Each guide has a "Teaching on art, media and depiction" section: base Grade and Depiction concern on it.)
Write ONE single table with all frames in the order above (no group sub-tables or group headings). Before writing the rows, read the per-frame guide for each (files listed in FRAMES.md) so grades and weights stay consistent across entries.
Columns: Frame | Grade (S to F) | Depiction concern (Minor / Discuss / Significant) | What aligns | What may concern | Talking points (from the tradition's own sources).
Grade = message fit only, judged by that tradition's own documented teaching on art and media (see each frame guide): does the work endorse or merely depict; is evil framed as evil; are there consequences; is repentance, redemption or justice possible; how is the sacred treated. Intensity alone never lowers a grade: a dark story that condemns what it shows (as many scripture narratives do) can grade well. S = affirms the tradition's core values with little to raise; A = good fit with minor concerns; B = good fit worth discussing; C = mixed message, with real concerns; D = significant conflict with the tradition's values; F = endorses what core teaching rejects throughout.
Depiction concern = how that tradition views the explicitness itself, separate from the message (e.g. Phil 4:8 / Eph 5:12 readings, modesty rules, rules on images). Intensity 0-10 stays in Content scores for age.

## Winners, losers and sympathy
One-sentence summary, then table: Side | Worldview it carries | Outcome | How the story treats it. Then **Fan favorites versus the official moral** paragraph: popularity polls (cite), beloved villains, memes, with sources.

## Message delivery
How the series delivers its message, and whether it turns ideologies into characters fairly or as strawmen. Exact format (build.py parses it):
- Style: Subtle | Woven in | Explicit | Heavy-handed
- Preachiness: 0-10 (1-3 subtle, 4-6 woven or explicit, 7-10 heavy-handed)
- Opposing views: Fair | Mixed | Strawman | None shown
- Evidence: max 25 words (e.g. reviewers call it preachy)
- Note: one neutral sentence

| Character | Ideology | Role | Treatment |
|---|---|---|---|
| name or role | view they embody | Hero/Villain/Mentor/Foil/Other | Sympathetic/Fair/Mixed/Strawman |

0 to 4 character rows, only where a character clearly embodies a worldview. Use "Heavy-handed" or "Strawman" only where a review or summary supports it.

## Creator and publisher context
Only documented, on-record facts (interviews, afterwords, official posts), cited. Creator statements about intent/themes/politics/religion if any; "none found" if none. Publisher ownership and relevant business facts. Never speculate about private life, family, religion or identity of creators who haven't spoken publicly; if creators are private, say so and add "**Status: Needs more info on the creators.**" Note any controversies involving creators ONLY if widely reported by reputable outlets, stated neutrally with sources.

## Worldview lenses
"Dominant lenses: ..." Then table Lens | Strength (0 to 10) | Stance (Affirmed/Explored/Critiqued) | Closeness (S to F) | Evidence. Closeness = how close the series' overall message is to that ideology: dominant and affirmed = S or A; notable and affirmed = B; explored without a verdict = C; present but critiqued = D or F; give no grade for lenses at 0. Consider: Christian, Jewish, Islamic, Dharmic (Hindu/Buddhist), Pantheist/New Age, Pagan/occult, Moralistic therapeutic deism, Secular humanism, Naturalism, Classical virtue ethics, Stoicism, Utilitarianism, Critical theory, Marxism, Feminism, Postmodernism, Environmentalism, Existentialism, Absurdism, Nihilism, Anti-natalism, Expressive individualism, Hedonism, Consumerism, Might makes right, Traditionalism, Progressivism, Libertarianism, Collectivism/authoritarianism, Transhumanism, Pragmatism, Communitarianism (community-first without authoritarianism), Confucian ethics. List the ones scoring 1+, then one row grouping those at 0. Strength 4+ needs evidence. If a label is your own framing rather than any source's, say so.
Political axes table (0 to 10, 5 = takes no side): Economic (0 collective, 10 free market); Social (0 authority, 10 liberty); Cultural (0 traditional, 10 progressive); Community (0 individual first, 10 community first), with Why.
**Moral foundations profile (0 to 10):** care, loyalty, fairness, sanctity, authority, liberty.
**Profile notes for parents:** 2-3 sentences.

## Folkways and cultural values
Follow the "In each series entry" section of /mnt/project-files/manga-entries/CULTURE-CLUSTERS.md exactly: table "Dimension | Position | Evidence" with the six dimensions (Dignity vs honor; Order vs freedom; Civic vs kin; Equality vs hierarchy; Tradition vs secular-rational; Survival vs self-expression), positions 0 to 10 for what the story celebrates, then "Closest clusters: A; B; C" using names from that file's Cluster positions table (nearest by distance), then optionally "Japanese source culture: ...". Values only; never ancestry.

## Philosophy essay
~600-900 words, neutral voice (never "good/bad/dangerous/wholesome" in our voice). Bold run-in headings: The central question; The answer the story gives; Characters as arguments; Symbols and motifs; Traditions it echoes; How each lens is portrayed; Shifts across the series; Discussion questions (numbered 5).

## How readers took it
Table: Reading | Who (viewpoint; anime or manga) | Summary | Source (link). Cover the spread: critics, Christian, secular parent guides, progressive, conservative, fan reviews (MAL etc.), Japanese reception if found. Note controversies and both/all sides evenly.

## Most loaded parts and pages to photograph
Intro sentence on volume/chapter mapping (give the volume→chapter ranges if known). Table: Rank | Loaded part | Chapters (volume) | Why it matters. ~8-10 rows ranked by ideological/controversy weight first, then content-confirmation items. Mark inferred chapters "likely". Final line estimating chapters/pages.

## Sources
Bulleted links of pages actually opened.

## Full-read review checklist
"- [ ]" items, each naming scene/claim, the score it affects, what to confirm on the page; include unverified details, author afterwords, and a final "Re-score and sign off" item (update scores, change label to Full read, record reviewer, delete photos).

RULES
- HARD RULE: never open manga scan / aggregator / scanlation sites (mangadex chapter pages, weebcentral, mangakakalot, manganato, mangafire, any "read manga online" site). Wikis, databases, publisher pages, reviews, news only.
- Cite real URLs you actually opened. Mark anything from memory as "(from general knowledge; to verify)". Never invent quotes, poll numbers or chapter numbers.
- Neutral: describe, never judge; use each worldview's own vocabulary; show all sides.
- Plain English, short sentences, no emoji.
