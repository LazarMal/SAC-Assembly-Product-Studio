import * as T from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createBlind} from './model.js';

// The production page owns UI, state, input, photo registration and configuration.
// This adapter replaces only the neutral/studio product drawing operation.
const scene=new T.Scene(), camera=new T.PerspectiveCamera(35,1,.05,30);
const blind=createBlind();scene.add(blind.root);
const canvas=document.createElement('canvas');
let renderer=null,lastWidth=0,lastHeight=0;
try{
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,preserveDrawingBuffer:true});
  if(gl){
    renderer=new T.WebGLRenderer({canvas,context:gl,alpha:true,antialias:true,preserveDrawingBuffer:true});
    renderer.setClearColor(0,0);renderer.toneMapping=T.NeutralToneMapping;
    renderer.toneMappingExposure=1.05;
    const environment=new RoomEnvironment(),pmrem=new T.PMREMGenerator(renderer);
    scene.environment=pmrem.fromScene(environment,.12).texture;scene.environmentIntensity=.32;
    environment.dispose();pmrem.dispose();
  }
}catch{renderer=null;}
scene.add(new T.HemisphereLight('#ffffff','#858585',.9));
const key=new T.DirectionalLight('#ffffff',1.8);key.position.set(-3,4,5);scene.add(key);
const rim=new T.DirectionalLight('#ffffff',.55);rim.position.set(3,2,-3);scene.add(rim);
const color=v=>'#'+v.map(n=>Math.max(0,Math.min(255,Math.round(n))).toString(16).padStart(2,'0')).join('');
const partMap={headrail:['headrail','mounting','drive','cover','caps'],tapes:'cords'};
let lastSignature='',lastResult={};
// Software fallback projects the same mesh, not a replacement SVG illustration.
// Z sorting is an approximation; WebGL uses the actual depth buffer.
function software(ctx,w,h){
  const faces=[],v=new T.Vector3(),normal=new T.Vector3(),light=new T.Vector3(-.3,.7,1).normalize();
  const normalMatrix=new T.Matrix3(),eye=new T.Vector3(),c=new T.Color();
  scene.traverseVisible(mesh=>{
    if(!mesh.isMesh)return;
    const g=mesh.geometry,p=g.attributes.position,idx=g.index?.array;
    if(!idx)return;
    normalMatrix.getNormalMatrix(mesh.matrixWorld);
    const projected=[],world=[];
    for(let i=0;i<p.count;i++){
      v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);world.push(v.clone());
      v.project(camera);projected.push([(v.x+1)*w/2,(1-v.y)*h/2,v.z]);
    }
    const mat=mesh.material;
    for(let i=0;i<idx.length;i+=3){
      const ai=idx[i],bi=idx[i+1],ci=idx[i+2],a=projected[ai],b=projected[bi],d=projected[ci];
      if(a[2]>1||b[2]>1||d[2]>1)continue;
      normal.subVectors(world[bi],world[ai]).cross(eye.subVectors(world[ci],world[ai])).normalize();
      eye.subVectors(camera.position,world[ai]);if(normal.dot(eye)<=0)continue;
      // Work in sRGB here so ivory stays ivory rather than clipping to white.
      c.copy(mat.color).convertLinearToSRGB();
      const shade=.43+.57*Math.max(0,normal.dot(light));
      const rgb=[c.r,c.g,c.b].map(x=>Math.min(255,Math.round(x*255*shade)));
      if(mat.emissiveIntensity>0&&mat.emissive.getHex()!==0){rgb[0]=Math.min(255,rgb[0]+30);rgb[1]=Math.min(255,rgb[1]+17);}
      faces.push({p:[a,b,d],z:(a[2]+b[2]+d[2])/3,fill:`rgb(${rgb.join(',')})`});
    }
  });
  faces.sort((a,b)=>b.z-a.z);
  for(const face of faces){ctx.beginPath();ctx.moveTo(face.p[0][0],face.p[0][1]);ctx.lineTo(face.p[1][0],face.p[1][1]);ctx.lineTo(face.p[2][0],face.p[2][1]);ctx.closePath();ctx.fillStyle=face.fill;ctx.fill();ctx.strokeStyle=face.fill;ctx.lineWidth=.35;ctx.stroke();}
}
const softCanvas=document.createElement('canvas'),softContext=softCanvas.getContext('2d');
function render(ctx,state,a,w,h,highlight){
  const selected=null; // Color inspection must not be tinted by emissive highlighting.
  const signature=JSON.stringify([w,h,state.size,state.view,state.control,state.side,state.mount,state.tapes,state.guides,selected,a.yaw.toFixed(3),a.pitch.toFixed(3),a.zoom.toFixed(3),a.tilt.toFixed(1),a.raise.toFixed(1),a.explode.toFixed(3),a.assembly.toFixed(3),a.slatColor.map(Math.round),a.hardwareColor.map(Math.round)]);
  if(signature!==lastSignature){
    const e=a.explode,assembly=a.assembly<.999?a.assembly:null;
    blind.update({size:state.size,tilt:a.tilt,raise:a.raise/100,explode:e,assemblyProgress:assembly,color:color(a.slatColor),hardware:color(a.hardwareColor),control:state.control,side:state.side,mount:state.mount,tapes:state.tapes,guides:state.guides,selected});
    blind.root.scale.set(1.9,1.55,1.9);blind.root.rotation.set(a.pitch,a.yaw,0,'XYZ');
    const fit=1-.19*Math.max(e,assembly==null?0:1-assembly);
    const s=Math.min(w/(state.view==='neutral'?4.68:4.56),h/(state.view==='neutral'?3.75:3.56))*a.zoom*fit;
    camera.fov=2*Math.atan(h/(2*s*5.9))*180/Math.PI;camera.aspect=w/h;
    camera.position.set(0,0,5.9);camera.lookAt(0,0,0);camera.updateProjectionMatrix();
    const ox=w*(window.innerWidth<=730?.62:.61),oy=h*.515;
    camera.projectionMatrix.elements[8]=1-2*ox/w;
    camera.projectionMatrix.elements[9]=2*oy/h-1;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    if(w!==lastWidth||h!==lastHeight){
      if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setSize(w,h,false);}
      softCanvas.width=Math.round(w);softCanvas.height=Math.round(h);lastWidth=w;lastHeight=h;
    }
    if(renderer)renderer.render(scene,camera);
    else{softContext.clearRect(0,0,w,h);software(softContext,w,h);}
    const point=(x,y,z)=>{const p=new T.Vector3(x,y,z);blind.root.localToWorld(p);p.project(camera);return {x:(p.x+1)*w/2,y:(1-p.y)*h/2};};
    lastResult={headrail:point(0,.754+e*.07,.04),slats:point(0,.05,.025),control:point(blind.groups.control.position.x,.45,.03),bottomrail:point(0,blind.groups.bottomrail.position.y,.03),guides:point(.615,0,.02),tapes:point(-.39,0,.03)};
    lastSignature=signature;
  }
  ctx.drawImage(renderer?canvas:softCanvas,0,0,w,h);
  drawFeedback(ctx,w,h);
  return lastResult;
}
window.SACModelReview={render,notify:(part)=>notify(part,feedbackNames[part]||part),renderer:renderer?'WebGL2':'software',version:'matched-v3'};

