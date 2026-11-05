/**
 * Quiet, preview-only selection feedback shared by Venetian, IDD and ODD.
 * Updates one compact row; an explicit Inspect action reveals the existing
 * schematic. It never auto-zooms, stacks modals or moves the camera.
 */
const STYLE = String.raw`
<style id="sac-quiet-details-style">
.sac-quiet-dock{position:sticky;top:0;z-index:3;margin:5px 0 11px;border:1px solid #dfd6cc;border-radius:10px;background:#fffdfa;color:#302820;box-shadow:0 3px 13px #35271b0a}
.sac-quiet-summary{display:flex;align-items:center;gap:10px;min-height:47px;padding:8px 10px 8px 12px}
.sac-quiet-copy{display:flex;flex:1;min-width:0;align-items:baseline;gap:8px;flex-wrap:wrap}
.sac-quiet-copy small{color:#897a6c;font-size:10px;font-weight:650}
.sac-quiet-copy strong{font-size:12px;font-weight:720;line-height:1.35;color:#342e27}
.sac-quiet-inspect{flex-shrink:0;background:#f6f0e9;border:1px solid #e6d8ca;border-radius:6px;padding:8px 11px;font-size:11px;font-weight:690;color:#4a382a;cursor:pointer}
.sac-quiet-inspect:hover,.sac-quiet-inspect[aria-expanded=true]{background:#332a24;border-color:#332a24;color:#fffdfa}
.sac-quiet-inspect:focus-visible{outline:2px solid #a78567;outline-offset:2px}
.sac-quiet-detail{display:none;align-items:center;gap:11px;padding:10px 13px 12px;border-top:1px solid #eee7de;color:#6a5d51;font-size:11px;line-height:1.45}
.sac-quiet-detail.is-open{display:flex}
.sac-quiet-art{flex:0 0 94px;width:94px;height:67px;background:#f8f4ef;border-radius:6px;display:grid;place-items:center;overflow:hidden}
.sac-quiet-art svg{width:91px;height:65px;display:block}
.sac-quiet-dock[hidden]{display:none}
@media(max-width:730px){.sac-quiet-summary{padding:7px 9px}.sac-quiet-art{width:72px;height:57px;flex-basis:72px}.sac-quiet-art svg{width:71px;height:55px}}
</style>
`;

function one(source, needle, replacement, file) {
  const index = source.indexOf(needle);
  if (index < 0 || source.indexOf(needle, index+needle.length) >= 0) {
    throw new Error('Quiet preview anchor unavailable or ambiguous in '+file+': '+needle.slice(0,64));
  }
  return source.slice(0,index)+replacement+source.slice(index+needle.length);
}

const COMMON = String.raw`
const sacQuietDock=document.createElement('div');
sacQuietDock.className='sac-quiet-dock';
sacQuietDock.hidden=true;
sacQuietDock.innerHTML='<div class="sac-quiet-summary"><div class="sac-quiet-copy"><small>Last change</small><strong></strong></div><button class="sac-quiet-inspect" type="button" aria-expanded="false">Inspect</button></div><div class="sac-quiet-detail"><div class="sac-quiet-art"></div><span>Component illustration · conceptual preview</span></div>';
const sacQuietScroll=document.getElementById('panelScroll');
if(!sacQuietScroll)throw new Error('Missing product configuration scroll container');
sacQuietScroll.prepend(sacQuietDock);
const sacQuietButton=sacQuietDock.querySelector('.sac-quiet-inspect');
const sacQuietDetail=sacQuietDock.querySelector('.sac-quiet-detail');
const sacQuietArt=sacQuietDock.querySelector('.sac-quiet-art');
let sacQuietLast=null;
let sacQuietDebounce=0;
function sacQuietHighlight(part) {
  if(!part)return;
  // Short component emphasis only; preserve the user's angle, zoom and view.
  const t=performance.now()+950;
  if(typeof activeHighlight!=='undefined'){activeHighlight=part;highlightUntil=t}
  else if(typeof showHighlight!=='undefined'){showHighlight=part;highlightUntil=t}
}
function sacQuietShow(next) {
  if(!next)return;
  const isSame=sacQuietLast&&sacQuietLast.label===next.label&&sacQuietLast.part===next.part;
  sacQuietLast=next;
  sacQuietDock.hidden=false;
  sacQuietDock.querySelector('.sac-quiet-copy strong').textContent=next.label;
  if(!isSame) {
    sacQuietDetail.classList.remove('is-open');
    sacQuietButton.setAttribute('aria-expanded','false');
    sacQuietButton.textContent='Inspect';
  }
  if(sacQuietDetail.classList.contains('is-open')){
    sacQuietArt.innerHTML=inspectGraphic(next.part);
  }
  sacQuietHighlight(next.part);
}
sacQuietButton.addEventListener('click',()=>{
  if(!sacQuietLast)return;
  const opened=sacQuietDetail.classList.toggle('is-open');
  sacQuietButton.setAttribute('aria-expanded',String(opened));
  sacQuietButton.textContent=opened?'Close':'Inspect';
  if(opened){
    sacQuietArt.innerHTML=inspectGraphic(sacQuietLast.part);
    sacQuietHighlight(sacQuietLast.part);
  }
});
function sacQuietSchedule(next){
  // Last action wins: rapid changes replace the same row and one pending update.
  clearTimeout(sacQuietDebounce);
  sacQuietDebounce=setTimeout(()=>sacQuietShow(next),170);
}
document.addEventListener('click',event=>{
  const selected=event.target.closest('button');
  if(!selected||sacQuietDock.contains(selected))return;
  const next=sacQuietChoice(selected);
  if(next)sacQuietSchedule(next);
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&sacQuietDetail.classList.contains('is-open')){
    sacQuietDetail.classList.remove('is-open');
    sacQuietButton.setAttribute('aria-expanded','false');
    sacQuietButton.textContent='Inspect';
  }
});
window.addEventListener('pagehide',()=>clearTimeout(sacQuietDebounce));
`;

