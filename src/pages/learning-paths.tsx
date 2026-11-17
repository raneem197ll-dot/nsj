import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Plus, Route as RouteIcon, ArrowLeft, Compass, BookOpenText } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, log, fmtDate, addEvidence } from '@/lib/store';
import { TRACKS, PATH_LEVELS, NAMES, buildSteps, type StepKind, type LearningPath } from '@/lib/data';
import { PageHeader, Meter, Empty, Modal, Field, Tabs, Initials } from '@/components/kit';
import { pathProgress } from './overview';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { catLabel, STEP_KIND_LABEL } from '@/lib/i18n';

function Generator({ onClose }: { onClose: () => void }) {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [track, setTrack] = useState<string>('graphic-design');
  const [answers, setAnswers] = useState<number[]>([]);
  const [target, setTarget] = useState(3);
  const [, nav] = useLocation();
  const t = TRACKS[track];
  const correct = answers.filter((a, i) => a === t.quiz[i].answer).length;
  const pct = Math.round((correct / t.quiz.length) * 100);
  const current = pct >= 100 ? 2 : pct >= 75 ? 1 : 0;
  const generate = () => {
    const pid = newId('lp');
    mutate((d) => {
      const p: LearningPath = { id: pid, track, title: `${t.skill}: من ${PATH_LEVELS[current]} إلى ${PATH_LEVELS[target]}`, skillName: t.skill, category: t.category, currentLevel: current, targetLevel: target, placementScore: pct, steps: buildSteps(track, current, target), supervisor: NAMES.professor, industryMentor: NAMES.professional, companyPartner: NAMES.company, startedAt: today() };
      d.paths.unshift(p);
      const s = addEvidence(d, t.skill, { type: 'assessment', title: `تقييم تحديد المستوى، ${pct}% (${PATH_LEVELS[current]})`, source: 'تقييم تحديد المستوى في نَسْج', date: today() }, t.category);
      s.developing = true; s.score = s.score ?? pct; s.assessedAt = today();
      log(d, `إنشاء مسار: ${t.skill}`, 'path');
    });
    onClose(); nav(`/learning-paths/${pid}`);
  };
  return (
    <Modal open onClose={onClose} title="إنشاء مسار تعلم" wide>
      <ol className="mb-6 flex gap-2 text-xs font-semibold">{['اختر مهارة', 'تقييم تحديد المستوى', 'الفجوة والإنشاء'].map((l, i) => <li key={l} className={cn('flex-1 rounded-full px-3 py-1.5 text-center', i === stage ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : i < stage ? 'bg-[hsl(var(--secondary))]' : 'border text-muted-foreground')}>{i + 1}. {l}</li>)}</ol>
      {stage === 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Object.entries(TRACKS).map(([k, v]) => (
            <button key={k} onClick={() => setTrack(k)} data-testid={`button-track-${k}`} className={cn('rounded-2xl border p-4 text-start transition-all', track === k ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)] ring-2 ring-[hsl(var(--primary)/.2)]' : 'hover:bg-[hsl(var(--secondary)/.5)]')}>
              <p className="eyebrow">{catLabel(v.category)}</p><p className="mt-1 font-display text-lg font-semibold">{v.skill}</p><p className="mt-1 text-xs text-muted-foreground">{v.blurb}</p>
            </button>
          ))}
          <button className="btn btn-primary sm:col-span-2" onClick={() => { setAnswers([]); setStage(1); }} data-testid="button-start-placement">ابدأ تقييم تحديد المستوى <ArrowLeft className="h-4 w-4" /></button>
        </div>
      )}
      {stage === 1 && (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">أربعة سيناريوهات عملية. تحدد إجاباتك مستواك الحالي، ولا تُعلن درجتها.</p>
          {t.quiz.map((q, qi) => (
            <fieldset key={qi} className="rounded-2xl border p-4">
              <legend className="px-1 text-sm font-semibold">{qi + 1}. {q.q}</legend>
              <div className="mt-2 space-y-2">{q.options.map((o, oi) => (
                <label key={oi} className={cn('flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors', answers[qi] === oi ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)]' : 'hover:bg-[hsl(var(--secondary)/.5)]')}>
                  <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => { const a = [...answers]; a[qi] = oi; setAnswers(a); }} data-testid={`radio-q${qi}-o${oi}`} />{o}
                </label>
              ))}</div>
            </fieldset>
          ))}
          <div className="flex justify-between"><button className="btn btn-ghost" onClick={() => setStage(0)}>السابق</button><button className="btn btn-primary" disabled={answers.filter((a) => a !== undefined).length < t.quiz.length} onClick={() => setStage(2)} data-testid="button-submit-placement">اعرض مستواي</button></div>
        </div>
      )}
      {stage === 2 && (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[hsl(var(--secondary))] p-4"><p className="eyebrow">درجة تحديد المستوى</p><p className="font-display text-3xl font-semibold" data-testid="text-placement-score">{pct}%</p></div>
            <div className="rounded-2xl bg-[hsl(var(--secondary))] p-4"><p className="eyebrow">المستوى الحالي</p><p className="font-display text-xl font-semibold">{PATH_LEVELS[current]}</p></div>
            <div className="rounded-2xl bg-[hsl(var(--secondary))] p-4"><p className="eyebrow">الهدف</p><select className="field mt-1" value={target} onChange={(e) => setTarget(Number(e.target.value))} data-testid="select-target-level">{PATH_LEVELS.map((l, i) => i >= current && <option key={l} value={i}>{l}</option>)}</select></div>
          </div>
          <div className="rounded-2xl border p-4 text-sm">
            <p className="font-semibold">القواعد المطبقة (تجريبي)</p>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-muted-foreground">
              <li>درجة 100% تضعك في «متقدم»، و75% في «متوسط»، وما دون ذلك في «مبتدئ».</li>
              <li>تُعلَّم الخطوات الأدنى من مستواك الحالي على أنها معروفة مسبقًا.</li>
              <li>تُضمَّن الخطوات حتى هدفك: {buildSteps(track, current, target).filter((s) => !s.known).length} خطوات متبقية.</li>
              <li>ينتهي كل مسار بمشروع نهائي يقيّمه أستاذ جامعي ومختص من القطاع.</li>
            </ul>
          </div>
          <div className="flex justify-between"><button className="btn btn-ghost" onClick={() => setStage(1)}>السابق</button><button className="btn btn-accent" onClick={generate} data-testid="button-generate-path">أنشئ مساري</button></div>
        </div>
      )}
    </Modal>
  );
}

