import {
  CalendarClock,
  TrendingDown,
  Zap,
  Users,
  type LucideIcon,
} from "lucide-react";
import { subscriptions, type Subscription } from "@/lib/mockData";

// ── Shared types ──────────────────────────────────────────────────────────────

export type RecommendationType =
  | "cycle_arbitrage"
  | "tier_downgrade"
  | "competitor_switch"
  | "bundle_family";

export interface Recommendation {
  id: string;
  type: RecommendationType;
  sourceName: string;
  sourceLogo: string;
  /** One-line hook shown on cards */
  hook: string;
  /** Short sub-hook shown on the hero card */
  subHook: string;
  /** Dense explanatory paragraph shown in InsightSheet */
  context: string;
  annualSavings: number;
  actionLabel: string;
  alternativeName?: string;
  alternativeLogo?: string;
}

// ── Visual config ─────────────────────────────────────────────────────────────

export interface TypeStyle {
  icon: LucideIcon;
  label: string;
  iconBg: string;
  iconColor: string;
  savingsColor: string;
  cardBg: string;
  cardBorder: string;
  btnBg: string;
  sheetAccent: string; // for the InsightSheet savings number
}

export const TYPE_STYLES: Record<RecommendationType, TypeStyle> = {
  cycle_arbitrage: {
    icon: CalendarClock,
    label: "Annual Switch",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    savingsColor: "text-emerald-600",
    cardBg: "bg-emerald-50",
    cardBorder: "border-emerald-100",
    btnBg: "bg-emerald-500 hover:bg-emerald-600",
    sheetAccent: "text-emerald-600",
  },
  tier_downgrade: {
    icon: TrendingDown,
    label: "Tier Downgrade",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    savingsColor: "text-sky-600",
    cardBg: "bg-sky-50",
    cardBorder: "border-sky-100",
    btnBg: "bg-sky-500 hover:bg-sky-600",
    sheetAccent: "text-sky-600",
  },
  competitor_switch: {
    icon: Zap,
    label: "Better Deal",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    savingsColor: "text-violet-600",
    cardBg: "bg-violet-50",
    cardBorder: "border-violet-100",
    btnBg: "bg-violet-500 hover:bg-violet-600",
    sheetAccent: "text-violet-600",
  },
  bundle_family: {
    icon: Users,
    label: "Family Plan",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    savingsColor: "text-amber-600",
    cardBg: "bg-amber-50",
    cardBorder: "border-amber-100",
    btnBg: "bg-amber-500 hover:bg-amber-600",
    sheetAccent: "text-amber-600",
  },
};

// ── Formatter ─────────────────────────────────────────────────────────────────

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

// ── Engine constants ──────────────────────────────────────────────────────────

const ARBITRAGE_DISCOUNT = 0.17;
const ARBITRAGE_MIN_SAVE = 300;
const DOWNGRADE_FACTOR = 0.23;
const DOWNGRADE_MIN_MONTHLY = 300;

const FAMILY_PLANS: Record<string, { monthly: number; members: number }> = {
  Netflix: { monthly: 999, members: 4 },
  Spotify: { monthly: 179, members: 6 },
  "YouTube Premium": { monthly: 289, members: 6 },
};

// ── Engine ────────────────────────────────────────────────────────────────────

