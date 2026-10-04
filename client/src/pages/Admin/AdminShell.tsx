import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Activity, BarChart3, Bell, Building2, ChevronDown, ChevronLeft, ChevronRight, ClipboardList, DollarSign, FileText, HeartPulse, LayoutDashboard, LogOut, Megaphone, Moon, Scale, Settings2, ShieldAlert, ShieldCheck, Sun, UserCircle, Users, WalletCards, type LucideIcon } from "lucide-react";
import "./admin.css";
import { useAdminNotifications } from "./adminNotifications";
import AdminGlobalSearch from "./AdminGlobalSearch";
import { readAdminProfile } from "./adminProfile";

export const ADMIN_AUTH_KEY = "relay-admin-auth";

export function isAdminAuthenticated() {
  return Boolean(sessionStorage.getItem(ADMIN_AUTH_KEY));
}

type NavigationItem = { href: string; icon: LucideIcon; label: string };
type NavigationGroup = { label: string; items: NavigationItem[] };

const navigationGroups: NavigationGroup[] = [
  { label: "Overview", items: [{ href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" }, { href: "/admin/reports", icon: BarChart3, label: "Reports" }, { href: "/admin/health", icon: HeartPulse, label: "Platform health" }] },
  { label: "Marketplace", items: [{ href: "/admin/users", icon: Users, label: "Users" }, { href: "/admin/campaigns", icon: Megaphone, label: "Campaigns" }, { href: "/admin/communities", icon: Building2, label: "Communities" }, { href: "/admin/applications", icon: ClipboardList, label: "Applications" }, { href: "/admin/placements", icon: ShieldCheck, label: "Placements" }] },
  { label: "Finance", items: [{ href: "/admin/financials", icon: WalletCards, label: "Financials" }, { href: "/admin/payouts", icon: DollarSign, label: "Payouts" }] },
  { label: "Management", items: [{ href: "/admin/moderation", icon: ShieldAlert, label: "Moderation" }, { href: "/admin/disputes", icon: Scale, label: "Reviews & disputes" }, { href: "/admin/activity", icon: Activity, label: "Activity" }, { href: "/admin/notifications", icon: Bell, label: "Notifications" }] },
  { label: "System", items: [{ href: "/admin/notes", icon: FileText, label: "Admin notes" }, { href: "/admin/settings", icon: Settings2, label: "Settings" }, { href: "/admin/profile", icon: UserCircle, label: "Profile" }] },
];
const ADMIN_SIDEBAR_KEY = "relay-admin-sidebar-collapsed";
const ADMIN_THEME_KEY = "relay-admin-theme";

export default function AdminShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const [location, navigate] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => typeof window !== "undefined" && window.localStorage.getItem(ADMIN_SIDEBAR_KEY) === "true");
  const [theme, setTheme] = useState<"dark" | "light">(() => typeof window !== "undefined" && window.localStorage.getItem(ADMIN_THEME_KEY) === "light" ? "light" : "dark");
  const [openMenu, setOpenMenu] = useState<"notifications" | "profile" | null>(null);
  const [adminProfile, setAdminProfile] = useState(readAdminProfile);
  const { items: adminNotifications, unread: unreadNotifications } = useAdminNotifications();
  const pendingApplications = adminNotifications.filter((notification) => notification.type === "Pending application").length;
  useEffect(() => { if (!isAdminAuthenticated()) navigate("/admin"); }, [navigate]);
  useEffect(() => { const refreshProfile = () => setAdminProfile(readAdminProfile()); window.addEventListener("storage", refreshProfile); window.addEventListener("ownerboard:admin-profile-updated", refreshProfile); return () => { window.removeEventListener("storage", refreshProfile); window.removeEventListener("ownerboard:admin-profile-updated", refreshProfile); }; }, []);
  const toggleSidebar = () => setSidebarCollapsed((current) => {
    const next = !current;
    window.localStorage.setItem(ADMIN_SIDEBAR_KEY, String(next));
    return next;
  });
  const toggleTheme = () => setTheme((current) => {
    const next = current === "dark" ? "light" : "dark";
    window.localStorage.setItem(ADMIN_THEME_KEY, next);
    return next;
  });
  const logout = () => { sessionStorage.removeItem(ADMIN_AUTH_KEY); navigate("/admin"); };
  if (!isAdminAuthenticated()) return null;
  return <div className={`admin-react-app admin-react-theme-${theme}${sidebarCollapsed ? " admin-react-app-collapsed" : ""}`}>
    <aside className="admin-react-sidebar">
      <div className="admin-react-sidebar-top"><Link href="/admin/dashboard" className="admin-react-brand"><span className="public-brand-mark admin-react-brand-mark"><i /><i /><i /></span><span className="admin-react-brand-name">relay</span><small>ADMIN</small></Link><button className="admin-react-sidebar-toggle" type="button" onClick={toggleSidebar} aria-label={sidebarCollapsed ? "Expand Admin sidebar" : "Minimize Admin sidebar"} aria-expanded={!sidebarCollapsed}>{sidebarCollapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}</button></div>
      <div className="admin-react-identity-card"><span className="admin-react-identity-mark">AD</span><span><strong>Admin workspace</strong><small>Operations console</small></span></div>
      <nav className="admin-react-nav" aria-label="Admin navigation">{navigationGroups.map((group) => <div className="admin-react-nav-group" key={group.label}><span className="admin-react-nav-group-label">{group.label}</span>{group.items.map(({ href, icon: Icon, label }) => { const badge = href === "/admin/notifications" ? unreadNotifications.length : href === "/admin/applications" ? pendingApplications : 0; return <Link key={href} href={href} className={location === href ? "active" : ""} title={sidebarCollapsed ? label : undefined}><span><Icon size={16} strokeWidth={1.9} /></span><b>{label}</b>{badge > 0 && <i className="admin-react-nav-badge">{badge > 99 ? "99+" : badge}</i>}</Link>; })}</div>)}</nav>
      <div className="admin-react-sidebar-spacer" />
      <div className="admin-react-user"><span className="admin-react-avatar">{adminProfile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD"}</span><span className="admin-react-user-copy"><strong>{adminProfile.name}</strong><small>{adminProfile.email}</small></span><button type="button" onClick={logout} aria-label="Log out of Admin workspace"><LogOut size={15} /></button></div>
    </aside>
    <main className="admin-react-main"><header className="admin-react-topbar"><div className="admin-react-topbar-context"><strong>Admin workspace</strong><small>Marketplace operations</small></div><div className="admin-react-topbar-actions"><AdminGlobalSearch /><div className="admin-react-nav-menu"><button className="admin-react-icon-button" type="button" aria-label="Open notifications" aria-expanded={openMenu === "notifications"} onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}><Bell size={17} />{unreadNotifications.length > 0 && <i>{unreadNotifications.length > 99 ? "99+" : unreadNotifications.length}</i>}</button>{openMenu === "notifications" && <div className="admin-react-dropdown admin-react-notification-dropdown"><div className="admin-react-dropdown-heading"><strong>Notifications</strong><span>{unreadNotifications.length} unread</span></div>{adminNotifications.slice(0, 3).map((notification) => <Link className="admin-react-notification" key={notification.id} href={notification.href} onClick={() => setOpenMenu(null)}><span><Bell size={15} /></span><div><strong>{notification.title}</strong><small>{notification.description}</small></div></Link>)}{adminNotifications.length === 0 && <div className="admin-react-notification"><span><Bell size={15} /></span><div><strong>No notifications</strong><small>The marketplace has no new Admin events.</small></div></div>}<Link className="admin-react-dropdown-footer" href="/admin/notifications" onClick={() => setOpenMenu(null)}>View all notifications →</Link></div>}</div><div className="admin-react-nav-menu"><button className="admin-react-profile-button" type="button" aria-label="Open Admin profile" aria-expanded={openMenu === "profile"} onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}><UserCircle size={18} /><span>{adminProfile.name}</span><ChevronDown size={14} /></button>{openMenu === "profile" && <div className="admin-react-dropdown admin-react-profile-dropdown"><div className="admin-react-profile-header"><span className="admin-react-avatar">{adminProfile.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "AD"}</span><div><strong>{adminProfile.name}</strong><small>{adminProfile.email}</small></div></div><Link href="/admin/profile" onClick={() => setOpenMenu(null)}><UserCircle size={14} />Admin profile</Link><Link href="/admin/settings" onClick={() => setOpenMenu(null)}><Settings2 size={14} />Admin settings</Link><button className="admin-react-theme-menu-item" type="button" onClick={toggleTheme}>{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}{theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}</button><button type="button" onClick={logout}><LogOut size={14} />Log out</button></div>}</div><span className="admin-react-date">Friday, 03 October 2026</span></div></header><div className="admin-react-breadcrumb-bar"><span>Relay</span><b>/</b><span>Admin</span><b>/</b><strong>{title}</strong></div><div className="admin-react-content"><div className="admin-react-heading"><div><span className="admin-react-eyebrow">Admin console</span><h1>{title}</h1><p>{subtitle}</p></div><span>Independent access · Frontend prototype</span></div>{children}</div></main>
  </div>;
}
