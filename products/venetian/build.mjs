import {build} from 'esbuild';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
const bundle=await build({entryPoints:['src/catalog-adapter.js'],bundle:true,format:'iife',minify:true,write:false,legalComments:'inline',target:'es2020'});
let html=readFileSync('baseline/venetian.html','utf8');
const replace=(from,to)=>{if(!html.includes(from))throw Error('Baseline hook missing: '+from.slice(0,60));html=html.replace(from,to);};
replace("backdrop();sceneExtras();build();drawPrimitives();vignette()","backdrop();sceneExtras();hotspots=window.SACModelReview.render(ctx,state,a,cssW,cssH,performance.now()<highlightUntil?showHighlight:'');vignette()");
replace("}drawFocusOverlay();if(state.explode","}if(state.view==='living')drawFocusOverlay();if(state.explode");
replace("function yawLimit(){return state.view==='living'?0:1.08}","function yawLimit(){return state.view==='living'?0:Math.PI}");
replace("<p class=\"conceptnote\">Illustrative configuration \u2014 no payment required.</p>","<p class=\"conceptnote\">Venetian V3 \u00b7 Illustrative configuration \u2014 not a manufacturing specification.</p>");
replace("highlightUntil=performance.now()+9500", "highlightUntil=performance.now()+1700");
replace("function focusPart(part){", "function focusPart(part){window.SACModelReview.notify(part);");
// Engine is installed before the original page's animation loop begins.
replace("(()=>{'use strict';",bundle.outputFiles[0].text.replaceAll('</script','<\\/script')+"\n(()=>{'use strict';");
console.log('Original interface retained; model hook installed. HTML bytes:',Buffer.byteLength(html));
writeFileSync('../../venetian.html',html);
