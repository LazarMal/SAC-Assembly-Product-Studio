import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export const RAL_SWATCHES: Record<string,string> = {
  RAL7013:'#57564c', RAL7016:'#383f43', RAL7039:'#646158',
  RAL9001:'#e6e1cf', RAL9005:'#161b1c', RAL9010:'#f0efe8', RAL9016:'#f4f6f3'
};
export type DoorConfiguration = {
  variant: 'single' | 'double';
  width: number;
  height: number;
  frameColor: string;
  guideShape: 'straight' | 'slope';
  guideFinish: 'grey' | 'aluminium' | 'black';
  extra: 'none' | 'brush' | 'magnet';
  stackSide: 'left' | 'right';
};
export type DoorPart = 'frame' | 'mesh' | 'pull' | 'guide';
export interface DoorViewer {
  configure(config: DoorConfiguration): void;
  setOpen(value: number): void;
  setExploded(value: boolean): void;
  focus(part: DoorPart | null): void;
  resetCamera(): void;
  dispose(): void;
}
type Leaf = { folds: THREE.Mesh[]; pull: THREE.Mesh; fromLeft: boolean };
const clamp = (v:number,min:number,max:number) => Math.max(min,Math.min(max,v));
const edgeMaterial = (color: string) => new THREE.MeshStandardMaterial({color,metalness:.69,roughness:.3});
const meshMaterial = () => new THREE.MeshStandardMaterial({color:'#a1a6a0',transparent:true,opacity:.68,side:THREE.DoubleSide,roughness:.85,metalness:.0,depthWrite:false});
const makeBar=(w:number,h:number,d:number,material:THREE.Material) => new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);

/**
 * Lightweight procedural *concept* geometry. The viewer is genuine WebGL/Three.js, not CAD
 * and not a manufacturing-verified representation of the KeJe or S.A.C. assembly.
 * Scene state is private to the viewer; React owns the configuration.
 */
