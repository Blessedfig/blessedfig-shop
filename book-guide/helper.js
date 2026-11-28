/* Folio, the book guide helper.
   Answers questions by searching this guide's own content (materials.json and history.json) in the browser.
   No AI service, no key, nothing sent anywhere. */
(function(){
  'use strict';
  /* Questions the guide can't answer. Leave blank to turn this off.
     Set ASK_URL to a Google Form's ".../formResponse" address and ASK_FIELD to its "entry.NNNN" id for the question box.
     Only the question text is sent, and only when the visitor presses the button. */
  var ASK_URL='',ASK_FIELD='';
  var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
  function slug(s){return String(s).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
  var store={get:function(k){try{return sessionStorage.getItem(k)}catch(e){return null}},set:function(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}};
  var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}

  /* ---------- Character: a small leather book in spectacles ---------- */
  function face(size){
    return '<svg class="folio-svg" width="'+size+'" height="'+Math.round(size*1.125)+'" viewBox="0 0 64 72" aria-hidden="true" focusable="false">'+
      '<ellipse cx="32" cy="69" rx="20" ry="2.6" fill="#000" opacity=".18"/>'+
      // page block peeking at the fore-edge and head
      '<path d="M15 6 L55 6 Q58 6 58 9 L58 61 Q58 64 55 64 L15 64 Z" fill="#efe4c8"/>'+
      '<g stroke="#c9b48c" stroke-width=".6"><line x1="55.6" y1="9" x2="55.6" y2="61"/><line x1="56.8" y1="10" x2="56.8" y2="60"/></g>'+
      // spine
      '<path d="M6 8 Q6 4 10 4 L14 4 L14 66 L10 66 Q6 66 6 62 Z" fill="#4a1416"/>'+
      '<g fill="#c9a24a"><rect x="7" y="15" width="6" height="1.6" rx=".6"/><rect x="7" y="27" width="6" height="1.6" rx=".6"/><rect x="7" y="39" width="6" height="1.6" rx=".6"/><rect x="7" y="51" width="6" height="1.6" rx=".6"/></g>'+
      // front cover
      '<rect x="12" y="3" width="42" height="64" rx="3" fill="#6b2326"/>'+
      '<rect x="15.5" y="6.5" width="35" height="57" rx="1.5" fill="none" stroke="#c9a24a" stroke-width="1"/>'+
      '<g fill="#c9a24a"><circle cx="15.5" cy="6.5" r="1.3"/><circle cx="50.5" cy="6.5" r="1.3"/><circle cx="15.5" cy="63.5" r="1.3"/><circle cx="50.5" cy="63.5" r="1.3"/></g>'+
      // face
      '<g class="folio-eyes">'+
        '<ellipse cx="26" cy="27" rx="4.2" ry="4.6" fill="#fbf7ec"/><ellipse cx="41" cy="27" rx="4.2" ry="4.6" fill="#fbf7ec"/>'+
        '<circle class="folio-pupil" cx="26.6" cy="27.6" r="2.1" fill="#2a2019"/><circle class="folio-pupil" cx="41.6" cy="27.6" r="2.1" fill="#2a2019"/>'+
      '</g>'+
      // gilt spectacles
      '<g fill="none" stroke="#e0bd66" stroke-width="1.3"><circle cx="26" cy="27" r="6.2"/><circle cx="41" cy="27" r="6.2"/><path d="M32.2 26.4 Q33.5 25 34.8 26.4"/><path d="M19.8 26 L16.5 24.6 M47.2 26 L50.5 24.6"/></g>'+
      // brows and smile
      '<g stroke="#2a2019" stroke-width="1.2" stroke-linecap="round" fill="none"><path d="M21.5 18.6 Q26 16.6 30 18.4"/><path d="M37 18.4 Q41 16.6 45.5 18.6"/><path d="M28 38.5 Q33.5 43 39 38.5"/></g>'+
      // gilt title lines
      '<g fill="#c9a24a"><rect x="24" y="49" width="19" height="1.8" rx=".7"/><rect x="27" y="53.5" width="13" height="1.8" rx=".7"/></g>'+
    '</svg>';
  }

  /* ---------- Styles (scoped to .folio-*, using the guide's own tokens) ---------- */
  var css=
  '.folio-btn{position:fixed;right:16px;bottom:16px;z-index:60;border:0;background:none;padding:4px;cursor:pointer;line-height:0;border-radius:14px;-webkit-tap-highlight-color:transparent}'+
  '.folio-btn:focus-visible{outline:2px solid var(--accent);outline-offset:3px}'+
  '.folio-btn .folio-svg{filter:drop-shadow(0 4px 6px rgba(0,0,0,.25));transition:transform .2s}'+
  '.folio-btn:hover .folio-svg{transform:translateY(-3px) rotate(-3deg)}'+
  '.folio-hello{position:fixed;right:86px;bottom:44px;z-index:60;max-width:220px;background:var(--panel);color:var(--ink);border:1px solid var(--rule);outline:1px solid var(--rule);outline-offset:3px;padding:10px 14px;font:italic 1rem/1.35 var(--f-body);box-shadow:0 6px 18px rgba(0,0,0,.15)}'+
  '.folio-hello::after{content:"";position:absolute;right:-8px;bottom:14px;width:14px;height:14px;background:var(--panel);border-right:1px solid var(--rule);border-top:1px solid var(--rule);transform:rotate(45deg)}'+
  '.folio-hello button{all:unset;cursor:pointer;color:var(--accent);font-style:normal;font-size:.9rem;display:inline-flex;align-items:center;min-height:44px;padding:0 6px;margin:0 0 -10px -6px;text-decoration:underline;text-underline-offset:2px}'+'.folio-hello button:focus-visible{outline:2px solid var(--accent)}'+
  '.folio-panel{position:fixed;right:16px;bottom:100px;z-index:61;width:min(380px,calc(100vw - 32px));max-height:min(560px,calc(100vh - 130px));display:flex;flex-direction:column;background:var(--panel);color:var(--ink);border:1px solid var(--rule);outline:1px solid var(--rule);outline-offset:4px;box-shadow:0 14px 40px rgba(0,0,0,.25)}'+
  '.folio-panel[hidden],.folio-hello[hidden]{display:none}'+
  '.folio-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--rule)}'+
  '.folio-head h2{margin:0;font:600 1.35rem/1.1 var(--f-display);color:var(--ink)}'+
  '.folio-head p{margin:0;font:italic .9rem/1.2 var(--f-body);color:var(--muted)}'+
  '.folio-x{margin-left:auto;border:0;background:none;color:var(--muted);font:1.5rem/1 var(--f-body);cursor:pointer;min-width:44px;min-height:44px}'+
  '.folio-x:focus-visible,.folio-chip:focus-visible,.folio-form button:focus-visible{outline:2px solid var(--accent);outline-offset:2px}'+
  '.folio-log{flex:1;overflow-y:auto;padding:12px 14px;display:flex;flex-direction:column;gap:12px;font-size:1rem;line-height:1.45}'+
  '.folio-q{align-self:flex-end;max-width:85%;background:var(--tone);padding:6px 12px;font-style:italic}'+
  '.folio-a{max-width:100%}'+
  '.folio-a h3{margin:0 0 2px;font:600 1.15rem/1.2 var(--f-display);color:var(--ink)}'+
  '.folio-a .yrs{display:block;font-variant-caps:all-small-caps;letter-spacing:.08em;color:var(--accent);font-size:.95rem;margin-bottom:4px}'+
  '.folio-a p{margin:0 0 6px}'+
  '.folio-a .lf{color:var(--muted)}.folio-a .lf b{font-variant-caps:all-small-caps;letter-spacing:.08em;color:var(--ink);font-weight:600;margin-right:4px}'+
  '.folio-a a{color:var(--accent);text-underline-offset:3px}'+
  '.folio-also{margin-top:4px;padding-top:6px;border-top:1px dotted var(--rule);font-size:.95rem}'+
  '.folio-also ul{margin:2px 0 0;padding-left:18px}'+
  '.folio-chips{display:flex;flex-wrap:wrap;gap:8px}'+
  '.folio-chip{border:1px solid var(--rule);background:var(--paper);color:var(--ink);font:italic .95rem var(--f-body);padding:6px 10px;min-height:44px;cursor:pointer}'+
  '.folio-chip:hover{border-color:var(--accent)}'+
  '.folio-form{display:flex;gap:8px;padding:10px 14px 14px;border-top:1px solid var(--rule)}'+
  '.folio-form input{flex:1;min-width:0;border:1px solid var(--rule);background:var(--paper);color:var(--ink);font:1rem var(--f-body);padding:8px 10px;min-height:44px;box-sizing:border-box}'+
  '.folio-form input:focus{outline:2px solid var(--accent);outline-offset:0}'+
  '.folio-form button{border:0;background:var(--accent);color:var(--panel);font:600 1rem var(--f-display);letter-spacing:.04em;padding:0 16px;min-height:44px;cursor:pointer}'+
  '.folio-note{font-size:.8rem;color:var(--muted);font-style:italic}'+
  '@keyframes folio-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}'+
  '@keyframes folio-blink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.1)}}'+
  '.folio-btn.anim .folio-svg{animation:folio-bob 3.2s ease-in-out infinite}'+
  '.folio-btn.anim .folio-eyes{transform-box:fill-box;transform-origin:center;animation:folio-blink 5s infinite}'+
  '.entry.folio-hit,.hline li.folio-hit{animation:folio-glow 2.2s ease-out}'+
  '@keyframes folio-glow{0%{box-shadow:0 0 0 3px var(--gilt)}100%{box-shadow:0 0 0 3px transparent}}'+
  '@media (max-width:520px){.folio-panel{right:8px;left:8px;width:auto;bottom:92px;max-height:calc(100vh - 120px)}.folio-hello{right:84px;bottom:40px;max-width:170px;font-size:.95rem}}'+
  '@media (prefers-reduced-motion:reduce){.folio-btn.anim .folio-svg,.folio-btn.anim .folio-eyes,.entry.folio-hit,.hline li.folio-hit{animation:none}}';

  /* ---------- Search ---------- */
  var STOP=('a an and are as at be been but by can could did do does for from had has have how i if in into is it its me my of on or our should so than that the their them then there these they this those to was we were what when where which who whom why will with would you your about any some tell know find look looking mean means meaning book books start started starts begin began begins introduced use used old get got show please').split(' ');
  var stop={};STOP.forEach(function(w){stop[w]=1});
  // A few everyday words mapped to the terms the guide uses.
  var SYN={jacket:['dust','jacket','wrapper'],dj:['dust','jacket'],dustjacket:['dust','jacket'],cover:['binding','cloth','board','jacket'],covers:['binding','cloth','board'],leather:['leather','calf','morocco','vellum','goatskin'],gold:['gilt','gold'],gilding:['gilt'],edition:['edition','first','printing','issue'],firsts:['first','edition'],date:['date','year','era'],dating:['date','era'],stain:['foxing','toning','stain'],spots:['foxing'],brown:['foxing','toning','acid'],yellow:['toning','acid'],isbn:['isbn','number','barcode'],barcode:['barcode','isbn'],price:['price','value','clipped'],worth:['value','worth','collector'],valuable:['value','collector'],pictures:['illustration','plate','engraving','halftone'],picture:['illustration','plate','engraving'],photo:['halftone','photograph'],print:['printing','press','letterpress','offset'],printed:['printing','press'],font:['type','typeface'],marbled:['marbled','marbling','marble'],marble:['marbled','marbling'],sewing:['sewn','sewing','stitch'],sewn:['sewn','sewing'],spine:['spine','band','back'],glue:['perfect','adhesive','glue'],paperback:['paperback','perfect','wrappers'],hardcover:['case','cloth','board'],repair:['rebacked','recased','repair'],care:['care','storage','clean'],clean:['clean','care'],mold:['mold','mould','damp'],mould:['mold','mould'],signed:['signed','signature','inscribed'],club:['club','bomc']};
  function stem(w){if(w.length>4&&/ies$/.test(w))return w.slice(0,-3)+'y';if(w.length>4&&/(ing|ed)$/.test(w))return w.replace(/(ing|ed)$/,'');if(w.length>3&&/s$/.test(w)&&!/ss$/.test(w))return w.slice(0,-1);return w}
  function toks(s){return (String(s).toLowerCase().match(/[a-z0-9]+/g)||[])}
  var DOCS=[];
  function addDoc(d){
    d.tName=toks(d.name).map(stem);
    d.tBody=toks([d.spot,d.detail,d.value,d.years,d.chapter].join(' ')).map(stem);
    var bag={};d.tBody.forEach(function(t){bag[t]=(bag[t]||0)+1});d.bag=bag;DOCS.push(d);
  }
  var DF={};
  function buildIndex(G,H){
    G.chapters.forEach(function(c){c.entries.forEach(function(e){addDoc({kind:'entry',id:'e-'+slug(e.name),name:e.name,years:e.years,spot:e.spot,detail:e.detail,value:e.value,chapter:c.name,chapterId:c.id})})});
    if(H){var T={};H.themes.forEach(function(t){T[t.id]=t.name});
      H.entries.forEach(function(e){addDoc({kind:'history',id:'h-'+e.yearSort+'-'+slug(e.event).slice(0,40),name:String(e.year)+': '+e.event,year:e.yearSort,years:String(e.year),detail:e.event,value:e.onTheShelf,chapter:'How books changed '+(T[e.theme]||''),chapterId:'history'})})}
    DOCS.forEach(function(d){var seen={};d.tName.concat(d.tBody).forEach(function(t){if(!seen[t]){seen[t]=1;DF[t]=(DF[t]||0)+1}})});
  }
  function search(q){
    var raw=toks(q),terms=[],years=[];
    raw.forEach(function(w){
      if(/^1[4-9]\d\ds?$|^20[0-2]\ds?$/.test(w)){years.push(parseInt(w,10));return}
      if(/^\d0s$/.test(w)){return}
      if(stop[w])return;
      terms.push({t:stem(w),w:1});
      (SYN[w]||[]).forEach(function(x){if(stem(x)!==stem(w))terms.push({t:stem(x),w:.45})});
    });
    var uniq={};terms=terms.filter(function(o){if(uniq[o.t]||o.t.length<2)return false;uniq[o.t]=1;return true});
    var when=/^\s*when\b/i.test(q);
    if(!terms.length&&!years.length)return[];
    var N=DOCS.length;
    var scored=DOCS.map(function(d){
      var s=0,hit=0;
      terms.forEach(function(o){
        var t=o.t,idf=o.w*Math.log(1+N/(1+(DF[t]||0))),h=false;
        if(d.tName.indexOf(t)>-1){s+=4*idf;h=true}
        else if(d.tName.some(function(n){return n.length>3&&t.length>3&&(n.indexOf(t)===0||t.indexOf(n)===0)})){s+=2.5*idf;h=true}
        if(d.bag[t]){s+=Math.min(3,d.bag[t])*idf;h=true}
        if(h&&o.w===1)hit++;
      });
      var main=terms.filter(function(o){return o.w===1}).length;
      if(main>1&&hit===main)s*=1.5;
      if(when&&d.kind==='history'&&s>0)s*=1.3;
      if(years.length&&d.year){var y=years[0],gap=Math.abs(d.year-y);if(gap<=15)s+=6-gap/3}
      if(years.length&&d.kind==='entry'&&d.years){var m=(d.years.match(/1[4-9]\d\d|20[0-2]\d/g)||[]).map(Number);if(m.some(function(v){return Math.abs(v-years[0])<=20}))s+=2}
      return{d:d,s:s};
    }).filter(function(x){return x.s>1.2}).sort(function(a,b){return (b.s-a.s)||((a.d.year||0)-(b.d.year||0))});
    if(when)scored.sort(function(a,b){var t=scored[0].s*.92;var A=a.s>=t,B=b.s>=t;if(A&&B&&a.d.year&&b.d.year)return a.d.year-b.d.year;return b.s-a.s});
    var cut=scored.length?scored[0].s*.4:0;
    return scored.filter(function(x){return x.s>=cut}).slice(0,4);
  }

  /* ---------- UI ---------- */
  var SUGGEST=['What is foxing?','Laid or wove paper?','What does half leather mean?','When did ISBNs start?','Is it an engraving or a halftone?','How do I store old books?'];
  var btn,panel,log,input,hello,ready=false,G=null,Hd=null;
  function go(id){
    var el=document.getElementById(id);if(!el)return false;
    el.scrollIntoView({behavior:reduce?'auto':'smooth',block:'center'});
    el.classList.remove('folio-hit');void el.offsetWidth;el.classList.add('folio-hit');
    return true;
  }
  function answerHTML(res,q){
    if(!res.length)return '<div class="folio-a"><p>Hmm, I can’t find that in this guide. Try a simpler word, such as <i>vellum</i>, <i>foxing</i> or <i>first edition</i>.</p><p>For a book in your hands, <a href="https://www.theblessedfigtree.com/#visit">bring it by the shop</a> and we’ll take a look.</p></div>';
    var top=res[0].d,out='<div class="folio-a">';
    out+='<p class="folio-note">From the chapter “'+esc(top.kind==='history'?'How books changed':top.chapter)+'”:</p>';
    out+='<h3>'+esc(top.kind==='history'?top.years:top.name)+'</h3>';
    if(top.kind==='entry'&&top.years)out+='<span class="yrs">'+esc(top.years)+'</span>';
    if(top.kind==='entry'&&top.spot)out+='<p class="lf"><b>Look for</b>'+esc(top.spot)+'</p>';
    if(top.detail)out+='<p>'+esc(top.detail)+'</p>';
    if(top.value)out+='<p><i>'+esc(top.value)+'</i></p>';
    out+='<p><a href="#'+esc(top.id)+'" data-folio-go="'+esc(top.id)+'">Show me in the guide</a></p>';
    if(res.length>1){out+='<div class="folio-also">Also worth a look:<ul>'+res.slice(1).map(function(r){return'<li><a href="#'+esc(r.d.id)+'" data-folio-go="'+esc(r.d.id)+'">'+esc(r.d.kind==='history'?r.d.name:r.d.name)+'</a></li>'}).join('')+'</ul></div>'}
    return out+'</div>';
  }
  function say(html){var d=document.createElement('div');d.innerHTML=html;while(d.firstChild)log.appendChild(d.firstChild);log.scrollTop=log.scrollHeight}
  function ask(q){
    q=String(q||'').trim().slice(0,200);if(!q)return;
    say('<div class="folio-q">'+esc(q)+'</div>');
    if(!ready){say('<div class="folio-a"><p>One moment, I’m still opening the guide. Try again in a second.</p></div>');return}
    var chips=log.querySelector('.folio-chips');if(chips)chips.remove();
    var res=search(q);say(answerHTML(res,q));
    if(ASK_URL&&ASK_FIELD)say('<div class="folio-a folio-send"><button type="button" class="folio-chip" data-folio-send="'+esc(q)+'">'+(res.length?'Not what you meant? Send us this question':'Send this question to the shop')+'</button></div>');
  }
  function send(q,el){
    var body=new URLSearchParams();body.append(ASK_FIELD,q);
    fetch(ASK_URL,{method:'POST',mode:'no-cors',body:body}).then(function(){el.outerHTML='<p class="folio-note">Thank you. We read every question and use them to grow this guide.</p>'}).catch(function(){el.outerHTML='<p class="folio-note">That didn\u2019t send. Please try again later.</p>'});
  }
  function open(){
    panel.hidden=false;hello.hidden=true;btn.setAttribute('aria-expanded','true');store.set('folio-greeted','1');
    setTimeout(function(){input.focus()},30);
  }
  function close(){panel.hidden=true;btn.setAttribute('aria-expanded','false');btn.focus()}
  function build(){
    var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
    btn=document.createElement('button');btn.type='button';btn.className='folio-btn'+(reduce?'':' anim');
    btn.setAttribute('aria-label','Ask Folio, the book guide helper');btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-controls','folio-panel');
    btn.innerHTML=face(60);
    hello=document.createElement('div');hello.className='folio-hello';hello.hidden=true;
    hello.innerHTML='Looking for something? Ask me about any part of an old book.<button type="button" aria-label="Dismiss">No thanks</button>';
    panel=document.createElement('section');panel.className='folio-panel';panel.id='folio-panel';panel.hidden=true;
    panel.setAttribute('role','dialog');panel.setAttribute('aria-label','Folio, the book guide helper');
    panel.innerHTML='<div class="folio-head">'+face(36)+'<div><h2>Folio</h2><p>Answers from this guide</p></div><button type="button" class="folio-x" aria-label="Close">&times;</button></div>'+
      '<div class="folio-log" aria-live="polite"><div class="folio-a"><p>Good day! I’m Folio. Ask me what something is, what to look for, or when it changed, and I’ll find it in the guide.</p></div>'+
      '<div class="folio-chips">'+SUGGEST.map(function(s){return'<button type="button" class="folio-chip">'+esc(s)+'</button>'}).join('')+'</div></div>'+
      '<form class="folio-form" autocomplete="off"><label for="folio-in" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Your question</label><input id="folio-in" type="text" maxlength="200" placeholder="e.g. What is a raised band?" enterkeyhint="send"><button type="submit">Ask</button></form>';
    document.body.appendChild(hello);document.body.appendChild(panel);document.body.appendChild(btn);
    log=panel.querySelector('.folio-log');input=panel.querySelector('input');
    btn.addEventListener('click',function(){panel.hidden?open():close()});
    panel.querySelector('.folio-x').addEventListener('click',close);
    hello.querySelector('button').addEventListener('click',function(){hello.hidden=true;store.set('folio-greeted','1')});
    hello.addEventListener('click',function(e){if(e.target===hello)open()});
    panel.querySelector('form').addEventListener('submit',function(e){e.preventDefault();ask(input.value);input.value=''});
    panel.addEventListener('click',function(e){
      var sd=e.target.closest('[data-folio-send]');if(sd){send(sd.getAttribute('data-folio-send'),sd);return}
      var c=e.target.closest('.folio-chip');if(c){ask(c.textContent);return}
      var a=e.target.closest('[data-folio-go]');if(a){e.preventDefault();if(go(a.getAttribute('data-folio-go'))&&matchMedia('(max-width:520px)').matches)close()}
    });
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)close()});
    var small=false;try{small=matchMedia('(max-width:760px)').matches}catch(e){}
    if(!small&&!store.get('folio-greeted'))setTimeout(function(){if(panel.hidden)hello.hidden=false},2500);
  }
  function load(){
    Promise.all([
      fetch('materials.json').then(function(r){return r.json()}),
      fetch('history.json').then(function(r){return r.ok?r.json():null}).catch(function(){return null})
    ]).then(function(r){G=r[0];Hd=r[1];buildIndex(G,Hd);ready=true}).catch(function(){ready=false});
  }
  // Expose for testing only.
  window.__folio={search:function(q){return search(q).map(function(x){return x.d.name})},slug:slug};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){build();load()});else{build();load()}
})();
