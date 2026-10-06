import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getAcceptedCommunityCampaigns, readApplications, syncServerClickEvents } from "../CampaignOwner/applicationData";
import { formatMoney, getCampaignFinancials, getCpcBreakdown, getPlacementClickStats, getTrackingPath } from "@/data/marketplaceData";
import { listRelayApplications, relayBackendEnabled } from "@/lib/relayApi";
import type { AcceptedCommunityCampaign } from "./CommunityOwnerAcceptedCampaigns";

type BackendApplication = Awaited<ReturnType<typeof listRelayApplications>>["items"][number];

function toAccepted(item: BackendApplication): AcceptedCommunityCampaign {
  const placement = item.placement!;
  const campaign = item.campaign;
  const communityName = item.community?.name ?? "Community";
  const platform = item.community?.platform ?? "WhatsApp";
  const stats = getPlacementClickStats(placement.id);
  const breakdown = getCpcBreakdown(`KSh ${item.cpc}`);
  const financials = getCampaignFinancials(`KSh ${campaign?.cpc ?? item.cpc}`, `KSh ${campaign?.budget ?? 0}`, stats.qualified);
  return {
    id: `application-${item.id}`,
    placementId: placement.id,
    name: campaign?.name ?? "Campaign",
    advertiser: campaign?.advertiserName ?? "",
    community: communityName,
    platform,
    duration: campaign ? `${campaign.durationDays} days` : "",
    earnings: `${formatMoney(breakdown.communityOwnerCpc, 2)} / qualified click`,
    payoutPerClick: formatMoney(financials.communityOwnerCpc, 2),
    totalEarnings: formatMoney(financials.communityOwnerEarnings, 2),
    status: (placement.status === "ReadyToPost" ? "Ready to Post" : placement.status) as AcceptedCommunityCampaign["status"],
    clicks: String(financials.qualifiedClicks),
    qualifiedClicks: financials.qualifiedClicks,
    startDate: campaign?.startDate ?? "",
    endDate: campaign?.endDate ?? "",
    trackingLink: getTrackingPath(placement.trackingId),
    advertisement: campaign?.advertisement ?? "",
    instructions: [
      "Copy the approved advertisement exactly as shown.",
      `Open ${communityName} on ${platform} and post it in the main community feed or announcement area.`,
      "Include your unique tracking link so every qualified click is counted.",
      "Return here and confirm the advertisement was posted to activate the placement.",
    ],
  };
}

export function useAcceptedCampaigns() {
  const backend = relayBackendEnabled();
  const [campaigns, setCampaigns] = useState<AcceptedCommunityCampaign[]>(() => backend ? [] : getAcceptedCommunityCampaigns(readApplications()));
  const [loaded, setLoaded] = useState(!backend);

  const load = useCallback(async () => {
    if (!backend) {
      setCampaigns(getAcceptedCommunityCampaigns(readApplications()));
      setLoaded(true);
      return;
    }
    try {
      const page = await listRelayApplications();
      setCampaigns(page.items.filter((item) => item.status === "Accepted" && item.placement).map(toAccepted));
    } catch {
      toast.error("Could not load accepted campaigns", { description: "Check that the API is running, then refresh the page." });
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

  return { campaigns, loaded, reload: load };
}