import { useEffect, useSyncExternalStore } from 'react';
import * as EN from './data-en';
import { CAREERS as CAREERS_EN } from './career-en';
import { CAREERS } from './career';
import { ensureAnalytics, recordMutation } from './telemetry';
import { seed, TRACKS, type DemoState, type Skill, type VState, type Evidence, type Candidate, type Submission, type Evaluator, PERSONAS, LEVELS } from './data';

const KEY = 'nasj-demo-state-v1';
const listeners = new Set<() => void>();

export const VERIFY_RULE = { minScore: 70, minEvidence: 3 };

/** Rules-based verification ladder. Participation certificates never count. */
export function computeState(s: Skill): VState {
  const qualifying = s.evidence.filter((e) => e.type !== 'participation');
  const assessed = s.evidence.some((e) => e.type === 'assessment' || e.type === 'hackathon');
  const evaluated = s.evidence.some((e) => e.type === 'professor-eval' || e.type === 'professional-eval');
  if (evaluated && assessed && (s.score ?? 0) >= VERIFY_RULE.minScore && qualifying.length >= VERIFY_RULE.minEvidence) return 'verified';
  if (evaluated && assessed) return 'evaluated';
  if (assessed) return 'assessed';
  return 'declared';
}

function normalize(st: DemoState): DemoState {
  st.skills.forEach((s) => (s.state = computeState(s)));
  return st;
}

const SKIP_KEYS = new Set(['id', 'studentId', 'refId', 'mentorId', 'candidateId', 'projectId', 'projectIds', 'category', 'track', 'url', 'link', 'version', 'orgKind', 'evaluatorRole', 'authorRole', 'state', 'band', 'date', 'submittedAt', 'createdAt', 'deadline', 'startedAt', 'completedAt', 'assessedAt', 'shortlist']);

const TOKEN_KEYS = new Set(['type', 'kind', 'status', 'source', 'role']);

/** Build an English to Arabic map by walking the old English seed alongside the Arabic seed. */
function buildMap(): Map<string, string> {
  const m = new Map<string, string>();
  const walk = (a: unknown, b: unknown) => {
    if (typeof a === 'string' && typeof b === 'string') { if (a !== b) m.set(a, b); return; }
    if (Array.isArray(a) && Array.isArray(b)) { a.forEach((x, i) => walk(x, b[i])); return; }
    if (a && b && typeof a === 'object' && typeof b === 'object') {
      const ka = Object.keys(a as object), kb = Object.keys(b as object);
      const keyed = ka.every((k) => k in (b as object));
      if (keyed) ka.forEach((k) => walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
      else ka.forEach((k, i) => { if (kb[i]) { if (k !== kb[i]) m.set(k, kb[i]); walk((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[kb[i]]); } });
    }
  };
  walk(EN.seed(), seed());
  walk(EN.TRACKS, TRACKS);
  walk(EN.PERSONAS, PERSONAS);
  walk(EN.LEVELS, LEVELS);
  walk(CAREERS_EN, CAREERS);
  // Short tokens produced by the app for evaluators and authors.
  m.set('Professor', 'أستاذ جامعي'); m.set('Professional', 'مختص من القطاع');
  return m;
}

function localize(st: DemoState): DemoState {
  const m = buildMap();
  const tx = (v: unknown, key?: string): unknown => {
    if (key && SKIP_KEYS.has(key)) return v;
    if (key && TOKEN_KEYS.has(key) && typeof v === 'string' && /^[a-z][a-z-]*$/.test(v)) return v;
    if (typeof v === 'string') return m.get(v) ?? v;
    if (Array.isArray(v)) return v.map((x) => tx(x));
    if (v && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        const nk = key === 'scores' ? (m.get(k) ?? k) : k;
        out[nk] = tx(val, k);
      }
      return out;
    }
    return v;
  };
  const out = tx(st) as DemoState;
  out.role = st.role;
  out.locale = 'ar';
  return out;
}

const NEW_CHALLENGES = ['ch-sales', 'ch-job-1', 'ch-proj-1'];

/** Brings demo states saved before the story update in line with the current seed. */
function migrateStory(saved: DemoState): DemoState {
  const raw = JSON.stringify(saved);
  const st = raw.includes('ريم القحطاني') || raw.includes('نورة الشهري')
    ? JSON.parse(raw.split('ريم القحطاني').join('نور القحطاني').split('نورة الشهري').join('هيا الشهري')) as DemoState
    : saved;
  const s = seed();
  const added = s.challenges.filter((c) => NEW_CHALLENGES.includes(c.id) && !st.challenges.some((x) => x.id === c.id));
  st.challenges.push(...added);
  st.submissions.push(...s.submissions.filter((x) => added.some((c) => c.id === x.refId) && !st.submissions.some((y) => y.id === x.id)));
  return st;
}

function load(): DemoState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DemoState;
      const loc = ensureAnalytics(normalize(migrateStory(parsed.locale === 'ar' ? parsed : localize(parsed))));
      try { localStorage.setItem(KEY, JSON.stringify(loc)); } catch { /* ignore */ }
      return loc;
    }
  } catch { /* ignore */ }
  const initial = ensureAnalytics(normalize(seed()));
  try { localStorage.setItem(KEY, JSON.stringify(initial)); } catch { /* storage may be unavailable */ }
  return initial;
}