let feedback=null;
const feedbackNames={headrail:'Upper profile',slats:'Slats',bottomrail:'Bottom rail',control:'Control mechanism',tapes:'Ladders / tapes',guides:'Side guides',mounting:'Mounting brackets'};
function notify(part,label,profile=false){feedback={part,label,profile,start:performance.now()};}
function drawFeedback(ctx,w,h){
  if(!feedback)return;
  const age=performance.now()-feedback.start;if(age>1700){feedback=null;document.getElementById('view').dataset.feedback='';return;}
  let objects;
  if(feedback.profile){const slats=blind.groups.slats.children,mid=Math.floor(slats.length*.37);objects=slats.slice(mid,mid+3);}
  else {const ids=partMap[feedback.part]||feedback.part;objects=(Array.isArray(ids)?ids:[ids]).map(k=>blind.groups[k]).filter(Boolean);}
  const bounds=new T.Box3();
  for(const group of objects)group.traverseVisible(o=>{if(o.isMesh){o.geometry.computeBoundingBox();bounds.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld));}});
  if(bounds.isEmpty())return;
  let x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const p=new T.Vector3(x,y,z).project(camera),sx=(p.x+1)*w/2,sy=(1-p.y)*h/2;
    x1=Math.min(x1,sx);x2=Math.max(x2,sx);y1=Math.min(y1,sy);y2=Math.max(y2,sy);
  }
  x1=Math.max(8,x1-8);x2=Math.min(w-8,x2+8);y1=Math.max(8,y1-8);y2=Math.min(h-70,y2+8);
  if(x2<=x1||y2<=y1)return;
  document.getElementById('view').dataset.feedback=feedback.part;
  ctx.save();ctx.globalAlpha=Math.min(1,age/100,(1700-age)/250);
  const path=()=>{ctx.beginPath();ctx.roundRect(x1,y1,x2-x1,y2-y1,7);};
  path();ctx.strokeStyle='rgba(255,255,255,.95)';ctx.lineWidth=5;ctx.stroke();
  path();ctx.strokeStyle='#945c30';ctx.lineWidth=2;ctx.stroke();
  const label=feedback.label+(feedback.profile?' · '+blind.groups.slats.children.length+' slats':'');
  ctx.font='600 12px system-ui';const tw=Math.min(w-32,ctx.measureText(label).width+24);
  const bx=Math.max(8,Math.min(w-tw-8,x1)),by=y1>49?y1-39:Math.min(h-110,y2+12);
  ctx.beginPath();ctx.moveTo(bx+18,by+30);ctx.lineTo(Math.max(x1+10,Math.min(x2-10,bx+18)),y1>49?y1:y2);ctx.strokeStyle='#945c30';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#2f3731';ctx.beginPath();ctx.roundRect(bx,by,tw,30,5);ctx.fill();ctx.fillStyle='#fffaf2';ctx.fillText(label,bx+12,by+20,tw-24);ctx.restore();
}
// Reuse the original controls. Feedback neither changes the camera nor tints a finish.
document.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  if(b.dataset.focus)notify(b.dataset.focus,feedbackNames[b.dataset.focus]||b.dataset.focus);
  else if(b.dataset.size)notify('slats',b.dataset.size+' mm profile',true);
  else if(b.dataset.color)notify('slats',b.getAttribute('aria-label')||'Slat finish');
  else if(b.dataset.hardware)notify('headrail',(b.getAttribute('aria-label')||'')+' hardware');
  else if(b.dataset.control)notify('control',b.textContent.trim());
  else if(b.dataset.side)notify('control',b.textContent.trim()+' control');
  else if(b.dataset.mount)notify('mounting',b.textContent.trim()+' mounting');
  else if(b.id==='tapes')notify('tapes','Ladder tapes');
  else if(b.id==='guides')notify('guides','Side guides');
},true);
document.addEventListener('input',event=>{if(event.target.id==='tilt')notify('slats','Slat tilt · '+event.target.value+'°');if(event.target.id==='raise')notify('bottomrail','Raised · '+event.target.value+'%');},true);
