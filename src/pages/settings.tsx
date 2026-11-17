import { useState } from 'react';
import { Link } from 'wouter';
import { RotateCcw, Compass } from 'lucide-react';
import { startTour } from '@/components/onboarding';
import { useDemo, useMeta, mutate, resetDemo } from '@/lib/store';
import { type Settings as S } from '@/lib/data';
import { PageHeader, Modal } from '@/components/kit';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

const TOGGLES: { key: keyof S; label: string; desc: string }[] = [
  { key: 'publicPortfolio', label: 'ملف أعمال عام', desc: 'السماح لمعاينة ملف الأعمال التجريبي بعرض مهاراتك المدعومة بالأدلة.' },
  { key: 'digest', label: 'ملخص أسبوعي', desc: 'تلخيص التحديات والملاحظات الجديدة (تجريبي فقط، لا تُرسل أي رسائل بريد).' },
  { key: 'nudges', label: 'تنبيهات التقدم', desc: 'عرض الخطوات التالية المقترحة في نظرتك العامة.' },
  { key: 'showArabic', label: 'إظهار الاسم البديل', desc: 'عرض اسمك البديل بجانب اسمك الأساسي عند اختلافهما.' },
  { key: 'reducedMotion', label: 'تقليل الحركة', desc: 'إيقاف حركات الظهور والانتقالات والمجسّم ثلاثي الأبعاد. يُحترم أيضًا إعداد جهازك تلقائيًا.' },
];

export default function Settings() {
  const { settings, role, skills } = useDemo();
  const [confirm, setConfirm] = useState(false);
  const { toast } = useToast();
  useMeta('الإعدادات', 'تفضيلات تجربتك في نسخة نَسْج التجريبية.');
  return (
    <>
      <PageHeader eyebrow="الإعدادات" title="التفضيلات" desc="تُحفظ في هذا المتصفح وتنطبق على جميع الأدوار التجريبية." />
      <div className="panel divide-y">
        {TOGGLES.map((t) => (
          <div key={t.key} className="flex items-center justify-between gap-4 p-5">
            <div><p className="font-semibold">{t.label}</p><p className="text-sm text-muted-foreground">{t.desc}</p></div>
            <Switch checked={settings[t.key] as boolean} onCheckedChange={(v) => mutate((d) => { (d.settings[t.key] as boolean) = v; })} aria-label={t.label} data-testid={`switch-${t.key}`} />
          </div>
        ))}
        <div className="flex items-center justify-between gap-4 p-5">
          <div><p className="font-semibold">هدف النشاط الأسبوعي</p><p className="text-sm text-muted-foreground">يظهر في مخطط نشاطك الأسبوعي.</p></div>
          <div className="flex items-center gap-3"><input type="range" min={2} max={20} value={settings.weeklyGoal} onChange={(e) => mutate((d) => { d.settings.weeklyGoal = Number(e.target.value); })} aria-label="الهدف الأسبوعي" data-testid="input-weekly-goal" /><span className="w-8 font-display text-xl font-semibold">{settings.weeklyGoal}</span></div>
        </div>
      </div>
      {role === 'student' && <div className="panel mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between" data-testid="section-goal-settings">
        <div><p className="font-semibold">أهداف تعلم المهارات</p><p className="text-sm text-muted-foreground">لديك {skills.filter((s) => s.goal).length} أهداف شخصية. حدّد لكل مهارة مستوى وموعدًا مستقلين عن هدف النشاط الأسبوعي. تُحفظ في هذا المتصفح فقط.</p></div>
        <Link href="/skills" className="btn btn-ghost" data-testid="link-manage-goals">إدارة أهداف المهارات</Link>
      </div>}
      <div className="panel mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-semibold">الجولة التعريفية</p><p className="text-sm text-muted-foreground">أعد جولة البداية الخاصة بدورك الحالي. ما تتأثر بياناتك.</p></div>
        <button className="btn btn-ghost" onClick={startTour} data-testid="button-replay-tour"><Compass className="h-4 w-4" /> أعد الجولة</button>
      </div>
      <div className="panel mt-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-semibold">إعادة ضبط البيانات التجريبية</p><p className="text-sm text-muted-foreground">إعادة كل الأدوار إلى الحالة التجريبية الأصلية. ستفقد تغييراتك.</p></div>
        <button className="btn btn-ghost text-[hsl(var(--destructive))]" onClick={() => setConfirm(true)} data-testid="button-reset-demo"><RotateCcw className="h-4 w-4" /> إعادة الضبط</button>
      </div>
      <Modal open={confirm} onClose={() => setConfirm(false)} title="إعادة ضبط كل البيانات التجريبية؟">
        <p className="text-sm text-muted-foreground">ستعود المهارات والتقديمات والتقييمات والتحديات والأنشطة والرسائل إلى حالتها الأولية، وستُحذف أهداف المهارات الشخصية.</p>
        <div className="mt-5 flex justify-end gap-2"><button className="btn btn-ghost" onClick={() => setConfirm(false)}>إلغاء</button><button className="btn btn-accent" onClick={() => { resetDemo(); localStorage.removeItem('nasj-saved'); setConfirm(false); toast({ title: 'تمت إعادة ضبط البيانات التجريبية' }); }} data-testid="button-confirm-reset">إعادة ضبط كل شيء</button></div>
      </Modal>
    </>
  );
}
