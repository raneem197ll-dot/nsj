import * as THREE from 'three';

export interface WeaveHandle {
  setProgress(p: number): void;
  setPointer(x: number, y: number): void;
  setActive(active: boolean): void;
  dispose(): void;
}

const N = 30; // per direction → 60 threads
const SEG = 72;
const S = 0.92;
const HALF = ((N - 1) / 2) * S;
const SPAN = HALF + 2.2;
const AMP = 0.16;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };

function rand(seed: number) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

export function createWeave(canvas: HTMLCanvasElement, opts: { reduced: boolean }): WeaveHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setClearColor(0x0b0f1a, 1);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0b0f1a, 22, 52);
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  const group = new THREE.Group();
  scene.add(group);

  const r = rand(7);
  type Thread = { line: THREE.Line; attr: THREE.BufferAttribute; horizontal: boolean; idx: number; ph: number[]; };
  const threads: Thread[] = [];
  const lav = new THREE.Color('#AA92D6');
  const teal = new THREE.Color('#5FBFAE');
  const materials: THREE.Material[] = [];
  for (let d = 0; d < 2; d++) {
    for (let i = 0; i < N; i++) {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array((SEG + 1) * 3);
      const attr = new THREE.BufferAttribute(arr, 3);
      attr.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', attr);
      const mat = new THREE.LineBasicMaterial({ color: d === 0 ? lav : teal, transparent: true, opacity: 0.55 + r() * 0.3, fog: true });
      materials.push(mat);
      const line = new THREE.Line(geo, mat);
      line.frustumCulled = false;
      group.add(line);
      threads.push({ line, attr, horizontal: d === 0, idx: i, ph: [r() * 6.28, r() * 6.28, 0.6 + r() * 1.4, (r() - 0.5) * 9, r() * 6.28] });
    }
  }

  const knotGeo = new THREE.SphereGeometry(0.075, 10, 8);
  const knotMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#D9B76E'), transparent: true, opacity: 0.85, fog: true });
  const knots = new THREE.InstancedMesh(knotGeo, knotMat, N * N);
  knots.frustumCulled = false;
  group.add(knots);
  const m4 = new THREE.Matrix4();
  const tmpV = new THREE.Vector3();
  const tmpQ = new THREE.Quaternion();
  const tmpS = new THREE.Vector3();

  let progress = 0;
  let lastKnot = -1;
  let px = 0, py = 0, sx = 0, sy = 0;
  let active = true;
  let raf = 0;
  let dirty = true;
  const t0 = performance.now();

  function layout(time: number) {
    const w = smooth(0.08, 0.78, progress);
    const drift = opts.reduced ? 0 : (1 - w);
    for (const th of threads) {
      const a = th.attr.array as Float32Array;
      const base = (th.idx - (N - 1) / 2) * S;
      const [p1, p2, f, off, p3] = th.ph;
      for (let k = 0; k <= SEG; k++) {
        const u = -SPAN + (2 * SPAN * k) / SEG;
        // woven target
        const wz = (th.horizontal ? -1 : 1) * AMP * Math.sin(Math.PI * (u / S)) * (th.idx % 2 ? -1 : 1);
        // loose: drifting, scattered strands
        const t = time * 0.00018;
        const la = base * 1.7 + off + Math.sin(u * 0.21 * f + p1 + t * 2) * 2.6;
        const lz = Math.sin(u * 0.17 + p2 + t * 1.3) * 3.2 + Math.cos(u * 0.09 + p3) * 1.6;
        const lu = u * 1.12;
        const along = lu + (u - lu) * w;
        const across = la + (base - la) * w + drift * Math.sin(t * 3 + p1 + u * 0.3) * 0.25;
        const z = lz + (wz - lz) * w;
        const o = k * 3;
        if (th.horizontal) { a[o] = along; a[o + 1] = across; } else { a[o] = across; a[o + 1] = along; }
        a[o + 2] = z;
      }
      th.attr.needsUpdate = true;
    }
    const kn = smooth(0.62, 0.92, progress);
    if (Math.abs(kn - lastKnot) > 0.002) {
      lastKnot = kn;
      let n = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const pop = clamp(kn * 1.6 - ((i * 7 + j * 13) % 17) / 28);
        tmpV.set((j - (N - 1) / 2) * S, (i - (N - 1) / 2) * S, 0);
        tmpS.setScalar(pop < 0.001 ? 0.0001 : pop);
        m4.compose(tmpV, tmpQ, tmpS);
        knots.setMatrixAt(n++, m4);
      }
      knots.instanceMatrix.needsUpdate = true;
    }
    // camera push-in
    const e = smooth(0, 1, progress);
    camera.position.set(0, -2.5 + e * 2.0, 40 - e * 21);
    camera.lookAt(0, 0, 0);
    sx += (px - sx) * (opts.reduced ? 1 : 0.06);
    sy += (py - sy) * (opts.reduced ? 1 : 0.06);
    group.rotation.set(-0.42 + e * 0.3 + sy * 0.08, sx * 0.12, -0.12 + e * 0.12);
  }

  function frame() {
    raf = 0;
    if (!active || document.hidden) return;
    layout(performance.now() - t0);
    renderer.render(scene, camera);
    dirty = false;
    if (!opts.reduced) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf && active && !document.hidden) raf = requestAnimationFrame(frame); }

  function resize() {
    const p = canvas.parentElement; if (!p) return;
    const w = p.clientWidth, h = p.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < 640 ? 54 : 42;
    camera.updateProjectionMatrix();
    dirty = true; kick();
  }
  const ro = new ResizeObserver(resize);
  if (canvas.parentElement) ro.observe(canvas.parentElement);
  resize();
  const onVis = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVis);
  kick();

  return {
    setProgress(p) { const v = clamp(p); if (v !== progress) { progress = v; dirty = true; kick(); } },
    setPointer(x, y) { if (opts.reduced) return; px = x; py = y; kick(); },
    setActive(a) { active = a; if (a && (dirty || !opts.reduced)) kick(); },
    dispose() {
      if (raf) cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      threads.forEach((t) => t.line.geometry.dispose());
      materials.forEach((m) => m.dispose());
      knotGeo.dispose(); knotMat.dispose(); knots.dispose();
      renderer.dispose();
    },
  };
}
