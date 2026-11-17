import type { ReactNode } from 'react';
import { Circle, ClipboardCheck, UserCheck, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { VState } from '@/lib/data';
import { cn } from '@/lib/utils';

export const STATE_META: Record<VState, { label: string; icon: LucideIcon; cls: string; meaning: string; step: number }> = {
  declared: { label: 'مُعلنة', icon: Circle, step: 0, cls: 'bg-transparent text-[hsl(var(--muted-foreground))] border border-dashed border-[hsl(var(--input))]', meaning: 'يدّعي الطالب هذه المهارة، ولم يُقيَّم أي دليل بعد.' },
  assessed: { label: 'مُختبرة', icon: ClipboardCheck, step: 1, cls: 'bg-[hsl(var(--saffron)/.18)] text-[hsl(var(--sand))] border border-[hsl(var(--saffron)/.5)]', meaning: 'اكتمل تقييم عملي أو مخرج هاكاثون.' },
  evaluated: { label: 'مُقيَّمة', icon: UserCheck, step: 2, cls: 'bg-[hsl(var(--primary)/.16)] text-[hsl(var(--lavender))] border border-[hsl(var(--primary)/.4)]', meaning: 'راجع أستاذ جامعي أو مختص مؤهل العمل وفق معايير تقييم.' },
  verified: { label: 'موثّقة', icon: ShieldCheck, step: 3, cls: 'bg-[hsl(var(--teal)/.16)] text-[hsl(var(--teal))] border border-[hsl(var(--teal)/.45)]', meaning: 'تقييم عملي وتقييم مختص ودرجة 70 فأكثر وثلاثة أدلة مؤهلة على الأقل.' },
};

export function StateBadge({ state, className }: { state: VState; className?: string }) {
  const m = STATE_META[state];
  const I = m.icon;
  return (
    <span title={m.meaning} data-testid={`badge-state-${state}`} className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', m.cls, className)}>
      <I className="h-3 w-3" aria-hidden /> {m.label}
    </span>
  );
}

export function StateLadder({ state }: { state: VState }) {
  const step = STATE_META[state].step;
  return (
    <div className="flex items-center gap-1" aria-label={`حالة التوثيق: ${STATE_META[state].label}`}>
      {(['declared', 'assessed', 'evaluated', 'verified'] as VState[]).map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <span className={cn('h-1.5 w-6 rounded-full transition-colors', i <= step ? (i === 3 ? 'bg-[hsl(var(--madder))]' : 'bg-[hsl(var(--primary))]') : 'bg-[hsl(var(--border))]')} />
        </div>
      ))}
    </div>
  );
}

