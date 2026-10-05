import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, BellOff, X } from "lucide-react";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useNotifications,
} from "@/lib/notifications";

const CLOSE_DELAY_MS = 220;

export default function NotificationBell() {
  const { theme } = useTheme();
  const notifications = useNotifications();
  const onMarkRead = markNotificationRead;
  const onMarkAllRead = markAllNotificationsRead;
  const dark = theme === "dark";
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeTimer = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLElement>(null);

  const unreadCount = notifications.filter((item) => !item.read).length;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  const palette = {
    sheet: dark ? "#1e1e1e" : "#ffffff",
    border: dark ? "#333333" : "#e8e2da",
    text: dark ? "#ffffff" : "#16213a",
    muted: dark ? "#a0a0a0" : "#6b7280",
    tile: dark ? "#2a2a2a" : "#f4efe9",
    unread: dark ? "#262626" : "#fdf3ef",
    accent: "#f2552c",
    shadow: dark ? "0 16px 48px rgba(0, 0, 0, 0.55)" : "0 16px 48px rgba(22, 33, 58, 0.18)",
  };

  const openSheet = () => {
    window.clearTimeout(closeTimer.current);
    setMounted(true);
  };

  const closeSheet = () => {
    setVisible(false);
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => {
      setMounted(false);
      triggerRef.current?.focus();
    }, CLOSE_DELAY_MS);
  };

  useEffect(() => {
    if (!mounted) return;
    const frame = window.requestAnimationFrame(() => {
      setVisible(true);
      closeRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSheet();
    };
    const handlePointerDown = (event: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        closeSheet();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [mounted]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const sheet = mounted
    ? createPortal(
          <section
            ref={panelRef}
            role="dialog"
            aria-labelledby="notifications-title"
            style={{
              position: "fixed",
              right: 16,
              bottom: 16,
              zIndex: 1000,
              width: "min(400px, calc(100vw - 32px))",
              height: "50vh",
              display: "flex",
              flexDirection: "column",
              backgroundColor: palette.sheet,
              color: palette.text,
              border: `1px solid ${palette.border}`,
              borderRadius: 20,
              boxShadow: palette.shadow,
              transform: `translateY(${visible ? "0" : "calc(100% + 16px)"})`,
              transition: `transform ${CLOSE_DELAY_MS}ms ease`,
            }}
          >
            <header
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 18px 12px",
                borderBottom: `1px solid ${palette.border}`,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 id="notifications-title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
                  Notifications
                </h2>
                <p style={{ margin: "2px 0 0", color: palette.muted, fontSize: 13 }}>
                  {unreadCount === 0 ? "You are all caught up" : `${unreadCount} unread`}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
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
              <button
                ref={closeRef}
                type="button"
                aria-label="Close notifications"
                onClick={closeSheet}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  border: "none",
                  borderRadius: 999,
                  background: palette.tile,
                  color: palette.muted,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <X size={16} />
              </button>
            </header>
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 8 }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "36px 16px",
                    color: palette.muted,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  <BellOff size={26} />
                  <span>No notifications yet</span>
                </div>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onMarkRead(item.id)}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          width: "100%",
                          padding: "12px 12px",
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
                            marginTop: 6,
                            flexShrink: 0,
                            borderRadius: 999,
                            background: item.read ? "transparent" : palette.accent,
                          }}
                        />
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <strong
                            style={{
                              display: "block",
                              fontSize: 14,
                              fontWeight: item.read ? 600 : 700,
                            }}
                          >
                            {item.title}
                          </strong>
                          {item.body && (
                            <span
                              style={{
                                display: "block",
                                marginTop: 2,
                                color: palette.muted,
                                fontSize: 13,
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
            </div>

                        <footer
              style={{
                padding: "10px 14px",
                borderTop: `1px solid ${palette.border}`,
              }}
            >
              <Link
                href="/notifications"
                onClick={closeSheet}
                style={{
                  display: "block",
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: palette.tile,
                  color: palette.accent,
                  fontSize: 14,
                  fontWeight: 700,
                  textAlign: "center",
                  textDecoration: "none",
                }}
              >
                View all
              </Link>
            </footer>
          </section>,
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="icon-button"
        aria-label={
          unreadCount > 0
            ? `View notifications, ${unreadCount} unread`
            : "View notifications"
        }
        aria-haspopup="dialog"
        aria-expanded={mounted}
        onClick={openSheet}
        style={{ position: "relative" }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              boxSizing: "border-box",
              padding: "0 5px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              background: palette.accent,
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {badgeLabel}
          </span>
        )}
      </button>
      {sheet}
    </>
  );
}