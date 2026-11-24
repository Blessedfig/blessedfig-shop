#!/usr/bin/env python3
"""Build manga-guide/technopuritan.json: an estimated Techno-Puritan grade for every analyzed series.

Christian, Nov 24, 2026: add a "techno puritan" tradition (from Malcolm and Simone Collins, authors of the
Pragmatist's Guide books) and make it the starting choice under the Christian section of "Your tradition".

The guide's own build rewrites data.json, so these grades live in their own file and index.html merges them in.
Re-run after the guide data changes:  python3 scripts/technopuritan.py
Grades are ESTIMATED from each series' existing worldview analysis (the 33 lenses: stance x strength), by the
fixed weights below; the page marks them provisional and explains how they were worked out.
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__)); G = os.path.join(HERE, '..', 'manga-guide')
NAME = 'Techno-Puritan'

# weight > 0: the tradition welcomes a story that AFFIRMS this lens; weight < 0: it objects when a story affirms it.
# A story that CRITIQUES the lens counts the other way. Explored / incidental lenses count for nothing.
W = {
    'Transhumanism':               (3.0, 'technology that improves human life'),
    'Pragmatism':                  (2.0, 'practical problem-solving'),
    'Classical virtue ethics':     (2.0, 'discipline, virtue and character'),
    'Stoicism':                    (2.0, 'self-control and endurance'),
    'Confucian ethics':            (1.5, 'duty to family and the generations'),
    'Traditionalism':              (1.5, 'handing down a lasting culture'),
    'Progressivism':               (1.0, 'faith in progress'),
    'Communitarianism':            (1.0, 'strong community'),
    'Christian':                   (1.0, 'Christian moral roots'),
    'Anti-natalism':               (-3.0, 'anti-natalism (having children framed as wrong or futile)'),
    'Hedonism':                    (-3.0, 'pleasure-seeking'),
    'Consumerism':                 (-2.0, 'consumerism'),
    'Nihilism':                    (-2.0, 'nihilism'),
    'Expressive individualism':    (-1.5, 'self-expression as the goal of life'),
    'Critical theory':             (-1.5, 'critical theory'),
    'Postmodernism':               (-1.0, 'postmodern relativism'),
    'Moralistic therapeutic deism':(-1.0, 'feel-good, undemanding morality'),
    'Absurdism':                   (-1.0, 'absurdism'),
    'Collectivism/authoritarianism':(-0.5, 'one imposed culture over many free ones'),
}
CUT = [(3.0, 'S'), (1.5, 'A'), (0.5, 'B'), (-0.5, 'C'), (-2.0, 'D')]   # else F

def sign(stance):
    s = (stance or '').lower()
    if s.startswith('affirm'): return 1
    if s.startswith('critiq'): return -1
    return 0

def grade(entry):
    parts = []
    for l in entry.get('lenses') or []:
        if l.get('lens') not in W: continue
        sg = sign(l.get('stance'))
        if not sg: continue
        w, plain = W[l['lens']]; st = float(l.get('strength') or 5) / 10
        parts.append((sg * w * st, sg, w, plain))
    score = round(sum(p[0] for p in parts), 2)
    g = next((g for cut, g in CUT if score >= cut), 'F')
    pos = sorted([p for p in parts if p[0] > 0], key=lambda p: -p[0])[:3]
    neg = sorted([p for p in parts if p[0] < 0], key=lambda p: p[0])[:3]
    say = lambda p: ('affirms ' if p[1] > 0 else 'critiques ') + p[3]
    aligns = '; '.join(say(p) for p in pos).capitalize() + '.' if pos else 'Little in its message speaks to discipline, family-building or technology.'
    concerns = '; '.join(say(p) for p in neg).capitalize() + '.' if neg else 'No clear conflict found in its main ideas.'
    return {'frame': NAME, 'grade': g, 'est': True, 'score': score, 'aligns': aligns, 'concerns': concerns}

GUIDE = {
    'beliefs': "A deliberately built value system from Malcolm and Simone Collins, authors of the Pragmatist's Guide books. They describe it as an iteration of Puritan Christianity rebuilt for a technological age, held with a secular, evidence-minded outlook. Families should consciously choose and hand down their own culture (their word is a \"cultivar\"); the point of a life is measured by the descendants and the lasting culture it leaves (their \"descendant worship\"); and humanity's purpose is to keep growing in diverse complexity and spread outward.",
    'values': "Having children and raising them well; hard work, grit and \"cunning\" over raw talent; self-control built through deliberate self-denial (fasting, Sabbath-style practices); thrift and asceticism over consumption; embracing technology, including reproductive technology and AI; many distinct family and religious cultures coexisting rather than one universal culture.",
    'forbids': "Self-indulgent hedonism and luxury; idleness; consumerism; giving up on having a family; anti-technology retreat. They are sharply critical of what they call a \"cultural supervirus\" in mainstream elite culture, which they link to parts of the social justice movement and academia, and blame for falling birth rates.",
    'family': "Large families and many children are central; parents are expected to raise children deliberately inside a chosen family culture (a \"House\"), with traditions, a family name and a governance of its own. They support embryo screening and other reproductive technology.",
    'stories': "Stories are judged by what they teach: whether discipline, sacrifice and building something for the next generation are rewarded, whether technology and science improve human life, and whether pleasure-seeking or despair are shown as empty. They are not especially troubled by intense content itself.",
    'range': "A new, small movement centered on the Collins family and their followers (Based Camp podcast, technopuritan.com); views are still being written down in their \"tracts\". Widely debated, especially its pronatalism, embryo selection and parenting views.",
    'sources': "Malcolm and Simone Collins, The Pragmatist's Guide to Crafting Religion, to Life, to Governance, to Relationships and to Sexuality; the Techno-Puritan tracts on the Based Camp podcast and technopuritan.com",
    'topics': {
        'Alcohol': "No ban; the authors drink and treat it as a known risk. They note that many religions' prohibitions protect people from hazards like alcohol, so a family may set its own rule.",
        'Tobacco and drugs': "Addiction is treated as a threat to self-control and to the values a family sets; warning children away from drugs is described as a parent's job.",
        'Magic, occult and spirits': "Approaches the world through science and technology; fantasy magic is not a concern in itself, but superstition presented as truth runs against its evidence-minded outlook.",
        'Other religions and gods shown': "Pluralist: many distinct religious and family cultures should coexist and compete; respectful portrayals of other faiths are not a concern.",
        'Violence, war and revenge': "Judged by what the story rewards; hardship, competition and sacrifice for one's people are respected, cruelty for its own sake is not.",
        'Sexuality, nudity and modesty': "Frank and analytical about sex (The Pragmatist's Guide to Sexuality). The concern is not depiction but sex treated as pure pleasure-seeking cut off from commitment and family.",
        'Same-sex relationships and gender identity': "Discussed openly and without condemnation in the books; the emphasis is on building a committed family and raising children rather than on rules about orientation.",
        'Gender roles and family': "Family is central: committed couples running their household as a team (their \"NeoCorp\" family model), many children, and a deliberately chosen family culture. Each family sets its own roles.",
        'Language and blasphemy': "Not a focus of the tradition.",
        'Authority, parents and rebellion': "Parents are expected to pass down a deliberate culture; rebellion that rejects family-building or discipline is a concern, but children are expected to choose their own path in the end.",
        'Death, afterlife and suicide': "Meaning comes from what you leave to descendants and the future; despair and stories that treat life as pointless run against it.",
        'Lying and deception': "Values honest reasoning and updating beliefs on evidence; deception shown as clever without cost is a mild concern.",
    },
    'media': "Judges a story mainly by its message about family, discipline and progress rather than by intensity.",
    'status': 'estimated',
    'note': "Grades for this tradition are estimated, not written series by series: each one is worked out from the guide's existing analysis of the story's main ideas. A story gains when it affirms practical problem-solving, discipline and virtue, self-control, family duty, tradition, progress or helpful technology, and loses when it affirms pleasure-seeking, anti-natalism, nihilism, consumerism or self-expression as the goal of life (critiquing those counts in its favor).",
}

d = json.load(open(os.path.join(G, 'data.json')))
out = {'name': NAME, 'built': d.get('built'), 'guide': GUIDE, 'weights': {k: v[0] for k, v in W.items()}, 'grades': {}}
for s in d['series']:
    e = s.get('entry')
    if not e: continue
    key = str(s['id']) if s.get('id') else 'e-' + e['slug']
    out['grades'][key] = grade(e)
json.dump(out, open(os.path.join(G, 'technopuritan.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(out['grades']), 'series graded', sorted(Counter(g['grade'] for g in out['grades'].values()).items()))
