import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./lib/currency";
import { RelayRouteGate, RelaySessionProvider } from "./contexts/RelaySessionContext";
import Campaigns from "./pages/Campaigns";
import CampaignWorkspace from "./pages/CampaignWorkspace";
import AcceptedCampaigns from "./pages/AcceptedCampaigns";
import Home from "./pages/Home";
import { Activity, Communities, CommunityDetail, Earnings, Performance, Settings } from "./pages/OwnerPages";
import AddCommunity from "./pages/AddCommunity";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import CommunityOwnerDashboard from "./pages/CommunityOwner/CommunityOwnerDashboard";
import CommunityOwnerSectionPlaceholder from "./pages/CommunityOwner/CommunityOwnerSectionPlaceholder";
import CommunityOwnerAcceptedCampaigns from "./pages/CommunityOwner/CommunityOwnerAcceptedCampaigns";
import CommunityOwnerCampaignWorkspace from "./pages/CommunityOwner/CommunityOwnerCampaignWorkspace";
import CommunityOwnerCampaigns from "./pages/CommunityOwner/CommunityOwnerCampaigns";
import CampaignOwnerDashboard from "./pages/CampaignOwner/CampaignOwnerDashboard";
import CampaignOwnerSectionPlaceholder from "./pages/CampaignOwner/CampaignOwnerSectionPlaceholder";
import CampaignOwnerCreateCampaign from "./pages/CampaignOwner/CampaignOwnerCreateCampaign";

