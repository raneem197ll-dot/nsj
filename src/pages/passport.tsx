import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ShieldCheck, Paperclip, Eye, FileText, ExternalLink, Star, Send, Search, GitCompare, X, Link2, History, Lightbulb, UserCheck } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, today, fmtDate, useCandidates, VERIFY_RULE } from '@/lib/store';
import { LEVELS, EVIDENCE_LABEL, NAMES, type VState, type Candidate, type DemoState } from '@/lib/data';
import { PageHeader, StateBadge, StateLadder, Empty, Modal, Field, Initials, SaduBand, Meter, DemoNote, STATE_META, Tabs } from '@/components/kit';
import { AttachEvidence } from './skills';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { catLabel, Ltr } from '@/lib/i18n';

const ORDER: VState[] = ['verified', 'evaluated', 'assessed', 'declared'];

function Legend() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {(['declared', 'assessed', 'evaluated', 'verified'] as VState[]).map((s, i) => (
        <div key={s} className="panel p-4"><div className="flex items-center justify-between"><StateBadge state={s} /><span className="font-mono text-[10px] text-muted-foreground">المستوى {i + 1}</span></div><p className="mt-2 text-xs text-muted-foreground">{STATE_META[s].meaning}</p></div>
      ))}
    </div>
  );
}

function PublicPortfolio({ st, onClose }: { st: DemoState; onClose: () => void }) {
  const shown = st.skills.filter((s) => s.state !== 'declared').sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state));
  const projects = st.projects.filter((p) => p.members.some((m) => m.studentId === 'me'));
  const { toast } = useToast();
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[hsl(var(--background))]" role="dialog" aria-modal aria-label="معاينة الملف العام">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-[hsl(var(--indigo))] px-4 py-2.5 text-[hsl(40_45%_96%)]">
        <span className="font-mono text-[10.5px]">معاينة تجريبية · غير منشورة على الإنترنت</span>
        <div className="flex gap-2"><button className="btn btn-sm bg-white/10" onClick={() => { navigator.clipboard?.writeText(`nasj.demo/p/${st.profile.name.toLowerCase().replace(/\s+/g, '-')}`); toast({ title: 'تم نسخ الرابط التجريبي', description: 'هذا الرابط توضيحي فقط.' }); }} data-testid="button-copy-portfolio"><Link2 className="h-3.5 w-3.5" /> نسخ الرابط التجريبي</button><button className="btn btn-sm bg-white/10" onClick={onClose} data-testid="button-close-portfolio"><X className="h-3.5 w-3.5" /> إغلاق</button></div>
      </div>
      {!st.settings.publicPortfolio ? <div className="mx-auto max-w-xl p-10"><Empty icon={Eye} title="الملف خاص" body="فعّل الملف العام من الإعدادات لمعاينة ما سيراه أصحاب العمل." action={<Link href="/settings" className="btn btn-primary" onClick={onClose}>فتح الإعدادات</Link>} /></div> : (
        <div className="mx-auto max-w-4xl px-5 py-12">
          <SaduBand height={12} className="mb-10 rounded" />
          <p className="eyebrow">{st.profile.university} · {st.profile.major}</p>
          <h1 className="mt-2 font-display text-5xl font-semibold md:text-6xl">{st.profile.name}</h1>
          {st.settings.showArabic && st.profile.arabicName && st.profile.arabicName !== st.profile.name && <p className="mt-2 text-2xl text-[hsl(var(--madder))]">{st.profile.arabicName}</p>}
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{st.profile.bio}</p>
          <p className="mt-2 text-sm">يسعى إلى <span className="font-semibold">{st.profile.target}</span> · {st.profile.city}</p>
          <h2 className="mt-12 font-display text-2xl font-semibold">مهارات مدعومة بالأدلة</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">{shown.map((s) => (
            <div key={s.id} className="panel p-4"><div className="flex items-center justify-between"><span className="font-semibold">{s.name}</span><StateBadge state={s.state} /></div><p className="mt-1 text-xs text-muted-foreground">{LEVELS[s.level]}{s.score ? ` · ${s.score}/100` : ''}{s.evaluator ? ` · راجعها ${s.evaluator.name}` : ''}</p><p className="mt-2 text-xs">{s.evidence.filter((e) => e.type !== 'participation').length} أدلة مسجلة</p></div>
          ))}</div>
          <h2 className="mt-12 font-display text-2xl font-semibold">المشاريع والمساهمات الفردية</h2>
          <div className="mt-4 space-y-3">{projects.map((p) => { const me = p.members.find((m) => m.studentId === 'me')!; return (
            <div key={p.id} className="panel p-5"><p className="eyebrow">{p.context}</p><h3 className="font-display text-xl font-semibold">{p.title}</h3><p className="mt-1 text-sm"><span className="font-semibold">{me.role}.</span> {me.contribution}</p><p className="mt-2 text-xs text-muted-foreground">{p.result}</p></div>); })}</div>
          <p className="mt-12 font-mono text-[10.5px] text-muted-foreground">أُنشئ بواسطة نسخة نَسْج التجريبية · المهارات المُعلنة فقط مخفية عن العرض العام</p>
        </div>
      )}
    </div>
  );
}

