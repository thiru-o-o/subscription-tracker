"use client";

import { useState } from "react";
import { Bell, AlertTriangle, Zap, ChevronRight } from "lucide-react";
import {
  subscriptions,
  paymentMethodColors,
  type Subscription,
  type PaymentMethod,
} from "@/lib/mockData";
import ManageSheet from "@/components/ManageSheet";
import ServiceAvatar from "@/components/ServiceAvatar";

// ── Helpers ───────────────────────────────────────────────────────────────────

const TODAY = new Date("2026-04-10");

function daysUntil(isoDate: string): number {
  const diffMs = new Date(isoDate).getTime() - TODAY.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

// ── Derived data ──────────────────────────────────────────────────────────────

const ALERT_WINDOW_DAYS = 5;

const urgentAlerts = subscriptions
  .filter((s) => {
    const days = daysUntil(s.nextBillingDate);
    return s.status === "trial" || (days >= 0 && days <= ALERT_WINDOW_DAYS);
  })
  .sort(
    (a, b) =>
      new Date(a.nextBillingDate).getTime() -
      new Date(b.nextBillingDate).getTime()
  );

const upcomingBills = subscriptions
  .filter((s) => !urgentAlerts.find((a) => a.id === s.id))
  .sort(
    (a, b) =>
      new Date(a.nextBillingDate).getTime() -
      new Date(b.nextBillingDate).getTime()
  );

const activeCount = subscriptions.filter((s) => s.status === "active").length;
const trialCount = subscriptions.filter((s) => s.status === "trial").length;

const monthlySpend = subscriptions
  .filter((s) => s.status === "active")
  .reduce(
    (sum, s) => sum + (s.cycle === "yearly" ? s.amount / 12 : s.amount),
    0
  );

// ── Payment badge ─────────────────────────────────────────────────────────────

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const labels: Record<PaymentMethod, string> = {
    UPI_AutoPay: "UPI",
    Card_eMandate: "e-Mandate",
    App_Store: "App Store",
    Direct_Web: "Direct",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${paymentMethodColors[method]}`}
    >
      {labels[method]}
    </span>
  );
}

// ── Unified SubCard ───────────────────────────────────────────────────────────

type CardVariant = "alert-urgent" | "alert-warning" | "upcoming";

function SubCard({
  sub,
  variant,
  onManage,
}: {
  sub: Subscription;
  variant: CardVariant;
  onManage: () => void;
}) {
  const days = daysUntil(sub.nextBillingDate);
  const isTrial = sub.status === "trial";
  const monthlyEquiv = sub.cycle === "yearly" ? sub.amount / 12 : sub.amount;

  // ── Urgency label ──
  let urgencyLabel = "";
  let urgencyColor = "";
  if (variant !== "upcoming") {
    if (isTrial && days <= 0)       { urgencyLabel = "Trial ends today!";       urgencyColor = "text-red-600"; }
    else if (isTrial && days === 1)  { urgencyLabel = "Trial ends tomorrow";     urgencyColor = "text-red-600"; }
    else if (isTrial)                { urgencyLabel = `Trial ends in ${days}d`;  urgencyColor = "text-amber-600"; }
    else if (days <= 0)              { urgencyLabel = "Billing today!";          urgencyColor = "text-red-600"; }
    else if (days === 1)             { urgencyLabel = "Bills tomorrow";          urgencyColor = "text-red-600"; }
    else                             { urgencyLabel = `Bills in ${days}d`;       urgencyColor = "text-amber-600"; }
  }

  // ── Per-variant styling ──
  const cardStyle = {
    "alert-urgent": "border-red-200 bg-red-50/40",
    "alert-warning": "border-amber-200 bg-amber-50/40",
    upcoming:        "border-gray-100 bg-white shadow-sm",
  }[variant];

  const btnStyle = {
    "alert-urgent": "bg-red-500 hover:bg-red-600 text-white",
    "alert-warning": "bg-amber-500 hover:bg-amber-600 text-white",
    upcoming:        "bg-gray-100 hover:bg-gray-200 text-gray-600",
  }[variant];

  const dateColor =
    variant === "upcoming" && days <= 7
      ? "text-indigo-500"
      : variant === "upcoming"
      ? "text-gray-400"
      : urgencyColor;

  return (
    <div className={`rounded-2xl p-3.5 flex items-center gap-3 border ${cardStyle}`}>
      {/* Logo */}
      <ServiceAvatar name={sub.name} logo={sub.logo} size="md" />

      {/* Centre column */}
      <div className="flex-1 min-w-0">
        {/* Name + cycle + trial pill */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-gray-800 truncate">
            {sub.name}
          </span>
          <span className="text-[11px] text-gray-400 shrink-0">
            · {sub.cycle === "monthly" ? "mo" : "yr"}
          </span>
          {isTrial && (
            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full">
              Trial
            </span>
          )}
        </div>

        {/* Date / urgency line */}
        <p className={`text-xs font-medium mb-2 ${dateColor}`}>
          {variant !== "upcoming"
            ? `${urgencyLabel} · ${formatDate(sub.nextBillingDate)}`
            : formatDate(sub.nextBillingDate)}
        </p>

        {/* Single badge row — payment method only */}
        <PaymentBadge method={sub.paymentMethod} />
      </div>

      {/* Right column */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {/* Amount */}
        {sub.amount > 0 ? (
          <div className="text-right">
            <p className="text-sm font-bold text-gray-800 leading-none">
              {formatINR(sub.amount)}
              <span className="text-[10px] font-normal text-gray-400">
                {sub.cycle === "yearly" ? " /yr" : " /mo"}
              </span>
            </p>
            {sub.cycle === "yearly" && (
              <p className="text-[10px] text-gray-400 mt-0.5">
                ≈ {formatINR(monthlyEquiv)}/mo
              </p>
            )}
          </div>
        ) : (
          <div className="text-right">
            <p className="text-xs font-bold text-emerald-600 leading-none">
              Free Trial
            </p>
            {sub.paidAmount && (
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5 leading-tight">
                ↗ {formatINR(sub.paidAmount)}/mo
                <span className="block text-gray-400 font-normal">after trial</span>
              </p>
            )}
          </div>
        )}

        {/* Manage button */}
        <button
          onClick={onManage}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors active:scale-95 ${btnStyle}`}
        >
          Manage
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);

  return (
    <>
      <div className="flex flex-col min-h-full">

        {/* ── Sticky top zone: header + hero card ── */}
        <div className="sticky top-0 z-20 bg-gray-50 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

          {/* Header */}
          <header className="flex items-center justify-between px-5 pt-12 pb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                Good morning
              </p>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">
                Hi there 👋
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2.5 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500">
                <Bell size={18} />
                {urgentAlerts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                U
              </div>
            </div>
          </header>

          {/* Spend Hero Card */}
          <section className="px-5 pb-5">
          <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-3xl p-5 overflow-hidden shadow-lg">
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-8 -right-2 w-24 h-24 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap size={13} className="text-indigo-200" />
                <p className="text-indigo-200 text-xs font-medium tracking-wide uppercase">
                  Monthly Spend
                </p>
              </div>
              <p className="text-white text-4xl font-black tracking-tight">
                {formatINR(monthlySpend)}
              </p>
              <p className="text-indigo-200 text-xs mt-1">
                Across {activeCount} active subscriptions
              </p>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                <div>
                  <p className="text-indigo-300 text-[11px] font-medium">Yearly Total</p>
                  <p className="text-white font-bold text-sm">{formatINR(monthlySpend * 12)}</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-[11px] font-medium text-right">Free Trials</p>
                  <p className="text-white font-bold text-sm text-right">{trialCount} running</p>
                </div>
                <div>
                  <p className="text-indigo-300 text-[11px] font-medium text-right">Alerts</p>
                  <p className="text-white font-bold text-sm text-right">{urgentAlerts.length} pending</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        </div>{/* end sticky top zone */}

        {/* ── Needs Attention ── */}
        {urgentAlerts.length > 0 && (
          <section className="px-5 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={14} className="text-amber-500" />
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Needs Attention
              </h2>
              <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                {urgentAlerts.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {urgentAlerts.map((sub) => {
                const days = daysUntil(sub.nextBillingDate);
                const variant = days <= 1 ? "alert-urgent" : "alert-warning";
                return (
                  <SubCard
                    key={sub.id}
                    sub={sub}
                    variant={variant}
                    onManage={() => setSelectedSub(sub)}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* ── Upcoming Bills ── */}
        <section className="px-5 pb-6 flex-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Upcoming Bills
            </h2>
            <span className="text-xs text-gray-400">
              {upcomingBills.length} subscriptions
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {upcomingBills.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                All subscriptions need attention right now.
              </p>
            ) : (
              upcomingBills.map((sub) => (
                <SubCard
                  key={sub.id}
                  sub={sub}
                  variant="upcoming"
                  onManage={() => setSelectedSub(sub)}
                />
              ))
            )}
          </div>

          {upcomingBills.length > 0 && (
            <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400 py-2">
              <ChevronRight size={12} />
              <span>Tap any card to manage</span>
            </div>
          )}
        </section>
      </div>

      {/* Manage Sheet */}
      {selectedSub && (
        <ManageSheet
          subscription={selectedSub}
          onClose={() => setSelectedSub(null)}
        />
      )}
    </>
  );
}
