import {
  Activity,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  DollarSign,
  FilePlus2,
  LayoutDashboard,
  Menu,
  Settings,
  UsersRound,
} from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";
import { useCurrency } from "@/lib/currency";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useRelaySession } from "@/contexts/RelaySessionContext";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: ClipboardList, emphasis: true },
  { href: "/communities", label: "My Communities", icon: UsersRound, emphasis: true },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/earnings", label: "Earnings", icon: DollarSign },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

const communityOwnerNavItems = [
  { href: "/community-owner", label: "Overview", icon: LayoutDashboard },
  { href: "/community-owner/campaigns", label: "Campaigns", icon: ClipboardList, emphasis: true },
  { href: "/communities", label: "My Communities", icon: UsersRound, emphasis: true },
  { href: "/community-owner/accepted-campaigns", label: "Accepted Campaigns", icon: CheckCircle2 },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/earnings", label: "Earnings", icon: DollarSign },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/settings", label: "Settings", icon: Settings },
];

const campaignOwnerNavItems = [
  { href: "/campaign-owner", label: "Overview", icon: LayoutDashboard },
  { href: "/campaign-owner/campaigns", label: "My Campaigns", icon: ClipboardList, emphasis: true },
  { href: "/campaign-owner/create", label: "Create Campaign", icon: FilePlus2, emphasis: true },
  { href: "/campaign-owner/applications", label: "Applications", icon: UsersRound },
  { href: "/campaign-owner/placements", label: "Active Placements", icon: CheckCircle2 },
  { href: "/campaign-owner/performance", label: "Performance", icon: BarChart3 },
  { href: "/campaign-owner/billing", label: "Billing", icon: CreditCard },
  { href: "/campaign-owner/activity", label: "Activity", icon: Activity },
  { href: "/campaign-owner/settings", label: "Settings", icon: Settings },
];

type WorkspaceShellProps = {
  active?: string;
  children: React.ReactNode;
  dateLabel?: string;
  workspaceLabel?: "Community Owner" | "Campaign Owner";
  workspaceMode?: "community-owner" | "campaign-owner" | "legacy";
};

export function RouteProgress() {
  const [location] = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 280);
    return () => window.clearTimeout(timer);
  }, [location]);

  return (
    <div
      className={`route-progress ${loading ? "route-progress-visible" : ""}`}
      role="progressbar"
      aria-label="Loading page"
    />
  );
}

const campaignOwnerBreadcrumbLabels: Record<string, string> = {
  campaigns: "My Campaigns",
  create: "Create Campaign",
  applications: "Applications",
  placements: "Active Placements",
  performance: "Performance",
  billing: "Billing",
  activity: "Activity",
  settings: "Settings",
};

function Breadcrumbs({ location }: { location: string }) {
  const crumbs =
    location === "/campaigns/accepted"
      ? [{ label: "Campaigns", href: "/campaigns" }, { label: "Accepted campaigns" }]
      : location === "/community-owner"
      ? [{ label: "Community Owner workspace" }]
      : location === "/campaign-owner"
      ? [{ label: "Campaign Owner workspace" }]
      : location === "/community-owner/campaigns"
      ? [{ label: "Community Owner", href: "/community-owner" }, { label: "Campaigns" }]
      : location === "/community-owner/accepted-campaigns"
      ? [{ label: "Community Owner", href: "/community-owner" }, { label: "Accepted Campaigns" }]
      : location.startsWith("/community-owner/accepted-campaigns/")
      ? [
          { label: "Community Owner", href: "/community-owner" },
          { label: "Accepted Campaigns", href: "/community-owner/accepted-campaigns" },
          { label: "Campaign workspace" },
        ]
      : location.startsWith("/campaign-owner/campaigns/")
      ? [
          { label: "Campaign Owner", href: "/campaign-owner" },
          { label: "My Campaigns", href: "/campaign-owner/campaigns" },
          { label: "Campaign Detail" },
        ]
      : location.startsWith("/campaign-owner/")
      ? [
          { label: "Campaign Owner", href: "/campaign-owner" },
          {
            label:
              campaignOwnerBreadcrumbLabels[location.slice("/campaign-owner/".length)] ??
              "Campaign Owner section",
          },
        ]
      : location.includes("/workspace")
      ? [
          { label: "Campaigns", href: "/campaigns" },
          { label: "Accepted campaigns", href: "/campaigns/accepted" },
          { label: "Campaign workspace" },
        ]
      : location.startsWith("/campaigns/")
      ? [{ label: "Campaigns", href: "/campaigns" }, { label: "Campaign details" }]
      : location === "/campaigns"
      ? [{ label: "Campaigns" }]
      : location === "/communities/add"
      ? [{ label: "My Communities", href: "/communities" }, { label: "Add Community" }]
      : location.startsWith("/communities/")
      ? [{ label: "My Communities", href: "/communities" }, { label: "Community profile" }]
      : location === "/communities"
      ? [{ label: "My Communities" }]
      : location === "/"
      ? [{ label: "Overview" }]
      : [{ label: "Workspace" }, { label: location.slice(1).replaceAll("/", " · ") }];

  return (
    <div className="breadcrumb-bar" aria-label="Breadcrumb">
      {crumbs.map((crumb, index) => (
        <span
          key={`${crumb.label}-${index}`}
          className={index === crumbs.length - 1 ? "breadcrumb-current" : ""}
        >
          {index > 0 && <span className="breadcrumb-separator">/</span>}
          {crumb.href ? (
            <Link className="breadcrumb-link" href={crumb.href}>
              {crumb.label}
            </Link>
          ) : (
            crumb.label
          )}
        </span>
      ))}
    </div>
  );
}

