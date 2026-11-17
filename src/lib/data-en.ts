export type Role = 'student' | 'professor' | 'company' | 'professional' | 'club';
export type VState = 'declared' | 'assessed' | 'evaluated' | 'verified';
export const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;
export const PATH_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Professional readiness'] as const;
export const CATEGORIES = ['Design', 'Technology', 'Data', 'Business', 'Communication'] as const;

export type EvidenceType =
  | 'project-link' | 'work-sample' | 'assessment' | 'hackathon' | 'professor-eval'
  | 'professional-eval' | 'certificate' | 'responsibility' | 'participation';

export const EVIDENCE_LABEL: Record<EvidenceType, string> = {
  'project-link': 'Project link',
  'work-sample': 'Uploaded work example',
  assessment: 'Practical assessment result',
  hackathon: 'Hackathon deliverable',
  'professor-eval': 'Professor evaluation',
  'professional-eval': 'Professional evaluation',
  certificate: 'Verified certificate',
  responsibility: 'Documented responsibility',
  participation: 'Participation certificate',
};

export interface Evidence { id: string; type: EvidenceType; title: string; source: string; date: string; url?: string }
export interface HistoryEntry { date: string; note: string }
export interface Evaluator { name: string; role: string; org: string }
export interface Skill {
  id: string; name: string; category: string; level: number; score?: number; state: VState;
  evidence: Evidence[]; history: HistoryEntry[]; evaluator?: Evaluator; assessedAt?: string;
  projectIds: string[]; recommendations: string[]; developing: boolean;
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
  skills: Skill[]; paths: LearningPath[]; challenges: Challenge[]; submissions: Submission[];
  projects: Project[]; hackathons: Hackathon[]; activities: Activity[]; volunteering: Volunteer[];
  mentors: Mentor[]; bookings: Booking[]; posts: Post[]; requirements: Requirement[];
  candidates: Candidate[]; shortlist: string[]; messages: Message[]; log: LogItem[]; weekly: number[];
}

export const PERSONAS: Record<Role, { name: string; title: string; org: string; initials: string }> = {
  student: { name: 'Reem Al-Qahtani', title: 'Information Systems, Year 3', org: 'King Saud University', initials: 'RQ' },
  professor: { name: 'Dr. Hessa Al-Mutairi', title: 'Associate Professor, Human-Computer Interaction', org: 'King Saud University', initials: 'HM' },
  company: { name: 'Tayf Digital', title: 'Talent & Product Team', org: 'Riyadh, fintech product studio', initials: 'TD' },
  professional: { name: 'Majed Al-Sulami', title: 'Lead Product Designer, 9 years', org: 'Qimma Health', initials: 'MS' },
  club: { name: 'Product & Design Club', title: 'Student organization', org: 'King Saud University', initials: 'PD' },
};

const d = (s: string) => s;

const crit = (n: string, w: number, desc: string): Criterion => ({ name: n, weight: w, description: desc });
const UX_RUBRIC = [crit('Problem framing', 25, 'Defines the user problem with evidence'), crit('Research rigor', 25, 'Methods fit the question, sample is justified'), crit('Design quality', 30, 'Clarity, hierarchy, accessibility'), crit('Communication', 20, 'Rationale is clear and concise')];

