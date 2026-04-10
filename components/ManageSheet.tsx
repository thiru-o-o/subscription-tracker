"use client";

import { useEffect, useState } from "react";
import {
  X,
  PauseCircle,
  ArrowLeftRight,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  CreditCard,
  CalendarDays,
  Tag,
} from "lucide-react";
import ServiceAvatar from "@/components/ServiceAvatar";
import {
  paymentMethodColors,
  categoryColors,
  type Subscription,
  type PaymentMethod,
} from "@/lib/mockData";

// ── Step config per payment primitive ────────────────────────────────────────

interface StepConfig {
  step1: { message: string; duration: number };
  step2: { message: string; duration: number };
  successMessage: string;
}

const STEP_CONFIGS: Record<PaymentMethod, StepConfig> = {
  UPI_AutoPay: {
    step1: { message: "Locating mandate ID...", duration: 1500 },
    step2: { message: "Simulating redirect to UPI App...", duration: 1500 },
    successMessage: "UPI AutoPay Mandate Revoked.",
  },
  App_Store: {
    step1: { message: "Identifying platform (iOS / Android)...", duration: 1500 },
    step2: { message: "Generating deep-link to settings...", duration: 1500 },
    successMessage: "Please confirm in your OS settings.",
  },
  Card_eMandate: {
    step1: { message: "Connecting to Virtual Card issuer...", duration: 1500 },
    step2: { message: "Blocking future charges...", duration: 1500 },
    successMessage: "Card e-Mandate Blocked.",
  },
  Direct_Web: {
    step1: { message: "Bot navigating to billing portal...", duration: 1500 },
    step2: { message: "Declining retention offers...", duration: 2000 },
    successMessage: "Successfully Canceled via bot.",
  },
};

// ── Display helpers ───────────────────────────────────────────────────────────

const paymentFullLabel: Record<PaymentMethod, string> = {
  UPI_AutoPay: "UPI AutoPay",
  Card_eMandate: "Card e-Mandate",
  App_Store: "App Store",
  Direct_Web: "Direct / Web",
};

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────

type ViewState = "details" | "canceling" | "success";

interface Props {
  subscription: Subscription;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ManageSheet({ subscription: sub, onClose }: Props) {
  const [view, setView] = useState<ViewState>("details");
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [visible, setVisible] = useState(false);

  const config = STEP_CONFIGS[sub.paymentMethod];

  // Slide-in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  // Reset step counter when canceling begins
  useEffect(() => {
    if (view === "canceling") setCancelStep(1);
  }, [view]);

  // Step-advance machine
  useEffect(() => {
    if (view !== "canceling") return;
    if (cancelStep === 1) {
      const t = setTimeout(() => setCancelStep(2), config.step1.duration);
      return () => clearTimeout(t);
    }
    if (cancelStep === 2) {
      const t = setTimeout(() => setView("success"), config.step2.duration);
      return () => clearTimeout(t);
    }
  }, [view, cancelStep, config]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280);
  };

  const currentStepMessage =
    cancelStep === 1 ? config.step1.message : config.step2.message;

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

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>

