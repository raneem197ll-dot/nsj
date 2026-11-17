import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Plus, Target, Clock, Users, ArrowLeft, X, Check, ChevronRight, ChevronLeft, BriefcaseBusiness, Banknote, type LucideIcon } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, fmtDate } from '@/lib/store';
import { CATEGORIES, LEVELS, PERSONAS, NAMES, type Challenge, type Criterion } from '@/lib/data';
import { PageHeader, Empty, Modal, Field, Tabs } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { catLabel, statusLabel, fmtNum } from '@/lib/i18n';

type OppKind = NonNullable<Challenge['kind']>;

/** The three opportunity types a company can publish. */
export const KINDS: { k: OppKind; label: string; short: string; line: string; icon: LucideIcon; tone: string }[] = [
  { k: 'challenge', label: 'تحدٍ مهاري', short: 'تحدٍ', line: 'مهمة عملية يتنافس عليها الطلاب، وتقيّم الأداء وتكتشف المواهب.', icon: Target, tone: '--lavender' },
  { k: 'job', label: 'وظيفة بتقييم عملي', short: 'وظيفة', line: 'حدّد المهارات، وينفّذ المتقدمون مهمة تقييمية قبل المقابلة.', icon: BriefcaseBusiness, tone: '--teal' },
  { k: 'project', label: 'مشروع مدفوع', short: 'مشروع مدفوع', line: 'عمل بمدة وميزانية ومخرجات، ينفذه طالب أو فريق مقابل أجر.', icon: Banknote, tone: '--sand' },
];
const kindOf = (c: Pick<Challenge, 'kind'>) => KINDS.find((x) => x.k === (c.kind ?? 'challenge'))!;

export function KindBadge({ c }: { c: Pick<Challenge, 'kind' | 'budget'> }) {
  if (!c.kind || c.kind === 'challenge') return null;
  const m = kindOf(c);
  return (
    <span className="chip gap-1 whitespace-nowrap" style={{ color: `hsl(var(${m.tone}))`, background: `hsl(var(${m.tone}) / .12)` }} data-testid={`badge-kind-${c.kind}`}>
      <m.icon className="h-3 w-3" />{m.label}{c.kind === 'project' && c.budget ? <> · <span className="num">{fmtNum(c.budget)}</span> ريال</> : null}
    </span>
  );
}

const STEPS = ['الأساسيات', 'المهارة المستهدفة', 'المخرجات', 'المدة', 'معايير التقييم', 'التقديم', 'المراجعة'];

function ListEditor({ items, onChange, placeholder, testid }: { items: string[]; onChange: (v: string[]) => void; placeholder: string; testid: string }) {
  const [v, setV] = useState('');
  const add = () => { if (v.trim()) { onChange([...items, v.trim()]); setV(''); } };
  return (
    <div>
      <div className="flex gap-2"><input className="field" value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())} placeholder={placeholder} data-testid={`input-${testid}`} /><button className="btn btn-primary" onClick={add} data-testid={`button-add-${testid}`}><Plus className="h-4 w-4" /></button></div>
      <ul className="mt-3 space-y-2">{items.map((it, i) => <li key={i} className="rise flex items-center justify-between rounded-xl border px-3 py-2 text-sm"><span>{it}</span><button aria-label={`إزالة ${it}`} onClick={() => onChange(items.filter((_, j) => j !== i))}><X className="h-4 w-4 text-muted-foreground" /></button></li>)}</ul>
    </div>
  );
}

