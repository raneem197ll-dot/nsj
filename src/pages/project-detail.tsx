import { useState } from 'react';
import { Link, useParams } from 'wouter';
import { ArrowRight, FolderKanban, Wrench, CheckSquare, Gavel, MessageSquareQuote, Package } from 'lucide-react';
import { useDemo, useMeta, mutate, addEvidence, today, log, fmtDate } from '@/lib/store';
import { Empty, Initials, DemoNote, StateBadge } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const TONES = ['madder', 'indigo', 'oasis', 'saffron'] as const;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const st = useDemo();
  const p = st.projects.find((x) => x.id === id);
  const [active, setActive] = useState(0);
  const { toast } = useToast();
  useMeta(p ? p.title : 'المشروع', p ? `المساهمات الفردية في ${p.title}: الأدوار والمهام والمهارات والأدلة لكل عضو.` : 'المشروع غير موجود');
  if (!p) return <Empty icon={FolderKanban} title="المشروع غير موجود" body="ربما أعيد ضبط البيانات." action={<Link href="/projects" className="btn btn-primary">كل المشاريع</Link>} />;
  const m = p.members[active];
  const meIdx = p.members.findIndex((x) => x.studentId === 'me');
  const claimed = (skill: string) => st.skills.find((s) => s.name === skill)?.evidence.some((e) => e.title.includes(p.title));
  const claim = (skill: string) => {
    mutate((d) => { const s = addEvidence(d, skill, { type: p.kind === 'hackathon' ? 'hackathon' : 'responsibility', title: `${m.role} في ${p.title}`, source: p.context, date: today() }); if (!s.projectIds.includes(p.id)) s.projectIds.push(p.id); log(d, `ربط دليل ${p.title} بمهارة ${skill}`, 'evidence'); });
    toast({ title: 'تم ربط الدليل', description: `تُحتسب مساهمتك أنت فقط في ${skill}.` });
  };
  return (
    <div>
      <Link href={p.kind === 'hackathon' ? '/hackathons' : '/projects'} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowRight className="h-4 w-4" /> رجوع</Link>
      <header className="panel rise overflow-hidden">
        <div className="p-6 md:p-8">
          <p className="eyebrow">{p.context} · {fmtDate(p.date)}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold md:text-4xl" data-testid="text-project-title">{p.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{p.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm"><span className="chip">الفريق: {p.team}</span><span className="chip">التحدي: {p.challenge}</span><span className="chip chip-on">{p.result}</span></div>
        </div>
        <div className="flex h-3" aria-label="حصة المساهمة لكل عضو">{p.members.map((x, i) => <span key={x.studentId} style={{ width: `${x.share}%` }} className={['bg-[hsl(var(--madder))]', 'bg-[hsl(var(--indigo))]', 'bg-[hsl(var(--oasis))]', 'bg-[hsl(var(--saffron))]'][i % 4]} title={`${x.name} ${x.share}%`} />)}</div>
      </header>

      <section className="mt-8">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">تتبع المساهمة الفردية</p><h2 className="font-display text-2xl font-semibold">الفريق نفسه، وأدلة مختلفة</h2></div><p className="max-w-sm text-xs text-muted-foreground">يحصل كل عضو على رصيد فقط للمهارات التي يثبتها عمله هو.</p></div>
        <div role="tablist" className="grid gap-3 sm:grid-cols-3">
          {p.members.map((x, i) => (
            <button key={x.studentId} role="tab" aria-selected={active === i} onClick={() => setActive(i)} data-testid={`tab-member-${x.studentId}`}
              className={cn('flex items-center gap-3 rounded-2xl border p-4 text-start transition-all', active === i ? 'border-transparent bg-[hsl(var(--indigo))] text-[hsl(40_45%_96%)] shadow-lg' : 'bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]')}>
              <Initials name={x.name} size={40} tone={TONES[i % 4]} />
              <span className="flex-1"><span className="block font-semibold">{x.name}{x.studentId === 'me' && ' (أنت)'}</span><span className="block text-xs opacity-70">{x.role}</span></span>
              <span className="font-display text-2xl font-semibold">{x.share}%</span>
            </button>
          ))}
        </div>
        <div key={active} className="rise mt-4 grid gap-4 lg:grid-cols-3">
          <div className="panel p-5"><p className="eyebrow mb-3 flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5" /> المسؤوليات</p><ul className="space-y-2 text-sm">{m.responsibilities.map((r) => <li key={r} className="rounded-xl bg-[hsl(var(--secondary)/.6)] px-3 py-2">{r}</li>)}</ul>
            <p className="eyebrow mb-2 mt-5">المهام المنجزة</p><ul className="list-disc space-y-1 ps-5 text-sm">{m.tasks.map((t) => <li key={t}>{t}</li>)}</ul></div>
          <div className="panel p-5"><p className="eyebrow mb-3">المهارات المطبقة (تُحتسب فرديًا)</p>
            <ul className="space-y-2">{m.skills.map((s) => {
              const mineSkill = m.studentId === 'me' ? st.skills.find((x) => x.name === s) : undefined;
              return <li key={s} className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"><span>{s}</span>
                {m.studentId === 'me' ? (claimed(s) ? (mineSkill ? <StateBadge state={mineSkill.state} /> : <span className="chip">مرتبطة</span>) : <button className="btn btn-primary btn-sm" onClick={() => claim(s)} data-testid={`button-claim-${m.skills.indexOf(s)}`}>ربط بالجواز</button>) : <span className="text-[11px] text-muted-foreground">أدلته الخاصة</span>}</li>;
            })}</ul>
            <p className="eyebrow mb-2 mt-5 flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> الأدوات والتقنيات</p><div className="flex flex-wrap gap-1.5">{m.tools.map((t) => <span key={t} className="chip">{t}</span>)}</div></div>
          <div className="panel p-5"><p className="eyebrow mb-3">المساهمة الشخصية</p><p className="font-display text-lg leading-snug">«{m.contribution}»</p></div>
        </div>
        {meIdx >= 0 && active !== meIdx && <p className="mt-3 text-xs text-muted-foreground">أنت تعرض زميلًا في الفريق، ولا تُضاف مهاراته إلى جوازك.</p>}
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="panel p-5"><p className="eyebrow mb-3 flex items-center gap-1.5"><Package className="h-3.5 w-3.5" /> مخرجات المشروع</p><ul className="space-y-1.5 text-sm">{p.deliverables.map((d) => <li key={d}>{d}</li>)}</ul></div>
        <div className="panel p-5"><p className="eyebrow mb-3 flex items-center gap-1.5"><MessageSquareQuote className="h-3.5 w-3.5" /> ملاحظات المرشد</p><p className="text-sm">{p.mentorFeedback}</p></div>
        <div className="panel p-5"><p className="eyebrow mb-3 flex items-center gap-1.5"><Gavel className="h-3.5 w-3.5" /> تقييم لجنة التحكيم</p><p className="text-sm">{p.judgeEvaluation}</p><p className="mt-3 font-display text-xl font-semibold text-[hsl(var(--madder))]">{p.result}</p></div>
      </section>
      <div className="mt-6"><DemoNote>أعضاء الفرق والنتائج سجلات تجريبية</DemoNote></div>
    </div>
  );
}
