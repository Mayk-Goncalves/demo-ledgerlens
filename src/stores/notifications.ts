import { create } from "zustand";

export interface AppNotification {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly icon: string;
  readonly timestamp: number;
}

const WELCOME_NOTIFICATION: AppNotification = {
  id: "welcome",
  title: "Welcome to LedgerLens!",
  body: "Track your income and expenses with a clean, receipt-style interface. Add transactions, attach photos, capture your location, and view monthly summaries — all from your device.",
  icon: "hand-wave-outline",
  timestamp: Date.now(),
};

interface NotificationsState {
  readonly notifications: readonly AppNotification[];
  readonly readIds: ReadonlySet<string>;
  readonly unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [WELCOME_NOTIFICATION],
  readIds: new Set<string>(),
  unreadCount: 1,

  markAsRead(id) {
    const { readIds, notifications } = get();
    if (readIds.has(id)) return;
    const next = new Set(readIds);
    next.add(id);
    set({
      readIds: next,
      unreadCount: notifications.filter((n) => !next.has(n.id)).length,
    });
  },

  markAllAsRead() {
    const { notifications } = get();
    set({
      readIds: new Set(notifications.map((n) => n.id)),
      unreadCount: 0,
    });
  },
}));