function StudentPassport() {
  const st = useDemo();
  const [filter, setFilter] = useState<VState | 'all'>('all');
  const sorted = useMemo(() => [...st.skills].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || (b.score ?? 0) - (a.score ?? 0)), [st.skills]);
  const list = sorted.filter((s) => filter === 'all' || s.state === filter);
  const [selId, setSelId] = useState<string | null>(null);
  const sel = st.skills.find((s) => s.id === selId) ?? list[0];
  const [attach, setAttach] = useState(false);
  const [preview, setPreview] = useState(false);
  const code = `NSJ-${st.profile.university.split(' ').map((w) => w[0]).join('')}-${(st.profile.name.length * 7919) % 100000}`;
  return (
    <>
      <section className="rise panel overflow-hidden">
        <SaduBand height={14} />
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <p className="eyebrow">جواز المهارات · <Ltr>{code}</Ltr></p>
            <h1 className="mt-2 font-display text-4xl font-semibold md:text-5xl" data-testid="text-passport-name">{st.profile.name}</h1>
            <p className="mt-1 text-muted-foreground">{st.profile.major}، {st.profile.university} · السنة {st.profile.year}</p>
            <div className="mt-5 flex flex-wrap gap-2"><button className="btn btn-primary" onClick={() => setPreview(true)} data-testid="button-preview-portfolio"><Eye className="h-4 w-4" /> معاينة الملف العام</button></div>
          </div>
          <div className="grid grid-cols-4 gap-2 self-end">
            {(['declared', 'assessed', 'evaluated', 'verified'] as VState[]).map((s) => (
              <div key={s} className={cn('rounded-2xl p-3 text-center', s === 'verified' ? 'bg-[hsl(var(--madder))] text-[hsl(var(--accent-foreground))]' : 'bg-[hsl(var(--secondary))]')}>
                <p className="font-display text-3xl font-semibold">{st.skills.filter((x) => x.state === s).length}</p><p className="text-[10.5px] font-semibold opacity-80">{STATE_META[s].label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mt-6"><Legend /></div>

      <div className="mt-8"><Tabs value={filter} onChange={setFilter} items={[{ value: 'all', label: 'كل المهارات' }, ...ORDER.map((s) => ({ value: s, label: STATE_META[s].label, count: st.skills.filter((x) => x.state === s).length }))]} /></div>
      {list.length === 0 || !sel ? <Empty icon={ShieldCheck} title="لا توجد مهارات في هذا المستوى" body="أكمل التقييمات والمراجعات لرفع مهاراتك في السلّم." /> : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <ul className="space-y-2" aria-label="المهارات">
            {list.map((s) => (
              <li key={s.id}><button onClick={() => setSelId(s.id)} aria-current={sel.id === s.id} data-testid={`button-passport-skill-${s.id}`} className={cn('w-full rounded-2xl border p-3.5 text-start transition-all', sel.id === s.id ? 'border-transparent bg-[hsl(var(--indigo))] text-[hsl(40_45%_96%)] shadow-lg' : 'bg-[hsl(var(--card))] hover:border-[hsl(var(--primary))]')}>
                <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{s.name}</span>{s.score && <span className="font-mono text-xs opacity-80">{s.score}</span>}</div>
                <div className="mt-2 flex items-center justify-between"><StateLadder state={s.state} /><span className="text-[10.5px] opacity-70">{STATE_META[s.state].label}</span></div>
              </button></li>
            ))}
          </ul>
          <article key={sel.id} className="panel rise p-6 md:p-8" data-testid="panel-skill-detail">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><p className="eyebrow">{catLabel(sel.category)}</p><h2 className="mt-1 font-display text-3xl font-semibold">{sel.name}</h2></div>
              <StateBadge state={sel.state} className="px-3 py-1 text-xs" />
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div><dt className="eyebrow">الإتقان</dt><dd className="mt-1 font-semibold">{LEVELS[sel.level]}</dd></div>
              <div><dt className="eyebrow">درجة التقييم</dt><dd className="mt-1 font-display text-2xl font-semibold">{sel.score ?? 'غير متاح'}{sel.score && <span className="text-xs text-muted-foreground">/100</span>}</dd></div>
              <div><dt className="eyebrow">تاريخ التقييم</dt><dd className="mt-1 font-semibold">{sel.assessedAt ? fmtDate(sel.assessedAt) : 'لم يُقيَّم'}</dd></div>
              <div><dt className="eyebrow">المقيّم</dt><dd className="mt-1 text-sm font-semibold">{sel.evaluator ? <>{sel.evaluator.name}<span className="block text-xs font-normal text-muted-foreground">{sel.evaluator.role}، {sel.evaluator.org}</span></> : 'لم يُقيَّم بعد'}</dd></div>
            </dl>
            {sel.state !== 'verified' && (
              <div className="mt-6 rounded-2xl border border-dashed p-4 text-sm">
                <p className="font-semibold">الطريق إلى «موثّقة»</p>
                <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
                  {[
                    ['اكتمل التقييم العملي', sel.evidence.some((e) => e.type === 'assessment' || e.type === 'hackathon')],
                    ['راجعها مقيّم مؤهل', sel.evidence.some((e) => e.type === 'professor-eval' || e.type === 'professional-eval')],
                    [`درجة ${VERIFY_RULE.minScore} فأكثر`, (sel.score ?? 0) >= VERIFY_RULE.minScore],
                    [`${VERIFY_RULE.minEvidence} أدلة مؤهلة فأكثر (${sel.evidence.filter((e) => e.type !== 'participation').length} حاليًا)`, sel.evidence.filter((e) => e.type !== 'participation').length >= VERIFY_RULE.minEvidence],
                  ].map(([l, ok]) => <li key={l as string} className={cn('flex items-center gap-2', ok ? 'text-[hsl(var(--oasis))]' : 'text-muted-foreground')}><span className={cn('h-2 w-2 rounded-full', ok ? 'bg-[hsl(var(--oasis))]' : 'border border-current')} />{l as string}</li>)}
                </ul>
              </div>
            )}
            <div className="mt-8 flex items-center justify-between"><p className="eyebrow">الأدلة والأعمال المقدمة ({sel.evidence.length})</p><button className="btn btn-ghost btn-sm" onClick={() => setAttach(true)} data-testid="button-passport-attach"><Paperclip className="h-3.5 w-3.5" /> إرفاق</button></div>
            <ul className="mt-3 space-y-2">{sel.evidence.map((e) => (
              <li key={e.id} className={cn('flex gap-3 rounded-xl border p-3', e.type === 'participation' && 'opacity-70')}>
                {e.type.endsWith('eval') ? <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--madder))]" /> : <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />}
                <div className="flex-1 text-sm"><p className="font-semibold">{e.title}</p><p className="text-xs text-muted-foreground">{EVIDENCE_LABEL[e.type]} · {e.source} · {fmtDate(e.date)}</p>{e.type === 'participation' && <p className="mt-1 text-[11px] text-[hsl(var(--madder))]">مشاركة فقط: تُحفظ كسياق ولا تُحتسب في التوثيق.</p>}</div>
                {e.url && <span className="inline-flex h-fit items-center gap-1 rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 font-mono text-[10px]"><ExternalLink className="h-3 w-3" />رابط</span>}
              </li>
            ))}</ul>
            {sel.evidence.length === 0 && <p className="mt-2 text-sm text-muted-foreground">لا توجد أدلة بعد.</p>}
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div><p className="eyebrow mb-3 flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> سجل التطور</p><ol className="space-y-2.5 border-s ps-4">{[...sel.history].reverse().map((h, i) => <li key={i} className="relative text-sm"><span className="absolute -start-[21px] top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />{h.note}<span className="block text-[11px] text-muted-foreground">{fmtDate(h.date)}</span></li>)}</ol></div>
              <div>
                <p className="eyebrow mb-3">مشاريع مرتبطة</p>
                {sel.projectIds.length ? <ul className="space-y-2">{sel.projectIds.map((pid) => { const p = st.projects.find((x) => x.id === pid); return p && <li key={pid}><Link href={`/projects/${pid}`} className="block rounded-xl border p-3 text-sm hover:bg-[hsl(var(--secondary)/.5)]"><span className="font-semibold">{p.title}</span><span className="block text-xs text-muted-foreground">{p.members.find((m) => m.studentId === 'me')?.role}</span></Link></li>; })}</ul> : <p className="text-sm text-muted-foreground">لا توجد مشاريع مرتبطة.</p>}
                <p className="eyebrow mb-3 mt-6 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5" /> توصيات للتحسين</p>
                <ul className="space-y-2">{sel.recommendations.slice(0, 4).map((r, i) => <li key={i} className="rounded-xl bg-[hsl(var(--saffron)/.12)] p-3 text-sm">{r}</li>)}</ul>
              </div>
            </div>
          </article>
        </div>
      )}
      {attach && sel && <AttachEvidence open skill={sel} onClose={() => setAttach(false)} />}
      {preview && <PublicPortfolio st={st} onClose={() => setPreview(false)} />}
      <div className="mt-6"><DemoNote>يتبع التوثيق هنا قواعد نَسْج التجريبية، وليس جهة اعتماد حقيقية</DemoNote></div>
    </>
  );
}

