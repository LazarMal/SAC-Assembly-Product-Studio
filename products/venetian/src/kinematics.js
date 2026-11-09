export const clamp = (n, a=0, b=1) => Math.min(b, Math.max(a,n));
export const smooth = t => {t=clamp(t);return t*t*(3-2*t);};
export const SPEC = {width:1.2, height:1.5, top:.75, railHeight:.055, thickness:.0012};
export function layout(size, raise=0, tilt=25, spread=0) {
  const depth=size/1000, pitch=depth*.86;
  const count=Math.floor((SPEC.height-.085)/pitch);
  const first=SPEC.top-.075, last=first-(count-1)*pitch;
  const bottom=last-.023+clamp(raise)*(count-1)*(pitch-.0045);
  return {depth,pitch,count,first,bottom:bottom-spread*.20, slats:Array.from({length:count},(_,i)=>{
    const rest=first-i*pitch, stack=bottom+.023+(count-1-i)*.0045;
    const packed=stack>rest+.0001;
    return {y:Math.max(rest,stack)-spread*i*.008, angle:(packed?0:tilt*Math.PI/180),packed};
  })};
}
