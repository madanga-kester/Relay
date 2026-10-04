import { useMemo, useState } from "react";
import AdminShell from "./AdminShell";
import AdminState from "./AdminState";
import { statusPill, useAdminMarketplace } from "./AdminDataPage";
import type { CampaignActivityEvent, MarketplaceActivityEvent } from "@/data/marketplaceData";

type EventType = "All" | "User registration" | "Community created" | "Campaign created" | MarketplaceActivityEvent | "Application submitted" | "Application approved" | "Application rejected" | "Placement created" | "Placement activated" | "Qualified click recorded";
type FilterValue = "All" | string;
type AuditEvent = {
  id: string;
  event: EventType;
  user: string;
  campaign: string;
  community: string;
  placement: string;
  entity: string;
  related: string;
  timestamp: string;
  detail: string;
  status: string;
};

const lifecycleEvents: CampaignActivityEvent[] = ["Campaign Published", "Campaign Activated", "Campaign Paused", "Campaign Resumed", "Campaign Completed", "Campaign Budget Exhausted"];
const adminEvents: EventType[] = ["User status changed", "Campaign moderated", "Community moderated", "Application reviewed", "Placement status changed", "Settings changed", "Admin profile updated"];
const syntheticEvents: EventType[] = ["User registration", "Community created", "Campaign created", "Application submitted", "Application approved", "Application rejected", "Placement created", "Placement activated", "Qualified click recorded"];

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}
function ownerName(id?: string) {
  if (!id) return "Unknown Community Owner";
  return id === "community-owner-ava" ? "Ava Sinclair" : id.replace(/^community-owner-/, "").replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function eventTone(event: EventType) {
  if (event.includes("rejected")) return "red";
  if (event.includes("submitted") || event.includes("created") || event === "Campaign Published") return "amber";
  if (event.includes("click") || event.includes("activated") || event === "Campaign Activated") return "green";
  return "blue";
}
function eventIcon(event: EventType) {
  if (event.includes("click")) return "↗";
  if (event.includes("Application")) return "◇";
  if (event.includes("Placement")) return "⌁";
  if (event.includes("Community")) return "◉";
  if (event.includes("User")) return "♙";
  return "▣";
}
function eventMatchesDate(timestamp: string, from: string, to: string) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return !from && !to;
  const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY;
  const toTime = to ? new Date(`${to}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY;
  return time >= fromTime && time <= toTime;
}

export default function AdminActivityPage() {
  const snapshot = useAdminMarketplace();
  const [query, setQuery] = useState("");
  const [eventType, setEventType] = useState<FilterValue>("All");
  const [userFilter, setUserFilter] = useState<FilterValue>("All");
  const [campaignFilter, setCampaignFilter] = useState<FilterValue>("All");
  const [communityFilter, setCommunityFilter] = useState<FilterValue>("All");
  const [placementFilter, setPlacementFilter] = useState<FilterValue>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const events = useMemo(() => {
    const result: AuditEvent[] = [];
    const campaignMap = new Map(snapshot.campaigns.map((campaign) => [campaign.id, campaign]));
    const communityMap = new Map(snapshot.communities.map((community) => [community.id, community]));
    const applicationMap = new Map(snapshot.applications.map((application) => [application.id, application]));
    const communityDate = new Map<string, string>();
    snapshot.applications.forEach((application) => {
      const current = communityDate.get(application.communityId);
      if (!current || new Date(application.applicationDate).getTime() < new Date(current).getTime()) communityDate.set(application.communityId, application.applicationDate);
    });
    const push = (event: AuditEvent) => result.push(event);

    snapshot.campaigns.forEach((campaign) => {
      push({ id: `created-campaign-${campaign.id}`, event: "Campaign created", user: campaign.advertiser, campaign: campaign.name, community: "", placement: "", entity: campaign.advertiser, related: campaign.name, timestamp: campaign.startDate, detail: `${campaign.category} · ${campaign.location}`, status: campaign.status });
      push({ id: `registered-advertiser-${campaign.advertiser}`, event: "User registration", user: campaign.advertiser, campaign: campaign.name, community: "", placement: "", entity: campaign.advertiser, related: "Advertiser account", timestamp: campaign.startDate, detail: "Campaign Owner profile registered", status: "Active" });
    });
    snapshot.communities.forEach((community) => {
      const timestamp = communityDate.get(community.id) ?? "2025-06-17T08:00:00.000Z";
      const owner = ownerName(community.ownerId);
      push({ id: `created-community-${community.id}`, event: "Community created", user: owner, campaign: "", community: community.name, placement: "", entity: community.name, related: owner, timestamp, detail: `${community.platform} · ${community.members} members · ${community.category}`, status: community.verification });
      push({ id: `registered-owner-${community.ownerId}-${community.id}`, event: "User registration", user: owner, campaign: "", community: community.name, placement: "", entity: owner, related: community.name, timestamp, detail: "Community Owner profile registered", status: "Active" });
    });
    snapshot.activities.forEach((activity) => {
      const campaign = activity.campaignId ? campaignMap.get(activity.campaignId) : undefined;
      const community = activity.entityType === "community" && activity.entityId ? communityMap.get(activity.entityId) : undefined;
      const user = activity.actor ?? (activity.entityType === "user" ? activity.entityName : undefined) ?? "Campaign Owner";
      push({ id: activity.id, event: activity.event as EventType, user, campaign: activity.campaignName ?? campaign?.name ?? "", community: community?.name ?? (activity.entityType === "community" ? activity.entityName ?? "" : ""), placement: activity.entityType === "placement" ? activity.entityName ?? activity.entityId ?? "" : "", entity: activity.entityName ?? activity.actor ?? "Campaign Owner", related: activity.campaignName ?? activity.entityType ?? "Marketplace record", timestamp: activity.timestamp, detail: `${activity.detail ?? `Lifecycle update for ${activity.campaignName ?? activity.entityName ?? "marketplace record"}`}${activity.actor ? ` · By ${activity.actor}` : ""}`, status: activity.entityType ? "Recorded" : activity.event.replace("Campaign ", "") });
    });
    snapshot.applications.forEach((application) => {
      const user = ownerName(application.communityOwnerId);
      const placement = application.trackingId ?? application.id;
      push({ id: `submitted-${application.id}`, event: "Application submitted", user, campaign: application.campaign, community: application.community, placement, entity: user, related: `${application.community} → ${application.campaign}`, timestamp: application.applicationDate, detail: `${application.platform} · ${application.cpc} CPC`, status: "Pending" });
      if (application.status === "Accepted") {
        push({ id: `approved-${application.id}`, event: "Application approved", user: application.advertiser, campaign: application.campaign, community: application.community, placement, entity: application.advertiser, related: `${application.community} → ${application.campaign}`, timestamp: application.applicationDate, detail: "Accepted by Campaign Owner", status: "Approved" });
        push({ id: `placement-created-${application.id}`, event: "Placement created", user: application.advertiser, campaign: application.campaign, community: application.community, placement, entity: application.community, related: application.campaign, timestamp: application.applicationDate, detail: `Tracking ID ${application.trackingId ?? "pending"}`, status: application.placementStatus ?? "Approved" });
        if (application.placementStatus === "Active") push({ id: `placement-active-${application.id}`, event: "Placement activated", user: user, campaign: application.campaign, community: application.community, placement, entity: application.community, related: application.campaign, timestamp: application.applicationDate, detail: "Community confirmed the advertisement was posted", status: "Active" });
      } else if (application.status === "Rejected") {
        push({ id: `rejected-${application.id}`, event: "Application rejected", user: application.advertiser, campaign: application.campaign, community: application.community, placement, entity: application.advertiser, related: `${application.community} → ${application.campaign}`, timestamp: application.applicationDate, detail: "Application decision recorded", status: "Rejected" });
      }
    });
    snapshot.clicks.filter((click) => click.qualification === "Qualified").forEach((click) => {
      const campaign = campaignMap.get(click.campaignId);
      const community = communityMap.get(click.communityId);
      const application = applicationMap.get(click.placementId);
      push({ id: click.clickId, event: "Qualified click recorded", user: ownerName(click.communityOwnerId), campaign: campaign?.name ?? click.campaignId, community: community?.name ?? application?.community ?? click.communityId, placement: application?.trackingId ?? click.trackingId ?? click.placementId, entity: ownerName(click.communityOwnerId), related: `${campaign?.name ?? click.campaignId} · ${click.trackingId}`, timestamp: click.timestamp, detail: `Qualified CPC activity from ${click.referrer || "direct traffic"}`, status: "Qualified" });
    });
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [snapshot]);

  const options = useMemo(() => ({
    eventTypes: ["All", ...syntheticEvents, ...lifecycleEvents, ...adminEvents] as EventType[],
    users: [...new Set(events.flatMap((item) => item.user ? [item.user] : []))].sort(),
    campaigns: [...new Set(events.flatMap((item) => item.campaign ? [item.campaign] : []))].sort(),
    communities: [...new Set(events.flatMap((item) => item.community ? [item.community] : []))].sort(),
    placements: [...new Set(events.flatMap((item) => item.placement ? [item.placement] : []))].sort(),
  }), [events]);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return events.filter((item) => {
      const searchable = `${item.event} ${item.user} ${item.entity} ${item.related} ${item.campaign} ${item.community} ${item.placement} ${item.detail} ${item.status}`.toLowerCase();
      return (!normalizedQuery || searchable.includes(normalizedQuery)) &&
        (eventType === "All" || item.event === eventType) &&
        (userFilter === "All" || item.user === userFilter) &&
        (campaignFilter === "All" || item.campaign === campaignFilter) &&
        (communityFilter === "All" || item.community === communityFilter) &&
        (placementFilter === "All" || item.placement === placementFilter) &&
        eventMatchesDate(item.timestamp, fromDate, toDate);
    });
  }, [campaignFilter, communityFilter, eventType, events, fromDate, placementFilter, query, toDate, userFilter]);

  const hasFilters = Boolean(query || eventType !== "All" || userFilter !== "All" || campaignFilter !== "All" || communityFilter !== "All" || placementFilter !== "All" || fromDate || toDate);
  const resetFilters = () => { setQuery(""); setEventType("All"); setUserFilter("All"); setCampaignFilter("All"); setCommunityFilter("All"); setPlacementFilter("All"); setFromDate(""); setToDate(""); };

  return <AdminShell title="Activity" subtitle="A marketplace-wide audit trail of users, campaigns, placements, and clicks">
    <section className="admin-activity-summary"><div><span>Total events</span><strong>{events.length}</strong><small>Derived from persisted marketplace activity</small></div><div><span>Lifecycle events</span><strong>{events.filter((item) => lifecycleEvents.includes(item.event as CampaignActivityEvent)).length}</strong><small>Campaign status history</small></div><div><span>Placement events</span><strong>{events.filter((item) => item.event.includes("Placement")).length}</strong><small>Accepted placement movement</small></div><div><span>Qualified clicks</span><strong>{events.filter((item) => item.event === "Qualified click recorded").length}</strong><small>Billable click records</small></div></section>
    <section className="admin-react-panel admin-activity-panel"><div className="admin-activity-toolbar"><div className="admin-react-panel-heading"><div><h2>Marketplace activity</h2><small className="admin-panel-heading-detail">Persisted campaign history plus live marketplace events</small></div></div><div className="admin-activity-filters"><div className="admin-activity-filter-grid"><label className="admin-activity-search"><span>Search activity</span><input aria-label="Search activity" placeholder="Search descriptions or entity names" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span>Event type</span><select aria-label="Filter event type" value={eventType} onChange={(event) => setEventType(event.target.value as EventType)}>{options.eventTypes.map((option) => <option key={option} value={option}>{option === "All" ? "All event types" : option}</option>)}</select></label><label><span>User</span><select aria-label="Filter user" value={userFilter} onChange={(event) => setUserFilter(event.target.value)}><option value="All">All users</option>{options.users.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>Campaign</span><select aria-label="Filter campaign" value={campaignFilter} onChange={(event) => setCampaignFilter(event.target.value)}><option value="All">All campaigns</option>{options.campaigns.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>Community</span><select aria-label="Filter community" value={communityFilter} onChange={(event) => setCommunityFilter(event.target.value)}><option value="All">All communities</option>{options.communities.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>Placement</span><select aria-label="Filter placement" value={placementFilter} onChange={(event) => setPlacementFilter(event.target.value)}><option value="All">All placements</option>{options.placements.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label><span>From date</span><input aria-label="Filter from date" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label><label><span>To date</span><input aria-label="Filter to date" type="date" value={toDate} min={fromDate || undefined} onChange={(event) => setToDate(event.target.value)} /></label><div className="admin-activity-filter-actions"><span>{hasFilters ? `Showing ${visible.length} matching events` : "All activity events"}</span>{hasFilters && <button type="button" className="admin-activity-reset" onClick={resetFilters}>Reset filters</button>}</div></div></div></div><div className="admin-activity-list">{visible.map((item) => <div className="admin-activity-row" key={item.id}><span className={`admin-activity-icon ${eventTone(item.event)}`}>{eventIcon(item.event)}</span><div className="admin-activity-main"><div><strong>{item.event}</strong>{statusPill(item.status)}</div><p><b>{item.entity}</b><span> {item.related}</span></p><small>{item.detail}</small></div><time>{dateLabel(item.timestamp)}</time></div>)}{visible.length === 0 && <AdminState kind={events.length ? "search" : "empty"} title={events.length ? "No activity matches these filters" : "No activity recorded yet"} description={events.length ? "Try clearing a filter or broadening your search and date range." : "Marketplace lifecycle, application, placement, and click events will appear here."} actionLabel={events.length && hasFilters ? "Reset filters" : "View campaigns"} onAction={events.length && hasFilters ? resetFilters : undefined} href={!events.length || !hasFilters ? "/admin/campaigns" : undefined} />}</div><div className="admin-users-table-footer">Showing <strong>{visible.length}</strong> of <strong>{events.length}</strong> activity events</div></section>
  </AdminShell>;
}
