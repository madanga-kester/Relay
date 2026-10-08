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
import NotificationBell from "@/components/NotificationBell";
import GlobalSearch from "@/components/GlobalSearch";
import type { SearchItem } from "@/components/GlobalSearch";
import { useCurrency } from "@/lib/currency";
import { Link, useLocation } from "wouter";
import { Fragment, useEffect, useState } from "react";
import { useRelaySession } from "@/contexts/RelaySessionContext";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/campaigns", label: "Campaigns", icon: ClipboardList, emphasis: true },
  { href: "/communities", label: "My Communities", icon: UsersRound, emphasis: true },
  { href: "/performance", label: "Performance", icon: BarChart3 },
  { href: "/earnings", label: "Earnings", icon: DollarSign },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/notifications", label: "Notifications", icon: Bell },
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
  { href: "/notifications", label: "Notifications", icon: Bell },
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
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/campaign-owner/settings", label: "Settings", icon: Settings },
];
type NavItemDef = {
  href: string;
  label: string;
  icon: typeof BarChart3;
  emphasis?: boolean | undefined;
};

type NavItemEntry = { kind: "item"; label: string };

type NavGroupEntry = {
  kind: "group";
  id: string;
  label: string;
  icon: typeof BarChart3;
  labels: string[];
};

type NavLayoutEntry = NavItemEntry | NavGroupEntry;

const legacyNavLayout: NavLayoutEntry[] = [
  { kind: "item", label: "Overview" },
  { kind: "item", label: "Campaigns" },
  { kind: "item", label: "My Communities" },
  {
    kind: "group",
    id: "legacy-insights",
    label: "Insights",
    icon: BarChart3,
    labels: ["Performance", "Earnings", "Activity"],
  },
  { kind: "item", label: "Notifications" },
  { kind: "item", label: "Settings" },
];

const communityOwnerNavLayout: NavLayoutEntry[] = [
  { kind: "item", label: "Overview" },
  {
    kind: "group",
    id: "community-owner-campaigns",
    label: "Campaigns",
    icon: ClipboardList,
    labels: ["Campaigns", "Accepted Campaigns"],
  },
  { kind: "item", label: "My Communities" },
  {
    kind: "group",
    id: "community-owner-insights",
    label: "Insights",
    icon: BarChart3,
    labels: ["Performance", "Earnings", "Activity"],
  },
  { kind: "item", label: "Notifications" },
  { kind: "item", label: "Settings" },
];

const campaignOwnerNavLayout: NavLayoutEntry[] = [
  { kind: "item", label: "Overview" },
  {
    kind: "group",
    id: "campaign-owner-campaigns",
    label: "Campaigns",
    icon: ClipboardList,
    labels: ["My Campaigns", "Create Campaign", "Applications", "Active Placements"],
  },
  {
    kind: "group",
    id: "campaign-owner-insights",
    label: "Insights",
    icon: BarChart3,
    labels: ["Performance", "Activity"],
  },
  { kind: "item", label: "Billing" },
  { kind: "item", label: "Notifications" },
  { kind: "item", label: "Settings" },
];

function resolveNavGroupItems(items: NavItemDef[], labels: string[]): NavItemDef[] {
  return labels
    .map((label) => items.find((item) => item.label === label))
    .filter((item): item is NavItemDef => Boolean(item));
}
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
const liveDateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
});

const liveTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function LiveDateTime() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      const current = new Date();
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60000 - (current.getSeconds() * 1000 + current.getMilliseconds()));
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <>
      {liveDateFormatter.format(now)} | {liveTimeFormatter.format(now)}
    </>
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

const sharedBreadcrumbLabels: Record<string, string> = {
  "/performance": "Performance",
  "/earnings": "Earnings",
  "/activity": "Activity",
  "/settings": "Settings",
  "/profile": "Profile",
  "/notifications": "Notifications",
};

const TRAIL_KEY = "relay-breadcrumb-trail";
const TRAIL_MAX = 6;

type TrailItem = { href: string; label: string };

function readTrail(): TrailItem[] {
  try {
    const raw = sessionStorage.getItem(TRAIL_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item) =>
        item && typeof item.href === "string" && typeof item.label === "string"
    );
  } catch {
    return [];
  }
}

