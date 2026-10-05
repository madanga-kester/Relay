import { useState } from "react";
import { BellOff } from "lucide-react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useTheme } from "@/contexts/ThemeContext";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
} from "@/lib/notifications";

type Filter = "all" | "unread";

export default function Notifications() {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const notifications = useNotifications();
  const [filter, setFilter] = useState<Filter>("all");

  const unreadCount = notifications.filter((item) => !item.read).length;
  const visible =
    filter === "unread" ? notifications.filter((item) => !item.read) : notifications;

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
  ];

  return (
    <WorkspaceShell active="Notifications" dateLabel="Account notifications">
      <div className="dashboard-body">
        <section className="route-page-heading">
          <div>
            <span className="section-kicker">
              <span className="section-kicker-line section-kicker-line-lilac" /> Account
            </span>
            <h1>Notifications</h1>
            <p>Everything that happened on your account, newest first.</p>
          </div>
        </section>

        <section
          style={{
            backgroundColor: palette.card,
            border: `1px solid ${palette.border}`,
            borderRadius: 16,
            overflow: "hidden",
            color: palette.text,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              flexWrap: "wrap",
              padding: "14px 18px",
              borderBottom: `1px solid ${palette.border}`,
            }}
          >
            <div role="tablist" aria-label="Filter notifications" style={{ display: "flex", gap: 8 }}>
              {tabs.map((tab) => {
                const selected = filter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setFilter(tab.id)}
                    style={{
                      border: "none",
                      borderRadius: 999,
                      padding: "7px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      background: selected ? palette.accent : palette.tile,
                      color: selected ? "#ffffff" : palette.muted,
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                style={{
                  border: "none",
                  background: "none",
                  padding: 0,
                  color: palette.accent,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {visible.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
                padding: "48px 16px",
                color: palette.muted,
                fontSize: 14,
                textAlign: "center",
              }}
            >
              <BellOff size={28} />
              <span>
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </span>
            </div>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 8 }}>
              {visible.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => markNotificationRead(item.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      width: "100%",
                      padding: "14px 14px",
                      border: "none",
                      borderRadius: 12,
                      background: item.read ? "transparent" : palette.unread,
                      color: palette.text,
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        width: 8,
                        height: 8,
                        marginTop: 7,
                        flexShrink: 0,
                        borderRadius: 999,
                        background: item.read ? "transparent" : palette.accent,
                      }}
                    />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <strong
                        style={{
                          display: "block",
                          fontSize: 15,
                          fontWeight: item.read ? 600 : 700,
                        }}
                      >
                        {item.title}
                      </strong>
                      {item.body && (
                        <span
                          style={{
                            display: "block",
                            marginTop: 3,
                            color: palette.muted,
                            fontSize: 14,
                          }}
                        >
                          {item.body}
                        </span>
                      )}
                    </span>
                    <small style={{ flexShrink: 0, color: palette.muted, fontSize: 12 }}>
                      {item.time}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </WorkspaceShell>
  );
}