import { ChevronDown, CreditCard, LogOut, Moon, Settings, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Link, useLocation } from "wouter";
import { useRelaySession } from "@/contexts/RelaySessionContext";
import { logoutRelayAccount, relayBackendEnabled } from "@/lib/relayApi";

type ProfileMenuProps = {
  variant?: "topbar" | "sidebar";
  sidebarCollapsed?: boolean;
};

export default function ProfileMenu({
  variant = "topbar",
  sidebarCollapsed = false,
}: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const sidebar = variant === "sidebar";
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!logoutOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLogoutOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [logoutOpen]);
  const session = useRelaySession();
  const fullName = session.user?.displayName ?? "Ava Sinclair";
  const firstName = fullName.split(" ")[0];
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "?";
  const roleLabel =
    session.user?.role === "Advertiser"
      ? "Campaign Owner"
      : session.user?.role === "CommunityOwner"
      ? "Community Owner"
      : session.user?.role ?? "Community Owner";
  const billingHref = "/billing/upgrade";
  const confirmLogout = async () => {
    if (relayBackendEnabled()) {
      try {
        await logoutRelayAccount();
      } catch {
        /* session already ended */
      }
    }
    sessionStorage.removeItem("relay_signup_role");
    sessionStorage.removeItem("relay_signup_email");
    sessionStorage.removeItem("relay_signup_name");
        sessionStorage.removeItem("relay-breadcrumb-trail");
    setLogoutOpen(false);
    setOpen(false);
    setLocation("/");
  };

  const dialog = logoutOpen
    ? createPortal(
        <div
          className="logout-dialog-backdrop"
          role="presentation"
          onMouseDown={() => setLogoutOpen(false)}
        >
          <section
            className="logout-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="logout-dialog-close"
              aria-label="Close logout confirmation"
              onClick={() => setLogoutOpen(false)}
            >
              <X size={16} />
            </button>
            <span className="logout-dialog-icon">
              <LogOut size={18} />
            </span>
            <h2 id="logout-title">Log out of relay?</h2>
            <p>You'll return to the public marketplace landing page.</p>
            <div className="logout-dialog-actions">
              <button
                className="logout-cancel"
                onClick={() => setLogoutOpen(false)}
              >
                Cancel
              </button>
              <button className="logout-confirm" onClick={confirmLogout}>
                Log out <LogOut size={14} />
              </button>
            </div>
          </section>
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={wrapRef}
      className={`profile-menu-wrap ${sidebar ? "profile-menu-sidebar" : ""}`}
    >
      <button
        className={sidebar ? "sidebar-profile-trigger" : "topbar-profile"}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="nav-avatar">{initials}</span>
        {sidebar && (
          <span className="sidebar-profile-copy">
            <strong>{fullName}</strong>
            <small>{roleLabel}</small>
          </span>
        )}
        {sidebar && (
          <ChevronDown
            size={15}
            className={open ? "profile-chevron-open" : ""}
          />
        )}
      </button>
      {open && (
        <div
          className={`profile-dropdown ${theme === "dark" ? "profile-dropdown-dark" : ""} ${
            sidebar ? "profile-dropdown-sidebar profile-dropdown-sidebar-logout-only" : ""
          }`}
          role="menu"
          style={
            theme === "dark"
              ? {
                  backgroundColor: "#1e1e1e",
                  border: "1px solid #333333",
                  color: "#ffffff",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                }
              : undefined
          }
        >
          {sidebar ? (
            <>
              <button
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  window.open(billingHref, "_blank", "noopener,noreferrer");
                }}
                style={theme === "dark" ? { color: "#ffffff" } : undefined}
              >
                <CreditCard size={16} />
                <span>Billing</span>
              </button>
              <button
                className="profile-dropdown-item profile-dropdown-logout"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setLogoutOpen(true);
                }}
                style={theme === "dark" ? { color: "#ffffff" } : undefined}
              >
                <LogOut size={16} />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <div className="profile-dropdown-heading">
                <span className="nav-avatar">{initials}</span>
                <div>
                  <strong style={theme === "dark" ? { color: "#ffffff" } : undefined}>
                    {fullName}
                  </strong>
                  <span style={theme === "dark" ? { color: "#a0a0a0" } : undefined}>
                    {session.user?.email ?? "@avaafterhours"}
                  </span>
                </div>
              </div>
              <div
                className="profile-dropdown-divider"
                style={theme === "dark" ? { backgroundColor: "#333333" } : undefined}
              />
              <Link
                href="/profile"
                className="profile-dropdown-item"
                role="menuitem"
                onClick={() => setOpen(false)}
                style={theme === "dark" ? { color: "#ffffff" } : undefined}
              >
                <Settings size={16} />
                <span>Profile settings</span>
              </Link>
              <button
                className="profile-dropdown-item"
                role="menuitem"
                onClick={toggleTheme}
                style={theme === "dark" ? { color: "#ffffff" } : undefined}
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
                <span
                  className={`theme-switch ${
                    theme === "dark" ? "theme-switch-on" : ""
                  }`}
                  aria-hidden="true"
                >
                  <span />
                </span>
              </button>
            </>
          )}
        </div>
      )}
      {dialog}
    </div>
  );
}