import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import AdminState from "./AdminState";
import { campaignFinancials, statusPill, useAdminMarketplace } from "./AdminDataPage";
import { formatMoney } from "@/data/marketplaceData";
import { getRelayAdminOverview, relayBackendEnabled, type RelayAdminOverview } from "@/lib/relayApi";

const statusOrder = ["Active", "Published", "Paused", "Completed", "Budget Exhausted", "Draft"] as const;

export default function AdminDashboard() {
  const { campaigns, applications, clicks, activities, communities } = useAdminMarketplace();
  const [backendOverview, setBackendOverview] = useState<RelayAdminOverview | null>(null);
  useEffect(() => { if (!relayBackendEnabled()) return; void getRelayAdminOverview().then(setBackendOverview).catch(() => setBackendOverview(null)); }, []);
  const advertisers = new Set(campaigns.map((campaign) => campaign.advertiser));
  const communityOwners = new Set(communities.map((community) => community.ownerId));
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === "Active");
  const accepted = applications.filter((application) => application.status === "Accepted");
  const activePlacements = accepted.filter((application) => application.placementStatus === "Active");
  const activeCommunityIds = new Set(activePlacements.map((placement) => placement.communityId));
  const pendingApplications = applications.filter((application) => application.status === "Pending");
  const qualifiedClicks = clicks.filter((event) => event.qualification === "Qualified");
  const totals = campaigns.reduce((sum, campaign) => { const financials = campaignFinancials(campaign, clicks); return { spend: sum.spend + financials.advertiserSpend, earnings: sum.earnings + financials.communityOwnerEarnings, revenue: sum.revenue + financials.platformRevenue }; }, { spend: 0, earnings: 0, revenue: 0 });
  const statusCounts = statusOrder.map((status) => ({ status, count: campaigns.filter((campaign) => campaign.status === status).length }));
  const recentApplications = [...applications].sort((a, b) => new Date(b.applicationDate).getTime() - new Date(a.applicationDate).getTime()).slice(0, 5);
  const recentCampaigns = [...campaigns].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).slice(0, 5);
  const recentActivity = [
    ...activities.map((item) => ({ id: item.id, event: item.event, detail: item.campaignName, timestamp: item.timestamp })),
    ...applications.map((item) => ({ id: `application-${item.id}`, event: item.status === "Accepted" ? "Application approved" : item.status === "Rejected" ? "Application rejected" : "Application submitted", detail: `${item.community} · ${item.campaign}`, timestamp: item.applicationDate })),
    ...clicks.map((item) => ({ id: `click-${item.clickId}`, event: item.qualification === "Qualified" ? "Qualified click recorded" : "Click rejected", detail: `${item.campaignId} · ${item.placementId}`, timestamp: item.timestamp })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
  const maxSpend = Math.max(...campaigns.map((campaign) => campaignFinancials(campaign, clicks).advertiserSpend), 1);

  return <AdminShell title="Overview" subtitle="A live view of the entire advertising marketplace">
    <section className="admin-react-stats admin-dashboard-primary-stats">
      <Metric label="Total users" value={backendOverview?.totalUsers ?? advertisers.size + communityOwners.size} detail={`${backendOverview?.advertisers ?? advertisers.size} advertisers · ${backendOverview?.communityOwners ?? communityOwners.size} community owners`} tone="blue" />
      <Metric label="Total advertisers" value={backendOverview?.advertisers ?? advertisers.size} detail="Distinct campaign owners" tone="violet" />
      <Metric label="Total Community Owners" value={backendOverview?.communityOwners ?? communityOwners.size} detail={`${backendOverview?.communities ?? communities.length} communities registered`} tone="cyan" />
      <Metric label="Active campaigns" value={backendOverview?.activeCampaigns ?? activeCampaigns.length} detail={`${backendOverview?.campaigns ?? campaigns.length} campaigns overall`} tone="green" />
      <Metric label="Active communities" value={backendOverview?.activeCommunities ?? activeCommunityIds.size} detail={`${backendOverview?.communities ?? communities.length} registered communities`} tone="cyan" />
      <Metric label="Pending applications" value={backendOverview?.pendingApplications ?? pendingApplications.length} detail={`${backendOverview?.applications ?? applications.length} applications total`} tone="amber" />
      <Metric label="Active placements" value={backendOverview?.activePlacements ?? activePlacements.length} detail={`${backendOverview?.placements ?? accepted.length} accepted placements`} tone="violet" />
      <Metric label="Qualified clicks" value={(backendOverview?.qualifiedClicks ?? qualifiedClicks.length).toLocaleString()} detail={`${clicks.length.toLocaleString()} tracked events`} tone="blue" />
    </section>

    <section className="admin-react-financial-strip">
      <FinancialMetric label="Total advertiser spend" value={formatMoney(backendOverview?.advertiserSpend ?? totals.spend)} detail="Billable CPC spend" />
      <FinancialMetric label="Community Owner earnings" value={formatMoney(backendOverview?.communityOwnerEarnings ?? totals.earnings)} detail="75% payout share" />
      <FinancialMetric label="Platform revenue" value={formatMoney(backendOverview?.platformRevenue ?? totals.revenue)} detail="25% platform fee" />
    </section>

    <div className="admin-dashboard-grid admin-dashboard-grid-main">
      <section className="admin-react-panel admin-dashboard-panel-wide"><PanelHeading title="Campaign / placement status" detail="Current lifecycle distribution" /><div className="admin-status-overview">{statusCounts.map(({ status, count }) => <div className="admin-status-row" key={status}><span>{status}</span><div className="admin-status-track"><span className={`admin-status-fill admin-status-fill-${status.toLowerCase().replace(/\s+/g, "-")}`} style={{ width: `${campaigns.length ? Math.max((count / campaigns.length) * 100, count ? 8 : 0) : 0}%` }} /></div><strong>{count}</strong></div>)}</div><div className="admin-placement-summary"><span><b>{activePlacements.length}</b> active placements</span><span><b>{accepted.filter((application) => application.placementStatus === "Ready to Post").length}</b> ready to post</span><span><b>{accepted.filter((application) => application.placementStatus === "Completed").length}</b> completed</span></div></section>
      <section className="admin-react-panel"><PanelHeading title="Spend / revenue" detail="Derived from qualified CPC clicks" /><div className="admin-revenue-chart"><ChartBar label="Advertiser spend" value={totals.spend} max={Math.max(totals.spend, totals.revenue, 1)} amount={formatMoney(totals.spend)} tone="blue" /><ChartBar label="Community earnings" value={totals.earnings} max={Math.max(totals.spend, totals.revenue, 1)} amount={formatMoney(totals.earnings)} tone="cyan" /><ChartBar label="Platform revenue" value={totals.revenue} max={Math.max(totals.spend, totals.revenue, 1)} amount={formatMoney(totals.revenue)} tone="violet" /></div><p className="admin-chart-note">Calculated from the existing 25% platform fee and qualified click records.</p></section>
    </div>

    <div className="admin-dashboard-grid admin-dashboard-grid-lower">
      <section className="admin-react-panel"><PanelHeading title="Recent marketplace activity" link="/admin/activity" />{recentActivity.map((item) => <div className="admin-react-activity" key={item.id}><span>↗</span><div><strong>{item.event}</strong><small>{item.detail} · {new Date(item.timestamp).toLocaleString()}</small></div></div>)}{recentActivity.length === 0 && <Empty text="No marketplace activity recorded yet." />}</section>
      <section className="admin-react-panel"><PanelHeading title="Recent campaigns" link="/admin/campaigns" />{recentCampaigns.map((campaign) => <div className="admin-dashboard-list-row" key={campaign.id}><span className="admin-dashboard-list-mark">{campaign.name[0]}</span><span><strong>{campaign.name}</strong><small>{campaign.advertiser} · {campaign.location}</small></span>{statusPill(campaign.status)}</div>)}{recentCampaigns.length === 0 && <Empty text="No campaigns created yet." />}</section>
      <section className="admin-react-panel"><PanelHeading title="Recent applications" link="/admin/applications" />{recentApplications.map((application) => <div className="admin-dashboard-list-row" key={application.id}><span className="admin-dashboard-list-mark admin-dashboard-list-mark-coral">{application.community[0]}</span><span><strong>{application.community}</strong><small>{application.campaign} · {application.platform}</small></span>{statusPill(application.status)}</div>)}{recentApplications.length === 0 && <Empty text="No applications received yet." />}</section>
      <section className="admin-react-panel"><PanelHeading title="Campaign spend ranking" link="/admin/financials" />{[...campaigns].sort((a, b) => campaignFinancials(b, clicks).advertiserSpend - campaignFinancials(a, clicks).advertiserSpend).slice(0, 5).map((campaign) => { const financials = campaignFinancials(campaign, clicks); return <div className="admin-spend-row" key={campaign.id}><div><strong>{campaign.name}</strong><small>{financials.qualifiedClicks.toLocaleString()} qualified clicks</small></div><span>{formatMoney(financials.advertiserSpend)}</span><div className="admin-spend-track"><i style={{ width: `${Math.max((financials.advertiserSpend / maxSpend) * 100, financials.advertiserSpend ? 8 : 0)}%` }} /></div></div>; })}{campaigns.length === 0 && <Empty text="No campaign spend to rank yet." />}</section>
    </div>
  </AdminShell>;
}

function Metric({ label, value, detail, tone }: { label: string; value: string | number; detail: string; tone: string }) { return <div className={`admin-dashboard-metric admin-dashboard-metric-${tone}`}><small>{label}</small><strong>{value}</strong><em>{detail}</em></div>; }
function FinancialMetric({ label, value, detail }: { label: string; value: string; detail: string }) { return <div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }
function PanelHeading({ title, detail, link }: { title: string; detail?: string; link?: string }) { return <div className="admin-react-panel-heading"><div><h2>{title}</h2>{detail && <small className="admin-panel-heading-detail">{detail}</small>}</div>{link && <a href={link}>View all →</a>}</div>; }
function ChartBar({ label, value, max, amount, tone }: { label: string; value: number; max: number; amount: string; tone: string }) { return <div className="admin-chart-row"><div><span>{label}</span><strong>{amount}</strong></div><div className="admin-chart-track"><i className={`admin-chart-bar admin-chart-bar-${tone}`} style={{ width: `${Math.max((value / max) * 100, value ? 7 : 0)}%` }} /></div></div>; }
function Empty({ text }: { text: string }) { return <AdminState title={text} description="This section will update automatically when related marketplace records are available." actionLabel="Return to overview" href="/admin/dashboard" compact />; }
