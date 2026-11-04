import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DoorConfiguration, DoorViewer, CameraPreset } from '../features/viewer3d/createDoorViewer';
import { RAL_HEX } from '../products/shared/ralColors';

const initial: DoorConfiguration = {
  variant: 'single', width: 960, height: 2100, frameColor: 'RAL7016',
  guideShape: 'straight', guideFinish: 'aluminium', extra: 'none', stackSide: 'left'
};

const views: { id: CameraPreset; label: string }[] = [
  { id: 'front', label: 'Front' },
  { id: 'angle', label: '3/4 view' },
  { id: 'side', label: 'Side' },
  { id: 'back', label: 'Back' }
];

/**
 * Product showroom — not a second configurator.
 * A small set of visually legible demonstration controls only; verified
 * production dimensions and detailed PCF choices belong in Configure.
 */
export default function IddViewerPage() {
  const canvasHost = useRef<HTMLDivElement>(null);
  const renderer = useRef<DoorViewer | null>(null);
  const [configuration, setConfiguration] = useState<DoorConfiguration>(initial);
  const [opened, setOpened] = useState(35);
  const [exploded, setExploded] = useState(false);
  const [preset, setPreset] = useState<CameraPreset>('angle');
  const [expanded, setExpanded] = useState(false);
  const [ready, setReady] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const setVariant = (variant: 'single' | 'double') => setConfiguration(s => ({ ...s, variant }));
  const setFrameColor = (frameColor: string) => setConfiguration(s => ({ ...s, frameColor }));

  useEffect(() => {
    let active = true;
    const host = canvasHost.current;
    if (!host) return;
    import('../features/viewer3d/createDoorViewer').then(({ createDoorViewer }) => {
      if (!active) return;
      try {
        const model = createDoorViewer(host, initial);
        renderer.current = model;
        model.setOpen(.35);
        model.setCameraPreset('angle');
        setReady(true);
      } catch (error) {
        setFailure(error instanceof Error ? error.message : '3D rendering is unavailable in this browser.');
      }
    }).catch(() => {
      if (active) setFailure('Unable to load the WebGL engine.');
    });
    return () => {
      active = false;
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, []);

  useEffect(() => { if (ready) renderer.current?.configure(configuration); }, [configuration, ready]);
  useEffect(() => { renderer.current?.setOpen(opened / 100); }, [opened, ready]);
  useEffect(() => { renderer.current?.setExploded(exploded); }, [exploded, ready]);
  useEffect(() => { renderer.current?.setCameraPreset(preset); }, [preset, ready]);

  useEffect(() => {
    if (!expanded) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [expanded]);

  const originalUrl = import.meta.env.DEV
    ? '/insect-door.html'
    : import.meta.env.BASE_URL + 'viewers/insect-door.html';

  return <main id="main-content" className="showroom-page">
    <div className="showroom-intro container">
      <div>
        <Link className="back-link" to="/products/idd-insect-doors">← Insect doors · IDD</Link>
        <h1>See the whole system.</h1>
        <p>Take a closer look at the frame, pleated screen and sliding mechanism. For all product options, use the detailed configurator.</p>
      </div>
      <a href={originalUrl} className="showroom-configure-link">Configure IDD <span aria-hidden="true">↗</span></a>
    </div>

    <section className={'showroom-stage' + (expanded ? ' is-expanded' : '')}
      aria-label="Interactive 3D presentation of the IDD insect door">
      <div ref={canvasHost} className="showroom-canvas" />
      {!ready && !failure && <div className="showroom-status" role="status">Loading the 3D product…</div>}
      {failure && <div className="showroom-status" role="alert">The 3D presentation isn't available: {failure}
        <a href={originalUrl}>Open the detailed configurator</a>
      </div>}

      <div className="showroom-topbar">
        <div className="showroom-product-tag">
          <strong>IDD / Pleated insect door</strong>
          <span>3D product showcase · conceptual model</span>
        </div>
        <button className="showroom-icon-button" type="button"
          onClick={() => setExpanded(x => !x)}
          aria-label={expanded ? 'Exit immersive view' : 'Expand to immersive view'}>
          {expanded ? 'Close full view' : 'Full view'} <span aria-hidden="true">{expanded ? '↙' : '↗'}</span>
        </button>
      </div>

      <div className="showroom-view-options" role="group" aria-label="Camera views">
        {views.map(view => <button key={view.id} type="button"
          aria-pressed={preset === view.id}
          onClick={() => { setPreset(view.id); renderer.current?.setCameraPreset(view.id); }}>
          {view.label}
        </button>)}
        <button type="button" onClick={() => { setPreset('angle'); renderer.current?.resetCamera(); }}>Reset</button>
      </div>

      <div className="showroom-bottom">
        <div className="showroom-selections">
          <div className="showroom-option-set" role="group" aria-label="Door presentation">
            <span className="showroom-option-title">System</span>
            <button type="button" aria-pressed={configuration.variant === 'single'} onClick={() => setVariant('single')}>Single</button>
            <button type="button" aria-pressed={configuration.variant === 'double'} onClick={() => setVariant('double')}>Double</button>
          </div>
          <div className="showroom-color-group" role="group" aria-label="Preview frame finish">
            <span className="showroom-option-title">Frame preview</span>
            {Object.entries(RAL_HEX).map(([name,color]) =>
              <button type="button" key={name} aria-label={'Frame color ' + name}
                aria-pressed={configuration.frameColor === name}
                title={name} onClick={() => setFrameColor(name)}>
                <span style={{backgroundColor:color}} />
              </button>)}
          </div>
          <div className="showroom-motion" >
            <label htmlFor="showroom-opening">Slide mesh <strong>{opened}%</strong></label>
            <input id="showroom-opening" type="range" min="0" max="100"
              value={opened} onChange={e => setOpened(Number(e.target.value))}/>
          </div>
          <button type="button" className="showroom-explode" aria-pressed={exploded}
            onClick={() => setExploded(x => !x)}>{exploded ? 'Reassemble' : 'Exploded view'}</button>
        </div>
        <div className="showroom-bottom-foot">
          <span>Drag to rotate · Scroll or pinch to zoom</span>
          <span>Illustrative geometry · not an approved technical model</span>
        </div>
      </div>
    </section>
    <section className="showroom-after container" aria-labelledby="showroom-next">
      <div>
        <span className="showroom-eyebrow">Next step</span>
        <h2 id="showroom-next">Ready to personalize it?</h2>
        <p>This 3D experience is for viewing the product and seeing its motion. Dimensions, guides, extras and technical choices live in the detailed configurator, where they are easier to understand.</p>
      </div>
      <a href={originalUrl} className="button button-dark">Open IDD configurator <span aria-hidden="true">↗</span></a>
    </section>
  </main>;
}
