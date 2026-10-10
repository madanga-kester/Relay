import { ArrowUpRight, BarChart3, CheckCircle2, ClipboardList, Clock3, DollarSign, MousePointer2, Plus } from "lucide-react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import PlatformMark from "@/components/PlatformMark";
import { useRelaySession } from "@/contexts/RelaySessionContext";
import { formatMembers, greetingFor, useRelayOverview } from "@/lib/useRelayOverview";

export default function CommunityOwnerDashboard() {
  const session = useRelaySession();
  const { campaigns, communities, applications, placements } = useRelayOverview("CommunityOwner");

  const communityById = new Map(communities.map((community) => [community.id, community]));
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const pending = applications.filter((application) => application.status === "Pending");
  const accepted = applications.filter((application) => application.status === "Accepted");
  const livePlacements = placements.filter((placement) => placement.status === "Active");

  const metrics = [
    { label: "Pending applications", value: String(pending.length), detail: "Waiting for approval", icon: Clock3, tone: "lilac" },
    { label: "Accepted campaigns", value: String(accepted.length), detail: "Approved by campaign owners", icon: CheckCircle2, tone: "moss" },
    { label: "Active campaigns", value: String(livePlacements.length), detail: "Currently tracking", icon: ClipboardList, tone: "coral" },
    { label: "Total clicks", value: "—", detail: "Click tracking is not connected yet", icon: MousePointer2, tone: "lilac" },
    { label: "Total earnings", value: "—", detail: "Earnings tracking is not connected yet", icon: DollarSign, tone: "moss" },
  ];

  return <WorkspaceShell active="Overview" workspaceLabel="Community Owner" workspaceMode="community-owner">
    <div className="dashboard-body community-owner-overview">
      <section className="community-owner-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Community Owner workspace</span><h1>{greetingFor(session.user?.displayName)}</h1><p>Here is what needs your attention across your Kenyan communities today.</p></div><Link className="primary-owner-button" href="/communities/add"><Plus size={16} /> Add community</Link></section>
      <div className="community-owner-metric-grid">{metrics.map(({ label, value, detail, icon: Icon, tone }) => <article className={`community-owner-metric community-owner-metric-${tone}`} key={label}><span className="community-owner-metric-icon"><Icon size={17} /></span><span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span></article>)}</div>
      <section className="community-owner-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Application queue</div><h2>Pending applications</h2></div><span className="section-count">{pending.length} awaiting approval</span></div><div className="community-owner-action-list">{pending.length === 0 && <p>No applications are waiting for approval.</p>}{pending.slice(0, 3).map((application) => <article className="community-owner-action-row" key={application.id}><span className="community-owner-action-icon community-owner-action-icon-lilac"><Clock3 size={17} /></span><span><strong>{campaignById.get(application.campaignId)?.name ?? "Campaign"}</strong><small>{communityById.get(application.communityId)?.name ?? "Community"}</small></span><b>Awaiting approval</b><ArrowUpRight size={15} /></article>)}</div></section>
      <section className="community-owner-two-column"><div className="community-owner-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line" /> Approved by Campaign Owners</div><h2>Accepted campaigns</h2></div><Link className="section-link" href="/community-owner/accepted-campaigns">View all <ArrowUpRight size={14} /></Link></div><div className="community-owner-compact-list">{accepted.length === 0 && <p>No accepted campaigns yet.</p>}{accepted.slice(0, 3).map((application) => <Link className="community-owner-compact-row" href="/community-owner/accepted-campaigns" key={application.id}><span className="community-owner-compact-dot community-owner-compact-dot-moss" /><span><strong>{campaignById.get(application.campaignId)?.name ?? "Campaign"}</strong><small>{communityById.get(application.communityId)?.name ?? "Community"}</small></span><b>{application.placement?.status === "Active" ? "Live" : "Post ready"}</b><ArrowUpRight size={14} /></Link>)}</div></div><div className="community-owner-section community-owner-health-card"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Results</div><h2>Live campaigns</h2></div><BarChart3 size={18} /></div><strong className="community-owner-health-number">{livePlacements.length}</strong><p>Campaigns currently posting across your communities. Click and earnings results will appear here once tracking is connected.</p><Link className="section-link" href="/performance">View performance <ArrowUpRight size={14} /></Link></div></section>
      <section className="community-owner-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line" /> Your digital assets</div><h2>My communities</h2></div><Link className="section-link" href="/communities">Manage communities <ArrowUpRight size={14} /></Link></div><div className="community-owner-communities">{communities.length === 0 && <p>You have not added a community yet. Add one to start applying to campaigns.</p>}{communities.map((community) => <Link className="community-owner-community-card" href="/communities" key={community.id}><div className="community-owner-community-top"><PlatformMark platform={community.platform} fallback={community.name.charAt(0)} className="community-owner-community-avatar" /><span><strong>{community.name}</strong><small>{community.platform} · {formatMembers(community.members)} members</small></span><span className={community.verificationStatus === "Verified" ? "health-good" : "health-warn"}>{community.verificationStatus}</span></div><div className="community-owner-community-stats"><span><strong>—</strong><small>clicks</small></span><span><strong>—</strong><small>earned</small></span></div></Link>)}</div></section>
    </div>
  </WorkspaceShell>;
}