import { useEffect, useState } from 'react';
import type { CandSkill, Candidate, VState } from './data';

/* ------------------------------------------------------------------ *
 * Shared matching engine for team building and skill exchange.
 * Every score is derived from the skills people actually hold:
 * level (0-3), verification state and assessed score.
 * ------------------------------------------------------------------ */

export const STATE_WEIGHT: Record<VState, number> = { declared: 0.35, assessed: 0.6, evaluated: 0.8, verified: 1 };
export const STATE_LABEL: Record<VState, string> = { declared: 'معلنة', assessed: 'مختبرة', evaluated: 'مقيّمة', verified: 'موثّقة' };
export const STATE_TONE: Record<VState, string> = { declared: '#6F7A90', assessed: '#D9B76E', evaluated: '#AA92D6', verified: '#5FBFAE' };

/** 0..1 strength of one skill: how deep it is and how well it is proven. */
export function strength(s: Pick<CandSkill, 'level' | 'state' | 'score'>) {
  const depth = (Math.min(3, Math.max(0, s.level)) + 1) / 4;
  const proof = STATE_WEIGHT[s.state] ?? 0.35;
  const score = typeof s.score === 'number' ? Math.min(100, Math.max(0, s.score)) / 100 : 0.7;
  return depth * proof * (0.55 + 0.45 * score);
}

export type Person = {
  id: string; name: string; university: string; major: string; year: number; city: string; target: string;
  skills: CandSkill[]; wants: string[]; mode: 'حضوري' | 'عن بُعد' | 'مرن'; weeklyHours: number; me?: boolean;
};

