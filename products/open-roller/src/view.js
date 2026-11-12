import {mountRoom} from './room.js';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createRoller,names,spec} from './model.js';
import {software} from './software.js';
const $=id=>document.getElementById(id),stage=$('stage'),canvas=stage.querySelector('canvas'),model=createRoller();
const camera=new T.PerspectiveCamera(34,1,1,7000),scene=new T.Scene();scene.add(model.root);
let renderer,draw,dirty=true,mode='studio',markerTimer;
try{renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8));const env=new RoomEnvironment();const pm=new T.PMREMGenerator(renderer);scene.environment=pm.fromScene(env,.05).texture;env.dispose();pm.dispose();scene.environmentIntensity=.6;draw=()=>renderer.render(scene,camera)}catch{draw=software(canvas,model.root,camera)}
// Fine woven surface, generated locally and filtered at distance.
if(renderer){
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');
 const data=ctx.createImageData(128,128);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){
  const i=(128*y+x)*4,warp=Math.cos(x*Math.PI/2),weft=Math.cos(y*Math.PI/2);
  const yarn=Math.sin(x*.38+2*Math.sin(y/17))*Math.cos(y*.27);
  const shade=234+9*warp+6*weft+4*warp*weft+3*yarn;
  data.data.set([shade,shade,shade,255],i);
 }
 ctx.putImageData(data,0,0);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
 map.repeat.set(16,12);map.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 model.groups.fabric[0].children[1].material=model.fabricMat.clone();
 const cloth=model.groups.fabric[0].children[1].material;
 cloth.map=map;cloth.bumpMap=map;cloth.bumpScale=.22;
}
scene.add(new T.HemisphereLight(0xffffff,0xa4a092,1.8));const sun=new T.DirectionalLight(0xffffff,2);sun.position.set(300,650,800);scene.add(sun);
const orbit=new OrbitControls(camera,canvas);orbit.minDistance=35;orbit.maxDistance=3700;orbit.enablePan=false;orbit.addEventListener('change',()=>dirty=true);
let drop=.62,e=0,selected='',motion=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function frame(target,distance,direction){orbit.target.copy(target);camera.position.copy(target).addScaledVector(direction.normalize(),distance);orbit.update();dirty=true}
function fit(){if(mode==='room'){mountRoom(stage,camera,spec.width);dirty=true;return}selected='';$('tag').textContent='';for(const b of $('parts').children)b.setAttribute('aria-pressed','false');
 const h=Math.max(455,spec.travel*drop+100),w=spec.width+80+410*e;
 const d=Math.max(h,w/camera.aspect)*1.9;frame(new T.Vector3(0,-h*.42,0),d,new T.Vector3(.31,.18,1))}
function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();if(renderer)renderer.setSize(w,h,false);else{canvas.width=w;canvas.height=h}if(!selected)fit();dirty=true}new ResizeObserver(resize).observe(stage);
function setPose(){model.pose(drop,e);const map=model.groups.fabric[0].children[1].material.map;if(map)map.repeat.y=Math.max(.01,drop*18);dirty=true}
function focus(id){selected=id;$('tag').textContent=names[id];
 const group=model.groups[id].at(-1);const p=new T.Box3().setFromObject(group).getCenter(new T.Vector3());
 const extent={fabric:Math.max(spec.width/camera.aspect,drop*spec.travel)*1.9,chain:920,rail:215,tube:225}[id]??158;
 if(id==='tube'||id==='rail')p.x=model.root.scale.x*(spec.width/2-20);
 frame(p,extent,new T.Vector3((id==='idle'?-1:1)*model.root.scale.x,.38,.85));highlight(group);for(const b of $('parts').children)b.setAttribute('aria-pressed',String(b.dataset.part===id))}
