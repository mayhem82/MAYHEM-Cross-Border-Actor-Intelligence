(function globe(){
const locations={AU:['Australia','Oceania',134,-25],US:['United States','North America',-100,38],CO:['Colombia','South America',-74,5],MY:['Malaysia','Asia',102,4],CL:['Chile','South America',-71,-30],ZA:['South Africa','Africa',25,-29],PS:['Palestine','Asia',35,32],BE:['Belgium','Europe',4.6,50.7],IE:['Ireland','Europe',-8,53.3],FR:['France','Europe',2.4,46.7],DE:['Germany','Europe',10.4,51.1],GR:['Greece','Europe',22.8,39.2],IT:['Italy','Europe',12.8,43]};
const xy=(lon,lat)=>[495+lon*2.72*Math.sqrt(1-.75*(lat/90)**2),(84-lat)*3.14];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const places=Object.fromEntries(Object.entries(locations).map(([code,[name,region,lon,lat]])=>[code,{name,region,point:xy(lon,lat)}]));
window.worldPlaces=places;
window.worldMapGraphic=function(layer,hero,connections,records){
 const overview=layer==='coverage', regional=layer==='historical';
 const edges=connections.filter(c=>c.layer===layer&&places[c.from]&&places[c.to]);
 const codes=[...new Set(overview?records.flatMap(r=>r.countries||[]).filter(code=>places[code]):edges.flatMap(e=>[e.from,e.to]))];
 const labelCodes=hero?['US','CL','ZA','AU','MY']:overview?['US','CO','CL','ZA','AU','MY','PS']:codes;
 const vb=regional?'475 70 140 100':'0 4 994 449', id=hero?'heroWorld':'fullWorld',unit=regional?.24:1;
 const routes=edges.map(r=>{const [x1,y1]=places[r.from].point,[x2,y2]=places[r.to].point;const d=`M${x1},${y1} Q${(x1+x2)/2} ${Math.min(y1,y2)-Math.min(110,Math.max(3,Math.abs(x2-x1)*.26))} ${x2},${y2}`;return `<a href="#record/${encodeURIComponent(r.id)}" aria-label="${esc(r.title)}"><title>${esc(r.title)}</title><path d="${d}" fill="none" stroke="transparent" stroke-width="${16*unit}"/><path class="routeLine" d="${d}" style="stroke-width:${1.8*unit}" ${regional?'stroke-dasharray="1 .8"':''}/></a>`;}).join('');
 const pins=codes.map(c=>{const p=places[c],[x,y]=p.point;return `<a href="#country/${c}" aria-label="${esc(p.name)}"><title>${esc(p.name)}</title><g transform="translate(${x} ${y}) scale(${unit})"><circle r="11" fill="transparent"/><circle r="7" fill="#ea946a" fill-opacity=".2" stroke="#d8976e" stroke-width=".9"/><circle r="3.1" fill="#ffc69b"/>${labelCodes.includes(c)?`<text x="${c==='CL'?-10:9}" y="${c==='ZA'?19:-7}" text-anchor="${c==='CL'?'end':'start'}" style="font-size:${hero?17:14}px">${esc(p.name)}</text>`:''}</g></a>`;}).join('');
 return `<svg class="geo" viewBox="${vb}" role="group" aria-label="World map of ${overview?'countries with published evidence':'documented relationships'}"><defs><pattern id="d${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="4" fill="#3d5149"/><circle cx="1.5" cy="1.5" r=".65" fill="#77877b"/></pattern><pattern id="g${id}" width="68" height="55" patternUnits="userSpaceOnUse"><path d="M68 0H0V55" fill="none" stroke="#809688" stroke-width=".6" opacity=".4"/></pattern></defs><rect width="1000" height="545" fill="#1c2d29"/><g fill="url(#d${id})" stroke="#7f8f84" stroke-width="${regional?.25:.65}">${window.worldLand.map(([,d])=>`<path d="${d}"/>`).join('')}</g><rect width="1000" height="545" fill="url(#g${id})"/>${routes}${pins}</svg>`;
};
})();
