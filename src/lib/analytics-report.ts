import { LEVELS, PERSONAS, type DemoState, type Role, type VState } from './data';
import { fmtDay, PERIOD_LABEL, toMs, type StudentFilters, type Period, type studentAnalytics, type roleEvents, type datedCounts } from './analytics';

export interface AnalyticsReport {
  title: string;
  metadata: { label: string; value: string }[];
  notices: string[];
  sections: ReportSection[];
  definitions: { label: string; value: string }[];
}
export interface ReportSection {
  title: string;
  scope: string;
  columns: string[];
  rows: (string | number | null)[][];
  emptyMessage: string;
}

export const ANALYTICS_DEFINITIONS = [
  { label: 'الجاهزية', value: 'متوسط جاهزية كل مهارة يطلبها مسارك المهني: المستوى الحالي نسبةً للمطلوب، مضروبًا بوزن حالة التوثيق (موثّقة 100، مُقيَّمة 85، مُختبرة 65، مُعلنة 35).' },
  { label: 'تقدم التعلم', value: 'متوسط نسبة الخطوات المكتملة في كل مسارات التعلم؛ المسار بلا خطوات نسبته صفر.' },
  { label: 'التوثيق', value: 'مهارة موثّقة = تقييم عملي + تقييم مختص + درجة 70 فأكثر + ثلاثة أدلة مؤهلة. شهادات المشاركة لا تُحتسب.' },
  { label: 'النشاط', value: 'عدد السجلات المؤرخة: التسليمات، الأدلة، بدء المسارات، وأحداث سُجلت منذ بدء التتبع (إكمال خطوة، تقييم...). ليس عدد أيام النشاط أو ساعات العمل.' },
];
const STATE_LABEL: Record<VState, string> = { declared: 'مُعلنة', assessed: 'مُختبرة', evaluated: 'مُقيَّمة', verified: 'موثّقة' };
const DEMO_NOTICE = 'بيانات تجريبية محلية في هذا المتصفح، وليست شهادة رسمية أو سجلًا معتمدًا من جهة خارجية. راجع المحتوى قبل مشاركته؛ لا يُنشر ولا يُرسل تلقائيًا.';
const DATE_NOTICE = 'لا تُنسب تواريخ للسجلات غير المؤرخة، ولا يتضمن التقرير توقعات مستقبلية. الصفر قيمة مسجلة أو عدد مطابق يساوي صفرًا؛ «غير متاح» تعني غياب البيانات وليست صفرًا.';
const dateRange = (from: number | null, to: number) => `${from === null ? 'كل التواريخ المحفوظة' : `من ${fmtDay(from)}`} حتى ${fmtDay(to)}`;
const section = (title: string, scope: string, columns: string[], rows: ReportSection['rows'], emptyMessage = 'لا توجد بيانات مطابقة؛ غياب البيانات لا يعني درجة صفر.'): ReportSection =>
  ({ title, scope, columns, rows, emptyMessage });
function coverage(startedAt?: string) {
  const ms = toMs(startedAt);
  return ms === null
    ? 'لا يوجد سجل أحداث مؤرخ صالح؛ يعتمد النشاط على التواريخ المحفوظة في السجلات فقط.'
    : `بدء تتبع الأحداث: ${fmtDay(ms)}. ما قبله يعتمد فقط على التواريخ المحفوظة في السجلات التجريبية؛ لا يُفترض اكتمال التاريخ السابق.`;
}

