import json,urllib.request,urllib.parse,time
ids=json.load(open('mdids.json'));out={}
for i in range(0,len(ids),40):
    q=urllib.parse.urlencode([('ids[]',x) for x in ids[i:i+40]]+[('limit',100),('contentRating[]','safe'),('contentRating[]','suggestive'),('contentRating[]','erotica'),('contentRating[]','pornographic')])
    r=urllib.request.Request('https://api.mangadex.org/manga?'+q,headers={'User-Agent':'manga-guide-metadata/1.0'})
    for t in range(5):
        try: res=json.load(urllib.request.urlopen(r)); break
        except Exception as e: print(e); time.sleep(3)
    for m in res['data']: out[m['id']]=m['attributes'].get('links') or {}
    time.sleep(0.4)
json.dump(out,open('mdlinks.json','w'));print(len(out))
