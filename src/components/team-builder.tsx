import { useMemo } from 'react';
import { UserPlus, X, Users, Send, Sparkles, CheckCircle2 } from 'lucide-react';
import { useDemo, mutate, log, useCandidates, fmtDate } from '@/lib/store';
import type { Hackathon } from '@/lib/data';
import { Initials } from '@/components/kit';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  buildPeople, needsFor, coverage, teamScore, suggestTeammates, stateMix, strength, useLocal,
  TEAM_ROLES, STATE_LABEL, STATE_TONE, type Person,
} from '@/lib/matching';

const MAX = 4;

export function TeamBuilder({ events }: { events: Hackathon[] }) {
  const st = useDemo();
  const { toast } = useToast();
  const cands = useCandidates(st);
  const me: Person = useMemo(() => {
    const c = cands.find((x) => x.id === 'me');
    return { id: 'me', me: true, name: st.profile.name, university: st.profile.university, major: st.profile.major, year: st.profile.year, city: st.profile.city, target: st.profile.target, skills: c?.skills ?? [], wants: [], mode: 'مرن', weeklyHours: 4 };
  }, [cands, st.profile]);
  const pool = useMemo(() => buildPeople(cands), [cands]);
  const [store, setStore] = useLocal<{ sel: string; teams: Record<string, string[]> }>('nasj-teams-v1', () => ({ sel: events[0]?.id ?? '', teams: {} }));
  const ev = events.find((e) => e.id === store.sel) ?? events[0];
  if (!ev) return null;
  const ids = store.teams[ev.id] ?? [];
  const team = [me, ...ids.map((id) => pool.find((p) => p.id === id)).filter((p): p is Person => !!p)];
  const needs = needsFor(ev.id);
  const score = Math.round(teamScore(team, needs) * 100);
  const sugg = suggestTeammates(team, pool, needs);
  const mix = stateMix(team);
  const mixTotal = Object.values(mix).reduce((a, b) => a + b, 0) || 1;
  const covs = TEAM_ROLES.map((r) => ({ ...r, need: needs[r.cat], cov: Math.round(coverage(team, r.cat) * 100) }));
  const gaps = covs.filter((r) => r.need >= 0.7 && r.cov < 55).sort((a, b) => a.cov - b.cov);
  const unis = new Set(team.map((p) => p.university)).size;
  const full = team.length >= MAX;

  const setTeam = (fn: (ids: string[]) => string[]) => setStore((s) => ({ ...s, teams: { ...s.teams, [ev.id]: fn(s.teams[ev.id] ?? []) } }));
  const add = (p: Person) => { if (full) return; setTeam((x) => [...x, p.id]); toast({ title: `أضفتِ ${p.name.split(' ')[0]} للفريق`, description: 'المقترحات والتحليل تتحدث فورًا.' }); };
  const remove = (id: string) => setTeam((x) => x.filter((y) => y !== id));
  const register = () => {
    mutate((d) => { const h = d.hackathons.find((y) => y.id === ev.id); if (h) h.status = 'registered'; log(d, `تكوين فريق من ${team.length} أعضاء لـ ${ev.name}`, 'hackathon'); });
    toast({ title: 'أُرسلت الدعوات وسُجّل الفريق (تجريبي)', description: `${team.length} أعضاء · جاهزية ${score}%` });
  };

  return (
    <section className="panel rise overflow-hidden" data-testid="team-builder" aria-labelledby="tb-h">
      <div className="weave-bg border-b border-white/[.06] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">كوّن فريقك من البيانات</p>
            <h2 id="tb-h" className="mt-1 font-ar-head text-2xl sm:text-3xl">فريق متوازن، لا أصدقاء متشابهون</h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">نقترح زملاء يكمّلون مهاراتك الموثّقة حسب ما يحتاجه الهاكاثون، ونحلل الفريق وأنتِ تبنينه.</p>
          </div>
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="اختر الهاكاثون">
            {events.map((e) => (
              <button key={e.id} role="tab" aria-selected={e.id === ev.id} onClick={() => setStore((s) => ({ ...s, sel: e.id }))} data-testid={`tab-team-${e.id}`}
                className={cn('chip', e.id === ev.id && 'chip-on')}>{e.name}</button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs text-[hsl(var(--faint))]">{ev.theme} · {ev.city} · {fmtDate(ev.date)}</p>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        {/* team + suggestions */}
        <div className="border-white/[.06] p-5 sm:p-6 lg:border-e">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-[hsl(var(--lavender))]" />فريقك <span className="num text-muted-foreground">{team.length}/{MAX}</span></h3>
          </div>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {team.map((p) => {
              const top = [...p.skills].sort((a, b) => strength(b) - strength(a))[0];
              return (
                <li key={p.id} className={cn('panel-2 flex items-start gap-3 p-3', p.me && 'ring-1 ring-[hsl(var(--primary)/.45)]')} data-testid={`team-member-${p.id}`}>
                  <Initials name={p.name} size={34} tone={p.me ? 'madder' : 'indigo'} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.me ? 'أنتِ' : p.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{p.major} · {p.university.replace('جامعة ', '')}</p>
                    {top && <p className="mt-1.5 truncate text-[11px]"><span style={{ color: STATE_TONE[top.state] }}>● </span>{top.name}</p>}
                  </div>
                  {!p.me && <button onClick={() => remove(p.id)} className="rounded-full p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground" aria-label={`إزالة ${p.name}`} data-testid={`button-remove-${p.id}`}><X className="h-3.5 w-3.5" /></button>}
                </li>
              );
            })}
            {Array.from({ length: MAX - team.length }).map((_, i) => (
              <li key={`empty-${i}`} className="flex min-h-[4.75rem] items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs text-[hsl(var(--faint))]">مقعد شاغر</li>
            ))}
          </ul>

          <h3 className="mt-7 flex items-center gap-2 text-sm font-semibold"><Sparkles className="h-4 w-4 text-[hsl(var(--sand))]" />مقترحون يكمّلون فريقك</h3>
          <ul className="mt-3 space-y-2">
            {sugg.map((s) => (
              <li key={s.person.id} className="panel-2 flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap" data-testid={`suggestion-${s.person.id}`}>
                <Initials name={s.person.name} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{s.person.name} <span className="font-normal text-muted-foreground">· {s.person.major}</span></p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    يغطي <span style={{ color: s.role.color }}>{s.role.label}</span>
                    {s.best && <> · {s.best.name} <span style={{ color: STATE_TONE[s.best.state] }}>({STATE_LABEL[s.best.state]})</span></>}
                  </p>
                </div>
                <div className="w-24 shrink-0">
                  <div className="flex items-baseline justify-between text-[11px]"><span className="text-muted-foreground">توافق</span><span className="num font-semibold">{s.fit}%</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-white/[.07]"><div className="h-full rounded-full" style={{ width: `${s.fit}%`, background: s.role.color }} /></div>
                </div>
                <button disabled={full} onClick={() => add(s.person)} className="btn btn-ghost btn-sm shrink-0" data-testid={`button-add-${s.person.id}`}><UserPlus className="h-3.5 w-3.5" />أضف</button>
              </li>
            ))}
          </ul>
          {full && <p className="mt-2 text-xs text-[hsl(var(--sand))]">الفريق مكتمل ({MAX} أعضاء). أزيلي عضوًا لتجربة تركيبة أخرى.</p>}
        </div>

        {/* analytics */}
        <div className="p-5 sm:p-6" aria-live="polite">
          <div className="flex items-center gap-5">
            <Ring value={score} />
            <div>
              <p className="eyebrow">جاهزية الفريق لهذا الهاكاثون</p>
              <p className="mt-1 text-sm text-muted-foreground">{score >= 75 ? 'تركيبة قوية ومتوازنة.' : score >= 50 ? 'قريب، تنقصه مهارة أو اثنتان.' : 'يحتاج أعضاء يكمّلون الأدوار الأساسية.'}</p>
            </div>
          </div>

          <p className="eyebrow mt-6">تغطية الأدوار <span className="font-normal normal-case text-[hsl(var(--faint))]">(الخط = أهمية الدور لهذا الحدث)</span></p>
          <ul className="mt-3 space-y-3">
            {covs.map((r) => (
              <li key={r.cat} data-testid={`coverage-${r.cat}`}>
                <div className="flex justify-between text-xs"><span>{r.label}</span><span className="num text-muted-foreground">{r.cov}%</span></div>
                <div className="relative mt-1.5 h-2 rounded-full bg-white/[.07]">
                  <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${r.cov}%`, background: r.color }} />
                  <span className="absolute -top-1 h-4 w-px bg-white/50" style={{ insetInlineStart: `${Math.round(r.need * 100)}%` }} aria-hidden />
                </div>
              </li>
            ))}
          </ul>

          <p className="eyebrow mt-6">حالات التوثيق في الفريق</p>
          <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-white/[.07]" role="img" aria-label="توزيع حالات التوثيق">
            {(Object.keys(mix) as (keyof typeof mix)[]).map((k) => <span key={k} style={{ width: `${(mix[k] / mixTotal) * 100}%`, background: STATE_TONE[k] }} />)}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            {(Object.keys(mix) as (keyof typeof mix)[]).map((k) => <span key={k}><span style={{ color: STATE_TONE[k] }}>●</span> {STATE_LABEL[k]} <span className="num">{mix[k]}</span></span>)}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-2">
            <div className="panel-2 p-3"><p className="text-[11px] text-muted-foreground">جامعات مختلفة</p><p className="num mt-1 text-xl">{unis}</p></div>
            <div className="panel-2 p-3"><p className="text-[11px] text-muted-foreground">مهارات موثّقة</p><p className="num mt-1 text-xl">{mix.verified}</p></div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/[.06] p-3 text-xs">
            {gaps.length ? <>ينقص الفريق: {gaps.map((g, i) => <span key={g.cat}>{i > 0 && '، '}<span style={{ color: g.color }}>{g.label}</span> <span dir="ltr" className="num">({g.cov}%)</span></span>)}</>
              : <span className="flex items-center gap-1.5 text-[hsl(var(--teal))]"><CheckCircle2 className="h-4 w-4" />كل الأدوار المهمة مغطاة.</span>}
          </div>

          <button onClick={register} disabled={team.length < 2} className="btn btn-primary mt-5 w-full" data-testid="button-register-team"><Send className="h-4 w-4" />أرسل الدعوات وسجّل الفريق</button>
          <p className="mt-2 text-center text-[11px] text-[hsl(var(--faint))]">الزملاء المقترحون والدعوات بيانات توضيحية</p>
        </div>
      </div>
    </section>
  );
}

function Ring({ value }: { value: number }) {
  const r = 30, c = 2 * Math.PI * r;
  const col = value >= 75 ? '#5FBFAE' : value >= 50 ? '#D9B76E' : '#CC8DA6';
  return (
    <svg width="76" height="76" viewBox="0 0 76 76" role="img" aria-label={`جاهزية الفريق ${value}%`} className="shrink-0">
      <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="7" />
      <circle cx="38" cy="38" r={r} fill="none" stroke={col} strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} transform="rotate(-90 38 38)" style={{ transition: 'stroke-dashoffset .6s cubic-bezier(.22,1,.36,1)' }} />
      <text x="38" y="43" textAnchor="middle" className="num" fill="#E8ECF4" fontSize="17">{value}%</text>
    </svg>
  );
}
