import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, X, Compass } from 'lucide-react';
import { useDemo } from '@/lib/store';
import type { Role } from '@/lib/data';
import { cn } from '@/lib/utils';

type Step = { title: string; body: string; href: string; tour?: string };

const PAGE: Record<string, string> = { '/': 'نظرة عامة', '/skills': 'مهاراتي / المتطلبات', '/learning-paths': 'مسارات التعلم', '/challenges': 'التحديات', '/assessments': 'التقييمات والمراجعة', '/passport': 'جواز المهارات / المواهب', '/community': 'المجتمع', '/mentorship': 'الإرشاد', '/clubs': 'الأنشطة', '/projects': 'مشاريع الفرق' };

const TOURS: Record<Role, Step[]> = {
  student: [
    { title: 'هنا تشوف وين وصلت', body: 'النظرة العامة تجمع جاهزيتك لمسارك المهني، وسلّم التوثيق، والرسوم اللي توضح تقدمك.', href: '/', tour: '/' },
    { title: 'اكتشف مهاراتك وارفع أدلتك', body: 'في «مهاراتي» تضيف مهاراتك وتشوف حالة كل وحدة. ولرفع دليل اضغط زر «دليل» جنب المهارة وأرفق رابط شغلك.', href: '/skills', tour: '/skills' },
    { title: 'هذي خطوتك الجاية', body: 'مسارات التعلم تبني لك خطوات حسب مستواك. كمّل خطوة خطوة وكل إنجاز ينحسب.', href: '/learning-paths', tour: '/learning-paths' },
    { title: 'جرّب على شغل حقيقي', body: 'التحديات العملية من شركات وأساتذة. سلّم شغلك ويتقيّم وفق معايير واضحة.', href: '/challenges', tour: '/challenges' },
    { title: 'المشاركة لحالها ما توثّق مهارتك', body: 'نحتاج شغلك وتقييمه من مختص مؤهل، ودرجة 70 فأكثر، وثلاثة أدلة مؤهلة. شهادات الحضور ما تنحسب.', href: '/assessments', tour: '/assessments' },
    { title: 'جوازك يتكلم عنك', body: 'جواز المهارات يعرض أدلتك الموثقة للجامعات والشركات. كل ما زادت أدلتك، وضحت صورتك.', href: '/passport', tour: '/passport' },
  ],
  professor: [
    { title: 'يا هلا دكتور', body: 'النظرة العامة توريك قائمة المراجعة ونشاط التقييم من سجل مؤرخ.', href: '/', tour: '/' },
    { title: 'قيّم بالمعايير', body: 'في قائمة المراجعة تعطي درجة لكل معيار من 5، وينعكس التقييم مباشرة على جواز الطالب.', href: '/assessments', tour: '/assessments' },
    { title: 'تابع المسارات', body: 'شوف تقدم الطلاب في المسارات اللي تشرف عليها، وين وقفوا ووش خطوتهم الجاية.', href: '/learning-paths', tour: '/learning-paths' },
    { title: 'تقدّم الطلاب', body: 'هنا تقارن مستويات الطلاب وحالات توثيق مهاراتهم.', href: '/passport', tour: '/passport' },
  ],
  company: [
    { title: 'حيّاكم في نَسْج', body: 'لوحتكم توريكم التحديات والتسليمات والمواهب الموثقة، كلها من سجلات فعلية.', href: '/', tour: '/' },
    { title: 'حدّدوا اللي تبونه', body: 'متطلبات المهارات تحدد المستوى المطلوب لكل مهارة، وتظهر للطلاب كهدف واضح.', href: '/skills', tour: '/skills' },
    { title: 'انشروا تحدي حقيقي', body: 'التحدي يعطيكم شغل فعلي تقيمونه، مو مجرد سيرة ذاتية.', href: '/challenges', tour: '/challenges' },
    { title: 'اكتشفوا المواهب', body: 'قارنوا المرشحين بالأدلة الموثقة وأضيفوهم للقائمة المختصرة.', href: '/passport', tour: '/passport' },
  ],
  professional: [
    { title: 'يا هلا بخبرتك', body: 'النظرة العامة توضح جلسات الإرشاد والمراجعات اللي سويتها، بدون أرقام مفترضة.', href: '/', tour: '/' },
    { title: 'شارك اللي تعرفه', body: 'انشر رؤية أو دراسة حالة، وتوصل للطلاب اللي يحتاجونها.', href: '/community', tour: '/community' },
    { title: 'مواعيدك بيدك', body: 'في الإرشاد تدير مواعيدك وتتابع الطلبات.', href: '/mentorship', tour: '/mentorship' },
    { title: 'تقييمك يفرق', body: 'مراجعتك للمشاريع وفق المعايير هي اللي تنقل المهارة من مُختبرة إلى مُقيَّمة.', href: '/assessments', tour: '/assessments' },
  ],
  club: [
    { title: 'حيّ النادي', body: 'النظرة العامة توريكم التسجيلات والمساهمات المسجلة لكل نشاط.', href: '/', tour: '/' },
    { title: 'انشروا نشاطكم', body: 'في الأنشطة تنشرون الفعالية وتربطونها بمهارات، وتسجلون مسؤولية كل عضو.', href: '/clubs', tour: '/clubs' },
    { title: 'الحضور غير المساهمة', body: 'التسجيل لحاله ما يوثّق مهارة. سجّلوا وش سوّى كل عضو عشان يصير له دليل.', href: '/clubs', tour: '/clubs' },
    { title: 'مشاريع الفرق', body: 'تابعوا مشاريع الفرق ومساهمة كل عضو فيها.', href: '/projects', tour: '/projects' },
  ],
};

