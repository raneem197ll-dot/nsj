import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowDown, GraduationCap, BriefcaseBusiness, Building2, UserRound, Flag, Circle, ClipboardCheck, UserCheck, ShieldCheck, type LucideIcon } from 'lucide-react';
import { useDemo, mutate } from '@/lib/store';
import { PERSONAS, EVIDENCE_LABEL, type Role, type VState } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Wordmark, LogoMark, DemoTag } from '../brand';
import { WeaveHero } from './weave-hero';
import { DemoAccessDialog, type AccessMode } from './demo-access-dialog';
import type { WeaveHandle } from '../three/weave-scene';

const BEATS = [
  { k: 'Skills you can prove.', sub: 'NASJ turns practical student work into evidence an employer can actually read.' },
  { k: 'Threads', sub: 'Every project, challenge and review starts as a single loose strand.' },
  { k: 'Weave', sub: 'Strands cross. Rubrics, reviewers and scores hold them in place.' },
  { k: 'Proof', sub: 'What remains is a skill passport that stands on its own.' },
];

const STEPS = [
  { t: 'أعلن', d: 'تبدأ المهارة ادعاءً تكتبه بنفسك. لا شيء يُحتسب بعد، وهذا صادق.' },
  { t: 'اختبر', d: 'تقييم عملي أو مخرج هاكاثون يحوّل الادعاء إلى عمل مُنجز.' },
  { t: 'قيّم', d: 'أستاذ جامعي أو مختص من القطاع يراجع العمل وفق معايير معلنة.' },
  { t: 'وثّق', d: 'درجة 70 فأكثر وثلاثة أدلة مؤهلة. شهادات المشاركة لا تُحتسب أبدًا.' },
];

const ROLES: { r: Role; label: string; icon: LucideIcon; line: string; span: string; tint: string }[] = [
  { r: 'student', label: 'الطالب', icon: GraduationCap, line: 'يبني جواز مهارات من مشاريع وتحديات حقيقية، ويرى ما ينقصه للمسار الذي يريده.', span: 'md:col-span-4 md:row-span-2', tint: 'tint-violet' },
  { r: 'professor', label: 'الأستاذ الجامعي', icon: BriefcaseBusiness, line: 'يقيّم الأعمال بمعايير واضحة ويتابع تقدّم طلابه.', span: 'md:col-span-2', tint: 'tint-teal' },
  { r: 'company', label: 'الشركة', icon: Building2, line: 'تطرح تحديات وتكتشف مواهب بأدلة لا بسير ذاتية.', span: 'md:col-span-2', tint: 'tint-sand' },
  { r: 'professional', label: 'المختص من القطاع', icon: UserRound, line: 'يرشد ويراجع المشاريع بخبرة الميدان.', span: 'md:col-span-3', tint: 'tint-rose' },
  { r: 'club', label: 'النادي الطلابي', icon: Flag, line: 'ينظّم الأنشطة والهاكاثونات ومشاريع الفرق.', span: 'md:col-span-3', tint: 'tint-violet' },
];

const PSTATES: { s: VState; label: string; icon: LucideIcon; tone: string; d: string }[] = [
  { s: 'declared', label: 'معلنة', icon: Circle, tone: '#6F7A90', d: 'يدّعي الطالب هذه المهارة، ولم يُقيَّم أي دليل بعد.' },
  { s: 'assessed', label: 'مختبرة', icon: ClipboardCheck, tone: '#D9B76E', d: 'اكتمل تقييم عملي أو مخرج هاكاثون.' },
  { s: 'evaluated', label: 'مقيّمة', icon: UserCheck, tone: '#AA92D6', d: 'راجع أستاذ جامعي أو مختص مؤهل العمل وفق معايير تقييم.' },
  { s: 'verified', label: 'موثّقة', icon: ShieldCheck, tone: '#5FBFAE', d: 'تقييم عملي وتقييم مختص ودرجة 70 فأكثر وثلاثة أدلة مؤهلة على الأقل.' },
];

function useReduced() {
  const { settings } = useDemo();
  const [sys, setSys] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { if (typeof matchMedia === 'undefined') return; const m = matchMedia('(prefers-reduced-motion: reduce)'); const h = () => setSys(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);
  return settings.reducedMotion || sys;
}

/** Progress (0..1) of the viewport through an element. */
function sectionProgress(el: HTMLElement, pinned: boolean) {
  const r = el.getBoundingClientRect();
  if (pinned) return Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
  return Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / Math.max(1, r.height)));
}