function animate(end,from=e){if(mode==='room')setMode('studio');selected='';e=from;motion={from,end,start:performance.now(),duration:reduced?0:1200};$('explode').setAttribute('aria-pressed',String(end===1));setPose();if(end===1||from===1){e=1;fit();e=from}else fit()}
$('assemble').onclick=()=>animate(0,1);$('explode').onclick=()=>animate(motion?1-motion.end:(e>.5?0:1));
$('fit').onclick=fit;
for(const [id,label] of Object.entries(names)){const b=document.createElement('button');b.textContent=label;b.dataset.part=id;b.onclick=()=>{if(mode==='room')setMode('studio');if(id!=='fabric'&&id!=='rail'&&id!=='chain'){motion=null;e=1;$('explode').setAttribute('aria-pressed','true');setPose()}focus(id)};$('parts').append(b)}
for(const id of ['configTab','partsTab'])$(id).onclick=()=>{const part=id==='partsTab';$('parts').hidden=!part;$('config').hidden=part;$(id).setAttribute('aria-pressed','true');$(part?'configTab':'partsTab').setAttribute('aria-pressed','false')};
function setMode(next){
 mode=next;motion=null;selected='';$('tag').textContent='';$('partMarker').hidden=true;
 for(const id of ['studio','neutral','room'])$(id).setAttribute('aria-pressed',String(id===next));
 stage.classList.toggle('neutral',next==='neutral');stage.classList.toggle('room',next==='room');
 orbit.enabled=next!=='room';
 if(next==='room'){e=0;setPose();$('explode').setAttribute('aria-pressed','false')}
 camera.updateProjectionMatrix();fit();$('help').textContent=next==='room'?'Adjust the drop to see the blind on the window.':'Drag to orbit. Scroll or pinch to zoom.';
}
for(const id of ['studio','neutral','room'])$(id).onclick=()=>setMode(id);
function highlight(group){
 const marker=$('partMarker');clearTimeout(markerTimer);
 const bounds=new T.Box3().setFromObject(group),points=[];
 for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
 const v=new T.Vector3(x,y,z).project(camera);points.push([(v.x+1)*stage.clientWidth/2,(1-v.y)*stage.clientHeight/2])}
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),left=Math.max(4,Math.min(...xs)-4),top=Math.max(4,Math.min(...ys)-4);
 Object.assign(marker.style,{left:left+'px',top:top+'px',width:Math.max(8,Math.min(stage.clientWidth-4,Math.max(...xs)+4)-left)+'px',height:Math.max(8,Math.min(stage.clientHeight-4,Math.max(...ys)+4)-top)+'px'});
 marker.hidden=false;markerTimer=setTimeout(()=>marker.hidden=true,1200);
}
for(const side of ['left','right'])$(side).onclick=()=>{
 model.root.scale.x=side==='left'?-1:1;setPose();
 for(const id of ['left','right'])$(id).setAttribute('aria-pressed',String(id===side));
 if(selected)fit();highlight(model.groups.drive[0]);
};
for(const [i,[name,hex]] of Object.entries([['Sage','#8a928b'],['Linen','#c3b39a'],['Chalk','#e8e3d8'],['Graphite','#494d4a']])){const b=document.createElement('button');b.className='swatch';b.title=name;b.setAttribute('aria-label',name);b.setAttribute('aria-pressed',String(i==='0'));b.style.setProperty('--tone',hex);b.onclick=()=>{model.fabricMat.color.set(hex);model.groups.fabric[0].children[1].material.color.set(hex);dirty=true;for(const other of $('colors').children)other.setAttribute('aria-pressed',String(other===b))};$('colors').append(b)}
$('drop').oninput=()=>{drop=Number($('drop').value)/100;$('value').textContent=Math.round(drop*100)+'%';setPose();if(!selected)fit()};
$('full').onclick=()=>document.fullscreenElement?document.exitFullscreen():stage.requestFullscreen?.();
function tick(now){if(motion){const t=motion.duration?Math.min(1,(now-motion.start)/motion.duration):1;e=T.MathUtils.lerp(motion.from,motion.end,t*t*(3-2*t));setPose();if(t===1){motion=null;fit()}}if(dirty){draw();dirty=false}requestAnimationFrame(tick)}resize();requestAnimationFrame(tick);