function Builder({ onClose }: { onClose: () => void }) {
  const { role } = useDemo();
  const [step, setStep] = useState(0);
  const [c, setC] = useState({ kind: 'challenge' as OppKind, jobTitle: '', budget: 0, title: '', description: '', skill: '', category: 'Design', proficiency: 1, deliverables: [] as string[], duration: 'أسبوعان', deadline: '', rubric: [{ name: 'فهم المشكلة', weight: 30, description: 'يصوغ المشكلة بشكل صحيح' }, { name: 'جودة التنفيذ', weight: 45, description: 'الإتقان والدقة' }, { name: 'التواصل', weight: 25, description: 'مبررات واضحة' }] as Criterion[], requirements: [] as string[] });
  const { toast } = useToast();
  const total = c.rubric.reduce((a, r) => a + (Number(r.weight) || 0), 0);
  const company = role === 'company';
  const valid = [c.title.length > 4 && c.description.length > 10 && (c.kind !== 'job' || c.jobTitle.length > 2) && (c.kind !== 'project' || c.budget > 0), c.skill.length > 1, c.deliverables.length > 0, !!c.duration, total === 100 && c.rubric.every((r) => r.name), c.requirements.length > 0, true];
  const org = role === 'professor' ? PERSONAS.professor.name : NAMES.company;
  const publish = () => {
    const ch: Challenge = { id: newId('ch'), org, orgKind: role === 'professor' ? 'professor' : 'company', status: 'open', applicants: 0, createdAt: today(), deadline: c.deadline || today(), title: c.title, description: c.description, skill: c.skill, category: c.category, proficiency: c.proficiency, deliverables: c.deliverables, duration: c.duration, rubric: c.rubric, requirements: c.requirements, ...(company && c.kind !== 'challenge' ? { kind: c.kind } : {}), ...(c.kind === 'job' && company ? { jobTitle: c.jobTitle } : {}), ...(c.kind === 'project' && company ? { budget: c.budget } : {}) };
    mutate((d) => { d.challenges.unshift(ch); });
    toast({ title: company ? `تم نشر ${kindOf(c).label}` : 'تم نشر التحدي', description: 'يمكن للطلاب الآن الاطلاع عليه والتقديم.' });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={company ? 'نشر فرصة' : 'منشئ التحديات'} wide>
      <ol className="mb-6 grid grid-cols-7 gap-1">{STEPS.map((s, i) => <li key={s}><button onClick={() => i <= step && setStep(i)} className="w-full text-start" aria-current={i === step}><span className={cn('block h-1 rounded-full transition-colors', i <= step ? 'bg-[hsl(var(--madder))]' : 'bg-[hsl(var(--secondary))]')} /><span className={cn('mt-1.5 hidden text-[10.5px] font-semibold sm:block', i === step ? 'text-foreground' : 'text-muted-foreground')}>{s}</span></button></li>)}</ol>
      <div key={step} className="rise min-h-[300px]">
        {step === 0 && <div className="space-y-4">
          {company && <div><span className="label">نوع الفرصة</span><div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="نوع الفرصة">{KINDS.map((m) => <button key={m.k} role="radio" aria-checked={c.kind === m.k} onClick={() => setC({ ...c, kind: m.k })} data-testid={`button-kind-${m.k}`} className={cn('rounded-2xl border p-3 text-start transition-all', c.kind === m.k ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]' : 'hover:bg-[hsl(var(--secondary)/.5)]')}><m.icon className="h-4 w-4" style={{ color: `hsl(var(${m.tone}))` }} /><span className="mt-2 block text-sm font-semibold">{m.label}</span><span className="mt-1 block text-[11px] leading-relaxed text-muted-foreground">{m.line}</span></button>)}</div></div>}
          {company && c.kind === 'job' && <Field label="المسمى الوظيفي"><input className="field" value={c.jobTitle} onChange={(e) => setC({ ...c, jobTitle: e.target.value })} placeholder="مثال: مطوّر واجهات أمامية (مبتدئ)" data-testid="input-ch-jobtitle" /></Field>}
          {company && c.kind === 'project' && <Field label="الميزانية (ريال)" hint="أجر متفق عليه مقابل المخرجات."><input type="number" min={0} className="field" value={c.budget || ''} onChange={(e) => setC({ ...c, budget: Number(e.target.value) })} placeholder="مثال: 4500" dir="ltr" data-testid="input-ch-budget" /></Field>}
          <Field label={company && c.kind !== 'challenge' ? 'عنوان الفرصة' : 'عنوان التحدي'}><input className="field" value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} placeholder="مثال: تقليل التسرب في تسجيل التجار" data-testid="input-ch-title" /></Field><Field label="الوصف" hint="السياق والمشكلة وكيف يبدو النجاح."><textarea className="field min-h-36" value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} data-testid="input-ch-description" /></Field></div>}
        {step === 1 && <div className="space-y-4"><Field label="المهارة المستهدفة"><input className="field" value={c.skill} onChange={(e) => setC({ ...c, skill: e.target.value })} placeholder="مثال: بحث تجربة المستخدم" data-testid="input-ch-skill" /></Field><Field label="الفئة"><select className="field" value={c.category} onChange={(e) => setC({ ...c, category: e.target.value })}>{CATEGORIES.map((x) => <option key={x} value={x}>{catLabel(x)}</option>)}</select></Field>
          <div><span className="label">مستوى الإتقان المطلوب</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{LEVELS.map((l, i) => <button key={l} onClick={() => setC({ ...c, proficiency: i })} data-testid={`button-prof-${i}`} className={cn('rounded-2xl border p-3 text-start transition-all', c.proficiency === i ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)]' : 'hover:bg-[hsl(var(--secondary)/.5)]')}><span className="flex gap-0.5">{LEVELS.map((_, j) => <span key={j} className={cn('h-3 w-1.5 rounded-sm', j <= i ? 'bg-[hsl(var(--madder))]' : 'bg-[hsl(var(--secondary))]')} />)}</span><span className="mt-2 block text-sm font-semibold">{l}</span></button>)}</div></div></div>}
        {step === 2 && <Field label="المخرجات المتوقعة"><ListEditor items={c.deliverables} onChange={(v) => setC({ ...c, deliverables: v })} placeholder="مثال: رابط نموذج Figma الأولي" testid="deliverable" /></Field>}
        {step === 3 && <div className="space-y-4"><div><span className="label">المدة المقدّرة</span><div className="flex flex-wrap gap-2">{['3 أيام', 'أسبوع', 'أسبوعان', 'شهر'].map((d, di) => <button key={d} onClick={() => setC({ ...c, duration: d })} className={cn('chip px-4 py-2', c.duration === d && 'chip-on')} data-testid={`button-duration-${['3-days', '1-week', '2-weeks', '1-month'][di]}`}>{d}</button>)}</div></div><Field label="موعد التسليم النهائي"><input type="date" className="field" value={c.deadline} onChange={(e) => setC({ ...c, deadline: e.target.value })} data-testid="input-ch-deadline" /></Field></div>}
        {step === 4 && <div className="space-y-3">
          {c.rubric.map((r, i) => <div key={i} className="grid grid-cols-[1fr_1.4fr_80px_32px] items-center gap-2"><input className="field" value={r.name} aria-label="المعيار" onChange={(e) => { const rb = [...c.rubric]; rb[i] = { ...r, name: e.target.value }; setC({ ...c, rubric: rb }); }} /><input className="field" value={r.description} aria-label="الوصف" onChange={(e) => { const rb = [...c.rubric]; rb[i] = { ...r, description: e.target.value }; setC({ ...c, rubric: rb }); }} /><input type="number" className="field" value={r.weight} aria-label="الوزن" onChange={(e) => { const rb = [...c.rubric]; rb[i] = { ...r, weight: Number(e.target.value) }; setC({ ...c, rubric: rb }); }} /><button aria-label="إزالة المعيار" onClick={() => setC({ ...c, rubric: c.rubric.filter((_, j) => j !== i) })}><X className="h-4 w-4 text-muted-foreground" /></button></div>)}
          <div className="flex items-center justify-between"><button className="btn btn-ghost btn-sm" onClick={() => setC({ ...c, rubric: [...c.rubric, { name: '', weight: 0, description: '' }] })} data-testid="button-add-criterion"><Plus className="h-3.5 w-3.5" /> إضافة معيار</button><span className={cn('font-mono text-sm', total === 100 ? 'text-[hsl(var(--oasis))]' : 'text-[hsl(var(--destructive))]')} data-testid="text-weight-total">مجموع الأوزان {total}/100</span></div>
          <div className="flex h-3 overflow-hidden rounded-full">{c.rubric.map((r, i) => <span key={i} style={{ width: `${r.weight}%` }} className={['bg-[hsl(var(--indigo))]', 'bg-[hsl(var(--madder))]', 'bg-[hsl(var(--saffron))]', 'bg-[hsl(var(--oasis))]'][i % 4]} />)}</div>
        </div>}
        {step === 5 && <Field label="متطلبات التقديم"><ListEditor items={c.requirements} onChange={(v) => setC({ ...c, requirements: v })} placeholder="مثال: تقديم فردي فقط" testid="requirement" /></Field>}
        {step === 6 && <div className="space-y-3 text-sm"><div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{org} · {catLabel(c.category)}</p>{company && <KindBadge c={c} />}</div>{company && c.kind === 'job' && <p><span className="font-semibold">المسمى الوظيفي:</span> {c.jobTitle}</p>}<h3 className="font-display text-2xl font-semibold">{c.title}</h3><p className="text-muted-foreground">{c.description}</p><div className="flex flex-wrap gap-2"><span className="chip">{c.skill}</span><span className="chip">{LEVELS[c.proficiency]}</span><span className="chip">{c.duration}</span></div><p><span className="font-semibold">المخرجات:</span> {c.deliverables.join('؛ ')}</p><p><span className="font-semibold">معايير التقييم:</span> {c.rubric.map((r) => `${r.name} ${r.weight}%`).join('، ')}</p><p><span className="font-semibold">المتطلبات:</span> {c.requirements.join('؛ ')}</p></div>}
      </div>
      <div className="mt-6 flex justify-between border-t pt-4">
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep(step - 1)} data-testid="button-wizard-back"><ChevronRight className="h-4 w-4" /> السابق</button>
        {step < 6 ? <button className="btn btn-primary" disabled={!valid[step]} onClick={() => setStep(step + 1)} data-testid="button-wizard-next">التالي <ChevronLeft className="h-4 w-4" /></button> : <button className="btn btn-accent" onClick={publish} data-testid="button-publish-challenge"><Check className="h-4 w-4" /> {company ? 'نشر الفرصة' : 'نشر التحدي'}</button>}
      </div>
    </Modal>
  );
}

export function ChallengeCard({ c, i = 0 }: { c: Challenge; i?: number }) {
  return (
    <Link href={`/challenges/${c.id}`} className="panel lift rise group flex flex-col p-5" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-challenge-${c.id}`}>
      <div className="flex flex-wrap items-center gap-2"><span className="eyebrow">{c.org}</span><span className="ms-auto"><KindBadge c={c} /></span><span className={cn('chip', c.status === 'open' ? 'bg-[hsl(var(--oasis)/.14)] text-[hsl(var(--oasis))]' : '')}>{statusLabel(c.status)}</span></div>
      <h3 className="mt-2 font-display text-lg font-semibold leading-snug">{c.title}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">{c.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span className="chip">{c.skill}</span><span>{LEVELS[c.proficiency]}</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{c.duration}</span><span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{fmtNum(c.applicants)}</span><ArrowLeft className="ms-auto h-4 w-4 transition-transform group-hover:-translate-x-1" /></div>
    </Link>
  );
}

export default function Challenges() {
  const st = useDemo();
  const [cat, setCat] = useState<string>('all');
  const [kind, setKind] = useState<string>('all');
  const [building, setBuilding] = useState(false);
  const [, nav] = useLocation();
  const creator = st.role === 'company' || st.role === 'professor';
  useMeta(creator ? 'التحديات' : 'التحديات العملية', 'تحديات حقيقية من الشركات والأكاديميين بمعايير تقييم ومخرجات وأدلة.');
  const mine = st.challenges.filter((c) => (st.role === 'company' ? c.org === NAMES.company : c.orgKind === 'professor'));
  const list = (creator ? mine : st.challenges).filter((c) => (cat === 'all' || c.category === cat) && (kind === 'all' || (c.kind ?? 'challenge') === kind));
  const showKinds = st.role !== 'professor';
  return (
    <>
      <PageHeader eyebrow={creator ? (st.role === 'company' ? 'تحديات الشركة' : 'مهام تعليمية منظمة') : 'التحديات العملية'} title={creator ? 'انشر مهام تكشف القدرة الحقيقية' : 'موجزات حقيقية. معايير حقيقية. أدلة حقيقية.'} desc={st.role === 'company' ? 'تحدٍ مهاري، أو وظيفة بتقييم عملي، أو مشروع مدفوع: حدّد المهارة والمستوى والمخرجات ومعايير التقييم.' : creator ? 'استخدم المنشئ لتحديد المهارة والمستوى والمخرجات ومعايير التقييم وقواعد التقديم.' : 'تحديات ووظائف بتقييم عملي ومشاريع مدفوعة. يتحول كل تقديم إلى دليل في جوازك بمجرد أن يقيّمه مقيّم.'}
        actions={creator && <button className="btn btn-accent" onClick={() => setBuilding(true)} data-testid="button-open-builder"><Plus className="h-4 w-4" /> {st.role === 'company' ? 'فرصة جديدة' : 'تحدٍ جديد'}</button>} />
      {showKinds && <div className="mb-3"><Tabs value={kind} onChange={setKind} items={[{ value: 'all', label: 'كل الفرص' }, ...KINDS.map((m) => ({ value: m.k, label: m.label }))]} /></div>}
      <Tabs value={cat} onChange={setCat} items={[{ value: 'all', label: 'الكل' }, ...CATEGORIES.map((c) => ({ value: c, label: catLabel(c) }))]} />
      {list.length === 0 ? <Empty icon={Target} title="لا توجد تحديات هنا" body={creator ? 'أنشئ تحديك الأول في سبع خطوات موجّهة.' : 'جرّب فئة أخرى.'} action={creator && <button className="btn btn-primary" onClick={() => setBuilding(true)}>افتح المنشئ</button>} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((c, i) => <ChallengeCard key={c.id} c={c} i={i} />)}</div>
      )}
      {creator && (
        <section className="mt-10">
          <p className="eyebrow mb-3">أحدث التقديمات على تحدياتك</p>
          <div className="panel divide-y">
            {st.submissions.filter((s) => mine.some((c) => c.id === s.refId)).map((s) => (
              <button key={s.id} onClick={() => nav(`/challenges/${s.refId}`)} className="flex w-full items-center gap-3 p-4 text-start hover:bg-[hsl(var(--secondary)/.4)]" data-testid={`row-sub-${s.id}`}>
                <span className="flex-1"><span className="block text-sm font-semibold">{s.studentName}: {s.title}</span><span className="text-xs text-muted-foreground">{fmtDate(s.submittedAt)}</span></span>
                <span className="chip">{s.status === 'evaluated' ? `${s.result}/100` : 'بانتظار المقيّم'}</span>
              </button>
            ))}
            {st.submissions.filter((s) => mine.some((c) => c.id === s.refId)).length === 0 && <p className="p-4 text-sm text-muted-foreground">لا توجد تقديمات بعد.</p>}
          </div>
        </section>
      )}
      {building && <Builder onClose={() => setBuilding(false)} />}
    </>
  );
}
