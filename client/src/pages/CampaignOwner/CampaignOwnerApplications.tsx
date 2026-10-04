import { ArrowLeft, ArrowUpRight, Check, CheckCircle2, Clock3, Eye, MapPin, MousePointer2, ShieldCheck, UsersRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import WorkspaceShell from "@/components/WorkspaceShell";
import { ApplicationStatus, CampaignOwnerApplication, ensureTrackingId, readApplications, registerTrackingPlacement, saveApplications } from "./applicationData";
import { readCampaigns } from "./campaignData";
import { recordAdminActivity } from "@/data/marketplaceData";
import { getRelayBackendId, relayBackendEnabled, reviewRelayApplication, setRelayBackendId } from "@/lib/relayApi";

function statusClass(status: ApplicationStatus) {
  return `campaign-application-status campaign-application-status-${status.toLowerCase()}`;
}

export default function CampaignOwnerApplications() {
  const [applications, setApplications] = useState<CampaignOwnerApplication[]>(readApplications);
  const pending = useMemo(() => applications.filter((application) => application.status === "Pending"), [applications]);
  const decided = useMemo(() => applications.filter((application) => application.status !== "Pending"), [applications]);

  useEffect(() => {
    const refresh = () => setApplications(readApplications());
    window.addEventListener("ownerboard:applications-updated", refresh);
    return () => window.removeEventListener("ownerboard:applications-updated", refresh);
  }, []);

  const decide = async (id: string, status: "Accepted" | "Rejected") => {
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

  return <WorkspaceShell active="Applications" workspaceLabel="Campaign Owner" workspaceMode="campaign-owner">
    <div className="dashboard-body campaign-applications-page">
      <Link className="hero-link route-back-link" href="/campaign-owner"><ArrowLeft size={15} /> Back to Campaign Owner overview</Link>
      <section className="campaign-applications-heading"><div><span className="section-kicker"><span className="section-kicker-line" /> Community Owner applications</span><h1>Review your applicants</h1><p>Choose the communities that should carry your campaigns. Accepting an application creates a Ready to Post placement for the Community Owner.</p></div><div className="campaign-applications-summary"><strong>{pending.length}</strong><span>pending review</span></div></section>
      <div className="campaign-applications-note"><ShieldCheck size={16} /><span><strong>You make the decision.</strong> Community Owners only apply. Accept or reject each application from this workspace.</span></div>
      <section className="campaign-applications-section"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line section-kicker-line-lilac" /> Review queue</div><h2>Pending applications</h2></div><span className="section-count">{pending.length} awaiting your decision</span></div>{pending.length === 0 ? <div className="campaign-applications-empty"><CheckCircle2 size={21} /><strong>All caught up</strong><p>There are no pending community applications to review.</p></div> : <div className="campaign-application-list">{pending.map((application) => <ApplicationCard application={application} key={application.id} onDecide={decide} />)}</div>}</section>
      {decided.length > 0 && <section className="campaign-applications-section campaign-applications-decided"><div className="section-heading"><div><div className="section-kicker"><span className="section-kicker-line" /> Decision history</div><h2>Recently reviewed</h2></div><span className="section-count">{decided.length} decided</span></div><div className="campaign-application-list">{decided.map((application) => <ApplicationCard application={application} key={application.id} onDecide={decide} />)}</div></section>}
    </div>
  </WorkspaceShell>;
}

function ApplicationCard({ application, onDecide }: { application: CampaignOwnerApplication; onDecide: (id: string, status: "Accepted" | "Rejected") => void }) {
  const isPending = application.status === "Pending";
  return <article className={`campaign-application-card ${!isPending ? "campaign-application-card-decided" : ""}`}>
    <div className="campaign-application-card-header"><div className="campaign-application-campaign"><span className="campaign-application-campaign-mark">{application.campaign.charAt(0)}</span><span><small>Campaign</small><strong>{application.campaign}</strong></span></div><span className={statusClass(application.status)}><span /> {application.status}</span></div>
    <div className="campaign-application-community"><div className="campaign-application-avatar">{application.community.charAt(0)}</div><div><span className="section-kicker"><span className="section-kicker-line" /> Community</span><h3>{application.community}</h3><p>{application.applied} · {application.platform} application</p></div></div>
    <div className="campaign-application-details"><span><small>Platform</small><strong>{application.platform}</strong></span><span><small>Members</small><strong><UsersRound size={13} /> {application.members}</strong></span><span><small>Category</small><strong>{application.category}</strong></span><span><small>Location</small><strong><MapPin size={13} /> {application.location}</strong></span><span><small>Verification</small><strong className="campaign-application-verified"><ShieldCheck size={13} /> {application.verification}</strong></span><span><small>Past campaign clicks</small><strong><MousePointer2 size={13} /> {application.pastCampaignClicks}</strong></span><span><small>Advertiser CPC</small><strong className="campaign-application-payment">{application.cpc}</strong></span></div>
    <div className="campaign-application-footer"><button className="campaign-application-view" onClick={() => toast(`Community profile: ${application.community}`, { description: `${application.members} members · ${application.category} · ${application.location}` })}><Eye size={14} /> View community</button>{isPending ? <div className="campaign-application-actions"><button className="campaign-application-reject" onClick={() => onDecide(application.id, "Rejected")}><X size={14} /> Reject</button><button className="campaign-application-accept" onClick={() => onDecide(application.id, "Accepted")}><Check size={14} /> Accept</button></div> : <span className="campaign-application-decision"><Clock3 size={13} /> {application.status === "Accepted" ? "Ready to Post placement created" : "Removed from pending"}</span>}</div>
  </article>;
}
