"use client";

import {
  X,
  Tag,
  Ticket,
  Calendar,
  Activity,
  Info,
  Percent,
  IndianRupee,
  ShieldCheck,
  UserCheck,
  Hash,
  AlignLeft,
} from "lucide-react";

export default function ViewCouponDrawer({ isOpen, onClose, coupon }) {
  if (!coupon) return null;

  const isExpired = coupon.endDate
    ? new Date(coupon.endDate).getTime() < Date.now()
    : false;
  const couponStatus = isExpired
    ? "Expired"
    : coupon.isActive
      ? "Live"
      : "Paused";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const statusChipClass =
    couponStatus === "Live"
      ? "text-emerald-600"
      : couponStatus === "Expired"
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[160] transform transition-transform duration-500 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Hash size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-none">
                View Coupon
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Full details and usage rules
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition-all"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto h-[calc(100%-140px)]">
          <div className="relative group overflow-hidden rounded-2xl">
            <div className="w-full py-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-white relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full" />

              <div className="bg-white/10 p-3 rounded-full backdrop-blur-md mb-4 group-hover:scale-110 transition-transform">
                <Ticket size={36} className="text-indigo-400" />
              </div>
              <h3 className="text-4xl font-black tracking-[0.1em] uppercase drop-shadow-md">
                {coupon.code}
              </h3>
              <div className="flex items-center gap-2 mt-3 px-4 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                <ShieldCheck size={14} className="text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  System Verified
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={16} className="text-indigo-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Offer Value & Logic
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Benefit Type
                </p>
                <div className="flex items-center gap-2 text-slate-900">
                  {coupon.offerType === "Percentage" ? (
                    <Percent size={18} />
                  ) : (
                    <IndianRupee size={18} />
                  )}
                  <p className="text-lg font-black">
                    {coupon.offerValue}
                    {coupon.offerType === "Percentage" ? "%" : ""} Off
                  </p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Applied Scope
                </p>
                <p className="text-lg font-black text-indigo-600">
                  {coupon.scope || "All Store"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Payment Method
                </p>
                <p className="text-lg font-black text-indigo-600">
                  {coupon.paymentMethod === "Prepaid"
                    ? "Prepaid orders"
                    : coupon.paymentMethod === "COD"
                      ? "COD"
                      : "Both"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={16} className="text-indigo-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Rules & Constraints
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <IndianRupee size={10} /> Min Order
                </p>
                <p className="text-sm font-black text-slate-900">
                  ₹{coupon.minOrderAmount || 0}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <Activity size={10} /> Max Discount
                </p>
                <p className="text-sm font-black text-slate-900">
                  {coupon.maxDiscountAmount
                    ? `₹${coupon.maxDiscountAmount}`
                    : "Unlimited"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <UserCheck size={10} /> Per User
                </p>
                <p className="text-sm font-black text-slate-900">
                  {coupon.usageLimitPerUser} Use(s)
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1.5">
                  <Activity size={10} /> Status
                </p>
                <span className={`text-[10px] font-black uppercase ${statusChipClass}`}>
                  {couponStatus === "Live"
                    ? "Live"
                    : couponStatus === "Expired"
                      ? "Expired"
                      : "Paused"}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] font-bold text-indigo-600 uppercase">
                  Redemption Flow
                </p>
                <p className="text-xs font-black text-slate-900">
                  {coupon.usedCount} / {coupon.totalUsageLimit}
                </p>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{
                    width: `${Math.min((coupon.usedCount / (coupon.totalUsageLimit || 1)) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={16} className="text-indigo-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Validity Period
              </h4>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-center flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Starts
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatDate(coupon.startDate)}
                </p>
              </div>
              <div className="px-4 text-slate-300">→</div>
              <div className="text-center flex-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Expires
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {formatDate(coupon.endDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-10">
            <div className="flex items-center gap-2 mb-2">
              <AlignLeft size={16} className="text-indigo-600" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                Description
              </h4>
            </div>
            <div className="p-5 rounded-2xl bg-slate-900 text-slate-300 border border-slate-800 shadow-xl relative overflow-hidden group">
              <Info
                size={40}
                className="absolute -right-2 -bottom-2 text-white/5"
              />
              <p className="text-sm leading-relaxed font-medium italic relative z-10">
                {coupon.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all active:scale-95 uppercase text-xs tracking-widest"
          >
            Dismiss
          </button>
        </div>
      </div>
    </>
  );
}
