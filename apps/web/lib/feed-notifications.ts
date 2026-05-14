export type FeedNotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

const KEY = "buddy:feed-notifications";

function seed(): FeedNotificationItem[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      title: "Activity",
      body: "Steve Jobs posted a link in your timeline.",
      read: false,
      createdAt: new Date(now - 42 * 60 * 1000).toISOString(),
    },
    {
      id: "n2",
      title: "Group",
      body: "An admin updated the group Freelancer USA.",
      read: false,
      createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "n3",
      title: "Welcome",
      body: "You are all set — start a post or find friends.",
      read: true,
      createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export function loadNotifications(): FeedNotificationItem[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as FeedNotificationItem[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seed();
  } catch {
    return seed();
  }
}

export function persistNotifications(items: FeedNotificationItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* */
  }
}

export function markAllNotificationsRead(items: FeedNotificationItem[]): FeedNotificationItem[] {
  return items.map((n) => ({ ...n, read: true }));
}
