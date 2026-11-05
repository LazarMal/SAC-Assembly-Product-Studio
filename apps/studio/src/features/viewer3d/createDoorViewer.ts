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
export type DoorPart = 'frame' | 'mesh' | 'pull' | 'guide' | 'seal';
export type CameraPreset = 'front' | 'angle' | 'side' | 'back';
export type LightingMode = 'natural' | 'studio';
export interface DoorViewer {
  configure(config: DoorConfiguration): void;
  setOpen(value: number): void;
  setExploded(value: boolean): void;
  focus(part: DoorPart | null): void;
  resetCamera(): void;
  setCameraPreset(preset: CameraPreset): void;
  setLightingMode(mode: LightingMode): void;
  inspect(part: DoorPart, onPosition: (x: number | null, y: number | null) => void): void;
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
  // Lighting changes never rebuild the product or touch its camera.
  const backdrop = new THREE.Color('#ffffff');
  scene.background = backdrop;
  const camera = new THREE.PerspectiveCamera(36,1,.05,80);
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.7));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.18;
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Rotatable 3D pleated insect door illustration');
  renderer.domElement.style.width='100%';renderer.domElement.style.height='100%';renderer.domElement.style.display='block';
  const orbit = new OrbitControls(camera,renderer.domElement);
  orbit.enableDamping=true;orbit.dampingFactor=.075;orbit.enablePan=false;
  orbit.minDistance=2.1;orbit.maxDistance=12;
  orbit.minPolarAngle=.12;orbit.maxPolarAngle=Math.PI-.2;
  const hemisphere = new THREE.HemisphereLight('#ffffff', '#eeeeee', 2.7);
  scene.add(hemisphere);
  const key = new THREE.DirectionalLight('#ffffff', 2.1);
  key.position.set(-3,5,6);scene.add(key);
  const rim = new THREE.DirectionalLight('#ffffff', .7);
  rim.position.set(4,3,-4);scene.add(rim);
  const groundMaterial = new THREE.MeshStandardMaterial({color:'#f6f6f6',roughness:1});
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200,200),groundMaterial);
  ground.rotation.x=-Math.PI/2;ground.position.y=-.025;scene.add(ground);

  // Studio: clean white backdrop, balanced light. Natural: a subtly darker
  // warm-grey tint akin to the original configurator stage, without changing RAL materials.
  // Display colors are conceptual and not calibrated for manufacturing.
  const lightingPalettes = {
    studio: {
      background:new THREE.Color('#ffffff'), floor:new THREE.Color('#f6f6f6'),
      sky:new THREE.Color('#ffffff'), bounce:new THREE.Color('#eeeeee'),
      key:new THREE.Color('#ffffff'), rim:new THREE.Color('#ffffff'),
      hemisphere:2.7, keyPower:2.1, rimPower:.7, exposure:1.18
    },
    natural: {
      background:new THREE.Color('#d4ccc1'), floor:new THREE.Color('#c7bdb2'),
      sky:new THREE.Color('#fff9f3'), bounce:new THREE.Color('#b8aa9c'),
      key:new THREE.Color('#fff3e8'), rim:new THREE.Color('#e1e7ea'),
      hemisphere:2.35, keyPower:2.5, rimPower:.9, exposure:1.14
    }
  } satisfies Record<LightingMode, {
    background:THREE.Color; floor:THREE.Color; sky:THREE.Color;
    bounce:THREE.Color; key:THREE.Color; rim:THREE.Color;
    hemisphere:number; keyPower:number; rimPower:number; exposure:number;
  }>;
  let lightingMode: LightingMode = 'studio';
  function setLightingMode(next: LightingMode) {
    lightingMode = next;
  }
  const product=new THREE.Group();scene.add(product);
  let config=initial;let width=1;let height=2;let leaves:Leaf[]=[];
  let openTarget=.32,openCurrent=.32,explodedTarget=0,explodeCurrent=0,chosen:DoorPart|null=null;
  let parts:Record<DoorPart,THREE.Mesh[]>={frame:[],mesh:[],pull:[],guide:[],seal:[]};
  let frameSegments:{mesh:THREE.Mesh;offset:THREE.Vector3}[]=[];
  let originalMaterials=new Map<THREE.Mesh,THREE.MeshStandardMaterial>();
  let disposed=false,visible=true,frameId=0;
  const thumb=new THREE.Vector3();
  let desiredCamera: THREE.Vector3 | null = null;
  let desiredTarget: THREE.Vector3 | null = null;
  let currentCamera: CameraPreset = 'angle';
  type Inspection = {
    until: number;
    anchor: THREE.Vector3;
    returnPosition: THREE.Vector3;
    returnTarget: THREE.Vector3;
    onPosition: (x: number | null, y: number | null) => void;
  };
  let inspection: Inspection | null = null;
  function finishInspection(restore: boolean) {
    if (!inspection) return;
    const current = inspection;
    inspection = null;
    current.onPosition(null, null);
    chosen = null;
    applyPartFocus();
    orbit.minDistance = 2.1;
    if (restore) {
      desiredCamera = current.returnPosition;
      desiredTarget = current.returnTarget;
    }
  }
  // Dragging, pinching or wheel input always takes priority over a cinematic preview.
  orbit.addEventListener('start', () => {
    finishInspection(false);
    desiredCamera = null;
    desiredTarget = null;
  });
  function clearProduct(){
    const usedMaterials = new Set<THREE.Material>();
    product.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();const mats=Array.isArray(obj.material)?obj.material:[obj.material];mats.forEach(m=>usedMaterials.add(m))}});
    usedMaterials.forEach(material => material.dispose());
    product.clear();parts={frame:[],mesh:[],pull:[],guide:[],seal:[]};frameSegments=[];leaves=[];originalMaterials.clear();
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
    const paint=edgeMaterial(RAL_SWATCHES[config.frameColor] ?? '#383f43');
    const guide=edgeMaterial(config.guideFinish==='black'?'#22272a':config.guideFinish==='grey'?'#838583':'#bcbcb7');
    const pullMat=edgeMaterial(RAL_SWATCHES[config.frameColor]||'#383f43');
    const rail=.038,depth=.065;
    frameBar(width+rail*2,rail,depth,0,height+rail/2,0,paint,new THREE.Vector3(0,.24,0));
    frameBar(width+rail*2,rail,depth,0,-rail/2,0,guide,new THREE.Vector3(0,-.18,0));
    frameBar(rail,height,depth,-width/2-rail/2,height/2,0,paint,new THREE.Vector3(-.18,0,0));
    frameBar(rail,height,depth,width/2+rail/2,height/2,0,paint,new THREE.Vector3(.18,0,0));
    const pathW=width;
    // Readable concept-level threshold profiles rather than a tiny thickness change.
    // The tilted wedge communicates the slope, not a verified manufacturing section.
    if (config.guideShape === 'slope') {
      const shape = new THREE.Shape();
      shape.moveTo(-.060, 0);
      shape.lineTo(.060, 0);
      shape.lineTo(.060, .010);
      shape.lineTo(-.060, .047);
      shape.closePath();
      const wedge = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false }),
        guide
      );
      wedge.rotation.y = Math.PI / 2;
      wedge.position.set(-width / 2, .005, 0);
      register(wedge, 'guide');
    } else {
      const threshold = register(makeBar(width, .018, .095, guide), 'guide');
      threshold.position.set(0, .015, 0);
    }
    const guideThickness=config.guideShape==='slope'?.029:.018;
    for(const z of [-.035,.035]) {
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
      // Enlarged illustrative details: magnetic strip vs flexible brush bristles.
      const sealX = config.variant==='double' ? 0
        : (config.stackSide==='right' ? -width/2 + .045 : width/2 - .045);
      const sealMat = new THREE.MeshStandardMaterial({
        color:config.extra==='magnet'?'#a77d49':'#4a4137',
        metalness:config.extra==='magnet'?.3:0,roughness:.7
      });
      const strip=register(makeBar(.018,height-.12,.032,sealMat),'seal');
      strip.position.set(sealX,height/2,.072);
      if(config.extra==='brush'){
        const bristleMat=new THREE.MeshStandardMaterial({color:'#675749',roughness:1});
        // Instancing avoids dozens of draw calls and keeps component highlighting consistent.
        const geo=new THREE.BoxGeometry(.022,.012,.005);
        const bristles=new THREE.InstancedMesh(geo,bristleMat,52);
        const matrix=new THREE.Matrix4();
        for(let i=0;i<52;i++){
          matrix.makeTranslation(sealX+.022,.10+(height-.20)*i/51,.093);
          bristles.setMatrixAt(i,matrix);
        }
        bristles.instanceMatrix.needsUpdate=true;
        register(bristles as unknown as THREE.Mesh,'seal');
      }
    }
    applyPartFocus();
  }
  function applyPartFocus(){
    for(const [type,meshes] of Object.entries(parts) as [DoorPart,THREE.Mesh[]][]){
      for(const mesh of meshes){
        const material=originalMaterials.get(mesh);
        if(material) {material.emissive.set(chosen===type?'#64552d':'#000000');material.emissiveIntensity=chosen===type?.27:0;}
      }
    }
  }
  function setCameraPreset(preset: CameraPreset){
    finishInspection(false);
    currentCamera = preset;
    const distance = Math.max(3.9, width*2.1, height*2.25);
    const directions: Record<CameraPreset, [number, number, number]> = {
      front: [0, .10, 1],
      angle: [.52, .20, 1],
      side: [1, .09, .015],
      back: [0, .10, -1]
    };
    const direction = directions[preset];
    const basis = new THREE.Vector3(...direction).normalize();
    desiredTarget = new THREE.Vector3(0, height * .51, 0);
    desiredCamera = desiredTarget.clone().addScaledVector(basis, distance);
  }
  function resetCamera(){
    setCameraPreset('angle');
  }
  function inspect(part: DoorPart, onPosition: (x: number | null, y: number | null) => void) {
    // Any new selection replaces the previous preview and never accumulates timers.
    finishInspection(false);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anchor = part === 'guide' ? new THREE.Vector3(0, .045, .10)
      : part === 'seal' ? new THREE.Vector3(
          config.variant === 'double' ? 0 : (config.stackSide === 'right' ? -width/2+.045 : width/2-.045),
          height*.52, .09
        )
      : part === 'frame' ? new THREE.Vector3(-width*.5, height*.74, .05)
      : part === 'pull' ? new THREE.Vector3(0, height*.55, .075)
      : new THREE.Vector3(0, height*.55, .03);
    inspection = {
      until: performance.now() + (reduced ? 1900 : 2850),
      anchor,
      returnPosition: camera.position.clone(),
      returnTarget: orbit.target.clone(),
      onPosition
    };
    chosen = (part === 'seal' && parts.seal.length === 0) ? 'pull' : part;
    applyPartFocus();
    if (!reduced) {
      orbit.minDistance = .55;
      const direction = new THREE.Vector3(.45,.32,1).normalize();
      const distance = part === 'guide' ? 1.20 : part === 'seal' ? 1.30 : 1.65;
      desiredTarget = anchor.clone();
      desiredCamera = anchor.clone().addScaledVector(direction, distance);
    }
  }
  function animate(){
    if(disposed)return;
    frameId=requestAnimationFrame(animate);
    if(!visible || document.hidden)return;
    openCurrent+=(openTarget-openCurrent)*.12;
    explodeCurrent+=(explodedTarget-explodeCurrent)*.11;
    const light = lightingPalettes[lightingMode];
    const blend = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : .085;
    backdrop.lerp(light.background, blend);
    groundMaterial.color.lerp(light.floor, blend);
    hemisphere.color.lerp(light.sky, blend);
    hemisphere.groundColor.lerp(light.bounce, blend);
    key.color.lerp(light.key, blend);
    rim.color.lerp(light.rim, blend);
    hemisphere.intensity += (light.hemisphere - hemisphere.intensity) * blend;
    key.intensity += (light.keyPower - key.intensity) * blend;
    rim.intensity += (light.rimPower - rim.intensity) * blend;
    renderer.toneMappingExposure += (light.exposure - renderer.toneMappingExposure) * blend;
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
    if (desiredCamera && desiredTarget) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const step = reduced ? 1 : .095;
      camera.position.lerp(desiredCamera, step);
      orbit.target.lerp(desiredTarget, step);
      if (camera.position.distanceToSquared(desiredCamera) < .000008 && orbit.target.distanceToSquared(desiredTarget) < .000008) {
        camera.position.copy(desiredCamera);
        orbit.target.copy(desiredTarget);
        desiredCamera = null;
        desiredTarget = null;
      }
    }
    orbit.update();
    if (inspection) {
      const now = performance.now();
      if (now >= inspection.until) {
        finishInspection(true);
      } else {
        const projected = inspection.anchor.clone().project(camera);
        const x = (projected.x * .5 + .5) * host.clientWidth;
        const y = (.5 - projected.y * .5) * host.clientHeight;
        inspection.onPosition(
          Math.max(100, Math.min(host.clientWidth-100, x)),
          Math.max(110, Math.min(host.clientHeight-30, y))
        );
      }
    }
    renderer.render(scene,camera);
  }
  // Populate baseline coordinates for animation, without mutating geometry.
  const originalRebuild=rebuild;
  function configure(next:DoorConfiguration){
    const sizeChanged = next.width !== config.width || next.height !== config.height;
    config = next;
    originalRebuild();
    for(const part of frameSegments){part.mesh.userData.x0=part.mesh.position.x;part.mesh.userData.y0=part.mesh.position.y;}
    // Changing a frame finish must never unexpectedly rotate or zoom the camera.
    if (sizeChanged) setCameraPreset(currentCamera);
  }
  const resize=new ResizeObserver(()=>{
    const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  });
  const observe=new IntersectionObserver(entries=>{visible=Boolean(entries[0]?.isIntersecting)},{threshold:.01});
  resize.observe(host);observe.observe(host);
  configure(initial);
  const startDistance = Math.max(3.9, width*2.1, height*2.25);
  orbit.target.set(0, height*.51, 0);
  camera.position.set(startDistance*.46, height*.68, startDistance*.87);
  camera.lookAt(orbit.target);
  setCameraPreset('angle');
  animate();
  return{
    configure,
    setOpen(v){openTarget=clamp(v,0,1)},
    setExploded(v){explodedTarget=v?1:0},
    focus(p){chosen=p;applyPartFocus()},
    resetCamera,
    setCameraPreset,
    setLightingMode,
    inspect,
    dispose(){if(disposed)return;finishInspection(false);disposed=true;cancelAnimationFrame(frameId);resize.disconnect();observe.disconnect();orbit.dispose();clearProduct();ground.geometry.dispose();(ground.material as THREE.Material).dispose();renderer.dispose();renderer.domElement.remove();}
  };
}
