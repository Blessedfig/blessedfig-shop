#!/bin/bash
# Rebuild the guide and open + push a branch on the store repo. Usage: deploy.sh <branch> "<commit message>"
set -e
cd /home/user/manga-catalog && python3 build.py | head -2 && cp web/index.html site/
cd /home/user/blessedfig-shop && git checkout -q main && git pull -q origin main && git checkout -q -b "$1"
python3 - <<'PY'
import json
d=json.load(open('/home/user/manga-catalog/site/data.json'))
for s in d['series']: s.pop('synopsis_db',None); s.pop('match',None)
json.dump(d,open('manga-guide/data.json','w'),ensure_ascii=False,separators=(',',':'))
body=open('/home/user/manga-catalog/web/index.html').read().replace('<meta charset="utf-8">\n','').replace('<small>PREVIEW</small>','<small>BETA</small>')
body=body.replace('<nav class="tabs" aria-label="Sections">','<nav class="tabs" aria-label="Sections">\n      <a href="../">The Blessed Fig Tree</a>',1)
old=open('manga-guide/index.html').read(); head=old[:old.index('<title>')]
i=body.index('</style>')+len('</style>')
open('manga-guide/index.html','w').write(head+body[:i]+'\n</head>\n<body>\n'+body[i:]+'\n</body>\n</html>\n')
PY
rm -rf manga-guide/entries && cp -r /home/user/manga-catalog/site/entries manga-guide/
git add -A && git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "$2

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01TBSkin4uNp752y4aCHc8ZT"
git -c push.negotiate=true push -q -u origin "$1" 2>&1 | grep -v '^remote: *$' || true
git log --oneline -1