export function generateRecommendations(
  subs: Subscription[]
): Recommendation[] {
  const active = subs.filter((s) => s.status === "active");
  const recs: Recommendation[] = [];

  // ── 1. Cycle Arbitrage ────────────────────────────────────────────────────
  active
    .filter((s) => s.cycle === "monthly" && s.amount > 0)
    .forEach((s) => {
      const annualSavings = Math.round(s.amount * 12 * ARBITRAGE_DISCOUNT);
      if (annualSavings < ARBITRAGE_MIN_SAVE) return;
      const yearlyPrice = Math.round(s.amount * 12 * (1 - ARBITRAGE_DISCOUNT));
      recs.push({
        id: `arb_${s.id}`,
        type: "cycle_arbitrage",
        sourceName: s.name,
        sourceLogo: s.logo,
        hook: `Save ${formatINR(annualSavings)}/yr on ${s.name}`,
        subHook: `Switch to annual and pay ${formatINR(yearlyPrice)}/yr instead.`,
        context: `You currently pay ${formatINR(s.amount)}/mo (${formatINR(
          s.amount * 12
        )}/yr on a rolling basis). Committing to an annual plan typically saves around ${Math.round(
          ARBITRAGE_DISCOUNT * 100
        )}% — locking in ${formatINR(yearlyPrice)}/yr and freeing up ${formatINR(
          annualSavings
        )} annually. No change to features or limits.`,
        annualSavings,
        actionLabel: "Switch to Annual",
      });
    });

  // ── 2. Tier Downgrade ─────────────────────────────────────────────────────
  active
    .filter(
      (s) =>
        s.category === "Entertainment" &&
        s.cycle === "monthly" &&
        s.amount >= DOWNGRADE_MIN_MONTHLY
    )
    .forEach((s) => {
      const downgradedMonthly = Math.round(s.amount * DOWNGRADE_FACTOR);
      const annualSavings = Math.round((s.amount - downgradedMonthly) * 12);
      recs.push({
        id: `down_${s.id}`,
        type: "tier_downgrade",
        sourceName: s.name,
        sourceLogo: s.logo,
        hook: `Cut ${s.name} to ${formatINR(downgradedMonthly)}/mo`,
        subHook: `Ad-supported Basic tier — same content, lower cost.`,
        context: `You're on the ${formatINR(
          s.amount
        )}/mo plan. The ad-supported Basic tier offers the same content library at ~${formatINR(
          downgradedMonthly
        )}/mo — a 77% reduction. Ads typically appear at the start of episodes (under 4 mins/hr). Annual saving: ${formatINR(
          annualSavings
        )}.`,
        annualSavings,
        actionLabel: "Review Plan",
      });
    });

  // ── 3a. Spotify → YouTube Music (if YouTube Premium is owned) ─────────────
  const spotify = active.find((s) => s.name === "Spotify");
  const ytPremium = active.find((s) => s.name === "YouTube Premium");
  if (spotify && ytPremium) {
    const annualSavings = spotify.amount * 12;
    recs.push({
      id: "comp_spotify_ytm",
      type: "competitor_switch",
      sourceName: spotify.name,
      sourceLogo: spotify.logo,
      hook: `Drop Spotify, save ${formatINR(annualSavings)}/yr`,
      subHook: "You already own YouTube Music via YouTube Premium.",
      context: `YouTube Music is included at no extra cost in your YouTube Premium subscription (${formatINR(
        ytPremium.amount
      )}/mo). It offers an identical catalog, offline downloads, and background play. Canceling Spotify saves you ${formatINR(
        annualSavings
      )}/yr — with zero compromise on your listening experience.`,
      annualSavings,
      actionLabel: "Switch Provider",
      alternativeName: "YouTube Music",
      alternativeLogo: "▶️",
    });
  }

  // ── 3b. Dropbox Plus → Google One 200 GB ──────────────────────────────────
  const dropbox = active.find((s) => s.name === "Dropbox Plus");
  if (dropbox) {
    const googleOneMonthly = 130;
    const annualSavings = dropbox.amount - googleOneMonthly * 12;
    if (annualSavings > 0) {
      recs.push({
        id: "comp_dropbox_google",
        type: "competitor_switch",
        sourceName: dropbox.name,
        sourceLogo: dropbox.logo,
        hook: `Save ${formatINR(annualSavings)}/yr on cloud storage`,
        subHook: `Google One 200 GB — same space, integrated with Android.`,
        context: `Dropbox Plus costs ${formatINR(
          dropbox.amount
        )}/yr. Google One 200 GB provides identical storage capacity at ${formatINR(
          googleOneMonthly
        )}/mo (${formatINR(
          googleOneMonthly * 12
        )}/yr), and is natively integrated with Google Photos, Drive, and Gmail. Annual saving: ${formatINR(
          annualSavings
        )}.`,
        annualSavings,
        actionLabel: "Switch Provider",
        alternativeName: "Google One 200 GB",
        alternativeLogo: "🔵",
      });
    }
  }

  // ── 4. Family / Bundle ────────────────────────────────────────────────────
  Object.entries(FAMILY_PLANS).forEach(([name, plan]) => {
    const sub = active.find((s) => s.name === name);
    if (!sub) return;
    const userShare = Math.round(plan.monthly / plan.members);
    const annualSavings = Math.round((sub.amount - userShare) * 12);
    if (annualSavings <= 0) return;
    recs.push({
      id: `bundle_${sub.id}`,
      type: "bundle_family",
      sourceName: sub.name,
      sourceLogo: sub.logo,
      hook: `Pay ${formatINR(userShare)}/mo for ${name}`,
      subHook: `Split a Family Plan ${plan.members} ways with friends.`,
      context: `The ${name} Family Plan is ${formatINR(
        plan.monthly
      )}/mo for up to ${
        plan.members
      } users. Divided equally, your share is ~${formatINR(
        userShare
      )}/mo — compared to ${formatINR(
        sub.amount
      )}/mo today. If you coordinate with ${
        plan.members - 1
      } friends or family members, you'd save ${formatINR(annualSavings)}/yr.`,
      annualSavings,
      actionLabel: "Explore Bundle",
    });
  });

  return recs.sort((a, b) => b.annualSavings - a.annualSavings);
}

// ── Precomputed exports ───────────────────────────────────────────────────────

export const allRecommendations = generateRecommendations(subscriptions);

export const totalAnnualSavings = allRecommendations.reduce(
  (s, r) => s + r.annualSavings,
  0
);
