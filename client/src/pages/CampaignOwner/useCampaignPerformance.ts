import { useEffect, useState } from "react";
import {
  getRelayCampaignPerformance,
  listMyRelayCampaigns,
  listMyRelayPlacements,
  relayBackendEnabled,
  type RelayPage,
} from "@/lib/relayApi";

export type PerformanceRow = {
  id: string;
  name: string;
  status: string;
  placementCount: number;
  qualifiedClicks: number;
  cpc: number;
  spend: number;
  budget: number;
  remaining: number;
  used: number;
};

export type CampaignPerformanceState = {
  loading: boolean;
  failed: boolean;
  rows: PerformanceRow[];
  activePlacements: number;
  completedPlacements: number;
};

const empty: CampaignPerformanceState = { loading: true, failed: false, rows: [], activePlacements: 0, completedPlacements: 0 };

export async function allPages<T>(load: (page: number, pageSize: number) => Promise<RelayPage<T>>, pageSize = 100, maxPages = 20) {
  const first = await load(1, pageSize);
  const items = [...first.items];
  const lastPage = Math.min(first.totalPages, maxPages);
  if (lastPage > 1) {
    const rest = await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) => load(index + 2, pageSize)));
    rest.forEach((page) => items.push(...page.items));
  }
  return items;
}

export function useCampaignPerformance(): CampaignPerformanceState {
  const [state, setState] = useState<CampaignPerformanceState>(empty);

  useEffect(() => {
    if (!relayBackendEnabled()) {
      setState({ ...empty, loading: false });
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const [campaigns, placements, performance] = await Promise.all([
          allPages(listMyRelayCampaigns),
          allPages(listMyRelayPlacements),
          getRelayCampaignPerformance(),
        ]);
        if (cancelled) return;
        const statsByCampaign = new Map(performance.map((item) => [item.campaignId, item]));
        const rows = campaigns
          .filter((campaign) => placements.some((placement) => placement.campaignId === campaign.id))
          .map((campaign) => {
            const stats = statsByCampaign.get(campaign.id);
            const qualifiedClicks = stats?.qualifiedClicks ?? 0;
            const spend = stats?.advertiserSpend ?? 0;
            const maximumClicks = campaign.cpc > 0 ? Math.floor(campaign.budget / campaign.cpc) : 0;
            return {
              id: campaign.id,
              name: campaign.name,
              status: campaign.status === "BudgetExhausted" ? "Budget Exhausted" : campaign.status,
              placementCount: placements.filter((placement) => placement.campaignId === campaign.id).length,
              qualifiedClicks,
              cpc: campaign.cpc,
              spend,
              budget: campaign.budget,
              remaining: Math.max(campaign.budget - spend, 0),
              used: maximumClicks ? Math.min(100, Math.round((qualifiedClicks / maximumClicks) * 100)) : 0,
            };
          });
        setState({
          loading: false,
          failed: false,
          rows,
          activePlacements: placements.filter((placement) => placement.status === "Active").length,
          completedPlacements: placements.filter((placement) => placement.status === "Completed").length,
        });
      } catch {
        if (!cancelled) setState({ ...empty, loading: false, failed: true });
      }
    };
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return state;
}