import type { ReactNode } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, Cell, LabelList, PieChart, Pie } from 'recharts';
import { Info } from 'lucide-react';
import { LEVELS, type VState } from '@/lib/data';
import { fmtDay, GRAIN_LABEL, type Bucket, type Grain } from '@/lib/analytics';
import { STATE_META } from './kit';
import { cn } from '@/lib/utils';

/** Calm dark chart palette. navy = primary ink (lavender on dark), warm = grid hairline. */
export const C = { navy: '#AA92D6', teal: '#5FBFAE', silver: '#D9B76E', warm: 'rgba(255,255,255,0.07)', tealLight: '#9FD8CD', navySoft: '#A7B0C2', rose: '#CC8DA6', violet: '#8264BE', muted: '#3A4560' };
const axisTick = { fill: '#A7B0C2', fontSize: 11, fontFamily: "'Geist Mono', 'Noto Kufi Arabic', monospace" };
const tipStyle = { background: '#1A2236', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, fontFamily: "'Geist', 'Noto Kufi Arabic', sans-serif", fontSize: 12, direction: 'rtl' as const, color: '#E8ECF4', boxShadow: '0 16px 32px -16px rgba(3,5,10,.7)' };

export function ChartCard({ eyebrow, title, desc, children, table, className, testid }: { eyebrow: string; title: string; desc?: ReactNode; children: ReactNode; table?: ReactNode; className?: string; testid?: string }) {
  return (
    <section className={cn('panel min-w-0 p-5 md:p-6', className)} data-testid={testid}>
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="font-display text-lg font-semibold leading-snug">{title}</h3>
      {desc && <p className="mt-1 text-xs text-muted-foreground">{desc}</p>}
      <div className="mt-4">{children}</div>
      {table && (
        <details className="group mt-3 rounded-xl border border-dashed px-3 py-2 text-xs">
          <summary className="cursor-pointer select-none font-semibold text-[hsl(var(--primary))]">عرض البيانات كجدول</summary>
          <div className="mt-2 overflow-x-auto">{table}</div>
        </details>
      )}
    </section>
  );
}

export function DataTable({ head, rows, caption }: { head: string[]; rows: (string | number)[][]; caption: string }) {
  return (
    <table className="w-full text-start text-xs">
      <caption className="sr-only">{caption}</caption>
      <thead><tr>{head.map((h) => <th key={h} scope="col" className="border-b py-1.5 text-start font-semibold">{h}</th>)}</tr></thead>
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-dashed py-1.5">{c}</td>)}</tr>)}</tbody>
    </table>
  );
}

export function EmptyChart({ title, body }: { title: string; body: string }) {
  return (
    <div className="weave-bg flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center" data-testid="empty-chart">
      <Info className="mb-2 h-5 w-5 text-[hsl(var(--madder))]" aria-hidden />
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">{body}</p>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full border bg-[hsl(var(--card))] p-1">
      {items.map((it) => (
        <button key={it.value} role="radio" aria-checked={value === it.value} onClick={() => onChange(it.value)} data-testid={`filter-${label}-${it.value}`}
          className={cn('rounded-full px-3 py-1 text-xs font-semibold transition-colors', value === it.value ? 'bg-[hsl(var(--primary)/.22)] text-[hsl(var(--lavender))]' : 'text-muted-foreground hover:text-foreground')}>{it.label}</button>
      ))}
    </div>
  );
}

