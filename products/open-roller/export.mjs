import {GLTFExporter} from 'three/addons/exporters/GLTFExporter.js';
import {writeFile} from 'node:fs/promises';
import {createRoller} from './src/model.js';
// Browser-compatible binary reader for the exporter running in Node.
globalThis.FileReader=class{
 async readAsArrayBuffer(blob){this.result=await blob.arrayBuffer();this.onloadend?.()}
};
const model=createRoller();model.root.scale.setScalar(.001);model.root.name='SAC Open Roller Blind';
model.root.traverse(o=>{delete o.userData.beadCenters});
const bytes=await new GLTFExporter().parseAsync(model.root,{binary:true});await writeFile('SAC_Open_Roller.glb',new Uint8Array(bytes));
