"use client";
import { X } from "lucide-react";
import { StarRow } from "./ReviewShared";

/**
 * Props:
 *  isOpen       — boolean
 *  editForm     — { userName, rating, comment }
 *  onChange     — (field, value) => void
 *  onSubmit     — (e) => void
 *  onClose      — () => void
 */
export default function ReviewModal({ isOpen, editForm, onChange, onSubmit, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900">Edit Review</h3>
            <p className="text-xs text-slate-400 mt-0.5">Update customer review details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 space-y-5">
          {/* User Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              User Name
            </label>
            <input
              type="text"
              value={editForm.userName}
              onChange={(e) => onChange("userName", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm text-slate-900"
              required
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Rating
            </label>
            <div className="flex items-center gap-3">
              <StarRow
                rating={editForm.rating}
                interactive
                onChange={(r) => onChange("rating", r)}
              />
              <span className="text-sm font-bold text-slate-700">
                {editForm.rating} / 5
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Comment
            </label>
            <textarea
              value={editForm.comment}
              onChange={(e) => onChange("comment", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none h-28 text-sm text-slate-900"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 cursor-pointer py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 cursor-pointer py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}