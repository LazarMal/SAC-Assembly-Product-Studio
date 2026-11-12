// Pixel coordinates in the catalog's original 1085 × 884 interior photograph.
// Projection and backdrop use the same transform at every viewport size.
export function mountRoom(stage,camera,width){
 const w=stage.clientWidth,h=stage.clientHeight;
 const scale=Math.min(h/884,w/620);
 const left=(w-1085*scale)*.68,top=(h-884*scale)/2;
 stage.style.setProperty('--room-size',1085*scale+'px '+884*scale+'px');
 stage.style.setProperty('--room-position',left+'px '+top+'px');
 const axisX=left+739*scale,axisY=top+86*scale;
 const pixelsPerMm=495*scale/(width+40);
 camera.position.set(0,0,1800);camera.up.set(0,1,0);camera.lookAt(0,0,0);
 camera.projectionMatrix.makeOrthographic(-axisX/pixelsPerMm,(w-axisX)/pixelsPerMm,axisY/pixelsPerMm,(axisY-h)/pixelsPerMm,1,7000);
 camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();camera.updateMatrixWorld();
}
