import type { ComponentId, Selection, ViewMode } from '../configurator/contracts';

/** Framework-neutral boundary for legacy Canvas now and optimized GLB/Three.js later. */
export interface ViewerAdapter {
  configure(selection: Readonly<Selection>): void;
  setView(view: ViewMode): void;
  focusPart(partId: ComponentId): void;
  setExploded(active: boolean): void;
  playAssembly(): Promise<void>;
  fit(): void;
  dispose(): void;
}

/** Viewer modules must load only when entering an interactive product route. */
export type ViewerLoader = () => Promise<{ createViewer: (element: HTMLElement) => ViewerAdapter }>;
