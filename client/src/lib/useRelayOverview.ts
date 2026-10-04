import { useEffect, useState } from "react";
import {
  listMyRelayCampaigns,
  listMyRelayCommunities,
  listMyRelayPlacements,
  listRelayApplications,
  listRelayCampaigns,
  listRelayCommunities,
  relayBackendEnabled,
  type RelayCampaign,
  type RelayCommunity,
} from "@/lib/relayApi";

export type OverviewApplication = Awaited<ReturnType<typeof listRelayApplications>>["items"][number];
export type OverviewPlacement = Awaited<ReturnType<typeof listMyRelayPlacements>>["items"][number];

type OverviewData = {
  loading: boolean;
  campaigns: RelayCampaign[];
  communities: RelayCommunity[];
  applications: OverviewApplication[];
  placements: OverviewPlacement[];
};

const empty: OverviewData = { loading: true, campaigns: [], communities: [], applications: [], placements: [] };

export function useRelayOverview(role: "Advertiser" | "CommunityOwner"): OverviewData {
  const [data, setData] = useState<OverviewData>(empty);

  useEffect(() => {
    let cancelled = false;
    if (!relayBackendEnabled()) {
      setData({ ...empty, loading: false });
      return;
    }
    const load = async () => {
      const [campaigns, communities, applications, placements] = await Promise.allSettled([
        role === "Advertiser" ? listMyRelayCampaigns() : listRelayCampaigns(),
        role === "CommunityOwner" ? listMyRelayCommunities() : listRelayCommunities(),
        listRelayApplications(),
        listMyRelayPlacements(),
      ]);
      if (cancelled) return;
      setData({
        loading: false,
        campaigns: campaigns.status === "fulfilled" ? campaigns.value.items : [],
        communities: communities.status === "fulfilled" ? communities.value.items : [],
        applications: applications.status === "fulfilled" ? applications.value.items : [],
        placements: placements.status === "fulfilled" ? placements.value.items : [],
      });
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  return data;
}

export function greetingFor(displayName?: string) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = displayName?.split(" ")[0];
  return firstName ? `${greeting}, ${firstName}` : greeting;
}

export function formatMembers(members: number) {
  return members >= 1000 ? `${(members / 1000).toFixed(1)}k` : String(members);
}

export function formatKsh(amount: number) {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}