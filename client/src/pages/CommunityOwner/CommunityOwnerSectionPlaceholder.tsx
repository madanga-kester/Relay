import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, MapPin, MousePointer2, Send, UsersRound } from "lucide-react";
import { Link, useRoute } from "wouter";
import { useState } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { displayMoney } from "@/data/marketplaceData";
type CampaignStatus = "Matching" | "Application Pending" | "Accepted" | "Completed";
type Campaign = {
  id: string;
  name: string;
  advertiser: string;
  platform: string;
  audience: string;
  location: string;
  category: string;
  duration: string;
  minimumSize: string;
  earnings: string;
  status: CampaignStatus;
  fit: string;
  clicks?: string;
};

const matchingCampaigns: Campaign[] = [
  { id: "safaricom-fibre", name: "Safaricom Home Fibre", advertiser: "Safaricom", platform: "WhatsApp", audience: "Connected urban households", location: "Nairobi & Kiambu", category: "Telecom & internet", duration: "7 days", minimumSize: "5,000 members", earnings: "KSh 18,000", status: "Matching", fit: "Matches Nairobi Tech Circle" },
  { id: "m-pesa-growth", name: "M-PESA Business Growth", advertiser: "Safaricom M-PESA", platform: "Telegram", audience: "Small business owners", location: "Kenya", category: "Financial services", duration: "14 days", minimumSize: "3,000 members", earnings: "KSh 24,500", status: "Matching", fit: "Matches Kibera Entrepreneurs" },
  { id: "urban-threads", name: "Urban Threads Nairobi", advertiser: "Urban Threads", platform: "Discord", audience: "Style-conscious young adults", location: "Nairobi", category: "Fashion & retail", duration: "5 days", minimumSize: "2,000 members", earnings: "KSh 12,800", status: "Matching", fit: "Matches After Hours Kenya" },
  { id: "jiji-weekend", name: "Jiji Weekend Finds", advertiser: "Jiji Kenya", platform: "WhatsApp", audience: "Local shoppers and deal seekers", location: "Mombasa & Nairobi", category: "E-commerce", duration: "10 days", minimumSize: "8,000 members", earnings: "KSh 21,000", status: "Matching", fit: "Matches your local discovery audience" },
];

const initialApplied: Campaign[] = [
  { id: "kenya-airways", name: "Explore Kenya 2025", advertiser: "Kenya Airways", platform: "WhatsApp", audience: "Domestic travellers", location: "Nairobi", category: "Travel", duration: "10 days", minimumSize: "4,000 members", earnings: "KSh 16,200", status: "Application Pending", fit: "Applied from Nairobi Tech Circle" },
];

const acceptedCampaigns: Campaign[] = [
  { id: "loop-finance", name: "Loop Finance Kenya", advertiser: "Loop Finance", platform: "Telegram", audience: "Young professionals", location: "Kenya", category: "Financial services", duration: "14 days", minimumSize: "3,000 members", earnings: "KSh 12,600 earned", status: "Accepted", fit: "Approved for Design Dispatch", clicks: "1,284 clicks" },
  { id: "urban-sneakers", name: "Urban Sneakers Launch", advertiser: "Urban Sneakers", platform: "Discord", audience: "Sneaker and streetwear fans", location: "Nairobi", category: "Fashion & retail", duration: "7 days", minimumSize: "2,000 members", earnings: "KSh 9,800 earned", status: "Accepted", fit: "Approved for After Hours Kenya", clicks: "842 clicks" },
];

const completedCampaigns: Campaign[] = [
  { id: "orbit-mobile", name: "Orbit Mobile Data", advertiser: "Orbit Mobile", platform: "WhatsApp", audience: "Mobile-first students", location: "Nairobi", category: "Telecom & internet", duration: "5 days", minimumSize: "2,000 members", earnings: "KSh 8,400 paid", status: "Completed", fit: "Nairobi Tech Circle · Completed Jun 14", clicks: "2,146 clicks" },
];

const tabs: Array<{ id: "matching" | "applied" | "accepted" | "completed"; label: string }> = [
  { id: "matching", label: "Matching Campaigns" },
  { id: "applied", label: "Applied" },
  { id: "accepted", label: "Accepted" },
  { id: "completed", label: "Completed" },
];

