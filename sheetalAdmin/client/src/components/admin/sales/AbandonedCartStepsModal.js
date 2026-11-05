"use client";

import { useState, useEffect } from "react";
import {
  X,
  Clock3,
  Mail,
  MessageSquareText,
  TicketPercent,
  ShieldCheck,
  ShoppingCart,
  AlertCircle,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Loader2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAbandonedCartSettings,
  updateAbandonedCartSettings,
} from "@/services/salesService";

const DEFAULT_STEPS = [
  {
    step: 1,
    stage: "first",
    label: "Step 1",
    title: "1 Minute Reminder",
    modalTitle: "1 Minute Reminder",
    description:
      "A quick nudge while the customer is still actively browsing. Lightest-touch message in the sequence.",
    channels: ["email", "whatsapp"],
    timing: "After 1 minute",
    delayMinutes: 1,
    tone: "Soft Reminder",
    accent: "rose",
  },
  {
    step: 2,
    stage: "second",
    label: "Step 2",
    title: "3 Minute Reminder",
    modalTitle: "3 Minute Reminder",
    description:
      "A stronger re-engagement message that brings the cart back to the top of the customer's mind.",
    channels: ["email", "whatsapp"],
    timing: "After 3 minutes",
    delayMinutes: 3,
    tone: "Warm Follow-up",
    accent: "amber",
  },
  {
    step: 3,
    stage: "third",
    label: "Step 3",
    title: "5 Minute Reminder",
    modalTitle: "5 Minute Reminder",
    description:
      "The primary recovery step. A coupon is attached here and sent with the email CTA — it auto-applies when the customer returns to checkout.",
    channels: ["email", "whatsapp", "sms"],
    timing: "After 5 minutes",
    delayMinutes: 5,
    tone: "Coupon Offer",
    accent: "emerald",
    coupon: true,
  },
  {
    step: 4,
    stage: "final",
    label: "Step 4",
    title: "10 Minute Final Reminder",
    modalTitle: "10 Minute Final Reminder",
    description:
      "Last message before the cart is considered exhausted. Should feel like a closing opportunity, not pressure.",
    channels: ["email"],
    timing: "After 10 minutes",
    delayMinutes: 10,
    tone: "Last Chance",
    accent: "slate",
  },
];

const ACCENT = {
  rose: {
    card: "border-rose-100 bg-white",
    icon: "bg-rose-50 border-rose-200 text-rose-500",
    badge: "bg-rose-50 border-rose-200 text-rose-600",
    connector: "from-rose-200",
  },
  amber: {
    card: "border-amber-100 bg-white",
    icon: "bg-amber-50 border-amber-200 text-amber-600",
    badge: "bg-amber-50 border-amber-200 text-amber-600",
    connector: "from-amber-200",
  },
  emerald: {
    card: "border-emerald-200 bg-emerald-50/40",
    icon: "bg-emerald-50 border-emerald-200 text-emerald-600",
    badge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    connector: "from-emerald-200",
  },
  slate: {
    card: "border-slate-200 bg-white",
    icon: "bg-slate-50 border-slate-200 text-slate-500",
    badge: "bg-slate-50 border-slate-200 text-slate-600",
    connector: "from-slate-200",
  },
};

const getCouponStatus = (coupon) => {
  if (!coupon) return null;
  const isExpired = coupon.endDate
    ? new Date(coupon.endDate).getTime() < Date.now()
    : false;
  if (isExpired) return "Expired";
  return coupon.isActive ? "Live" : "Paused";
};

