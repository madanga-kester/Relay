import { useMemo, useState } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Filter, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import AdminShell from "./AdminShell";
import AdminState from "./AdminState";
import { AdminNotification, AdminNotificationType, readAdminNotificationState, saveAdminNotificationState, useAdminNotifications } from "./adminNotifications";
import { statusPill } from "./AdminDataPage";
import { markRelayAdminNotificationRead, relayBackendEnabled } from "@/lib/relayApi";

type NotificationFilter = "All" | "Unread" | AdminNotificationType;
const types: NotificationFilter[] = ["All", "Unread", "User registration", "New campaign", "New community", "Pending application", "New placement", "Reported content", "Budget exhaustion", "Failed activity", "Campaign activity"];

export default function AdminNotificationsPage() {
  const { items, read, unread } = useAdminNotifications();
  const [filter, setFilter] = useState<NotificationFilter>("All");
  const filtered = useMemo(() => items.filter((item) => filter === "All" ? true : filter === "Unread" ? !read[item.id] : item.type === filter), [items, filter, read]);
  const markRead = (id: string) => { saveAdminNotificationState({ ...readAdminNotificationState(), [id]: true }); if (relayBackendEnabled()) void markRelayAdminNotificationRead(id).catch(() => undefined); };
  const markUnread = (id: string) => { const next = readAdminNotificationState(); delete next[id]; saveAdminNotificationState(next); };
  const markAllRead = () => saveAdminNotificationState(Object.fromEntries(items.map((item) => [item.id, true])));
  return <AdminShell title="Notifications" subtitle="Important marketplace events that need administrator attention"><section className="admin-notifications-summary"><div><span><Bell size={16} /></span><small>Total notifications</small><strong>{items.length}</strong><em>Derived from live marketplace records</em></div><div><span><ShieldAlert size={16} /></span><small>Unread</small><strong>{unread.length}</strong><em>Items requiring attention</em></div><div><span><CheckCheck size={16} /></span><small>Read</small><strong>{items.length - unread.length}</strong><em>Reviewed notifications</em></div></section><section className="admin-react-panel admin-notifications-panel"><div className="admin-react-panel-heading"><div><h2>Notification inbox</h2><small className="admin-panel-heading-detail">Persisted locally for this Admin workspace</small></div><button className="admin-notifications-mark-all" type="button" onClick={markAllRead} disabled={!unread.length}><CheckCheck size={14} /> Mark all read</button></div><div className="admin-notifications-toolbar"><div className="admin-notifications-filter-label"><Filter size={14} /> Filter by type</div><div className="admin-notifications-filters">{types.map((type) => <button key={type} type="button" className={filter === type ? "active" : ""} onClick={() => setFilter(type)}>{type}</button>)}</div></div><div className="admin-notifications-list">{filtered.length ? filtered.map((item) => <NotificationRow key={item.id} item={item} isRead={Boolean(read[item.id])} onRead={() => markRead(item.id)} onUnread={() => markUnread(item.id)} />) : <AdminState kind={items.length ? "search" : "empty"} title={items.length ? "No notifications match this filter" : "No notifications yet"} description={items.length ? "Try another notification type or switch back to All." : "New registrations, campaigns, applications, placements, and alerts will appear here."} actionLabel="View activity" href="/admin/activity" />}</div></section></AdminShell>;
}

function NotificationRow({ item, isRead, onRead, onUnread }: { item: AdminNotification; isRead: boolean; onRead: () => void; onUnread: () => void }) {
  return <article className={`admin-notification-row${isRead ? " is-read" : " is-unread"}`}><span className="admin-notification-icon"><Bell size={15} /></span><div className="admin-notification-main"><div><strong>{item.title}</strong>{!isRead && <span className="admin-notification-unread">Unread</span>}{statusPill(item.type)}</div><p>{item.description}</p><small>{item.timestamp ? new Date(item.timestamp).toLocaleString() : "Timestamp not recorded in marketplace data"}</small></div><div className="admin-notification-row-actions"><Link href={item.href} onClick={onRead}><ExternalLink size={13} /> Open</Link><button type="button" onClick={isRead ? onUnread : onRead} aria-label={isRead ? "Mark notification unread" : "Mark notification read"}>{isRead ? "Unread" : "Mark read"}</button></div></article>;
}
