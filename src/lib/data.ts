export type Role = 'student' | 'professor' | 'company' | 'professional' | 'club';
export type VState = 'declared' | 'assessed' | 'evaluated' | 'verified';
export const LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'] as const;
export const PATH_LEVELS = ['مبتدئ', 'متوسط', 'متقدم', 'الجاهزية المهنية'] as const;
/** Machine category keys. Display with catLabel() from i18n. */
export const CATEGORIES = ['Design', 'Technology', 'Data', 'Business', 'Communication'] as const;

export type EvidenceType =
  | 'project-link' | 'work-sample' | 'assessment' | 'hackathon' | 'professor-eval'
  | 'professional-eval' | 'certificate' | 'responsibility' | 'participation';

export const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  'project-link': 'رابط مشروع',
  'work-sample': 'نموذج عمل مرفوع',
  assessment: 'نتيجة تقييم عملي',
  hackathon: 'مخرج هاكاثون',
  'professor-eval': 'تقييم أستاذ جامعي',
  'professional-eval': 'تقييم مختص من القطاع',
  certificate: 'شهادة موثقة',
  responsibility: 'مسؤولية موثقة',
  participation: 'شهادة مشاركة',
};

export interface Evidence { id: string; type: EvidenceType; title: string; source: string; date: string; url?: string }
export interface HistoryEntry { date: string; note: string }
export interface Evaluator { name: string; role: string; org: string }
/** Personal planning only; never evidence or a verification requirement. */
export interface SkillGoal { targetLevel: number; deadline: string }
export interface Skill {
  id: string; name: string; category: string; level: number; score?: number; state: VState;
  evidence: Evidence[]; history: HistoryEntry[]; evaluator?: Evaluator; assessedAt?: string;
  projectIds: string[]; recommendations: string[]; developing: boolean;
  goal?: SkillGoal;
}

export type StepKind = 'module' | 'exercise' | 'resource' | 'challenge' | 'mentorship' | 'checkpoint' | 'final';
export interface Step { id: string; kind: StepKind; title: string; detail: string; level: number; done: boolean; known?: boolean; evidence?: string; contributor?: string }
export interface LearningPath {
  id: string; track: string; title: string; skillName: string; category: string;
  currentLevel: number; targetLevel: number; placementScore: number; steps: Step[];
  supervisor: string; industryMentor: string; companyPartner: string; startedAt: string; completedAt?: string;
}

export interface Criterion { name: string; weight: number; description: string }
export interface Challenge {
  id: string; title: string; org: string; orgKind: 'company' | 'professor'; description: string; skill: string; category: string;
  proficiency: number; deliverables: string[]; duration: string; rubric: Criterion[]; requirements: string[];
  status: 'open' | 'closed'; applicants: number; deadline: string; createdAt: string;
  /** Opportunity type. Missing means a skills challenge. */
  kind?: 'challenge' | 'job' | 'project'; jobTitle?: string; budget?: number;
}
export interface Submission {
  id: string; source: 'challenge' | 'path' | 'assessment' | 'project'; refId: string; title: string; skill: string;
  studentId: string; studentName: string; link: string; notes: string; submittedAt: string;
  status: 'pending' | 'evaluated'; rubric: Criterion[]; scores?: Record<string, number>; feedback?: string;
  evaluator?: Evaluator; evaluatorRole?: 'professor' | 'professional'; result?: number;
}
export interface Member {
  studentId: string; name: string; role: string; responsibilities: string[]; tasks: string[];
  skills: string[]; tools: string[]; contribution: string; share: number;
}
export interface Project {
  id: string; title: string; kind: 'hackathon' | 'club' | 'course' | 'personal'; context: string; challenge: string; summary: string;
  team: string; members: Member[]; deliverables: string[]; mentorFeedback: string; judgeEvaluation: string; result: string; date: string;
}
export interface Hackathon { id: string; name: string; organizer: string; city: string; date: string; theme: string; projectId?: string; status: 'completed' | 'upcoming' | 'registered' }
export interface Assignment { person: string; studentId: string; role: string; tasks: string; skills: string[]; evidence?: string; recorded: boolean }
export interface Activity {
  id: string; club: string; title: string; type: string; date: string; location: string; description: string; skills: string[];
  capacity: number; registered: string[]; status: 'open' | 'closed' | 'completed'; assignments: Assignment[];
}
export interface Volunteer { id: string; org: string; title: string; hours: number; date: string; responsibilities: string; skills: string[]; confirmed: boolean }
export interface Mentor { id: string; name: string; title: string; org: string; years: number; expertise: string[]; slots: string[]; bio: string }
export interface Booking { id: string; mentorId: string; slot: string; topic: string; status: 'requested' | 'confirmed' | 'completed'; notes?: string }
export interface Post {
  id: string; author: string; authorRole: Role; org: string;
  kind: 'insight' | 'case-study' | 'tool' | 'academic' | 'requirement' | 'resource';
  title: string; body: string; tags: string[]; date: string; saves: number;
}
export interface Requirement { id: string; org: string; skill: string; category: string; level: number; competencies: string; criteria: string; date: string }
export interface CandSkill { name: string; level: number; state: VState; score?: number; category: string }
export interface Candidate { id: string; name: string; university: string; major: string; year: number; target: string; city: string; skills: CandSkill[]; highlight: string }
export interface Message { id: string; candidateId: string; text: string; date: string }
export interface LogItem { date: string; label: string; kind: string }

export interface StudentProfile { name: string; arabicName: string; university: string; major: string; year: number; city: string; target: string; interests: string[]; bio: string }
export interface Settings { weeklyGoal: number; digest: boolean; publicPortfolio: boolean; reducedMotion: boolean; showArabic: boolean; nudges: boolean }

export interface DemoState {
  version: number; role: Role; profile: StudentProfile; settings: Settings;
  analytics?: import('./telemetry').AnalyticsLedger;
  skills: Skill[]; paths: LearningPath[]; challenges: Challenge[]; submissions: Submission[];
  projects: Project[]; hackathons: Hackathon[]; activities: Activity[]; volunteering: Volunteer[];
  mentors: Mentor[]; bookings: Booking[]; posts: Post[]; requirements: Requirement[];
  candidates: Candidate[]; shortlist: string[]; messages: Message[]; log: LogItem[]; weekly: number[];
  /** Set once the stored state has been localized to Arabic. */
  locale?: 'ar';
}

/** Canonical names of demo personas and organizations used in comparisons. */
export const NAMES = {
  company: 'طيف الرقمية',
  professor: 'د. حصة المطيري',
  professional: 'ماجد السلمي',
  club: 'نادي المنتج والتصميم',
  clubFull: 'نادي المنتج والتصميم، جامعة الملك سعود',
  ksu: 'جامعة الملك سعود',
};

export const PERSONAS: Record<Role, { name: string; title: string; org: string; initials: string }> = {
  student: { name: 'نور القحطاني', title: 'نظم المعلومات، السنة الثالثة', org: 'جامعة الملك سعود', initials: 'NQ' },
  professor: { name: 'د. حصة المطيري', title: 'أستاذ مشارك، التفاعل بين الإنسان والحاسب', org: 'جامعة الملك سعود', initials: 'HM' },
  company: { name: 'طيف الرقمية', title: 'خالد العمري، مسؤول التوظيف', org: 'الرياض، استوديو منتجات تقنية مالية', initials: 'TD' },
  professional: { name: 'ماجد السلمي', title: 'قائد تصميم المنتجات، 9 سنوات', org: 'قمة الصحية', initials: 'MS' },
  club: { name: 'نادي المنتج والتصميم', title: 'منظمة طلابية', org: 'جامعة الملك سعود', initials: 'PD' },
};

const d = (s: string) => s;

const crit = (n: string, w: number, desc: string): Criterion => ({ name: n, weight: w, description: desc });
const UX_RUBRIC = [crit('صياغة المشكلة', 25, 'يعرّف مشكلة المستخدم بالأدلة'), crit('دقة البحث', 25, 'الأساليب تناسب السؤال والعينة مبررة'), crit('جودة التصميم', 30, 'الوضوح والتسلسل البصري وإمكانية الوصول'), crit('التواصل', 20, 'المبررات واضحة وموجزة')];

