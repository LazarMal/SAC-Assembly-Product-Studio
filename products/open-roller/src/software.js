import * as T from 'three';

// A depth buffer keeps the clutch inside the tube and the layers of cloth opaque
// even in browsers where hardware acceleration is disabled.
export function software(canvas, root, camera) {
 const ctx=canvas.getContext('2d'), light=new T.Vector3(.45,.85,.7).normalize();
 const pos=new T.Vector3(), normal=new T.Vector3(), transform=new T.Matrix4(), normals=new T.Matrix3();
 let pixels, depth;
 return function draw(){
  const w=canvas.width,h=canvas.height;
  if(!pixels || pixels.width!==w || pixels.height!==h){pixels=ctx.createImageData(w,h);depth=new Float32Array(w*h)}
  pixels.data.fill(0);depth.fill(Infinity);camera.updateMatrixWorld();root.updateMatrixWorld(true);
  root.traverse(obj=>{
   if(!obj.isMesh)return;
   transform.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(obj.matrixWorld);
   normals.getNormalMatrix(obj.matrixWorld);
   const g=obj.geometry,pts=g.attributes.position,n=g.attributes.normal,idx=g.index?.array;
   const color=obj.material.color.clone().convertLinearToSRGB().multiplyScalar(255);
   const vertices=Array.from({length:pts.count},(_,i)=>{
    pos.fromBufferAttribute(pts,i).applyMatrix4(transform);normal.fromBufferAttribute(n,i).applyMatrix3(normals).normalize();
    return {x:(pos.x+1)*w/2,y:(1-pos.y)*h/2,z:pos.z,light:.70+.30*Math.max(0,normal.dot(light)),u:g.attributes.uv?.getX(i)??0,v:g.attributes.uv?.getY(i)??0};
   });
   const winding=Math.sign(obj.matrixWorld.determinant());
   for(let j=0;j<(idx?.length??pts.count);j+=3){
    const a=vertices[idx?idx[j]:j],b=vertices[idx?idx[j+1]:j+1],c=vertices[idx?idx[j+2]:j+2];
    const bx=b.x-a.x,by=b.y-a.y,cx=c.x-a.x,cy=c.y-a.y,area=bx*cy-by*cx;
    if(area*winding>=-.0001 || a.z>1||b.z>1||c.z>1||a.z< -1||b.z< -1||c.z< -1)continue;
    const x0=Math.max(0,Math.floor(Math.min(a.x,b.x,c.x))),x1=Math.min(w-1,Math.ceil(Math.max(a.x,b.x,c.x)));
    const y0=Math.max(0,Math.floor(Math.min(a.y,b.y,c.y))),y1=Math.min(h-1,Math.ceil(Math.max(a.y,b.y,c.y)));
    for(let y=y0;y<=y1;y++){const dy=y+.5-a.y;
     for(let x=x0;x<=x1;x++){const dx=x+.5-a.x,u=(dx*cy-dy*cx)/area,v=(bx*dy-by*dx)/area;
      if(u<0||v<0||u+v>1)continue;
      const z=a.z+u*(b.z-a.z)+v*(c.z-a.z),i=y*w+x;
      if(z>=depth[i])continue;depth[i]=z;
      let k=a.light+u*(b.light-a.light)+v*(c.light-a.light);
      if(obj.userData.textile){const across=a.u+u*(b.u-a.u)+v*(c.u-a.u),up=a.v+u*(b.v-a.v)+v*(c.v-a.v);const contact=.085*Math.exp(-Math.max(0,1-up)*23);const yarn=.009*Math.sin(x*1.75)+.007*Math.cos(y*1.26);k+=yarn+.065*across+.025*up-contact}
      const p=i*4;
      pixels.data[p]=color.r*k;pixels.data[p+1]=color.g*k;pixels.data[p+2]=color.b*k;pixels.data[p+3]=255;
     }
    }
   }
  });ctx.putImageData(pixels,0,0);
 };
}
