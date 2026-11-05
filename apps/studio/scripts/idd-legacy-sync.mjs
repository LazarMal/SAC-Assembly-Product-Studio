/**
 * Preview-only bridge for the existing IDD Canvas configurator.
 * The original root HTML stays unchanged. The preview copy gets sync and
 * retained selection persistence for the single consolidated configurator.
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

`;

const style = '<style id="sac-idd-sync-styles"></style>';

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
