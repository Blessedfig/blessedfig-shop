import json,re,time,urllib.request,sys
L=json.load(open('mdlinks.json'))
D=json.load(open('/home/user/blessedfig-shop/manga-guide/data.json'))
out=json.load(open('viz.json')) if __import__('os').path.exists('viz.json') else {}
def get(u):
    for t in range(3):
        try: return urllib.request.urlopen(urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0'}),timeout=30).read().decode('utf8','ignore')
        except Exception as e: err=e; time.sleep(2)
    print('ERR',u,err); return ''
todo=[]
for s in D['series']:
    if not s.get('entry'): continue
    e=(L.get(s.get('mdex')) or {}).get('engtl','')
    if 'viz.com' in e and '/manga-books/' not in e: todo.append((s['id'],e))
print(len(todo))
for sid,u in todo:
    if sid in out: continue
    h=get(u); time.sleep(0.7)
    m=re.findall(r'/manga-books/manga/[a-z0-9-]*?-volume-1(?:-0)?/product/\d+',h)
    r={'series':u}
    if m:
        pu='https://www.viz.com'+m[0]; ph=get(pu); time.sleep(0.7)
        r['vol1']=pu; r['preview']='>Free preview<' in ph
        t=re.search(r'<title>([^<]*)',ph); r['title']=t and t.group(1)
    out[sid]=r
    json.dump(out,open('viz.json','w'))
c=sum(1 for v in out.values() if v.get('preview')); print('done',len(out),'with preview',c)
