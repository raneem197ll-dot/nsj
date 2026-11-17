import { LEVELS, type DemoState, type Skill, type SkillGoal } from './data';

/** Calendar dates stay date-only, including across local timezone boundaries. */
export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validGoalDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < '0001-01-01') return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function goalError(goal: SkillGoal, original?: SkillGoal, day = localDay()): string | null {
  if (!Number.isInteger(goal.targetLevel) || goal.targetLevel < 0 || goal.targetLevel >= LEVELS.length) return 'اختر مستوى هدف صالحًا.';
  if (!validGoalDate(goal.deadline)) return 'أدخل موعدًا ميلاديًا صالحًا.';
  // An expired goal can be edited without forcing an artificial new deadline.
  if (goal.deadline < day && goal.deadline !== original?.deadline) return 'اختر اليوم أو تاريخًا لاحقًا للموعد الجديد.';
  return null;
}

export function setSkillGoal(st: DemoState, skillId: string, goal: SkillGoal, day = localDay()) {
  const skill = st.skills.find((s) => s.id === skillId);
  if (!skill) throw new Error('لم تعد المهارة موجودة.');
  const error = goalError(goal, skill.goal, day);
  if (error) throw new Error(error);
  skill.goal = { ...goal };
}

export function deleteSkillGoal(st: DemoState, skillId: string) {
  const skill = st.skills.find((s) => s.id === skillId);
  if (!skill) throw new Error('لم تعد المهارة موجودة.');
  delete skill.goal;
}

export function skillsWithGoals(st: DemoState, skill = 'all', pathId = 'all') {
  const path = st.paths.find((p) => p.id === pathId);
  return st.skills.filter((s) => s.goal
    && (skill === 'all' || s.name === skill)
    && (pathId === 'all' || s.name === path?.skillName));
}

export function goalStatus(skill: Skill, day = localDay()) {
  if (!skill.goal) return null;
  if (skill.level >= skill.goal.targetLevel) return 'متحقق بحسب المستوى المسجل';
  if (skill.goal.deadline < day) return 'تجاوز الموعد';
  if (skill.goal.deadline === day) return 'موعده اليوم';
  return 'قيد العمل';
}
