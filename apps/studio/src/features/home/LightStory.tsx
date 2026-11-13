import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../../shared/urls';
import { clamp01, paintReveal, smooth01 } from './blindsStory';

/** Scroll-controlled reveal. Rendered as a separate feature instead of embedding HTML scripts. */
export function LightStory() {
  const storyRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const story = storyRef.current;
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    if (!story || !panel || !canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let scheduled = 0;
    let width = 0, height = 0, dpr = 0;

    function update() {
      scheduled = 0;
      if (!story || !panel || !canvas || !ctx) return;
      const box = panel.getBoundingClientRect();
      const w = Math.max(320, box.width);
      const h = Math.max(400, box.height);
      const nextDpr = Math.min(window.devicePixelRatio || 1, w < 800 ? 1.5 : 1.85);
      if (w !== width || h !== height || nextDpr !== dpr) {
        width = w;
        height = h;
        dpr = nextDpr;
        canvas.width = Math.round(w * dpr);
        canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const distance = Math.max(1, story.offsetHeight - panel.offsetHeight);
      const p = motion.matches ? 1 : clamp01(-story.getBoundingClientRect().top / distance);
      panel.style.setProperty('--story-light', String(smooth01((p - .2) / .74)));
      if (copyRef.current) {
        const faded = smooth01((p - .33) / .29);
        copyRef.current.style.opacity = String(1 - (window.innerWidth < 701 ? .98 : .96) * faded);
        copyRef.current.style.pointerEvents = p > .68 ? 'none' : 'auto';
      }
      paintReveal(ctx, w, h, p);
    }
    function schedule() {
      if (!scheduled) scheduled = window.requestAnimationFrame(update);
    }
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(panel);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);
    motion.addEventListener?.('change', schedule);
    schedule();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('pageshow', schedule);
      motion.removeEventListener?.('change', schedule);
      observer?.disconnect();
      if (scheduled) window.cancelAnimationFrame(scheduled);
    };
  }, []);

  return <section ref={storyRef} className="light-story" aria-label="Interactive daylight reveal">
    <div className="hero story-panel" ref={panelRef}>
      <div className="hero-image" role="img" aria-label="Sunlit living room and garden-facing window"
        style={{ backgroundImage: "url('" + assetUrl('assets/living-room.webp') + "')" }} />
      <canvas className="story-blinds" ref={canvasRef} aria-hidden="true" />
      <div className="story-sunlight" aria-hidden="true" />
      <div className="hero-content story-copy" ref={copyRef}>
        <div className="story-heading">
          <p className="story-context">S.A.C. Assembly — Product Studio</p>
          <h1 id="home-title"><span>Blinds &amp; screens.</span><span>Made to fit.</span></h1>
        </div>
        <div className="story-action">
          <p>Venetian blinds and pleated insect doors. Explore the systems, choose finishes and inspect the details that matter.</p>
          <Link className="button button-light" to="/collection">Explore products <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
      <p className="story-hint" aria-hidden="true">Scroll to open the blinds</p>
    </div>
  </section>;
}
