import { useState } from 'react';
import { Newspaper, Plus, Bookmark, Trash2 } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, fmtDate } from '@/lib/store';
import { PERSONAS, type Post } from '@/lib/data';
import { PageHeader, Empty, Modal, Field, Tabs, Initials, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const KIND_LABEL: Record<Post['kind'], string> = { insight: 'رؤية مهنية', 'case-study': 'دراسة حالة', tool: 'توصية أداة', academic: 'شرح أكاديمي', requirement: 'متطلب من القطاع', resource: 'مصدر تعلم' };

export default function Community() {
  const st = useDemo();
  const [kind, setKind] = useState<'all' | Post['kind']>('all');
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<string[]>(() => JSON.parse(localStorage.getItem('nasj-saved') ?? '[]'));
  const canPublish = st.role !== 'student';
  const kinds: Post['kind'][] = st.role === 'professor' ? ['academic', 'resource'] : st.role === 'professional' ? ['insight', 'case-study', 'tool', 'requirement'] : st.role === 'company' ? ['requirement', 'insight'] : ['resource', 'insight'];
  const [f, setF] = useState({ kind: kinds[0], title: '', body: '', tags: '' });
  const { toast } = useToast();
  const p = PERSONAS[st.role];
  useMeta(st.role === 'professor' ? 'المحتوى الأكاديمي' : st.role === 'professional' ? 'رؤى ودراسات حالة' : 'المجتمع', 'رؤى مهنية ودراسات حالة وتوصيات أدوات وشروح أكاديمية من مجتمع نَسْج.');
  const list = st.posts.filter((x) => kind === 'all' || x.kind === kind);
  const publish = () => {
    mutate((d) => { d.posts.unshift({ id: newId('po'), author: p.name, authorRole: st.role, org: p.org.split(/[,،]/)[0], kind: f.kind, title: f.title, body: f.body, tags: f.tags.split(/[,،]/).map((t) => t.trim()).filter(Boolean), date: today(), saves: 0 }); });
    toast({ title: 'تم النشر', description: 'أصبح ظاهرًا للطلاب في المجتمع.' });
    setOpen(false); setF({ kind: kinds[0], title: '', body: '', tags: '' });
  };
  const toggleSave = (id: string) => { const n = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id]; setSaved(n); localStorage.setItem('nasj-saved', JSON.stringify(n)); };
  return (
    <>
      <PageHeader eyebrow="المجتمع" title={canPublish ? 'شارك ما لا تقدمه القاعة الدراسية' : 'تعلّم ممن يمارسون العمل'} desc="شروح أكاديمية ورؤى من القطاع ودراسات حالة حقيقية وتوصيات أدوات، كلها مرتبطة بالمهارات التي يبنيها الطلاب."
        actions={canPublish && <button className="btn btn-accent" onClick={() => setOpen(true)} data-testid="button-new-post"><Plus className="h-4 w-4" /> نشر</button>} />
      <Tabs value={kind} onChange={setKind} items={[{ value: 'all', label: 'الكل' }, ...(Object.keys(KIND_LABEL) as Post['kind'][]).map((k) => ({ value: k, label: KIND_LABEL[k], count: st.posts.filter((x) => x.kind === k).length }))]} />
      {list.length === 0 ? <Empty icon={Newspaper} title="لم يُنشر شيء هنا بعد" body={canPublish ? 'كن أول من ينشر في هذه الفئة.' : 'عُد قريبًا.'} /> : (
        <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
          {list.map((x, i) => (
            <article key={x.id} className={cn('panel rise mb-4 break-inside-avoid p-5', x.kind === 'academic' && 'border-s-4 border-s-[hsl(var(--indigo))]', x.kind === 'case-study' && 'border-s-4 border-s-[hsl(var(--madder))]')} style={{ animationDelay: `${i * 30}ms` }} data-testid={`card-post-${x.id}`}>
              <p className="eyebrow">{KIND_LABEL[x.kind]}</p>
              <h3 className="mt-2 font-display text-xl font-semibold leading-snug">{x.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{x.body}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{x.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              <div className="mt-4 flex items-center gap-2 border-t pt-3"><Initials name={x.author} size={28} tone={x.authorRole === 'professor' ? 'indigo' : x.authorRole === 'company' ? 'oasis' : 'madder'} /><span className="flex-1 text-xs"><span className="font-semibold">{x.author}</span><span className="block text-muted-foreground">{x.org} · {fmtDate(x.date)}</span></span>
                <button className={cn('btn btn-ghost btn-sm', saved.includes(x.id) && 'bg-[hsl(var(--secondary))]')} onClick={() => toggleSave(x.id)} aria-pressed={saved.includes(x.id)} data-testid={`button-save-${x.id}`}><Bookmark className="h-3.5 w-3.5" />{x.saves + (saved.includes(x.id) ? 1 : 0)}</button>
                {x.author === p.name && <button className="btn btn-ghost btn-sm" aria-label="حذف المنشور" onClick={() => mutate((d) => { d.posts = d.posts.filter((y) => y.id !== x.id); })} data-testid={`button-delete-post-${x.id}`}><Trash2 className="h-3.5 w-3.5" /></button>}
              </div>
            </article>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="النشر في المجتمع">
        <div className="space-y-4">
          <Field label="النوع"><select className="field" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as Post['kind'] })} data-testid="select-post-kind">{kinds.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select></Field>
          <Field label="العنوان"><input className="field" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} data-testid="input-post-title" /></Field>
          <Field label={f.kind === 'academic' ? 'الشرح (اربط النظرية بتحدٍ حقيقي)' : f.kind === 'case-study' ? 'ما الذي حدث، وما الذي فعلته، وما الذي تعلمته' : 'المحتوى'}><textarea className="field min-h-32" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} data-testid="input-post-body" /></Field>
          <Field label="الوسوم (مفصولة بفواصل)"><input className="field" value={f.tags} onChange={(e) => setF({ ...f, tags: e.target.value })} /></Field>
          <button className="btn btn-primary w-full" disabled={!f.title || f.body.length < 20} onClick={publish} data-testid="button-publish-post">انشر باسم {p.name}</button>
        </div>
      </Modal>
      <div className="mt-6"><DemoNote>المؤلفون والجهات شخصيات تجريبية</DemoNote></div>
    </>
  );
}
