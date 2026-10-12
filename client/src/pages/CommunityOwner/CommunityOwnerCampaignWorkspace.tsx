import { useState } from "react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Link2,
  MousePointer2,
  Send,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useAcceptedCampaigns } from "./useAcceptedCampaigns";
import {
  readApplications,
  readCampaigns,
  recordAdminActivity,
  recordCampaignActivity,
  registerTrackingPlacement,
  saveApplications,
  saveCampaigns,
} from "@/data/marketplaceData";
import {
  activateRelayPlacement,
  getRelayBackendId,
  relayBackendEnabled,
} from "@/lib/relayApi";

const communityDetailsStyles = `
.community-workspace-details {
  display: grid;
  align-content: start;
  gap: 16px;
}

.community-workspace-details .community-workspace-side-card {
  padding: 22px;
  border: 1px solid #e8e7f0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(35, 28, 73, 0.055);
}

.community-details-card-heading {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.community-details-card-heading h2 {
  margin: 4px 0 0;
  color: #211d35;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.community-details-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  place-items: center;
  border-radius: 12px;
}

.community-details-icon-purple { color: #6848d8; background: #f0ecff; }
.community-details-icon-green { color: #18845c; background: #e9f8f0; }
.community-details-icon-blue { color: #3973c6; background: #eaf2ff; }

/* Redesigned Total Earnings */
.community-details-earnings {
  position: relative;
  overflow: hidden;
  display: grid;
  gap: 6px;
  padding: 20px 20px 18px;
  border: 1px solid #ddd6fe;
  border-radius: 16px;
  background: linear-gradient(145deg, #f5f3ff 0%, #ede9fe 55%, #e0e7ff 100%);
}

.community-details-earnings::before {
  content: "";
  position: absolute;
  top: -30px;
  right: -20px;
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(104, 72, 216, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.community-details-earnings > span {
  color: #6b6480;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.community-details-earnings strong {
  color: #1e1635;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.045em;
}

.community-details-earnings small {
  color: #7c758f;
  font-size: 12px;
}

.community-details-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.community-details-metric {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 12px;
  border: 1px solid #efedf4;
  border-radius: 14px;
  background: #fafafc;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.community-details-metric:hover {
  border-color: #e0dcf0;
  box-shadow: 0 2px 8px rgba(35, 28, 73, 0.04);
}

.community-details-metric > span:last-child {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.community-details-metric strong {
  overflow-wrap: anywhere;
  color: #28243a;
  font-size: 15px;
  font-weight: 700;
}

.community-details-metric small {
  color: #77738a;
  font-size: 12px;
}

.community-details-metric-icon {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border-radius: 10px;
  color: #6848d8;
  background: #f0ecff;
}

.community-details-date-range {
  display: grid;
  grid-template-columns: 1fr 20px 1fr;
  align-items: center;
  gap: 8px;
  padding: 15px;
  border-radius: 13px;
  background: #f8f8fb;
  border: 1px solid #efedf5;
}

.community-details-date-range > div {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.community-details-date-range strong {
  overflow-wrap: anywhere;
  color: #29253b;
  font-size: 13px;
}

.community-details-date-range > span {
  height: 1px;
  background: #c9c5d5;
}

.community-details-date-range small,
.community-details-status-row {
  color: #6e6a7c;
  font-size: 12px;
}

.community-details-status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 15px;
}

.community-details-status-row .community-accepted-status {
  flex: 0 0 auto;
}

/* Redesigned Campaign Details */
.community-details-list {
  display: grid;
  gap: 0;
  margin: 0 0 18px;
  border: 1px solid #efedf4;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
}

.community-details-list > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 13px 16px;
  border-bottom: 1px solid #f3f2f7;
  transition: background 0.12s ease;
}

.community-details-list > div:last-child {
  border-bottom: none;
}

.community-details-list > div:hover {
  background: #fafafc;
}

.community-details-list dt {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #77738a;
  font-size: 13px;
  font-weight: 500;
}

.community-details-list dt::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #c4b5fd;
  flex-shrink: 0;
}

.community-details-list dd {
  margin: 0;
  color: #29253b;
  font-size: 13px;
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
  max-width: 62%;
}

.community-details-context {
  background: linear-gradient(180deg, #fff 0%, #fdfcff 100%);
}

.community-details-context .community-campaign-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  padding: 12px 13px;
  border: 1px solid #e8e1ff;
  border-radius: 11px;
  color: #5d42c5;
  background: #f8f6ff;
  font-size: 12px;
  font-weight: 650;
  text-decoration: none;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.community-details-context .community-campaign-link:hover {
  background: #f0ecff;
  border-color: #ddd6fe;
}

@media (max-width: 640px) {
  .community-workspace-details .community-workspace-side-card {
    padding: 18px;
  }
  .community-details-metrics {
    grid-template-columns: 1fr;
  }
  .community-details-earnings strong {
    font-size: 26px;
  }
}
`;