export const TRACKS: Record<string, { skill: string; category: string; blurb: string; quiz: { q: string; options: string[]; answer: number }[]; steps: Omit<Step, 'id' | 'done'>[] }> = {
  'graphic-design': {
    skill: 'التصميم الجرافيكي', category: 'Design', blurb: 'من أساسيات التصميم البصري إلى نظام هوية تعتمده وكالة في الرياض.',
    quiz: [
      { q: 'عنوان الملصق ينافس التاريخ على انتباه القارئ. ما أول حل؟', options: ['إضافة ظل للعنوان', 'إيجاد تباين في الحجم والوزن بين العنصرين', 'توحيد لون العنصرين'], answer: 1 },
      { q: 'النص العربي واللاتيني في التصميم نفسه يبدوان غير متناسقين. أقوى خطوة هي:', options: ['اختيار خطوط متقاربة في الارتفاع السيني وتباين الضربات', 'استخدام حجم الخط نفسه للاثنين', 'جعل النص اللاتيني مائلًا'], answer: 0 },
      { q: 'يجب أن يعمل الشعار كأيقونة موقع بحجم 16 بكسل. عليك أن:', options: ['تحتفظ بكل التفاصيل وتصغّره', 'تجهّز نسخة مبسطة من العلامة', 'تستخدم الاسم النصي فقط'], answer: 1 },
      { q: 'عند تسليم لون الهوية للطباعة والشاشة، تسلّم:', options: ['قيمة HEX واحدة', 'قيم CMYK وRGB/HEX ومرجع Pantone', 'لقطة شاشة'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'التسلسل البصري والشبكات', detail: 'الحجم والوزن والمحاذاة وشبكة الأعمدة الاثني عشر.', level: 0 },
      { kind: 'exercise', title: 'إعادة تكوين ملصق فعالية مزدحم', detail: 'قدّم نسختين مع توثيق المبررات.', level: 0, evidence: 'ملفات PDF للملصق قبل وبعد' },
      { kind: 'module', title: 'الطباعة ثنائية اللغة', detail: 'المزاوجة بين الخطوط العربية واللاتينية بإيقاع متناسق.', level: 1 },
      { kind: 'resource', title: 'قراءة: تشريح الحرف العربي', detail: 'مجموعة مراجع منتقاة من كلية التصميم.', level: 1 },
      { kind: 'checkpoint', title: 'نقطة تحقق: النظام الطباعي', detail: 'اختبار عملي محدد بوقت، يُراجع وفق معيار من أربع نقاط.', level: 1, evidence: 'نتيجة التقييم' },
      { kind: 'challenge', title: 'تحدي شركة: التصميم الرئيسي لحملة طيف الرقمية', detail: 'موجز حقيقي بمخرجات ومعايير تقييم.', level: 2, evidence: 'التصميم الرئيسي مع المبررات' },
      { kind: 'mentorship', title: 'مراجعة ملف الأعمال مع مصمم ممارس', detail: 'مراجعة لمدة 45 دقيقة لأقوى أعمالك.', level: 2 },
      { kind: 'module', title: 'أنظمة الهوية والأدلة الإرشادية', detail: 'الرموز التصميمية وقواعد الاستخدام والتسليم للإنتاج.', level: 3 },
      { kind: 'final', title: 'المشروع النهائي: هوية بصرية لشركة سعودية ناشئة', detail: 'مجموعة الشعار ودليل الهوية وثلاثة تطبيقات. يقيّمه أستاذ جامعي ومختص من القطاع.', level: 3, evidence: 'دليل الهوية PDF مع رابط دراسة الحالة' },
    ],
  },
  'data-analysis': {
    skill: 'تحليل البيانات (SQL)', category: 'Data', blurb: 'استعلم عن البيانات ونظّفها واشرحها كما يتوقع فريق التحليل.',
    quiz: [
      { q: 'تحتاج إجمالي الطلبات لكل مدينة. أي عبارة تجمّع الصفوف؟', options: ['ORDER BY', 'GROUP BY', 'WHERE'], answer: 1 },
      { q: 'عملية ربط ضاعفت إجمالي الإيرادات. السبب الأرجح:', options: ['ربط واحد لمتعدد كرر الصفوف', 'قاعدة البيانات بطيئة', 'اسم مستعار خاطئ للعمود'], answer: 0 },
      { q: 'التصفية على قيمة مجمّعة تستخدم:', options: ['WHERE', 'HAVING', 'LIMIT'], answer: 1 },
      { q: 'يسأل أصحاب المصلحة: لماذا انخفضت المبيعات في جدة؟ أول خطوة:', options: ['بناء لوحة معلومات', 'تحديد المقياس وفترة المقارنة', 'تشغيل انحدار إحصائي'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'التفكير العلائقي وجملة SELECT', detail: 'الجداول والمفاتيح والتصفية والترتيب.', level: 0 },
      { kind: 'exercise', title: 'الاستعلام عن بيانات متاجر تجزئة في الرياض', detail: '12 استعلامًا مصححًا على بيانات تجريبية.', level: 0, evidence: 'دفتر الاستعلامات' },
      { kind: 'module', title: 'الربط والتجميع', detail: 'GROUP BY وHAVING ومزالق الربط.', level: 1 },
      { kind: 'checkpoint', title: 'نقطة تحقق: SQL التحليلي', detail: 'اختبار عملي بمعايير تقييم.', level: 1, evidence: 'نتيجة التقييم' },
      { kind: 'mentorship', title: 'جلسة مع محللة بيانات', detail: 'كيف يُراجع التحليل في بيئة العمل.', level: 2 },
      { kind: 'challenge', title: 'تحدي شركة: سؤال التسرب لدى مختبرات وادي البيانات', detail: 'أجب عن سؤال أعمال حقيقي بالأدلة.', level: 2, evidence: 'مذكرة تحليلية' },
      { kind: 'final', title: 'المشروع النهائي: تقرير تحليلي متكامل', detail: 'السؤال والمنهج والاستعلامات والنتائج والقيود.', level: 3, evidence: 'التقرير مع رابط المستودع' },
    ],
  },
  'project-management': {
    skill: 'إدارة المشاريع', category: 'Business', blurb: 'خطط للمشاريع وأدرها وأغلقها بنتائج موثقة.',
    quiz: [
      { q: 'لديك فعالية بعد 6 أسابيع و9 متطوعين. أول مخرج تعدّه:', options: ['ملصق', 'النطاق وهيكل تجزئة العمل', 'مجموعة واتساب'], answer: 1 },
      { q: 'مورّد تأخر. الممارسة الجيدة هي:', options: ['الانتظار والأمل', 'تسجيل الخطر وتقدير أثره وتفعيل البديل', 'إلغاء الفعالية'], answer: 1 },
      { q: 'مصفوفة RACI توضح:', options: ['الميزانية', 'من المسؤول والمحاسب والمستشار والمُبلَّغ', 'الجدول الزمني'], answer: 1 },
      { q: 'بعد التسليم يجب أن تُعد:', options: ['لا شيء', 'مراجعة ختامية بالمقاييس والدروس المستفادة', 'منشور شكر فقط'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'النطاق وأصحاب المصلحة وهيكل تجزئة العمل', detail: 'تحويل الفكرة إلى خطة.', level: 0 },
      { kind: 'exercise', title: 'خطط لورشة عمل في النادي', detail: 'هيكل تجزئة العمل والجدول الزمني ومصفوفة RACI.', level: 0, evidence: 'وثيقة الخطة' },
      { kind: 'module', title: 'إدارة المخاطر والتغيير', detail: 'سجلات مخاطر تُستخدم فعلًا.', level: 1 },
      { kind: 'checkpoint', title: 'نقطة تحقق: محاكاة سيناريو', detail: 'تعامل مع ثلاث مشكلات متصاعدة.', level: 1, evidence: 'نتيجة التقييم' },
      { kind: 'challenge', title: 'قيادة نشاط حقيقي في النادي', detail: 'مسؤوليات موثقة يسجلها النادي.', level: 2, evidence: 'مسؤوليات سجلها النادي' },
      { kind: 'final', title: 'المشروع النهائي: مراجعة ختامية للتسليم', detail: 'المقاييس والقرارات والدروس وآراء أصحاب المصلحة.', level: 3, evidence: 'تقرير المراجعة الختامية' },
    ],
  },
  'frontend': {
    skill: 'تطوير الواجهات الأمامية (React)', category: 'Technology', blurb: 'ابنِ واجهات سهلة الوصول تصمد في بيئة الإنتاج.',
    quiz: [
      { q: 'قائمة تعيد العرض ببطء. أول ما تتحقق منه:', options: ['ثبات المفاتيح والحالة غير الضرورية', 'تغيير إطار العمل', 'إضافة مزيد من CSS'], answer: 0 },
      { q: 'زر يحتوي أيقونة فقط يحتاج إلى:', options: ['تلميح فقط', 'تسمية يمكن الوصول إليها', 'أيقونة أكبر'], answer: 1 },
      { q: 'أفضل طريقة لدعم الاتجاه من اليمين لليسار للعربية:', options: ['خصائص CSS المنطقية', 'عكس الصور فقط', 'قاعدة شيفرة منفصلة'], answer: 0 },
      { q: 'أفضل طريقة لتخزين بيانات الخادم مؤقتًا في React:', options: ['متغيرات عامة', 'مكتبة ذاكرة مؤقتة للاستعلامات', 'localStorage في كل مكان'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'المكونات والخصائص والحالة', detail: 'التفكير بالمكونات.', level: 0 },
      { kind: 'exercise', title: 'بناء نموذج ثنائي اللغة', detail: 'التحقق من المدخلات واتجاه RTL ورسائل خطأ سهلة الوصول.', level: 0, evidence: 'رابط المستودع' },
      { kind: 'module', title: 'جلب البيانات والتخزين المؤقت', detail: 'حالات التحميل والخطأ والفراغ.', level: 1 },
      { kind: 'checkpoint', title: 'نقطة تحقق: مراجعة المكونات', detail: 'مراجعة شيفرة وفق معايير التقييم.', level: 1, evidence: 'نتيجة التقييم' },
      { kind: 'mentorship', title: 'مراجعة شيفرة مع قائد واجهات أمامية', detail: 'توقعات بيئة الإنتاج.', level: 2 },
      { kind: 'challenge', title: 'تحدي شركة: عنصر لوحة معلومات سهل الوصول', detail: 'سلّم مكونًا مطابقًا للمواصفات.', level: 2, evidence: 'رابط عرض منشور' },
      { kind: 'module', title: 'الأداء والاختبار', detail: 'تحليل الأداء والاختبارات وأساسيات التكامل المستمر.', level: 3 },
      { kind: 'final', title: 'المشروع النهائي: ميزة جاهزة للإنتاج', detail: 'ميزة مع اختبارات وتوثيق وملاحظات مراجعة.', level: 3, evidence: 'المستودع مع ملاحظات المراجعة' },
    ],
  },
};

let n = 0;
const id = (p: string) => `${p}-${++n}`;

function buildSteps(track: string, current: number, target: number, doneUpTo = -1): Step[] {
  const t = TRACKS[track];
  return t.steps.filter((s) => s.level <= target).map((s, i) => ({
    ...s, id: `${track}-s${i}`, known: s.level < current, done: s.level < current || i <= doneUpTo,
  }));
}
export { buildSteps };

export function seed(): DemoState {
  const skills: Skill[] = [
    {
      id: 'sk-ux', name: 'بحث تجربة المستخدم', category: 'Design', level: 1, score: 84, state: 'declared', developing: false,
      assessedAt: d('2025-02-18'), evaluator: { name: 'د. حصة المطيري', role: 'أستاذ جامعي', org: 'جامعة الملك سعود' },
      projectIds: ['pr-darb', 'pr-souq'],
      evidence: [
        { id: 'e1', type: 'assessment', title: 'تقييم عملي لدراسة قابلية الاستخدام: 8 مشاركين وتحليل نجاح المهام', source: 'تقييم نَسْج العملي', date: '2025-01-27' },
        { id: 'e2', type: 'professor-eval', title: 'تقييم وفق المعايير، 84/100', source: 'د. حصة المطيري، جامعة الملك سعود', date: '2025-02-18' },
        { id: 'e3', type: 'hackathon', title: 'مقابلات ركاب درب (14 راكبًا، المسار 1 و3 في مترو الرياض)', source: 'هاكاثون الرياض للتنقل الذكي', date: '2024-11-30' },
        { id: 'e4', type: 'project-link', title: 'مستودع أبحاث تطبيق باعة سوق الزل', source: 'مشروع شخصي', date: '2024-09-12', url: 'demo://souq-research' },
      ],
      history: [
        { date: '2024-06-02', note: 'إعلان المهارة' }, { date: '2024-11-30', note: 'إضافة مخرج هاكاثون' },
        { date: '2025-01-27', note: 'اكتمل التقييم العملي، 79' }, { date: '2025-02-18', note: 'تقييم أستاذ جامعي، 84' },
      ],
      recommendations: ['نفّذ دراسة غير مُدارة لإظهار تنوع يتجاوز المقابلات', 'أضف تحليل استبيان كمي لتعزيز المستوى المتقدم'],
    },
    {
      id: 'sk-ui', name: 'تصميم الواجهات (Figma)', category: 'Design', level: 2, score: 88, state: 'declared', developing: false,
      assessedAt: '2025-03-04', evaluator: { name: 'ماجد السلمي', role: 'قائد تصميم المنتجات', org: 'قمة الصحية' },
      projectIds: ['pr-darb'],
      evidence: [
        { id: 'e5', type: 'assessment', title: 'تقييم عملي لنظام تصميم: 24 مكونًا وسمتان', source: 'تقييم نَسْج العملي', date: '2025-02-20' },
        { id: 'e6', type: 'professional-eval', title: 'مراجعة من القطاع، 88/100', source: 'ماجد السلمي، قمة الصحية', date: '2025-03-04' },
        { id: 'e7', type: 'hackathon', title: 'واجهة درب ورحلة المستخدم', source: 'هاكاثون الرياض للتنقل الذكي', date: '2024-11-30' },
        { id: 'e8', type: 'work-sample', title: 'تدفق تسجيل مصرفي ثنائي اللغة (RTL/LTR)', source: 'نموذج عمل مرفوع', date: '2025-01-09' },
      ],
      history: [{ date: '2024-03-10', note: 'إعلان المهارة' }, { date: '2025-02-20', note: 'اكتمل التقييم، 85' }, { date: '2025-03-04', note: 'تقييم مختص من القطاع، 88' }],
      recommendations: ['وثّق مواصفات الحركة في دراسة الحالة القادمة', 'ساهم بمكوّن واحد في نظام تصميم مفتوح'],
    },
    {
      id: 'sk-fe', name: 'تطوير الواجهات الأمامية (React)', category: 'Technology', level: 1, score: 74, state: 'declared', developing: true,
      assessedAt: '2025-03-11', evaluator: { name: 'د. حصة المطيري', role: 'أستاذ جامعي', org: 'جامعة الملك سعود' },
      projectIds: ['pr-darb'],
      evidence: [
        { id: 'e9', type: 'assessment', title: 'نقطة تحقق مراجعة المكونات، 72', source: 'نقطة تحقق مسار تعلم نَسْج', date: '2025-03-02' },
        { id: 'e10', type: 'professor-eval', title: 'تقييم وفق المعايير، 74/100', source: 'د. حصة المطيري، جامعة الملك سعود', date: '2025-03-11' },
      ],
      history: [{ date: '2024-10-01', note: 'إعلان المهارة' }, { date: '2025-03-02', note: 'اجتياز نقطة التحقق' }, { date: '2025-03-11', note: 'تقييم أستاذ جامعي، 74' }],
      recommendations: ['أضف مخرجًا آخر (عرض منشور) لاستيفاء معايير أدلة التوثيق', 'أكمل وحدة الأداء والاختبار'],
    },
    {
      id: 'sk-ia', name: 'هندسة المعلومات', category: 'Design', level: 1, score: 71, state: 'declared', developing: true,
      assessedAt: '2025-02-25', projectIds: ['pr-souq'],
      evidence: [{ id: 'e11', type: 'assessment', title: 'تقييم عملي لفرز البطاقات، 31 بطاقة و12 مشاركًا', source: 'تقييم نَسْج العملي', date: '2025-02-25' }],
      history: [{ date: '2024-12-11', note: 'إعلان المهارة' }, { date: '2025-02-25', note: 'اكتمل التقييم، 71' }],
      recommendations: ['اطلب مراجعة مقيّم لتحليل فرز البطاقات'],
    },
    {
      id: 'sk-pm', name: 'إدارة المشاريع', category: 'Business', level: 1, score: 68, state: 'declared', developing: true,
      assessedAt: '2025-01-15', projectIds: ['pr-ux-day'],
      evidence: [
        { id: 'e12', type: 'responsibility', title: 'قائدة الخدمات اللوجستية، يوم تجربة المستخدم بالرياض 2025 (220 حاضرًا)', source: 'نادي المنتج والتصميم، جامعة الملك سعود', date: '2025-01-15' },
        { id: 'e13', type: 'assessment', title: 'نقطة تحقق محاكاة السيناريو، 68', source: 'تقييم نَسْج العملي', date: '2025-01-20' },
      ],
      history: [{ date: '2024-09-20', note: 'إعلان المهارة' }, { date: '2025-01-15', note: 'سجّل النادي المسؤولية' }, { date: '2025-01-20', note: 'اكتمل التقييم، 68' }],
      recommendations: ['احصل على 70 أو أكثر في نقطة التحقق القادمة', 'اكتب مراجعة ختامية لتسليم يوم تجربة المستخدم'],
    },
    {
      id: 'sk-ps', name: 'الخطابة والعرض', category: 'Communication', level: 1, state: 'declared', developing: false, projectIds: [],
      evidence: [{ id: 'e14', type: 'participation', title: 'شهادة حضور، ورشة خطابة على نمط Toastmasters', source: 'عمادة شؤون الطلاب', date: '2024-12-03' }],
      history: [{ date: '2024-12-03', note: 'إعلان المهارة وإرفاق شهادة مشاركة (لا توثّق المهارة)' }],
      recommendations: ['سجّل عرضًا مدته 5 دقائق وقدّمه لتقييم عملي'],
    },
    {
      id: 'sk-sql', name: 'تحليل البيانات (SQL)', category: 'Data', level: 0, state: 'declared', developing: true, projectIds: [],
      evidence: [], history: [{ date: '2025-03-01', note: 'إعلان المهارة كفجوة مهنية' }],
      recommendations: ['ابدأ مسار تحليل البيانات', 'خذ تقييم تحديد المستوى'],
    },
  ];

  const paths: LearningPath[] = [
    {
      id: 'lp-ux', track: 'project-management', title: 'إدارة المشاريع لفرق المنتجات', skillName: 'إدارة المشاريع', category: 'Business',
      currentLevel: 0, targetLevel: 2, placementScore: 50, steps: buildSteps('project-management', 0, 2, 3),
      supervisor: 'د. حصة المطيري', industryMentor: 'ماجد السلمي', companyPartner: 'طيف الرقمية', startedAt: '2024-12-01',
    },
    {
      id: 'lp-fe', track: 'frontend', title: 'تطوير الواجهات الأمامية باستخدام React', skillName: 'تطوير الواجهات الأمامية (React)', category: 'Technology',
      currentLevel: 1, targetLevel: 3, placementScore: 75, steps: buildSteps('frontend', 1, 3, 3),
      supervisor: 'د. حصة المطيري', industryMentor: 'أحمد بن سعيد', companyPartner: 'طيف الرقمية', startedAt: '2025-01-10',
    },
    {
      id: 'lp-ia', track: 'data-analysis', title: 'أساسيات تحليل البيانات', skillName: 'تحليل البيانات (SQL)', category: 'Data',
      currentLevel: 0, targetLevel: 1, placementScore: 25, steps: buildSteps('data-analysis', 0, 1, 99),
      supervisor: 'د. تركي الدوسري', industryMentor: 'سارة الجابر', companyPartner: 'مختبرات وادي البيانات', startedAt: '2024-08-15', completedAt: '2024-10-28',
    },
  ];

  const challenges: Challenge[] = [
    {
      id: 'ch-sales', title: 'حلّل بيانات المبيعات واكتشف سبب انخفاض الأرباح', org: 'طيف الرقمية', orgKind: 'company',
      description: 'متجر إلكتروني لاحظ انخفاض أرباحه في الربع الأخير رغم ثبات المبيعات. حلّل بيانات الطلبات والخصومات والمرتجعات المرفقة، واكتشف السبب، واقترح ثلاث خطوات قابلة للتنفيذ.',
      skill: 'تحليل البيانات (SQL)', category: 'Data', proficiency: 1, duration: 'أسبوع',
      deliverables: ['استعلامات SQL موثقة', 'مذكرة نتائج من صفحتين', 'رسم بياني يوضح السبب'],
      rubric: [crit('صياغة السؤال', 20, 'تعريف واضح للمقياس'), crit('صحة الاستعلامات', 35, 'ربط وتجميع دقيقان'), crit('جودة الرؤى', 30, 'نتائج قابلة للتنفيذ'), crit('القيود', 15, 'صراحة بشأن فجوات البيانات')],
      requirements: ['تقديم فردي', 'استخدم بيانات المبيعات المرفقة فقط'], status: 'open', applicants: 31, deadline: '2025-04-28', createdAt: '2025-03-14',
    },
    {
      id: 'ch-1', title: 'إعادة تصميم تسجيل الفواتير للمنشآت الصغيرة لأول مرة', org: 'طيف الرقمية', orgKind: 'company',
      description: 'يتخلى صغار التجار في القصيم والأحساء عن التسجيل عند خطوة السجل التجاري. شخّص السبب واقترح تدفقًا معاد التصميم.',
      skill: 'بحث تجربة المستخدم', category: 'Design', proficiency: 1, duration: 'أسبوعان',
      deliverables: ['ملخص بحثي (6 صفحات بحد أقصى)', 'التدفق المعاد تصميمه في Figma', 'فيديو شرح مدته 3 دقائق'],
      rubric: UX_RUBRIC, requirements: ['تقديم فردي', 'الاستشهاد بخمسة مصادر مستخدمين على الأقل', 'شاشات ثنائية اللغة'],
      status: 'open', applicants: 37, deadline: '2025-04-20', createdAt: '2025-03-01',
    },
    {
      id: 'ch-2', title: 'عنصر رؤى الإنفاق سهل الوصول', org: 'طيف الرقمية', orgKind: 'company',
      description: 'ابنِ عنصر React يعرض فئات الإنفاق الشهرية ويستوفي معيار WCAG AA ويعمل باتجاه RTL.',
      skill: 'تطوير الواجهات الأمامية (React)', category: 'Technology', proficiency: 1, duration: '10 أيام',
      deliverables: ['رابط المستودع', 'عرض منشور', 'ملاحظات إمكانية الوصول'],
      rubric: [crit('الصحة الوظيفية', 30, 'يستوفي المواصفات الوظيفية'), crit('إمكانية الوصول', 30, 'لوحة المفاتيح والتسميات والتباين'), crit('جودة الشيفرة', 25, 'مقروءة ومختبرة'), crit('دعم RTL', 15, 'خصائص منطقية وتخطيط معكوس')],
      requirements: ['مستودع عام', 'ملف README بخطوات الإعداد'], status: 'open', applicants: 22, deadline: '2025-04-12', createdAt: '2025-03-05',
    },
    {
      id: 'ch-3', title: 'دوافع التسرب في تطبيق توصيل بقالة في جدة', org: 'مختبرات وادي البيانات', orgKind: 'company',
      description: 'استخدم البيانات التجريبية المرفقة لتفسير انخفاض الاحتفاظ لمدة 90 يومًا في الربع الرابع.',
      skill: 'تحليل البيانات (SQL)', category: 'Data', proficiency: 1, duration: 'أسبوع',
      deliverables: ['دفتر SQL', 'مذكرة من صفحتين'], rubric: [crit('صياغة السؤال', 20, 'تعريف واضح للمقياس'), crit('صحة الاستعلامات', 35, 'ربط وتجميع دقيقان'), crit('جودة الرؤى', 30, 'نتائج قابلة للتنفيذ'), crit('القيود', 15, 'صراحة بشأن فجوات البيانات')],
      requirements: ['استخدم البيانات المرفقة فقط'], status: 'open', applicants: 58, deadline: '2025-04-05', createdAt: '2025-02-20',
    },
    {
      id: 'ch-4', title: 'تقييم استدلالي لبوابة خدمات جامعية إلكترونية', org: 'د. حصة المطيري', orgKind: 'professor',
      description: 'طبّق مبادئ نيلسن الاستدلالية على بوابة خدمات طلابية تجريبية واربط كل نتيجة بنظرية التفاعل بين الإنسان والحاسب.',
      skill: 'هندسة المعلومات', category: 'Design', proficiency: 0, duration: '5 أيام',
      deliverables: ['جدول النتائج', 'توصيات مرتبة حسب الخطورة'], rubric: UX_RUBRIC, requirements: ['الإحالة إلى قراءات المقرر'],
      status: 'open', applicants: 41, deadline: '2025-04-02', createdAt: '2025-03-08',
    },
    {
      id: 'ch-job-1', kind: 'job', jobTitle: 'مطوّر واجهات أمامية (مبتدئ)', title: 'وظيفة مطوّر واجهات أمامية مبتدئ بتقييم عملي', org: 'طيف الرقمية', orgKind: 'company',
      description: 'وظيفة بدوام كامل في الرياض. بدل الاكتفاء بالسيرة الذاتية، ينفّذ المتقدم مهمة قصيرة: صفحة فواتير ثنائية اللغة بـ React. أفضل الحلول تنتقل إلى المقابلة.',
      skill: 'تطوير الواجهات الأمامية (React)', category: 'Technology', proficiency: 1, duration: '3 أيام',
      deliverables: ['رابط المستودع', 'عرض منشور', 'ملاحظة قصيرة عن قراراتك'],
      rubric: [crit('الصحة الوظيفية', 35, 'يستوفي المواصفات'), crit('إمكانية الوصول', 25, 'لوحة المفاتيح والتباين'), crit('جودة الشيفرة', 25, 'مقروءة ومنظمة'), crit('دعم RTL', 15, 'تخطيط معكوس سليم')],
      requirements: ['تقديم فردي', 'طالب في سنته الأخيرة أو خريج حديث'], status: 'open', applicants: 19, deadline: '2025-04-25', createdAt: '2025-03-10',
    },
    {
      id: 'ch-proj-1', kind: 'project', budget: 4500, title: 'مشروع مدفوع: لوحة مؤشرات مبيعات لمتجر إلكتروني', org: 'طيف الرقمية', orgKind: 'company',
      description: 'عمل محدد بمدة وميزانية ومخرجات: لوحة مؤشرات أسبوعية للمبيعات والمرتجعات من بيانات المتجر. ينفذه طالب أو فريق مقابل أجر متفق عليه.',
      skill: 'تحليل البيانات (SQL)', category: 'Data', proficiency: 2, duration: 'شهر',
      deliverables: ['لوحة مؤشرات منشورة', 'استعلامات SQL موثقة', 'جلسة تسليم مع الفريق'],
      rubric: [crit('دقة البيانات', 35, 'أرقام مطابقة للمصدر'), crit('وضوح العرض', 30, 'قراءة سريعة للمؤشرات'), crit('التوثيق', 20, 'خطوات قابلة للتكرار'), crit('الالتزام بالموعد', 15, 'تسليم في المدة')],
      requirements: ['فرد أو فريق حتى 3 أعضاء', 'اتفاقية عمل قبل البدء'], status: 'open', applicants: 7, deadline: '2025-05-10', createdAt: '2025-03-12',
    },
  ];

  const submissions: Submission[] = [
    { id: 'sub-1', source: 'challenge', refId: 'ch-1', title: 'إعادة تصميم تسجيل التجار', skill: 'بحث تجربة المستخدم', studentId: 'c-noura', studentName: 'هيا الشهري', link: 'demo://noura-onboarding', notes: 'قابلت 7 تجار في الأحساء؛ خطوة البحث عن السجل التجاري هي نقطة التسرب الرئيسية.', submittedAt: '2025-03-14', status: 'pending', rubric: UX_RUBRIC },
    { id: 'sub-2', source: 'challenge', refId: 'ch-4', title: 'تدقيق استدلالي للخدمات الإلكترونية', skill: 'هندسة المعلومات', studentId: 'me', studentName: 'نور القحطاني', link: 'demo://reem-heuristics', notes: '23 نتيجة، 6 منها بدرجة خطورة 4. ربطت مشكلات التنقل بنظرية أثر المعلومات.', submittedAt: '2025-03-16', status: 'pending', rubric: UX_RUBRIC },
    { id: 'sub-3', source: 'challenge', refId: 'ch-3', title: 'مذكرة التسرب للربع الرابع', skill: 'تحليل البيانات (SQL)', studentId: 'c-abdulrahman', studentName: 'عبدالرحمن الزهراني', link: 'demo://churn-memo', notes: 'توفر مواعيد التوصيل يفسر معظم الانخفاض.', submittedAt: '2025-03-12', status: 'pending', rubric: challenges[2].rubric },
    { id: 'sub-4', source: 'project', refId: 'pr-darb', title: 'البنية الخلفية لتطبيق درب', skill: 'تطوير الخلفيات (Python)', studentId: 'c-faisal', studentName: 'فيصل الحربي', link: 'demo://darb-api', notes: 'خدمة FastAPI ومخطط PostgreSQL وتكامل جدول رحلات المترو.', submittedAt: '2025-03-10', status: 'pending', rubric: [crit('البنية', 30, 'هيكل سليم'), crit('تصميم البيانات', 30, 'مطبّعة ومفهرسة'), crit('التكامل', 25, 'استخدام متين للواجهات البرمجية'), crit('التوثيق', 15, 'ملف README واضح')] },
    { id: 'sub-6', source: 'challenge', refId: 'ch-job-1', title: 'صفحة فواتير ثنائية اللغة', skill: 'تطوير الواجهات الأمامية (React)', studentId: 'c-yousef', studentName: 'يوسف الغامدي', link: 'demo://yousef-invoices', notes: 'بنيت الصفحة بمكونات قابلة لإعادة الاستخدام، واختبرت التنقل بلوحة المفاتيح في الاتجاهين.', submittedAt: '2025-03-15', status: 'evaluated', rubric: [crit('الصحة الوظيفية', 35, 'يستوفي المواصفات'), crit('إمكانية الوصول', 25, 'لوحة المفاتيح والتباين'), crit('جودة الشيفرة', 25, 'مقروءة ومنظمة'), crit('دعم RTL', 15, 'تخطيط معكوس سليم')], scores: { 'الصحة الوظيفية': 4, 'إمكانية الوصول': 4, 'جودة الشيفرة': 4, 'دعم RTL': 3 }, result: 86, feedback: 'حل نظيف ومختبر. يستحق المقابلة.', evaluator: { name: 'ماجد السلمي', role: 'قائد تصميم المنتجات', org: 'قمة الصحية' }, evaluatorRole: 'professional' },
    { id: 'sub-7', source: 'challenge', refId: 'ch-proj-1', title: 'عرض تنفيذ لوحة المبيعات', skill: 'تحليل البيانات (SQL)', studentId: 'c-abdulrahman', studentName: 'عبدالرحمن الزهراني', link: 'demo://sales-dashboard-proposal', notes: 'فريق من عضوين: أتولى الاستعلامات ونموذج البيانات، وزميلتي تتولى التصميم. التسليم خلال 3 أسابيع.', submittedAt: '2025-03-16', status: 'pending', rubric: [crit('دقة البيانات', 35, 'أرقام مطابقة للمصدر'), crit('وضوح العرض', 30, 'قراءة سريعة للمؤشرات'), crit('التوثيق', 20, 'خطوات قابلة للتكرار'), crit('الالتزام بالموعد', 15, 'تسليم في المدة')] },
    { id: 'sub-5', source: 'path', refId: 'lp-fe', title: 'نقطة تحقق مراجعة المكونات', skill: 'تطوير الواجهات الأمامية (React)', studentId: 'me', studentName: 'نور القحطاني', link: 'demo://reem-components', notes: 'نموذج ثنائي اللغة مع التحقق من المدخلات.', submittedAt: '2025-03-02', status: 'evaluated', rubric: challenges[1].rubric, scores: { 'الصحة الوظيفية': 4, 'إمكانية الوصول': 4, 'جودة الشيفرة': 3, 'دعم RTL': 4 }, result: 74, feedback: 'عمل متين في إمكانية الوصول. الاختبارات قليلة؛ أضيفي تغطية لحالات التحقق الحدّية.', evaluator: { name: 'د. حصة المطيري', role: 'أستاذ جامعي', org: 'جامعة الملك سعود' }, evaluatorRole: 'professor' },
  ];

  const projects: Project[] = [
    {
      id: 'pr-darb', title: 'درب: رفيق تنقل ذكي لمترو الرياض', kind: 'hackathon', context: 'هاكاثون الرياض للتنقل الذكي 2024',
      challenge: 'تقليل صعوبة الوصول من المحطة وإليها لركاب المترو', team: 'فريق السدو', date: '2024-11-30',
      summary: 'تطبيق يتنبأ بالازدحام ويخطط لمراحل المشي والحافلة والمترو، مع مساعد محادثة يبدأ بالعربية.',
      members: [
        { studentId: 'me', name: 'نور القحطاني', role: 'مصممة منتج ومطورة واجهات أمامية', responsibilities: ['صممت واجهة المستخدم', 'أعدّت رحلة المستخدم', 'بنت مكونات الواجهة الأمامية'], tasks: ['14 مقابلة مع ركاب', 'خريطة رحلة لثلاث شخصيات', '22 شاشة في Figma', 'واجهة مخطط المسار بـ React'], skills: ['بحث تجربة المستخدم', 'تصميم الواجهات (Figma)', 'تطوير الواجهات الأمامية (React)'], tools: ['Figma', 'React', 'Maze'], contribution: 'تولّيت الاستكشاف حتى الواجهة. أعادت خريطة الرحلة صياغة المشكلة من تخطيط المسار إلى قلق الازدحام، وأصبح ذلك الفكرة الفائزة.', share: 34 },
        { studentId: 'c-faisal', name: 'فيصل الحربي', role: 'مهندس خلفيات', responsibilities: ['طوّر الخلفية بلغة Python', 'صمم قاعدة البيانات', 'أجرى تكامل الواجهة البرمجية'], tasks: ['خدمة FastAPI', 'مخطط PostgreSQL من 9 جداول', 'تكامل جدول الرحلات ونموذج الازدحام'], skills: ['تطوير الخلفيات (Python)', 'تصميم قواعد البيانات', 'تكامل الواجهات البرمجية (API)'], tools: ['Python', 'FastAPI', 'PostgreSQL'], contribution: 'بنى طبقة الخدمات ونقطة التنبؤ بالازدحام في أقل من 36 ساعة.', share: 38 },
        { studentId: 'c-lama', name: 'لمى العتيبي', role: 'قائدة الأعمال', responsibilities: ['أجرت أبحاث السوق', 'صممت نموذج العمل', 'أعدّت التحليل المالي'], tasks: ['تقدير حجم السوق لستة مسارات مترو', 'نموذج B2B2C مع أصحاب العمل', 'توقعات مالية لثلاث سنوات'], skills: ['أبحاث السوق', 'نمذجة الأعمال', 'التحليل المالي'], tools: ['Excel', 'Notion', 'Canva'], contribution: 'حوّلت المنتج إلى قصة قابلة للتمويل وقادت العرض النهائي.', share: 28 },
      ],
      deliverables: ['نموذج أولي تفاعلي', 'عرض واجهة برمجية عاملة', 'عرض تقديمي (12 شريحة)', 'نموذج مالي'],
      mentorFeedback: 'صياغة قوية قائمة على الأدلة. فكرة الازدحام جاءت من مقابلات حقيقية لا من افتراضات. (المرشد: ماجد السلمي)',
      judgeEvaluation: 'حصل على 86/100: أعلى الدرجات في قيمة المستخدم وقابلية التنفيذ؛ نموذج العمل يحتاج إلى تحقق مع أصحاب العمل.',
      result: 'المركز الثاني من 41 فريقًا',
    },
    {
      id: 'pr-souq', title: 'تطبيق اكتشاف باعة سوق الزل', kind: 'personal', context: 'مشروع شخصي', challenge: 'مساعدة الزوار على إيجاد الباعة في سوق الرياض التراثي',
      team: 'فردي', date: '2024-09-12', summary: 'بحث وهندسة معلومات لخريطة باعة ثنائية اللغة.',
      members: [{ studentId: 'me', name: 'نور القحطاني', role: 'باحثة ومصممة', responsibilities: ['بحث ميداني', 'هندسة المعلومات', 'نموذج أولي'], tasks: ['مقابلات مع الباعة', 'فرز البطاقات', 'اختبار النموذج الأولي'], skills: ['بحث تجربة المستخدم', 'هندسة المعلومات'], tools: ['Figma', 'Optimal Workshop'], contribution: 'المساهمة الوحيدة.', share: 100 }],
      deliverables: ['مستودع البحث', 'خريطة الموقع', 'نموذج أولي'], mentorFeedback: 'لم تتم المراجعة بعد.', judgeEvaluation: 'لا ينطبق.', result: 'نُشر كدراسة حالة',
    },
    {
      id: 'pr-ux-day', title: 'يوم تجربة المستخدم بالرياض 2025', kind: 'club', context: 'نادي المنتج والتصميم، جامعة الملك سعود', challenge: 'تنظيم مؤتمر تصميم ليوم واحد لـ 220 طالبًا',
      team: 'اللجنة المنظمة', date: '2025-01-15', summary: 'محاضرات ومراجعات ملفات أعمال وسباق تصميم مع 6 متحدثين من القطاع.',
      members: [
        { studentId: 'me', name: 'نور القحطاني', role: 'قائدة الخدمات اللوجستية', responsibilities: ['المكان والجدول', 'تنسيق المتطوعين', 'سير الفعالية'], tasks: ['نسّقت 18 متطوعًا', 'أدارت 6 فترات للمتحدثين', 'استبيان ما بعد الفعالية'], skills: ['إدارة المشاريع', 'القيادة', 'التواصل'], tools: ['Notion', 'Google Forms'], contribution: 'تم التسليم في الموعد دون أي تجاوز للفترات.', share: 40 },
        { studentId: 'c-noura', name: 'هيا الشهري', role: 'الهوية والمحتوى', responsibilities: ['هوية الفعالية', 'محتوى التواصل الاجتماعي'], tasks: ['الهوية البصرية', '14 منشورًا اجتماعيًا'], skills: ['التصميم الجرافيكي', 'استراتيجية المحتوى'], tools: ['Illustrator', 'Figma'], contribution: 'أنشأت نظام الهوية بالكامل.', share: 35 },
        { studentId: 'c-yousef', name: 'يوسف الغامدي', role: 'الشراكات', responsibilities: ['التواصل مع المتحدثين', 'علاقات الرعاة'], tasks: ['استقطب 6 متحدثين', 'راعيان'], skills: ['التفاوض', 'التواصل'], tools: ['البريد الإلكتروني', 'Sheets'], contribution: 'أتمّ الاتفاق مع جميع المتحدثين.', share: 25 },
      ],
      deliverables: ['وثيقة سير الفعالية', 'تقرير الاستبيان (NPS 61)', 'أرشيف الصور'], mentorFeedback: 'ملكية وتوثيق واضحان.', judgeEvaluation: 'لا ينطبق.', result: 'اكتمل، 220 حاضرًا',
    },
  ];

  const hackathons: Hackathon[] = [
    { id: 'hk-1', name: 'هاكاثون الرياض للتنقل الذكي', organizer: 'منظم تجريبي: ملتقى الرياض للتقنية الحضرية', city: 'الرياض', date: '2024-11-28', theme: 'التنقل من المحطة وإليها', projectId: 'pr-darb', status: 'completed' },
    { id: 'hk-2', name: 'سباق ضاد للذكاء الاصطناعي', organizer: 'منظم تجريبي: حلقة تقنيات اللغة العربية', city: 'الرياض', date: '2025-04-24', theme: 'أدوات ذكاء اصطناعي تبدأ بالعربية', status: 'upcoming' },
    { id: 'hk-3', name: 'ملتقى البحر الأحمر للاستدامة', organizer: 'منظم تجريبي: مختبر مستقبل السواحل', city: 'جدة', date: '2025-05-15', theme: 'السياحة الساحلية واستهلاك المياه', status: 'upcoming' },
  ];

  const activities: Activity[] = [
    { id: 'ac-1', club: 'نادي المنتج والتصميم', title: 'عطلة سباق التصميم: الإرشاد داخل الحرم الجامعي', type: 'مشروع فريق', date: '2025-04-10', location: 'جامعة الملك سعود، كلية علوم الحاسب والمعلومات، القاعة 2B', description: 'سباق من خمسة أيام مضغوط في عطلة نهاية أسبوع. تصمم الفرق نماذج أولية لإرشاد الطلاب الجدد.', skills: ['بحث تجربة المستخدم', 'التيسير', 'النمذجة الأولية'], capacity: 40, registered: ['هيا الشهري', 'يوسف الغامدي', 'لمى العتيبي'], status: 'open', assignments: [{ person: 'يوسف الغامدي', studentId: 'c-yousef', role: 'ميسّر السباق', tasks: 'إدارة جلسات القرار وضبط وقت كل مرحلة', skills: ['التيسير', 'القيادة'], recorded: false }] },
    { id: 'ac-2', club: 'نادي المنتج والتصميم', title: 'عيادة ملفات الأعمال مع مراجعين من القطاع', type: 'ورشة عمل', date: '2025-04-17', location: 'عن بُعد', description: 'مراجعة فردية لملف الأعمال، 20 دقيقة لكل مشارك.', skills: ['التواصل', 'تصميم الواجهات (Figma)'], capacity: 24, registered: ['فيصل الحربي'], status: 'open', assignments: [] },
    { id: 'ac-3', club: 'نادي المنتج والتصميم', title: 'يوم تجربة المستخدم بالرياض 2025', type: 'فعالية', date: '2025-01-15', location: 'مركز المؤتمرات بجامعة الملك سعود', description: 'مؤتمر سنوي ليوم واحد.', skills: ['إدارة المشاريع', 'القيادة', 'التواصل'], capacity: 220, registered: ['نور القحطاني', 'هيا الشهري', 'يوسف الغامدي'], status: 'completed', assignments: [{ person: 'نور القحطاني', studentId: 'me', role: 'قائدة الخدمات اللوجستية', tasks: 'المكان والجدول و18 متطوعًا وسير الفعالية', skills: ['إدارة المشاريع', 'القيادة'], evidence: 'وثيقة سير الفعالية وتقرير الاستبيان', recorded: true }] },
  ];

  const mentors: Mentor[] = [
    { id: 'm-1', name: 'ماجد السلمي', title: 'قائد تصميم المنتجات', org: 'قمة الصحية', years: 9, expertise: ['تصميم المنتجات', 'أنظمة التصميم', 'تجربة المستخدم الصحية'], slots: ['الأحد 7 أبريل، 19:00', 'الثلاثاء 9 أبريل، 20:30', 'الخميس 11 أبريل، 18:00'], bio: 'يقود فريقًا من 7 مصممين يبنون تطبيقات للمرضى تُستخدم في 40 عيادة.' },
    { id: 'm-2', name: 'سارة الجابر', title: 'محللة بيانات أولى', org: 'مختبرات وادي البيانات', years: 6, expertise: ['SQL', 'التجارب', 'تحليلات التجزئة'], slots: ['الاثنين 8 أبريل، 18:30', 'الأربعاء 10 أبريل، 19:00'], bio: 'تبني تحليلات الاحتفاظ لعملاء التجارة الإلكترونية في جدة والدمام.' },
    { id: 'm-3', name: 'أحمد بن سعيد', title: 'مدير هندسة الواجهات الأمامية', org: 'طيف الرقمية', years: 11, expertise: ['React', 'إمكانية الوصول', 'التوظيف'], slots: ['السبت 6 أبريل، 17:00', 'الثلاثاء 9 أبريل، 21:00'], bio: 'يوظف مهندسين مبتدئين كل ربع سنة ويعرف ما يجتاز مراجعة الشيفرة.' },
  ];

  const posts: Post[] = [
    { id: 'po-1', author: 'ماجد السلمي', authorRole: 'professional', org: 'قمة الصحية', kind: 'insight', title: 'ما يحتاجه ملف أعمال المصمم المبتدئ في 2025', body: 'نرفض معظم ملفات الأعمال لا بسبب الجودة البصرية بل لغياب القرارات. أظهر قيدًا واجهته، ومقياسًا حرّكته، وشيئًا كنت ستعيده.', tags: ['ملف الأعمال', 'تصميم المنتجات'], date: '2025-03-12', saves: 148 },
    { id: 'po-2', author: 'د. حصة المطيري', authorRole: 'professor', org: 'جامعة الملك سعود', kind: 'academic', title: 'لماذا يُعد تحدي تسجيل التجار مسألة فيتس وهيك', body: 'يبدو تحدي طيف الرقمية مشكلة صياغة نصوص، لكن التسرب يقع حيث يتضاعف عدد الخيارات. تربط هذه المذكرة الموجز بنظرية زمن القرار وتقدم ثلاث قراءات.', tags: ['نظرية التفاعل بين الإنسان والحاسب', 'أساس التحدي'], date: '2025-03-06', saves: 92 },
    { id: 'po-3', author: 'سارة الجابر', authorRole: 'professional', org: 'مختبرات وادي البيانات', kind: 'case-study', title: 'دراسة حالة: موعد التوصيل الذي كلّف 11 نقطة من الاحتفاظ', body: 'مشروع حقيقي (مجهول الهوية): كيف وجدنا أن ندرة المواعيد، لا السعر، هي ما دفع التسرب، والاستعلامات التي استخدمناها.', tags: ['التحليلات', 'الاحتفاظ'], date: '2025-02-27', saves: 77 },
    { id: 'po-4', author: 'أحمد بن سعيد', authorRole: 'professional', org: 'طيف الرقمية', kind: 'tool', title: 'توصية أداة: axe DevTools قبل كل طلب دمج', body: 'شغّلها على كل واجهة معدّلة. معظم حالات الرفض في مهمة التوظيف لدينا بسبب إمكانية الوصول تكتشفها الأداة في ثوانٍ.', tags: ['إمكانية الوصول', 'الأدوات'], date: '2025-02-19', saves: 61 },
    { id: 'po-5', author: 'طيف الرقمية', authorRole: 'company', org: 'طيف الرقمية', kind: 'requirement', title: 'ما نتوقعه من متدربي تصميم المنتجات', body: 'إتقان واجهات ثنائية اللغة، وراحة في العرض على المهندسين، ومشروع بحثي واحد مُقيَّم على الأقل.', tags: ['التوظيف', 'تصميم'], date: '2025-02-10', saves: 133 },
  ];

  const requirements: Requirement[] = [
    { id: 'rq-1', org: 'طيف الرقمية', skill: 'بحث تجربة المستخدم', category: 'Design', level: 1, competencies: 'تخطيط المقابلات وإجراؤها وتلخيصها في مجالات فرص.', criteria: 'مشروع بحثي مُقيَّم يضم 5 مشاركين على الأقل.', date: '2025-02-10' },
    { id: 'rq-2', org: 'طيف الرقمية', skill: 'تطوير الواجهات الأمامية (React)', category: 'Technology', level: 2, competencies: 'مكونات سهلة الوصول وتخطيطات RTL واختبارات.', criteria: 'درجة مراجعة شيفرة 75 فأكثر ومشروع منشور.', date: '2025-02-14' },
    { id: 'rq-3', org: 'مختبرات وادي البيانات', skill: 'تحليل البيانات (SQL)', category: 'Data', level: 1, competencies: 'الربط والتجميع وتعريف المقاييس.', criteria: 'تقييم SQL عملي بدرجة 70 فأكثر.', date: '2025-02-02' },
  ];

  const candidates: Candidate[] = [
    { id: 'me', name: 'نور القحطاني', university: 'جامعة الملك سعود', major: 'نظم المعلومات', year: 3, target: 'مصمم منتجات', city: 'الرياض', highlight: 'المركز الثاني في هاكاثون الرياض للتنقل الذكي؛ قادت الخدمات اللوجستية ليوم تجربة المستخدم', skills: [] },
    { id: 'c-faisal', name: 'فيصل الحربي', university: 'جامعة الملك فهد للبترول والمعادن', major: 'هندسة الحاسب', year: 4, target: 'مهندس خلفيات', city: 'الظهران', highlight: 'بنى واجهة درب البرمجية في 36 ساعة', skills: [{ name: 'تطوير الخلفيات (Python)', level: 2, state: 'evaluated', score: 81, category: 'Technology' }, { name: 'تصميم قواعد البيانات', level: 2, state: 'verified', score: 86, category: 'Technology' }, { name: 'تكامل الواجهات البرمجية (API)', level: 1, state: 'assessed', score: 77, category: 'Technology' }] },
    { id: 'c-lama', name: 'لمى العتيبي', university: 'جامعة الأميرة نورة بنت عبدالرحمن', major: 'إدارة الأعمال', year: 3, target: 'مدير منتجات', city: 'الرياض', highlight: 'قدّمت عرض درب أمام لجنة التحكيم النهائية', skills: [{ name: 'أبحاث السوق', level: 2, state: 'verified', score: 83, category: 'Business' }, { name: 'التحليل المالي', level: 1, state: 'evaluated', score: 72, category: 'Business' }, { name: 'بحث تجربة المستخدم', level: 0, state: 'declared', category: 'Design' }] },
    { id: 'c-abdulrahman', name: 'عبدالرحمن الزهراني', university: 'جامعة الملك عبدالعزيز', major: 'علم البيانات', year: 4, target: 'محلل بيانات', city: 'جدة', highlight: 'ضمن أفضل 5 في تحدي التسرب لدى مختبرات وادي البيانات (تجريبي)', skills: [{ name: 'تحليل البيانات (SQL)', level: 2, state: 'verified', score: 91, category: 'Data' }, { name: 'Python للبيانات', level: 2, state: 'evaluated', score: 84, category: 'Data' }, { name: 'تصوير البيانات', level: 1, state: 'assessed', score: 70, category: 'Data' }] },
    { id: 'c-noura', name: 'هيا الشهري', university: 'جامعة الإمام عبدالرحمن بن فيصل', major: 'التصميم الجرافيكي', year: 4, target: 'مصمم هوية بصرية', city: 'الدمام', highlight: 'صممت نظام هوية يوم تجربة المستخدم', skills: [{ name: 'التصميم الجرافيكي', level: 2, state: 'verified', score: 89, category: 'Design' }, { name: 'بحث تجربة المستخدم', level: 1, state: 'assessed', score: 66, category: 'Design' }, { name: 'تصميم الواجهات (Figma)', level: 1, state: 'evaluated', score: 78, category: 'Design' }] },
    { id: 'c-yousef', name: 'يوسف الغامدي', university: 'جامعة الملك سعود', major: 'هندسة البرمجيات', year: 2, target: 'مهندس واجهات أمامية', city: 'الرياض', highlight: 'استقطب جميع متحدثي يوم تجربة المستخدم', skills: [{ name: 'تطوير الواجهات الأمامية (React)', level: 1, state: 'assessed', score: 73, category: 'Technology' }, { name: 'التواصل', level: 2, state: 'evaluated', score: 80, category: 'Communication' }] },
  ];

  const weekly = [3, 5, 2, 6, 4, 7, 5, 8, 6, 9, 7, 11];
  const log: LogItem[] = [
    { date: '2025-03-16', label: 'تم تقديم التدقيق الاستدلالي إلى د. حصة المطيري', kind: 'submission' },
    { date: '2025-03-11', label: 'تقييم تطوير الواجهات الأمامية، 74/100', kind: 'evaluation' },
    { date: '2025-03-04', label: 'راجع ماجد السلمي تصميم الواجهات، 88/100', kind: 'evaluation' },
    { date: '2025-03-02', label: 'اجتياز نقطة تحقق مكونات React', kind: 'path' },
    { date: '2025-02-25', label: 'تقييم هندسة المعلومات، 71', kind: 'assessment' },
  ];

  return {
    version: 1, role: 'student', locale: 'ar',
    profile: { name: 'نور القحطاني', arabicName: 'نور القحطاني', university: 'جامعة الملك سعود', major: 'نظم المعلومات', year: 3, city: 'الرياض', target: 'مصمم منتجات', interests: ['التقنية المالية', 'التنقل', 'إمكانية الوصول'], bio: 'أصمم منتجات ثنائية اللغة تحترم الطريقة التي يتنقل بها الناس في الرياض ويدفعون ويقررون فعلًا.' },
    settings: { weeklyGoal: 8, digest: true, publicPortfolio: true, reducedMotion: false, showArabic: true, nudges: true },
    skills, paths, challenges, submissions, projects, hackathons, activities,
    volunteering: [
      { id: 'v-1', org: 'بنك الطعام السعودي (سجل تجريبي)', title: 'توزيع سلال رمضان الغذائية', hours: 18, date: '2025-03-08', responsibilities: 'نسّقت خط تعبئة من 9 متطوعين', skills: ['القيادة', 'إدارة المشاريع'], confirmed: true },
      { id: 'v-2', org: 'مكتب إمكانية الوصول بجامعة الملك سعود (سجل تجريبي)', title: 'تدقيق إمكانية الوصول في الحرم الجامعي', hours: 12, date: '2024-11-14', responsibilities: 'وثّقت 37 عائقًا بالصور ودرجة الخطورة', skills: ['بحث تجربة المستخدم'], confirmed: false },
    ],
    mentors, bookings: [
      { id: 'b-1', mentorId: 'm-1', slot: 'الثلاثاء 4 مارس، 20:00', topic: 'سرد ملف الأعمال لوظائف التقنية المالية', status: 'completed', notes: 'ابدئي بفكرة الازدحام في درب واحذفي تمرين الشعار.' },
      { id: 'b-2', mentorId: 'm-3', slot: 'السبت 6 أبريل، 17:00', topic: 'الاستعداد لتحدي العنصر سهل الوصول', status: 'confirmed' },
    ],
    posts, requirements, candidates, shortlist: ['c-abdulrahman'], messages: [], log, weekly,
  };
}

export const MARKET = {
  industries: ['التقنية المالية', 'الرعاية الصحية', 'الخدمات اللوجستية', 'السياحة', 'الطاقة', 'الخدمات الحكومية'],
  majors: ['نظم المعلومات', 'علوم الحاسب', 'إدارة الأعمال', 'التصميم الجرافيكي', 'علم البيانات', 'الهندسة الصناعية'],
  skills: [
    { name: 'تحليل البيانات (SQL)', category: 'Data', demand: 92, growth: 18.4, industries: ['التقنية المالية', 'الخدمات اللوجستية', 'الرعاية الصحية', 'الخدمات الحكومية'], majors: ['نظم المعلومات', 'علم البيانات', 'إدارة الأعمال', 'الهندسة الصناعية'], band: 'Core' },
    { name: 'الذكاء الاصطناعي التطبيقي وتكامل النماذج اللغوية', category: 'Technology', demand: 87, growth: 41.7, industries: ['التقنية المالية', 'الخدمات الحكومية', 'الرعاية الصحية'], majors: ['علوم الحاسب', 'علم البيانات', 'نظم المعلومات'], band: 'Emerging' },
    { name: 'بحث تجربة المستخدم', category: 'Design', demand: 74, growth: 12.1, industries: ['التقنية المالية', 'الرعاية الصحية', 'الخدمات الحكومية', 'السياحة'], majors: ['نظم المعلومات', 'التصميم الجرافيكي'], band: 'Core' },
    { name: 'تصميم الواجهات (Figma)', category: 'Design', demand: 71, growth: 6.3, industries: ['التقنية المالية', 'السياحة'], majors: ['التصميم الجرافيكي', 'نظم المعلومات'], band: 'Stable' },
    { name: 'تطوير الواجهات الأمامية (React)', category: 'Technology', demand: 83, growth: 9.8, industries: ['التقنية المالية', 'الخدمات اللوجستية', 'السياحة'], majors: ['علوم الحاسب', 'نظم المعلومات'], band: 'Core' },
    { name: 'الحوسبة السحابية وDevOps', category: 'Technology', demand: 79, growth: 22.6, industries: ['التقنية المالية', 'الطاقة', 'الخدمات الحكومية'], majors: ['علوم الحاسب'], band: 'Emerging' },
    { name: 'أساسيات الأمن السيبراني', category: 'Technology', demand: 81, growth: 19.2, industries: ['الخدمات الحكومية', 'الطاقة', 'التقنية المالية'], majors: ['علوم الحاسب', 'نظم المعلومات'], band: 'Core' },
    { name: 'إدارة المشاريع', category: 'Business', demand: 76, growth: 5.4, industries: ['الطاقة', 'الخدمات اللوجستية', 'السياحة', 'الخدمات الحكومية'], majors: ['إدارة الأعمال', 'الهندسة الصناعية'], band: 'Stable' },
    { name: 'تحليلات سلاسل الإمداد', category: 'Data', demand: 68, growth: 15.9, industries: ['الخدمات اللوجستية', 'الطاقة'], majors: ['الهندسة الصناعية', 'علم البيانات'], band: 'Emerging' },
    { name: 'تصميم المحتوى ثنائي اللغة', category: 'Communication', demand: 62, growth: 13.3, industries: ['السياحة', 'الخدمات الحكومية', 'التقنية المالية'], majors: ['التصميم الجرافيكي', 'إدارة الأعمال'], band: 'Emerging' },
    { name: 'النمذجة المالية', category: 'Business', demand: 66, growth: 4.1, industries: ['التقنية المالية', 'الطاقة'], majors: ['إدارة الأعمال'], band: 'Stable' },
    { name: 'التصميم الجرافيكي', category: 'Design', demand: 58, growth: 2.7, industries: ['السياحة'], majors: ['التصميم الجرافيكي'], band: 'Stable' },
  ],
  emerging: [
    { name: 'النماذج اللغوية العربية', note: 'الاسترجاع والتقييم لمساعدات تبدأ بالعربية.' },
    { name: 'التوائم الرقمية للمشاريع الكبرى', note: 'مهارات المحاكاة للبناء والتخطيط الحضري.' },
    { name: 'واجهات المصرفية المفتوحة', note: 'التكامل وتصميم الموافقات للتقنية المالية.' },
    { name: 'الهيدروجين ومحاسبة الكربون', note: 'الإلمام بالبيانات لفرق تحول الطاقة.' },
  ],
};

export const uid = id;
