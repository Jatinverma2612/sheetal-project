"use client";

import {
  X,
  Tag,
  Link,
  Calendar,
  ImageIcon,
  ExternalLink,
  User,
} from "lucide-react";

export default function ViewBlogDrawer({ isOpen, onClose, blog }) {
  if (!blog) return null;
  const imageUrl = blog.bannerImage?.url || blog.bannerImage || null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[150] transition-opacity ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[160] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Blog Preview</h2>
          <button
            onClick={onClose}
            className="p-2 cursor-pointer hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-160px)] custom-scrollbar">
          <div className="relative group">
            <div className="w-full aspect-video rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-slate-400">
                  <ImageIcon size={40} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs font-medium uppercase tracking-tighter">
                    No Banner Image
                  </p>
                </div>
              )}
            </div>
            {imageUrl && (
              <a
                href={imageUrl}
                target="_blank"
                className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-900 hover:bg-white transition-all"
                title="View Banner"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              {blog.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-slate-500">
              <Link size={14} />
              <p className="text-xs font-mono font-bold truncate">
                {blog.slug}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="p-2 bg-white rounded-lg shadow-sm text-slate-600">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Author
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {blog.author?.name || "Admin"}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-slate-400" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Published On
                  </p>
                  <p className="text-xs font-bold text-slate-900">
                    {blog.createdAt
                      ? new Date(blog.createdAt).toLocaleDateString("en-GB")
                      : "Draft"}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${blog.status === "Active" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}
              >
                {blog.status}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-slate-100 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-slate-900 cursor-pointer text-white py-3.5 rounded-xl font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-200 uppercase text-xs tracking-widest"
          >
            Close Preview
          </button>
        </div>
      </div>
    </>
  );
}
