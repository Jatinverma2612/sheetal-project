"use client";
import { useState } from "react";
import {
  Trash2,
  CheckCircle2,
  Package,
  XCircle,
  Edit,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { Avatar, StarRow } from "./ReviewShared";

const COLS = "grid-cols-[2fr_1.5fr_1fr_1fr_100px]";

function TableHeader() {
  return (
    <div
      className={`grid ${COLS} gap-4 px-5 py-3 border-b border-slate-100 bg-slate-50/80`}
    >
      {["Customer", "Product", "Rating", "Status", "Actions"].map((h) => (
        <p
          key={h}
          className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest"
        >
          {h}
        </p>
      ))}
    </div>
  );
}

function ReviewRow({ review, expanded, onToggle, onEdit, onStatus, onDelete }) {
  const isApproved = review.isApproved;
  const date = new Date(review.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      {/* Main row */}
      <div
        className={`grid ${COLS} gap-4 items-center px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer`}
        onClick={onToggle}
      >
        {/* Customer */}
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={review.userName} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {review.userName || "Unknown"}
            </p>
            <p className="text-xs text-slate-400">{date}</p>
          </div>
        </div>

        {/* Product */}
        <div className="flex items-center gap-1.5 min-w-0">
          <Package size={12} className="text-slate-300 shrink-0" />
          <span className="text-xs text-slate-500 truncate">
            {review.product?.name || "—"}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <StarRow rating={review.rating} />
          <span className="text-xs font-semibold text-slate-500">
            {review.rating}
          </span>
        </div>

        {/* Status */}
        <div>
          <span
            className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full ${
              isApproved
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            {isApproved ? "Approved" : "Pending"}
          </span>
        </div>

        {/* Actions */}
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            title="Edit"
            onClick={() => onEdit(review)}
            className="w-7 h-7 flex items-center cursor-pointer justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
          >
            <Edit size={14} />
          </button>

          {isApproved ? (
            <button
              title="Reject"
              onClick={() => onStatus(review._id, false)}
              className="w-7 h-7 flex items-center cursor-pointer justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <XCircle size={14} />
            </button>
          ) : (
            <button
              title="Approve"
              onClick={() => onStatus(review._id, true)}
              className="w-7 h-7 flex items-center cursor-pointer justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <CheckCircle2 size={14} />
            </button>
          )}

          <button
            title="Delete"
            onClick={() => onDelete(review._id)}
            className="w-7 h-7 flex items-center cursor-pointer justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <Trash2 size={14} />
          </button>

          <ChevronDown
            size={14}
            className={`text-slate-300 transition-transform duration-200 ml-0.5 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded comment */}
      <div
        className={`px-5 bg-slate-50 border-t border-slate-100 overflow-hidden transition-all duration-300 ease-in-out
  ${expanded ? "max-h-40 py-3 opacity-100" : "max-h-0 py-0 opacity-0"}`}
      >
        <p className="text-sm text-slate-600 leading-relaxed pl-11 italic">
          "{review.comment}"
        </p>
      </div>
    </div>
  );
}

/**
 * Props:
 *  reviews    — filtered array of review objects
 *  loading    — boolean
 *  total      — total review count (for footer)
 *  onEdit     — (review) => void
 *  onStatus   — (id, isApproved) => void
 *  onDelete   — (id) => void
 */
export default function ReviewTable({
  reviews,
  loading,
  total,
  onEdit,
  onStatus,
  onDelete,
}) {
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <TableHeader />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <MessageSquare size={32} className="mb-3 opacity-25" />
          <p className="text-sm font-medium">No reviews found</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-50">
          {[...reviews]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map((review) => (
              <ReviewRow
                key={review._id}
                review={review}
                expanded={expanded === review._id}
                onToggle={() => toggle(review._id)}
                onEdit={onEdit}
                onStatus={onStatus}
                onDelete={onDelete}
              />
            ))}
        </div>
      )}

      {/* Footer */}
      {!loading && reviews.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-slate-600">
              {reviews.length}
            </span>{" "}
            of <span className="font-semibold text-slate-600">{total}</span>{" "}
            reviews
          </p>
        </div>
      )}
    </div>
  );
}
