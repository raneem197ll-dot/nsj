import type { ReactNode } from 'react';

export const CAT_LABEL: Record<string, string> = {
  Design: 'التصميم', Technology: 'التقنية', Data: 'البيانات', Business: 'الأعمال', Communication: 'التواصل',
};
export const catLabel = (c: string) => CAT_LABEL[c] ?? c;

export const BAND_LABEL: Record<string, string> = { Core: 'أساسية', Emerging: 'ناشئة', Stable: 'مستقرة' };
export const bandLabel = (b: string) => BAND_LABEL[b] ?? b;

export const STATUS_LABEL: Record<string, string> = {
  open: 'مفتوح', closed: 'مغلق', completed: 'مكتمل', upcoming: 'قادم', registered: 'مسجّل',
  pending: 'بانتظار التقييم', evaluated: 'مُقيَّم', requested: 'مطلوب', confirmed: 'مؤكد',
};
export const statusLabel = (s: string) => STATUS_LABEL[s] ?? s;

export const PROJECT_KIND_LABEL: Record<string, string> = { hackathon: 'هاكاثون', club: 'نادٍ', course: 'مقرر', personal: 'شخصي' };
export const POST_KIND_LABEL: Record<string, string> = {
  insight: 'رؤية', 'case-study': 'دراسة حالة', tool: 'أداة', academic: 'محتوى أكاديمي', requirement: 'متطلب', resource: 'مصدر',
};
export const STEP_KIND_LABEL: Record<string, string> = {
  module: 'وحدة', exercise: 'تمرين', resource: 'مصدر', challenge: 'تحدٍ', mentorship: 'إرشاد', checkpoint: 'نقطة تحقق', final: 'مشروع نهائي',
};
export const SOURCE_LABEL: Record<string, string> = { challenge: 'تحدٍ', path: 'مسار تعلم', assessment: 'تقييم', project: 'مشروع' };
export const LOG_KIND_LABEL: Record<string, string> = {
  submission: 'تقديم', evaluation: 'تقييم', path: 'مسار', assessment: 'تقييم عملي', challenge: 'تحدٍ', club: 'نادٍ', mentorship: 'إرشاد', project: 'مشروع', volunteering: 'تطوع', community: 'مجتمع', hackathon: 'هاكاثون', profile: 'ملف شخصي', settings: 'إعدادات',
};
export const logKindLabel = (k: string) => LOG_KIND_LABEL[k] ?? k;

const NUM = new Intl.NumberFormat('ar-SA-u-nu-latn');
export const fmtNum = (n: number) => NUM.format(n);

/** Isolated left-to-right run for technical names, links and emails. */
export function Ltr({ children, className }: { children: ReactNode; className?: string }) {
  return <bdi dir="ltr" className={className}>{children}</bdi>;
}