function CandidatePassport({ c, onClose }: { c: Candidate; onClose: () => void }) {
  return (
    <Modal open onClose={onClose} title={`جواز ${c.name}`} wide>
      <p className="text-sm text-muted-foreground">{c.major}، {c.university} · السنة {c.year} · {c.city} · يطمح إلى {c.target}</p>
      <p className="mt-2 text-sm"><span className="font-semibold">أبرز ما يميزه:</span> {c.highlight}</p>
      <ul className="mt-5 space-y-2">{[...c.skills].sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state)).map((s) => <li key={s.name} className="flex items-center gap-3 rounded-xl border p-3"><span className="flex-1"><span className="text-sm font-semibold">{s.name}</span><span className="block text-xs text-muted-foreground">{LEVELS[s.level]} · {catLabel(s.category)}</span></span><span className="font-mono text-sm">{s.score ?? 'غير متاح'}</span><StateBadge state={s.state} /></li>)}</ul>
    </Modal>
  );
}

function TalentExplorer() {
  const st = useDemo();
  const isCompany = st.role === 'company';
  const cands = useCandidates(st);
  const [q, setQ] = useState('');
  const [minState, setMinState] = useState<VState>('declared');
  const [onlyShort, setOnlyShort] = useState(false);
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [view, setView] = useState<Candidate | null>(null);
  const [contact, setContact] = useState<Candidate | null>(null);
  const [msg, setMsg] = useState('');
  const { toast } = useToast();
  const rank = (s: VState) => 3 - ORDER.indexOf(s);
  const list = cands.filter((c) => (!onlyShort || st.shortlist.includes(c.id)) && c.skills.some((s) => s.name.toLowerCase().includes(q.toLowerCase()) && rank(s.state) >= rank(minState)) || (q && c.name.toLowerCase().includes(q.toLowerCase())));
  const cmp = cands.filter((c) => compare.includes(c.id));
  const allSkills = Array.from(new Set(cmp.flatMap((c) => c.skills.map((s) => s.name))));
  return (
    <>
      <PageHeader eyebrow={isCompany ? 'اكتشاف المواهب' : 'تقدم الطلاب'} title={isCompany ? 'وظّف بالأدلة لا بالصفات' : 'تابع تطور المهارات'} desc={isCompany ? 'استكشف جوازات المهارات، وقارن المرشحين جنبًا إلى جنب، واختر قائمتك المختصرة بثقة.' : 'اعرف موقع كل طالب على سلّم التوثيق ومن يحتاج إلى دعم.'}
        actions={<button className="btn btn-primary" disabled={compare.length < 2} onClick={() => setShowCompare(true)} data-testid="button-compare"><GitCompare className="h-4 w-4" /> مقارنة ({compare.length})</button>} />
      <div className="panel mb-6 flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <label className="relative flex-1"><Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input className="field ps-9" value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث عن مهارة أو اسم، مثال: بحث تجربة المستخدم" aria-label="بحث" data-testid="input-talent-search" /></label>
        <select className="field md:w-56" value={minState} onChange={(e) => setMinState(e.target.value as VState)} aria-label="الحد الأدنى للتوثيق" data-testid="select-min-state">{(['declared', 'assessed', 'evaluated', 'verified'] as VState[]).map((s) => <option key={s} value={s}>على الأقل {STATE_META[s].label}</option>)}</select>
        {isCompany && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyShort} onChange={(e) => setOnlyShort(e.target.checked)} data-testid="checkbox-only-shortlist" /> القائمة المختصرة فقط</label>}
      </div>
      {list.length === 0 ? <Empty icon={Search} title="لا توجد جوازات مطابقة" body="خفّف مرشح التوثيق أو ابحث عن مهارة أخرى." /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((c, i) => {
          const sl = st.shortlist.includes(c.id);
          const v = c.skills.filter((s) => s.state === 'verified').length;
          const avg = c.skills.filter((s) => s.score).reduce((a, s, _, arr) => a + (s.score ?? 0) / arr.length, 0);
          return (
            <article key={c.id} className="panel lift rise flex flex-col p-5" style={{ animationDelay: `${i * 40}ms` }} data-testid={`card-candidate-${c.id}`}>
              <div className="flex items-center gap-3"><Initials name={c.name} size={44} tone={sl ? 'madder' : 'indigo'} /><div className="min-w-0"><h3 className="truncate font-semibold">{c.name}</h3><p className="truncate text-xs text-muted-foreground">{c.major} · {c.university}</p></div></div>
              <p className="mt-3 text-sm text-muted-foreground">{c.highlight}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">{c.skills.slice(0, 4).map((s) => <span key={s.name} className="inline-flex items-center gap-1"><StateBadge state={s.state} /><span className="text-xs">{s.name}</span></span>)}</div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-[hsl(var(--secondary)/.6)] p-2"><span className="font-display text-xl font-semibold">{v}</span> موثّقة</div><div className="rounded-xl bg-[hsl(var(--secondary)/.6)] p-2"><span className="font-display text-xl font-semibold">{Math.round(avg) || 'غير متاح'}</span> متوسط الدرجة</div></div>
              {!isCompany && <Meter value={avg} tone={avg < 70 ? 'saffron' : 'primary'} className="mt-3" />}
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => setView(c)} data-testid={`button-view-${c.id}`}><Eye className="h-3.5 w-3.5" /> الجواز</button>
                <label className="btn btn-ghost btn-sm cursor-pointer"><input type="checkbox" checked={compare.includes(c.id)} disabled={!compare.includes(c.id) && compare.length >= 3} onChange={(e) => setCompare(e.target.checked ? [...compare, c.id] : compare.filter((x) => x !== c.id))} data-testid={`checkbox-compare-${c.id}`} /> مقارنة</label>
                {isCompany && <button className={sl ? 'btn btn-accent btn-sm' : 'btn btn-ghost btn-sm'} onClick={() => { mutate((d) => { d.shortlist = sl ? d.shortlist.filter((x) => x !== c.id) : [...d.shortlist, c.id]; }); toast({ title: sl ? 'أُزيل من القائمة المختصرة' : 'أُضيف إلى القائمة المختصرة', description: c.name }); }} data-testid={`button-shortlist-${c.id}`}><Star className="h-3.5 w-3.5" />{sl ? 'في القائمة المختصرة' : 'إضافة للقائمة المختصرة'}</button>}
                {isCompany && <button className="btn btn-primary btn-sm" onClick={() => { setContact(c); setMsg(`مرحبًا ${c.name.split(' ')[0]}، اطلعنا على جوازك في نَسْج ونود الحديث معك عن فرصة تدريب في ${NAMES.company}.`); }} data-testid={`button-contact-${c.id}`}><Send className="h-3.5 w-3.5" /> تواصل</button>}
              </div>
              {isCompany && st.messages.filter((m) => m.candidateId === c.id).length > 0 && <p className="mt-2 text-[11px] text-muted-foreground">{st.messages.filter((m) => m.candidateId === c.id).length} رسائل تجريبية مرسلة</p>}
            </article>
          );
        })}</div>
      )}
      {view && <CandidatePassport c={view} onClose={() => setView(null)} />}
      <Modal open={showCompare} onClose={() => setShowCompare(false)} title="مقارنة المرشحين بالأدلة" wide>
        <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm">
          <thead><tr><th className="p-2 text-start eyebrow">المهارة</th>{cmp.map((c) => <th key={c.id} className="p-2 text-start"><span className="font-semibold">{c.name}</span><span className="block text-[11px] font-normal text-muted-foreground">{c.university}</span></th>)}</tr></thead>
          <tbody>{allSkills.map((sk) => <tr key={sk} className="border-t"><td className="p-2 font-medium">{sk}</td>{cmp.map((c) => { const s = c.skills.find((x) => x.name === sk); return <td key={c.id} className="p-2">{s ? <span className="flex items-center gap-2"><StateBadge state={s.state} /><span className="font-mono text-xs">{s.score ?? ''}</span></span> : <span className="text-muted-foreground">لا يوجد</span>}</td>; })}</tr>)}
            <tr className="border-t"><td className="p-2 font-semibold">إجمالي الموثّقة</td>{cmp.map((c) => <td key={c.id} className="p-2 font-display text-xl font-semibold text-[hsl(var(--madder))]">{c.skills.filter((s) => s.state === 'verified').length}</td>)}</tr>
          </tbody>
        </table></div>
      </Modal>
      <Modal open={!!contact} onClose={() => setContact(null)} title={`التواصل مع ${contact?.name ?? ''}`}>
        <p className="mb-3 rounded-xl bg-[hsl(var(--secondary))] p-3 text-xs">واجهة تجريبية: تُحفظ الرسالة في هذا المتصفح فقط ولا تُرسل أبدًا.</p>
        <Field label="الرسالة"><textarea className="field min-h-32" value={msg} onChange={(e) => setMsg(e.target.value)} data-testid="input-contact-message" /></Field>
        <button className="btn btn-primary mt-4 w-full" disabled={!msg.trim()} onClick={() => { mutate((d) => { d.messages.unshift({ id: newId('msg'), candidateId: contact!.id, text: msg, date: today() }); }); toast({ title: 'حُفظت كرسالة تجريبية', description: 'لم تُرسل أي رسالة حقيقية.' }); setContact(null); }} data-testid="button-send-message"><Send className="h-4 w-4" /> حفظ الرسالة التجريبية</button>
      </Modal>
      <div className="mt-6"><DemoNote>جميع المرشحين طلاب تجريبيون خياليون</DemoNote></div>
    </>
  );
}

export default function Passport() {
  const { role } = useDemo();
  const explorer = role === 'company' || role === 'professor';
  useMeta(explorer ? (role === 'company' ? 'اكتشاف المواهب' : 'تقدم الطلاب') : 'جواز المهارات', explorer ? 'استكشف جوازات المهارات المبنية على الأدلة، وقارن المرشحين واختر قائمتك المختصرة.' : 'ملف أدلتك: أربع حالات توثيق، وأدلة، ومقيّمون، وسجل، ومعاينة للملف العام.');
  return explorer ? <TalentExplorer /> : <StudentPassport />;
}
