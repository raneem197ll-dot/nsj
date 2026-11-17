import * as THREE from 'three';

export type OrbCounts = { declared: number; assessed: number; evaluated: number; verified: number };
export interface OrbHandle { setCounts(c: OrbCounts): void; setActive(a: boolean): void; dispose(): void }

const COLORS: Record<keyof OrbCounts, string> = { declared: '#6F7A90', assessed: '#D9B76E', evaluated: '#AA92D6', verified: '#5FBFAE' };

export function createOrb(canvas: HTMLCanvasElement, opts: { reduced: boolean; counts: OrbCounts }): OrbHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 0.4, 6.2);
  camera.lookAt(0, 0, 0);
  const orb = new THREE.Group();
  orb.rotation.set(0.35, 0, 0.18);
  scene.add(orb);

  const coreGeo = new THREE.IcosahedronGeometry(0.62, 1);
  const coreEdges = new THREE.EdgesGeometry(coreGeo);
  const coreMat = new THREE.LineBasicMaterial({ color: '#8264BE', transparent: true, opacity: 0.45 });
  const core = new THREE.LineSegments(coreEdges, coreMat);
  orb.add(core);

  let rings: THREE.Mesh[] = [];
  const ringMats: THREE.Material[] = [];
  const ringGeos: THREE.BufferGeometry[] = [];
  function build(c: OrbCounts) {
    rings.forEach((m) => orb.remove(m));
    ringGeos.forEach((g) => g.dispose()); ringMats.forEach((m) => m.dispose());
    rings = []; ringGeos.length = 0; ringMats.length = 0;
    const keys = ['declared', 'assessed', 'evaluated', 'verified'] as const;
    let k = 0;
    const total = keys.reduce((a, key) => a + Math.min(6, Math.max(0, Math.round(c[key] || 0))), 0) || 1;
    keys.forEach((key, li) => {
      const n = Math.min(6, Math.max(0, Math.round(c[key] || 0)));
      for (let i = 0; i < n; i++) {
        const radius = 1.25 + li * 0.07 + (i % 2) * 0.03;
        const geo = new THREE.TorusGeometry(radius, key === 'verified' ? 0.022 : 0.014, 8, 160);
        const mat = new THREE.MeshBasicMaterial({ color: COLORS[key], transparent: true, opacity: key === 'declared' ? 0.45 : 0.9 });
        const m = new THREE.Mesh(geo, mat);
        const a = (k / total) * Math.PI;
        m.rotation.set(Math.PI / 2 + Math.sin(a * 2) * 0.9, a, Math.cos(a) * 0.4);
        orb.add(m); rings.push(m); ringGeos.push(geo); ringMats.push(mat); k++;
      }
    });
    dirty = true;
  }
  let dirty = true;
  build(opts.counts);

  let active = true; let raf = 0; let last = performance.now();
  function frame(now: number) {
    raf = 0;
    if (!active || document.hidden) return;
    const dt = Math.min(64, now - last); last = now;
    if (!opts.reduced) { orb.rotation.y += dt * 0.00022; core.rotation.x -= dt * 0.00015; }
    renderer.render(scene, camera); dirty = false;
    if (!opts.reduced) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && active && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  function resize() {
    const p = canvas.parentElement; if (!p) return;
    const w = p.clientWidth, h = p.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); dirty = true; kick();
  }
  const ro = new ResizeObserver(resize); if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  kick();
  return {
    setCounts(c) { build(c); kick(); },
    setActive(a) { active = a; if (a && (dirty || !opts.reduced)) kick(); },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect(); document.removeEventListener('visibilitychange', onVis);
      ringGeos.forEach((g) => g.dispose()); ringMats.forEach((m) => m.dispose());
      coreGeo.dispose(); coreEdges.dispose(); coreMat.dispose(); renderer.dispose();
    },
  };
}