function writeTrail(trail: TrailItem[]) {
  try {
    sessionStorage.setItem(TRAIL_KEY, JSON.stringify(trail));
  } catch {
    /* storage unavailable, trail still works in memory */
  }
}

function addToTrail(trail: TrailItem[], item: TrailItem): TrailItem[] {
  return [...trail.filter((entry) => entry.href !== item.href), item].slice(-TRAIL_MAX);
}

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

            : sharedBreadcrumbLabels[location]
      ? [{ label: "Workspace" }, { label: sharedBreadcrumbLabels[location] }]
      : [{ label: "Workspace" }, { label: location.slice(1).replaceAll("/", " · ") }];

  const currentItem: TrailItem = {
    href: location,
    label: crumbs[crumbs.length - 1].label,
  };
  const [trail, setTrail] = useState<TrailItem[]>(() =>
    addToTrail(readTrail(), currentItem)
  );

  useEffect(() => {
    const next = addToTrail(readTrail(), currentItem);
    writeTrail(next);
    setTrail(next);
  }, [currentItem.href, currentItem.label]);

  const clearTrail = () => {
    const only = [currentItem];
    writeTrail(only);
    setTrail(only);
  };

  return (
    <div className="breadcrumb-bar" aria-label="Breadcrumb">
      {trail.map((item, index) => (
        <span
          key={item.href}
          className={index === trail.length - 1 ? "breadcrumb-current" : ""}
        >
          {index > 0 && (
            <span
              className="breadcrumb-separator"
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: 4,
                height: 4,
                borderRadius: "50%",
                backgroundColor: "currentColor",
                opacity: 0.4,
                verticalAlign: "middle",
              }}
            />
          )}
          {index === trail.length - 1 ? (
            item.label
          ) : (
            <Link className="breadcrumb-link" href={item.href}>
              {item.label}
            </Link>
          )}
        </span>
      ))}
      {trail.length >= TRAIL_MAX && (
        <button
          type="button"
          className="breadcrumb-link"
          onClick={clearTrail}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            cursor: "pointer",
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}

export default function WorkspaceShell({
  active = "Overview",
  children,
  dateLabel,
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

        const homeHref =
    workspaceMode === "campaign-owner"
      ? "/campaign-owner"
      : workspaceMode === "community-owner"
      ? "/community-owner"
      : "/";

  const [campaignsOpen, setCampaignsOpen] = useState(true);
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("ownerboard-sidebar-collapsed") === "true";
    } catch {
      return false;
    }
  });
  const [sidebarHovered, setSidebarHovered] = useState(false);
    const sidebarIconOnly = sidebarCollapsed && !sidebarHovered;
  const { currency } = useCurrency();

  
  const activeNavItems: NavItemDef[] =
    workspaceMode === "community-owner"
      ? communityOwnerNavItems
      : workspaceMode === "campaign-owner"
      ? campaignOwnerNavItems
      : navItems;
  const activeNavLayout: NavLayoutEntry[] =
    workspaceMode === "community-owner"
      ? communityOwnerNavLayout
      : workspaceMode === "campaign-owner"
      ? campaignOwnerNavLayout
      : legacyNavLayout;

  const toggleNavGroup = (id: string, currentlyExpanded: boolean) =>
    setOpenGroups((groups) => ({ ...groups, [id]: !currentlyExpanded }));

  const renderNavLink = ({ href, label, icon: Icon, emphasis }: NavItemDef) => (
    <Link
      key={label}
      className={`nav-item ${active === label ? "nav-item-active" : ""} ${
        emphasis ? "nav-item-emphasis" : ""
      }`}
      href={href}
      aria-label={label}
      aria-current={active === label ? "page" : undefined}
      title={sidebarIconOnly ? label : undefined}
    >
      <Icon size={17} />
      <span>{label}</span>
      {active === label && <span className="nav-active-dot" />}
    </Link>
  );

  const renderNavGroup = (group: NavGroupEntry) => {
    const groupItems = resolveNavGroupItems(activeNavItems, group.labels);
    if (groupItems.length === 0) return null;

    if (sidebarIconOnly) {
      return (
        <Fragment key={group.id}>
          {groupItems.map((item) => renderNavLink(item))}
        </Fragment>
      );
    }

    const GroupIcon = group.icon;
    const hasActive = groupItems.some((item) => item.label === active);
    const expanded = group.id in openGroups ? openGroups[group.id] : hasActive;

    return (
      <div className="nav-group" key={group.id}>
        <div className="nav-item-row">
          <button
            type="button"
            className={`nav-item nav-item-grow ${
              hasActive && !expanded ? "nav-item-active" : ""
            }`}
            onClick={() => toggleNavGroup(group.id, expanded)}
            aria-expanded={expanded}
            aria-controls={`nav-group-${group.id}`}
            style={{
              background: "none",
              border: "none",
              font: "inherit",
              color: "inherit",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <GroupIcon size={17} />
            <span>{group.label}</span>
          </button>
          <button
            type="button"
            className="nav-group-toggle"
            onClick={() => toggleNavGroup(group.id, expanded)}
            aria-label={`Toggle ${group.label} links`}
            aria-expanded={expanded}
          >
            <ChevronDown size={13} className={expanded ? "nav-chevron-open" : ""} />
          </button>
        </div>
        {expanded && (
          <div id={`nav-group-${group.id}`} style={{ paddingLeft: 12 }}>
            {groupItems.map((item) => renderNavLink(item))}
          </div>
        )}
      </div>
    );
  };
  const searchItems: SearchItem[] = [
    ...activeNavItems.map(({ href, label }) => ({ href, label, group: "Pages" })),
    { href: "/profile", label: "Profile settings", group: "Account" },
    { href: "/billing/upgrade", label: "Upgrade plan", group: "Account" },
  ];
  const toggleSidebar = () =>
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      try {
        localStorage.setItem("ownerboard-sidebar-collapsed", String(next));
      } catch {
        /* storage unavailable, state still updates in memory */
      }
      return next;
    });

  return (
    <div
      className={`app-shell ${sidebarCollapsed ? "app-shell-sidebar-collapsed" : ""} ${
        sidebarCollapsed && sidebarHovered ? "app-shell-sidebar-peek" : ""
      }`}
    >
      <RouteProgress />
      <aside
        className={`sidebar ${mobileMenuOpen ? "sidebar-mobile-open" : ""}`}
        aria-label="Main navigation"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className="sidebar-brand-row">
          <Link className="wordmark" href={homeHref} aria-label="relay home">
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
          {activeNavLayout.map((entry) => {
            if (entry.kind === "group") {
              return renderNavGroup(entry);
            }
            const item = activeNavItems.find((candidate) => candidate.label === entry.label);
            if (!item) {
              return null;
            }
            if (workspaceMode === "legacy" && item.label === "Campaigns") {
              const { href, label, icon: Icon, emphasis } = item;
              return (
                <div className="nav-group" key={label}>
                  <div className="nav-item-row">
                    <Link
                      className={`nav-item nav-item-grow ${
                        active === label ? "nav-item-active" : ""
                      } ${emphasis ? "nav-item-emphasis" : ""}`}
                      href={href}
                      aria-label={label}
                      aria-current={active === label ? "page" : undefined}
                      title={sidebarIconOnly ? label : undefined}
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
              );
            }
            return renderNavLink(item);
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-clock">
            <LiveDateTime />
          </div>
       
          <ProfileMenu
            variant="sidebar"
            sidebarCollapsed={sidebarCollapsed && !sidebarHovered}
          />
        </div>
      </aside>
      <button
        className="sidebar-collapse-button"
        onClick={toggleSidebar}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
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
          </div>
          <div className="topbar-actions" style={{ marginLeft: "auto" }}>
                        <GlobalSearch items={searchItems} />
            <NotificationBell />
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
                className={active === "Performance" ? "mobile-nav-active" : ""}
                href="/campaign-owner/performance"
              >
                <BarChart3 size={18} />
                <span>Performance</span>
              </Link>
              <Link
                className={active === "Billing" ? "mobile-nav-active" : ""}
                href="/campaign-owner/billing"
              >
                <CreditCard size={18} />
                <span>Billing</span>
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