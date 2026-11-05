/**
 * Preview-only bridge for the existing IDD Canvas configurator.
 * The original root HTML stays unchanged. The preview copy gets sync and
 * an explicit link to the React/Three.js showroom.
 */

const code = String.raw`
function sacSnapshot(){
 return {
  productId:'idd',schemaVersion:1,variant:state.variant,
  width:totalMm(),height:Math.round(state.heightMm),
  frameColor:palette[state.color].ral.replace(/\s/g,''),
  guideShape:state.guideShape,guideFinish:state.guide==='alu'?'aluminium':state.guide,
  extra:state.extra,stackSide:state.stack,openPercent:Math.round(state.open),
  unit:state.unit,
  references:{reference1:$('ref1').value.slice(0,100),reference2:$('ref2').value.slice(0,100),reference3:$('ref3').value.slice(0,100)}
 };
}
function sacApply(saved){
 if(!saved||saved.productId!=='idd'||saved.schemaVersion!==1)return false;
 if(!['single','double'].includes(saved.variant))return false;
 const each=saved.width/(saved.variant==='double'?2:1);
 if(!WIDTHS.includes(each)||!Number.isFinite(saved.height)||saved.height<1200||saved.height>3000)return false;
 const color=Object.keys(palette).find(c=>palette[c].ral.replace(/\s/g,'')===saved.frameColor);
 if(!color||!['straight','slope'].includes(saved.guideShape)||!['grey','aluminium','black'].includes(saved.guideFinish))return false;
 if(!['none','brush','magnet'].includes(saved.extra)||!['left','right'].includes(saved.stackSide))return false;
 if(!Number.isFinite(saved.openPercent)||saved.openPercent<0||saved.openPercent>100)return false;
 state.variant=saved.variant;state.widthBase=each;state.heightMm=saved.height;
 state.color=color;state.guideShape=saved.guideShape;
 state.guide=saved.guideFinish==='aluminium'?'alu':saved.guideFinish;
 state.extra=saved.extra;state.stack=saved.stackSide;state.open=saved.openPercent;
 state.unit=['mm','cm','m','inch'].includes(saved.unit)?saved.unit:'mm';
 const refs=saved.references&&typeof saved.references==='object'?saved.references:{};
 for(const id of ['ref1','ref2','ref3']){
   const value=refs['reference'+id.slice(-1)];
   $(id).value=typeof value==='string'?value.slice(0,100):'';
 }
 return true;
}
function sacPersist(){
 try{window.localStorage.setItem('sac-idd-shared-selection-v1',JSON.stringify(sacSnapshot()))}
 catch(_err){} 
}
let sacStored=null;
try{sacStored=JSON.parse(window.localStorage.getItem('sac-idd-shared-selection-v1')||'null')}
catch(_err){}
const sacRestored=sacApply(sacStored);
window.SAC_IDD_BRIDGE={snapshot:sacSnapshot,persist:sacPersist};
updateUI();
switchScene('studio');
if(!sacRestored)setTimeout(()=>playAssembly(true),320);
for(const type of ['click','change','input','pointerup','keyup']){
 document.addEventListener(type,()=>queueMicrotask(sacPersist));
}
window.addEventListener('pagehide',sacPersist);

// A temporary magnified detail window follows the point on the EXISTING Canvas
// configurator. It never alters the room anchoring, camera or selected options.
const sacStage=document.querySelector('.stage');
const sacCard=document.createElement('div');
sacCard.className='sac-detail-card';
sacCard.setAttribute('role','status');
sacCard.setAttribute('aria-live','polite');
sacCard.innerHTML='<div class="sac-detail-photo"><canvas aria-label="Magnified product component"></canvas></div><div class="sac-detail-info"><strong class="sac-detail-title"></strong><p class="sac-detail-desc"></p><div class="sac-detail-schematic" aria-hidden="true"></div></div>';
sacStage.appendChild(sacCard);
const sacLens=sacCard.querySelector('canvas');
sacLens.width=480;sacLens.height=284;
const sacLensCtx=sacLens.getContext('2d',{alpha:false});
const sacLine=document.createElementNS('http://www.w3.org/2000/svg','svg');
sacLine.classList.add('sac-detail-line');
sacLine.setAttribute('aria-hidden','true');
sacLine.setAttribute('preserveAspectRatio','none');
const sacPath=document.createElementNS('http://www.w3.org/2000/svg','path');
sacLine.appendChild(sacPath);
sacStage.appendChild(sacLine);
const sacDot=document.createElement('div');
sacDot.className='sac-detail-anchor';
sacStage.appendChild(sacDot);
let sacDetail=null,sacDetailFrame=0;
const sacMotionReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function sacStopDetail(){
 sacDetail=null;
 cancelAnimationFrame(sacDetailFrame);
 sacCard.classList.remove('is-visible');
 sacLine.classList.remove('is-visible');
 sacDot.classList.remove('is-visible');
}
function sacTargetPoint(part){
 const open=clamp(anim.open/100,0,1),coverage=1-open;
 let u=.5,v=.5;
 if(part==='guide'){u=.5;v=.948}
 else if(part==='frame'){u=state.variant==='double'?.06:.052;v=.34}
 else if(part==='seal'){
  if(state.variant==='double'){
   u=state.scene==='room'?(1039/1586-.392)/(.934-.392):.5;
  }else{
   const left=.04,right=.962;
   u=state.stack==='right'?right-(right-left)*coverage:left+(right-left)*coverage;
  }
  v=.52;
 }
 const projected=pr(u,v,.55);
 // The Room mode zooms the photograph and the 2.5D geometry together.
 if(state.scene==='room'){
  const z=Math.max(1,anim.zoom),px=cssW*.65,py=cssH*.48;
  projected[0]=px+(projected[0]-px)*z;
  projected[1]=py+(projected[1]-py)*z;
 }
 return projected;
}
function sacDetailInfo(part){
 if(part==='guide')return {
  title:state.guideShape==='slope'?'Slope lower guide':'Straight lower guide',
  description:(state.guide==='alu'?'Aluminium':state.guide==='grey'?'Grey':'Black')+' finish · '+(state.guideShape==='slope'?'bevelled':'flat')+' threshold'
 };
 if(part==='frame')return {
  title:palette[state.color].ral,
  description:palette[state.color].name+' · perimeter frame finish'
 };
 return {
  title:state.extra==='magnet'?'Magnetic closure':state.extra==='brush'?'Brush seal':'Closing edge',
  description:state.extra==='none'?'No additional edge accessory':state.extra==='brush'?'Flexible bristles along the closing edge':'Magnetic strip at the closing edge'
 };
}
function sacPaintDetail(now){
 const current=sacDetail;
 if(!current)return;
 const elapsed=now-current.started;
 if(elapsed>(sacMotionReduced.matches?1900:3200)){sacStopDetail();return}
 if(!geom || !cssW || !cssH){sacDetailFrame=requestAnimationFrame(sacPaintDetail);return}
 const point=sacTargetPoint(current.part);
 const cardW=Math.min(252,Math.max(192,cssW-28));
 const cardH=254;
 const left=point[0]>cssW*.54?Math.max(12,Math.min(cssW-cardW-12,point[0]-cardW-64)):
  Math.max(12,Math.min(cssW-cardW-12,point[0]+65));
 const top=Math.max(13,Math.min(cssH-cardH-98,point[1]-cardH*.50));
 sacCard.style.left=left+'px';
 sacCard.style.top=top+'px';
 sacCard.style.width=cardW+'px';
 const connectorX=point[0]>left+cardW*.5?left+cardW:left;
 const connectorY=top+Math.min(136,cardH*.55);
 sacLine.setAttribute('viewBox','0 0 '+cssW+' '+cssH);
 sacPath.setAttribute('d','M'+connectorX.toFixed(1)+' '+connectorY.toFixed(1)+' Q'+
  ((connectorX+point[0])/2).toFixed(1)+' '+(Math.min(connectorY,point[1])-16).toFixed(1)+' '+
  point[0].toFixed(1)+' '+point[1].toFixed(1));
 sacDot.style.left=point[0]+'px';sacDot.style.top=point[1]+'px';
 const progress=sacMotionReduced.matches?1:ease(clamp(elapsed/510,0,1));
 const regionW=202-95*progress,regionH=regionW*(sacLens.height/sacLens.width);
 const scaleX=canvas.width/cssW,scaleY=canvas.height/cssH;
 const sx=clamp(point[0]-regionW/2,0,Math.max(0,cssW-regionW));
 const sy=clamp(point[1]-regionH/2,0,Math.max(0,cssH-regionH));
 sacLensCtx.fillStyle='#e7e1da';sacLensCtx.fillRect(0,0,sacLens.width,sacLens.height);
 sacLensCtx.drawImage(canvas,
   sx*scaleX,sy*scaleY,regionW*scaleX,regionH*scaleY,
   0,0,sacLens.width,sacLens.height);
 sacDetailFrame=requestAnimationFrame(sacPaintDetail);
}
function sacShowDetail(part){
 if(!sacLensCtx)return;
 sacStopDetail();
 const info=sacDetailInfo(part);
 sacCard.querySelector('.sac-detail-title').textContent=info.title;
 sacCard.querySelector('.sac-detail-desc').textContent=info.description;
 // Existing SVG schematic makes very small profiles recognisable even on phones.
 sacCard.querySelector('.sac-detail-schematic').innerHTML=inspectGraphic(part);
 sacDetail={part,started:performance.now()};
 sacCard.classList.add('is-visible');
 sacLine.classList.add('is-visible');
 sacDot.classList.add('is-visible');
 sacDetailFrame=requestAnimationFrame(sacPaintDetail);
}
document.addEventListener('click',function(event){
 const el=event.target.closest('#frameSwatches [data-color],#guideShapes [data-shape],#guideFinishes [data-guide],#extraChoices [data-extra]');
 if(!el)return;
 const part=el.closest('#frameSwatches')?'frame':
  el.closest('#extraChoices')?'seal':'guide';
 sacShowDetail(part);
});
canvas.addEventListener('pointerdown',sacStopDetail);
canvas.addEventListener('wheel',sacStopDetail,{passive:true});
document.querySelector('.scene-switch').addEventListener('click',sacStopDetail);
document.addEventListener('keydown',function(event){
 if(event.key==='Escape')sacStopDetail();
});
window.addEventListener('pagehide',sacStopDetail);
`;

