import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeftRight, Plus, X, GraduationCap, HandHelping, CheckCircle2, Circle, Clock, MapPin, ArrowLeft, Repeat2 } from 'lucide-react';
import { useDemo, useMeta, useCandidates, mutate, log } from '@/lib/store';
import { PageHeader, Initials, DemoNote, Empty } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  buildPeople, exchangeMatches, exchangeMarket, buildPlan, canTeach, strength, useLocal,
  STATE_LABEL, STATE_TONE, type ExchangePlan, type Match,
} from '@/lib/matching';

type Ex = { teach: string[]; learn: string[]; plans: ExchangePlan[] };

export default function Exchange() {
  const st = useDemo();
  const { toast } = useToast();
  useMeta('علّمني وأعلّمك', 'تبادل المهارات بين الطلاب: علّم ما تتقنه وتعلّم ما تحتاجه، بخطة تعلّم واضحة للطرفين.');
  const cands = useCandidates(st);
  const mine = cands.find((c) => c.id === 'me')?.skills ?? [];
  const pool = useMemo(() => buildPeople(cands), [cands]);
  const [ex, setEx] = useLocal<Ex>('nasj-exchange-v1', () => ({
    teach: mine.filter(canTeach).map((s) => s.name),
    learn: mine.filter((s) => s.state === 'declared' || s.level === 0).map((s) => s.name).concat(['تعلّم الآلة']).slice(0, 4),
    plans: [],
  }));
  const [draft, setDraft] = useState('');
  const matches = exchangeMatches(ex.teach, ex.learn, mine, pool);
  const market = exchangeMarket(pool, ex.learn, ex.teach);
  const maxM = Math.max(1, ...market.map((m) => Math.max(m.supply, m.demand)));
  const hoursGiven = ex.plans.reduce((a, p) => a + p.weeks.filter((w) => w.done).length, 0);
  const allLearnable = useMemo(() => [...new Set(pool.flatMap((p) => p.skills.filter(canTeach).map((s) => s.name)))].filter((n) => !ex.learn.includes(n)), [pool, ex.learn]);

  const toggle = (k: 'teach' | 'learn', n: string) => setEx((e) => ({ ...e, [k]: e[k].includes(n) ? e[k].filter((x) => x !== n) : [...e[k], n] }));
  const addLearn = (n: string) => { const v = n.trim(); if (!v) return; setEx((e) => (e.learn.includes(v) ? e : { ...e, learn: [...e.learn, v] })); setDraft(''); };
  const start = (m: Match) => {
    const iLearn = m.theyTeach[0].name; const iTeach = m.iTeach[0] ?? ex.teach[0];
    if (!iTeach) { toast({ title: 'اختاري مهارة تعلّمينها أولًا' }); return; }
    if (ex.plans.some((p) => p.peerId === m.person.id)) { toast({ title: 'لديك خطة تبادل قائمة مع هذا الشخص' }); return; }
    const plan = buildPlan(m.person, iLearn, iTeach);
    setEx((e) => ({ ...e, plans: [plan, ...e.plans] }));
    mutate((d) => log(d, `بدء تبادل مهارات مع ${m.person.name}: ${iLearn} مقابل ${iTeach}`, 'mentorship'));
    toast({ title: 'بدأت خطة التبادل', description: `${iLearn} مقابل ${iTeach} · 6 أسابيع` });
  };
  const tick = (planId: string, n: number) => setEx((e) => ({ ...e, plans: e.plans.map((p) => p.id !== planId ? p : { ...p, weeks: p.weeks.map((w) => w.n === n ? { ...w, done: !w.done } : w) }) }));
  const end = (planId: string) => setEx((e) => ({ ...e, plans: e.plans.filter((p) => p.id !== planId) }));

  if (st.role !== 'student') return <><PageHeader eyebrow="علّمني وأعلّمك" title="تبادل المهارات بين الطلاب" /><Empty icon={Repeat2} title="هذه المساحة للطلاب" body="بدّل إلى دور الطالب من القائمة الجانبية لتجربة تبادل المهارات." /></>;

  return (
    <>
      <PageHeader eyebrow="علّمني وأعلّمك" title="علّم ما تتقنه، وتعلّم ما ينقصك." desc="تكتبين ما تعرفينه وما تبين تتعلمينه، ونطابقك مع طالب يكمّلك. تعلّمينه مهارتك ويعلّمك مهارته، بخطة واضحة من ستة أسابيع." />

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[['أقدر أعلّم', ex.teach.length, 'tint-teal'], ['أبي أتعلّم', ex.learn.length, 'tint-violet'], ['تطابق متبادل', matches.filter((m) => m.mutual).length, 'tint-sand'], ['جلسات منجزة', hoursGiven * 2, 'tint-rose']].map(([l, v, t]) => (
          <div key={l as string} className="panel p-4" data-testid={`kpi-${l}`}>
            <span className={cn('chip-icon', t as string)}><ArrowLeftRight className="h-4 w-4" /></span>
            <p className="num mt-3 text-[1.75rem] leading-none">{v as number}</p>
            <p className="mt-1 text-xs text-muted-foreground">{l as string}</p>
          </div>
        ))}
      </section>

      {/* what I offer / what I want */}
      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="panel p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-ar-head text-xl"><HandHelping className="h-5 w-5 text-[hsl(var(--teal))]" />أقدر أعلّم</h2>
          <p className="mt-1 text-xs text-muted-foreground">من مهاراتك المختبرة فأعلى. المهارات المعلنة فقط لا تُعرض للتعليم.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mine.map((s) => {
              const ok = canTeach(s); const on = ex.teach.includes(s.name);
              return (
                <button key={s.name} disabled={!ok} onClick={() => toggle('teach', s.name)} aria-pressed={on} data-testid={`teach-${s.name}`}
                  className={cn('chip', on && 'chip-on', !ok && 'cursor-not-allowed opacity-40')} title={ok ? '' : 'تحتاج تقييمًا عمليًا أولًا'}>
                  <span style={{ color: STATE_TONE[s.state] }}>●</span>{s.name}
                </button>
              );
            })}
          </div>
        </div>
        <div className="panel p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-ar-head text-xl"><GraduationCap className="h-5 w-5 text-[hsl(var(--lavender))]" />أبي أتعلّم</h2>
          <p className="mt-1 text-xs text-muted-foreground">اختاري من المهارات المتاحة لدى الآخرين، أو اكتبي مهارة جديدة.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {ex.learn.map((n) => (
              <span key={n} className="chip chip-on" data-testid={`learn-${n}`}>{n}<button onClick={() => toggle('learn', n)} aria-label={`إزالة ${n}`} className="-me-1 rounded-full p-0.5 hover:bg-white/10"><X className="h-3 w-3" /></button></span>
            ))}
          </div>
          <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); addLearn(draft); }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} list="learnable" placeholder="مثال: التصميم الجرافيكي" className="field h-10 flex-1" data-testid="input-learn" />
            <datalist id="learnable">{allLearnable.map((n) => <option key={n} value={n} />)}</datalist>
            <button className="btn btn-ghost btn-sm" data-testid="button-add-learn"><Plus className="h-4 w-4" />إضافة</button>
          </form>
          {allLearnable.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{allLearnable.slice(0, 6).map((n) => <button key={n} onClick={() => addLearn(n)} className="rounded-full border border-white/[.07] px-2.5 py-1 text-[11px] text-muted-foreground hover:border-white/15 hover:text-foreground">+ {n}</button>)}</div>}
        </div>
      </section>

      {/* active plans */}
      {ex.plans.length > 0 && (
        <section className="mt-8">
          <p className="eyebrow mb-3">خطط التبادل النشطة</p>
          <div className="grid gap-4">
            {ex.plans.map((p) => {
              const done = p.weeks.filter((w) => w.done).length; const pct = Math.round((done / p.weeks.length) * 100);
              return (
                <article key={p.id} className="panel overflow-hidden" data-testid={`plan-${p.peerId}`}>
                  <div className="flex flex-wrap items-center gap-4 border-b border-white/[.06] p-5">
                    <Initials name={p.peerName} size={40} tone="oasis" />
                    <div className="min-w-0 flex-1">
                      <p className="font-ar-head text-lg">أنتِ و{p.peerName.split(' ')[0]}</p>
                      <p className="text-xs text-muted-foreground">تتعلّمين <span className="text-[hsl(var(--lavender))]">{p.iLearn}</span> · وتعلّمين <span className="text-[hsl(var(--teal))]">{p.iTeach}</span></p>
                    </div>
                    <div className="w-40"><div className="flex justify-between text-[11px]"><span className="text-muted-foreground">التقدم</span><span className="num">{pct}%</span></div><div className="mt-1 h-1.5 rounded-full bg-white/[.07]"><div className="h-full rounded-full bg-[hsl(var(--teal))] transition-[width] duration-500" style={{ width: `${pct}%` }} /></div></div>
                    <button onClick={() => end(p.id)} className="btn btn-ghost btn-sm" data-testid={`button-end-${p.peerId}`}>إنهاء</button>
                  </div>
                  <ol className="divide-y divide-white/[.05]">
                    {p.weeks.map((w) => (
                      <li key={w.n} className="grid gap-3 p-4 sm:grid-cols-[2rem_minmax(0,10rem)_1fr_1fr] sm:items-start">
                        <button onClick={() => tick(p.id, w.n)} aria-pressed={w.done} aria-label={`الأسبوع ${w.n}: ${w.done ? 'منجز' : 'غير منجز'}`} data-testid={`week-${p.peerId}-${w.n}`} className="text-[hsl(var(--teal))]">
                          {w.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5 text-[hsl(var(--faint))]" />}
                        </button>
                        <p className={cn('text-sm font-semibold', w.done && 'text-muted-foreground line-through')}><span className="num text-[hsl(var(--faint))]">أ{w.n} · </span>{w.title}</p>
                        <p className="text-xs text-muted-foreground"><span className="text-[hsl(var(--lavender))]">تتعلّمين: </span>{w.me}</p>
                        <p className="text-xs text-muted-foreground"><span className="text-[hsl(var(--teal))]">تعلّمين: </span>{w.them}</p>
                      </li>
                    ))}
                  </ol>
                  {pct === 100 && <div className="border-t border-white/[.06] p-4 text-sm"><Link href="/assessments" className="btn btn-primary btn-sm">ارفعي المشروع المصغّر للتقييم <ArrowLeft className="h-3.5 w-3.5" /></Link></div>}
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* matches */}
      <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          <p className="eyebrow mb-3">تطابقات لك</p>
          {matches.length === 0 ? <Empty icon={Repeat2} title="لا يوجد تطابق بعد" body="أضيفي مهارة تبين تتعلمينها، أو فعّلي مهارة تقدرين تعلّمينها." /> : (
            <ul className="grid gap-3">
              {matches.map((m) => (
                <li key={m.person.id} className="panel lift p-4 sm:p-5" data-testid={`match-${m.person.id}`}>
                  <div className="flex flex-wrap items-start gap-3">
                    <Initials name={m.person.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{m.person.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.person.major} · {m.person.university.replace('جامعة ', '')}</p>
                      <p className="mt-1 flex flex-wrap gap-3 text-[11px] text-[hsl(var(--faint))]"><span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{m.person.city} · {m.person.mode}</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{m.person.weeklyHours} ساعات أسبوعيًا</span></p>
                    </div>
                    <div className="text-center"><p className="num text-2xl leading-none">{m.score}%</p><p className={cn('mt-1 text-[10.5px]', m.mutual ? 'text-[hsl(var(--teal))]' : 'text-[hsl(var(--sand))]')}>{m.mutual ? 'تبادل كامل' : 'يعلّمك فقط'}</p></div>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="panel-2 p-3"><p className="text-[11px] text-muted-foreground">يعلّمك</p>{m.theyTeach.slice(0, 2).map((s) => <p key={s.name} className="mt-1 truncate text-sm">{s.name} <span className="text-[11px]" style={{ color: STATE_TONE[s.state] }}>({STATE_LABEL[s.state]}{typeof s.score === 'number' ? ` · ${s.score}` : ''})</span></p>)}</div>
                    <div className="panel-2 p-3"><p className="text-[11px] text-muted-foreground">تعلّمينه</p>{m.iTeach.length ? m.iTeach.slice(0, 2).map((n) => <p key={n} className="mt-1 truncate text-sm">{n}</p>) : <p className="mt-1 text-xs text-[hsl(var(--faint))]">لا يطلب شيئًا مما تقدّمينه حاليًا</p>}</div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-[11px] text-[hsl(var(--faint))]">قوة مهارته: <span className="num">{Math.round(strength(m.theyTeach[0]) * 100)}</span>/100 حسب المستوى والتوثيق</p>
                    <button onClick={() => start(m)} disabled={!m.mutual} className="btn btn-primary btn-sm" data-testid={`button-start-${m.person.id}`}><ArrowLeftRight className="h-3.5 w-3.5" />ابدأ التبادل</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* market analytics */}
        <aside>
          <p className="eyebrow mb-3">سوق التبادل</p>
          <div className="panel p-5">
            <p className="text-sm font-semibold">العرض والطلب على المهارات</p>
            <p className="mt-1 text-[11px] text-muted-foreground">كم شخصًا يقدر يعلّم المهارة مقابل كم شخصًا يبي يتعلّمها.</p>
            <div className="mt-3 flex gap-4 text-[11px]"><span><span className="text-[hsl(var(--teal))]">●</span> يقدر يعلّم</span><span><span className="text-[hsl(var(--lavender))]">●</span> يبي يتعلّم</span></div>
            <ul className="mt-4 space-y-3.5">
              {market.map((r) => (
                <li key={r.name}>
                  <p className="truncate text-xs">{r.name}{r.demand > r.supply && <span className="ms-2 text-[10.5px] text-[hsl(var(--sand))]">مطلوبة</span>}</p>
                  <div className="mt-1.5 grid gap-1">
                    <div className="flex items-center gap-2"><div className="h-1.5 rounded-full bg-[hsl(var(--teal))]" style={{ width: `${(r.supply / maxM) * 100}%`, minWidth: 4 }} /><span className="num text-[10.5px] text-muted-foreground">{r.supply}</span></div>
                    <div className="flex items-center gap-2"><div className="h-1.5 rounded-full bg-[hsl(var(--lavender))]" style={{ width: `${(r.demand / maxM) * 100}%`, minWidth: 4 }} /><span className="num text-[10.5px] text-muted-foreground">{r.demand}</span></div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="panel-2 mt-3 p-4 text-xs leading-relaxed text-muted-foreground">
            جلسات التبادل وحدها لا توثّق مهارة. المشروع المصغّر في الأسبوع السادس يُرفع كتقييم عملي، ويمر بالمراجعة نفسها.
          </div>
        </aside>
      </section>
      <div className="mt-6"><DemoNote>الأشخاص والتطابقات بيانات توضيحية محفوظة في هذا المتصفح</DemoNote></div>
    </>
  );
}
