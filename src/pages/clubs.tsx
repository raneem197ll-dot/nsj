import { useState } from 'react';
import { Users, Plus, MapPin, CalendarDays, UserPlus, ClipboardList, BadgeCheck, Lightbulb } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, log, addEvidence, fmtDate, useCandidates } from '@/lib/store';
import { NAMES, type Activity } from '@/lib/data';
import { statusLabel } from '@/lib/i18n';
import { PageHeader, Empty, Modal, Field, Tabs, Meter, Initials, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';

const SKILL_HINTS: [RegExp, string][] = [[/schedul|venue|plan|timeline|logistic|جدول|مكان|خطة|تخطيط|لوجست|زمني/i, 'إدارة المشاريع'], [/lead|coordinat|manage|team|قياد|قائد|تنسيق|نسق|إدار|فريق/i, 'القيادة'], [/speak|present|pitch|host|خطاب|عرض|تقديم|إلقاء/i, 'الخطابة والعرض'], [/design|poster|brand|visual|تصميم|ملصق|هوية|بصري/i, 'التصميم الجرافيكي'], [/sponsor|partner|outreach|email|رعا|شراك|تواصل|بريد/i, 'التواصل'], [/research|survey|interview|بحث|استبيان|مقابل/i, 'بحث تجربة المستخدم'], [/budget|finance|cost|ميزاني|مالي|تكلف/i, 'التحليل المالي'], [/facilitat|workshop|session|تيسير|ورش|جلس/i, 'التيسير']];
export function recommendSkills(text: string) { return Array.from(new Set(SKILL_HINTS.filter(([r]) => r.test(text)).map(([, s]) => s))); }

function NewActivity({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ title: '', type: 'ورشة عمل', date: '', location: '', description: '', capacity: 30, skills: '' });
  const { toast } = useToast();
  const save = () => {
    const a: Activity = { id: newId('ac'), club: NAMES.club, title: f.title, type: f.type, date: f.date || today(), location: f.location, description: f.description, capacity: f.capacity, skills: f.skills.split(/[,،]/).map((s) => s.trim()).filter(Boolean), registered: [], status: 'open', assignments: [] };
    mutate((d) => { d.activities.unshift(a); });
    toast({ title: 'تم نشر النشاط', description: 'التسجيل مفتوح للطلاب.' });
    onClose();
  };
  const suggestions = recommendSkills(`${f.title} ${f.description}`);
  return (
    <Modal open onClose={onClose} title="نشر نشاط">
      <div className="space-y-4">
        <Field label="العنوان"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="input-activity-title" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="النوع"><select className="field" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{['ورشة عمل', 'فعالية', 'مشروع فريق', 'مسابقة', 'تطوع'].map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="السعة"><input type="number" className="field" value={f.capacity} onChange={(e) => setF({ ...f, capacity: Number(e.target.value) })} data-testid="input-activity-capacity" /></Field>
          <Field label="التاريخ"><input type="date" className="field" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="المكان"><input className="field" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} /></Field>
        </div>
        <Field label="الوصف"><textarea className="field min-h-20" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} data-testid="input-activity-description" /></Field>
        <Field label="المهارات المرتبطة (مفصولة بفواصل)"><input className="field" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} data-testid="input-activity-skills" /></Field>
        {suggestions.length > 0 && <div className="flex flex-wrap items-center gap-2 text-xs"><Lightbulb className="h-3.5 w-3.5 text-[hsl(var(--saffron))]" /> مقترحة من الوصف: {suggestions.map((s) => <button key={s} className="chip" onClick={() => setF({ ...f, skills: f.skills ? `${f.skills}، ${s}` : s })}>+ {s}</button>)}</div>}
        <button className="btn btn-primary w-full" disabled={!f.title || !f.description} onClick={save} data-testid="button-publish-activity">نشر وفتح التسجيل</button>
      </div>
    </Modal>
  );
}

