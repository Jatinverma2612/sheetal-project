"use client";
import { useState, useEffect } from "react";
import { Star, Package, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getAdminReviews } from "@/services/productService";
import { Avatar, StarRow } from "@/components/admin/reviews/ReviewShared";

export default function TopReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getAdminReviews(1, 100, "all");
        if (res.success) {
          const top = (res.data || [])
            .filter((r) => r.isApproved && r.rating >= 4)
            .sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);
          setReviews(top);
        }
      } catch {
        // silently fail on dashboard
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
            <Star size={14} className="fill-amber-400 text-amber-400" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">Top Reviews</h3>
        </div>
        <Link
          href="/admin/reviews"
          className="text-sm font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors"
        >
          See all Reveiws <ArrowRight size={14} />
        </Link>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-3">
        {loading ? (
          // Skeleton
          [...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2 py-0.5">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-2.5 bg-slate-100 rounded w-full" />
                <div className="h-2.5 bg-slate-100 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400">
            <Star size={28} className="mb-2 opacity-20" />
            <p className="text-xs">No top reviews yet</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review._id}
              className="flex gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Avatar name={review.userName} />
              <div className="flex-1 min-w-0">
                {/* Name + stars */}
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800 truncate">
                    {review.userName || "Customer"}
                  </span>
                  <StarRow rating={review.rating} />
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  "{review.comment}"
                </p>

                {/* Product */}
                {review.product?.name && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <Package size={10} className="text-slate-300 shrink-0" />
                    <span className="text-[10px] text-slate-400 truncate">
                      {review.product.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}