const style = `<style id="sac-idd-sync-styles">
.sac-detail-card{position:absolute;left:20px;top:110px;z-index:5;max-width:calc(100% - 24px);overflow:hidden;border:1px solid #e7ded4;border-radius:12px;background:#fffdfa;color:#2d2520;box-shadow:0 19px 52px #20180e50;pointer-events:none;opacity:0;transform:translateY(10px) scale(.96);transition:transform .3s cubic-bezier(.2,.7,.2,1),opacity .25s ease}
.sac-detail-card.is-visible{opacity:1;transform:translateY(0) scale(1)}
.sac-detail-photo{height:142px;overflow:hidden;background:#e7e1da}
.sac-detail-photo canvas{display:block;width:100%;height:100%;object-fit:cover}
.sac-detail-info{padding:12px 14px 10px}
.sac-detail-title{font-size:14px;line-height:1.25;font-weight:770;letter-spacing:-.02em}
.sac-detail-desc{display:block;margin:5px 0 0;font-size:11px;line-height:1.45;color:#726459}
.sac-detail-schematic{height:49px;margin-top:7px;background:#f8f4ee;border-radius:6px;overflow:hidden;display:grid;place-items:center}
.sac-detail-schematic svg{height:47px;width:80px}
.sac-detail-line{position:absolute;inset:0;width:100%;height:100%;z-index:4;pointer-events:none;opacity:0;transition:opacity .2s ease}
.sac-detail-line.is-visible{opacity:1}
.sac-detail-line path{fill:none;stroke:#a6794f;stroke-width:2;stroke-linecap:round;stroke-dasharray:5 5}
.sac-detail-anchor{position:absolute;left:50%;top:50%;z-index:5;width:10px;height:10px;border:2px solid #fff8ee;border-radius:50%;background:#ae7542;box-shadow:0 0 0 4px #a6794f44;pointer-events:none;opacity:0;transform:translate(-50%,-50%);transition:opacity .2s}
.sac-detail-anchor.is-visible{opacity:1}
@media(max-width:730px){.sac-detail-card{z-index:6}.sac-detail-line{display:none}.sac-detail-schematic{height:42px}.sac-detail-schematic svg{height:40px}}
@media(prefers-reduced-motion:reduce){.sac-detail-card,.sac-detail-line,.sac-detail-anchor{transition:none}}
</style>`;

function replaceOne(html, marker, replacement) {
 const index=html.indexOf(marker);
 if(index<0 || html.indexOf(marker,index+marker.length)!==-1)throw new Error('IDD preview anchor missing or ambiguous: '+marker.slice(0,55));
 return html.slice(0,index)+replacement+html.slice(index+marker.length);
}
export function decorateIddLegacyPreview(html){
 if(html.includes('sac-idd-sync-styles'))throw new Error('Preview bridge already installed');
 let updated=replaceOne(html,'</head>',style+'</head>');
 updated=replaceOne(updated,
  "updateUI();\nswitchScene('studio');\nsetTimeout(()=>playAssembly(true), 320);",
  code.trim());
 return updated;
}
