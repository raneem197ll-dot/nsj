import { useState } from 'react';
import { Link } from 'wouter';
import { FolderKanban, Plus, ArrowLeft } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, log, useCandidates, fmtDate } from '@/lib/store';
import { NAMES, type Project, type Member } from '@/lib/data';
import { PROJECT_KIND_LABEL } from '@/lib/i18n';
import { PageHeader, Empty, Modal, Field, Initials, Tabs, DemoNote } from '@/components/kit';
import { recommendSkills } from './clubs';
import { useToast } from '@/hooks/use-toast';

function NewProject({ onClose, club }: { onClose: () => void; club: boolean }) {
  const st = useDemo();
  const people = useCandidates(st);
  const [f, setF] = useState({ title: '', challenge: '', summary: '', deliverables: '' });
  const [members, setMembers] = useState<Member[]>(club ? [] : [{ studentId: 'me', name: st.profile.name, role: 'المالك', responsibilities: [], tasks: [], skills: [], tools: [], contribution: '', share: 100 }]);
  const [m, setM] = useState({ id: people[0].id, role: '', tasks: '', tools: '' });
  const { toast } = useToast();
  const addMember = () => {
    const p = people.find((x) => x.id === m.id)!;
    const tasks = m.tasks.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
    setMembers([...members.filter((x) => x.studentId !== p.id), { studentId: p.id, name: p.name, role: m.role, responsibilities: [m.role], tasks, skills: recommendSkills(`${m.role} ${m.tasks}`), tools: m.tools.split(/[,،]/).map((s) => s.trim()).filter(Boolean), contribution: tasks.join('؛ '), share: 0 }]);
    setM({ ...m, role: '', tasks: '', tools: '' });
  };
  const save = () => {
    const share = Math.round(100 / Math.max(1, members.length));
    const p: Project = { id: newId('pr'), title: f.title, kind: club ? 'club' : 'personal', context: club ? NAMES.clubFull : 'مشروع شخصي', challenge: f.challenge, summary: f.summary, team: club ? 'فريق النادي' : 'فردي', date: today(), members: members.map((x) => ({ ...x, share, skills: x.skills.length ? x.skills : ['إدارة المشاريع'] })), deliverables: f.deliverables.split(/[,،]/).map((s) => s.trim()).filter(Boolean), mentorFeedback: 'لم تتم المراجعة بعد.', judgeEvaluation: 'لا ينطبق.', result: 'قيد التنفيذ' };
    mutate((d) => { d.projects.unshift(p); log(d, `إنشاء مشروع ${p.title}`, 'project'); });
    toast({ title: 'تم إنشاء المشروع', description: 'افتحه لربط المساهمات الفردية بالمهارات.' });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={club ? 'إنشاء مشروع فريق' : 'إضافة مشروع'} wide>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="العنوان"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="input-project-title" /></Field>
          <Field label="المشكلة أو التحدي"><input className="field" value={f.challenge} onChange={(e) => setF({ ...f, challenge: e.target.value })} /></Field>
          <Field label="الملخص"><textarea className="field min-h-20" value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} data-testid="input-project-summary" /></Field>
          <Field label="المخرجات (مفصولة بفواصل)"><input className="field" value={f.deliverables} onChange={(e) => setF({ ...f, deliverables: e.target.value })} data-testid="input-project-deliverables" /></Field>
        </div>
        <div>
          <p className="eyebrow mb-2">{club ? 'الفريق والمسؤوليات' : 'مساهمتك'}</p>
          <div className="space-y-2 rounded-2xl border p-3">
            {club && <select className="field" value={m.id} onChange={(e) => setM({ ...m, id: e.target.value })} data-testid="select-member">{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
            <input className="field" placeholder="الدور، مثال: مصمم هوية" value={m.role} onChange={(e) => setM({ ...m, role: e.target.value })} data-testid="input-member-role" />
            <input className="field" placeholder="المهام، مفصولة بفواصل" value={m.tasks} onChange={(e) => setM({ ...m, tasks: e.target.value })} data-testid="input-member-tasks" />
            <input className="field" placeholder="الأدوات، مفصولة بفواصل" value={m.tools} onChange={(e) => setM({ ...m, tools: e.target.value })} />
            <button className="btn btn-ghost btn-sm" disabled={!m.role} onClick={club ? addMember : () => { setMembers([{ ...members[0], role: m.role, responsibilities: [m.role], tasks: m.tasks.split(/[,،]/).map((s) => s.trim()).filter(Boolean), skills: recommendSkills(`${m.role} ${m.tasks}`), tools: m.tools.split(/[,،]/).map((s) => s.trim()).filter(Boolean), contribution: m.tasks }]); }} data-testid="button-add-member"><Plus className="h-3.5 w-3.5" /> {club ? 'إضافة عضو' : 'تحديد المساهمة'}</button>
          </div>
          <ul className="mt-3 space-y-2">{members.map((x) => <li key={x.studentId} className="flex items-center gap-2 rounded-xl bg-[hsl(var(--secondary)/.6)] p-2 text-sm"><Initials name={x.name} size={24} /><span className="flex-1"><span className="font-semibold">{x.name}</span> · {x.role}<span className="block text-[11px] text-muted-foreground">المهارات من المهام: {x.skills.join('، ') || 'لم تُكتشف مهارات'}</span></span></li>)}</ul>
        </div>
      </div>
      <button className="btn btn-accent mt-6 w-full" disabled={!f.title || members.length === 0} onClick={save} data-testid="button-save-project">إنشاء المشروع</button>
    </Modal>
  );
}

export default function Projects() {
  const st = useDemo();
  const club = st.role === 'club';
  const [tab, setTab] = useState<'all' | 'hackathon' | 'club' | 'personal'>('all');
  const [creating, setCreating] = useState(false);
  useMeta(club ? 'مشاريع الفرق' : 'مشاريعي', 'مشاريع بمساهمات فردية ومخرجات وأدلة لكل عضو.');
  const base = club ? st.projects.filter((p) => p.kind === 'club') : st.projects.filter((p) => p.members.some((m) => m.studentId === 'me'));
  const list = base.filter((p) => tab === 'all' || p.kind === tab);
  return (
    <>
      <PageHeader eyebrow={club ? 'مشاريع الفرق' : 'مشاريعي'} title={club ? 'مشاريع جماعية، ورصيد فردي' : 'عملك، واسمك على الجزء الذي أنجزته'} desc="يفصل كل مشروع بين من فعل ماذا، وتبقى المخرجات وملاحظات المرشدين وتقييمات لجان التحكيم مرفقة." actions={<button className="btn btn-accent" onClick={() => setCreating(true)} data-testid="button-new-project"><Plus className="h-4 w-4" /> {club ? 'إنشاء مشروع فريق' : 'إضافة مشروع'}</button>} />
      {!club && <Tabs value={tab} onChange={setTab} items={[{ value: 'all', label: 'الكل' }, { value: 'hackathon', label: 'هاكاثون' }, { value: 'club', label: 'نادٍ' }, { value: 'personal', label: 'شخصي' }]} />}
      {list.length === 0 ? <Empty icon={FolderKanban} title="لا توجد مشاريع بعد" body="أضف مشروعًا ووثّق مساهمتك." action={<button className="btn btn-primary" onClick={() => setCreating(true)}>إضافة مشروع</button>} /> : (
        <div className="grid gap-4 md:grid-cols-2">{list.map((p, i) => { const me = p.members.find((m) => m.studentId === 'me'); return (
          <Link key={p.id} href={`/projects/${p.id}`} className="panel lift rise group block p-5" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-project-${p.id}`}>
            <div className="flex items-center justify-between"><p className="eyebrow">{PROJECT_KIND_LABEL[p.kind] ?? p.kind} · {fmtDate(p.date)}</p><span className="chip">{p.result}</span></div>
            <h3 className="mt-1 font-display text-xl font-semibold">{p.title}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.summary}</p>
            {me && !club && <p className="mt-3 text-sm"><span className="font-semibold">دورك:</span> {me.role} · حصة {me.share}%</p>}
            <div className="mt-4 flex items-center"><div className="flex -space-x-2 rtl:space-x-reverse">{p.members.map((m) => <span key={m.studentId} className="rounded-full ring-2 ring-[hsl(var(--card))]"><Initials name={m.name} size={28} tone={m.studentId === 'me' ? 'madder' : 'indigo'} /></span>)}</div><ArrowLeft className="ms-auto h-4 w-4 transition-transform group-hover:-translate-x-1" /></div>
          </Link>); })}</div>
      )}
      {creating && <NewProject club={club} onClose={() => setCreating(false)} />}
      <div className="mt-6"><DemoNote>المشاريع سجلات تجريبية</DemoNote></div>
    </>
  );
}