export default function CommunityOwnerCampaignWorkspace() {
  const [, params] = useRoute<{ id: string }>("/community-owner/accepted-campaigns/:id");
  const { campaigns, loaded, reload } = useAcceptedCampaigns();
  const [copied, setCopied] = useState(false);

  const campaign = campaigns.find((item) => item.id === params?.id) ?? campaigns[0];

  if (!campaign) {
    return (
      <WorkspaceShell
        active="Accepted Campaigns"
        workspaceLabel="Community Owner"
        workspaceMode="community-owner"
      >
        <div className="dashboard-body community-workspace-page">
          <Link className="hero-link route-back-link" href="/community-owner/accepted-campaigns">
            <ArrowLeft size={15} /> Back to Accepted Campaigns
          </Link>
          <h1>{loaded ? "No accepted campaign found" : "Loading campaign"}</h1>
        </div>
      </WorkspaceShell>
    );
  }

  const confirmBackendPosted = async () => {
    if (!campaign.placementId || campaign.status !== "Ready to Post") return;
    try {
      await activateRelayPlacement(campaign.placementId);
    } catch (error) {
      toast.error("Could not activate placement", {
        description:
          error instanceof Error
            ? error.message
            : "The server rejected this activation. Try again.",
      });
      return;
    }
    toast.success("Advertisement marked as posted", {
      description: "This placement is now Active.",
    });
    await reload();
  };

  const confirmPosted = async () => {
    if (campaign.placementId) {
      await confirmBackendPosted();
      return;
    }

    const applicationId = campaign.id.startsWith("application-")
      ? campaign.id.slice("application-".length)
      : "";
    if (!applicationId) return;

    const currentApplications = readApplications();
    const currentApplication = currentApplications.find(
      (application) => application.id === applicationId
    );
    if (!currentApplication || currentApplication.placementStatus === "Active") return;

    const backendPlacementId = getRelayBackendId("placement", applicationId);
    if (relayBackendEnabled() && backendPlacementId) {
      try {
        await activateRelayPlacement(backendPlacementId);
      } catch (error) {
        toast.error("Could not activate placement", {
          description:
            error instanceof Error
              ? error.message
              : "The server rejected this activation. Try again.",
        });
        return;
      }
    }

    const next = currentApplications.map((application) =>
      application.id === applicationId
        ? { ...application, placementStatus: "Active" as const }
        : application
    );
    saveApplications(next);

    const application = next.find((item) => item.id === applicationId);
    if (application) {
      recordAdminActivity(
        "Placement status changed",
        {
          type: "Placement",
          id: application.id,
          name: `${application.community} → ${application.campaign}`,
        },
        "Placement changed from Ready to Post to Active after the advertisement was posted.",
        "Community Owner"
      );
    }

    const campaignRecord = application
      ? readCampaigns().find((item) => item.id === application.campaignId)
      : undefined;

    let updatedCampaign = campaignRecord;
    if (campaignRecord?.status === "Published") {
      updatedCampaign = { ...campaignRecord, status: "Active" as const };
      saveCampaigns(
        readCampaigns().map((item) =>
          item.id === updatedCampaign?.id ? updatedCampaign : item
        )
      );
      recordCampaignActivity(campaignRecord, "Campaign Activated");
    }

    if (application && updatedCampaign) {
      void registerTrackingPlacement(application, updatedCampaign);
    }

    toast.success("Advertisement marked as posted", {
      description: "This placement is now Active.",
    });
  };

  const copyTrackingLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${campaign.trackingLink}`);
    } catch {
      /* Clipboard unavailable in preview. */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <WorkspaceShell
      active="Accepted Campaigns"
      workspaceLabel="Community Owner"
      workspaceMode="community-owner"
    >
      <div className="dashboard-body community-workspace-page">
        <Link className="hero-link route-back-link" href="/community-owner/accepted-campaigns">
          <ArrowLeft size={15} /> Back to Accepted Campaigns
        </Link>

        <section className="community-workspace-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line" /> {campaign.advertiser} · {campaign.community}
            </span>
            <h1>{campaign.name}</h1>
            <p>
              Approved campaign workspace for {campaign.community}. You earn from qualified clicks
              generated after the approved advertisement is posted.
            </p>
          </div>
          <span className={statusClass(campaign.status)}>
            <span /> {campaign.status}
          </span>
        </section>

        <style>{communityDetailsStyles}</style>

        <div className="community-workspace-grid">
          <main>
            <section className="community-workspace-section">
              <div className="community-workspace-section-heading">
                <span className="community-workspace-step">01</span>
                <div>
                  <h2>Advertisement</h2>
                  <p>Approved copy from the Campaign Owner</p>
                </div>
              </div>
              <div className="community-approved-ad">
                <span className="community-approved-label">
                  <ShieldCheck size={14} /> Approved advertisement · Read only
                </span>
                <blockquote>“{campaign.advertisement}”</blockquote>
                <small>
                  You cannot edit the advertiser’s approved advertisement. Copy it exactly as
                  provided when posting.
                </small>
              </div>
            </section>

            <section className="community-workspace-section">
              <div className="community-workspace-section-heading">
                <span className="community-workspace-step">02</span>
                <div>
                  <h2>Posting instructions</h2>
                  <p>Where and how to share the approved ad</p>
                </div>
              </div>
              <ol className="community-posting-instructions">
                {campaign.instructions.map((instruction, index) => (
                  <li key={`${index}-${instruction}`}>
                    <span>{index + 1}</span>
                    {instruction}
                  </li>
                ))}
              </ol>
              {campaign.status === "Ready to Post" && (
                <button
                  className="accept-button community-post-confirm-button"
                  onClick={confirmPosted}
                >
                  <Send size={14} /> Confirm advertisement posted
                </button>
              )}
              {campaign.status === "Active" && (
                <div className="community-posted-note">
                  <CheckCircle2 size={15} /> Advertisement posted · placement active
                </div>
              )}
            </section>

            <section className="community-workspace-section">
              <div className="community-workspace-section-heading">
                <span className="community-workspace-step">03</span>
                <div>
                  <h2>Tracking link</h2>
                  <p>Connected to this campaign, community, and owner account</p>
                </div>
              </div>
              <div className="community-tracking-box">
                <div>
                  <span>
                    <Link2 size={14} /> Unique tracking URL
                  </span>
                  <code>
                    {window.location.origin}
                    {campaign.trackingLink}
                  </code>
                  <small>
                    Clicks are counted when someone leaves {campaign.platform} and visits the
                    tracked destination.
                  </small>
                </div>
                <button className="community-copy-button" onClick={copyTrackingLink}>
                  <Clipboard size={14} /> {copied ? "Copied" : "Copy link"}
                </button>
              </div>
            </section>
          </main>

          <aside className="community-workspace-side community-workspace-details">
            <section
              className="community-workspace-side-card community-details-performance"
              aria-labelledby="campaign-performance-title"
            >
              <div className="community-details-card-heading">
                <span className="community-details-icon community-details-icon-purple">
                  <MousePointer2 size={17} />
                </span>
                <div>
                  <span className="section-kicker">
                    <span className="section-kicker-line section-kicker-line-lilac" /> Results
                  </span>
                  <h2 id="campaign-performance-title">Campaign performance</h2>
                </div>
              </div>

              <div className="community-details-earnings">
                <span>Total earnings</span>
                <strong>{campaign.totalEarnings ?? "KSh 0.00"}</strong>
                <small>Earned from qualified campaign activity</small>
              </div>

              <div className="community-details-metrics">
                <div className="community-details-metric">
                  <span className="community-details-metric-icon">
                    <MousePointer2 size={15} />
                  </span>
                  <span>
                    <strong>{campaign.clicks}</strong>
                    <small>Qualified clicks</small>
                  </span>
                </div>
                <div className="community-details-metric">
                  <span className="community-details-metric-icon">
                    <WalletCards size={15} />
                  </span>
                  <span>
                    <strong>{campaign.payoutPerClick ?? campaign.earnings}</strong>
                    <small>Per qualified click</small>
                  </span>
                </div>
              </div>
            </section>

            <section
              className="community-workspace-side-card community-details-schedule"
              aria-labelledby="campaign-schedule-title"
            >
              <div className="community-details-card-heading">
                <span className="community-details-icon community-details-icon-green">
                  <CalendarDays size={17} />
                </span>
                <div>
                  <span className="section-kicker">Campaign schedule</span>
                  <h2 id="campaign-schedule-title">Dates &amp; status</h2>
                </div>
              </div>

              <div className="community-details-date-range">
                <div>
                  <small>Starts</small>
                  <strong>{campaign.startDate}</strong>
                </div>
                <span aria-hidden="true" />
                <div>
                  <small>Ends</small>
                  <strong>{campaign.endDate}</strong>
                </div>
              </div>

              <div className="community-details-status-row">
                <span>Placement status</span>
                <span className={statusClass(campaign.status)}>
                  <span /> {campaign.status}
                </span>
              </div>
            </section>

            <section
              className="community-workspace-side-card community-workspace-context community-details-context"
              aria-labelledby="campaign-context-title"
            >
              <div className="community-details-card-heading">
                <span className="community-details-icon community-details-icon-blue">
                  <BadgeCheck size={17} />
                </span>
                <div>
                  <span className="section-kicker">At a glance</span>
                  <h2 id="campaign-context-title">Campaign details</h2>
                </div>
              </div>

              <dl className="community-details-list">
                <div>
                  <dt>Community</dt>
                  <dd>{campaign.community}</dd>
                </div>
                <div>
                  <dt>Platform</dt>
                  <dd>{campaign.platform}</dd>
                </div>
                <div>
                  <dt>Advertiser</dt>
                  <dd>{campaign.advertiser}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{campaign.duration}</dd>
                </div>
              </dl>

              <Link
                className="community-campaign-link"
                href="/community-owner/accepted-campaigns"
              >
                View all accepted campaigns <ExternalLink size={13} />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </WorkspaceShell>
  );
}

function statusClass(status: string) {
  return `community-accepted-status community-accepted-status-${status
    .toLowerCase()
    .replaceAll(" ", "-")}`;
}