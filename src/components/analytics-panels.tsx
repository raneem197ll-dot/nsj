import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useDemo } from '@/lib/store';
import { LEVELS, type DemoState, type Role } from '@/lib/data';
import { studentAnalytics, roleEvents, datedCounts, PERIOD_LABEL, GRAIN_LABEL, fmtDay, toMs, type Period } from '@/lib/analytics';
import { ChartCard, DataTable, EmptyChart, Segmented, ActivityChart, ProgressChart, GapChart, StateChart, RubricChart } from './charts';
import { STATE_META } from './kit';
import { LogoMark, hasWebGL } from './brand';
import { AnalyticsReportPreview } from './analytics-report-preview';
import { ANALYTICS_DEFINITIONS, buildStudentReport, buildRoleReport } from '@/lib/analytics-report';
import { goalStatus, skillsWithGoals } from '@/lib/skill-goals';
import { fmtDate } from '@/lib/store';
import { Link } from 'wouter';


const WovenOrb = lazy(() => import('./woven-orb'));
const PERIODS: { value: Period; label: string }[] = [{ value: '30', label: '30 يومًا' }, { value: '90', label: '90 يومًا' }, { value: 'all', label: 'كل الفترة' }];
const PeriodSelector = Segmented<Period>;

function useSystemReduced() {
  const [r, setR] = useState(() => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { if (typeof matchMedia === 'undefined') return; const m = matchMedia('(prefers-reduced-motion: reduce)'); const h = () => setR(m.matches); m.addEventListener('change', h); return () => m.removeEventListener('change', h); }, []);
  return r;
}

/** Loads the 3D bundle only once the slot approaches the viewport. */
export function LazyLoom({ counts }: { counts: { declared: number; assessed: number; evaluated: number; verified: number } }) {
  const { settings } = useDemo();
  const sys = useSystemReduced();
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [ok] = useState(hasWebGL);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (typeof IntersectionObserver === 'undefined') { setNear(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el); return () => io.disconnect();
  }, []);
  const fallback = <div className="loom-fallback flex items-center justify-center" role="img" aria-label="رسم ثابت لنسيج المهارات"><LogoMark className="h-24 w-24 opacity-80" /></div>;
  return <div ref={ref}>{near && ok ? <Suspense fallback={fallback}><WovenOrb counts={counts} reduced={settings.reducedMotion || sys} /></Suspense> : fallback}</div>;
}

function Delta({ cur, prev }: { cur: number; prev: number | null }) {
  if (prev === null) return <span className="text-[11px] text-muted-foreground">لا مقارنة: السجل لا يغطي الفترة السابقة كاملة</span>;
  const d = cur - prev;
  return <span className="text-[11px] text-muted-foreground">{d === 0 ? 'مثل' : d > 0 ? `أعلى بـ ${d} من` : `أقل بـ ${-d} من`} الفترة السابقة ({prev})</span>;
}

function Coverage({ st }: { st: DemoState }) {
  const a = (st as DemoState & { analytics?: { startedAt?: string } }).analytics;
  const ms = toMs(a?.startedAt);
  return <p className="text-[11px] text-muted-foreground">{ms !== null ? `سجل الأحداث المؤرخ يبدأ ${fmtDay(ms)}. ما قبله يعتمد فقط على التواريخ المحفوظة في السجلات التجريبية.` : 'لا يوجد سجل أحداث مؤرخ بعد؛ نعتمد على التواريخ المحفوظة في السجلات فقط.'}</p>;
}

