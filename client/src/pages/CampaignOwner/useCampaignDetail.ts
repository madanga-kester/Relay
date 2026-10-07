import { useEffect, useState } from "react";
import type { CampaignRecord, CampaignStatus } from "@/data/marketplaceData";
import {
  getRelayBackendId,
  getRelayCampaign,
  getRelayCampaignPerformance,
  listRelayApplications,
  relayBackendEnabled,
} from "@/lib/relayApi";
import { allPages } from "./useCampaignPerformance";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const statusMap: Record<string, CampaignStatus> = {
  Draft: "Draft",
  Published: "Published",
  Active: "Active",
  Paused: "Paused",
  Completed: "Completed",
  BudgetExhausted: "Budget Exhausted",
};

export type CampaignDetailState = {
  loading: boolean;
  backendId?: string;
  campaign?: CampaignRecord;
  applications: { status: string }[] | null;
  stats?: { qualifiedClicks: number; advertiserSpend: number };
};

export function useCampaignDetail(routeId: string | undefined): CampaignDetailState {
  const backendId =
    routeId && relayBackendEnabled()
      ? getRelayBackendId("campaign", routeId) ?? (UUID_PATTERN.test(routeId) ? routeId : undefined)
      : undefined;
  const [state, setState] = useState<CampaignDetailState>({ loading: Boolean(backendId), backendId, applications: null });

  useEffect(() => {
    if (!backendId || !routeId) {
      setState({ loading: false, applications: null });
      return;
    }
    let cancelled = false;
    setState((current) => ({ ...current, loading: true, backendId }));
    Promise.all([getRelayCampaign(backendId), allPages(listRelayApplications), getRelayCampaignPerformance()])
      .then(([item, applications, performance]) => {
        if (cancelled) return;
        const mine = applications.filter((application) => application.campaignId === backendId);
        const stats = performance.find((entry) => entry.campaignId === backendId);
        const qualifiedClicks = stats?.qualifiedClicks ?? 0;
        setState({
          loading: false,
          backendId,
          applications: mine,
          stats: { qualifiedClicks, advertiserSpend: stats?.advertiserSpend ?? 0 },
          campaign: {
            id: routeId,
            name: item.name,
            advertiser: item.advertiserName,
            description: item.description,
            advertisement: item.advertisement,
            destinationUrl: item.destinationUrl,
            platforms: item.platforms,
            category: item.category,
            location: item.location,
            minAudience: item.minimumAudience.toLocaleString("en-US"),
            maxAudience: item.maximumAudience.toLocaleString("en-US"),
            duration: `${item.durationDays} days`,
            maxCommunities: String(item.maximumCommunities),
            cpc: String(item.cpc),
            budget: String(item.budget),
            startDate: item.startDate,
            endDate: item.endDate,
            status: statusMap[item.status] ?? "Draft",
            applications: mine.length,
            placements: 0,
            clicks: qualifiedClicks,
          },
        });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, backendId, applications: null });
      });
    return () => {
      cancelled = true;
    };
  }, [backendId, routeId]);

  return state;
}