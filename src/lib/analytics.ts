/**
 * Pure analytics derivation for نَسْج. No invented dates, no forecasts.
 * Reads optional `analytics` telemetry (events/snapshots) and dated entities only.
 */
import type { DemoState, Role, VState } from './data';
import { gaps } from './career';

export interface AEvent { id: string; at: string; role: Role; kind: string; entityId: string; label: string; skill?: string; pathId?: string; value?: number }
export interface ASnapshot { at: string; readiness: number; learningProgress: number; verified: number; totalSkills: number }
export interface ATelemetry { startedAt: string; events: AEvent[]; snapshots: ASnapshot[] }

export type Period = '30' | '90' | 'all';
export const PERIOD_LABEL: Record<Period, string> = { '30': 'آخر 30 يومًا', '90': 'آخر 90 يومًا', all: 'كل الفترة' };
const DAY = 86_400_000;

/** Parse ISO date / timestamp; returns ms or null for invalid/missing values. */
/** Strict: 'YYYY-MM-DD' = local start of that calendar day (device timezone, consistent with
 * the window `now`); full ISO timestamps parsed as-is. Invalid calendar dates are rejected. */
export function toMs(v: unknown): number | null {
  if (typeof v !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (m) {
    const y = +m[1], mo = +m[2], d = +m[3];
    const dt = new Date(y, mo - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt.getTime() : null;
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/.test(v)) return null;
  const t = Date.parse(v);
  return Number.isFinite(t) ? t : null;
}
const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

export function telemetry(st: DemoState): ATelemetry | null {
  const a = (st as DemoState & { analytics?: Partial<ATelemetry> }).analytics;
  if (!a || typeof a !== 'object') return null;
  const startedAt = toMs(a.startedAt) !== null ? (a.startedAt as string) : null;
  if (!startedAt) return null;
  const events = Array.isArray(a.events) ? a.events.filter((e): e is AEvent => !!e && typeof e.kind === 'string' && toMs(e.at) !== null) : [];
  const snapshots = Array.isArray(a.snapshots)
    ? a.snapshots.filter((s): s is ASnapshot => !!s && toMs(s.at) !== null && isNum(s.readiness) && isNum(s.learningProgress) && isNum(s.verified) && isNum(s.totalSkills))
    : [];
  return { startedAt, events, snapshots };
}

export interface Window { from: number | null; to: number; prevFrom: number | null; days: number | null }
export function windowFor(period: Period, now = Date.now()): Window {
  if (period === 'all') return { from: null, to: now, prevFrom: null, days: null };
  const d = Number(period);
  return { from: now - d * DAY, to: now, prevFrom: now - 2 * d * DAY, days: d };
}
export const inWindow = (ms: number | null, w: Window) => ms !== null && ms <= w.to && (w.from === null || ms >= w.from);

/** Previous-period comparison is only offered when telemetry covers BOTH whole windows. */
export function canCompare(tel: ATelemetry | null, w: Window) {
  if (!tel || w.prevFrom === null) return false;
  const s = toMs(tel.startedAt);
  return s !== null && s <= w.prevFrom;
}

export function pathPct(steps: { done: boolean }[]) { return steps.length ? Math.round((steps.filter((s) => s.done).length / steps.length) * 100) : 0; }

/* ---------- dated activity records ---------- */
export interface Rec { ms: number; label: string; source: 'سجل الأحداث' | 'تاريخ في السجل'; kind: string; skill?: string; pathId?: string }

/** Telemetry kinds whose date is NOT stored on the entity itself (avoid double counting). */
const EVENT_ONLY = new Set(['step_completed', 'evaluation_completed', 'skill_added', 'path_completed', 'booking_completed', 'registration_added', 'responsibility_recorded']);

export function studentRecords(st: DemoState, tel: ATelemetry | null): Rec[] {
  const out: Rec[] = [];
  for (const s of st.submissions) if (s.studentId === 'me') { const ms = toMs(s.submittedAt); if (ms !== null) out.push({ ms, label: `تسليم: ${s.title}`, source: 'تاريخ في السجل', kind: 'submission', skill: s.skill }); }
  for (const sk of st.skills) for (const e of sk.evidence) { const ms = toMs(e.date); if (ms !== null) out.push({ ms, label: `دليل: ${e.title}`, source: 'تاريخ في السجل', kind: 'evidence', skill: sk.name }); }
  for (const p of st.paths) { const ms = toMs(p.startedAt); if (ms !== null) out.push({ ms, label: `بدء مسار: ${p.title}`, source: 'تاريخ في السجل', kind: 'path', skill: p.skillName, pathId: p.id }); }
  if (tel) for (const e of tel.events) if (e.role === 'student' && EVENT_ONLY.has(e.kind)) { const ms = toMs(e.at); if (ms !== null) out.push({ ms, label: e.label, source: 'سجل الأحداث', kind: e.kind, skill: e.skill, pathId: e.pathId }); }
  return out.sort((a, b) => a.ms - b.ms);
}

export type Grain = 'week' | 'month' | 'year';
export interface Bucket { t: number; count: number; label: string }
export const GRAIN_LABEL: Record<Grain, string> = { week: 'أسبوع', month: 'شهر', year: 'سنة' };
/** Grain for a window: weekly for 30/90 days; for "all", monthly up to 5 years, yearly beyond. */
export function grainFor(recs: { ms: number }[], w: Window): Grain {
  if (w.from !== null) return 'week';
  if (!recs.length) return 'month';
  let min = Infinity; for (const r of recs) if (r.ms < min) min = r.ms;
  return w.to - min > 5 * 366 * DAY ? 'year' : 'month';
}
/** Proportional, gap-filled time buckets over the full window. Never truncates. */
export function bucketize(recs: { ms: number }[], w: Window, grain: Grain = grainFor(recs, w)): Bucket[] {
  const valid = recs.filter((r) => Number.isFinite(r.ms) && r.ms <= w.to);
  if (!valid.length && w.from === null) return [];
  let start = w.from ?? Infinity; if (w.from === null) for (const r of valid) if (r.ms < start) start = r.ms;
  const keyOf = (ms: number) => {
    const d = new Date(ms);
    if (grain === 'year') return new Date(d.getFullYear(), 0, 1).getTime();
    if (grain === 'month') return new Date(d.getFullYear(), d.getMonth(), 1).getTime();
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    day.setDate(day.getDate() - ((day.getDay() + 1) % 7)); /* week starts Saturday */
    return day.getTime();
  };
  const next = (k: number) => { const d = new Date(k); if (grain === 'year') return new Date(d.getFullYear() + 1, 0, 1).getTime(); if (grain === 'month') return new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime(); return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getTime(); };
  const map = new Map<number, number>();
  for (let k = keyOf(start), end = keyOf(w.to); k <= end; k = next(k)) map.set(k, 0);
  for (const r of valid) { const kk = keyOf(r.ms); if (map.has(kk)) map.set(kk, (map.get(kk) ?? 0) + 1); }
  return [...map.entries()].map(([t, count]) => ({ t, count, label: fmtBucket(t, grain) }));
}
export function fmtBucket(t: number, grain: Grain | boolean) {
  const g: Grain = grain === true ? 'month' : grain === false ? 'week' : grain;
  const opt: Intl.DateTimeFormatOptions = g === 'year' ? { year: 'numeric' } : g === 'month' ? { month: 'short', year: 'numeric' } : { day: 'numeric', month: 'short' };
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', opt).format(t);
}
export const fmtDay = (t: number) => new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' }).format(t);

/* ---------- student ---------- */
export interface StudentFilters { period: Period; skill: string; pathId: string }

export function studentAnalytics(st: DemoState, f: StudentFilters, now = Date.now()) {
  const tel = telemetry(st);
  const w = windowFor(f.period, now);
  const matches = (r: { skill?: string; pathId?: string }) => (f.skill === 'all' || r.skill === f.skill) && (f.pathId === 'all' || r.pathId === f.pathId || (!r.pathId && st.paths.find((p) => p.id === f.pathId)?.skillName === r.skill));
  const all = studentRecords(st, tel).filter(matches);
  const recs = all.filter((r) => inWindow(r.ms, w));
  const grain = grainFor(recs, w);
  const activity = bucketize(recs, w, grain);
  const compare = canCompare(tel, w);
  const prevCount = compare ? all.filter((r) => r.ms >= (w.prevFrom as number) && r.ms < (w.from as number)).length : null;

  const g = gaps(st);
  const readiness = g.length ? Math.round(g.reduce((a, x) => a + x.readiness, 0) / g.length) : 0;
  const learning = st.paths.length ? Math.round(st.paths.reduce((a, p) => a + pathPct(p.steps), 0) / st.paths.length) : 0;
  const verified = st.skills.filter((s) => s.state === 'verified').length;

  const snaps = (tel?.snapshots ?? []).map((s) => ({ t: toMs(s.at) as number, readiness: s.readiness, learning: s.learningProgress, verified: s.verified, total: s.totalSkills })).filter((s) => inWindow(s.t, w)).sort((a, b) => a.t - b.t);

  // Effective skill scope: explicit skill filter, else the selected path's skill.
  const scopeSkill = f.skill !== 'all' ? f.skill : f.pathId !== 'all' ? st.paths.find((p) => p.id === f.pathId)?.skillName ?? 'all' : 'all';
  const inScope = (name: string) => scopeSkill === 'all' || name === scopeSkill;
  const skillScope = st.skills.filter((s) => inScope(s.name));
  const states: { state: VState; count: number }[] = (['declared', 'assessed', 'evaluated', 'verified'] as VState[]).map((state) => ({ state, count: skillScope.filter((s) => s.state === state).length }));

  const gapRows = g.filter((x) => inScope(x.skill)).map((x) => ({ skill: x.skill, required: x.level + 1, current: Math.max(0, x.have + 1), started: x.have >= 0, readiness: x.readiness, met: x.met, state: x.state }));

  const paths = st.paths.filter((p) => (f.pathId === 'all' || p.id === f.pathId) && (f.skill === 'all' || p.skillName === f.skill)).map((p) => ({ id: p.id, title: p.title, pct: pathPct(p.steps), done: p.steps.filter((s) => s.done).length, total: p.steps.length, completed: !!p.completedAt }));

  // Rubric: evaluated submissions by me. Evaluation date only known from telemetry.
  const evalAt = new Map<string, number>();
  for (const e of tel?.events ?? []) if (e.kind === 'evaluation_completed') { const ms = toMs(e.at); if (ms !== null) evalAt.set(e.entityId, ms); }
  const evaluated = st.submissions.filter((s) => s.studentId === 'me' && s.status === 'evaluated' && s.scores && inScope(s.skill));
  const datedEvals = evaluated.filter((s) => (f.period === 'all' ? true : inWindow(evalAt.get(s.id) ?? null, w)));
  const crit = new Map<string, { sum: number; n: number; weight: number }>();
  for (const s of datedEvals) for (const c of s.rubric) { const v = s.scores?.[c.name]; if (!isNum(v)) continue; const m = crit.get(c.name) ?? { sum: 0, n: 0, weight: c.weight }; m.sum += v; m.n += 1; crit.set(c.name, m); }
  const rubric = [...crit.entries()].map(([name, m]) => ({ name, avg: Math.round((m.sum / m.n) * 100) / 100, n: m.n, weight: m.weight }));
  const undatedEvals = f.period === 'all' ? evaluated.filter((s) => !evalAt.has(s.id)).length : 0;

  return { tel, w, recs, grain, scopeSkill, scopeCount: skillScope.length, activity, compare, prevCount, kpi: { readiness, learning, verified, total: st.skills.length }, snaps, states, gapRows, paths, rubric, evalCount: datedEvals.length, undatedEvals };
}

/* ---------- other roles: event counts in window ---------- */
export function roleEvents(st: DemoState, role: Role, period: Period, now = Date.now()) {
  const tel = telemetry(st);
  const w = windowFor(period, now);
  const evs = (tel?.events ?? []).filter((e) => e.role === role);
  const cur = evs.filter((e) => inWindow(toMs(e.at), w));
  const compare = canCompare(tel, w);
  const prev = compare ? evs.filter((e) => { const m = toMs(e.at) as number; return m >= (w.prevFrom as number) && m < (w.from as number); }) : null;
  const byKind = (list: AEvent[], k: string) => list.filter((e) => e.kind === k).length;
  const evRecs = cur.map((e) => ({ ms: toMs(e.at) as number }));
  const grain = grainFor(evRecs, w);
  return { tel, w, cur, prev, compare, byKind, grain, activity: bucketize(evRecs, w, grain) };
}

/** Counts of dated entities by month (honest, uses only stored dates). */
export function datedCounts(dates: (string | undefined)[], w: Window) {
  const ms = dates.map((d) => toMs(d)).filter((m): m is number => m !== null && inWindow(m, w));
  const recs = ms.map((m) => ({ ms: m }));
  const grain = grainFor(recs, w);
  return { n: ms.length, grain, buckets: bucketize(recs, w, grain) };
}
