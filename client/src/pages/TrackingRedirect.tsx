import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { relayBackendEnabled, relayRequest } from "@/lib/relayApi";

export default function TrackingRedirect() {
  const [, params] = useRoute<{ trackingId: string }>("/c/:trackingId");
  const [message, setMessage] = useState("Opening campaign link…");
  useEffect(() => {
    if (!params?.trackingId) { setMessage("This tracking link is incomplete."); return; }
    let cancelled = false;
    (relayBackendEnabled() ? relayRequest<{ destinationUrl?: string; qualification?: string; rejectionReason?: string }>(`/tracking/${encodeURIComponent(params.trackingId)}/click`, { method: "POST" }) : fetch(`/api/tracking/${encodeURIComponent(params.trackingId)}/click`, { method: "POST" }).then(response => response.json()))
      .then(async (response) => { const payload = await response.json() as { destinationUrl?: string; qualified?: boolean; message?: string; error?: string }; if (cancelled) return; if (payload.destinationUrl && /^https?:\/\//i.test(payload.destinationUrl)) { window.location.replace(payload.destinationUrl); return; } setMessage(payload.message ?? (payload.error === "tracking_unavailable" ? "This tracking link is no longer available." : "This campaign link is not currently available.")); })
      .catch(() => { if (!cancelled) setMessage("This campaign link is temporarily unavailable."); });
    return () => { cancelled = true; };
  }, [params?.trackingId]);
  return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f8f7f4", color: "#232321", fontFamily: "Inter, sans-serif" }}><p>{message}</p></main>;
}
