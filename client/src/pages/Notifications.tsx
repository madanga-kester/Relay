import { useState, type CSSProperties } from "react";
import { Bell, BellOff, CheckCheck, Inbox, Search, X } from "lucide-react";
import { Link } from "wouter";
import WorkspaceShell from "@/components/WorkspaceShell";
import PlatformMark from "@/components/PlatformMark";
import { useTheme } from "@/contexts/ThemeContext";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
} from "@/lib/notifications";

type Filter = "all" | "unread" | "read";

export default function Notifications() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const notifications = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const readCount = notifications.length - unreadCount;
  const readPercent =
    notifications.length === 0 ? 0 : Math.round((readCount / notifications.length) * 100);
  const term = query.trim().toLowerCase();
  const byFilter =
    filter === "unread"
      ? notifications.filter((item) => !item.read)
      : filter === "read"
        ? notifications.filter((item) => item.read)
        : notifications;
  const visible = term
    ? byFilter.filter((item) => `${item.title} ${item.body ?? ""}`.toLowerCase().includes(term))
    : byFilter;
  const newItems = visible.filter((item) => !item.read);
  const earlierItems = visible.filter((item) => item.read);
  const selected = notifications.find((item) => item.id === selectedId) ?? null;

  const palette = {
    card: dark ? "#1e1e1e" : "#ffffff",
    border: dark ? "#333333" : "#e8e2da",
    text: dark ? "#ffffff" : "#16213a",
    muted: dark ? "#a0a0a0" : "#6b7280",
    tile: dark ? "#2a2a2a" : "#f4efe9",
    unread: dark ? "#262626" : "#fdf3ef",
    accent: "#f2552c",
  };

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: `All (${notifications.length})` },
    { id: "unread", label: `Unread (${unreadCount})` },
    { id: "read", label: `Read (${readCount})` },
  ];

  const themeVars = {
    "--ntf-card": palette.card,
    "--ntf-border": palette.border,
    "--ntf-text": palette.text,
    "--ntf-muted": palette.muted,
    "--ntf-tile": palette.tile,
    "--ntf-unread": palette.unread,
    "--ntf-accent": palette.accent,
  } as CSSProperties;

  const renderItem = (item: (typeof notifications)[number]) => (
    <li key={item.id}>
      <button
        type="button"
        onClick={() => {
          markNotificationRead(item.id);
          setSelectedId(item.id);
        }}
        className={`ntf-item${item.read ? "" : " ntf-item-unread"}${selectedId === item.id ? " ntf-item-selected" : ""}`}
      >
        <span aria-hidden="true" className={`ntf-dot${item.read ? "" : " ntf-dot-on"}`} />
        {item.platform && (
          <PlatformMark
            platform={item.platform}
            iconSize={14}
            style={{
              width: 28,
              height: 28,
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: "var(--ntf-tile)",
              color: "var(--ntf-text)",
              fontSize: 12,
              fontWeight: 700,
            }}
          />
        )}
        <span className="ntf-item-main">
          <span className="ntf-item-title">
            <strong style={{ fontWeight: item.read ? 600 : 700 }}>{item.title}</strong>
            {!item.read && <span className="ntf-new-badge">New</span>}
          </span>
          {item.body && <span className="ntf-item-body">{item.body}</span>}
        </span>
        <small className="ntf-item-time">{item.time}</small>
      </button>
    </li>
  );

  return (
    <WorkspaceShell active="Notifications" dateLabel="Account notifications">
      <div className="dashboard-body ntf-page" style={themeVars}>
        <section className="route-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line section-kicker-line-lilac" /> Account
            </span>
            <h1>Notifications</h1>
            <p>Everything that happened on your account, newest first.</p>
          </div>
        </section>

        <section className="ntf-stats" aria-label="Notification summary">
          <div className="ntf-stat">
            <span className="ntf-stat-icon">
              <Bell size={16} />
            </span>
            <span>
              <small>Total</small>
              <strong>{notifications.length}</strong>
            </span>
          </div>
          <div className="ntf-stat">
            <span className="ntf-stat-icon">
              <Inbox size={16} />
            </span>
            <span>
              <small>Unread</small>
              <strong>{unreadCount}</strong>
            </span>
          </div>
          <div className="ntf-stat">
            <span className="ntf-stat-icon">
              <CheckCheck size={16} />
            </span>
            <span>
              <small>Read</small>
              <strong>{readCount}</strong>
            </span>
          </div>
          <div className="ntf-stat">
            <span className="ntf-stat-icon">
              <CheckCheck size={16} />
            </span>
            <span>
              <small>Read rate</small>
              <strong>{readPercent}%</strong>
              <span className="ntf-progress-track">
                <span style={{ width: `${readPercent}%` }} />
              </span>
            </span>
          </div>
        </section>

        <section className="ntf-panel">
          <div className="ntf-panel-main">
            <div className="ntf-toolbar">
              <div role="tablist" aria-label="Filter notifications" className="ntf-tabs">
                {tabs.map((tab) => {
                  const selected = filter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setFilter(tab.id)}
                      className={selected ? "ntf-tab ntf-tab-active" : "ntf-tab"}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
              <label className="ntf-search">
                <Search size={14} />
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search notifications"
                  aria-label="Search notifications"
                />
                {query && (
                  <button
                    type="button"
                    className="ntf-search-clear"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </label>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllNotificationsRead} className="ntf-mark-all">
                  <CheckCheck size={14} /> Mark all as read
                </button>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="ntf-count">
                Showing {visible.length} of {notifications.length}
              </div>
            )}

            {visible.length === 0 ? (
              <div className="ntf-empty">
                {term ? <Search size={28} /> : filter === "unread" ? <Inbox size={28} /> : <BellOff size={28} />}
                <span>
                  {term
                    ? `No notifications match "${query.trim()}"`
                    : filter === "unread"
                      ? "No unread notifications"
                      : filter === "read"
                        ? "No read notifications"
                        : "No notifications yet"}
                </span>
              </div>
            ) : (
              <>
                {newItems.length > 0 && (
                  <div className="ntf-group">
                    <h2 className="ntf-group-title">
                      New <b>{newItems.length}</b>
                    </h2>
                    <ul className="ntf-list">{newItems.map(renderItem)}</ul>
                  </div>
                )}
                {earlierItems.length > 0 && (
                  <div className="ntf-group">
                    <h2 className="ntf-group-title">
                      Earlier <b>{earlierItems.length}</b>
                    </h2>
                    <ul className="ntf-list">{earlierItems.map(renderItem)}</ul>
                  </div>
                )}
              </>
            )}
          </div>

          {selected && (
            <aside className="ntf-detail">
              <div className="ntf-detail-header">
                <h2>{selected.title}</h2>
                <button
                  type="button"
                  className="ntf-detail-close"
                  onClick={() => setSelectedId(null)}
                  aria-label="Close details"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="ntf-detail-meta">
                <span>{selected.time}</span>
                {!selected.read && <span className="ntf-new-badge">New</span>}
              </div>
              <div className="ntf-detail-body">
                {selected.body ? selected.body : "No additional details."}
                {selected.href && (
                  <div style={{ marginTop: 14 }}>
                    <Link href={selected.href} style={{ color: "var(--ntf-accent)", fontWeight: 700 }}>
                      Open
                    </Link>
                  </div>
                )}
              </div>
            </aside>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}