function Assign({ act, onClose }: { act: Activity; onClose: () => void }) {
  const st = useDemo();
  const people = useCandidates(st);
  const [who, setWho] = useState(people[0].id);
  const [role, setRole] = useState('');
  const [tasks, setTasks] = useState('');
  const { toast } = useToast();
  const recs = recommendSkills(`${role} ${tasks}`);
  const save = () => {
    const person = people.find((p) => p.id === who)!;
    mutate((d) => { const a = d.activities.find((x) => x.id === act.id)!; a.assignments.push({ person: person.name, studentId: person.id, role, tasks, skills: recs.length ? recs : act.skills.slice(0, 2), recorded: false }); if (!a.registered.includes(person.name)) a.registered.push(person.name); });
    toast({ title: 'تم إسناد المسؤولية', description: `${person.name}: ${role}` });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={`إسناد مسؤولية: ${act.title}`}>
      <div className="space-y-4">
        <Field label="الطالب"><select className="field" value={who} onChange={(e) => setWho(e.target.value)} data-testid="select-assign-student">{people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></Field>
        <Field label="الدور"><input className="field" value={role} onChange={(e) => setRole(e.target.value)} placeholder="مثال: مسؤول المكان والجدول" data-testid="input-assign-role" /></Field>
        <Field label="المهام"><textarea className="field min-h-20" value={tasks} onChange={(e) => setTasks(e.target.value)} data-testid="input-assign-tasks" /></Field>
        <p className="text-xs text-muted-foreground">مهارات مقترحة من المهام الفعلية: {recs.length ? recs.join('، ') : 'صف المهام للحصول على اقتراحات'}</p>
        <button className="btn btn-primary w-full" disabled={!role || !tasks} onClick={save} data-testid="button-save-assignment">إسناد</button>
      </div>
    </Modal>
  );
}

function Record({ act, idx, onClose }: { act: Activity; idx: number; onClose: () => void }) {
  const a = act.assignments[idx];
  const [evidence, setEvidence] = useState(a.evidence ?? '');
  const { toast } = useToast();
  const save = () => {
    mutate((d) => {
      const x = d.activities.find((y) => y.id === act.id)!.assignments[idx];
      x.recorded = true; x.evidence = evidence;
      if (x.studentId === 'me') x.skills.forEach((s) => addEvidence(d, s, { type: 'responsibility', title: `${x.role}، ${act.title}: ${x.tasks}`, source: `${act.club} (مسجّل من النادي)`, date: today() }, 'Business'));
      log(d, `سجّل ${act.club} مساهمة ${x.person}`, 'club');
    });
    toast({ title: 'تم تسجيل المساهمة', description: 'تُحتسب المسؤوليات الموثقة دليلًا، لا توثيقًا.' });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title="تسجيل المساهمة الفردية">
      <div className="space-y-4 text-sm">
        <div className="rounded-xl bg-[hsl(var(--secondary))] p-3"><p className="font-semibold">{a.person} · {a.role}</p><p className="text-muted-foreground">{a.tasks}</p><p className="mt-1 text-xs">المهارات: {a.skills.join('، ')}</p></div>
        <Field label="المخرجات وأدلة المشاركة"><textarea className="field min-h-20" value={evidence} onChange={(e) => setEvidence(e.target.value)} placeholder="مثال: وثيقة سير الفعالية، قائمة المتطوعين" data-testid="input-record-evidence" /></Field>
        <button className="btn btn-accent w-full" disabled={!evidence} onClick={save} data-testid="button-record-contribution">تسجيل وإرسال الدليل</button>
      </div>
    </Modal>
  );
}

function ActivityCard({ a, manage }: { a: Activity; manage: boolean }) {
  const st = useDemo();
  const { toast } = useToast();
  const [assign, setAssign] = useState(false);
  const [rec, setRec] = useState<number | null>(null);
  const me = st.profile.name;
  const joined = a.registered.includes(me);
  const full = a.registered.length >= a.capacity;
  return (
    <article className="panel rise overflow-hidden" data-testid={`card-activity-${a.id}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2"><p className="eyebrow">{a.club} · {a.type}</p><span className="chip">{statusLabel(a.status)}</span></div>
        <h3 className="mt-1 font-display text-xl font-semibold">{a.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
        <p className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{fmtDate(a.date)}</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{a.location}</span></p>
        <div className="mt-3 flex flex-wrap gap-1.5">{a.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
        <div className="mt-4"><div className="mb-1 flex justify-between text-xs"><span>المسجلون</span><span className="font-mono">{a.registered.length}/{a.capacity}</span></div><Meter value={(a.registered.length / a.capacity) * 100} tone="saffron" /></div>
        {!manage && a.status === 'open' && <button className={joined ? 'btn btn-ghost btn-sm mt-4' : 'btn btn-primary btn-sm mt-4'} disabled={!joined && full} data-testid={`button-join-${a.id}`} onClick={() => { mutate((d) => { const x = d.activities.find((y) => y.id === a.id)!; x.registered = joined ? x.registered.filter((n) => n !== me) : [...x.registered, me]; if (!joined) log(d, `التسجيل في ${a.title}`, 'club'); }); toast({ title: joined ? 'تم إلغاء التسجيل' : 'تم التسجيل', description: joined ? a.title : 'الحضور وحده لا يوثّق المهارات، أما المسؤوليات فتُحتسب دليلًا.' }); }}>{joined ? 'مسجّل · إلغاء' : full ? 'مكتمل العدد' : 'سجّل'}</button>}
        {manage && <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-primary btn-sm" onClick={() => setAssign(true)} data-testid={`button-assign-${a.id}`}><UserPlus className="h-3.5 w-3.5" /> إسناد مسؤولية</button>
          <button className="btn btn-ghost btn-sm" onClick={() => mutate((d) => { const x = d.activities.find((y) => y.id === a.id)!; x.status = x.status === 'open' ? 'closed' : x.status === 'closed' ? 'completed' : 'open'; })} data-testid={`button-status-${a.id}`}>{a.status === 'open' ? 'إغلاق التسجيل' : a.status === 'closed' ? 'تحديد كمكتمل' : 'إعادة فتح'}</button>
        </div>}
      </div>
      {(manage || a.assignments.some((x) => x.studentId === 'me')) && a.assignments.length > 0 && (
        <div className="border-t bg-[hsl(var(--secondary)/.4)] p-5">
          <p className="eyebrow mb-2 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5" /> المسؤوليات</p>
          <ul className="space-y-2">{a.assignments.filter((x) => manage || x.studentId === 'me').map((x) => { const i = a.assignments.indexOf(x); return (
            <li key={i} className="flex items-center gap-3 rounded-xl bg-[hsl(var(--card))] p-3 text-sm"><Initials name={x.person} size={28} /><span className="flex-1"><span className="font-semibold">{x.person}</span> · {x.role}<span className="block text-xs text-muted-foreground">{x.tasks}</span></span>
              {x.recorded ? <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--oasis))]"><BadgeCheck className="h-4 w-4" /> مسجّلة</span> : manage ? <button className="btn btn-accent btn-sm" onClick={() => setRec(i)} data-testid={`button-record-${a.id}-${i}`}>تسجيل</button> : <span className="text-xs text-muted-foreground">بانتظار التسجيل</span>}</li>); })}</ul>
        </div>
      )}
      {assign && <Assign act={a} onClose={() => setAssign(false)} />}
      {rec !== null && <Record act={a} idx={rec} onClose={() => setRec(null)} />}
    </article>
  );
}

export default function Clubs() {
  const st = useDemo();
  const manage = st.role === 'club';
  const [tab, setTab] = useState<'open' | 'mine' | 'completed'>('open');
  const [creating, setCreating] = useState(false);
  useMeta(manage ? 'أنشطة النادي' : 'الأندية والأنشطة', 'أنشطة الأندية مع التسجيل والمسؤوليات المسندة والمساهمات الفردية المسجلة.');
  const list = st.activities.filter((a) => tab === 'open' ? a.status !== 'completed' : tab === 'completed' ? a.status === 'completed' : a.registered.includes(st.profile.name));
  return (
    <>
      <PageHeader eyebrow={manage ? 'أنشطة النادي' : 'الأندية والأنشطة'} title={manage ? 'كل منظم يغادر ومعه دليل' : 'المشاركة بداية، والمسؤولية دليل.'} desc="تسجل الأندية من فعل ماذا. تصبح المسؤوليات الموثقة أدلة في الجواز، والحضور وحده لا يوثّق مهارة." actions={manage && <button className="btn btn-accent" onClick={() => setCreating(true)} data-testid="button-new-activity"><Plus className="h-4 w-4" /> نشر نشاط</button>} />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'open', label: 'القادمة' }, ...(manage ? [] : [{ value: 'mine' as const, label: 'المسجّل فيها' }]), { value: 'completed', label: 'المكتملة' }]} />
      {list.length === 0 ? <Empty icon={Users} title="لا شيء هنا بعد" body={manage ? 'انشر نشاطًا لفتح التسجيل.' : 'سجّل في نشاط ليظهر هنا.'} /> : <div className="grid gap-5 lg:grid-cols-2">{list.map((a) => <ActivityCard key={a.id} a={a} manage={manage} />)}</div>}
      {creating && <NewActivity onClose={() => setCreating(false)} />}
      <div className="mt-6"><DemoNote>أنشطة الأندية سجلات تجريبية</DemoNote></div>
    </>
  );
}
