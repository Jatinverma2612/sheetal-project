"use client";

import {
  X,
  Tag,
  Link,
  Layers,
  Calendar,
  Activity,
  ImageIcon,
  ExternalLink,
} from "lucide-react";
import { IMAGE_BASE_URL } from "@/services/api";

export default function ViewCategoryDrawer({ isOpen, onClose, category }) {
  if (!category) return null;

  // Image URL formatter
  const imageUrl = category.image?.url
    ? `${IMAGE_BASE_URL}/${category.image.url.replace(/\\/g, "/")}`.replace(
      /([^:]\/)\/+/g,
      "$1",
    )
    : null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[160] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Category Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-160px)]">
          {/* Category Image Preview */}
          <div className="relative group">
            <div className="w-full aspect-video rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={category.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-medium uppercase tracking-tighter">
                    No Image Available
                  </p>
                </div>
              )}
            </div>
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-900 hover:bg-white transition-all active:scale-95"
                title="Open Original Image"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          {/* Title & Slug Section */}
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {category.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-slate-500">
              <Link size={14} />
              <p className="text-xs font-mono font-bold">{category.slug}</p>
            </div>
          </div>

          {/* Data Grid */}
          <div className="grid gap-4">
            {/* Parent Category */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Layers size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Parent Category
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {category.parentCategory?.name || "Main (Root) Category"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Availability
                </p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${category.isActive !== false
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-rose-50 text-rose-600 border-rose-100"
                    }`}
                >
                  {category.isActive !== false ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Date Added
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {category.createdAt
                    ? new Date(category.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Description Section */}
            {category.description && (
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Tag size={14} /> Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  "{category.description}"
                </p>
              </div>
            )}
          </div>

          {/* Subcategories */}
          {category.subCategories && category.subCategories.length > 0 && (
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Layers size={14} /> Subcategories
              </p>
              <div className="flex flex-wrap gap-2">
                {category.subCategories.map((sub, index) => (
                  <span
                    key={index}
                    className="bg-white px-3 py-1 rounded-full text-xs font-medium text-slate-700 border border-slate-200 shadow-sm"
                  >
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase text-xs tracking-widest"
          >
            Close Preview
          </button>
        </div>
      </div>
    </>
  );
}
