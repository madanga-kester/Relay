import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, Clock3, ExternalLink, Eye, MapPin, MousePointer2, ShieldCheck, UsersRound, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ApplicationStatus, CampaignOwnerApplication, ensureTrackingId, formatMoney, getCpcBreakdown, readApplications, registerTrackingPlacement, saveApplications } from "./applicationData";
import { CampaignRecord, readCampaigns } from "./campaignData";
import { recordAdminActivity } from "@/data/marketplaceData";
import { getRelayBackendId, listMyRelayCampaigns, listRelayApplications, listRelayCommunities, relayBackendEnabled, reviewRelayApplication, setRelayBackendId, type RelayCampaign, type RelayCommunity } from "@/lib/relayApi";

function statusClass(status: ApplicationStatus) {
  return `campaign-application-status campaign-application-status-${status.toLowerCase()}`;
}

type BackendApplication = Awaited<ReturnType<typeof listRelayApplications>>["items"][number];

type CommunityDetails = { name: string; platform: string; members: number; category: string; location: string; verificationStatus: string; audienceDescription?: string | null; communityLink?: string | null };

function toApplication(item: BackendApplication, campaign: RelayCampaign | undefined, community: CommunityDetails | undefined): CampaignOwnerApplication {
  const breakdown = getCpcBreakdown(`KSh ${item.cpc}`);
  return { id: item.id, campaignId: item.campaignId, communityId: item.communityId, communityOwnerId: item.communityOwnerId, community: community?.name ?? "Community", campaign: campaign?.name ?? "Campaign", advertiser: campaign?.advertiserName ?? "", platform: (community?.platform ?? "WhatsApp") as CampaignOwnerApplication["platform"], members: community ? community.members.toLocaleString("en-KE") : "—", category: community?.category ?? "—", location: community?.location ?? "—", verification: community?.verificationStatus === "Verified" ? "Verified" : "Pending verification", pastCampaignClicks: "—", cpc: formatMoney(item.cpc, 2), communityOwnerCpc: formatMoney(breakdown.communityOwnerCpc, 2), trackingId: item.placement?.trackingId, status: item.status as ApplicationStatus, placementStatus: item.placement ? ((item.placement.status === "ReadyToPost" ? "Ready to Post" : item.placement.status) as CampaignOwnerApplication["placementStatus"]) : undefined, applied: "Received", applicationDate: "", duration: campaign ? `${campaign.durationDays} days` : "", startDate: campaign?.startDate ?? "", endDate: campaign?.endDate ?? "" };
}