function CampaignCard({ campaign, onApply }: { campaign: Campaign; onApply?: (campaign: Campaign) => void }) {
  const isMatching = campaign.status === "Matching";
  const isPending = campaign.status === "Application Pending";
  return <article className="community-campaign-card">
    <div className="community-campaign-card-top"><div><span className={`community-campaign-status community-campaign-status-${campaign.status.toLowerCase().replaceAll(" ", "-")}`}><span /> {campaign.status}</span><h2>{campaign.name}</h2><p>{campaign.advertiser}</p></div><span className="community-campaign-fit">{campaign.fit}</span></div>
    <div className="community-campaign-details"><span><small>Platform</small><strong>{campaign.platform}</strong></span><span><small>Category</small><strong>{campaign.category}</strong></span><span><small>Target audience</small><strong>{campaign.audience}</strong></span><span><small>Target location</small><strong><MapPin size={12} /> {campaign.location}</strong></span><span><small>Duration</small><strong>{campaign.duration}</strong></span><span><small>Required audience</small><strong><UsersRound size={12} /> {campaign.minimumSize}</strong></span></div>
    <div className="community-campaign-card-footer"><span><b>{displayMoney(campaign.earnings, 0)}</b><small>earnings offered</small></span>{campaign.clicks && <span><b>{campaign.clicks}</b><small>tracked results</small></span>}{isMatching && onApply ? <button className="accept-button community-apply-button" onClick={() => onApply(campaign)}><Send size={14} /> Apply to Campaign</button> : isPending ? <span className="community-pending-label"><Clock3 size={14} /> Application Pending</span> : campaign.status === "Accepted" ? <Link className="community-campaign-link" href="/community-owner/accepted-campaigns">View campaign <ArrowUpRight size={14} /></Link> : <span className="community-completed-label"><CheckCircle2 size={14} /> Paid</span>}</div>
  </article>;
}

export default function CommunityOwnerSectionPlaceholder() {
  const [, params] = useRoute<{ section: string }>("/community-owner/:section");
  const [activeTab, setActiveTab] = useState<"matching" | "applied" | "accepted" | "completed">(params?.section === "accepted-campaigns" ? "accepted" : "matching");
  const [appliedCampaigns, setAppliedCampaigns] = useState(initialApplied);
  const appliedIds = new Set(appliedCampaigns.map((campaign) => campaign.id));
  const applyToCampaign = (campaign: Campaign) => setAppliedCampaigns((current) => [...current, { ...campaign, status: "Application Pending", fit: `Applied from ${campaign.fit.replace("Matches ", "")}` }]);
  const tabCampaigns = activeTab === "matching" ? matchingCampaigns.filter((campaign) => !appliedIds.has(campaign.id)) : activeTab === "applied" ? appliedCampaigns : activeTab === "accepted" ? acceptedCampaigns : completedCampaigns;
  const counts = { matching: matchingCampaigns.filter((campaign) => !appliedIds.has(campaign.id)).length, applied: appliedCampaigns.length, accepted: acceptedCampaigns.length, completed: completedCampaigns.length };
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label ?? "Campaigns";
  const heading = activeTab === "matching" ? "Find campaigns that fit your communities" : activeTab === "applied" ? "Applications awaiting approval" : activeTab === "accepted" ? "Campaigns approved by Campaign Owners" : "Campaigns you have completed";
  const intro = activeTab === "matching" ? "Review the audience fit, requirements, and earnings before you apply. Campaign Owners review applications before anything is accepted." : activeTab === "applied" ? "Your applications are under review. A campaign moves here immediately after you apply and stays pending until the Campaign Owner responds." : activeTab === "accepted" ? "These campaigns have been approved by a Campaign Owner and are ready for the posting workflow." : "A record of campaigns posted by your communities and the earnings they generated.";
  return <WorkspaceShell active="Campaigns" workspaceLabel="Community Owner" workspaceMode="community-owner">
    <div className="dashboard-body community-campaigns-page"><Link className="hero-link route-back-link" href="/community-owner"><ArrowLeft size={15} /> Back to Community Owner overview</Link><section className="community-campaigns-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Community Owner marketplace</span><h1>Campaigns</h1><p>Apply to opportunities that match the audiences you manage. You never accept a campaign — the Campaign Owner reviews your application.</p></div><div className="community-campaigns-summary"><strong>{counts.matching}</strong><span>matching now</span></div></section>
      <div className="community-campaign-tabs" role="tablist" aria-label="Campaign status"><span className="community-campaign-tab-label">Your applications</span>{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "community-campaign-tab-active" : ""} onClick={() => setActiveTab(tab.id)} role="tab" aria-selected={activeTab === tab.id}>{tab.label}<b>{counts[tab.id]}</b></button>)}</div>
      <section className="community-campaigns-section"><div className="section-heading"><div><span className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> {activeTab === "matching" ? "Matched to your communities" : activeTabLabel}</span><h2>{heading}</h2></div><span className="section-count">{tabCampaigns.length} campaigns</span></div><p className="community-campaigns-intro">{intro}</p>{tabCampaigns.length > 0 ? <div className="community-campaign-grid">{tabCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} onApply={activeTab === "matching" ? applyToCampaign : undefined} />)}</div> : <div className="community-campaign-empty"><span><MousePointer2 size={18} /></span><h3>No campaigns in this view yet</h3><p>When your application or campaign status changes, it will appear here.</p></div>}</section>
    </div>
  </WorkspaceShell>;
}