export default function WorkspaceShell({
  active = "Overview",
  children,
  dateLabel = "Tuesday, June 17, 2025",
  workspaceLabel: workspaceLabelProp = "Community Owner",
  workspaceMode: workspaceModeProp = "legacy",
}: WorkspaceShellProps) {
  const [location] = useLocation();
  const session = useRelaySession();
  const role = session.status === "authenticated" ? session.user?.role : undefined;
  const roleLocked = role === "Advertiser" || role === "CommunityOwner";
  const workspaceMode =
    role === "Advertiser"
      ? "campaign-owner"
      : role === "CommunityOwner"
      ? "community-owner"
      : workspaceModeProp;
  const workspaceLabel =
    role === "Advertiser"
      ? "Campaign Owner"
      : role === "CommunityOwner"
      ? "Community Owner"
      : workspaceLabelProp;

  const [campaignsOpen, setCampaignsOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("ownerboard-sidebar-collapsed") === "true"
  );
  const { currency } = useCurrency();

  const toggleSidebar = () =>
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      localStorage.setItem("ownerboard-sidebar-collapsed", String(next));
      return next;
    });

  return (
    <div className={`app-shell ${sidebarCollapsed ? "app-shell-sidebar-collapsed" : ""}`}>
      <RouteProgress />
      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-mobile-open" : ""}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-brand-row">
          <Link className="wordmark" href="/" aria-label="relay home">
            <span className="wordmark-spark" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span>relay</span>
          </Link>
        </div>
        <div
          className="workspace-switcher"
          style={roleLocked ? { display: "none" } : undefined}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setMobileMenuOpen(false);
          }}
        >
          <span className="workspace-switcher-label">
            <BriefcaseBusiness size={11} /> Development workspaces
          </span>
          <Link
            className={`workspace-switcher-link ${
              workspaceLabel === "Community Owner" ? "workspace-switcher-link-active" : ""
            }`}
            href="/community-owner"
          >
            <span className="workspace-switcher-dot workspace-switcher-dot-community" />
            <span>Community Owner</span>
          </Link>
          <Link
            className={`workspace-switcher-link ${
              workspaceLabel === "Campaign Owner" ? "workspace-switcher-link-active" : ""
            }`}
            href="/campaign-owner"
          >
            <span className="workspace-switcher-dot workspace-switcher-dot-campaign" />
            <span>Campaign Owner</span>
          </Link>
        </div>
        <nav
          className="sidebar-nav"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setMobileMenuOpen(false);
          }}
        >
          <span className="nav-section-label">Workspace</span>
          {workspaceMode === "community-owner"
            ? communityOwnerNavItems.map(({ href, label, icon: Icon, emphasis }) => (
                <Link
                  key={label}
                  className={`nav-item ${active === label ? "nav-item-active" : ""} ${
                    emphasis ? "nav-item-emphasis" : ""
                  }`}
                  href={href}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {active === label && <span className="nav-active-dot" />}
                </Link>
              ))
            : workspaceMode === "campaign-owner"
            ? campaignOwnerNavItems.map(({ href, label, icon: Icon, emphasis }) => (
                <Link
                  key={label}
                  className={`nav-item ${active === label ? "nav-item-active" : ""} ${
                    emphasis ? "nav-item-emphasis" : ""
                  }`}
                  href={href}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  {active === label && <span className="nav-active-dot" />}
                </Link>
              ))
            : navItems.map(({ href, label, icon: Icon, emphasis }) =>
                label === "Campaigns" ? (
                  <div className="nav-group" key={label}>
                    <div className="nav-item-row">
                      <Link
                        className={`nav-item nav-item-grow ${
                          active === label ? "nav-item-active" : ""
                        } ${emphasis ? "nav-item-emphasis" : ""}`}
                        href={href}
                      >
                        <Icon size={17} />
                        <span>{label}</span>
                        <span className="nav-count">3</span>
                        {active === label && <span className="nav-active-dot" />}
                      </Link>
                      <button
                        className="nav-group-toggle"
                        onClick={() => setCampaignsOpen((open) => !open)}
                        aria-label="Toggle campaign links"
                        aria-expanded={campaignsOpen}
                      >
                        <ChevronDown
                          size={13}
                          className={campaignsOpen ? "nav-chevron-open" : ""}
                        />
                      </button>
                    </div>
                    {campaignsOpen && (
                      <div className="accepted-nav-list">
                        <span className="accepted-nav-label">Campaign tracking</span>
                        <Link
                          className={`accepted-nav-link ${
                            location === "/campaigns/accepted" || location.includes("/workspace")
                              ? "accepted-nav-link-active"
                              : ""
                          }`}
                          href="/campaigns/accepted"
                        >
                          <span className="accepted-nav-dot" />
                          Accepted campaigns
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={label}
                    className={`nav-item ${active === label ? "nav-item-active" : ""} ${
                      emphasis ? "nav-item-emphasis" : ""
                    }`}
                    href={href}
                  >
                    <Icon size={17} />
                    <span>{label}</span>
                    {active === label && <span className="nav-active-dot" />}
                  </Link>
                )
              )}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-tip">
            <span className="tip-icon">
              <UsersRound size={15} />
            </span>
            <div>
              <strong>{workspaceLabel} workspace</strong>
              <p>
                {roleLocked
                  ? "Signed in with your account role."
                  : "Development workspace with no access controls."}
              </p>
            </div>
          </div>
          <ProfileMenu variant="sidebar" />
        </div>
      </aside>
      <button
        className="sidebar-collapse-button"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
        title={sidebarCollapsed ? "Expand sidebar" : "Minimize sidebar"}
      >
        {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      {mobileMenuOpen && (
        <button
          className="mobile-menu-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <main className="dashboard">
        <header className="topbar">
          <button
            className="mobile-menu-button"
            aria-label="Open navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Menu size={20} />
          </button>
          <div className="topbar-context">
            <span className="topbar-kicker">{workspaceLabel} workspace</span>
            <span className="topbar-date">{dateLabel}</span>
          </div>
          <div className="topbar-actions" style={{ marginLeft: "auto" }}>
            <button className="icon-button" aria-label="View notifications">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <ProfileMenu />
          </div>
        </header>
        <Breadcrumbs location={location} />
        <div key={currency}>{children}</div>
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {workspaceMode === "community-owner" ? (
            <>
              <Link
                className={active === "Overview" ? "mobile-nav-active" : ""}
                href="/community-owner"
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </Link>
              <Link
                className={active === "Campaigns" ? "mobile-nav-active" : ""}
                href="/community-owner/campaigns"
              >
                <ClipboardList size={18} />
                <span>Campaigns</span>
              </Link>
              <Link
                className={active === "My Communities" ? "mobile-nav-active" : ""}
                href="/communities"
              >
                <UsersRound size={18} />
                <span>Communities</span>
              </Link>
              <Link
                className={active === "Accepted Campaigns" ? "mobile-nav-active" : ""}
                href="/community-owner/accepted-campaigns"
              >
                <CheckCircle2 size={18} />
                <span>Accepted</span>
              </Link>
            </>
          ) : workspaceMode === "campaign-owner" ? (
            <>
              <Link
                className={active === "Overview" ? "mobile-nav-active" : ""}
                href="/campaign-owner"
              >
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </Link>
              <Link
                className={active === "My Campaigns" ? "mobile-nav-active" : ""}
                href="/campaign-owner/campaigns"
              >
                <ClipboardList size={18} />
                <span>Campaigns</span>
              </Link>
              <Link
                className={active === "Applications" ? "mobile-nav-active" : ""}
                href="/campaign-owner/applications"
              >
                <UsersRound size={18} />
                <span>Applications</span>
              </Link>
              <Link
                className={active === "Active Placements" ? "mobile-nav-active" : ""}
                href="/campaign-owner/placements"
              >
                <CheckCircle2 size={18} />
                <span>Placements</span>
              </Link>
            </>
          ) : (
            <>
              <Link className={active === "Overview" ? "mobile-nav-active" : ""} href="/">
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </Link>
              <Link
                className={active === "Campaigns" ? "mobile-nav-active" : ""}
                href="/campaigns"
              >
                <ClipboardList size={18} />
                <span>Campaigns</span>
              </Link>
              <Link
                className={active === "My Communities" ? "mobile-nav-active" : ""}
                href="/communities"
              >
                <UsersRound size={18} />
                <span>Communities</span>
              </Link>
              <Link
                className={active === "Earnings" ? "mobile-nav-active" : ""}
                href="/earnings"
              >
                <DollarSign size={18} />
                <span>Earnings</span>
              </Link>
            </>
          )}
        </nav>
      </main>
    </div>
  );
}