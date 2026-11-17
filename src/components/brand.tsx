import { cn } from '@/lib/utils';

/** Vector NASJ mark: two teal ribbons woven by a lavender diagonal into an N. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('shrink-0', className)} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <rect width="64" height="64" rx="14" fill="#141B2D" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" fill="none" stroke="rgba(255,255,255,0.08)" />
      <rect x="15" y="27" width="10" height="26" rx="5" fill="#2DD4BF" />
      <path d="M20 16 L44 41" stroke="#AA92D6" strokeWidth="10" strokeLinecap="round" />
      <rect x="39" y="11" width="10" height="42" rx="5" fill="#2DD4BF" />
    </svg>
  );
}

/** Wordmark: «نَسْج | NASJ» set in Reem Kufi. */
export function Wordmark({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
  const s = { sm: ['h-7 w-7', 'text-lg', 'text-[10px]'], md: ['h-9 w-9', 'text-[1.45rem]', 'text-[11px]'], lg: ['h-12 w-12', 'text-3xl', 'text-xs'] }[size];
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={s[0]} />
      <span className="inline-flex items-baseline gap-2 font-ar-head leading-none">
        <span className={cn(s[1], 'font-semibold text-[hsl(var(--foreground))]')}>نَسْج</span>
        <span aria-hidden className="text-[hsl(var(--faint))]">|</span>
        <span dir="ltr" className={cn(s[2], 'font-semibold tracking-[0.18em] text-[hsl(var(--lavender))]')}>NASJ</span>
      </span>
    </span>
  );
}

/** Small honest label for seed/demo values. */
export function DemoTag({ className }: { className?: string }) {
  return <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--sand)/.3)] bg-[hsl(var(--sand)/.08)] px-2 py-0.5 text-[10.5px] font-medium text-[hsl(var(--sand))]', className)}>بيانات توضيحية</span>;
}

/** Shared WebGL capability check (keeps three out of the main chunk). */
export function hasWebGL(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export const LANDING_EVENT = 'nasj:show-landing';
export function showLanding() { window.dispatchEvent(new Event(LANDING_EVENT)); }
