import { useEffect, useState } from "react";
import {
  getRelayBackendId,
  getRelayBillingActivity,
  getRelayCampaignPerformance,
  listMyRelayCampaigns,
  relayBackendEnabled,
} from "@/lib/relayApi";
import { readCampaigns } from "./campaignData";
import { allPages } from "./useCampaignPerformance";

export type BillingCampaignRow = {
  id: string;
  linkId: string;
  name: string;
  status: string;
  budget: number;
  spend: number;
  fees: number;
  payouts: number;
  clicks: number;
  remaining: number;
};

export type BillingActivityItem = {
  id: string;
  campaign: string;
  createdAt: string;
  trackingId: string;
  charge: number;
  fee: number;
};

export type CampaignBillingState = {
  loading: boolean;
  failed: boolean;
  rows: BillingCampaignRow[];
  activity: BillingActivityItem[];
};

const empty: CampaignBillingState = { loading: true, failed: false, rows: [], activity: [] };

export function useCampaignBilling(): CampaignBillingState {
  const [state, setState] = useState<CampaignBillingState>(empty);

  useEffect(() => {
    if (!relayBackendEnabled()) {
      setState({ ...empty, loading: false });
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const [campaigns, performance, activity] = await Promise.all([
          allPages(listMyRelayCampaigns),
          getRelayCampaignPerformance(),
          getRelayBillingActivity(8),
        ]);
        if (cancelled) return;
        const local = readCampaigns();
        const statsByCampaign = new Map(performance.map((item) => [item.campaignId, item]));
        const nameById = new Map(campaigns.map((campaign) => [campaign.id, campaign.name]));
        const rows = campaigns.map((campaign) => {
          const stats = statsByCampaign.get(campaign.id);
          const spend = stats?.advertiserSpend ?? 0;
          return {
            id: campaign.id,
            linkId: local.find((candidate) => getRelayBackendId("campaign", candidate.id) === campaign.id)?.id ?? campaign.id,
            name: campaign.name,
            status: campaign.status === "BudgetExhausted" ? "Budget Exhausted" : campaign.status,
            budget: campaign.budget,
            spend,
            fees: stats?.platformFees ?? 0,
            payouts: stats?.communityOwnerEarnings ?? 0,
            clicks: stats?.qualifiedClicks ?? 0,
            remaining: Math.max(campaign.budget - spend, 0),
          };
        });
        setState({
          loading: false,
          failed: false,
          rows,
          activity: activity.map((item) => ({
            id: item.id,
            campaign: nameById.get(item.campaignId) ?? "Campaign",
            createdAt: item.createdAt,
            trackingId: item.trackingId,
            charge: item.advertiserCharge,
            fee: item.platformFee,
          })),
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