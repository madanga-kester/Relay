import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CampaignOwnerApplication, syncServerClickEvents } from "./applicationData";
import { CampaignOwnerPlacement, readPlacements } from "./placementData";
import { CampaignRecord } from "./campaignData";
import { formatMoney, getCampaignFinancials, getCpcBreakdown, getPlacementClickStats, getTrackingPath } from "@/data/marketplaceData";
import { listRelayApplications, relayBackendEnabled } from "@/lib/relayApi";

type BackendApplication = Awaited<ReturnType<typeof listRelayApplications>>["items"][number];

function placementStatus(status: string): "Ready to Post" | "Active" | "Completed" {
  return status === "ReadyToPost" || status === "Ready to Post" ? "Ready to Post" : status === "Completed" ? "Completed" : "Active";
}

function toPlacement(item: BackendApplication): CampaignOwnerPlacement {
  const placement = item.placement!;
  const campaign = item.campaign;
  const community = item.community;
  const stats = getPlacementClickStats(placement.id);
  const breakdown = getCpcBreakdown(`KSh ${item.cpc}`);
  const financials = getCampaignFinancials(`KSh ${campaign?.cpc ?? item.cpc}`, `KSh ${campaign?.budget ?? 0}`, stats.qualified);
  return {
    id: placement.id,
    campaignId: item.campaignId,
    communityId: item.communityId,
    communityOwnerId: item.communityOwnerId,
    community: community?.name ?? "Community",
    campaign: campaign?.name ?? "Campaign",
    advertiser: campaign?.advertiserName ?? "",
    platform: (community?.platform ?? "WhatsApp") as CampaignOwnerApplication["platform"],
    members: community ? community.members.toLocaleString("en-KE") : "—",
    category: community?.category ?? "—",
    location: community?.location ?? "—",
    verification: community?.verificationStatus === "Verified" ? "Verified" : "Pending verification",
    pastCampaignClicks: "—",
    cpc: formatMoney(item.cpc, 2),
    communityOwnerCpc: formatMoney(breakdown.communityOwnerCpc, 2),
    trackingId: placement.trackingId,
    status: "Accepted",
    placementStatus: placementStatus(placement.status),
    applied: "Received",
    applicationDate: "",
    duration: campaign ? `${campaign.durationDays} days` : "",
    startDate: campaign?.startDate ?? "",
    endDate: campaign?.endDate ?? "",
    campaignStatus: (campaign?.status === "BudgetExhausted" ? "Budget Exhausted" : campaign?.status ?? "Published") as CampaignRecord["status"],
    campaignBudget: formatMoney(campaign?.budget ?? 0),
    campaignSpend: formatMoney(financials.advertiserSpend, 2),
    remainingBudget: formatMoney(financials.remainingBudget, 2),
    advertiserCpc: formatMoney(financials.advertiserCpc, 2),
    qualifiedClicks: financials.qualifiedClicks,
    totalCommunityOwnerEarnings: formatMoney(financials.communityOwnerEarnings, 2),
    platformRevenue: formatMoney(financials.platformRevenue, 2),
    clicks: financials.qualifiedClicks,
    trackingLink: getTrackingPath(placement.trackingId),
    advertisement: campaign?.advertisement ?? "",
  } as CampaignOwnerPlacement;
}

export function useCampaignPlacements() {
  const backend = relayBackendEnabled();
  const [placements, setPlacements] = useState<CampaignOwnerPlacement[]>(() => backend ? [] : readPlacements());
  const [loaded, setLoaded] = useState(!backend);

  const load = useCallback(async () => {
    if (!backend) {
      setPlacements(readPlacements());
      setLoaded(true);
      return;
    }
    try {
      const page = await listRelayApplications();
      setPlacements(page.items.filter((item) => item.status === "Accepted" && item.placement).map(toPlacement));
    } catch {
      toast.error("Could not load placements", { description: "Check that the API is running, then refresh the page." });
    }
    setLoaded(true);
  }, [backend]);

  useEffect(() => {
    void syncServerClickEvents().catch(() => undefined).then(load);
    const refresh = () => { void load(); };
    window.addEventListener("ownerboard:applications-updated", refresh);
    window.addEventListener("ownerboard:click-events-updated", refresh);
    return () => {
      window.removeEventListener("ownerboard:applications-updated", refresh);
      window.removeEventListener("ownerboard:click-events-updated", refresh);
    };
  }, [load]);

  return { placements, loaded };
}