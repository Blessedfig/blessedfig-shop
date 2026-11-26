"use strict";
// Shared renderer for the per-place foraging maps: foraging/places/<slug>/ sets window.PLACE before loading this file.
(function(){
const st=document.createElement('style');st.textContent='table.hab{border-collapse:collapse;width:100%;font-size:.88rem}table.hab td,table.hab th{border-bottom:1px solid #e4ddd0;padding:5px 4px;text-align:left;vertical-align:top}table.hab .num{text-align:right;white-space:nowrap}.sw{display:inline-block;width:12px;height:12px;border-radius:3px;margin-right:6px;vertical-align:-1px}';document.head.appendChild(st);
const D='foraging/data/';
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const OWNC={county:'#2f7d3a',state:'#2a6db0',sna:'#6a4fb0',federal:'#8a6a20',bcpl:'#b07a2a',mfl_open:'#9aa0a0',mfl_closed:'#c9c2b4',private:'#c9c2b4',other_public:'#7d8a97',tribal:'#b26f6f'};
const KIND={county:'Langlade County Forest',state:'State land (DNR)',sna:'State Natural Area',federal:'Chequamegon-Nicolet National Forest',trail:'Trail corridor'};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const j=u=>fetch(D+u).then(r=>r.json());
const HAB={1:['Maple woods','#6fa13f'],2:['Hemlock woods','#2f6f63'],3:['Oak woods','#b98b3a'],4:['Pine woods','#4b7a2c'],5:['Aspen and birch','#c4c94e'],6:['Mixed hardwoods','#98b96b'],7:['Mixed conifer woods','#3f8a6c'],8:['Hardwood swamp','#6a98ad'],9:['River bottoms','#3fa0a3'],10:['Cedar and tamarack swamp','#3d6c8d'],11:['Open bog','#a58cc0'],12:['Alder thicket','#8db5a3'],13:['Marsh','#7cc2d4'],14:['Openings','#e2c468']};
const SOILN={1:'silt loam over till',2:'stony glacial till',3:'sand and gravel',4:'wet flat loam',5:'muck',6:'peat',7:'river floodplain soil',9:'gravel pit'};
const TERN={1:'frost pocket',2:'south-facing slope',3:'north-facing slope',4:'sloping ground',5:'level ground'};
const OWNK={1:'county',2:'state',3:'federal',4:'bcpl'};
const merc=a=>Math.log(Math.tan(Math.PI/4+a*Math.PI/360));
function pip(x,y,g){const polys=g.type==='Polygon'?[g.coordinates]:g.coordinates;for(const P of polys){let inside=false;for(const ring of P){let c=false;for(let i=0,k=ring.length-1;i<ring.length;k=i++){const xi=ring[i][0],yi=ring[i][1],xk=ring[k][0],yk=ring[k][1];if(((yi>y)!==(yk>y))&&(x<(xk-xi)*(y-yi)/(yk-yi)+xi))c=!c;}if(c)inside=!inside;}if(inside)return true;}return false;}
Promise.all([j('places.json'),j('areas.json'),j('species.json'),j('rules.json'),j('areas.geojson'),j('units.json'),fetch(D+'units_id.png').then(r=>r.blob())]).then(async([P,A,S,R,AG,U,UB])=>{
  const pl=P.find(p=>p.slug===window.PLACE);if(!pl){document.querySelector('#body').innerHTML='<p>Place not found. <a href="foraging/places/">All places</a></p>';return;}
  const AM={};A.forEach(a=>AM[a.id]=a);const SM={};S.forEach(s=>SM[s.k]=s);const mem=new Set(pl.members);
  document.title=pl.name+' foraging map | The Blessed Fig Tree, Antigo';
  document.querySelector('#title').textContent=pl.name;
  document.querySelector('#sub').textContent=`${KIND[pl.kind]||''} · ${pl.acres.toLocaleString()} acres of public land  · ${pl.elev[0]}–${pl.elev[1]} ft`;
  // month grid: share of past years in season, per month, shifted by the place's microclimate offset
  const sh=Math.round((pl.offset||0)/7);
  const month=(s,m)=>{if(!s.weeks)return 0;let mx=0;for(let w=0;w<52;w++){const d=new Date(2026,0,1+w*7);if(d.getMonth()!==m)continue;const i=w-sh;const v=(i>=0&&i<52)?s.weeks[i]:0;mx=Math.max(mx,v);}return mx;};
  const rows=pl.species.filter(([k])=>SM[k]).map(([k,lvl])=>{const s=SM[k];return `<tr><td><b>${esc(s.n)}</b>${s.kind==='fungus'?' <span class="fx">expert ID only</span>':''}<div class="mut">${lvl===2?'good habitat':'some habitat'} · ${esc(s.part||'')}</div></td>${MON.map((m,i)=>{const v=month(s,i);return `<td class="mc" style="background:${v>0.05?`rgba(61,107,79,${.15+.85*v})`:'transparent'}" title="${m}: ${Math.round(v*100)}% of years"></td>`}).join('')}</tr>`;}).join('');
  const memG=AG.features.filter(f=>mem.has(f.properties.id));const C={};U.cols.forEach((c,i)=>C[c]=i);
  const inPl=new Set(),byCov={};for(const r of U.units){const x=r[C.lon],y=r[C.lat];if(!memG.some(f=>pip(x,y,f.geometry)))continue;inPl.add(r[C.id]);
    const b=byCov[r[C.cov]]||(byCov[r[C.cov]]={ha:0,sp:{}});b.ha+=r[C.ha];const allow=R.owners[OWNK[r[C.own]]].allow;
    U.species.forEach((k,i)=>{if(r[C.lv][i]==='2'&&SM[k]&&allow.includes(SM[k].cat))b.sp[k]=(b.sp[k]||0)+r[C.ha];});}
  const habRows=Object.entries(byCov).sort((a,b)=>b[1].ha-a[1].ha).filter(([c,b])=>b.ha*2.471>=5).map(([c,b])=>{const top=Object.entries(b.sp).sort((x,y)=>y[1]-x[1]).slice(0,5).map(([k])=>esc(SM[k].n));
    return `<tr><td><span class="sw" style="background:${HAB[c][1]}"></span><b>${HAB[c][0]}</b></td><td class="num">${Math.round(b.ha*2.471).toLocaleString()}</td><td>${top.length?top.join(', '):'<span class="mut">nothing on our list rates well</span>'}</td></tr>`;}).join('');
  const m=pl.micro;const micro=[];
  if(pl.offset>=3)micro.push(`About ${pl.offset} days behind Antigo in spring`);else if(pl.offset<=-2)micro.push(`About ${-pl.offset} days ahead of Antigo in spring`);else micro.push('Spring arrives about when it does in Antigo');
  if(m.south>=.12)micro.push(`${Math.round(m.south*100)}% south-facing slopes: look there first in spring`);
  if(m.north>=.12)micro.push(`${Math.round(m.north*100)}% north-facing slopes: cool and late, good in hot spells`);
  if(m.cold>=.12)micro.push(`${Math.round(m.cold*100)}% low basins where frost settles`);
  if(m.wet>=.2)micro.push(`${Math.round(m.wet*100)}% wet ground: waterproof boots`);
  micro.push(m.canopy>=65?'Mostly shaded forest':m.canopy>=35?'Mix of shade and openings':'Mostly open and sunny');
  const rules=pl.rules.map(r=>`<div class="rule"><span class="badge" style="background:${OWNC[r]}">${esc(R.owners[r].name)}</span> ${esc(R.owners[r].short)}${R.owners[r].limits&&R.owners[r].limits.length?'<div class="mut">'+R.owners[r].limits.map(esc).join(' · ')+'</div>':''}</div>`).join('');
  const acc=pl.access.map((a,i)=>`<li><b>${i+1}.</b> ${esc(a.title)} <span class="mut">(${esc(a.kind)}${a.name&&a.name!=='forest road'?', '+esc(a.name):''})</span> <a href="https://www.google.com/maps/dir/?api=1&destination=${a.lat},${a.lon}" target="_blank" rel="noopener">directions</a> · <span class="mut">${a.lat.toFixed(5)}, ${a.lon.toFixed(5)}</span></li>`).join('');
  document.querySelector('#body').innerHTML=`
   <section><h2>The ground</h2><p>${pl.cover.map(c=>`${c[1]}% ${esc(c[0])}`).join(', ')}.</p><ul class="micro">${micro.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul>
   ${pl.trails.length?`<p><b>Trails:</b> ${pl.trails.map(esc).join(', ')}</p>`:''}${pl.link?`<p><a href="${pl.link}" target="_blank" rel="noopener">Official page</a></p>`:''}</section>
   ${habRows?`<section><h2>Habitats here</h2><p class="mut">Public land in this place, split by what is on the ground. Tap a colour on the map for the details of that patch.</p><table class="hab"><thead><tr><th>Habitat</th><th class="num">Acres</th><th>Best bets (you may pick these here)</th></tr></thead><tbody>${habRows}</tbody></table></section>`:''}
   <section><h2>What grows here, month by month</h2><p class="mut">Darker = ready in more of the past 35 years, adjusted for this place's slopes, shade and frost. Only items you may pick on this land are listed.</p>
   <table class="grid"><thead><tr><th></th>${MON.map(m=>`<th>${m[0]}</th>`).join('')}</tr></thead><tbody>${rows||'<tr><td colspan=13>No listed species.</td></tr>'}</tbody></table>
   ${pl.species.some(([k])=>SM[k]&&SM[k].kind==='fungus')?'<p class="warn">Mushrooms: habitat and season only. Never eat a wild mushroom unless an experienced identifier has checked it in person. Poison Control 1-800-222-1222.</p>':''}</section>
   ${pl.maps&&pl.maps.length?`<section><h2>Official trail, UTV and property maps</h2><ul class="acc">${pl.maps.map(m=>`<li>${{utv:'🛻',snow:'❄️',ski:'⛷️',foot:'🥾',bike:'🚲',horse:'🐎',all:'🗺️'}[m.k]||'🗺️'} <a href="${m.u}" target="_blank" rel="noopener">${esc(m.t)}</a></li>`).join('')}</ul><p class="mut">Published by Langlade County, the Wisconsin DNR, the Forest Service and the Ice Age Trail Alliance. Check them for closures and seasons before you go.</p></section>`:''}
   <section><h2>Rules on this land</h2>${rules}</section>
   <section><h2>Ways in</h2><ol class="acc">${acc}</ol></section>
   <section class="noprint"><p><a href="foraging/">Open the full county map</a> · <a href="foraging/guide/">Foraging guide &amp; harvest ecology</a> · <a href="foraging/places/">All places</a></p></section>`;
  // map
  const map=L.map('map',{zoomSnap:.5});map.fitBounds(pl.bounds,{padding:[20,20]});
  L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,attribution:'USGS The National Map; © OpenStreetMap contributors; WI DNR; Langlade County'}).addTo(map);
  j('layer_owners.geojson').then(g=>L.geoJSON(g,{style:f=>({color:OWNC[f.properties.r],weight:.5,fillColor:OWNC[f.properties.r],fillOpacity:.22}),interactive:false}).addTo(map).bringToBack());
  L.geoJSON(AG,{filter:f=>mem.has(f.properties.id),style:{color:'#b0502a',weight:2,fill:false,dashArray:'5 4'},interactive:false}).addTo(map);
  // habitat colours: this place's patches strong, neighbouring public land faint
  map.createPane('units');map.getPane('units').style.zIndex=390;map.getPane('units').style.pointerEvents='none';
  const W=U.size[0],H=U.size[1];let bmp;try{bmp=await createImageBitmap(UB,{colorSpaceConversion:'none',premultiplyAlpha:'none'});}catch(e){bmp=new Image();bmp.src=URL.createObjectURL(UB);await bmp.decode();}
  const cv=document.createElement('canvas');cv.width=W;cv.height=H;const cx=cv.getContext('2d',{willReadFrequently:true});cx.drawImage(bmp,0,0);const px=cx.getImageData(0,0,W,H);const d=px.data;
  const urow=new Map();for(const r of U.units)urow.set(r[C.id],r);const ids=new Uint32Array(W*H);
  for(let i=0,q=0;i<ids.length;i++,q+=4){const id=d[q+3]>127?((d[q]<<16)|(d[q+1]<<8)|d[q+2]):0;ids[i]=id;if(!id){d[q+3]=0;continue;}const r=urow.get(id);const n=parseInt(HAB[r[C.cov]][1].slice(1),16);d[q]=n>>16;d[q+1]=(n>>8)&255;d[q+2]=n&255;d[q+3]=inPl.has(id)?235:70;}
  cx.putImageData(px,0,0);L.svgOverlay(cv,U.bounds,{pane:'units',interactive:false,opacity:.8}).addTo(map);
  const M0=merc(U.bounds[0][0]),M1=merc(U.bounds[1][0]);
  map.on('click',e=>{const x=Math.floor((e.latlng.lng-U.bounds[0][1])/(U.bounds[1][1]-U.bounds[0][1])*W),y=Math.floor((M1-merc(e.latlng.lat))/(M1-M0)*H);if(x<0||y<0||x>=W||y>=H)return;const r=urow.get(ids[y*W+x]);if(!r)return;
    const rule=OWNK[r[C.own]],allow=R.owners[rule].allow;const good=[],some=[];U.species.forEach((k,i)=>{const v=r[C.lv][i];if(v==='0'||!SM[k]||!allow.includes(SM[k].cat))return;(v==='2'?good:some).push(k);});
    const when=k=>{const s=SM[k];return s.first?` <span class="mut">${esc(s.first)}–${esc(s.last)}</span>`:'';};const off=r[C.off];const a=U.access[r[C.ap1]];
    L.popup({maxWidth:290}).setLatLng(e.latlng).setContent(`<b style="font-size:14px">${HAB[r[C.cov]][0]}</b> · ${Math.round(r[C.ha]*2.471)} acres<br><span class="badge" style="background:${OWNC[rule]}">${esc(R.owners[rule].name)}</span>
     <div class="mut" style="margin:4px 0">${esc(SOILN[r[C.soil]]||'soil not mapped')} · ${esc(TERN[r[C.ter]])} · ${r[C.canopy]}% tree cover · ${off>=3?off+' days behind town in spring':off<=-2?(-off)+' days ahead of town':'spring on time with town'}</div>
     ${good.length?'<b>Good spot for:</b> '+good.map(k=>esc(SM[k].n)+when(k)).join('; '):''}${some.length?'<div class="mut">Possible: '+some.map(k=>esc(SM[k].n)).join(', ')+'</div>':''}${!good.length&&!some.length?'<span class="mut">Nothing on our list rates well here.</span>':''}
     ${good.concat(some).some(k=>SM[k].kind==='fungus')?'<div class="fx" style="margin-top:4px">Mushrooms: expert ID in person only.</div>':''}
     ${a?`<div style="margin-top:4px">Nearest way in: <a href="https://www.google.com/maps/dir/?api=1&destination=${a[1]},${a[0]}" target="_blank" rel="noopener">${esc(a[3]&&a[3]!=='forest road'?a[3]:'forest road pull-off')}</a> (${(r[C.d1]/1609).toFixed(1)} mi)</div>`:''}`).openOn(map);});
  j('layer_foot.geojson').then(g=>L.geoJSON(g,{style:{color:'#b0502a',weight:3},onEachFeature:(f,l)=>l.bindTooltip(esc(f.properties.n))}).addTo(map));
  const RC={fr_open:'#5a3d1e',fr_closed:'#8a7a66',logging:'#8a5a2b',firelane:'#c0392b'},RN={fr_open:'Forest road, open to vehicles',fr_closed:'Forest road, closed to vehicles',logging:'Logging road / two-track',firelane:'Fire lane'};
  j('layer_roads.geojson').then(g=>L.geoJSON(g,{style:f=>({color:RC[f.properties.k],weight:f.properties.k==='fr_open'?2.5:1.8,dashArray:f.properties.k==='fr_open'?null:'5 4',opacity:.9}),onEachFeature:(f,l)=>l.bindTooltip(`<b>${esc(f.properties.n||RN[f.properties.k])}</b><br>${esc(RN[f.properties.k])}${f.properties.s?'<br>'+esc(f.properties.s):''}`)}).addTo(map));
  j('layer_utv.geojson').then(g=>L.geoJSON(g,{filter:f=>f.properties.k!=='road route',style:f=>({color:'#7a3e9d',weight:3,opacity:.85}),onEachFeature:(f,l)=>l.bindTooltip('ATV/UTV '+esc(f.properties.k)+(f.properties.n?': '+esc(f.properties.n):''))}).addTo(map));
  const key=L.control({position:'bottomleft'});key.onAdd=()=>{const d=L.DomUtil.create('div','');d.style.cssText='background:#fffffff0;padding:5px 8px;border-radius:6px;font-size:12px;line-height:1.5;box-shadow:0 1px 4px #0003';
   const used=Object.keys(byCov).filter(c=>byCov[c].ha*2.471>=5).sort((a,b)=>byCov[b].ha-byCov[a].ha);
   d.innerHTML=used.map(c=>`<div><span style="display:inline-block;width:11px;height:11px;border-radius:2px;background:${HAB[c][1]};vertical-align:-1px"></span> ${HAB[c][0]}</div>`).join('')+'<div style="border-top:1px solid #ddd;margin:3px 0"></div><div><span style="display:inline-block;width:18px;border-top:3px solid #b0502a;vertical-align:middle"></span> Hiking trail</div><div><span style="display:inline-block;width:18px;border-top:3px solid #7a3e9d;vertical-align:middle"></span> ATV/UTV trail or forest road</div><div><span style="display:inline-block;width:18px;border-top:2.5px solid #5a3d1e;vertical-align:middle"></span> Forest road, open</div><div><span style="display:inline-block;width:18px;border-top:2px dashed #8a5a2b;vertical-align:middle"></span> Logging road / two-track</div><div><span style="display:inline-block;width:18px;border-top:5px solid #0b7fa6;vertical-align:middle"></span> River, public bank</div>';return d;};key.addTo(map);
  j('layer_paddle.geojson').then(g=>L.geoJSON(g,{style:f=>f.properties.pub?{color:'#0b7fa6',weight:5}:{color:'#6fb6d1',weight:2}}).addTo(map));
  pl.access.forEach((a,i)=>L.marker([a.lat,a.lon],{icon:L.divIcon({className:'',html:`<div class="pin">${i+1}</div>`,iconSize:[22,22]})}).bindTooltip(esc(a.title)).addTo(map));
});
})();