function Contribute({ onClose, role }: { onClose: () => void; role: 'professor' | 'professional' }) {
  const { paths } = useDemo();
  const [pathId, setPathId] = useState(paths[0]?.id ?? '');
  const kinds: StepKind[] = role === 'professor' ? ['module', 'exercise', 'checkpoint'] : ['resource', 'mentorship', 'exercise'];
  const [kind, setKind] = useState<StepKind>(kinds[0]);
  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [level, setLevel] = useState(1);
  const { toast } = useToast();
  const who = role === 'professor' ? NAMES.professor : NAMES.professional;
  const save = () => {
    mutate((d) => { const p = d.paths.find((x) => x.id === pathId); if (!p) return; const idx = p.steps.findIndex((s) => s.level > level); const step = { id: newId('st'), kind, title, detail, level, done: false, contributor: who }; if (idx < 0) p.steps.push(step); else p.steps.splice(idx, 0, step); });
    toast({ title: 'تمت الإضافة إلى مسار التعلم', description: `يظهر «${title}» الآن للطلاب في هذا المسار.` });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={role === 'professor' ? 'إضافة مهمة تعليمية منظمة' : 'المساهمة بمصدر تعلم'}>
      <div className="space-y-4">
        <Field label="مسار التعلم"><select className="field" value={pathId} onChange={(e) => setPathId(e.target.value)} data-testid="select-contrib-path">{paths.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="النوع"><select className="field" value={kind} onChange={(e) => setKind(e.target.value as StepKind)} data-testid="select-contrib-kind">{kinds.map((k) => <option key={k} value={k}>{STEP_KIND_LABEL[k]}</option>)}</select></Field>
          <Field label="المستوى"><select className="field" value={level} onChange={(e) => setLevel(Number(e.target.value))}>{PATH_LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}</select></Field>
        </div>
        <Field label="العنوان"><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="input-contrib-title" /></Field>
        <Field label="ما الذي يفعله الطلاب"><textarea className="field min-h-20" value={detail} onChange={(e) => setDetail(e.target.value)} data-testid="input-contrib-detail" /></Field>
        <button className="btn btn-primary w-full" disabled={!title || !pathId} onClick={save} data-testid="button-save-contrib">إضافة إلى المسار</button>
      </div>
    </Modal>
  );
}

export default function LearningPaths() {
  const { paths, role } = useDemo();
  const [tab, setTab] = useState<'active' | 'completed'>('active');
  const [gen, setGen] = useState(false);
  const [contrib, setContrib] = useState(false);
  const staff = role === 'professor' || role === 'professional';
  useMeta(staff ? 'الإشراف على المسارات' : 'مسارات التعلم', 'مسارات تعلم منظمة قائمة على القواعد، من تقييم تحديد المستوى إلى الجاهزية المهنية.');
  const list = paths.filter((p) => (tab === 'completed' ? p.completedAt : !p.completedAt));
  return (
    <>
      <PageHeader eyebrow={role === 'professor' ? 'المسارات المُشرف عليها' : role === 'professional' ? 'المساهمة في المسارات' : 'مسارات التعلم'}
        title={staff ? 'مسارات تشارك في تشكيلها' : 'تقدّم منظم، لا قائمة مقررات'}
        desc={staff ? 'يشرف الأساتذة على الأسس الأكاديمية، ويضيف المختصون ملاحظات القطاع ومصادره.' : 'يحدد التقييم مستواك، وتُنشئ القواعد المسار، ويحدّث مشروع نهائي مُقيَّم جوازك.'}
        actions={staff ? <button className="btn btn-primary" onClick={() => setContrib(true)} data-testid="button-contribute"><Plus className="h-4 w-4" /> {role === 'professor' ? 'إضافة مهمة تعليمية' : 'المساهمة بمصدر'}</button> : <button className="btn btn-accent" onClick={() => setGen(true)} data-testid="button-new-path"><Compass className="h-4 w-4" /> إنشاء مسار</button>} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'active', label: 'النشطة', count: paths.filter((p) => !p.completedAt).length }, { value: 'completed', label: 'المكتملة', count: paths.filter((p) => p.completedAt).length }]} />
      {list.length === 0 ? <Empty icon={RouteIcon} title={tab === 'active' ? 'لا توجد مسارات نشطة' : 'لا توجد مسارات مكتملة بعد'} body="ابدأ بتقييم عملي قصير لتحديد المستوى، وتتولى نَسْج الباقي." action={!staff && <button className="btn btn-primary" onClick={() => setGen(true)}>إنشاء مسار</button>} /> : (
        <div className="grid gap-5 lg:grid-cols-2">
          {list.map((p, i) => {
            const pr = pathProgress(p.steps);
            return (
              <Link key={p.id} href={`/learning-paths/${p.id}`} className="panel lift rise group block overflow-hidden" style={{ animationDelay: `${i * 50}ms` }} data-testid={`card-path-${p.id}`}>
                <div className="flex h-2">{PATH_LEVELS.map((_, li) => <span key={li} className={cn('flex-1', li < p.currentLevel ? 'bg-[hsl(var(--saffron))]' : li <= p.targetLevel ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--secondary))]')} />)}</div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2"><div><p className="eyebrow">{catLabel(p.category)}</p><h3 className="mt-1 font-display text-xl font-semibold">{p.title}</h3></div><span className="font-display text-3xl font-semibold text-[hsl(var(--madder))]">{pr}%</span></div>
                  <Meter value={pr} className="mt-4" />
                  <p className="mt-3 text-sm text-muted-foreground">من {PATH_LEVELS[p.currentLevel]} إلى {PATH_LEVELS[p.targetLevel]} · {p.steps.filter((s) => s.done).length}/{p.steps.length} خطوات · بدأ {fmtDate(p.startedAt)}{p.completedAt ? ` · اكتمل ${fmtDate(p.completedAt)}` : ''}</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><Initials name={p.supervisor} size={22} /><Initials name={p.industryMentor} size={22} tone="madder" /> بإشراف {p.supervisor}، وملاحظات القطاع من {p.industryMentor}<ArrowLeft className="ms-auto h-4 w-4 transition-transform group-hover:-translate-x-1" /></div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
      {gen && <Generator onClose={() => setGen(false)} />}
      {contrib && <Contribute role={role as 'professor' | 'professional'} onClose={() => setContrib(false)} />}
      {!staff && (
        <section className="mt-10 panel weave-bg p-6">
          <p className="eyebrow">المسارات المتاحة</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{Object.values(TRACKS).map((t) => <div key={t.skill} className="rounded-2xl bg-[hsl(var(--card))] p-4"><BookOpenText className="h-4 w-4 text-[hsl(var(--madder))]" /><p className="mt-2 font-semibold">{t.skill}</p><p className="text-xs text-muted-foreground">{t.steps.length} خطوات · 4 مستويات</p></div>)}</div>
        </section>
      )}
    </>
  );
}

