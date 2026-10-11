import { formatMoney, getCpcBreakdown } from "@/data/marketplaceData";
import type { ApplicationStatus, CampaignRecord, CampaignStatus, MarketplaceApplication, MarketplaceCommunity, PlacementStatus } from "@/data/marketplaceData";
import { getRelayBackendId, setRelayBackendId } from "@/lib/relayApi";
import type { RelayCampaign, RelayCommunity, RelayPage } from "@/lib/relayApi";

export type RelayApplicationItem = { id: string; campaignId: string; communityId: string; communityOwnerId: string; cpc: number; status: string; placement?: { id: string; trackingId: string; status: string } | null; createdAt?: string; community?: { pastQualifiedClicks?: number } | null };

const campaignStatusMap: Record<string, CampaignStatus> = { Draft: "Draft", Published: "Published", Active: "Active", Paused: "Paused", Completed: "Completed", BudgetExhausted: "Budget Exhausted" };
const placementStatusMap: Record<string, PlacementStatus> = { ReadyToPost: "Ready to Post", Active: "Active", Completed: "Completed" };
const applicationStatusMap: Record<string, ApplicationStatus> = { Pending: "Pending", Accepted: "Accepted", Rejected: "Rejected" };
const applicationPlatforms = ["WhatsApp", "Telegram", "Discord"] as const;

const grouped = (value: number) => value.toLocaleString("en-US");

export function appliedLabel(createdAt?: string): string {
  if (!createdAt) return "Earlier";
  const time = new Date(createdAt).getTime();
  if (Number.isNaN(time)) return "Earlier";
  const days = Math.floor((Date.now() - time) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
export function roundedCommunityPayout(cpc: number): number {
  const cents = Math.round(cpc * 100);
  if (!Number.isFinite(cpc) || Math.abs(cpc * 100 - cents) > 1e-6) {
    return getCpcBreakdown(formatMoney(cpc, 2)).communityOwnerCpc;
  }
  const quotient = Math.floor(cents / 4);
  const remainder = cents % 4;
  const feeCents = remainder === 3 ? quotient + 1 : remainder === 2 ? quotient + (quotient % 2) : quotient;
  return (cents - feeCents) / 100;
}

export async function fetchAllRelayPages<T>(load: (page: number, pageSize: number) => Promise<RelayPage<T>>, pageSize = 100, maxPages = 20): Promise<T[]> {
  const first = await load(1, pageSize);
  const items = [...first.items];
  const lastPage = Math.min(first.totalPages, maxPages);
  if (lastPage > 1) {
    const rest = await Promise.all(Array.from({ length: lastPage - 1 }, (_, index) => load(index + 2, pageSize)));
    rest.forEach((page) => items.push(...page.items));
  }
  return items;
}

export function mapRelayCampaign(campaign: RelayCampaign): CampaignRecord {
  return {
    id: campaign.id,
    name: campaign.name,
    advertiser: campaign.advertiserName,
    description: campaign.description,
    advertisement: campaign.advertisement,
    destinationUrl: campaign.destinationUrl,
    platforms: campaign.platforms,
    category: campaign.category,
    location: campaign.location,
    minAudience: grouped(campaign.minimumAudience),
    maxAudience: grouped(campaign.maximumAudience),
    duration: `${campaign.durationDays} days`,
    maxCommunities: String(campaign.maximumCommunities),
    cpc: formatMoney(campaign.cpc, 2),
    budget: formatMoney(campaign.budget),
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    status: campaignStatusMap[campaign.status] ?? "Draft",
    applications: campaign.applicationCount ?? 0,
    placements: campaign.placementCount ?? 0,
    clicks: campaign.qualifiedClicks ?? 0,
  };
}

export function mapRelayCommunity(community: RelayCommunity): MarketplaceCommunity {
  return {
    id: community.id,
    ownerId: community.ownerId,
    name: community.name,
    platform: community.platform,
    members: grouped(community.members),
    category: community.category,
    location: community.location,
    verification: community.verificationStatus === "Verified" ? "Verified" : "Pending verification",
  };
}

function buildApplication(remote: RelayApplicationItem, campaign: CampaignRecord, community: MarketplaceCommunity): MarketplaceApplication {
  const cpc = formatMoney(remote.cpc, 2);
  return {
    id: `${remote.campaignId}-${remote.communityId}`,
    campaignId: remote.campaignId,
    communityId: remote.communityId,
    communityOwnerId: remote.communityOwnerId,
    campaign: campaign.name,
    advertiser: campaign.advertiser,
    community: community.name,
    platform: applicationPlatforms.find((item) => item === community.platform) ?? "WhatsApp",
    members: community.members,
    category: community.category,
    location: community.location,
    verification: community.verification,
    pastCampaignClicks: grouped(remote.community?.pastQualifiedClicks ?? 0),
    cpc,
    communityOwnerCpc: formatMoney(roundedCommunityPayout(remote.cpc), 2),
    trackingId: remote.placement?.trackingId,
    status: applicationStatusMap[remote.status] ?? "Pending",
    placementStatus: remote.placement ? placementStatusMap[remote.placement.status] : undefined,
    applied: appliedLabel(remote.createdAt),
    applicationDate: remote.createdAt ?? new Date().toISOString(),
    duration: campaign.duration,
    startDate: campaign.startDate,
    endDate: campaign.endDate,
  };
}

export function mergeRelayApplications(local: MarketplaceApplication[], remote: RelayApplicationItem[], campaigns: CampaignRecord[], communities: MarketplaceCommunity[]): MarketplaceApplication[] {
  const next = [...local];
  const byPair = new Map<string, number>(next.map((application, index) => [`${application.campaignId}:${application.communityId}`, index]));
  remote.forEach((item) => {
    const pair = `${item.campaignId}:${item.communityId}`;
    const index = byPair.get(pair) ?? next.findIndex((application) => getRelayBackendId("application", application.id) === item.id);
    if (index >= 0) {
      const current = next[index];
      next[index] = {
        ...current,
        status: applicationStatusMap[item.status] ?? current.status,
        communityOwnerCpc: formatMoney(roundedCommunityPayout(item.cpc), 2),
        pastCampaignClicks: item.community ? grouped(item.community.pastQualifiedClicks ?? 0) : current.pastCampaignClicks,
        applied: item.createdAt ? appliedLabel(item.createdAt) : current.applied,
        applicationDate: item.createdAt ?? current.applicationDate,
        trackingId: item.placement?.trackingId ?? current.trackingId,
        placementStatus: item.placement ? (placementStatusMap[item.placement.status] ?? current.placementStatus) : current.placementStatus,
      };
      return;
    }
    const campaign = campaigns.find((entry) => entry.id === item.campaignId);
    const community = communities.find((entry) => entry.id === item.communityId);
    if (!campaign || !community) return;
    const created = buildApplication(item, campaign, community);
    next.push(created);
    byPair.set(pair, next.length - 1);
    setRelayBackendId("application", created.id, item.id);
  });
  return next;
}