import { useState } from 'react';
import { Link } from 'wouter';
import { Plus, Trash2, Paperclip, Sparkles, ListChecks, Pencil } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, addEvidence, log, fmtDate } from '@/lib/store';
import { CATEGORIES, LEVELS, NAMES, EVIDENCE_LABEL, type EvidenceType, type Skill, type Requirement } from '@/lib/data';
import { PageHeader, StateBadge, StateLadder, Empty, Modal, Field, Tabs, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { catLabel } from '@/lib/i18n';
import { SkillGoalControls } from '@/components/skill-goal';

function AddSkill({ open, onClose, edit }: { open: boolean; onClose: () => void; edit?: Skill }) {
  const [name, setName] = useState(edit?.name ?? '');
  const [category, setCategory] = useState(edit?.category ?? 'Design');
  const [level, setLevel] = useState(edit?.level ?? 0);
  const [developing, setDeveloping] = useState(edit?.developing ?? true);
  const { toast } = useToast();
  const save = () => {
    if (!name.trim()) return;
    mutate((d) => {
      if (edit) {
        const s = d.skills.find((x) => x.id === edit.id)!;
        if (s.level !== level) s.history.push({ date: today(), note: `تغيّر المستوى المعلن ذاتيًا إلى ${LEVELS[level]}` });
        Object.assign(s, { name: name.trim(), category, level, developing });
      } else {
        d.skills.push({ id: newId('sk'), name: name.trim(), category, level, state: 'declared', developing, evidence: [], projectIds: [], history: [{ date: today(), note: 'إعلان المهارة' }], recommendations: ['خذ تقييمًا عمليًا للانتقال إلى «مُختبرة»'] });
        log(d, `إعلان مهارة ${name.trim()}`, 'skill');
      }
    });
    toast({ title: edit ? 'تم تحديث المهارة' : 'تم إعلان المهارة', description: edit ? name : `تبدأ ${name} بحالة «مُعلنة»، والأدلة ترفعها في السلّم.` });
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={edit ? 'تعديل المهارة' : 'إعلان مهارة'}>
      <div className="space-y-4">
        <Field label="اسم المهارة"><input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: التصميم الحركي" data-testid="input-skill-name" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="الفئة"><select className="field" value={category} onChange={(e) => setCategory(e.target.value)} data-testid="select-skill-category">{CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}</select></Field>
          <Field label="المستوى بتقييمك الذاتي"><select className="field" value={level} onChange={(e) => setLevel(Number(e.target.value))} data-testid="select-skill-level">{LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}</select></Field>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={developing} onChange={(e) => setDeveloping(e.target.checked)} data-testid="checkbox-developing" /> أعمل حاليًا على تطوير هذه المهارة</label>
        <p className="rounded-xl bg-[hsl(var(--secondary))] p-3 text-xs text-muted-foreground">إعلان المهارة ادعاء لا إثبات، ويبقى مستواك هنا ذاتيًا حتى يؤكده تقييم ومقيّم.</p>
        <button className="btn btn-primary w-full" onClick={save} disabled={!name.trim()} data-testid="button-save-skill">{edit ? 'حفظ التغييرات' : 'إعلان المهارة'}</button>
      </div>
    </Modal>
  );
}

export function AttachEvidence({ skill, open, onClose }: { skill: Skill; open: boolean; onClose: () => void }) {
  const [type, setType] = useState<EvidenceType>('project-link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const { toast } = useToast();
  const allowed: EvidenceType[] = ['project-link', 'work-sample', 'certificate', 'participation'];
  const save = () => {
    mutate((d) => { addEvidence(d, skill.name, { type, title, source: type === 'participation' ? 'سجل مشاركة رفعه الطالب' : 'قدّمه الطالب بنفسه', date: today(), url: url || undefined }); log(d, `إضافة ${EVIDENCE_LABEL[type]} إلى ${skill.name}`, 'evidence'); });
    toast({ title: 'تم إرفاق الدليل', description: type === 'participation' ? 'تُحفظ سجلات المشاركة كسياق ولا توثّق مهارة أبدًا.' : 'يُحتسب الدليل المقدّم ذاتيًا ضمن قاعدة الأدلة الثلاثة بعد التقييم.' });
    setTitle(''); setUrl(''); onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={`إرفاق دليل: ${skill.name}`}>
      <div className="space-y-4">
        <Field label="نوع الدليل"><select className="field" value={type} onChange={(e) => setType(e.target.value as EvidenceType)} data-testid="select-evidence-type">{allowed.map((t) => <option key={t} value={t}>{EVIDENCE_LABEL[t]}</option>)}</select></Field>
        <Field label="العنوان"><input className="field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ماذا يُظهر هذا الدليل؟" data-testid="input-evidence-title" /></Field>
        <Field label="الرابط (تجريبي)" hint="لا تُرفع الملفات في هذه النسخة التجريبية؛ يُحفظ رابط مرجعي فقط."><input className="field" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" dir="ltr" data-testid="input-evidence-url" /></Field>
        <p className="text-xs text-muted-foreground">تضيف تقييمات نَسْج والمقيّمون نتائج التقييم والمراجعات، لا الطلاب.</p>
        <button className="btn btn-primary w-full" onClick={save} disabled={!title.trim()} data-testid="button-save-evidence">إرفاق</button>
      </div>
    </Modal>
  );
}

function StudentSkills() {
  const { skills, role } = useDemo();
  const [filter, setFilter] = useState<'all' | 'developing' | 'verified' | 'declared'>('all');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Skill | null>(null);
  const [attach, setAttach] = useState<Skill | null>(null);
  const [confirmDel, setConfirmDel] = useState<Skill | null>(null);
  const list = skills.filter((s) => filter === 'all' || (filter === 'developing' ? s.developing : s.state === filter));
  return (
    <>
      <PageHeader eyebrow="مهاراتي" title="ما تدّعيه، وما تستطيع إثباته" desc="تبدأ كل مهارة ادعاءً، ثم يرفعها العمل التطبيقي والمراجعات وفق المعايير والأدلة في السلّم." actions={<button className="btn btn-primary" onClick={() => setAdding(true)} data-testid="button-add-skill"><Plus className="h-4 w-4" /> إعلان مهارة</button>} />
      <Tabs value={filter} onChange={setFilter} items={[{ value: 'all', label: 'الكل', count: skills.length }, { value: 'developing', label: 'قيد التطوير', count: skills.filter((s) => s.developing).length }, { value: 'verified', label: 'موثّقة', count: skills.filter((s) => s.state === 'verified').length }, { value: 'declared', label: 'مُعلنة فقط', count: skills.filter((s) => s.state === 'declared').length }]} />
      {list.length === 0 ? <Empty icon={Sparkles} title="لا شيء في هذا العرض" body="أعلن مهارة أو غيّر التصفية. تظهر المهارات التي تعمل عليها ضمن «قيد التطوير»." action={<button className="btn btn-primary" onClick={() => setAdding(true)}>إعلان مهارة</button>} /> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((s, i) => (
            <article key={s.id} className="panel lift rise p-5" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-skill-${s.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div><p className="eyebrow">{catLabel(s.category)}</p><h3 className="mt-1 font-display text-xl font-semibold">{s.name}</h3></div>
                <StateBadge state={s.state} />
              </div>
              <div className="mt-4 flex items-center gap-4">
                <StateLadder state={s.state} />
                <span className="text-xs text-muted-foreground">{LEVELS[s.level]}{s.score ? ` · ${s.score}/100` : ''}</span>
                {s.developing && <span className="chip">قيد التطوير</span>}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.evidence.length} أدلة مسجلة{s.evidence.some((e) => e.type === 'participation') ? '، منها مشاركة (لا تُحتسب)' : ''}. آخر تحديث {fmtDate(s.history[s.history.length - 1].date)}.</p>
              <p className="mt-2 text-sm"><span className="font-semibold">الخطوة التالية:</span> {s.recommendations[0]}</p>
              {role === 'student' && <SkillGoalControls skill={s} />}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/assessments" className="btn btn-ghost btn-sm" data-testid={`link-assess-${s.id}`}><ListChecks className="h-3.5 w-3.5" /> تقييم</Link>
                <button className="btn btn-ghost btn-sm" onClick={() => setAttach(s)} data-testid={`button-attach-${s.id}`}><Paperclip className="h-3.5 w-3.5" /> دليل</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(s)} data-testid={`button-edit-${s.id}`}><Pencil className="h-3.5 w-3.5" /> تعديل</button>
                <button className="btn btn-ghost btn-sm text-[hsl(var(--destructive))]" onClick={() => setConfirmDel(s)} data-testid={`button-delete-${s.id}`}><Trash2 className="h-3.5 w-3.5" /> إزالة</button>
              </div>
            </article>
          ))}
        </div>
      )}
      {adding && <AddSkill open onClose={() => setAdding(false)} />}
      {editing && <AddSkill open edit={editing} onClose={() => setEditing(null)} />}
      {attach && <AttachEvidence open skill={attach} onClose={() => setAttach(null)} />}
      <Modal open={!!confirmDel} onClose={() => setConfirmDel(null)} title="إزالة المهارة؟">
        <p className="text-sm text-muted-foreground">سيؤدي هذا إلى إزالة {confirmDel?.name} و{confirmDel?.evidence.length} من أدلتها من جوازك التجريبي، وأي هدف شخصي مرتبط بها.</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setConfirmDel(null)}>إلغاء</button><button className="btn btn-accent" data-testid="button-confirm-delete" onClick={() => { mutate((d) => { d.skills = d.skills.filter((x) => x.id !== confirmDel!.id); }); setConfirmDel(null); }}>إزالة</button></div>
      </Modal>
    </>
  );
}

