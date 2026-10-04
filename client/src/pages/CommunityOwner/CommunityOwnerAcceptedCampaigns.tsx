import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, Clock3, Link2, MousePointer2, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import { getAcceptedCommunityCampaigns, readApplications, syncServerClickEvents } from "../CampaignOwner/applicationData";
import { getRelayBackendId, listRelayApplications, relayBackendEnabled } from "@/lib/relayApi";
import { saveApplications, type MarketplaceApplication } from "@/data/marketplaceData";
import { displayMoney } from "@/data/marketplaceData";
export type AcceptedCommunityCampaign = {
  id: string;
  name: string;
  advertiser: string;
  community: string;
  platform: string;
  duration: string;
  earnings: string;
  payoutPerClick?: string;
  totalEarnings?: string;
  qualifiedClicks?: number;
  status: "Ready to Post" | "Active" | "Completed";
  clicks: string;
  startDate: string;
  endDate: string;
  trackingLink: string;
  advertisement: string;
  instructions: string[];
};

export const acceptedCommunityCampaigns: AcceptedCommunityCampaign[] = [];

function statusClass(status: AcceptedCommunityCampaign["status"]) { return `community-accepted-status community-accepted-status-${status.toLowerCase().replaceAll(" ", "-")}`; }

export function getAllAcceptedCommunityCampaigns() {
  return [...getAcceptedCommunityCampaigns(readApplications()), ...acceptedCommunityCampaigns];
}

export default function CommunityOwnerAcceptedCampaigns() {
  const [campaigns, setCampaigns] = useState<AcceptedCommunityCampaign[]>(getAllAcceptedCommunityCampaigns);
  useEffect(() => {
    const refresh = () => setCampaigns(getAllAcceptedCommunityCampaigns()); const hydrate = async () => { if (relayBackendEnabled()) { try { const page = await listRelayApplications(); const current = readApplications(); const next = current.map((application) => { const remote = page.items.find((item) => item.id === getRelayBackendId("application", application.id)); return remote ? { ...application, status: remote.status as MarketplaceApplication["status"], trackingId: remote.placement?.trackingId ?? application.trackingId, placementStatus: remote.placement?.status as MarketplaceApplication["placementStatus"] ?? application.placementStatus } : application; }); if (JSON.stringify(next) !== JSON.stringify(current)) saveApplications(next); } catch { /* Keep local accepted campaigns available when backend reads are unavailable. */ } } await syncServerClickEvents(); refresh(); }; void hydrate();
    window.addEventListener("ownerboard:applications-updated", refresh);
    return () => window.removeEventListener("ownerboard:applications-updated", refresh);
  }, []);
  return <WorkspaceShell active="Accepted Campaigns" workspaceLabel="Community Owner" workspaceMode="community-owner">
    <div className="dashboard-body community-accepted-page"><Link className="hero-link route-back-link" href="/community-owner"><ArrowLeft size={15} /> Back to Community Owner overview</Link><section className="community-accepted-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Campaigns approved by Campaign Owners</span><h1>Accepted Campaigns</h1><p>These applications were approved. You earn from qualified clicks generated after posting the approved advertisement.</p></div><div className="community-accepted-summary"><strong>{campaigns.length}</strong><span>accepted campaigns</span></div></section><div className="community-accepted-note"><CheckCircle2 size={16} /><span>Only campaigns accepted by a Campaign Owner appear here. Payout is based on qualified clicks, not simply on posting.</span></div><section className="community-accepted-grid">{campaigns.map((campaign) => <article className="community-accepted-card" key={campaign.id}><div className="community-accepted-card-top"><div><span className={statusClass(campaign.status)}><span /> {campaign.status}</span><h2>{campaign.name}</h2><p>{campaign.advertiser}</p></div><span className="community-accepted-card-icon"><Link2 size={18} /></span></div><div className="community-accepted-meta"><span><small>Selected community</small><strong><UsersRound size={12} /> {campaign.community}</strong></span><span><small>Platform</small><strong>{campaign.platform}</strong></span><span><small>Duration</small><strong>{campaign.duration}</strong></span><span><small>Payout / qualified click</small><strong>{displayMoney(campaign.payoutPerClick ?? campaign.earnings)}</strong></span><span><small>Total earnings</small><strong>{displayMoney(campaign.totalEarnings ?? "0.00")}</strong></span><span><small>Qualified clicks</small><strong><MousePointer2 size={12} /> {campaign.qualifiedClicks ?? campaign.clicks}</strong></span><span><small>Start · end date</small><strong><CalendarDays size={12} /> {campaign.startDate} – {campaign.endDate}</strong></span></div><div className="community-accepted-card-footer"><span className={campaign.status === "Completed" ? "community-completed-label" : "community-pending-label"}>{campaign.status === "Completed" ? <CheckCircle2 size={14} /> : <Clock3 size={14} />} {campaign.status}</span><Link className="community-campaign-link" href={`/community-owner/accepted-campaigns/${campaign.id}`}>Open campaign workspace <ArrowUpRight size={14} /></Link></div></article>)}</section></div>
  </WorkspaceShell>;
}
