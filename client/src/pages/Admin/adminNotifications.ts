import { useEffect, useState } from "react";
import { communities, getClickEvents, readApplications, readCampaignActivities, readCampaigns } from "@/data/marketplaceData";
import { listRelayAdminNotifications, markRelayAdminNotificationRead, relayBackendEnabled } from "@/lib/relayApi";

export const ADMIN_NOTIFICATION_READ_KEY = "relay-admin-notification-read";
export type AdminNotificationType = "User registration" | "New campaign" | "New community" | "Pending application" | "New placement" | "Reported content" | "Budget exhaustion" | "Failed activity" | "Campaign activity";
export type AdminNotification = { id: string; type: AdminNotificationType; title: string; description: string; timestamp?: string; href: string; attention: boolean };

function ownerLabel(value?: string) { return value ? value.replaceAll("-", " ") : "Unknown marketplace user"; }
export function getAdminNotifications(): AdminNotification[] {
  const campaigns = readCampaigns();
  const applications = readApplications();
  const clicks = getClickEvents();
  const notifications: AdminNotification[] = [
    ...campaigns.map((campaign) => ({ id: `campaign-${campaign.id}`, type: "New campaign" as const, title: "Campaign in marketplace", description: `${campaign.name} · ${campaign.advertiser}`, timestamp: campaign.startDate, href: "/admin/campaigns", attention: campaign.status === "Draft" })),
    ...communities.map((community) => ({ id: `community-${community.id}`, type: "New community" as const, title: community.verification === "Pending verification" ? "Community requires verification" : "Community added", description: `${community.name} · ${community.platform} · ${community.members} members`, href: "/admin/communities", attention: community.verification === "Pending verification" })),
    ...applications.filter((application) => application.status === "Pending").map((application) => ({ id: `pending-application-${application.id}`, type: "Pending application" as const, title: "Application needs review", description: `${application.community} applied to ${application.campaign}`, timestamp: application.applicationDate, href: "/admin/applications", attention: true })),
    ...applications.filter((application) => application.status === "Accepted").map((application) => ({ id: `placement-${application.id}`, type: "New placement" as const, title: "Placement created", description: `${application.community} · ${application.campaign}`, timestamp: application.applicationDate, href: "/admin/placements", attention: true })),
    ...applications.filter((application) => application.status === "Rejected").map((application) => ({ id: `reported-application-${application.id}`, type: "Reported content" as const, title: "Rejected application available for review", description: `${application.community} · ${application.campaign}`, timestamp: application.applicationDate, href: "/admin/moderation", attention: true })),
    ...campaigns.filter((campaign) => campaign.status === "Budget Exhausted").map((campaign) => ({ id: `budget-${campaign.id}`, type: "Budget exhaustion" as const, title: "Campaign budget exhausted", description: `${campaign.name} reached its billable budget limit`, timestamp: campaign.endDate, href: "/admin/campaigns", attention: true })),
    ...clicks.filter((click) => click.qualification === "Rejected").map((click) => ({ id: `failed-click-${click.clickId}`, type: "Failed activity" as const, title: "Click activity rejected", description: `${ownerLabel(click.communityOwnerId)} · ${click.rejectionReason ?? "Qualification failed"}`, timestamp: click.timestamp, href: "/admin/activity", attention: true })),
    ...readCampaignActivities().map((activity) => ({ id: `activity-${activity.id}`, type: "Campaign activity" as const, title: activity.event, description: activity.detail ?? activity.entityName ?? activity.campaignName ?? "Marketplace activity recorded", timestamp: activity.timestamp, href: "/admin/activity", attention: false })),
  ];
  return notifications.sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());
}
export function readAdminNotificationState(): Record<string, boolean> { try { return JSON.parse(window.localStorage.getItem(ADMIN_NOTIFICATION_READ_KEY) ?? "{}") as Record<string, boolean>; } catch { return {}; } }
export function saveAdminNotificationState(state: Record<string, boolean>) { window.localStorage.setItem(ADMIN_NOTIFICATION_READ_KEY, JSON.stringify(state)); window.dispatchEvent(new CustomEvent("ownerboard:notifications-updated")); }
export function useAdminNotifications() {
  const [snapshot, setSnapshot] = useState(() => ({ items: getAdminNotifications(), read: readAdminNotificationState() }));
  useEffect(() => { const refresh = () => setSnapshot({ items: getAdminNotifications(), read: readAdminNotificationState() }); const hydrate = async () => { if (!relayBackendEnabled()) return; try { const result = await listRelayAdminNotifications(); if (result.items.length) { const items = result.items.map((item) => ({ id: item.id, type: item.type as AdminNotificationType, title: item.title, description: item.description, timestamp: item.createdAt, href: item.href, attention: !item.read })); const read = { ...readAdminNotificationState(), ...Object.fromEntries(result.items.filter((item) => item.read).map((item) => [item.id, true])) }; setSnapshot({ items, read }); } } catch { refresh(); } }; const events = ["storage", "ownerboard:applications-updated", "ownerboard:click-events-updated", "ownerboard:activity-updated", "ownerboard:campaigns-updated", "ownerboard:notifications-updated"]; events.forEach((event) => window.addEventListener(event, refresh)); refresh(); void hydrate(); return () => events.forEach((event) => window.removeEventListener(event, refresh)); }, []);
  return { ...snapshot, unread: snapshot.items.filter((item) => !snapshot.read[item.id]) };
}