/** Extra demo peers so the matching has a real pool to work with (illustrative data). */
const POOL: Person[] = [
  { id: 'p-hessa', name: 'حصة الدوسري', university: 'جامعة الإمام عبدالرحمن بن فيصل', major: 'علوم الحاسب', year: 3, city: 'الدمام', target: 'مهندسة ذكاء اصطناعي', mode: 'عن بُعد', weeklyHours: 3,
    skills: [{ name: 'Python للبيانات', level: 2, state: 'verified', score: 89, category: 'Data' }, { name: 'تعلّم الآلة', level: 1, state: 'evaluated', score: 78, category: 'Data' }, { name: 'تحليل البيانات (SQL)', level: 2, state: 'evaluated', score: 82, category: 'Data' }],
    wants: ['تصميم الواجهات (Figma)', 'الخطابة والعرض'] },
  { id: 'p-turki', name: 'تركي العنزي', university: 'جامعة الملك سعود', major: 'هندسة البرمجيات', year: 4, city: 'الرياض', target: 'مطور واجهات أمامية', mode: 'حضوري', weeklyHours: 4,
    skills: [{ name: 'تطوير الواجهات الأمامية (React)', level: 3, state: 'verified', score: 92, category: 'Technology' }, { name: 'تكامل الواجهات البرمجية (API)', level: 2, state: 'evaluated', score: 80, category: 'Technology' }],
    wants: ['بحث تجربة المستخدم', 'تصميم الواجهات (Figma)'] },
  { id: 'p-shahad', name: 'شهد المالكي', university: 'جامعة الأميرة نورة بنت عبدالرحمن', major: 'التصميم الجرافيكي', year: 3, city: 'الرياض', target: 'مصممة هوية بصرية', mode: 'مرن', weeklyHours: 3,
    skills: [{ name: 'التصميم الجرافيكي', level: 3, state: 'verified', score: 90, category: 'Design' }, { name: 'الهوية البصرية', level: 2, state: 'evaluated', score: 85, category: 'Design' }, { name: 'الموشن جرافيك', level: 1, state: 'assessed', score: 74, category: 'Design' }],
    wants: ['تطوير الواجهات الأمامية (React)', 'تحليل البيانات (SQL)'] },
  { id: 'p-majed', name: 'ماجد الشمري', university: 'جامعة الملك عبدالعزيز', major: 'إدارة الأعمال', year: 4, city: 'جدة', target: 'مدير منتجات', mode: 'عن بُعد', weeklyHours: 2,
    skills: [{ name: 'الخطابة والعرض', level: 3, state: 'verified', score: 91, category: 'Communication' }, { name: 'أبحاث السوق', level: 2, state: 'evaluated', score: 79, category: 'Business' }, { name: 'نماذج الأعمال', level: 2, state: 'assessed', score: 76, category: 'Business' }],
    wants: ['بحث تجربة المستخدم', 'هندسة المعلومات'] },
  { id: 'p-razan', name: 'رزان الحربي', university: 'جامعة طيبة', major: 'نظم المعلومات', year: 2, city: 'المدينة المنورة', target: 'محللة بيانات', mode: 'عن بُعد', weeklyHours: 3,
    skills: [{ name: 'تصوير البيانات', level: 2, state: 'evaluated', score: 83, category: 'Data' }, { name: 'تحليل البيانات (SQL)', level: 1, state: 'assessed', score: 72, category: 'Data' }],
    wants: ['تصميم الواجهات (Figma)', 'إدارة المشاريع'] },
  { id: 'p-omar', name: 'عمر القرشي', university: 'جامعة الملك فهد للبترول والمعادن', major: 'هندسة الحاسب', year: 3, city: 'الظهران', target: 'مهندس سحابة', mode: 'مرن', weeklyHours: 4,
    skills: [{ name: 'تطوير الخلفيات (Python)', level: 2, state: 'verified', score: 87, category: 'Technology' }, { name: 'الحوسبة السحابية', level: 1, state: 'evaluated', score: 75, category: 'Technology' }],
    wants: ['الخطابة والعرض', 'تصميم الواجهات (Figma)'] },
  { id: 'p-dana', name: 'دانة السبيعي', university: 'جامعة الملك سعود', major: 'علم البيانات', year: 4, city: 'الرياض', target: 'عالمة بيانات', mode: 'حضوري', weeklyHours: 2,
    skills: [{ name: 'تعلّم الآلة', level: 2, state: 'verified', score: 88, category: 'Data' }, { name: 'معالجة اللغة العربية', level: 2, state: 'evaluated', score: 81, category: 'Data' }],
    wants: ['إدارة المشاريع', 'الخطابة والعرض'] },
];

/** What the original demo candidates would like to learn, inferred from their target roles. */
const CANDIDATE_WANTS: Record<string, string[]> = {
  'c-faisal': ['تصميم الواجهات (Figma)', 'الخطابة والعرض'],
  'c-lama': ['بحث تجربة المستخدم', 'تحليل البيانات (SQL)'],
  'c-abdulrahman': ['الخطابة والعرض', 'تصميم الواجهات (Figma)'],
  'c-noura': ['تطوير الواجهات الأمامية (React)', 'بحث تجربة المستخدم'],
  'c-yousef': ['بحث تجربة المستخدم', 'إدارة المشاريع'],
};

export function buildPeople(candidates: Candidate[]): Person[] {
  const fromData: Person[] = candidates.filter((c) => c.id !== 'me').map((c) => ({
    id: c.id, name: c.name, university: c.university, major: c.major, year: c.year, city: c.city, target: c.target, skills: c.skills,
    wants: CANDIDATE_WANTS[c.id] ?? [], mode: 'مرن', weeklyHours: 3,
  }));
  return [...fromData, ...POOL];
}

/* ---------------- hackathon teams ---------------- */
export const TEAM_ROLES = [
  { cat: 'Design', label: 'التصميم وتجربة المستخدم', color: '#AA92D6' },
  { cat: 'Technology', label: 'الهندسة والتطوير', color: '#5FBFAE' },
  { cat: 'Data', label: 'البيانات والذكاء الاصطناعي', color: '#7FAAD0' },
  { cat: 'Business', label: 'الأعمال والمنتج', color: '#D9B76E' },
  { cat: 'Communication', label: 'العرض والتواصل', color: '#CC8DA6' },
] as const;
export type RoleCat = (typeof TEAM_ROLES)[number]['cat'];

