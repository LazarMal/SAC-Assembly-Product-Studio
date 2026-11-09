import test from 'node:test';
import assert from 'node:assert/strict';
import {layout,SPEC} from '../src/kinematics.js';
import {createBlind} from '../src/model.js';
const base={size:50,color:'#d0bca1',hardware:'#dfd8cc',raise:0,tilt:25,explode:0,side:'left',control:'wand',mount:'wall',tapes:false,guides:false};
test('All profiles close with overlap and lift into a nonintersecting stack',()=>{
 for(const size of [25,35,50]){
  const down=layout(size,0,86);assert.ok(down.depth*Math.sin(86*Math.PI/180)>down.pitch);
  for(const raise of [0,.1,.5,.9,1]){
   const l=layout(size,raise);assert.ok(l.slats[0].y<=SPEC.top-.075+1e-8);
   for(let i=1;i<l.count;i++)assert.ok(l.slats[i-1].y-l.slats[i].y>=.0045-1e-8);
   assert.ok(l.bottom<l.slats.at(-1).y);
  }
 }
});
test('Rebuilding profiles and full control extremes keep finite geometry',()=>{
 const b=createBlind();
 for(const size of [50,25,35,50])for(const explode of [0,1])for(const raise of [0,1]){
  b.update({...base,size,explode,raise,tilt:86});b.root.updateMatrixWorld(true);
  assert.equal(b.groups.slats.children.length,layout(size).count);
  b.root.traverse(o=>assert.ok(o.matrixWorld.elements.every(Number.isFinite)));
 }
});
test('Closed slat geometry has outward winding and positive volume',()=>{
 const b=createBlind();b.update(base);const g=b.groups.slats.children[0].geometry,p=g.attributes.position,ix=g.index.array;let volume=0;
 for(let i=0;i<ix.length;i+=3){const a=ix[i],c=ix[i+1],d=ix[i+2];volume+=(p.getX(a)*(p.getY(c)*p.getZ(d)-p.getZ(c)*p.getY(d))+p.getY(a)*(p.getZ(c)*p.getX(d)-p.getX(c)*p.getZ(d))+p.getZ(a)*(p.getX(c)*p.getY(d)-p.getY(c)*p.getX(d)))/6;}
 assert.ok(volume>0);assert.ok(Math.abs(volume-1.2*.05*SPEC.thickness)<1e-7);
});
test('Assembly endpoint equals assembled state and supports both control sides',()=>{
 const b=createBlind();b.update({...base,assemblyProgress:1});assert.equal(b.groups.drive.position.y,0);assert.equal(b.groups.mounting.position.y,0);
 b.update({...base,side:'left'});const left=b.groups.control.position.x;
 b.update({...base,side:'right'});assert.equal(b.groups.control.position.x,-left);
});
test('Broad slat faces retain analytic normals without end-cap contamination',()=>{
 const b=createBlind();b.update(base);const g=b.groups.slats.children[0].geometry,n=g.attributes.normal;
 for(let i=0;i<n.count;i++){
  const x=n.getX(i),y=n.getY(i),z=n.getZ(i);assert.ok(Math.abs(Math.hypot(x,y,z)-1)<1e-6);
  if(Math.abs(y)>.8)assert.ok(Math.abs(x)<1e-8,'Broad faces must not lean toward end caps');
 }
 assert.ok(b.materials.slats.roughness>=.6);assert.ok(b.materials.slats.metalness<=.1);
});