function CompanyRequirements() {
  const { requirements } = useDemo();
  const [open, setOpen] = useState(false);
  const blank = { skill: '', category: 'Technology', level: 1, competencies: '', criteria: '' };
  const [f, setF] = useState(blank);
  const { toast } = useToast();
  const save = () => {
    const r: Requirement = { id: newId('rq'), org: NAMES.company, date: today(), ...f };
    mutate((d) => { d.requirements.unshift(r); d.posts.unshift({ id: newId('po'), author: NAMES.company, authorRole: 'company', org: NAMES.company, kind: 'requirement', title: `متطلب: ${r.skill} (${LEVELS[r.level]})`, body: r.competencies, tags: [catLabel(r.category)], date: today(), saves: 0 }); });
    toast({ title: 'تم نشر المتطلب', description: 'يراه الطلاب في نبض السوق والمجتمع.' });
    setF(blank); setOpen(false);
  };
  return (
    <>
      <PageHeader eyebrow="متطلبات المهارات" title="حدّد بدقة كيف يبدو الأداء الجيد" desc="تغذي المتطلبات نبض السوق وتشكّل مسارات التعلم التي يتبعها الطلاب." actions={<button className="btn btn-primary" onClick={() => setOpen(true)} data-testid="button-new-requirement"><Plus className="h-4 w-4" /> متطلب جديد</button>} />
      {requirements.length === 0 ? <Empty icon={ListChecks} title="لا توجد متطلبات بعد" body="انشر أول مهارة يحتاجها فريقك." /> : (
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b text-start"><th className="p-4 eyebrow">المهارة</th><th className="p-4 eyebrow">المستوى</th><th className="p-4 eyebrow">الكفاءات المتوقعة</th><th className="p-4 eyebrow">معايير التقييم</th><th className="p-4" /></tr></thead>
            <tbody>{requirements.map((r) => (
              <tr key={r.id} className="border-b last:border-0" data-testid={`row-requirement-${r.id}`}>
                <td className="p-4"><span className="font-semibold">{r.skill}</span><span className="block text-xs text-muted-foreground">{catLabel(r.category)} · {r.org}</span></td>
                <td className="p-4"><span className="chip">{LEVELS[r.level]}</span></td>
                <td className="p-4 text-muted-foreground">{r.competencies}</td>
                <td className="p-4 text-muted-foreground">{r.criteria}</td>
                <td className="p-4">{r.org === NAMES.company && <button className="btn btn-ghost btn-sm" aria-label="حذف المتطلب" onClick={() => mutate((d) => { d.requirements = d.requirements.filter((x) => x.id !== r.id); })} data-testid={`button-delete-requirement-${r.id}`}><Trash2 className="h-3.5 w-3.5" /></button>}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="متطلب مهارة جديد">
        <div className="space-y-4">
          <Field label="المهارة"><input className="field" value={f.skill} onChange={(e) => setF({ ...f, skill: e.target.value })} placeholder="مثال: تكامل واجهات المصرفية المفتوحة" data-testid="input-req-skill" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الفئة"><select className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} data-testid="select-req-category">{CATEGORIES.map((c) => <option key={c} value={c}>{catLabel(c)}</option>)}</select></Field>
            <Field label="مستوى الإتقان المطلوب"><select className="field" value={f.level} onChange={(e) => setF({ ...f, level: Number(e.target.value) })} data-testid="select-req-level">{LEVELS.map((l, i) => <option key={l} value={i}>{l}</option>)}</select></Field>
          </div>
          <Field label="الكفاءات المتوقعة"><textarea className="field min-h-20" value={f.competencies} onChange={(e) => setF({ ...f, competencies: e.target.value })} data-testid="input-req-competencies" /></Field>
          <Field label="معايير التقييم العملي"><textarea className="field min-h-20" value={f.criteria} onChange={(e) => setF({ ...f, criteria: e.target.value })} data-testid="input-req-criteria" /></Field>
          <button className="btn btn-primary w-full" disabled={!f.skill || !f.competencies} onClick={save} data-testid="button-publish-requirement">نشر المتطلب</button>
        </div>
      </Modal>
      <div className="mt-6"><DemoNote>المتطلبات سجلات تجريبية لشركة {NAMES.company}</DemoNote></div>
    </>
  );
}

export default function SkillsPage() {
  const { role } = useDemo();
  useMeta(role === 'company' ? 'متطلبات المهارات' : 'مهاراتي', role === 'company' ? 'حدّد المهارات ومستويات الإتقان ومعايير التقييم التي يحتاجها فريقك.' : 'أعلن مهاراتك وطوّرها وادعمها بالأدلة على سلّم التوثيق في نَسْج.');
  return role === 'company' ? <CompanyRequirements /> : <StudentSkills />;
}
