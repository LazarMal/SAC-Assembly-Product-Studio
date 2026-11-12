import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const bundle=await build({entryPoints:['src/view.js'],bundle:true,write:false,minify:true,format:'iife',legalComments:'none'});
const template=await readFile('template.html','utf8');
const photo=await readFile('../../apps/studio/public/assets/living-room.webp');
const html=template.replace('<style>', '<style>:root{--room-photo:url(data:image/webp;base64,'+photo.toString('base64')+')}').replace('/*BUNDLE*/',()=>bundle.outputFiles[0].text.replace(/<\/script/gi,'<\\/script'));
await writeFile('../../apps/studio/public/viewers/open-roller.html',html);
