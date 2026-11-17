import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Target, Trash2 } from 'lucide-react';
import { LEVELS, type Skill, type SkillGoal } from '@/lib/data';
import { mutate, fmtDate } from '@/lib/store';
import { deleteSkillGoal, goalError, goalStatus, localDay, setSkillGoal } from '@/lib/skill-goals';
import { Field, Modal } from './kit';
import { Form } from './ui/form';
import { useToast } from '@/hooks/use-toast';

function GoalEditor({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const form = useForm<SkillGoal>({ defaultValues: skill.goal ?? { targetLevel: Math.min(skill.level + 1, LEVELS.length - 1), deadline: '' } });
  const { toast } = useToast();
  const [error, setError] = useState('');
  const save = form.handleSubmit((values) => {
    const invalid = goalError(values, skill.goal);
    if (invalid) { setError(invalid); return; }
    try {
      mutate((d) => setSkillGoal(d, skill.id, values), { requirePersistence: true });
      toast({ title: skill.goal ? 'تم تعديل الهدف الشخصي' : 'تم إنشاء الهدف الشخصي' });
      onClose();
    } catch {
      setError('تعذر حفظ الهدف. تأكد من إتاحة التخزين في المتصفح وحاول مجددًا.');
    }
  });
  return <Modal open onClose={onClose} title={`${skill.goal ? 'تعديل' : 'إنشاء'} هدف: ${skill.name}`}>
    <Form {...form}>
      <form onSubmit={save} className="space-y-4" noValidate>
        <p className="text-sm text-muted-foreground">المستوى الحالي المسجل: {LEVELS[skill.level]}. تحقيق الهدف مقارنة بمستواك المسجل، وليس توثيقًا للمهارة.</p>
        <Field label="مستوى الهدف"><select className="field" {...form.register('targetLevel', { valueAsNumber: true })} data-testid="select-goal-level">
          {LEVELS.map((level, i) => <option key={level} value={i}>{level}</option>)}
        </select></Field>
        <Field label="الموعد المستهدف" hint="بالتقويم الميلادي. الموعد للتخطيط، وليس توقعًا لتاريخ الإنجاز.">
          <input className="field" type="date" min={skill.goal?.deadline && skill.goal.deadline < localDay() ? skill.goal.deadline : localDay()} max="9999-12-31" {...form.register('deadline')} data-testid="input-goal-deadline" />
        </Field>
        {error && <p role="alert" className="text-sm text-destructive" data-testid="text-goal-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" onClick={onClose} data-testid="button-cancel-goal">إلغاء</button>
          <button type="submit" className="btn btn-primary" data-testid="button-save-goal">حفظ الهدف</button>
        </div>
      </form>
    </Form>
  </Modal>;
}

export function SkillGoalControls({ skill }: { skill: Skill }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  return <div className="mt-4 rounded-xl border p-3" data-testid={`goal-${skill.id}`}>
    {skill.goal ? <div className="space-y-1 text-xs">
      <p className="font-semibold">هدف شخصي: {LEVELS[skill.goal.targetLevel]}</p>
      <p>الحالي المسجل: {LEVELS[skill.level]} · الموعد: {fmtDate(`${skill.goal.deadline}T12:00:00`)}</p>
      <p data-testid={`status-goal-${skill.id}`}>{goalStatus(skill)}</p>
      <p className="text-muted-foreground">تحقيق الهدف لا يوثّق المهارة؛ التوثيق بالأدلة والتقييم.</p>
    </div> : <p className="text-xs text-muted-foreground">ما عندك هدف شخصي لهذه المهارة بعد.</p>}
    <div className="mt-2 flex flex-wrap gap-2">
      <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)} data-testid={`button-goal-${skill.id}`}><Target className="h-3.5 w-3.5" />{skill.goal ? 'تعديل الهدف' : 'إنشاء هدف'}</button>
      {skill.goal && <button className="btn btn-ghost btn-sm text-destructive" onClick={() => { setError(''); setDeleting(true); }} data-testid={`button-delete-goal-${skill.id}`}><Trash2 className="h-3.5 w-3.5" />حذف الهدف</button>}
    </div>
    {editing && <GoalEditor skill={skill} onClose={() => setEditing(false)} />}
    {deleting && <Modal open onClose={() => setDeleting(false)} title="حذف الهدف الشخصي؟">
      <p className="text-sm">سيُحذف هدف {skill.name} فقط. لن تتأثر المهارة أو مستواها أو أدلتها.</p>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={() => setDeleting(false)} data-testid="button-cancel-delete-goal">إلغاء</button>
        <button className="btn btn-accent" data-testid="button-confirm-delete-goal" onClick={() => {
          try {
            mutate((d) => deleteSkillGoal(d, skill.id), { requirePersistence: true });
            setDeleting(false);
            toast({ title: 'تم حذف الهدف الشخصي' });
          } catch { setError('تعذر حفظ الحذف. تحقق من تخزين المتصفح وحاول مجددًا.'); }
        }}>حذف الهدف</button>
      </div>
    </Modal>}
  </div>;
}
