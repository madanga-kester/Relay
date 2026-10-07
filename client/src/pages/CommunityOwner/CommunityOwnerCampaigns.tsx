import { ArrowLeft, ArrowUpRight, CheckCircle2, Clock3, MapPin, MousePointer2, Send, UsersRound, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import WorkspaceShell from "@/components/WorkspaceShell";
import { applyToCampaign, campaigns as defaultCampaigns, readApplications, readCampaigns, readCommunities, saveApplications, CampaignRecord, MarketplaceApplication, MarketplaceCommunity } from "@/data/marketplaceData";
import { createRelayApplication, listMyRelayCommunities, listRelayApplications, listRelayCampaigns, relayBackendEnabled, setRelayBackendId } from "@/lib/relayApi";
import { fetchAllRelayPages, mapRelayCampaign, mapRelayCommunity, mergeRelayApplications } from "@/lib/relayMappers";
import { displayMoney } from "@/data/marketplaceData";
type Tab = "matching" | "applied" | "accepted" | "rejected";
const tabs: Array<{ id: Tab; label: string }> = [{ id: "matching", label: "Matching Campaigns" }, { id: "applied", label: "Applied" }, { id: "accepted", label: "Accepted" }, { id: "rejected", label: "Rejected" }];

export default function CommunityOwnerCampaigns() {
  const [communityList, setCommunityList] = useState<MarketplaceCommunity[]>(() => relayBackendEnabled() ? [] : readCommunities());
  const [selectedCommunityId, setSelectedCommunityId] = useState(() => relayBackendEnabled() ? "" : readCommunities()[0].id);
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() => relayBackendEnabled() ? [] : defaultCampaigns);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">(() => relayBackendEnabled() ? "loading" : "idle");
  const [reloadKey, setReloadKey] = useState(0);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applications, setApplications] = useState<MarketplaceApplication[]>(readApplications);
  const [activeTab, setActiveTab] = useState<Tab>("matching");
  const selectedCommunity = communityList.find((community) => community.id === selectedCommunityId) ?? communityList[0];
  useEffect(() => {
    const backend = relayBackendEnabled();
    const refresh = () => { if (!backend) { setCampaigns(readCampaigns()); setCommunityList(readCommunities()); } setApplications(readApplications()); };
    refresh();
    let cancelled = false;
    if (backend) {
      setLoadState("loading");
      Promise.all([fetchAllRelayPages(listMyRelayCommunities), fetchAllRelayPages(listRelayCampaigns), fetchAllRelayPages(listRelayApplications)]).then(([remoteCommunities, remoteCampaigns, remoteApplications]) => {
        if (cancelled) return;
        const mappedCommunities = remoteCommunities.map(mapRelayCommunity);
        const mappedCampaigns = remoteCampaigns.map(mapRelayCampaign);
        const current = readApplications();
        const merged = mergeRelayApplications(current, remoteApplications, mappedCampaigns, mappedCommunities);
        setCommunityList(mappedCommunities);
        setSelectedCommunityId((selected) => mappedCommunities.some((community) => community.id === selected) ? selected : mappedCommunities[0]?.id ?? "");
        setCampaigns(mappedCampaigns);
        if (JSON.stringify(merged) !== JSON.stringify(current)) saveApplications(merged);
        setApplications(merged);
        setLoadState("ready");
      }).catch((error) => {
        if (cancelled) return;
        setLoadState("error");
        toast.error("Could not load campaigns", { description: error instanceof Error ? error.message : "The server did not respond. Try again." });
      });
    }
    window.addEventListener("ownerboard:applications-updated", refresh);
    window.addEventListener("ownerboard:communities-updated", refresh);
    return () => { cancelled = true; window.removeEventListener("ownerboard:applications-updated", refresh); window.removeEventListener("ownerboard:communities-updated", refresh); };
  }, [reloadKey]);
  const submitted = useMemo(() => applications.filter((application) => application.communityOwnerId === selectedCommunity?.ownerId), [applications, selectedCommunity?.ownerId]);
  if (!selectedCommunity) return <WorkspaceShell active="Campaigns" workspaceLabel="Community Owner" workspaceMode="community-owner"><div className="dashboard-body community-campaigns-page"><div className="community-campaign-empty"><span><MousePointer2 size={18} /></span><h3>{loadState === "loading" ? "Loading your campaigns" : loadState === "error" ? "Campaigns could not be loaded" : "Add a community to see campaigns"}</h3><p>{loadState === "loading" ? "Fetching your communities and open campaigns." : loadState === "error" ? "The server did not respond. Check your connection and try again." : "Campaigns are matched to the communities you manage."}</p>{loadState === "error" ? <button className="accept-button" onClick={() => setReloadKey((key) => key + 1)}>Try again</button> : loadState !== "loading" && <Link className="accept-button" href="/communities/add">Add community</Link>}</div></div></WorkspaceShell>;
  const matching = campaigns.filter((campaign) => { const acceptedCount = applications.filter((application) => application.campaignId === campaign.id && application.status === "Accepted").length; const remaining = Math.max(Number(campaign.maxCommunities.replace(/[^0-9.]/g, "")) - acceptedCount, 0); return (campaign.status === "Published" || campaign.status === "Active") && campaign.platforms.includes(selectedCommunity.platform) && remaining > 0 && !submitted.some((application) => application.campaignId === campaign.id && application.communityId === selectedCommunity.id); });
  const shown = activeTab === "matching" ? matching : submitted.filter((application) => activeTab === "applied" ? application.status === "Pending" : application.status.toLowerCase() === activeTab);
  const apply = async (campaignId: string) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    if (!campaign || applyingId) return;
    if (relayBackendEnabled()) {
      setApplyingId(campaignId);
      try {
        const created = await createRelayApplication(campaign.id, selectedCommunity.id);
        const next = applyToCampaign(campaign, selectedCommunity);
        const localApplication = next.find((item) => item.campaignId === campaign.id && item.communityId === selectedCommunity.id);
        if (localApplication) setRelayBackendId("application", localApplication.id, created.id);
        setApplications(next);
        setActiveTab("applied");
        toast.success("Application pending", { description: `${selectedCommunity.name} has applied to ${campaign.name}.` });
      } catch (error) {
        toast.error("Application not submitted", { description: error instanceof Error ? error.message : "The server rejected this application." });
      } finally {
        setApplyingId(null);
      }
      return;
    }
    const next = applyToCampaign(campaign, selectedCommunity);
    setApplications(next);
    setActiveTab("applied");
    toast.success("Application pending", { description: `${selectedCommunity.name} has applied to ${campaign.name}.` });
  };
  const counts = { matching: matching.length, applied: submitted.filter((item) => item.status === "Pending").length, accepted: submitted.filter((item) => item.status === "Accepted").length, rejected: submitted.filter((item) => item.status === "Rejected").length };
  return <WorkspaceShell active="Campaigns" workspaceLabel="Community Owner" workspaceMode="community-owner"><div className="dashboard-body community-campaigns-page">
  <section className="community-campaigns-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Community Owner marketplace</span><h1>Campaigns</h1><p>Apply to opportunities that match the audiences you manage. You never accept a campaign — the Campaign Owner reviews your application.</p></div><div className="community-campaigns-summary"><strong>{matching.length}</strong><span>matching now</span></div></section><section className="community-marketplace-selector"><div><span className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Apply as</span><strong>{selectedCommunity.name}</strong><small>{selectedCommunity.platform} · {selectedCommunity.members} members · {selectedCommunity.location}</small></div><select value={selectedCommunityId} onChange={(event) => { setSelectedCommunityId(event.target.value); setActiveTab("matching"); }}>{communityList.map((community) => <option value={community.id} key={community.id}>{community.name}</option>)}</select></section><div className="community-campaign-tabs" role="tablist" aria-label="Campaign status"><span className="community-campaign-tab-label">Your applications</span>{tabs.map((tab) => <button key={tab.id} className={activeTab === tab.id ? "community-campaign-tab-active" : ""} onClick={() => setActiveTab(tab.id)} role="tab" aria-selected={activeTab === tab.id}>{tab.label}<b>{counts[tab.id]}</b></button>)}</div><section className="community-campaigns-section"><div className="section-heading"><div><span className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> {activeTab === "matching" ? "Matched to your community" : tabs.find((tab) => tab.id === activeTab)?.label}</span><h2>{activeTab === "matching" ? "Find campaigns that fit your community" : activeTab === "applied" ? "Applications awaiting approval" : activeTab === "accepted" ? "Campaigns approved by Campaign Owners" : "Applications not selected"}</h2></div><span className="section-count">{shown.length} campaigns</span></div><p className="community-campaigns-intro">{activeTab === "matching" ? "Review the audience fit, requirements, and earnings before you apply." : activeTab === "applied" ? "Your applications stay here until the Campaign Owner responds." : activeTab === "accepted" ? "Accepted applications move into your Accepted Campaigns workspace." : "Rejected applications remain visible here for reference and do not create placements."}</p>{shown.length > 0 ? <div className="community-campaign-grid">{shown.map((item) => activeTab === "matching" ? <CampaignCard key={item.id} campaign={item as typeof campaigns[number]} remaining={Math.max(Number((item as typeof campaigns[number]).maxCommunities.replace(/[^0-9.]/g, "")) - applications.filter((application) => application.campaignId === item.id && application.status === "Accepted").length, 0)} onApply={() => apply(item.id)} /> : <ApplicationCard key={item.id} application={item as MarketplaceApplication} />)}</div> : <div className="community-campaign-empty"><span><MousePointer2 size={18} /></span><h3>No campaigns in this view yet</h3><p>When your application or campaign status changes, it will appear here.</p></div>}</section></div></WorkspaceShell>;
}