export function createDoorViewer(host: HTMLElement, initial: DoorConfiguration): DoorViewer {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#e8e5df');
  const camera = new THREE.PerspectiveCamera(36,1,.05,80);
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.35;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Rotatable 3D pleated insect door illustration');
  renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';renderer.domElement.style.display='block';
  const orbit = new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;orbit.dampingFactor=.075;orbit.enablePan=false;
  orbit.minDistance=2.1;orbit.maxDistance=12;
  orbit.minPolarAngle=.12;orbit.maxPolarAngle=Math.PI-.2;
  scene.add(new THREE.HemisphereLight('#ffffff','#a39b90',2.2));
  const key=new THREE.DirectionalLight('#fff7e9',3.0);key.position.set(-3,5,6);scene.add(key);
  const rim=new THREE.DirectionalLight('#d9e8ff',1.1);rim.position.set(4,3,-4);scene.add(rim);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:'#dcd8d0',roughness:1}));
  ground.rotation.x=-Math.PI/2;ground.position.y=-.025;scene.add(ground);
  const product=new THREE.Group();scene.add(product);
  let config=initial;let width=1;let height=2;let leaves:Leaf[]=[];
  let openTarget=.32,openCurrent=.32,explodedTarget=0,explodeCurrent=0,chosen:DoorPart|null=null;
  let parts:Record<DoorPart,THREE.Mesh[]>={frame:[],mesh:[],pull:[],guide:[]};
  let frameSegments:{mesh:THREE.Mesh;offset:THREE.Vector3}[]=[];
  let originalMaterials=new Map<THREE.Mesh,THREE.MeshStandardMaterial>();
  let disposed=false,visible=true,frameId=0;
  const thumb=new THREE.Vector3();
  function clearProduct(){
    product.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>m.dispose())}});
    product.clear();parts={frame:[],mesh:[],pull:[],guide:[]};frameSegments=[];leaves=[];originalMaterials.clear();
  }
  function register(mesh:THREE.Mesh,type:DoorPart){
    parts[type].push(mesh);
    const mat=mesh.material;
    if(mat instanceof THREE.MeshStandardMaterial)originalMaterials.set(mesh,mat);
    product.add(mesh);
    return mesh;
  }
  function frameBar(w:number,h:number,d:number,x:number,y:number,z:number,mat:THREE.Material, offset:THREE.Vector3){
    const mesh=register(makeBar(w,h,d,mat),'frame');mesh.position.set(x,y,z);
    frameSegments.push({mesh,offset});return mesh;
  }
  function rebuild(){
    clearProduct();
    width=clamp(config.width/1000,.5,4.5);
    height=clamp(config.height/1000,1.1,3.7);
    const paint=edgeMaterial(RAL_SWATCHES[config.frameColor]||RAL_SWATCHES.RAL7016);
    const guide=edgeMaterial(config.guideFinish==='black'?'#22272a':config.guideFinish==='grey'?'#838583':'#bcbcb7');
    const pullMat=edgeMaterial(RAL_SWATCHES[config.frameColor]||'#383f43');
    const rail=.038,depth=.065;
    frameBar(width+rail*2,rail,depth,0,height+rail/2,0,paint,new THREE.Vector3(0,.24,0));
    frameBar(width+rail*2,rail,depth,0,-rail/2,0,guide,new THREE.Vector3(0,-.18,0));
    frameBar(rail,height,depth,-width/2-rail/2,height/2,0,paint,new THREE.Vector3(-.18,0,0));
    frameBar(rail,height,depth,width/2+rail/2,height/2,0,paint,new THREE.Vector3(.18,0,0));
    const pathW=width;
    const guideThickness=config.guideShape==='slope'?.021:.013;
    for(const z of [-.025,.025]) {
      const runner=register(makeBar(pathW,.009,guideThickness,guide),'guide');
      runner.position.set(0,.026,z);
      const top=register(makeBar(pathW,.009,guideThickness,guide),'guide');
      top.position.set(0,height-.02,z);
    }
    const eachWidth= config.variant==='double'?width/2:width;
    const sides=config.variant==='double'?[true,false]:[config.stackSide!=='right'];
    for(let index=0;index<sides.length;index++){
      const fromLeft=sides[index]!;
      const left=config.variant==='double'?(index===0?-width/2:0):-width/2;
      const right=left+eachWidth;
      const folds:THREE.Mesh[]=[];
      const count=36;
      for(let j=0;j<count;j++){
        const fold=register(makeBar(eachWidth/count+.008,height-.095,.004,meshMaterial()),'mesh');
        fold.rotation.y=(j%2===0?.13:-.13);
        fold.position.y=height/2;folds.push(fold);
      }
      const sliding=register(makeBar(.038,height-.035,.08,pullMat),'pull');
      sliding.position.y=height/2;
      leaves.push({folds,pull:sliding,fromLeft});
      // Base dimensions remain fixed; opening only changes mesh travel.
      for(const fold of folds)fold.userData={left,right};
      sliding.userData={left,right};
    }
    if(config.extra!=='none'){
      const mat=new THREE.MeshStandardMaterial({color:config.extra==='magnet'?'#343635':'#565855',metalness:.2,roughness:.85});
      const edge=register(makeBar(.007,height-.11,.017,mat),'guide');
      edge.position.set(config.variant==='double'?0:(config.stackSide==='right'?-width/2:width/2),height/2,.055);
    }
    applyPartFocus();
    resetCamera();
  }
  function applyPartFocus(){
    for(const [type,meshes] of Object.entries(parts) as [DoorPart,THREE.Mesh[]][]){
      for(const mesh of meshes){
        const material=originalMaterials.get(mesh);
        if(material) {material.emissive.set(chosen===type?'#64552d':'#000000');material.emissiveIntensity=chosen===type?.27:0;}
      }
    }
  }
  function resetCamera(){
    orbit.target.set(0,height*.51,0);
    const distance=Math.max(3.7,width*2.0,height*2.1);
    camera.position.set(distance*.55,height*.72,distance);
    camera.lookAt(orbit.target);orbit.update();
  }
  function animate(){
    if(disposed)return;
    frameId=requestAnimationFrame(animate);
    if(!visible || document.hidden)return;
    openCurrent+=(openTarget-openCurrent)*.12;
    explodeCurrent+=(explodedTarget-explodeCurrent)*.11;
    const t=clamp(openCurrent,0,1);
    for(const leaf of leaves){
      const first=leaf.folds[0]?.userData;
      if(!first)continue;
      const {left,right}=first as {left:number;right:number};
      const span=right-left;
      const coverage=span*(1-t*.88);
      const start=leaf.fromLeft?left:right;
      const direction=leaf.fromLeft?1:-1;
      leaf.folds.forEach((fold,i)=>{
        fold.position.x=start+direction*(i+.5)/leaf.folds.length*coverage;
        fold.scale.x=Math.max(.16,coverage/span);
        fold.position.z=.007+Math.sin(i*.9)*.007+explodeCurrent*.16;
      });
      leaf.pull.position.x=start+direction*coverage;
      leaf.pull.position.z=.012+explodeCurrent*.24;
    }
    for(const bar of frameSegments){
      bar.mesh.position.copy(thumb.copy(bar.offset).multiplyScalar(explodeCurrent).add(new THREE.Vector3(
        bar.mesh.userData.x0 as number||0,
        bar.mesh.userData.y0 as number||0,
        0
      )));
    }
    orbit.update();renderer.render(scene,camera);
  }
  // Populate baseline coordinates for animation, without mutating geometry.
  const originalRebuild=rebuild;
  function configure(next:DoorConfiguration){
    config=next;originalRebuild();
    for(const part of frameSegments){part.mesh.userData.x0=part.mesh.position.x;part.mesh.userData.y0=part.mesh.position.y;}
  }
  const resize=new ResizeObserver(()=>{
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  });
  const observe=new IntersectionObserver(entries=>{visible=Boolean(entries[0]?.isIntersecting)},{threshold:.01});
  resize.observe(host);observe.observe(host);
  configure(initial);animate();
  return{
    configure,
    setOpen(v){openTarget=clamp(v,0,1)},
    setExploded(v){explodedTarget=v?1:0},
    focus(p){chosen=p;applyPartFocus()},
    resetCamera,
    dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(frameId);resize.disconnect();observe.disconnect();orbit.dispose();clearProduct();ground.geometry.dispose();(ground.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
