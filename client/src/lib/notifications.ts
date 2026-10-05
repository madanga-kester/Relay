import { useSyncExternalStore } from "react";

export type NotificationItem = {
  id: string;
  title: string;
  body?: string;
  time: string;
  read: boolean;
};

let notifications: NotificationItem[] = [
  {
    id: "demo-1",
    title: "New application received",
    body: "A community owner applied to your campaign.",
    time: "2m ago",
    read: false,
  },
  {
    id: "demo-2",
    title: "Campaign approved",
    body: "Your campaign is now live and visible to community owners.",
    time: "1h ago",
    read: false,
  },
  {
    id: "demo-3",
    title: "Placement completed",
    body: "A scheduled placement has finished running.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "demo-4",
    title: "Weekly summary ready",
    body: "Your weekly performance summary is available.",
    time: "2 days ago",
    read: true,
  },
];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return notifications;
}

export function markNotificationRead(id: string) {
  notifications = notifications.map((item) =>
    item.id === id ? { ...item, read: true } : item
  );
  emit();
}

export function markAllNotificationsRead() {
  notifications = notifications.map((item) => ({ ...item, read: true }));
  emit();
}

export function useNotifications() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}