/** How much each hackathon needs each role (0..1). Unknown events weigh everything equally. */
export const HACK_NEEDS: Record<string, Partial<Record<RoleCat, number>>> = {
  'hk-2': { Data: 1, Technology: 1, Design: 0.8, Business: 0.6, Communication: 0.6 },
  'hk-3': { Design: 1, Business: 0.9, Data: 0.8, Technology: 0.7, Communication: 0.7 },
};
export const needsFor = (hackId: string): Record<RoleCat, number> => {
  const n = HACK_NEEDS[hackId] ?? {};
  return Object.fromEntries(TEAM_ROLES.map((r) => [r.cat, n[r.cat] ?? 0.8])) as Record<RoleCat, number>;
};

/** Coverage of a role by a team: probability that at least one strong thread holds it. */
export function coverage(team: Person[], cat: RoleCat) {
  let miss = 1;
  for (const p of team) for (const s of p.skills) if (s.category === cat) miss *= 1 - strength(s);
  return 1 - miss;
}

export function teamScore(team: Person[], needs: Record<RoleCat, number>) {
  const tot = TEAM_ROLES.reduce((a, r) => a + needs[r.cat], 0) || 1;
  return TEAM_ROLES.reduce((a, r) => a + needs[r.cat] * coverage(team, r.cat), 0) / tot;
}

export type Suggestion = { person: Person; gain: number; fit: number; role: (typeof TEAM_ROLES)[number]; best?: CandSkill };

export function suggestTeammates(team: Person[], pool: Person[], needs: Record<RoleCat, number>, limit = 6): Suggestion[] {
  const base = teamScore(team, needs);
  const inTeam = new Set(team.map((p) => p.id));
  return pool.filter((p) => !inTeam.has(p.id)).map((p) => {
    const gain = teamScore([...team, p], needs) - base;
    let role: (typeof TEAM_ROLES)[number] = TEAM_ROLES[0]; let roleGain = -1;
    for (const r of TEAM_ROLES) { const g = (coverage([...team, p], r.cat) - coverage(team, r.cat)) * needs[r.cat]; if (g > roleGain) { roleGain = g; role = r; } }
    const best = p.skills.filter((s) => s.category === role.cat).sort((a, b) => strength(b) - strength(a))[0];
    return { person: p, gain, fit: 0, role, best };
  }).sort((a, b) => b.gain - a.gain).slice(0, limit).map((s, _i, all) => ({ ...s, fit: Math.round(40 + 60 * (s.gain / Math.max(1e-6, all[0].gain))) }));
}

export function stateMix(team: Person[]) {
  const m: Record<VState, number> = { declared: 0, assessed: 0, evaluated: 0, verified: 0 };
  for (const p of team) for (const s of p.skills) m[s.state] += 1;
  return m;
}

/* ---------------- skill exchange ---------------- */
export const canTeach = (s: CandSkill) => s.level >= 1 && s.state !== 'declared';

export type Match = { person: Person; theyTeach: CandSkill[]; iTeach: string[]; score: number; mutual: boolean };

export function exchangeMatches(myTeach: string[], myLearn: string[], mySkills: CandSkill[], pool: Person[]): Match[] {
  const mine = new Map(mySkills.map((s) => [s.name, s]));
  return pool.map((p) => {
    const theyTeach = p.skills.filter((s) => canTeach(s) && myLearn.includes(s.name)).sort((a, b) => strength(b) - strength(a));
    const iTeach = myTeach.filter((n) => p.wants.includes(n));
    const give = theyTeach.length ? strength(theyTeach[0]) : 0;
    const take = iTeach.length ? Math.max(...iTeach.map((n) => (mine.get(n) ? strength(mine.get(n)!) : 0.3))) : 0;
    const mutual = theyTeach.length > 0 && iTeach.length > 0;
    const score = Math.round(100 * (mutual ? 0.35 + 0.65 * Math.sqrt(give * take) : 0.25 * give));
    return { person: p, theyTeach, iTeach, score: Math.min(98, score), mutual };
  }).filter((m) => m.theyTeach.length > 0).sort((a, b) => Number(b.mutual) - Number(a.mutual) || b.score - a.score);
}

