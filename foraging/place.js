"use strict";
// Shared renderer for the per-place foraging maps: foraging/places/<slug>/ sets window.PLACE before loading this file.
(function(){
const D='foraging/data/';
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const OWNC={county:'#2f7d3a',state:'#2a6db0',sna:'#6a4fb0',federal:'#8a6a20',bcpl:'#b07a2a',mfl_open:'#9aa0a0',mfl_closed:'#c9c2b4',private:'#c9c2b4',other_public:'#7d8a97',tribal:'#b26f6f'};
const KIND={county:'Langlade County Forest',state:'State land (DNR)',sna:'State Natural Area',federal:'Chequamegon-Nicolet National Forest',trail:'Trail corridor'};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const j=u=>fetch(D+u).then(r=>r.json());
Promise.all([j('places.json'),j('areas.json'),j('species.json'),j('rules.json'),j('areas.geojson')]).then(([P,A,S,R,AG])=>{
  const pl=P.find(p=>p.slug===window.PLACE);if(!pl){document.querySelector('#body').innerHTML='<p>Place not found. <a href="foraging/places/">All places</a></p>';return;}
  const AM={};A.forEach(a=>AM[a.id]=a);const SM={};S.forEach(s=>SM[s.k]=s);const mem=new Set(pl.members);
  document.title=pl.name+' foraging map | The Blessed Fig Tree, Antigo';
  document.querySelector('#title').textContent=pl.name;
  document.querySelector('#sub').textContent=`${KIND[pl.kind]||''} · ${pl.acres.toLocaleString()} acres of public land in ${pl.members.length} access area${pl.members.length>1?'s':''} · ${pl.elev[0]}–${pl.elev[1]} ft`;
  // month grid: share of past years in season, per month, shifted by the place's microclimate offset
  const sh=Math.round((pl.offset||0)/7);
  const month=(s,m)=>{if(!s.weeks)return 0;let mx=0;for(let w=0;w<52;w++){const d=new Date(2026,0,1+w*7);if(d.getMonth()!==m)continue;const i=w-sh;const v=(i>=0&&i<52)?s.weeks[i]:0;mx=Math.max(mx,v);}return mx;};
  const rows=pl.species.filter(([k])=>SM[k]).map(([k,lvl])=>{const s=SM[k];return `<tr><td><b>${esc(s.n)}</b>${s.kind==='fungus'?' <span class="fx">expert ID only</span>':''}<div class="mut">${lvl===2?'good habitat':'some habitat'} · ${esc(s.part||'')}</div></td>${MON.map((m,i)=>{const v=month(s,i);return `<td class="mc" style="background:${v>0.05?`rgba(61,107,79,${.15+.85*v})`:'transparent'}" title="${m}: ${Math.round(v*100)}% of years"></td>`}).join('')}</tr>`;}).join('');
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
   <section><h2>What grows here, month by month</h2><p class="mut">Darker = ready in more of the past 35 years, adjusted for this place's slopes, shade and frost. Only items you may pick on this land are listed.</p>
   <table class="grid"><thead><tr><th></th>${MON.map(m=>`<th>${m[0]}</th>`).join('')}</tr></thead><tbody>${rows||'<tr><td colspan=13>No listed species.</td></tr>'}</tbody></table>
   ${pl.species.some(([k])=>SM[k]&&SM[k].kind==='fungus')?'<p class="warn">Mushrooms: habitat and season only. Never eat a wild mushroom unless an experienced identifier has checked it in person. Poison Control 1-800-222-1222.</p>':''}</section>
   <section><h2>Rules on this land</h2>${rules}</section>
   <section><h2>Ways in</h2><ol class="acc">${acc}</ol></section>
   <section class="noprint"><p><a href="foraging/">Open the full county map</a> · <a href="foraging/guide/">Foraging guide &amp; harvest ecology</a> · <a href="foraging/places/">All places</a></p></section>`;
  // map
  const map=L.map('map',{zoomSnap:.5});map.fitBounds(pl.bounds,{padding:[20,20]});
  L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,attribution:'USGS The National Map; © OpenStreetMap contributors; WI DNR; Langlade County'}).addTo(map);
  j('layer_owners.geojson').then(g=>L.geoJSON(g,{style:f=>({color:OWNC[f.properties.r],weight:.5,fillColor:OWNC[f.properties.r],fillOpacity:.22}),interactive:false}).addTo(map).bringToBack());
  L.geoJSON(AG,{filter:f=>mem.has(f.properties.id),style:{color:'#b0502a',weight:2.5,fillColor:'#3d6b4f',fillOpacity:.25},
    onEachFeature:(f,l)=>l.bindTooltip(esc(AM[f.properties.id].title))}).addTo(map);
  j('layer_foot.geojson').then(g=>L.geoJSON(g,{style:{color:'#b0502a',weight:3},onEachFeature:(f,l)=>l.bindTooltip(esc(f.properties.n))}).addTo(map));
  j('layer_paddle.geojson').then(g=>L.geoJSON(g,{style:f=>f.properties.pub?{color:'#0b7fa6',weight:5}:{color:'#6fb6d1',weight:2}}).addTo(map));
  pl.access.forEach((a,i)=>L.marker([a.lat,a.lon],{icon:L.divIcon({className:'',html:`<div class="pin">${i+1}</div>`,iconSize:[22,22]})}).bindTooltip(esc(a.title)).addTo(map));
});
})();
