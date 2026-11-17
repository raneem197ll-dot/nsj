import type { DemoState } from './data';

export const CAREERS: Record<string, { skill: string; level: number; category: string }[]> = {
  'مصمم منتجات': [
    { skill: 'بحث تجربة المستخدم', level: 2, category: 'Design' },
    { skill: 'تصميم الواجهات (Figma)', level: 2, category: 'Design' },
    { skill: 'هندسة المعلومات', level: 2, category: 'Design' },
    { skill: 'تطوير الواجهات الأمامية (React)', level: 1, category: 'Technology' },
    { skill: 'تحليل البيانات (SQL)', level: 1, category: 'Data' },
    { skill: 'الخطابة والعرض', level: 1, category: 'Communication' },
  ],
  'محلل بيانات': [
    { skill: 'تحليل البيانات (SQL)', level: 2, category: 'Data' },
    { skill: 'Python للبيانات', level: 1, category: 'Data' },
    { skill: 'تصوير البيانات', level: 2, category: 'Data' },
    { skill: 'الخطابة والعرض', level: 1, category: 'Communication' },
  ],
  'مهندس واجهات أمامية': [
    { skill: 'تطوير الواجهات الأمامية (React)', level: 2, category: 'Technology' },
    { skill: 'تصميم الواجهات (Figma)', level: 1, category: 'Design' },
    { skill: 'أساسيات الأمن السيبراني', level: 0, category: 'Technology' },
  ],
  'مدير منتجات': [
    { skill: 'إدارة المشاريع', level: 2, category: 'Business' },
    { skill: 'بحث تجربة المستخدم', level: 1, category: 'Design' },
    { skill: 'تحليل البيانات (SQL)', level: 1, category: 'Data' },
    { skill: 'الخطابة والعرض', level: 2, category: 'Communication' },
  ],
};

export function gaps(st: DemoState) {
  const req = CAREERS[st.profile.target] ?? CAREERS['مصمم منتجات'];
  return req.map((r) => {
    const s = st.skills.find((x) => x.name === r.skill);
    const have = s ? s.level : -1;
    const verified = s?.state === 'verified';
    const readiness = Math.round(Math.min(1, ((have + 1) / (r.level + 1))) * (verified ? 100 : s?.state === 'evaluated' ? 85 : s?.state === 'assessed' ? 65 : s ? 35 : 0));
    return { ...r, have, state: s?.state, readiness, met: verified && have >= r.level };
  });
}
