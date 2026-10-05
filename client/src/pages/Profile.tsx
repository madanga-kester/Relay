import { ArrowLeft, Check, Moon, Settings, Sun } from "lucide-react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useRelaySession } from "@/contexts/RelaySessionContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Link } from "wouter";

export default function Profile() {
  const { theme, toggleTheme } = useTheme();
  const session = useRelaySession();
  const role = session.status === "authenticated" ? session.user?.role : undefined;
  const homeHref =
    role === "Advertiser"
      ? "/campaign-owner"
      : role === "CommunityOwner"
      ? "/community-owner"
      : "/";
  return (
    <WorkspaceShell active="Profile" dateLabel="Account preferences">
      <div className="dashboard-body"><section className="route-page-heading"><div><span className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Account</span><h1>Community profile</h1><p>Keep your community details and workspace preferences close at hand.</p></div><Link className="hero-link route-back-link route-back-link-dark" href={homeHref}><ArrowLeft size={15} /> Back to overview</Link></section><section className="profile-page-grid"><article className="profile-settings-card"><div className="profile-large-avatar">AS</div><div><span className="insight-kicker">Community owner</span><h2>Ava Sinclair</h2><p>@avaafterhours · 18.4k community members</p></div><button className="profile-edit-button">Edit profile</button></article><article className="preference-card"><div className="preference-card-heading"><span className="preference-icon"><Settings size={17} /></span><div><h2>Workspace preferences</h2><p>Make Relay feel right for your daily workflow.</p></div></div><button className="preference-row" onClick={toggleTheme}><span className="preference-row-icon">{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</span><span><strong>{theme === "dark" ? "Light theme" : "Dark theme"}</strong><small>Use a {theme === "dark" ? "brighter" : "darker"} workspace when you need it.</small></span><span className={`theme-switch ${theme === "dark" ? "theme-switch-on" : ""}`}><span /></span></button><div className="preference-row preference-row-static"><span className="preference-row-icon"><Check size={16} /></span><span><strong>Weekly payout digest</strong><small>Sent every Monday at 9:00 AM.</small></span><span className="preference-check"><Check size={13} /></span></div></article></section></div>    </WorkspaceShell>
  );
}
