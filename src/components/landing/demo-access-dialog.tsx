import { useEffect, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import { LogoMark } from '../brand';

export type AccessMode = 'signin' | 'signup';

const COPY: Record<AccessMode, { title: string; body: string }> = {
  signup: { title: 'إنشاء حساب غير متاح بعد', body: 'نَسْج حاليًا نسخة تجريبية تعمل داخل متصفحك. لا يوجد تسجيل ولا حسابات حقيقية، ولا نطلب بريدًا أو كلمة مرور. يمكنك تجربة المنصة كاملة بملف طالبة تجريبي، وتبديل الدور في أي وقت.' },
  signin: { title: 'لا توجد حسابات لتسجيل الدخول', body: 'هذه النسخة لا تحفظ أي حساب على خادم. كل ما تفعله يُحفظ في هذا المتصفح فقط، ويمكن إعادة ضبطه من الإعدادات. ادخل مباشرة إلى النسخة التجريبية لمتابعة ما بدأته.' },
};

export function DemoAccessDialog({ mode, onClose, onEnter }: { mode: AccessMode | null; onClose: () => void; onEnter: () => void }) {
  const primary = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const prev = useRef<Element | null>(null);
  useEffect(() => {
    if (!mode) return;
    prev.current = document.activeElement;
    primary.current?.focus();
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && box.current) {
        const f = box.current.querySelectorAll<HTMLElement>('button');
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', h);
    return () => { document.removeEventListener('keydown', h); (prev.current as HTMLElement | null)?.focus?.(); };
  }, [mode, onClose]);
  if (!mode) return null;
  const c = COPY[mode];
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[hsl(224_41%_4%/.72)] backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div ref={box} dir="rtl" role="dialog" aria-modal aria-labelledby="demo-access-title" onClick={(e) => e.stopPropagation()}
        className="panel rise w-full max-w-md rounded-b-none p-6 sm:rounded-b-[1.15rem] sm:p-8" data-testid="dialog-demo-access">
        <div className="flex items-start justify-between gap-4">
          <LogoMark className="h-12 w-12" />
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground" aria-label="إغلاق" data-testid="button-close-demo-access"><X className="h-4 w-4" /></button>
        </div>
        <p className="eyebrow mt-6">نسخة تجريبية</p>
        <h2 id="demo-access-title" className="mt-1 font-ar-head text-2xl font-medium">{c.title}</h2>
        <p className="mt-3 text-sm leading-[1.9] text-muted-foreground">{c.body}</p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <button ref={primary} onClick={onEnter} className="btn btn-primary flex-1" data-testid="button-demo-access-enter">ادخل إلى النسخة التجريبية <ArrowLeft className="h-4 w-4" /></button>
          <button onClick={onClose} className="btn btn-ghost" data-testid="button-demo-access-cancel">ليس الآن</button>
        </div>
      </div>
    </div>
  );
}
