import InteractiveAdminUsersPage from "./AdminUsersPage";
import InteractiveAdminCampaignsPage from "./AdminCampaignsPage";
import InteractiveAdminCommunitiesPage from "./AdminCommunitiesPage";
import InteractiveAdminApplicationsPage from "./AdminApplicationsPage";
import InteractiveAdminPlacementsPage from "./AdminPlacementsPage";
import InteractiveAdminFinancialsPage from "./AdminFinancialsPage";
import InteractiveAdminActivityPage from "./AdminActivityPage";
import AdminSettingsPage from "./AdminSettingsPage";
export function AdminCampaigns() { return <InteractiveAdminCampaignsPage />; }
export function AdminUsers() { return <InteractiveAdminUsersPage />; }
export function AdminApplications() { return <InteractiveAdminApplicationsPage />; }
export function AdminPlacements() { return <InteractiveAdminPlacementsPage />; }
export function AdminCommunities() { return <InteractiveAdminCommunitiesPage />; }
export function AdminFinancials() { return <InteractiveAdminFinancialsPage />; }
export function AdminActivity() { return <InteractiveAdminActivityPage />; }
export function AdminSettings() { return <AdminSettingsPage />; }
