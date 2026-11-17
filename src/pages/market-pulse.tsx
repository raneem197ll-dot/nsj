import { useState } from 'react';
import { Link } from 'wouter';
import { TrendingUp, Cpu, ArrowLeft, Activity } from 'lucide-react';
import { useDemo, useMeta } from '@/lib/store';
import { MARKET, CATEGORIES, LEVELS } from '@/lib/data';
import { PageHeader, Meter, Empty, DemoNote, StateBadge } from '@/components/kit';
import { cn } from '@/lib/utils';
import { catLabel, bandLabel } from '@/lib/i18n';

export default function MarketPulse() {
  const st = useDemo();
  const [industry, setIndustry] = useState('all');
  const [major, setMajor] = useState('all');
  const [cat, setCat] = useState('all');
  const [sort, setSort] = useState<'demand' | 'growth'>('demand');
  useMeta('نبض السوق', 'معلومات سوق تجريبية: المهارات الرائجة حسب القطاع والتخصص ومتطلبات الشركات والتقنيات الناشئة.');
  const rows = MARKET.skills.filter((s) => (industry === 'all' || s.industries.includes(industry)) && (major === 'all' || s.majors.includes(major)) && (cat === 'all' || s.category === cat)).sort((a, b) => (sort === 'demand' ? b.demand - a.demand : b.growth - a.growth));
  const bands = ['Core', 'Emerging', 'Stable'] as const;
  const mySkill = (n: string) => st.skills.find((s) => s.name === n);
  const suggestions = MARKET.skills.filter((m) => { const s = mySkill(m.name); return !s || s.state === 'declared' || s.state === 'assessed'; }).sort((a, b) => b.demand + b.growth - (a.demand + a.growth)).slice(0, 4);
  return (
    <>
      <PageHeader eyebrow="نبض السوق" title="ما يطلبه السوق هذا الموسم" desc="إشارات من متطلبات الشركات وموجزات التحديات ورؤى المختصين على نَسْج." actions={<DemoNote>بيانات تجريبية توضيحية، وليست إحصاءات عمل حقيقية</DemoNote>} />
      <div className="panel mb-6 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label><span className="label">القطاع</span><select className="field" value={industry} onChange={(e) => setIndustry(e.target.value)} data-testid="select-industry"><option value="all">الكل</option>{MARKET.industries.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label><span className="label">التخصص الجامعي</span><select className="field" value={major} onChange={(e) => setMajor(e.target.value)} data-testid="select-major"><option value="all">الكل</option>{MARKET.majors.map((x) => <option key={x}>{x}</option>)}</select></label>
        <label><span className="label">الفئة</span><select className="field" value={cat} onChange={(e) => setCat(e.target.value)} data-testid="select-category"><option value="all">الكل</option>{CATEGORIES.map((x) => <option key={x} value={x}>{catLabel(x)}</option>)}</select></label>
        <div><span className="label">الترتيب حسب</span><div className="flex gap-1">{(['demand', 'growth'] as const).map((s) => <button key={s} onClick={() => setSort(s)} className={cn('chip flex-1 justify-center py-2', sort === s && 'chip-on')} data-testid={`button-sort-${s}`}>{s === 'demand' ? 'مؤشر الطلب' : 'النمو'}</button>)}</div></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="panel p-6">
          <p className="eyebrow mb-4 flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> المهارات الرائجة ({rows.length})</p>
          {rows.length === 0 ? <Empty icon={Activity} title="لا توجد إشارات لهذا الاختيار" body="جرّب قطاعًا أو تخصصًا أوسع." /> : (
            <ol className="space-y-4">{rows.map((s, i) => { const mine = mySkill(s.name); return (
              <li key={s.name} className="rise grid grid-cols-[24px_1fr_auto] items-center gap-3" style={{ animationDelay: `${i * 30}ms` }} data-testid={`row-market-${i}`}>
                <span className="font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                <div><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{s.name}</span><span className="chip">{catLabel(s.category)}</span>{mine && <StateBadge state={mine.state} />}</div><Meter value={s.demand} tone={s.band === 'Emerging' ? 'madder' : 'primary'} /><p className="mt-1 text-[11px] text-muted-foreground">{s.industries.join(' · ')}</p></div>
                <div className="text-end"><p className="font-display text-xl font-semibold">{s.demand}</p><p dir="ltr" className="font-mono text-[11px] text-[hsl(var(--madder))]">+{s.growth}%</p></div>
              </li>); })}</ol>
          )}
        </section>
        <div className="space-y-6">
          <section className="panel p-6">
            <p className="eyebrow mb-3">فئات الطلب على المهارات</p>
            {bands.map((b) => { const xs = rows.filter((r) => r.band === b); return <div key={b} className="mb-4 last:mb-0"><p className="text-sm font-semibold">{bandLabel(b)} <span className="font-mono text-xs text-muted-foreground">{xs.length}</span></p><div className="mt-1 flex flex-wrap gap-1.5">{xs.map((x) => <span key={x.name} className={cn('chip', b === 'Emerging' && 'bg-[hsl(var(--madder)/.12)] text-[hsl(var(--madder))]')}>{x.name}</span>)}</div></div>; })}
          </section>
          <section className="panel bg-[hsl(var(--indigo))] p-6 text-[hsl(40_45%_96%)]">
            <p className="mb-3 flex items-center gap-1.5 font-mono text-[10.5px] opacity-60"><Cpu className="h-3.5 w-3.5" /> التقنيات الناشئة</p>
            <ul className="space-y-3">{MARKET.emerging.map((e) => <li key={e.name}><p className="font-semibold text-[hsl(var(--saffron))]">{e.name}</p><p className="text-sm opacity-75">{e.note}</p></li>)}</ul>
          </section>
        </div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6">
          <p className="eyebrow mb-3">متطلبات الشركات على نَسْج</p>
          <ul className="divide-y">{st.requirements.map((r) => <li key={r.id} className="py-3"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{r.skill}</span><span className="chip">{LEVELS[r.level]}</span></div><p className="text-xs text-muted-foreground">{r.org} · {r.competencies}</p></li>)}</ul>
        </section>
        <section className="panel p-6">
          <p className="eyebrow mb-3">المهارات حسب التخصص الجامعي</p>
          <div className="space-y-3">{MARKET.majors.map((m) => { const xs = MARKET.skills.filter((s) => s.majors.includes(m)).sort((a, b) => b.demand - a.demand).slice(0, 3); return <div key={m}><p className="text-sm font-semibold">{m}</p><p className="text-xs text-muted-foreground">{xs.map((x) => x.name).join(' · ')}</p></div>; })}</div>
        </section>
      </div>
      {st.role === 'student' && (
        <section className="mt-6 panel weave-bg p-6">
          <p className="eyebrow">تطوير مقترح لـ {st.profile.name.split(' ')[0]}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{suggestions.map((s) => <Link key={s.name} href="/learning-paths" className="lift rounded-2xl bg-[hsl(var(--card))] p-4" data-testid={`link-suggest-${s.name.replace(/\s+/g, '-')}`}><p className="font-semibold">{s.name}</p><p className="mt-1 text-xs text-muted-foreground">الطلب {s.demand} · <bdi dir="ltr">+{s.growth}%</bdi></p><span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[hsl(var(--primary))]">خطط لمسار <ArrowLeft className="h-3 w-3" /></span></Link>)}</div>
        </section>
      )}
    </>
  );
}
