import { useState } from 'react';
import { ClipboardCheck, ExternalLink, FileText, Inbox, Send, CheckCircle2 } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, log, addEvidence, fmtDate, applyEvaluation, weightedResult, useCandidates } from '@/lib/store';
import { PERSONAS, EVIDENCE_LABEL, type Submission, type Skill } from '@/lib/data';
import { PageHeader, Empty, Modal, Field, Tabs, Initials, StateBadge, Meter, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { catLabel, SOURCE_LABEL, Ltr } from '@/lib/i18n';

const BRIEF: Record<string, string> = {
  Design: 'خلال 90 دقيقة، أعد تصميم شاشة واحدة من تطبيق تجريبي مرفق واكتب مبررات في 200 كلمة.',
  Technology: 'ابنِ مكوّنًا أو نصًا برمجيًا صغيرًا وفق المواصفات المرفقة وشارك رابط المستودع.',
  Data: 'أجب عن ثلاثة أسئلة باستخدام البيانات التجريبية المرفقة واشرح منهجك.',
  Business: 'استجب لمحاكاة سيناريو بخطة ومخاطر ورسالة لأصحاب المصلحة.',
  Communication: 'سجّل حديثًا مدته 5 دقائق عن موضوع تختاره وأرفق رابط التسجيل.',
};
const RUBRIC = [{ name: 'إنجاز المهمة', weight: 30, description: 'يستوفي الموجز' }, { name: 'الجودة', weight: 30, description: 'الإتقان والدقة' }, { name: 'المنطق', weight: 25, description: 'القرارات مشروحة' }, { name: 'التواصل', weight: 15, description: 'واضح وموجز' }];

function TakeAssessment({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const submit = () => {
    mutate((d) => {
      d.submissions.unshift({ id: newId('sub'), source: 'assessment', refId: skill.id, title: `تقييم عملي: ${skill.name}`, skill: skill.name, studentId: 'me', studentName: d.profile.name, link, notes, submittedAt: today(), status: 'pending', rubric: RUBRIC });
      addEvidence(d, skill.name, { type: 'assessment', title: `تم تقديم تقييم عملي: ${skill.name}`, source: 'تقييم نَسْج العملي', date: today(), url: link || undefined });
      log(d, `تقديم تقييم عملي في ${skill.name}`, 'assessment');
    });
    toast({ title: 'تم تقديم التقييم', description: `أصبحت ${skill.name} «مُختبرة». سيقيّمها مقيّم وفق المعايير.` });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={`تقييم عملي: ${skill.name}`}>
      <div className="space-y-4">
        <div className="rounded-2xl bg-[hsl(var(--secondary))] p-4 text-sm"><p className="eyebrow mb-1">الموجز</p>{BRIEF[skill.category] ?? BRIEF.Design}</div>
        <div><p className="eyebrow mb-2">ستُقيَّم على</p><ul className="space-y-1 text-sm">{RUBRIC.map((r) => <li key={r.name} className="flex justify-between"><span>{r.name} <span className="text-muted-foreground">· {r.description}</span></span><span className="font-mono text-xs">{r.weight}%</span></li>)}</ul></div>
        <Field label="رابط عملك"><input className="field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" dir="ltr" data-testid="input-assessment-link" /></Field>
        <Field label="ملاحظات"><textarea className="field min-h-20" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-assessment-notes" /></Field>
        <button className="btn btn-primary w-full" disabled={!link && !notes} onClick={submit} data-testid="button-submit-assessment"><Send className="h-4 w-4" /> تقديم</button>
      </div>
    </Modal>
  );
}

function ResultCard({ s }: { s: Submission }) {
  return (
    <article className="panel p-5" data-testid={`card-submission-${s.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div><p className="eyebrow">{s.skill} · {fmtDate(s.submittedAt)}</p><h3 className="mt-1 font-semibold">{s.title}</h3></div>
        {s.status === 'pending' ? <span className="chip">بانتظار المقيّم</span> : <span className="font-display text-3xl font-semibold text-[hsl(var(--madder))]">{s.result}<span className="text-sm text-muted-foreground">/100</span></span>}
      </div>
      {s.status === 'evaluated' && (
        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <ul className="space-y-2">{s.rubric.map((c) => <li key={c.name}><div className="mb-1 flex justify-between text-xs"><span>{c.name}</span><span className="font-mono">{s.scores?.[c.name] ?? 0}/5</span></div><Meter value={((s.scores?.[c.name] ?? 0) / 5) * 100} /></li>)}</ul>
          <div className="rounded-2xl bg-[hsl(var(--secondary)/.7)] p-4 text-sm"><p className="eyebrow mb-1">ملاحظات {s.evaluator?.name}</p><p>{s.feedback}</p><p className="mt-2 text-xs text-muted-foreground">{s.evaluator?.role}، {s.evaluator?.org}</p></div>
        </div>
      )}
    </article>
  );
}

function StudentAssessments() {
  const st = useDemo();
  const [tab, setTab] = useState<'take' | 'mine'>('take');
  const [taking, setTaking] = useState<Skill | null>(null);
  const mine = st.submissions.filter((s) => s.studentId === 'me');
  return (
    <>
      <PageHeader eyebrow="تقييمات المهارات" title="أثبتها، لا تدّعِها" desc="ينتج كل تقييم عملي نتيجة ودليلًا، ثم يقيّمه مقيّم مؤهل وفق معايير معلنة." />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'take', label: 'التقييمات المتاحة' }, { value: 'mine', label: 'تقديماتي', count: mine.length }]} />
      {tab === 'take' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {st.skills.map((s) => (
            <article key={s.id} className="panel lift flex flex-col p-5" data-testid={`card-assessment-${s.id}`}>
              <div className="flex items-start justify-between gap-2"><p className="eyebrow">{catLabel(s.category)}</p><StateBadge state={s.state} /></div>
              <h3 className="mt-2 font-display text-lg font-semibold">{s.name}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{BRIEF[s.category] ?? BRIEF.Design}</p>
              <button className="btn btn-primary btn-sm mt-4 self-start" onClick={() => setTaking(s)} data-testid={`button-take-${s.id}`}><ClipboardCheck className="h-3.5 w-3.5" /> {s.state === 'declared' ? 'ابدأ التقييم' : 'إعادة التقييم'}</button>
            </article>
          ))}
        </div>
      ) : mine.length === 0 ? <Empty icon={Inbox} title="لا توجد تقديمات بعد" body="خذ أول تقييم عملي لتنقل مهارة من «مُعلنة» إلى «مُختبرة»." /> : (
        <div className="space-y-4">{mine.map((s) => <ResultCard key={s.id} s={s} />)}</div>
      )}
      {taking && <TakeAssessment skill={taking} onClose={() => setTaking(null)} />}
    </>
  );
}

function Evaluator({ sub, onClose }: { sub: Submission; onClose: () => void }) {
  const st = useDemo();
  const [scores, setScores] = useState<Record<string, number>>(Object.fromEntries(sub.rubric.map((c) => [c.name, 3])));
  const [feedback, setFeedback] = useState('');
  const [validate, setValidate] = useState(true);
  const { toast } = useToast();
  const role = st.role as 'professor' | 'professional';
  const p = PERSONAS[role];
  const result = weightedResult(sub, scores);
  const studentEvidence = sub.studentId === 'me' ? st.skills.find((s) => s.name === sub.skill)?.evidence ?? [] : [];
  const cand = useCandidates(st).find((c) => c.id === sub.studentId);
  const save = () => {
    mutate((d) => applyEvaluation(d, sub.id, scores, feedback + (role === 'professor' && validate ? ' [تم اعتماده إنجازًا أكاديميًا]' : ''), { name: p.name, role: role === 'professor' ? 'أستاذ جامعي' : 'مختص من القطاع', org: p.org }, role));
    toast({ title: 'تم حفظ التقييم', description: `حصل ${sub.studentName} على ${result}/100، وتم تحديث جواز مهاراته بتقييمك.` });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="تقييم التقديم" wide>
      <div className="grid gap-6 md:grid-cols-[1fr_1.15fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-3"><Initials name={sub.studentName} size={40} tone="madder" /><div><p className="font-semibold">{sub.studentName}</p><p className="text-xs text-muted-foreground">{cand ? `${cand.major}، ${cand.university}` : ''}</p></div></div>
          <div className="rounded-2xl border p-4"><p className="eyebrow">التقديم</p><p className="mt-1 font-semibold">{sub.title}</p><p className="mt-1 text-xs text-muted-foreground">{sub.skill} · قُدّم في {fmtDate(sub.submittedAt)}</p><p className="mt-3 text-sm">{sub.notes || 'لا توجد ملاحظات.'}</p>
            {sub.link && <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-3 py-1 font-mono text-xs"><ExternalLink className="h-3 w-3" /> <Ltr>{sub.link}</Ltr></p>}</div>
          <div className="rounded-2xl border p-4"><p className="eyebrow mb-2">الأدلة المسجلة المرفقة</p>
            {studentEvidence.length ? <ul className="space-y-2 text-xs">{studentEvidence.slice(0, 5).map((e) => <li key={e.id} className="flex gap-2"><FileText className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--madder))]" /><span><span className="font-semibold">{EVIDENCE_LABEL[e.type]}:</span> {e.title} <span className="text-muted-foreground">({e.source}، {fmtDate(e.date)})</span></span></li>)}</ul> : <p className="text-xs text-muted-foreground">التقديم أعلاه هو الدليل الوحيد المسجل لهذه المهارة.</p>}
          </div>
        </div>
        <div>
          <p className="eyebrow mb-3">معايير التقييم · قيّم كل معيار من 1 إلى 5</p>
          <div className="space-y-4">
            {sub.rubric.map((c, ci) => (
              <div key={c.name}>
                <div className="flex items-baseline justify-between"><p className="text-sm font-semibold">{c.name} <span className="font-mono text-[10px] text-muted-foreground">{c.weight}%</span></p><p className="text-[11px] text-muted-foreground">{c.description}</p></div>
                <div className="mt-1.5 flex gap-1.5" role="radiogroup" aria-label={c.name}>
                  {[1, 2, 3, 4, 5].map((n) => <button key={n} role="radio" aria-checked={scores[c.name] === n} onClick={() => setScores({ ...scores, [c.name]: n })} data-testid={`button-score-${ci}-${n}`} className={cn('h-9 flex-1 rounded-lg border text-sm font-semibold transition-all', scores[c.name] >= n ? 'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'hover:bg-[hsl(var(--secondary))]')}>{n}</button>)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-[hsl(var(--indigo))] p-4 text-[hsl(40_45%_96%)]"><span className="text-sm">النتيجة الموزونة</span><span className="font-display text-3xl font-semibold" data-testid="text-weighted-result">{result}</span></div>
          <Field label="ملاحظات مكتوبة"><textarea className="field mt-1 min-h-24" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="ما الذي نجح، وما الذي يحتاج إلى تحسين، وما الخطوة التالية." data-testid="input-feedback" /></Field>
          {role === 'professor' && <label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={validate} onChange={(e) => setValidate(e.target.checked)} data-testid="checkbox-validate" /> اعتماده إنجازًا أكاديميًا</label>}
          <button className="btn btn-accent mt-4 w-full" disabled={feedback.trim().length < 10} onClick={save} data-testid="button-save-evaluation"><CheckCircle2 className="h-4 w-4" /> إرسال التقييم</button>
          <p className="mt-2 text-[11px] text-muted-foreground">يلزم كتابة ملاحظات من 10 أحرف على الأقل. التقييمات سجلات تجريبية.</p>
        </div>
      </div>
    </Modal>
  );
}

function ReviewQueue() {
  const st = useDemo();
  const [tab, setTab] = useState<'pending' | 'done'>('pending');
  const [open, setOpen] = useState<Submission | null>(null);
  const isProf = st.role === 'professor';
  const pending = st.submissions.filter((s) => s.status === 'pending');
  const done = st.submissions.filter((s) => s.status === 'evaluated');
  const list = tab === 'pending' ? pending : done;
  return (
    <>
      <PageHeader eyebrow={isProf ? 'قائمة المراجعة' : 'مراجعات المشاريع'} title={isProf ? 'قيّم بالمعايير لا بالحدس' : 'احكم عليه كما سيحكم فريقك'} desc="افتح التقديم، وراجع الأدلة، وقيّم كل معيار، واترك ملاحظاتك. يحدّث تقييمك جواز مهارات الطالب." />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'pending', label: 'بانتظار المراجعة', count: pending.length }, { value: 'done', label: 'تم تقييمها', count: done.length }]} />
      {list.length === 0 ? <Empty icon={Inbox} title={tab === 'pending' ? 'القائمة فارغة' : 'لا توجد تقييمات بعد'} body={tab === 'pending' ? 'تظهر تقديمات الطلاب الجديدة هنا فور وصولها.' : 'ستظهر التقييمات المكتملة هنا.'} /> : (
        <div className="panel divide-y">
          {list.map((s) => (
            <div key={s.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center" data-testid={`row-review-${s.id}`}>
              <Initials name={s.studentName} size={38} tone={s.studentId === 'me' ? 'madder' : 'indigo'} />
              <div className="flex-1"><p className="font-semibold">{s.title}</p><p className="text-xs text-muted-foreground">{s.studentName} · {s.skill} · {SOURCE_LABEL[s.source] ?? s.source} · {fmtDate(s.submittedAt)}</p></div>
              {s.status === 'pending' ? <button className="btn btn-primary btn-sm" onClick={() => setOpen(s)} data-testid={`button-evaluate-${s.id}`}>فتح التقييم</button> : <div className="text-end"><p className="font-display text-2xl font-semibold">{s.result}</p><p className="text-[11px] text-muted-foreground">بواسطة {s.evaluator?.name}</p></div>}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6"><DemoNote>التقديمات وهويات المقيّمين سجلات تجريبية</DemoNote></div>
      {open && <Evaluator sub={open} onClose={() => setOpen(null)} />}
    </>
  );
}

export default function Assessments() {
  const { role } = useDemo();
  const staff = role === 'professor' || role === 'professional';
  useMeta(staff ? 'قائمة المراجعة' : 'تقييمات المهارات', staff ? 'راجع أدلة الطلاب وقيّم التقديمات بمعايير موزونة.' : 'خذ تقييمات عملية وتابع نتائجها وفق المعايير.');
  return staff ? <ReviewQueue /> : <StudentAssessments />;
}