const formatMinutesHuman = (mins) => {
  const m = Number(mins) || 0;
  if (m <= 0) return "immediately";
  if (m < 60) return `${m} min${m !== 1 ? "s" : ""}`;
  const hours = Math.floor(m / 60);
  const remMins = m % 60;
  if (hours < 24) {
    return remMins > 0 ? `${hours}h ${remMins}m` : `${hours} hour${hours !== 1 ? "s" : ""}`;
  }
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h` : `${days} day${days !== 1 ? "s" : ""}`;
};

export default function AbandonedCartStepsModal({
  isOpen,
  onClose,
  coupons = [],
  initialEditMode = false,
  onSaved,
}) {
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [inactivityMinutes, setInactivityMinutes] = useState(20);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [couponCode, setCouponCode] = useState("SAVE10");
  const [steps, setSteps] = useState(DEFAULT_STEPS);

  useEffect(() => {
    if (isOpen) {
      setIsEditing(initialEditMode);
      setLoading(true);
      getAbandonedCartSettings()
        .then((res) => {
          if (res?.success && res.data) {
            setInactivityMinutes(res.data.inactivityMinutes ?? 20);
            setDiscountPercent(res.data.discountPercent ?? 10);
            setCouponCode(res.data.couponCode || "SAVE10");
            if (Array.isArray(res.data.schedule) && res.data.schedule.length > 0) {
              setSteps(res.data.schedule);
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, initialEditMode]);

  if (!isOpen) return null;

  const abandonedCoupon =
    coupons.find((c) => c.isAbandonedCartCoupon && c.isActive) ||
    coupons.find((c) => c.isAbandonedCartCoupon) ||
    null;

  const handleStepDelayChange = (index, value) => {
    const delay = Math.max(1, parseInt(value) || 1);
    const human = formatMinutesHuman(delay);
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        delayMinutes: delay,
        timing: `After ${human}`,
        title: `${human} Reminder`,
        modalTitle: `${human} Reminder`,
      };
      return copy;
    });
  };

  const handleToggleChannel = (stepIndex, channel) => {
    setSteps((prev) => {
      const copy = [...prev];
      const current = Array.isArray(copy[stepIndex].channels)
        ? [...copy[stepIndex].channels]
        : [];
      if (current.includes(channel)) {
        if (current.length === 1) {
          toast.error("At least one channel is required");
          return prev;
        }
        copy[stepIndex] = {
          ...copy[stepIndex],
          channels: current.filter((c) => c !== channel),
        };
      } else {
        copy[stepIndex] = {
          ...copy[stepIndex],
          channels: [...current, channel],
        };
      }
      return copy;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        inactivityMinutes: Number(inactivityMinutes),
        discountPercent: Number(discountPercent),
        couponCode: couponCode.trim().toUpperCase(),
        schedule: steps,
      };

      const res = await updateAbandonedCartSettings(payload);
      if (res?.success) {
        toast.success("Abandoned cart settings updated successfully!");
        setIsEditing(false);
        if (onSaved) onSaved(res.data);
      } else {
        toast.error(res?.message || "Failed to save settings");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setInactivityMinutes(20);
    setDiscountPercent(10);
    setCouponCode("SAVE10");
    setSteps(DEFAULT_STEPS);
    toast.success("Workflow reset to defaults (click Save to apply)");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 sm:p-6 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400">
                Abandoned Cart Recovery
              </p>
              <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">
                {isEditing ? "Configure Reminder Workflow" : "Reminder Workflow"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {isEditing
                  ? "Customize inactivity thresholds, coupon offers, and 4-step sequence timings."
                  : "4-step automated sequence across Email, WhatsApp, and SMS."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition shadow-sm ${
                  isEditing
                    ? "border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <SettingsIcon size={13} />
                {isEditing ? "View Mode" : "Configure"}
              </button>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-lg border border-slate-200 p-1.5 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Meta pills */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {[
              {
                icon: <Clock3 size={11} />,
                text: `Inactivity: ${inactivityMinutes}m`,
              },
              { icon: <Clock3 size={11} />, text: "4-step sequence" },
              { icon: <Mail size={11} />, text: "Email" },
              { icon: <MessageSquareText size={11} />, text: "WhatsApp & SMS" },
              {
                icon: <ShieldCheck size={11} />,
                text: `Coupon: ${couponCode} (${discountPercent}%)`,
              },
            ].map((p) => (
              <span
                key={p.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
              >
                <span className="text-slate-400">{p.icon}</span>
                {p.text}
              </span>
            ))}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : isEditing ? (
            <div className="space-y-6">
              {/* Threshold & Coupon settings card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
                  General Thresholds & Discount
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Inactivity Threshold (Minutes)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={inactivityMinutes}
                      onChange={(e) => setInactivityMinutes(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-indigo-600">
                        {formatMinutesHuman(inactivityMinutes)}
                      </span>
                      <span className="text-slate-400">before idle cart is marked</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {[1, 5, 15, 20, 30, 60].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setInactivityMinutes(m)}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                            Number(inactivityMinutes) === m
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {m < 60 ? `${m}m` : `${m / 60}h`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Recovery Coupon Code
                    </label>
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold uppercase tracking-wider text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Auto-applied in Step 3 recovery link
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                    />
                    <p className="mt-1 text-[10px] text-slate-400">
                      Discount offered to recover customer
                    </p>
                  </div>
                </div>
              </div>

              {/* 4-Step checkpoints editor */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-3">
                  4-Step Reminder Checkpoints
                </h3>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <div
                      key={step.stage || idx}
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-slate-700">
                            {idx + 1}
                          </span>
                          <span className="text-sm font-black text-slate-800">
                            {step.label || `Step ${idx + 1}`}
                          </span>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                          {step.tone}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            Trigger Delay (Minutes from abandonment)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              max="10080"
                              value={step.delayMinutes}
                              onChange={(e) =>
                                handleStepDelayChange(idx, e.target.value)
                              }
                              className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
                            />
                            <span className="text-xs font-semibold text-indigo-600">
                              {formatMinutesHuman(step.delayMinutes)}
                            </span>
                            <span className="text-xs text-slate-400">
                              after abandonment
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {[1, 5, 15, 30, 60, 120, 360, 1440, 2880].map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => handleStepDelayChange(idx, m)}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold transition ${
                                  Number(step.delayMinutes) === m
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                              >
                                {m < 60 ? `${m}m` : m < 1440 ? `${m / 60}h` : `${m / 1440}d`}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            Notification Channels
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            {["email", "whatsapp", "sms"].map((ch) => {
                              const active = step.channels?.includes(ch);
                              return (
                                <button
                                  type="button"
                                  key={ch}
                                  onClick={() => handleToggleChannel(idx, ch)}
                                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold capitalize transition ${
                                    active
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-slate-50 text-slate-400 hover:text-slate-600"
                                  }`}
                                >
                                  {active ? (
                                    <Check size={11} />
                                  ) : (
                                    <span className="h-2 w-2 rounded-full border border-slate-300" />
                                  )}
                                  {ch}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {steps.map((step, index) => (
                <StepCard
                  key={step.stage || index}
                  step={step}
                  isLast={index === steps.length - 1}
                  abandonedCoupon={abandonedCoupon}
                  defaultCouponCode={couponCode}
                  defaultDiscountPercent={discountPercent}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {isEditing && (
          <div className="flex-shrink-0 border-t border-slate-100 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
            >
              <RotateCcw size={12} />
              Reset Defaults
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Save size={13} />
                )}
                Save Workflow
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepCard({
  step,
  isLast,
  abandonedCoupon,
  defaultCouponCode = "SAVE10",
  defaultDiscountPercent = 10,
}) {
  const accentKey = ACCENT[step.accent] ? step.accent : "rose";
  const a = ACCENT[accentKey];
  const couponStatus = getCouponStatus(abandonedCoupon);

  const channelText = Array.isArray(step.channels)
    ? step.channels.map((c) => c.toUpperCase()).join(" + ")
    : step.channels || "Email";

  return (
    <div className={`relative rounded-xl border px-4 py-4 ${a.card}`}>
      {/* Connector line */}
      {!isLast && (
        <div
          className={`absolute left-[27px] top-[52px] w-px bg-gradient-to-b ${a.connector} to-transparent`}
          style={{ height: "calc(100% - 36px + 10px)" }}
        />
      )}

      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border ${a.icon}`}
        >
          <Clock3 size={13} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Top row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-slate-400">
                {step.label}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-[11px] font-semibold text-slate-400">
                {step.timing || `After ${step.delayMinutes} minute${step.delayMinutes !== 1 ? "s" : ""}`}
              </span>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.15em] ${a.badge}`}
            >
              {step.tone}
            </span>
          </div>

          {/* Title */}
          <h3 className="mt-1 text-sm font-black text-slate-900">
            {step.modalTitle || step.title}
          </h3>

          {/* Description */}
          <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
            {step.description}
          </p>

          {/* Channels pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            <Mail size={10} className="text-slate-400" />
            {channelText}
          </div>

          {/* ── Step 3 coupon display ── */}
          {step.coupon && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-white p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md border border-emerald-200 bg-emerald-50">
                  <TicketPercent size={12} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-700">
                    Recovery Coupon
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Auto-applies when customer returns to checkout
                  </p>
                </div>
              </div>

              {abandonedCoupon ? (
                <>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 border border-emerald-200">
                        <ShoppingCart size={14} className="text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 tracking-wider">
                          {abandonedCoupon.code || "AUTO-APPLIED"}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {abandonedCoupon.offerType === "Percentage" &&
                            `${abandonedCoupon.offerValue}% off`}
                          {abandonedCoupon.offerType === "FixedAmount" &&
                            `₹${abandonedCoupon.offerValue} off`}
                          {abandonedCoupon.offerType === "BOGO" &&
                            `Buy ${abandonedCoupon.buyQuantity} Get ${abandonedCoupon.getQuantity}`}
                          {abandonedCoupon.minOrderAmount > 0 &&
                            ` · Min ₹${abandonedCoupon.minOrderAmount}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${
                          couponStatus === "Live"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : couponStatus === "Expired"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {couponStatus}
                      </span>

                      <span className="text-[10px] text-slate-400 font-medium">
                        Expires{" "}
                        {new Date(abandonedCoupon.endDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className={`h-full rounded-full ${
                          abandonedCoupon.usedCount /
                            abandonedCoupon.totalUsageLimit >
                          0.8
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (abandonedCoupon.usedCount /
                              (abandonedCoupon.totalUsageLimit || 1)) *
                              100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">
                      {abandonedCoupon.usedCount} /{" "}
                      {abandonedCoupon.totalUsageLimit} used
                    </span>
                  </div>

                  {couponStatus !== "Live" && (
                    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <AlertCircle
                        size={13}
                        className="text-amber-600 mt-0.5 flex-shrink-0"
                      />
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        This coupon is currently{" "}
                        <strong>{couponStatus?.toLowerCase()}</strong> and won't
                        be sent to customers. Go to{" "}
                        <strong>Coupon Management</strong> to activate or
                        replace it.
                      </p>
                    </div>
                  )}
                </>
              ) : defaultCouponCode ? (
                <div className="rounded-lg border border-emerald-200 bg-slate-50 px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 border border-emerald-200">
                      <ShoppingCart size={14} className="text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-slate-900 tracking-wider">
                        {defaultCouponCode}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {defaultDiscountPercent}% off · Auto-applies on checkout return
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-700 border-emerald-200">
                    Active
                  </span>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 py-5 px-4 flex flex-col items-center gap-2 text-center">
                  <AlertCircle size={18} className="text-slate-300" />
                  <p className="text-xs font-bold text-slate-500">
                    No recovery coupon assigned
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
                    Go to{" "}
                    <strong className="text-slate-600">
                      Coupon Management
                    </strong>
                    , create or edit a coupon, and enable the{" "}
                    <strong className="text-slate-600">
                      Abandoned Cart Recovery
                    </strong>{" "}
                    toggle.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