let state: DemoState = load();

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function mutate(fn: (draft: DemoState) => void, options?: { requirePersistence: boolean }) {
  const draft = structuredClone(state);
  fn(draft);
  normalize(draft);
  recordMutation(state, draft);
  // Goal forms must not report success if the browser cannot save the change.
  if (options?.requirePersistence) localStorage.setItem(KEY, JSON.stringify(draft));
  state = draft;
  persist();
}

export function resetDemo() {
  state = ensureAnalytics(normalize(seed()));
  persist();
}

export function useDemo(): DemoState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
  );
}

export const today = () => new Date().toISOString().slice(0, 10);
export const newId = (p: string) => `${p}-${Math.random().toString(36).slice(2, 8)}`;

export function fmtDate(iso: string) {
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleDateString('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Ensure the student has a skill record; returns it (in draft). */
export function ensureSkill(d: DemoState, name: string, category = 'Design'): Skill {
  let s = d.skills.find((x) => x.name.toLowerCase() === name.toLowerCase());
  if (!s) {
    s = { id: newId('sk'), name, category, level: 0, state: 'declared', evidence: [], history: [{ date: today(), note: 'أضيفت المهارة من نشاط' }], projectIds: [], recommendations: ['أكمل تقييمًا عمليًا لتتجاوز حالة «مُعلنة»'], developing: true };
    d.skills.push(s);
  }
  return s;
}

export function addEvidence(d: DemoState, skillName: string, ev: Omit<Evidence, 'id'>, category?: string) {
  const s = ensureSkill(d, skillName, category);
  s.evidence.unshift({ ...ev, id: newId('ev') });
  s.history.push({ date: ev.date, note: `${ev.title}` });
  return s;
}

export function log(d: DemoState, label: string, kind: string) {
  d.log.unshift({ date: today(), label, kind });
  d.weekly[d.weekly.length - 1] += 1;
}

export function weightedResult(sub: Submission, scores: Record<string, number>) {
  const total = sub.rubric.reduce((a, c) => a + c.weight, 0) || 1;
  return Math.round(sub.rubric.reduce((a, c) => a + ((scores[c.name] ?? 0) / 5) * c.weight, 0) / total * 100);
}

/** Apply an evaluation from professor/professional and propagate to the student's passport. */
export function applyEvaluation(d: DemoState, subId: string, scores: Record<string, number>, feedback: string, evaluator: Evaluator, role: 'professor' | 'professional') {
  const sub = d.submissions.find((s) => s.id === subId);
  if (!sub) return;
  const result = weightedResult(sub, scores);
  Object.assign(sub, { scores, feedback, evaluator, evaluatorRole: role, status: 'evaluated', result });
  if (sub.studentId === 'me') {
    const s = addEvidence(d, sub.skill, { type: role === 'professor' ? 'professor-eval' : 'professional-eval', title: `تقييم وفق المعايير لـ «${sub.title}»، ${result}/100`, source: `${evaluator.name}، ${evaluator.org}`, date: today() });
    s.score = Math.max(s.score ?? 0, result);
    s.evaluator = evaluator;
    s.assessedAt = today();
    if (feedback) s.recommendations.unshift(feedback.slice(0, 140));
  } else {
    const c = d.candidates.find((x) => x.id === sub.studentId);
    if (c) {
      let cs = c.skills.find((x) => x.name === sub.skill);
      if (!cs) { cs = { name: sub.skill, level: 1, state: 'assessed', category: 'Design' }; c.skills.push(cs); }
      cs.score = Math.max(cs.score ?? 0, result);
      cs.state = cs.score >= VERIFY_RULE.minScore ? 'verified' : 'evaluated';
    }
  }
  log(d, `قيّم ${evaluator.name} «${sub.title}» (${sub.studentName})، ${result}/100`, 'evaluation');
}

/** Candidates, with the live student replacing the seeded "me" record. */
export function useCandidates(st: DemoState): Candidate[] {
  return st.candidates.map((c) => c.id === 'me' ? { ...c, name: st.profile.name, university: st.profile.university, major: st.profile.major, target: st.profile.target, skills: st.skills.map((s) => ({ name: s.name, level: s.level, state: s.state, score: s.score, category: s.category })) } : c);
}

export function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = `${title} | نَسْج`;
    const set = (sel: string, attr: string, key: string, val: string) => {
      let el = document.head.querySelector<HTMLMetaElement>(sel);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.content = val;
    };
    set('meta[name="description"]', 'name', 'description', description);
    set('meta[property="og:title"]', 'property', 'og:title', `${title} | نَسْج`);
    set('meta[property="og:description"]', 'property', 'og:description', description);
    set('meta[name="twitter:title"]', 'name', 'twitter:title', `${title} | نَسْج`);
    set('meta[name="twitter:description"]', 'name', 'twitter:description', description);
  }, [title, description]);
}
