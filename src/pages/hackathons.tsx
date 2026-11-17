import { Link } from 'wouter';
import { Trophy, MapPin, CalendarDays, ArrowLeft } from 'lucide-react';
import { useDemo, useMeta, mutate, log, fmtDate } from '@/lib/store';
import { PageHeader, Initials, DemoNote, Empty } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { TeamBuilder } from '@/components/team-builder';

export default function Hackathons() {
  const st = useDemo();
  const { toast } = useToast();
  useMeta('الهاكاثونات', 'الهاكاثونات كأدلة: الفريق والدور الفردي والمساهمات وملاحظات المرشد وتقييم لجنة التحكيم.');
  const done = st.hackathons.filter((h) => h.status === 'completed');
  const upcoming = st.hackathons.filter((h) => h.status !== 'completed');
  return (
    <>
      <PageHeader eyebrow="الهاكاثونات" title="ليست قائمة فعاليات، بل نافذة للملاحظة." desc="يسجل كل هاكاثون من فعل ماذا، فلا يحصل أعضاء الفريق على الرصيد نفسه لعمل مختلف." />
      {st.role === 'student' && upcoming.length > 0 && <div className="mb-10"><TeamBuilder events={upcoming} /></div>}
      <section className="space-y-5">
        {done.map((h) => {
          const p = st.projects.find((x) => x.id === h.projectId);
          return (
            <article key={h.id} className="panel rise overflow-hidden" data-testid={`card-hackathon-${h.id}`}>
              <div className="grid md:grid-cols-[280px_1fr]">
                <div className="relative bg-[hsl(var(--indigo))] p-6 text-[hsl(40_45%_96%)]">
                  <Trophy className="h-6 w-6 text-[hsl(var(--saffron))]" />
                  <h2 className="mt-4 font-display text-2xl font-semibold">{h.name}</h2>
                  <p className="mt-2 text-sm opacity-75">{h.theme}</p>
                  <p className="mt-4 flex items-center gap-1.5 text-xs opacity-70"><MapPin className="h-3.5 w-3.5" />{h.city} · {fmtDate(h.date)}</p>
                  {p && <p className="mt-6 font-display text-3xl font-semibold text-[hsl(var(--saffron))]">{p.result}</p>}
                </div>
                {p && (
                  <div className="p-6">
                    <p className="eyebrow">{p.team} · التحدي: {p.challenge}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold">{p.title}</h3>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {p.members.map((m) => (
                        <div key={m.studentId} className={cn('rounded-2xl border p-3', m.studentId === 'me' && 'border-[hsl(var(--madder)/.5)] bg-[hsl(var(--madder)/.05)]')}>
                          <div className="flex items-center gap-2"><Initials name={m.name} size={26} tone={m.studentId === 'me' ? 'madder' : 'indigo'} /><span className="text-sm font-semibold">{m.studentId === 'me' ? 'أنت' : m.name.split(' ')[0]}</span><span className="ms-auto font-mono text-xs">{m.share}%</span></div>
                          <p className="mt-2 text-xs text-muted-foreground">{m.role}</p>
                        </div>
                      ))}
                    </div>
                    <Link href={`/projects/${p.id}`} className="btn btn-primary btn-sm mt-5" data-testid={`link-project-${p.id}`}>عرض المساهمات الفردية <ArrowLeft className="h-3.5 w-3.5" /></Link>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </section>
      <section className="mt-10">
        <p className="eyebrow mb-3">القادمة</p>
        {upcoming.length === 0 ? <Empty icon={Trophy} title="لا توجد هاكاثونات قادمة" body="تعلن الأندية والشركاء عن الجديد منها." /> : (
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((h) => (
              <div key={h.id} className="panel lift p-5" data-testid={`card-upcoming-${h.id}`}>
                <p className="eyebrow">{h.organizer}</p>
                <h3 className="mt-1 font-display text-xl font-semibold">{h.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{h.theme}</p>
                <p className="mt-3 flex items-center gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(h.date)}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{h.city}</span></p>
                {st.role === 'student' && <button className={h.status === 'registered' ? 'btn btn-ghost btn-sm mt-4' : 'btn btn-accent btn-sm mt-4'} data-testid={`button-register-${h.id}`}
                  onClick={() => { mutate((d) => { const x = d.hackathons.find((y) => y.id === h.id)!; x.status = x.status === 'registered' ? 'upcoming' : 'registered'; if (x.status === 'registered') log(d, `التسجيل في ${h.name}`, 'hackathon'); }); toast({ title: h.status === 'registered' ? 'تم سحب التسجيل' : 'تم التسجيل (تجريبي)', description: h.name }); }}>
                  {h.status === 'registered' ? 'مسجّل · سحب التسجيل' : 'سجّل الآن'}</button>}
              </div>
            ))}
          </div>
        )}
      </section>
      <div className="mt-6"><DemoNote>الهاكاثونات والجهات المنظمة سجلات تجريبية</DemoNote></div>
    </>
  );
}