/** Supply (can teach) vs demand (want to learn) per skill across the pool. */
export function exchangeMarket(pool: Person[], myLearn: string[], myTeach: string[]) {
  const names = new Set<string>([...myLearn, ...myTeach]);
  pool.forEach((p) => { p.wants.forEach((w) => names.add(w)); p.skills.filter(canTeach).forEach((s) => names.add(s.name)); });
  return [...names].map((n) => ({
    name: n,
    supply: pool.filter((p) => p.skills.some((s) => s.name === n && canTeach(s))).length + (myTeach.includes(n) ? 1 : 0),
    demand: pool.filter((p) => p.wants.includes(n)).length + (myLearn.includes(n) ? 1 : 0),
  })).filter((r) => r.supply + r.demand > 1).sort((a, b) => b.demand + b.supply - (a.demand + a.supply)).slice(0, 8);
}

export type PlanWeek = { n: number; title: string; me: string; them: string; done: boolean };
export type ExchangePlan = { id: string; peerId: string; peerName: string; iLearn: string; iTeach: string; startedAt: string; weeks: PlanWeek[] };

export function buildPlan(peer: Person, iLearn: string, iTeach: string): ExchangePlan {
  const first = peer.name.split(' ')[0];
  const W: [string, string, string][] = [
    ['تحديد المستوى والأهداف', `جلسة 45 دقيقة: ${first} يقيس مستواك في ${iLearn} وتتفقان على هدف واضح`, `تقيسين مستوى ${first} في ${iTeach} وتحددان ما يحتاجه`],
    ['الأساسيات', `تتعلمين المفاهيم الأساسية في ${iLearn} مع تمرين قصير`, `تشرحين أساسيات ${iTeach} بأمثلة من مشاريعك`],
    ['تطبيق موجّه', `تنفذين تمرينًا عمليًا في ${iLearn} وتراجعانه معًا`, `يطبّق ${first} تمرينًا في ${iTeach} وتعطينه ملاحظات`],
    ['مشروع مصغّر مشترك', `تبنيان مشروعًا صغيرًا يجمع ${iLearn} و${iTeach}`, 'كل واحد يقود الجزء الذي يتقنه ويشرح قراراته'],
    ['مراجعة متبادلة', `يراجع ${first} عملك في ${iLearn} وفق معايير مكتوبة`, `تراجعين عمل ${first} في ${iTeach} بالطريقة نفسها`],
    ['عرض الدليل', `ترفعين المشروع المصغّر كتقييم عملي في ${iLearn}`, `يرفع ${first} عمله في ${iTeach} للتقييم كذلك`],
  ];
  return {
    id: `ex-${peer.id}-${Date.now().toString(36)}`, peerId: peer.id, peerName: peer.name, iLearn, iTeach,
    startedAt: new Date().toISOString().slice(0, 10),
    weeks: W.map(([title, me, them], i) => ({ n: i + 1, title, me, them, done: false })),
  };
}

/* ---------------- small persisted state (kept outside the main demo schema) ---------------- */
export function useLocal<T>(key: string, init: () => T): [T, (fn: (v: T) => T) => void] {
  const [v, setV] = useState<T>(() => {
    try { const raw = localStorage.getItem(key); if (raw) return JSON.parse(raw) as T; } catch { /* storage blocked */ }
    return init();
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } }, [key, v]);
  return [v, (fn) => setV((cur) => fn(cur))];
}