export const TRACKS: Record<string, { skill: string; category: string; blurb: string; quiz: { q: string; options: string[]; answer: number }[]; steps: Omit<Step, 'id' | 'done'>[] }> = {
  'graphic-design': {
    skill: 'Graphic Design', category: 'Design', blurb: 'From visual fundamentals to a brand system a Riyadh agency would ship.',
    quiz: [
      { q: 'A poster headline competes with the date for attention. What fixes it first?', options: ['Add a drop shadow to the headline', 'Establish contrast in scale and weight between the two', 'Change both to the same color'], answer: 1 },
      { q: 'Arabic and Latin text on one layout look mismatched. The strongest move is to:', options: ['Pair typefaces with similar x-height and stroke contrast', 'Use the same font size for both', 'Put the Latin text in italics'], answer: 0 },
      { q: 'A logo must work on a 16px favicon. You should:', options: ['Keep every detail and shrink it', 'Prepare a simplified mark variant', 'Use only the wordmark'], answer: 1 },
      { q: 'Exporting a brand color for print and screen, you deliver:', options: ['One HEX value', 'CMYK, RGB/HEX and a Pantone reference', 'A screenshot'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'Visual hierarchy and grids', detail: 'Scale, weight, alignment and the 12-column grid.', level: 0 },
      { kind: 'exercise', title: 'Recompose a cluttered event poster', detail: 'Produce two variations with a documented rationale.', level: 0, evidence: 'Before/after poster PDFs' },
      { kind: 'module', title: 'Bilingual typography', detail: 'Pairing Arabic and Latin typefaces with matched rhythm.', level: 1 },
      { kind: 'resource', title: 'Reading: Arabic type anatomy', detail: 'Curated reference set from the design faculty.', level: 1 },
      { kind: 'checkpoint', title: 'Checkpoint: typographic system', detail: 'Timed practical, reviewed against a 4-point rubric.', level: 1, evidence: 'Assessment result' },
      { kind: 'challenge', title: 'Company challenge: Tayf Digital campaign key visual', detail: 'Real brief with deliverables and a rubric.', level: 2, evidence: 'Key visual + rationale' },
      { kind: 'mentorship', title: 'Portfolio critique with a working designer', detail: '45-minute review of your strongest piece.', level: 2 },
      { kind: 'module', title: 'Brand systems and guidelines', detail: 'Tokens, usage rules, and production handoff.', level: 3 },
      { kind: 'final', title: 'Final project: brand identity for a Saudi startup', detail: 'Logo suite, guideline document and 3 applications. Evaluated by professor and professional.', level: 3, evidence: 'Brand guideline PDF + case study link' },
    ],
  },
  'data-analysis': {
    skill: 'Data Analysis (SQL)', category: 'Data', blurb: 'Query, clean and explain data the way an analyst team expects.',
    quiz: [
      { q: 'You need total orders per city. Which clause groups rows?', options: ['ORDER BY', 'GROUP BY', 'WHERE'], answer: 1 },
      { q: 'A join doubles your revenue total. Most likely cause:', options: ['A one-to-many join duplicating rows', 'The database is slow', 'Wrong column alias'], answer: 0 },
      { q: 'Filtering on an aggregated value uses:', options: ['WHERE', 'HAVING', 'LIMIT'], answer: 1 },
      { q: 'Stakeholders ask "why did sales drop in Jeddah?" You first:', options: ['Build a dashboard', 'Define the metric and comparison period', 'Run a regression'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'Relational thinking and SELECT', detail: 'Tables, keys, filtering and sorting.', level: 0 },
      { kind: 'exercise', title: 'Query a Riyadh retail dataset', detail: '12 graded queries on a demo dataset.', level: 0, evidence: 'Query notebook' },
      { kind: 'module', title: 'Joins and aggregation', detail: 'GROUP BY, HAVING, and join pitfalls.', level: 1 },
      { kind: 'checkpoint', title: 'Checkpoint: analytical SQL', detail: 'Practical test with rubric.', level: 1, evidence: 'Assessment result' },
      { kind: 'mentorship', title: 'Session with a data analyst', detail: 'How analysis is reviewed at work.', level: 2 },
      { kind: 'challenge', title: 'Company challenge: Wadi Data Labs churn question', detail: 'Answer a real business question with evidence.', level: 2, evidence: 'Analysis memo' },
      { kind: 'final', title: 'Final project: end-to-end analysis report', detail: 'Question, method, queries, findings, limitations.', level: 3, evidence: 'Report + repository link' },
    ],
  },
  'project-management': {
    skill: 'Project Management', category: 'Business', blurb: 'Plan, run and close projects with documented outcomes.',
    quiz: [
      { q: 'An event has 6 weeks and 9 volunteers. First artifact:', options: ['A poster', 'Scope and a work breakdown', 'A WhatsApp group'], answer: 1 },
      { q: 'A vendor is late. Good practice is to:', options: ['Wait and hope', 'Log the risk, assess impact, trigger the fallback', 'Cancel the event'], answer: 1 },
      { q: 'RACI clarifies:', options: ['Budget', 'Who is responsible, accountable, consulted, informed', 'Timeline'], answer: 1 },
      { q: 'After delivery, you should produce:', options: ['Nothing', 'A retrospective with metrics and lessons', 'A thank-you post only'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'Scope, stakeholders and WBS', detail: 'Turning an idea into a plan.', level: 0 },
      { kind: 'exercise', title: 'Plan a club workshop', detail: 'WBS, timeline and RACI.', level: 0, evidence: 'Plan document' },
      { kind: 'module', title: 'Risk and change control', detail: 'Risk registers that are actually used.', level: 1 },
      { kind: 'checkpoint', title: 'Checkpoint: scenario simulation', detail: 'Handle three escalating issues.', level: 1, evidence: 'Assessment result' },
      { kind: 'challenge', title: 'Lead a real club activity', detail: 'Documented responsibilities recorded by the club.', level: 2, evidence: 'Club-recorded responsibilities' },
      { kind: 'final', title: 'Final project: delivery retrospective', detail: 'Metrics, decisions, lessons and stakeholder feedback.', level: 3, evidence: 'Retrospective report' },
    ],
  },
  'frontend': {
    skill: 'Frontend Development (React)', category: 'Technology', blurb: 'Build accessible interfaces that hold up in production.',
    quiz: [
      { q: 'A list re-renders slowly. First check:', options: ['Stable keys and unnecessary state', 'Switch frameworks', 'Add more CSS'], answer: 0 },
      { q: 'An icon-only button needs:', options: ['A tooltip only', 'An accessible label', 'Bigger icon'], answer: 1 },
      { q: 'RTL support for Arabic is best handled with:', options: ['Logical CSS properties', 'Mirrored images only', 'Separate codebase'], answer: 0 },
      { q: 'Server data in React is best cached with:', options: ['Global variables', 'A query cache library', 'localStorage everywhere'], answer: 1 },
    ],
    steps: [
      { kind: 'module', title: 'Components, props and state', detail: 'Thinking in components.', level: 0 },
      { kind: 'exercise', title: 'Build a bilingual form', detail: 'Validation, RTL and accessible errors.', level: 0, evidence: 'Repository link' },
      { kind: 'module', title: 'Data fetching and caching', detail: 'Loading, error and empty states.', level: 1 },
      { kind: 'checkpoint', title: 'Checkpoint: component review', detail: 'Code review against a rubric.', level: 1, evidence: 'Assessment result' },
      { kind: 'mentorship', title: 'Code review with a frontend lead', detail: 'Production expectations.', level: 2 },
      { kind: 'challenge', title: 'Company challenge: accessible dashboard widget', detail: 'Ship a component to spec.', level: 2, evidence: 'Deployed demo link' },
      { kind: 'module', title: 'Performance and testing', detail: 'Profiling, testing and CI basics.', level: 3 },
      { kind: 'final', title: 'Final project: production-ready feature', detail: 'Feature with tests, documentation and review notes.', level: 3, evidence: 'Repository + review notes' },
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
      id: 'sk-ux', name: 'UX Research', category: 'Design', level: 1, score: 84, state: 'declared', developing: false,
      assessedAt: d('2025-02-18'), evaluator: { name: 'Dr. Hessa Al-Mutairi', role: 'Professor', org: 'King Saud University' },
      projectIds: ['pr-darb', 'pr-souq'],
      evidence: [
        { id: 'e1', type: 'assessment', title: 'Usability study practical: 8 participants, task success analysis', source: 'NASJ practical assessment', date: '2025-01-27' },
        { id: 'e2', type: 'professor-eval', title: 'Rubric evaluation, 84/100', source: 'Dr. Hessa Al-Mutairi, KSU', date: '2025-02-18' },
        { id: 'e3', type: 'hackathon', title: 'Darb commuter interviews (14 riders, Riyadh Metro lines 1 and 3)', source: 'Riyadh Smart Mobility Hackathon', date: '2024-11-30' },
        { id: 'e4', type: 'project-link', title: 'Souq Al-Zal vendor app research repository', source: 'Personal project', date: '2024-09-12', url: 'demo://souq-research' },
      ],
      history: [
        { date: '2024-06-02', note: 'Declared skill' }, { date: '2024-11-30', note: 'Hackathon deliverable added' },
        { date: '2025-01-27', note: 'Practical assessment completed, 79' }, { date: '2025-02-18', note: 'Professor evaluation, 84' },
      ],
      recommendations: ['Run one unmoderated study to show range beyond interviews', 'Add quantitative survey analysis to strengthen Advanced level'],
    },
    {
      id: 'sk-ui', name: 'UI Design (Figma)', category: 'Design', level: 2, score: 88, state: 'declared', developing: false,
      assessedAt: '2025-03-04', evaluator: { name: 'Majed Al-Sulami', role: 'Lead Product Designer', org: 'Qimma Health' },
      projectIds: ['pr-darb'],
      evidence: [
        { id: 'e5', type: 'assessment', title: 'Design system practical: 24 components, 2 themes', source: 'NASJ practical assessment', date: '2025-02-20' },
        { id: 'e6', type: 'professional-eval', title: 'Industry review, 88/100', source: 'Majed Al-Sulami, Qimma Health', date: '2025-03-04' },
        { id: 'e7', type: 'hackathon', title: 'Darb interface and user journey', source: 'Riyadh Smart Mobility Hackathon', date: '2024-11-30' },
        { id: 'e8', type: 'work-sample', title: 'Bilingual banking onboarding flow (RTL/LTR)', source: 'Uploaded work example', date: '2025-01-09' },
      ],
      history: [{ date: '2024-03-10', note: 'Declared skill' }, { date: '2025-02-20', note: 'Assessment completed, 85' }, { date: '2025-03-04', note: 'Professional evaluation, 88' }],
      recommendations: ['Document motion specs in your next case study', 'Contribute one component to an open design system'],
    },
    {
      id: 'sk-fe', name: 'Frontend Development (React)', category: 'Technology', level: 1, score: 74, state: 'declared', developing: true,
      assessedAt: '2025-03-11', evaluator: { name: 'Dr. Hessa Al-Mutairi', role: 'Professor', org: 'King Saud University' },
      projectIds: ['pr-darb'],
      evidence: [
        { id: 'e9', type: 'assessment', title: 'Component review checkpoint, 72', source: 'NASJ learning path checkpoint', date: '2025-03-02' },
        { id: 'e10', type: 'professor-eval', title: 'Rubric evaluation, 74/100', source: 'Dr. Hessa Al-Mutairi, KSU', date: '2025-03-11' },
      ],
      history: [{ date: '2024-10-01', note: 'Declared skill' }, { date: '2025-03-02', note: 'Checkpoint passed' }, { date: '2025-03-11', note: 'Professor evaluation, 74' }],
      recommendations: ['Add one more deliverable (deployed demo) to meet verification evidence criteria', 'Complete the Performance and testing module'],
    },
    {
      id: 'sk-ia', name: 'Information Architecture', category: 'Design', level: 1, score: 71, state: 'declared', developing: true,
      assessedAt: '2025-02-25', projectIds: ['pr-souq'],
      evidence: [{ id: 'e11', type: 'assessment', title: 'Card sorting practical, 31 cards, 12 participants', source: 'NASJ practical assessment', date: '2025-02-25' }],
      history: [{ date: '2024-12-11', note: 'Declared skill' }, { date: '2025-02-25', note: 'Assessment completed, 71' }],
      recommendations: ['Request an evaluator review of your card sorting analysis'],
    },
    {
      id: 'sk-pm', name: 'Project Management', category: 'Business', level: 1, score: 68, state: 'declared', developing: true,
      assessedAt: '2025-01-15', projectIds: ['pr-ux-day'],
      evidence: [
        { id: 'e12', type: 'responsibility', title: 'Logistics lead, UX Day Riyadh 2025 (220 attendees)', source: 'Product & Design Club, KSU', date: '2025-01-15' },
        { id: 'e13', type: 'assessment', title: 'Scenario simulation checkpoint, 68', source: 'NASJ practical assessment', date: '2025-01-20' },
      ],
      history: [{ date: '2024-09-20', note: 'Declared skill' }, { date: '2025-01-15', note: 'Club recorded responsibility' }, { date: '2025-01-20', note: 'Assessment completed, 68' }],
      recommendations: ['Score 70+ in the next checkpoint', 'Write a delivery retrospective for UX Day'],
    },
    {
      id: 'sk-ps', name: 'Public Speaking', category: 'Communication', level: 1, state: 'declared', developing: false, projectIds: [],
      evidence: [{ id: 'e14', type: 'participation', title: 'Attendance certificate, Toastmasters-style workshop', source: 'Deanship of Student Affairs', date: '2024-12-03' }],
      history: [{ date: '2024-12-03', note: 'Declared skill; participation certificate attached (does not verify)' }],
      recommendations: ['Record a 5-minute pitch and submit it for practical assessment'],
    },
    {
      id: 'sk-sql', name: 'Data Analysis (SQL)', category: 'Data', level: 0, state: 'declared', developing: true, projectIds: [],
      evidence: [], history: [{ date: '2025-03-01', note: 'Declared skill as career gap' }],
      recommendations: ['Start the Data Analysis learning path', 'Take the placement assessment'],
    },
  ];

  const paths: LearningPath[] = [
    {
      id: 'lp-ux', track: 'project-management', title: 'Project Management for Product Teams', skillName: 'Project Management', category: 'Business',
      currentLevel: 0, targetLevel: 2, placementScore: 50, steps: buildSteps('project-management', 0, 2, 3),
      supervisor: 'Dr. Hessa Al-Mutairi', industryMentor: 'Majed Al-Sulami', companyPartner: 'Tayf Digital', startedAt: '2024-12-01',
    },
    {
      id: 'lp-fe', track: 'frontend', title: 'Frontend Development with React', skillName: 'Frontend Development (React)', category: 'Technology',
      currentLevel: 1, targetLevel: 3, placementScore: 75, steps: buildSteps('frontend', 1, 3, 3),
      supervisor: 'Dr. Hessa Al-Mutairi', industryMentor: 'Ahmed Bin Saeed', companyPartner: 'Tayf Digital', startedAt: '2025-01-10',
    },
    {
      id: 'lp-ia', track: 'data-analysis', title: 'Data Analysis Foundations', skillName: 'Data Analysis (SQL)', category: 'Data',
      currentLevel: 0, targetLevel: 1, placementScore: 25, steps: buildSteps('data-analysis', 0, 1, 99),
      supervisor: 'Dr. Turki Al-Dossary', industryMentor: 'Sara Al-Jaber', companyPartner: 'Wadi Data Labs', startedAt: '2024-08-15', completedAt: '2024-10-28',
    },
  ];

  const challenges: Challenge[] = [
    {
      id: 'ch-1', title: 'Redesign the SME invoice onboarding for first-time merchants', org: 'Tayf Digital', orgKind: 'company',
      description: 'Small merchants in Qassim and Al-Ahsa abandon onboarding at the commercial registration step. Diagnose why and propose a redesigned flow.',
      skill: 'UX Research', category: 'Design', proficiency: 1, duration: '2 weeks',
      deliverables: ['Research summary (max 6 pages)', 'Redesigned flow in Figma', '3-minute walkthrough video'],
      rubric: UX_RUBRIC, requirements: ['Individual submission', 'Cite at least 5 user sources', 'Bilingual screens'],
      status: 'open', applicants: 37, deadline: '2025-04-20', createdAt: '2025-03-01',
    },
    {
      id: 'ch-2', title: 'Accessible spending insights widget', org: 'Tayf Digital', orgKind: 'company',
      description: 'Build a React widget showing monthly spending categories that meets WCAG AA and works in RTL.',
      skill: 'Frontend Development (React)', category: 'Technology', proficiency: 1, duration: '10 days',
      deliverables: ['Repository link', 'Deployed demo', 'Accessibility notes'],
      rubric: [crit('Correctness', 30, 'Meets functional spec'), crit('Accessibility', 30, 'Keyboard, labels, contrast'), crit('Code quality', 25, 'Readable, tested'), crit('RTL support', 15, 'Logical properties, mirrored layout')],
      requirements: ['Public repository', 'README with setup steps'], status: 'open', applicants: 22, deadline: '2025-04-12', createdAt: '2025-03-05',
    },
    {
      id: 'ch-3', title: 'Churn drivers for a Jeddah grocery delivery app', org: 'Wadi Data Labs', orgKind: 'company',
      description: 'Use the provided demo dataset to explain why 90-day retention dropped in Q4.',
      skill: 'Data Analysis (SQL)', category: 'Data', proficiency: 1, duration: '1 week',
      deliverables: ['SQL notebook', 'Two-page memo'], rubric: [crit('Question framing', 20, 'Clear metric definition'), crit('Query correctness', 35, 'Accurate joins and aggregates'), crit('Insight quality', 30, 'Actionable findings'), crit('Limitations', 15, 'Honest about data gaps')],
      requirements: ['Use only provided data'], status: 'open', applicants: 58, deadline: '2025-04-05', createdAt: '2025-02-20',
    },
    {
      id: 'ch-4', title: 'Heuristic evaluation of a university e-services portal', org: 'Dr. Hessa Al-Mutairi', orgKind: 'professor',
      description: 'Apply Nielsen heuristics to a demo student services portal and connect each finding to HCI theory.',
      skill: 'Information Architecture', category: 'Design', proficiency: 0, duration: '5 days',
      deliverables: ['Findings table', 'Severity-ranked recommendations'], rubric: UX_RUBRIC, requirements: ['Reference course readings'],
      status: 'open', applicants: 41, deadline: '2025-04-02', createdAt: '2025-03-08',
    },
  ];

  const submissions: Submission[] = [
    { id: 'sub-1', source: 'challenge', refId: 'ch-1', title: 'Merchant onboarding redesign', skill: 'UX Research', studentId: 'c-noura', studentName: 'Noura Al-Shehri', link: 'demo://noura-onboarding', notes: 'Interviewed 7 merchants in Al-Ahsa; the CR lookup step is the key drop-off.', submittedAt: '2025-03-14', status: 'pending', rubric: UX_RUBRIC },
    { id: 'sub-2', source: 'challenge', refId: 'ch-4', title: 'E-services heuristic audit', skill: 'Information Architecture', studentId: 'me', studentName: 'Reem Al-Qahtani', link: 'demo://reem-heuristics', notes: '23 findings, 6 rated severity 4. Mapped navigation issues to information scent theory.', submittedAt: '2025-03-16', status: 'pending', rubric: UX_RUBRIC },
    { id: 'sub-3', source: 'challenge', refId: 'ch-3', title: 'Q4 churn memo', skill: 'Data Analysis (SQL)', studentId: 'c-abdulrahman', studentName: 'Abdulrahman Al-Zahrani', link: 'demo://churn-memo', notes: 'Delivery slot availability explains most of the drop.', submittedAt: '2025-03-12', status: 'pending', rubric: challenges[2].rubric },
    { id: 'sub-4', source: 'project', refId: 'pr-darb', title: 'Darb backend architecture', skill: 'Backend Development (Python)', studentId: 'c-faisal', studentName: 'Faisal Al-Harbi', link: 'demo://darb-api', notes: 'FastAPI service, PostgreSQL schema, metro timetable integration.', submittedAt: '2025-03-10', status: 'pending', rubric: [crit('Architecture', 30, 'Sound structure'), crit('Data design', 30, 'Normalized, indexed'), crit('Integration', 25, 'Robust API use'), crit('Documentation', 15, 'Clear README')] },
    { id: 'sub-5', source: 'path', refId: 'lp-fe', title: 'Component review checkpoint', skill: 'Frontend Development (React)', studentId: 'me', studentName: 'Reem Al-Qahtani', link: 'demo://reem-components', notes: 'Bilingual form with validation.', submittedAt: '2025-03-02', status: 'evaluated', rubric: challenges[1].rubric, scores: { Correctness: 4, Accessibility: 4, 'Code quality': 3, 'RTL support': 4 }, result: 74, feedback: 'Solid accessibility work. Tests are thin; add coverage for validation edge cases.', evaluator: { name: 'Dr. Hessa Al-Mutairi', role: 'Professor', org: 'King Saud University' }, evaluatorRole: 'professor' },
  ];

  const projects: Project[] = [
    {
      id: 'pr-darb', title: 'Darb: AI commute companion for Riyadh Metro', kind: 'hackathon', context: 'Riyadh Smart Mobility Hackathon 2024',
      challenge: 'Reduce first and last mile friction for metro riders', team: 'Team Sadu', date: '2024-11-30',
      summary: 'An app that predicts crowding and plans walk, bus and metro legs, with an Arabic-first conversational assistant.',
      members: [
        { studentId: 'me', name: 'Reem Al-Qahtani', role: 'Product designer and frontend', responsibilities: ['Designed the user interface', 'Created the user journey', 'Built frontend components'], tasks: ['14 rider interviews', 'Journey map across 3 personas', '22 screens in Figma', 'React route planner view'], skills: ['UX Research', 'UI Design (Figma)', 'Frontend Development (React)'], tools: ['Figma', 'React', 'Maze'], contribution: 'Owned discovery through interface. The journey map reframed the problem from route planning to crowd anxiety, which became the winning insight.', share: 34 },
        { studentId: 'c-faisal', name: 'Faisal Al-Harbi', role: 'Backend engineer', responsibilities: ['Developed the Python backend', 'Designed the database', 'Integrated the API'], tasks: ['FastAPI service', 'PostgreSQL schema with 9 tables', 'Timetable and crowd model integration'], skills: ['Backend Development (Python)', 'Database Design', 'API Integration'], tools: ['Python', 'FastAPI', 'PostgreSQL'], contribution: 'Built the service layer and the crowding prediction endpoint under 36 hours.', share: 38 },
        { studentId: 'c-lama', name: 'Lama Al-Otaibi', role: 'Business lead', responsibilities: ['Conducted market research', 'Designed the business model', 'Prepared the financial analysis'], tasks: ['Market sizing for 6 metro lines', 'B2B2C model with employers', '3-year financial projection'], skills: ['Market Research', 'Business Modeling', 'Financial Analysis'], tools: ['Excel', 'Notion', 'Canva'], contribution: 'Turned the product into a fundable story; led the final pitch.', share: 28 },
      ],
      deliverables: ['Clickable prototype', 'Working API demo', 'Pitch deck (12 slides)', 'Financial model'],
      mentorFeedback: 'Strong evidence-led framing. The crowding insight came from real interviews, not assumptions. (Mentor: Majed Al-Sulami)',
      judgeEvaluation: 'Scored 86/100: highest marks in user value and feasibility; business model needs validation with employers.',
      result: '2nd place of 41 teams',
    },
    {
      id: 'pr-souq', title: 'Souq Al-Zal vendor discovery app', kind: 'personal', context: 'Personal project', challenge: 'Help visitors find vendors in Riyadh\'s heritage market',
      team: 'Solo', date: '2024-09-12', summary: 'Research and information architecture for a bilingual vendor map.',
      members: [{ studentId: 'me', name: 'Reem Al-Qahtani', role: 'Researcher and designer', responsibilities: ['Field research', 'Information architecture', 'Prototype'], tasks: ['Vendor interviews', 'Card sort', 'Prototype testing'], skills: ['UX Research', 'Information Architecture'], tools: ['Figma', 'Optimal Workshop'], contribution: 'Sole contributor.', share: 100 }],
      deliverables: ['Research repository', 'Sitemap', 'Prototype'], mentorFeedback: 'Not yet reviewed.', judgeEvaluation: 'Not applicable.', result: 'Shipped as case study',
    },
    {
      id: 'pr-ux-day', title: 'UX Day Riyadh 2025', kind: 'club', context: 'Product & Design Club, KSU', challenge: 'Run a one-day design conference for 220 students',
      team: 'Organizing committee', date: '2025-01-15', summary: 'Talks, portfolio reviews and a design sprint with 6 industry speakers.',
      members: [
        { studentId: 'me', name: 'Reem Al-Qahtani', role: 'Logistics lead', responsibilities: ['Venue and schedule', 'Volunteer coordination', 'Run-of-show'], tasks: ['Coordinated 18 volunteers', 'Managed 6 speaker slots', 'Post-event survey'], skills: ['Project Management', 'Leadership', 'Communication'], tools: ['Notion', 'Google Forms'], contribution: 'Delivered on schedule with zero slot overruns.', share: 40 },
        { studentId: 'c-noura', name: 'Noura Al-Shehri', role: 'Brand and content', responsibilities: ['Event identity', 'Social content'], tasks: ['Visual identity', '14 social posts'], skills: ['Graphic Design', 'Content Strategy'], tools: ['Illustrator', 'Figma'], contribution: 'Created full identity system.', share: 35 },
        { studentId: 'c-yousef', name: 'Yousef Al-Ghamdi', role: 'Partnerships', responsibilities: ['Speaker outreach', 'Sponsor relations'], tasks: ['Secured 6 speakers', '2 sponsors'], skills: ['Negotiation', 'Communication'], tools: ['Email', 'Sheets'], contribution: 'Closed every speaker.', share: 25 },
      ],
      deliverables: ['Run-of-show document', 'Survey report (NPS 61)', 'Photo archive'], mentorFeedback: 'Clear ownership and documentation.', judgeEvaluation: 'Not applicable.', result: 'Completed, 220 attendees',
    },
  ];

  const hackathons: Hackathon[] = [
    { id: 'hk-1', name: 'Riyadh Smart Mobility Hackathon', organizer: 'Demo organizer: Riyadh Urban Tech Forum', city: 'Riyadh', date: '2024-11-28', theme: 'First and last mile mobility', projectId: 'pr-darb', status: 'completed' },
    { id: 'hk-2', name: 'Dhad AI Sprint', organizer: 'Demo organizer: Arabic Language Tech Circle', city: 'Riyadh', date: '2025-04-24', theme: 'Arabic-first AI tools', status: 'upcoming' },
    { id: 'hk-3', name: 'Red Sea Sustainability Jam', organizer: 'Demo organizer: Coastal Futures Lab', city: 'Jeddah', date: '2025-05-15', theme: 'Coastal tourism and water use', status: 'upcoming' },
  ];

  const activities: Activity[] = [
    { id: 'ac-1', club: 'Product & Design Club', title: 'Design Sprint Weekend: Campus Wayfinding', type: 'Team project', date: '2025-04-10', location: 'KSU, College of CIS, Hall 2B', description: 'Five-day sprint compressed into a weekend. Teams prototype wayfinding for new students.', skills: ['UX Research', 'Facilitation', 'Prototyping'], capacity: 40, registered: ['Noura Al-Shehri', 'Yousef Al-Ghamdi', 'Lama Al-Otaibi'], status: 'open', assignments: [{ person: 'Yousef Al-Ghamdi', studentId: 'c-yousef', role: 'Sprint facilitator', tasks: 'Run decision sessions, timebox each phase', skills: ['Facilitation', 'Leadership'], recorded: false }] },
    { id: 'ac-2', club: 'Product & Design Club', title: 'Portfolio Clinic with industry reviewers', type: 'Workshop', date: '2025-04-17', location: 'Online', description: 'One-to-one portfolio critique, 20 minutes each.', skills: ['Communication', 'UI Design (Figma)'], capacity: 24, registered: ['Faisal Al-Harbi'], status: 'open', assignments: [] },
    { id: 'ac-3', club: 'Product & Design Club', title: 'UX Day Riyadh 2025', type: 'Event', date: '2025-01-15', location: 'KSU Conference Center', description: 'Annual one-day conference.', skills: ['Project Management', 'Leadership', 'Communication'], capacity: 220, registered: ['Reem Al-Qahtani', 'Noura Al-Shehri', 'Yousef Al-Ghamdi'], status: 'completed', assignments: [{ person: 'Reem Al-Qahtani', studentId: 'me', role: 'Logistics lead', tasks: 'Venue, schedule, 18 volunteers, run-of-show', skills: ['Project Management', 'Leadership'], evidence: 'Run-of-show document, survey report', recorded: true }] },
  ];

  const mentors: Mentor[] = [
    { id: 'm-1', name: 'Majed Al-Sulami', title: 'Lead Product Designer', org: 'Qimma Health', years: 9, expertise: ['Product design', 'Design systems', 'Healthcare UX'], slots: ['Sun 7 Apr, 19:00', 'Tue 9 Apr, 20:30', 'Thu 11 Apr, 18:00'], bio: 'Leads a team of 7 designers building patient-facing apps used across 40 clinics.' },
    { id: 'm-2', name: 'Sara Al-Jaber', title: 'Senior Data Analyst', org: 'Wadi Data Labs', years: 6, expertise: ['SQL', 'Experimentation', 'Retail analytics'], slots: ['Mon 8 Apr, 18:30', 'Wed 10 Apr, 19:00'], bio: 'Builds retention analysis for e-commerce clients in Jeddah and Dammam.' },
    { id: 'm-3', name: 'Ahmed Bin Saeed', title: 'Frontend Engineering Manager', org: 'Tayf Digital', years: 11, expertise: ['React', 'Accessibility', 'Hiring'], slots: ['Sat 6 Apr, 17:00', 'Tue 9 Apr, 21:00'], bio: 'Hires junior engineers every quarter; knows what passes a code review.' },
  ];

  const posts: Post[] = [
    { id: 'po-1', author: 'Majed Al-Sulami', authorRole: 'professional', org: 'Qimma Health', kind: 'insight', title: 'What a junior designer portfolio needs in 2025', body: 'We reject most portfolios not for visual quality but for missing decisions. Show one constraint you fought, one metric you moved, and one thing you would redo.', tags: ['Portfolio', 'Product design'], date: '2025-03-12', saves: 148 },
    { id: 'po-2', author: 'Dr. Hessa Al-Mutairi', authorRole: 'professor', org: 'King Saud University', kind: 'academic', title: 'Why the merchant onboarding challenge is a Fitts and Hick problem', body: 'Tayf Digital\'s challenge looks like a copywriting issue, but the drop-off sits where choice count doubles. This note connects the brief to decision-time theory and gives three readings.', tags: ['HCI theory', 'Challenge foundation'], date: '2025-03-06', saves: 92 },
    { id: 'po-3', author: 'Sara Al-Jaber', authorRole: 'professional', org: 'Wadi Data Labs', kind: 'case-study', title: 'Case study: the delivery slot that cost 11 points of retention', body: 'A real (anonymized) project: how we found that slot scarcity, not price, drove churn, and the queries we used.', tags: ['Analytics', 'Retention'], date: '2025-02-27', saves: 77 },
    { id: 'po-4', author: 'Ahmed Bin Saeed', authorRole: 'professional', org: 'Tayf Digital', kind: 'tool', title: 'Tool recommendation: axe DevTools before every pull request', body: 'Run it on each changed view. Most accessibility rejections in our hiring task are things it catches in seconds.', tags: ['Accessibility', 'Tooling'], date: '2025-02-19', saves: 61 },
    { id: 'po-5', author: 'Tayf Digital', authorRole: 'company', org: 'Tayf Digital', kind: 'requirement', title: 'What we expect from intern product designers', body: 'Bilingual interface craft, comfort presenting to engineers, and at least one evaluated research project.', tags: ['Hiring', 'Design'], date: '2025-02-10', saves: 133 },
  ];

  const requirements: Requirement[] = [
    { id: 'rq-1', org: 'Tayf Digital', skill: 'UX Research', category: 'Design', level: 1, competencies: 'Plan and run interviews, synthesize into opportunity areas.', criteria: 'Evaluated research project with at least 5 participants.', date: '2025-02-10' },
    { id: 'rq-2', org: 'Tayf Digital', skill: 'Frontend Development (React)', category: 'Technology', level: 2, competencies: 'Accessible components, RTL layouts, tests.', criteria: 'Code review score 75+ and a deployed project.', date: '2025-02-14' },
    { id: 'rq-3', org: 'Wadi Data Labs', skill: 'Data Analysis (SQL)', category: 'Data', level: 1, competencies: 'Joins, aggregates, metric definition.', criteria: 'Practical SQL assessment 70+.', date: '2025-02-02' },
  ];

  const candidates: Candidate[] = [
    { id: 'me', name: 'Reem Al-Qahtani', university: 'King Saud University', major: 'Information Systems', year: 3, target: 'Product Designer', city: 'Riyadh', highlight: '2nd place, Riyadh Smart Mobility Hackathon; led UX Day logistics', skills: [] },
    { id: 'c-faisal', name: 'Faisal Al-Harbi', university: 'King Fahd University of Petroleum and Minerals', major: 'Computer Engineering', year: 4, target: 'Backend Engineer', city: 'Dhahran', highlight: 'Built Darb API in 36 hours', skills: [{ name: 'Backend Development (Python)', level: 2, state: 'evaluated', score: 81, category: 'Technology' }, { name: 'Database Design', level: 2, state: 'verified', score: 86, category: 'Technology' }, { name: 'API Integration', level: 1, state: 'assessed', score: 77, category: 'Technology' }] },
    { id: 'c-lama', name: 'Lama Al-Otaibi', university: 'Princess Nourah bint Abdulrahman University', major: 'Business Administration', year: 3, target: 'Product Manager', city: 'Riyadh', highlight: 'Pitched Darb to the final jury', skills: [{ name: 'Market Research', level: 2, state: 'verified', score: 83, category: 'Business' }, { name: 'Financial Analysis', level: 1, state: 'evaluated', score: 72, category: 'Business' }, { name: 'UX Research', level: 0, state: 'declared', category: 'Design' }] },
    { id: 'c-abdulrahman', name: 'Abdulrahman Al-Zahrani', university: 'King Abdulaziz University', major: 'Data Science', year: 4, target: 'Data Analyst', city: 'Jeddah', highlight: 'Top 5 in Wadi Data Labs churn challenge (demo)', skills: [{ name: 'Data Analysis (SQL)', level: 2, state: 'verified', score: 91, category: 'Data' }, { name: 'Python for Data', level: 2, state: 'evaluated', score: 84, category: 'Data' }, { name: 'Data Visualization', level: 1, state: 'assessed', score: 70, category: 'Data' }] },
    { id: 'c-noura', name: 'Noura Al-Shehri', university: 'Imam Abdulrahman bin Faisal University', major: 'Graphic Design', year: 4, target: 'Brand Designer', city: 'Dammam', highlight: 'Designed UX Day identity system', skills: [{ name: 'Graphic Design', level: 2, state: 'verified', score: 89, category: 'Design' }, { name: 'UX Research', level: 1, state: 'assessed', score: 66, category: 'Design' }, { name: 'UI Design (Figma)', level: 1, state: 'evaluated', score: 78, category: 'Design' }] },
    { id: 'c-yousef', name: 'Yousef Al-Ghamdi', university: 'King Saud University', major: 'Software Engineering', year: 2, target: 'Frontend Engineer', city: 'Riyadh', highlight: 'Secured all UX Day speakers', skills: [{ name: 'Frontend Development (React)', level: 1, state: 'assessed', score: 73, category: 'Technology' }, { name: 'Communication', level: 2, state: 'evaluated', score: 80, category: 'Communication' }] },
  ];

  const weekly = [3, 5, 2, 6, 4, 7, 5, 8, 6, 9, 7, 11];
  const log: LogItem[] = [
    { date: '2025-03-16', label: 'Submitted heuristic audit to Dr. Hessa Al-Mutairi', kind: 'submission' },
    { date: '2025-03-11', label: 'Frontend Development evaluated, 74/100', kind: 'evaluation' },
    { date: '2025-03-04', label: 'UI Design reviewed by Majed Al-Sulami, 88/100', kind: 'evaluation' },
    { date: '2025-03-02', label: 'Passed React component checkpoint', kind: 'path' },
    { date: '2025-02-25', label: 'Information Architecture assessment, 71', kind: 'assessment' },
  ];

  return {
    version: 1, role: 'student',
    profile: { name: 'Reem Al-Qahtani', arabicName: 'ريم القحطاني', university: 'King Saud University', major: 'Information Systems', year: 3, city: 'Riyadh', target: 'Product Designer', interests: ['Fintech', 'Mobility', 'Accessibility'], bio: 'I design bilingual products that respect how people in Riyadh actually move, pay and decide.' },
    settings: { weeklyGoal: 8, digest: true, publicPortfolio: true, reducedMotion: false, showArabic: true, nudges: true },
    skills, paths, challenges, submissions, projects, hackathons, activities,
    volunteering: [
      { id: 'v-1', org: 'Saudi Food Bank (demo record)', title: 'Ramadan food basket distribution', hours: 18, date: '2025-03-08', responsibilities: 'Coordinated a packing line of 9 volunteers', skills: ['Leadership', 'Project Management'], confirmed: true },
      { id: 'v-2', org: 'KSU Accessibility Office (demo record)', title: 'Campus accessibility audit', hours: 12, date: '2024-11-14', responsibilities: 'Documented 37 barriers with photos and severity', skills: ['UX Research'], confirmed: false },
    ],
    mentors, bookings: [
      { id: 'b-1', mentorId: 'm-1', slot: 'Tue 4 Mar, 20:00', topic: 'Portfolio narrative for fintech roles', status: 'completed', notes: 'Lead with the Darb crowding insight; cut the logo exercise.' },
      { id: 'b-2', mentorId: 'm-3', slot: 'Sat 6 Apr, 17:00', topic: 'Preparing for the accessible widget challenge', status: 'confirmed' },
    ],
    posts, requirements, candidates, shortlist: ['c-abdulrahman'], messages: [], log, weekly,
  };
}

export const MARKET = {
  industries: ['Fintech', 'Healthcare', 'Logistics', 'Tourism', 'Energy', 'Government services'],
  majors: ['Information Systems', 'Computer Science', 'Business Administration', 'Graphic Design', 'Data Science', 'Industrial Engineering'],
  skills: [
    { name: 'Data Analysis (SQL)', category: 'Data', demand: 92, growth: 18.4, industries: ['Fintech', 'Logistics', 'Healthcare', 'Government services'], majors: ['Information Systems', 'Data Science', 'Business Administration', 'Industrial Engineering'], band: 'Core' },
    { name: 'Applied AI / LLM integration', category: 'Technology', demand: 87, growth: 41.7, industries: ['Fintech', 'Government services', 'Healthcare'], majors: ['Computer Science', 'Data Science', 'Information Systems'], band: 'Emerging' },
    { name: 'UX Research', category: 'Design', demand: 74, growth: 12.1, industries: ['Fintech', 'Healthcare', 'Government services', 'Tourism'], majors: ['Information Systems', 'Graphic Design'], band: 'Core' },
    { name: 'UI Design (Figma)', category: 'Design', demand: 71, growth: 6.3, industries: ['Fintech', 'Tourism'], majors: ['Graphic Design', 'Information Systems'], band: 'Stable' },
    { name: 'Frontend Development (React)', category: 'Technology', demand: 83, growth: 9.8, industries: ['Fintech', 'Logistics', 'Tourism'], majors: ['Computer Science', 'Information Systems'], band: 'Core' },
    { name: 'Cloud and DevOps', category: 'Technology', demand: 79, growth: 22.6, industries: ['Fintech', 'Energy', 'Government services'], majors: ['Computer Science'], band: 'Emerging' },
    { name: 'Cybersecurity fundamentals', category: 'Technology', demand: 81, growth: 19.2, industries: ['Government services', 'Energy', 'Fintech'], majors: ['Computer Science', 'Information Systems'], band: 'Core' },
    { name: 'Project Management', category: 'Business', demand: 76, growth: 5.4, industries: ['Energy', 'Logistics', 'Tourism', 'Government services'], majors: ['Business Administration', 'Industrial Engineering'], band: 'Stable' },
    { name: 'Supply chain analytics', category: 'Data', demand: 68, growth: 15.9, industries: ['Logistics', 'Energy'], majors: ['Industrial Engineering', 'Data Science'], band: 'Emerging' },
    { name: 'Bilingual content design', category: 'Communication', demand: 62, growth: 13.3, industries: ['Tourism', 'Government services', 'Fintech'], majors: ['Graphic Design', 'Business Administration'], band: 'Emerging' },
    { name: 'Financial modeling', category: 'Business', demand: 66, growth: 4.1, industries: ['Fintech', 'Energy'], majors: ['Business Administration'], band: 'Stable' },
    { name: 'Graphic Design', category: 'Design', demand: 58, growth: 2.7, industries: ['Tourism'], majors: ['Graphic Design'], band: 'Stable' },
  ],
  emerging: [
    { name: 'Arabic language models', note: 'Retrieval and evaluation for Arabic-first assistants.' },
    { name: 'Digital twins for giga-projects', note: 'Simulation skills for construction and urban planning.' },
    { name: 'Open banking APIs', note: 'Integration and consent design for fintech.' },
    { name: 'Hydrogen and carbon accounting', note: 'Data literacy for energy transition teams.' },
  ],
};

export const uid = id;
