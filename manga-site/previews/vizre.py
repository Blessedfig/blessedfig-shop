import json,time,urllib.request
o=json.load(open('viz.json'))
for k,v in o.items():
    if 'vol1' not in v or 'checked2' in v: continue
    try: h=urllib.request.urlopen(urllib.request.Request(v['vol1'],headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf8','ignore')
    except Exception as e: print(e); continue
    v['preview']='o_preview o_open-reader' in h; v['checked2']=1; time.sleep(0.6)
    json.dump(o,open('viz.json','w'))
print(len(o),sum(1 for v in o.values() if v.get('preview')))
