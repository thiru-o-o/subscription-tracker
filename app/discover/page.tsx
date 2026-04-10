"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, ChevronRight } from "lucide-react";
import ServiceAvatar from "@/components/ServiceAvatar";
import {
  allRecommendations,
  totalAnnualSavings,
  TYPE_STYLES,
  formatINR,
  type Recommendation,
} from "@/lib/recommendations";
import InsightSheet from "@/components/InsightSheet";

// ── Segment recommendations by type ──────────────────────────────────────────

const heroRec = allRecommendations[0]; // highest saving = "The One Big Win"

const quickUpgrades = allRecommendations.filter(
  (r) => r.type === "cycle_arbitrage"
);

const smartSwitches = allRecommendations.filter(
  (r) => r.type === "competitor_switch" || r.type === "tier_downgrade"
);

const familyBundles = allRecommendations.filter(
  (r) => r.type === "bundle_family"
);

// ── Mini Carousel Card ────────────────────────────────────────────────────────

function MiniCard({
  rec,
  onOpen,
}: {
  rec: Recommendation;
  onOpen: () => void;
}) {
  const style = TYPE_STYLES[rec.type];
  const Icon = style.icon;

  return (
    <button
      onClick={onOpen}
      className="w-[148px] shrink-0 bg-white rounded-2xl border border-gray-100 p-3.5 flex flex-col gap-2.5 shadow-sm hover:shadow-md active:scale-[0.96] transition-all text-left"
    >
      {/* Top row: type icon + service logo */}
      <div className="flex items-center justify-between w-full">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${style.iconBg}`}
        >
          <Icon size={13} className={style.iconColor} />
        </div>
        <ServiceAvatar
          name={rec.alternativeName ?? rec.sourceName}
          logo={rec.alternativeLogo ?? rec.sourceLogo}
          size="sm"
        />
      </div>

      {/* Service name */}
      <div>
        <p className="text-[11px] font-semibold text-gray-400 leading-none truncate">
          {rec.sourceName}
          {rec.alternativeName && (
            <span className="text-gray-300"> → {rec.alternativeName}</span>
          )}
        </p>
      </div>

      {/* Savings */}
      <div>
        <p className={`text-sm font-black leading-tight ${style.savingsColor}`}>
          Save {formatINR(rec.annualSavings)}
        </p>
        <p className="text-[10px] text-gray-400">/year</p>
      </div>

      {/* Review CTA */}
      <p
        className={`text-[11px] font-bold flex items-center gap-0.5 mt-auto ${style.iconColor}`}
      >
        Review <ArrowRight size={10} />
      </p>
    </button>
  );
}

// ── Carousel Section ──────────────────────────────────────────────────────────

function CarouselSection({
  title,
  items,
  onOpen,
}: {
  title: string;
  items: Recommendation[];
  onOpen: (rec: Recommendation) => void;
}) {
  if (items.length === 0) return null;

  const totalSectionSavings = items.reduce((s, r) => s + r.annualSavings, 0);

  return (
    <section className="pb-2">
      {/* Section header */}
      <div className="flex items-center justify-between px-5 mb-3">
        <div>
          <h2 className="text-sm font-bold text-gray-800">{title}</h2>
          <p className="text-[11px] text-gray-400">
            Up to {formatINR(totalSectionSavings)}/yr potential
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-500 flex items-center gap-0.5">
          {items.length} <ChevronRight size={12} />
        </span>
      </div>

      {/* Horizontal scroll row — scrollbar hidden cross-browser */}
      <div
        className="flex gap-3 overflow-x-auto pb-3 pl-5 pr-5"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Invisible CSS rule for webkit scrollbar via style tag */}
        {items.map((rec) => (
          <MiniCard key={rec.id} rec={rec} onOpen={() => onOpen(rec)} />
        ))}
        {/* Trailing spacer so last card has breathing room */}
        <div className="w-1 shrink-0" />
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);

  const heroStyle = TYPE_STYLES[heroRec.type];
  const HeroIcon = heroStyle.icon;

  return (
    <>
      <div className="flex flex-col min-h-full">
        {/* ── Header ── */}
        <header className="px-5 pt-12 pb-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-indigo-400" />
            <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">
              AI Insights
            </p>
          </div>
          <div className="flex items-end justify-between">
            <h1 className="text-2xl font-black text-gray-800 leading-tight">
              Savings Engine
            </h1>
            <p className="text-xs text-gray-400 mb-0.5">
              {allRecommendations.length} insights
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Up to{" "}
            <span className="font-bold text-emerald-600">
              {formatINR(totalAnnualSavings)}/yr
            </span>{" "}
            in identified savings
          </p>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            HERO — "The One Big Win"
        ══════════════════════════════════════════════════════════════════ */}
        <section className="px-5 pb-5">
          <button
            onClick={() => setSelectedRec(heroRec)}
            className="w-full text-left relative bg-slate-900 rounded-3xl p-5 overflow-hidden shadow-xl active:scale-[0.98] transition-transform"
          >
            {/* Glow orb */}
            <div className="absolute -top-10 -right-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-6 w-32 h-32 bg-violet-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10">
              {/* Label row */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${heroStyle.iconBg}`}
                >
                  <HeroIcon size={11} className={heroStyle.iconColor} />
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${heroStyle.iconColor}`}
                  >
                    {heroStyle.label}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Top Recommendation
                </span>
              </div>

              {/* Service logos */}
              <div className="flex items-center gap-2 mb-3">
                <ServiceAvatar name={heroRec.sourceName} logo={heroRec.sourceLogo} size="lg" />
                {heroRec.alternativeName && (
                  <>
                    <ArrowRight size={14} className="text-slate-500" />
                    <ServiceAvatar
                      name={heroRec.alternativeName}
                      logo={heroRec.alternativeLogo ?? ""}
                      size="lg"
                    />
                  </>
                )}
              </div>

              {/* Hook + sub-hook */}
              <h2 className="text-xl font-black text-white leading-snug mb-1">
                {heroRec.hook}
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                {heroRec.subHook}
              </p>

              {/* Savings + CTA row */}
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Annual Saving
                  </p>
                  <p
                    className={`text-2xl font-black ${heroStyle.savingsColor}`}
                  >
                    {formatINR(heroRec.annualSavings)}
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 rounded-xl px-4 py-2.5">
                  <span className="text-white text-sm font-bold">
                    Review Insight
                  </span>
                  <ArrowRight size={14} className="text-white" />
                </div>
              </div>
            </div>
          </button>
        </section>

        {/* ══════════════════════════════════════════════════════════════════
            CAROUSEL 1 — Quick Upgrades (Annual vs Monthly)
        ══════════════════════════════════════════════════════════════════ */}
        <CarouselSection
          title="Quick Upgrades · Annual vs Monthly"
          items={quickUpgrades}
          onOpen={setSelectedRec}
        />

        {/* ══════════════════════════════════════════════════════════════════
            CAROUSEL 2 — Smart Switches
        ══════════════════════════════════════════════════════════════════ */}
        <CarouselSection
          title="Smart Switches"
          items={smartSwitches}
          onOpen={setSelectedRec}
        />

        {/* ══════════════════════════════════════════════════════════════════
            CAROUSEL 3 — Family Plans
        ══════════════════════════════════════════════════════════════════ */}
        <CarouselSection
          title="Family Plans · Split the Cost"
          items={familyBundles}
          onOpen={setSelectedRec}
        />

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 px-8 pb-6 pt-3 leading-relaxed">
          Savings estimates are based on publicly available pricing. Results may
          vary.
        </p>
      </div>

      {/* InsightSheet overlay */}
      {selectedRec && (
        <InsightSheet
          recommendation={selectedRec}
          onClose={() => setSelectedRec(null)}
        />
      )}
    </>
  );
}
