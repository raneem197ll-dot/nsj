import type { DemoState, Role } from './data';
import { gaps } from './career';

export interface AnalyticsEvent {
  id: string;
  at: string;
  role: Role;
  kind: string;
  entityId: string;
  label: string;
  skill?: string;
  pathId?: string;
  value?: number;
}

export interface ProgressSnapshot {
  at: string;
  readiness: number;
  learningProgress: number;
  verified: number;
  totalSkills: number;
}

export interface AnalyticsLedger {
  startedAt: string;
  events: AnalyticsEvent[];
  snapshots: ProgressSnapshot[];
}

function snapshot(st: DemoState, at: string): ProgressSnapshot {
  const requirements = gaps(st);
  const progress = st.paths.map((p) => p.steps.length
    ? p.steps.filter((s) => s.done).length / p.steps.length * 100 : 0);
  return {
    at,
    readiness: requirements.length
      ? Math.round(requirements.reduce((sum, r) => sum + r.readiness, 0) / requirements.length) : 0,
    learningProgress: progress.length
      ? Math.round(progress.reduce((sum, v) => sum + v, 0) / progress.length) : 0,
    verified: st.skills.filter((s) => s.state === 'verified').length,
    totalSkills: st.skills.length,
  };
}

/** Start observing now. Legacy untimed aggregates are deliberately not backdated. */
export function ensureAnalytics(st: DemoState, at = new Date().toISOString()): DemoState {
  if (!st.analytics || !Array.isArray(st.analytics.events) || !Array.isArray(st.analytics.snapshots)) {
    st.analytics = { startedAt: at, events: [], snapshots: [snapshot(st, at)] };
  }
  return st;
}

/** Observe domain changes centrally so all existing forms participate without rewriting them. */
export function recordMutation(before: DemoState, after: DemoState, at = new Date().toISOString()) {
  ensureAnalytics(after, at);
  const ledger = after.analytics!;
  const batch: AnalyticsEvent[] = [];
  const push = (kind: string, entityId: string, label: string, extra: Partial<AnalyticsEvent> = {}) => {
    batch.push({ ...extra, id: crypto.randomUUID(), at, role: before.role, kind, entityId, label });
  };
  for (const sub of after.submissions) {
    const old = before.submissions.find((s) => s.id === sub.id);
    if (!old) push('submission_created', sub.id, sub.title, {
      skill: sub.skill, pathId: sub.source === 'path' ? sub.refId : undefined,
    });
    if (sub.status === 'evaluated' && (old?.status !== 'evaluated'
      || sub.result !== old.result || JSON.stringify(sub.scores) !== JSON.stringify(old.scores))) {
      push('evaluation_completed', sub.id, sub.title, { skill: sub.skill, value: sub.result });
    }
  }
  for (const path of after.paths) {
    const old = before.paths.find((p) => p.id === path.id);
    const extra = { pathId: path.id, skill: path.skillName };
    if (!old) push('path_created', path.id, path.title, extra);
    // Placement exemptions are not completed learning actions.
    if (old) for (const step of path.steps) {
      if (step.done && !old.steps.find((s) => s.id === step.id)?.done) {
        push('step_completed', step.id, step.title, extra);
      }
    }
    if (path.completedAt && !old?.completedAt) push('path_completed', path.id, path.title, extra);
  }
  for (const skill of after.skills) {
    const old = before.skills.find((s) => s.id === skill.id);
    if (!old) push('skill_added', skill.id, skill.name, { skill: skill.name });
    for (const evidence of skill.evidence) {
      if (!old?.evidence.some((e) => e.id === evidence.id)) {
        push('evidence_added', evidence.id, evidence.title, { skill: skill.name });
      }
    }
  }
  for (const challenge of after.challenges) {
    if (!before.challenges.some((c) => c.id === challenge.id)) {
      push('challenge_created', challenge.id, challenge.title, { skill: challenge.skill });
    }
  }
  for (const req of after.requirements) {
    if (!before.requirements.some((r) => r.id === req.id)) push('requirement_created', req.id, req.skill, { skill: req.skill });
  }
  for (const post of after.posts) {
    if (!before.posts.some((p) => p.id === post.id)) push('post_created', post.id, post.title);
  }
  for (const booking of after.bookings) {
    const old = before.bookings.find((b) => b.id === booking.id);
    if (!old) push('booking_created', booking.id, booking.topic);
    if (booking.status === 'completed' && old?.status !== 'completed') {
      push('booking_completed', booking.id, booking.topic);
    }
  }
  for (const activity of after.activities) {
    const old = before.activities.find((a) => a.id === activity.id);
    if (!old) push('activity_created', activity.id, activity.title);
    for (const name of activity.registered) {
      if (!old?.registered.includes(name)) push('registration_added', activity.id, activity.title);
    }
    for (const assignment of activity.assignments) {
      const wasRecorded = old?.assignments.some((a) =>
        a.studentId === assignment.studentId && a.role === assignment.role && a.recorded);
      if (assignment.recorded && !wasRecorded) {
        push('responsibility_recorded', activity.id, `${activity.title} — ${assignment.role}`);
      }
    }
  }
  ledger.events.push(...batch);
  // Record actual changes only: preferences/role switches do not inflate progress history.
  const current = snapshot(after, at);
  const prior = ledger.snapshots.at(-1);
  const studentProgressChanged = JSON.stringify(before.skills) !== JSON.stringify(after.skills)
    || JSON.stringify(before.paths) !== JSON.stringify(after.paths)
    || before.profile.target !== after.profile.target;
  if (!prior || studentProgressChanged || prior.readiness !== current.readiness
    || prior.learningProgress !== current.learningProgress || prior.verified !== current.verified
    || prior.totalSkills !== current.totalSkills) {
    ledger.snapshots.push(current);
  }
}
