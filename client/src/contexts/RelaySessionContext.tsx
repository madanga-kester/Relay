import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { getRelayProfile, getRelaySession, relayBackendEnabled, type RelayUser } from "@/lib/relayApi";

type RelaySession = { status: "disabled" | "loading" | "authenticated" | "anonymous"; user: RelayUser | null; refresh: () => Promise<void> };
const SessionContext = createContext<RelaySession>({ status: "disabled", user: null, refresh: async () => undefined });

export function RelaySessionProvider({ children }: { children: React.ReactNode }) {
  const enabled = relayBackendEnabled();
  const [status, setStatus] = useState<RelaySession["status"]>(enabled ? "loading" : "disabled");
  const [user, setUser] = useState<RelayUser | null>(null);
  const refresh = async () => {
    if (!enabled) { setStatus("disabled"); setUser(null); return; }
    setStatus("loading");
    try { setUser(await getRelaySession()); setStatus("authenticated"); } catch { setUser(null); setStatus("anonymous"); }
  };
  useEffect(() => { void refresh(); const listener = () => void refresh(); window.addEventListener("relay:session-changed", listener); return () => window.removeEventListener("relay:session-changed", listener); }, [enabled]);
  const value = useMemo(() => ({ status, user, refresh }), [status, user]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useRelaySession() { return useContext(SessionContext); }

export function RelayRouteGate({ children }: { children: React.ReactNode }) {
function RouteSessionLoading() {
  return (
    <div className="route-session-loading" role="status" aria-live="polite">
      <span className="route-session-loading-spinner" aria-hidden="true" />
      <span className="route-session-loading-text">Loading workspace</span>
    </div>
  );
}

  const [location, setLocation] = useLocation();
  const session = useRelaySession();
  const protectedArea = location === "/admin" || location.startsWith("/admin/") || location === "/campaign-owner" || location.startsWith("/campaign-owner/") || location === "/community-owner" || location.startsWith("/community-owner/") || location.startsWith("/onboarding/");
  const isAdminEntry = location === "/admin" || location === "/admin/login" || location === "/admin/forgot-password";
 
 
   const needsAdvertiserOnboarding =
    session.status === "authenticated" &&
    (
      (session.user?.role === "Advertiser" && (location === "/campaign-owner" || location.startsWith("/campaign-owner/"))) ||
      (session.user?.role === "CommunityOwner" && (location === "/community-owner" || location.startsWith("/community-owner/")))
    );
  const onboardingPath = session.user?.role === "CommunityOwner" ? "/onboarding/community-owner" : "/onboarding/advertiser";
  const advertiserId = session.user?.id ?? "";
  const [onboarding, setOnboarding] = useState<{ userId: string; state: "complete" | "incomplete" | "unknown" } | null>(null);
  const onboardingState = onboarding && onboarding.userId === advertiserId ? onboarding.state : null;
  const onboardingDone = onboardingState === "complete";

  useEffect(() => {
    if (!needsAdvertiserOnboarding || onboardingDone) return;
    let cancelled = false;
    getRelayProfile()
      .then((profile) => {
        if (cancelled) return;
        if (profile.onboardingCompleted) {
          setOnboarding({ userId: advertiserId, state: "complete" });
          return;
        }
        setOnboarding({ userId: advertiserId, state: "incomplete" });
        setLocation(onboardingPath);
      })
      .catch(() => {
        if (!cancelled) setOnboarding({ userId: advertiserId, state: "unknown" });
      });
    return () => {
      cancelled = true;
    };
  }, [needsAdvertiserOnboarding, onboardingDone, advertiserId, onboardingPath, location, setLocation]);
 
  useEffect(() => {
    if (session.status === "loading" || session.status === "disabled" || !protectedArea || isAdminEntry) return;
    if (session.status === "anonymous") { setLocation(location.startsWith("/admin") ? "/admin/login" : "/login"); return; }
    if (location.startsWith("/admin") && session.user?.role !== "Admin") { setLocation(session.user?.role === "CommunityOwner" ? "/community-owner" : "/campaign-owner"); return; }
    if (location.startsWith("/campaign-owner") && session.user?.role !== "Advertiser" && session.user?.role !== "Admin") { setLocation("/community-owner"); return; }
    if (location.startsWith("/community-owner") && session.user?.role !== "CommunityOwner" && session.user?.role !== "Admin") setLocation("/campaign-owner");
  }, [location, protectedArea, isAdminEntry, session.status, session.user, setLocation]);
  if (!session.status || session.status === "loading" && protectedArea && !isAdminEntry) return <RouteSessionLoading />;
  if (session.status === "disabled" || !protectedArea || isAdminEntry) return <>{children}</>;
  if (session.status === "anonymous") return null;
  if (location.startsWith("/admin") && session.user?.role !== "Admin") return null;
  if (location.startsWith("/campaign-owner") && session.user?.role !== "Advertiser" && session.user?.role !== "Admin") return null;
  if (location.startsWith("/community-owner") && session.user?.role !== "CommunityOwner" && session.user?.role !== "Admin") return null;
 
   if (needsAdvertiserOnboarding && !onboardingDone && onboardingState !== "unknown") {
    return <RouteSessionLoading />;
  }
 
  return <>{children}</>;
}