/** Consumes the exact derivation displayed by the panel; does not re-date or recompute it. */
export function buildStudentReport(st: DemoState, f: StudentFilters, a: ReturnType<typeof studentAnalytics>): AnalyticsReport {
  const currentScope = 'الحالة الحالية ضمن نطاق المهارة؛ لا تتأثر بالفترة الزمنية.';
  const pathTitle = f.pathId === 'all' ? 'كل المسارات' : st.paths.find((p) => p.id === f.pathId)?.title ?? 'مسار غير موجود';
  const globalScope = 'ملخص الملف العام بالكامل الآن؛ لا يتأثر بفلاتر الفترة أو المهارة أو المسار.';
  return {
    title: 'نَسْج | تقرير التقدم',
    metadata: [
      { label: 'صاحب التقرير', value: st.profile.arabicName || st.profile.name || 'غير متاح' },
      { label: 'المسار المهني المستهدف', value: st.profile.target || 'غير متاح' },
      { label: 'الفترة المختارة', value: PERIOD_LABEL[f.period] },
      { label: 'حدود الفترة', value: dateRange(a.w.from, a.w.to) },
      { label: 'المهارة المختارة', value: f.skill === 'all' ? 'كل المهارات' : f.skill },
      { label: 'المسار المختار', value: pathTitle },
      { label: 'نطاق حالات المهارات والفجوات والمعايير', value: a.scopeSkill === 'all' ? 'كل المهارات' : a.scopeSkill },
      { label: 'المصدر وتغطية السجل', value: coverage(a.tel?.startedAt) },
    ],
    notices: [
      DEMO_NOTICE, DATE_NOTICE,
      'الفلاتر تخص النشاط والتقييمات المؤرخة، وتخص المهارة والمسار في جداول الحالة الحالية. ملخص الملف العام ولقطاته إجماليان لجميع المهارات والمسارات.',
      'عند اختيار مسار، تُضم السجلات التي لا تحمل معرّف مسار إذا طابقت مهارته؛ لا يثبت ذلك أنها أُنجزت ضمن هذا المسار بعينه.',
      ...(a.undatedEvals ? [`تتضمن «كل الفترة» ${a.undatedEvals} تقييمات بلا تاريخ تقييم محفوظ؛ لم تُستخدم تواريخ التسليم بديلًا عنها.`] : []),
    ],
    sections: [
      section('ملخص الملف العام · غير مفلتر', globalScope, ['المؤشر', 'القيمة'], [
        ['الجاهزية الإجمالية (%)', a.kpi.readiness], ['متوسط تقدم التعلم (%)', a.kpi.learning],
        ['المهارات الموثّقة', a.kpi.verified], ['إجمالي المهارات', a.kpi.total],
      ]),
      section('ملخص النشاط المفلتر', 'حسب الفترة والمهارة والمسار المختارة. المقارنة لا تتاح إلا عند تغطية كامل الفترتين.', ['المؤشر', 'القيمة'], [
        ['السجلات المؤرخة المطابقة', a.recs.length], ['الفترة السابقة', a.prevCount],
        ['عدد التقييمات وفق المعايير', a.evalCount],
      ]),
      section('توزيع النشاط عبر الزمن', 'من التواريخ المحفوظة وسجل الأحداث؛ الفواصل الخالية صفر سجلات، وليست أدلة على غياب العمل.', ['بداية الفترة التجميعية', 'عدد السجلات'],
        a.activity.map((b) => [fmtDay(b.t), b.count]), 'لا توجد سجلات مؤرخة مطابقة.'),
      section('سجل النشاط المفلتر', 'سجلات ذات تاريخ محفوظ فقط؛ المصدر موضح لكل سجل.', ['التاريخ', 'النشاط', 'المهارة', 'المسار المسجل', 'المصدر'],
        a.recs.map((r) => [fmtDay(r.ms), r.label, r.skill ?? null, r.pathId ? st.paths.find((p) => p.id === r.pathId)?.title ?? 'مسار غير موجود' : null, r.source])),
      section('لقطات الملف العام · إجمالية', 'لقطات إجمالية لا تتأثر بالمهارة أو المسار؛ تُعرض اللقطات المسجلة داخل الفترة فقط. لا استيفاء أو توقع بين اللقطات.', ['التاريخ', 'الجاهزية (%)', 'التعلم (%)', 'الموثّقة', 'إجمالي المهارات'],
        a.snaps.map((s) => [fmtDay(s.t), s.readiness, s.learning, s.verified, s.total]), 'لا توجد لقطات مسجلة في هذه الفترة.'),
      section('حالات المهارات', currentScope, ['الحالة', 'عدد المهارات'], a.states.map((s) => [STATE_LABEL[s.state], s.count])),
      section('فجوات المسار المهني', currentScope, ['المهارة', 'المستوى الحالي', 'المستوى المطلوب', 'الجاهزية (%)'],
        a.gapRows.map((r) => [r.skill, r.started ? LEVELS[r.current - 1] : 'لم تبدأ', LEVELS[r.required - 1], r.readiness])),
      section('إنجاز مسارات التعلم', 'الحالة الحالية حسب المهارة والمسار؛ لا تتأثر بالفترة. لا يُستنتج تاريخ إكمال للخطوات القديمة.', ['المسار', 'الخطوات المكتملة', 'إجمالي الخطوات', 'التقدم (%)'],
        a.paths.map((p) => [p.title, p.done, p.total, p.pct])),
      section('نتائج التقييم حسب المعيار', 'متوسط الدرجات من 5 ضمن نطاق المهارة. الفترات المحددة تستخدم تاريخ حدث التقييم، لا تاريخ التسليم؛ غير المؤرخ يظهر في «كل الفترة» فقط.', ['المعيار', 'متوسط الدرجة من 5', 'عدد الدرجات'],
        a.rubric.map((r) => [r.name, r.avg, r.n])),
    ],
    definitions: [...ANALYTICS_DEFINITIONS,
      { label: 'نطاق المهارة', value: 'المهارة المختارة صراحةً، وإلا مهارة المسار المختار، وإلا جميع المهارات؛ هذا هو نطاق حالات المهارات والفجوات والمعايير في التحليلات.' },
      { label: 'المقارنة السابقة', value: 'عدد سجلات الفترة المماثلة السابقة؛ غير متاح إذا لم يغطِ تتبع الأحداث الفترتين كاملتين أو اختيرت «كل الفترة».' },
      { label: 'درجات المعايير', value: 'متوسط حسابي للدرجات الرقمية المحفوظة لكل معيار، بما فيها الصفر؛ عدد الدرجات هو عدد التقييمات التي تحتوي درجة لذلك المعيار.' },
    ],
  };
}