export function StudentAnalytics({ st }: { st: DemoState }) {
  const [period, setPeriod] = useState<Period>('all');
  const [skill, setSkill] = useState('all');
  const [pathId, setPathId] = useState('all');
  const a = useMemo(() => studentAnalytics(st, { period, skill, pathId }), [st, period, skill, pathId]);
  const g = GRAIN_LABEL[a.grain];
  const total = a.recs.length;
  const scoped = a.scopeSkill !== 'all';
  const goalSkills = skillsWithGoals(st, skill, pathId);

  return (
    <section className="space-y-4" aria-labelledby="an-title" data-testid="section-student-analytics">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="eyebrow">تحليلات التقدم · {PERIOD_LABEL[period]}</p><h2 id="an-title" className="font-display text-2xl font-semibold">وين وصلت، بالأرقام الفعلية</h2><Coverage st={st} /></div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector label="الفترة" value={period} onChange={setPeriod} items={PERIODS} />
          <select className="field !w-auto min-w-0 max-w-full !py-1.5 text-xs" value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="تصفية حسب المهارة" data-testid="select-skill-filter">
            <option value="all">كل المهارات</option>{st.skills.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <select className="field !w-auto min-w-0 max-w-full !py-1.5 text-xs" value={pathId} onChange={(e) => setPathId(e.target.value)} aria-label="تصفية حسب المسار" data-testid="select-path-filter">
            <option value="all">كل المسارات</option>{st.paths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <AnalyticsReportPreview createReport={() => buildStudentReport(st, { period, skill, pathId }, a)} />
        </div>
      </div>

      <div className="panel p-5" data-testid="panel-skill-goals">
        <h3 className="font-display text-xl font-semibold">أهداف مهاراتك الشخصية · {goalSkills.length}</h3>
        <p className="mt-2 text-xs text-muted-foreground">الحالي مقابل هدفك من الحالة المسجلة الآن، وليس توقعًا مستقبليًا. يتبع تصفية المهارة والمسار، ولا يتأثر بالفترة. المستوى قد يكون ذاتيًا؛ تحقيق الهدف لا يعني توثيق المهارة.</p>
        {goalSkills.length ? <div className="mt-4 overflow-x-auto"><DataTable caption="الحالي مقابل الهدف الشخصي" head={['المهارة', 'الحالي المسجل', 'هدفك', 'الموعد الميلادي', 'حالة الهدف']} rows={goalSkills.map((s) => [s.name, LEVELS[s.level], LEVELS[s.goal!.targetLevel], fmtDate(`${s.goal!.deadline}T12:00:00`), goalStatus(s)!])} /></div>
          : <p className="my-4 text-sm text-muted-foreground" data-testid="text-goals-empty">لا توجد أهداف شخصية ضمن هذا العرض. أنشئ هدفًا من صفحة مهاراتي أو غيّر التصفية.</p>}
        <Link href="/skills" className="btn btn-ghost btn-sm mt-3" data-testid="link-analytics-goals">إدارة أهدافي</Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <ChartCard eyebrow={`النشاط لكل ${g}`} title={`${total} سجل مؤرخ في ${PERIOD_LABEL[period]}`} desc={<Delta cur={total} prev={a.prevCount} />} testid="chart-activity"
          table={a.activity.length ? <DataTable caption="النشاط" head={[a.grain === 'week' ? 'بداية الأسبوع' : g, 'عدد السجلات']} rows={a.activity.map((b) => [a.grain === 'week' ? fmtDay(b.t) : b.label, b.count])} /> : undefined}>
          {total ? <ActivityChart data={a.activity} grain={a.grain} /> : <EmptyChart title="ما فيه سجلات مؤرخة في هذي الفترة" body="جرّب «كل الفترة»، أو سلّم عملًا أو أكمل خطوة وبيظهر هنا مباشرة." />}
        </ChartCard>
        <ChartCard eyebrow="التقدم الإجمالي بمرور الوقت" title={`الجاهزية الإجمالية الآن ${a.kpi.readiness}% · التعلم ${a.kpi.learning}%`} desc="مؤشرات إجمالية لكل ملفك، لا تتأثر بفلتر المهارة أو المسار. القيمة تبقى ثابتة بين اللقطات وتتغير فقط عند إجراء فعلي." testid="chart-progress"
          table={a.snaps.length ? <DataTable caption="لقطات التقدم" head={['التاريخ', 'الجاهزية', 'التعلم', 'موثّقة']} rows={a.snaps.map((s) => [fmtDay(s.t), `${s.readiness}%`, `${s.learning}%`, `${s.verified} من ${s.total}`])} /> : undefined}>
          {a.snaps.length >= 2 ? <ProgressChart data={a.snaps} /> : <EmptyChart title={a.snaps.length ? 'لقطة واحدة فقط حتى الآن' : 'ما فيه لقطات بعد'} body="نحتاج لقطتين على الأقل لرسم اتجاه. كل إجراء يحرّك تقدمك يضيف لقطة." />}
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard eyebrow="المستوى الحالي مقابل المطلوب · الحالة الآن" title={`متطلبات مسار ${st.profile.target}${scoped ? ` · ${a.scopeSkill}` : ''}`} desc="لقطة للوضع الحالي، لا تتأثر بالفترة الزمنية. الشريط المنقط هو المطلوب." testid="chart-gap"
          table={<DataTable caption="الفجوات" head={['المهارة', 'الحالي', 'المطلوب', 'الجاهزية']} rows={a.gapRows.map((r) => [r.skill, r.started ? LEVELS[r.current - 1] : 'لم تبدأ', LEVELS[r.required - 1], `${r.readiness}%`])} />}>
          {a.gapRows.length ? <GapChart rows={a.gapRows} /> : <EmptyChart title="المهارة المختارة ليست ضمن متطلبات المسار" body="اختر «كل المهارات» لعرض كل المتطلبات." />}
        </ChartCard>
        <ChartCard eyebrow="توزيع حالات المهارات · الحالة الآن" title={`${a.states.find((x) => x.state === 'verified')?.count ?? 0} موثّقة من ${a.scopeCount}${scoped ? ` في ${a.scopeSkill}` : ''}`} desc="لقطة للوضع الحالي، لا تتأثر بالفترة الزمنية." testid="chart-states"
          table={<DataTable caption="الحالات" head={['الحالة', 'عدد المهارات']} rows={a.states.map((s) => [STATE_META[s.state].label, s.count])} />}>
          <StateChart data={a.states} />
        </ChartCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard eyebrow="إنجاز المسارات · الحالة الآن" title="الخطوات المكتملة لكل مسار" desc="لا تتأثر بالفترة الزمنية؛ تواريخ إكمال الخطوات القديمة غير مسجلة." testid="chart-paths">
          {a.paths.length ? (
            <ul className="space-y-3">{a.paths.map((p) => (
              <li key={p.id}>
                <div className="mb-1 flex justify-between gap-2 text-sm"><span className="truncate font-medium">{p.title}</span><span className="shrink-0 font-mono text-xs">{p.done}/{p.total} خطوات · {p.pct}%{p.completed ? ' · مكتمل' : ''}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]" role="progressbar" aria-valuenow={p.pct} aria-valuemin={0} aria-valuemax={100} aria-label={p.title}><div className="h-full origin-right rounded-full bg-[hsl(var(--madder))]" style={{ transform: `scaleX(${p.pct / 100})` }} /></div>
              </li>))}</ul>
          ) : <EmptyChart title="ما فيه مسار يطابق التصفية" body="أنشئ مسارًا من تقييم تحديد المستوى، أو غيّر الفلتر." />}
        </ChartCard>
        <ChartCard eyebrow="نتائج التقييم حسب المعيار" title={`${a.evalCount} تقييم وفق المعايير${scoped ? ` · ${a.scopeSkill}` : ''}`} desc={`متوسط الدرجة لكل معيار من 5.${a.undatedEvals ? ` يشمل ${a.undatedEvals} تقييمات تجريبية بلا تاريخ تقييم مسجل، لذلك تظهر في «كل الفترة» فقط.` : ''}`} testid="chart-rubric"
          table={a.rubric.length ? <DataTable caption="المعايير" head={['المعيار', 'المتوسط من 5', 'عدد التقييمات']} rows={a.rubric.map((r) => [r.name, r.avg, r.n])} /> : undefined}>
          {a.rubric.length ? <RubricChart data={a.rubric} /> : <EmptyChart title="ما فيه تقييمات في هذي الفترة" body="لما يقيّم أستاذ أو مختص عملك، تظهر هنا درجاتك لكل معيار." />}
        </ChartCard>
      </div>

      <details className="panel p-5 text-sm">
        <summary className="cursor-pointer font-semibold">تعريفات المؤشرات</summary>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">{ANALYTICS_DEFINITIONS.map(({ label, value }) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="text-xs text-muted-foreground">{value}</dd></div>)}</dl>
      </details>
    </section>
  );
}

/** Role analytics: telemetry event counts + dated-entity activity. */
export function RoleAnalytics({ st, role, metrics, dates, unit }: { st: DemoState; role: Exclude<Role, 'student'>; metrics: { kind: string; label: string }[]; dates: (string | undefined)[]; unit: string }) {
  const [period, setPeriod] = useState<Period>('all');
  const r = useMemo(() => roleEvents(st, role, period), [st, role, period]);
  const dc = useMemo(() => datedCounts(dates, r.w), [dates, r.w]);
  const g = GRAIN_LABEL[dc.grain];
  const eg = GRAIN_LABEL[r.grain];
  return (
    <section className="space-y-4" data-testid={`section-${role}-analytics`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div><p className="eyebrow">التحليلات · {PERIOD_LABEL[period]}</p><h2 className="font-display text-2xl font-semibold">نشاطك المسجّل</h2><Coverage st={st} /></div>
        <div className="flex flex-wrap items-center gap-2">
          <PeriodSelector label="الفترة" value={period} onChange={setPeriod} items={PERIODS} />
          <AnalyticsReportPreview createReport={() => buildRoleReport(st, role, period, metrics, unit, r, dc)} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {metrics.map((m) => {
          const cur = r.byKind(r.cur, m.kind);
          return (
            <div key={m.kind} className="panel p-4" data-testid={`metric-${m.kind}`}>
              <p className="eyebrow">{m.label}</p>
              <p className="mt-1 font-display text-3xl font-semibold">{cur}</p>
              <Delta cur={cur} prev={r.prev ? r.byKind(r.prev, m.kind) : null} />
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
      <ChartCard eyebrow={`إجراءاتك المسجلة لكل ${eg}`} title={`${r.cur.length} إجراء في ${PERIOD_LABEL[period]}`} desc="من سجل الأحداث منذ بدء التتبع: مراجعات، جلسات، تسجيلات، نشر وغيرها." testid={`chart-${role}-events`}
        table={r.cur.length ? <DataTable caption="الإجراءات" head={[r.grain === 'week' ? 'بداية الأسبوع' : eg, 'العدد']} rows={r.activity.map((b) => [r.grain === 'week' ? fmtDay(b.t) : b.label, b.count])} /> : undefined}>
        {r.cur.length ? <ActivityChart data={r.activity} grain={r.grain} unit="إجراء" /> : <EmptyChart title="ما سجلنا لك إجراء بعد" body="أي مراجعة أو جلسة أو تسجيل أو نشر تسويه من الحين يظهر هنا مباشرة." />}
      </ChartCard>
      <ChartCard eyebrow={`${unit} لكل ${g}`} title={`${dc.n} ${unit} بتاريخ محفوظ`} desc="مبني على التواريخ المخزنة في السجلات نفسها." testid={`chart-${role}-activity`}
        table={dc.n ? <DataTable caption={unit} head={[dc.grain === 'week' ? 'بداية الأسبوع' : g, 'العدد']} rows={dc.buckets.map((b) => [dc.grain === 'week' ? fmtDay(b.t) : b.label, b.count])} /> : undefined}>
        {dc.n ? <ActivityChart data={dc.buckets} grain={dc.grain} unit={unit} /> : <EmptyChart title="ما فيه سجلات مؤرخة في هذي الفترة" body="البيانات التجريبية مؤرخة في 2024 و2025. اختر «كل الفترة» أو أضف سجلًا جديدًا." />}
      </ChartCard>
      </div>
    </section>
  );
}
