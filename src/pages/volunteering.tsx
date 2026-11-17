import { useState } from 'react';
import { HeartHandshake, Plus, Trash2, Info } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, log, addEvidence, fmtDate } from '@/lib/store';
import { PageHeader, Empty, Modal, Field, Stat, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';

export default function Volunteering() {
  const { volunteering } = useDemo();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ org: '', title: '', hours: 4, date: '', responsibilities: '', skills: '' });
  const { toast } = useToast();
  useMeta('التطوع', 'سجّل ساعات التطوع والمسؤوليات كسياق لجواز مهاراتك.');
  const save = () => {
    mutate((d) => {
      const skills = f.skills.split(/[,،]/).map((s) => s.trim()).filter(Boolean);
      d.volunteering.unshift({ id: newId('v'), org: f.org, title: f.title, hours: f.hours, date: f.date || today(), responsibilities: f.responsibilities, skills, confirmed: false });
      skills.forEach((s) => addEvidence(d, s, { type: 'participation', title: `تطوع: ${f.title} (${f.hours} ساعة)`, source: `${f.org} (تسجيل ذاتي)`, date: f.date || today() }));
      log(d, `تسجيل ${f.hours} ساعة تطوع لدى ${f.org}`, 'volunteering');
    });
    toast({ title: 'تم تسجيل التطوع', description: 'سُجّل كمشاركة؛ يضيف سياقًا لكنه لا يوثّق مهارة بمفرده.' });
    setOpen(false); setF({ org: '', title: '', hours: 4, date: '', responsibilities: '', skills: '' });
  };
  return (
    <>
      <PageHeader eyebrow="التطوع" title="وقت مُعطى، موثّق بأمانة" desc="يُظهر التطوع الالتزام. لتحويله إلى دليل مهارة، صف المسؤوليات واقرنه بتقييم." actions={<button className="btn btn-primary" onClick={() => setOpen(true)} data-testid="button-log-volunteering"><Plus className="h-4 w-4" /> تسجيل تطوع</button>} />
      <div className="mb-6 grid grid-cols-3 gap-3"><Stat label="إجمالي الساعات" value={volunteering.reduce((a, v) => a + v.hours, 0)} /><Stat label="الجهات" value={new Set(volunteering.map((v) => v.org)).size} /><Stat label="مؤكد من المنظم" value={volunteering.filter((v) => v.confirmed).length} tone="madder" /></div>
      <p className="mb-6 flex items-start gap-2 rounded-2xl border border-dashed p-4 text-sm text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0" /> تُحفظ سجلات المشاركة والشهادات كسياق. لا ترفع نَسْج مهارة إلى «موثّقة» بناءً على المشاركة وحدها.</p>
      {volunteering.length === 0 ? <Empty icon={HeartHandshake} title="لا يوجد تطوع بعد" body="سجّل نشاطك الأول مع المسؤوليات التي توليتها." /> : (
        <div className="space-y-3">{volunteering.map((v) => (
          <article key={v.id} className="panel flex flex-col gap-3 p-5 sm:flex-row sm:items-center" data-testid={`card-volunteer-${v.id}`}>
            <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-[hsl(var(--madder)/.1)] text-[hsl(var(--madder))]"><span className="font-display text-xl font-semibold leading-none">{v.hours}</span><span className="text-[10px]">ساعة</span></div>
            <div className="flex-1"><p className="eyebrow">{v.org} · {fmtDate(v.date)}</p><h3 className="font-semibold">{v.title}</h3><p className="text-sm text-muted-foreground">{v.responsibilities}</p><div className="mt-2 flex flex-wrap gap-1.5">{v.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div></div>
            <div className="flex items-center gap-2"><span className="chip">{v.confirmed ? 'مؤكد من المنظم (تجريبي)' : 'تسجيل ذاتي'}</span><button className="btn btn-ghost btn-sm" aria-label="حذف" onClick={() => mutate((d) => { d.volunteering = d.volunteering.filter((x) => x.id !== v.id); })} data-testid={`button-delete-volunteer-${v.id}`}><Trash2 className="h-3.5 w-3.5" /></button></div>
          </article>
        ))}</div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="تسجيل تطوع">
        <div className="space-y-4">
          <Field label="الجهة"><input className="field" value={f.org} onChange={(e) => setF({ ...f, org: e.target.value })} data-testid="input-vol-org" /></Field>
          <Field label="النشاط"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="input-vol-title" /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="الساعات"><input type="number" min={1} className="field" value={f.hours} onChange={(e) => setF({ ...f, hours: Number(e.target.value) })} data-testid="input-vol-hours" /></Field><Field label="التاريخ"><input type="date" className="field" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field></div>
          <Field label="المسؤوليات"><textarea className="field min-h-20" value={f.responsibilities} onChange={(e) => setF({ ...f, responsibilities: e.target.value })} data-testid="input-vol-resp" /></Field>
          <Field label="المهارات المرتبطة (مفصولة بفواصل)"><input className="field" value={f.skills} onChange={(e) => setF({ ...f, skills: e.target.value })} data-testid="input-vol-skills" /></Field>
          <button className="btn btn-primary w-full" disabled={!f.org || !f.title || f.hours < 1} onClick={save} data-testid="button-save-volunteering">حفظ</button>
        </div>
      </Modal>
      <div className="mt-6"><DemoNote>جهات التطوع المعروضة سجلات تجريبية</DemoNote></div>
    </>
  );
}