          {/* ── VIEW: DETAILS ─────────────────────────────────────────────── */}
          {view === "details" && (
            <div className="px-5 pb-8 pt-2">
              {/* Service info */}
              <div className="flex items-center gap-3 mb-5">
                <ServiceAvatar name={sub.name} logo={sub.logo} size="lg" />
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-gray-800 leading-tight truncate">
                    {sub.name}
                  </h2>
                  {sub.description && (
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      {sub.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Key details grid */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Tag size={9} /> Amount
                  </p>
                  {sub.amount > 0 ? (
                    <>
                      <p className="text-base font-black text-gray-800">
                        {formatINR(sub.amount)}
                        <span className="text-xs font-normal text-gray-400">
                          {sub.cycle === "yearly" ? " /yr" : " /mo"}
                        </span>
                      </p>
                      {sub.cycle === "yearly" && (
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          ≈ {formatINR(sub.amount / 12)} /mo
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-base font-black text-emerald-600">
                        Free Trial
                      </p>
                      {sub.paidAmount && (
                        <p className="text-[11px] text-amber-600 font-semibold mt-1 leading-snug">
                          ↗ {formatINR(sub.paidAmount)}/mo
                          <span className="text-gray-400 font-normal block text-[10px]">
                            if you continue after trial
                          </span>
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <CalendarDays size={9} />{" "}
                    {sub.status === "trial" ? "Trial Ends" : "Next Bill"}
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    {formatDate(sub.nextBillingDate)}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5 capitalize">
                    {sub.cycle} · {sub.status}
                  </p>
                </div>

                <div className="col-span-2 bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CreditCard size={9} /> Payment Primitive
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg ${paymentMethodColors[sub.paymentMethod]}`}
                    >
                      {paymentFullLabel[sub.paymentMethod]}
                    </span>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-lg ${categoryColors[sub.category]}`}
                    >
                      {sub.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Secondary actions */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => alert("Feature coming soon")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors active:scale-95"
                >
                  <PauseCircle size={15} />
                  Pause
                </button>
                <button
                  onClick={() => alert("Feature coming soon")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-semibold transition-colors active:scale-95"
                >
                  <ArrowLeftRight size={15} />
                  Switch Plan
                </button>
              </div>

              {/* Destructive cancel */}
              <button
                onClick={() => setView("canceling")}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-sm transition-colors active:scale-[0.98]"
              >
                <AlertTriangle size={15} />
                Cancel Subscription
              </button>
            </div>
          )}

          {/* ── VIEW: CANCELING ───────────────────────────────────────────── */}
          {view === "canceling" && (
            <div className="px-5 pb-10 pt-4 flex flex-col items-center text-center min-h-[300px] justify-center">
              {/* Service mini-header */}
              <div className="flex items-center gap-2 mb-8 self-start w-full">
                <ServiceAvatar name={sub.name} logo={sub.logo} size="sm" />
                <div className="text-left">
                  <p className="text-xs text-gray-400">Canceling</p>
                  <p className="text-sm font-bold text-gray-800">{sub.name}</p>
                </div>
              </div>

              {/* Spinner */}
              <div className="relative mb-5">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <Loader2 size={32} className="text-red-400 animate-spin" />
                </div>
                {/* Step badge */}
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cancelStep}
                </span>
              </div>

              {/* Step message */}
              <p className="text-sm font-semibold text-gray-700 mb-2 px-4 leading-relaxed">
                {currentStepMessage}
              </p>
              <p className="text-xs text-gray-400">
                Step {cancelStep} of 2 · Do not close this sheet
              </p>

              {/* Step progress dots */}
              <div className="flex gap-2 mt-6">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    cancelStep >= 1 ? "w-8 bg-red-400" : "w-4 bg-gray-200"
                  }`}
                />
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    cancelStep >= 2 ? "w-8 bg-red-400" : "w-4 bg-gray-200"
                  }`}
                />
              </div>
            </div>
          )}

          {/* ── VIEW: SUCCESS ─────────────────────────────────────────────── */}
          {view === "success" && (
            <div className="px-5 pb-10 pt-4 flex flex-col items-center text-center min-h-[300px] justify-center">
              {/* Success icon */}
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
                <CheckCircle2 size={42} className="text-green-500" />
              </div>

              {/* Success message */}
              <h3 className="text-lg font-black text-gray-800 mb-1">
                Cancellation Complete
              </h3>
              <p className="text-sm font-semibold text-green-600 mb-2 px-4 leading-relaxed">
                ✅ {config.successMessage}
              </p>
              <p className="text-xs text-gray-400 px-6 leading-relaxed">
                Your{" "}
                <span className="font-semibold text-gray-600">{sub.name}</span>{" "}
                subscription has been flagged for cancellation via{" "}
                <span className="font-semibold text-gray-600">
                  {paymentFullLabel[sub.paymentMethod]}
                </span>
                .
              </p>

              {/* Confirmation detail pill */}
              <div className="mt-4 mb-6 flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-full px-4 py-2">
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${paymentMethodColors[sub.paymentMethod]}`}
                >
                  {paymentFullLabel[sub.paymentMethod]}
                </span>
                <span className="text-xs text-green-700 font-medium">
                  · mandate revoked
                </span>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-bold rounded-2xl transition-colors text-sm shadow-sm shadow-green-200"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
