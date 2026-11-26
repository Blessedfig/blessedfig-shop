"""Usage: python3 validate.py <file.json> ...  Checks a quick entry against the spec. Prints OK or the problems."""
import json, sys, re
FR=[l.split(':')[0][2:] for l in open('/mnt/project-files/frame-guides/FRAMES.md') if l.startswith('- ')]
CATS=['Violence','Fear and intensity','Sexuality and romance','Language','Substances','Mental health and self-harm','Imitable behavior','Commercial']
for p in sys.argv[1:]:
    errs=[]
    try: q=json.load(open(p))
    except Exception as e: print(p,'BAD JSON',e); continue
    for k in ['anilist_id','title','label','confidence','sources','premise','life_message','overall','content','lenses','dominant','axes','foundations','frames','winners_losers','to_verify']:
        if k not in q: errs.append('missing '+k)
    cs=[c.get('category') for c in q.get('content',[])]
    if cs!=CATS: errs.append(f'content categories must be exactly {CATS}')
    for c in q.get('content',[]):
        if not isinstance(c.get('score'),(int,float)) or not 0<=c['score']<=10: errs.append('bad score '+str(c.get('category')))
    if q.get('content') and q.get('overall')!=max(c.get('score',0) for c in q['content']): errs.append('overall must equal highest content score')
    fs=[f.get('frame') for f in q.get('frames',[])]
    if fs!=FR: errs.append(f'frames must be exactly, in order: {FR}')
    for f in q.get('frames',[]):
        if f.get('grade') not in list('SABCDF'): errs.append('bad grade '+str(f.get('frame')))
        if f.get('weight') not in ['Minor','Discuss','Significant']: errs.append('bad weight '+str(f.get('frame')))
    if set(q.get('axes',{}))!={'economic','social','cultural','community'}: errs.append('axes need economic, social, cultural, community')
    if set(q.get('foundations',{}))!={'care','loyalty','fairness','sanctity','authority','liberty'}: errs.append('foundations keys wrong')
    d=q.get('delivery')
    if d is None: errs.append('missing delivery (required for new entries)')
    else:
        if d.get('style') not in ['Subtle','Woven in','Explicit','Heavy-handed']: errs.append('delivery.style must be Subtle, Woven in, Explicit or Heavy-handed')
        if not isinstance(d.get('preachiness'),(int,float)) or not 0<=d['preachiness']<=10: errs.append('delivery.preachiness 0-10')
        if d.get('opposing_views') not in ['Fair','Mixed','Strawman','None shown']: errs.append('delivery.opposing_views must be Fair, Mixed, Strawman or None shown')
        for x in d.get('personified',[]):
            if x.get('role') not in ['Hero','Villain','Mentor','Foil','Other'] or x.get('treatment') not in ['Sympathetic','Fair','Mixed','Strawman']: errs.append('bad delivery.personified row '+str(x.get('character')))
    if len(q.get('sources',[]))<2: errs.append('need at least 2 sources')
    print(p, 'OK' if not errs else 'PROBLEMS: '+'; '.join(errs))
