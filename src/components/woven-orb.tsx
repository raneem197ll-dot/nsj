import { useEffect, useRef } from 'react';
import type { OrbCounts, OrbHandle } from './three/orb-scene';

/** Small rotating woven orb. Each ring is one skill, coloured by its verification state. */
export default function WovenOrb({ counts, reduced }: { counts: OrbCounts; reduced: boolean }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const handle = useRef<OrbHandle | null>(null);
  const countsRef = useRef(counts);
  countsRef.current = counts;
  const key = `${counts.declared}-${counts.assessed}-${counts.evaluated}-${counts.verified}`;

  useEffect(() => {
    let cancelled = false;
    let io: IntersectionObserver | null = null;
    import('./three/orb-scene').then(({ createOrb }) => {
      if (cancelled || !canvas.current) return;
      try { handle.current = createOrb(canvas.current, { reduced, counts: countsRef.current }); } catch { return; }
      if (wrap.current && typeof IntersectionObserver !== 'undefined') {
        io = new IntersectionObserver(([e]) => handle.current?.setActive(e.isIntersecting));
        io.observe(wrap.current);
      }
    }).catch(() => { /* chunk failed: stage stays empty but layout holds */ });
    return () => { cancelled = true; io?.disconnect(); handle.current?.dispose(); handle.current = null; };
  }, [reduced]);

  useEffect(() => { handle.current?.setCounts(countsRef.current); }, [key]);

  return (
    <div ref={wrap} className="orb-stage" role="img" data-testid="loom-3d"
      aria-label={`كرة منسوجة: ${counts.declared} مهارات معلنة، ${counts.assessed} مختبرة، ${counts.evaluated} مقيّمة، ${counts.verified} موثّقة`}>
      <canvas ref={canvas} />
    </div>
  );
}
