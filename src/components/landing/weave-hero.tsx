import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { WeaveHandle } from '../three/weave-scene';
import { hasWebGL } from '../brand';

/** Static woven grid used when WebGL is unavailable. */
function WeaveFallback() {
  const lines = Array.from({ length: 30 }, (_, i) => i);
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <g opacity=".55">
        {lines.map((i) => <line key={`h${i}`} x1="0" x2="300" y1={6 + i * 10} y2={6 + i * 10} stroke="#AA92D6" strokeWidth=".5" />)}
        {lines.map((i) => <line key={`v${i}`} y1="0" y2="300" x1={6 + i * 10} x2={6 + i * 10} stroke="#5FBFAE" strokeWidth=".5" />)}
      </g>
    </svg>
  );
}

export function WeaveHero({ progressRef, reduced, onReady }: { progressRef: MutableRefObject<number>; reduced: boolean; onReady?: (h: WeaveHandle | null) => void }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [gl] = useState(hasWebGL);
  const readyRef = useRef(onReady); readyRef.current = onReady;

  useEffect(() => {
    if (!gl) { readyRef.current?.(null); return; }
    let h: WeaveHandle | null = null; let cancelled = false; let io: IntersectionObserver | null = null;
    const onMove = (e: PointerEvent) => { h?.setPointer((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1); };
    import('../three/weave-scene').then(({ createWeave }) => {
      if (cancelled || !canvas.current) return;
      try { h = createWeave(canvas.current, { reduced }); } catch { readyRef.current?.(null); return; }
      h.setProgress(progressRef.current);
      readyRef.current?.(h);
      if (wrap.current) { io = new IntersectionObserver(([e]) => h?.setActive(e.isIntersecting)); io.observe(wrap.current); }
      if (!reduced) window.addEventListener('pointermove', onMove, { passive: true });
    }).catch(() => readyRef.current?.(null));
    return () => { cancelled = true; io?.disconnect(); window.removeEventListener('pointermove', onMove); h?.dispose(); readyRef.current?.(null); };
  }, [gl, reduced, progressRef]);

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      {gl ? <canvas ref={canvas} className="block h-full w-full" /> : <WeaveFallback />}
    </div>
  );
}
