"use client";

import {
  Trophy,
  AlertCircle,
  CheckCircle2,
  Skull,
  ExternalLink,
  TrendingUp,
  Flame,
  Star,
} from "lucide-react";
import {
  pastCancellations,
  pendingCancellations,
  paymentMethodColors,
  paymentMethodLabels,
  categoryColors,
  type SubscriptionCategory,
} from "@/lib/mockData";
import ServiceAvatar from "@/components/ServiceAvatar";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysSince(isoDate: string): number {
  const then = new Date(isoDate).getTime();
  const now = new Date("2026-04-10").getTime();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// ── Derived data ──────────────────────────────────────────────────────────────

/** Annual savings = sum of each cancellation's monthly equiv × 12 */
const totalAnnualSaved = pastCancellations.reduce(
  (sum, c) => sum + c.amount * 12,
  0
);

const totalMonthlySaved = pastCancellations.reduce(
  (sum, c) => sum + c.amount,
  0
);

// Streak: consecutive months where at least one cancellation happened
// (simplified: count distinct calendar months in past cancellations)
const distinctMonths = new Set(
  pastCancellations.map((c) => c.canceledDate.slice(0, 7))
).size;

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CancelPage() {
  return (
    <div className="flex flex-col min-h-full">

      {/* ── Page Header ── */}
      <header className="px-5 pt-12 pb-4 bg-gray-50">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Trophy size={12} />
          Activity &amp; Archive
        </p>
        <h1 className="text-2xl font-black text-gray-800 leading-tight">
          Your Cancel Hub
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track pending actions and celebrate past wins.
        </p>
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          ZONE A — Hero Metric
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="px-5 pb-4">
        <div className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-3xl p-5 overflow-hidden shadow-lg">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-6 right-6 w-20 h-20 bg-white/5 rounded-full" />
          <div className="absolute top-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />

          <div className="relative z-10">
            {/* Title row */}
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={13} className="text-emerald-200" />
              <p className="text-emerald-100 text-xs font-semibold tracking-wide uppercase">
                Total Saved This Year
              </p>
            </div>

            {/* Big number */}
            <p className="text-white text-4xl font-black tracking-tight leading-none">
              {formatINR(totalAnnualSaved)}
            </p>
            <p className="text-emerald-100 text-xs mt-1.5 font-medium">
              Great job keeping your subscriptions lean. 🎉
            </p>

            {/* Stats row */}
            <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-3 gap-2">
              <div>
                <p className="text-emerald-300 text-[10px] font-semibold uppercase tracking-wide">
                  Monthly
                </p>
                <p className="text-white font-bold text-sm">
                  {formatINR(totalMonthlySaved)}
                </p>
                <p className="text-emerald-200 text-[10px]">freed up/mo</p>
              </div>
              <div>
                <p className="text-emerald-300 text-[10px] font-semibold uppercase tracking-wide">
                  Canceled
                </p>
                <p className="text-white font-bold text-sm">
                  {pastCancellations.length} services
                </p>
                <p className="text-emerald-200 text-[10px]">removed</p>
              </div>
              <div>
                <p className="text-emerald-300 text-[10px] font-semibold uppercase tracking-wide">
                  Active
                </p>
                <p className="text-white font-bold text-sm">
                  {distinctMonths} months
                </p>
                <p className="text-emerald-200 text-[10px]">stay lean streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motivational sub-banner */}
        <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-2.5">
          <div className="flex">
            {[...Array(Math.min(5, pastCancellations.length))].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="text-amber-400 fill-amber-400 -ml-0.5 first:ml-0"
              />
            ))}
          </div>
          <p className="text-xs text-emerald-700 font-medium">
            You&apos;re in the top 10% of budget-conscious users!
          </p>
          <TrendingUp size={13} className="text-emerald-500 ml-auto shrink-0" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ZONE B — Pending Actions (conditional)
      ══════════════════════════════════════════════════════════════════════ */}
      {pendingCancellations.length > 0 && (
        <section className="px-5 pb-4">
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle size={14} className="text-amber-500" />
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              Pending Actions
            </h2>
            <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {pendingCancellations.length} required
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {pendingCancellations.map((pend) => (
              <div
                key={pend.id}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-4"
              >
                {/* Header row */}
                <div className="flex items-start gap-3">
                  <ServiceAvatar
                    name={pend.name}
                    logo={pend.serviceIcon}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-800">
                        {pend.name}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">
                        Action Required
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${paymentMethodColors[pend.paymentMethod]}`}
                      >
                        {paymentMethodLabels[pend.paymentMethod]}
                      </span>
                      {pend.amount > 0 && (
                        <span className="text-xs font-semibold text-gray-500">
                          {formatINR(pend.amount)}/mo
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instruction */}
                <p className="text-xs text-amber-800 mt-3 leading-relaxed bg-amber-100 rounded-xl px-3 py-2.5 border border-amber-200">
                  ⚠️ {pend.actionRequired}
                </p>

                {/* CTA */}
                <button
                  onClick={() => alert("Feature coming soon")}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <ExternalLink size={12} />
                  Open {pend.paymentMethod === "App_Store"
                    ? "OS Settings"
                    : "UPI App"}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ZONE C — The Graveyard (Past Successes)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="px-5 pb-6 flex-1">
        <div className="flex items-center gap-2 mb-2.5">
          <Skull size={14} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
            Past Successes
          </h2>
          <span className="ml-auto text-xs text-gray-400">
            {pastCancellations.length} canceled
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50 overflow-hidden">
          {pastCancellations.map((item, idx) => {
            const days = daysSince(item.canceledDate);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 px-4 py-3.5"
              >
                {/* Grayscale service avatar */}
                <div className="grayscale opacity-40 shrink-0">
                  <ServiceAvatar name={item.name} logo={item.serviceIcon} size="md" />
                </div>

                {/* Service info */}
                <div className="flex-1 min-w-0">
                  {/* Strikethrough name + top-save pill inline */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-sm font-semibold text-gray-400 line-through decoration-gray-300 truncate">
                      {item.name}
                    </p>
                    {idx === 0 && (
                      <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide shrink-0">
                        Top Save
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[10px] text-gray-400">
                      {formatDate(item.canceledDate)}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] text-gray-400">
                      {days}d ago
                    </span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded opacity-60 ${categoryColors[item.category as SubscriptionCategory]}`}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Savings badge */}
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                    Saved {formatINR(item.amount)}/mo
                  </span>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Grand total footer card */}
        <div className="mt-3 flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3.5">
          <div>
            <p className="text-xs text-gray-400 font-medium">
              Total reclaimed
            </p>
            <p className="text-base font-black text-gray-800">
              {formatINR(totalAnnualSaved)}
              <span className="text-xs font-normal text-gray-400"> /yr</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-medium">Monthly relief</p>
            <p className="text-base font-black text-emerald-600">
              +{formatINR(totalMonthlySaved)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