function CampaignCard({ campaign, remaining, onApply }: { campaign: typeof defaultCampaigns[number]; remaining: number; onApply: () => void }) { return <article className="community-campaign-card"><div className="community-campaign-card-top"><div><span className="community-campaign-status community-campaign-status-matching"><span /> Matching</span><h2>{campaign.name}</h2><p>{campaign.advertiser}</p></div><span className="community-campaign-fit">Matches selected community</span></div><div className="community-campaign-details"><span><small>Platform</small><strong>{campaign.platforms.join(" / ")}</strong></span><span><small>Category</small><strong>{campaign.category}</strong></span><span><small>Target location</small><strong><MapPin size={12} /> {campaign.location}</strong></span><span><small>Duration</small><strong>{campaign.duration}</strong></span><span><small>Community owner earnings</small><strong>{(Number(campaign.cpc.replace(/[^0-9.]/g, "")) * 0.75).toFixed(2)} / qualified click</strong></span><span><small>Community availability</small><strong><UsersRound size={12} /> {remaining} spots remaining</strong></span></div><div className="community-campaign-card-footer"><span><b>{(Number(campaign.cpc.replace(/[^0-9.]/g, "")) * 0.75).toFixed(2)} / click</b><small>qualified click earnings</small></span><span><b>{displayMoney(campaign.budget)}</b><small>campaign budget</small></span><button className="accept-button community-apply-button" onClick={onApply}><Send size={14} /> Apply to Campaign</button></div></article>; }
function ApplicationCard({ application }: { application: MarketplaceApplication }) { const accepted = application.status === "Accepted"; const rejected = application.status === "Rejected"; return <article className="community-campaign-card"><div className="community-campaign-card-top"><div><span className={`community-campaign-status community-campaign-status-${application.status.toLowerCase()}`}><span /> {application.status}</span><h2>{application.campaign}</h2><p>{application.community} · {application.platform}</p></div><span className="community-campaign-fit">{accepted ? "Approved by Campaign Owner" : rejected ? "Not selected" : "Awaiting review"}</span></div><div className="community-campaign-details"><span><small>Members</small><strong><UsersRound size={12} /> {application.members}</strong></span><span><small>Category</small><strong>{application.category}</strong></span><span><small>Location</small><strong><MapPin size={12} /> {application.location}</strong></span><span><small>Community owner earnings</small><strong>{displayMoney(application.communityOwnerCpc)} / click</strong></span></div><div className="community-campaign-card-footer">{accepted ? <Link className="community-campaign-link" href="/community-owner/accepted-campaigns">View Accepted Campaigns <ArrowUpRight size={14} /></Link> : rejected ? <span className="community-completed-label"><XCircle size={14} /> Rejected</span> : <span className="community-pending-label"><Clock3 size={14} /> Application Pending</span>}</div></article>; }
