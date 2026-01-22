import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import { ScrollToTop } from "./components/ScrollToTop";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { Toaster } from "@/components/ui/sonner";

// Lazy load des pages pour améliorer les performances
const Home = lazy(() => import("./pages/Home"));
const Generator = lazy(() => import("./pages/Generator"));
const RankingsFrance = lazy(() => import("./pages/RankingsFrance"));
const RankingsWorld = lazy(() => import("./pages/RankingsWorld"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Resources = lazy(() => import("./pages/Resources"));
const Schedule = lazy(() => import("./pages/Schedule"));
const AutoPublish = lazy(() => import("./pages/AutoPublish"));
const Pricing = lazy(() => import("./pages/Pricing"));
const GuideLinkedIn2025 = lazy(() => import("./pages/resources/GuideLinkedIn2025"));
const TrendingContent = lazy(() => import("./pages/TrendingContent"));
const TopPosts = lazy(() => import("./pages/TopPosts"));
const AgentsDashboard = lazy(() => import("./pages/AgentsDashboard"));
const Carousels = lazy(() => import("./pages/Carousels"));
const EngagementManager = lazy(() => import("./pages/EngagementManager"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Achievements = lazy(() => import("./pages/Achievements"));
const AgentsSimple = lazy(() => import("./pages/AgentsSimple"));
const AdvancedAnalytics = lazy(() => import("./pages/AdvancedAnalytics"));
const MeetTheAgents = lazy(() => import("./pages/MeetTheAgents"));
const Templates = lazy(() => import("./pages/Templates"));
const Creators = lazy(() => import("./pages/Creators"));
const LinkedInSettings = lazy(() => import("./pages/LinkedInSettings"));
const MarketingCampaign = lazy(() => import("./pages/MarketingCampaign"));
const ABTesting = lazy(() => import("./pages/ABTesting"));
const Coaching = lazy(() => import("./pages/Coaching"));
const LiveAnalytics = lazy(() => import("./pages/LiveAnalytics"));
const Gamification = lazy(() => import("./pages/Gamification"));
const Rewards = lazy(() => import("./pages/Rewards"));
const Settings = lazy(() => import("./pages/Settings"));
const Referral = lazy(() => import("./pages/Referral"));
const Challenges = lazy(() => import("./pages/Challenges"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Missions = lazy(() => import("./pages/Missions"));
const Focus = lazy(() => import("./pages/Focus"));
const EditorialCalendarPage = lazy(() => import("./pages/EditorialCalendarPage"));
const Collaboration = lazy(() => import("./pages/Collaboration"));
const Voice = lazy(() => import("./pages/Voice"));
const TemplateAnalyticsPage = lazy(() => import("./pages/TemplateAnalyticsPage"));
const PremiumPacks = lazy(() => import("./pages/PremiumPacks"));
const RealtimeCollab = lazy(() => import("./pages/RealtimeCollab"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const MentionsLegales = lazy(() => import("./pages/legal/MentionsLegales"));
const Confidentialite = lazy(() => import("./pages/legal/Confidentialite"));
const CGV = lazy(() => import("./pages/legal/CGV"));
const CGU = lazy(() => import("./pages/legal/CGU"));

// Lazy load des composants non-critiques
const ExitIntentPopup = lazy(() => import("./components/ExitIntentPopup").then(m => ({ default: m.ExitIntentPopup })));
const LiveChatWidget = lazy(() => import("./components/LiveChatWidget").then(m => ({ default: m.LiveChatWidget })));
const OnboardingProgress = lazy(() => import("./components/OnboardingProgress").then(m => ({ default: m.OnboardingProgress })));
const StickyCTA = lazy(() => import("./components/StickyCTA").then(m => ({ default: m.StickyCTA })));
const FeedbackWidget = lazy(() => import("./components/FeedbackWidget").then(m => ({ default: m.FeedbackWidget })));
const MobileNavigation = lazy(() => import("./components/MobileNavigation").then(m => ({ default: m.MobileNavigation })));
const CookieConsent = lazy(() => import("./components/CookieConsent"));

// Import direct pour l'onboarding (nécessaire au démarrage)
import { InteractiveOnboarding, useOnboarding } from "./components/InteractiveOnboarding";

// Composant de chargement léger
function PageLoader() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">Chargement...</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/generate"} component={Generator} />
        <Route path={"/rankings/france"} component={RankingsFrance} />
        <Route path={"/rankings/world"} component={RankingsWorld} />
        <Route path={"/onboarding"} component={Onboarding} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/resources"} component={Resources} />
        <Route path={"/resources/guide-linkedin-2025"} component={GuideLinkedIn2025} />
        <Route path={"/schedule"} component={Schedule} />
        <Route path={"/auto-publish"} component={AutoPublish} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/trending"} component={TrendingContent} />
        <Route path={"/top-posts"} component={TopPosts} />
        <Route path={"/agents-dashboard"} component={AgentsDashboard} />
        <Route path={"/agents"} component={AgentsSimple} />
        <Route path={"/meet-the-agents"} component={MeetTheAgents} />
        <Route path={"/carousels"} component={Carousels} />
        <Route path={"/engagement"} component={EngagementManager} />
        <Route path={"/analytics"} component={Analytics} />
        <Route path={"/analytics/advanced"} component={AdvancedAnalytics} />
        <Route path={"/analytics/live"} component={LiveAnalytics} />
        <Route path={"/achievements"} component={Achievements} />
        <Route path={"/templates"} component={Templates} />
        <Route path={"/templates/analytics"} component={TemplateAnalyticsPage} />
        <Route path={"/templates/premium"} component={PremiumPacks} />
        <Route path={"/creators"} component={Creators} />
        <Route path={"/linkedin-settings"} component={LinkedInSettings} />
        <Route path={"/marketing"} component={MarketingCampaign} />
        <Route path={"/ab-testing"} component={ABTesting} />
        <Route path={"/coaching"} component={Coaching} />
        <Route path={"/gamification"} component={Gamification} />
        <Route path={"/rewards"} component={Rewards} />
        <Route path={"/settings"} component={Settings} />
        <Route path={"/referral"} component={Referral} />
        <Route path={"/challenges"} component={Challenges} />
        <Route path={"/notifications"} component={Notifications} />
        <Route path={"/missions"} component={Missions} />
        <Route path={"/focus"} component={Focus} />
        <Route path={"/calendar"} component={EditorialCalendarPage} />
        <Route path={"/collaboration"} component={Collaboration} />
        <Route path={"/collaboration/realtime"} component={RealtimeCollab} />
        <Route path={"/voice"} component={Voice} />
        <Route path={"/legal/mentions-legales"} component={MentionsLegales} />
        <Route path={"/legal/confidentialite"} component={Confidentialite} />
        <Route path={"/legal/cgv"} component={CGV} />
        <Route path={"/legal/cgu"} component={CGU} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function AppContent() {
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();
  // Activer les raccourcis clavier globaux
  useKeyboardShortcuts();

  return (
    <>
      <ScrollToTop />
      {showOnboarding && (
        <InteractiveOnboarding 
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
      <Router />
      {/* Composants non-critiques chargés en lazy */}
      <Suspense fallback={null}>
        <ExitIntentPopup />
        <LiveChatWidget />
        <OnboardingProgress />
        <StickyCTA />
        <FeedbackWidget />
        <MobileNavigation />
        <CookieConsent />
      </Suspense>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <UserProfileProvider>
          <TooltipProvider>
            <Toaster 
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'oklch(0.14 0.02 280)',
                  border: '1px solid oklch(0.55 0.25 280 / 0.3)',
                  color: 'oklch(0.98 0 0)',
                },
              }}
            />
            <AppContent />
          </TooltipProvider>
        </UserProfileProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
