#!/usr/bin/env python3
"""Small first-load copies of the manga guide catalog: data.slim.json and realign.slim.json.

The page draws its first screen from these (about 1/6 of the download) and then loads the full files in the
background for series write-ups. Only long write-up text is left out; every field that grades, sorts or labels
a series is kept, and the page's own merging code runs on the slim copies unchanged.
Re-run whenever data.json or realign.json changes (scripts/manga_ux.py runs it)."""
import json, os
D = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'manga-guide')
FRAME_KEEP = {'frame', 'grade', 'weight', 'est'}
ENTRY_DROP = {'folkways', 'premise', 'to_verify', 'sources', 'winners_losers', 'foundations'}

def slim_entry(e):
    if not isinstance(e, dict):
        return e
    e = {k: v for k, v in e.items() if k not in ENTRY_DROP}
    if isinstance(e.get('frames'), list):
        e['frames'] = [{k: v for k, v in f.items() if k in FRAME_KEEP} if isinstance(f, dict) else f for f in e['frames']]
    return e

def main():
    d = json.load(open(os.path.join(D, 'data.json')))
    for s in d['series']:
        if s.get('entry'):
            s['entry'] = slim_entry(s['entry'])
    a = json.load(open(os.path.join(D, 'realign.json')))
    a['entries'] = {k: slim_entry(v) for k, v in (a.get('entries') or {}).items()}
    for k in ('reasons', 'talking', 'guides'):   # only the series and method pages read these, after the full file arrives
        a.pop(k, None)
    for name, obj in (('data.slim.json', d), ('realign.slim.json', a)):
        open(os.path.join(D, name), 'w').write(json.dumps(obj, separators=(',', ':'), ensure_ascii=False))
    print('slim copies written')

if __name__ == '__main__':
    main()
