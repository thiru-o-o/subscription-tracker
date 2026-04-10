export type PaymentMethod =
  | "UPI_AutoPay"
  | "Card_eMandate"
  | "App_Store"
  | "Direct_Web";

export type SubscriptionCategory =
  | "Entertainment"
  | "Productivity"
  | "Health"
  | "Utility";

export type SubscriptionCycle = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "trial";

export interface Subscription {
  id: string;
  name: string;
  logo: string; // emoji fallback logo
  amount: number; // in INR (0 for free trials)
  /** For trials only: the price you'd pay per billing cycle if you keep the subscription */
  paidAmount?: number;
  cycle: SubscriptionCycle;
  status: SubscriptionStatus;
  nextBillingDate: string; // ISO date string
  paymentMethod: PaymentMethod;
  category: SubscriptionCategory;
  trialEndsDate?: string; // only for trial status
  description?: string;
}

// Helper: dates relative to today (2026-04-10)
const d = (offsetDays: number): string => {
  const date = new Date("2026-04-10");
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

export const subscriptions: Subscription[] = [
  {
    id: "sub_001",
    name: "Netflix",
    logo: "🎬",
    amount: 649,
    cycle: "monthly",
    status: "active",
    nextBillingDate: d(2), // 2 days away — triggers alert
    paymentMethod: "Card_eMandate",
    category: "Entertainment",
    description: "HD streaming plan, 2 screens",
  },
  {
    id: "sub_002",
    name: "Spotify",
    logo: "🎵",
    amount: 119,
    cycle: "monthly",
    status: "active",
    nextBillingDate: d(14),
    paymentMethod: "UPI_AutoPay",
    category: "Entertainment",
    description: "Individual music plan",
  },
  {
    id: "sub_003",
    name: "Figma",
    logo: "🎨",
    amount: 4500,
    cycle: "yearly",
    status: "active",
    nextBillingDate: d(60),
    paymentMethod: "Card_eMandate",
    category: "Productivity",
    description: "Professional design & prototyping",
  },
  {
    id: "sub_004",
    name: "Headspace",
    logo: "🧘",
    amount: 0,
    paidAmount: 1299, // ₹1,299/mo after trial (Headspace+ India)
    cycle: "monthly",
    status: "trial",
    nextBillingDate: d(1), // expires tomorrow — urgent alert
    trialEndsDate: d(1),
    paymentMethod: "App_Store",
    category: "Health",
    description: "Guided meditation & sleep",
  },
  {
    id: "sub_005",
    name: "Notion",
    logo: "📝",
    amount: 1600,
    cycle: "yearly",
    status: "active",
    nextBillingDate: d(90),
    paymentMethod: "UPI_AutoPay",
    category: "Productivity",
    description: "Notes, wikis & project management",
  },
  {
    id: "sub_006",
    name: "Amazon Prime",
    logo: "📦",
    amount: 1499,
    cycle: "yearly",
    status: "active",
    nextBillingDate: d(3), // exactly 3 days — alert boundary
    paymentMethod: "Card_eMandate",
    category: "Entertainment",
    description: "Video, music & free delivery",
  },
  {
    id: "sub_007",
    name: "Duolingo Plus",
    logo: "🦉",
    amount: 0,
    paidAmount: 750, // ₹750/mo after trial (Duolingo Super India)
    cycle: "monthly",
    status: "trial",
    nextBillingDate: d(7),
    trialEndsDate: d(7),
    paymentMethod: "App_Store",
    category: "Productivity",
    description: "Ad-free language learning",
  },
  {
    id: "sub_008",
    name: "iCloud+",
    logo: "☁️",
    amount: 75,
    cycle: "monthly",
    status: "active",
    nextBillingDate: d(20),
    paymentMethod: "App_Store",
    category: "Utility",
    description: "50 GB iCloud storage",
  },
  {
    id: "sub_009",
    name: "GitHub Copilot",
    logo: "🤖",
    amount: 833,
    cycle: "monthly",
    status: "active",
    nextBillingDate: d(11),
    paymentMethod: "Direct_Web",
    category: "Productivity",
    description: "AI pair programmer",
  },
  {
    id: "sub_010",
    name: "YouTube Premium",
    logo: "▶️",
    amount: 189,
    cycle: "monthly",
    status: "active",
    nextBillingDate: d(5),
    paymentMethod: "UPI_AutoPay",
    category: "Entertainment",
    description: "Ad-free videos & YouTube Music",
  },
  {
    id: "sub_011",
    name: "Cult.fit",
    logo: "💪",
    amount: 0,
    paidAmount: 999, // ₹999/mo after trial (Cult.fit Live plan)
    cycle: "monthly",
    status: "trial",
    nextBillingDate: d(2), // 2 days — alert
    trialEndsDate: d(2),
    paymentMethod: "Direct_Web",
    category: "Health",
    description: "Live fitness & workout classes",
  },
  {
    id: "sub_012",
    name: "Dropbox Plus",
    logo: "📁",
    amount: 8000,
    cycle: "yearly",
    status: "active",
    nextBillingDate: d(180),
    paymentMethod: "Card_eMandate",
    category: "Utility",
    description: "2 TB cloud storage & backup",
  },
];

// ── Derived helpers ──────────────────────────────────────────────────────────

/** Subscriptions with billing/trial ending within the next N days */
export function getUpcomingAlerts(withinDays = 3): Subscription[] {
  const today = new Date("2026-04-10");
  return subscriptions.filter((s) => {
    const target = new Date(s.nextBillingDate);
    const diffMs = target.getTime() - today.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= withinDays;
  });
}

/** Monthly spend equivalent (yearly amounts divided by 12) */
export function getMonthlySpend(): number {
  return subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => {
      const monthly = s.cycle === "yearly" ? s.amount / 12 : s.amount;
      return sum + monthly;
    }, 0);
}

