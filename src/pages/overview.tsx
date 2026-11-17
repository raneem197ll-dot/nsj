import { Link } from 'wouter';
import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpLeft, ClipboardCheck, Route as RouteIcon, ShieldCheck, Target, Users, Newspaper, CalendarDays } from 'lucide-react';
import { useDemo, useMeta, fmtDate, useCandidates } from '@/lib/store';
import { PERSONAS, LEVELS, MARKET, NAMES, type DemoState } from '@/lib/data';
import { gaps } from '@/lib/career';
import { PageHeader, Stat, Meter, StateBadge, Initials, SaduBand, DemoNote, STATE_META } from '@/components/kit';
import { LazyLoom, StudentAnalytics, RoleAnalytics } from '@/components/analytics-panels';
import { cn } from '@/lib/utils';
import { statusLabel } from '@/lib/i18n';

const JOURNEY = ['اكتشف', 'تعلّم', 'طبّق', 'احصل على تقييم', 'وثّق', 'كن مرئيًا'];

function pathProgress(steps: { done: boolean }[]) { return steps.length ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100) : 0; }

function StudentDashboard({ st }: { st: DemoState }) {
  const { skills, paths, profile } = st;
  const counts = { declared: skills.length, assessed: skills.filter((s) => s.state !== 'declared').length, evaluated: skills.filter((s) => s.state === 'evaluated' || s.state === 'verified').length, verified: skills.filter((s) => s.state === 'verified').length };
  const active = paths.filter((p) => !p.completedAt);
  const completed = paths.filter((p) => p.completedAt);
  const overall = Math.round(paths.reduce((a, p) => a + pathProgress(p.steps), 0) / Math.max(1, paths.length));
  const g = gaps(st);
  const readiness = Math.round(g.reduce((a, x) => a + x.readiness, 0) / g.length);
  const doneChallenges = st.submissions.filter((s) => s.studentId === 'me' && s.source === 'challenge').length;
  const hk = st.hackathons.filter((h) => h.status === 'completed').length;
  const myProjects = st.projects.filter((p) => p.members.some((m) => m.studentId === 'me'));
  const clubCount = st.activities.filter((a) => a.registered.includes(profile.name)).length;
  const sessions = st.bookings.length;
  const journeyAt = counts.verified > 0 ? 4 : counts.evaluated > 0 ? 3 : 2;
  const scored = skills.filter((s) => typeof s.score === 'number' && Number.isFinite(s.score)).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const nextActions = [
    ...skills.filter((s) => s.state === 'evaluated').map((s) => ({ href: '/passport', title: `أضف دليلًا آخر لتوثيق ${s.name}`, why: `الدرجة ${s.score}، ${s.evidence.filter((e) => e.type !== 'participation').length} من 3 أدلة مؤهلة`, icon: ShieldCheck })),
    ...skills.filter((s) => s.state === 'assessed').slice(0, 1).map((s) => ({ href: '/assessments', title: `اطلب مراجعة مقيّم لـ ${s.name}`, why: 'عمل مُختبر بانتظار مراجع مؤهل', icon: ClipboardCheck })),
    ...g.filter((x) => x.have < 0 || x.state === 'declared').slice(0, 1).map((x) => ({ href: '/learning-paths', title: `ابدأ مسارًا في ${x.skill}`, why: `مطلوبة بمستوى ${LEVELS[x.level]} لمسار ${profile.target}`, icon: RouteIcon })),
    { href: '/challenges', title: 'خض تحديًا مفتوحًا من شركة', why: `${st.challenges.filter((c) => c.status === 'open').length} تحديات مفتوحة تناسب مهاراتك`, icon: Target },
  ].slice(0, 4);
  const recommended = MARKET.skills.filter((m) => !skills.some((s) => s.name === m.name)).sort((a, b) => b.growth - a.growth).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="rise panel relative overflow-hidden p-0">
        <div className="grid gap-0 md:grid-cols-[1.35fr_1fr]">
          <div className="relative p-6 md:p-9">
            <DemoNote>ملف تجريبي</DemoNote>
            <p className="mt-6 eyebrow">سعداء برؤيتك</p>
            <h1 className="mt-2 font-display text-4xl font-semibold leading-[1.05] md:text-[3.4rem]" data-testid="text-welcome">
              {profile.name.split(' ')[0]}، قطعت <span className="text-[hsl(var(--madder))]">{readiness}%</span> من الطريق إلى {profile.target}.
            </h1>
            {st.settings.showArabic && profile.arabicName && profile.arabicName !== profile.name && <p className="mt-3 text-lg text-muted-foreground">{profile.arabicName}</p>}
            <p className="mt-4 max-w-lg text-[15px] text-muted-foreground">
              {counts.verified} مهارات موثّقة بالأدلة، و{counts.evaluated - counts.verified} مُقيَّمة على بُعد دليل واحد. أقوى خيوطك: {scored[0]?.name ?? 'ما زال يتشكّل'}.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/passport" className="btn btn-primary" data-testid="link-open-passport"><ShieldCheck className="h-4 w-4" /> افتح جواز المهارات</Link>
              <Link href="/learning-paths" className="btn btn-ghost" data-testid="link-continue-learning">تابع التعلم <ArrowLeft className="h-4 w-4" /></Link>
            </div>
          </div>
          <div className="relative bg-[hsl(var(--indigo))] p-6 text-[hsl(40_45%_96%)] md:p-8">
            <p className="font-mono text-[10.5px] opacity-60">جواز المهارات، مجسّمًا: كل عمود حالة توثيق</p>
            <div className="-mx-4 -mt-2"><LazyLoom counts={counts} /></div>
            <p className="font-mono text-[10.5px] opacity-60">سلّم التوثيق</p>
            <div className="mt-5 space-y-3">
              {(['declared', 'assessed', 'evaluated', 'verified'] as const).map((k) => (
                <div key={k}>
                  <div className="mb-1 flex items-baseline justify-between text-sm"><span>{STATE_META[k].label}</span><span className="font-display text-2xl font-semibold" data-testid={`text-count-${k}`}>{counts[k]}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={cn('h-full origin-right rounded-full transition-transform duration-1000', k === 'verified' ? 'bg-[hsl(var(--madder))]' : k === 'evaluated' ? 'bg-[hsl(var(--lavender))]' : 'bg-[hsl(var(--saffron))]')} style={{ transform: `scaleX(${counts[k] / Math.max(1, counts.declared)})` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs leading-relaxed opacity-70">كل مهارة موثّقة تحتاج تقييمًا عمليًا، ومقيّمًا مؤهلًا، ودرجة 70 فأكثر، وثلاثة أدلة مؤهلة. شهادات المشاركة لا تُحتسب أبدًا.</p>
          </div>
        </div>
        <SaduBand height={10} />
      </section>

      {/* Journey */}
      <section className="rise panel p-5" style={{ animationDelay: '60ms' }}>
        <div className="flex flex-wrap items-center gap-y-3">
          {JOURNEY.map((j, i) => (
            <div key={j} className="flex items-center">
              <span className={cn('flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold', i < journeyAt ? 'text-[hsl(var(--primary))]' : i === journeyAt ? 'bg-[hsl(var(--madder))] text-[hsl(var(--accent-foreground))]' : 'text-muted-foreground')}>
                <span className={cn('h-2 w-2 rounded-full', i <= journeyAt ? 'bg-current' : 'border border-current')} />{j}
              </span>
              {i < JOURNEY.length - 1 && <span className={cn('mx-1 h-px w-5 md:w-10', i < journeyAt ? 'bg-[hsl(var(--primary))]' : 'bg-border')} />}
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <Stat label="تقدم التعلم" value={`${overall}%`} sub="في كل المسارات" />
        <Stat label="مهارات مُعلنة" value={counts.declared} />
        <Stat label="مهارات مُختبرة" value={counts.assessed} tone="saffron" />
        <Stat label="مهارات موثّقة" value={counts.verified} tone="madder" />
        <Stat label="قيد التطوير" value={skills.filter((s) => s.developing).length} />
        <Stat label="مسارات نشطة / مكتملة" value={`${active.length} / ${completed.length}`} />
        <Stat label="تحديات مُسلّمة" value={doneChallenges} />
        <Stat label="الهاكاثونات" value={hk} sub={`${st.hackathons.filter((h) => h.status !== 'completed').length} قادمة`} />
        <Stat label="مساهمات المشاريع" value={myProjects.length} />
        <Stat label="الأندية والتطوع" value={clubCount + st.volunteering.length} sub={`${st.volunteering.reduce((a, v) => a + v.hours, 0)} ساعة تطوع`} />
        <Stat label="جلسات الإرشاد" value={sessions} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-end justify-between">
            <div><p className="eyebrow">الخطوات التالية المقترحة</p><h2 className="font-display text-2xl font-semibold">ما يدفعك للأمام هذا الأسبوع</h2></div>
          </div>
          <ul className="divide-y">
            {nextActions.map((a, i) => (
              <li key={i}>
                <Link href={a.href} className="group flex items-center gap-4 py-3.5" data-testid={`link-action-${i}`}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))] transition-colors group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))]"><a.icon className="h-4 w-4" /></span>
                  <span className="flex-1"><span className="block text-sm font-semibold">{a.title}</span><span className="block text-xs text-muted-foreground">{a.why}</span></span>
                  <ArrowUpLeft className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">فجوات المهارات لمسار {profile.target}</p>
          <h2 className="font-display text-2xl font-semibold">الجاهزية حسب المتطلب</h2>
          <ul className="mt-5 space-y-4">
            {g.map((x) => (
              <li key={x.skill}>
                <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{x.skill}</span>
                  {x.state ? <StateBadge state={x.state} /> : <span className="chip">لم تبدأ</span>}
                </div>
                <Meter value={x.readiness} tone={x.met ? 'madder' : 'primary'} />
                <p className="mt-1 text-[11px] text-muted-foreground">المطلوب {LEVELS[x.level]}، ومستواك {x.have < 0 ? 'لم تبدأ' : LEVELS[x.have]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StudentAnalytics st={st} />

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div><p className="eyebrow">أعلى الدرجات المُقيَّمة</p><h2 className="font-display text-2xl font-semibold">أقوى خيوطك حاليًا</h2></div>
            <span className="chip">الهدف {st.settings.weeklyGoal} إجراءات أسبوعيًا</span>
          </div>
          {scored.length === 0 && <p className="mt-4 text-sm text-muted-foreground">ما فيه مهارات مُقيَّمة بدرجة بعد.</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {scored.slice(0, 3).map((s) => (
              <div key={s.id} className="rounded-xl bg-[hsl(var(--secondary)/.6)] p-3">
                <p className="truncate text-xs text-muted-foreground">{s.name}</p>
                <p className="font-display text-2xl font-semibold">{s.score}<span className="text-sm text-muted-foreground">/100</span></p>
                <p className="text-[11px] text-muted-foreground">الاتجاه: {s.history.length} محطات منذ {fmtDate(s.history[0].date)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">الأحدث</p>
          <h2 className="font-display text-2xl font-semibold">سجل النشاط</h2>
          <ol className="mt-4 space-y-3 border-s ps-4">
            {st.log.slice(0, 6).map((l, i) => (
              <li key={i} className="relative text-sm">
                <span className="absolute -start-[21px] top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--madder))]" />
                <p>{l.label}</p><p className="text-[11px] text-muted-foreground">{fmtDate(l.date)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel p-6">
          <p className="eyebrow">مسارات التعلم النشطة</p>
          <div className="mt-4 space-y-4">
            {active.map((p) => (
              <Link key={p.id} href={`/learning-paths/${p.id}`} className="block rounded-xl border p-4 transition-colors hover:bg-[hsl(var(--secondary)/.5)]" data-testid={`link-path-${p.id}`}>
                <div className="flex items-center justify-between"><span className="font-semibold">{p.title}</span><span className="font-mono text-xs">{pathProgress(p.steps)}%</span></div>
                <Meter value={pathProgress(p.steps)} className="mt-2" />
                <p className="mt-2 text-xs text-muted-foreground">التالي: {p.steps.find((s) => !s.done)?.title ?? 'جاهز للإكمال'}</p>
              </Link>
            ))}
            {active.length === 0 && <p className="text-sm text-muted-foreground">لا توجد مسارات نشطة. أنشئ مسارًا من تقييم تحديد المستوى.</p>}
          </div>
        </div>
        <div className="panel p-6">
          <p className="eyebrow">توصيات شخصية</p>
          <h2 className="font-display text-xl font-semibold">صاعدة في السوق، وليست في جوازك بعد</h2>
          <div className="mt-2"><DemoNote>نسب نمو توضيحية من بيانات السوق التجريبية</DemoNote></div>
          <ul className="mt-4 space-y-3">
            {recommended.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <span><span className="block text-sm font-semibold">{m.name}</span><span className="text-xs text-muted-foreground">{m.industries.slice(0, 3).join('، ')}</span></span>
                <span className="font-mono text-sm text-[hsl(var(--madder))]">+{m.growth}%</span>
              </li>
            ))}
          </ul>
          <Link href="/market-pulse" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--primary))]">افتح نبض السوق <ArrowLeft className="h-3.5 w-3.5" /></Link>
        </div>
      </section>
    </div>
  );
}

function ListCard({ title, eyebrow, children, href, cta }: { title: string; eyebrow: string; children: ReactNode; href?: string; cta?: string }) {
  return (
    <div className="panel p-6">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="font-display text-2xl font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
      {href && <Link href={href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[hsl(var(--primary))]">{cta} <ArrowLeft className="h-3.5 w-3.5" /></Link>}
    </div>
  );
}

function ProfessorDashboard({ st }: { st: DemoState }) {
  const pending = st.submissions.filter((s) => s.status === 'pending');
  const done = st.submissions.filter((s) => s.evaluatorRole === 'professor');
  const supervised = useCandidates(st);
  const needHelp = supervised.filter((c) => c.skills.some((s) => (s.score ?? 100) < 70));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="مساحة الأستاذ الجامعي" title={`صباح الخير، ${PERSONAS.professor.name}`} desc="اربط النظرية بالتحديات التي يحلها طلابك فعلًا." actions={<Link href="/assessments" className="btn btn-primary"><ClipboardCheck className="h-4 w-4" /> افتح قائمة المراجعة</Link>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="طلاب تحت الإشراف" value={supervised.length} />
        <Stat label="مسارات تعلم نشطة" value={st.paths.filter((p) => !p.completedAt).length} />
        <Stat label="تحديات منشأة" value={st.challenges.filter((c) => c.orgKind === 'professor').length} />
        <Stat label="بانتظار المراجعة" value={pending.length} tone="madder" />
        <Stat label="يحتاجون مساعدة" value={needHelp.length} tone="saffron" />
        <Stat label="تقييمات مكتملة" value={done.length} />
        <Stat label="محتوى منشور" value={st.posts.filter((p) => p.authorRole === 'professor').length} />
      </div>
      <RoleAnalytics st={st} role="professor" unit="تسليم" dates={st.submissions.map((s) => s.submittedAt)} metrics={[{ kind: 'evaluation_completed', label: 'تقييمات أنجزتها' }, { kind: 'challenge_created', label: 'مهام أنشأتها' }, { kind: 'post_created', label: 'محتوى نشرته' }, { kind: 'path_created', label: 'مسارات أُنشئت' }]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard eyebrow="قائمة المراجعة" title="تسليمات بانتظارك" href="/assessments" cta="قيّم وفق المعايير">
          <ul className="divide-y">{pending.slice(0, 4).map((s) => <li key={s.id} className="flex items-center gap-3 py-3"><Initials name={s.studentName} size={30} /><span className="flex-1"><span className="block text-sm font-semibold">{s.title}</span><span className="text-xs text-muted-foreground">{s.studentName} · {s.skill}</span></span><span className="text-xs text-muted-foreground">{fmtDate(s.submittedAt)}</span></li>)}</ul>
          {pending.length === 0 && <p className="text-sm text-muted-foreground">القائمة فارغة.</p>}
        </ListCard>
        <ListCard eyebrow="تحليلات تقدم الطلاب" title="متوسط الدرجة المُقيَّمة لكل طالب" href="/passport" cta="افتح تقدم الطلاب">
          <ul className="space-y-3">{supervised.map((c) => { const sc = c.skills.filter((s) => typeof s.score === 'number' && Number.isFinite(s.score)); const avg = sc.length ? Math.round(sc.reduce((a, s) => a + (s.score ?? 0), 0) / sc.length) : null; return <li key={c.id}><div className="mb-1 flex justify-between text-sm"><span>{c.name}</span><span className="font-mono text-xs">{avg ?? 'غير متاح'}</span></div><Meter value={avg ?? 0} tone={avg === null || avg < 70 ? 'saffron' : 'primary'} /></li>; })}</ul>
        </ListCard>
      </div>
    </div>
  );
}

function CompanyDashboard({ st }: { st: DemoState }) {
  const mine = st.challenges.filter((c) => c.org === NAMES.company);
  const subs = st.submissions.filter((s) => mine.some((c) => c.id === s.refId));
  const cands = useCandidates(st);
  const verifiedCands = cands.filter((c) => c.skills.some((s) => s.state === 'verified'));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="مساحة الشركة · خالد العمري، مسؤول التوظيف" title={`لوحة مواهب ${NAMES.company}`} desc="حدّد معايير الجودة، وانشر تحديات حقيقية، ووظّف بناءً على الأدلة لا السير الذاتية." actions={<><Link href="/challenges" className="btn btn-primary"><Target className="h-4 w-4" /> أنشئ تحديًا</Link><Link href="/passport" className="btn btn-ghost">اكتشف المواهب</Link></>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="تحديات نشطة" value={mine.filter((c) => c.status === 'open').length} />
        <Stat label="متطلبات المهارات" value={st.requirements.filter((r) => r.org === NAMES.company).length} />
        <Stat label="المتقدمون" value={mine.reduce((a, c) => a + c.applicants, 0)} sub="إجمالي تاريخي تجريبي" />
        <Stat label="التسليمات" value={subs.length} />
        <Stat label="تحديات مكتملة" value={mine.filter((c) => c.status === 'closed').length} />
        <Stat label="جوازات بمهارات موثّقة" value={verifiedCands.length} tone="madder" />
        <Stat label="في القائمة المختصرة" value={st.shortlist.length} tone="saffron" />
        <Stat label="رسائل مرسلة" value={st.messages.length} />
      </div>
      <RoleAnalytics st={st} role="company" unit="تسليم" dates={subs.map((s) => s.submittedAt)} metrics={[{ kind: 'challenge_created', label: 'تحديات نُشرت' }, { kind: 'requirement_created', label: 'متطلبات أضيفت' }, { kind: 'evaluation_completed', label: 'تقييمات' }, { kind: 'post_created', label: 'منشورات' }]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard eyebrow="مهارات مطلوبة" title="ما يطلبه فريقك" href="/skills" cta="إدارة المتطلبات">
          <ul className="space-y-2">{st.requirements.map((r) => <li key={r.id} className="flex items-center justify-between rounded-xl border p-3 text-sm"><span><span className="font-semibold">{r.skill}</span><span className="block text-xs text-muted-foreground">{r.org}</span></span><span className="chip">{LEVELS[r.level]}</span></li>)}</ul>
        </ListCard>
        <ListCard eyebrow="القائمة المختصرة" title="مرشحون تتابعهم" href="/passport" cta="قارن المرشحين">
          <ul className="divide-y">{cands.filter((c) => st.shortlist.includes(c.id)).map((c) => <li key={c.id} className="flex items-center gap-3 py-3"><Initials name={c.name} tone="madder" size={32} /><span className="flex-1"><span className="block text-sm font-semibold">{c.name}</span><span className="text-xs text-muted-foreground">{c.major}، {c.university}</span></span><span className="text-xs">{c.skills.filter((s) => s.state === 'verified').length} موثّقة</span></li>)}</ul>
          {st.shortlist.length === 0 && <p className="text-sm text-muted-foreground">لا أحد في القائمة المختصرة بعد.</p>}
        </ListCard>
      </div>
    </div>
  );
}

function ProfessionalDashboard({ st }: { st: DemoState }) {
  const mine = st.posts.filter((p) => p.author === NAMES.professional);
  const reviewed = st.submissions.filter((s) => s.evaluatorRole === 'professional');
  const me = st.mentors.find((m) => m.id === 'm-1');
  const myBookings = st.bookings.filter((b) => b.mentorId === 'm-1');
  const contributions = st.paths.flatMap((p) => p.steps).filter((s) => s.contributor === NAMES.professional).length;
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="مساحة المختص" title={`${NAMES.professional.split(' ')[0]}، السوق يُصغي`} desc="خبرتك تصبح منهجًا. كل رؤية ومراجعة وجلسة تصل إلى سجل أدلة طالب." actions={<Link href="/community" className="btn btn-primary"><Newspaper className="h-4 w-4" /> انشر رؤية</Link>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="طلبات الإرشاد" value={myBookings.length} sub={`${myBookings.filter((b) => b.status === 'completed').length} مكتملة`} />
        <Stat label="جلسات مؤكدة" value={myBookings.filter((b) => b.status === 'confirmed').length} />
        <Stat label="رؤى منشورة" value={mine.length} tone="madder" />
        <Stat label="بانتظار المراجعة" value={st.submissions.filter((s) => s.status === 'pending').length} />
        <Stat label="مشاريع قيّمتها" value={reviewed.length} />
        <Stat label="مساهمات في المسارات" value={contributions} />
        <Stat label="مواعيد متاحة" value={me?.slots.length ?? 0} tone="saffron" />
        <Stat label="حفظ منشوراتك" value={mine.reduce((a, p) => a + p.saves, 0)} />
      </div>
      <RoleAnalytics st={st} role="professional" unit="منشور" dates={mine.map((p) => p.date)} metrics={[{ kind: 'booking_completed', label: 'جلسات أكملتها' }, { kind: 'evaluation_completed', label: 'مشاريع قيّمتها' }, { kind: 'post_created', label: 'رؤى نشرتها' }, { kind: 'booking_created', label: 'حجوزات جديدة' }]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard eyebrow="القادم" title="طلبات الإرشاد" href="/mentorship" cta="إدارة المواعيد">
          <ul className="divide-y">{st.bookings.filter((b) => b.mentorId === 'm-1').map((b) => <li key={b.id} className="flex items-center gap-3 py-3 text-sm"><CalendarDays className="h-4 w-4 text-[hsl(var(--madder))]" /><span className="flex-1"><span className="block font-semibold">{b.topic}</span><span className="text-xs text-muted-foreground">{b.slot}</span></span><span className="chip">{statusLabel(b.status)}</span></li>)}</ul>
        </ListCard>
        <ListCard eyebrow="بانتظار مراجعة القطاع" title="مشاريع للتقييم" href="/assessments" cta="افتح المراجعات">
          <ul className="divide-y">{st.submissions.filter((s) => s.status === 'pending').slice(0, 4).map((s) => <li key={s.id} className="py-3 text-sm"><span className="font-semibold">{s.title}</span><span className="block text-xs text-muted-foreground">{s.studentName} · {s.skill}</span></li>)}</ul>
        </ListCard>
      </div>
    </div>
  );
}

function ClubDashboard({ st }: { st: DemoState }) {
  const acts = st.activities;
  const registered = new Set(acts.flatMap((a) => a.registered));
  const assignments = acts.flatMap((a) => a.assignments);
  const skillSet = Array.from(new Set(acts.flatMap((a) => a.skills)));
  return (
    <div className="space-y-8">
      <PageHeader eyebrow="مساحة النادي" title={NAMES.clubFull} desc="حوّل الفعاليات إلى أدلة. سجّل من فعل ماذا، ليخرج كل منظم بإثبات." actions={<Link href="/clubs" className="btn btn-primary"><Users className="h-4 w-4" /> انشر نشاطًا</Link>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="أنشطة نشطة" value={acts.filter((a) => a.status === 'open').length} />
        <Stat label="طلاب مسجلون" value={registered.size} />
        <Stat label="برامج مكتملة" value={acts.filter((a) => a.status === 'completed').length} />
        <Stat label="نسبة المشاركة" value={`${Math.round((acts.reduce((a, x) => a + x.registered.length, 0) / Math.max(1, acts.reduce((a, x) => a + x.capacity, 0))) * 1000) / 10}%`} sub="التسجيلات مقابل السعة" />
        <Stat label="مساهمات مسجلة" value={assignments.filter((a) => a.recorded).length} tone="madder" />
        <Stat label="مسؤوليات مُسندة" value={assignments.length} />
        <Stat label="الإنجازات" value={st.projects.filter((p) => p.kind === 'club').length} />
        <Stat label="مهارات مرتبطة" value={skillSet.length} tone="saffron" />
      </div>
      <RoleAnalytics st={st} role="club" unit="نشاط" dates={acts.map((a) => a.date)} metrics={[{ kind: 'activity_created', label: 'أنشطة نُشرت' }, { kind: 'registration_added', label: 'تسجيلات جديدة' }, { kind: 'responsibility_recorded', label: 'مساهمات سُجلت' }, { kind: 'post_created', label: 'منشورات' }]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ListCard eyebrow="المهارات المرتبطة بالأنشطة" title="ما يمارسه أعضاؤك" href="/clubs" cta="إدارة الأنشطة">
          <div className="flex flex-wrap gap-2">{skillSet.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        </ListCard>
        <ListCard eyebrow="القادم" title="أنشطة مفتوحة" href="/clubs" cta="افتح التسجيل">
          <ul className="space-y-3">{acts.filter((a) => a.status === 'open').map((a) => <li key={a.id}><div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{a.title}</span><span className="font-mono text-xs">{a.registered.length}/{a.capacity}</span></div><Meter value={(a.registered.length / a.capacity) * 100} tone="saffron" /></li>)}</ul>
        </ListCard>
      </div>
    </div>
  );
}

const META = {
  student: 'نظرتك الشخصية في نَسْج: المهارات وسلّم التوثيق ومسارات التعلم والفجوات والخطوات التالية.',
  professor: 'نظرة الأستاذ: الإشراف وقائمة المراجعة وتحليلات تقدم الطلاب.',
  company: 'نظرة الشركة: التحديات والمتطلبات والمتقدمون والمواهب المختارة.',
  professional: 'نظرة المختص: الإرشاد والرؤى وتقييم المشاريع.',
  club: 'نظرة النادي: الأنشطة والتسجيلات ومساهمات الطلاب المسجلة.',
};

export default function Overview() {
  const st = useDemo();
  useMeta('نظرة عامة', META[st.role]);
  const map = { student: StudentDashboard, professor: ProfessorDashboard, company: CompanyDashboard, professional: ProfessionalDashboard, club: ClubDashboard };
  const C = map[st.role];
  return <C st={st} />;
}

export { pathProgress };
