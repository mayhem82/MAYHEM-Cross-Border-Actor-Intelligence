(function app(){
'use strict';
const $ = selector => document.querySelector(selector);
const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const icons = {
 dashboard:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
 network:'<circle cx="5" cy="12" r="3"/><circle cx="18" cy="5" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8 11 7-5M8 13l7 5"/>',
 org:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2c0-6 12-6 12 0v2M16 5a3 3 0 0 1 0 6m2 3c2 .5 3 2 3 5"/>',
 scale:'<path d="M12 3v17M6 21h12M3 7l9-2 9 2M5 7l-3 7h6L5 7Zm14 0-3 7h6l-3-7Z"/>',
 timeline:'<path d="M5 3v18M10 5h9M10 12h6M10 19h9"/><circle cx="5" cy="5" r="1.4"/><circle cx="5" cy="12" r="1.4"/><circle cx="5" cy="19" r="1.4"/>',
 analysis:'<path d="M3 19h18M5 15l4-7 4 5 6-9"/><circle cx="19" cy="4" r="1.3"/>',
 archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
 check:'<path d="m6 12 4 4 8-9"/><circle cx="12" cy="12" r="9"/>',
 source:'<path d="M5 3h9l5 5v13H5zM14 3v6h5M8 13h8m-8 4h6"/>',
 method:'<path d="m12 4 8 3v5c0 4-4 7-8 9-4-2-8-5-8-9V7l8-3Z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
 search:'<circle cx="10" cy="10" r="6.5"/><path d="m15 15 5 5"/>',
 menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',
 globe:'<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
 chevron:'<path d="m9 6 6 6-6 6"/>', book:'<path d="M3 5c4-1 7 0 9 2 2-2 5-3 9-2v14c-4-1-7 0-9 2-2-2-5-3-9-2ZM12 7v14"/>',
 question:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.7 2.7 0 1 1 4.2 2.3c-1.3.8-1.7 1.2-1.7 2.7m0 2.5v.5"/>',
 folder:'<path d="M3 6h7l2 3h9v11H3z"/>', filter:'<path d="M3 6h18M6 12h12M9 18h6"/>',
 ext:'<path d="M14 4h6v6m0-6-10 10M10 5H5v15h15v-6"/>', layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-8 10 8 5 8-5M4 17l8 5 8-5"/>'
};
function icon(key,size=18){return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key]||icons.source}</svg>`;}
const pages = {
 dashboard:['Dashboard','dashboard'], actors:['Individual actors','org','People documented in public records, with the conduct and procedural outcome identified for each individual.'], organisations:['Organisation register','org','Named organisations, their declared objectives, governance and documented activities.'],
 atlas:['Pattern Explorer','layers','Explore the evidence connecting records across the investigation.'],
 network:['Network map','network','Explore documented relationships across borders. Select a layer to see its evidence and time period.'],
 judicial:['Judicial register','scale','Arrest and court records by proceeding. Read each disposition alongside the conduct and count it concerns.'],
 timeline:['Incident timeline','timeline','The current record spans 1986–2026. Demonstrations, organisational developments and judicial decisions appear in date order.'],
 analyses:['Documented playbooks','analysis','Case studies of observed actions and stated intentions, with supporting evidence, alternative explanations and unresolved questions.'],
 sources:['Evidence archive','archive','Inspect the source, preserved quotation, date and classification behind each record.'],
 method:['Methodology','method'],findings:['Findings','check','Source-backed findings with their evidentiary limits.'],
 questions:['Unresolved questions','question','Open questions and the records needed to resolve them.'],
 investigations:['Active investigations','folder','Open lines of inquiry and the evidence reviewed so far.']
};
const navGroups = [['Investigation',['dashboard','network','atlas','timeline']],['Registers',['organisations','actors','judicial','sources']],['Research',['analyses','method']]];
const categoryPages = {actors:'actors',organisations:'organisations',connections:'network',findings:'findings',events:'timeline',analyses:'analyses',questions:'questions',investigations:'investigations',judicial:'judicial',sources:'sources'};
const data = {}, records = new Map();
for(const key of Object.keys(categoryPages)){
 data[key]=[...(window.civic[key]||[]),...(window.cases[key]||[]),...(window.globalRecords[key]||[]),...(window.batchA[key]||[]),...(window.batchB[key]||[])].map(entry => {
  const row = {...entry};
  for (const [field, translated] of Object.entries(window.translations[entry.id] || {})) {
   if (row[field]) row[field] += ' [' + translated + ']';
  }
  return row;
 });
 for(const row of data[key]) records.set(row.id,{...row,section:categoryPages[key],category:key});
}
const capture = window.preservation || {};
const latestRecorded = Object.values(capture).map(entry => entry.recorded).filter(Boolean).sort().at(-1);

function fmtDate(s,short=false){
 if(!s)return 'Undated';
 if(s.length===4)return s;
 const monthOnly=s.length===7;
 const date=new Date(s+(monthOnly?'-01':'')+'T00:00:00Z');
 const options={month:short?'short':'long',year:'numeric',timeZone:'UTC'};
 if(!monthOnly)options.day='numeric';
 return new Intl.DateTimeFormat('en-GB',options).format(date);
}
const link = row => `#record/${encodeURIComponent(row.id)}`;
const typeOf = row => row.kind || row.type || '';
const meta = row => [row.country||row.publisher, row.date ? fmtDate(row.date,true) : ''].filter(Boolean).map(safe).join(' <span class="sep">·</span> ');
const tag = (word,style='') => `<span class="tag ${style}">${safe(word)}</span>`;
const node = $('#content');
let currentAtlas = 'EV-105';
let currentView = '', currentLayer = 'coverage', sectionFilter = '', localQuery = '';
const searchDialog = $('#lookup');
$('#menu').innerHTML=icon('menu',22);
$('#openSearch').innerHTML=icon('search',17)+'<span>Search records</span><kbd>/</kbd>';
$('#nav').innerHTML=navGroups.map(([name,sections])=>`<div class="navGroup"><p>${name}</p>${sections.map(id=>`<a href="#${id}" data-page="${id}">${icon(pages[id][1])}<span>${pages[id][0]}</span></a>`).join('')}</div>`).join('');
function recordCountries(row){
 const names=(row.country||'').split(/\s*·\s*/);
 return [...new Set([...(row.countries||[]),row.from,row.to,...Object.entries(window.worldPlaces).filter(([,place])=>names.includes(place.name)).map(([code])=>code)].filter(Boolean))];
}
function mapGraphic(layer,hero=false){return window.worldMapGraphic(layer,hero,data.connections,[...records.values()].filter(r=>r.category!=='sources').map(r=>({...r,countries:recordCountries(r)})));}
function countryBrowse(code){
 const place=window.worldPlaces[code];
 const entries=[...records.values()].filter(row=>recordCountries(row).includes(code));
 return `<div class="detailTop"><a class="back" href="#network">‹ &nbsp; Network map</a><div class="kicker">${icon('globe',16)}${safe(place.region)}</div><h1>${safe(place.name)}</h1><p>Published records associated with this country or territory.</p></div><div class="countryGroups">${Object.entries(categoryPages).filter(([key])=>entries.some(r=>r.category===key)).map(([key,page])=>`<section class="panel"><div class="panelHead"><h2>${safe(key==='connections'?'Cross-border relationships':pages[page][0])}</h2></div>${entries.filter(r=>r.category===key).map(compactRow).join('')}</section>`).join('')}</div>`;
}
function dashStat(title,value,page,ic,color){return `<a class="stat" href="#${page}"><div class="statTitle"><span class="tileIcon ${color}">${icon(ic,17)}</span><span>${title}</span></div><strong>${value}</strong></a>`;}
function panelHead(title,page,text){return `<div class="panelHead"><h2>${title}</h2><a href="#${page}">${text||'View all'}</a></div>`;}
function findRow(row){
 return `<a href="${link(row)}" class="findRow"><div class="rowCaption">${tag(row.kind||'Fact','green')}<span>${safe(row.id)}</span></div><h3>${safe(row.title)}</h3><p>${meta(row)}</p></a>`;
}
const byDate = rows => [...rows].sort((a,b)=>(b.date||'').localeCompare(a.date||'')||a.id.localeCompare(b.id));
function timelineRow(row){
 return `<a class="timelineItem" href="${link(row)}"><span class="timeMark"></span><time>${safe(fmtDate(row.date,true))}</time><strong>${safe(row.title)}</strong><small>${safe(row.country)}</small></a>`;
}
function dashboard(){
 const lead=[data.findings.find(r=>r.countries?.includes('AU')||r.country==='Australia'),data.findings.find(r=>r.country?.includes('Germany')),data.findings.find(r=>r.sources.some(s=>s.startsWith('EV-0'))),...data.findings].filter((r,i,all)=>r && all.findIndex(x=>x?.id===r.id)===i).slice(0,3);
 return `<section class="hero"><div class="heroMap">${mapGraphic('coverage',true)}</div><div class="heroText"><div class="heroKicker"><span></span>Worldwide investigation</div><h1>Cross-border<br>protest networks</h1><p>Evidence-led analysis of protest movements, cross-border affiliations and judicial records worldwide.</p><a class="heroButton" href="#network">${icon('network',16)}Explore network map</a></div><div class="mapLegend"><i></i>Documented locations</div></section>
 <div class="overviewLine"><h2>Investigation overview</h2>${latestRecorded ? `<span>Archive updated ${fmtDate(latestRecorded)}</span>` : ''}</div>
 <div class="stats">${dashStat('Verified findings',data.findings.filter(r=>/^fact$/i.test(r.kind)).length,'findings','check','green')}${dashStat('Organisations',data.organisations.length,'organisations','org','blue')}${dashStat('Judicial cases',new Set(data.judicial.map(r=>r.caseId)).size,'judicial','scale','amber')}${dashStat('Evidence records',data.sources.length,'sources','archive','purple')}</div>
 <div class="dashGrid"><section class="panel">${panelHead('Selected findings','findings','All findings')}${lead.map(findRow).join('')}</section><section class="panel">${panelHead('Incident timeline','timeline','Full timeline')}<div class="miniTimeline">${byDate(data.events).slice(0,3).map(timelineRow).join('')}</div></section></div>
 <div class="dashGrid lowerGrid"><section class="panel">${panelHead('Active investigations','investigations')}${data.investigations.map(compactRow).join('')}</section><section class="panel">${panelHead('Unresolved questions','questions')}${data.questions.slice(0,3).map(compactRow).join('')}</section></div>`;
}
function compactRow(row){return `<a class="compact" href="${link(row)}"><small>${safe(row.id)} · ${safe(typeOf(row))}</small><strong>${safe(row.title)}</strong></a>`;}
function titleBlock(section){const p=pages[section];return `<div class="pageIntro"><div class="kicker">${icon(p[1],16)}Worldwide investigation</div><h1>${p[0]}</h1><p>${p[2]||''}</p></div>`;}
function listRows(section){
 let rows=data[Object.keys(categoryPages).find(k=>categoryPages[k]===section)]||[];
 return section==='timeline'||section==='judicial'?byDate(rows):rows;
}
function searchText(row){return [row.id,row.title,row.summary,row.kind,row.stage,row.short,row.country,...recordCountries(row).flatMap(code=>[window.worldPlaces[code]?.name,window.worldPlaces[code]?.region]),row.date,row.publisher,row.type,row.locator,row.quote,row.context,...Object.values(row.footage||{}),...(row.sources||[]),...(row.notes||[]).map(n=>n.text)].filter(Boolean).join(' ').toLowerCase();}
function listItems(section){
 const list=listRows(section).filter(r=>(!sectionFilter || (section==='judicial'?r.stage:typeOf(r))===sectionFilter)&&searchText(r).includes(localQuery.toLowerCase()));
 return `<p class="countLine" role="status">${list.length} ${list.length===1?'record':'records'}</p>${list.length ? `<div class="${section==='timeline'?'longTimeline':'recordList'}">${list.map(row=>section==='timeline'?timelineRow(row):`<a class="listCard" href="${link(row)}"><div class="listIcon">${icon(pages[section][1],22)}</div><div><div class="rowCaption"><span>${safe(row.id)}</span>${tag(section==='judicial'?row.stage:typeOf(row),row.kind==='Fact'?'green':'')}</div><h2>${safe(row.title)}</h2><p>${safe(row.summary||row.context)}</p><small>${meta(row)}</small></div>${icon('chevron',16)}</a>`).join('')}</div>`:`<div class="empty">No matching records. <button data-reset>Clear filters</button></div>`}`;
}
function listing(section){
 const choices=[...new Set(listRows(section).map(r=>section==='judicial'?r.stage:typeOf(r)).filter(Boolean))];
 if(section==='judicial')for(const c of ['Arrest','Charge','Conviction','Acquittal','Repeat offender'])if(!choices.includes(c))choices.push(c);
 return `${titleBlock(section)}<div class="tools"><label class="fieldSearch">${icon('search')}<input id="localQuery" type="search" placeholder="Filter records" aria-label="Filter these records"></label><label class="selectBox">${icon('filter')}<select aria-label="Filter by record type" id="kindFilter"><option value="">All ${section==='judicial'?'stages':'types'}</option>${choices.map(c=>`<option>${safe(c)}</option>`).join('')}</select></label></div><div id="listArea">${listItems(section)}</div>`;
}
function network(){
 const layers={coverage:'Country coverage',membership:'Declared affiliations',cosignature:'Co-signatures',campaign:'Campaign support',historical:'Historical accounts'};
 const entries=[...records.values()].filter(r=>r.category!=='sources');
 const active=Object.entries(window.worldPlaces).filter(([code])=>entries.some(row=>recordCountries(row).includes(code)));
 const regions=['Africa','Asia','Europe','North America','South America','Oceania'];
 const groups=regions.map(region=>{const places=active.filter(([,place])=>place.region===region).sort((a,b)=>a[1].name.localeCompare(b[1].name));return `<div class="countryRow"><h3>${region}</h3><div>${places.map(([code,place])=>`<a href="#country/${code}">${safe(place.name)}</a>`).join('')||'<span>No records in this edition</span>'}</div></div>`;}).join('');
 const list=currentLayer==='coverage'?`<section class="panel connectionPanel"><div class="panelHead"><h2>Browse by region</h2><span class="rowCaption">${active.length} countries and territories</span></div>${groups}</section>`:`<section class="panel connectionPanel"><div class="panelHead"><h2>${layers[currentLayer]}</h2></div>${data.connections.filter(r=>r.layer===currentLayer).map(compactRow).join('')}</section>`;
 return `${titleBlock('network')}<div role="group" aria-label="Map layer" class="switcher">${Object.entries(layers).map(([key,label])=>`<button data-layer="${key}" aria-pressed="${key===currentLayer}">${label}</button>`).join('')}</div>
 <div class="mapPanel">${mapGraphic(currentLayer)}<div class="mapLegend"><i></i>${layers[currentLayer]}</div></div><div class="mapNote"><span>${currentLayer==='coverage'?'Select a country or territory to read its records. Unmarked areas have no indexed entry in this edition.':'Each line represents the relationship described by the selected evidence layer.'}</span><a href="https://www.naturalearthdata.com/about/terms-of-use/">Natural Earth</a></div>${list}`;
}
function lattice(){
 const sources=[...data.sources].sort((a,b)=>a.id.localeCompare(b.id));
 const source=records.get(currentAtlas) || sources.find(row=>row.id==='EV-105') || sources[0];
 if(!source)return `${titleBlock('atlas')}<div class="empty">No evidence records are available.</div>`;
 const linked=[...records.values()].filter(row=>row.sources?.includes(source.id)).sort((a,b)=>a.category.localeCompare(b.category)||a.title.localeCompare(b.title));
 const height=Math.max(160,linked.length*58+40);
 const trunc=s=>s.length>48?s.slice(0,45)+'…':s;
 const branches=linked.map((row,i)=>{const y=50+i*58;return `<path d="M225 ${height/2} C310 ${height/2} 300 ${y} 370 ${y}" class="atlasLine"/><a href="${link(row)}"><rect x="370" y="${y-20}" width="390" height="42" rx="6" class="atlasNode"/><text x="383" y="${y-2}" class="atlasType">${safe(pages[row.section][0])} · ${safe(row.id)}</text><text x="383" y="${y+14}" class="atlasTitle">${safe(trunc(row.title))}</text><title>${safe(row.title)}</title></a>`;}).join('');
 return `${titleBlock('atlas')}<div class="tools"><label for="atlasSource">Evidence source</label><label class="selectBox"><select id="atlasSource" aria-label="Evidence source">${sources.map(row=>`<option value="${safe(row.id)}" ${row.id===source.id?'selected':''}>${safe(row.id+' · '+row.title)}</option>`).join('')}</select></label></div><p class="atlasHelp">Lines show records that cite the selected source. Open a record to inspect what the evidence supports.</p><div class="atlasViewport"><svg viewBox="0 0 785 ${height}" role="img" aria-label="Evidence ${safe(source.id)} and ${linked.length} citing records"><rect x="15" y="${height/2-26}" width="210" height="52" rx="6" class="atlasSource"/><a href="${link(source)}"><text x="27" y="${height/2-5}" class="atlasSourceId">${safe(source.id)} · Evidence</text><text x="27" y="${height/2+14}" class="atlasSourceText">${safe(source.title.length>26?source.title.slice(0,25)+'…':source.title)}</text><title>${safe(source.title)}</title></a>${branches}</svg></div><section class="panel atlasRecords"><div class="panelHead"><h2>Records citing ${safe(source.id)}</h2><a href="${link(source)}">Open evidence</a></div>${linked.length?linked.map(compactRow).join(''):'<p class="empty">No records cite this source yet.</p>'}</section>`;
}
function methodology(){
 return `<div class="pageIntro"><div class="kicker">${icon('method',16)}Research</div><h1>Evidence methodology</h1><p>How the investigation records a claim, tests competing explanations and preserves the material behind it.</p></div><section class="reading panel">
 <h2>Scope and attribution</h2><p>This investigation covers socialist, communist, far-left and anarchist movements and relevant anti-Israel and Palestine solidarity mobilisation worldwide. The register starts with sourced records from Africa, Asia, Europe, North America, South America and Oceania. Country coverage grows as records are verified. Right-wing movements are outside its scope. Inclusion records the activity described in a source. Any finding of criminality, extremism or hatred requires specific evidence about the actor and conduct concerned.</p>
 <h2>Factualism</h2><dl><dt>Fact</dt><dd>A directly supported proposition. An organisation’s declaration establishes what it said. A judgment establishes what the court decided on specific counts.</dd><dt>Inference</dt><dd>An interpretation drawn from cited facts. Each analysis states the limits of that interpretation and considers alternatives.</dd><dt>Unknown</dt><dd>A question the available records leave open. The register identifies the evidence needed to resolve it.</dd></dl>
 <h2>Evidence preservation</h2><p>Each source has a stable identifier, authority, source date, locator, short quotation and recording date. The archive identifies the preserved material and its SHA-256 checksum. A full-document capture and an excerpt have different evidentiary reach.</p>
 <h2>Footage and conflicting reports</h2><p>Compare original recordings, independent journalists, witnesses, institutional records and news reports. Record who published each clip, its claimed recording time and location, the relevant timecode and whether those details have been independently verified. Preserve the original material or a capture record where available. Describe the visible conduct and its limits, including editing, missing context and what happened outside the frame.</p><p>Record different accounts side by side, with sources and time periods. A peaceful ending describes the ending. Assess earlier conduct separately and attribute acts to those the evidence identifies.</p>
 <h2>Considering explanations</h2><p>For each question, consider explanations that fit the record, evidence that weighs against each, and the material needed to decide between them. A shared date, public slogan or campaign objective alone leaves central direction unresolved. Judicial findings are confined to their case.</p><p>This edition remains open for evidence intake. Its behavioural entries are working interpretations.</p>
 <h2>Discrepancies and corrections</h2><p>Keep source accounts in their original terms. Attribute attendance estimates and distinguish an estimate from an independently verified count. A correction receives a new evidence ID and references the earlier entry. The source files and revision history are public.</p></section>`;
}
function sourceDetail(row){
 const archive=capture[row.id];
 const footage=row.footage;
 const footageDetails=footage ? `<h2>Footage details</h2><dl><dt>Creator</dt><dd>${safe(footage.creator || 'Unknown')}</dd><dt>Recording date and time</dt><dd>${safe(footage.recorded || 'Unknown')}</dd><dt>Location</dt><dd>${safe(footage.location || 'Unknown')}</dd><dt>Relevant timecode</dt><dd>${safe(footage.timecode || 'Not specified')}</dd><dt>Verification</dt><dd>${safe(footage.verification || 'Not independently verified')}</dd><dt>Recording context</dt><dd>${safe(footage.context || 'Unknown')}</dd></dl>` : '';
 return `<div class="detailCols"><section class="panel reading"><h2>Preserved quotation</h2><blockquote>${safe(row.quote)}</blockquote><p class="sourceLoc">${safe(row.locator)}</p><h2>What the source establishes</h2><p>${safe(row.context)}</p>${footageDetails}<a class="primaryLink" href="${safe(row.url)}">Open original source ${icon('ext',15)}</a></section><aside class="panel reading factsBox"><h2>Archive record</h2><dl><dt>Source authority</dt><dd>${safe(row.publisher)}</dd><dt>Source date</dt><dd>${fmtDate(row.date)}</dd><dt>Recorded</dt><dd>${archive?.recorded ? fmtDate(archive.recorded) : 'Unknown'}</dd><dt>Evidence class</dt><dd>${safe(row.type)}</dd>${archive?`<dt>Preservation</dt><dd>${safe(archive.label)}</dd><dt>Local copy</dt><dd><a href="./${safe(archive.path)}">Open preserved ${archive.format==='pdf'?'document':'excerpt'}</a></dd><dt>Excerpt SHA-256</dt><dd class="hash">${safe(archive.sha256)}</dd>${archive.originalSha256?`<dt>Original source capture</dt><dd>${safe(archive.originalFormat.toUpperCase())} · ${safe(archive.originalBytes.toLocaleString())} bytes · ${safe(archive.retrieved.slice(0,10))}</dd><dt>Original SHA-256</dt><dd class="hash">${safe(archive.originalSha256)}</dd>${archive.documentPath?`<dd><a href="./${safe(archive.documentPath)}">Open preserved PDF</a></dd>`:""}`:`<dt>Original source capture</dt><dd>${safe(archive.captureNote)}</dd>`}`:''}</dl></aside></div><section class="panel related"><div class="panelHead"><h2>Records citing this source</h2></div>${[...records.values()].filter(r=>r.sources?.includes(row.id)).map(compactRow).join('')}</section>`;
}
function detail(row){
 const source=row.category==='sources';
 return `<div class="detailTop"><a class="back" href="#${row.section}">‹ &nbsp; ${pages[row.section][0]}</a><div class="rowCaption">${tag(typeOf(row),row.kind==='Fact'?'green':'')}<span>${safe(row.id)}</span></div><h1>${safe(row.title)}</h1>${row.summary?`<p>${safe(row.summary)}</p>`:''}<small>${meta(row)}</small></div>${source?sourceDetail(row):`<div class="detailCols"><section class="panel reading"><h2>Record details</h2>${(row.notes||[]).map(n=>`<h3>${safe(n.label)}</h3><p>${safe(n.text)}</p>`).join('')}${row.caseId?`<h3>Proceeding</h3><p>${safe(row.caseId)} · ${safe(row.stage)}</p>`:''}</section><aside class="panel"><div class="panelHead"><h2>Supporting evidence</h2></div>${row.sources.map(id=>records.get(id)).filter(Boolean).map(s=>`<a class="compact" href="${link(s)}"><small>${safe(s.id)} · ${safe(s.type)}</small><strong>${safe(s.title)}</strong><span>${safe(s.publisher)}</span></a>`).join('')}</aside></div>`}`;
}
function closeMenu(){document.body.classList.remove('menuOpen');$('#menu').setAttribute('aria-expanded','false');$('#scrim').hidden=true;}
function render(focus=false){
 const route=location.hash.slice(1)||'dashboard';
 const row=route.startsWith('record/')?records.get(route.slice(7)):null;
 const atlasId=route.startsWith('atlas/')?route.slice(6):'';
 if(atlasId && records.get(atlasId)?.category==='sources')currentAtlas=atlasId;
 const code=route.startsWith('country/')?route.slice(8):'';
 const country=Object.hasOwn(window.worldPlaces,code)?window.worldPlaces[code]:null;
 currentView=country?'network':atlasId?'atlas':row?row.section:route;
 closeMenu();
 sectionFilter=''; localQuery='';
 const valid=Object.hasOwn(pages,currentView);
 const label=valid?pages[currentView][0]:'Record unavailable';
 $('#breadcrumb').textContent=label;
 document.title=(country?country.name:row?row.title:label)+' · Cross-Border Protest Networks';
 document.querySelectorAll('[data-page]').forEach(a=>{if(a.dataset.page===currentView||a.dataset.page==='dashboard'&&['questions','investigations','findings'].includes(currentView))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 node.innerHTML=country?countryBrowse(code):row?detail(row):!valid?'<div class="pageIntro"><h1>Record unavailable</h1><p>This link does not identify a published record.</p><a href="#dashboard">Return to dashboard</a></div>':currentView==='dashboard'?dashboard():currentView==='network'?network():currentView==='atlas'?lattice():currentView==='method'?methodology():listing(currentView);
 if(focus){node.focus({preventScroll:true});window.scrollTo(0,0);}
}
function drawResults(){
 const q=$('#query').value.trim().toLowerCase();
 if(!q){$('#results').innerHTML='<p class="searchHint">Enter a title, country or evidence ID to find a record.</p>';return;}
 const matches=[...records.values()].filter(row=>searchText(row).includes(q));
 $('#results').innerHTML=`<p class="searchHint">${matches.length} ${matches.length===1?'match':'matches'}</p>${matches.map(r=>`<a class="compact" href="${link(r)}"><small>${pages[r.section][0]} · ${safe(r.id)}</small><strong>${safe(r.title)}</strong></a>`).join('')}`;
}
function openSearch(){closeMenu();$('#query').value='';drawResults();searchDialog.showModal();$('#query').focus();}
$('#openSearch').onclick=openSearch;
$('[data-close]').onclick=()=>searchDialog.close();
$('#results').onclick=e=>{if(e.target.closest('a'))searchDialog.close();};
searchDialog.addEventListener('click',e=>{if(e.target===searchDialog)searchDialog.close();});
$('#query').oninput=drawResults;
$('#menu').onclick=()=>{if(document.body.classList.contains('menuOpen'))closeMenu();else{document.body.classList.add('menuOpen');$('#scrim').hidden=false;$('#menu').setAttribute('aria-expanded','true');$('#sidebar .brand').focus();}};
$('#scrim').onclick=closeMenu;
$('#nav').onclick=closeMenu;
document.addEventListener('keydown',e=>{
 if(e.key==='Escape')closeMenu();
 if(e.key==='/'&&!searchDialog.open&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();openSearch();}
});
document.addEventListener('click',e=>{
 const layer=e.target.closest('[data-layer]');
 if(layer){currentLayer=layer.dataset.layer;node.innerHTML=network();node.querySelector(`[data-layer="${currentLayer}"]`).focus();}
 if(e.target.closest('[data-reset]')){localQuery=sectionFilter='';$('#localQuery').value='';$('#kindFilter').value='';$('#listArea').innerHTML=listItems(currentView);$('#localQuery').focus();}
 if(e.target.closest('.skip')){e.preventDefault();node.focus();}
});
document.addEventListener('input',e=>{if(e.target.id==='localQuery'){localQuery=e.target.value;$('#listArea').innerHTML=listItems(currentView);}});
document.addEventListener('change',e=>{if(e.target.id==='atlasSource'){location.hash='atlas/'+encodeURIComponent(e.target.value);return;}if(e.target.id==='kindFilter'){sectionFilter=e.target.value;$('#listArea').innerHTML=listItems(currentView);}});
addEventListener('hashchange',()=>render(true));
render();
})();
