import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { definition } from '../products/idd/definition';
import { validateSelection } from '../features/configurator/validate';
import type { DoorConfiguration, DoorPart, DoorViewer } from '../features/viewer3d/createDoorViewer';

const defaults:DoorConfiguration = {
  variant:'single',width:960,height:2100,frameColor:'RAL7016',guideShape:'straight',
  guideFinish:'aluminium',extra:'none',stackSide:'left'
};
const ralColors:Record<string,string> = {
  RAL7013:'#57564c', RAL7016:'#383f43',RAL7039:'#646158',
  RAL9001:'#e6e1cf',RAL9005:'#161b1c',RAL9010:'#f0efe8',RAL9016:'#f4f6f3'
};
function Choice<T extends string>({title,value,choices,onChange}:{title:string,value:T,choices:readonly {value:T,label:string}[],onChange:(v:T)=>void}) {
  return <fieldset className="viewer-choice"><legend>{title}</legend><div className="viewer-choice-options">
    {choices.map(c=><button type="button" key={c.value} aria-pressed={value===c.value}
      className={'viewer-option'+(value===c.value?' is-selected':'')} onClick={()=>onChange(c.value)}>{c.label}</button>)}
  </div></fieldset>;
}
export default function IddViewerPage(){
  const canvasHost=useRef<HTMLDivElement>(null);
  const viewer=useRef<DoorViewer|null>(null);
  const [cfg,setCfg]=useState<DoorConfiguration>(defaults);
  const [open,setOpen]=useState(32);
  const [exploded,setExploded]=useState(false);
  const [part,setPart]=useState<DoorPart|null>(null);
  const [failure,setFailure]=useState<string|null>(null);
  const [initialized,setInitialized]=useState(false);
  const update=(patch:Partial<DoorConfiguration>)=>setCfg(prev=>({...prev,...patch}));
  const result=validateSelection(definition,{...definition.defaultSelection,...cfg});
  useEffect(()=>{
    let active=true;
    if(!canvasHost.current)return;
    import('../features/viewer3d/createDoorViewer').then(({createDoorViewer})=>{
      if(!active||!canvasHost.current)return;
      try{
        const scene=createDoorViewer(canvasHost.current,cfg);
        viewer.current=scene;
        scene.setOpen(open/100);
        scene.setExploded(exploded);
        scene.focus(part);
        setInitialized(true);
      }catch(e){setFailure(e instanceof Error?e.message:'This browser cannot start WebGL.');}
    }).catch(()=>setFailure('The 3D engine could not be loaded.'));
    return()=>{active=false;viewer.current?.dispose();viewer.current=null;};
  // Initialize the GPU context once. React state is applied through separate effects.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  useEffect(()=>{if(initialized&&result.ok)viewer.current?.configure(cfg);},[cfg,initialized,result.ok]);
  useEffect(()=>{viewer.current?.setOpen(open/100);},[open,initialized]);
  useEffect(()=>{viewer.current?.setExploded(exploded);},[exploded,initialized]);
  useEffect(()=>{viewer.current?.focus(part);},[part,initialized]);
  return <main id="main-content" className="viewer-page container">
    <div className="viewer-heading"><div>
      <Link className="back-link" to="/products/idd-insect-doors">← Insect doors · IDD</Link>
      <h1>Explore IDD in 3D.</h1>
      <p>Orbit the assembly, explore finishes and slide the pleated mesh. Early geometry study — not a manufacturing drawing.</p>
    </div><span className="viewer-phase">3D Concept Studio</span></div>
    <div className="viewer-workspace">
      <section className="viewer-scene" aria-label="Interactive three dimensional IDD screen door">
        <div ref={canvasHost} className="viewer-canvas" />
        {failure&&<div className="viewer-failure" role="alert"><p>3D view unavailable: {failure}</p><p>The original interactive IDD demonstration is still available below.</p></div>}
        {!initialized&&!failure&&<div className="viewer-loading" role="status">Preparing 3D scene…</div>}
        <div className="viewer-scene-caption">Drag to rotate · Scroll to zoom · Pinch on mobile</div>
        <div className="viewer-scene-actions">
          <button type="button" onClick={()=>viewer.current?.resetCamera()}>Fit view</button>
          <button type="button" aria-pressed={exploded} onClick={()=>setExploded(v=>!v)}>{exploded?'Assemble':'Exploded view'}</button>
        </div>
      </section>
      <aside className="viewer-controls" aria-label="IDD product options">
        <h2>Make it yours.</h2>
        <Choice title="Door configuration" value={cfg.variant}
          choices={[{value:'single',label:'Single'},{value:'double',label:'Double'}]}
          onChange={variant=>update({variant})}/>
        <div className="viewer-measurements">
          <label>Width · mm<input type="number" min="500" max="4500" step="10" value={cfg.width} onChange={e=>update({width:e.target.valueAsNumber})}/></label>
          <label>Height · mm<input type="number" min="1100" max="3700" step="10" value={cfg.height} onChange={e=>update({height:e.target.valueAsNumber})}/></label>
        </div>
        <fieldset className="viewer-choice"><legend>Frame finish</legend><div className="viewer-ral">
          {Object.entries(ralColors).map(([name,color])=><button key={name} type="button"
            className={cfg.frameColor===name?'is-selected':''} title={name} aria-label={name} aria-pressed={cfg.frameColor===name}
            onClick={()=>update({frameColor:name})}><span style={{backgroundColor:color}}/></button>)}
        </div><p className="viewer-selected-ral">{cfg.frameColor} <span>· indicative screen color</span></p></fieldset>
        <Choice title="Guide profile" value={cfg.guideShape}
          choices={[{value:'straight',label:'Straight'},{value:'slope',label:'Slope'}]}
          onChange={guideShape=>update({guideShape})}/>
        <Choice title="Guide finish" value={cfg.guideFinish}
          choices={[{value:'grey',label:'Grey'},{value:'aluminium',label:'Aluminium'},{value:'black',label:'Black'}]}
          onChange={guideFinish=>update({guideFinish})}/>
        <Choice title="Edge option" value={cfg.extra}
          choices={[{value:'none',label:'None'},{value:'brush',label:'Brush'},{value:'magnet',label:'Magnet'}]}
          onChange={extra=>update({extra})}/>
        {cfg.variant==='single'&&<Choice title="Stack side" value={cfg.stackSide}
          choices={[{value:'left',label:'Left'},{value:'right',label:'Right'}]}
          onChange={stackSide=>update({stackSide})}/>}
        <div className="viewer-motion"><label htmlFor="door-open">Open the screen <strong>{open}%</strong></label>
          <input id="door-open" type="range" min="0" max="100" value={open} onChange={e=>setOpen(Number(e.target.value))}/></div>
        <fieldset className="viewer-choice"><legend>Inspect a component</legend><div className="viewer-choice-options">
          {(['frame','mesh','pull','guide'] as const).map(id=><button type="button" key={id} aria-pressed={part===id}
          className={'viewer-option'+(part===id?' is-selected':'')} onClick={()=>setPart(current=>current===id?null:id)}>{id==='pull'?'Pull bar':id[0].toUpperCase()+id.slice(1)}</button>)}
        </div></fieldset>
        {!result.ok&&<div className="viewer-validation" role="alert">{result.issues.join('. ')}</div>}
        <div className="viewer-disclaimer">Illustrative 3D geometry. Dimensions are preview inputs only; production limits, profiles and RAL matches require approved technical data.</div>
      </aside>
    </div>
    <div className="viewer-legacy"><h2>Existing detailed configurator</h2>
      <p>The original IDD experience remains available with its complete component inspector, room view and animation controls while we migrate each feature.</p>
      <a className="button button-dark" href={import.meta.env.DEV?'/insect-door.html':import.meta.env.BASE_URL+'viewers/insect-door.html'}>Open detailed IDD configurator <span aria-hidden="true">↗</span></a>
    </div>
  </main>;
}
