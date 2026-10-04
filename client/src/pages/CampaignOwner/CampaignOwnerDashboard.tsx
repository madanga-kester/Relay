import { ArrowUpRight, BarChart3, CheckCircle2, ClipboardList, DollarSign, Megaphone, Plus, UsersRound } from "lucide-react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useRelaySession } from "@/contexts/RelaySessionContext";
import { formatKsh, formatMembers, greetingFor, useRelayOverview } from "@/lib/useRelayOverview";

const statusLook: Record<string, { label: string; tone: string }> = {
  Active: { label: "Live", tone: "moss" },
  Published: { label: "Published", tone: "lilac" },
  Draft: { label: "Draft", tone: "coral" },
  Paused: { label: "Paused", tone: "coral" },
  Completed: { label: "Completed", tone: "lilac" },
  BudgetExhausted: { label: "Budget used", tone: "coral" },
};

export default function CampaignOwnerDashboard() {
  const session = useRelaySession();
  const { campaigns, communities, applications, placements } = useRelayOverview("Advertiser");

  const communityById = new Map(communities.map((community) => [community.id, community]));
  const campaignById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
  const pending = applications.filter((application) => application.status === "Pending");
  const accepted = applications.filter((application) => application.status === "Accepted");
  const livePlacements = placements.filter((placement) => placement.status === "Active");
  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0);

  const metrics = [
    { label: "Active campaigns", value: String(campaigns.filter((campaign) => campaign.status === "Active").length), detail: `${campaigns.length} campaigns in total`, icon: Megaphone, tone: "coral" },
    { label: "Applications received", value: String(applications.length), detail: `${pending.length} awaiting your review`, icon: UsersRound, tone: "lilac" },
    { label: "Active placements", value: String(livePlacements.length), detail: "Communities currently posting", icon: CheckCircle2, tone: "moss" },
    { label: "Total clicks", value: "—", detail: "Click tracking is not connected yet", icon: BarChart3, tone: "lilac" },
    { label: "Accepted applications", value: String(accepted.length), detail: "Ready for placement", icon: CheckCircle2, tone: "coral" },
    { label: "Campaign budget", value: formatKsh(totalBudget), detail: `Across ${campaigns.length} campaigns`, icon: DollarSign, tone: "moss" },
  ];

  return <WorkspaceShell active="Overview" workspaceLabel="Campaign Owner" workspaceMode="campaign-owner">
    <div className="dashboard-body campaign-owner-overview"><section className="campaign-owner-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Campaign Owner workspace</span><h1>{greetingFor(session.user?.displayName)}</h1><p>Manage your Kenyan campaigns, review community applications, and keep every placement on track.</p></div><Link className="primary-owner-button" href="/campaign-owner/create"><Plus size={16} /> Create campaign</Link></section>
      <div className="campaign-owner-metric-grid">{metrics.map(({ label, value, detail, icon: Icon, tone }) => <article className={`campaign-owner-metric campaign-owner-metric-${tone}`} key={label}><span className="campaign-owner-metric-icon"><Icon size={17} /></span><span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span></article>)}</div>
      <section className="campaign-owner-two-column"><div className="campaign-owner-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line" /> Attention needed</div><h2>Applications to review</h2></div><Link className="section-link" href="/campaign-owner/applications">View all <ArrowUpRight size={14} /></Link></div><div className="campaign-owner-application-list">{pending.length === 0 && <p>No applications are waiting for review.</p>}{pending.slice(0, 3).map((application) => { const community = communityById.get(application.communityId); const campaign = campaignById.get(application.campaignId); const name = community?.name ?? "Community"; return <Link className="campaign-owner-application-row" href="/campaign-owner/applications" key={application.id}><span className="campaign-owner-application-avatar campaign-owner-application-avatar-coral">{name.charAt(0)}</span><span><strong>{name}</strong><small>{community ? `${community.platform} · ${formatMembers(community.members)} members · ` : ""}{campaign?.name ?? "Campaign"}</small></span><b>Review application</b><ArrowUpRight size={15} /></Link>; })}</div></div><div className="campaign-owner-budget-card"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Budget</div><h2>Campaign budget</h2></div><DollarSign size={18} /></div><strong className="campaign-owner-budget-number">{formatKsh(totalBudget)}</strong><div className="campaign-owner-budget-labels"><span>{campaigns.length} campaigns</span><span>Spend tracking is not connected yet</span></div><Link className="section-link" href="/campaign-owner/billing">Open billing <ArrowUpRight size={14} /></Link></div></section>
      <section className="campaign-owner-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Campaign portfolio</div><h2>My campaigns</h2></div><Link className="section-link" href="/campaign-owner/campaigns">View all campaigns <ArrowUpRight size={14} /></Link></div><div className="campaign-owner-campaign-grid">{campaigns.length === 0 && <p>You have no campaigns yet. Create your first campaign to start receiving applications.</p>}{campaigns.slice(0, 3).map((campaign) => { const look = statusLook[campaign.status] ?? { label: campaign.status, tone: "lilac" }; return <Link className="campaign-owner-campaign-card" href="/campaign-owner/campaigns" key={campaign.id}><div className="campaign-owner-campaign-top"><span className={`campaign-owner-status campaign-owner-status-${look.tone}`}><span /> {look.label}</span><Megaphone size={17} /></div><h3>{campaign.name}</h3><div className="campaign-owner-campaign-meta"><span><strong>{livePlacements.filter((placement) => placement.campaignId === campaign.id).length}</strong><small>active placements</small></span><span><strong>{applications.filter((application) => application.campaignId === campaign.id).length}</strong><small>received</small></span><span><strong>—</strong><small>tracked clicks</small></span></div><div className="campaign-owner-campaign-footer"><span>{formatKsh(campaign.budget)}</span><ArrowUpRight size={14} /></div></Link>; })}</div></section>
      <section className="campaign-owner-section campaign-owner-placement-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line" /> Live delivery</div><h2>Active placements</h2></div><span className="section-count">{livePlacements.length} communities live</span></div><div className="campaign-owner-placement-strip"><span className="campaign-owner-placement-icon"><ClipboardList size={17} /></span><span><strong>{livePlacements.length > 0 ? "Communities are posting your campaigns" : "No placements are live yet"}</strong><small>All click totals count visits to your tracked destination after leaving the community app.</small></span><Link className="section-link" href="/campaign-owner/placements">View placements <ArrowUpRight size={14} /></Link></div></section>
    </div>
  </WorkspaceShell>;
}