import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowRight, Clock, Users, CalendarClock, Target, Star, Lock } from 'lucide-react';
import { KindBadge } from '@/pages/challenges';
import { useDemo, useMeta, mutate, newId, today, log, addEvidence, fmtDate } from '@/lib/store';
import { LEVELS, NAMES } from '@/lib/data';
import { catLabel, fmtNum, Ltr } from '@/lib/i18n';
import { Empty, Field, Initials, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';

export default function ChallengeDetail() {
  const { id } = useParams<{ id: string }>();
  const st = useDemo();
  const c = st.challenges.find((x) => x.id === id);
  const [link, setLink] = useState('');
  const [notes, setNotes] = useState('');
  const [agree, setAgree] = useState(false);
  const { toast } = useToast();
  useMeta(c ? c.title : 'التحدي', c ? `تحدٍ من ${c.org} في ${c.skill}: المخرجات ومعايير التقييم والتقديم.` : 'التحدي غير موجود');
  if (!c) return <Empty icon={Target} title="التحدي غير موجود" body="ربما تمت إزالته." action={<Link href="/challenges" className="btn btn-primary">كل التحديات</Link>} />;
  const mine = st.submissions.find((s) => s.refId === c.id && s.studentId === 'me');
  const subs = st.submissions.filter((s) => s.refId === c.id);
  const owner = (st.role === 'company' && c.org === NAMES.company) || (st.role === 'professor' && c.orgKind === 'professor');
  const submit = () => {
    mutate((d) => {
      d.submissions.unshift({ id: newId('sub'), source: 'challenge', refId: c.id, title: c.title, skill: c.skill, studentId: 'me', studentName: d.profile.name, link, notes, submittedAt: today(), status: 'pending', rubric: c.rubric });
      d.challenges.find((x) => x.id === c.id)!.applicants += 1;
      addEvidence(d, c.skill, { type: 'assessment', title: `تقديم على تحدٍ: ${c.title}`, source: c.org, date: today(), url: link || undefined }, c.category);
      log(d, `تقديم إلى ${c.org}: ${c.title}`, 'submission');
    });
    toast({ title: 'تم استلام التقديم', description: 'انتقلت مهارتك إلى حالة «مُختبرة»، ويليها التقييم.' });
  };
  return (
    <div>
      <Link href="/challenges" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /> التحديات</Link>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <article className="panel rise p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{c.org} · {catLabel(c.category)}</p><KindBadge c={c} /></div>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl" data-testid="text-challenge-title">{c.title}</h1>
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground"><span className="chip chip-on">{c.skill}</span><span className="chip">{LEVELS[c.proficiency]}</span><span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{c.duration}</span><span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4" />التسليم {fmtDate(c.deadline)}</span><span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{fmtNum(c.applicants)} متقدمًا</span></div>
          <p className="mt-6 text-[15px] leading-relaxed">{c.description}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div><p className="eyebrow mb-2">المخرجات المتوقعة</p><ul className="space-y-2 text-sm">{c.deliverables.map((d, i) => <li key={i} className="flex gap-2"><span className="font-mono text-xs text-[hsl(var(--madder))]">0{i + 1}</span>{d}</li>)}</ul></div>
            <div><p className="eyebrow mb-2">متطلبات التقديم</p><ul className="list-disc space-y-1 ps-5 text-sm">{c.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul></div>
          </div>
          <div className="mt-8"><p className="eyebrow mb-3">معايير التقييم</p>
            <div className="space-y-2">{c.rubric.map((r) => <div key={r.name} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border p-3"><div><p className="text-sm font-semibold">{r.name}</p><p className="text-xs text-muted-foreground">{r.description}</p></div><span className="font-display text-xl font-semibold">{r.weight}%</span></div>)}</div>
          </div>
        </article>
        <aside className="space-y-4">
          {st.role === 'student' && (
            <div className="panel p-6">
              {mine ? (
                <div><p className="eyebrow">تقديمك</p><p className="mt-2 font-semibold">{mine.status === 'pending' ? 'تم التقديم، بانتظار المقيّم' : `تم التقييم: ${mine.result}/100`}</p><p className="mt-1 text-xs text-muted-foreground">تاريخ التقديم {fmtDate(mine.submittedAt)}</p>{mine.feedback && <p className="mt-3 rounded-xl bg-[hsl(var(--secondary))] p-3 text-sm">{mine.feedback}</p>}</div>
              ) : c.status !== 'open' ? <p className="flex items-center gap-2 text-sm"><Lock className="h-4 w-4" /> هذا التحدي مغلق.</p> : (
                <div className="space-y-4"><p className="font-display text-xl font-semibold">{c.kind === 'job' ? 'نفّذ مهمة التقييم وقدّم' : c.kind === 'project' ? 'قدّم عرضك لتنفيذ المشروع' : 'قدّم عملك'}</p>
                  <Field label="رابط المخرجات"><input className="field" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" dir="ltr" data-testid="input-challenge-link" /></Field>
                  <Field label="مساهمتك الفردية وملاحظاتك"><textarea className="field min-h-28" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-challenge-notes" /></Field>
                  <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" data-testid="checkbox-agree" /> أؤكد أن العمل يستوفي متطلبات التقديم وأنه من إنجازي.</label>
                  <button className="btn btn-accent w-full" disabled={!agree || (!link && !notes)} onClick={submit} data-testid="button-submit-challenge">تقديم</button>
                </div>
              )}
            </div>
          )}
          {owner && (
            <div className="panel p-6">
              <div className="flex items-center justify-between"><p className="eyebrow">{c.kind === 'job' || c.kind === 'project' ? 'المتقدمون وحلولهم' : 'التقديمات'} ({subs.length})</p><button className="btn btn-ghost btn-sm" onClick={() => mutate((d) => { const x = d.challenges.find((y) => y.id === c.id)!; x.status = x.status === 'open' ? 'closed' : 'open'; })} data-testid="button-toggle-status">{c.status === 'open' ? 'إغلاق' : 'إعادة فتح'}</button></div>
              <ul className="mt-3 divide-y">{subs.map((s) => { const sl = st.shortlist.includes(s.studentId); return (
                <li key={s.id} className="py-3"><div className="flex items-center gap-3"><Initials name={s.studentName} size={30} /><div className="flex-1"><p className="text-sm font-semibold">{s.studentName}</p><p className="text-xs text-muted-foreground">{s.status === 'evaluated' ? `${s.result}/100 بتقييم ${s.evaluator?.name}` : 'بانتظار المقيّم'}</p></div>
                  {st.role === 'company' && <button className={sl ? 'btn btn-accent btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => mutate((d) => { d.shortlist = sl ? d.shortlist.filter((x) => x !== s.studentId) : [...d.shortlist, s.studentId]; })} data-testid={`button-shortlist-${s.id}`}><Star className="h-3.5 w-3.5" />{sl ? 'في القائمة المختصرة' : 'إضافة للقائمة المختصرة'}</button>}</div>
                  <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p></li>); })}</ul>
              {subs.length === 0 && <p className="mt-3 text-sm text-muted-foreground">لا توجد تقديمات بعد.</p>}
              <p className="mt-3 text-[11px] text-muted-foreground">تأتي الدرجات من مقيّمين أكاديميين ومختصين من القطاع، لتبقى مراجعة الشركة منفصلة عن توثيق المهارة.</p>
            </div>
          )}
          <DemoNote>تحدٍ تجريبي · {c.orgKind === 'company' ? 'شركة افتراضية' : 'مهمة أكاديمية'}</DemoNote>
        </aside>
      </div>
    </div>
  );
}