export default function CampaignOwnerApplications() {
  const backend = relayBackendEnabled();
  const [applications, setApplications] = useState<CampaignOwnerApplication[]>(() => backend ? [] : readApplications());
  const [campaignRecords, setCampaignRecords] = useState<RelayCampaign[]>([]);
  const [loaded, setLoaded] = useState(!backend);
  const [details, setDetails] = useState<Record<string, CommunityDetails>>({});
  const [viewing, setViewing] = useState<CampaignOwnerApplication | null>(null);
  const pending = useMemo(() => applications.filter((application) => application.status === "Pending"), [applications]);
  const decided = useMemo(() => applications.filter((application) => application.status !== "Pending"), [applications]);

  const load = useCallback(async () => {
    try {
      const [applicationPage, campaignPage, communityPage] = await Promise.all([listRelayApplications(), listMyRelayCampaigns(), listRelayCommunities()]);
      setCampaignRecords(campaignPage.items);
      const nextDetails: Record<string, CommunityDetails> = {};
      const mapped = applicationPage.items.map((item) => {
        const source = item.community ?? communityPage.items.find((community) => community.id === item.communityId);
        if (source) nextDetails[item.id] = { name: source.name, platform: source.platform, members: source.members, category: source.category, location: source.location, verificationStatus: source.verificationStatus, audienceDescription: source.audienceDescription, communityLink: source.communityLink };
        return toApplication(item, campaignPage.items.find((campaign) => campaign.id === item.campaignId), source);
      });
      setDetails(nextDetails);
      setApplications(mapped);
    } catch {
      toast.error("Could not load applications", { description: "Check that the API is running, then refresh the page." });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (backend) { void load(); return; }
    const refresh = () => setApplications(readApplications());
    window.addEventListener("ownerboard:applications-updated", refresh);
    return () => window.removeEventListener("ownerboard:applications-updated", refresh);
  }, [backend, load]);

  const decideBackend = async (id: string, status: "Accepted" | "Rejected") => {
    const application = applications.find((item) => item.id === id);
    if (!application) return;
    const campaign = campaignRecords.find((item) => item.id === application.campaignId);
    if (status === "Accepted") {
      if (!campaign || (campaign.status !== "Published" && campaign.status !== "Active")) {
        toast.error("Campaign is not accepting new placements", { description: "Only Published or Active campaigns can create a new Ready to Post placement. This application remains pending." });
        return;
      }
      const acceptedCount = applications.filter((item) => item.campaignId === application.campaignId && item.status === "Accepted").length;
      if (campaign.maximumCommunities > 0 && acceptedCount >= campaign.maximumCommunities) {
        toast.error("Community limit reached", { description: `This campaign already has ${campaign.maximumCommunities} accepted communities.` });
        return;
      }
    }
    try {
      const result = await reviewRelayApplication(id, status === "Accepted");
      if (status === "Accepted" && result.placement && campaign) {
        void registerTrackingPlacement(
          { ...application, id: result.placement.id, trackingId: result.placement.trackingId, placementStatus: "Ready to Post" },
          { id: campaign.id, name: campaign.name, destinationUrl: campaign.destinationUrl, status: campaign.status, cpc: formatMoney(campaign.cpc, 2), budget: formatMoney(campaign.budget) } as unknown as CampaignRecord,
        );
      }
      recordAdminActivity("Application reviewed", { type: "Application", id, name: `${application.community} → ${application.campaign}` }, `Application ${status === "Accepted" ? "accepted" : "rejected"} by Campaign Owner.`, "Campaign Owner");
      await load();
      if (status === "Accepted") toast.success(`${application.community} is now ready to post`, { description: "The Community Owner can now see this campaign under Accepted Campaigns." });
      else toast(`Application from ${application.community} rejected`, { description: "It has been removed from the pending review queue." });
    } catch (error) {
      toast.error("Could not update application", { description: error instanceof Error ? error.message : "The server rejected this decision. The application remains pending." });
    }
  };

  const decideLocal = async (id: string, status: "Accepted" | "Rejected") => {
    const selectedApplication = applications.find((item) => item.id === id);
    if (status === "Accepted" && selectedApplication) {
      const campaign = readCampaigns().find((item) => item.id === selectedApplication.campaignId);
      if (!campaign || (campaign.status !== "Published" && campaign.status !== "Active")) {
        toast.error("Campaign is not accepting new placements", { description: "Only Published or Active campaigns can create a new Ready to Post placement. This application remains pending." });
        return;
      }
      const limit = Number(campaign?.maxCommunities.replace(/[^0-9.]/g, "")) || 0;
      const acceptedCount = applications.filter((item) => item.campaignId === selectedApplication.campaignId && item.status === "Accepted").length;
      if (limit > 0 && acceptedCount >= limit) {
        toast.error("Community limit reached", { description: `This campaign already has ${limit} accepted communities. Increase the campaign limit or remove an existing placement first.` });
        return;
      }
    }
    const backendApplicationId = selectedApplication ? getRelayBackendId("application", selectedApplication.id) : undefined;
    let backendPlacementId: string | undefined;
    let backendTrackingId: string | undefined;
    if (relayBackendEnabled() && backendApplicationId) {
      try {
        const result = await reviewRelayApplication(backendApplicationId, status === "Accepted");
        backendPlacementId = result.placement?.id;
        backendTrackingId = result.placement?.trackingId;
      } catch (error) {
        toast.error("Could not update application", { description: error instanceof Error ? error.message : "The server rejected this decision. The application remains pending." });
        return;
      }
    }
    const next = applications.map((application) => application.id === id ? { ...application, status, trackingId: status === "Accepted" ? (backendTrackingId ?? ensureTrackingId(application)) : application.trackingId } : application);
    setApplications(next);
    saveApplications(next);
    const decidedApplication = next.find((item) => item.id === id);
    if (decidedApplication) { recordAdminActivity("Application reviewed", { type: "Application", id: decidedApplication.id, name: `${decidedApplication.community} → ${decidedApplication.campaign}` }, `Application ${status === "Accepted" ? "accepted" : "rejected"} by Campaign Owner.`, "Campaign Owner"); if (backendPlacementId) setRelayBackendId("placement", decidedApplication.id, backendPlacementId); }
    if (status === "Accepted") { const campaign = readCampaigns().find((item) => item.id === decidedApplication?.campaignId); if (decidedApplication && campaign) void registerTrackingPlacement(decidedApplication, campaign); toast.success(`${decidedApplication?.community} is now ready to post`, { description: "The Community Owner can now see this campaign under Accepted Campaigns." }); }
    else toast(`Application from ${decidedApplication?.community} rejected`, { description: "It has been removed from the pending review queue." });
  };

  const decide = backend ? decideBackend : decideLocal;

  return <WorkspaceShell active="Applications" workspaceLabel="Campaign Owner" workspaceMode="campaign-owner">
    <div className="dashboard-body campaign-applications-page">
      <Link className="hero-link route-back-link" href="/campaign-owner"><ArrowLeft size={15} /> Back to Campaign Owner overview</Link>
      <section className="campaign-applications-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Community Owner applications</span><h1>Review your applicants</h1><p>Choose the communities that should carry your campaigns. Accepting an application creates a Ready to Post placement for the Community Owner.</p></div><div className="campaign-applications-summary"><strong>{pending.length}</strong><span>pending review</span></div></section>
      <div className="campaign-applications-note"><ShieldCheck size={16} /><span><strong>You make the decision.</strong> Community Owners only apply. Accept or reject each application from this workspace.</span></div>
      <section className="campaign-applications-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Review queue</div><h2>Pending applications</h2></div><span className="section-count">{pending.length} awaiting your decision</span></div>{!loaded ? null : pending.length === 0 ? <div className="campaign-applications-empty"><CheckCircle2 size={21} /><strong>All caught up</strong><p>There are no pending community applications to review.</p></div> : <div className="campaign-application-list">{pending.map((application) => <ApplicationCard application={application} key={application.id} onDecide={decide} onView={setViewing} />)}</div>}</section>
      {decided.length > 0 && <section className="campaign-applications-section campaign-applications-decided"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line" /> Decision history</div><h2>Recently reviewed</h2></div><span className="section-count">{decided.length} decided</span></div><div className="campaign-application-list">{decided.map((application) => <ApplicationCard application={application} key={application.id} onDecide={decide} onView={setViewing} />)}</div></section>}
      <CommunityDialog application={viewing} details={viewing ? details[viewing.id] : undefined} onClose={() => setViewing(null)} onDecide={(id, status) => { setViewing(null); void decide(id, status); }} />
    </div>
  </WorkspaceShell>;
}

function ApplicationCard({ application, onDecide, onView }: { application: CampaignOwnerApplication; onDecide: (id: string, status: "Accepted" | "Rejected") => void; onView: (application: CampaignOwnerApplication) => void }) {
  const isPending = application.status === "Pending";
  return <article className={`campaign-application-card ${!isPending ? "campaign-application-card-decided" : ""}`}>
    <div className="campaign-application-card-header"><div className="campaign-application-campaign"><span className="campaign-application-campaign-mark">{application.campaign.charAt(0)}</span><span><small>Campaign</small><strong>{application.campaign}</strong></span></div><span className={statusClass(application.status)}><span /> {application.status}</span></div>
    <div className="campaign-application-community"><div className="campaign-application-avatar">{application.community.charAt(0)}</div><div><span className="section-kicker"><span className="section-kicker-line" /> Community</span><h3>{application.community}</h3><p>{application.applied} · {application.platform} application</p></div></div>
    <div className="campaign-application-details"><span><small>Platform</small><strong>{application.platform}</strong></span><span><small>Members</small><strong><UsersRound size={13} /> {application.members}</strong></span><span><small>Category</small><strong>{application.category}</strong></span><span><small>Location</small><strong><MapPin size={13} /> {application.location}</strong></span><span><small>Verification</small><strong className="campaign-application-verified"><ShieldCheck size={13} /> {application.verification}</strong></span><span><small>Past campaign clicks</small><strong><MousePointer2 size={13} /> {application.pastCampaignClicks}</strong></span><span><small>Advertiser CPC</small><strong className="campaign-application-payment">{application.cpc}</strong></span></div>
    <div className="campaign-application-footer"><button className="campaign-application-view" onClick={() => onView(application)}><Eye size={14} /> View community</button>{isPending ? <div className="campaign-application-actions"><button className="campaign-application-reject" onClick={() => onDecide(application.id, "Rejected")}><X size={14} /> Reject</button><button className="campaign-application-accept" onClick={() => onDecide(application.id, "Accepted")}><Check size={14} /> Accept</button></div> : <span className="campaign-application-decision"><Clock3 size={13} /> {application.status === "Accepted" ? "Ready to Post placement created" : "Removed from pending"}</span>}</div>
  </article>;
}

function CommunityDialog({ application, details, onClose, onDecide }: { application: CampaignOwnerApplication | null; details: CommunityDetails | undefined; onClose: () => void; onDecide: (id: string, status: "Accepted" | "Rejected") => void }) {
  const link = details?.communityLink && /^https?:\/\//i.test(details.communityLink) ? details.communityLink : undefined;
  const verified = application?.verification === "Verified";
  return <Dialog open={Boolean(application)} onOpenChange={(open) => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto p-0 sm:max-w-3xl" style={{ background: "#ffffff", color: "var(--ink)" }}>
      {application && <>
        <DialogHeader className="flex-row items-center gap-4 border-b px-8 py-7 text-left" style={{ borderColor: "var(--border)" }}>
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-xl font-bold text-white" style={{ background: "var(--ink)" }}>{application.community.charAt(0)}</span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-2xl font-medium tracking-tight" style={{ fontFamily: "Fraunces, Georgia, serif" }}>{application.community}</DialogTitle>
            <DialogDescription className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{application.platform} community · applied to {application.campaign}</DialogDescription>
          </div>
          <span className="mr-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: verified ? "#e3f1e6" : "var(--coral-soft)", color: verified ? "#1f6b3a" : "var(--coral-dark)" }}><ShieldCheck size={13} /> {application.verification}</span>
        </DialogHeader>
        <div className="grid gap-7 px-8 py-7">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["Platform", application.platform], ["Members", application.members], ["Category", application.category], ["Location", application.location]].map(([label, value]) => <div className="rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)", background: "var(--surface-soft)" }} key={label}><small className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</small><strong className="mt-1 block text-base">{value}</strong></div>)}
          </div>
          <section>
            <h3 className="mb-2 text-sm font-bold">About this audience</h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{details?.audienceDescription || "The Community Owner has not added an audience description."}</p>
            {link && <a className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: "var(--coral-dark)" }} href={link} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open community link</a>}
          </section>
          <section>
            <h3 className="mb-2 text-sm font-bold">This application</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[["Campaign", application.campaign], ["Advertiser CPC", application.cpc], ["Community earns", `${application.communityOwnerCpc} / click`], ["Past campaign clicks", application.pastCampaignClicks]].map(([label, value]) => <div className="rounded-xl border px-4 py-3" style={{ borderColor: "var(--border)" }} key={label}><small className="block text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--muted)" }}>{label}</small><strong className="mt-1 block text-sm">{value}</strong></div>)}
            </div>
          </section>
        </div>
        <div className="flex items-center justify-between gap-4 border-t px-8 py-5" style={{ borderColor: "var(--border)" }}>
          <span className="inline-flex items-center gap-2 text-sm" style={{ color: "var(--muted)" }}><Clock3 size={14} /> Status: {application.status}</span>
          {application.status === "Pending" ? <div className="campaign-application-actions"><button className="campaign-application-reject" onClick={() => onDecide(application.id, "Rejected")}><X size={14} /> Reject</button><button className="campaign-application-accept" onClick={() => onDecide(application.id, "Accepted")}><Check size={14} /> Accept</button></div> : <button className="campaign-application-view" onClick={onClose}>Close</button>}
        </div>
      </>}
    </DialogContent>
  </Dialog>;
}