const DOORS = String.raw`
function sacQuietChoice(button){
 const group=button.closest('#frameSwatches,#guideShapes,#guideFinishes,#extraChoices,#variantChips,#widthChips,#stackChoices');
 if(!group)return null;
 if(group.id==='frameSwatches')return {part:'frame',label:'Frame finish · '+(button.getAttribute('aria-label')||button.title||'Updated')};
 if(group.id==='guideShapes')return {part:'guide',label:'Lower guide · '+(state.guideShape==='slope'?'Slope':'Straight')};
 if(group.id==='guideFinishes')return {part:'guide',label:'Guide finish · '+(state.guide==='alu'?'Aluminium':state.guide)};
 if(group.id==='extraChoices')return {part:'seal',label:'Closing detail · '+(state.extra==='none'?'None':state.extra==='brush'?'Brush':'Magnet')};
 if(group.id==='variantChips')return {part:'frame',label:'Door system · '+(state.variant==='double'?'Double':'Single')};
 if(group.id==='widthChips')return {part:'frame',label:'Door width · '+totalMm()+' mm'};
 if(group.id==='stackChoices')return {part:'pull',label:'Stacking side · '+state.stack};
 return null;
}
`;

const VENETIAN = String.raw`
function sacQuietChoice(button){
 const group=button.closest('#slatChips,#slatColors,#hardwareColors,#controlChips,#sideChips,#mountChips,#tapes,#guides');
 if(!group)return null;
 if(group.id==='slatChips')return {part:'slats',label:'Slat profile · '+state.size+' mm'};
 if(group.id==='slatColors')return {part:'slats',label:'Slat finish · '+friendly[state.color]};
 if(group.id==='hardwareColors')return {part:'headrail',label:'Hardware · '+state.hardware};
 if(group.id==='controlChips')return {part:'control',label:'Control · '+(state.control==='chain'?'Chain':'Wand')};
 if(group.id==='sideChips')return {part:'control',label:'Control side · '+state.side};
 if(group.id==='mountChips')return {part:'headrail',label:'Mounting · '+state.mount};
 if(group.id==='tapes')return {part:'tapes',label:'Ladder tapes · '+(state.tapes?'On':'Off')};
 if(group.id==='guides')return {part:'guides',label:'Side guides · '+(state.guides?'On':'Off')};
 return null;
}
`;

export function decorateQuietDetails(html,product){
 if(!['venetian','idd','odd'].includes(product))throw new Error('Unsupported preview product: '+product);
 if(html.includes('sac-quiet-details-style'))throw new Error('Quiet details already installed');
 const isBlind=product==='venetian';
 const file=product;
 let result=one(html,'</head>',STYLE+'</head>',file);
 // Legacy IDD/ODD focus(...) already shows a 5.7-second inspector on
 // each choice. Keep the full inspector for deliberate component clicks only.
 if(!isBlind){
   result=one(result,
     ' inspectPart(part,!fromOption);',
     ' if(!fromOption)inspectPart(part,true);',
     file+' automatic inspector');
   // Option changes must never reset the camera in the mounted room scene.
   result=one(result,
     " }else if(state.scene==='room'){\n  // Keep the screen installed in the photographed doorway while showing its detail.\n  state.zoom=1;\n }\n if(!fromOption)inspectPart(part,true);",
     " }\n if(!fromOption)inspectPart(part,true);",
     file+' preserve room camera');
 }
 const marker=isBlind?
  "updateSummary();\nswitchView('studio');\nsetPane('configure');":
  product==='idd'?
    "window.addEventListener('pagehide',sacPersist);":
    "updateUI();\nswitchScene('studio');\nsetTimeout(()=>playAssembly(true), 320);";
 const injected=COMMON+'\n'+(isBlind?VENETIAN:DOORS)+'\n';
 return one(result,marker,injected+marker,file+' runtime startup');
}