const KEY = 'nasj-onboarding';
function readDone(): Partial<Record<Role, string>> {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(KEY) || '{}');
    return v && typeof v === 'object' && !Array.isArray(v) ? (v as Partial<Record<Role, string>>) : {};
  } catch { return {}; }
}
function markDone(role: Role, how: 'finished' | 'skipped') { try { localStorage.setItem(KEY, JSON.stringify({ ...readDone(), [role]: how })); } catch { /* storage unavailable */ } }

export function startTour() { window.dispatchEvent(new CustomEvent('nasj:tour')); }

export function Onboarding() {
  const { role } = useDemo();
  const [, nav] = useLocation();
  const [mode, setMode] = useState<'closed' | 'welcome' | 'tour'>('closed');
  const [i, setI] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const steps = TOURS[role];

  const open = useCallback((m: 'welcome' | 'tour') => { returnTo.current = document.activeElement as HTMLElement | null; setI(0); setMode(m); }, []);
  useEffect(() => { if (!readDone()[role]) open('welcome'); else setMode('closed'); }, [role, open]);
  useEffect(() => { const h = () => open('tour'); window.addEventListener('nasj:tour', h); return () => window.removeEventListener('nasj:tour', h); }, [open]);

  const close = useCallback((how: 'finished' | 'skipped') => {
    markDone(role, how); setMode('closed');
    const r = returnTo.current;
    setTimeout(() => {
      if (r && r.isConnected && r.offsetParent !== null) r.focus();
      else document.getElementById('main')?.focus({ preventScroll: true });
    }, 0);
  }, [role]);

  // navigate + highlight nav target for current step
  useEffect(() => {
    if (mode !== 'tour') return;
    const s = steps[i]; if (!s) return;
    nav(s.href);
    const els = document.querySelectorAll<HTMLElement>(`[data-tour="${s.tour}"]`);
    els.forEach((e) => e.classList.add('tour-target'));
    return () => els.forEach((e) => e.classList.remove('tour-target'));
  }, [mode, i, steps, nav]);

  // background inert + scroll lock while open
  useEffect(() => {
    if (mode === 'closed') return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-tour-inert]'));
    els.forEach((e) => { e.inert = true; e.setAttribute('aria-hidden', 'true'); });
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { els.forEach((e) => { e.inert = false; e.removeAttribute('aria-hidden'); }); document.body.style.overflow = prev; };
  }, [mode]);

  // focus management + trap
  useEffect(() => {
    if (mode === 'closed') return;
    const el = box.current; if (!el) return;
    el.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close('skipped'); return; }
      if (e.key !== 'Tab') return;
      const f = Array.from(el.querySelectorAll<HTMLElement>('button:not([disabled])'));
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!el.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mode, i, close]);

  if (mode === 'closed') return null;
  const s = steps[i];
  const last = i === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-x-hidden p-3 sm:items-end sm:justify-start sm:p-6 lg:pe-[288px]" role="presentation">
      <div className="absolute inset-0 bg-[hsl(var(--indigo)/.35)] backdrop-blur-[1.5px]" onClick={() => close('skipped')} aria-hidden />
      <div ref={box} role="dialog" aria-modal="true" aria-labelledby="tour-title" aria-describedby="tour-body"
        className="tour-card rise relative w-full max-w-md overflow-hidden rounded-[1.4rem] border bg-[hsl(var(--card))] shadow-2xl" data-testid="dialog-onboarding">
        <div className="tour-weave h-2" aria-hidden />
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"><Compass className="h-5 w-5" aria-hidden /></span>
            <button onClick={() => close('skipped')} className="rounded-full p-2 text-muted-foreground hover:bg-[hsl(var(--secondary))]" aria-label="إغلاق الجولة" data-testid="button-tour-close"><X className="h-4 w-4" /></button>
          </div>
          {mode === 'welcome' ? (
            <>
              <h2 id="tour-title" className="mt-4 font-display text-2xl font-semibold">يا هلا في نَسْج!</h2>
              <p id="tour-body" className="mt-2 text-sm leading-relaxed text-muted-foreground">خلّنا نوريك كيف تبدأ. جولة قصيرة من {steps.length} خطوات، وتقدر ترجع لها أي وقت من «المساعدة» أو الإعدادات.</p>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <button className="btn btn-ghost" onClick={() => close('skipped')} data-testid="button-tour-skip">تخطَّ الحين</button>
                <button className="btn btn-primary" data-autofocus onClick={() => { setI(0); setMode('tour'); }} data-testid="button-tour-start">يلا نبدأ <ArrowLeft className="h-4 w-4" /></button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-4 eyebrow" aria-live="polite">الخطوة {i + 1} من {steps.length}</p>
              <h2 id="tour-title" className="mt-1 font-display text-xl font-semibold">{s.title}</h2>
              <p className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate rounded-full bg-[hsl(var(--secondary))] px-2.5 py-1 text-[11px] font-semibold" data-testid="text-tour-page">الصفحة: {PAGE[s.href] ?? s.href}</p>
              <p id="tour-body" className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              <div className="mt-4 flex gap-1" aria-hidden>{steps.map((_, k) => <span key={k} className={cn('h-1 flex-1 rounded-full', k <= i ? 'bg-[hsl(var(--madder))]' : 'bg-[hsl(var(--secondary))]')} />)}</div>
              <div className="mt-5 flex items-center justify-between gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => close('skipped')} data-testid="button-tour-skip">تخطَّ</button>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setI((k) => k - 1)} disabled={i === 0} data-testid="button-tour-prev"><ArrowRight className="h-4 w-4" /> السابق</button>
                  {last
                    ? <button className="btn btn-primary btn-sm" data-autofocus onClick={() => close('finished')} data-testid="button-tour-finish">تمام، خلصنا</button>
                    : <button className="btn btn-primary btn-sm" data-autofocus onClick={() => setI((k) => k + 1)} data-testid="button-tour-next">التالي <ArrowLeft className="h-4 w-4" /></button>}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
