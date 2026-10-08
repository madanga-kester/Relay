import { useEffect, useState } from "react";
import { getRelayActivity, relayBackendEnabled } from "@/lib/relayApi";

export type ActivityFeedItem = { id: string; event: string; campaignName: string; timestamp: string };
type ActivityFeedState = { loading: boolean; failed: boolean; items: ActivityFeedItem[] };

const empty: ActivityFeedState = { loading: true, failed: false, items: [] };

export function useActivityFeed(): ActivityFeedState {
  const [state, setState] = useState<ActivityFeedState>(empty);

  useEffect(() => {
    if (!relayBackendEnabled()) {
      setState({ ...empty, loading: false });
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const events = await getRelayActivity(50);
        if (cancelled) return;
        setState({
          loading: false,
          failed: false,
          items: events.map((event) => ({
            id: event.id,
            event: event.eventType,
            campaignName: event.detail ? `${event.entityName} - ${event.detail}` : event.entityName,
            timestamp: event.createdAt,
          })),
        });
      } catch {
        if (!cancelled) setState({ loading: false, failed: true, items: [] });
      }
    };
    void load();
    const refresh = () => { void load(); };
    window.addEventListener("focus", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return state;
}