/** Activity counts on a proportional time axis. */
export function ActivityChart({ data, grain, unit = 'سجل' }: { data: Bucket[]; grain: Grain; unit?: string }) {
  const g = GRAIN_LABEL[grain];
  const span = data.length > 1 ? data[1].t - data[0].t : 7 * 86_400_000;
  return (
    <div className="h-56" dir="ltr" role="img" aria-label={`العدد لكل ${g}: ${data.map((d) => `${d.label} ${d.count}`).join('، ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={C.warm} />
          <XAxis dataKey="t" type="number" scale="time" domain={[data[0]?.t - span / 2, (data[data.length - 1]?.t ?? 0) + span / 2]} reversed tick={axisTick} tickFormatter={(t: number) => data.find((d) => d.t === t)?.label ?? ''} ticks={data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d) => d.t)} />
          <YAxis orientation="right" allowDecimals={false} tick={axisTick} width={28} domain={[0, 'auto']} />
          <Tooltip cursor={{ fill: 'rgba(170,146,214,.08)' }} contentStyle={tipStyle} labelFormatter={(t: number) => (grain === 'week' ? `أسبوع يبدأ ${fmtDay(t)}` : `${g} ${data.find((d) => d.t === t)?.label ?? ''}`)} formatter={(v: number) => [`${v} ${unit}`, 'العدد']} />
          <Bar dataKey="count" fill={C.teal} radius={[5, 5, 0, 0]} maxBarSize={28} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProgressChart({ data }: { data: { t: number; readiness: number; learning: number }[] }) {
  return (
    <div className="h-56" dir="ltr" role="img" aria-label={`لقطات التقدم: ${data.map((d) => `${fmtDay(d.t)} جاهزية ${d.readiness}% تعلم ${d.learning}%`).join('، ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={C.warm} />
          <XAxis dataKey="t" type="number" scale="time" domain={['dataMin', 'dataMax']} reversed tick={axisTick} tickFormatter={(t: number) => fmtDay(t)} />
          <YAxis orientation="right" domain={[0, 100]} tick={axisTick} width={36} tickFormatter={(v: number) => `${v}%`} />
          <Tooltip contentStyle={tipStyle} labelFormatter={(t: number) => fmtDay(t)} formatter={(v: number, n: string) => [`${v}%`, n]} />
          <Legend wrapperStyle={{ fontFamily: 'Noto Kufi Arabic', fontSize: 11 }} />
          <Line type="stepAfter" dataKey="readiness" name="الجاهزية" stroke={C.teal} strokeWidth={2.5} dot={{ r: 3 }} isAnimationActive={false} />
          <Line type="stepAfter" dataKey="learning" name="تقدم التعلم" stroke={C.navy} strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, shape: 'square' } as never} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const lvl = (v: number) => (v <= 0 ? 'لم تبدأ' : LEVELS[v - 1] ?? String(v));
export function GapChart({ rows }: { rows: { skill: string; required: number; current: number }[] }) {
  return (
    <div style={{ height: Math.max(160, rows.length * 58 + 40) }} dir="ltr" role="img" aria-label={rows.map((r) => `${r.skill}: الحالي ${lvl(r.current)}، المطلوب ${lvl(r.required)}`).join('، ')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 8, left: 8, bottom: 0 }} barGap={2}>
          <CartesianGrid horizontal={false} stroke={C.warm} />
          <XAxis type="number" domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} reversed tick={axisTick} tickFormatter={lvl} />
          <YAxis type="category" dataKey="skill" orientation="right" width={130} tick={{ ...axisTick, fill: C.navy }} />
          <Tooltip contentStyle={tipStyle} formatter={(v: number, n: string) => [lvl(v), n]} cursor={{ fill: 'rgba(170,146,214,.06)' }} />
          <Legend wrapperStyle={{ fontFamily: 'Noto Kufi Arabic', fontSize: 11 }} />
          <Bar dataKey="current" name="مستواك الحالي" fill={C.teal} radius={[0, 4, 4, 0]} barSize={12} minPointSize={2} isAnimationActive={false} />
          <Bar dataKey="required" name="المطلوب مهنيًا" fill="rgba(217,183,110,0.22)" stroke={C.silver} strokeDasharray="3 2" radius={[0, 4, 4, 0]} barSize={12} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const STATE_FILL: Record<VState, string> = { declared: C.muted, assessed: C.silver, evaluated: C.navy, verified: C.teal };
/** Four mutually exclusive states = parts of a whole: donut with labeled counts. */
export function StateChart({ data }: { data: { state: VState; count: number }[] }) {
  const rows = data.map((d) => ({ ...d, name: STATE_META[d.state].label }));
  const total = rows.reduce((a, r) => a + r.count, 0);
  if (!total) return <EmptyChart title="ما فيه مهارات في هذا النطاق" body="أضف مهارة أو غيّر التصفية." />;
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative h-44" dir="ltr" role="img" aria-label={rows.map((r) => `${r.name} ${r.count} من ${total}`).join('، ')}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows.filter((r) => r.count > 0)} dataKey="count" nameKey="name" innerRadius="58%" outerRadius="92%" paddingAngle={2} stroke="#141A2B" strokeWidth={2} isAnimationActive={false}>
              {rows.filter((r) => r.count > 0).map((r) => <Cell key={r.state} fill={STATE_FILL[r.state]} />)}
            </Pie>
            <Tooltip contentStyle={tipStyle} formatter={(v: number, n: string) => [`${v} من ${total} مهارة`, n]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="font-display text-2xl font-semibold">{total}</span><span className="text-[10px] text-muted-foreground">مهارة</span></div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {rows.map((r) => (
          <li key={r.state} className="flex items-center gap-2">
            <span className="h-3 w-3 shrink-0 rounded-sm border border-white/10" style={{ background: STATE_FILL[r.state] }} aria-hidden />
            <span className="flex-1">{r.name}</span><span className="font-mono text-xs font-semibold">{r.count}</span><span className="w-10 text-end font-mono text-[11px] text-muted-foreground">{Math.round((r.count / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RubricChart({ data }: { data: { name: string; avg: number; n: number }[] }) {
  return (
    <div style={{ height: Math.max(150, data.length * 40 + 30) }} dir="ltr" role="img" aria-label={data.map((d) => `${d.name}: ${d.avg} من 5`).join('، ')}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 24, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={C.warm} />
          <XAxis type="number" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} reversed tick={axisTick} />
          <YAxis type="category" dataKey="name" orientation="right" width={130} tick={{ ...axisTick, fill: C.navy }} />
          <Tooltip contentStyle={tipStyle} formatter={(v: number, _n: string, p: { payload?: { n: number } }) => [`${v} من 5 (${p.payload?.n ?? 0} تقييم)`, 'متوسط الدرجة']} cursor={{ fill: 'rgba(170,146,214,.06)' }} />
          <Bar dataKey="avg" fill={C.navy} radius={[0, 4, 4, 0]} barSize={14} minPointSize={2} isAnimationActive={false}>
            <LabelList dataKey="avg" position="left" style={{ ...axisTick, fill: C.navy, fontWeight: 700 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