export function buildRoleReport(st: DemoState, role: Exclude<Role, 'student'>, period: Period, metrics: { kind: string; label: string }[], unit: string, r: ReturnType<typeof roleEvents>, dc: ReturnType<typeof datedCounts>): AnalyticsReport {
  return {
    title: 'نَسْج | تقرير النشاط المسجّل',
    metadata: [
      { label: 'صاحب التقرير التجريبي', value: PERSONAS[role].name },
      { label: 'الدور', value: PERSONAS[role].title },
      { label: 'الفترة المختارة', value: PERIOD_LABEL[period] },
      { label: 'حدود الفترة', value: dateRange(r.w.from, r.w.to) },
      { label: 'المصدر وتغطية السجل', value: coverage(r.tel?.startedAt) },
    ],
    notices: [DEMO_NOTICE, DATE_NOTICE, 'إجراءات الدور وسجلات الكيانات مصدران منفصلان وقد يتداخلان؛ لا يُجمعان في إجمالي واحد. هذا ليس ملخص مهارات الطالب.'],
    sections: [
      section('مؤشرات الدور', 'من أحداث هذا الدور فقط داخل الفترة؛ المقارنة مشروطة بتغطية الفترتين كاملتين.', ['المؤشر', 'الفترة المختارة', 'الفترة السابقة'],
        metrics.map((m) => [m.label, r.byKind(r.cur, m.kind), r.prev ? r.byKind(r.prev, m.kind) : null])),
      section('الإجراءات المسجلة عبر الزمن', 'المصدر: سجل أحداث الدور منذ بدء التتبع.', ['بداية الفترة التجميعية', 'عدد الإجراءات'],
        r.activity.map((b) => [fmtDay(b.t), b.count])),
      section(`${unit} بتاريخ محفوظ`, 'المصدر: تواريخ الكيانات المعروضة في تحليلات هذا الدور؛ قد تخص تسليمات الآخرين في نطاق الدور وليس إجراءات صاحب التقرير.', ['بداية الفترة التجميعية', 'عدد السجلات'],
        dc.buckets.map((b) => [fmtDay(b.t), b.count])),
    ],
    definitions: [
      { label: 'مؤشرات الدور', value: 'عدد الأحداث المطابقة لنوع الإجراء والدور والفترة المختارة؛ صفر يعني أنه لا توجد أحداث مطابقة في السجل المتاح.' },
      { label: 'التواريخ المحفوظة', value: 'عدد الكيانات ذات التاريخ الصالح داخل الفترة؛ لا تُسند تواريخ للكيانات غير المؤرخة.' },
      { label: 'الفترة السابقة', value: 'الفترة المماثلة السابقة؛ غير متاح عند نقص تغطية تتبع الأحداث أو اختيار «كل الفترة».' },
    ],
  };
}

/** RFC 4180 quoting, UTF-8 BOM for Arabic spreadsheets, and formula-injection protection. */
export function reportCellText(value: string | number | null): string {
  return value === null || value === '' ? 'غير متاح' : String(value);
}
export function csvCell(value: string | number | null): string {
  let text = reportCellText(value);
  if (/^\s*[=+\-@\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function reportToCsv(report: AnalyticsReport): string {
  const rows: (string | number | null)[][] = [
    [report.title], ...report.metadata.map((m) => [m.label, m.value]),
    ...report.notices.map((n) => ['ملاحظة', n]),
  ];
  for (const s of report.sections) {
    rows.push([], [s.title], ['النطاق والمصدر', s.scope], s.columns);
    rows.push(...(s.rows.length ? s.rows : [[s.emptyMessage]]));
  }
  rows.push([], ['تعريفات المؤشرات'], ...report.definitions.map((d) => [d.label, d.value]));
  return '\uFEFF' + rows.map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
