"use client";

import { useEffect, useState } from "react";
import { X, ArrowRight, TrendingUp } from "lucide-react";
import ServiceAvatar from "@/components/ServiceAvatar";
import {
  TYPE_STYLES,
  formatINR,
  type Recommendation,
} from "@/lib/recommendations";

interface Props {
  recommendation: Recommendation;
  onClose: () => void;
}

export default function InsightSheet({ recommendation: rec, onClose }: Props) {
  const [visible, setVisible] = useState(false);
  const style = TYPE_STYLES[rec.type];
  const Icon = style.icon;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[90] transition-colors duration-300 ${
          visible ? "bg-black/60" : "bg-transparent"
        }`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[400px] z-[100] transition-transform duration-[280ms] ease-out ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-3xl shadow-2xl">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-200 rounded-full" />
          </div>

          {/* Close */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="px-5 pb-8 pt-2">
            {/* ── Type tag ── */}
            <div
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mb-4 ${style.iconBg}`}
            >
              <Icon size={12} className={style.iconColor} />
              <span
                className={`text-[10px] font-bold uppercase tracking-widest ${style.iconColor}`}
              >
                {style.label}
              </span>
            </div>

            {/* ── Service header ── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                <ServiceAvatar name={rec.sourceName} logo={rec.sourceLogo} size="md" />
                {rec.alternativeName && (
                  <>
                    <ArrowRight size={14} className="text-gray-300 mx-0.5" />
                    <ServiceAvatar
                      name={rec.alternativeName}
                      logo={rec.alternativeLogo ?? ""}
                      size="md"
                    />
                  </>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 leading-none mb-0.5">
                  {rec.sourceName}
                  {rec.alternativeName && (
                    <span className="text-gray-300">
                      {" "}
                      → {rec.alternativeName}
                    </span>
                  )}
                </p>
                <h2 className="text-base font-black text-gray-800 leading-snug">
                  {rec.hook}
                </h2>
              </div>
            </div>

            {/* ── Savings spotlight ── */}
            <div
              className={`rounded-2xl p-4 mb-5 ${style.cardBg} ${style.cardBorder} border`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <TrendingUp size={9} />
                    Potential Annual Saving
                  </p>
                  <p className={`text-3xl font-black ${style.sheetAccent}`}>
                    {formatINR(rec.annualSavings)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ≈ {formatINR(rec.annualSavings / 12)}/mo freed up
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
                >
                  <Icon size={22} className={style.iconColor} />
                </div>
              </div>
            </div>

            {/* ── Context divider ── */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                Why this matters
              </span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            {/* ── Context text ── */}
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              {rec.context}
            </p>

            {/* ── CTA ── */}
            <button
              onClick={() => alert("Feature coming soon")}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-bold text-sm transition-colors active:scale-[0.98] shadow-sm ${style.btnBg}`}
            >
              {rec.actionLabel}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