/** Spend grouped by category */
export function getSpendByCategory(): Record<SubscriptionCategory, number> {
  const result: Record<SubscriptionCategory, number> = {
    Entertainment: 0,
    Productivity: 0,
    Health: 0,
    Utility: 0,
  };
  subscriptions
    .filter((s) => s.status === "active")
    .forEach((s) => {
      const monthly = s.cycle === "yearly" ? s.amount / 12 : s.amount;
      result[s.category] += monthly;
    });
  return result;
}

/** Payment method labels for display */
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  UPI_AutoPay: "UPI AutoPay",
  Card_eMandate: "Card e-Mandate",
  App_Store: "App Store",
  Direct_Web: "Direct / Web",
};

/** Category color mapping (Tailwind classes) */
export const categoryColors: Record<SubscriptionCategory, string> = {
  Entertainment: "bg-purple-100 text-purple-700",
  Productivity: "bg-blue-100 text-blue-700",
  Health: "bg-green-100 text-green-700",
  Utility: "bg-orange-100 text-orange-700",
};

/** Payment method badge colors (Tailwind classes) */
export const paymentMethodColors: Record<PaymentMethod, string> = {
  UPI_AutoPay: "bg-emerald-100 text-emerald-700",
  Card_eMandate: "bg-sky-100 text-sky-700",
  App_Store: "bg-pink-100 text-pink-700",
  Direct_Web: "bg-amber-100 text-amber-700",
};

// ── Past Cancellations ("The Graveyard") ─────────────────────────────────────

export interface PastCancellation {
  id: string;
  name: string;
  serviceIcon: string; // emoji
  /** Monthly equivalent saved (yearly amounts already divided by 12) */
  amount: number;
  canceledDate: string; // ISO date string
  paymentMethod: PaymentMethod;
  category: SubscriptionCategory;
}

// Helper: past dates relative to today (2026-04-10)
const pd = (offsetDays: number): string => {
  const date = new Date("2026-04-10");
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().split("T")[0];
};

export const pastCancellations: PastCancellation[] = [
  {
    id: "past_001",
    name: "Adobe Creative Cloud",
    serviceIcon: "🎭",
    amount: 1675, // ₹20,100/yr ÷ 12
    canceledDate: pd(8),
    paymentMethod: "Card_eMandate",
    category: "Productivity",
  },
  {
    id: "past_002",
    name: "LinkedIn Premium",
    serviceIcon: "💼",
    amount: 2599,
    canceledDate: pd(22),
    paymentMethod: "Card_eMandate",
    category: "Productivity",
  },
  {
    id: "past_003",
    name: "Disney+ Hotstar",
    serviceIcon: "⭐",
    amount: 299,
    canceledDate: pd(35),
    paymentMethod: "UPI_AutoPay",
    category: "Entertainment",
  },
  {
    id: "past_004",
    name: "Calm",
    serviceIcon: "🌿",
    amount: 1417, // ₹17,000/yr ÷ 12
    canceledDate: pd(51),
    paymentMethod: "App_Store",
    category: "Health",
  },
  {
    id: "past_005",
    name: "Grammarly Premium",
    serviceIcon: "✍️",
    amount: 833, // ₹10,000/yr ÷ 12
    canceledDate: pd(67),
    paymentMethod: "Card_eMandate",
    category: "Productivity",
  },
  {
    id: "past_006",
    name: "Zoom Pro",
    serviceIcon: "📹",
    amount: 1250,
    canceledDate: pd(89),
    paymentMethod: "Direct_Web",
    category: "Utility",
  },
];

// ── Pending Cancellations (awaiting user confirmation in OS / bank) ───────────

export interface PendingCancellation {
  id: string;
  name: string;
  serviceIcon: string;
  amount: number;
  paymentMethod: PaymentMethod;
  /** What the user still needs to do */
  actionRequired: string;
}

export const pendingCancellations: PendingCancellation[] = [
  {
    id: "pend_001",
    name: "Headspace",
    serviceIcon: "🧘",
    amount: 0,
    paymentMethod: "App_Store",
    actionRequired:
      "Confirm cancellation in your iPhone Settings → Subscriptions.",
  },
  {
    id: "pend_002",
    name: "YouTube Premium",
    serviceIcon: "▶️",
    amount: 189,
    paymentMethod: "UPI_AutoPay",
    actionRequired:
      "Open GPay or PhonePe and revoke the active AutoPay mandate.",
  },
];
