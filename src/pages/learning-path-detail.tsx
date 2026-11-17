import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowRight, BookOpen, Dumbbell, Library, Target, MessagesSquare, Flag, Award, Check, Lock, FileCheck2, type LucideIcon } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, log, addEvidence, fmtDate } from '@/lib/store';
import { PATH_LEVELS, LEVELS, type StepKind, type Step } from '@/lib/data';
import { Meter, Empty, Modal, Field, Initials, DemoNote } from '@/components/kit';
import { pathProgress } from './overview';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { catLabel, STEP_KIND_LABEL } from '@/lib/i18n';

const KIND: Record<StepKind, { icon: LucideIcon; label: string }> = {
  module: { icon: BookOpen, label: STEP_KIND_LABEL.module }, exercise: { icon: Dumbbell, label: STEP_KIND_LABEL.exercise }, resource: { icon: Library, label: STEP_KIND_LABEL.resource },
  challenge: { icon: Target, label: STEP_KIND_LABEL.challenge }, mentorship: { icon: MessagesSquare, label: STEP_KIND_LABEL.mentorship }, checkpoint: { icon: Flag, label: STEP_KIND_LABEL.checkpoint }, final: { icon: Award, label: STEP_KIND_LABEL.final },
};

export default function LearningPathDetail() {
  const { id } = useParams<{ id: string }>();
  const st = useDemo();
  const p = st.paths.find((x) => x.id === id);
  const [submitFor, setSubmitFor] = useState<Step | null>(null);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  useMeta(p ? p.title : 'مسار التعلم', p ? `خريطة التقدم في ${p.skillName}: وحدات وتطبيق ونقاط تقييم ومشروع نهائي.` : 'مسار التعلم غير موجود.');
  if (!p) return <Empty icon={Flag} title="المسار غير موجود" body="ربما أعيد ضبطه مع البيانات التجريبية." action={<Link href="/learning-paths" className="btn btn-primary">العودة إلى المسارات</Link>} />;
  const isStudent = st.role === 'student';
  const pr = pathProgress(p.steps);
  const allDone = p.steps.every((s) => s.done);
  const pending = st.submissions.find((s) => s.refId === p.id && s.source === 'path' && s.status === 'pending' && (s.title.startsWith('Final') || s.title.startsWith('المشروع النهائي')));

  const toggle = (s: Step) => {
    if (!isStudent || s.known) return;
    if ((s.kind === 'final' || s.kind === 'checkpoint') && !s.done) { setSubmitFor(s); return; }
    mutate((d) => { const step = d.paths.find((x) => x.id === p.id)!.steps.find((x) => x.id === s.id)!; step.done = !step.done; if (step.done) log(d, `إكمال «${s.title}»`, 'path'); });
  };
  const submit = () => {
    if (!submitFor) return;
    mutate((d) => {
      const path = d.paths.find((x) => x.id === p.id)!;
      path.steps.find((x) => x.id === submitFor.id)!.done = true;
      d.submissions.unshift({ id: newId('sub'), source: 'path', refId: p.id, title: `${submitFor.kind === 'final' ? 'المشروع النهائي' : 'نقطة تقييم'}: ${submitFor.title}`, skill: p.skillName, studentId: 'me', studentName: d.profile.name, link, notes, submittedAt: today(), status: 'pending', rubric: [{ name: 'الجودة التقنية', weight: 35, description: 'صحيح ومكتمل ومتقن' }, { name: 'العملية والمبررات', weight: 25, description: 'القرارات موضّحة' }, { name: 'الأدلة', weight: 25, description: 'المخرجات تدعم الادعاءات' }, { name: 'التواصل', weight: 15, description: 'واضح وموجز' }] });
      addEvidence(d, p.skillName, { type: 'assessment', title: `تسليم ${submitFor.kind === 'final' ? 'المشروع النهائي' : 'نقطة تقييم'}: ${submitFor.title}`, source: `مسار تعلم نَسْج، ${p.title}`, date: today(), url: link || undefined }, p.category);
      log(d, `تسليم ${submitFor.title} للتقييم`, 'submission');
    });
    toast({ title: 'تم التسليم للتقييم', description: `سيراجعه ${p.supervisor} وفق معايير محددة. أصبحت مهارتك الآن «مُختبرة».` });
    setSubmitFor(null); setLink(''); setNotes('');
  };
  const complete = () => {
    mutate((d) => {
      const path = d.paths.find((x) => x.id === p.id)!; path.completedAt = today();
      const s = d.skills.find((x) => x.name === p.skillName);
      if (s) { s.level = Math.max(s.level, Math.min(3, p.targetLevel)); s.developing = false; s.history.push({ date: today(), note: `إكمال مسار: ${p.title}` }); }
      log(d, `إكمال مسار التعلم ${p.title}`, 'path');
    });
    toast({ title: 'اكتمل المسار', description: 'تم تحديث جوازك. ولا يزال التوثيق يتطلب مراجعة مقيّم لمشروعك النهائي.' });
  };

  const known = p.steps.filter((s) => s.known);
  const learn = p.steps.filter((s) => !s.known && (s.kind === 'module' || s.kind === 'resource'));
  const practice = p.steps.filter((s) => !s.known && (s.kind === 'exercise' || s.kind === 'challenge' || s.kind === 'mentorship'));
  const assessed = p.steps.filter((s) => s.kind === 'checkpoint' || s.kind === 'final');
  const evidence = p.steps.filter((s) => s.evidence);

  return (
    <div>
      <Link href="/learning-paths" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" data-testid="link-back-paths"><ArrowRight className="h-4 w-4" /> كل المسارات</Link>
      <section className="panel rise overflow-hidden">
        <div className="grid md:grid-cols-[1.4fr_1fr]">
          <div className="p-6 md:p-8">
            <p className="eyebrow">{catLabel(p.category)} · تحديد المستوى {p.placementScore}%</p>
            <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl" data-testid="text-path-title">{p.title}</h1>
            <p className="mt-2 text-muted-foreground">من {PATH_LEVELS[p.currentLevel]} إلى {PATH_LEVELS[p.targetLevel]}. بدأ في {fmtDate(p.startedAt)}.</p>
            <div className="mt-5 flex items-center gap-4"><span className="font-display text-4xl font-semibold text-[hsl(var(--madder))]">{pr}%</span><Meter value={pr} className="h-2" /></div>
            {isStudent && !p.completedAt && <button className="btn btn-accent mt-5" disabled={!allDone} onClick={complete} data-testid="button-complete-path">{allDone ? 'أكمل المسار وحدّث الجواز' : `${p.steps.filter((s) => !s.done).length} خطوات متبقية`}</button>}
            {p.completedAt && <p className="mt-5 chip chip-on">اكتمل {fmtDate(p.completedAt)}</p>}
            {pending && <p className="mt-3 text-xs text-muted-foreground">المشروع النهائي بانتظار تقييم مراجع مؤهل.</p>}
          </div>
          <div className="space-y-3 bg-[hsl(var(--secondary)/.6)] p-6 md:p-8">
            <p className="eyebrow">من يشكّل هذا المسار</p>
            {[{ n: p.supervisor, r: 'أستاذ جامعي: الأسس الأكاديمية' }, { n: p.industryMentor, r: 'مختص من القطاع: ملاحظات القطاع' }, { n: p.companyPartner, r: 'شركة: التوقعات العملية' }].map((x, i) => (
              <div key={x.n} className="flex items-center gap-3"><Initials name={x.n} size={34} tone={(['indigo', 'madder', 'oasis'] as const)[i]} /><div><p className="text-sm font-semibold">{x.n}</p><p className="text-xs text-muted-foreground">{x.r}</p></div></div>
            ))}
          </div>
        </div>
      </section>

      {/* Progression map */}
      <section className="mt-8">
        <p className="eyebrow mb-3">خريطة التقدم</p>
        <div className="grid gap-4 md:grid-cols-4">
          {PATH_LEVELS.map((lvl, li) => {
            const steps = p.steps.filter((s) => s.level === li);
            const inRange = li <= p.targetLevel;
            return (
              <div key={lvl} className={cn('rounded-2xl border p-4', !inRange && 'opacity-45', li < p.currentLevel && 'bg-[hsl(var(--saffron)/.08)]')}>
                <div className="mb-3 flex items-center justify-between"><p className="font-display text-lg font-semibold">{lvl}</p><span className="font-mono text-[10px] text-muted-foreground">{steps.filter((s) => s.done).length}/{steps.length}</span></div>
                {!inRange && <p className="flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> أبعد من هدفك</p>}
                <ol className="relative space-y-2">
                  {steps.map((s) => {
                    const K = KIND[s.kind];
                    return (
                      <li key={s.id}>
                        <button onClick={() => toggle(s)} disabled={!isStudent || s.known || !!p.completedAt} data-testid={`button-step-${s.id}`}
                          className={cn('group flex w-full items-start gap-3 rounded-xl border bg-[hsl(var(--card))] p-3 text-start transition-all', s.done ? 'border-[hsl(var(--primary)/.3)]' : 'hover:border-[hsl(var(--primary))]', s.kind === 'final' && 'border-[hsl(var(--madder)/.5)]')}>
                          <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors', s.done ? 'border-transparent bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-[hsl(var(--input))]')}>
                            {s.done ? <Check className="h-3.5 w-3.5" /> : <K.icon className="h-3 w-3 text-muted-foreground" />}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-mono text-[9.5px] text-muted-foreground">{s.known ? 'معروفة مسبقًا' : K.label}</span>
                            <span className={cn('block text-[13px] font-semibold leading-snug', s.known && 'text-muted-foreground')}>{s.title}</span>
                            <span className="mt-0.5 block text-[11.5px] text-muted-foreground">{s.detail}</span>
                            {s.contributor && <span className="mt-1 block text-[10.5px] text-[hsl(var(--madder))]">أضافها {s.contributor}</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[{ t: 'ما تعرفه مسبقًا', items: known, empty: 'وضعك تحديد المستوى في البداية.' }, { t: 'ما تحتاج إلى تعلمه', items: learn }, { t: 'ما تحتاج إلى ممارسته', items: practice }, { t: 'كيف ستُقيَّم', items: assessed }].map((b) => (
          <div key={b.t} className="panel p-5"><p className="eyebrow">{b.t}</p><ul className="mt-3 space-y-1.5 text-sm">{b.items.length ? b.items.map((s) => <li key={s.id} className={cn(s.done && 'text-muted-foreground line-through decoration-1')}>{s.title}</li>) : <li className="text-muted-foreground">{b.empty ?? 'لا شيء هنا.'}</li>}</ul></div>
        ))}
        <div className="panel bg-[hsl(var(--indigo))] p-5 text-[hsl(40_45%_96%)]"><p className="font-mono text-[10.5px] opacity-60">الأدلة التي عليك إنتاجها</p><ul className="mt-3 space-y-2 text-sm">{evidence.map((s) => <li key={s.id} className="flex gap-2"><FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--saffron))]" />{s.evidence}</li>)}</ul></div>
      </section>
      <div className="mt-6"><DemoNote>مسار أنشأته قواعد تجريبية محددة مسبقًا · مستوى المهارة المستهدف {LEVELS[Math.min(3, p.targetLevel)]}</DemoNote></div>

      <Modal open={!!submitFor} onClose={() => setSubmitFor(null)} title={submitFor?.kind === 'final' ? 'تسليم المشروع النهائي' : 'تسليم نقطة التقييم'}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{submitFor?.detail}</p>
          <p className="rounded-xl bg-[hsl(var(--secondary))] p-3 text-xs">الدليل المطلوب: {submitFor?.evidence}</p>
          <Field label="رابط عملك"><input className="field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" dir="ltr" data-testid="input-path-link" /></Field>
          <Field label="ملاحظات للمقيّم"><textarea className="field min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-path-notes" /></Field>
          <button className="btn btn-primary w-full" disabled={!link && !notes} onClick={submit} data-testid="button-submit-step">تسليم للتقييم وفق المعايير</button>
        </div>
      </Modal>
    </div>
  );
}
