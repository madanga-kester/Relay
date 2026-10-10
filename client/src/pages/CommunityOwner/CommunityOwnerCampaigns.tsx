import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  MousePointer2,
  Send,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import WorkspaceShell from "@/components/WorkspaceShell";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  applyToCampaign,
  campaigns as defaultCampaigns,
  readApplications,
  readCampaigns,
  readCommunities,
  saveApplications,
  CampaignRecord,
  MarketplaceApplication,
  MarketplaceCommunity,
  displayMoney,
} from "@/data/marketplaceData";
import {
  createRelayApplication,
  getRelayBackendId,
  listMyRelayCommunities,
  listRelayApplications,
  listRelayCampaigns,
  relayBackendEnabled,
  setRelayBackendId,
} from "@/lib/relayApi";
import {
  fetchAllRelayPages,
  mapRelayCampaign,
  mapRelayCommunity,
  mergeRelayApplications,
} from "@/lib/relayMappers";

type Tab = "matching" | "applied" | "accepted" | "rejected";

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "matching", label: "Matching Campaigns" },
  { id: "applied", label: "Applied" },
  { id: "accepted", label: "Accepted" },
  { id: "rejected", label: "Rejected" },
];

export default function CommunityOwnerCampaigns() {
  const [communityList, setCommunityList] = useState<MarketplaceCommunity[]>(
    () => (relayBackendEnabled() ? [] : readCommunities())
  );
  const [applyCampaignId, setApplyCampaignId] = useState<string | null>(null);
  const [applyCommunityId, setApplyCommunityId] = useState("");
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>(() =>
    relayBackendEnabled() ? [] : defaultCampaigns
  );
  const [loadState, setLoadState] = useState<"idle" | "loading" | "ready" | "error">(
    () => (relayBackendEnabled() ? "loading" : "idle")
  );
  const [reloadKey, setReloadKey] = useState(0);
  const [applyingId, setApplyingId] = useState<string | null>(null);
    const [serverCampaignStats, setServerCampaignStats] = useState<Record<string, { acceptedCommunities: number; communityOwnerCpc: number }>>({});
  const [applications, setApplications] = useState<MarketplaceApplication[]>(
    readApplications
  );
  const [activeTab, setActiveTab] = useState<Tab>("matching");
  
  // List view is set as primary/default layout
  const [view, setView] = useState<"cards" | "list">("list");
  const [detailsCampaignId, setDetailsCampaignId] = useState<string | null>(null);

  const ownerIds = useMemo(
    () => new Set(communityList.map((community) => community.ownerId)),
    [communityList]
  );

  useEffect(() => {
    const backend = relayBackendEnabled();
    const refresh = () => {
      if (!backend) {
        setCampaigns(readCampaigns());
        setCommunityList(readCommunities());
      }
      setApplications(readApplications());
    };

    refresh();
    let cancelled = false;

    if (backend) {
      setLoadState("loading");
      Promise.all([
        fetchAllRelayPages(listMyRelayCommunities),
        fetchAllRelayPages(listRelayCampaigns),
        fetchAllRelayPages(listRelayApplications),
      ])
        .then(([remoteCommunities, remoteCampaigns, remoteApplications]) => {
          if (cancelled) return;
          const mappedCommunities = remoteCommunities.map(mapRelayCommunity);
          const mappedCampaigns = remoteCampaigns.map(mapRelayCampaign);
          const current = readApplications();
          const merged = mergeRelayApplications(
            current,
            remoteApplications,
            mappedCampaigns,
            mappedCommunities
          );

          setCommunityList(mappedCommunities);
          setApplyCommunityId((selected) =>
            mappedCommunities.some((community) => community.id === selected)
              ? selected
              : ""
          );
          setCampaigns(mappedCampaigns);
          setServerCampaignStats(
            Object.fromEntries(
              remoteCampaigns.map((item) => [
                item.id,
                {
                  acceptedCommunities: item.acceptedCommunities ?? 0,
                  communityOwnerCpc: item.communityOwnerCpc ?? 0,
                },
              ])
            )
          );

          if (JSON.stringify(merged) !== JSON.stringify(current)) {
            saveApplications(merged);
          }

          setApplications(merged);
          setLoadState("ready");
        })
        .catch((error) => {
          if (cancelled) return;
          setLoadState("error");
          toast.error("Could not load campaigns", {
            description:
              error instanceof Error
                ? error.message
                : "The server did not respond. Try again.",
          });
        });
    }

    window.addEventListener("ownerboard:applications-updated", refresh);
    window.addEventListener("ownerboard:communities-updated", refresh);

    return () => {
      cancelled = true;
      window.removeEventListener("ownerboard:applications-updated", refresh);
      window.removeEventListener("ownerboard:communities-updated", refresh);
    };
  }, [reloadKey]);

  const submitted = useMemo(
    () =>
      applications.filter((application) =>
        ownerIds.has(application.communityOwnerId)
      ),
    [applications, ownerIds]
  );

  if (communityList.length === 0) {
    return (
      <WorkspaceShell
        active="Campaigns"
        workspaceLabel="Community Owner"
        workspaceMode="community-owner"
      >
        <div className="dashboard-body community-campaigns-page">
          <div className="community-campaign-empty">
            <span>
              <MousePointer2 size={18} />
            </span>
            <h3>
              {loadState === "loading"
                ? "Loading your campaigns"
                : loadState === "error"
                ? "Campaigns could not be loaded"
                : "Add a community to see campaigns"}
            </h3>
            <p>
              {loadState === "loading"
                ? "Fetching your communities and open campaigns."
                : loadState === "error"
                ? "The server did not respond. Check your connection and try again."
                : "Campaigns are matched to the communities you manage."}
            </p>
            {loadState === "error" ? (
              <button
                className="accept-button"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Try again
              </button>
            ) : (
              loadState !== "loading" && (
                <Link className="accept-button" href="/communities/add">
                  Add community
                </Link>
              )
            )}
          </div>
        </div>
      </WorkspaceShell>
    );
  }
  const acceptedFor = (campaignId: string) =>
    Math.max(
      serverCampaignStats[campaignId]?.acceptedCommunities ?? 0,
      applications.filter(
        (application) =>
          application.campaignId === campaignId && application.status === "Accepted"
      ).length
    );

  const remainingFor = (campaign: CampaignRecord) =>
    Math.max(
      Number(campaign.maxCommunities.replace(/[^0-9.]/g, "")) -
        acceptedFor(campaign.id),
      0
    );

  const payoutFor = (campaign: CampaignRecord) => {
    const serverPayout = serverCampaignStats[campaign.id]?.communityOwnerCpc;
    return serverPayout
      ? serverPayout
      : Number(campaign.cpc.replace(/[^0-9.]/g, "")) * 0.75;
  };
  const eligibleCommunitiesFor = (campaign: CampaignRecord) =>
    communityList.filter(
      (community) =>
        campaign.platforms.includes(community.platform) &&
        !submitted.some(
          (application) =>
            application.campaignId === campaign.id &&
            application.communityId === community.id
        )
    );

  const matching = campaigns.filter((campaign) => {
    const remaining = remainingFor(campaign);
    return (
      (campaign.status === "Published" || campaign.status === "Active") &&
      remaining > 0 &&
      eligibleCommunitiesFor(campaign).length > 0
    );
  });

  const shown =
    activeTab === "matching"
      ? matching
      : submitted.filter((application) =>
          activeTab === "applied"
            ? application.status === "Pending"
            : application.status.toLowerCase() === activeTab
        );

  const apply = async (campaignId: string, communityId: string) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    const selectedCommunity = communityList.find(
      (community) => community.id === communityId
    );
    if (!campaign || !selectedCommunity || applyingId) return;

    if (relayBackendEnabled()) {
      setApplyingId(campaignId);
      try {
        const created = await createRelayApplication(
          campaign.id,
          selectedCommunity.id
        );
        const next = applyToCampaign(campaign, selectedCommunity);
        const localApplication = next.find(
          (item) =>
            item.campaignId === campaign.id &&
            item.communityId === selectedCommunity.id
        );
        if (localApplication) {
          setRelayBackendId("application", localApplication.id, created.id);
        }
        setApplications(next);
        setActiveTab("applied");
        toast.success("Application pending", {
          description: `${selectedCommunity.name} has applied to ${campaign.name}.`,
        });
      } catch (error) {
        toast.error("Application not submitted", {
          description:
            error instanceof Error
              ? error.message
              : "The server rejected this application.",
        });
      } finally {
        setApplyingId(null);
      }
      return;
    }

    const next = applyToCampaign(campaign, selectedCommunity);
    setApplications(next);
    setActiveTab("applied");
    toast.success("Application pending", {
      description: `${selectedCommunity.name} has applied to ${campaign.name}.`,
    });
  };

  const openApply = (campaignId: string) => {
    const campaign = campaigns.find((item) => item.id === campaignId);
    if (!campaign) return;
    const options = eligibleCommunitiesFor(campaign);
    setApplyCommunityId(options.length === 1 ? options[0].id : "");
    setApplyCampaignId(campaignId);
  };

  const closeApply = () => {
    if (applyingId) return;
    setApplyCampaignId(null);
    setApplyCommunityId("");
  };

  const confirmApply = async () => {
    if (!applyCampaignId || !applyCommunityId || applyingId) return;
    await apply(applyCampaignId, applyCommunityId);
    setApplyCampaignId(null);
    setApplyCommunityId("");
  };

  const dialogCampaign = campaigns.find((item) => item.id === applyCampaignId);
  const dialogOptions = dialogCampaign
    ? eligibleCommunitiesFor(dialogCampaign)
    : [];

  const detailsCampaign = campaigns.find((item) => item.id === detailsCampaignId);

  const detailsRemaining = detailsCampaign ? remainingFor(detailsCampaign) : 0;
  const mediaFor = (campaign: CampaignRecord) => {
    if (campaign.mediaImage || campaign.mediaVideoUrl) {
      return { image: campaign.mediaImage, video: campaign.mediaVideoUrl };
    }
    const local = readCampaigns().find(
      (item) =>
        item.id === campaign.id ||
        getRelayBackendId("campaign", item.id) === campaign.id
    );
    return { image: local?.mediaImage, video: local?.mediaVideoUrl };
  };

  const detailsMedia = detailsCampaign ? mediaFor(detailsCampaign) : undefined;
  const detailsVideoLink =
    detailsMedia?.video && /^https?:\/\//i.test(detailsMedia.video.trim())
      ? detailsMedia.video.trim()
      : undefined;
  const openDetails = (campaignId: string) => {
    if (!campaigns.some((item) => item.id === campaignId)) {
      toast.error("Campaign details are not available", {
        description: "This campaign is no longer listed.",
      });
      return;
    }
    setDetailsCampaignId(campaignId);
  };

  const counts = {
    matching: matching.length,
    applied: submitted.filter((item) => item.status === "Pending").length,
    accepted: submitted.filter((item) => item.status === "Accepted").length,
    rejected: submitted.filter((item) => item.status === "Rejected").length,
  };

  return (
    <WorkspaceShell
      active="Campaigns"
      workspaceLabel="Community Owner"
      workspaceMode="community-owner"
    >
      <div className="dashboard-body community-campaigns-page">
        <section className="community-campaigns-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line" /> Community Owner marketplace
            </span>
            <h1>Campaigns</h1>
            <p>
              Apply to opportunities that match the audiences you manage. You
              never accept a campaign — the Campaign Owner reviews your application.
            </p>
          </div>
          <div className="community-campaigns-summary">
            <strong>{matching.length}</strong>
            <span>matching now</span>
          </div>
        </section>

        <div className="community-campaign-tabs" role="tablist" aria-label="Campaign status">
          <span className="community-campaign-tab-label">Your applications</span>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "community-campaign-tab-active" : ""}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
              <b>{counts[tab.id]}</b>
            </button>
          ))}
        </div>

        <section className="community-campaigns-section">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                <span className="section-kicker-line section-kicker-line-lilac" />{" "}
                {activeTab === "matching"
                  ? "Matched to your community"
                  : tabs.find((tab) => tab.id === activeTab)?.label}
              </span>
              <h2>
                {activeTab === "matching"
                  ? "Find campaigns that fit your community"
                  : activeTab === "applied"
                  ? "Applications awaiting approval"
                  : activeTab === "accepted"
                  ? "Campaigns approved by Campaign Owners"
                  : "Applications not selected"}
              </h2>
            </div>
            <div className="community-view-controls">
              <span className="section-count">{shown.length} campaigns</span>
              <div
                className="community-view-toggle"
                role="group"
                aria-label="Change campaign view"
              >
                <button
                  type="button"
                  className={view === "cards" ? "view-toggle-active" : ""}
                  onClick={() => setView("cards")}
                >
                  <LayoutGrid size={14} /> Cards
                </button>
                <button
                  type="button"
                  className={view === "list" ? "view-toggle-active" : ""}
                  onClick={() => setView("list")}
                >
                  <List size={14} /> List
                </button>
              </div>
            </div>
          </div>

          <p className="community-campaigns-intro">
            {activeTab === "matching"
              ? "Review the audience fit, requirements, and earnings before you apply."
              : activeTab === "applied"
              ? "Your applications stay here until the Campaign Owner responds."
              : activeTab === "accepted"
              ? "Accepted applications move into your Accepted Campaigns workspace."
              : "Rejected applications remain visible here for reference and do not create placements."}
          </p>

          {shown.length > 0 ? (
            <div
              className={view === "cards" ? "community-campaign-grid" : ""}
              style={view === "list" ? { display: "grid", gap: 10 } : undefined}
            >
              {shown.map((item) => {
                if (activeTab === "matching") {
                  const campaignItem = item as typeof campaigns[number];
                  const remaining = remainingFor(campaignItem);
                  const payout = payoutFor(campaignItem);
                  return view === "cards" ? (
                    <CampaignCard
                      key={campaignItem.id}
                      campaign={campaignItem}
                      remaining={remaining}
                      payout={payout}
                      onApply={() => openApply(campaignItem.id)}
                      onView={() => openDetails(campaignItem.id)}
                    />
                  ) : (
                    <CampaignRow
                      key={campaignItem.id}
                      campaign={campaignItem}
                      remaining={remaining}
                      payout={payout}
                      onApply={() => openApply(campaignItem.id)}
                      onView={() => openDetails(campaignItem.id)}
                    />
                  );
                }

                const applicationItem = item as MarketplaceApplication;
                return view === "cards" ? (
                  <ApplicationCard
                    key={applicationItem.id}
                    application={applicationItem}
                    onView={() => openDetails(applicationItem.campaignId)}
                  />
                ) : (
                  <ApplicationRow
                    key={applicationItem.id}
                    application={applicationItem}
                    onView={() => openDetails(applicationItem.campaignId)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="community-campaign-empty">
              <span>
                <MousePointer2 size={18} />
              </span>
              <h3>No campaigns in this view yet</h3>
              <p>When your application or campaign status changes, it will appear here.</p>
            </div>
          )}
        </section>

        {/* Campaign Details Dialog (Expanded to ~80% Screen Size) */}
        <Dialog
          open={detailsCampaign !== undefined}
          onOpenChange={(open) => {
            if (!open) setDetailsCampaignId(null);
          }}
        >
          <DialogContent
            className="w-[80vw] max-w-none sm:max-w-none max-h-[80vh] flex flex-col gap-0 overflow-y-auto p-0"
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
              borderColor: "var(--border)",
            }}
          >
            {detailsCampaign && (
              <>
                <DialogHeader
                  className="border-b px-8 py-6 text-left"
                  style={{ borderColor: "var(--border)" }}
                >
                  <DialogTitle className="text-2xl font-bold">{detailsCampaign.name}</DialogTitle>
                  <DialogDescription className="text-base">{detailsCampaign.advertiser}</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 content-start gap-4 p-8 sm:grid-cols-4 flex-1 overflow-y-auto">
                  {[
                    ["Status", detailsCampaign.status],
                    ["Platform", detailsCampaign.platforms.join(" / ")],
                    ["Category", detailsCampaign.category],
                    ["Target location", detailsCampaign.location],
                    ["Duration", detailsCampaign.duration],
                    ["Spots remaining", String(detailsRemaining)],
                    [
                      "Community earnings",
                      `${payoutFor(detailsCampaign).toFixed(2)} / qualified click`,
                    ],
                    ["Campaign budget", displayMoney(detailsCampaign.budget)],
                  ].map(([label, value]) => (
                    <div
                      className="rounded-xl border p-5 flex flex-col justify-center"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--surface-soft)",
                      }}
                      key={label}
                    >
                      <small
                        className="block text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color: "var(--muted)" }}
                      >
                        {label}
                      </small>
                      <strong className="block text-base">{value}</strong>
                    </div>
                  ))}

                  {detailsCampaign.description && (
                    <div className="col-span-2 sm:col-span-4">
                      <h3 className="mb-2 text-sm font-bold">About this campaign</h3>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "var(--muted)", whiteSpace: "pre-wrap" }}
                      >
                        {detailsCampaign.description}
                      </p>
                    </div>
                  )}

                  {detailsCampaign.advertisement && (
                    <div className="col-span-2 sm:col-span-4">
                      <h3 className="mb-2 text-sm font-bold">Advertisement text</h3>
                      <p
                        className="rounded-xl border p-4 text-sm leading-relaxed"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--surface-soft)",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {detailsCampaign.advertisement}
                      </p>
                    </div>
                  )}

                  {detailsMedia?.image && (
                    <div className="col-span-2 sm:col-span-4">
                      <h3 className="mb-2 text-sm font-bold">Advertisement image</h3>
                      <img
                        src={detailsMedia.image}
                        alt={`${detailsCampaign.name} advertisement`}
                        className="w-full rounded-xl object-contain"
                        style={{ maxHeight: 360, background: "var(--surface-soft)" }}
                      />
                    </div>
                  )}

                  {detailsVideoLink && (
                    <div className="col-span-2 sm:col-span-4">
                      <h3 className="mb-2 text-sm font-bold">Advertisement video</h3>
                      <a
                        className="inline-flex items-center gap-1.5 text-sm font-bold"
                        style={{ color: "var(--coral-dark)" }}
                        href={detailsVideoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ArrowUpRight size={14} /> Watch the video
                      </a>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center justify-end gap-3 border-t px-8 py-5"
                  style={{ borderColor: "var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setDetailsCampaignId(null)}
                    className="px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                    style={{
                      borderColor: "var(--border)",
                      color: "inherit",
                    }}
                  >
                    Close
                  </button>
                  {matching.some((item) => item.id === detailsCampaign.id) && (
                    <button
                      type="button"
                      className="accept-button flex items-center gap-2 px-5 py-2.5 text-sm font-medium"
                      onClick={() => {
                        const campaignId = detailsCampaign.id;
                        setDetailsCampaignId(null);
                        openApply(campaignId);
                      }}
                    >
                      <Send size={14} /> Apply to Campaign
                    </button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Apply Dialog */}
        <Dialog
          open={applyCampaignId !== null}
          onOpenChange={(open) => {
            if (!open) closeApply();
          }}
        >
          <DialogContent
            className="gap-0 p-0 sm:max-w-lg"
            style={{
              background: "var(--surface)",
              color: "var(--ink)",
              borderColor: "var(--border)",
            }}
          >
            <DialogHeader
              className="border-b px-6 py-5 text-left"
              style={{ borderColor: "var(--border)" }}
            >
              <DialogTitle>Choose a community</DialogTitle>
              <DialogDescription>
                Select the community that will apply to {dialogCampaign?.name}.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2 px-6 py-5">
              {dialogOptions.map((community) => (
                <label
                  key={community.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3"
                  style={{
                    borderColor:
                      applyCommunityId === community.id
                        ? "var(--coral)"
                        : "var(--border)",
                  }}
                >
                  <input
                    type="radio"
                    name="apply-community"
                    checked={applyCommunityId === community.id}
                    onChange={() => setApplyCommunityId(community.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block">{community.name}</strong>
                    <small style={{ color: "var(--muted)" }}>
                      {community.platform} / {community.members} members /{" "}
                      {community.location}
                    </small>
                  </span>
                </label>
              ))}
            </div>

            <div
              className="flex items-center justify-end gap-3 border-t px-6 py-4"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                type="button"
                onClick={closeApply}
                disabled={Boolean(applyingId)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                  background: "transparent",
                  color: "inherit",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="accept-button"
                onClick={() => void confirmApply()}
                disabled={!applyCommunityId || Boolean(applyingId)}
              >
                <Send size={14} />{" "}
                {applyingId ? "Applying..." : "Apply with this community"}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </WorkspaceShell>
  );
}

function CampaignCard({
  campaign,
  remaining,
  payout,
  onApply,
  onView,
}: {
  campaign: typeof defaultCampaigns[number];
  remaining: number;
  payout: number;
  onApply: () => void;
  onView: () => void;
}) {
  return (
    <article className="community-campaign-card">
      <div className="community-campaign-card-top">
        <div>
          <span className="community-campaign-status community-campaign-status-matching">
            <span /> Matching
          </span>
          <h2>{campaign.name}</h2>
          <p>{campaign.advertiser}</p>
        </div>
        <span className="community-campaign-fit">Matches your communities</span>
      </div>

      <div className="community-campaign-details">
        <span>
          <small>Platform</small>
          <strong>{campaign.platforms.join(" / ")}</strong>
        </span>
        <span>
          <small>Category</small>
          <strong>{campaign.category}</strong>
        </span>
        <span>
          <small>Target location</small>
          <strong>
            <MapPin size={12} /> {campaign.location}
          </strong>
        </span>
        <span>
          <small>Duration</small>
          <strong>{campaign.duration}</strong>
        </span>
        <span>
          <small>Community owner earnings</small>
          <strong>
            {payout.toFixed(2)} / qualified click
          </strong>
        </span>
        <span>
          <small>Community availability</small>
          <strong>
            <UsersRound size={12} /> {remaining} spots remaining
          </strong>
        </span>
      </div>

      <div className="community-campaign-card-footer flex flex-wrap items-center gap-2">
        <span>
          <b>
            {payout.toFixed(2)} / click
          </b>
          <small>qualified click earnings</small>
        </span>
        <span>
          <b>{displayMoney(campaign.budget)}</b>
          <small>campaign budget</small>
        </span>

        {/* Redesigned View Campaign Details Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ borderColor: "var(--border)", color: "var(--ink)" }}
          onClick={onView}
        >
          <Eye size={14} className="text-muted-foreground" />
          <span>Details</span>
        </button>

        <button className="accept-button community-apply-button" onClick={onApply}>
          <Send size={14} /> Apply to Campaign
        </button>
      </div>
    </article>
  );
}

function ApplicationCard({
  application,
  onView,
}: {
  application: MarketplaceApplication;
  onView: () => void;
}) {
  const accepted = application.status === "Accepted";
  const rejected = application.status === "Rejected";

  return (
    <article className="community-campaign-card">
      <div className="community-campaign-card-top">
        <div>
          <span
            className={`community-campaign-status community-campaign-status-${application.status.toLowerCase()}`}
          >
            <span /> {application.status}
          </span>
          <h2>{application.campaign}</h2>
          <p>
            {application.community} · {application.platform}
          </p>
        </div>
        <span className="community-campaign-fit">
          {accepted
            ? "Approved by Campaign Owner"
            : rejected
            ? "Not selected"
            : "Awaiting review"}
        </span>
      </div>

      <div className="community-campaign-details">
        <span>
          <small>Members</small>
          <strong>
            <UsersRound size={12} /> {application.members}
          </strong>
        </span>
        <span>
          <small>Category</small>
          <strong>{application.category}</strong>
        </span>
        <span>
          <small>Location</small>
          <strong>
            <MapPin size={12} /> {application.location}
          </strong>
        </span>
        <span>
          <small>Community owner earnings</small>
          <strong>{displayMoney(application.communityOwnerCpc)} / click</strong>
        </span>
      </div>

      <div className="community-campaign-card-footer flex items-center justify-between gap-2">
        {/* Redesigned View Campaign Details Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/10"
          style={{ borderColor: "var(--border)", color: "var(--ink)" }}
          onClick={onView}
        >
          <Eye size={14} className="text-muted-foreground" />
          <span>Details</span>
        </button>

        {accepted ? (
          <Link
            className="community-campaign-link"
            href="/community-owner/accepted-campaigns"
          >
            View Accepted Campaigns <ArrowUpRight size={14} />
          </Link>
        ) : rejected ? (
          <span className="community-completed-label">
            <XCircle size={14} /> Rejected
          </span>
        ) : (
          <span className="community-pending-label">
            <Clock3 size={14} /> Application Pending
          </span>
        )}
      </div>
    </article>
  );
}

function CampaignRow({
  campaign,
  remaining,
  payout,
  onApply,
  onView,
}: {
  campaign: typeof defaultCampaigns[number];
  remaining: number;
  payout: number;
  onApply: () => void;
  onView: () => void;
}) {
  const earnings = payout.toFixed(2);

  return (
    <article
      className="flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 transition-all hover:border-black/20 dark:hover:border-white/20"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--ink)",
      }}
    >
      <div className="min-w-0" style={{ flex: "1 1 220px" }}>
        <strong className="block text-base">{campaign.name}</strong>
        <small style={{ color: "var(--muted)" }}>
          {campaign.advertiser} / {campaign.platforms.join(" / ")} / {campaign.category}
        </small>
      </div>

      <span
        className="inline-flex items-center gap-1 text-sm"
        style={{ flex: "0 1 150px" }}
      >
        <MapPin size={12} /> {campaign.location}
      </span>

      <span className="text-sm" style={{ flex: "0 1 100px" }}>
        {campaign.duration}
      </span>

      <span className="text-sm" style={{ flex: "0 1 150px" }}>
        <b>{earnings} / click</b>
      </span>

      <span
        className="inline-flex items-center gap-1 text-sm"
        style={{ flex: "0 1 140px" }}
      >
        <UsersRound size={12} /> {remaining} spots left
      </span>

      <div className="flex items-center gap-2">
        {/* Redesigned View Campaign Details Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ borderColor: "var(--border)", color: "var(--ink)" }}
          onClick={onView}
        >
          <Eye size={14} />
          <span>Details</span>
        </button>

        <button
          type="button"
          className="accept-button community-apply-button flex items-center gap-1.5"
          onClick={onApply}
        >
          <Send size={14} /> Apply to Campaign
        </button>
      </div>
    </article>
  );
}

function ApplicationRow({
  application,
  onView,
}: {
  application: MarketplaceApplication;
  onView: () => void;
}) {
  const accepted = application.status === "Accepted";
  const rejected = application.status === "Rejected";

  return (
    <article
      className="flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 transition-all hover:border-black/20 dark:hover:border-white/20"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        color: "var(--ink)",
      }}
    >
      <div className="min-w-0" style={{ flex: "1 1 220px" }}>
        <strong className="block text-base">{application.campaign}</strong>
        <small style={{ color: "var(--muted)" }}>
          {application.community} / {application.platform}
        </small>
      </div>

      <span
        className={`community-campaign-status community-campaign-status-${application.status.toLowerCase()}`}
      >
        <span /> {application.status}
      </span>

      <span
        className="inline-flex items-center gap-1 text-sm"
        style={{ flex: "0 1 150px" }}
      >
        <MapPin size={12} /> {application.location}
      </span>

      <span className="text-sm" style={{ flex: "0 1 150px" }}>
        <b>{displayMoney(application.communityOwnerCpc)} / click</b>
      </span>

      <div className="flex items-center gap-2">
        {/* Redesigned View Campaign Details Button */}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/10"
          style={{ borderColor: "var(--border)", color: "var(--ink)" }}
          onClick={onView}
        >
          <Eye size={14} />
          <span>Details</span>
        </button>

        {accepted ? (
          <Link
            className="community-campaign-link"
            href="/community-owner/accepted-campaigns"
          >
            View Accepted Campaigns <ArrowUpRight size={14} />
          </Link>
        ) : rejected ? (
          <span className="community-completed-label">
            <XCircle size={14} /> Rejected
          </span>
        ) : (
          <span className="community-pending-label">
            <Clock3 size={14} /> Application Pending
          </span>
        )}
      </div>
    </article>
  );
}