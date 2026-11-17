import { lazy, Suspense, useCallback, useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Shell } from '@/components/shell';
import NotFound from '@/pages/not-found';
import Overview from '@/pages/overview';
import SkillsPage from '@/pages/skills';
import LearningPaths from '@/pages/learning-paths';
import LearningPathDetail from '@/pages/learning-path-detail';
import Assessments from '@/pages/assessments';
import Challenges from '@/pages/challenges';
import ChallengeDetail from '@/pages/challenge-detail';
import Hackathons from '@/pages/hackathons';
import ProjectDetail from '@/pages/project-detail';
import Clubs from '@/pages/clubs';
import Volunteering from '@/pages/volunteering';
import Mentorship from '@/pages/mentorship';
import Projects from '@/pages/projects';
import Passport from '@/pages/passport';
import MarketPulse from '@/pages/market-pulse';
import Community from '@/pages/community';
import Profile from '@/pages/profile';
import Settings from '@/pages/settings';
import Exchange from '@/pages/exchange';
import { LANDING_EVENT } from '@/components/brand';

const Landing = lazy(() => import('@/components/landing/landing'));
const ENTERED_KEY = 'nasj.entered';

/** Landing is a presentation layer: shown only on an initial visit to the root, never for deep links. */
function initialLanding() {
  try { if (sessionStorage.getItem(ENTERED_KEY) === '1') return false; } catch { /* storage blocked */ }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = window.location.pathname.slice(base.length).replace(/\/$/, '');
  return path === '';
}

function LandingSkeleton() {
  return <div className="flex min-h-[100dvh] items-center justify-center bg-background" aria-busy><div className="skeleton h-16 w-64" /></div>;
}

function Gate() {
  const [landing, setLanding] = useState(initialLanding);
  useEffect(() => {
    const show = () => { setLanding(true); window.scrollTo({ top: 0 }); };
    window.addEventListener(LANDING_EVENT, show);
    return () => window.removeEventListener(LANDING_EVENT, show);
  }, []);
  const enter = useCallback(() => {
    try { sessionStorage.setItem(ENTERED_KEY, '1'); } catch { /* ignore */ }
    setLanding(false);
    window.scrollTo({ top: 0 });
  }, []);
  if (landing) return <Suspense fallback={<LandingSkeleton />}><Landing onEnter={enter} /></Suspense>;
  return <Router />;
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={Overview} />
          <Route path="/skills" component={SkillsPage} />
          <Route path="/learning-paths" component={LearningPaths} />
          <Route path="/learning-paths/:id" component={LearningPathDetail} />
          <Route path="/assessments" component={Assessments} />
          <Route path="/challenges" component={Challenges} />
          <Route path="/challenges/:id" component={ChallengeDetail} />
          <Route path="/hackathons" component={Hackathons} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/clubs" component={Clubs} />
          <Route path="/volunteering" component={Volunteering} />
          <Route path="/mentorship" component={Mentorship} />
          <Route path="/exchange" component={Exchange} />
          <Route path="/passport" component={Passport} />
          <Route path="/market-pulse" component={MarketPulse} />
          <Route path="/community" component={Community} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Gate />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