function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || typeof IntersectionObserver === 'undefined') { setOn(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  return <div ref={ref} className={cn('landing-beat', on ? 'opacity-100' : 'translate-y-4 opacity-0', className)} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ---------------- evidence network ---------------- */
function EvidenceNetwork() {
  const { skills } = useDemo();
  const list = useMemo(() => skills.filter((s) => s.evidence.length > 0).slice(0, 6), [skills]);
  const [sel, setSel] = useState(0);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const cur = list[Math.min(sel, list.length - 1)];
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowRight' ? -1 : 0;
    if (!dir) return; e.preventDefault();
    const n = (sel + dir + list.length) % list.length; setSel(n); btns.current[n]?.focus();
  };
  if (!cur) return <div className="panel p-8 text-center text-sm text-muted-foreground">لا توجد أدلة في الملف التجريبي بعد.</div>;
  const ev = cur.evidence.slice(0, 7);
  const qualifying = cur.evidence.filter((e) => e.type !== 'participation').length;
  const pts = ev.map((_, i) => { const a = -Math.PI / 2 + (i / ev.length) * Math.PI * 2; return { x: 200 + Math.cos(a) * 140, y: 150 + Math.sin(a) * 105 }; });
  const meta = PSTATES.find((p) => p.s === cur.state)!;
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <div role="radiogroup" aria-label="اختر مهارة لعرض أدلتها" onKeyDown={onKey} className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
        {list.map((s, i) => (
          <button key={s.id} ref={(el) => { btns.current[i] = el; }} role="radio" aria-checked={i === sel} tabIndex={i === sel ? 0 : -1}
            onClick={() => setSel(i)} data-testid={`button-landing-skill-${s.id}`}
            className={cn('shrink-0 rounded-xl border px-4 py-2.5 text-start text-sm transition-colors', i === sel ? 'border-[hsl(var(--primary)/.5)] bg-[hsl(var(--primary)/.14)] text-foreground' : 'border-white/[.07] bg-[hsl(var(--card))] text-muted-foreground hover:border-white/15 hover:text-foreground')}>
            <span className="block font-semibold">{s.name}</span>
            <span className="num block text-[11px] opacity-70">{s.evidence.length} أدلة</span>
          </button>
        ))}
      </div>
      <div className="panel overflow-hidden p-4 sm:p-6" aria-live="polite">
        <svg viewBox="0 0 400 300" className="h-auto w-full" role="img" aria-label={`${cur.name}: ${ev.length} أدلة، ${qualifying} منها مؤهلة`}>
          {pts.map((p, i) => {
            const part = ev[i].type === 'participation';
            const len = Math.hypot(p.x - 200, p.y - 150);
            return <line key={`${cur.id}-${i}`} x1="200" y1="150" x2={p.x} y2={p.y} stroke={part ? '#CC8DA6' : '#5FBFAE'} strokeOpacity={part ? 0.5 : 0.7} strokeWidth="1.2" strokeDasharray={part ? '3 4' : `${len}`}
              style={part ? undefined : { ['--len' as string]: `${len}`, strokeDashoffset: 0, animation: `draw .8s ${i * 70}ms cubic-bezier(.2,.7,.2,1) both` }} />;
          })}
          {pts.map((p, i) => <circle key={`n${cur.id}-${i}`} cx={p.x} cy={p.y} r="7" fill="#1A2236" stroke={ev[i].type === 'participation' ? '#CC8DA6' : '#5FBFAE'} strokeWidth="1.5" />)}
          <circle cx="200" cy="150" r="30" fill="#141A2B" stroke={meta.tone} strokeWidth="1.5" />
          <circle cx="200" cy="150" r="4" fill={meta.tone} />
        </svg>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h3 className="font-ar-head text-xl">{cur.name}</h3>
          <span className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold" style={{ color: meta.tone, background: `${meta.tone}1f` }}>{meta.label}</span>
          <span className="num text-xs text-muted-foreground">{qualifying} أدلة مؤهلة من {cur.evidence.length}</span>
          <DemoTag className="ms-auto" />
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {ev.map((e) => (
            <li key={e.id} className="panel-2 min-w-0 px-3 py-2">
              <p className="truncate text-[13px] font-medium">{e.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{EVIDENCE_LABEL[e.type]} · {e.source}{e.type === 'participation' && <span className="text-[hsl(var(--rose))]"> · لا تُحتسب</span>}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- journey ---------------- */
function Journey({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(reduced ? 1 : 0);
  useEffect(() => {
    if (reduced) { setP(1); return; }
    let raf = 0;
    const on = () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; if (ref.current) setP(sectionProgress(ref.current, false)); }); };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, [reduced]);
  const drawn = Math.min(1, p * 1.25);
  return (
    <div ref={ref} className="relative">
      <svg className="pointer-events-none absolute inset-y-0 right-[1.15rem] h-full w-1 overflow-visible" preserveAspectRatio="none" viewBox="0 0 2 100" aria-hidden>
        <line x1="1" y1="0" x2="1" y2="100" stroke="rgba(255,255,255,.07)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        <line x1="1" y1="0" x2="1" y2="100" stroke="#AA92D6" strokeWidth="2" vectorEffect="non-scaling-stroke" pathLength={100} strokeDasharray="100" strokeDashoffset={100 - drawn * 100} className="journey-path" />
      </svg>
      <ol className="space-y-10">
        {STEPS.map((s, i) => {
          const lit = drawn >= (i + 0.15) / STEPS.length;
          return (
            <li key={s.t} className="relative flex gap-5">
              <span className={cn('num relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm transition-colors duration-500', lit ? 'border-[hsl(var(--lavender))] bg-[hsl(var(--primary)/.2)] text-[hsl(var(--lavender))]' : 'border-white/10 bg-[hsl(var(--background))] text-[hsl(var(--faint))]')}>{i + 1}</span>
              <div className={cn('pt-0.5 transition-opacity duration-500', lit ? 'opacity-100' : 'opacity-45')}>
                <h3 className="font-ar-head text-2xl">{s.t}</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">{s.d}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ---------------- passport preview ---------------- */
function PassportPreview() {
  const { skills, profile } = useDemo();
  const [i, setI] = useState(3);
  const st = PSTATES[i];
  const sample = skills.find((s) => s.state === st.s);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0; if (!dir) return;
    e.preventDefault(); const n = (i + dir + 4) % 4; setI(n); refs.current[n]?.focus();
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center">
      <div>
        <div role="tablist" aria-label="حالات التوثيق" onKeyDown={onKey} className="inline-flex flex-wrap gap-1 rounded-full border border-white/[.07] bg-[hsl(var(--card))] p-1">
          {PSTATES.map((p, n) => (
            <button key={p.s} ref={(el) => { refs.current[n] = el; }} role="tab" aria-selected={n === i} tabIndex={n === i ? 0 : -1} onClick={() => setI(n)} data-testid={`button-landing-state-${p.s}`}
              className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors', n === i ? 'bg-white/[.08] text-foreground' : 'text-muted-foreground hover:text-foreground')}>{p.label}</button>
          ))}
        </div>
        <p className="mt-5 max-w-md text-[15px] text-muted-foreground">{st.d}</p>
      </div>
      <div className="panel relative overflow-hidden p-6 sm:p-7" role="tabpanel">
        <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${st.tone}, transparent)` }} />
        <div className="flex items-center justify-between gap-3">
          <Wordmark size="sm" />
          <DemoTag />
        </div>
        <p className="mt-6 text-xs text-muted-foreground">جواز مهارات · {profile.name}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="chip-icon" style={{ background: `${st.tone}22`, color: st.tone }}><st.icon className="h-4 w-4" /></span>
          <div className="min-w-0">
            <p className="truncate font-ar-head text-xl">{sample?.name ?? 'لا توجد مهارة بهذه الحالة'}</p>
            <p className="text-xs" style={{ color: st.tone }}>{st.label}</p>
          </div>
          {typeof sample?.score === 'number' && <span className="num ms-auto text-2xl">{Math.min(100, Math.max(0, sample.score))}<span className="text-xs text-muted-foreground">/100</span></span>}
        </div>
        <div className="mt-6 grid grid-cols-4 gap-1.5" aria-hidden>
          {PSTATES.map((p, n) => <span key={p.s} className="h-1.5 rounded-full transition-colors duration-500" style={{ background: n <= i ? st.tone : 'rgba(255,255,255,.07)' }} />)}
        </div>
        <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-[10.5px] text-[hsl(var(--faint))]">{PSTATES.map((p) => <span key={p.s}>{p.label}</span>)}</div>
        {sample && <p className="num mt-5 text-xs text-muted-foreground">{sample.evidence.filter((e) => e.type !== 'participation').length} أدلة مؤهلة{sample.evaluator ? ` · قيّمها ${sample.evaluator.name}` : ''}</p>}
      </div>
    </div>
  );
}

/* ---------------- page ---------------- */
export default function Landing({ onEnter }: { onEnter: () => void }) {
  const reduced = useReduced();
  const pin = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const handle = useRef<WeaveHandle | null>(null);
  const [beat, setBeat] = useState(0);
  const [mode, setMode] = useState<AccessMode | null>(null);
  const { role } = useDemo();

  useEffect(() => {
    document.title = 'نَسْج | NASJ — Skills you can prove';
    let raf = 0;
    const on = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0; if (!pin.current) return;
        const p = sectionProgress(pin.current, true);
        progress.current = p; handle.current?.setProgress(p);
        setBeat(Math.min(3, Math.floor(p * 4.0001)));
      });
    };
    on(); addEventListener('scroll', on, { passive: true }); addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const onReady = useCallback((h: WeaveHandle | null) => { handle.current = h; h?.setProgress(progress.current); }, []);
  const chooseRole = (r: Role) => { if (r !== role) mutate((d) => { d.role = r; }); onEnter(); };
  const closeDialog = useCallback(() => setMode(null), []);

  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background text-foreground" data-testid="page-landing">
      {/* top bar */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[.05] bg-[hsl(var(--background)/.6)] backdrop-blur-md">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <span dir="rtl"><Wordmark size="sm" /></span>
          <div dir="ltr" className="flex items-center gap-2 font-sans">
            <button className="btn btn-ghost btn-sm hidden sm:inline-flex" onClick={() => setMode('signin')} data-testid="button-landing-signin-top">Sign in</button>
            <button className="btn btn-primary btn-sm" onClick={onEnter} data-testid="button-landing-enter-top">Enter demo</button>
          </div>
        </div>
      </header>

      {/* pinned English weave */}
      <section ref={pin} dir="ltr" lang="en" className="relative" style={{ height: reduced ? '220vh' : '420vh' }} aria-label="NASJ introduction">
        <div className="sticky top-0 h-[100dvh] overflow-hidden">
          <WeaveHero progressRef={progress} reduced={reduced} onReady={onReady} />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,hsl(224_41%_7%/.85)_100%)]" />
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
            <div className="relative h-[13rem] w-full max-w-3xl sm:h-[15rem]">
              {BEATS.map((b, i) => (
                <div key={b.k} aria-hidden={i !== beat} className={cn('landing-beat absolute inset-0 flex flex-col items-center justify-center', i === beat ? 'opacity-100' : 'pointer-events-none opacity-0', !reduced && (i < beat ? '-translate-y-6' : i > beat ? 'translate-y-6' : ''))}>
                  <h1 className="font-en-serif text-[3.4rem] leading-[0.95] text-[#E8ECF4] sm:text-7xl md:text-[6.5rem]">
                    {i === 0 ? <>Skills you can <em className="text-[hsl(var(--lavender))]">prove.</em></> : b.k}
                  </h1>
                  <p className="mt-5 max-w-md font-sans text-[15px] leading-relaxed text-[#A7B0C2]">{b.sub}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 font-sans">
              <button className="btn btn-primary" onClick={() => setMode('signup')} data-testid="button-landing-signup">Sign up</button>
              <button className="btn btn-ghost" onClick={() => setMode('signin')} data-testid="button-landing-signin">Sign in</button>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 font-mono text-[11px] text-[#6F7A90]">
              {BEATS.map((b, i) => <span key={b.k} className={cn('h-px w-6 transition-colors', i <= beat ? 'bg-[hsl(var(--lavender))]' : 'bg-white/15')} />)}
              <ArrowDown className="ms-1 h-3.5 w-3.5" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* Arabic narrative */}
      <div dir="rtl" lang="ar">
        <section className="mx-auto max-w-[1240px] px-5 py-28 sm:px-6 md:py-40">
          <Reveal>
            <p className="eyebrow">المشكلة</p>
            <h2 className="mt-3 max-w-4xl font-ar-head text-[2.3rem] leading-[1.35] sm:text-6xl">المواهب في كل مكان، <span className="text-[hsl(var(--lavender))]">وإثباتها نادر</span></h2>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-[1.2fr_1fr]">
            <Reveal delay={80}><p className="max-w-xl text-lg leading-[1.9] text-muted-foreground">يتخرّج الطالب ومعه مشاريع ومسابقات وساعات تطوع، لكن ما يصل إلى جهة التوظيف سطر في سيرة ذاتية. نَسْج يربط كل مهارة بالعمل الذي يثبتها، وبمن راجعه، وبالمعيار الذي قيست عليه.</p></Reveal>
            <Reveal delay={160}><p className="border-s-2 border-[hsl(var(--teal)/.5)] ps-5 text-[15px] leading-[1.9] text-muted-foreground">لا نعدّ الشهادات ولا ساعات الحضور. المهارة لا تُوثّق إلا بتقييم عملي، ومراجعة مختص مؤهل، ودرجة 70 فأكثر، وثلاثة أدلة مؤهلة.</p></Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 pb-28 sm:px-6 md:pb-40" aria-labelledby="net-h">
          <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">من المهارة إلى الدليل</p>
              <h2 id="net-h" className="mt-2 font-ar-head text-3xl sm:text-4xl">اختر مهارة، وشاهد ما يثبتها</h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground">من الملف التجريبي لنور. الخطوط المتقطعة شهادات مشاركة لا تدخل في التوثيق.</p>
          </Reveal>
          <EvidenceNetwork />
        </section>

        <section className="border-y border-white/[.05] bg-[hsl(225_38%_9%)] py-28 md:py-36">
          <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-6 md:grid-cols-[1fr_1.2fr]">
            <Reveal>
              <p className="eyebrow">الرحلة</p>
              <h2 className="mt-2 font-ar-head text-3xl sm:text-4xl">أربع خطوات، ولا اختصار بينها</h2>
              <p className="mt-4 max-w-sm text-[15px] text-muted-foreground">كل خطوة تضيف خيطًا. الحالة لا تتقدّم إلا عندما يتوفر الدليل الذي تتطلبه.</p>
            </Reveal>
            <Journey reduced={reduced} />
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 py-28 sm:px-6 md:py-40" aria-labelledby="roles-h">
          <Reveal className="mb-10">
            <p className="eyebrow">من يشارك في النسيج</p>
            <h2 id="roles-h" className="mt-2 font-ar-head text-3xl sm:text-4xl">خمسة أدوار، مساحة واحدة</h2>
            <p className="mt-3 max-w-lg text-sm text-muted-foreground">اختر دورًا لتدخل النسخة التجريبية من زاويته. يمكنك التبديل لاحقًا من القائمة الجانبية.</p>
          </Reveal>
          <div className="grid gap-3 md:grid-cols-6 md:auto-rows-[minmax(10rem,auto)]">
            {ROLES.map((x, n) => (
              <Reveal key={x.r} delay={n * 60} className={x.span}>
                <button onClick={() => chooseRole(x.r)} data-testid={`button-landing-role-${x.r}`}
                  className="panel lift group flex h-full w-full flex-col p-6 text-start">
                  <span className={cn('chip-icon', x.tint)}><x.icon className="h-4 w-4" /></span>
                  <span className="mt-auto pt-8">
                    <span className="block font-ar-head text-xl">{x.label}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{x.line}</span>
                    <span className="mt-4 flex items-center gap-2 text-xs text-[hsl(var(--faint))]">
                      <span className="truncate">{PERSONAS[x.r].name}</span>
                      <ArrowLeft className="ms-auto h-4 w-4 text-[hsl(var(--lavender))] transition-transform group-hover:-translate-x-1" />
                    </span>
                  </span>
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1240px] px-5 pb-28 sm:px-6 md:pb-40" aria-labelledby="pp-h">
          <Reveal className="mb-10">
            <p className="eyebrow">جواز المهارات</p>
            <h2 id="pp-h" className="mt-2 font-ar-head text-3xl sm:text-4xl">أربع حالات، كل واحدة لها شرط</h2>
          </Reveal>
          <PassportPreview />
        </section>

        <section className="mx-auto max-w-[1240px] px-5 pb-24 sm:px-6">
          <Reveal>
            <div className="panel weave-bg flex flex-col items-start gap-6 p-8 sm:p-12 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-ar-head text-3xl sm:text-4xl">جرّب نَسْج الآن</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">نسخة تجريبية كاملة في متصفحك. لا حساب، ولا بيانات تغادر جهازك.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="btn btn-primary" onClick={onEnter} data-testid="button-landing-enter">ادخل إلى النسخة التجريبية <ArrowLeft className="h-4 w-4" /></button>
                <button className="btn btn-ghost" onClick={() => setMode('signup')} data-testid="button-landing-signup-cta">إنشاء حساب</button>
              </div>
            </div>
          </Reveal>
        </section>

        <footer className="border-t border-white/[.05]">
          <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <LogoMark className="h-10 w-10" />
              <div>
                <Wordmark size="sm" className="[&>svg]:hidden" />
                <p className="mt-1 text-xs text-[hsl(var(--faint))]">مساحة مهنية مبنية على الأدلة للطلاب في المملكة.</p>
              </div>
            </div>
            <p className="max-w-md text-[11px] leading-relaxed text-[hsl(var(--faint))]">بيئة تجريبية. جميع الأشخاص والجهات والدرجات بيانات توضيحية محفوظة في هذا المتصفح فقط، ولا يجري أي توثيق حقيقي.</p>
          </div>
        </footer>
      </div>

      <DemoAccessDialog mode={mode} onClose={closeDialog} onEnter={() => { setMode(null); onEnter(); }} />
    </div>
  );
}
