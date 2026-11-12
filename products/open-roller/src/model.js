import * as T from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Millimetres. These are adjustable review dimensions; the supplied views have no scale.
export const spec = { width:780, travel:940, tubeRadius:12.5, wall:0.9, clothThickness:0.44, minimumWrap:150 };
export const names = {tube:'Roller tube', fabric:'Fabric', rail:'Bottom bar', drive:'Chain drive', chain:'Bead chain', idle:'Idle end', bracket:'Mounting brackets', lock:'Retaining slides', cover:'Side covers'};
export function rollState(drop) {
  const {travel,tubeRadius,clothThickness,minimumWrap}=spec;
  const length=travel*Math.max(0,Math.min(1,drop));
  return {length,radius:Math.sqrt(tubeRadius**2+(minimumWrap+travel-length)*clothThickness/Math.PI)};
}
const material=(color,metalness=0,roughness=.56)=>new T.MeshStandardMaterial({color,metalness,roughness});
const metal=material(0xbec5c7,.52), plastic=material(0xe8e7dd), dark=material(0x777670,.25);
function mesh(parent,geo,mat,x=0,y=0,z=0){
 const obj=new T.Mesh(geo,mat); obj.position.set(x,y,z); parent.add(obj);return obj;
}
function cylinder(parent,r,len,mat,x=0,y=0,z=0){
 const geo=new T.CylinderGeometry(r,r,len,64);geo.rotateZ(-Math.PI/2);return mesh(parent,geo,mat,x,y,z);
}
// Shape coordinates run along depth and height. The extrusion runs along the roller axis.
function plate(parent,shape,depth,mat,x=0,bevel=.35){
 const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:bevel>0,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,curveSegments:20});geo.rotateY(-Math.PI/2);
 return mesh(parent,geo,mat,x);
}
function circle(r){const s=new T.Shape();s.absarc(0,0,r,0,Math.PI*2,false);return s}
function hole(shape,x,y,r){const p=new T.Path();p.absarc(x,y,r,0,Math.PI*2,true);shape.holes.push(p)}
function slot(shape,x,y,w,h){
 const p=new T.Path(),r=w/2,a=h/2-r;p.moveTo(x-r,y-a);p.lineTo(x-r,y+a);p.absarc(x,y+a,r,Math.PI,0,true);p.lineTo(x+r,y-a);p.absarc(x,y-a,r,0,-Math.PI,true);shape.holes.push(p);
}
function fork(){
 const s=new T.Shape();s.moveTo(-26,23);s.lineTo(-6,25);s.quadraticCurveTo(11,27,21,17);s.lineTo(9,12);s.lineTo(-10,10);s.lineTo(-10,6);s.lineTo(16,6);s.lineTo(16,-5);s.lineTo(-10,-6);s.lineTo(-10,-12);s.lineTo(10,-13);s.lineTo(22,-17);s.quadraticCurveTo(14,-27,-3,-26);s.lineTo(-26,-23);s.closePath();hole(s,1,0,3);slot(s,10,0,3,6);return s;
}
function outline(){
 const s=new T.Shape();s.moveTo(-25,24);s.quadraticCurveTo(-25,27,-22,27);s.lineTo(-1,27);s.bezierCurveTo(30,27,31,-26,0,-27);s.lineTo(-22,-27);s.quadraticCurveTo(-25,-27,-25,-23);s.closePath();return s;
}
function shell(parent,start,length,ro,ri,mat){
 const s=circle(ro);hole(s,0,0,ri);return plate(parent,s,length,mat,start,0);
}
export function createRoller(){
 const root=new T.Group(), groups={}, motions=[], W=spec.width, end=W/2;
 const fabricMat=material(0x8a928b,0,.98);fabricMat.side=T.DoubleSide;
 function part(id,x,y,z,dx,dy,dz){const g=new T.Group();g.name=names[id];g.userData.part=id;root.add(g);(groups[id]??=[]).push(g);motions.push({g,base:new T.Vector3(x,y,z),delta:new T.Vector3(dx,dy,dz)});return g}
 const tube=part('tube',0,0,0,0,0,0);
 shell(tube,end,W,spec.tubeRadius,spec.tubeRadius-spec.wall,metal);
 const drive=part('drive',end,0,0,80,0,0);
 cylinder(drive,19,5,plastic,2.5);cylinder(drive,15,3,dark,6);
 cylinder(drive,19,2.5,plastic,8.5);
 // Split insert: a pair of curved prongs separated by open longitudinal slots.
 for(const phase of [0,Math.PI]){
  const s=new T.Shape(),a=phase+.12,b=phase+Math.PI-.12;
  s.absarc(0,0,10.8,a,b,false);s.absarc(0,0,8.5,b,a,true);s.closePath();plate(drive,s,43,plastic,0,.14);
 }
 cylinder(drive,5,7,metal,12);
 const idle=part('idle',-end,0,0,-66,0,0);cylinder(idle,10.8,31,plastic,15.5);cylinder(idle,17,4,plastic,-2);cylinder(idle,3.8,13,metal,-10);
 for(const side of [-1,1]){
  const bracket=part('bracket',side*(end+15),0,0,side*140,0,0);
  plate(bracket,fork(),1.7,metal,1);
  const flange=new T.Shape();flange.moveTo(-6,-23);flange.lineTo(7,-23);flange.lineTo(7,23);flange.lineTo(-6,23);flange.closePath();for(const y of [-15,0,15])slot(flange,0,y,3.6,8);
  const foot=plate(bracket,flange,1.7,metal);foot.rotation.y=Math.PI/2;foot.position.set(-side*5,0,-25);
  const lock=part('lock',side*(end+16.5),0,0,side*151,12,28);const slide=new T.Shape();slide.moveTo(-9,-7);slide.lineTo(7,-7);slide.lineTo(11,-3);slide.lineTo(11,5);slide.lineTo(7,8);slide.lineTo(-9,8);slide.closePath();plate(lock,slide,2.2,dark);
  for(const y of [-3,0,3]) mesh(lock,new T.BoxGeometry(.8,.45,7),plastic,side*1.5,y,2);
  const cap=part('cover',side*(end+19),0,0,side*204,0,0);plate(cap,outline(),2.4,plastic,0,1);
  const rim=outline(),inner=new T.Path();
  inner.setFromPoints(outline().getPoints(32).map(p=>p.multiplyScalar(.94)).reverse());rim.holes.push(inner);
  plate(cap,rim,4.2,plastic,side===1?-2.4:4.2,.16);
 }
 const chain=part('chain',end+6,0,0,81,-46,0),R=15,H=420;
 const loopLength=2*H+2*Math.PI*R;
 function chainPoint(dist){if(dist<H)return new T.Vector3(0,-dist,R);
  dist-=H;if(dist<Math.PI*R){const a=dist/R;return new T.Vector3(0,-H-R*Math.sin(a),R*Math.cos(a))}
  dist-=Math.PI*R;if(dist<H)return new T.Vector3(0,-H+dist,-R);
  const a=(dist-H)/R;return new T.Vector3(0,R*Math.sin(a),-R*Math.cos(a))}
 const chainPath=new T.CatmullRomCurve3(Array.from({length:160},(_,i)=>chainPoint(i/160*loopLength)),true);
 mesh(chain,new T.TubeGeometry(chainPath,250,.58,6,true),dark);
 const bead=new T.SphereGeometry(1.85,10,7),count=Math.round(loopLength/5.6);
 const beads=Array.from({length:count},(_,i)=>{const p=chainPoint(i/count*loopLength);return bead.clone().translate(p.x,p.y,p.z)});
 const beadMesh=mesh(chain,mergeGeometries(beads),plastic);beadMesh.userData.beadCenters=Array.from({length:count},(_,i)=>chainPoint(i/count*loopLength).toArray());beads.forEach(g=>g.dispose());bead.dispose();
 const fabric=part('fabric',0,0,0,0,-54,48);
 const roll=mesh(fabric,new T.BufferGeometry(),fabricMat);
 // Small variations in tension across a hanging, weighted textile.
 const clothGeometry=new T.BoxGeometry(W-2,1,spec.clothThickness,56,9,1);
 const coords=clothGeometry.attributes.position;
 for(let i=0;i<coords.count;i++){
  const u=coords.getX(i)/(W-2)+.5,v=.5-coords.getY(i);
  const bow=Math.sin(Math.PI*v)*(.6*Math.sin(u*13)+.26*Math.cos(u*29));
  coords.setZ(i,coords.getZ(i)+bow);
 }
 clothGeometry.computeVertexNormals();
 const sheet=mesh(fabric,clothGeometry,fabricMat);
 sheet.userData.textile=true;
 const rail=part('rail',0,0,0,0,-104,48);const bar=cylinder(rail,5.6,W-1,metal);bar.scale.y=1.35;
 for(const side of [-1,1])cylinder(rail,5.7,2,plastic,side*(end-.5)).scale.y=1.35;
 function update(drop,explode){
  const {radius,length}=rollState(drop);
  sheet.scale.y=Math.max(.01,length);sheet.position.set(0,-length/2,radius);
  for(const {g,base,delta} of motions){const interval={cover:[0,.47],lock:[.1,.62],bracket:[.25,.84],drive:[.48,1],idle:[.48,1],chain:[.44,1],fabric:[.34,1],rail:[.25,1]}[g.userData.part]??[0,1];
   const phase=T.MathUtils.smoothstep(explode,...interval);
   g.position.copy(base).addScaledVector(delta,phase)}
  rail.position.y-=length+6;rail.position.z+=radius;

  root.updateMatrixWorld(true);
 }
 // Wound cloth has an open bore so the exposed end shows the aluminium tube.

 const rebuildRoll=(drop)=>{const r=rollState(drop).radius;const s=circle(r);hole(s,0,0,spec.tubeRadius);const g=new T.ExtrudeGeometry(s,{depth:W-2,bevelEnabled:false,curveSegments:32});g.rotateY(-Math.PI/2);g.translate(end-1,0,0);roll.geometry.dispose();roll.geometry=g;};
 let lastDrop=-1;
 function pose(drop,explode){if(drop!==lastDrop){rebuildRoll(drop);lastDrop=drop}update(drop,explode)}
 pose(.62,0);return {root,groups,pose,fabricMat};
}
