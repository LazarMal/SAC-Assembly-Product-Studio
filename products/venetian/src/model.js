import * as T from 'three';
import {SPEC,layout,smooth} from './kinematics.js';

// All dimensions are metres. Reference-led proportions, not a manufacturing CAD.
export function createBlind() {
  const root=new T.Group(); root.name='Venetian';
  const groups={},materials={},slats=[],rungs=[],verticals=[];
  const mat=(name,color,metalness=.35,roughness=.38)=>materials[name]=new T.MeshStandardMaterial({color,metalness,roughness});
  mat('slats','#d0bca1',.05,.68);mat('hardware','#dfd8cc',.12,.62);mat('metal','#a4a6a3',.8,.24);mat('mechanism','#626462',.3,.45);mat('cord','#8f806d',0,.95);mat('tape','#8c7963',0,.95);mat('black','#313532',.1,.5);
  const group=(id)=>{const g=new T.Group();g.name=id;root.add(g);groups[id]=g;return g;};
  const mounting=group('mounting'),head=group('headrail'),drive=group('drive'),cover=group('cover'),caps=group('caps'),blind=group('slats'),bottom=group('bottomrail'),cords=group('cords'),control=group('control'),guides=group('guides');
  function mesh(geo,material,parent,pos=[0,0,0]){const m=new T.Mesh(geo,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;m.userData.part=parent.name;parent.add(m);return m;}
  function box(w,h,d,m,g,p){return mesh(new T.BoxGeometry(w,h,d),m,g,p);}
  function cyl(r,h,m,g,p,axis='y'){const c=mesh(new T.CylinderGeometry(r,r,h,10),m,g,p);if(axis==='x')c.rotation.z=Math.PI/2;if(axis==='z')c.rotation.x=Math.PI/2;return c;}
  function cable(a,b,r,m,g){const c=cyl(r,1,m,g);setCable(c,a,b);return c;}
  function setCable(c,a,b){const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.sub(av);c.position.copy(av).addScaledVector(v,.5);c.scale.y=Math.max(v.length(),.00001);c.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
  const screw=(g,x,y,z,axis='y')=>{cyl(.005,.003,materials.metal,g,[x,y,z],axis);const s=box(.006,.001,.001,materials.black,g,[x,y+.002,z]);if(axis==='z'){s.position.set(x,y,z+.002);s.rotation.x=Math.PI/2;}};
  // Two separate ceiling/wall mounting brackets; holes and fasteners remain inspectable.
  const wallPlates=[];
  for(const x of [-.39,.39]){
    box(.048,.004,.080,materials.metal,mounting,[x,.796,-.006]);
    wallPlates.push(box(.048,.065,.004,materials.metal,mounting,[x,.765,-.045]));
    box(.048,.012,.004,materials.metal,mounting,[x,.789,.034]);
    screw(mounting,x,.800,-.015);screw(mounting,x,.763,-.041,'z');
  }
  // Open U-section with its own removable fascia, end caps and internal tilt shaft.
  box(1.226,.003,.061,materials.hardware,head,[0,.730,0]);
  box(1.226,.052,.003,materials.hardware,head,[0,.755,-.030]);
  box(1.226,.052,.003,materials.hardware,head,[0,.755,.030]);
  for(const z of [-.025,.025])box(1.226,.003,.010,materials.hardware,head,[0,.780,z]);
  box(1.240,.061,.006,materials.hardware,cover,[0,.753,.038]);
  box(1.238,.003,.007,materials.hardware,cover,[0,.724,.036]);
  for(const x of [-.618,.618])box(.008,.056,.064,materials.hardware,caps,[x,.754,0]);
  cyl(.004,1.17,materials.metal,drive,[0,.756,0],'x');
  for(const x of [-.39,.39]){
    cyl(.013,.042,materials.mechanism,drive,[x,.756,0],'x');
    for(const dx of [-.024,.024])cyl(.017,.003,materials.hardware,drive,[x+dx,.756,0],'x');
    box(.055,.011,.042,materials.mechanism,drive,[x,.737,0]);
  }
  const bottomBody=box(1.205,.020,.048,materials.hardware,bottom,[0,0,0]);
  for(const x of [-.604,.604])box(.007,.021,.049,materials.mechanism,bottom,[x,0,0]);
  const wand=new T.Group();wand.name='control';control.add(wand);
  box(.034,.035,.037,materials.hardware,wand,[0,.744,0]);
  const wandLink=box(.058,.009,.014,materials.metal,control,[.029,.745,0]);
  cyl(.005,.035,materials.metal,wand,[0,.710,.018]);
  cyl(.004,.510,materials.hardware,wand,[0,.440,.022]);
  cyl(.007,.055,materials.hardware,wand,[0,.163,.022]);
  const chain=new T.Group();chain.name='control';control.add(chain);
  box(.032,.035,.037,materials.hardware,chain,[0,.744,0]);
  for(let i=0;i<88;i++){
    const t=i/88, y=t<.45?.724-t/.45*.50:t<.55?.224-Math.sin((t-.45)/.1*Math.PI)*.011:t<1?.224+(t-.55)/.45*.50:.724;
    const x=t<.45?-.011:t<.55?-Math.cos((t-.45)/.1*Math.PI)*.011:.011;
    mesh(new T.SphereGeometry(.0033,6,4),materials.hardware,chain,[x,y,.025]);
  }
  for(const x of [-.011,.011])cable([x,.724,.025],[x,.224,.025],.0007,materials.cord,chain);
  const tapeMeshes=[];
  for(const x of [-.39,.39])for(const z of [-1,1]){
    verticals.push({x,z,mesh:cyl(.0008,1,materials.cord,cords)});
    tapeMeshes.push({x,z,mesh:box(.018,1,.001,materials.tape,cords)});
  }
  for(const x of [-.612,.612]){
    box(.014,1.47,.006,materials.hardware,guides,[x,-.015,.017]);
    box(.004,1.47,.026,materials.hardware,guides,[x,-.015,.004]);
  }
  let currentSize=0;
  function slatGeometry(depth){
    // Thin crowned profile, closed volume. Eight cross-section segments prevent flat-card slats.
    const positions=[],indices=[],segments=8;
    for(const x of [-.6,.6])for(const side of [1,-1])for(let i=0;i<=segments;i++){
      const z=-depth/2+depth*i/segments, crown=depth*.045*(1-(2*z/depth)**2);
      positions.push(x,crown+side*SPEC.thickness/2,z);
    }
    const n=segments+1,quad=(a,b,c,d)=>indices.push(a,b,d,b,c,d);
    for(let i=0;i<segments;i++){quad(i,2*n+i,2*n+i+1,i+1);quad(n+i,n+i+1,3*n+i+1,3*n+i);quad(i,i+1,n+i+1,n+i);quad(2*n+i,3*n+i,3*n+i+1,2*n+i+1);}
    quad(0,n,3*n,2*n);quad(n-1,3*n-1,4*n-1,2*n-1);
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));for(let i=0;i<indices.length;i+=3){const t=indices[i+1];indices[i+1]=indices[i+2];indices[i+2]=t;}g.setIndex(indices);
    // Split cap/edge vertices from broad faces. Averaged cap normals previously
    // bent reflections across the entire slat and produced apparent streaks.
    const split=g.toNonIndexed(),pos=split.attributes.position,normals=[],order=[];
    const va=new T.Vector3(),vb=new T.Vector3(),vc=new T.Vector3(),normal=new T.Vector3();
    for(let i=0;i<pos.count;i+=3){
      va.fromBufferAttribute(pos,i);vb.fromBufferAttribute(pos,i+1);vc.fromBufferAttribute(pos,i+2);
      normal.subVectors(vb,va).cross(vc.sub(va)).normalize();
      for(let j=0;j<3;j++){
        if(Math.abs(normal.y)>.8){
          const sign=Math.sign(normal.y),z=pos.getZ(i+j);
          const n=new T.Vector3(0,sign,sign*.36*z/depth).normalize();normals.push(n.x,n.y,n.z);
        }else normals.push(normal.x,normal.y,normal.z);
        order.push(i+j);
      }
    }
    split.setAttribute('normal',new T.Float32BufferAttribute(normals,3));split.setIndex(order);g.dispose();return split;
  }
  function rebuild(size){
    for(const m of slats){blind.remove(m);}if(slats[0])slats[0].geometry.dispose();slats.length=0;
    for(const r of rungs){cords.remove(r.mesh);r.mesh.geometry.dispose();}rungs.length=0;
    const l=layout(size),geo=slatGeometry(l.depth);
    for(let i=0;i<l.count;i++){
      slats.push(mesh(geo,materials.slats,blind));
      for(const x of [-.39,.39])rungs.push({i,x,mesh:cyl(.00065,1,materials.cord,cords)});
    }currentSize=size;
  }
  function update(s){
    if(s.size!==currentSize)rebuild(s.size);
    const e=s.explode,p=s.assemblyProgress;
    const staged=(a,b)=>p==null?e:1-smooth((p-a)/(b-a));
    const mountE=staged(0,.22), headE=staged(.08,.32), driveE=staged(.22,.46), skinE=staged(.34,.56), slatE=staged(.46,.80), controlE=staged(.76,1);
    const l=layout(s.size,s.raise,s.tilt,slatE);
    mounting.position.y=mountE*.26; mounting.position.z=-mountE*.10;
    head.position.y=headE*.07;drive.position.y=driveE*.19;cover.position.z=skinE*.29;
    caps.children.forEach((c,i)=>c.position.x=(i===0?-1:1)*(.618+skinE*.19));
    caps.position.y=skinE*.07;
    slats.forEach((m,i)=>{m.position.y=l.slats[i].y;m.rotation.x=l.slats[i].angle;});
    bottom.position.y=l.bottom-(l.count-1)*slatE*.008;bottom.scale.z=s.size/50;
    const low=bottom.position.y+.012,d=l.depth/2+.0015,angle=s.tilt*Math.PI/180*(1-s.raise);
    for(const v of verticals){const z=v.z*d*Math.cos(angle),offset=-v.z*d*Math.sin(angle);setCable(v.mesh,[v.x,.725, v.z*d],[v.x,low+offset,z]);v.mesh.visible=!s.tapes;}
    for(const t of tapeMeshes){t.mesh.visible=s.tapes;t.mesh.position.set(t.x,(.725+low)/2,t.z*d+Math.max(0,e)*.025);t.mesh.scale.y=.725-low;}
    for(const r of rungs){const p=l.slats[r.i],a=p.angle;setCable(r.mesh,[r.x,p.y+d*Math.sin(a)-.001,-d*Math.cos(a)],[r.x,p.y-d*Math.sin(a)-.001,d*Math.cos(a)]);}
    control.position.x=(s.side==='left'?-1:1)*(.645+controlE*.21);control.position.z=controlE*.075;
    wandLink.position.x=s.side==='left'?.029:-.029;
    wand.visible=s.control==='wand';chain.visible=s.control==='chain';
    guides.visible=s.guides;wallPlates.forEach(m=>m.visible=s.mount==='wall');
    materials.slats.color.set(s.color);materials.slats.metalness=['#a4abaa','#9ba3a4'].includes(s.color)?.22:.05;
    materials.hardware.color.set(s.hardware);
    // Highlight is applied by component, with cloned materials only when needed.
    root.traverse(o=>{if(!o.isMesh)return;if(!o.userData.original)o.userData.original=o.material;
      const selected=Array.isArray(s.selected)?s.selected.includes(o.userData.part):s.selected&&o.userData.part===s.selected;
      if(selected){if(!o.userData.highlight){o.userData.highlight=o.userData.original.clone();o.userData.highlight.emissive.set('#a87536');o.userData.highlight.emissiveIntensity=.32;}o.material=o.userData.highlight;o.material.color.copy(o.userData.original.color);}
      else o.material=o.userData.original;
    });
    return l;
  }
  return {root,groups,materials,update};
}