import CampaignOwnerAdPreview from "./pages/CampaignOwner/CampaignOwnerAdPreview";
import CampaignOwnerMyCampaigns from "./pages/CampaignOwner/CampaignOwnerMyCampaigns";
import CampaignOwnerCampaignDetail from "./pages/CampaignOwner/CampaignOwnerCampaignDetail";
import CampaignOwnerApplications from "./pages/CampaignOwner/CampaignOwnerApplications";
import CampaignOwnerPlacements, { CampaignOwnerPlacementDetail } from "./pages/CampaignOwner/CampaignOwnerPlacements";
import CampaignOwnerPerformance from "./pages/CampaignOwner/CampaignOwnerPerformance";
import TrackingRedirect from "./pages/TrackingRedirect";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import EmailVerifiedPage from "./pages/EmailVerifiedPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordVerifyPage from "./pages/ResetPasswordVerifyPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PasswordResetSuccessPage from "./pages/PasswordResetSuccessPage";
import AdvertiserOnboardingPage from "./pages/AdvertiserOnboardingPage";
import CommunityOwnerOnboardingPage from "./pages/CommunityOwnerOnboardingPage";
import CampaignOwnerBilling from "./pages/CampaignOwner/CampaignOwnerBilling";
import Upgrade from "./pages/Billing/Upgrade";
import CampaignOwnerActivity from "./pages/CampaignOwner/CampaignOwnerActivity";
import CampaignOwnerSettings from "./pages/CampaignOwner/CampaignOwnerSettings";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminForgotPassword from "./pages/Admin/AdminForgotPassword";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminModerationPage from "./pages/Admin/AdminModerationPage";
import AdminNotificationsPage from "./pages/Admin/AdminNotificationsPage";
import AdminReportsPage from "./pages/Admin/AdminReportsPage";
import { AdminDisputesPage, AdminHealthPage, AdminNotesPage, AdminPayoutsPage } from "./pages/Admin/AdminOperationsPages";
import AdminProfilePage from "./pages/Admin/AdminProfilePage";
import { AdminActivity, AdminApplications, AdminCampaigns, AdminCommunities, AdminFinancials, AdminPlacements, AdminSettings, AdminUsers } from "./pages/Admin/AdminSectionPages";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/c/:trackingId"} component={TrackingRedirect} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/verify-email"} component={VerifyEmailPage} />
      <Route path={"/email-verified"} component={EmailVerifiedPage} />
      <Route path={"/forgot-password"} component={ForgotPasswordPage} />
      <Route path={"/reset-password/verify"} component={ResetPasswordVerifyPage} />
      <Route path={"/reset-password"} component={ResetPasswordPage} />
      <Route path={"/password-reset-success"} component={PasswordResetSuccessPage} />
      <Route path={"/onboarding/advertiser"} component={AdvertiserOnboardingPage} />
      <Route path={"/onboarding/community-owner"} component={CommunityOwnerOnboardingPage} />
      <Route path={"/privacy"} component={PrivacyPolicyPage} />
      <Route path={"/terms"} component={TermsPage} />
      <Route path={"/admin"} component={AdminLogin} />
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin/forgot-password"} component={AdminForgotPassword} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/admin/campaigns"} component={AdminCampaigns} />
      <Route path={"/admin/users"} component={AdminUsers} />
      <Route path={"/admin/communities"} component={AdminCommunities} />
      <Route path={"/admin/applications"} component={AdminApplications} />
      <Route path={"/admin/placements"} component={AdminPlacements} />
      <Route path={"/admin/financials"} component={AdminFinancials} />
      <Route path={"/admin/activity"} component={AdminActivity} />
      <Route path={"/admin/moderation"} component={AdminModerationPage} />
      <Route path={"/admin/notifications"} component={AdminNotificationsPage} />
      <Route path={"/admin/reports"} component={AdminReportsPage} />
      <Route path={"/admin/health"} component={AdminHealthPage} />
      <Route path={"/admin/disputes"} component={AdminDisputesPage} />
      <Route path={"/admin/payouts"} component={AdminPayoutsPage} />
      <Route path={"/admin/notes"} component={AdminNotesPage} />
      <Route path={"/admin/profile"} component={AdminProfilePage} />
      <Route path={"/admin/settings"} component={AdminSettings} />
      <Route path={"/community-owner"} component={CommunityOwnerDashboard} />
      <Route path={"/community-owner/accepted-campaigns"} component={CommunityOwnerAcceptedCampaigns} />
      <Route path={"/community-owner/accepted-campaigns/:id"} component={CommunityOwnerCampaignWorkspace} />
      <Route path={"/community-owner/campaigns"} component={CommunityOwnerCampaigns} />
      <Route path={"/community-owner/:section"} component={CommunityOwnerSectionPlaceholder} />
      <Route path={"/campaign-owner"} component={CampaignOwnerDashboard} />
      <Route path={"/campaign-owner/campaigns/:id"} component={CampaignOwnerCampaignDetail} />
      <Route path={"/campaign-owner/campaigns"} component={CampaignOwnerMyCampaigns} />
      <Route path={"/campaign-owner/create"} component={CampaignOwnerCreateCampaign} />
            <Route path={"/campaign-owner/ad-preview"} component={CampaignOwnerAdPreview} />
      <Route path={"/campaign-owner/applications"} component={CampaignOwnerApplications} />
      <Route path={"/campaign-owner/billing"} component={CampaignOwnerBilling} />
      <Route path={"/campaign-owner/activity"} component={CampaignOwnerActivity} />
      <Route path={"/campaign-owner/settings"} component={CampaignOwnerSettings} />
      <Route path={"/campaign-owner/placements/:id"} component={CampaignOwnerPlacementDetail} />
      <Route path={"/campaign-owner/placements"} component={CampaignOwnerPlacements} />
      <Route path={"/campaign-owner/performance"} component={CampaignOwnerPerformance} />
      <Route path={"/campaign-owner/:section"} component={CampaignOwnerSectionPlaceholder} />
      <Route path={"/"} component={LandingPage} />
      <Route path={"/campaigns"} component={Campaigns} />
      <Route path={"/campaigns/accepted"} component={AcceptedCampaigns} />
      <Route path={"/campaigns/:slug/workspace"} component={CampaignWorkspace} />
      <Route path={"/communities/add"} component={AddCommunity} />
      <Route path={"/communities/:slug"} component={CommunityDetail} />
      <Route path={"/communities"} component={Communities} />
      <Route path={"/performance"} component={Performance} />
      <Route path={"/earnings"} component={Earnings} />
      <Route path={"/activity"} component={Activity} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/profile"} component={Profile} />
            <Route path={"/notifications"} component={Notifications} />
            <Route path={"/billing/upgrade"} component={Upgrade} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        switchable
      >
        <RelaySessionProvider>
          <CurrencyProvider>
            <TooltipProvider>
              <Toaster />
              <RelayRouteGate><Router /></RelayRouteGate>
            </TooltipProvider>
          </CurrencyProvider>
        </RelaySessionProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
