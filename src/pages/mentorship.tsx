import { useState } from 'react';
import { MessagesSquare, CalendarDays, Plus, X, Check } from 'lucide-react';
import { useDemo, useMeta, mutate, newId, log } from '@/lib/store';
import { type Mentor, type Booking } from '@/lib/data';
import { PageHeader, Empty, Modal, Field, Initials, Tabs, DemoNote } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { statusLabel } from '@/lib/i18n';

function Book({ m, onClose }: { m: Mentor; onClose: () => void }) {
  const [slot, setSlot] = useState(m.slots[0] ?? '');
  const [topic, setTopic] = useState('');
  const { toast } = useToast();
  const save = () => {
    mutate((d) => { d.bookings.unshift({ id: newId('b'), mentorId: m.id, slot, topic, status: 'requested' }); const mm = d.mentors.find((x) => x.id === m.id)!; mm.slots = mm.slots.filter((s) => s !== slot); log(d, `طلب جلسة إرشاد مع ${m.name}`, 'mentorship'); });
    toast({ title: 'تم طلب الجلسة (تجريبي)', description: `سيظهر الطلب في قائمة إرشاد ${m.name}. لا تُرسل أي رسالة حقيقية.` });
    onClose();
  };
  return (
    <Modal open onClose={onClose} title={`حجز جلسة مع ${m.name}`}>
      <div className="space-y-4">
        <div><span className="label">المواعيد المتاحة</span><div className="grid grid-cols-2 gap-2">{m.slots.map((s) => <button key={s} onClick={() => setSlot(s)} className={cn('rounded-xl border p-3 text-start text-sm transition-colors', slot === s ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.07)] font-semibold' : 'hover:bg-[hsl(var(--secondary)/.5)]')} data-testid={`button-slot-${m.slots.indexOf(s)}`}>{s}</button>)}</div></div>
        <Field label="على ماذا تريد أن تعمل؟"><textarea className="field min-h-20" value={topic} onChange={(e) => setTopic(e.target.value)} data-testid="input-booking-topic" /></Field>
        <button className="btn btn-primary w-full" disabled={!slot || !topic} onClick={save} data-testid="button-confirm-booking">طلب الجلسة</button>
      </div>
    </Modal>
  );
}

function StudentMentorship() {
  const st = useDemo();
  const [tab, setTab] = useState<'find' | 'sessions'>('find');
  const [booking, setBooking] = useState<Mentor | null>(null);
  return (
    <>
      <PageHeader eyebrow="الإرشاد" title="تعلّم كيف يُقيَّم العمل فعلًا" desc="جلسات مع مختصين يراجعون مشاريع حقيقية كل أسبوع." />
      <Tabs value={tab} onChange={setTab} items={[{ value: 'find', label: 'المرشدون', count: st.mentors.length }, { value: 'sessions', label: 'جلساتي', count: st.bookings.length }]} />
      {tab === 'find' ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{st.mentors.map((m, i) => (
          <article key={m.id} className="panel lift rise flex flex-col p-5" style={{ animationDelay: `${i * 50}ms` }} data-testid={`card-mentor-${m.id}`}>
            <div className="flex items-center gap-3"><Initials name={m.name} size={46} tone={(['madder', 'indigo', 'oasis'] as const)[i % 3]} /><div><h3 className="font-semibold">{m.name}</h3><p className="text-xs text-muted-foreground">{m.title}، {m.org} · {m.years} سنوات</p></div></div>
            <p className="mt-3 flex-1 text-sm text-muted-foreground">{m.bio}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{m.expertise.map((e) => <span key={e} className="chip">{e}</span>)}</div>
            <button className="btn btn-primary btn-sm mt-4 self-start" disabled={m.slots.length === 0} onClick={() => setBooking(m)} data-testid={`button-book-${m.id}`}><CalendarDays className="h-3.5 w-3.5" /> {m.slots.length ? `احجز · ${m.slots.length} مواعيد` : 'لا مواعيد متاحة'}</button>
          </article>
        ))}</div>
      ) : st.bookings.length === 0 ? <Empty icon={MessagesSquare} title="لا توجد جلسات بعد" body="احجز مع مرشد لتحصل على ملاحظات من القطاع على عملك." /> : (
        <div className="space-y-3">{st.bookings.map((b) => { const m = st.mentors.find((x) => x.id === b.mentorId); return (
          <div key={b.id} className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center" data-testid={`row-booking-${b.id}`}>
            <Initials name={m?.name ?? 'مرشد'} size={38} />
            <div className="flex-1"><p className="font-semibold">{b.topic}</p><p className="text-xs text-muted-foreground">{m?.name} · {b.slot}</p>{b.notes && <p className="mt-1 text-sm">ملاحظات: {b.notes}</p>}</div>
            <span className="chip">{statusLabel(b.status)}</span>
            {b.status === 'requested' && <button className="btn btn-ghost btn-sm" onClick={() => mutate((d) => { d.bookings = d.bookings.filter((x) => x.id !== b.id); const mm = d.mentors.find((x) => x.id === b.mentorId); if (mm) mm.slots.push(b.slot); })} data-testid={`button-cancel-${b.id}`}>إلغاء</button>}
          </div>); })}</div>
      )}
      {booking && <Book m={booking} onClose={() => setBooking(null)} />}
    </>
  );
}

function ProfessionalMentorship() {
  const st = useDemo();
  const me = st.mentors.find((m) => m.id === 'm-1')!;
  const [slot, setSlot] = useState('');
  const [notesFor, setNotesFor] = useState<Booking | null>(null);
  const [notes, setNotes] = useState('');
  const { toast } = useToast();
  const mine = st.bookings.filter((b) => b.mentorId === 'm-1');
  return (
    <>
      <PageHeader eyebrow="الإرشاد" title="امنح وقتك حيث يتضاعف أثره" desc="افتح مواعيد، واقبل الطلبات، واترك ملاحظات جلسات يمكن للطلاب العمل بها." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="panel p-6">
          <p className="eyebrow">مواعيدك المتاحة</p>
          <div className="mt-3 flex gap-2"><input className="field" value={slot} onChange={(e) => setSlot(e.target.value)} placeholder="مثال: الأحد 14 أبريل، 19:00" data-testid="input-new-slot" /><button className="btn btn-primary" disabled={!slot} onClick={() => { mutate((d) => { d.mentors.find((m) => m.id === 'm-1')!.slots.push(slot); }); setSlot(''); toast({ title: 'تم نشر الموعد' }); }} data-testid="button-add-slot"><Plus className="h-4 w-4" /></button></div>
          <ul className="mt-4 space-y-2">{me.slots.map((s) => <li key={s} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">{s}<button aria-label={`إزالة ${s}`} onClick={() => mutate((d) => { const m = d.mentors.find((x) => x.id === 'm-1')!; m.slots = m.slots.filter((x) => x !== s); })}><X className="h-4 w-4 text-muted-foreground" /></button></li>)}</ul>
          {me.slots.length === 0 && <p className="mt-3 text-sm text-muted-foreground">لا توجد مواعيد متاحة.</p>}
        </div>
        <div className="panel p-6">
          <p className="eyebrow">الطلبات والجلسات</p>
          {mine.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">لا توجد طلبات بعد.</p> : <ul className="mt-3 divide-y">{mine.map((b) => (
            <li key={b.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center"><span className="flex-1"><span className="block text-sm font-semibold">{b.topic}</span><span className="text-xs text-muted-foreground">{st.profile.name} · {b.slot}</span>{b.notes && <span className="block text-xs">ملاحظات: {b.notes}</span>}</span>
              {b.status === 'requested' && <button className="btn btn-primary btn-sm" onClick={() => mutate((d) => { d.bookings.find((x) => x.id === b.id)!.status = 'confirmed'; })} data-testid={`button-accept-${b.id}`}><Check className="h-3.5 w-3.5" /> قبول</button>}
              {b.status === 'confirmed' && <button className="btn btn-accent btn-sm" onClick={() => { setNotesFor(b); setNotes(''); }} data-testid={`button-complete-${b.id}`}>إكمال مع ملاحظات</button>}
              {b.status === 'completed' && <span className="chip">مكتملة</span>}
            </li>))}</ul>}
        </div>
      </div>
      <Modal open={!!notesFor} onClose={() => setNotesFor(null)} title="ملاحظات الجلسة">
        <Field label="ما الخطوة التالية للطالب؟"><textarea className="field min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="input-session-notes" /></Field>
        <button className="btn btn-primary mt-4 w-full" disabled={!notes} onClick={() => { mutate((d) => { const b = d.bookings.find((x) => x.id === notesFor!.id)!; b.status = 'completed'; b.notes = notes; log(d, 'اكتملت جلسة إرشاد مع ملاحظات', 'mentorship'); }); setNotesFor(null); }} data-testid="button-save-notes">تحديد كمكتملة</button>
      </Modal>
      <div className="mt-6"><DemoNote>الحجوزات سجلات تجريبية؛ لا تُرسل أي رسائل</DemoNote></div>
    </>
  );
}

export default function Mentorship() {
  const { role } = useDemo();
  useMeta('الإرشاد', 'احجز جلسات مع مختصين ممارسين أو أتح مواعيد للإرشاد.');
  return role === 'professional' ? <ProfessionalMentorship /> : <StudentMentorship />;
}
