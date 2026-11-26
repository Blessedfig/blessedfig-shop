import json,re,time,urllib.request,difflib
D=json.load(open('/home/user/blessedfig-shop/manga-guide/data.json'))
ok=json.load(open('viz_ok.json')); out=json.load(open('viz2.json')) if __import__('os').path.exists('viz2.json') else {}
IMPR={'shonen-jump','shojo-beat','viz-signature','viz-media','perfect-square','viz-originals','vizkids','haikasoru','shonenjump','viz-select'}
def get(u):
    for t in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf8','ignore')
        except Exception as e: time.sleep(2)
    return ''
n=lambda t: re.sub(r'[^a-z0-9]','',(t or '').lower().replace('&','and'))
todo=[s for s in D['series'] if s.get('entry') and (s.get('pubrating') or {}).get('publisher')=='VIZ Media' and str(s['id']) not in ok]
print(len(todo))
for s in todo:
    k=str(s['id'])
    if k in out: continue
    r={}; h=get(s['pubrating']['url']); time.sleep(0.6)
    ser=[x for x in re.findall(r'href="/([a-z0-9-]+)" class="color-red hover-dark-red"',h) if x not in IMPR]
    if ser:
        r['series']='https://www.viz.com/'+ser[0]; sh=get(r['series']); time.sleep(0.6)
        m=re.findall(r'/manga-books/manga/[a-z0-9-]*?-volume-1(?:-0)?/product/\d+',sh)
        if m:
            r['vol1']='https://www.viz.com'+m[0]; ph=get(r['vol1']); time.sleep(0.6)
            r['preview']='o_preview o_open-reader' in ph
            t=re.search(r'<title>([^<]*)',ph); pt=re.sub(r'^VIZ \| Read a Free Preview of ','',t.group(1) if t else ''); pt=re.sub(r',? Vol\. 1$','',pt); r['label']=pt
            names=[s['title'],s.get('romaji')]
            r['match']=max(difflib.SequenceMatcher(None,n(pt),n(x)).ratio() for x in names if x)>=0.8 or any(n(pt) and x and (n(pt) in n(x) or n(x) in n(pt)) for x in names)
    out[k]=r; json.dump(out,open('viz2.json','w'))
print('done',len(out),sum(1 for v in out.values() if v.get('preview') and v.get('match')))
for k,v in out.items():
    if v.get('preview') and not v.get('match'): print('nomatch',k,v.get('label'))