export function PageHeader({ eyebrow, title, desc, actions }: { eyebrow: string; title: string; desc?: string; actions?: ReactNode }) {
  return (
    <header className="rise mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="font-display text-3xl font-semibold leading-tight md:text-[2.6rem]" data-testid="text-page-title">{title}</h1>
        {desc && <p className="mt-2 text-[15px] text-muted-foreground">{desc}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function Initials({ name, size = 36, tone = 'indigo' }: { name: string; size?: number; tone?: 'indigo' | 'madder' | 'saffron' | 'oasis' }) {
  const ini = name.replace(/^(Dr\.|د\.)\s*/i, '').split(/\s+/).filter((w) => w && w !== 'بن' && w !== 'bin').map((w) => w.replace(/^(Al-|ال)/, '')[0] ?? '').slice(0, 2).join('\u200c').toUpperCase();
  const bg = { indigo: 'bg-[hsl(var(--primary)/.22)] text-[hsl(var(--lavender))]', madder: 'bg-[hsl(var(--teal)/.18)] text-[hsl(var(--teal))]', saffron: 'bg-[hsl(var(--sand)/.18)] text-[hsl(var(--sand))]', oasis: 'bg-[hsl(var(--rose)/.18)] text-[hsl(var(--rose))]' }[tone];
  return <span aria-hidden className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', bg)} style={{ width: size, height: size, fontSize: size * 0.36 }}>{ini}</span>;
}

export function Meter({ value, tone = 'primary', className }: { value: number; tone?: 'primary' | 'madder' | 'saffron' | 'oasis'; className?: string }) {
  const c = { primary: 'bg-[hsl(var(--primary))]', madder: 'bg-[hsl(var(--madder))]', saffron: 'bg-[hsl(var(--saffron))]', oasis: 'bg-[hsl(var(--oasis))]' }[tone];
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[hsl(var(--secondary))]', className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn('h-full origin-right rounded-full transition-transform duration-700', c)} style={{ transform: `scaleX(${Math.min(100, Math.max(0, value)) / 100})` }} />
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone?: 'madder' | 'saffron' }) {
  return (
    <div className="panel lift p-4" data-testid={`stat-${label.replace(/\s+/g, '-')}`}>
      <p className="eyebrow">{label}</p>
      <p className={cn('num mt-2 text-[1.75rem] font-medium leading-tight', tone === 'madder' && 'text-[hsl(var(--teal))]', tone === 'saffron' && 'text-[hsl(var(--sand))]')}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Empty({ icon: I, title, body, action }: { icon: LucideIcon; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="panel weave-bg flex flex-col items-center justify-center px-6 py-12 text-center" data-testid="empty-state">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl tint-violet"><I className="h-6 w-6" /></span>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DemoNote({ children }: { children: ReactNode }) {
  return <p className="inline-flex items-center gap-2 rounded-full border border-dashed border-[hsl(var(--input))] px-3 py-1 text-[11px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--saffron))]" />{children}</p>;
}

/** Al-Sadu inspired woven band. Pure SVG, decorative. */
export function SaduBand({ className, height = 18 }: { className?: string; height?: number }) {
  return (
    <svg aria-hidden className={cn('w-full', className)} height={height} preserveAspectRatio="none">
      <defs>
        <pattern id="sadu" width="36" height="18" patternUnits="userSpaceOnUse">
          <rect width="36" height="18" fill="hsl(var(--indigo))" />
          <path d="M0 18 L9 0 L18 18 Z" fill="hsl(var(--madder))" />
          <path d="M18 0 L27 18 L36 0 Z" fill="hsl(var(--saffron))" />
          <path d="M9 9 L13.5 4.5 L18 9 L13.5 13.5 Z" fill="hsl(var(--lavender))" />
          <path d="M27 9 L31.5 4.5 L36 9 L31.5 13.5 Z" fill="hsl(var(--indigo))" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sadu)" />
    </svg>
  );
}

/** Threads motif: weave lines that represent evidence joining into a skill. */
export function ThreadMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 120 120" className={className} fill="none">
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${10 + i * 22} 0 C ${10 + i * 22} 50, 60 70, 60 120`} stroke={i % 2 ? 'hsl(var(--madder))' : 'hsl(var(--saffron))'} strokeWidth="2" strokeDasharray="400" style={{ animation: `draw 1.6s ${i * 0.12}s ease-out both`, ['--len' as string]: '400' }} />
      ))}
      <circle cx="60" cy="112" r="6" fill="hsl(var(--madder))" />
    </svg>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[hsl(224_41%_4%/.7)] p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div role="dialog" aria-modal aria-label={title} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === 'Escape' && onClose()}
        className={cn('panel rise max-h-[92dvh] w-full overflow-y-auto rounded-b-none p-6 sm:rounded-b-[1.1rem]', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose} data-testid="button-close-modal" aria-label="إغلاق">إغلاق</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (v: any) => void; items: { value: string; label: string; count?: number }[] }) {
  return (
    <div role="tablist" className="mb-6 inline-flex flex-wrap gap-1 rounded-full border bg-[hsl(var(--card))] p-1">
      {items.map((it) => (
        <button key={it.value} role="tab" aria-selected={value === it.value} onClick={() => onChange(it.value as T)} data-testid={`tab-${it.value}`}
          className={cn('rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors', value === it.value ? 'bg-[hsl(var(--primary)/.22)] text-[hsl(var(--lavender))]' : 'text-muted-foreground hover:text-foreground')}>
          {it.label}{it.count !== undefined && <span className="ms-1.5 opacity-70">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Bars({ values, labels, highlightLast = true }: { values: number[]; labels?: string[]; highlightLast?: boolean }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-28 items-end gap-1.5" role="img" aria-label={`قيم النشاط: ${values.join('، ')}`}>
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="relative flex w-full flex-1 items-end">
            <div title={`${v} أنشطة`} className={cn('w-full origin-bottom rounded-t-md transition-transform duration-700', highlightLast && i === values.length - 1 ? 'bg-[hsl(var(--madder))]' : 'bg-[hsl(var(--primary)/.75)]')} style={{ height: `${(v / max) * 100}%` }} />
          </div>
          {labels && <span className="font-mono text-[9px] text-muted-foreground">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}
