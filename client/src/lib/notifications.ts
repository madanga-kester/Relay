import { useSyncExternalStore } from "react";
import { relayRequest, type RelayPage } from "@/lib/relayApi";

export type AppNotification = {
  id: string;
  title: string;
  body?: string;
  time: string;
  read: boolean;
  href?: string;
  type?: string;
};

type ApiNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href?: string | null;
  read: boolean;
  createdAt: string;
};

const POLL_MS = 30_000;

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

let items: AppNotification[] = [];
const listeners = new Set<() => void>();
let timer: number | undefined;

function emit(next: AppNotification[]) {
  items = next;
  listeners.forEach((listener) => listener());
}

async function refresh() {
  try {
    const page = await relayRequest<RelayPage<ApiNotification>>("/notifications?page=1&pageSize=100");
    emit(
      page.items.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        time: timeAgo(item.createdAt),
        read: item.read,
        href: item.href ?? undefined,
        type: item.type,
      })),
    );
  } catch (error) {
    console.warn("[notifications] could not load:", error);
    if (items.length > 0) emit([]);
  }
}

function onSessionChanged() {
  void refresh();
}

function onVisible() {
  if (document.visibilityState === "visible") void refresh();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    void refresh();
    timer = window.setInterval(() => void refresh(), POLL_MS);
    window.addEventListener("relay:session-changed", onSessionChanged);
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      window.removeEventListener("relay:session-changed", onSessionChanged);
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
}

function getSnapshot() {
  return items;
}

export function useNotifications(): AppNotification[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function markNotificationRead(id: string) {
  const target = items.find((item) => item.id === id);
  if (!target || target.read) return;
  emit(items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  relayRequest<void>(`/notifications/${id}/read`, { method: "POST" }).catch(() => void refresh());
}

export function markAllNotificationsRead() {
  if (!items.some((item) => !item.read)) return;
  emit(items.map((item) => ({ ...item, read: true })));
  relayRequest<void>("/notifications/read-all", { method: "POST" }).catch(() => void refresh());
}