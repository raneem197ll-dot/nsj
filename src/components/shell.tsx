import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Sparkles, Route as RouteIcon, ClipboardCheck, Target, Trophy, Users, HeartHandshake, MessagesSquare,
  FolderKanban, ShieldCheck, Activity, Newspaper, UserRound, Settings, Menu, X, GraduationCap, Building2, BriefcaseBusiness, Flag,
  type LucideIcon, ChevronsUpDown, LifeBuoy, Sparkle, Repeat2,
} from 'lucide-react';
import { useDemo, mutate } from '@/lib/store';
import { PERSONAS, type Role } from '@/lib/data';
import { Initials } from './kit';
import { Wordmark, showLanding } from './brand';
import { cn } from '@/lib/utils';
import { Onboarding, startTour } from './onboarding';

type NavItem = { href: string; label: string; icon: LucideIcon; tid?: string; group?: string };

export const NAV: Record<Role, NavItem[]> = {
  student: [
    { href: '/', label: 'نظرة عامة', icon: LayoutDashboard, group: 'الرئيسية' },
    { href: '/community', label: 'المجتمع', icon: Newspaper },
    { href: '/skills', label: 'مهاراتي', icon: Sparkles, group: 'تعلّمي وتدرّبي' },
    { href: '/learning-paths', label: 'مسارات التعلم', icon: RouteIcon },
    { href: '/assessments', label: 'تقييمات المهارات', icon: ClipboardCheck },
    { href: '/challenges', label: 'التحديات العملية', icon: Target },
    { href: '/hackathons', label: 'الهاكاثونات', icon: Trophy },
    { href: '/exchange', label: 'علّمني وأعلّمك', icon: Repeat2 },
    { href: '/projects', label: 'مشاريعي', icon: FolderKanban, group: 'خبراتي' },
    { href: '/clubs', label: 'الأندية والأنشطة', icon: Users },
    { href: '/volunteering', label: 'التطوع', icon: HeartHandshake },
    { href: '/mentorship', label: 'الإرشاد', icon: MessagesSquare },
    { href: '/passport', label: 'جواز المهارات', icon: ShieldCheck, group: 'الإثبات والسوق' },
    { href: '/market-pulse', label: 'نبض السوق', icon: Activity },
  ],
  professor: [
    { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/assessments', label: 'قائمة المراجعة', icon: ClipboardCheck },
    { href: '/learning-paths', label: 'المسارات المُشرف عليها', icon: RouteIcon },
    { href: '/challenges', label: 'المهام التعليمية', icon: Target },
    { href: '/community', label: 'المحتوى الأكاديمي', icon: Newspaper },
    { href: '/passport', label: 'تقدّم الطلاب', icon: ShieldCheck },
    { href: '/market-pulse', label: 'نبض السوق', icon: Activity },
  ],
  company: [
    { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/skills', label: 'متطلبات المهارات', icon: Sparkles },
    { href: '/challenges', label: 'التحديات', icon: Target },
    { href: '/passport', label: 'اكتشاف المواهب', icon: ShieldCheck },
    { href: '/market-pulse', label: 'نبض السوق', icon: Activity },
    { href: '/community', label: 'المجتمع', icon: Newspaper },
  ],
  professional: [
    { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/community', label: 'رؤى ودراسات حالة', icon: Newspaper },
    { href: '/mentorship', label: 'الإرشاد', icon: MessagesSquare },
    { href: '/assessments', label: 'مراجعات المشاريع', icon: ClipboardCheck },
    { href: '/learning-paths', label: 'المساهمة في المسارات', icon: RouteIcon },
    { href: '/market-pulse', label: 'نبض السوق', icon: Activity },
  ],
  club: [
    { href: '/', label: 'نظرة عامة', icon: LayoutDashboard },
    { href: '/clubs', label: 'الأنشطة', icon: Users },
    { href: '/projects', label: 'مشاريع الفرق', icon: FolderKanban },
    { href: '/hackathons', label: 'الهاكاثونات', icon: Trophy },
    { href: '/market-pulse', label: 'نبض السوق', icon: Activity },
    { href: '/community', label: 'المجتمع', icon: Newspaper },
  ],
};

export const ROLE_META: Record<Role, { label: string; icon: LucideIcon }> = {
  student: { label: 'طالب', icon: GraduationCap },
  professor: { label: 'أستاذ جامعي', icon: BriefcaseBusiness },
  company: { label: 'شركة', icon: Building2 },
  professional: { label: 'مختص من القطاع', icon: UserRound },
  club: { label: 'نادٍ طلابي', icon: Flag },
};

function RoleSwitcher({ onDone }: { onDone?: () => void }) {
  const { role, profile } = useDemo();
  const [open, setOpen] = useState(false);
  const [, nav] = useLocation();
  const p = PERSONAS[role];
  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} data-testid="button-role-switcher"
        className="flex w-full items-center gap-3 rounded-2xl bg-[hsl(var(--sidebar-accent))] p-2.5 text-start transition-colors hover:bg-[hsl(var(--sidebar-accent)/.8)]">
        <Initials name={role === 'student' ? profile.name : p.name} tone="saffron" size={34} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{role === 'student' ? profile.name : p.name}</span>
          <span className="block truncate text-[10.5px] opacity-60">تتصفح بصفة {ROLE_META[role].label}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 opacity-60" />
      </button>
      {open && (
        <div className="rise absolute bottom-full left-0 right-0 z-40 mb-2 rounded-2xl border border-[hsl(var(--sidebar-border))] bg-[hsl(var(--popover))] p-1.5 shadow-2xl" role="menu">
          <p className="px-2.5 pb-1 pt-1.5 text-[10.5px] opacity-50">تبديل الدور التجريبي</p>
          {(Object.keys(ROLE_META) as Role[]).map((r) => {
            const I = ROLE_META[r].icon;
            return (
              <button key={r} role="menuitem" data-testid={`button-role-${r}`}
                onClick={() => { mutate((d) => { d.role = r; }); setOpen(false); nav('/'); onDone?.(); }}
                className={cn('flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-start text-sm transition-colors hover:bg-[hsl(var(--sidebar-accent))]', r === role && 'bg-[hsl(var(--sidebar-accent))]')}>
                <I className="h-4 w-4 text-[hsl(var(--sidebar-primary))]" />
                <span className="flex-1"><span className="block font-semibold">{ROLE_META[r].label}</span><span className="block text-[11px] opacity-60">{PERSONAS[r].name}</span></span>
                {r === role && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SidebarBody({ onNav }: { onNav?: () => void }) {
  const { role } = useDemo();
  const [loc] = useLocation();
  const items = NAV[role];
  const isActive = (h: string) => (h === '/' ? loc === '/' : loc === h || loc.startsWith(h + '/'));
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-5 pt-6">
        <Link href="/" onClick={onNav} className="inline-flex rounded-lg" data-testid="link-home">
          <Wordmark />
        </Link>
        <p className="mt-2 text-[11px] leading-snug text-[hsl(var(--faint))]">مهارات تُنسج من الأدلة</p>
      </div>
      <div className="mx-5 h-px bg-white/[.06]" />
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="التنقل الرئيسي">
        <ul className="space-y-0.5">
          {items.map((it, idx) => {
            const I = it.icon;
            const active = isActive(it.href);
            return (
              <li key={it.href}>
                {it.group && <p className={cn('px-3 pb-1.5 text-[11px] font-semibold text-[hsl(var(--faint))]', idx === 0 ? 'pt-0.5' : 'pt-4')}>{it.group}</p>}
                <Link href={it.href} onClick={onNav} data-tour={it.href} data-testid={`link-nav-${it.href === '/' ? 'overview' : it.href.slice(1)}`}
                  className={cn('group flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors', active ? 'bg-[hsl(var(--primary)/.16)] font-semibold text-[hsl(var(--sidebar-accent-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-white/[.04] hover:text-[hsl(var(--foreground))]')}>
                  <I className={cn('h-4 w-4 transition-transform group-hover:scale-110', active && 'text-[hsl(var(--sidebar-primary))]')} />
                  {it.label}
                  {active && <span className="ms-auto h-4 w-0.5 rounded-full bg-[hsl(var(--sidebar-primary))]" />}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="my-4 h-px bg-white/[.06]" />
        <ul className="space-y-0.5">
          {[{ href: '/profile', label: 'الملف الشخصي', icon: UserRound }, { href: '/settings', label: 'الإعدادات', icon: Settings }].map((it) => (
            <li key={it.href}>
              <Link href={it.href} onClick={onNav} data-testid={`link-nav-${it.href.slice(1)}`} className={cn('flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] transition-colors', isActive(it.href) ? 'bg-[hsl(var(--primary)/.16)] font-semibold' : 'text-[hsl(var(--muted-foreground))] hover:bg-white/[.04] hover:text-[hsl(var(--foreground))]')}>
                <it.icon className="h-4 w-4" />{it.label}
              </Link>
            </li>
          ))}
          <li>
            <button onClick={() => { onNav?.(); startTour(); }} data-testid="button-help-tour" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-[13.5px] opacity-75 transition-colors hover:bg-[hsl(var(--sidebar-accent)/.55)] hover:opacity-100">
              <LifeBuoy className="h-4 w-4" />المساعدة: أعد الجولة
            </button>
          </li>
          <li>
            <button onClick={() => { onNav?.(); showLanding(); }} data-testid="button-replay-landing" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-start text-[13.5px] opacity-75 transition-colors hover:bg-white/[.04] hover:opacity-100">
              <Sparkle className="h-4 w-4" />عن نَسْج: الصفحة التعريفية
            </button>
          </li>
        </ul>
      </nav>
      <div className="p-3"><RoleSwitcher onDone={onNav} /></div>
    </div>
  );
}

function TopBar() {
  const { role } = useDemo();
  const [loc] = useLocation();
  const all = [...NAV[role], { href: '/profile', label: 'الملف الشخصي' }, { href: '/settings', label: 'الإعدادات' }];
  const cur = all.filter((n) => (n.href === '/' ? loc === '/' : loc === n.href || loc.startsWith(n.href + '/'))).sort((a, b) => b.href.length - a.href.length)[0];
  return (
    <div className="sticky top-0 z-20 hidden border-b border-white/[.06] bg-[hsl(var(--background)/.72)] backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-4 px-10 py-3">
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground"><span className="text-[hsl(var(--faint))]">{ROLE_META[role].label}</span><span aria-hidden className="text-[hsl(var(--faint))]">/</span><span className="text-foreground">{cur?.label ?? 'صفحة غير معروفة'}</span></p>
        <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--sand)/.25)] px-3 py-1 text-[11px] text-[hsl(var(--sand))]"><span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--sand))]" />نسخة تجريبية · بيانات توضيحية</span>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { settings } = useDemo();
  const [open, setOpen] = useState(false);
  const [loc] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [loc]);
  useEffect(() => { document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion); }, [settings.reducedMotion]);
  useEffect(() => { if (!open) return; const h = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false); document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h); }, [open]);
  return (
    <div className="min-h-[100dvh] overflow-x-clip bg-background">
      <a href="#main" data-tour-inert className="sr-only focus:not-sr-only focus:fixed focus:start-3 focus:top-3 focus:z-[60] focus:rounded-full focus:bg-[hsl(var(--primary))] focus:px-4 focus:py-2 focus:text-[hsl(var(--primary-foreground))]">تخطَّ إلى المحتوى</a>
      <aside data-tour-inert className="fixed inset-y-0 right-0 z-30 hidden w-[264px] border-l border-white/[.06] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] lg:block">
        <SidebarBody />
      </aside>
      <div data-tour-inert className="sticky top-0 z-30 flex items-center justify-between overflow-x-hidden border-b border-white/[.06] bg-[hsl(var(--background)/.72)] px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/" className="inline-flex"><Wordmark size="sm" /></Link>
        <div className="flex gap-2"><button className="btn btn-ghost btn-sm" onClick={startTour} aria-label="المساعدة وإعادة الجولة" data-testid="button-help-mobile"><LifeBuoy className="h-4 w-4" /></button><button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)} aria-label="فتح القائمة" data-testid="button-open-menu"><Menu className="h-4 w-4" /> القائمة</button></div>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal aria-label="التنقل">
          <div className="absolute inset-0 bg-[hsl(224_41%_4%/.7)] backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="rise absolute inset-y-0 right-0 w-[86%] max-w-[300px] bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
            <button className="absolute left-3 top-5 rounded-full p-2 hover:bg-[hsl(var(--sidebar-accent))]" onClick={() => setOpen(false)} aria-label="إغلاق القائمة"><X className="h-4 w-4" /></button>
            <SidebarBody onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <main id="main" tabIndex={-1} data-tour-inert className="outline-none lg:pr-[264px]">
        <TopBar />
        <div className="mx-auto max-w-[1240px] px-4 pb-20 pt-6 sm:px-6 md:pt-8 lg:px-10">{children}</div>
        <footer className="mx-auto max-w-[1240px] px-4 pb-10 sm:px-6 lg:px-10">
          <div className="mb-4 h-px bg-white/[.06]" /><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><Wordmark size="sm" /><p className="max-w-xl text-[11px] leading-relaxed text-[hsl(var(--faint))]">بيئة تجريبية لمنصة نَسْج. جميع الأشخاص والجهات والدرجات وأرقام السوق بيانات توضيحية محفوظة في هذا المتصفح فقط، ولا يجري أي توثيق حقيقي.</p></div>
        </footer>
      </main>
      <Onboarding />
    </div>
  );
}
