import { useState } from 'react';
import { Link } from 'wouter';
import { Pencil, GraduationCap, Briefcase, Award, MessageSquareQuote } from 'lucide-react';
import { useDemo, useMeta, mutate, fmtDate } from '@/lib/store';
import { PERSONAS, LEVELS, NAMES } from '@/lib/data';
import { statusLabel } from '@/lib/i18n';
import { CAREERS } from '@/lib/career';
import { Initials, SaduBand, StateBadge, Modal, Field, Stat, DemoNote } from '@/components/kit';
import { ROLE_META } from '@/components/shell';
import { useToast } from '@/hooks/use-toast';

function StudentProfile() {
  const st = useDemo();
  const { profile } = st;
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ ...profile, interests: profile.interests.join('، ') });
  const { toast } = useToast();
  const feedback = st.submissions.filter((s) => s.studentId === 'me' && s.feedback);
  const projects = st.projects.filter((p) => p.members.some((m) => m.studentId === 'me'));
  const done = st.paths.filter((p) => p.completedAt);
  return (
    <>
      <section className="panel rise overflow-hidden">
        <SaduBand height={12} />
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:p-8">
          <Initials name={profile.name} size={88} tone="madder" />
          <div className="flex-1">
            <h1 className="font-display text-4xl font-semibold" data-testid="text-profile-name">{profile.name}</h1>
            {st.settings.showArabic && profile.arabicName && profile.arabicName !== profile.name && <p className="text-lg text-muted-foreground">{profile.arabicName}</p>}
            <p className="mt-1 text-sm text-muted-foreground">{profile.major}، {profile.university} · السنة {profile.year} · {profile.city}</p>
            <p className="mt-3 max-w-2xl">{profile.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5"><span className="chip chip-on">الهدف: {profile.target}</span>{profile.interests.map((i) => <span key={i} className="chip">{i}</span>)}</div>
          </div>
          <button className="btn btn-ghost self-start" onClick={() => setEdit(true)} data-testid="button-edit-profile"><Pencil className="h-4 w-4" /> تعديل</button>
        </div>
      </section>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4"><Stat label="المهارات" value={st.skills.length} /><Stat label="موثّقة" value={st.skills.filter((s) => s.state === 'verified').length} tone="madder" /><Stat label="مسارات مكتملة" value={done.length} /><Stat label="المشاريع" value={projects.length} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-6"><p className="eyebrow mb-3">المهارات وحالة التوثيق</p><ul className="space-y-2">{st.skills.map((s) => <li key={s.id} className="flex items-center justify-between gap-2 text-sm"><span>{s.name} <span className="text-xs text-muted-foreground">· {LEVELS[s.level]}</span></span><StateBadge state={s.state} /></li>)}</ul><Link href="/passport" className="mt-4 inline-block text-sm font-semibold text-[hsl(var(--primary))]">فتح الجواز</Link></section>
        <section className="panel p-6"><p className="eyebrow mb-3 flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" /> سجل التعلم</p><ol className="space-y-2.5 border-s ps-4">{st.paths.map((p) => <li key={p.id} className="relative text-sm"><span className="absolute -start-[21px] top-1.5 h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />{p.title}<span className="block text-xs text-muted-foreground">{p.completedAt ? `اكتمل في ${fmtDate(p.completedAt)}` : `قيد التقدم منذ ${fmtDate(p.startedAt)}`}</span></li>)}</ol></section>
        <section className="panel p-6"><p className="eyebrow mb-3 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> ملف المشاريع ومساهمات الهاكاثونات</p><ul className="space-y-2">{projects.map((p) => <li key={p.id}><Link href={`/projects/${p.id}`} className="block rounded-xl border p-3 text-sm hover:bg-[hsl(var(--secondary)/.5)]"><span className="font-semibold">{p.title}</span><span className="block text-xs text-muted-foreground">{p.members.find((m) => m.studentId === 'me')?.role} · {p.result}</span></Link></li>)}</ul></section>
        <section className="panel p-6"><p className="eyebrow mb-3 flex items-center gap-1.5"><Award className="h-3.5 w-3.5" /> الإنجازات</p><ul className="space-y-1.5 text-sm">{projects.filter((p) => p.result && !/progress|قيد التنفيذ/i.test(p.result)).map((p) => <li key={p.id}>{p.result}: {p.title}</li>)}{done.map((p) => <li key={p.id}>مسار مكتمل: {p.title}</li>)}</ul>
          <p className="eyebrow mb-3 mt-6 flex items-center gap-1.5"><MessageSquareQuote className="h-3.5 w-3.5" /> ملاحظات المختصين</p><ul className="space-y-2">{feedback.map((s) => <li key={s.id} className="rounded-xl bg-[hsl(var(--secondary)/.6)] p-3 text-sm">«{s.feedback}»<span className="mt-1 block text-xs text-muted-foreground">{s.evaluator?.name}، {s.title}</span></li>)}{st.bookings.filter((b) => b.notes).map((b) => <li key={b.id} className="rounded-xl bg-[hsl(var(--secondary)/.6)] p-3 text-sm">«{b.notes}»<span className="mt-1 block text-xs text-muted-foreground">جلسة إرشاد</span></li>)}</ul></section>
      </div>
      <Modal open={edit} onClose={() => setEdit(false)} title="تعديل الملف الشخصي">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><Field label="الاسم"><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} data-testid="input-profile-name" /></Field><Field label="اسم بديل"><input className="field" value={f.arabicName} onChange={(e) => setF({ ...f, arabicName: e.target.value })} /></Field></div>
          <div className="grid grid-cols-2 gap-3"><Field label="الجامعة"><input className="field" value={f.university} onChange={(e) => setF({ ...f, university: e.target.value })} /></Field><Field label="التخصص"><input className="field" value={f.major} onChange={(e) => setF({ ...f, major: e.target.value })} /></Field></div>
          <div className="grid grid-cols-2 gap-3"><Field label="السنة الدراسية"><input type="number" min={1} max={6} className="field" value={f.year} onChange={(e) => setF({ ...f, year: Number(e.target.value) })} /></Field><Field label="المسار المهني المستهدف"><select className="field" value={f.target} onChange={(e) => setF({ ...f, target: e.target.value })} data-testid="select-target-career">{Object.keys(CAREERS).map((c) => <option key={c}>{c}</option>)}</select></Field></div>
          <Field label="الاهتمامات المهنية (مفصولة بفواصل)"><input className="field" value={f.interests} onChange={(e) => setF({ ...f, interests: e.target.value })} /></Field>
          <Field label="نبذة"><textarea className="field min-h-20" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></Field>
          <button className="btn btn-primary w-full" disabled={!f.name.trim()} onClick={() => { mutate((d) => { d.profile = { ...f, interests: f.interests.split(/[,،]/).map((s) => s.trim()).filter(Boolean) }; }); setEdit(false); toast({ title: 'تم حفظ الملف الشخصي' }); }} data-testid="button-save-profile">حفظ</button>
        </div>
      </Modal>
    </>
  );
}

const ROLE_PROFILES = {
  professor: { bio: 'تدرّس التفاعل بين الإنسان والحاسب وتشرف على مشاريع التخرج، وتربط نظرية قابلية الاستخدام بموجزات تنشرها فرق المنتجات في الرياض.', experience: ['أستاذ مشارك، كلية علوم الحاسب والمعلومات بجامعة الملك سعود (من 2017 حتى الآن)', 'دكتوراه في التفاعل بين الإنسان والحاسب', 'أشرفت على 46 فريق تخرج'], expertise: ['تقييم قابلية الاستخدام', 'تصميم الواجهات العربية', 'مناهج البحث'] },
  company: { bio: 'استوديو منتجات تقنية مالية في الرياض يبني أدوات الدفع والفوترة لصغار التجار.', experience: ['تأسست عام 2019، 140 موظفًا (تجريبي)', 'توظف من 12 إلى 18 متدربًا سنويًا', 'تنشر تحديات كل فصل دراسي'], expertise: ['تصميم المنتجات', 'هندسة الواجهات الأمامية', 'تحليلات البيانات'] },
  professional: { bio: 'مصمم منتجات وظّف وأرشد مصممين مبتدئين لتسع سنوات، ويؤمن بأن ملف الأعمال يجب أن يُظهر القرارات لا الزخرفة.', experience: ['قائد تصميم المنتجات، قمة الصحية (من 2021 حتى الآن)', 'مصمم أول في شركة تجارة إلكترونية ناشئة بالرياض (2017 إلى 2021)', 'أرشد 31 طالبًا على نَسْج (تجريبي)'], expertise: ['أنظمة التصميم', 'تجربة المستخدم الصحية', 'نقد التصميم'] },
  club: { bio: 'نادٍ طلابي في جامعة الملك سعود ينظم سباقات التصميم وعيادات ملفات الأعمال ويوم تجربة المستخدم السنوي.', experience: ['تأسس عام 2021', '180 عضوًا نشطًا (تجريبي)', 'شريك لكلية علوم الحاسب والمعلومات'], expertise: ['تنظيم الفعاليات', 'سباقات التصميم', 'التعلم بين الأقران'] },
};

function RoleProfile() {
  const st = useDemo();
  const r = st.role as Exclude<typeof st.role, 'student'>;
  const p = PERSONAS[r];
  const d = ROLE_PROFILES[r];
  const contribs = st.posts.filter((x) => x.author === p.name);
  const evals = st.submissions.filter((s) => s.evaluator?.name === p.name);
  return (
    <>
      <section className="panel rise overflow-hidden">
        <SaduBand height={12} />
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:p-8">
          <Initials name={p.name} size={88} tone={r === 'company' ? 'oasis' : 'indigo'} />
          <div><p className="eyebrow">الملف الشخصي: {ROLE_META[r].label}</p><h1 className="font-display text-4xl font-semibold" data-testid="text-profile-name">{p.name}</h1><p className="mt-1 text-sm text-muted-foreground">{p.title} · {p.org}</p><p className="mt-3 max-w-2xl">{d.bio}</p></div>
        </div>
      </section>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel p-6"><p className="eyebrow mb-3">{r === 'company' || r === 'club' ? 'نبذة' : 'الخبرة المهنية'}</p><ul className="space-y-2 text-sm">{d.experience.map((e) => <li key={e}>{e}</li>)}</ul></section>
        <section className="panel p-6"><p className="eyebrow mb-3">مجالات الخبرة</p><div className="flex flex-wrap gap-1.5">{d.expertise.map((e) => <span key={e} className="chip">{e}</span>)}</div></section>
        <section className="panel p-6"><p className="eyebrow mb-3">المساهمات على نَسْج</p><ul className="space-y-1.5 text-sm"><li>{contribs.length} منشورات</li><li>{evals.length} تقييمات مكتملة</li>{r === 'professional' && <li>{st.bookings.filter((b) => b.mentorId === 'm-1').length} جلسات إرشاد في النسخة التجريبية</li>}{r === 'club' && <li>{st.activities.length} أنشطة منشورة</li>}{r === 'company' && <li>{st.challenges.filter((c) => c.org === NAMES.company).length} تحديات · {st.shortlist.length} في القائمة المختصرة</li>}</ul></section>
      </div>
      {(r === 'professional' || r === 'professor') && (
        <section className="panel mt-6 p-6"><p className="eyebrow mb-3">{r === 'professional' ? 'سجل الإرشاد والتقييم' : 'سجل التقييم'}</p>
          <ul className="divide-y">{evals.map((s) => <li key={s.id} className="flex justify-between py-2 text-sm"><span>{s.title} · {s.studentName}</span><span className="font-mono">{s.result}</span></li>)}{r === 'professional' && st.bookings.filter((b) => b.mentorId === 'm-1').map((b) => <li key={b.id} className="flex justify-between py-2 text-sm"><span>إرشاد: {b.topic}</span><span className="chip">{statusLabel(b.status)}</span></li>)}</ul>
          {evals.length === 0 && r === 'professor' && <p className="text-sm text-muted-foreground">لا توجد تقييمات في هذه الجلسة التجريبية بعد.</p>}
        </section>
      )}
      <div className="mt-6"><DemoNote>شخصية تجريبية</DemoNote></div>
    </>
  );
}

export default function Profile() {
  const { role } = useDemo();
  useMeta('الملف الشخصي', 'ملف نَسْج حسب الدور: الخبرة والمهارات والمساهمات والسجل.');
  return role === 'student' ? <StudentProfile /> : <RoleProfile />;
}
